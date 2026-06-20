// Initialize globally scoped intersection management matrix
window.globalRevealObserver = null;

document.addEventListener("DOMContentLoaded", () => {
  if ('IntersectionObserver' in window) {
    window.globalRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // Stagger initialization rules based on intersection timeline
          setTimeout(() => {
            entry.target.classList.add('reveal-visible');
          }, idx * 60); 
          window.globalRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });

    // Initial pass over static HTML components
    document.querySelectorAll('.reveal').forEach(el => window.globalRevealObserver.observe(el));
  } else {
    // Structural fallback configuration for legacy runtimes
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('reveal-visible'));
  }
});
