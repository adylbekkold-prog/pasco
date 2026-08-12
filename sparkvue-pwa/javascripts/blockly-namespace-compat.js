(function () {
  'use strict';

  var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  var XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
  var HTML_ELEMENT_NAMES = new Set(['body', 'textarea']);
  var PATCH_MARKER = '__pascoBlocklyNamespaceCompat';

  if (!document.createElementNS[PATCH_MARKER]) {
    var nativeCreateElementNS = document.createElementNS.bind(document);

    function createElementNS(namespace, qualifiedName, options) {
      var safeNamespace = namespace;

      if (safeNamespace === '') {
        safeNamespace = HTML_ELEMENT_NAMES.has(String(qualifiedName).toLowerCase())
          ? HTML_NAMESPACE
          : SVG_NAMESPACE;
      }

      if (options === undefined) {
        return nativeCreateElementNS(safeNamespace, qualifiedName);
      }

      return nativeCreateElementNS(safeNamespace, qualifiedName, options);
    }

    createElementNS[PATCH_MARKER] = true;
    document.createElementNS = createElementNS;
  }

  if (window.Element && !window.Element.prototype.setAttributeNS[PATCH_MARKER]) {
    var nativeSetAttributeNS = window.Element.prototype.setAttributeNS;

    function setAttributeNS(namespace, qualifiedName, value) {
      var safeNamespace = namespace;

      if (safeNamespace === '' && String(qualifiedName).toLowerCase().startsWith('xlink:')) {
        safeNamespace = XLINK_NAMESPACE;
      }

      return nativeSetAttributeNS.call(this, safeNamespace, qualifiedName, value);
    }

    setAttributeNS[PATCH_MARKER] = true;
    window.Element.prototype.setAttributeNS = setAttributeNS;
  }
})();
