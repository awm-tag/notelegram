/* =========================================================
   AWM // PAY — idlehint.js
   Idle coaching. After a short pause with no input:
   • side arrows fade in (≈3s) — on desktop they carry a short control label;
   • on desktop (≥760px) a full keyboard control guide fades in (≈2.5s),
     with a tasteful glow and small entrance animations.
   Everything fades out smoothly on any interaction. Hidden on mobile widths
   for the full guide (the screen is touch-first there).
   ========================================================= */
(function () {
  'use strict';
  /* DISABLED per request — the idle edge "услуга" labels and the desktop
     keyboard control guide are removed for now. Control hints will be
     reworked in a later pass. This whole module is a no-op. */
  if (true) return;
  const ARROWS_MS = 3000;
  const GUIDE_MS = 2500;
  const byId = (id) => document.getElementById(id);
  let left = null, right = null, guide = null;
  let aTimer = null, gTimer = null, aShown = false, gShown = false;

  function ru() { return (document.documentElement.lang || 'ru') !== 'en'; }
  function isDesktop() { return window.matchMedia('(min-width: 760px) and (pointer: fine)').matches; }

  function make(side) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'edge-coach ' + side;
    el.setAttribute('aria-label', side === 'left'
      ? (ru() ? 'Предыдущая услуга' : 'Previous service')
      : (ru() ? 'Следующая услуга' : 'Next service'));
    el.innerHTML =
      '<span class="ec-arrow">' + (side === 'left' ? '‹' : '›') + '</span>' +
      '<span class="ec-cap">' + (ru() ? 'услуга' : 'service') + '</span>';
    el.addEventListener('click', () => {
      hideArrows();
      if (window.AWM_stepService) window.AWM_stepService(side === 'left' ? -1 : 1);
    });
    document.body.appendChild(el);
    return el;
  }
  function buildArrows() {
    if (!left) left = make('left');
    if (!right) right = make('right');
  }

  function buildGuide() {
    if (guide) return;
    guide = document.createElement('div');
    guide.className = 'ctrl-guide';
    const rows = ru() ? [
      ['↑ ↓', 'изменить сумму / тариф'],
      ['Enter', 'дальше — поле, состав, оплата'],
      ['← →', 'переключить услугу'],
      ['Esc', 'назад / закрыть']
    ] : [
      ['↑ ↓', 'change amount / tier'],
      ['Enter', 'next — field, order, pay'],
      ['← →', 'switch service'],
      ['Esc', 'back / close']
    ];
    guide.innerHTML =
      '<div class="cg-title">' + (ru() ? 'Управление с клавиатуры' : 'Keyboard controls') + '</div>' +
      '<div class="cg-rows">' + rows.map((r, i) =>
        '<div class="cg-row" style="--i:' + i + '"><span class="cg-keys">' +
        r[0].split(' ').map(k => '<kbd>' + k + '</kbd>').join('') +
        '</span><span class="cg-desc">' + r[1] + '</span></div>'
      ).join('') + '</div>';
    document.body.appendChild(guide);
  }

  function nothingFilled() {
    const ca = byId('customAmount');
    if (ca && ca.value) { const n = parseFloat(String(ca.value).replace(',', '.')); if (n > 0) return false; }
    return true;
  }
  function canShow() {
    if (document.hidden) return false;
    if (window.AWM_anyOverlayOpen && window.AWM_anyOverlayOpen()) return false;
    if (window.AWM_state && window.AWM_state.ctaArmed) return false;
    return nothingFilled();
  }

  function showArrows() {
    if (aShown || !canShow()) return;
    buildArrows(); aShown = true;
    document.body.classList.toggle('coach-desktop', isDesktop());
    left.classList.add('show'); right.classList.add('show');
  }
  function hideArrows() {
    if (!aShown) return;
    aShown = false;
    if (left) left.classList.remove('show');
    if (right) right.classList.remove('show');
  }
  function showGuide() {
    if (gShown || !canShow() || !isDesktop()) return;
    buildGuide(); gShown = true;
    requestAnimationFrame(() => guide.classList.add('show'));
  }
  function hideGuide() {
    if (!gShown) return;
    gShown = false;
    if (guide) guide.classList.remove('show');
  }
  function hideAll() { hideArrows(); hideGuide(); }

  function reset() {
    hideAll();
    clearTimeout(aTimer); clearTimeout(gTimer);
    gTimer = setTimeout(() => { if (canShow()) showGuide(); }, GUIDE_MS);
    aTimer = setTimeout(() => { if (canShow()) showArrows(); }, ARROWS_MS);
  }

  function init() {
    ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'].forEach(ev =>
      window.addEventListener(ev, reset, { passive: true, capture: true }));
    document.addEventListener('visibilitychange', () => { if (document.hidden) hideAll(); else reset(); });
    window.addEventListener('resize', () => { if (!isDesktop()) hideGuide(); });
    reset();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
