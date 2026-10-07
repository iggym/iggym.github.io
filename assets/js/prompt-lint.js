/* Prompt checklist and structured rewrite. Shared by the homepage demo and
   tools/prompt-matrix-evaluator.html. Needs prompt-tightener.js loaded first.
   Plain rules, not an AI judge: they catch the gaps that most often produce
   vague or rambling answers. */
(function () {
  "use strict";

  var VERBS = "write|explain|summari[sz]e|list|create|generate|review|analy[sz]e|translate|classify|extract|draft|compare|fix|rewrite|describe|outline|suggest|recommend|answer|identify|convert|plan|design|evaluate|find|give|tell|build|refactor|debug|check|edit|produce|propose|turn|make|look at";
  var FORMAT = /\b(json|yaml|csv|xml|markdown|table|bullet(?:s| points?)?|numbered list|list|paragraphs?|sentences?|headings?|code block|steps?|email|outline|haiku|tweet|title|one line|format|charts?)\b/i;
  var LENGTH = /(\b\d+\s*(?:-|to)?\s*\d*\s*(?:words?|sentences?|bullets?|bullet points?|paragraphs?|characters?|tokens?|lines?|items?|points?)\b)|\b(under|at most|no more than|maximum|max|up to|fewer than|one|two|three|four|five)\b[^.]{0,30}\b(words?|sentences?|bullets?|paragraphs?|lines?|points?|items?)\b|\b(brief|short|concise|one[- ]liner|tl;?dr)\b/i;
  var AUDIENCE = /\b(you are|act as|as an? [a-z]+|for (?:a |an |my |our |the )?[a-z]+(?: [a-z]+)?(?: readers?| audience| customers?| users?| team| engineers?| beginners?| executives?| students?| managers?| developers?| kids| clients?)|audience|readers?|reader is|written for)\b/i;
  var VAGUE = /\b(some|something|stuff|things?|etc\.?|good|nice|better|great|various|a lot|lots of|maybe|kind of|sort of|interesting|appropriate|relevant|properly|whatever|exciting|amazing)\b/gi;
  var SHORT = /\b(short|brief|concise|succinct|minimal)\b/i;
  var LONG = /\b(detailed|comprehensive|thorough|in[- ]depth|exhaustive|extensive|cover all|all the)\b/i;
  var ACRONYM = /^(JSON|YAML|CSV|XML|HTML|CSS|API|SQL|URL|PDF|SDK|LLM|AI|UI|UX|ID|FAQ|TLDR|README|AWS|GCP|HTTP|HTTPS|REST|JWT|OK|CEO|CTO|KPI|ROI|SLA|USA|UK|EU)$/;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function sentences(t) { return t.split(/(?<=[.!?])\s+|\n+/).map(function (s) { return s.trim(); }).filter(Boolean); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function unique(list) { return list.filter(function (w, i) { return list.indexOf(w) === i; }); }
  function vagueWords(t) { return unique((t.match(VAGUE) || []).map(function (w) { return w.toLowerCase(); })); }
  function shoutWords(t) { return (t.match(/\b[A-Z]{3,}\b/g) || []).filter(function (w) { return !ACRONYM.test(w); }); }

  // Each result: { id, s: "pass" | "warn" | "tip", t: title, d: detail (HTML-safe), q: question to answer (optional) }
  function lint(text) {
    var t = String(text || "").trim(), out = [];
    if (!t) return out;
    var hasVerb = new RegExp("(^|[.!?\\n]\\s*|\\b(?:please|you to|can you|could you|i need|i want)(?:\\s+(?:please|kindly|just|basically|go ahead and))*\\s+)(" + VERBS + ")\\b", "i").test(t) || /\?\s*$/.test(t);
    out.push(hasVerb
      ? { id: "task", s: "pass", t: "Clear task", d: "There’s an instruction or question to act on." }
      : { id: "task", s: "warn", t: "No clear task", d: "Start with what you want done, e.g. “Summarize…”, “Write…”, “List…”.", q: "What exactly should the model do?" });
    out.push(FORMAT.test(t)
      ? { id: "format", s: "pass", t: "Output format", d: "You say what shape the answer should take." }
      : { id: "format", s: "warn", t: "No output format", d: "Say how the answer should look: bullets, a table, JSON, an email, a single paragraph.", q: "What shape should the answer take: bullets, a table, JSON, an email?" });
    out.push(LENGTH.test(t)
      ? { id: "length", s: "pass", t: "Length limit", d: "The answer has a size to aim for." }
      : { id: "length", s: "warn", t: "No length limit", d: "Add a limit such as “under 100 words” or “three bullets”. Unbounded prompts produce long, costly answers.", q: "How long should it be?" });
    out.push(AUDIENCE.test(t)
      ? { id: "audience", s: "pass", t: "Audience or role", d: "The model knows who it’s writing as or for." }
      : { id: "audience", s: "tip", t: "No audience or role", d: "Say who it’s for (“for new customers”) or who to be (“You are a support lead”).", q: "Who is this for, and who should the model act as?" });
    var vague = vagueWords(t);
    out.push(vague.length >= 2
      ? { id: "vague", s: "warn", t: "Vague words", d: "Replace with specifics: " + vague.slice(0, 8).map(function (w) { return "<code>" + esc(w) + "</code>"; }).join(", ") + ".",
          q: "What do you mean by " + vague.slice(0, 3).map(function (w) { return "“" + w + "”"; }).join(", ") + "?" }
      : { id: "vague", s: "pass", t: "Specific wording", d: "Few vague words like “stuff”, “good”, or “etc.”." });
    if (SHORT.test(t) && LONG.test(t)) {
      var a = t.match(SHORT)[0], b = t.match(LONG)[0];
      out.push({ id: "conflict", s: "warn", t: "Contradiction", d: "It asks for both “" + esc(a) + "” and “" + esc(b) + "”. Pick one, or say which part should be detailed.",
        q: "You asked for “" + a + "” and “" + b + "”. Which matters more?" });
    }
    if (shoutWords(t).length >= 2 || /!{2,}/.test(t)) out.push({ id: "shout", s: "warn", t: "Shouting", d: "ALL CAPS and “!!!” don’t make models more careful. State the rule once, calmly, and say why it matters." });
    var negs = (t.match(/\b(don'?t|do not|never|avoid|no)\b/gi) || []).length;
    if (negs >= 3) out.push({ id: "negative", s: "tip", t: "Mostly “don’ts”", d: "You have " + negs + " negative instructions. Say what to do instead; models follow positive instructions more reliably." });
    var seen = {}, dup = null;
    sentences(t).forEach(function (s) { var k = s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); if (k.length > 12) { if (seen[k]) dup = s; seen[k] = true; } });
    if (dup) out.push({ id: "repeat", s: "warn", t: "Repeated sentence", d: "“" + esc(dup.slice(0, 80)) + "” appears more than once." });
    var ph = t.match(/\{\{[^}]*\}\}|\[(?:insert|paste|your|todo|tbd|who|what|how|e\.g\.)[^\]]*\]|\bTODO\b|\bTBD\b|<[A-Z_ ]{3,}>/i);
    if (ph) out.push({ id: "placeholder", s: "warn", t: "Unfilled placeholder", d: "“" + esc(ph[0]) + "” still needs a real value.", q: "Replace “" + ph[0] + "” with the real content." });
    if (t.length > 500 && !/\b(example|e\.g\.|for instance|such as|like this)\b/i.test(t)) out.push({ id: "example", s: "tip", t: "No example", d: "For longer prompts, one short example of a good answer usually beats more description." });
    var order = { warn: 0, tip: 1, pass: 2 };
    return out.sort(function (x, y) { return order[x.s] - order[y.s]; });
  }

  function score(results) {
    var scored = results.filter(function (x) { return x.s !== "tip"; });
    var passed = scored.filter(function (x) { return x.s === "pass"; }).length;
    return { score: scored.length ? Math.round(passed / scored.length * 100) : 0, passed: passed, total: scored.length };
  }

  // Lower-case shouted words and calm repeated exclamation marks.
  function calm(t) {
    return t.replace(/\b[A-Z]{3,}\b/g, function (w) { return ACRONYM.test(w) ? w : w.toLowerCase(); }).replace(/!{2,}/g, ".");
  }

  // Suggest a role that fits the task, so the placeholder is a useful starting point.
  var ROLES = [
    [/\b(code|pull request|pr\b|function|bug|refactor|api|sql|script|repo)/i, "a senior software engineer"],
    [/\b(data|sales|metrics?|numbers|spreadsheet|csv|analy[sz])/i, "a careful data analyst"],
    [/\b(marketing|copy|launch|landing page|ad\b|ads\b|slogan|tagline|brand)/i, "a senior copywriter"],
    [/\b(email|letter|newsletter)/i, "a clear, friendly business writer"],
    [/\b(support|customer|ticket|refund|complaint)/i, "an experienced support lead"],
    [/\b(meeting|notes|transcript|minutes|summari[sz])/i, "an executive assistant who writes crisp summaries"],
    [/\b(message|reply)/i, "a clear, friendly business writer"],
    [/\b(essay|article|blog|post)/i, "an experienced editor"],
    [/\b(legal|contract|policy|terms)/i, "a careful legal analyst (not a lawyer giving advice)"],
    [/\b(teach|explain|learn|beginner|student)/i, "a patient teacher"]
  ];
  function guessRole(t) {
    for (var i = 0; i < ROLES.length; i++) if (ROLES[i][0].test(t)) return "who should answer, e.g. " + ROLES[i][1];
    return "who should answer, e.g. a senior specialist in this topic";
  }

  // Rebuild a prompt into labelled sections, keeping the user's words and
  // adding a bracketed placeholder for anything the checklist found missing.
  function structure(text, extra) {
    var raw = String(text || "").trim();
    if (!raw) return "";
    var tight = window.PromptTightener ? window.PromptTightener.tighten(raw, extra).text : raw;
    if (/^##\s/m.test(raw)) return tight; // already in sections
    tight = calm(tight).replace(/^(hi|hey|hello)[!,.]?\s+(there[!,.]?\s+)?/i, "");
    var res = lint(raw), missing = {};
    res.forEach(function (r) { if (r.s !== "pass") missing[r.id] = r; });
    var role = [], rules = [], task = [];
    sentences(tight).forEach(function (s) {
      if (/^(you are|act as)\b/i.test(s)) role.push(s);
      else if (/\b(must|never|always|do not|don'?t|avoid|only|no more than)\b/i.test(s) && !/^(write|summari[sz]e|analy[sz]e|review|list|explain|create)\b/i.test(s)) rules.push(cap(s.replace(/^and\s+/i, "")));
      else {
        // "Can you look at this?" reads better as a plain instruction.
        var ask = /^(?:can|could|would) you (?:please )?|^please /i;
        task.push(cap(ask.test(s) ? s.replace(ask, "").replace(/\?$/, ".") : s));
      }
    });
    var out = [];
    out.push("## Role\n" + (role.length ? role.join(" ") : "You are [" + guessRole(tight) + "]."));
    out.push("## Task\n" + (task.length ? task.join(" ") : "[What should the model do?]"));
    if (missing.audience && !role.length) out.push("## Audience\n[Who is this for?]");
    if (rules.length) out.push("## Rules\n" + rules.map(function (r) { return "- " + r; }).join("\n"));
    if (missing.format) out.push("## Output format\n[e.g. three bullet points, a table, or JSON with the keys …]");
    if (missing.length) out.push("## Length\n[e.g. under 120 words]");
    var qs = res.filter(function (r) { return r.q && (r.id === "vague" || r.id === "conflict" || r.id === "placeholder" || r.id === "task"); }).map(function (r) { return "- " + r.q; });
    if (qs.length) out.push("## Before you send\n" + qs.join("\n"));
    return out.join("\n\n");
  }

  // Weak prompts that show off the checks. Shared by the homepage demo and the full tool.
  var EXAMPLES = {
    email: "Hi! I would like you to write a welcome email for our new customers. Make sure to mention the free trial and stuff, and it is important that you keep it friendly and good. Thanks in advance!",
    code: "Hey, can you please go ahead and look at this code and basically tell me if there are any issues or things that could be better? It is important that you are really thorough but also keep it brief. Thanks so much!\n\n[paste code here]",
    marketing: "I want you to write some really good marketing copy for our new product launch. Make sure to make it exciting and AMAZING!!! It should be short but also cover all the features and stuff. Don't forget to add a call to action.",
    data: "Could you please analyze the attached sales data and tell me what's interesting? Feel free to include charts or tables or whatever you think is best. Thank you!",
    support: "You are a helpful assistant. You must always be polite. You must never be rude. Do not make things up. Do not share personal information. Do not discuss competitors. Never promise refunds. Please make sure to answer questions about our product.",
    meeting: "Please kindly summarize the following meeting notes for me. It's important to include the important stuff, decisions etc. Also please make sure to list action items. Thanks in advance!\n\n[paste notes here]"
  };

  // One-click fixes for what the checklist found. Each returns the new prompt text.
  function quickFixes(text, extra) {
    var t = String(text || "").trim(), out = [];
    if (!t) return out;
    var res = lint(t), miss = {};
    res.forEach(function (r) { if (r.s !== "pass") miss[r.id] = true; });
    function add(s) { return t.replace(/\s*$/, "") + (/[.!?]$/.test(t) ? " " : ". ") + s; }
    var tight = window.PromptTightener ? window.PromptTightener.tighten(t, extra) : null;
    if (tight && tight.cuts.length) out.push({ group: "Tighten", label: "Remove filler", apply: function () { return tight.text; } });
    if (miss.shout) out.push({ group: "Tone", label: "Calm the caps and “!!!”", apply: function () { return calm(t); } });
    if (miss.audience) {
      var role = guessRole(t).replace(/^.*e\.g\. /, "");
      out.push({ group: "Role", label: "Add role: " + role, apply: function () { return "You are " + role + ". " + t; } });
    }
    if (miss.format) {
      out.push({ group: "Format", label: "Bullet points", apply: function () { return add("Answer as bullet points."); } });
      out.push({ group: "Format", label: "Table", apply: function () { return add("Answer as a Markdown table."); } });
      out.push({ group: "Format", label: "JSON", apply: function () { return add("Return only valid JSON."); } });
    }
    if (miss.length) {
      out.push({ group: "Length", label: "Under 100 words", apply: function () { return add("Keep it under 100 words."); } });
      out.push({ group: "Length", label: "At most 5 bullets", apply: function () { return add("Use at most five bullet points."); } });
    }
    return out;
  }

  window.PromptLint = { lint: lint, score: score, structure: structure, quickFixes: quickFixes, calm: calm, examples: EXAMPLES, escapeHtml: esc };
})();
