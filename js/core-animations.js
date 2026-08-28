/**
 * core-animations.js
 * Powers all animations for the "AI Automation Core" section:
 * 1. Aurora background (animated radial blobs on canvas)
 * 2. Connection lines between cards (neural network)
 * 3. Cursor-follow glow
 * 4. Per-card accent CSS variables (from data-accent)
 * 5. SVG icon draw-in on scroll entry
 * 6. Alternating left/right reveal
 * 7. Scan-line + hover neon glow (CSS-driven, triggered here)
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ─────────────────────────────────────────────
   1. AURORA BACKGROUND
   Soft glowing radial blobs drift slowly across the canvas
───────────────────────────────────────────── */
function initAurora() {
  const canvas = document.querySelector('.core-aurora');
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext('2d');

  const blobs = [
    { x: 0.15, y: 0.3,  r: 0.35, color: '#22d3ee', speed: { x: 0.00015, y: 0.0001  }, t: 0 },
    { x: 0.75, y: 0.6,  r: 0.3,  color: '#a78bfa', speed: { x: -0.0001, y: 0.00012 }, t: 2 },
    { x: 0.5,  y: 0.85, r: 0.25, color: '#34d399', speed: { x: 0.00012, y: -0.0001 }, t: 4 },
  ];

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    blobs.forEach((b) => {
      b.t += 0.008;
      const cx = (b.x + Math.sin(b.t * 0.7) * 0.12) * canvas.width;
      const cy = (b.y + Math.cos(b.t * 0.5) * 0.1) * canvas.height;
      const r  = b.r * Math.min(canvas.width, canvas.height);

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   hexToRgba(b.color, 0.18));
      grad.addColorStop(0.5, hexToRgba(b.color, 0.07));
      grad.addColorStop(1,   hexToRgba(b.color, 0));

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize);
}

/* ─────────────────────────────────────────────
   2. CONNECTION LINES (Neural Network between cards)
───────────────────────────────────────────── */
function initConnectionLines() {
  const canvas = document.querySelector('.core-connections');
  const section = document.querySelector('.core-section');
  if (!canvas || !section || reduceMotion) return;

  const ctx = canvas.getContext('2d');
  let cards = [];
  let animPhase = 0;
  let travellingDots = [];

  const resize = () => {
    canvas.width  = section.offsetWidth;
    canvas.height = section.offsetHeight;
    updateCardPositions();
  };

  const updateCardPositions = () => {
    const sectionRect = section.getBoundingClientRect();
    const scrollY = window.scrollY;
    cards = Array.from(document.querySelectorAll('.core-card')).map((card) => {
      const r = card.getBoundingClientRect();
      return {
        x: r.left - sectionRect.left + r.width  / 2,
        y: r.top  + scrollY - (sectionRect.top + scrollY) + r.height / 2,
        accent: card.dataset.accent || '#22d3ee',
      };
    });

    // Refresh travelling dots when card positions update
    travellingDots = buildDots();
  };

  const buildDots = () => {
    const dots = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const dx = cards[i].x - cards[j].x;
        const dy = cards[i].y - cards[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 380) {
          dots.push({
            a: i, b: j,
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.003,
            color: cards[i].accent,
          });
        }
      }
    }
    return dots;
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animPhase += 0.01;

    if (!cards.length) { requestAnimationFrame(draw); return; }

    // Draw dim static lines
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const dx = cards[i].x - cards[j].x;
        const dy = cards[i].y - cards[j].y;
        if (Math.sqrt(dx * dx + dy * dy) > 380) continue;

        ctx.beginPath();
        ctx.moveTo(cards[i].x, cards[i].y);
        ctx.lineTo(cards[j].x, cards[j].y);
        ctx.strokeStyle = 'rgba(34,211,238,0.07)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw travelling dots along lines
    travellingDots.forEach((dot) => {
      dot.progress = (dot.progress + dot.speed) % 1;
      const a = cards[dot.a], b = cards[dot.b];
      if (!a || !b) return;

      const tx = a.x + (b.x - a.x) * dot.progress;
      const ty = a.y + (b.y - a.y) * dot.progress;

      const grd = ctx.createRadialGradient(tx, ty, 0, tx, ty, 8);
      grd.addColorStop(0, hexToRgba(dot.color, 0.85));
      grd.addColorStop(1, hexToRgba(dot.color, 0));
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  // Delay initial position reading until layout is settled
  setTimeout(() => {
    resize();
    draw();
  }, 500);

  window.addEventListener('resize', () => setTimeout(resize, 200));
  window.addEventListener('scroll', () => setTimeout(updateCardPositions, 100), { passive: true });
}

/* ─────────────────────────────────────────────
   3. CURSOR-FOLLOW GLOW
───────────────────────────────────────────── */
function initCursorGlow() {
  const section = document.querySelector('.core-section');
  const glow    = document.querySelector('.core-cursor-glow');
  if (!section || !glow || reduceMotion) return;

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.left = `${x}px`;
    glow.style.top  = `${y}px`;
  });
}

/* ─────────────────────────────────────────────
   4. PER-CARD ACCENT CSS VARIABLES
   Read data-accent, set --core-accent / --core-accent-soft on each card
───────────────────────────────────────────── */
function initCardAccents() {
  document.querySelectorAll('.core-card').forEach((card) => {
    const accent = card.dataset.accent || '#22d3ee';
    card.style.setProperty('--core-accent', accent);
    card.style.setProperty('--core-accent-soft', hexToRgba(accent, 0.12));
  });
}

/* ─────────────────────────────────────────────
   5. SVG ICON DRAW-IN ON SCROLL ENTRY
   Adds .icon-drawn class when card enters viewport — triggers CSS transition
───────────────────────────────────────────── */
function initIconDraw() {
  if (reduceMotion) {
    document.querySelectorAll('.core-card').forEach((c) => c.classList.add('icon-drawn'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.coreIndex || 0);
          setTimeout(() => entry.target.classList.add('icon-drawn'), idx * 120);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  document.querySelectorAll('.core-card').forEach((card) => observer.observe(card));
}

/* ─────────────────────────────────────────────
   6. ALTERNATING LEFT / RIGHT REVEAL
   Odd cards come from left, even from right — handled via GSAP
   (adds classes before GSAP batch processes them)
───────────────────────────────────────────── */
function initAlternatingReveal() {
  document.querySelectorAll('.core-card.reveal').forEach((card, i) => {
    card.classList.add(i % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right');
  });
}

/* ─────────────────────────────────────────────
   INIT ALL
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCardAccents();       // Must be first — sets CSS vars
  initAlternatingReveal(); // Must be before GSAP processes .reveal
  initAurora();
  initConnectionLines();
  initCursorGlow();
  initIconDraw();
});
