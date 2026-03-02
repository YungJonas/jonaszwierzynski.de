/* ============================================================
   JONAS · Portfolio — nav-canvas.js
   Mini physics scene in sidebar — fades in when main canvas exits view
   ============================================================ */

(function () {
  'use strict';

  const navCanvas   = document.getElementById('nav-canvas');
  const nav         = document.getElementById('nav');
  const mainSection = document.getElementById('skills-physics');
  if (!navCanvas || !nav || !mainSection || typeof Matter === 'undefined') return;

  /* ── Shape definitions — Bauhaus palette, ~0.4× scale ──── */
  const SHAPES = [
    { shape: 'square',   s: 44,              fill: '#A83830' },
    { shape: 'triangle', r: 31,              fill: '#B89830' },
    { shape: 'circle',   r: 36,              fill: '#3A6FAE' },
    { shape: 'hexagon',  r: 26,              fill: '#3A7055' },
    { shape: 'rect',     w: 64,   h: 80,     fill: '#6A4A9A' },
  ];

  /* ── Matter.js ───────────────────────────────────────────── */
  const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter;

  const engine = Engine.create({ gravity: { y: 1.0 } });
  Runner.run(Runner.create(), engine);

  /* ── Canvas ──────────────────────────────────────────────── */
  let W = navCanvas.offsetWidth;
  let H = navCanvas.offsetHeight;
  navCanvas.width  = W;
  navCanvas.height = H;

  const ctx = navCanvas.getContext('2d');

  /* ── Walls ───────────────────────────────────────────────── */
  const WALL = { isStatic: true, restitution: 0.55, friction: 0.05 };

  let wLeft  = Bodies.rectangle(-25,     H / 2, 50, H * 3, WALL);
  let wRight = Bodies.rectangle(W + 25,  H / 2, 50, H * 3, WALL);
  let wFloor   = Bodies.rectangle(W / 2, H + 25, W + 100, 50, WALL);
  let wCeiling = Bodies.rectangle(W / 2, -25,    W + 100, 50, WALL);

  Composite.add(engine.world, [wCeiling, wFloor, wLeft, wRight]);

  /* ── Body factory ────────────────────────────────────────── */
  const BASE = {
    restitution: 0.55,
    friction:    0.05,
    frictionAir: 0.03,
    density:     0.04,
  };

  function makeBody(def) {
    const x = 10 + Math.random() * Math.max(10, W - 20);
    const y = H * 0.05 + Math.random() * (H * 0.45);

    let body;

    switch (def.shape) {
      case 'circle':
        body = Bodies.circle(x, y, def.r, BASE);
        break;
      case 'triangle':
        body = Bodies.polygon(x, y, 3, def.r, { ...BASE, chamfer: { radius: 0 } });
        break;
      case 'square':
        body = Bodies.rectangle(x, y, def.s, def.s, { ...BASE, chamfer: { radius: 0 } });
        break;
      case 'hexagon':
        body = Bodies.polygon(x, y, 6, def.r, { ...BASE, chamfer: { radius: 0 } });
        break;
      case 'rect':
      default:
        body = Bodies.rectangle(x, y, def.w, def.h, { ...BASE, chamfer: { radius: 0 } });
        break;
    }

    body.__fill     = def.fill;
    body.__isCircle = def.shape === 'circle';

    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 1 });
    Body.setAngle(body, Math.random() * Math.PI * 2);

    return body;
  }

  Composite.add(engine.world, SHAPES.map(makeBody));

  /* ── Mouse / touch ───────────────────────────────────────── */
  const mouse = Mouse.create(navCanvas);
  navCanvas.removeEventListener('mousewheel',     mouse.mousewheel);
  navCanvas.removeEventListener('DOMMouseScroll', mouse.mousewheel);

  Composite.add(engine.world, MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.15, damping: 0.1, render: { visible: false } },
  }));

  /* ── Scroll → gravity ────────────────────────────────────── */
  let gravityTarget = 1.0;
  let lastScrollY   = window.scrollY;
  let scrollTimer   = null;

  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    gravityTarget = delta > 0 ? -1.5 : 1.5;

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { gravityTarget = 1.0; }, 300);
  }, { passive: true });

  /* ── Visibility — IntersectionObserver on main section ──── */
  let visible = false;

  new IntersectionObserver((entries) => {
    visible = !entries[0].isIntersecting;
    navCanvas.classList.toggle('is-visible', visible);
    if (!visible) gravityTarget = 1.0; // shapes settle at bottom while hidden
  }, { threshold: 0 }).observe(mainSection);

  /* ── Draw helper ─────────────────────────────────────────── */
  function drawBody(b) {
    ctx.fillStyle = b.__fill;
    ctx.strokeStyle = b.__fill;
    ctx.lineWidth = 1;

    if (b.__isCircle) {
      ctx.beginPath();
      ctx.arc(b.position.x, b.position.y, b.circleRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const v = b.vertices;
      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      for (let j = 1; j < v.length; j++) ctx.lineTo(v[j].x, v[j].y);
      ctx.closePath();
      ctx.fill();
    }
  }

  /* ── Render loop ─────────────────────────────────────────── */
  function frame() {
    engine.gravity.y += (gravityTarget - engine.gravity.y) * 0.05;

    if (visible) {
      ctx.clearRect(0, 0, W, H);
      Composite.allBodies(engine.world).forEach(b => {
        if (b.__fill) drawBody(b);
      });
    }

    requestAnimationFrame(frame);
  }

  frame();

  /* ── Resize ──────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    W = navCanvas.offsetWidth;
    H = navCanvas.offsetHeight;
    navCanvas.width  = W;
    navCanvas.height = H;
    Body.setPosition(wLeft,    { x: -25,     y: H / 2 });
    Body.setPosition(wRight,   { x: W + 25,  y: H / 2 });
    Body.setPosition(wFloor,   { x: W / 2,   y: H + 25 });
    Body.setPosition(wCeiling, { x: W / 2,   y: -25 });
  }, { passive: true });

})();
