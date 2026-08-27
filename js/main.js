import './mobile-nav.js';

function initFooterYear() {
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initNavScrollState() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Desktop nav dropdowns (Products/Services) open on :hover for mouse users,
// but touch devices have no hover — a tablet in landscape can be wide enough
// to show the desktop nav with no way to open these via CSS alone. Add an
// explicit tap/click toggle that works alongside the existing hover CSS.
function initNavDropdowns() {
  const dropdowns = document.querySelectorAll('.nav__dropdown');
  if (!dropdowns.length) return;

  const closeAll = (except) => {
    dropdowns.forEach((d) => {
      if (d !== except) d.classList.remove('is-open');
    });
  };

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('button.nav__link');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('is-open');
      closeAll(dropdown);
      dropdown.classList.toggle('is-open', !isOpen);
    });
  });

  document.addEventListener('click', () => closeAll());
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFooterYear();
  initNavScrollState();
  initNavDropdowns();
});
