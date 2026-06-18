/* =========================================================
   AWM // PAY — payment backend configuration
   ---------------------------------------------------------
   EDIT THIS FILE to change commissions, the receiving wallet, and the
   payment method/endpoint for each service. Loaded BEFORE pricing.js so
   commission overrides apply everywhere automatically.

   Each service can pay through a different "method":
     • 'tonkeeper' — open a TON transfer link (default, no backend needed)
     • 'fragment'  — Telegram Stars / Premium via Fragment (needs your bridge)
     • 'manual'    — just show the wallet + code, user pays by hand
     • 'api'       — POST to your own backend endpoint, which returns a pay URL

   Commission:
     • commissionPct: a flat % added on top (e.g. 17 = +17%).
       Set to null to keep the service's built-in pricing
       (mint/boost use sliding 7.5–10% tiers).
   ========================================================= */
(function () {
  'use strict';

  /* ╔═══════════════════════════════════════════════════════════════════╗
     ║  ★ SETUP — EDIT ONLY THIS BLOCK. Paste your keys and you're live. ★ ║
     ╚═══════════════════════════════════════════════════════════════════╝
     Hosted on GitHub Pages at https://awm-tag.github.io (static, HTTPS).
     The site works immediately with just the wallet. The two API slots
     unlock auto-verification limits and Stars/Premium auto-delivery. */
  const DEFAULTS = {
    // 1) Where the site is hosted (used for the wallet-connect manifest).
    siteUrl: 'https://notelegram.com',

    // 2) TON wallet that receives every payment.
    wallet: 'UQCA1IrxpvIR0Xpub1elImv7lF1o5QcPaF6FsEcwf73zhvM4',

    // 3) tonapi.io key — OPTIONAL. Read-only, safe on a static site.
    //    Empty = keyless (works, just lower rate limit).
    //    Get one at https://tonconsole.com → API keys.
    tonapiKey: '',                       // ← PASTE TONAPI KEY (optional)

    // 3b) toncenter.com key — OPTIONAL fallback verifier. Free key raises the
    //     rate limit. Get one from @tonapibot in Telegram. Empty = keyless.
    toncenterKey: '',                    // ← PASTE TONCENTER KEY (optional)

    // 4) Your VPS backend URL — for Stars/Premium AUTO-DELIVERY + live status.
    //    Leave '' until the server is live; the site falls back to a plain
    //    verifiable TON transfer in the meantime. Your VPS: 81.177.212.28 —
    //    point a domain at it with HTTPS, e.g. 'https://api.awmpay.com'.
    //    (Secret Qonix/Bot keys live on the VPS .env — NEVER here.)
    backendUrl: 'https://api.notelegram.com', // ← your VPS 81.177.212.28 (api.notelegram.com)

    // 4b) Live "reviews" counter — pulls the latest post id of your Telegram
    //     reviews channel via the VPS (/reviews/count) and re-types it.
    //     `seed` shows instantly before the server answers.
    reviews: { channel: 'awm_otziv', seed: 24361, pollMs: 20000 },

    // 5) Telegram bot for website login (Mini App auto-detects separately).
    botUsername: 'awm_pay_bot',

    // 6) Commissions, %. null = keep built-in pricing.
    commission: { stars: 17, premium: 17, custom: null, mint: null, boost: null },
  };

  /* ── Your personal overrides live in a SEPARATE file: my-config.js ──
     It sets window.AWM_SETUP and loads BEFORE this file. Anything you put
     there wins over the defaults above — so you keep ONE small file across
     every site version (pure copy-paste, nothing here to re-edit). */
  const U = (window.AWM_SETUP && typeof window.AWM_SETUP === 'object') ? window.AWM_SETUP : {};
  const SETUP = Object.assign({}, DEFAULTS, U);
  SETUP.commission = Object.assign({}, DEFAULTS.commission, U.commission || {});
  SETUP.reviews = Object.assign({}, DEFAULTS.reviews, U.reviews || {});
  /* ────────────────  nothing below needs editing  ──────────────── */

  window.AWM_PAYCONFIG = {
    receiveWallet: SETUP.wallet,
    reviews: SETUP.reviews,

    /* USDT on TON (jetton) — for deals settled in USD₮. The same receiving
       wallet holds the USDT jetton; payment is a standard jetton transfer.
       master = official USD₮ jetton master on TON; decimals = 6. */
    usdt: {
      master: (U.usdtMaster) || 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
      decimals: 6
    },

    verifyApi: {
      base: 'https://tonapi.io/v2',
      token: SETUP.tonapiKey,
      explorer: 'https://tonviewer.com/'
    },

    /* Fallback on-chain verifiers — verify.js tries these in order if tonapi
       is rate-limited or down. All read-only; keys optional. */
    toncenter:   { base: 'https://toncenter.com/api/v2', key: SETUP.toncenterKey },
    toncenterV3: { base: 'https://toncenter.com/api/v3', key: SETUP.toncenterKey },

    /* ----- Per-service payment + commission config ----- */
    services: {
      custom: {
        commissionPct: SETUP.commission.custom,
        method: 'tonkeeper',
        payLabel: { ru: 'Оплатить', en: 'Pay' }
      },

      stars: {
        commissionPct: SETUP.commission.stars,   // 17% by default
        method: 'fragment',
        fragment: { botLink: 'https://t.me/' + SETUP.botUsername, apiBase: '', apiKey: '' },
        payLabel: { ru: 'Оплатить Stars', en: 'Pay for Stars' }
      },

      premium: {
        commissionPct: SETUP.commission.premium,  // 17% by default
        method: 'fragment',
        fragment: { botLink: 'https://t.me/' + SETUP.botUsername, apiBase: '', apiKey: '' },
        payLabel: { ru: 'Оплатить Premium', en: 'Pay for Premium' }
      },

      mint: {
        commissionPct: SETUP.commission.mint,
        method: 'tonkeeper',
        payLabel: { ru: 'Оплатить', en: 'Pay' }
      },

      boost: {
        commissionPct: SETUP.commission.boost,
        method: 'tonkeeper',
        payLabel: { ru: 'Оплатить', en: 'Pay' }
      }
    },

    /* =====================================================================
       AUTOMATION (your VPS) — fill these in and the front-end wires up.
       Front-end calls these endpoints; your VPS does the privileged work
       (Fragment session, Tonkeeper API, crediting Stars/Premium, webhooks).
       Everything is optional: empty values keep the no-backend fallbacks.
       ===================================================================== */
    backend: {
      base: SETUP.backendUrl,         // from SETUP block
      endpoints: {
        createOrder: '/order/create',
        orderStatus: '/order/status',
        webhook: '/webhook/ton',
        authVerify: '/auth/telegram'
      },
      preferServerVerify: true,
      sse: '/order/stream'
    },

    /* ----- Qonix Fragment API (SERVER-SIDE ONLY) -----
       The Stars/Premium fulfilment key from
       https://qonixcore.com/dashboard/fragments/api-keys
       goes into the VPS .env (QONIX_API_KEY) — NEVER in this file. */
    qonix: {
      dashboard: 'https://qonixcore.com/dashboard/fragments/api-keys',
      note: 'Set QONIX_API_KEY in the VPS environment, not in the website.'
    },

    /* ----- Wallet connect (TonConnect / Tonkeeper) ----- */
    wallet: {
      enabled: true,
      // Manifest is served from the site itself on GitHub Pages.
      tonconnectManifest: SETUP.siteUrl + '/tonconnect-manifest.json',
      tonkeeperLink: 'https://app.tonkeeper.com'
    },

    /* ----- Telegram login (outside the Mini App) ----- */
    telegramAuth: {
      enabled: true,
      botUsername: SETUP.botUsername,
      // Set true ONLY after you register the site domain in BotFather
      // (/setdomain). Then the "Sign in with Telegram" button renders the
      // official Login Widget. Until then it deep-links to the bot.
      useWidget: false,
      // If a backend is set, verify logins there; else capture profile locally.
      callbackUrl: SETUP.backendUrl ? (SETUP.backendUrl + '/auth/telegram') : ''
    },

    /* The Pay button ALWAYS opens a plain, verifiable TON transfer to the
       receiving wallet (no secrets in the browser). Stars/Premium auto-delivery
       happens SERVER-SIDE after the backend sees the payment on-chain. */
    methods: {
      tonkeeper: ({ wallet, nano, comment }) =>
        `https://app.tonkeeper.com/transfer/${wallet}?amount=${nano}&text=${encodeURIComponent(comment)}`,

      // Stars/Premium: same verifiable TON transfer. The site never calls the
      // backend with a pay link or any key — fulfilment is server-side.
      fragment: ({ wallet, nano, comment }) =>
        `https://app.tonkeeper.com/transfer/${wallet}?amount=${nano}&text=${encodeURIComponent(comment)}`,

      manual: ({ wallet }) => `https://tonviewer.com/${wallet}`,

      /* USDT on TON jetton transfer — used for deals settled in USD₮.
         `usdtUnits` is the amount in micro-USDT (6 decimals). Tonkeeper opens
         a jetton transfer to the receiving wallet for the exact USDT amount. */
      usdt: ({ wallet, usdtUnits, comment }) => {
        const C = window.AWM_PAYCONFIG;
        const master = (C.usdt && C.usdt.master) || '';
        return `https://app.tonkeeper.com/transfer/${wallet}?jetton=${master}&amount=${usdtUnits}&text=${encodeURIComponent(comment)}`;
      },

      api: ({ wallet, nano, comment, service, cfg }) => {
        const base = (cfg && cfg.apiBase) || '';
        const q = new URLSearchParams({ wallet, amount_nano: nano, comment, service });
        return base ? `${base}?${q.toString()}` : '#';
      }
    }
  };

  /* Helper used by app.js to build the right pay URL for the active service. */
  window.AWM_buildPayLink = function (service, ctx) {
    const C = window.AWM_PAYCONFIG;
    const cfg = (C.services && C.services[service]) || {};
    // Deals in USD₮ settle as a real USDT jetton transfer (automatic, on-site).
    let methodName = cfg.method;
    if (service === 'deal' && ctx && ctx.currency === 'USDT') methodName = 'usdt';
    const method = C.methods[methodName] || C.methods.tonkeeper;
    return method({
      wallet: C.receiveWallet,
      nano: ctx.nano,
      usdtUnits: ctx.usdtUnits,
      currency: ctx.currency,
      comment: ctx.comment,
      service,
      cfg,
      ctx
    });
  };

  /* Per-service Pay button label. */
  window.AWM_payLabel = function (service, lang) {
    const cfg = (window.AWM_PAYCONFIG.services || {})[service] || {};
    return (cfg.payLabel && cfg.payLabel[lang]) || (lang === 'en' ? 'Pay' : 'Оплатить');
  };
})();
