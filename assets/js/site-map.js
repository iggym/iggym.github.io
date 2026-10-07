/* "What's on this site": an animated dialog listing every page and section.
   Opened from any button with [data-site-map]. Built from the list below so
   the homepage and the tool pages share one source. Uses <dialog>, which
   handles focus trapping, Esc, and the backdrop natively. */
(function () {
  "use strict";

  var script = document.currentScript;
  var root = new URL("../../", script.src);           // site root, from this file's location
  function url(path) { return new URL(path, root).href; }

  var SECTIONS = [
    { title: "Start here", items: [
      { name: "Try a tool right here", href: "#demo", desc: "Score a prompt, see what’s missing, and get a structured rewrite." },
      { name: "What brings you here?", href: "#start", desc: "Four starting points depending on what you need." }
    ] },
    { title: "Tools", note: "Free, single-page tools", items: [
      { name: "Prompt Matrix Evaluator", href: "tools/prompt-matrix-evaluator.html", desc: "Score a prompt, fix gaps in one click, get a structured rewrite.", tag: "local" },
      { name: "Context Extractor", href: "tools/context-extractor.html", desc: "Turn a long chat into a handoff prompt.", tag: "local" },
      { name: "Claude Context Engine", href: "tools/claude_context_engine_premium.html", desc: "Rewrite messy context, with secrets masked.", tag: "server" },
      { name: "Portable Context Engine", href: "tools/context-engine.html", desc: "Reusable instruction profiles and templates.", tag: "local" },
      { name: "Prompt Diff & Stager", href: "tools/token-conscious-diff-stager.html", desc: "Compare prompt versions and keep snapshots.", tag: "local" },
      { name: "NanoBanana Compiler", href: "tools/nanobanana-json-compiler.html", desc: "Build an architecture diagram; export SVG or Mermaid.", tag: "local" },
      { name: "Multi-Model Workspace", href: "tools/ai-aggregator.html", desc: "Compare OpenAI and Anthropic answers with stats.", tag: "key" },
      { name: "Context Window Optimizer", href: "tools/context-window-optimizer.html", desc: "Plan a context budget and its cost.", tag: "local" },
      { name: "Agent Stateboard", href: "tools/deterministic-agent-stateboard.html", desc: "Design an agent with checks; export the spec.", tag: "local" },
      { name: "Token Router", href: "tools/agentic-backpressure-throttle.html", desc: "Plan around rate limits and backlogs.", tag: "local" }
    ] },
    { title: "Writing", items: [
      { name: "The shift from coding to context orchestration", href: "articles/context-orchestration.html", desc: "Essay · 6 min read" },
      { name: "Token window economics", href: "articles/token-economics.html", desc: "Essay · 4 min read" },
      { name: "The AI Runbook", href: "https://github.com/iggym/the-ai-runbook", desc: "What to do when an AI feature breaks." },
      { name: "Production AI Patterns", href: "https://github.com/iggym/production-ai-patterns", desc: "Patterns for AI systems under real traffic." },
      { name: "All writing", href: "#writing", desc: "Essays, guides, and reading lists." }
    ] },
    { title: "Content sites", note: "17 standalone sites, one per subject", items: [
      { name: "All content sites", href: "sites/", desc: "Every site I keep, grouped by subject." },
      { name: "Applied AI Engineering", href: "https://iggym.github.io/applied-ai-engineering/", desc: "Where the patterns add up to an argument." },
      { name: "Production AI Patterns", href: "https://iggym.github.io/production-ai-patterns/", desc: "A pattern language for AI under real traffic." },
      { name: "The AI Runbook", href: "https://iggym.github.io/the-ai-runbook/", desc: "Incident procedures to read at 3am." },
      { name: "Agentic Infra Weekly", href: "https://iggym.github.io/agentic-infra-weekly/", desc: "A weekly briefing on agent infrastructure." },
      { name: "Systems Bench", href: "https://iggym.github.io/systems-bench/", desc: "24 small tools for AI systems work." },
      { name: "One Origin", href: "https://one-origin.pages.dev/", desc: "The true size of Africa, and where every line begins." },
      { name: "Beyond AI", href: "sites/#reading", desc: "Essays on reading, attention, and history." }
    ] },
    { title: "Projects & contact", items: [
      { name: "Open-source projects", href: "#projects", desc: "Guardrails, audit tools, and context utilities." },
      { name: "Work with me", href: "#contact", desc: "What I help with and how to get in touch." },
      { name: "Résumé", href: "assets/resume/iggy-resume.pdf", desc: "PDF, 122 KB" },
      { name: "GitHub", href: "https://github.com/iggym", desc: "All code." },
      { name: "LinkedIn", href: "https://www.linkedin.com/in/iggym", desc: "Message me." }
    ] }
  ];
  var TAGS = { local: "Stays on your device", server: "Sends text to a server", key: "Needs your API key", demo: "Simulation" };

  var onHome = /\/(index\.html)?$/.test(location.pathname) && new URL(".", location.href).href === root.href;

  function resolve(href) {
    if (/^https?:/.test(href)) return href;
    if (href.charAt(0) === "#") return onHome ? href : url("index.html" + href);
    return url(href);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Build the dialog once.
  var dialog = el("dialog", "site-map");
  dialog.setAttribute("aria-labelledby", "site-map-title");
  var panel = el("div", "sm-panel");
  var head = el("div", "sm-head");
  var title = el("h2", "sm-title", "What’s on this site");
  title.id = "site-map-title";
  var close = el("button", "sm-close");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.textContent = "✕";
  head.appendChild(title); head.appendChild(close);

  var searchWrap = el("div", "sm-search");
  var searchLabel = el("label", "sr-only", "Filter pages");
  searchLabel.htmlFor = "sm-filter";
  var search = el("input");
  search.type = "search"; search.id = "sm-filter"; search.placeholder = "Filter… e.g. prompt, token, essay";
  search.setAttribute("autocomplete", "off");
  searchWrap.appendChild(searchLabel); searchWrap.appendChild(search);

  var body = el("div", "sm-body");
  var empty = el("p", "sm-empty", "Nothing matches that. Try another word.");
  empty.hidden = true;
  var count = el("p", "sr-only");
  count.setAttribute("role", "status");

  var itemIndex = 0;
  SECTIONS.forEach(function (sec) {
    var group = el("section", "sm-group");
    var h = el("h3", "sm-group-title", sec.title);
    group.appendChild(h);
    var ul = el("ul", "sm-list");
    sec.items.forEach(function (it) {
      var li = el("li", "sm-item");
      li.style.setProperty("--i", itemIndex++);
      var a = el("a");
      a.href = resolve(it.href);
      if (/^https?:/.test(it.href)) a.rel = "noopener";
      a.appendChild(el("span", "sm-name", it.name));
      a.appendChild(el("span", "sm-desc", it.desc));
      if (it.tag) a.appendChild(el("span", "sm-tag sm-tag-" + it.tag, TAGS[it.tag]));
      li.dataset.search = (sec.title + " " + it.name + " " + it.desc + " " + (it.tag ? TAGS[it.tag] : "")).toLowerCase();
      li.appendChild(a);
      ul.appendChild(li);
    });
    group.appendChild(ul);
    body.appendChild(group);
  });
  body.appendChild(empty);

  panel.appendChild(head); panel.appendChild(searchWrap); panel.appendChild(body); panel.appendChild(count);
  dialog.appendChild(panel);
  document.body.appendChild(dialog);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var opener = null;

  function open(from) {
    if (dialog.open) return;
    opener = from || null;
    search.value = ""; filter();
    dialog.classList.remove("closing");
    dialog.showModal();
    document.documentElement.classList.add("sm-open");
    document.querySelectorAll("[data-site-map]").forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    // Focus the filter on larger screens; on touch screens that would pop the keyboard.
    if (window.matchMedia("(min-width: 700px)").matches) search.focus(); else close.focus();
  }

  function finishClose() {
    dialog.classList.remove("closing");
    if (dialog.open) dialog.close();
    document.documentElement.classList.remove("sm-open");
    document.querySelectorAll("[data-site-map]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (opener) opener.focus();
  }

  function shut() {
    if (!dialog.open || dialog.classList.contains("closing")) return;
    if (reduce) { finishClose(); return; }
    dialog.classList.add("closing");
    var done = false;
    function end() { if (done) return; done = true; finishClose(); }
    panel.addEventListener("animationend", end, { once: true });
    setTimeout(end, 400); // in case animations are disabled
  }

  function filter() {
    var q = search.value.trim().toLowerCase();
    var shown = 0;
    body.querySelectorAll(".sm-item").forEach(function (li) {
      var match = !q || q.split(/\s+/).every(function (w) { return li.dataset.search.indexOf(w) !== -1; });
      li.hidden = !match;
      if (match) shown++;
    });
    body.querySelectorAll(".sm-group").forEach(function (g) {
      g.hidden = !g.querySelector(".sm-item:not([hidden])");
    });
    empty.hidden = shown !== 0;
    count.textContent = q ? shown + (shown === 1 ? " page matches." : " pages match.") : "";
  }

  search.addEventListener("input", filter);
  close.addEventListener("click", shut);
  dialog.addEventListener("cancel", function (e) { e.preventDefault(); shut(); });   // Esc
  // A search field swallows the first Esc to clear itself; close on the first press instead.
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); shut(); }
  });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) shut(); }); // backdrop
  body.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    // Same-page links: close first so the page can scroll to the section.
    if (onHome && a.getAttribute("href").charAt(0) === "#") {
      e.preventDefault();
      opener = null;
      shut();
      var target = document.querySelector(a.getAttribute("href"));
      setTimeout(function () {
        if (target) { target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); history.replaceState(null, "", a.getAttribute("href")); }
      }, reduce ? 0 : 260);
    }
  });

  document.querySelectorAll("[data-site-map]").forEach(function (btn) {
    btn.hidden = false;
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () { open(btn); });
  });
})();
