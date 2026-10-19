/* Registers the offline service worker (sw.js at the site root). Progressive: no-op where unsupported.
   When a new version takes over a page that an older worker served, reload once so the visitor
   sees the latest deploy instead of the old cached copy. */
(function () {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  var hadController = !!navigator.serviceWorker.controller;
  var reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (!hadController || reloaded) return;
    reloaded = true;
    window.location.reload();
  });
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" })
      .then(function (reg) { reg.update(); })
      .catch(function () { /* offline support is optional */ });
  });
})();
