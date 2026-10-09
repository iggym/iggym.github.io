/* Registers the offline service worker (sw.js at the site root). Progressive: no-op where unsupported. */
(function () {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () { /* offline support is optional */ });
  });
})();
