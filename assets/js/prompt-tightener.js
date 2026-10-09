/* Removes filler phrases from a prompt. Shared by the homepage demo and
   tools/prompt-matrix-evaluator.html. No dependencies. */
(function () {
  "use strict";

  // Phrases that add words without changing what is being asked.
  // Each entry: [pattern, replacement]. Replacements keep the meaning intact.
  var FILLER = [
    [/^(?:hi|hey|hello)(?: there)?[!,.]*\s+(?=\w)/gim, ""],
    [/(?<=^|[.!?] |^(?:hi|hey|hello)(?: there)?[!,.]* )(?:could|can|would|will) you (?:please |kindly )?(?=\w)/gim, ""],
    [/\bi (?:would like|want|need) you to\s+/gi, ""],
    [/\bi(?:'d| would) like (?:for )?you to\s+/gi, ""],
    [/\b(?:please )?make sure (?:to|that you)\s+/gi, ""],
    [/\b(?:please )?be sure to\s+/gi, ""],
    [/\b(?:don'?t|do not) forget to\s+/gi, ""],
    [/\bfeel free to\s+/gi, ""],
    [/\bgo ahead and\s+/gi, ""],
    [/\bit(?:'s| is) (?:very |really )?important that you(?:'re| are)\s+/gi, "be "],
    [/\bit(?:'s| is) (?:very |really )?important (?:that you|to)\s+/gi, ""],
    [/\bit(?:'s| is) (?:very |really )?important that\s+/gi, ""],
    [/\bin a (?:detailed|thorough) manner\b/gi, "in detail"],
    [/\bcompletely detailed\b/gi, "detailed"],
    [/\b(?:basically|essentially),?\s+(?=\w)/gi, ""],
    [/\bif possible,?\s*/gi, ""],
    [/\bthank you(?: so much| very much| in advance)?[.!]?\s*/gi, ""],
    [/\bthanks(?: so much| a lot| in advance)?[.!]?\s*/gi, ""],
    [/\bplease,?\s+/gi, ""],
    [/\bkindly\s+/gi, ""]
  ];

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Find every filler match in the original, without overlaps, in order.
  function findCuts(raw, extra) {
    var cuts = [];
    var rules = FILLER.slice();
    (extra || []).forEach(function (phrase) {
      phrase = String(phrase).trim();
      if (phrase) rules.push([new RegExp("\\b" + escapeRe(phrase) + "\\b[,]?\\s*", "gi"), ""]);
    });
    rules.forEach(function (pair) {
      var re = new RegExp(pair[0].source, pair[0].flags);
      var m;
      while ((m = re.exec(raw)) !== null) {
        if (!m[0]) { re.lastIndex++; continue; }
        cuts.push({ start: m.index, end: m.index + m[0].length, text: m[0], replace: pair[1] });
      }
    });
    cuts.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
    var kept = [], lastEnd = -1;
    cuts.forEach(function (c) { if (c.start >= lastEnd) { kept.push(c); lastEnd = c.end; } });
    return kept;
  }

  function tidy(text) {
    return text
      .replace(/[ \t]{2,}/g, " ")
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/([.!?])(\s+\.)+/g, "$1")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/,\s*([.!?])/g, "$1")
      .trim();
  }

  // True when the text so far ends a sentence: it's empty, the trailing
  // whitespace contains a newline, or the last non-space character is . ! or ?
  // Checks only the last WINDOW characters, so cost doesn't grow with input size.
  var WINDOW = 64;
  function endsAtSentenceStart(tail, full) {
    var i = tail.length, newline = false;
    while (i > 0 && /\s/.test(tail.charAt(i - 1))) {
      if (tail.charAt(i - 1) === "\n") newline = true;
      i--;
    }
    // The whitespace reaches past the window: look at the whole text instead.
    if (i === 0 && tail.length === WINDOW) return endsAtSentenceStart(full(), function () { return ""; });
    if (i === 0 || newline) return true;
    return /[.!?]/.test(tail.charAt(i - 1));
  }

  // Returns { cuts, html, text }: html marks each cut with <mark class="cut">.
  // `extra` is an optional list of the visitor's own phrases to remove.
  function tighten(raw, extra) {
    var cuts = findCuts(raw, extra);
    var html = "", pos = 0, tight = "", tail = "", capNext = false;
    // Appends to the output and keeps the last WINDOW characters in `tail`.
    function append(text) {
      tight += text;
      tail = (tail + text).slice(-WINDOW);
    }
    function addKept(segment) {
      if (capNext && /\S/.test(segment)) {
        segment = segment.replace(/^(\s*)([a-z])/, function (_, sp, ch) { return sp + ch.toUpperCase(); });
        capNext = false;
      }
      append(segment);
    }
    cuts.forEach(function (c) {
      var keptBefore = raw.slice(pos, c.start);
      html += escapeHtml(keptBefore) + '<mark class="cut">' + escapeHtml(c.text) + "</mark>";
      addKept(keptBefore);
      // A cut at the start of a sentence leaves the next word lowercase; fix that.
      var atSentenceStart = endsAtSentenceStart(tail, function () { return tight; });
      var rep = c.replace;
      if (atSentenceStart && rep) rep = rep.charAt(0).toUpperCase() + rep.slice(1);
      append(rep);
      capNext = atSentenceStart && !rep;
      pos = c.end;
    });
    html += escapeHtml(raw.slice(pos));
    addKept(raw.slice(pos));
    return { cuts: cuts, html: html, text: tidy(tight) };
  }

  window.PromptTightener = { tighten: tighten, escapeHtml: escapeHtml };
})();
