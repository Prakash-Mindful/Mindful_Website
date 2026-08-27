/**
 * hero-animations.js
 * Full animation stack for the hero section:
 * 1. Text cascade (badge → headline → subtext → buttons)
 * 2. Typewriter headline (already handled by typewriter.js, integrated here)
 * 3. Emblem glow pulse (CSS-driven, trigger class added here)
 * 4. Floating particles (canvas overlay)
 * 5. Neural network lines (canvas — top-right corner)
 * 6. Gradient light sweep (CSS class trigger)
 * 7. Orbit ring (CSS-driven SVG overlay)
 * 8. Button ripple on click
 */

import { gsap } from 'gsap';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────
   1. TEXT CASCADE — badge → headline → subtext → buttons
   Each element slides in from right, staggered
───────────────────────────────────────────── */
function initTextCascade() {
  const targets = [
    document.querySelector('.hero__badge'),
    document.querySelector('.hero__headline'),
    document.querySelector('.hero__subtext'),
    document.querySelector('.hero__actions'),
  ].filter(Boolean);

  if (!targets.length) return;

  if (reduceMotion) {
    gsap.set(targets, { opacity: 1, x: 0 });
    return;
  }

  gsap.set(targets, { opacity: 0, x: 48 });
  gsap.to(targets, {
    opacity: 1,
    x: 0,
    duration: 0.85,
    ease: 'power3.out',
    stagger: 0.18,
    delay: 0.3,
  });
}

/* ─────────────────────────────────────────────
   3. EMBLEM GLOW PULSE
   Adds animated glow overlay behind the 3D emblem
   (left side of the hero background image)
───────────────────────────────────────────── */
function initEmblemGlow() {
  const hero = document.querySelector('.hero');
  if (!hero || reduceMotion) return;

  const glow = document.createElement('div');
  glow.className = 'hero__emblem-glow';
  glow.setAttribute('aria-hidden', 'true');
  hero.appendChild(glow);
}

/* ─────────────────────────────────────────────
   4. FLOATING PARTICLES — drifting data points
───────────────────────────────────────────── */
function initFloatingParticles() {
  const hero = document.querySelector('.hero');
  if (!hero || reduceMotion) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__particles';
  canvas.setAttribute('aria-hidden', 'true');
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;

  const resize = () => {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  };

  const createParticle = () => ({
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 40,
    r: Math.random() * 1.8 + 0.4,
    speed: Math.random() * 0.6 + 0.2,
    opacity: Math.random() * 0.5 + 0.15,
    drift: (Math.random() - 0.5) * 0.3,
    color: Math.random() > 0.6 ? '125,211,252' : '147,197,253', // cyan / light blue
  });

  const initParticles = () => {
    particles = Array.from({ length: 80 }, createParticle);
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
      ctx.fill();

      p.y -= p.speed;
      p.x += p.drift;
      p.opacity -= 0.0008;

      if (p.y < -10 || p.opacity <= 0) {
        Object.assign(p, createParticle());
      }
    });
    raf = requestAnimationFrame(draw);
  };

  resize();
  initParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });
}

