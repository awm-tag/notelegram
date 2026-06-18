/* =========================================================
   AWM // PAY — reviews.js
   Live "reviews" counter shown in the registration sheet.
   • Seeds instantly from config (no flicker on open).
   • Polls the VPS backend (/reviews/count) for the latest post id of the
     Telegram reviews channel, and RE-TYPES the number like a keyboard when
     it changes: delete the differing tail digit-by-digit, pause, type the
     new digits. Links to the exact post.
   • Degrades gracefully: with no backend it just shows the seed number.
   ========================================================= */
(function () {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const CFG = () => (window.AWM_PAYCONFIG || {});

  function conf() {
    const c = CFG();
    const rv = c.reviews || {};
    const base = (c.backend && c.backend.base) ? String(c.backend.base).replace(/\/+$/, '') : '';
    return {
      channel: rv.channel || 'awm_otziv',
      seed: Number(rv.seed || 0) || 0,
      pollMs: Number(rv.pollMs || 20000),
      base,
    };
  }

  let current = '';          // currently displayed digit string
  let target = null;         // latest known value (string)
  let animating = false;
  let pending = null;        // queued value if a new one arrives mid-animation
  let timer = null;

  /* ---------- render ---------- */
  function paint(str, typing) {
    const host = byId('rvCount');
    if (!host) return;
    host.innerHTML = '';
    for (const ch of str) {
      const s = document.createElement('span');
      s.className = 'rv-d';
      s.textContent = ch;
      host.appendChild(s);
    }
    const caret = document.createElement('span');
    caret.className = 'rv-caret' + (typing ? ' is-typing' : '');
    host.appendChild(caret);
  }

  function linkTo(n) {
    const a = byId('reviewCounter');
    const sub = byId('rvSub');
    const { channel } = conf();
    if (a) a.href = 'https://t.me/' + channel + (n ? '/' + n : '');
    if (sub) sub.textContent = '@' + channel + ' ↗';
  }

  /* ---------- the keyboard re-type ---------- */
  async function animateTo(nextRaw) {
    const next = String(nextRaw);
    if (!next || next === current) { target = next; return; }
    if (animating) { pending = next; return; }   // coalesce bursts
    animating = true;
    target = next;

    // longest common prefix — only the changed tail is rewritten
    let p = 0;
    while (p < current.length && p < next.length && current[p] === next[p]) p++;

    let work = current;
    // 1) delete the differing tail, one digit at a time
    while (work.length > p) {
      work = work.slice(0, -1);
      paint(work, true);
      if (window.AWM_haptic) window.AWM_haptic('selection');
      await sleep(95);
    }
    // 2) hold a beat (like the user asked — "секунду подождать")
    paint(work, true);
    await sleep(work === next ? 0 : 680);
    // 3) type the new digits
    for (let i = p; i < next.length; i++) {
      work += next[i];
      paint(work, true);
      if (window.AWM_haptic) window.AWM_haptic('selection');
      await sleep(130);
    }
    paint(next, false);
    current = next;
    linkTo(next);
    flash();

    animating = false;
    if (pending && pending !== current) { const q = pending; pending = null; animateTo(q); }
    else pending = null;
  }

  function flash() {
    const a = byId('reviewCounter');
    if (!a) return;
    a.classList.remove('rv-bumped');
    void a.offsetWidth;
    a.classList.add('rv-bumped');
  }

  /* ---------- backend polling ---------- */
  async function poll() {
    const { base, channel } = conf();
    if (!base) return;
    try {
      const u = base + '/reviews/count';
      const r = await fetch(u, { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      if (j && Number(j.count) > 0) animateTo(Number(j.count));
    } catch (e) { /* offline / not deployed yet — keep last value */ }
  }

  function startPolling() {
    const { base, pollMs } = conf();
    if (!base || timer) return;
    poll();
    timer = setInterval(() => { if (!document.hidden) poll(); }, Math.max(8000, pollMs));
  }

  /* ---------- identity side ---------- */
  function cleanName(v) {
    v = String(v || '').trim().replace(/^@+/, '');
    return v;
  }
  function syncIdentity() {
    const nameEl = byId('regIdName');
    const av = byId('regAvatar');
    const prof = window.AWM_profile || {};
    const inp = byId('usernameInput');
    let name = cleanName(inp && inp.value) || cleanName(prof.username);
    if (nameEl) {
      const ru = (document.documentElement.lang || 'ru') !== 'en';
      nameEl.textContent = name ? '@' + name : (ru ? 'Не указан' : 'Not set');
      nameEl.classList.toggle('is-empty', !name);
    }
    if (av) {
      if (prof.photo) {
        av.innerHTML = '';
        const img = document.createElement('img');
        img.src = prof.photo; img.alt = ''; img.className = 'reg-avatar-img';
        img.referrerPolicy = 'no-referrer';
        av.appendChild(img);
      } else {
        const glyph = name ? name[0].toUpperCase() : '@';
        av.innerHTML = '<span class="reg-avatar-glyph">' + glyph + '</span>';
      }
    }
  }
  window.AWM_syncRegIdentity = syncIdentity;
  window.AWM_reviewsSet = animateTo;   // manual/testing hook

  /* ---------- boot ---------- */
  function init() {
    const { seed } = conf();
    current = seed ? String(seed) : '';
    paint(current, false);
    linkTo(seed);
    syncIdentity();

    // live identity as the user types their @username
    const inp = byId('usernameInput');
    if (inp) inp.addEventListener('input', syncIdentity);

    // refresh + (re)start polling whenever the sheet becomes visible
    const ov = byId('usernameOverlay');
    if (ov) {
      const mo = new MutationObserver(() => {
        if (ov.classList.contains('visible')) { syncIdentity(); poll(); }
      });
      mo.observe(ov, { attributes: true, attributeFilter: ['class'] });
    }

    startPolling();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
