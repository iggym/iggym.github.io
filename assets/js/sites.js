/* Content sites page. Enhancements only: the page reads and works without it,
   and motion is skipped when the visitor prefers less. */
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

  /* ---------- Reveal each card as it comes into view ---------- */
  (function () {
    if (reduced || !("IntersectionObserver" in window)) return;
    var targets = document.querySelectorAll(".site-card, .sites-note");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger by position within its row, so a grid arrives as a wave.
        var row = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = Math.min(row, 3) * 70 + "ms";
        el.classList.add("in");
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ""; }, 700);
      });
    }, { rootMargin: "0px 0px -4% 0px", threshold: 0 });
    targets.forEach(function (el) {
      // Anything already on screen shows immediately; only content below the
      // fold animates, so nothing flashes on a slow connection.
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add("reveal");
      io.observe(el);
    });
  })();
})();
