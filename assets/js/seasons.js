// Seasonal adornments for the homepage: a light canvas layer that changes with the calendar.
//   Autumn (Sep 22 – Nov 30): falling leaves; bats join from Oct 15 to Nov 1.
//   Winter (Dec 1 – Mar 19): snowflakes; holiday lights along the header Dec 10 – Jan 1.
//   Spring (Mar 20 – Jun 20): drifting petals.
//   Summer (Jun 21 – Sep 21): fireflies that drift toward the pointer.
// Interaction: moving the pointer stirs a breeze; tapping a leaf, flake, petal, bat or firefly catches it.
// Never runs with reduced motion, can be turned off (remembered), pauses in a hidden tab,
// and never takes clicks from links, buttons, or form fields.
// Preview another season with ?season=autumn|halloween|winter|holiday|spring|summer|off
(function () {
  "use strict";
  var root = document.documentElement;
  var toggle = document.getElementById("season-toggle");
  var label = toggle && toggle.querySelector(".season-label");
  var tally = document.getElementById("season-tally");
  if (!toggle || !window.requestAnimationFrame) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce && reduce.matches) return;

  // ---- Which season ----
  function seasonFor(d) {
    var m = d.getMonth() + 1, day = d.getDate(), md = m * 100 + day;
    var s = { name: "winter", extra: null };
    if (md >= 320 && md <= 620) s.name = "spring";
    else if (md >= 621 && md <= 921) s.name = "summer";
    else if (md >= 922 && md <= 1130) s.name = "autumn";
    if (md >= 1015 && md <= 1101) s.extra = "halloween";
    if (md >= 1210 || md <= 101) s.extra = "holiday";
    return s;
  }
  var season = seasonFor(new Date());
  var forced = null;
  try { forced = new URLSearchParams(location.search).get("season"); } catch (e) { /* old browser */ }
  if (forced === "halloween") season = { name: "autumn", extra: "halloween" };
  else if (forced === "holiday") season = { name: "winter", extra: "holiday" };
  else if (/^(autumn|winter|spring|summer)$/.test(forced || "")) season = { name: forced, extra: null };

  var NAMES = {
    autumn: { off: "Hide the falling leaves", on: "Bring back the falling leaves", thing: ["leaf", "leaves"] },
    winter: { off: "Hide the snow", on: "Let it snow", thing: ["snowflake", "snowflakes"] },
    spring: { off: "Hide the petals", on: "Bring back the petals", thing: ["petal", "petals"] },
    summer: { off: "Hide the fireflies", on: "Bring back the fireflies", thing: ["firefly", "fireflies"] }
  };
  var names = NAMES[season.name];
  if (season.extra === "halloween") names = { off: "Hide the leaves and bats", on: "Bring back the leaves and bats", thing: ["leaf", "leaves"] };
  root.setAttribute("data-season", season.name);
  if (season.extra) root.setAttribute("data-season-extra", season.extra);

  // ---- Canvas ----
  var canvas = document.createElement("canvas");
  canvas.className = "season-layer";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  function dark() { return root.getAttribute("data-theme") === "dark"; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }

  var PALETTES = {
    autumn: { light: ["#c2410c", "#b45309", "#a16207", "#9a3412", "#b91c1c", "#78350f"], dark: ["#fb923c", "#f59e0b", "#facc15", "#f97316", "#ef4444", "#d97706"] },
    spring: { light: ["#f9a8d4", "#f472b6", "#fbcfe8", "#fda4af"], dark: ["#f9a8d4", "#fbcfe8", "#fecdd3", "#f0abfc"] },
    winter: { light: ["#94a3b8", "#7c93b8", "#a5b4cc"], dark: ["#e2e8f0", "#cbd5e1", "#f1f5f9"] },
    summer: { light: ["#ca8a04", "#a16207"], dark: ["#fde047", "#bef264"] }
  };

  // ---- Particles ----
  var parts = [], bats = [], bursts = [];
  var pointer = { x: -999, y: -999, vx: 0, vy: 0, t: 0, inside: false };
  var wind = 0, windTarget = 0, caught = 0;

  function target() {
    var area = W * H;
    var base = season.name === "summer" ? 16 : season.name === "winter" ? 46 : 22;
    return Math.max(8, Math.min(base, Math.round(base * area / (1280 * 800))));
  }

  function spawn(initial) {
    var pal = PALETTES[season.name][dark() ? "dark" : "light"];
    var p = {
      x: rand(-20, W + 20), y: initial ? rand(-H, H) : rand(-60, -10),
      vx: 0, vy: 0, rot: rand(0, Math.PI * 2), vr: rand(-0.03, 0.03),
      phase: rand(0, Math.PI * 2), color: pick(pal), alpha: 0, life: 1
    };
    if (season.name === "autumn") { p.size = rand(9, 17); p.fall = rand(0.5, 1.1); p.sway = rand(0.6, 1.6); p.kind = Math.random() < 0.5 ? "oak" : "simple"; }
    else if (season.name === "spring") { p.size = rand(5, 9); p.fall = rand(0.35, 0.8); p.sway = rand(0.8, 1.8); }
    else if (season.name === "winter") { p.size = rand(2, 6.5); p.fall = rand(0.3, 1) * (p.size / 4); p.sway = rand(0.3, 0.9); p.arms = p.size > 4.5; }
    else { p.size = rand(1.6, 2.8); p.x = rand(0, W); p.y = rand(H * 0.25, H); p.vx = rand(-0.3, 0.3); p.vy = rand(-0.3, 0.3); p.blink = rand(0.004, 0.012); }
    return p;
  }

  function spawnBat() {
    var fromLeft = Math.random() < 0.5;
    return { x: fromLeft ? -40 : W + 40, y: rand(70, Math.min(H * 0.45, 360)), dir: fromLeft ? 1 : -1,
      speed: rand(1.4, 2.4), flap: rand(0, 6), size: rand(10, 16), bob: rand(0, 6), alpha: 1 };
  }

  // ---- Drawing ----
  function drawLeaf(p) {
    var s = p.size;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    if (p.kind === "oak") {
      ctx.moveTo(0, -s);
      for (var i = 0; i < 3; i++) {
        var y = -s + (i + 0.5) * (2 * s / 3.4);
        ctx.quadraticCurveTo(s * 0.9, y - s * 0.15, s * 0.45, y + s * 0.18);
      }
      ctx.quadraticCurveTo(s * 0.3, s * 0.85, 0, s);
      ctx.quadraticCurveTo(-s * 0.3, s * 0.85, -s * 0.45, s * 0.42);
      for (var j = 2; j >= 0; j--) {
        var y2 = -s + (j + 0.5) * (2 * s / 3.4);
        ctx.quadraticCurveTo(-s * 0.9, y2 - s * 0.15, -s * 0.45, y2 - s * 0.35);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.6, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.6, s * 0.6, -s * 0.8, -s * 0.5, 0, -s);
    }
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.85); ctx.lineTo(0, s * 1.25); ctx.stroke();
  }
  function drawPetal(p) {
    var s = p.size;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s, -s * 0.6, s * 0.7, s * 0.8, 0, s);
    ctx.bezierCurveTo(-s * 0.7, s * 0.8, -s, -s * 0.6, -s * 0.15, -s * 0.75);
    ctx.lineTo(0, -s * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  function drawFlake(p) {
    ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
    if (!p.arms) { ctx.beginPath(); ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2); ctx.fill(); return; }
    ctx.lineWidth = 1.1; ctx.lineCap = "round";
    for (var i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, p.size);
      ctx.moveTo(0, p.size * 0.55); ctx.lineTo(p.size * 0.3, p.size * 0.8);
      ctx.moveTo(0, p.size * 0.55); ctx.lineTo(-p.size * 0.3, p.size * 0.8);
      ctx.stroke();
    }
  }
  function drawFirefly(p, t) {
    var glow = 0.35 + 0.65 * Math.max(0, Math.sin(p.phase + t * p.blink * 60));
    var r = p.size * (3 + glow * 4);
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, p.color); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha *= glow;
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 1.6);
    ctx.fillStyle = dark() ? "#fffbe6" : "#713f12";
    ctx.beginPath(); ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2); ctx.fill();
  }
  function drawBat(b) {
    var s = b.size, f = Math.sin(b.flap) * 0.9;
    ctx.save();
    ctx.translate(b.x, b.y + Math.sin(b.bob) * 6);
    ctx.scale(b.dir, 1);
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = dark() ? "#e5e7eb" : "#1f2937";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-s * 0.6, -s * (0.2 + f), -s * 1.6, -s * f);
    ctx.quadraticCurveTo(-s * 1.2, s * 0.15, -s * 1.1, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.7, s * 0.1, -s * 0.45, s * 0.35);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.15, 0, s * 0.3);
    ctx.quadraticCurveTo(s * 0.2, s * 0.15, s * 0.45, s * 0.35);
    ctx.quadraticCurveTo(s * 0.7, s * 0.1, s * 1.1, s * 0.3);
    ctx.quadraticCurveTo(s * 1.2, s * 0.15, s * 1.6, -s * f);
    ctx.quadraticCurveTo(s * 0.6, -s * (0.2 + f), 0, 0);
    ctx.fill();
    ctx.beginPath(); ctx.arc(0, s * 0.05, s * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.12); ctx.lineTo(-s * 0.12, -s * 0.42); ctx.lineTo(-s * 0.02, -s * 0.15);
    ctx.moveTo(s * 0.2, -s * 0.12); ctx.lineTo(s * 0.12, -s * 0.42); ctx.lineTo(s * 0.02, -s * 0.15); ctx.fill();
    ctx.restore();
  }
  function drawBurst(b) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, b.life);
    ctx.fillStyle = b.color;
    for (var i = 0; i < b.bits.length; i++) {
      var q = b.bits[i];
      ctx.beginPath(); ctx.arc(b.x + q.x, b.y + q.y, q.r, 0, Math.PI * 2); ctx.fill();
    }
    if (b.text) {
      ctx.globalAlpha = Math.max(0, Math.min(1, b.life * 1.4));
      ctx.font = "600 13px " + (getComputedStyle(root).getPropertyValue("--mono") || "monospace");
      ctx.textAlign = "center";
      ctx.fillStyle = dark() ? "#edece9" : "#16171b";
      ctx.fillText(b.text, b.x, b.y - 18 - (1 - b.life) * 22);
    }
    ctx.restore();
  }
  function burst(x, y, color, text) {
    var bits = [];
    for (var i = 0; i < 9; i++) bits.push({ x: 0, y: 0, vx: rand(-2.2, 2.2), vy: rand(-2.6, 0.8), r: rand(1.2, 2.6) });
    bursts.push({ x: x, y: y, color: color, bits: bits, life: 1, text: text });
  }

  // ---- Loop ----
  var running = false, raf = 0, last = 0, t = 0, batTimer = rand(60, 240);

  function step(now) {
    raf = requestAnimationFrame(step);
    var dt = Math.min(3, (now - (last || now)) / 16.67); last = now; t += dt / 60;
    ctx.clearRect(0, 0, W, H);

    // Wind eases toward a target; pointer movement adds gusts.
    if (Math.random() < 0.004 * dt) windTarget = rand(-0.6, 0.9);
    wind += (windTarget - wind) * 0.01 * dt;
    pointer.vx *= Math.pow(0.9, dt); pointer.vy *= Math.pow(0.9, dt);

    var want = target();
    while (parts.length < want) parts.push(spawn(parts.length < want && t < 0.1));
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      var dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
      if (season.name === "summer") {
        // Fireflies wander and drift gently toward the pointer, then scatter if it moves fast.
        p.vx += rand(-0.04, 0.04) * dt; p.vy += rand(-0.04, 0.04) * dt;
        if (pointer.inside && d2 < 220 * 220) {
          var sp = Math.abs(pointer.vx) + Math.abs(pointer.vy);
          var k = sp > 12 ? -0.06 : 0.012;
          p.vx -= dx * k * 0.02 * dt; p.vy -= dy * k * 0.02 * dt;
        }
        p.vx *= Math.pow(0.97, dt); p.vy *= Math.pow(0.97, dt);
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < H * 0.1) p.vy += 0.05 * dt; if (p.y > H + 20) p.y = H * 0.4;
      } else {
        // Falling things: gravity, sway, wind, and a push away from a moving pointer.
        if (pointer.inside && d2 < 120 * 120) {
          var f = (1 - Math.sqrt(d2) / 120) * 0.08 * dt;
          p.vx += pointer.vx * f + dx * 0.0015 * dt; p.vy += pointer.vy * f * 0.6;
        }
        p.vx *= Math.pow(0.96, dt); p.vy *= Math.pow(0.96, dt);
        p.phase += 0.02 * dt;
        p.x += (Math.sin(p.phase) * p.sway + wind + p.vx) * dt;
        p.y += (p.fall + p.vy) * dt;
        p.rot += (p.vr + Math.cos(p.phase) * 0.01) * dt;
        if (p.y > H + 30 || p.x < -60 || p.x > W + 60) { parts.splice(i, 1); continue; }
      }
      p.alpha = Math.min(1, p.alpha + 0.02 * dt);
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha * (season.name === "winter" ? 0.85 : 0.8);
      if (season.name === "autumn") drawLeaf(p);
      else if (season.name === "spring") drawPetal(p);
      else if (season.name === "winter") drawFlake(p);
      else drawFirefly(p, t);
      ctx.restore();
    }

    if (season.extra === "halloween") {
      batTimer -= dt;
      if (batTimer <= 0 && bats.length < 3) { bats.push(spawnBat()); batTimer = rand(180, 520); }
      for (var b = bats.length - 1; b >= 0; b--) {
        var bt = bats[b];
        bt.x += bt.speed * bt.dir * dt; bt.flap += 0.32 * dt; bt.bob += 0.05 * dt;
        if (bt.x < -60 || bt.x > W + 60) { bats.splice(b, 1); continue; }
        drawBat(bt);
      }
    }

    for (var q = bursts.length - 1; q >= 0; q--) {
      var br = bursts[q];
      br.life -= 0.025 * dt;
      for (var n = 0; n < br.bits.length; n++) { var it = br.bits[n]; it.x += it.vx * dt; it.y += it.vy * dt; it.vy += 0.12 * dt; }
      if (br.life <= 0) bursts.splice(q, 1); else drawBurst(br);
    }
  }

  function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(step); }
  function stop() { running = false; cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); }

  // ---- Interaction ----
  window.addEventListener("pointermove", function (e) {
    var now = performance.now();
    if (pointer.t && now - pointer.t < 80) {
      pointer.vx = (pointer.vx + (e.clientX - pointer.x) * 0.5) / 2;
      pointer.vy = (pointer.vy + (e.clientY - pointer.y) * 0.5) / 2;
    }
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = now; pointer.inside = true;
  }, { passive: true });
  document.addEventListener("pointerleave", function () { pointer.inside = false; });

  var INTERACTIVE = "a, button, input, textarea, select, label, summary, [contenteditable], [role='button'], [tabindex]:not([tabindex='-1'])";
  document.addEventListener("pointerdown", function (e) {
    if (!running || root.classList.contains("season-off")) return;
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    if (window.getSelection && String(window.getSelection())) return;
    var x = e.clientX, y = e.clientY, best = -1, bestD = 34 * 34;
    for (var i = 0; i < parts.length; i++) {
      var dx = parts[i].x - x, dy = parts[i].y - y, d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = i; }
    }
    for (var b = 0; b < bats.length; b++) {
      var bt = bats[b], bx = bt.x - x, by = bt.y - y, bd = bx * bx + by * by;
      if (bd < 40 * 40) {
        bats.splice(b, 1);
        burst(x, y, dark() ? "#c4b5fd" : "#6b21a8", "boo!");
        count();
        return;
      }
    }
    if (best >= 0) {
      var p = parts.splice(best, 1)[0];
      burst(p.x, p.y, p.color, "+1");
      count();
    }
  });

  function count() {
    caught++;
    if (!tally) return;
    tally.hidden = false;
    var noun = names.thing[caught === 1 ? 0 : 1];
    tally.textContent = caught + " " + noun + " caught";
  }

  // ---- On/off switch, remembered ----
  function set(on, save) {
    root.classList.toggle("season-off", !on);
    toggle.setAttribute("aria-pressed", on ? "false" : "true");
    label.textContent = on ? names.off : names.on;
    if (save) { try { localStorage.setItem("season", on ? "on" : "off"); } catch (e) { /* storage blocked */ } }
    if (on && !document.hidden) start(); else stop();
    if (!on) { parts = []; bats = []; bursts = []; }
  }
  var saved = null;
  try { saved = localStorage.getItem("season"); } catch (e) { /* storage blocked */ }
  toggle.hidden = false;
  toggle.addEventListener("click", function () { set(root.classList.contains("season-off"), true); });
  set(forced === "off" ? false : saved !== "off", false);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else if (!root.classList.contains("season-off")) start();
  });
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 120); }, { passive: true });
  if (reduce && reduce.addEventListener) reduce.addEventListener("change", function (e) { if (e.matches) { stop(); canvas.remove(); toggle.hidden = true; } });
})();
