/* ============================================================
   JONAS · PORTFOLIO
   main.js — scroll behaviour, animations, mobile menu
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV: scrolled state ──────────────────────────────── */
  const nav = document.getElementById('nav');

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run immediately in case page is pre-scrolled
  }

  /* ── MOBILE MENU ─────────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');

  if (navToggle && navMobile) {
    const openMenu = () => {
      navMobile.classList.add('is-open');
      navToggle.classList.add('is-active');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.textContent = 'Close';
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      navMobile.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = 'Menu';
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', () => {
      navMobile.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    // Close on any link click inside menu
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMobile.classList.contains('is-open')) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  /* ── SCROLL ANIMATIONS ──────────────────────────────── */
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.06,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => {
    animObserver.observe(el);
  });

  /* ── SMOOTH SCROLL for anchor links ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── YEAR in footer ─────────────────────────────────── */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ── TEXT SCRAMBLE on nav links ──────────────────────── */
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const randChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

  function initScramble(el) {
    const original = el.textContent;
    el.style.minWidth = el.offsetWidth + 'px';
    el.style.display  = 'inline-block';

    let raf = null;
    let timeouts = [];

    el.addEventListener('mouseenter', () => {
      cancelAnimationFrame(raf);
      timeouts.forEach(clearTimeout);
      timeouts = [];

      const chars = original.split('');
      const resolved = new Array(chars.length).fill(false);

      chars.forEach((_, i) => {
        const t = setTimeout(() => { resolved[i] = true; }, i * 40);
        timeouts.push(t);
      });

      const tick = () => {
        el.textContent = chars.map((ch, i) => resolved[i] ? ch : randChar()).join('');
        if (!resolved.every(Boolean)) {
          raf = requestAnimationFrame(tick);
        } else {
          el.textContent = original;
        }
      };
      raf = requestAnimationFrame(tick);
    });

    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      timeouts.forEach(clearTimeout);
      timeouts = [];
      el.textContent = original;
    });
  }

  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(initScramble);

  /* ── HERO NAME CYCLE ─────────────────────────────────── 
  (function () {
    const heroEl = document.querySelector('.hero__name');
    if (!heroEl) return;

    const LABELS = ['UI/UX Designer', 'Frontend', 'Figma Nerd', 'Claude Code Enjoyer'];
    let idx = 0;
    let raf = null;
    let timeouts = [];

    function scrambleTo(target) {
      cancelAnimationFrame(raf);
      timeouts.forEach(clearTimeout);
      timeouts = [];

      const len = Math.max(heroEl.textContent.length, target.length);
      const resolved = new Array(len).fill(false);

      for (let i = 0; i < len; i++) {
        const t = setTimeout(() => { resolved[i] = true; }, i * 40);
        timeouts.push(t);
      }

      const tick = () => {
        heroEl.textContent = Array.from({ length: len }, (_, i) => {
          if (resolved[i]) return target[i] ?? '';
          return i < target.length ? randChar() : '';
        }).join('');

        if (!resolved.every(Boolean)) {
          raf = requestAnimationFrame(tick);
        } else {
          heroEl.textContent = target;
        }
      };
      raf = requestAnimationFrame(tick);
    }

    setInterval(() => {
      idx = (idx + 1) % LABELS.length;
      scrambleTo(LABELS[idx]);
    }, 3000);
  }()); */

  
  /* ── PIXEL REVEAL on work images ──────────────────── */
  function runPixelReveal(img) {
    const wrapper = img.parentElement;
    const w = wrapper.offsetWidth;
    const h = wrapper.offsetHeight;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    wrapper.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const off = document.createElement('canvas');
    const BLOCK_START = 24;
    const DURATION = 1000;
    let startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const blockSize = Math.max(1, Math.round(BLOCK_START * (1 - eased)));

      if (blockSize > 1) {
        const tw = Math.max(1, Math.ceil(w / blockSize));
        const th = Math.max(1, Math.ceil(h / blockSize));
        off.width = tw;
        off.height = th;
        off.getContext('2d').drawImage(img, 0, 0, tw, th);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(off, 0, 0, tw, th, 0, 0, w, h);
        requestAnimationFrame(step);
      } else {
        img.style.transition = 'opacity 0.2s';
        img.style.opacity = '1';
        canvas.style.transition = 'opacity 0.2s';
        canvas.style.opacity = '0';
        setTimeout(() => canvas.remove(), 200);
      }
    }

    requestAnimationFrame(step);
  }

  function initPixelReveal() {
    const images = document.querySelectorAll('.work-card__image img');
    if (!images.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const img = entry.target;
        if (img.complete && img.naturalWidth) {
          runPixelReveal(img);
        } else {
          img.addEventListener('load', () => runPixelReveal(img), { once: true });
        }
      });
    }, { threshold: 0.1 });

    images.forEach(img => {
      img.style.opacity = '0';
      observer.observe(img);
    });
  }

  initPixelReveal();

  /* ── BROWSER FRAME auto-scroll ─────────────────────── */
  function initBrowserScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.browser-frame').forEach(frame => {
      const viewport = frame.querySelector('.browser-frame__viewport');
      if (!viewport) return;

      const SPEED  = 24;    // px per second
      const PAUSE  = 1800;  // ms hold at top/bottom
      let hovered  = false;
      let paused   = false;
      let pauseId  = null;
      let lastTs   = null;

      function tick(ts) {
        requestAnimationFrame(tick);
        if (hovered || paused) { lastTs = null; return; }
        if (!lastTs) { lastTs = ts; return; }

        const dt  = ts - lastTs;
        lastTs    = ts;
        const max = viewport.scrollHeight - viewport.clientHeight;
        if (max <= 0) return;

        viewport.scrollTop += (SPEED * dt) / 1000;

        if (viewport.scrollTop >= max) {
          viewport.scrollTop = max;
          paused = true;
          clearTimeout(pauseId);
          pauseId = setTimeout(() => {
            viewport.scrollTop = 0;
            paused = false;
            lastTs = null;
          }, PAUSE);
        }
      }

      frame.addEventListener('mouseenter', () => { hovered = true;  lastTs = null; });
      frame.addEventListener('mouseleave', () => { hovered = false; lastTs = null; });

      setTimeout(() => requestAnimationFrame(tick), 400);
    });
  }

  initBrowserScroll();

  /* ── HERO ROLE BUTTONS ───────────────────────────────── */
  function initRoleButtons() {
    const buttons = document.querySelectorAll('.hero__role-btn');
    const tagline = document.querySelector('.hero__tagline');
    if (!buttons.length || !tagline) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-active')) return;

        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        tagline.style.opacity = '0';
        setTimeout(() => {
          tagline.textContent = btn.dataset.tagline;
          tagline.style.opacity = '1';
        }, 250);
      });
    });
  }

  initRoleButtons();

})();
