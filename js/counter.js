function animateCount(el) {
  const target = parseFloat(el.dataset.countTo || '0');
  const suffix = el.dataset.countSuffix || '';
  const duration = 2000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    el.textContent = `${target}${suffix}`;
    return;
  }

  const start = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = target * easeOut(progress);
    const display = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);
    el.textContent = `${display}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
});
