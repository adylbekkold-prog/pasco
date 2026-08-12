(function () {
  'use strict';

  if (window.__sparkOfflineGuardInstalled) {
    return;
  }
  window.__sparkOfflineGuardInstalled = true;

  var blockedRequests = [];

  function toUrl(value) {
    try {
      if (value instanceof URL) {
        return value;
      }

      if (typeof Request !== 'undefined' && value instanceof Request) {
        return new URL(value.url, window.location.href);
      }

      if (value && typeof value === 'object' && typeof value.url === 'string') {
        return new URL(value.url, window.location.href);
      }

      return new URL(String(value), window.location.href);
    } catch (error) {
      return null;
    }
  }

  function isBlockedNetworkUrl(value) {
    var url = toUrl(value);
    if (!url) {
      return false;
    }
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'ws:' || url.protocol === 'wss:') {
      return url.origin !== window.location.origin;
    }
    return false;
  }

  function recordBlocked(kind, value) {
    var url = toUrl(value);
    var entry = {
      kind: kind,
      url: url ? url.href : String(value),
      timestamp: Date.now(),
    };

    blockedRequests.push(entry);

    if (blockedRequests.length > 100) {
      blockedRequests.shift();
    }

    if (window.__SPARK_OFFLINE_GUARD_DEBUG__ && typeof console !== 'undefined' && console.warn) {
      console.warn('[offline-guard] blocked ' + kind + ':', entry.url);
    }

    return entry;
  }

  function createBlockedError(kind, value) {
    var entry = recordBlocked(kind, value);
    var message = 'External network request blocked by SPARKvue offline mode: ' + entry.url;

    if (typeof DOMException === 'function') {
      return new DOMException(message, 'SecurityError');
    }

    var error = new Error(message);
    error.name = 'SecurityError';
    return error;
  }

  function defineValue(object, name, value) {
    try {
      Object.defineProperty(object, name, {
        configurable: true,
        value: value,
      });
    } catch (error) {}
  }

  function setGuardedValue(object, name, value) {
    try {
      object[name] = value;
      if (object[name] === value) {
        return;
      }
    } catch (error) {}

    defineValue(object, name, value);
  }

  function dispatchXhrEvent(xhr, type) {
    var event = typeof ProgressEvent === 'function'
      ? new ProgressEvent(type)
      : new Event(type);

    if (typeof xhr.dispatchEvent === 'function') {
      xhr.dispatchEvent(event);
      return;
    }

    var handler = xhr['on' + type];
    if (typeof handler === 'function') {
      handler.call(xhr, event);
    }
  }

  function failBlockedXhr(xhr) {
    window.setTimeout(function () {
      defineValue(xhr, 'readyState', 4);
      defineValue(xhr, 'status', 0);
      defineValue(xhr, 'response', null);
      defineValue(xhr, 'responseText', '');

      dispatchXhrEvent(xhr, 'readystatechange');
      dispatchXhrEvent(xhr, 'error');
      dispatchXhrEvent(xhr, 'loadend');
    }, 0);
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    function noop() {}

    function createFakeRegistration() {
      return {
        scope: window.location.origin + '/',
        active: null,
        installing: null,
        waiting: null,
        update: function () {
          return Promise.resolve(this);
        },
        unregister: function () {
          return Promise.resolve(true);
        },
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: function () {
          return false;
        },
      };
    }

    var originalGetRegistrations = typeof navigator.serviceWorker.getRegistrations === 'function'
      ? navigator.serviceWorker.getRegistrations.bind(navigator.serviceWorker)
      : null;

    if (originalGetRegistrations) {
      originalGetRegistrations().then(function (registrations) {
      if (!registrations) {
        return;
      }
      registrations.forEach(function (registration) {
        if (registration && registration.unregister) {
          registration.unregister().catch(function () {});
        }
      });
    }).catch(function () {});
    }

    try {
      Object.defineProperty(navigator.serviceWorker, 'controller', {
        configurable: true,
        get: function () {
          return null;
        },
      });
    } catch (error) {}

    try {
      Object.defineProperty(navigator.serviceWorker, 'ready', {
        configurable: true,
        get: function () {
          return Promise.resolve(createFakeRegistration());
        },
      });
    } catch (error) {}

    try {
      setGuardedValue(navigator.serviceWorker, 'register', function (scriptUrl) {
        recordBlocked('serviceWorker.register', scriptUrl || 'service worker');
        return Promise.resolve(createFakeRegistration());
      });
    } catch (error) {}

    try {
      setGuardedValue(navigator.serviceWorker, 'getRegistration', function () {
        return Promise.resolve(createFakeRegistration());
      });
    } catch (error) {}

    try {
      setGuardedValue(navigator.serviceWorker, 'getRegistrations', function () {
        return Promise.resolve([]);
      });
    } catch (error) {}
  }

  var originalFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;
  if (originalFetch) {
    setGuardedValue(window, 'fetch', function (resource, init) {
      if (isBlockedNetworkUrl(resource)) {
        return Promise.reject(createBlockedError('fetch', resource));
      }

      return originalFetch(resource, init);
    });
  }

  if (typeof window.XMLHttpRequest === 'function') {
    var XMLHttpRequestPrototype = window.XMLHttpRequest.prototype;
    var originalXhrOpen = XMLHttpRequestPrototype.open;
    var originalXhrSend = XMLHttpRequestPrototype.send;
    var originalXhrSetRequestHeader = XMLHttpRequestPrototype.setRequestHeader;
    var originalXhrAbort = XMLHttpRequestPrototype.abort;

    XMLHttpRequestPrototype.open = function (method, url) {
      if (isBlockedNetworkUrl(url)) {
        this.__sparkOfflineBlockedUrl = toUrl(url).href;
        recordBlocked('XMLHttpRequest', url);
        return;
      }

      this.__sparkOfflineBlockedUrl = null;
      return originalXhrOpen.apply(this, arguments);
    };

    XMLHttpRequestPrototype.send = function () {
      if (this.__sparkOfflineBlockedUrl) {
        failBlockedXhr(this);
        return;
      }

      return originalXhrSend.apply(this, arguments);
    };

    XMLHttpRequestPrototype.setRequestHeader = function () {
      if (this.__sparkOfflineBlockedUrl) {
        return;
      }

      return originalXhrSetRequestHeader.apply(this, arguments);
    };

    XMLHttpRequestPrototype.abort = function () {
      if (this.__sparkOfflineBlockedUrl) {
        this.__sparkOfflineBlockedUrl = null;
        return;
      }

      return originalXhrAbort.apply(this, arguments);
    };
  }

  if (typeof navigator.sendBeacon === 'function') {
    var originalSendBeacon = navigator.sendBeacon.bind(navigator);
    setGuardedValue(navigator, 'sendBeacon', function (url, data) {
      if (isBlockedNetworkUrl(url)) {
        recordBlocked('sendBeacon', url);
        return false;
      }

      return originalSendBeacon(url, data);
    });
  }

  if (typeof window.WebSocket === 'function') {
    var OriginalWebSocket = window.WebSocket;
    var GuardedWebSocket = function (url, protocols) {
      if (isBlockedNetworkUrl(url)) {
        throw createBlockedError('WebSocket', url);
      }

      return protocols === undefined
        ? new OriginalWebSocket(url)
        : new OriginalWebSocket(url, protocols);
    };

    GuardedWebSocket.prototype = OriginalWebSocket.prototype;
    GuardedWebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    GuardedWebSocket.OPEN = OriginalWebSocket.OPEN;
    GuardedWebSocket.CLOSING = OriginalWebSocket.CLOSING;
    GuardedWebSocket.CLOSED = OriginalWebSocket.CLOSED;
    setGuardedValue(window, 'WebSocket', GuardedWebSocket);
  }

  if (typeof window.EventSource === 'function') {
    var OriginalEventSource = window.EventSource;
    var GuardedEventSource = function (url, configuration) {
      if (isBlockedNetworkUrl(url)) {
        throw createBlockedError('EventSource', url);
      }

      return new OriginalEventSource(url, configuration);
    };

    GuardedEventSource.prototype = OriginalEventSource.prototype;
    setGuardedValue(window, 'EventSource', GuardedEventSource);
  }

  if (typeof window.Worker === 'function') {
    var OriginalWorker = window.Worker;
    var GuardedWorker = function (scriptUrl, options) {
      if (isBlockedNetworkUrl(scriptUrl)) {
        throw createBlockedError('Worker', scriptUrl);
      }

      return new OriginalWorker(scriptUrl, options);
    };

    GuardedWorker.prototype = OriginalWorker.prototype;
    setGuardedValue(window, 'Worker', GuardedWorker);
  }

  var originalOpen = window.open;
  if (typeof originalOpen === 'function') {
    window.open = function (url, target, features) {
      if (isBlockedNetworkUrl(url)) {
        recordBlocked('window.open', url);
        return null;
      }
      return originalOpen.call(window, url, target, features);
    };
  }

  function guardLocationMethod(name) {
    if (!window.location || typeof window.location[name] !== 'function') {
      return;
    }

    var originalMethod = window.location[name].bind(window.location);
    setGuardedValue(window.location, name, function (url) {
      if (isBlockedNetworkUrl(url)) {
        recordBlocked('location.' + name, url);
        return;
      }

      return originalMethod(url);
    });
  }

  guardLocationMethod('assign');
  guardLocationMethod('replace');

  document.addEventListener('click', function (event) {
    var node = event.target;
    while (node && node !== document && node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName && node.tagName.toLowerCase() === 'a' && node.href && isBlockedNetworkUrl(node.href)) {
        recordBlocked('navigation', node.href);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      node = node.parentElement;
    }
  }, true);

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (form && form.action && isBlockedNetworkUrl(form.action)) {
      recordBlocked('form submit', form.action);
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.__sparkOfflineGuard = {
    blockedRequests: blockedRequests,
    getBlockedRequests: function () {
      return blockedRequests.slice();
    },
    isBlockedNetworkUrl: isBlockedNetworkUrl,
  };
})();
