/**
 * Swarm Rebuild & Multiplayer Figma Ambient Cursor Flock
 * PhiQuiz Neo-Brutalism Edition
 */
(function() {
  'use strict';

  if (window.__swarmRebuild && window.__swarmRebuild._loaded) return;

  const FIGMA_COLORS = [
    '#F24E1E', '#A259FF', '#1ABCFE', '#0ACF83',
    '#FF7262', '#FFC700', '#9747FF', '#E8467C',
    '#14AE5C', '#0D99FF', '#FF8A00', '#00B5CE'
  ];

  const FIGMA_NAMES = [
    'Ada', 'Linus', 'Grace', 'Alan', 'Margaret',
    'Ken', 'Barbara', 'Dennis', 'Radia', 'Guido',
    'Frances', 'Bjarne', 'Hedy', 'Tim', 'Katherine',
    'Edsger', 'Leslie', 'Donald', 'Vint', 'Brendan'
  ];

  const ARROW_D = 'M4.6 3.9 C4.2 3.1 4.9 2.4 5.7 2.8 L20.6 9.4 C21.5 9.8 21.4 11.1 20.4 11.3 L13.9 12.9 C13.4 13 13 13.4 12.9 13.9 L11.3 20.4 C11.1 21.4 9.8 21.5 9.4 20.6 Z';

  let container = null;
  let flockContainer = null;
  let agents = [];
  let isAmbient = false;
  let rafId = null;
  let lastTime = performance.now();
  let viewportW = window.innerWidth;
  let viewportH = window.innerHeight;
  let mouseX = viewportW / 2;
  let mouseY = viewportH / 2;
  let mouseActive = false;
  let mouseTimer = null;
  const reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const FLOCK_AGENTS = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? 10 : 14;

  function prefersReducedMotion() {
    return !!(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function isSmallViewport() {
    return viewportW <= 767;
  }

  function createCursorSvg(color) {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="overflow:visible;">
      <path d="${ARROW_D}" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round" />
    </svg>`;
  }

  function initContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'phiquiz-swarm-container';
      container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99998;overflow:hidden;opacity:0;transition:opacity .45s ease;';
      document.body.appendChild(container);
    }
    if (!flockContainer) {
      flockContainer = document.createElement('div');
      flockContainer.id = 'phiquiz-flock-agents';
      flockContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
      container.appendChild(flockContainer);
    }
  }

  class Agent {
    constructor(id) {
      this.id = id;
      this.name = FIGMA_NAMES[id % FIGMA_NAMES.length];
      this.color = FIGMA_COLORS[id % FIGMA_COLORS.length];
      this.isFast = Math.random() < 0.25;
      this.speed = this.isFast ? (1000 + Math.random() * 500) : (350 + Math.random() * 400);
      this.force = this.isFast ? (3500 + Math.random() * 2500) : (700 + Math.random() * 1100);
      this.spin = this.isFast ? (2.2 + Math.random() * 1.2) : (0.8 + Math.random() * 1.0);
      this.curl = (Math.random() - 0.5) * 2;
      this.orbitR = 70 + Math.random() * 100;
      this.angle = Math.random() * Math.PI * 2;

      // Position start offscreen
      const side = id % 2 === 0 ? -40 - Math.random() * 160 : viewportW + 40 + Math.random() * 160;
      this.x = side;
      this.y = Math.random() * viewportH;
      this.vx = (Math.random() - 0.5) * 200;
      this.vy = (Math.random() - 0.5) * 200;

      this.el = document.createElement('div');
      this.el.className = 'phiquiz-figma-cursor';
      this.el.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;will-change:transform;display:flex;flex-direction:column;align-items:flex-start;';
      this.el.innerHTML = createCursorSvg(this.color);
      flockContainer.appendChild(this.el);
    }

    update(dt, targetX, targetY, t) {
      // Orbit dynamic radius: R = 135 * (1 + 0.18 * sin(0.55 * t))
      const dynamicR = (135 * (1 + 0.18 * Math.sin(0.55 * t))) + (this.orbitR - 120);
      const orbitTargetX = targetX + Math.cos(t * this.spin * 0.5 + this.id) * dynamicR;
      const orbitTargetY = targetY + Math.sin(t * this.spin * 0.5 + this.id) * dynamicR;

      // Steering towards orbit target
      const dx = orbitTargetX - this.x;
      const dy = orbitTargetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      let ax = (dx / dist) * this.force;
      let ay = (dy / dist) * this.force;

      // Swirl force
      const swirlDir = Math.sin(t * 0.2) > 0 ? 1 : -1;
      ax += -dy * this.spin * swirlDir * 1.5;
      ay += dx * this.spin * swirlDir * 1.5;

      // User mouse repel zone (radius 56px)
      if (mouseActive) {
        const mx = this.x - mouseX;
        const my = this.y - mouseY;
        const mdist = Math.sqrt(mx * mx + my * my);
        if (mdist < 56 && mdist > 0) {
          const rep = (56 - mdist) * 120;
          ax += (mx / mdist) * rep;
          ay += (my / mdist) * rep;
        }
      }

      // Update velocity & clamp to max speed
      this.vx += ax * dt;
      this.vy += ay * dt;
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
      if (currentSpeed > this.speed) {
        this.vx = (this.vx / currentSpeed) * this.speed;
        this.vy = (this.vy / currentSpeed) * this.speed;
      }

      // Damping
      this.vx *= 0.96;
      this.vy *= 0.96;

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Rotate towards flight direction
      const angleDeg = (Math.atan2(this.vy, this.vx) * 180 / Math.PI) - 45;
      this.el.style.transform = `translate3d(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px, 0) rotate(${(angleDeg * 0.25).toFixed(1)}deg)`;
    }
  }

  function tick(now) {
    if (!isAmbient || document.hidden || prefersReducedMotion() || isSmallViewport()) {
      rafId = null;
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const t = now / 1000;

    let targetX = mouseX;
    let targetY = mouseY;
    if (!mouseActive) {
      targetX = (viewportW / 2) + Math.sin(t * 0.6) * 180;
      targetY = (viewportH / 2) + Math.cos(t * 0.45) * 110;
    }

    for (let i = 0; i < agents.length; i++) {
      agents[i].update(dt, targetX, targetY, t);
    }

    rafId = requestAnimationFrame(tick);
  }

  function startAmbient() {
    if (prefersReducedMotion() || isSmallViewport()) return;
    initContainer();
    isAmbient = true;
    if (agents.length === 0) {
      for (let i = 0; i < FLOCK_AGENTS; i++) {
        agents.push(new Agent(i));
      }
    }
    requestAnimationFrame(() => {
      if (container && isAmbient) container.style.opacity = '1';
    });
    if (!rafId && !document.hidden) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  }

  function stopAmbient(hide) {
    isAmbient = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (hide && container) {
      container.style.opacity = '0';
    }
  }

  function startWithoutModal(onComplete) {
    const staleCard = document.getElementById('phiquiz-intro-card');
    if (staleCard) staleCard.remove();
    startAmbient();
    window.dispatchEvent(new CustomEvent('phiquiz:swarm-complete'));
    window.dispatchEvent(new CustomEvent('phiquiz:swarm-finished'));
    if (typeof onComplete === 'function') onComplete();
  }

  window.addEventListener('resize', function() {
    viewportW = window.innerWidth;
    viewportH = window.innerHeight;
    if (isSmallViewport() && isAmbient) {
      stopAmbient(true);
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (isAmbient && !rafId && !prefersReducedMotion() && !isSmallViewport()) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  });

  if (reducedMotionQuery && typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', function(e) {
      if (e.matches) stopAmbient(true);
    });
  }

  // Mouse move listener
  window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => { mouseActive = false; }, 3000);
  }, { passive: true });

  // Public API
  window.__swarmRebuild = {
    _loaded: true,
    start: function(onDone) { startWithoutModal(onDone); },
    stop: function(hide) { stopAmbient(hide); },
    setAmbient: function(v) { if (v) startAmbient(); else stopAmbient(true); },
    app: { active: true }
  };

  console.log('[PhiQuiz] Lightweight Ambient Cursor Flock Ready.');
})();
