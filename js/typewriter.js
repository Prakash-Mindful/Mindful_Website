function typewrite(el) {
  const text = el.dataset.typewriter || el.textContent;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typewriter__cursor';
  cursor.setAttribute('aria-hidden', 'true');

  if (reduceMotion) {
    el.textContent = text;
    el.appendChild(cursor);
    return;
  }

  el.setAttribute('aria-label', text);
  let i = 0;
  const speed = Math.max(20, 2800 / text.length);

  const tick = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      el.appendChild(cursor);
      i += 1;
      setTimeout(tick, speed);
    }
  };
  tick();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-typewriter]').forEach(typewrite);
});
