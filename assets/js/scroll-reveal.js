document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('reveal-visible');
          }, idx * 60); // 60ms staggered architecture load execution
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });
    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('reveal-visible'));
  }
});
