/* =========================================================
   AWM Payment Miniapp — tweaks.js
   Two expressive controls that reshape the ambient feel:
   • Atmosphere — density / opacity / motion of the background
   • Geometry — layered depth · flat · off
   (Accent colour is driven automatically by the active service.)
   Implements the Tweaks host protocol (vanilla, no React).
   ========================================================= */
(function () {
  'use strict';
  const byId = (id) => document.getElementById(id);

  const defaults = window.AWM_TWEAKS || { atmosphere: 1, geometry: 'layered' };
  const state = Object.assign({ atmosphere: 1, geometry: 'layered' }, defaults);

  /* ---------- apply ---------- */
  function applyAtmosphere(regen) {
    const v = state.atmosphere;
    window.AWM_bgConfig = Object.assign({}, window.AWM_bgConfig, {
      density: v,
      opacity: Math.max(0, v),
      motion: Math.max(0.25, v),
    });
    if (regen && window.AWM_regenBackground) window.AWM_regenBackground();
  }
  function applyGeometry(regen) {
    const host = byId('bgShapes');
    if (host) {
      host.classList.toggle('flat', state.geometry === 'flat');
      host.classList.toggle('off', state.geometry === 'off');
    }
    if (regen && state.geometry !== 'off' && window.AWM_regenBackground) window.AWM_regenBackground();
  }
  function applyAll(regen) {
    applyAtmosphere(false);
    applyGeometry(false);
    if (regen && window.AWM_regenBackground) window.AWM_regenBackground();
  }

  /* ---------- persistence ---------- */
  function persist(edits) {
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); } catch (e) {}
  }

  /* ---------- UI wiring ---------- */
  function syncUI() {
    const atmo = byId('twAtmo');
    if (atmo) atmo.value = String(state.atmosphere);
    const lbl = byId('twAtmoVal');
    if (lbl) lbl.textContent = state.atmosphere < 0.6 ? 'Спокойно' : state.atmosphere > 1.4 ? 'Живо' : 'Норма';
    document.querySelectorAll('#twGeo button').forEach(b =>
      b.classList.toggle('is-active', b.dataset.geo === state.geometry));
  }

  function wire() {
    const atmo = byId('twAtmo');
    if (atmo) {
      let t = null;
      atmo.addEventListener('input', () => {
        state.atmosphere = +atmo.value;
        syncUI();
        applyAtmosphere(false);
        clearTimeout(t);
        t = setTimeout(() => applyAtmosphere(true), 90);
      });
      atmo.addEventListener('change', () => persist({ atmosphere: state.atmosphere }));
    }
    document.querySelectorAll('#twGeo button').forEach(b =>
      b.addEventListener('click', () => {
        state.geometry = b.dataset.geo;
        applyGeometry(true);
        syncUI();
        persist({ geometry: state.geometry });
      }));
    const close = byId('tweaksClose');
    if (close) close.addEventListener('click', () => {
      hide();
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });
    syncUI();
  }

  /* ---------- host protocol ---------- */
  const panel = byId('tweaksPanel');
  function show() {
    if (!panel) return;
    panel.hidden = false;
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(14px) scale(.98)';
    requestAnimationFrame(() => {
      panel.classList.add('open');
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0) scale(1)';
    });
  }
  function hide() {
    if (!panel) return;
    panel.classList.remove('open');
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(14px) scale(.98)';
    setTimeout(() => { panel.hidden = true; }, 240);
  }

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode') show();
    else if (d.type === '__deactivate_edit_mode') hide();
  });

  function start() {
    applyAll(true);
    wire();
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
