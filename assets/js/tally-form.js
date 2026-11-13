/* Shows the Tally contact form when assets/js/tally-config.js has a tally.so URL. */
(function () {
  "use strict";
  var raw = (window.IGGY_TALLY_URL || "").trim();
  var slots = document.querySelectorAll("[data-tally-slot]");
  if (!slots.length) return;
  var id = "";
  try {
    var url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "tally.so") return;
    var parts = url.pathname.split("/").filter(Boolean);
    if ((parts[0] === "r" || parts[0] === "embed") && parts[1]) id = parts[1];
  } catch (e) {
    return;
  }
  if (!id) return;
  var src = "https://tally.so/embed/" + encodeURIComponent(id) +
    "?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1";
  slots.forEach(function (slot) {
    slot.hidden = false;
    var frame = slot.querySelector("[data-tally-frame]");
    if (!frame) {
      frame = document.createElement("iframe");
      frame.setAttribute("data-tally-frame", "");
      frame.title = "Contact form";
      slot.appendChild(frame);
    }
    frame.src = src;
    frame.hidden = false;
    var pending = slot.querySelector("[data-tally-pending]");
    if (pending) pending.hidden = true;
  });
})();
