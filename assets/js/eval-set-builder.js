/* Eval Set Builder page: wires assets/js/eval-checks.js to the form. Uses textContent throughout. */
(function () {
  "use strict";
  var E = window.EvalChecks;
  var EXAMPLE = "You are a support agent for {{product}}. Answer {{customer_name}} in under 120 words. Do not promise refunds.\n\nQuestion: {{question}}";
  var state = { prompt: "", cases: [] };
  var nextId = 1;
  var el = {
    prompt: document.getElementById("prompt"), vars: document.getElementById("vars"),
    cases: document.getElementById("cases"), score: document.getElementById("score"), results: document.getElementById("results"),
    format: document.getElementById("format"), preview: document.getElementById("preview"),
    setName: document.getElementById("set-name"), saved: document.getElementById("saved"),
    importText: document.getElementById("import-text"), importErrors: document.getElementById("import-errors")
  };

  function store() { return ToolKit.store.get("eval_sets", {}) || {}; }
  function save(sets) { ToolKit.store.set("eval_sets", sets); }
  function announce(m) { ToolKit.announce(m); }

  function syncVars() {
    var names = E.variables(state.prompt);
    state.cases.forEach(function (c) { names.forEach(function (n) { if (!(n in c.vars)) c.vars[n] = ""; }); });
    el.vars.textContent = names.length ? "Variables: " + names.map(function (n) { return "{{" + n + "}}"; }).join(", ") : "No {{variables}} yet. Add one to the prompt to fill it in per case.";
  }

  function newCase(name, vars, checks) {
    return { id: "case-" + (nextId++), name: name, vars: vars, checks: checks || "", output: "" };
  }

  function renderCases() {
    el.cases.textContent = "";
    if (!state.cases.length) {
      var empty = document.createElement("p"); empty.className = "hint";
      empty.textContent = "No cases yet. Add the starter cases, or add your own.";
      el.cases.appendChild(empty);
    }
    state.cases.forEach(function (c, idx) {
      var card = document.createElement("article"); card.className = "case"; card.dataset.id = c.id;
      var head = document.createElement("div"); head.className = "row-between";
      var name = field("Name", "text", c.name, function (v) { c.name = v; refresh(); });
      var rm = document.createElement("button"); rm.type = "button"; rm.className = "btn btn-quiet btn-small";
      rm.textContent = "Remove"; rm.setAttribute("aria-label", "Remove case " + (idx + 1));
      rm.addEventListener("click", function () { state.cases.splice(idx, 1); renderCases(); refresh(); announce("Case removed."); });
      head.appendChild(name.wrap); head.appendChild(rm); card.appendChild(head);

      E.variables(state.prompt).forEach(function (n) {
        var f = field("{{" + n + "}}", "text", c.vars[n] || "", function (v) { c.vars[n] = v; refresh(); });
        card.appendChild(f.wrap);
      });
      var checks = textarea("Checks, one per line", 3, c.checks, function (v) { c.checks = v; refresh(); });
      checks.ta.placeholder = "contains: refund\nmax words: 120\nnot contains: system prompt";
      card.appendChild(checks.wrap);
      var out = textarea("Model output for this case (paste here)", 4, c.output, function (v) { c.output = v; refresh(); });
      card.appendChild(out.wrap);
      var res = document.createElement("ul"); res.className = "checks"; res.setAttribute("aria-label", "Check results for " + c.name);
      card.appendChild(res); c.resultEl = res;
      el.cases.appendChild(card);
    });
  }

  function field(label, type, value, onInput) {
    var wrap = document.createElement("div"); wrap.className = "field";
    var lab = document.createElement("label"); lab.textContent = label;
    var input = document.createElement("input"); input.type = type; input.value = value;
    var id = "f-" + Math.random().toString(36).slice(2, 8); input.id = id; lab.htmlFor = id;
    input.addEventListener("input", function () { onInput(input.value); });
    wrap.appendChild(lab); wrap.appendChild(input);
    return { wrap: wrap, input: input };
  }

  function textarea(label, rows, value, onInput) {
    var wrap = document.createElement("div"); wrap.className = "field";
    var lab = document.createElement("label"); lab.textContent = label;
    var ta = document.createElement("textarea"); ta.rows = rows; ta.value = value;
    var id = "t-" + Math.random().toString(36).slice(2, 8); ta.id = id; lab.htmlFor = id;
    ta.addEventListener("input", function () { onInput(ta.value); });
    wrap.appendChild(lab); wrap.appendChild(ta);
    return { wrap: wrap, ta: ta };
  }

  // Re-run every case and update the results, score and export preview.
  function refresh() {
    var total = 0, passed = 0, ran = 0;
    state.cases.forEach(function (c) {
      var rendered = E.fill(state.prompt, c.vars);
      var r = E.runCase(c.checks, c.output);
      c.resultEl.textContent = "";
      r.errors.forEach(function (msg) { li(c.resultEl, "warn", "!", msg); });
      if (!r.hasOutput) li(c.resultEl, "tip", "i", "Paste a model output to run the checks.");
      if (r.hasOutput && !r.total) li(c.resultEl, "tip", "i", "No checks yet. Add a line such as “contains: …” to score this case.");
      r.results.forEach(function (x) {
        var kind = x.pass === null ? "tip" : x.pass ? "pass" : "warn";
        li(c.resultEl, kind, x.pass === null ? "–" : x.pass ? "✓" : "✗", x.label + (x.pass === false ? " failed" : ""));
      });
      if (r.hasOutput && r.total) { ran++; if (r.allPass) passed++; total++; }
      c.lastRendered = rendered;
    });
    el.score.textContent = ran
      ? passed + " of " + ran + " cases pass every check."
      : state.cases.length ? "Paste model outputs to score the cases." : "Add cases to start scoring.";
    el.results.textContent = "";
    state.cases.forEach(function (c) {
      var r = E.runCase(c.checks, c.output);
      if (!r.hasOutput || !r.total) return;
      var p = document.createElement("p"); p.className = "result-line";
      p.textContent = (r.allPass ? "Pass: " : "Fail: ") + c.name + " (" + r.passed + "/" + r.total + " checks)";
      el.results.appendChild(p);
    });
    renderExport();
  }

  function li(list, kind, icon, text) {
    var item = document.createElement("li"); item.className = kind;
    var i = document.createElement("span"); i.className = "icon"; i.setAttribute("aria-hidden", "true"); i.textContent = icon;
    var t = document.createElement("span"); t.textContent = text;
    item.appendChild(i); item.appendChild(t); list.appendChild(item);
  }

  function exportText() {
    var f = el.format.value;
    if (f === "promptfoo") return E.toPromptfoo(state.prompt, state.cases);
    if (f === "pytest") return E.toPytest(state.prompt, state.cases);
    return E.toJSONL(state.cases);
  }
  function renderExport() { el.preview.value = exportText(); }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function refreshSaved() {
    var sets = store(); el.saved.textContent = "";
    var names = Object.keys(sets).sort();
    if (!names.length) { var o = document.createElement("option"); o.textContent = "No saved sets"; o.value = ""; el.saved.appendChild(o); return; }
    names.forEach(function (n) { var o = document.createElement("option"); o.value = n; o.textContent = n; el.saved.appendChild(o); });
  }

  function loadSet(data) {
    state.prompt = data.prompt || ""; el.prompt.value = state.prompt;
    state.cases = (data.cases || []).map(function (c) { return newCase(c.name, c.vars || {}, c.checks); });
    state.cases.forEach(function (c, i) { c.output = (data.cases[i] && data.cases[i].output) || ""; });
    syncVars(); renderCases(); refresh();
  }

  // Starter cases and examples
  document.getElementById("load-example").addEventListener("click", function () {
    state.prompt = EXAMPLE; el.prompt.value = EXAMPLE; syncVars(); renderCases(); refresh(); announce("Example prompt loaded.");
  });
  document.getElementById("add-starters").addEventListener("click", function () {
    E.starters(state.prompt).forEach(function (s) {
      var c = newCase(s.name, s.vars, s.checks); c.output = ""; state.cases.push(c);
    });
    renderCases(); refresh(); announce("Five starter cases added.");
  });
  document.getElementById("add-case").addEventListener("click", function () {
    var vars = {}; E.variables(state.prompt).forEach(function (n) { vars[n] = ""; });
    state.cases.push(newCase("Case " + (state.cases.length + 1), vars, "")); renderCases(); refresh();
    announce("Case added.");
  });
  el.prompt.addEventListener("input", function () { state.prompt = el.prompt.value; syncVars(); renderCases(); refresh(); });

  el.format.addEventListener("change", renderExport);
  document.getElementById("copy-export").addEventListener("click", function (e) { ToolKit.copyText(exportText(), e.currentTarget); });
  document.getElementById("download-export").addEventListener("click", function () {
    var f = el.format.value;
    if (f === "promptfoo") download("promptfooconfig.yaml", exportText(), "text/yaml");
    else if (f === "pytest") download("test_eval_set.py", exportText(), "text/x-python");
    else download("eval-set.jsonl", exportText(), "application/x-ndjson");
  });

  document.getElementById("save-set").addEventListener("click", function () {
    var name = el.setName.value.trim();
    if (!name) { announce("Give the set a name first."); el.setName.focus(); return; }
    var sets = store();
    sets[name] = { prompt: state.prompt, cases: state.cases.map(function (c) { return { name: c.name, vars: c.vars, checks: c.checks, output: c.output }; }) };
    save(sets); refreshSaved(); el.saved.value = name; announce("Saved “" + name + "”.");
  });
  document.getElementById("load-set").addEventListener("click", function () {
    var sets = store(), data = sets[el.saved.value];
    if (!data) { announce("Nothing to load."); return; }
    loadSet(data); announce("Loaded “" + el.saved.value + "”.");
  });
  document.getElementById("delete-set").addEventListener("click", function () {
    var sets = store(); if (!sets[el.saved.value]) return;
    var gone = el.saved.value; delete sets[gone]; save(sets); refreshSaved(); announce("Deleted “" + gone + "”.");
  });

  document.getElementById("import-go").addEventListener("click", function () {
    var r = E.fromJSONL(el.importText.value);
    el.importErrors.textContent = r.errors.join(" ");
    if (!r.cases.length) { if (!r.errors.length) el.importErrors.textContent = "Paste JSON Lines (one case per line) first."; return; }
    state.cases = r.cases.map(function (c) { var n = newCase(c.name, c.vars, c.checks); n.output = c.output; return n; });
    renderCases(); refresh(); announce("Imported " + r.cases.length + " cases.");
  });

  // Opened from the Prompt Matrix Evaluator or the homepage with #p=
  var fromHash = "";
  try { var m = location.hash.match(/^#p=(.*)$/); if (m) fromHash = decodeURIComponent(m[1]); } catch (e) {}
  if (fromHash) history.replaceState(null, "", location.pathname + location.search);
  state.prompt = fromHash || EXAMPLE;
  el.prompt.value = state.prompt;
  syncVars(); refreshSaved(); renderCases(); refresh();
})();
