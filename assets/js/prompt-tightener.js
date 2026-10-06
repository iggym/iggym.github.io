/* Removes filler phrases from a prompt. Shared by the homepage demo and
   tools/prompt-matrix-evaluator.html. No dependencies. */
(function () {
  "use strict";

  // Phrases that add words without changing what is being asked.
  // Each entry: [pattern, replacement]. Replacements keep the meaning intact.
  var FILLER = [
    [/(?<=^|[.!?] )(?:could|can|would|will) you (?:please |kindly )?(?=\w)/gim, ""],
    [/\bi (?:would like|want|need) you to\s+/gi, ""],
    [/\bi(?:'d| would) like (?:for )?you to\s+/gi, ""],
    [/\b(?:please )?make sure (?:to|that you)\s+/gi, ""],
    [/\b(?:please )?be sure to\s+/gi, ""],
    [/\b(?:don'?t|do not) forget to\s+/gi, ""],
    [/\bfeel free to\s+/gi, ""],
    [/\bgo ahead and\s+/gi, ""],
    [/\bit(?:'s| is) (?:very |really )?important (?:that you|to)\s+/gi, ""],
    [/\bit(?:'s| is) (?:very |really )?important that\s+/gi, ""],
    [/\bin a (?:detailed|thorough) manner\b/gi, "in detail"],
    [/\bcompletely detailed\b/gi, "detailed"],
    [/\b(?:basically|essentially),?\s+(?=\w)/gi, ""],
    [/\bif possible,?\s*/gi, ""],
    [/\bthank you(?: so much| in advance)?[.!]?\s*/gi, ""],
    [/\bthanks(?: in advance)?[.!]?\s*/gi, ""],
    [/\bplease,?\s+/gi, ""],
    [/\bkindly\s+/gi, ""]
  ];

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Find every filler match in the original, without overlaps, in order.
  function findCuts(raw) {
    var cuts = [];
    FILLER.forEach(function (pair) {
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
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/,\s*([.!?])/g, "$1")
      .trim();
  }

  // Returns { cuts, html, text }: html marks each cut with <mark class="cut">.
  function tighten(raw) {
    var cuts = findCuts(raw);
    var html = "", pos = 0, tight = "", capNext = false;
    function addKept(segment) {
      if (capNext && /\S/.test(segment)) {
        segment = segment.replace(/^(\s*)([a-z])/, function (_, sp, ch) { return sp + ch.toUpperCase(); });
        capNext = false;
      }
      tight += segment;
    }
    cuts.forEach(function (c) {
      var keptBefore = raw.slice(pos, c.start);
      html += escapeHtml(keptBefore) + '<mark class="cut">' + escapeHtml(c.text) + "</mark>";
      addKept(keptBefore);
      // A cut at the start of a sentence leaves the next word lowercase; fix that.
      var atSentenceStart = /(^|[.!?]\s*|\n\s*)$/.test(tight);
      tight += c.replace;
      capNext = atSentenceStart && !c.replace;
      pos = c.end;
    });
    html += escapeHtml(raw.slice(pos));
    addKept(raw.slice(pos));
    return { cuts: cuts, html: html, text: tidy(tight) };
  }

  window.PromptTightener = { tighten: tighten, escapeHtml: escapeHtml };
})();
