/* =========================================================
   AWM Payment Miniapp — enhance.js
   Boot screen · hints dock · swipe & wheel controls
   (layers on top of app.js; never blocks it)
   ========================================================= */
(function () {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const TOUCH = matchMedia('(hover: none) and (pointer: coarse)').matches;
  const langRu = () => (document.documentElement.lang || 'ru') !== 'en';

  /* ---------------------------------------------------------
     1. BOOT / LOADING SCREEN
     --------------------------------------------------------- */
  function runBoot() {
    const boot = byId('bootScreen');
    if (!boot) return;
    const tipEl = byId('bootTip');
    const prog = boot.querySelector('.br-prog');
    const bar = byId('bootBarFill');

    const TIPS = langRu()
      ? ['Telegram Stars — авто-выдача в любое время, пакеты дешевле $0.015 за звезду',
         'Telegram Premium — 3, 6 или 12 месяцев, авто-оформление по живому курсу',
         'Минт юзернейма — превращаю твой @username в NFT на Fragment, от 7 TON',
         'Повышение ставки — поднимаю видимую ставку твоего NFT-юзернейма на аукционе',
         'Сделка — официальная оплата конкретной сделки в TON с кодом-подтверждением',
         'Товары и услуги — свободная оплата в TON: услуги, возврат долга, донат',
         'Каждой заявке — уникальный код. Чек привязан к коду — сохрани его',
         'Курс TON обновляется каждые 15 секунд — цена видна в USD и TON']
      : ['Telegram Stars — instant auto-delivery, packs cheaper than $0.015 a star',
         'Telegram Premium — 3, 6 or 12 months, auto-issued at the live rate',
         'Username mint — I turn your @username into an NFT on Fragment, from 7 TON',
         'Bid boost — I raise the visible bid on your NFT username auction',
         'Deal — official payment for a specific deal in TON with a confirmation code',
         'Goods & services — free-form TON payment: services, debt return, donation',
         'Every order gets a unique code. The receipt is tied to it — keep it',
         'The TON rate refreshes every 15 seconds — prices in USD and TON'];

    // ── Live boot: cycle through SERVICE descriptions for as long as the site
    // actually loads. The bar tracks real readiness (window load), with a
    // minimum hold so the intro never flashes and a hard cap so it never traps. ──
    const C = 2 * Math.PI * 64;
    if (prog) { prog.style.strokeDasharray = C.toFixed(1); prog.style.strokeDashoffset = C.toFixed(1); }

    const CHAR_MS = 24;             // per-character typing speed
    const TIP_HOLD = 720;           // pause after each tip is fully typed
    const MIN_MS = 2600;            // minimum boot duration
    const MAX_MS = 7000;            // hard cap — never trap the user
    const start = performance.now();
    let raf, closed = false, barP = 0;
    const order = TIPS.map((_, i) => i).sort(() => Math.random() - 0.5);
    let ti = 0, tipStart = start, tip = TIPS[order[0]];
    let pageReady = document.readyState === 'complete';
    if (!pageReady) window.addEventListener('load', () => { pageReady = true; }, { once: true });

    const finish = () => {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      if (bar) bar.style.width = '100%';
      if (prog) prog.style.strokeDashoffset = '0';
      if (tipEl) { tipEl.textContent = tip; tipEl.classList.remove('typing'); }
      boot.classList.add('done');
      document.documentElement.classList.add('booted');
      setTimeout(() => boot.remove(), 700);
    };

    if (tipEl) tipEl.classList.add('typing');
    const tick = (now) => {
      if (closed) return;
      const elapsed = now - start;
      // progress: glide toward 90% while loading; sprint to 100% when ready
      const target = pageReady ? 1 : Math.min(0.9, elapsed / MAX_MS * 1.5);
      barP += (target - barP) * 0.07;
      if (bar) bar.style.width = (barP * 100).toFixed(1) + '%';
      if (prog) prog.style.strokeDashoffset = (C * (1 - barP)).toFixed(1);
      // typing of the current service description
      const tElapsed = now - tipStart;
      const chars = Math.min(tip.length, Math.floor(tElapsed / CHAR_MS));
      if (tipEl) {
        tipEl.textContent = tip.slice(0, chars);
        tipEl.classList.toggle('typing', chars < tip.length);
      }
      const typed = chars >= tip.length;
      const restMs = tElapsed - tip.length * CHAR_MS;
      // close when the page is ready, the minimum has passed and the tip settled
      if ((pageReady && elapsed >= MIN_MS && typed && restMs >= 360) || elapsed >= MAX_MS) { finish(); return; }
      // otherwise rotate to the next service description
      if (typed && restMs >= TIP_HOLD) {
        ti = (ti + 1) % order.length;
        tip = TIPS[order[ti]];
        tipStart = now;
        if (tipEl) {
          tipEl.classList.add('swap');
          setTimeout(() => tipEl && tipEl.classList.remove('swap'), 440);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Safety net — never let the boot screen trap the user.
    setTimeout(() => { if (boot.isConnected) finish(); }, MAX_MS + 600);
  }

  /* ---------------------------------------------------------
     2. HINTS DOCK
     --------------------------------------------------------- */
  function buildHints() {
    const list = byId('hintList');
    const modeEl = byId('hintMode');
    const footEl = byId('hintFoot');
    if (!list) return;
    const ru = langRu();
    if (modeEl) modeEl.textContent = TOUCH ? (ru ? 'Телефон' : 'Phone') : (ru ? 'ПК' : 'Desktop');
    if (footEl) footEl.textContent = ru ? 'Свайпните вправо, чтобы свернуть' : 'Swipe right to collapse';

    const items = TOUCH
      ? [
          { k: ['←', '→'], t: ru ? 'Свайп по экрану — сменить услугу' : 'Swipe the screen — switch service' },
          { k: ['↑', '↓'], t: ru ? 'Свайп по полю суммы — изменить сумму' : 'Swipe on the amount — change it' },
          { k: ['▼'], t: ru ? 'Свайп вниз по окну — закрыть его' : 'Swipe a sheet down — close it' },
          { k: ['＋', '−'], t: ru ? 'Кнопки рядом с суммой — точный шаг' : 'Buttons by the amount — precise step' },
          { k: ['◎'], t: ru ? 'Тап по логотипу сверху — мой Telegram' : 'Tap the logo on top — my Telegram' }
        ]
      : [
          { k: ['Enter'], t: ru ? 'Дальше · открыть корзину · оплатить' : 'Continue · open cart · pay' },
          { k: ['←', '→'], t: ru ? 'Сменить услугу' : 'Switch service' },
          { k: ['↑', '↓'], t: ru ? 'Изменить сумму в активном поле' : 'Change the amount in the active field' },
          { k: ['Wheel'], t: ru ? 'Колесо мыши над суммой — шаг' : 'Mouse wheel over the amount — step' },
          { k: ['Esc'], t: ru ? 'Закрыть открытое окно' : 'Close the open sheet' }
        ];

    list.innerHTML = '';
    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'hint-row';
      const keys = document.createElement('div');
      keys.className = 'hint-keys';
      it.k.forEach(k => {
        const kb = document.createElement('span');
        kb.className = 'hint-kbd' + (k.length > 2 ? ' wide' : '');
        kb.textContent = k;
        keys.appendChild(kb);
      });
      const txt = document.createElement('div');
      txt.className = 'hint-txt';
      txt.textContent = it.t;
      row.appendChild(keys);
      row.appendChild(txt);
      list.appendChild(row);
    });
  }

  function initHintDock() {
    const dock = byId('hintDock');
    const tab = byId('hintTab');
    const panel = byId('hintPanel');
    const grip = byId('hintGrip');
    const closeBtn = byId('hintClose');
    if (!dock || !tab || !panel) return;

    buildHints();

    const TABW = 42;
    let panelLeft = 0;
    // Position the panel + tab. This env honours an inline `left` (with
    // !important) reliably; we own placement here.
    const place = () => {
      const w = Math.min(300, Math.round(window.innerWidth * 0.82));
      panelLeft = window.innerWidth - w;
      panel.style.setProperty('width', w + 'px', 'important');
      panel.style.setProperty('right', 'auto', 'important');
      panel.style.setProperty('left', panelLeft + 'px', 'important');
      positionTab();
    };
    const positionTab = () => {
      const open = !dock.classList.contains('collapsed');
      const left = open ? (panelLeft - TABW + 1) : (window.innerWidth - TABW);
      tab.style.setProperty('left', left + 'px', 'important');
    };
    place();
    window.addEventListener('resize', place);

    const expand = () => {
      dock.classList.remove('collapsed');
      tab.setAttribute('aria-expanded', 'true');
      positionTab();
      if (window.AWM_haptic) window.AWM_haptic('light');
    };
    const collapse = () => {
      dock.classList.add('collapsed');
      tab.setAttribute('aria-expanded', 'false');
      positionTab();
    };
    const toggle = () => dock.classList.contains('collapsed') ? expand() : collapse();
    closeBtn && closeBtn.addEventListener('click', collapse);

    // The "?" tab is the single handle: TAP toggles; DRAG opens/closes live —
    // pulling left opens, pulling right closes, no release needed.
    let sx = 0, sy = 0, pressing = false, moved = false, fired = false;
    const onDown = (e) => {
      const t = e.touches ? e.touches[0] : e;
      sx = t.clientX; sy = t.clientY;
      pressing = true; moved = false; fired = false;
      if (e.cancelable && !e.touches) e.preventDefault();
    };
    const onMove = (e) => {
      if (!pressing || fired) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      if (Math.abs(dx) < 16 || Math.abs(dx) < Math.abs(dy)) return;
      const collapsed = dock.classList.contains('collapsed');
      if (dx < 0 && collapsed) { expand(); fired = true; }
      else if (dx > 0 && !collapsed) { collapse(); fired = true; }
    };
    const onUp = () => {
      if (!pressing) return;
      pressing = false;
      if (!moved && !fired) toggle();
    };
    tab.addEventListener('mousedown', onDown);
    tab.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove', onMove);
    tab.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    tab.addEventListener('touchend', onUp);

    // Secondary: swipe the panel itself to the right to dismiss.
    let psx = 0, psy = 0, ptrack = false;
    const pStart = (e) => { const t = e.touches ? e.touches[0] : e; psx = t.clientX; psy = t.clientY; ptrack = true; };
    const pEnd = (e) => {
      if (!ptrack) return; ptrack = false;
      const t = (e.changedTouches && e.changedTouches[0]) || e;
      const dx = (t.clientX || psx) - psx, dy = (t.clientY || psy) - psy;
      if (dx > 56 && Math.abs(dx) > Math.abs(dy)) collapse();
    };
    [grip, panel].forEach(el => {
      if (!el) return;
      el.addEventListener('touchstart', pStart, { passive: true });
      el.addEventListener('touchend', pEnd, { passive: true });
      el.addEventListener('mousedown', pStart);
      window.addEventListener('mouseup', pEnd);
    });

    // Rebuild on language change (lang buttons toggle .active).
    document.querySelectorAll('.lang-btn').forEach(b =>
      b.addEventListener('click', () => setTimeout(buildHints, 0)));
  }

  /* ---------------------------------------------------------
     3. SWIPE: switch service on the main screen
     --------------------------------------------------------- */
  function initServiceSwipe() {
    const screen = document.querySelector('.screen[data-screen-label="main"]') || document.querySelector('.screen');
    if (!screen || !window.AWM_stepService) return;

    let x0 = 0, y0 = 0, t0 = 0, axis = null, active = false;
    const NOSWIPE = 'input, textarea, .amount-display, .pack-grid, .tier-grid, .comment-mono, a[href]';

    const start = (e) => {
      if (window.AWM_anyOverlayOpen && window.AWM_anyOverlayOpen()) return;
      const t = e.touches[0];
      if (e.target.closest && e.target.closest(NOSWIPE)) { active = false; return; }
      x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); axis = null; active = true;
    };
    const move = (e) => {
      if (!active) return;
      const t = e.touches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      if (!axis && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        axis = Math.abs(dx) > Math.abs(dy) * 1.3 ? 'x' : 'y';
      }
      if (axis === 'x') {
        if (e.cancelable) e.preventDefault();
        const damp = Math.max(-60, Math.min(60, dx * 0.18));
        screen.style.transform = `translateX(${damp}px)`;
      }
    };
    const end = (e) => {
      if (!active) return;
      active = false;
      screen.style.transition = 'transform .26s cubic-bezier(.22,.8,.23,1)';
      screen.style.transform = '';
      setTimeout(() => { screen.style.transition = ''; }, 280);
      if (axis !== 'x') return;
      const t = (e.changedTouches && e.changedTouches[0]) || {};
      const dx = (t.clientX || x0) - x0;
      const dt = Date.now() - t0;
      if (Math.abs(dx) > 56 && dt < 800) {
        window.AWM_stepService(dx < 0 ? 'next' : 'prev');
      }
    };
    screen.addEventListener('touchstart', start, { passive: true });
    screen.addEventListener('touchmove', move, { passive: false });
    screen.addEventListener('touchend', end, { passive: true });
    screen.addEventListener('touchcancel', () => { active = false; screen.style.transform = ''; }, { passive: true });

    // Desktop: ← / → arrows switch service when not typing.
    window.addEventListener('keydown', (e) => {
      if (window.AWM_anyOverlayOpen && window.AWM_anyOverlayOpen()) return;
      const a = document.activeElement;
      if (a && ['INPUT', 'TEXTAREA'].includes(a.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); window.AWM_stepService('next'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); window.AWM_stepService('prev'); }
    });
  }

  /* ---------------------------------------------------------
     4. TOUCH-STEP amounts (vertical swipe = wheel on mobile)
     --------------------------------------------------------- */
  function initAmountTouch() {
    document.querySelectorAll('.amount-display').forEach(disp => {
      const input = disp.querySelector('input.amt-main');
      if (!input) return;
      // HORIZONTAL swipe steps the value (right = up, left = down). Vertical
      // gestures are left alone so the page/sheet still scrolls under a field.
      let x0 = 0, y0 = 0, acc = 0, dragging = false, axis = null;
      const STEP_PX = 26;
      disp.addEventListener('touchstart', (e) => {
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
        acc = 0; dragging = true; axis = null;
      }, { passive: true });
      disp.addEventListener('touchmove', (e) => {
        if (!dragging || !window.AWM_stepInput) return;
        const x = e.touches[0].clientX, y = e.touches[0].clientY;
        const dx = x - x0, dy = y - y0;
        if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
        if (axis !== 'x') return; // vertical → let it scroll
        acc += (x - x0); x0 = x;
        while (Math.abs(acc) >= STEP_PX) {
          if (document.activeElement !== input) input.focus({ preventScroll: true });
          window.AWM_stepInput(input.id, acc > 0 ? 'up' : 'down');
          acc += acc > 0 ? -STEP_PX : STEP_PX;
        }
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
      disp.addEventListener('touchend', () => { dragging = false; }, { passive: true });
    });
  }

  /* ---------------------------------------------------------
     5. SHEET swipe-to-dismiss from anywhere (when scrolled top)
     --------------------------------------------------------- */
  function initSheetSwipe() {
    document.querySelectorAll('.overlay .sheet').forEach(sheet => {
      const overlay = sheet.closest('.overlay');
      if (!overlay) return;
      let y0 = 0, dy = 0, dragging = false, axis = null;
      sheet.addEventListener('touchstart', (e) => {
        if (sheet.scrollTop > 2) return;
        const tgt = e.target;
        if (tgt.closest && tgt.closest('.sheet-handle, input, textarea, .amount-display, .comment-mono, .donation-pills, button, a')) return;
        y0 = e.touches[0].clientY; dy = 0; dragging = true; axis = null;
        sheet.style.transition = 'none';
      }, { passive: true });
      sheet.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const cur = e.touches[0].clientY;
        dy = cur - y0;
        if (!axis && Math.abs(dy) > 8) axis = 'y';
        if (axis === 'y' && dy > 0 && sheet.scrollTop <= 0) {
          sheet.style.transform = `translateY(${dy}px) scale(${1 - Math.min(0.04, dy / 4000)})`;
          overlay.style.background = `rgba(5,8,14,${Math.max(0.05, 0.55 - dy / 800)})`;
          if (e.cancelable) e.preventDefault();
        }
      }, { passive: false });
      sheet.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        sheet.style.transition = '';
        const threshold = sheet.getBoundingClientRect().height * 0.24;
        if (dy > threshold) {
          sheet.style.transform = 'translateY(120%) scale(.98)';
          overlay.style.background = '';
          const name = overlay.id.replace('Overlay', '');
          setTimeout(() => {
            sheet.style.transform = '';
            overlay.classList.remove('visible');
            overlay.setAttribute('aria-hidden', 'true');
            if (!document.querySelector('.overlay.visible')) document.body.classList.remove('sheet-open');
            if (window.AWM_syncBack) window.AWM_syncBack();
          }, 200);
        } else {
          sheet.style.transform = '';
          overlay.style.background = '';
        }
      }, { passive: true });
    });
  }

  /* ---------------------------------------------------------
     init
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Device detection + brand reload
     --------------------------------------------------------- */
  function initDeviceFlags() {
    const root = document.documentElement;
    const isTouch = TOUCH || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const isPhone = isTouch && Math.min(window.innerWidth, window.innerHeight) < 560;
    root.classList.toggle('is-touch', isTouch);
    root.classList.toggle('is-desktop', !isTouch);
    root.classList.toggle('is-phone', isPhone);
    window.AWM_isTouch = isTouch;
  }
  function initBrandReload() {
    const brand = byId('brandReload');
    if (!brand) return;
    brand.addEventListener('click', () => {
      brand.classList.add('reloading');
      if (window.AWM_haptic) window.AWM_haptic('light');
      setTimeout(() => location.reload(), 160);
    });
  }

  /* ---------------------------------------------------------
     Cart stage swipe — horizontal swipe moves between the 3 cart stages.
     Shows a one-time hint so it's discoverable.
     --------------------------------------------------------- */
  function initCartSwipe() {
    const sheet = document.querySelector('.receipt-sheet');
    if (!sheet) return;
    let x0 = 0, y0 = 0, axis = null, active = false;
    const NOSWIPE = 'input, textarea, .qstep, .qchips, .donation-pills, button, a[href], .summary';
    sheet.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (e.target.closest && e.target.closest(NOSWIPE)) { active = false; return; }
      x0 = t.clientX; y0 = t.clientY; axis = null; active = true;
    }, { passive: true });
    sheet.addEventListener('touchmove', (e) => {
      if (!active) return;
      const t = e.touches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      if (!axis && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) axis = Math.abs(dx) > Math.abs(dy) * 1.4 ? 'x' : 'y';
    }, { passive: true });
    sheet.addEventListener('touchend', (e) => {
      if (!active || axis !== 'x') { active = false; return; }
      active = false;
      const t = (e.changedTouches && e.changedTouches[0]) || {};
      const dx = (t.clientX || x0) - x0;
      if (Math.abs(dx) < 50) return;
      const step = +(sheet.getAttribute('data-cart-step') || 1);
      if (dx < 0 && window.AWM_gotoCartStep) window.AWM_gotoCartStep(step + 1);
      else if (dx > 0 && window.AWM_gotoCartStep) window.AWM_gotoCartStep(step - 1);
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Main-frame interaction pulse — the gradient ring flares on key actions.
     --------------------------------------------------------- */
  function initFramePulse() {
    const screen = document.querySelector('.screen.grad-ring');
    if (!screen) return;
    let lock = false;
    const pulse = () => {
      if (lock) return;
      lock = true;
      screen.classList.remove('pulse');
      void screen.offsetWidth;
      screen.classList.add('pulse');
      setTimeout(() => { screen.classList.remove('pulse'); lock = false; }, 620);
    };
    window.AWM_framePulse = pulse;
    const HOT = '.service-picker, .pack-card, .tier-card, .service-option, .step-btn, .donation-pill, .cta, .mh-ico, .qbtn, .qchip';
    document.addEventListener('click', (e) => {
      if (e.target.closest && e.target.closest(HOT)) pulse();
    }, true);
  }

  function init() {
    initDeviceFlags();
    initBrandReload();
    runBoot();
    initHintDock();
    initServiceSwipe();
    initAmountTouch();
    initSheetSwipe();
    initCartSwipe();
    initFramePulse();
    window.addEventListener('resize', initDeviceFlags);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
