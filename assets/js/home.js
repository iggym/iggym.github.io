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

    // Show / hide the simulator from the link under the hero buttons.
    // The choice is remembered on this device; while hidden, the run pauses.
    var sim = document.getElementById("simulator");
    var toggle = document.getElementById("sim-toggle");
    var label = toggle.querySelector(".sim-toggle-label");
    var startHidden = root.classList.contains("sim-off");
    function userPaused() { return pauseBtn.getAttribute("aria-pressed") === "true"; }
    function setShown(show, animate) {
      toggle.setAttribute("aria-expanded", String(show));
      label.textContent = show ? "Hide the agent simulator" : "Show the agent simulator";
      try { localStorage.setItem("sim", show ? "shown" : "hidden"); } catch (e) { /* storage blocked */ }
      if (show) {
        sim.hidden = false;
        root.classList.remove("sim-off");
        if (animate && !reduced) {
          sim.classList.add("sim-enter");
          requestAnimationFrame(function () { requestAnimationFrame(function () { sim.classList.remove("sim-enter"); }); });
        }
        if (!reduced && !userPaused()) { paused = false; pump(); }
      } else {
        if (!reduced) { paused = true; hold(); }
        var finish = function () { sim.hidden = true; sim.classList.remove("sim-leave"); root.classList.add("sim-off"); };
        if (animate && !reduced) { sim.classList.add("sim-leave"); setTimeout(finish, 300); } else finish();
      }
    }
    toggle.hidden = false;
    toggle.addEventListener("click", function () { setShown(toggle.getAttribute("aria-expanded") !== "true", true); });
    if (startHidden) { paused = true; sim.hidden = true; toggle.setAttribute("aria-expanded", "false"); label.textContent = "Show the agent simulator"; }

    if (reduced) {
      // No typing or looping: show a finished run and let visitors step through.
      pauseBtn.hidden = true;
      renderStatic(RUNS[run]);
    } else {
      play(RUNS[run]);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden && !paused) { paused = true; hold(); }
        else if (!document.hidden && !sim.hidden && pauseBtn.getAttribute("aria-pressed") !== "true") { paused = false; pump(); }
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

  /* ---------- Live prompt demo: score, tighten, and restructure ---------- */
  (function () {
    var input = document.getElementById("demo-in");
    if (!input || !window.PromptTightener || !window.PromptLint) return;
    var out = document.getElementById("demo-out");
    var outLabel = document.getElementById("demo-out-label");
    var meta = document.getElementById("demo-meta");
    var before = document.getElementById("bar-before");
    var after = document.getElementById("bar-after");
    var section = document.getElementById("demo");
    var ring = document.getElementById("demo-ring");
    var openLink = document.getElementById("demo-open");
    var view = "structured";
    var EXAMPLES = window.PromptLint.examples;
    var LABELS = { structured: "Structured rewrite", tight: "Tightened", cut: "What got cut" };
    var result = { text: "" };

    function tokens(t) { return t ? Math.ceil(t.length / 4) : 0; }
    function money(n) { return n < 1 ? "$" + n.toFixed(2) : "$" + Math.round(n).toLocaleString(); }

    function render() {
      var raw = input.value;
      var r = PromptTightener.tighten(raw);
      var checks = PromptLint.lint(raw), sc = PromptLint.score(checks);

      // Score card
      ring.style.setProperty("--pct", raw.trim() ? sc.score : 0);
      ring.dataset.band = sc.score >= 80 ? "good" : sc.score >= 50 ? "ok" : "low";
      document.getElementById("demo-score-num").textContent = raw.trim() ? sc.score : "–";
      document.getElementById("demo-score-text").textContent = !raw.trim() ? "Paste a prompt to score it." :
        sc.passed + " of " + sc.total + " checks passed" + (sc.score >= 80 ? ". In good shape." : sc.score >= 50 ? ". A few fixes will help." : ". Expect vague answers.");
      var fixes = document.getElementById("demo-fixes"); fixes.innerHTML = "";
      checks.filter(function (c) { return c.s !== "pass"; }).slice(0, 3).forEach(function (c) {
        var li = document.createElement("li"); li.className = c.s;
        var b = document.createElement("strong"); b.textContent = c.t;
        li.appendChild(b); li.appendChild(document.createTextNode(c.q ? " · " + c.q : ""));
        fixes.appendChild(li);
      });

      // Result view
      outLabel.textContent = LABELS[view];
      out.className = "demo-out view-" + view;
      if (view === "cut") { out.innerHTML = r.html || "&nbsp;"; result.text = r.text; }
      else if (view === "tight") { out.textContent = r.text || "Type a prompt to see it tightened."; result.text = r.text; }
      else { var st = PromptLint.structure(raw); out.textContent = st || "Type a prompt to see it restructured."; result.text = st; }

      // Size and savings
      var b = tokens(raw), a = tokens(r.text), saved = b - a;
      before.style.width = b ? "100%" : "0%";
      after.style.width = b ? Math.max(2, (a / b) * 100) + "%" : "0%";
      meta.textContent = !raw.trim() ? "" : saved <= 0 ? "No filler found. That prompt is already tight." :
        "About " + b + " tokens down to " + a + " (" + Math.round(saved / b * 100) + "% fewer). At 10,000 requests a day that’s roughly " +
        (saved * 10000 * 30).toLocaleString() + " tokens and " + money(saved * 10000 * 30 * 3 / 1e6) + " a month at $3 per million input tokens.";
      openLink.href = "tools/prompt-matrix-evaluator.html#p=" + encodeURIComponent(raw);
    }

    var t;
    input.addEventListener("input", function () {
      clearTimeout(t); t = setTimeout(render, 120);
      document.querySelectorAll("[data-ex]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
    });

    // Examples: type the prompt in quickly so the change is visible, then score it.
    var typing = null;
    function load(text) {
      clearInterval(typing);
      if (reduced) { input.value = text; render(); return; }
      var i = 0, step = Math.max(3, Math.ceil(text.length / 40));
      input.value = "";
      typing = setInterval(function () {
        i = Math.min(text.length, i + step);
        input.value = text.slice(0, i);
        if (i >= text.length) { clearInterval(typing); render(); }
      }, 16);
    }
    document.querySelectorAll("[data-ex]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-ex]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === btn)); });
        load(EXAMPLES[btn.dataset.ex]);
      });
    });
    document.querySelectorAll("[data-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        view = btn.dataset.view;
        document.querySelectorAll("[data-view]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === btn)); });
        render();
      });
    });
    document.getElementById("demo-copy").addEventListener("click", function () {
      var btn = this, text = result.text;
      var done = function (ok) { btn.textContent = ok ? "Copied" : "Copy failed"; setTimeout(function () { btn.textContent = "Copy result"; }, 1500); };
      if (navigator.clipboard && text) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });

    ["demo-examples", "demo-score", "demo-tabs", "demo-actions"].forEach(function (id) { document.getElementById(id).hidden = false; });
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
    var targets = document.querySelectorAll(".paths, .section-head, .demo-grid, .legend, .cards, .rows, .site-bento, .site-more, .contact, .site-footer");
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
