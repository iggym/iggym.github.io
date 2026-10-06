/* Small helpers shared by the tools in /tools. No dependencies. */
(function () {
  "use strict";

  // Announce a short message to screen readers via the page's #status region.
  function announce(message) {
    var region = document.getElementById("status");
    if (!region) return;
    region.textContent = "";
    setTimeout(function () { region.textContent = message; }, 30);
  }

  // Rough English estimate: about four characters per token.
  function estimateTokens(text) {
    return text ? Math.ceil(text.length / 4) : 0;
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  // Copy text, then briefly relabel the button and announce the result.
  function copyText(text, button) {
    var finish = function (ok) {
      var message = ok ? "Copied to clipboard." : "Couldn't copy. Select the text and copy it manually.";
      announce(message);
      if (!button) return;
      var original = button.dataset.label || button.textContent;
      button.dataset.label = original;
      button.textContent = ok ? "Copied" : "Copy failed";
      clearTimeout(button._copyTimer);
      button._copyTimer = setTimeout(function () { button.textContent = original; }, 1600);
    };
    if (!text) { finish(false); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { finish(true); })
        .catch(function () { finish(fallbackCopy(text)); });
    } else {
      finish(fallbackCopy(text));
    }
  }

  // localStorage that never throws (private mode, blocked storage, bad JSON).
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (err) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (err) { return false; }
    },
    remove: function (key) {
      try { localStorage.removeItem(key); } catch (err) { /* ignore */ }
    }
  };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  window.ToolKit = {
    announce: announce,
    estimateTokens: estimateTokens,
    copyText: copyText,
    store: store,
    prefersReducedMotion: prefersReducedMotion
  };
})();
