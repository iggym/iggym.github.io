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

  /* ---------- Header: add a hairline once the page scrolls ---------- */
  (function () {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function update() { header.classList.toggle("scrolled", window.scrollY > 8); }
    window.addEventListener("scroll", update, { passive: true });
    update();
  })();

  /* ---------- Agent console: types out simulated runs ---------- */
  (function () {
    var body = document.getElementById("console-body");
    if (!body) return;
    var controls = document.querySelector(".console-controls");
    var pauseBtn = document.getElementById("console-pause");
    var nextBtn = document.getElementById("console-next");

    // [icon class, icon, step, text, tokens, tone]
    var RUNS = [
      { cmd: 'run "weekly ticket summary"', steps: [
        ["i-plan", "▸", "plan", "3 acceptance criteria", "340 tok"],
        ["i-build", "▸", "build", "draft summary ready", "890 tok"],
        ["i-bad", "✗", "check", "category counts don’t add up", "", "bad"],
        ["i-retry", "↺", "build", "fix counts · retry 1 of 2", "410 tok"],
        ["i-ok", "✓", "check", "all criteria pass", "210 tok", "ok"],
        ["i-ship", "✓", "ship", "posted to #support-weekly", ""]
      ], sum: "done · 1 retry · 1,850 tokens" },
      { cmd: 'run "upgrade to a newer model"', steps: [
        ["i-plan", "▸", "plan", "120 saved test cases to compare", "280 tok"],
        ["i-build", "▸", "build", "re-run tests on the new model", "6.1k tok"],
        ["i-bad", "✗", "check", "3 answers changed format", "", "bad"],
        ["i-retry", "↺", "build", "tighten output schema · retry 1 of 2", "520 tok"],
        ["i-ok", "✓", "check", "120 / 120 match", "190 tok", "ok"],
        ["i-ship", "✓", "ship", "new model live behind a flag", ""]
      ], sum: "done · 1 retry · 7,090 tokens" },
      { cmd: 'run "trim the support prompt"', steps: [
        ["i-plan", "▸", "plan", "budget 800 tokens, keep every rule", "150 tok"],
        ["i-build", "▸", "build", "draft at 1,240 tokens", "1.3k tok"],
        ["i-bad", "✗", "check", "over budget by 440 tokens", "", "bad"],
        ["i-retry", "↺", "build", "cut filler and repeats · retry 1 of 2", "640 tok"],
        ["i-ok", "✓", "check", "760 tokens, all rules kept", "120 tok", "ok"],
        ["i-ship", "✓", "ship", "prompt v7 saved", ""]
      ], sum: "done · 1 retry · 2,210 tokens" }
    ];

    var run = 0, timers = [], paused = false, queue = [];

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }
    function stepLine(st) {
      var li = el("li", "l" + (st[5] ? " " + st[5] : ""));
      li.appendChild(el("span", "i " + st[0], st[1]));
      li.appendChild(el("span", "k", st[2]));
      li.appendChild(el("span", "t", st[3]));
      li.appendChild(el("span", "m", st[4]));
      return li;
    }
    function renderStatic(r) {
      body.innerHTML = "";
      var cmd = el("li", "l l-cmd");
      cmd.appendChild(el("span", "p", "$"));
      cmd.appendChild(document.createTextNode(" " + r.cmd));
      body.appendChild(cmd);
      r.steps.forEach(function (st) { body.appendChild(stepLine(st)); });
      body.appendChild(el("li", "l l-sum", r.sum));
    }

    // A tiny scheduler so Pause can freeze the sequence where it is.
    var pending = null;
    function later(ms, fn) { queue.push({ ms: ms, fn: fn }); pump(); }
    function pump() {
      if (paused || timers.length || !queue.length) return;
      var job = pending = queue.shift();
      timers.push(setTimeout(function () { timers = []; pending = null; job.fn(); pump(); }, job.ms));
    }
    // Stop the waiting step and put it back at the front, so Pause is immediate.
    function hold() {
      timers.forEach(clearTimeout); timers = [];
      if (pending) { queue.unshift(pending); pending = null; }
    }
    function clearAll() { timers.forEach(clearTimeout); timers = []; queue = []; pending = null; }

    function play(r) {
      body.innerHTML = "";
      var cmd = el("li", "l l-cmd");
      cmd.appendChild(el("span", "p", "$"));
      var typed = document.createTextNode(" ");
      cmd.appendChild(typed);
      var caret = el("span", "caret");
      cmd.appendChild(caret);
      body.appendChild(cmd);
      r.cmd.split("").forEach(function (ch) {
        later(38, function () { typed.textContent += ch; });
      });
      later(380, function () { caret.remove(); });
      r.steps.forEach(function (st, k) {
        later(k === 0 ? 300 : (st[5] === "bad" || st[5] === "ok" ? 900 : 700), function () {
          var li = stepLine(st);
          li.classList.add("enter");
          body.appendChild(li);
        });
      });
      later(600, function () { var li = el("li", "l l-sum enter", r.sum); body.appendChild(li); });
      later(4200, function () { run = (run + 1) % RUNS.length; play(RUNS[run]); });
    }

    controls.hidden = false;
    if (reduced) {
      // No typing or looping: show a finished run and let visitors step through.
      pauseBtn.hidden = true;
      renderStatic(RUNS[run]);
    } else {
      play(RUNS[run]);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden && !paused) { paused = true; hold(); } else if (!document.hidden && pauseBtn.getAttribute("aria-pressed") !== "true") { paused = false; pump(); }
      });
    }

    pauseBtn.addEventListener("click", function () {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.textContent = paused ? "Play" : "Pause";
      if (paused) hold(); else pump();
    });
    nextBtn.addEventListener("click", function () {
      clearAll();
      run = (run + 1) % RUNS.length;
      if (reduced || paused) renderStatic(RUNS[run]);
      else play(RUNS[run]);
    });
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