/* ─────────────────────────────────────────────
   5. NEURAL NETWORK LINES — top-right corner
   Draws animated connection lines between nodes
───────────────────────────────────────────── */
function initNeuralLines() {
  const hero = document.querySelector('.hero');
  if (!hero || reduceMotion) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__neural';
  canvas.setAttribute('aria-hidden', 'true');
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Fixed node positions relative to top-right area (matching the bg image)
  const baseNodes = [
    { rx: 0.82, ry: 0.04 },
    { rx: 0.88, ry: 0.09 },
    { rx: 0.94, ry: 0.06 },
    { rx: 0.98, ry: 0.13 },
    { rx: 0.90, ry: 0.16 },
    { rx: 0.85, ry: 0.21 },
    { rx: 0.96, ry: 0.22 },
    { rx: 0.79, ry: 0.12 },
    { rx: 0.75, ry: 0.18 },
    { rx: 0.92, ry: 0.28 },
  ];

  let nodes = [];
  let lines = [];
  let animPhase = 0;

  const resize = () => {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    nodes = baseNodes.map((n) => ({
      x: n.rx * canvas.width,
      y: n.ry * canvas.height,
      pulse: Math.random() * Math.PI * 2,
    }));
    // Build connections (pairs within distance threshold)
    lines = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < canvas.width * 0.22) {
          lines.push({ a: i, b: j, progress: Math.random(), speed: 0.002 + Math.random() * 0.003 });
        }
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animPhase += 0.012;

    // Draw animated lines
    lines.forEach((line) => {
      line.progress = (line.progress + line.speed) % 1;
      const na = nodes[line.a];
      const nb = nodes[line.b];

      // Static dim line
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = 'rgba(125,211,252,0.12)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Travelling light dot along the line
      const tx = na.x + (nb.x - na.x) * line.progress;
      const ty = na.y + (nb.y - na.y) * line.progress;
      const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, 6);
      grad.addColorStop(0, 'rgba(125,211,252,0.9)');
      grad.addColorStop(1, 'rgba(125,211,252,0)');
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Draw pulsing nodes
    nodes.forEach((node) => {
      node.pulse += 0.04;
      const scale = 1 + Math.sin(node.pulse) * 0.4;
      const r = 3 * scale;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(125,211,252,0.9)';
      ctx.fill();

      // Outer glow ring
      const glow = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r * 4);
      glow.addColorStop(0, 'rgba(125,211,252,0.25)');
      glow.addColorStop(1, 'rgba(125,211,252,0)');
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize);
}

/* ─────────────────────────────────────────────
   6. GRADIENT LIGHT SWEEP
   Diagonal sheen passes across hero every 7s
   (CSS animation, just trigger the element)
───────────────────────────────────────────── */
function initLightSweep() {
  const hero = document.querySelector('.hero');
  if (!hero || reduceMotion) return;

  const sweep = document.createElement('div');
  sweep.className = 'hero__sweep';
  sweep.setAttribute('aria-hidden', 'true');
  hero.appendChild(sweep);
}

/* ─────────────────────────────────────────────
   7. ORBIT RING — SVG arc rotating around emblem
───────────────────────────────────────────── */
function initOrbitRing() {
  const hero = document.querySelector('.hero');
  if (!hero || reduceMotion) return;

  const ring = document.createElement('div');
  ring.className = 'hero__orbit';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = `
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(125,211,252,0)" />
          <stop offset="50%" stop-color="rgba(125,211,252,0.8)" />
          <stop offset="100%" stop-color="rgba(125,211,252,0)" />
        </linearGradient>
      </defs>
      <!-- Outer orbit ring -->
      <circle cx="200" cy="200" r="175"
        fill="none"
        stroke="rgba(125,211,252,0.08)"
        stroke-width="1.5"
        stroke-dasharray="8 6" />
      <!-- Animated arc -->
      <circle cx="200" cy="200" r="175"
        fill="none"
        stroke="url(#orbitGrad)"
        stroke-width="2"
        stroke-dasharray="120 980"
        stroke-linecap="round"
        class="orbit__arc" />
      <!-- Orbiting dot -->
      <circle cx="375" cy="200" r="5" fill="rgba(125,211,252,0.9)" class="orbit__dot">
        <animateTransform attributeName="transform" type="rotate"
          from="0 200 200" to="360 200 200" dur="12s" repeatCount="indefinite"/>
      </circle>
      <!-- Inner orbit ring -->
      <circle cx="200" cy="200" r="140"
        fill="none"
        stroke="rgba(125,211,252,0.05)"
        stroke-width="1"
        stroke-dasharray="4 8" />
    </svg>
  `;
  hero.appendChild(ring);
}

/* ─────────────────────────────────────────────
   8. BUTTON RIPPLE ON CLICK
───────────────────────────────────────────── */
function initButtonRipple() {
  document.querySelectorAll('.btn--hero-primary, .btn--hero-secondary').forEach((btn) => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.cssText = `left:${x}px;top:${y}px`;
      btn.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ─────────────────────────────────────────────
   INIT ALL
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTextCascade();
  initEmblemGlow();
  initFloatingParticles();
  initNeuralLines();
  initLightSweep();
  initOrbitRing();
  initButtonRipple();
});
