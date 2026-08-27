import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initReveals() {
  const allReveal = gsap.utils.toArray('.reveal');
  if (!allReveal.length) return;

  if (reduceMotion) {
    gsap.set(allReveal, { opacity: 1, y: 0, rotateX: 0, clearProps: 'transform' });
    return;
  }

  const cardReveal = allReveal.filter(
    (el) => el.classList.contains('card') || el.classList.contains('industry-card')
  );
  const plainReveal = allReveal.filter((el) => !cardReveal.includes(el));

  if (plainReveal.length) {
    gsap.set(plainReveal, { opacity: 0, y: 30 });
    ScrollTrigger.batch(plainReveal, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
          overwrite: true,
        }),
    });
  }

  if (cardReveal.length) {
    gsap.set(cardReveal, {
      opacity: 0,
      y: 30,
      rotateX: -6,
      transformPerspective: 700,
      transformOrigin: '50% 100%',
    });
    ScrollTrigger.batch(cardReveal, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          overwrite: true,
        }),
    });
  }
}

function initHeroIntro() {
  // hero-animations.js handles the full cascade now (slide-in from right)
  // This function is kept for fallback / non-hero pages
  const hero = document.querySelector('.hero');
  if (!hero) return;
}

// Parallax removed — hero now uses a background image, not a canvas
function initHeroParallax() {}


function initTimelineScrub() {
  const track = document.querySelector('[data-timeline-track]');
  const fill = document.querySelector('[data-timeline-fill]');
  if (!track || !fill) return;

  if (reduceMotion) {
    gsap.set(fill, { scaleY: 1 });
    return;
  }

  gsap.set(fill, { scaleY: 0, transformOrigin: 'top center' });
  gsap.to(fill, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: track,
      start: 'top 75%',
      end: 'bottom 60%',
      scrub: 0.3,
    },
  });
}

function initCounters() {
  const counters = gsap.utils.toArray('[data-count-to]');
  if (!counters.length) return;

  counters.forEach((el) => {
    const target = parseFloat(el.dataset.countTo || '0');
    const suffix = el.dataset.countSuffix || '';
    const isInt = Number.isInteger(target);

    if (reduceMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power3.out',
          onUpdate: () => {
            const display = isInt ? Math.round(obj.val) : obj.val.toFixed(1);
            el.textContent = `${display}${suffix}`;
          },
        });
      },
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroIntro();
  initHeroParallax();
  initTimelineScrub();
  initCounters();
  initReveals();

  // Web fonts (Poppins etc.) can finish loading after ScrollTrigger has
  // already measured layout, shifting every trigger position below the
  // hero. Re-measure once fonts are actually in place.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
});
