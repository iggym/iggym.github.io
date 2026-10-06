/* Homepage interactions. Everything here is an enhancement: the page reads and
   works without it, and motion is skipped when the visitor prefers less. */
(function () {
  "use strict";

  var root = document.documentElement;
  var motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var reduced = !!(motionQuery && motionQuery.matches);
  root.classList.add("js");
  if (!reduced) root.classList.add("motion");
  requestAnimationFrame(function () { root.classList.add("loaded"); });

  /* ---------- Career stack: pick a layer, or let it cycle ---------- */
  (function () {
    var picker = document.querySelector(".stack-picker");
    if (!picker) return;
    var buttons = picker.querySelectorAll("button");
    var caps = document.querySelectorAll(".stack-cap");
    var slabs = document.querySelectorAll(".slab");
    var current = buttons.length - 1;
    var timer = null;
    var userTookOver = false;
    picker.hidden = false;

    function select(i) {
      current = i;
      buttons.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      caps.forEach(function (c) { c.classList.toggle("on", +c.dataset.layer === i); });
      slabs.forEach(function (s) { s.classList.toggle("on", +s.dataset.layer === i); });
    }
    function stop() {
      clearInterval(timer); timer = null;
      if (!userTookOver) {
        userTookOver = true;
        // Announce changes only once the visitor is driving, so the auto-cycle stays quiet.
        document.getElementById("stack-caps").setAttribute("aria-live", "polite");
      }
    }
    buttons.forEach(function (b, k) { b.addEventListener("click", function () { stop(); select(k); }); });
    slabs.forEach(function (s) { s.addEventListener("click", function () { stop(); select(+s.dataset.layer); }); });

    // Walk up the stack from the bottom once, then rest on the top layer.
    select(reduced ? current : 0);
    if (!reduced) {
      var figure = picker.closest("figure");
      timer = setInterval(function () {
        if (current >= buttons.length - 1) { clearInterval(timer); timer = null; return; }
        select(current + 1);
      }, 2200);
      figure.addEventListener("pointerenter", function () { if (timer) stop(); });
      figure.addEventListener("focusin", function () { if (timer) stop(); });
    }
  })();

  /* ---------- Live prompt-tightening demo ---------- */
  (function () {
    var input = document.getElementById("demo-in");
    if (!input || !window.PromptTightener) return;
    var cutEl = document.getElementById("demo-cut");
    var resultEl = document.getElementById("demo-result");
    var meta = document.getElementById("demo-meta");
    var before = document.getElementById("bar-before");
    var after = document.getElementById("bar-after");
    var section = document.getElementById("demo");

    function tokens(t) { return t ? Math.ceil(t.length / 4) : 0; }

    function render() {
      var raw = input.value;
      var r = PromptTightener.tighten(raw);
      cutEl.innerHTML = r.html || "&nbsp;";
      resultEl.textContent = r.text || "Type a prompt to see it tightened.";
      var b = tokens(raw), a = tokens(r.text);
      var pct = b ? Math.round(((b - a) / b) * 100) : 0;
      before.style.width = b ? "100%" : "0%";
      after.style.width = b ? Math.max(2, (a / b) * 100) + "%" : "0%";
      meta.textContent = !raw.trim() ? "" :
        r.cuts.length === 0 ? "No filler found. That prompt is already tight." :
        "About " + b + " tokens down to about " + a + ", roughly " + pct + "% fewer.";
    }
    var t;
    input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(render, 120); });
    render();

    // Draw the strike-throughs when the demo scrolls into view.
    if ("IntersectionObserver" in window && !reduced) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { section.classList.add("seen"); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(section);
    } else {
      section.classList.add("seen");
    }
  })();

  /* ---------- Tool filters ---------- */
  (function () {
    var bar = document.getElementById("tool-filters");
    if (!bar) return;
    var buttons = bar.querySelectorAll("button");
    var count = document.getElementById("filter-count");
    var cards = document.querySelectorAll("#tools .card");
    bar.hidden = false;

    function apply(filter) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === "all" || !!card.querySelector(".tags ." + filter);
        card.hidden = !match;
        if (match) shown++;
      });
      // Hide a group heading when none of its tools match.
      document.querySelectorAll("#tools .cards").forEach(function (list) {
        var any = Array.prototype.some.call(list.children, function (c) { return !c.hidden; });
        list.hidden = !any;
        var heading = list.previousElementSibling;
        if (heading && heading.classList.contains("group-title")) heading.hidden = !any;
      });
      count.textContent = filter === "all" ? "" : shown + " of " + cards.length + " tools";
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        apply(b.dataset.filter);
      });
    });
  })();

  /* ---------- Reveal sections as they scroll into view ---------- */
  (function () {
    if (reduced || !("IntersectionObserver" in window)) return;
    var targets = document.querySelectorAll(".paths, .section-head, .demo-grid, .legend, .cards, .rows, .contact, .site-footer");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
    targets.forEach(function (el) {
      // Anything already on screen shows immediately; only content below the fold animates.
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add("reveal");
      io.observe(el);
    });
  })();
})();
