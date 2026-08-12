(function () {
  'use strict';

  if (typeof window.__pascoLabBridgeDispose === 'function') {
    window.__pascoLabBridgeDispose();
  }

  var MESSAGE_TYPE = 'pasco-lab:sparkvue-open';
  var STATUS_TYPE = 'pasco-lab:sparkvue-status';
  var FETCH_ATTEMPTS = 3;
  var FETCH_TIMEOUT_MS = 60000;
  var RUNTIME_TIMEOUT_MS = 150000;
  var WORKBOOK_TIMEOUT_MS = 90000;
  var STATUS_CONFIRMATIONS = 8;
  var STATUS_CONFIRMATION_INTERVAL_MS = 500;
  var MAX_FILE_SIZE = 100 * 1024 * 1024;
  var activeAbortController = null;
  var activeTask = null;
  var openedFileUrl = null;
  var requestSequence = 0;

  function report(status, fileUrl, message, details) {
    if (window.parent === window) {
      return;
    }

    window.parent.postMessage({
      type: STATUS_TYPE,
      status: status,
      fileUrl: fileUrl || null,
      message: message || null,
      details: details || null,
    }, window.location.origin);
  }

  function reportConfirmed(status, fileUrl, message, details, requestId) {
    var remaining = STATUS_CONFIRMATIONS;

    function sendStatus() {
      if (requestId && requestId !== requestSequence) {
        return;
      }

      report(status, fileUrl, message, details);
      remaining -= 1;

      if (remaining > 0) {
        window.setTimeout(sendStatus, STATUS_CONFIRMATION_INTERVAL_MS);
      }
    }

    sendStatus();
  }

  function createError(message, code) {
    var error = new Error(message);
    error.code = code;
    return error;
  }

  function createCancelledError() {
    return createError('SPARKlab request was replaced by a newer request.', 'cancelled');
  }

  function isCancelledError(error) {
    return error && (error.code === 'cancelled' || error.name === 'AbortError');
  }

  function delay(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function assertCurrentRequest(requestId) {
    if (requestId !== requestSequence) {
      throw createCancelledError();
    }
  }

  function getSafeFileUrl(value) {
    var url = new URL(String(value || ''), window.location.origin);
    var lowerPath = url.pathname.toLowerCase();

    if (url.origin !== window.location.origin) {
      throw createError('SPARKlab must use the portal origin.', 'invalid-url');
    }

    if (!lowerPath.startsWith('/uploads/') || !lowerPath.endsWith('.spklab')) {
      throw createError('Only uploaded .spklab files can be opened.', 'invalid-url');
    }

    return url;
  }

  function ensureRuntimeCapabilities() {
    if (window.crossOriginIsolated !== true || typeof SharedArrayBuffer === 'undefined') {
      throw createError(
        'SPARKvue requires HTTPS and cross-origin isolation headers.',
        'insecure-context'
      );
    }

    if (typeof WebAssembly === 'undefined' || typeof Worker === 'undefined' || typeof fetch !== 'function') {
      throw createError(
        'SPARKvue requires a current desktop browser with WebAssembly and Workers.',
        'unsupported-browser'
      );
    }
  }

  function waitForRuntime(requestId) {
    return new Promise(function (resolve, reject) {
      var startedAt = Date.now();

      function checkRuntime() {
        try {
          assertCurrentRequest(requestId);
          ensureRuntimeCapabilities();

          var ready =
            window.FS &&
            window.viewController &&
            typeof window.viewController.LoadWorkbook === 'function' &&
            typeof window.viewController.GetMainDiv === 'function';

          if (ready) {
            resolve();
            return;
          }

          if (Date.now() - startedAt > RUNTIME_TIMEOUT_MS) {
            reject(createError('SPARKvue runtime did not initialize in time.', 'runtime-timeout'));
            return;
          }

          window.setTimeout(checkRuntime, 200);
        } catch (error) {
          reject(error);
        }
      }

      checkRuntime();
    });
  }

  function isVisible(element) {
    if (!element || element.hidden) {
      return false;
    }

    var style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function isWorkbookOpen() {
    var workbook = document.querySelector('#workbook');
    var workbookPage = workbook && workbook.querySelector('.workbook-page');
    return Boolean(workbook && workbookPage && isVisible(workbook));
  }

  function waitForWorkbookOpen(requestId) {
    return new Promise(function (resolve, reject) {
      var startedAt = Date.now();

      function checkWorkbook() {
        try {
          assertCurrentRequest(requestId);

          if (isWorkbookOpen()) {
            resolve();
            return;
          }

          if (Date.now() - startedAt > WORKBOOK_TIMEOUT_MS) {
            reject(createError('SPARKlab workbook did not finish opening.', 'workbook-timeout'));
            return;
          }

          window.setTimeout(checkWorkbook, 200);
        } catch (error) {
          reject(error);
        }
      }

      checkWorkbook();
    });
  }

  function dismissWhatsNewDialog() {
    var startedAt = Date.now();

    function checkDialog() {
      var title = document.querySelector('.popup-dialog .header .title');
      var dialog = title && title.closest('.popup-dialog');
      var closeButton = dialog && dialog.querySelector('.footer .ok:not(.disabled)');
      var isWhatsNew = title && title.textContent.indexOf('SPARKvue') !== -1;

      if (isWhatsNew && closeButton) {
        closeButton.dispatchEvent(new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window,
        }));
        return;
      }

      if (Date.now() - startedAt < 15000) {
        window.setTimeout(checkDialog, 100);
      }
    }

    checkDialog();
  }

  async function fetchSparkLab(fileUrl, requestId) {
    var lastError = null;

    for (var attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
      assertCurrentRequest(requestId);

      var controller = new AbortController();
      var timeoutId = window.setTimeout(function () {
        controller.abort();
      }, FETCH_TIMEOUT_MS);
      activeAbortController = controller;

      report('downloading', fileUrl.pathname, null, {
        attempt: attempt,
        attempts: FETCH_ATTEMPTS,
      });

      try {
        var response = await fetch(fileUrl.href, {
          cache: attempt === 1 ? 'force-cache' : 'reload',
          credentials: 'same-origin',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw createError(
            'SPARKlab download failed with HTTP ' + response.status + '.',
            'download-failed'
          );
        }

        var contentLength = Number(response.headers.get('content-length') || 0);
        if (contentLength > MAX_FILE_SIZE) {
          throw createError('SPARKlab file is too large.', 'file-too-large');
        }

        var contentType = String(response.headers.get('content-type') || '').toLowerCase();
        if (contentType.indexOf('text/html') !== -1) {
          throw createError('SPARKlab URL returned HTML instead of a workbook.', 'invalid-response');
        }

        var fileBuffer = await response.arrayBuffer();
        if (fileBuffer.byteLength === 0 || fileBuffer.byteLength > MAX_FILE_SIZE) {
          throw createError('SPARKlab file is empty or too large.', 'invalid-file');
        }

        assertCurrentRequest(requestId);
        return fileBuffer;
      } catch (error) {
        if (requestId !== requestSequence) {
          throw createCancelledError();
        }

        lastError = error && error.name === 'AbortError'
          ? createError('SPARKlab download timed out.', 'download-timeout')
          : error;
        if (attempt < FETCH_ATTEMPTS) {
          report('retrying-download', fileUrl.pathname, null, {
            attempt: attempt + 1,
            attempts: FETCH_ATTEMPTS,
          });
          await delay(500 * attempt);
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (activeAbortController === controller) {
          activeAbortController = null;
        }
      }
    }

    throw lastError || createError('SPARKlab file could not be downloaded.', 'download-failed');
  }

  async function performOpen(fileUrl, requestId) {
    report('loading', fileUrl.pathname);
    dismissWhatsNewDialog();

    var results = await Promise.all([
      fetchSparkLab(fileUrl, requestId),
      waitForRuntime(requestId),
    ]);
    var fileBuffer = results[0];

    assertCurrentRequest(requestId);
    dismissWhatsNewDialog();

    var filePath = '/tmp/pasco-lab-current-' + requestId + '.spklab';
    window.FS.writeFile(filePath, new Uint8Array(fileBuffer));
    window.viewController.LoadWorkbook({ filePath: filePath }, true);

    await waitForWorkbookOpen(requestId);
    assertCurrentRequest(requestId);

    openedFileUrl = fileUrl.href;
    reportConfirmed('opened', fileUrl.pathname, null, null, requestId);
  }

  function openSparkLab(value, options) {
    var fileUrl;

    try {
      fileUrl = getSafeFileUrl(value);
    } catch (error) {
      report('error', null, error.message, { code: error.code || 'invalid-url' });
      return Promise.reject(error);
    }

    var force = Boolean(options && options.force);

    if (!force && openedFileUrl === fileUrl.href && isWorkbookOpen()) {
      report('opened', fileUrl.pathname);
      return Promise.resolve();
    }

    if (!force && activeTask && activeTask.fileUrl === fileUrl.href) {
      return activeTask.promise;
    }

    requestSequence += 1;
    var requestId = requestSequence;

    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }

    openedFileUrl = null;

    var promise = performOpen(fileUrl, requestId).catch(function (error) {
      if (!isCancelledError(error) && requestId === requestSequence) {
        report('error', fileUrl.pathname, error instanceof Error ? error.message : String(error), {
          code: error && error.code ? error.code : 'open-failed',
        });
      }
      throw error;
    }).finally(function () {
      if (activeTask && activeTask.requestId === requestId) {
        activeTask = null;
      }
    });

    activeTask = {
      fileUrl: fileUrl.href,
      promise: promise,
      requestId: requestId,
    };

    return promise;
  }

  function handleOpenMessage(event) {
    if (event.origin !== window.location.origin || !event.data || event.data.type !== MESSAGE_TYPE) {
      return;
    }

    openSparkLab(event.data.fileUrl, { force: event.data.force }).catch(function (error) {
      if (!isCancelledError(error)) {
        console.error('[pasco-lab-bridge]', error);
      }
    });
  }

  function handleWindowLoad() {
    report('booting');

    var params = new URLSearchParams(window.location.search);
    var fileUrl = params.get('file');

    if (fileUrl) {
      openSparkLab(fileUrl).catch(function (error) {
        if (!isCancelledError(error)) {
          console.error('[pasco-lab-bridge]', error);
        }
      });
      return;
    }

    requestSequence += 1;
    waitForRuntime(requestSequence).then(function () {
      report('ready');
    }).catch(function (error) {
      report('error', null, error instanceof Error ? error.message : String(error), {
        code: error && error.code ? error.code : 'runtime-failed',
      });
    });
  }

  window.addEventListener('message', handleOpenMessage);
  window.addEventListener('load', handleWindowLoad, { once: true });

  window.__pascoLabBridgeDispose = function () {
    requestSequence += 1;

    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }

    activeTask = null;
    window.removeEventListener('message', handleOpenMessage);
    window.removeEventListener('load', handleWindowLoad);
  };
})();
