(function (global) {
  var queue = global.ga;
  if (typeof queue !== 'function') {
    queue = function () {
      (queue.q = queue.q || []).push(arguments);
    };
  }
  queue.q = queue.q || [];
  queue.l = queue.l || Date.now();
  global.GoogleAnalyticsObject = global.GoogleAnalyticsObject || 'ga';
  global.ga = queue;
  global._gaq = global._gaq || [];
})(window);
