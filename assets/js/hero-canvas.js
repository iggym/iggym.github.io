(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.getElementById('hero-canvas').classList.add('hidden');
    document.getElementById('canvas-fallback').classList.remove('hidden');
    return;
  }

  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId;

  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  const particles = [];
  const maxParticles = window.innerWidth < 768 ? 40 : 95;
  const connectionRadius = 120;
  const mouse = { x: null, y: null, radius: 100 };

  window.addEventListener('resize', () => {
    if(!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1.5;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x; const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 2;
          this.y += Math.sin(angle) * force * 2;
        }
      }
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#52525C'; ctx.fill();
    }
  }

  for (let i = 0; i < maxParticles; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(); particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < connectionRadius) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (connectionRadius - dist) / connectionRadius;
          ctx.strokeStyle = `rgba(255, 77, 0, ${alpha * 0.25})`;
          ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
    }
    animationFrameId = requestAnimationFrame(animate);
  }
  animate();
})();
