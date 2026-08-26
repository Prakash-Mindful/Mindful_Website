function initAiNetwork() {
  const canvas = document.querySelector('[data-ai-network]');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let width, height, nodes, animationId;

  const LINK_DISTANCE = 140;
  const REPEL_RADIUS = 150;
  const REPEL_STRENGTH = 26;

  const pointer = { x: null, y: null, active: false };

  function resize() {
    width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function createNodes() {
    const area = canvas.offsetWidth * canvas.offsetHeight;
    const count = Math.min(120, Math.max(30, Math.round(area / 18000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 1,
    }));
  }

  function drawStatic() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function repelOffset(n) {
    if (!pointer.active) return { x: 0, y: 0, illum: 0 };
    const dx = n.x - pointer.x;
    const dy = n.y - pointer.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
    if (dist > REPEL_RADIUS) return { x: 0, y: 0, illum: 0 };
    const falloff = 1 - dist / REPEL_RADIUS;
    const force = falloff * falloff * REPEL_STRENGTH;
    return { x: (dx / dist) * force, y: (dy / dist) * force, illum: falloff };
  }

  function step() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });

    if (pointer.active) {
      const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, REPEL_RADIUS + 60);
      glow.addColorStop(0, 'rgba(0, 212, 255, 0.07)');
      glow.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }

    const rendered = nodes.map((n) => {
      const off = repelOffset(n);
      return { x: n.x + off.x, y: n.y + off.y, r: n.r, illum: off.illum };
    });

    for (let i = 0; i < rendered.length; i += 1) {
      for (let j = i + 1; j < rendered.length; j += 1) {
        const a = rendered[i];
        const b = rendered[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          const base = 1 - dist / LINK_DISTANCE;
          const boost = 1 + Math.max(a.illum, b.illum) * 1.4;
          ctx.strokeStyle = `rgba(124, 58, 237, ${Math.min(base * 0.35 * boost, 0.8)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    rendered.forEach((n) => {
      const alpha = Math.min(0.6 + n.illum * 0.4, 1);
      ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + n.illum * 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    animationId = requestAnimationFrame(step);
  }

  function updatePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = clientX - rect.left;
    pointer.y = clientY - rect.top;
    pointer.active = true;
  }

  resize();
  createNodes();

  if (reduceMotion) {
    drawStatic();
  } else {
    step();
    const pointerZone = canvas.closest('.hero') || canvas;
    pointerZone.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
    pointerZone.addEventListener('mouseleave', () => { pointer.active = false; });
  }

  window.addEventListener('resize', () => {
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    createNodes();
    reduceMotion ? drawStatic() : step();
  });
}

document.addEventListener('DOMContentLoaded', initAiNetwork);
