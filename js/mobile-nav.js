function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };

  const open = () => {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? close() : open();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  const desktopQuery = window.matchMedia('(min-width: 1200px)');
  desktopQuery.addEventListener('change', (e) => {
    if (e.matches) close();
  });
}

document.addEventListener('DOMContentLoaded', initMobileNav);
