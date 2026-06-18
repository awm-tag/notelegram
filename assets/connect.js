/* =========================================================
   AWM // PAY — connect.js
   Optional wallet linking (Tonkeeper / TonConnect) + Telegram sign-in.
   Pure front-end; degrades gracefully until you fill payment-config.js.
   ========================================================= */
(function () {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const CFG = () => (window.AWM_PAYCONFIG || {});
  const ru = () => (document.documentElement.lang || 'ru') !== 'en';

  let connected = null;       // connected wallet address
  let tc = null;              // TonConnectUI instance, if SDK present

  /* ---------------- wallet connect ---------------- */
  function shorten(a) { a = String(a || ''); return a.length > 14 ? a.slice(0, 6) + '…' + a.slice(-5) : a; }

  function reflectConnected() {
    const row = byId('walletConnect');
    if (!row) return;
    const title = byId('wcTitle'), sub = byId('wcSub'), btn = byId('wcBtn');
    if (connected) {
      title.textContent = ru() ? 'Кошелёк привязан' : 'Wallet linked';
      sub.textContent = shorten(connected);
      btn.textContent = ru() ? 'Отвязать' : 'Disconnect';
      row.classList.add('is-connected');
      // auto-fill the relevant wallet field
      ['returnWallet', 'mintWallet'].forEach(id => {
        const f = byId('cd_' + id);
        if (f) { const inp = f.querySelector('input'); if (inp && !inp.value) { inp.value = connected; inp.dispatchEvent(new Event('input', { bubbles: true })); } }
      });
    } else {
      title.textContent = ru() ? 'Привязать кошелёк' : 'Link a wallet';
      sub.textContent = ru() ? 'По желанию — подставим адрес в поля' : 'Optional — we autofill the address';
      btn.textContent = ru() ? 'Подключить' : 'Connect';
      row.classList.remove('is-connected');
    }
  }

  async function connect() {
    if (connected) { disconnect(); return; }
    const w = CFG().wallet || {};
    // 1) Real TonConnect, if the SDK is loaded and a manifest is configured.
    if (window.TON_CONNECT_UI && w.tonconnectManifest) {
      try {
        if (!tc) tc = new window.TON_CONNECT_UI.TonConnectUI({ manifestUrl: w.tonconnectManifest });
        tc.onStatusChange((wallet) => {
          connected = wallet && wallet.account ? wallet.account.address : null;
          window.AWM_connectedWallet = connected;
          reflectConnected();
        });
        await tc.openModal();
        return;
      } catch (e) { /* fall through to manual */ }
    }
    // 2) No SDK/manifest yet → let the user paste an address (still useful).
    const a = prompt(ru() ? 'Вставьте адрес TON-кошелька (UQ… / EQ…):' : 'Paste your TON wallet address (UQ… / EQ…):', '');
    if (a && a.trim().length >= 10) {
      connected = a.trim();
      window.AWM_connectedWallet = connected;
      if (window.AWM_haptic) window.AWM_haptic('success');
      reflectConnected();
    }
  }
  function disconnect() {
    connected = null; window.AWM_connectedWallet = null;
    try { if (tc) tc.disconnect(); } catch (e) {}
    reflectConnected();
  }

  function initWallet() {
    const w = CFG().wallet || {};
    const row = byId('walletConnect');
    if (!row) return;
    row.hidden = !w.enabled;
    const btn = byId('wcBtn');
    if (btn) btn.addEventListener('click', connect);
    reflectConnected();
  }
  // re-assert autofill whenever stage 2 is (re)rendered
  window.AWM_reflectWallet = reflectConnected;

  /* ---------------- Telegram sign-in ---------------- */
  // Inside the Mini App we already have the profile. Outside, offer two official
  // routes: (1) the Telegram Login Widget (in-app confirmation request), and
  // (2) a deep-link to the bot for chat-based registration / order tracking.
  function initTelegramAuth() {
    const a = CFG().telegramAuth || {};
    const tg = window.Telegram && window.Telegram.WebApp;
    const insideMiniApp = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    const btn = byId('tgLoginBtn');
    const botBtn = byId('tgBotBtn');
    const sep = document.querySelector('.tg-login-sep');
    const methods = document.querySelector('.auth-methods');
    if (insideMiniApp) {
      if (methods) methods.hidden = true;
      if (sep) sep.hidden = true;
      const u = tg.initDataUnsafe.user;
      window.AWM_profile = { id: u.id, username: u.username, name: [u.first_name, u.last_name].filter(Boolean).join(' '), photo: u.photo_url || '' };
      if (window.AWM_applyProfile) window.AWM_applyProfile(window.AWM_profile);
      return;
    }
    // (1) Official Login Widget — works once the bot domain is registered in
    //     BotFather (/setdomain → your site). If botUsername is configured we
    //     render the real widget on demand; otherwise we deep-link to the bot.
    const host = byId('tgLoginHost');
    if (btn) {
      btn.addEventListener('click', () => {
        if (a.useWidget && a.botUsername && host) {
          host.hidden = false;
          if (!host.dataset.loaded) {
            host.dataset.loaded = '1';
            const s = document.createElement('script');
            s.async = true;
            s.src = 'https://telegram.org/js/telegram-widget.js?22';
            s.setAttribute('data-telegram-login', a.botUsername);
            s.setAttribute('data-size', 'large');
            s.setAttribute('data-radius', '12');
            s.setAttribute('data-request-access', 'write');
            s.setAttribute('data-onauth', 'AWM_onTelegramAuth(user)');
            host.appendChild(s);
          }
          btn.hidden = true;
        } else {
          window.open('https://t.me/' + (a.botUsername || 'awm_pay_bot') + '?start=login', '_blank', 'noopener');
          const inp = byId('usernameInput'); if (inp) inp.focus();
        }
      });
    }
    // (2) Bot route — chat-based registration / orders.
    if (botBtn) {
      botBtn.addEventListener('click', () => {
        window.open('https://t.me/' + (a.botUsername || 'awm_pay_bot') + '?start=site', '_blank', 'noopener');
      });
    }
  }
  window.AWM_onTelegramAuth = function (user) {
    window.AWM_profile = { id: user.id, username: user.username, name: [user.first_name, user.last_name].filter(Boolean).join(' '), photo: user.photo_url || '' };
    if (window.AWM_applyProfile) window.AWM_applyProfile(window.AWM_profile);
  };

  function init() {
    initWallet();
    initTelegramAuth();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
