/* =========================================================
   AWM // PAY — hours.js
   Live "online / offline" status for the top bar, based on Moscow time.
   Working hours: 16:30 – 00:00 MSK (UTC+3), every day incl. weekends.
   • Auto-services (Stars, Premium) run 24/7 regardless.
   • Manual requests: a reply can take up to 12 hours — users may message
     before paying if it's not an auto-service.
   ========================================================= */
(function () {
  'use strict';
  const byId = (id) => document.getElementById(id);
  // Window in minutes-of-day, MSK.
  const OPEN = 16 * 60 + 30;   // 16:30
  const CLOSE = 24 * 60;       // 00:00 (end of day)

  function mskMinutes() {
    const d = new Date();
    // MSK is a fixed UTC+3 offset (no DST).
    const min = (d.getUTCHours() * 60 + d.getUTCMinutes() + 3 * 60) % (24 * 60);
    return min;
  }
  function mskClock() {
    const d = new Date();
    const totalSec = (d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds() + 3 * 3600) % 86400;
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const p = (n) => String(n).padStart(2, '0');
    return p(h) + ':' + p(m) + ':' + p(s);
  }
  function isOpen() {
    const m = mskMinutes();
    return m >= OPEN && m < CLOSE;
  }

  let _lastClock = '';
  function tickClock() {
    const cl = byId('wsClock');
    if (!cl) return;
    const t = mskClock();
    if (t === _lastClock) return;
    _lastClock = t;
    cl.textContent = t;
    // gentle pulse on each second tick
    cl.classList.remove('tickpulse');
    void cl.offsetWidth;
    cl.classList.add('tickpulse');
  }

  function update() {
    const cell = byId('workStatus');
    const stateEl = byId('wsState');
    const modeEl = byId('wsMode');
    const hoursLabel = byId('wsHoursLabel');
    if (!cell) return;
    const open = isOpen();
    const ru = (document.documentElement.lang || 'ru') !== 'en';
    const auto = !!window.AWM_activeServiceAuto;

    // Tri-state: online (green) / offline (red) / auto-offline (yellow).
    let status;
    if (auto) status = open ? 'online' : 'autooffline';
    else status = open ? 'online' : 'offline';
    cell.dataset.status = status;
    cell.dataset.online = (status === 'online') ? 'true' : 'false';

    // State label (row 1)
    if (stateEl) {
      stateEl.textContent =
        status === 'online' ? (ru ? 'Онлайн' : 'Online')
        : status === 'autooffline' ? (ru ? 'Поддержка не онлайн' : 'Support offline')
        : (ru ? 'Не онлайн' : 'Offline');
    }
    // Mode line (row 2)
    if (modeEl) {
      modeEl.textContent = auto
        ? (ru ? 'АВТО: 24/7 · поддержка 16:30–00:00' : 'AUTO: 24/7 · support 16:30–00:00')
        : (ru ? 'Ручная обработка · услуги 16:30–00:00' : 'Manual handling · service 16:30–00:00');
    }
    if (hoursLabel) hoursLabel.textContent = ru ? 'МСК сейчас' : 'MSK now';
    tickClock();
  }
  window.AWM_refreshStatus = update;

  function init() {
    update();
    tickClock();
    setInterval(tickClock, 1000);   // live MSK clock, every second
    setInterval(update, 30 * 1000); // online/offline state, every 30s
    // Re-run on language switch.
    document.addEventListener('click', (e) => {
      if (e.target.closest && e.target.closest('.lang-btn')) setTimeout(update, 60);
    });
    wireUi();
  }

  // Work-status button → contacts/links sheet; footer disclaimer toggle; year.
  function wireUi() {
    const yr = byId('footYear'); if (yr) yr.textContent = new Date().getFullYear();

    const overlay = byId('linksOverlay');
    const openSheet = () => { if (!overlay) return; overlay.classList.add('visible'); overlay.setAttribute('aria-hidden', 'false'); document.body.classList.add('sheet-open'); };
    const closeSheet = () => { if (!overlay) return; overlay.classList.remove('visible'); overlay.setAttribute('aria-hidden', 'true'); document.body.classList.remove('sheet-open'); };
    const ws = byId('workStatus');
    if (ws) ws.addEventListener('click', openSheet);
    const lc = byId('linksClose'); if (lc) lc.addEventListener('click', closeSheet);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

    const dt = byId('footDiscToggle'), dov = byId('discOverlay');
    const openDisc = () => { if (!dov) return; dov.classList.add('visible'); dov.setAttribute('aria-hidden', 'false'); document.body.classList.add('sheet-open'); };
    const closeDisc = () => { if (!dov) return; dov.classList.remove('visible'); dov.setAttribute('aria-hidden', 'true'); document.body.classList.remove('sheet-open'); };
    if (dt) dt.addEventListener('click', openDisc);
    const dcl = byId('discClose'); if (dcl) dcl.addEventListener('click', closeDisc);
    if (dov) dov.addEventListener('click', (e) => { if (e.target === dov) closeDisc(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDisc(); });
  }
  // Expose for the pre-payment agreement warning (app.js).
  window.AWM_isOpen = isOpen;
  window.AWM_mskMinutes = mskMinutes;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
