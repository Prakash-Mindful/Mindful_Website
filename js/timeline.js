function initTimeline() {
  const track = document.querySelector('[data-timeline-track]');
  const fill = document.querySelector('[data-timeline-fill]');
  if (!track || !fill) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    fill.style.height = '100%';
    return;
  }

  function update() {
    const rect = track.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height + viewportH * 0.6;
    const scrolled = Math.min(Math.max(viewportH * 0.8 - rect.top, 0), total);
    const progress = Math.min(scrolled / total, 1);
    fill.style.height = `${progress * 100}%`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

document.addEventListener('DOMContentLoaded', initTimeline);
