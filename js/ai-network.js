function initAiNetwork() {
  const canvas = document.querySelector('[data-ai-network]');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let width, height, nodes, animationId;

  const NODE_COUNT_BASE = 60;
  const LINK_DISTANCE = 140;

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

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          const opacity = 1 - dist / LINK_DISTANCE;
          ctx.strokeStyle = `rgba(124, 58, 237, ${opacity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    animationId = requestAnimationFrame(step);
  }

  resize();
  createNodes();

  if (reduceMotion) {
    drawStatic();
  } else {
    step();
  }

  window.addEventListener('resize', () => {
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    createNodes();
    reduceMotion ? drawStatic() : step();
  });
}

document.addEventListener('DOMContentLoaded', initAiNetwork);
