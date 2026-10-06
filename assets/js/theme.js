/* Light/dark theme toggle. Light is the default; a visitor's choice is
   remembered in this browser. A tiny inline script in each page's <head>
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
})();
