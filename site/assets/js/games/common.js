/* Shared helpers for the arcade games: a frame loop, a keyboard/touch input
   layer, a pause overlay and high-score storage. */
(function () {
  const SS = (window.SS = window.SS || {});

  /* ---------- frame loop ---------- */
  SS.createLoop = function (step) {
    let raf = 0;
    let last = 0;
    let running = false;

    function frame(now) {
      const dt = Math.min(now - last, 100);
      last = now;
      step(dt);
      raf = requestAnimationFrame(frame);
    }

    return {
      start() {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      },
      stop() {
        running = false;
        cancelAnimationFrame(raf);
      },
      get running() {
        return running;
      }
    };
  };

  /* ---------- input ---------- */
  const HANDLED = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter',
    'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyP', 'KeyR', 'KeyX', 'KeyZ'];

  SS.createKeys = function () {
    const down = new Set();
    const pressed = new Set();

    function isTypingTarget(target) {
      return target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
    }

    window.addEventListener('keydown', (event) => {
      if (HANDLED.indexOf(event.code) === -1 || isTypingTarget(event.target)) return;
      event.preventDefault();
      if (!down.has(event.code)) pressed.add(event.code);
      down.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      if (HANDLED.indexOf(event.code) === -1) return;
      event.preventDefault();
      down.delete(event.code);
    });

    window.addEventListener('blur', () => down.clear());

    return {
      isDown: (code) => down.has(code),
      anyDown: (...codes) => codes.some((code) => down.has(code)),
      pressed: (code) => pressed.has(code),
      endFrame: () => pressed.clear(),
      hold(code, on) {
        if (on) {
          if (!down.has(code)) pressed.add(code);
          down.add(code);
        } else {
          down.delete(code);
        }
      },
      clear() {
        down.clear();
        pressed.clear();
      }
    };
  };

  /* Wires on-screen pad buttons ([data-key]) into a key state. */
  SS.bindPad = function (keys, root) {
    const scope = root || document;
    scope.querySelectorAll('[data-key]').forEach((button) => {
      const code = button.getAttribute('data-key');
      const press = (event) => {
        event.preventDefault();
        keys.hold(code, true);
      };
      const release = (event) => {
        event.preventDefault();
        keys.hold(code, false);
      };
      button.addEventListener('pointerdown', press);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointerleave', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('contextmenu', (event) => event.preventDefault());
    });
  };

  /* ---------- overlay ---------- */
  SS.createOverlay = function (rootId) {
    const root = document.getElementById(rootId);
    const title = root.querySelector('[data-overlay-title]');
    const text = root.querySelector('[data-overlay-text]');
    const button = root.querySelector('[data-overlay-button]');

    return {
      show(headline, body, actionLabel, onAction) {
        title.textContent = headline;
        text.textContent = body || '';
        if (actionLabel) {
          button.hidden = false;
          button.textContent = actionLabel;
        } else {
          button.hidden = true;
        }
        button.onclick = onAction || null;
        root.classList.add('is-visible');
      },
      hide() {
        root.classList.remove('is-visible');
      }
    };
  };

  /* ---------- high scores ---------- */
  SS.best = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem('supersuite.best.' + key);
        return value === null ? (fallback || 0) : Number(value);
      } catch (err) {
        return fallback || 0;
      }
    },
    set(key, value) {
      try { localStorage.setItem('supersuite.best.' + key, String(value)); } catch (err) { /* ignore */ }
    }
  };
})();
