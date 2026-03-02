/* ============================================================
   JONAS · Portfolio — physics.js
   Playful floating Bauhaus shapes — Matter.js 0.19
   ============================================================ */

(function () {
  'use strict';

  const canvas  = document.getElementById('skills-canvas');
  const section = document.getElementById('skills-physics');
  if (!canvas || !section || typeof Matter === 'undefined') return;

  /* ── Shape definitions — Bauhaus palette ─────────────────── */
  const SHAPES = [
    { shape: 'square',  s: 110,          fill: '#A83830' },
    { shape: 'triangle',r: 78,           fill: '#B89830' },
    { shape: 'circle',  r: 90,           fill: '#3A6FAE' },
    { shape: 'hexagon', r: 66,           fill: '#3A7055' },
    { shape: 'rect',    w: 160, h: 200,   fill: '#6A4A9A' },
  ];

  /* ── Matter.js ───────────────────────────────────────────── */
  const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter;

  // Start with normal gravity — shapes fall down on load
  const engine = Engine.create({ gravity: { y: 1.0 } });
  Runner.run(Runner.create(), engine);

  /* ── Canvas ──────────────────────────────────────────────── */
  let W = section.clientWidth;
  let H = section.clientHeight;
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');

  /* ── Container bounds (mirrors .container in CSS) ───────── */
  // --max-w: 1200px  --gutter: clamp(1.5rem, 5vw, 5rem)
  function containerBounds() {
    const gutter  = Math.min(80, Math.max(24, W * 0.05));
    const innerW  = Math.min(W, W);
    const offsetX = (W - innerW) / 2;
    return { left: offsetX + gutter, right: W - offsetX - gutter };
  }

  /* ── Walls (ceiling + sides aligned to container + floor) ── */
  const WALL = { isStatic: true, restitution: 0.55, friction: 0.05 };
  let wLeft, wRight;

  function buildWalls() {
    const b = containerBounds();
    wLeft  = Bodies.rectangle(b.left  - 25, H / 2, 50, H * 3, WALL);
    wRight = Bodies.rectangle(b.right + 25, H / 2, 50, H * 3, WALL);
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, -25,    W + 200, 50, WALL),  // ceiling
      Bodies.rectangle(W / 2, H + 25, W + 200, 50, WALL),  // floor
      wLeft,
      wRight,
    ]);
  }

  buildWalls();

  /* ── Body factory ────────────────────────────────────────── */
  const BASE = {
    restitution: 0.55,
    friction:    0.05,
    frictionAir: 0.03,
    density:     0.04,
  };

  function makeBody(def, i) {
    // Spawn in upper half — shapes fall down on load
    const x = 60 + Math.random() * Math.max(20, W - 120);
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

    body.__fill  = def.fill;
    body.__bdr   = def.bdr;
    body.__isCircle = !!def.r && def.shape === 'circle';

    // Slight random nudge so shapes spread as they rise
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 1 });
    Body.setAngle(body, Math.random() * Math.PI * 2);

    return body;
  }

  Composite.add(engine.world, SHAPES.map(makeBody));

  /* ── Mouse / touch ───────────────────────────────────────── */
  const mouse = Mouse.create(canvas);
  canvas.removeEventListener('mousewheel',     mouse.mousewheel);
  canvas.removeEventListener('DOMMouseScroll', mouse.mousewheel);

  Composite.add(engine.world, MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.15, damping: 0.1, render: { visible: false } },
  }));

  /* ── Scroll → gravity ───────────────────────────────────── */
  // Matches starting engine gravity — shapes fall down
  let gravityTarget = 1.0;
  let lastScrollY   = window.scrollY;
  let scrollTimer   = null;

  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    // Scroll down → reverse gravity (float up); scroll up → normal (fall down)
    gravityTarget = delta > 0 ? -1.5 : 1.5;

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { gravityTarget = 1.0; }, 300);
  }, { passive: true });

  /* ── Render loop ─────────────────────────────────────────── */
  function drawBody(b) {
    ctx.fillStyle   = b.__fill;
    ctx.strokeStyle = b.__bdr;
    ctx.lineWidth   = 1.5;

    if (b.__isCircle) {
      ctx.beginPath();
      ctx.arc(b.position.x, b.position.y, b.circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      const v = b.vertices;
      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      for (let j = 1; j < v.length; j++) ctx.lineTo(v[j].x, v[j].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  function frame() {
    // Smoothly lerp gravity toward the scroll-driven target
    engine.gravity.y += (gravityTarget - engine.gravity.y) * 0.05;

    ctx.clearRect(0, 0, W, H);
    Composite.allBodies(engine.world).forEach(b => {
      if (b.__fill) drawBody(b);
    });
    requestAnimationFrame(frame);
  }

  frame();

  /* ── Resize ──────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    W = section.clientWidth;
    H = section.clientHeight;
    canvas.width  = W;
    canvas.height = H;
    const b = containerBounds();
    Body.setPosition(wLeft,  { x: b.left  - 25, y: H / 2 });
    Body.setPosition(wRight, { x: b.right + 25, y: H / 2 });
  }, { passive: true });

})();
