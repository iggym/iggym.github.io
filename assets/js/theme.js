/* Light/dark theme toggle. Follows the device's light/dark setting until the visitor picks one;
   that choice is remembered in this browser. A tiny inline script in each page's <head>
   applies a saved choice before the page paints, so there's no flash. */
(function () {
  "use strict";
  var root = document.documentElement;
  var COLORS = { light: "#f8f7f4", dark: "#141518" };

  function current() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }

  function apply(theme, save) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", COLORS[theme]);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.title = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    });
    if (save) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* storage blocked */ }
    }
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.hidden = false;
    btn.addEventListener("click", function () { apply(current() === "dark" ? "light" : "dark", true); });
  });
  apply(current(), false);

  // With no saved choice, keep following the device setting if it changes (e.g. at sunset).
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  if (mq && mq.addEventListener) {
    mq.addEventListener("change", function (e) {
      var saved = null;
      try { saved = localStorage.getItem("theme"); } catch (err) { /* storage blocked */ }
      if (!saved) apply(e.matches ? "dark" : "light", false);
    });
  }
})();
