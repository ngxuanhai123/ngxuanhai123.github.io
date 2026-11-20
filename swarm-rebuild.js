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
  let isRunningIntro = false;
  let rafId = null;
  let lastTime = performance.now();
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let mouseActive = false;
  let mouseTimer = null;
  const FLOCK_AGENTS = 24; // Smooth 24-36 agents

  function createCursorSvg(color) {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.28));overflow:visible;">
      <path d="${ARROW_D}" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round" />
    </svg>`;
  }

  function initContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'phiquiz-swarm-container';
      container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99998;overflow:hidden;';
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
      const side = id % 2 === 0 ? -40 - Math.random() * 160 : window.innerWidth + 40 + Math.random() * 160;
      this.x = side;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 200;
      this.vy = (Math.random() - 0.5) * 200;

      this.el = document.createElement('div');
      this.el.className = 'phiquiz-figma-cursor';
      this.el.style.cssText = `position:absolute;left:0;top:0;pointer-events:none;will-change:transform;transition:opacity .3s ease;display:flex;flex-direction:column;align-items:flex-start;`;
      this.el.innerHTML = createCursorSvg(this.color);
      flockContainer.appendChild(this.el);
    }

    update(dt, targetX, targetY, t) {
      if (!isAmbient && !isRunningIntro) {
        this.el.style.opacity = '0';
        return;
      }
      this.el.style.opacity = '1';

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

      // User mouse repel zone (radius 48px)
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
      const angleDeg = (Math.atan2(this.vy, this.vx) * 180 / Math.PI) - 45; // Arrow orientation offset
      this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${angleDeg * 0.25}deg)`;
    }
  }

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const t = now / 1000;

    // Target position: real mouse or slow sine Lissajous center motion
    let targetX = mouseX;
    let targetY = mouseY;
    if (!mouseActive) {
      targetX = (window.innerWidth / 2) + Math.sin(t * 0.6) * 180;
      targetY = (window.innerHeight / 2) + Math.cos(t * 0.45) * 110;
    }

    for (let i = 0; i < agents.length; i++) {
      agents[i].update(dt, targetX, targetY, t);
    }

    rafId = requestAnimationFrame(tick);
  }

  function startAmbient() {
    initContainer();
    isAmbient = true;
    if (agents.length === 0) {
      for (let i = 0; i < FLOCK_AGENTS; i++) {
        agents.push(new Agent(i));
      }
    }
    if (!rafId) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  }

  function stopAmbient(hide) {
    isAmbient = false;
    if (hide && agents.length) {
      agents.forEach(a => a.el.style.opacity = '0');
    }
  }

  function startIntro(onComplete) {
    initContainer();
    isRunningIntro = true;
    startAmbient();

    // Rebuild intro overlay card
    const introCard = document.createElement('div');
    introCard.id = 'phiquiz-intro-card';
    introCard.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%, -50%) scale(0.95);
      width:min(360px, calc(100vw - 48px));background:#ffffff;border:2.5px solid #1e1e1e;
      border-radius:25px;box-shadow:6px 6px 0 #1e1e1e;padding:24px 28px;z-index:99999;
      display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;
      opacity:0;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);font-family:'Plus Jakarta Sans',sans-serif;`;

    introCard.innerHTML = `
      <div style="width:48px;height:48px;background:#ffc72e;border:2px solid #1e1e1e;border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:2px 2px 0 #1e1e1e;">
        <span class="msr msr-filled" style="font-size:26px;color:#1e1e1e;">architecture</span>
      </div>
      <div style="font-size:22px;font-weight:800;color:#1e1e1e;letter-spacing:-0.03em;">Dựng Canvas...</div>
      <div style="font-size:12px;font-weight:700;color:#40484f;">Đàn con trỏ Figma đang thiết lập bản vẽ</div>
      <div style="width:100%;height:9px;background:#efeee8;border:2px solid #1e1e1e;border-radius:9999px;overflow:hidden;margin-top:6px;position:relative;">
        <div style="position:absolute;top:0;bottom:0;width:40%;background:#38b6ff;border-radius:9999px;animation:phiquizIndet 1.15s infinite ease-in-out;"></div>
      </div>
      <button id="phiquiz-skip-intro" style="margin-top:8px;background:transparent;border:none;font-size:11px;font-weight:800;color:#707880;cursor:pointer;padding:4px 10px;border-radius:8px;font-family:inherit;">
        Bỏ qua (Esc)
      </button>
    `;

    // Add keyframe style
    if (!document.getElementById('phiquiz-swarm-style')) {
      const st = document.createElement('style');
      st.id = 'phiquiz-swarm-style';
      st.textContent = `
        @keyframes phiquizIndet {
          0% { left: -40%; width: 30%; }
          50% { width: 50%; }
          100% { left: 100%; width: 30%; }
        }
      `;
      document.head.appendChild(st);
    }

    container.appendChild(introCard);
    requestAnimationFrame(() => {
      introCard.style.opacity = '1';
      introCard.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    window.dispatchEvent(new CustomEvent('phiquiz:swarm-covered'));

    function finish() {
      if (!isRunningIntro) return;
      isRunningIntro = false;
      if (introCard && introCard.parentNode) {
        introCard.style.opacity = '0';
        introCard.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => introCard.remove(), 350);
      }
      window.dispatchEvent(new CustomEvent('phiquiz:swarm-complete'));
      window.dispatchEvent(new CustomEvent('phiquiz:swarm-finished'));
      if (typeof onComplete === 'function') onComplete();
    }

    // Escape or Skip button
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', onEsc);
        finish();
      }
    });

    const skipBtn = introCard.querySelector('#phiquiz-skip-intro');
    if (skipBtn) skipBtn.onclick = finish;

    // Auto finish after 1.8s
    setTimeout(finish, 1800);
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
    start: function(onDone) { startIntro(onDone); },
    stop: function(hide) { stopAmbient(hide); },
    setAmbient: function(v) { if (v) startAmbient(); else stopAmbient(true); },
    app: { active: true }
  };

  console.log('[PhiQuiz] Swarm Rebuild & Figma Ambient Cursor Flock Ready.');
})();
