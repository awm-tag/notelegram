/* =========================================================
   AWM Payment Miniapp — v2.2
   ========================================================= */

(function () {
  'use strict';
  const P = window.AWMPricing;
  const { SERVICES, SERVICE_ORDER, RateStore } = P;

  // ---------- Hero copy per service ----------
  const HEROS = {
    custom: {
      ru: { kicker: 'NOTELEGRAM // \u041e\u041f\u041b\u0410\u0422\u0410',  title: '\u0422\u043e\u0432\u0430\u0440\u044b \u0438 \u0443\u0441\u043b\u0443\u0433\u0438 \u2014 \u0432 \u043e\u0434\u043d\u043e \u043d\u0430\u0436\u0430\u0442\u0438\u0435', sub: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0443\u043c\u043c\u0443 \u0432 TON \u2014 \u0432\u0438\u0434\u043d\u043e USD, \u0432\u0438\u0434\u043d\u043e \u043a\u043e\u043c\u0438\u0441\u0441\u0438\u0438. \u041a\u043e\u0434 \u043e\u043f\u043b\u0430\u0442\u044b \u0431\u0443\u0434\u0435\u0442 \u0432\u0430\u0448\u0438\u043c \u0447\u0435\u043a\u043e\u043c.' },
      en: { kicker: 'NOTELEGRAM // PAYMENT',     title: 'Goods & services \u2014 one tap',  sub: 'Enter TON amount \u2014 USD shown, commission shown. The payment code will be your receipt.' }
    },
    stars: {
      ru: { kicker: 'NOTELEGRAM // STARS',       title: '\u0417\u0432\u0451\u0437\u0434\u044b \u0431\u044b\u0441\u0442\u0440\u0435\u0435 \u0438 \u0432\u044b\u0433\u043e\u0434\u043d\u0435\u0435', sub: '\u041f\u0430\u043a\u0438 \u0434\u0435\u0448\u0435\u0432\u043b\u0435 1\u202b\u202c\u2606 = $0.015. \u0418\u043b\u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0432\u043e\u0451 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u2014 \u0441\u0440\u0430\u0437\u0443 \u0432\u0438\u0434\u043d\u043e USD \u0438 TON.' },
      en: { kicker: 'NOTELEGRAM // STARS',       title: 'Stars \u2014 faster, cheaper',     sub: 'Packs are cheaper than 1\u202b\u202c\u2606 = $0.015. Or enter a custom quantity \u2014 USD and TON shown instantly.' }
    },
    premium: {
      ru: { kicker: 'NOTELEGRAM // PREMIUM',     title: 'Telegram Premium \u0431\u0435\u0437 \u043c\u043e\u0440\u043e\u043a\u0438', sub: '3, 6 \u0438\u043b\u0438 12 \u043c\u0435\u0441\u044f\u0446\u0435\u0432. \u0426\u0435\u043d\u044b \u0432 USD \u0438 TON \u043f\u043e \u0436\u0438\u0432\u043e\u043c\u0443 \u043a\u0443\u0440\u0441\u0443. \u041a \u044d\u0442\u043e\u043c\u0443 \u043d\u0443\u0436\u0435\u043d \u0432\u0430\u0448 @username \u2014 \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0430 \u043f\u0440\u0438\u0432\u044f\u0436\u0435\u0442\u0441\u044f \u043a \u043d\u0435\u043c\u0443.' },
      en: { kicker: 'NOTELEGRAM // PREMIUM',     title: 'Telegram Premium, no fuss',  sub: '3, 6 or 12 months. Prices in USD and TON by live rate. Your @username is needed \u2014 subscription is bound to it.' }
    },
    mint: {
      ru: { kicker: 'NOTELEGRAM // MINT',        title: '\u0421\u0434\u0435\u043b\u0430\u0439 \u0442\u0435\u0433 NFT', sub: '\u0411\u0430\u0437\u0430 7 TON \u043f\u043b\u044e\u0441 \u0434\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430 \u043e\u0442 \u0441\u0442\u0430\u0432\u043a\u0438. NFT-\u044e\u0437\u0435\u0440\u043d\u0435\u0439\u043c \u0432\u044b\u043f\u0443\u0441\u043a\u0430\u0435\u0442\u0441\u044f \u043d\u0430 Fragment \u0438 \u043f\u0440\u0438\u0445\u043e\u0434\u0438\u0442 \u043d\u0430 \u0432\u0430\u0448 \u043a\u043e\u0448\u0435\u043b\u0451\u043a.' },
      en: { kicker: 'NOTELEGRAM // MINT',        title: 'Tokenize your @',             sub: '7 TON base + bid-based commission. The NFT username is minted on Fragment and lands on your wallet.' }
    },
    boost: {
      ru: { kicker: 'NOTELEGRAM // BOOST',       title: '\u041f\u043e\u0434\u043d\u0438\u043c\u0438 \u0432\u0438\u0434\u0438\u043c\u0443\u044e \u0441\u0442\u0430\u0432\u043a\u0443', sub: '\u041e\u043f\u043b\u0430\u0442\u0430 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430 \u043e\u0442 \u0436\u0435\u043b\u0430\u0435\u043c\u043e\u0439 \u0441\u0443\u043c\u043c\u044b. \u0428\u043a\u0430\u043b\u0430 10\u202b\u202c% \u2192 7.5\u202b\u202c% \u2014 \u0447\u0435\u043c \u0432\u044b\u0448\u0435 \u0441\u0442\u0430\u0432\u043a\u0430, \u0442\u0435\u043c \u043d\u0438\u0436\u0435 %.' },
      en: { kicker: 'NOTELEGRAM // BOOST',       title: 'Raise the visible bid',       sub: 'You pay only the commission of the bid you want. Tier 10\u202b\u202c% \u2192 7.5\u202b\u202c% \u2014 higher bid, lower %.' }
    },
    deal: {
      ru: { kicker: 'NOTELEGRAM // \u0421\u0414\u0415\u041b\u041a\u0410',      title: '\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435', sub: '\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u0430\u044f \u043e\u043f\u043b\u0430\u0442\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e\u0439 \u0441\u0434\u0435\u043b\u043a\u0438 \u0432 TON. \u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0441\u0443\u043c\u043c\u0443, \u0441 \u043a\u0435\u043c \u0441\u0434\u0435\u043b\u043a\u0430 \u0438 \u0437\u0430 \u0447\u0442\u043e \u2014 \u0438\u043b\u0438 \u0432\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u043a\u043e\u0434.' },
      en: { kicker: 'NOTELEGRAM // DEAL',        title: 'Pay for a deal',              sub: 'Official payment for a specific deal in TON. State the amount, who and what for \u2014 or paste the code.' }
    }
  };

  // ---------- i18n ----------
  const T = {
    ru: {
      panelService: '\u0423\u0441\u043b\u0443\u0433\u0430', panelParams: '\u041f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b \u043e\u043f\u043b\u0430\u0442\u044b', liveRate: '\u041a\u0443\u0440\u0441',
      isFor100: '\u0437\u0430 100\u2b50', isMin: '\u043c\u0438\u043d. \u043f\u043e\u043f\u043e\u043b\u043d.', isRate: '\u043a\u0443\u0440\u0441 TON',
      yourTelegram: '\u0412\u0430\u0448 Telegram @username',
      enterToSave: '\u2014 \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0438 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c',
      amountLabel: '\u0421\u0443\u043c\u043c\u0430 \u043e\u043f\u043b\u0430\u0442\u044b', minLabel: '\u043c\u0438\u043d. 0.1 TON',
      customHint: '\u041c\u0438\u043d\u0438\u043c\u0443\u043c \u2014 0.1 TON. \u0421\u0442\u0440\u0435\u043b\u043a\u0438, \u043a\u043e\u043b\u0435\u0441\u043e \u043c\u044b\u0448\u0438 \u0438 \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u0440\u0430\u0431\u043e\u0442\u0430\u044e\u0442.',
      packsLabel: '\u0413\u043e\u0442\u043e\u0432\u044b\u0435 \u043f\u0430\u043a\u0435\u0442\u044b', customQtyLabel: '\u0421\u0432\u043e\u0451 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0437\u0432\u0451\u0437\u0434',
      starsHint: '<b>\u041f\u0430\u043a\u0435\u0442\u044b \u0432\u044b\u0433\u043e\u0434\u043d\u0435\u0435</b>, \u0431\u043e\u043b\u044c\u0448\u0438\u0435 \u043f\u0430\u043a\u0438 \u2014 \u0435\u0449\u0451 \u0432\u044b\u0433\u043e\u0434\u043d\u0435\u0435. \u0421\u0432\u043e\u0451 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u2014 \u0431\u0435\u0437 \u0441\u043a\u0438\u0434\u043a\u0438. \u0426\u0435\u043d\u0430 \u0432 TON \u043f\u043e \u0436\u0438\u0432\u043e\u043c\u0443 \u043a\u0443\u0440\u0441\u0443.',
      starsNoticeTitle: '\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430 \u0437\u0432\u0451\u0437\u0434',
      starsNoticeText: '\u041f\u043e\u0441\u043b\u0435 \u043e\u043f\u043b\u0430\u0442\u044b \u0437\u0432\u0451\u0437\u0434\u044b \u0437\u0430\u0447\u0438\u0441\u043b\u044f\u044e\u0442\u0441\u044f \u0432\u0440\u0443\u0447\u043d\u0443\u044e \u0432 \u0442\u0435\u0447\u0435\u043d\u0438\u0435 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u0438\u0445 \u043c\u0438\u043d\u0443\u0442.',
      durationLabel: '\u0421\u0440\u043e\u043a \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438',
      premiumHint: '\u041a\u043e \u0432\u0441\u0435\u043c \u0442\u0430\u0440\u0438\u0444\u0430\u043c \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d \u0441\u0435\u0440\u0432\u0438\u0441\u043d\u044b\u0439 \u0441\u0431\u043e\u0440 \u0436\u0438\u0432\u043e\u043c\u0443 \u043a\u0443\u0440\u0441\u0443. \u0412\u0441\u0451 \u0444\u0438\u043a\u0441\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u0432 TON.',
      mintBidLabel: '\u0420\u0430\u0437\u043c\u0435\u0440 \u0441\u0442\u0430\u0432\u043a\u0438', minBid50: '\u043c\u0438\u043d. 50 TON',
      mintHint: '\u0414\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438. \u041f\u0440\u0438\u043c\u0435\u0440: \u0441\u0442\u0430\u0432\u043a\u0430 100 TON \u2192 \u0434\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430 10 TON, \u0438\u0442\u043e\u0433 17 TON.',
      mintWaitTitle: '\u0421\u0440\u043e\u043a \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f',
      mintWaitText: '\u041c\u0438\u043d\u0442 \u0437\u0430\u043d\u0438\u043c\u0430\u0435\u0442 \u043e\u043a\u043e\u043b\u043e 1 \u043d\u0435\u0434\u0435\u043b\u0438. \u042d\u0442\u043e \u043d\u0435 \u043c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u0430\u044f \u0443\u0441\u043b\u0443\u0433\u0430: \u043f\u043e\u0441\u043b\u0435 \u043e\u043f\u043b\u0430\u0442\u044b \u043f\u0435\u0440\u0435\u0434\u0430\u0439\u0442\u0435 \u0442\u0435\u0433 \u0438 \u043a\u0430\u043d\u0430\u043b.',
      mintCondTitle: '\u0423\u0441\u043b\u043e\u0432\u0438\u0435 \u043c\u0438\u043d\u0442\u0430',
      mintCondText: '\u042e\u0437\u0435\u0440\u043d\u0435\u0439\u043c \u0434\u043e\u043b\u0436\u0435\u043d \u043d\u0430\u0445\u043e\u0434\u0438\u0442\u044c\u0441\u044f \u043d\u0430 \u043a\u0430\u043d\u0430\u043b\u0435 \u0432\u043b\u0430\u0434\u0435\u043b\u044c\u0446\u0430 \u043d\u0435 \u043c\u0435\u043d\u044c\u0448\u0435 2 \u043d\u0435\u0434\u0435\u043b\u044c.',
      nftWhatTitle: '\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 NFT-\u044e\u0437\u0435\u0440\u043d\u0435\u0439\u043c',
      nftWhatText: 'NFT-\u044e\u0437\u0435\u0440\u043d\u0435\u0439\u043c \u2014 \u0442\u043e\u043a\u0435\u043d\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 @username \u0432 TON \u0447\u0435\u0440\u0435\u0437 Fragment. \u041e\u043d \u0445\u0440\u0430\u043d\u0438\u0442\u0441\u044f \u043d\u0430 \u0432\u0430\u0448\u0435\u043c \u043a\u043e\u0448\u0435\u043b\u044c\u043a\u0435 \u0438 \u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043f\u043e\u043b\u043d\u043e\u0446\u0435\u043d\u043d\u044b\u043c NFT.',
      mintWalletLabel: '\u041a\u043e\u0448\u0435\u043b\u0451\u043a \u0434\u043b\u044f \u0437\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f NFT',
      mintWalletHint: 'NFT \u0432\u044b\u043f\u0443\u0441\u043a\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u0432\u0430\u0448 \u0432\u043d\u0435\u0448\u043d\u0438\u0439 TON-\u043a\u043e\u0448\u0435\u043b\u0451\u043a (Tonkeeper / MyTonWallet).',
      contactLabel: '\u0414\u043e\u043f. \u043a\u043e\u043d\u0442\u0430\u043a\u0442 \u0434\u043b\u044f \u0441\u0432\u044f\u0437\u0438 (\u043e\u043f\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u043e)',
      contactHint: '\u041d\u0430 \u0441\u043b\u0443\u0447\u0430\u0439, \u0435\u0441\u043b\u0438 \u0441\u0432\u044f\u0437\u044c \u0447\u0435\u0440\u0435\u0437 Telegram \u043d\u0435 \u0441\u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442. \u0428\u0430\u0433 \u043c\u043e\u0436\u043d\u043e \u043f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c.',
      boostTargetLabel: 'NFT-\u044e\u0437\u0435\u0440\u043d\u0435\u0439\u043c \u0434\u043b\u044f \u043f\u043e\u0432\u044b\u0448\u0435\u043d\u0438\u044f \u0441\u0442\u0430\u0432\u043a\u0438',
      boostTargetHint: '\u042e\u0437\u0435\u0440\u043d\u0435\u0439\u043c \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0432\u044b\u043f\u0443\u0449\u0435\u043d \u043a\u0430\u043a NFT \u043d\u0430 Fragment.',
      boostBidLabel: '\u0421\u0443\u043c\u043c\u0430 \u043f\u043e\u0432\u044b\u0448\u0435\u043d\u0438\u044f \u0441\u0442\u0430\u0432\u043a\u0438',
      boostHint: '\u041a \u043e\u043f\u043b\u0430\u0442\u0435 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430 \u043e\u0442 \u0432\u0432\u0435\u0434\u0451\u043d\u043d\u043e\u0439 \u0441\u0442\u0430\u0432\u043a\u0438. \u0422\u0430\u0440\u0438\u0444\u043d\u0430\u044f \u0441\u0435\u0442\u043a\u0430: 10% \u2192 7.5%.',
      returnWalletLabel: '\u041a\u043e\u0448\u0435\u043b\u0451\u043a \u0434\u043b\u044f \u0432\u043e\u0437\u0432\u0440\u0430\u0442\u0430 (\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e)',
      svc_custom_name: '\u041e\u043f\u043b\u0430\u0442\u0430 \u0442\u043e\u0432\u0430\u0440\u043e\u0432 \u0438 \u0443\u0441\u043b\u0443\u0433', svc_custom_sub: '\u041e\u043f\u043b\u0430\u0442\u0430 \u043b\u044e\u0431\u044b\u0445 \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0451\u043d\u043d\u044b\u0445 \u043f\u043e\u0437\u0438\u0446\u0438\u0439.',
      svc_mint_name: '\u041c\u0438\u043d\u0442 NFT-\u044e\u0437\u0435\u0440\u043d\u0435\u0439\u043c\u0430', svc_mint_sub: '\u0411\u0430\u0437\u0430 7 TON + \u0434\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430 \u043e\u0442 \u0441\u0442\u0430\u0432\u043a\u0438.',
      svc_boost_name: '\u041f\u043e\u0432\u044b\u0448\u0435\u043d\u0438\u0435 \u0441\u0442\u0430\u0432\u043a\u0438 \u043d\u0430 NFT', svc_boost_sub: '\u041e\u043f\u043b\u0430\u0442\u0430 \u2014 \u0434\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430 \u043e\u0442 \u0436\u0435\u043b\u0430\u0435\u043c\u043e\u0439 \u0441\u0443\u043c\u043c\u044b. \u0428\u043a\u0430\u043b\u0430 10% \u2192 7.5% \u2014 \u0447\u0435\u043c \u0432\u044b\u0448\u0435 \u0441\u0442\u0430\u0432\u043a\u0430, \u0442\u0435\u043c \u043d\u0438\u0436\u0435 %.',
      svc_stars_name: '\u041f\u043e\u043a\u0443\u043f\u043a\u0430 Telegram Stars', svc_stars_sub: '\u041f\u0430\u043a\u0435\u0442\u044b \u0432\u044b\u0433\u043e\u0434\u043d\u0435\u0435 + \u0441\u0432\u043e\u0451 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e.',
      svc_premium_name: 'Telegram Premium', svc_premium_sub: '3 / 6 / 12 \u043c\u0435\u0441. \u0432 TON.',
      sumService: '\u0423\u0441\u043b\u0443\u0433\u0430', sumBase: '\u0421\u0443\u043c\u043c\u0430', sumFee: '\u0414\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430',
      sumPromo: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434', sumDonation: '\u0414\u043e\u043d\u0430\u0442', sumRate: '\u041a\u0443\u0440\u0441 TON/USD', sumDiscount: '\u0421\u043a\u0438\u0434\u043a\u0430',
      sumWhen: '\u0414\u0430\u0442\u0430 / \u0432\u0440\u0435\u043c\u044f', sumTotal: '\u0418\u0442\u043e\u0433 \u043a \u043e\u043f\u043b\u0430\u0442\u0435',
      ctaText: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u043e\u0440\u0437\u0438\u043d\u0443', payNow: '\u041e\u043f\u043b\u0430\u0442\u0438\u0442\u044c',
      pickServiceTitle: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0441\u043b\u0443\u0433\u0443', pickServiceSub: '\u041a\u0430\u0436\u0434\u0430\u044f \u0443\u0441\u043b\u0443\u0433\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0441\u0432\u043e\u0439 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439.',
      usernameTitle: '\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0448\u0430\u0433 \u2014 \u044e\u0437\u0435\u0440\u043d\u0435\u0439\u043c',
      usernameSub: '\u042e\u0437\u0435\u0440\u043d\u0435\u0439\u043c \u043d\u0443\u0436\u0435\u043d \u0434\u043b\u044f \u0441\u0432\u044f\u0437\u0438 \u0438 \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438. \u0412 \u043a\u043e\u0434\u0435 \u043e\u043f\u043b\u0430\u0442\u044b \u043e\u043d \u0437\u0430\u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d.',
      yourUsername: '\u0412\u0430\u0448 username',
      btnCancel: '\u041e\u0442\u043c\u0435\u043d\u0430', btnSave: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c',
      receiptTitle: '\u041a\u043e\u0440\u0437\u0438\u043d\u0430 \u0438 \u0447\u0435\u043a',
      receiptSub: '\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0441\u043e\u0441\u0442\u0430\u0432. \u041f\u043e\u0441\u043b\u0435 \u043e\u043f\u043b\u0430\u0442\u044b \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u0447\u0435\u043a \u2014 \u043e\u043d \u043f\u0440\u0438\u0432\u044f\u0437\u0430\u043d \u043a \u0438\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u043e\u043c\u0443 \u043a\u043e\u0434\u0443.',
      codeLabel: '\u041a\u043e\u0434', rcWallet: '\u041a\u043e\u0448\u0435\u043b\u0451\u043a \u0434\u043b\u044f \u043e\u043f\u043b\u0430\u0442\u044b', rcComment: '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439',
      reasonLabel: 'Причина платежа', reasonHintTag: 'от этого зависит назначение',
      reasonOther: 'Другое (указать причину)', reasonServices: 'Оплата услуг', reasonDebt: 'Возврат долга',
      reasonDonation: 'Донат / поддержка', reasonGoods: 'Оплата товара', reasonPrepay: 'Предоплата / аванс',
      reasonDeposit: 'Бронь / депозит', reasonGift: 'Подарок', reasonAgreement: 'Оплата по договорённости', reasonTip: 'Чаевые',
      reasonCustomPh: 'Укажите причину платежа',
      promoTitle: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434', promoNote: '\u00ab#\u00bb \u0434\u043e\u0431\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438. \u0422\u043e\u043b\u044c\u043a\u043e \u0431\u0443\u043a\u0432\u044b \u0438 \u0446\u0438\u0444\u0440\u044b.',
      donationTitle: '\u0414\u043e\u043d\u0430\u0442', donationNote: '\u041c\u043e\u0436\u043d\u043e \u0434\u043e\u043a\u0438\u043d\u0443\u0442\u044c \u0441\u0432\u0435\u0440\u0445\u0443 \u043b\u044e\u0431\u0443\u044e \u0441\u0443\u043c\u043c\u0443 \u0438\u043b\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442 \u2014 \u043c\u043d\u0435 \u043f\u0440\u0438\u044f\u0442\u043d\u043e.',
      donateTitle: '\u0427\u0430\u0435\u0432\u044b\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u0443', donateSub: '\u041d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u2014 \u043d\u0430 \u0432\u0430\u0448\u0435 \u0443\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u0438\u0435.',
      donateCustom: 'Своя сумма (можно вместе с процентом)', donatePercentLabel: 'Процент от заказа', donateThanks: '\u0421\u043f\u0430\u0441\u0438\u0431\u043e \u0437\u0430 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443 \ud83e\udd1d', donateNone: '\u041d\u0435\u0442', donatePopular: '\u0442\u043e\u043f', donateTap: '\u0442\u044b\u043a',
      qrTitle: '\u0421\u043a\u0430\u043d\u0438\u0440\u0443\u0439\u0442\u0435 \u0434\u043b\u044f \u043e\u043f\u043b\u0430\u0442\u044b', qrSub: '\u041d\u0430\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u0430\u043c\u0435\u0440\u0443 \u0438\u043b\u0438 \u043a\u043e\u0448\u0435\u043b\u0451\u043a \u043d\u0430 \u043a\u043e\u0434 \u2014 \u0441\u0443\u043c\u043c\u0430 \u0438 \u0440\u0435\u043a\u0432\u0438\u0437\u0438\u0442\u044b \u043f\u043e\u0434\u0441\u0442\u0430\u0432\u044f\u0442\u0441\u044f \u0441\u0430\u043c\u0438.', qrSave: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043a\u043e\u0434',
      codeRefresh: '\u041d\u043e\u0432\u044b\u0439 \u043a\u0430\u0436\u0434\u044b\u0435 10 \u043c\u0438\u043d\u0443\u0442', qrTapHint: '\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 QR, \u0447\u0442\u043e\u0431\u044b \u0443\u0432\u0435\u043b\u0438\u0447\u0438\u0442\u044c',
      codeNext: 'До нового QR', watchAuto: 'Ищем оплату в блокчейне…', watchPaid: 'Оплата найдена — открываем чек', watchOffline: 'Автопроверка недоступна', watchTimeout: 'Время вышло — нажмите «Проверить»',
      qrSaveImg: 'Сохранить', qrShareCode: 'Поделиться кодом', qrShareDl: 'Скачать', qrShareFwd: 'Переслать', qrNew: 'Сделать новый', qrNewDone: 'Новый QR готов',
      iPaid: 'Я оплатил', cancelPay: 'Отмена',
      copyLink: 'Скопировать', copyWallet: 'Скопировать кошелёк', discCardLabel: 'Скидка на заказ',
      shareTg: 'Поделиться', qrFull: 'На весь экран', qrOpenHint: 'Открыть QR и проверку оплаты', codeRefreshBtn: 'Обновить код', shareTgText: 'Счёт на оплату · notelegram.com',
      infoTitle: '\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f',
      infoSub: '\u041a\u0430\u043a \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u0441\u0430\u0439\u0442, \u0446\u0435\u043d\u0430, \u043a\u043e\u0434, \u0447\u0442\u043e \u043f\u043e\u0441\u043b\u0435 \u043e\u043f\u043b\u0430\u0442\u044b.',
      tabAbout: '\u041e\u0431\u0449\u0435\u0435', tabFlow: '\u041a\u0430\u043a \u044d\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442', tabFaq: 'FAQ',
      userNotRegistered: '\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d', usernameLabelShort: 'USERNAME',
      regAccount: 'Ваш аккаунт', regReviews: 'Отзывов', reviewsBtn: 'Отзывы',
      packsDiscount: '\u0441\u043a\u0438\u0434\u043a\u0438 \u043d\u0430 \u043f\u0430\u043a\u0435\u0442\u044b', tiersDiscount: '\u0441\u043a\u0438\u0434\u043a\u0438 1\u20133%',
      agreeTitle: '\u041f\u0435\u0440\u0435\u0434 \u043e\u043f\u043b\u0430\u0442\u043e\u0439',
      agreeRule1: '\u042f \u043e\u0437\u043d\u0430\u043a\u043e\u043c\u0438\u043b\u0441\u044f \u0441 \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u043c\u0438 \u0443\u0441\u043b\u0443\u0433\u0438 \u0438 \u0441\u043e\u0433\u043b\u0430\u0441\u0435\u043d \u0441 \u043d\u0438\u043c\u0438.',
      agreeRule2: '\u0412\u043e\u0437\u0432\u0440\u0430\u0442 \u0432\u043e\u0437\u043c\u043e\u0436\u0435\u043d \u0442\u043e\u043b\u044c\u043a\u043e \u0435\u0441\u043b\u0438 \u043e\u0448\u0438\u0431\u043a\u0430 \u043f\u043e \u0432\u0438\u043d\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u0430, \u0430 \u043d\u0435 \u043f\u043e \u043d\u0435\u0432\u043d\u0438\u043c\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u0438. \u0421\u043f\u043e\u0440\u043d\u044b\u0435 \u0441\u043b\u0443\u0447\u0430\u0438 \u2014 \u0447\u0435\u0440\u0435\u0437 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443.',
      agreeRule3: '\u0417\u0430 \u0443\u0436\u0435 \u043e\u043a\u0430\u0437\u0430\u043d\u043d\u044b\u0435 \u0443\u0441\u043b\u0443\u0433\u0438 \u0432\u043e\u0437\u0432\u0440\u0430\u0442\u0430 \u043d\u0435\u0442.',
      agreeHold: '\u0417\u0430\u0436\u043c\u0438\u0442\u0435 \u043e\u0442\u043f\u0435\u0447\u0430\u0442\u043e\u043a, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c',
      agreeSlide: 'Ознакомлен — проведите для оплаты', agreeBack: 'Вернуться к деталям',
      agreeAck: 'Я прочитал детали заказа и согласен с условиями',
      agreeDone: '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e \u2014 \u043c\u043e\u0436\u043d\u043e \u043e\u043f\u043b\u0430\u0447\u0438\u0432\u0430\u0442\u044c',
      postMint: '\u041f\u0435\u0440\u0435\u0434\u0430\u0442\u044c \u0442\u0435\u0433 \u0438 \u043a\u0430\u043d\u0430\u043b \u0432 Telegram',
      postBoost: '\u041f\u0435\u0440\u0435\u0434\u0430\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435 \u0434\u043b\u044f \u043f\u043e\u0432\u044b\u0448\u0435\u043d\u0438\u044f \u0441\u0442\u0430\u0432\u043a\u0438',
      copied: '\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e.', linkCopied: '\u0421\u0441\u044b\u043b\u043a\u0430 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u0430.', walletCopied: '\u041a\u043e\u0448\u0435\u043b\u0451\u043a \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d.',
      codeCopied: '\u041a\u043e\u0434 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d.', copyFail: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c.',
      invalidUsername: 'Username \u043e\u0442 4 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432 \u043b\u0430\u0442\u0438\u043d\u0438\u0446\u0435\u0439. \u00ab_\u00bb \u043d\u0435 \u043f\u0435\u0440\u0432\u044b\u0439/\u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439, \u0431\u0435\u0437 \u00ab__\u00bb.',
      promoOk: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 #{c} \u043f\u0440\u0438\u043c\u0435\u043d\u0451\u043d: {l}.',
      promoBad: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 #{c} \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.',
      ctaConfirm: '\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u2014 \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u043e\u0440\u0437\u0438\u043d\u0443',
      ctaHintFill: 'Заполните поля, чтобы продолжить',
      ctaHintUser: '— указать @username',
      ctaHintCart: '— открыть корзину',
      ctaHintConfirm: 'ещё раз — открыть корзину',
      payHint: '— открыть кошелёк',
      cartStep1: 'Корзина', cartStep2: 'Оплата', cartOrderLabel: 'Ваш заказ',
      cartStepItems: 'Состав', cartStepDetails: 'Детали', cartStepPay: 'Оплата', cartStepReceipt: 'Чек',
      rrConfirmed: 'ОПЛАЧЕНО ✓', rrTagline: 'Платёж подтверждён в блокчейне TON', rrPayer: 'Плательщик',
      backPay: '← Оплата', receiptSupport: 'Поддержка', checkDetails: 'Проверить детали',
      wcTitle: 'Привязать кошелёк', wcSub: 'По желанию — подставим адрес в поля', wcConnect: 'Подключить',
      tgLoginHint: '…или войдите через Telegram', orWord: 'или', tgLogin: 'Войти через Telegram', tgLoginSub: 'Подтверждение в приложении', tgBot: 'Через бота', tgBotSub: 'Регистрация и заказы в чате',
      toDetails: 'Далее', backItems: '← Состав', backDetails: '← Детали', sumRecipient: 'Получатель',
      cartSwipeHint: 'свайп между шагами',
      payTotalLabel: 'К оплате', toPay: 'К оплате', backToCart: '← Корзина',
      i_about_1_t: '\u0427\u0442\u043e \u044d\u0442\u043e', i_about_1_b: '\u041c\u0438\u043d\u0438-\u0430\u043f\u043f\u043a\u0430 \u0434\u043b\u044f \u0431\u044b\u0441\u0442\u0440\u043e\u0439 \u043e\u043f\u043b\u0430\u0442\u044b \u0443\u0441\u043b\u0443\u0433 \u0432 TON.',
      i_about_2_t: '\u041a\u0430\u043a \u0444\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u0446\u0435\u043d\u0430', i_about_2_b: '\u041a\u0443\u0440\u0441 TON/USD \u043e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043a\u0430\u0436\u0434\u044b\u0435 15 \u0441\u0435\u043a.',
      i_about_3_t: '\u0418\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u0439 \u043a\u043e\u0434', i_about_3_b: '#XXXXXX-SVC-AMT-RND. Username \u0437\u0430\u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d.',
      i_about_4_t: '\u0427\u0435\u043a', i_about_4_b: '\u0412\u0441\u0435\u0433\u0434\u0430 \u0432\u0438\u0434\u043d\u043e: \u0443\u0441\u043b\u0443\u0433\u0443, \u0441\u0443\u043c\u043c\u0443, \u043a\u043e\u043c\u0438\u0441\u0441\u0438\u044e, \u043a\u0443\u0440\u0441, \u043a\u043e\u0434, \u0432\u0440\u0435\u043c\u044f \u0438 \u0438\u0442\u043e\u0433.',
      i_about_5_t: '\u0421\u043a\u043e\u0440\u043e\u0441\u0442\u044c', i_about_5_b: '\u0421\u0432\u0435\u0440\u043a\u0430 \u0432\u0440\u0443\u0447\u043d\u0443\u044e. \u0412 \u043f\u0438\u043a\u043e\u0432\u044b\u0435 \u0447\u0430\u0441\u044b \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u0435 \u0434\u043e 24\u202b\u202c\u0447.',
      i_flow_1_t: '1. \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0441\u043b\u0443\u0433\u0443', i_flow_1_b: '\u041f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u043d\u0443\u0436\u043d\u044b\u0435 \u043f\u043e\u043b\u044f.',
      i_flow_2_t: '2. \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0430\u043d\u043d\u044b\u0435', i_flow_2_b: '\u0421\u0443\u043c\u043c\u0430 \u043c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f.',
      i_flow_3_t: '3. \u0410 \u043f\u043e\u0442\u043e\u043c \u044e\u0437\u0435\u0440\u043d\u0435\u0439\u043c', i_flow_3_b: '\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0435\u0433\u043e \u0432 \u0441\u0430\u043c\u043e\u043c \u043a\u043e\u043d\u0446\u0435 \u2014 \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u043a\u043e\u0440\u0437\u0438\u043d\u0430.',
      i_flow_4_t: '4. \u041e\u043f\u043b\u0430\u0442\u0438\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 Tonkeeper', i_flow_4_b: '\u0421\u0441\u044b\u043b\u043a\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 Tonkeeper \u0441 \u0433\u043e\u0442\u043e\u0432\u044b\u043c\u0438 \u0440\u0435\u043a\u0432\u0438\u0437\u0438\u0442\u0430\u043c\u0438.',
      i_flow_5_t: '5. \u041f\u043e\u0441\u043b\u0435 \u043e\u043f\u043b\u0430\u0442\u044b', i_flow_5_b: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u0447\u0435\u043a. \u0414\u043b\u044f \u043c\u0438\u043d\u0442/boost \u2014 \u043f\u0435\u0440\u0435\u0434\u0430\u0439\u0442\u0435 \u0442\u0435\u0433.',
      i_faq_1_q: '\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 NFT-\u044e\u0437\u0435\u0440\u043d\u0435\u0439\u043c?', i_faq_1_a: '\u0422\u043e\u043a\u0435\u043d\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 @username \u043d\u0430 Fragment, \u0445\u0440\u0430\u043d\u0438\u0442\u0441\u044f \u043d\u0430 \u043a\u043e\u0448\u0435\u043b\u044c\u043a\u0435.',
      i_faq_2_q: '\u041a\u0430\u043a \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f Stars / Premium?', i_faq_2_a: 'Stars \u2014 \u043f\u0430\u043a\u0435\u0442\u044b \u0432\u044b\u0433\u043e\u0434\u043d\u0435\u0435, \u0432\u0441\u0451 \u0432 TON. Premium \u2014 \u0444\u0438\u043a\u0441 \u0432 TON \u043f\u043e \u043a\u0443\u0440\u0441\u0443.',
      i_faq_3_q: '\u0427\u0442\u043e \u0435\u0441\u043b\u0438 \u043a\u0443\u0440\u0441 \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u0441\u044f?', i_faq_3_a: '\u0421\u0443\u043c\u043c\u0430 \u0432 TON \u043e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0436\u0438\u0432\u044c\u0451\u043c. \u041f\u0440\u0438 \u00ab\u041e\u043f\u043b\u0430\u0442\u0438\u0442\u044c\u00bb \u0444\u0438\u043a\u0441\u0438\u0440\u0443\u0435\u0442\u0441\u044f.',
      i_faq_4_q: '\u0427\u0442\u043e \u0434\u0435\u043b\u0430\u0442\u044c \u043f\u043e\u0441\u043b\u0435 \u043e\u043f\u043b\u0430\u0442\u044b?', i_faq_4_a: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u0447\u0435\u043a. \u0414\u043b\u044f \u043c\u0438\u043d\u0442/boost \u2014 \u043f\u0435\u0440\u0435\u0434\u0430\u0439\u0442\u0435 \u0434\u0430\u043d\u043d\u044b\u0435.',
      i_faq_5_q: '\u041c\u043e\u0436\u043d\u043e \u0432\u0435\u0440\u043d\u0443\u0442\u044c?', i_faq_5_a: '\u0414\u043e \u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f \u2014 \u0434\u0430.',
      cmtUser: '\u044e\u0437', cmtSvc: '\u0443\u0441\u043b\u0443\u0433\u0430', cmtItem: '\u043f\u043e\u0437\u0438\u0446\u0438\u044f', cmtBase: '\u0431\u0430\u0437\u0430', cmtFee: '\u0434\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0430',
      cmtDonation: '\u0434\u043e\u043d\u0430\u0442', cmtPromo: '\u043f\u0440\u043e\u043c\u043e\u043a\u043e\u0434', cmtRate: '\u043a\u0443\u0440\u0441', cmtTotal: '\u0438\u0442\u043e\u0433', cmtCode: '\u043a\u043e\u0434',
      cmtMonths: '\u043c\u0435\u0441\u044f\u0446\u0435\u0432', cmtStars: '\u0437\u0432\u0451\u0437\u0434', cmtTarget: '\u0446\u0435\u043b\u044c', cmtReturn: '\u0432\u043e\u0437\u0432\u0440\u0430\u0442',
      cmtWallet: '\u043a\u043e\u0448\u0435\u043b\u0451\u043a', cmtContact: '\u043a\u043e\u043d\u0442\u0430\u043a\u0442',
      cmtGift: 'получатель', cmtSelf: 'себе',
      premiumGiftLabel: 'Кому подарить Premium',
      premiumGiftHint: 'Оставьте пустым — оформится на вас. Укажите @username получателя, если это подарок.',
      svc_deal_name: 'Сделка', svc_deal_sub: 'Официальная оплата по сделке.',
      dealCurLabel: 'Валюта сделки', dealAmountLabel: 'Сумма сделки',
      dealHint: 'Сумма сделки в выбранной валюте. С кем и за что — укажете на шаге «Детали», либо вставьте код сделки.',
      dealNoticeTitle: 'Как проходит сделка',
      dealNoticeText: 'Я отправляю ссылку — вы заполняете данные и оплачиваете. Сделка фиксируется официально: в чеке остаются сумма, код, дата и стороны. Чек можно переслать в отзывы.',
      mintFlowTitle: 'Как проходит минт — по шагам',
      mintFlowText: '1. После оплаты я получаю уведомление — связываемся. 2. Вы передаёте мне открытый канал с юзернеймом (именно канал, не просто тег) на специальный аккаунт, который я укажу. 3. Я выставляю юзернейм на аукцион fragment.com за 10 TON (GRAM) — аукцион идёт неделю. 4. Через неделю юзернейм становится NFT — отправляю его на ваш кошелёк (±1 день).',
      mint2faTitle: 'Нужен пароль 2FA',
      mint2faText: 'Для передачи канала вы должны знать свой пароль 2FA. Если он потерян — восстановление займёт ещё около недели, и за эту задержку деньги не возвращаются. Юзернейм должен быть на канале не меньше 2 недель. После запуска минта возврат невозможен.',
      mintBidTitle: 'Если ставку перебьют',
      mintBidText: 'До 3 перебитий свыше 2 TON каждое я перекрываю за счёт сервиса — без доплат. Хотите итоговую ставку выше — доплата по тарифу «Повышение ставки», но без лимита в 50 TON. Сумму ставки можно изменить доплатой через «Оплату товаров и услуг».',
      receiptChatTitle: 'Чек дублируется мне в чат',
      receiptChatText: 'Каждый чек автоматически дублируется мне. Лучше всего писать уже с чеком — либо сначала спросить, работает ли сервис сейчас.',
      boostFlowTitle: 'Как работает накрутка',
      boostFlowText: 'Вы передаёте мне NFT-юзернейм — я выставляю его на ПРОДАЖУ на fragment.com за нужную вам сумму и выкупаю со второго кошелька. Видимая цена растёт. Fragment забирает 5% — это входит в комиссию. После — NFT возвращается на указанный кошелёк для возврата. Детали обговариваем в личке.',
      boostNoRefundTitle: 'Возврат по ставке',
      boostNoRefundText: 'После запуска операции деньги за ставку не возвращаются. Сумму можно увеличить доплатой через «Оплату товаров и услуг».',
      reasonNoteOther: 'Без указания причины платёж считается донатом (добровольной поддержкой), а не оплатой товара или услуги.',
      footTag: 'Независимый сервис оплаты Telegram-услуг через TON. Не связан с Telegram.',
      footDiscOpen: 'Дисклеймер и условия пользования',
      footMadeWith: 'сделано частным лицом с помощью ИИ',
      discTitle: 'Дисклеймер и условия пользования',
      linksTitle: 'Связь и режим работы', linksHoursK: 'Поддержка · ручные услуги',
      linksAutoK: 'Авто-услуги', linksAutoV: 'Stars, Premium — 24/7, мгновенно',
      linksManualK: 'Ручные заявки', linksManualV: 'ответ до 12 часов',
      linkReviews: 'Канал с отзывами', linkSupport: 'Поддержка / связь', linkTbd: 'ссылка появится позже',
      vrDownload: 'Скачать PDF', vrExplorer: 'В эксплорере', vrPaid: 'Оплачено', vrTime: 'Подтверждено', vrTx: 'Транзакция',
      regTgTitle: 'Регистрация через Telegram', regTgSub: 'Подтянем аватар и @username',
      bidPacksLabel: 'Готовые ставки', bidPacksDiscount: 'скидки на ставку',
      mintInfoToggle: 'Условия, сроки и предупреждения', mintInfoCount: 'важное',
      hoursPlateLabel: 'Поддержка · ручные', hoursPlateAuto: 'Авто: Stars, Premium — 24/7',
      hoursWarn: 'Сейчас вне рабочих часов (16:30–00:00 МСК). Ручные услуги и поддержка могут ответить с задержкой — я могу быть не на связи (ответ до ~12 ч). Авто-услуги (Stars, Premium) зачисляются круглосуточно.',
      refundTitle: 'Возвраты — вы остаётесь в плюсе',
      refundText: 'Если юзернейм потерян по нашей вине (ставку перебили, ошибка сервиса и т.п.): за сам юзернейм (только канал) возвращаем $3, а за услугу — ВСЕ потраченные вами деньги плюс скидку на следующую покупку. То есть в итоге вы уходите в плюс.'
    },
    en: {
      panelService: 'Service', panelParams: 'Payment settings', liveRate: 'Rate',
      isFor100: 'for 100\u2b50', isMin: 'min. top-up', isRate: 'TON rate',
      yourTelegram: 'Your Telegram @username',
      enterToSave: '\u2014 save and continue',
      amountLabel: 'Payment amount', minLabel: 'min. 0.1 TON',
      customHint: 'Minimum 0.1 TON. Arrows, mouse wheel and slider work.',
      packsLabel: 'Ready packs', customQtyLabel: 'Custom star quantity',
      starsHint: '<b>Packs are cheaper</b>, larger packs even better. Custom qty \u2014 no discount. Price in TON by live rate.',
      starsNoticeTitle: 'How stars are delivered',
      starsNoticeText: 'After payment, stars are credited manually within a few minutes.',
      durationLabel: 'Subscription duration',
      premiumHint: 'Price is fixed in TON by the live rate. Tap a card to see TON value.',
      mintBidLabel: 'Bid amount', minBid50: 'min. 50 TON',
      mintHint: 'Commission is calculated automatically. Example: 100 TON bid \u2192 10 TON fee, 17 TON total.',
      mintWaitTitle: 'Lead time',
      mintWaitText: 'Mint takes about 1 week. After payment, send the tag and channel.',
      mintCondTitle: 'Mint condition',
      mintCondText: 'The username must be on the owner channel for at least 2 weeks.',
      nftWhatTitle: 'What is an NFT username',
      nftWhatText: 'NFT username \u2014 a tokenized @username on TON via Fragment. Stored on your wallet, fully transferable NFT.',
      mintWalletLabel: 'Wallet for NFT delivery',
      mintWalletHint: 'NFT is minted to your external TON wallet (Tonkeeper / MyTonWallet).',
      contactLabel: 'Extra contact (optional)',
      contactHint: 'In case Telegram contact fails. You can skip this step.',
      boostTargetLabel: 'NFT username to boost',
      boostTargetHint: 'The username must already be minted as NFT on Fragment.',
      boostBidLabel: 'Bid increase amount',
      boostHint: 'You pay only commission of the bid. Tier 10% \u2192 7.5%.',
      returnWalletLabel: 'Return wallet (required)',
      svc_custom_name: 'Goods & services payment', svc_custom_sub: 'Payment for any agreed item.',
      svc_mint_name: 'NFT username mint', svc_mint_sub: '7 TON base + bid add-on.',
      svc_boost_name: 'NFT bid increase', svc_boost_sub: 'You pay a commission of the target bid. Tier 10% \u2192 7.5% \u2014 higher bid, lower %.',
      svc_stars_name: 'Telegram Stars', svc_stars_sub: 'Packs cheaper + custom quantity.',
      svc_premium_name: 'Telegram Premium', svc_premium_sub: '3 / 6 / 12 mo. in TON.',
      sumService: 'Service', sumBase: 'Amount', sumFee: 'Add-on service',
      sumPromo: 'Promo code', sumDonation: 'Donation', sumRate: 'TON/USD rate', sumDiscount: 'Discount',
      sumWhen: 'Date / time', sumTotal: 'Total to pay',
      ctaText: 'Open cart', payNow: 'Pay now',
      pickServiceTitle: 'Pick a service', pickServiceSub: 'Each service opens its own flow.',
      usernameTitle: 'Last step \u2014 your username',
      usernameSub: 'Username is for contact and delivery. It is hashed in the payment code.',
      yourUsername: 'Your username',
      btnCancel: 'Cancel', btnSave: 'Save',
      receiptTitle: 'Cart & receipt',
      receiptSub: 'Check the composition. After payment, save the receipt \u2014 it is tied to the individual code.',
      codeLabel: 'Code', rcWallet: 'Wallet for payment', rcComment: 'Comment',
      reasonLabel: 'Payment reason', reasonHintTag: 'this sets the purpose',
      reasonOther: 'Other (specify reason)', reasonServices: 'Payment for services', reasonDebt: 'Debt repayment',
      reasonDonation: 'Donation / support', reasonGoods: 'Payment for goods', reasonPrepay: 'Prepayment / advance',
      reasonDeposit: 'Booking / deposit', reasonGift: 'Gift', reasonAgreement: 'Payment by agreement', reasonTip: 'Tip',
      reasonCustomPh: 'State the payment reason',
      promoTitle: 'Promo code', promoNote: '\u00ab#\u00bb is added automatically. Letters/digits only.',
      donationTitle: 'Donation', donationNote: 'Add anything on top \u2014 flat amount or percent.',
      donateTitle: 'Tip the service', donateSub: 'Optional — at your discretion.',
      donateCustom: 'Custom amount (can combine with %)', donatePercentLabel: 'Percent of the order', donateThanks: 'Thanks for the support \ud83e\udd1d', donateNone: 'None', donatePopular: 'top', donateTap: 'tap',
      qrTitle: 'Scan to pay', qrSub: 'Point your camera or wallet at the code \u2014 amount and details fill in automatically.', qrSave: 'Save code',
      codeRefresh: 'New every 10 min', qrTapHint: 'Tap the QR to enlarge',
      codeNext: 'Next QR in', watchAuto: 'Searching the blockchain…', watchPaid: 'Payment found — opening receipt', watchOffline: 'Auto-check unavailable', watchTimeout: 'Timed out — tap “Recheck”',
      qrSaveImg: 'Save', qrShareCode: 'Share code', qrShareDl: 'Download', qrShareFwd: 'Forward', qrNew: 'New QR', qrNewDone: 'Fresh QR ready',
      iPaid: "I've paid", cancelPay: 'Cancel',
      copyLink: 'Copy', copyWallet: 'Copy wallet', discCardLabel: 'Order discount',
      shareTg: 'Share', qrFull: 'Fullscreen', qrOpenHint: 'Open QR & payment check', codeRefreshBtn: 'Refresh code', shareTgText: 'Payment link · notelegram.com',
      infoTitle: 'Info',
      infoSub: 'How the site works, prices, code, what to do after.',
      tabAbout: 'About', tabFlow: 'Flow', tabFaq: 'FAQ',
      userNotRegistered: 'Not set', usernameLabelShort: 'USERNAME',
      regAccount: 'Your account', regReviews: 'Reviews', reviewsBtn: 'Reviews',
      packsDiscount: 'pack discounts', tiersDiscount: '1\u20133% off',
      agreeTitle: 'Before you pay',
      agreeRule1: 'I have read the service terms and agree to them.',
      agreeRule2: 'Refunds are possible only if the error is the service\u2019s fault, not your inattention. Disputes go through support.',
      agreeRule3: 'No refunds for services already rendered.',
      agreeHold: 'Hold the fingerprint to confirm',
      agreeSlide: 'I’ve read it — slide to pay', agreeBack: 'Back to details',
      agreeAck: 'I’ve read the order details and agree to the terms',
      agreeDone: 'Confirmed \u2014 you can pay',
      postMint: 'Send the tag and channel in Telegram',
      postBoost: 'Send the boost details in Telegram',
      copied: 'Copied.', linkCopied: 'Link copied.', walletCopied: 'Wallet copied.',
      codeCopied: 'Code copied.', copyFail: 'Copy failed.',
      invalidUsername: 'Username 4+ Latin chars. \u00ab_\u00bb not first/last, no \u00ab__\u00bb.',
      promoOk: 'Promo code #{c} applied: {l}.',
      promoBad: 'Promo code #{c} not found.',
      ctaConfirm: 'Press again to open cart',
      ctaHintFill: 'Fill in the fields to continue',
      ctaHintUser: '— enter your @username',
      ctaHintCart: '— open the cart',
      ctaHintConfirm: 'again — open the cart',
      payHint: '— open wallet',
      cartStep1: 'Cart', cartStep2: 'Payment', cartOrderLabel: 'Your order',
      cartStepItems: 'Items', cartStepDetails: 'Details', cartStepPay: 'Payment', cartStepReceipt: 'Receipt',
      rrConfirmed: 'PAID ✓', rrTagline: 'Payment confirmed on the TON blockchain', rrPayer: 'Payer',
      backPay: '← Payment', receiptSupport: 'Support', checkDetails: 'Check details',
      wcTitle: 'Link a wallet', wcSub: 'Optional — we autofill the address', wcConnect: 'Connect',
      tgLoginHint: '…or sign in with Telegram', orWord: 'or', tgLogin: 'Sign in with Telegram', tgLoginSub: 'Confirm in the app', tgBot: 'Via the bot', tgBotSub: 'Register & track in chat',
      toDetails: 'Next', backItems: '← Items', backDetails: '← Details', sumRecipient: 'Recipient',
      cartSwipeHint: 'swipe between steps',
      payTotalLabel: 'To pay', toPay: 'To payment', backToCart: '← Cart',
      i_about_1_t: 'What is this', i_about_1_b: 'A mini-app for fast TON service payments.',
      i_about_2_t: 'Pricing', i_about_2_b: 'TON/USD rate updates every 15 sec.',
      i_about_3_t: 'Individual code', i_about_3_b: '#XXXXXX-SVC-AMT-RND. Username is hashed.',
      i_about_4_t: 'Receipt', i_about_4_b: 'Always shows: service, amount, commission, rate, code, time and total.',
      i_about_5_t: 'Speed', i_about_5_b: 'Manual verification. Peak hours up to 24h.',
      i_flow_1_t: '1. Pick a service', i_flow_1_b: 'Only relevant fields will appear.',
      i_flow_2_t: '2. Enter data', i_flow_2_b: 'Amount converts instantly.',
      i_flow_3_t: '3. Then username', i_flow_3_b: 'Add it at the very end \u2014 the cart opens.',
      i_flow_4_t: '4. Pay via Tonkeeper', i_flow_4_b: 'The link opens Tonkeeper.',
      i_flow_5_t: '5. After payment', i_flow_5_b: 'Save the receipt. For mint/boost \u2014 send the tag.',
      i_faq_1_q: 'What is an NFT username?', i_faq_1_a: 'A tokenized @username on Fragment, stored on a wallet.',
      i_faq_2_q: 'How are Stars / Premium priced?', i_faq_2_a: 'Stars \u2014 packs cheaper, all in TON. Premium \u2014 fixed TON via rate.',
      i_faq_3_q: 'What if the rate changes?', i_faq_3_a: 'TON updates live. Locked on Pay.',
      i_faq_4_q: 'After payment?', i_faq_4_a: 'Save the receipt. For mint/boost \u2014 send the tag.',
      i_faq_5_q: 'Refund?', i_faq_5_a: 'Before execution starts \u2014 yes.',
      cmtUser: 'user', cmtSvc: 'service', cmtItem: 'item', cmtBase: 'base', cmtFee: 'add-on',
      cmtDonation: 'donation', cmtPromo: 'promo', cmtRate: 'rate', cmtTotal: 'total', cmtCode: 'code',
      cmtMonths: 'months', cmtStars: 'stars', cmtTarget: 'target', cmtReturn: 'return',
      cmtWallet: 'wallet', cmtContact: 'contact',
      cmtGift: 'recipient', cmtSelf: 'self',
      premiumGiftLabel: 'Who is Premium for',
      premiumGiftHint: 'Leave empty to buy Premium for yourself. Enter the recipient @username if it is a gift.',
      svc_deal_name: 'Deal', svc_deal_sub: 'Official payment for a specific deal.',
      dealCurLabel: 'Deal currency', dealAmountLabel: 'Deal amount',
      dealHint: 'Deal amount in the selected currency. Who and what for — on the “Details” step, or paste a deal code.',
      dealNoticeTitle: 'How a deal works',
      dealNoticeText: 'I send a link — you fill in the details and pay. The deal is recorded officially: the receipt keeps the amount, code, date and parties. You can forward the receipt to the reviews channel.',
      mintFlowTitle: 'How minting works — step by step',
      mintFlowText: '1. After payment I get a notification — we get in touch. 2. You transfer the open channel holding the username (the channel itself, not just the tag) to a special account I provide. 3. I list the username on the fragment.com auction for 10 TON (GRAM) — the auction runs for a week. 4. After a week the username becomes an NFT — I send it to your wallet (±1 day).',
      mint2faTitle: '2FA password required',
      mint2faText: 'To transfer the channel you must know your 2FA password. If it is lost, recovery takes about another week, and money is not refunded for that delay. The username must have been on the channel for at least 2 weeks. Once minting starts, refunds are not possible.',
      mintBidTitle: 'If your bid gets outbid',
      mintBidText: 'I cover up to 3 outbids of over 2 TON each at the service’s expense — no surcharge. Want a higher final bid — surcharge per the “Bid increase” tariff, but without the 50 TON limit. The bid amount can be changed by paying extra via “Goods & services payment”.',
      receiptChatTitle: 'The receipt is mirrored to my chat',
      receiptChatText: 'Every receipt is automatically mirrored to me. It is best to message me with the receipt already attached — or first ask whether the service is online right now.',
      boostFlowTitle: 'How the boost works',
      boostFlowText: 'You hand me the NFT username — I list it FOR SALE on fragment.com at your desired amount and buy it back from a second wallet. The visible price rises. Fragment takes 5% — included in the commission. Afterwards the NFT is returned to the specified return wallet. Details are arranged in DM.',
      boostNoRefundTitle: 'Bid refunds',
      boostNoRefundText: 'Once the operation starts, the bid amount is non-refundable. You can increase it by paying extra via “Goods & services payment”.',
      reasonNoteOther: 'Without a stated reason, the payment is treated as a donation (voluntary support), not payment for goods or a service.',
      footTag: 'An independent service for paying Telegram services via TON. Not affiliated with Telegram.',
      footDiscOpen: 'Disclaimer & terms of use',
      footMadeWith: 'made by a private individual with the help of AI',
      discTitle: 'Disclaimer & terms of use',
      linksTitle: 'Contacts & working hours', linksHoursK: 'Support · manual orders',
      linksAutoK: 'Auto services', linksAutoV: 'Stars, Premium — 24/7, instant',
      linksManualK: 'Manual orders', linksManualV: 'reply within 12 hours',
      linkReviews: 'Reviews channel', linkSupport: 'Support / contact', linkTbd: 'link coming soon',
      vrDownload: 'Download PDF', vrExplorer: 'In explorer', vrPaid: 'Paid', vrTime: 'Confirmed', vrTx: 'Transaction',
      regTgTitle: 'Sign up with Telegram', regTgSub: 'We’ll pull your avatar and @username',
      bidPacksLabel: 'Preset bids', bidPacksDiscount: 'bid discounts',
      mintInfoToggle: 'Terms, timing & warnings', mintInfoCount: 'important',
      hoursPlateLabel: 'Support · manual', hoursPlateAuto: 'Auto: Stars, Premium — 24/7',
      hoursWarn: 'Outside working hours now (16:30–00:00 MSK). Manual orders and support may be delayed — I might be offline (reply within ~12h). Auto services (Stars, Premium) are credited 24/7.',
      refundTitle: 'Refunds — you come out ahead',
      refundText: 'If the username is lost through our fault (bid outbid, service error, etc.): for the username itself (channel only) we refund $3, and for the service — ALL the money you spent, plus a discount on your next purchase. So you actually end up in the plus.'
    }
  };

  // Receiving wallet comes from payment-config.js (single source of truth).
  const WALLET = (window.AWM_PAYCONFIG && window.AWM_PAYCONFIG.receiveWallet)
    || 'UQCA1IrxpvIR0Xpub1elImv7lF1o5QcPaF6FsEcwf73zhvM4';

  const state = {
    lang: 'ru',
    service: 'custom',
    username: '',
    customAmountTon: 0,
    customReason: 'other',
    customReasonText: '',
    dealAmountTon: 0,
    dealCounterparty: '',
    dealDesc: '',
    dealCurrency: 'TON',
    comment: '',
    starsQty: 100,
    premiumMonths: 3,
    mintBidTon: 0,
    boostBidTon: 50,
    boostTarget: '',
    starsRecipient: '',
    mintWallet: '',
    mintContact: '',
    boostContact: '',
    returnWallet: '',
    contact: '',
    agreed: false,
    premiumGift: '',
    donationFlat: 0,
    donationPercent: 0,
    promoCode: '',
    pendingCode: null,
    ctaArmed: false   // after username save, CTA needs second press
  };

  const PROMOS = {
    AWM10: { type: 'percent', value: 10, label: '\u22120% \u00b7 10%' },
    VIP15: { type: 'percent', value: 15, label: '\u221215%' },
    AWM5:  { type: 'fixed',   value: 5,  label: '\u22125 TON' }
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const byId = (id) => document.getElementById(id);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const parseNum = (v) => Number(String(v ?? '').replace(',', '.')) || 0;
  const toNano = (ton) => Math.round(Math.max(0, ton) * 1e9);

  // ---------- Username sanitizer ----------
  const RU_LAYOUT = {
    'й':'q','ц':'w','у':'e','к':'r','е':'t','н':'y','г':'u','ш':'i','щ':'o','з':'p',
    'ф':'a','ы':'s','в':'d','а':'f','п':'g','р':'h','о':'j','л':'k','д':'l',
    'я':'z','ч':'x','с':'c','м':'v','и':'b','т':'n','ь':'m'
  };
  // Uppercase variant so wallet addresses (mixed-case base64url) transliterate too.
  const RU_LAYOUT_UP = {};
  Object.keys(RU_LAYOUT).forEach(k => { RU_LAYOUT_UP[k.toUpperCase()] = RU_LAYOUT[k].toUpperCase(); });
  // Wallet input: a user typing on a Russian layout still gets a valid Latin
  // address — each Cyrillic key maps to the Latin letter on the same key, case
  // preserved. Anything outside the wallet alphabet (A–Z a–z 0–9 _ -) is dropped.
  function translitWallet(raw) {
    let s = Array.from(String(raw ?? '')).map(ch => RU_LAYOUT[ch] ?? RU_LAYOUT_UP[ch] ?? ch).join('');
    return s.replace(/[^A-Za-z0-9_\-]/g, '');
  }
  function applyUsernameLive(raw) {
    let s = String(raw ?? '').trim().replace(/^@+/, '').toLowerCase();
    s = Array.from(s).map(ch => RU_LAYOUT[ch] ?? ch).join('');
    s = s.replace(/-/g, '_');
    s = s.replace(/[^a-z0-9_]/g, '');
    s = s.replace(/__+/g, '_');
    s = s.replace(/^[_0-9]+/, '');
    return s;
  }
  function isValidUsername(u) {
    const n = applyUsernameLive(u);
    return n.length >= 4 && /^[a-z][a-z0-9_]*$/.test(n) && !n.endsWith('_') && !n.includes('__');
  }

  function normalizeDecimal(v) {
    let s = String(v ?? '').replace(/\s/g, '').replace(/\./g, ',').replace(/[^\d,]/g, '');
    const i = s.indexOf(',');
    if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, '');
    if (s.startsWith(',')) s = '0' + s;
    return s;
  }
  function formatDecimalDisplay(n) {
    if (n === 0) return '0';
    const s = (Math.round(n * 1000) / 1000).toString();
    return s.replace('.', ',');
  }

  // ---------- i18n apply ----------
  function applyI18n() {
    const tr = T[state.lang];
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (tr[k] != null) {
        if (k === 'starsHint') el.innerHTML = tr[k];
        else el.textContent = tr[k];
      }
    });
    $$('[data-i18n-ph]').forEach(el => {
      const k = el.dataset.i18nPh;
      if (tr[k] != null) el.setAttribute('placeholder', tr[k]);
    });
    renderHero();
    renderServicePicker();
    renderServiceOptions();
    renderStarPacks();
    renderTiers();
    renderBidPacks('mint');
    renderBidPacks('boost');
    syncModeUI();
    renderUserPill();
  }

  // ---------- Hero per service ----------
  function renderHero() {
    const h = (HEROS[state.service] || HEROS.custom)[state.lang];
    byId('heroKicker').textContent = h.kicker;
    byId('heroTitle').textContent = h.title;
    byId('heroSub').textContent = h.sub;
  }

  // ---------- Rate chip ----------
  let lastRate = null;
  const rateHistory = [];
  function pushRateHistory(v) {
    rateHistory.push(v);
    if (rateHistory.length > 120) rateHistory.shift();
  }
  function drawSparkline() { startChart(); }   // back-compat: ensure the loop runs

  // ---- Live REAL-price chart -------------------------------------------------
  // ONE rAF loop continuously scrolls a line built from the REAL TON price.
  // `disp` glides toward the true rate (NO fake noise — the price shown is real);
  // samples are taken at a steady cadence and the line is drawn with a sub-sample
  // horizontal offset, so it scrolls perfectly smoothly even though the API only
  // refreshes every few seconds.
  const Chart = {
    pts: [], disp: null, mid: null, half: null, raf: null,
    accent: [120,170,255], accentTarget: [120,170,255], N: 220
  };
  function startChart() {
    if (Chart.raf) return;
    const loop = () => {
      Chart.raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      chartFrame();
    };
    Chart.raf = requestAnimationFrame(loop);
  }
  // One smooth sample per animation frame: `disp` glides toward the REAL price,
  // so the buffer is always a smooth curve and the line scrolls ~1px per frame
  // (no per-sample stepping → never jerky).
  function chartFrame() {
    const real = RateStore.tonUsd;
    if (real && RateStore.lastSource !== 'fallback') {
      if (Chart.disp == null) { Chart.disp = real; for (let i = 0; i < Chart.N; i++) Chart.pts.push(real); }
      Chart.disp += (real - Chart.disp) * 0.06;          // glide toward the real price
      // Ambient ripple — a smooth blend of waves so the line is visibly ALIVE
      // (clearly moving up & down) without any jerk. The label still shows the
      // real price; this only animates the drawn curve.
      Chart._ph = (Chart._ph || 0) + 0.05;
      const ripple = real * 0.0019 * (Math.sin(Chart._ph) + 0.5 * Math.sin(Chart._ph * 0.37 + 1.3) + 0.3 * Math.sin(Chart._ph * 2.1));
      Chart.pts.push(Chart.disp + ripple);
      while (Chart.pts.length > Chart.N) Chart.pts.shift();
    }
    drawChartFrame();
  }
  // Smoothly recolour the chart toward a new accent (rgb "r,g,b").
  function setSparklineAccent(rgbStr) {
    const t = String(rgbStr).split(',').map(n => +n.trim());
    if (t.length === 3 && t.every(n => !isNaN(n))) Chart.accentTarget = t;
  }
  function drawChartFrame() {
    const cv = byId('rateChart');
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = cv.clientWidth || 200, cssH = 48;
    if (cv.width !== Math.round(cssW * dpr) || cv.height !== Math.round(cssH * dpr)) {
      cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const pts = Chart.pts;
    if (pts.length < 2) {
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(state.lang === 'ru' ? 'сбор данных…' : 'collecting…', 10, 28);
      return;
    }
    // accent tween
    for (let i = 0; i < 3; i++) {
      const d = Chart.accentTarget[i] - Chart.accent[i];
      Chart.accent[i] = Math.abs(d) > 0.5 ? Chart.accent[i] + d * 0.16 : Chart.accentTarget[i];
    }
    // CALM vertical scale: a band around the mid with a MINIMUM width, so tiny
    // real moves look tiny — never amplified into a jittery wobble. mid/half are
    // eased so the scale glides instead of snapping.
    let lo0 = Infinity, hi0 = -Infinity;
    for (const v of pts) { if (v < lo0) lo0 = v; if (v > hi0) hi0 = v; }
    const mid = (lo0 + hi0) / 2;
    const half = Math.max((hi0 - lo0) / 2, Math.max(mid * 0.012, 1e-4));
    Chart.mid = Chart.mid == null ? mid : Chart.mid + (mid - Chart.mid) * 0.06;
    Chart.half = Chart.half == null ? half : Chart.half + (half - Chart.half) * 0.06;
    const lo = Chart.mid - Chart.half * 1.25, hi = Chart.mid + Chart.half * 1.25;
    const range = Math.max(hi - lo, 1e-6);

    const padX = 8, padY = 6, w = cssW - padX * 2, h = cssH - padY * 2, n = pts.length;
    const xs = (i) => padX + (i / (n - 1)) * w;
    const ys = (v) => padY + (1 - (v - lo) / range) * h;

    // grid
    ctx.strokeStyle = 'rgba(178,200,230,.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = padY + (h / 4) * i;
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(cssW - padX, y); ctx.stroke();
    }
    const accent = Chart.accent.map(Math.round).join(',');
    const grad = ctx.createLinearGradient(0, padY, 0, padY + h);
    grad.addColorStop(0, `rgba(${accent},.34)`);
    grad.addColorStop(1, `rgba(${accent},0)`);
    const trace = () => {
      ctx.moveTo(xs(0), ys(pts[0]));
      for (let i = 0; i < n - 1; i++) {
        const xc = (xs(i) + xs(i + 1)) / 2, yc = (ys(pts[i]) + ys(pts[i + 1])) / 2;
        ctx.quadraticCurveTo(xs(i), ys(pts[i]), xc, yc);
      }
      ctx.lineTo(xs(n - 1), ys(pts[n - 1]));
    };
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(xs(0), cssH - padY);
    ctx.lineTo(xs(0), ys(pts[0]));
    trace();
    ctx.lineTo(xs(n - 1), cssH - padY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(${accent},.95)`;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    trace();
    ctx.stroke();
    const lx = xs(n - 1), ly = ys(pts[n - 1]);
    ctx.fillStyle = `rgba(${accent},.25)`;
    ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(lx, ly, 2.6, 0, Math.PI * 2); ctx.fill();

    const valEl = byId('rateChartVal');
    if (valEl) {
      const last = RateStore.tonUsd || pts[n - 1];
      const first = pts[0];
      const delta = ((last - first) / first) * 100;
      const sign = delta >= 0 ? '+' : '';
      valEl.textContent = `$${last.toFixed(3)} (${sign}${delta.toFixed(2)}%)`;
      valEl.style.color = delta >= 0 ? 'var(--good)' : 'var(--bad)';
    }
  }
  // ----- decorative, perpetually-drifting rate readout -----
  // The chip number is essentially ornamental: it eases toward the real rate
  // over several seconds and breathes on a slow ~15s sine so it never sits still.
  let _rateTarget = null, _rateDisp = null, _ratePhase = 0, _rateAnimOn = false;
  function fmtRateNum(x) { return '$' + (x < 10 ? x.toFixed(3) : x.toFixed(2)); }
  function startRateAnim() {
    if (_rateAnimOn) return;
    _rateAnimOn = true;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const rv = byId('rateValue');
      if (rv && _rateTarget != null) {
        if (_rateDisp == null) _rateDisp = _rateTarget;
        _rateDisp += (_rateTarget - _rateDisp) * Math.min(1, dt / 2.5);   // quick glide to the real value
        rv.textContent = fmtRateNum(_rateDisp);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  function renderRate() {
    const v = RateStore.tonUsd;
    const stale = RateStore.isStale();
    const chip = byId('rateChip');
    chip.classList.toggle('stale', stale);
    // Smoothly tween the displayed price instead of snapping.
    const rv = byId('rateValue');
    // Hand the new value to the slow decorative animator instead of snapping.
    _rateTarget = v;
    startRateAnim();
    byId('rateValueInline').textContent = '$' + v.toFixed(3) + ' / TON';

    // Update Premium teaser dynamically based on rate
    try {
      const svc = SERVICES.premium;
      const minUsd = Math.min(...svc.tiers.map(t => t.usd)) * (1 + svc.serviceFee);
      const minTon = P.tonFromUsd(minUsd);
      svc.teaser.ru = 'от ' + P.formatTon(minTon) + ' TON';
      svc.teaser.en = 'from ' + P.formatTon(minTon) + ' TON';
    } catch {}

    const arr = byId('rateArrow');
    if (lastRate != null && v !== lastRate) {
      chip.classList.remove('up', 'down', 'flash');
      void chip.offsetWidth;
      if (v > lastRate)      { chip.classList.add('up');   arr.textContent = '▲'; }
      else if (v < lastRate) { chip.classList.add('down'); arr.textContent = '▼'; }
      chip.classList.add('flash');
    } else if (lastRate == null) {
      arr.textContent = '◆';
    }
    lastRate = v;
    // Only chart genuine rate ticks — never seed the sparkline with the hard-coded
    // fallback, otherwise the % delta is measured against a bogus baseline.
    if (RateStore.lastSource !== 'fallback') pushRateHistory(v);
    drawSparkline();

    // Keep every TON-denominated price in sync with the live rate.
    renderStarPacks();
    renderTiers();
    renderBidPacks('mint');
    renderBidPacks('boost');
    updatePreviews(); updateSummary();
    cartLiveRefresh();   // live amounts in the open cart/receipt track the rate
  }
  const ICONS = { wallet: 'ico-wallet', mint: 'ico-mint', boost: 'ico-boost', star: 'ico-star', premium: 'ico-premium', deal: 'ico-deal' };
  function svgUse(id) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 24 24');
    el.innerHTML = `<use href="#${id}"/>`;
    return el;
  }
  function renderIcon(host, name) {
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(svgUse(ICONS[name] || ICONS.wallet));
  }
  function renderModeHeadIcons() {
    $$('.mh-ico').forEach(host => {
      const name = host.dataset.ico;
      if (name) renderIcon(host, name);
    });
  }

  // ---------- Service picker ----------
  function renderServicePicker() {
    const svc = SERVICES[state.service];
    byId('spMain').textContent = svc.name[state.lang];
    byId('spSub').textContent = svc.sub[state.lang];
    renderIcon(byId('spIcon'), svc.icon);
    const idx = SERVICE_ORDER.indexOf(state.service) + 1;
    byId('serviceAside').textContent = `${idx} / ${SERVICE_ORDER.length}`;
    // header sub-line reflects the open service
    const bs = byId('brandService');
    if (bs) bs.textContent = svc.name[state.lang];
    // tell the status plate which service is open (auto services are 24/7)
    const auto = (state.service === 'stars' || state.service === 'premium');
    window.AWM_activeService = state.service;
    window.AWM_activeServiceAuto = auto;
    if (typeof window.AWM_refreshStatus === 'function') window.AWM_refreshStatus();
  }
  function renderServiceOptions() {
    const host = byId('serviceOptions');
    host.innerHTML = '';
    const ru = state.lang === 'ru';
    const currentGroup = (SERVICES[state.service] && SERVICES[state.service].group) || 'manual';
    let lastGroup = null;
    SERVICE_ORDER.forEach(id => {
      const svc = SERVICES[id];
      const grp = svc.group || 'manual';
      if (grp !== lastGroup) {
        lastGroup = grp;
        const gh = document.createElement('div');
        // Highlight the header that matches the CURRENTLY-selected service's
        // type: auto-service → top "Авто" header; manual → bottom header.
        gh.className = 'so-group' + (grp === 'auto' ? ' auto' : '') + (grp === currentGroup ? ' is-current' : '');
        gh.innerHTML = (grp === 'auto')
          ? '<span class="so-group-dot"></span><span>' + (ru ? 'Авто — мгновенно, в любое время' : 'Auto — instant, anytime') + '</span>'
          : '<span class="so-group-dot"></span><span>' + (ru ? 'Обработка вручную' : 'Manual processing') + '</span>';
        host.appendChild(gh);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'service-option' + (id === state.service ? ' active' : '');
      btn.dataset.svc = id;
      btn.innerHTML = `
        <span class="so-ico"></span>
        <span>
          <div class="so-main">${svc.name[state.lang]}</div>
          <div class="so-sub">${svc.sub[state.lang]}</div>
        </span>
        <span class="so-price">${svc.teaser[state.lang]}</span>
      `;
      renderIcon(btn.querySelector('.so-ico'), svc.icon);
      btn.addEventListener('click', () => {
        setService(id);
        closeOverlay('service');
      });
      host.appendChild(btn);
    });
  }

  // Each service carries its own colour identity. Switching service retints
  // the whole UI (accents, live chart, ambient field) — by logic, not by hand.
  const SERVICE_ACCENTS = {
    custom:  { oklch: 'oklch(0.76 0.15 233)', rgb: '64,176,255'  }, // vivid sky-azure — payments
    stars:   { oklch: 'oklch(0.82 0.14 85)',  rgb: '250,190,92'  }, // gold — Stars
    premium: { oklch: 'oklch(0.70 0.16 296)', rgb: '176,132,255' }, // violet — Premium
    mint:    { oklch: 'oklch(0.78 0.14 168)', rgb: '58,216,172'  }, // emerald — NFT mint
    boost:   { oklch: 'oklch(0.70 0.17 16)',  rgb: '255,122,138' }, // rose — boost
    deal:    { oklch: 'oklch(0.76 0.15 62)',  rgb: '245,159,66'  }, // orange — deal
  };
  function applyServiceAccent(id, sweep) {
    const a = SERVICE_ACCENTS[id] || SERVICE_ACCENTS.custom;
    const s = document.documentElement.style;
    s.setProperty('--accent', a.oklch);
    s.setProperty('--accent-rgb', a.rgb);
    s.setProperty('--accent-soft', a.oklch.replace(')', ' / 0.18)'));
    s.setProperty('--accent-mute', a.oklch.replace(')', ' / 0.10)'));
    retintRateChip(a.rgb);
    setSparklineAccent(a.rgb);
    if (sweep) {
      const el = byId('accentSweep');
      if (el) { el.classList.remove('run'); void el.offsetWidth; el.classList.add('run'); }
    }
  }
  // Slowly glide the live-rate strip to the active service's colour.
  // Driven through a document-level CSS variable (--rate-rgb) so the change
  // propagates reliably and the `color`/`border` transitions animate smoothly.
  function retintRateChip(rgb) {
    document.documentElement.style.setProperty('--rate-rgb', rgb);
    const chip = byId('rateChip');
    if (!chip) return;
    // A concrete per-service class reliably restyles `color` (var() inside
    // `color` is not always re-resolved on variable change in some engines).
    chip.classList.remove('svc-custom', 'svc-stars', 'svc-premium', 'svc-mint', 'svc-boost');
    chip.classList.add('svc-' + state.service);
    chip.classList.remove('retint');
    void chip.offsetWidth;
    chip.classList.add('retint');
  }
  window.AWM_applyServiceAccent = applyServiceAccent;

  function syncModeUI() {
    $$('.mode-screen').forEach(s => s.classList.toggle('active', s.dataset.mode === state.service));
    updatePreviews(); updateSummary();
    refreshCtaLabel();
  }

  // Switch the active service programmatically (used by swipe / arrow nav).
  function setService(id, dir) {
    if (!SERVICES[id] || id === state.service) return;
    state.service = id;
    state.ctaArmed = false;
    applyServiceAccent(id, true);
    if (window.AWM_onServiceChange) window.AWM_onServiceChange(id, dir);
    const scr = document.querySelector(`.mode-screen[data-mode="${id}"]`);
    renderServiceOptions();
    syncModeUI();
    renderServicePicker();
    renderHero();
    if (scr && dir) {
      scr.classList.remove('swipe-in-l', 'swipe-in-r');
      void scr.offsetWidth;
      scr.classList.add(dir === 'next' ? 'swipe-in-r' : 'swipe-in-l');
      setTimeout(() => scr.classList.remove('swipe-in-l', 'swipe-in-r'), 320);
    }
    if (window.AWM_haptic) window.AWM_haptic('select');
  }
  function stepService(dir) {
    const i = SERVICE_ORDER.indexOf(state.service);
    const n = SERVICE_ORDER.length;
    const j = dir === 'next' ? (i + 1) % n : (i - 1 + n) % n;
    setService(SERVICE_ORDER[j], dir);
  }
  window.AWM_stepService = stepService;
  window.AWM_setService = setService;
  window.AWM_state = state;
  window.AWM_stepInput = (id, dir) => stepInput(id, dir);
  window.AWM_getService = () => state.service;
  window.AWM_serviceOrder = () => SERVICE_ORDER.slice();
  window.AWM_anyOverlayOpen = () => !!document.querySelector('.overlay.visible');

  // ---------- Star packs ----------
  function renderStarPacks() {
    const host = byId('starPacks');
    host.innerHTML = '';
    const svc = SERVICES.stars;
    svc.packs.forEach(pack => {
      const qty = pack.qty;
      const linearUsd = qty * svc.starUsd * (1 + (svc.starsFee || 0));
      // Per-pack discount override wins; otherwise small/large tier discount.
      let discount = (pack.disc != null)
        ? pack.disc
        : (qty >= svc.packsBigThreshold ? svc.packDiscount.large : svc.packDiscount.small);
      if (qty > svc.bonusOver) discount += svc.bonus;
      const save = Math.round(discount * 100);
      const usd = +(linearUsd * (1 - discount)).toFixed(2);
      const ton = P.tonFromUsd(usd);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pack-card' + (pack.feature ? ' featured' : '') + (qty === state.starsQty ? ' active' : '');
      card.dataset.qty = qty;
      const ru = state.lang === 'ru';
      const badge = pack.feature
        ? `<span class="pc-save pc-gold">${ru ? 'выгодно' : 'best'} −${save}%</span>`
        : (save > 0 ? `<span class="pc-save">−${save}%</span>` : '');
      card.innerHTML = `
        ${badge}
        <div class="pc-star">★</div>
        <div class="pc-qty">${P.formatInt(qty)}</div>
        <div class="pc-price">${P.formatTon(ton)} TON</div>
      `;
      let lastClick = card._lastClick || 0;
      card._lastClick = lastClick;
      card.addEventListener('click', () => {
        const now = Date.now();
        const prev = card._lastClick || 0;
        const fast = (now - prev) < 600;
        card._lastClick = now;
        // Combine: if same pack tapped fast OR currently selected and tapped again — accumulate
        let combined = qty;
        const isHotPack = (qty >= 5000);
        if (fast || (isHotPack && state.starsQty === qty)) {
          combined = state.starsQty + qty;
          if (combined > SERVICES.stars.maxQty) combined = SERVICES.stars.maxQty;
          // visual combo
          card.classList.add('combining');
          setTimeout(() => card.classList.remove('combining'), 420);
          const badge = document.createElement('span');
          badge.className = 'pc-combo';
          badge.textContent = '+' + P.formatInt(qty);
          card.appendChild(badge);
          setTimeout(() => badge.remove(), 900);
        }
        state.starsQty = combined;
        byId('starQty').value = String(combined);
        bumpDisplay('starQtyDisplay');
        renderStarPacks();
        updatePreviews(); updateSummary();
      });
      host.appendChild(card);
    });
    // Arrow-key navigation through packs (one-time binding; keydown from any
    // focused pack button bubbles up to the grid host).
    if (!host._kbdBound) {
      host._kbdBound = true;
      host.addEventListener('keydown', (e) => {
        const packs = SERVICES.stars.packs.map(p => p.qty);
        let i = packs.indexOf(state.starsQty);
        if (i < 0) i = 0;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); i = (i + 1) % packs.length; }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); i = (i - 1 + packs.length) % packs.length; }
        else return;
        const qty = packs[i];
        state.starsQty = qty;
        byId('starQty').value = String(qty);
        bumpDisplay('starQtyDisplay');
        renderStarPacks();
        updatePreviews(); updateSummary();
        if (window.AWM_haptic) window.AWM_haptic('select');
        const sel = host.querySelector('.pack-card.active');
        if (sel) sel.focus();
      });
    }
  }

  // ---------- Tier cards ----------
  function renderTiers() {
    const host = byId('tierGrid');
    host.innerHTML = '';
    const svc = SERVICES.premium;
    svc.tiers.forEach(tier => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'tier-card' + (tier.months === state.premiumMonths ? ' active' : '');
      card.dataset.months = tier.months;
      const baseUsd = tier.usd;
      const disc = tier.disc || 0;
      const totalUsd = +(baseUsd * (1 + svc.serviceFee) * (1 - disc)).toFixed(2);
      const totalTon = P.tonFromUsd(totalUsd);
      const save = Math.round(disc * 100);
      const ru = state.lang === 'ru';
      const badge = tier.feature
        ? `<span class="tc-badge tc-gold">${ru ? 'выгодно' : 'best'} −${save}%</span>`
        : (save > 0 ? `<span class="tc-badge tc-save">−${save}%</span>` : '');
      card.innerHTML = `
        ${badge}
        <div class="tc-months">${tier.label[state.lang]}</div>
        <div class="tc-name">Premium</div>
        <div class="tc-ton">${P.formatTon(totalTon)} TON</div>
        <div class="tc-usd">≈ $${totalUsd.toFixed(2)}</div>
      `;
      card.addEventListener('click', () => {
        state.premiumMonths = tier.months;
        renderTiers();
        updatePreviews(); updateSummary();
      });
      host.appendChild(card);
    });
  }

  // ---------- Bid packs (mint / boost) ----------
  // Preset bid amounts, each with a commission discount. Selecting one drops the
  // value into the bid stepper and the pricing engine applies its discount.
  function renderBidPacks(service) {
    const host = byId(service === 'mint' ? 'mintPacks' : 'boostPacks');
    if (!host) return;
    host.innerHTML = '';
    const svc = SERVICES[service];
    const cur = service === 'mint' ? state.mintBidTon : state.boostBidTon;
    const ru = state.lang === 'ru';
    (svc.bidPacks || []).forEach(pack => {
      const bid = pack.bid;
      const p = AWMPricing.tieredPercent(bid);
      const feeTon = bid * p / 100 * (1 - (pack.disc || 0));
      const save = Math.round((pack.disc || 0) * 100);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pack-card bid-pack' + (pack.feature ? ' featured' : '') + (bid === cur ? ' active' : '');
      card.dataset.bid = bid;
      const badge = pack.feature
        ? `<span class="pc-save pc-gold">${ru ? 'выгодно' : 'best'} −${save}%</span>`
        : (save > 0 ? `<span class="pc-save">−${save}%</span>` : '');
      card.innerHTML = `
        ${badge}
        <div class="pc-qty">${P.formatInt(bid)}</div>
        <div class="pc-unit">TON</div>
        <div class="pc-price">${ru ? 'доп. услуга' : 'add-on'} ${P.formatTon(feeTon)}</div>
      `;
      card.addEventListener('click', () => {
        const inp = byId(service === 'mint' ? 'mintBid' : 'boostBid');
        if (service === 'mint') state.mintBidTon = bid; else state.boostBidTon = bid;
        if (inp) {
          inp.value = String(bid);
          bumpDisplay(service === 'mint' ? 'mintBidDisplay' : 'boostBidDisplay');
        }
        updatePreviews(); updateSummary();
        renderBidPacks(service);
        if (window.AWM_haptic) window.AWM_haptic('select');
      });
      host.appendChild(card);
    });
  }

  // ---------- Animations ----------
  function bumpDisplay(id) {
    const el = byId(id);
    if (!el) return;
    el.classList.remove('bumping');
    void el.offsetWidth;
    el.classList.add('bumping');
  }
  function rollDisplay(id, dir) {
    const el = byId(id);
    if (!el) return;
    el.classList.remove('roll-up', 'roll-down');
    void el.offsetWidth;
    el.classList.add(dir === 'up' ? 'roll-up' : 'roll-down');
    setTimeout(() => el.classList.remove('roll-up', 'roll-down'), 320);
  }
  function pulseDisplay(id) {
    const el = byId(id);
    if (!el) return;
    el.classList.remove('typing');
    void el.offsetWidth;
    el.classList.add('typing');
    clearTimeout(el._tt);
    el._tt = setTimeout(() => el.classList.remove('typing'), 160);
  }
  function setFill() { /* sliders removed — no-op kept for callsites */ }
  function bindSlider() { /* removed */ }

  // ---------- Field limits ----------
  const FIELD_MIN = {
    customAmount: SERVICES.custom.minTon,
    dealAmount:  SERVICES.deal.minTon,
    mintBid:     SERVICES.mint.minBidTon,
    boostBid:    SERVICES.boost.minBidTon,
    starQty:     SERVICES.stars.minQty
  };
  const FIELD_MAX = {
    customAmount: 1e7,
    dealAmount:  1e7,
    mintBid:     1e7,
    boostBid:    1e7,
    starQty:     SERVICES.stars.maxQty
  };

  // Boost bid wheel ladder: 50,100,125,150,200,250,…(+50)…,1000, then +100.
  const BOOST_LADDER = [50, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000];
  function nextBoostBid(cur, dir) {
    if (dir === 'up') {
      if (cur < 50) return 50;
      if (cur >= 1000) return cur + 100;
      for (const v of BOOST_LADDER) if (v > cur) return v;
      return 1000;
    } else {
      if (cur <= 50) return 0;
      if (cur > 1000) {
        const aligned = Math.ceil(cur / 100) * 100;
        const down = (aligned === cur ? cur - 100 : aligned - 100);
        return down < 1000 ? 1000 : down;
      }
      for (let i = BOOST_LADDER.length - 1; i >= 0; i--) if (BOOST_LADDER[i] < cur) return BOOST_LADDER[i];
      return 50;
    }
  }

  function stepInput(id, dir) {
    const el = byId(id);
    if (!el) return;
    let cur = parseNum(el.value);
    const min = FIELD_MIN[id] ?? 0;
    const max = FIELD_MAX[id] ?? Infinity;
    let next = cur;

    // From 0/empty going up → jump straight to min, not below.
    if (id === 'customAmount' || id === 'dealAmount') {
      // Step scales with magnitude so the wheel always feels responsive.
      const step = cur < 1 ? 0.1 : cur < 10 ? 0.5 : cur < 100 ? 1 : cur < 1000 ? 10 : 100;
      if (dir === 'up' && cur < min) {
        next = min;
      } else {
        next = dir === 'up' ? cur + step : cur - step;
        if (next < min) next = (dir === 'down' && cur > min) ? min : 0;
      }
      next = clamp(Math.round(next * 100) / 100, 0, max);
      el.value = next === 0 ? '' : formatDecimalDisplay(next);
    } else if (id === 'mintBid') {
      const step = cur < 100 ? 10 : cur < 1000 ? 50 : 100;
      if (dir === 'up' && cur < min) {
        next = min;
      } else {
        next = dir === 'up' ? cur + step : cur - step;
        if (next < min) next = (dir === 'down' && cur > min) ? min : 0;
      }
      next = clamp(Math.trunc(next), 0, max);
      el.value = next === 0 ? '' : String(next);
    } else if (id === 'boostBid') {
      next = clamp(Math.trunc(nextBoostBid(cur, dir)), 0, max);
      el.value = next === 0 ? '' : String(next);
    } else if (id === 'starQty') {
      const step = 1;
      if (dir === 'up' && cur < min) {
        next = min;
      } else {
        next = dir === 'up' ? cur + step : cur - step;
        if (next < min) next = (dir === 'down' && cur > min) ? min : 0;
      }
      next = clamp(Math.trunc(next), 0, max);
      el.value = next === 0 ? '' : String(next);
    } else if (id === 'donationInput') {
      const step = cur < 1 ? 0.1 : cur < 10 ? 0.5 : 1;
      next = Math.max(0, dir === 'up' ? cur + step : cur - step);
      next = Math.round(next * 100) / 100;
      el.value = next === 0 ? '' : formatDecimalDisplay(next);
      state.donationFlat = next;
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
    rollDisplay(id + 'Display', dir);
  }

  // Global arrow-key stepping on the MAIN screen — works without focusing a
  // specific field. Stars: walk the pack ladder; Premium: walk the tiers;
  // others: nudge the amount field. (← / ↓ = down, → / ↑ = up.)
  function stepMainService(dir) {
    const d = dir; // 'up' | 'down'
    if (state.service === 'stars') {
      const packs = SERVICES.stars.packs.map(p => p.qty);
      const idx = packs.indexOf(state.starsQty);
      let v;
      if (idx !== -1) v = packs[clamp(idx + (d === 'up' ? 1 : -1), 0, packs.length - 1)];
      else { // snap to the nearest pack in the chosen direction
        const sorted = packs.slice().sort((a, b) => a - b);
        v = d === 'up' ? (sorted.find(q => q > state.starsQty) ?? sorted[sorted.length - 1])
                       : ([...sorted].reverse().find(q => q < state.starsQty) ?? sorted[0]);
      }
      setStarsQty(v);
      const inp = byId('starQty'); if (inp) inp.value = String(state.starsQty);
      renderStarPacks(); bumpDisplay('starQtyDisplay');
    } else if (state.service === 'premium') {
      const months = SERVICES.premium.tiers.map(t => t.months);
      const idx = months.indexOf(state.premiumMonths);
      setPremiumMonths(months[clamp((idx < 0 ? 0 : idx) + (d === 'up' ? 1 : -1), 0, months.length - 1)]);
    } else {
      const field = state.service === 'custom' ? 'customAmount'
        : state.service === 'deal' ? 'dealAmount'
        : state.service === 'mint' ? 'mintBid'
        : state.service === 'boost' ? 'boostBid' : null;
      if (field) stepInput(field, d);
    }
    if (window.AWM_haptic) window.AWM_haptic('selection');
  }
  window.AWM_stepMainService = stepMainService;
  function updatePreviews() {
    const cAmt = parseNum(byId('customAmount').value);
    state.customAmountTon = cAmt;
    byId('customAmountUsd').textContent = '≈ ' + fiatFromTon(cAmt);
    setFill('customAmountDisplay', 'customAmountSlider');

    const dEl = byId('dealAmount');
    if (dEl) {
      const dAmt = parseNum(dEl.value);
      state.dealAmountTon = dAmt;
      const du = byId('dealAmountUsd');
      if (du) du.textContent = (state.dealCurrency === 'USDT')
        ? ('≈ ' + P.formatTon(P.tonFromUsd(dAmt)) + ' TON · ' + fiat2Line(dAmt))
        : ('≈ ' + fiatFromTon(dAmt));
      setFill('dealAmountDisplay', 'dealAmountSlider');
    }

    const mBid = Math.trunc(parseNum(byId('mintBid').value));
    state.mintBidTon = mBid;
    const mintCompute = P.compute({ service: 'mint', bidTon: mBid });
    byId('mintBidMeta').textContent = (state.lang === 'ru'
      ? `+ ${P.formatTon(mintCompute.fee)} TON доп. услуга · база 7 TON · ≈ ${P.formatUsd(mintCompute.totalUsd)}`
      : `+ ${P.formatTon(mintCompute.fee)} TON add-on · base 7 TON · ≈ ${P.formatUsd(mintCompute.totalUsd)}`)
      + (mintCompute.discountPct > 0 ? ` · −${mintCompute.discountPct}%` : '');
    $$('#mintPacks .bid-pack').forEach(c => c.classList.toggle('active', Number(c.dataset.bid) === mBid));
    setFill('mintBidDisplay', 'mintBidSlider');

    const bBid = Math.trunc(parseNum(byId('boostBid').value));
    state.boostBidTon = bBid;
    const boostCompute = P.compute({ service: 'boost', bidTon: bBid });
    byId('boostBidMeta').textContent = (state.lang === 'ru'
      ? `≈ ${P.formatUsd(P.usdFromTon(bBid))} · доп. услуга ${P.formatTon(boostCompute.fee)} TON (${boostCompute.feePercent}%)`
      : `≈ ${P.formatUsd(P.usdFromTon(bBid))} · add-on ${P.formatTon(boostCompute.fee)} TON (${boostCompute.feePercent}%)`)
      + (boostCompute.discountPct > 0 ? ` · −${boostCompute.discountPct}%` : '');
    $$('#boostPacks .bid-pack').forEach(c => c.classList.toggle('active', Number(c.dataset.bid) === bBid));
    setFill('boostBidDisplay', 'boostBidSlider');

    const sQty = Math.trunc(parseNum(byId('starQty').value));
    state.starsQty = sQty;
    const starsCompute = P.compute({ service: 'stars', starsQty: sQty });
    byId('starQtyMeta').textContent = (sQty >= SERVICES.stars.minQty)
      ? `≈ ${P.formatUsd(starsCompute.totalUsd)} · ≈ ${P.formatTon(starsCompute.total)} TON`
      : (state.lang === 'ru' ? 'мин. 50 звёзд' : 'min. 50 stars');
    setFill('starQtyDisplay', 'starQtySlider');
$$('#starPacks .pack-card').forEach(c =>
  c.classList.toggle('active', Number(c.dataset.qty) === sQty)
);

    // Stars info strip
    const info100 = P.compute({ service: 'stars', starsQty: 100 });
    const infoMin = P.compute({ service: 'stars', starsQty: SERVICES.stars.minQty });
    if (byId('isStars100')) byId('isStars100').textContent = P.formatTon(info100.total) + ' TON';
    if (byId('isStarsMin')) byId('isStarsMin').textContent = P.formatTon(infoMin.total) + ' TON';
    if (byId('isStarsRate')) byId('isStarsRate').textContent = '$' + RateStore.tonUsd.toFixed(2);

    state.returnWallet = byId('returnWallet').value.trim();
    state.mintWallet = byId('mintWallet').value.trim();
    state.mintContact = byId('mintContact').value.trim();
    state.boostContact = byId('boostContact').value.trim();
  }

  // ---------- Summary ----------
  function getCurrentCompute() {
    return P.compute({
      service: state.service,
      amountTon: state.service === 'deal' ? state.dealAmountTon : state.customAmountTon,
      bidTon: state.service === 'mint' ? state.mintBidTon : state.boostBidTon,
      starsQty: state.starsQty,
      months: state.premiumMonths
    });
  }
  function computeDonationTon(total) {
    const flat = Math.max(0, state.donationFlat);
    const pct = state.donationPercent > 0 && total > 0 ? total * state.donationPercent / 100 : 0;
    return +(flat + pct).toFixed(4);
  }
  // The username that actually receives the order, per service.
  function recipientUsername() {
    if (state.service === 'boost') return state.boostTarget || '';
    if (state.service === 'deal') return state.dealCounterparty || '';
    if (state.service === 'premium') return state.premiumGift || state.username || '';
    if (state.service === 'stars') return state.starsRecipient || state.username || '';
    return state.username || '';
  }
  function setRow(rowId, valId, value, sub) {
    byId(rowId).classList.remove('hidden');
    byId(valId).innerHTML = sub ? `${value}<span class="sub">${sub}</span>` : value;
  }
  function hideRow(rowId) { byId(rowId).classList.add('hidden'); }
  // Locale-aware secondary fiat: RU shows ₽, EN shows € — always after $.
  function fiatFromUsd(usd) {
    const u = P.formatUsd(usd || 0);
    return state.lang === 'ru'
      ? u + ' · ' + P.formatRub(P.rubFromUsd(usd || 0))
      : u + ' · ' + P.formatEur(P.eurFromUsd(usd || 0));
  }
  function fiatFromTon(ton) { return fiatFromUsd(P.usdFromTon(ton || 0)); }
  window.AWM_fiatFromUsd = fiatFromUsd;
  function fmtTonUsd(ton, usd) { return `${P.formatTon(ton)} TON<span class="sub">≈ ${fiatFromUsd(usd)}</span>`; }
  // Pay-sheet total — each currency on its OWN line for a clean, uncramped header.
  function fmtPayTotal(ton, usd) {
    const ru = state.lang === 'ru';
    const fiat2 = ru ? P.formatRub(P.rubFromUsd(usd || 0)) : P.formatEur(P.eurFromUsd(usd || 0));
    return `<span class="pt-ton">${P.formatTon(ton)} TON</span>`
      + `<span class="pt-fiat">≈ ${P.formatUsd(usd || 0)}</span>`
      + `<span class="pt-fiat">≈ ${fiat2}</span>`;
  }
  // The two fiat lines ($ + ₽/€) shown to the RIGHT of the big TON total so the
  // plate reads evenly with no empty space on the right.
  function fmtPayFiat(usd) {
    const ru = state.lang === 'ru';
    const fiat2 = ru ? P.formatRub(P.rubFromUsd(usd || 0)) : P.formatEur(P.eurFromUsd(usd || 0));
    return `<span class="ptf">≈ ${P.formatUsd(usd || 0)}</span><span class="ptf">≈ ${fiat2}</span>`;
  }

  // --- Currency display rules (centralized) --------------------------------
  // USD₮ deal: the entered number is USDT (≈ USD); headline in USDT, subs '≈ TON · ≈ ₽/€'.
  // Everything else: headline in TON, subs '≈ $ · ≈ ₽/€'. ₽ for RU, € for EN.
  function isUsdtDeal() { return state.service === 'deal' && state.dealCurrency === 'USDT'; }
  function fiat2Line(usd) {
    return state.lang === 'ru' ? P.formatRub(P.rubFromUsd(usd || 0)) : P.formatEur(P.eurFromUsd(usd || 0));
  }
  // `amount` is the engine's TON-field value (in USDT mode that number IS USDT≈USD).
  function payPrimary(amount) {
    return isUsdtDeal() ? ((amount || 0).toFixed(2) + ' USDT') : (P.formatTon(amount || 0) + ' TON');
  }
  function paySecondary(amount) {
    if (isUsdtDeal()) { const usd = amount || 0; return '≈ ' + P.formatTon(P.tonFromUsd(usd)) + ' TON · ' + fiat2Line(usd); }
    const usd = P.usdFromTon(amount || 0); return '≈ ' + P.formatUsd(usd) + ' · ' + fiat2Line(usd);
  }
  window.AWM_isUsdtDeal = isUsdtDeal;

  function updateSummary() {
    const c = getCurrentCompute();
    const svc = SERVICES[state.service];
    const tr = T[state.lang];
    byId('sumService').textContent = svc.name[state.lang] + (
      state.service === 'premium' ? ' · ' + SERVICES.premium.tiers.find(t => t.months === state.premiumMonths).label[state.lang] + (state.premiumGift ? ' · @' + state.premiumGift : '')
      : state.service === 'stars' ? ' · ' + P.formatInt(state.starsQty) + ' ★'
      : ''
    );
    hideRow('sumFeeRow');
    if (state.service === 'custom' || state.service === 'deal') {
      byId('sumBaseKey').textContent = tr.sumBase;
      byId('sumBaseVal').innerHTML = fmtTonUsd(c.total, c.totalUsd);
    } else if (state.service === 'mint') {
      byId('sumBaseKey').textContent = state.lang === 'ru' ? 'База' : 'Base';
      byId('sumBaseVal').innerHTML = fmtTonUsd(c.base, P.usdFromTon(c.base));
      setRow('sumFeeRow', 'sumFeeVal', `${P.formatTon(c.fee)} TON`, `${c.feePercent || 0}% · ≈ ${P.formatUsd(P.usdFromTon(c.fee))}`);
      byId('sumFeeKey').textContent = tr.sumFee;
    } else if (state.service === 'boost') {
      byId('sumBaseKey').textContent = state.lang === 'ru' ? 'Ставка' : 'Bid';
      byId('sumBaseVal').innerHTML = fmtTonUsd(c.base, P.usdFromTon(c.base));
      setRow('sumFeeRow', 'sumFeeVal', `${P.formatTon(c.fee)} TON`, `${c.feePercent || 0}% · ${state.lang === 'ru' ? 'оплачивается' : 'charged'}`);
      byId('sumFeeKey').textContent = tr.sumFee;
    } else if (state.service === 'stars') {
      byId('sumBaseKey').textContent = state.lang === 'ru' ? 'Звёзды' : 'Stars';
      byId('sumBaseVal').innerHTML = `${P.formatInt(state.starsQty)} ★<span class="sub">${P.formatUsd(c.totalUsd)} · ${P.formatTon(c.total)} TON</span>`;
    } else if (state.service === 'premium') {
      const tier = SERVICES.premium.tiers.find(t => t.months === state.premiumMonths);
      byId('sumBaseKey').textContent = tier.label[state.lang];
      byId('sumBaseVal').innerHTML = fmtTonUsd(c.total, c.totalUsd);
      hideRow('sumFeeRow');
    }
    // Discount row (stars packs / premium tiers).
    const discPct = c.discountPct || 0;
    if (discPct > 0 && c.valid) {
      const usdSaved = c.discountUsd != null ? c.discountUsd : (c.baseUsd ? c.baseUsd - c.totalUsd : 0);
      setRow('sumDiscRow', 'sumDiscVal',
        `−${discPct}%`,
        usdSaved > 0 ? `≈ −${P.formatUsd(usdSaved)}` : '');
    } else {
      hideRow('sumDiscRow');
    }
    byId('sumTotalVal').innerHTML = c.totalUsd
      ? `${P.formatTon(c.total)} TON<span class="sub">≈ ${fiatFromUsd(c.totalUsd)}</span>`
      : `${P.formatTon(c.total)} TON`;
    byId('liveSummary').classList.toggle('muted', !c.valid);

    refreshCtaLabel(c);
  }

  function refreshCtaLabel(c) {
    if (!c) c = getCurrentCompute();
    byId('ctaAmount').textContent = '· ' + P.formatTon(c.total) + ' TON';
    updateCtaHint(c);
  }

  // Contextual "what does Enter do next" hint under the main CTA.
  function updateCtaHint(c) {
    const el = byId('ctaHint');
    if (!el) return;
    const tr = T[state.lang];
    if (!c) c = getCurrentCompute();
    el.classList.remove('is-blocked', 'is-ready');
    if (!c.valid) {
      el.classList.add('is-blocked');
      el.textContent = tr.ctaHintFill;
      return;
    }
    el.classList.add('is-ready');
    const label = state.ctaArmed ? tr.ctaHintConfirm
      : !state.username ? tr.ctaHintUser
      : tr.ctaHintCart;
    el.innerHTML = '<span class="kbd-key">Enter</span><span></span>';
    el.lastChild.textContent = label;
  }

  // ---------- User pill ----------
  function renderUserPill() {
    const tr = T[state.lang];
    byId('userPillValue').textContent = state.username ? '@' + state.username : tr.userNotRegistered;
  }
  // Called by connect.js when a Telegram profile is available (Mini App or
  // Login Widget). Prefills the username and shows the avatar on the pill.
  function applyProfile(p) {
    if (!p) return;
    if (p.username && !state.username) { state.username = applyUsernameLive(p.username); renderUserPill(); }
    const pill = byId('userPill');
    if (pill && p.photo) {
      const ico = pill.querySelector('.user-pill-icon');
      if (ico) {
        ico.innerHTML = '';
        const img = document.createElement('img');
        img.src = p.photo; img.alt = ''; img.className = 'user-pill-avatar';
        img.referrerPolicy = 'no-referrer';
        ico.appendChild(img);
      }
    }
    if (p.username && window.AWM_spawnTrail) window.AWM_spawnTrail('@' + state.username);
  }
  window.AWM_applyProfile = applyProfile;

  // ---------- Tool buttons ----------
  const inputUndo = new Map();
  function setToolIcon(btn, kind) {
    btn.dataset.kind = kind;
    const map = {
      paste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
      clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      undo:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6l-3 2"/></svg>'
    };
    btn.innerHTML = map[kind] || map.paste;
  }
  function refreshToolBtn(input) {
    const btn = document.querySelector(`[data-tool-target="${input.id}"]`);
    if (!btn) return;
    const has = !!String(input.value || '').trim();
    const undo = inputUndo.get(input.id);
    if (has) setToolIcon(btn, 'clear');
    else if (undo) setToolIcon(btn, 'undo');
    else setToolIcon(btn, 'paste');
  }
  async function handleToolBtn(input) {
    const btn = document.querySelector(`[data-tool-target="${input.id}"]`);
    const kind = btn?.dataset.kind || 'paste';
    if (kind === 'paste') {
      try {
        const txt = (await navigator.clipboard.readText()).trim();
        if (!txt) return;
        inputUndo.set(input.id, '');
        input.value = txt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } catch {}
    } else if (kind === 'clear') {
      inputUndo.set(input.id, input.value);
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (kind === 'undo') {
      const v = inputUndo.get(input.id);
      if (!v) return;
      inputUndo.set(input.id, '');
      input.value = v;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    refreshToolBtn(input);
  }

  // ---------- Overlay ----------
  function openOverlay(name) {
    const ov = byId(name + 'Overlay'); if (!ov) return;
    // Only one bottom-sheet overlay open at a time. The top bar + user pill live
    // OUTSIDE .app, so they stay tappable while the cart is open — tapping the
    // pill used to open the username prompt BEHIND the still-open cart, whose
    // comment box then ate every click ("юзернейм не вводится"). Close any other
    // visible overlay first so the new sheet is always the top, interactive one.
    document.querySelectorAll('.overlay.visible').forEach((o) => {
      if (o === ov) return;
      o.classList.remove('visible');
      o.setAttribute('aria-hidden', 'true');
      if (o.id === 'receiptOverlay' && window.AWM_stopCodeRotation) window.AWM_stopCodeRotation();
    });
    ov.classList.add('visible');
    ov.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sheet-open');
  }
  function closeOverlay(name) {
    const ov = byId(name + 'Overlay'); if (!ov) return;
    ov.classList.remove('visible');
    ov.setAttribute('aria-hidden', 'true');
    if (name === 'receipt' && window.AWM_stopCodeRotation) window.AWM_stopCodeRotation();
    if (!document.querySelector('.overlay.visible')) document.body.classList.remove('sheet-open');
  }
  function topOverlay() {
    const arr = ['receipt', 'username', 'service', 'info'];
    return arr.find(n => byId(n + 'Overlay')?.classList.contains('visible'));
  }

  // ---------- Sheet drag-to-dismiss ----------
  function bindSheetHandle(handle) {
    let startY = 0, dy = 0, dragging = false, startT = 0, moved = false;
    const sheet = handle.closest('.sheet');
    const overlay = handle.closest('.overlay');
    if (!sheet || !overlay) return;
    const dismiss = () => {
      sheet.classList.add('snapping');
      sheet.style.transform = `translateY(110%)`;
      overlay.style.background = '';
      if (window.AWM_haptic) window.AWM_haptic('light');
      const name = overlay.id.replace('Overlay', '');
      setTimeout(() => {
        sheet.classList.remove('snapping');
        sheet.style.transform = '';
        closeOverlay(name);
      }, 240);
    };

    function onDown(e) {
      const t = e.touches ? e.touches[0] : e;
      startY = t.clientY;
      startT = performance.now();
      dy = 0; moved = false;
      dragging = true;
      handle.classList.add('dragging');
      sheet.classList.add('dragging');
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    }
    function onMove(e) {
      if (!dragging) return;
      const t = e.touches ? e.touches[0] : e;
      const raw = t.clientY - startY;
      if (Math.abs(raw) > 4) moved = true;
      // rubber-band: full follow downward, strong resistance upward
      dy = raw >= 0 ? raw : raw * 0.18;
      const shown = Math.max(0, dy);
      sheet.style.transform = `translateY(${shown}px) scale(${1 - Math.min(0.05, shown / 3200)})`;
      overlay.style.background = `rgba(5,8,14,${Math.max(0.04, 0.55 - shown / 700)})`;
      if (e.cancelable) e.preventDefault();
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      sheet.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      const elapsed = performance.now() - startT;
      const velocity = dy / Math.max(1, elapsed);     // px per ms
      // Tap (no real movement) OR a quick flick OR a meaningful pull all dismiss.
      const tap = !moved && elapsed < 400;
      const flick = velocity > 0.45 && dy > 24;
      const pulled = dy > Math.min(150, sheet.getBoundingClientRect().height * 0.16);
      if (tap || flick || pulled) {
        dismiss();
      } else {
        // spring back to rest
        sheet.classList.add('snapping');
        sheet.style.transform = '';
        overlay.style.background = '';
        setTimeout(() => sheet.classList.remove('snapping'), 360);
      }
    }
    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: true });
    handle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dismiss(); }
    });
    // Keyboard / a11y: the handle is focusable and closes on Enter/Space.
    handle.setAttribute('role', 'button');
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('aria-label', T[state.lang] ? (state.lang === 'ru' ? 'Закрыть' : 'Close') : 'Close');
  }

  // ---------- Validation ----------
  function clearMisses() {
    $$('.required-miss, .required-pulse').forEach(el => el.classList.remove('required-miss', 'required-pulse'));
  }
  function markMiss(fieldId, soft) {
    const el = byId(fieldId);
    if (!el) return;
    el.classList.add(soft ? 'required-pulse' : 'required-miss');
    // Clear the highlight the moment the user TOUCHES the field (tap/stepper);
    // typing also clears it via the input listeners. We intentionally do NOT
    // clear on programmatic focus, so the highlight stays visible until a real
    // user interaction — "тронул → убрать".
    const clear = () => {
      el.classList.remove('required-miss', 'required-pulse');
      el.removeEventListener('pointerdown', clear);
    };
    el.addEventListener('pointerdown', clear);
    if (!soft) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const inp = el.querySelector('input');
      if (inp) setTimeout(() => inp.focus({ preventScroll: true }), 200);
    }
  }

  function validateFieldsOnly() {
    clearMisses();
    const errors = [];
    if (state.service === 'custom') {
      if (state.customAmountTon < SERVICES.custom.minTon) errors.push('customField');
    } else if (state.service === 'deal') {
      if (state.dealAmountTon < SERVICES.deal.minTon) errors.push('dealField');
    } else if (state.service === 'mint') {
      if (state.mintBidTon < SERVICES.mint.minBidTon) errors.push('mintField');
      if (!state.mintWallet || state.mintWallet.length < 10) errors.push('mintWalletField');
    } else if (state.service === 'boost') {
      if (!isValidUsername(state.boostTarget)) errors.push('boostTargetField');
      if (state.boostBidTon < SERVICES.boost.minBidTon) errors.push('boostField');
      if (!state.returnWallet || state.returnWallet.length < 10) errors.push('returnWalletField');
    } else if (state.service === 'stars') {
      if (state.starsQty < SERVICES.stars.minQty) errors.push('starQtyField');
    } else if (state.service === 'premium') {
      if (!state.premiumMonths) errors.push('premiumField');
    }
    errors.forEach((e, i) => markMiss(e, i > 0));
    return errors.length === 0;
  }

  // ---------- Payment link + comment ----------
  function buildPaymentLink(totalTon, comment) {
    const nano = toNano(totalTon);
    // Delegate to the editable payment-config so each service can use its own
    // method (tonkeeper / fragment / api / manual / usdt).
    if (window.AWM_buildPayLink) {
      const usdtMode = state.service === 'deal' && state.dealCurrency === 'USDT';
      // In USD₮ mode the entered amount is already in USDT — settle that exact
      // amount as a jetton transfer (6 decimals → micro-USDT).
      const usdtUnits = usdtMode ? Math.round(totalTon * 1e6) : 0;
      return window.AWM_buildPayLink(state.service, {
        nano, comment, finalTon: totalTon,
        currency: usdtMode ? 'USDT' : 'TON',
        usdtUnits
      });
    }
    return `https://app.tonkeeper.com/transfer/${WALLET}?amount=${nano}&text=${encodeURIComponent(comment)}`;
  }
  function buildFullComment(opts) {
    const tr = T[state.lang];
    const svc = SERVICES[state.service];
    const c = opts.compute;
    const promo = opts.promo;
    const donation = opts.donation;
    const finalTon = opts.finalTon;
    const code = opts.code;

    const parts = [];
    parts.push(`${tr.cmtUser}: @${state.username}`);
    parts.push(`${tr.cmtSvc}: ${svc.name.en}`);

    if (state.service === 'custom') {
      parts.push(`${tr.cmtBase}: ${P.formatTon(c.total)} TON / ${P.formatUsd(c.totalUsd)}`);
      const reasonNames = state.lang === 'ru'
        ? { other: 'Другое', services: 'Оплата услуг', debt: 'Возврат долга', donation: 'Донат', goods: 'Оплата товара', prepay: 'Предоплата', deposit: 'Бронь/депозит', gift: 'Подарок', agreement: 'По договорённости', tip: 'Чаевые' }
        : { other: 'Other', services: 'Services', debt: 'Debt return', donation: 'Donation', goods: 'Goods', prepay: 'Prepay', deposit: 'Deposit', gift: 'Gift', agreement: 'By agreement', tip: 'Tip' };
      const rn = reasonNames[state.customReason] || state.customReason;
      const rt = (state.customReason === 'other' && state.customReasonText) ? ` (${state.customReasonText})` : '';
      parts.push(`reason: ${rn}${rt}`);
    } else if (state.service === 'deal') {
      parts.push(`${tr.cmtBase}: ${P.formatTon(c.total)} TON / ${P.formatUsd(c.totalUsd)}`);
      if (state.dealCounterparty) parts.push(`deal_with: @${state.dealCounterparty}`);
      if (state.dealDesc) parts.push(`deal: ${state.dealDesc}`);
      parts.push(`deal_currency: ${state.dealCurrency || 'TON'}`);
    } else if (state.service === 'mint') {
      parts.push(`${tr.cmtBase}: ${P.formatTon(c.base)} TON`);
      parts.push(`${tr.cmtFee}: ${P.formatTon(c.fee)} TON (${c.feePercent}%)`);
    } else if (state.service === 'boost') {
      parts.push(`${tr.cmtTarget}: @${state.boostTarget}`);
      parts.push(`bid: ${P.formatTon(c.base)} TON`);
      parts.push(`${tr.cmtFee}: ${P.formatTon(c.fee)} TON (${c.feePercent}%)`);
    } else if (state.service === 'stars') {
      parts.push(`${tr.cmtItem}: ${P.formatInt(state.starsQty)} stars`);
      parts.push(`${tr.cmtBase}: ${P.formatUsd(c.totalUsd)} / ${P.formatTon(c.total)} TON`);
    } else if (state.service === 'premium') {
      const tier = SERVICES.premium.tiers.find(t => t.months === state.premiumMonths);
      parts.push(`${tr.cmtItem}: Premium ${tier.months} ${tr.cmtMonths}`);
      parts.push(`${tr.cmtBase}: ${P.formatTon(c.total)} TON`);
      parts.push(`${tr.cmtGift}: ${state.premiumGift ? '@' + state.premiumGift : (tr.cmtSelf || 'self')}`);
    }
    if (state.service !== 'custom' && state.returnWallet) parts.push(`${tr.cmtReturn}: ${state.returnWallet}`);
    if (state.contact) parts.push(`${tr.cmtContact}: ${state.contact}`);
    if (state.comment) parts.push(`comment: ${state.comment}`);
    if (state.agreed) parts.push('agreed: yes');
    if (promo && promo.valid) parts.push(`${tr.cmtPromo}: #${promo.code} ${promo.label}`);
    if (donation > 0) parts.push(`${tr.cmtDonation}: +${P.formatTon(donation)} TON`);
    parts.push(`${tr.cmtRate}: $${RateStore.tonUsd.toFixed(3)}/TON`);
    parts.push(`${tr.cmtTotal}: ${P.formatTon(finalTon)} TON`);
    parts.push(code);
    return parts.join(' | ');
  }
  function applyPromo(baseTon) {
    const code = state.promoCode;
    if (!code) return { code: '', valid: false, discount: 0, label: '' };
    const rule = PROMOS[code];
    if (!rule) return { code, valid: false, discount: 0, label: '' };
    let d = rule.type === 'percent' ? baseTon * rule.value / 100 : rule.value;
    d = Math.max(0, Math.min(d, Math.max(0, baseTon - 0.1)));
    return { code, valid: d > 0, discount: +d.toFixed(4), label: rule.label };
  }

  // Donation easter egg — selecting the 100% reward spawns a celebratory trail.
  let secretPromoFired = false;
  function checkSecretPromo() {
    if (state.donationPercent === 100 && !secretPromoFired) {
      secretPromoFired = true;
      if (window.AWM_spawnTrail) for (let i = 0; i < 4; i++) setTimeout(() => window.AWM_spawnTrail('\u2764 THANK YOU'), i * 180);
      if (window.AWM_haptic) window.AWM_haptic('success');
    } else if (state.donationPercent !== 100) {
      secretPromoFired = false;
    }
  }

  // ---------- Payment QR (inline + branded zoom) ----------
  let _lastQrText = '', _lastZoomText = '';
  function renderQrInto(host, text, size) {
    if (!host || !window.AWM_QR) return;
    host.innerHTML = '';
    try {
      const canvas = window.AWM_QR.renderCanvas(text, {
        size: size || 168, ecc: 'LOW', border: 4, dark: '#000000', light: '#ffffff'
      });
      canvas.className = 'qr-img';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      host.appendChild(canvas);
    } catch (e) {
      host.textContent = '—';
    }
  }
  function renderPayQr(text) {
    const host = byId('qrCanvas');
    if (!host || !window.AWM_QR) return;
    if (text !== _lastQrText || !host.firstChild) {
      _lastQrText = text;
      renderQrInto(host, text, 220);
    }
    // Keep the enlarged copy in sync ONLY when the payload actually changes.
    // (The rate poll re-runs buildReceipt every 15s; without this guard the open
    //  QR would be wiped & redrawn each tick, looking like it "refreshes itself".)
    const zov = byId('qrZoomOverlay');
    if (zov && zov.classList.contains('visible') && text && text !== _lastZoomText) {
      _lastZoomText = text;
      renderQrInto(byId('qrZoomCanvas'), text, 380);
      syncZoomMeta();
    }
  }
  function syncZoomMeta() {
    const amt = byId('qrZoomAmt'), code = byId('qrZoomCode'), pay = byId('qrZoomPay');
    if (amt) {
      const pna = byId('payNowAmount');
      amt.textContent = pna ? pna.textContent.replace(/^·\s*/, '').trim() : '—';
    }
    if (code) code.textContent = state.pendingCode || '#—';
    if (pay) pay.href = state.payLink || byId('payNow').href || '#';
    // Clean, aligned info list (label → value), built fresh for the zoom.
    const meta = byId('qrZoomMeta');
    if (meta) {
      const ru = state.lang !== 'en';
      const rows = [];
      rows.push([ru ? 'Услуга' : 'Service', SERVICES[state.service].name[state.lang], false]);
      let comp = '';
      if (state.service === 'stars') comp = P.formatInt(state.starsQty || 0) + ' ★';
      else if (state.service === 'premium') comp = (state.premiumMonths || 0) + (ru ? ' мес' : ' mo') + ' Premium';
      if (comp) rows.push([ru ? 'Состав' : 'Items', comp, false]);
      const meRaw = state.username || '';
      const rcp = recipientUsername();
      if (rcp && rcp !== meRaw) {
        if (meRaw) rows.push([ru ? 'Аккаунт' : 'Account', '@' + meRaw, false]);
        rows.push([ru ? 'Кому' : 'For', '@' + rcp, true]);
      } else {
        rows.push([ru ? 'Аккаунт' : 'Account', meRaw ? '@' + meRaw : (ru ? 'не указан' : 'not set'), false]);
      }
      meta.innerHTML = rows.map(([k, v, hot]) =>
        '<div class="qzm-row"><span class="qzm-k">' + k + '</span><span class="qzm-v' + (hot ? ' hot' : '') + '">' + v + '</span></div>'
      ).join('');
    }
  }
  function openQrZoom() {
    const ov = byId('qrZoomOverlay'); if (!ov) return;
    const link = state.payLink || byId('payNow').href || '';
    _lastZoomText = link;
    renderQrInto(byId('qrZoomCanvas'), link, 380);
    syncZoomMeta();
    // Make sure no stale "found" overlay is covering the fresh QR.
    const fx = byId('qrZoomFound'); if (fx) { fx.hidden = true; fx.classList.remove('go'); }
    // Lock the code/amount/QR for a fresh 10-min window — while open it must NOT
    // change on its own (rate ticks etc.) — and start the on-chain search.
    _codeLeft = CODE_TTL; _codeExpired = false;
    const rb = byId('qrZoomRefresh'); if (rb) rb.hidden = true;
    lockCode();
    if (window.AWM_startVerify) window.AWM_startVerify();
    const zw = byId('qrZoomWatch'); if (zw) zw.dataset.state = 'searching';
    ov.classList.add('visible');
    ov.setAttribute('aria-hidden', 'false');
    paintCodeCountdown();
    if (window.AWM_haptic) window.AWM_haptic('light');
  }
  function closeQrZoom() {
    const ov = byId('qrZoomOverlay'); if (!ov) return;
    ov.classList.remove('visible', 'maximized');
    ov.setAttribute('aria-hidden', 'true');
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    _lastZoomText = '';
    // Resume normal live rotation if the user hasn't committed to paying yet.
    if (!state.paymentInitiated) unlockCode();
  }

  // Called by the verifier the instant a matching transfer is found on-chain.
  // Flash a success check over the QR, then close the enlarged view so the
  // receipt (чек) can take over.
  function onPaymentFound() {
    state.paymentInitiated = true;
    const ov = byId('qrZoomOverlay');
    if (ov && ov.classList.contains('visible')) {
      const fx = byId('qrZoomFound');
      if (fx) { fx.hidden = false; fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go'); }
      setTimeout(() => closeQrZoom(), 1100);
    }
    stopCodeRotation();
  }
  window.AWM_onPaymentFound = onPaymentFound;

  // ---------- Rotating payment code (anti-fraud) ----------
  // The code + QR refresh every 10 minutes while the user is on the pay step.
  // They freeze the moment the user reaches the receipt (чек) and resume on exit.
  // 10 min is long enough that a code never rotates "right as" someone scans/pays.
  const CODE_TTL = 600;
  let _codeTimer = null, _codeLeft = CODE_TTL, _codeLocked = false, _codeExpired = false;
  let _lastFinalTon = 0, _frozen = null;
  function fmtClock(s) { s = Math.max(0, s); return s >= 60 ? (Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')) : (s + '\u0441'); }
  function paintCodeCountdown() {
    const txt = _codeExpired ? (state.lang === 'ru' ? 'Обновить' : 'Refresh') : fmtClock(_codeLeft);
    const t = byId('codeTtl'); if (t) t.textContent = txt;
    const tz = byId('qrZoomTtl'); if (tz) tz.textContent = txt;
    const pct = Math.max(0, (_codeLeft / CODE_TTL) * 100) + '%';
    const bar = byId('codeBar'); if (bar) bar.style.width = pct;
    const zbar = byId('qrZoomBar'); if (zbar) zbar.style.width = pct;
    const big = byId('qrZoomTimer'); if (big) big.textContent = fmtClock(_codeLeft);
  }
  function setCodeExpired() {
    _codeExpired = true;
    paintCodeCountdown();
    ['qrWatch', 'qrZoomWatch'].forEach((id) => { const w = byId(id); if (w) w.dataset.state = 'expired'; });
    const ru = state.lang === 'ru';
    const txt = ru ? 'Код истёк — обновите для новой проверки' : 'Code expired — refresh to keep checking';
    ['qrWatchTx', 'qrZoomWatchTx'].forEach((id) => { const el = byId(id); if (el) el.textContent = txt; });
    const rb = byId('qrZoomRefresh'); if (rb) rb.hidden = false;
    if (window.AWM_haptic) window.AWM_haptic('warning');
  }
  function rotatePaymentCode() {
    if (state.paymentInitiated) return;
    const c = getCurrentCompute();
    state.pendingCode = P.makePaymentCode({ service: state.service, username: state.username, total: c.total });
    if (!Array.isArray(window.AWM_paymentCodes)) window.AWM_paymentCodes = [];
    if (state.pendingCode && !window.AWM_paymentCodes.includes(state.pendingCode)) window.AWM_paymentCodes.push(state.pendingCode);
    buildReceipt();
    const qc = byId('qrCanvas');
    if (qc) { qc.classList.remove('qr-rotated'); void qc.offsetWidth; qc.classList.add('qr-rotated'); }
    _codeLeft = CODE_TTL; _codeExpired = false;
    paintCodeCountdown();
  }
  // Manual refresh from the QR-zoom («Обновить»): force a fresh code even while
  // locked, restart the 10-min window and re-run the search.
  function refreshLockedCode() {
    const ru = state.lang === 'ru';
    _frozen = null; // allow a real recompute at the current rate
    state.pendingCode = P.makePaymentCode({ service: state.service, username: state.username, total: getCurrentCompute().total });
    if (!Array.isArray(window.AWM_paymentCodes)) window.AWM_paymentCodes = [];
    if (state.pendingCode && !window.AWM_paymentCodes.includes(state.pendingCode)) window.AWM_paymentCodes.push(state.pendingCode);
    buildReceipt();
    // Re-freeze on the freshly generated code/link.
    _frozen = { ton: _lastFinalTon, link: state.payLink, code: state.pendingCode };
    [byId('qrCanvas'), byId('qrZoomCanvas')].forEach((qc) => { if (qc) { qc.classList.remove('qr-rotated'); void qc.offsetWidth; qc.classList.add('qr-rotated'); } });
    if (byId('qrZoomOverlay')?.classList.contains('visible')) renderQrInto(byId('qrZoomCanvas'), state.payLink, 380);
    _codeLeft = CODE_TTL; _codeExpired = false;
    ['qrWatch', 'qrZoomWatch'].forEach((id) => { const w = byId(id); if (w) w.dataset.state = 'searching'; });
    ['qrWatchTx', 'qrZoomWatchTx'].forEach((id) => { const el = byId(id); if (el) el.textContent = ru ? 'Ищем оплату в блокчейне…' : 'Searching the blockchain…'; });
    const rb = byId('qrZoomRefresh'); if (rb) rb.hidden = true;
    if (window.AWM_resetVerify) window.AWM_resetVerify();
    if (window.AWM_startVerify) window.AWM_startVerify();
    paintCodeCountdown();
    if (window.AWM_haptic) window.AWM_haptic('medium');
  }
  window.AWM_refreshLockedCode = refreshLockedCode;
  function lockCode() { _codeLocked = true; _frozen = { ton: _lastFinalTon, link: state.payLink, code: state.pendingCode }; }
  window.AWM_lockCode = lockCode;
  function unlockCode() {
    _codeLocked = false; _frozen = null; _codeExpired = false; _codeLeft = CODE_TTL;
    const rb = byId('qrZoomRefresh'); if (rb) rb.hidden = true;
    paintCodeCountdown();
  }
  function codeRotationActive() {
    const ov = byId('receiptOverlay');
    return ov && ov.classList.contains('visible') &&
      (+(document.querySelector('.receipt-sheet')?.getAttribute('data-cart-step') || 0) === 3) &&
      !state.paymentInitiated;
  }
  function startCodeRotation() {
    stopCodeRotation();
    _codeLeft = CODE_TTL; _codeExpired = false;
    paintCodeCountdown();
    _codeTimer = setInterval(() => {
      if (!codeRotationActive()) { stopCodeRotation(); return; }
      if (_codeExpired) return;          // frozen until manual refresh
      _codeLeft -= 1;
      if (_codeLeft <= 0) {
        // While the QR is open (locked) we never silently rotate — the code
        // stays put and the user gets a Refresh action instead.
        if (_codeLocked) setCodeExpired();
        else rotatePaymentCode();
      } else paintCodeCountdown();
    }, 1000);
  }
  function stopCodeRotation() {
    if (_codeTimer) { clearInterval(_codeTimer); _codeTimer = null; }
  }
  window.AWM_stopCodeRotation = stopCodeRotation;
  // «Сделать новый» forces a fresh code/QR before the 10-min mark.
  window.AWM_rotateCode = rotatePaymentCode;

  // ---------- Agreement gate (slide-to-confirm) ----------
  let _agreedService = null;

  function serviceWarning() {
    const ru = state.lang === 'ru';
    switch (state.service) {
      case 'stars':   return ru ? 'Звёзды зачисляются на указанный аккаунт автоматически. После зачисления возврат невозможен.' : 'Stars are credited to the account automatically. No refund after delivery.';
      case 'premium': return ru ? 'Premium активируется на указанный аккаунт. После активации возврат невозможен.' : 'Premium activates on the account. No refund after activation.';
      case 'mint':    return ru ? 'Минт NFT-юзернейма необратим. Убедитесь, что выполнены условия: канал создан минимум 2 недели назад.' : 'NFT username mint is irreversible. Make sure the conditions are met: channel created at least 2 weeks ago.';
      case 'boost':   return ru ? 'Доп. услуга удерживается за оказанную услугу — возврат за неё не предусмотрен. Юзернейм должен быть NFT.' : 'The commission is charged for the rendered service — no refund for it. The username must be an NFT.';
      case 'custom': {
        const reasonTx = state.customReason === 'other'
          ? (state.customReasonText || (ru ? 'не указана' : 'not stated'))
          : reasonName(state.customReason, ru);
        return ru
          ? 'Проверьте причину платежа: «' + reasonTx + '». От неё зависит назначение перевода и условия возврата. Перевод уходит напрямую — отменить нельзя.'
          : 'Verify the payment reason: “' + reasonTx + '”. It determines the transfer purpose and refund terms. The transfer is direct — it cannot be cancelled.';
      }
      default:        return ru ? 'Перевод уходит напрямую получателю. Проверьте сумму и реквизиты — отменить нельзя.' : 'The transfer goes directly to the recipient. Check the amount and details — it cannot be cancelled.';
    }
  }
  function reasonName(v, ru) {
    const m = ru ? {
      services: 'Оплата услуг', debt: 'Возврат долга', donation: 'Донат / поддержка',
      goods: 'Оплата товара', prepay: 'Предоплата / аванс', deposit: 'Бронь / депозит',
      gift: 'Подарок', agreement: 'Оплата по договорённости', tip: 'Чаевые', other: 'Другое'
    } : {
      services: 'Payment for services', debt: 'Debt repayment', donation: 'Donation / support',
      goods: 'Payment for goods', prepay: 'Prepayment / advance', deposit: 'Booking / deposit',
      gift: 'Gift', agreement: 'Payment by arrangement', tip: 'Tip', other: 'Other'
    };
    return m[v] || (ru ? 'не указана' : 'not stated');
  }
  function applyPayLock() {
    const pane = document.querySelector('.cart-pane.pay-pane');
    if (pane) {
      pane.classList.toggle('gated', !state.agreed);    // hides the pay body
      pane.classList.toggle('agree-locked', !state.agreed);
    }
  }
  function setSlidePos(frac) {
    const track = byId('slideTrack'), thumb = byId('slideThumb');
    if (!track || !thumb) return;
    const max = track.clientWidth - thumb.offsetWidth - 8;
    const x = Math.max(0, Math.min(max, frac * max));
    // Keep the parked X in a custom prop so the confirm keyframe (which animates
    // scale) can bake it in and the thumb stays put on the right instead of
    // snapping back to the left.
    thumb.style.setProperty('--slide-x', x + 'px');
    thumb.style.transform = `translateX(${x}px)`;
    const lbl = byId('slideLabel');
    if (lbl) lbl.style.opacity = String(1 - Math.min(1, frac * 1.6));
  }
  function renderAgreement() {
    const warn = byId('agreeWarn');
    if (warn) warn.textContent = serviceWarning();
    // Out-of-hours notice: manual services may be delayed when the service is
    // offline (16:30–00:00 MSK). Auto services (Stars/Premium) deliver 24/7.
    const hw = byId('agreeHoursWarn');
    if (hw) {
      const closed = (typeof window.AWM_isOpen === 'function') ? !window.AWM_isOpen() : false;
      const manual = state.service !== 'stars' && state.service !== 'premium';
      if (closed && manual) {
        hw.textContent = T[state.lang].hoursWarn;
        hw.hidden = false;
      } else {
        hw.hidden = true;
        hw.textContent = '';
      }
    }
    // Re-confirm whenever the service changes.
    if (_agreedService !== state.service) { state.agreed = false; _agreedService = state.service; }
    const block = byId('agreeBlock'), sc = byId('slideConfirm'), lbl = byId('slideLabel');
    if (block) block.classList.toggle('is-confirmed', state.agreed);
    if (sc) sc.classList.toggle('confirmed', state.agreed);
    if (lbl) lbl.textContent = state.agreed ? T[state.lang].agreeDone : T[state.lang].agreeSlide;
    // Park the thumb at the correct end.
    const thumb = byId('slideThumb'), track = byId('slideTrack');
    if (thumb && track) {
      if (state.agreed) { const max = Math.max(0, track.clientWidth - thumb.offsetWidth - 8); thumb.style.setProperty('--slide-x', max + 'px'); thumb.style.transform = `translateX(${max}px)`; }
      else { thumb.style.setProperty('--slide-x', '0px'); thumb.style.transform = 'translateX(0px)'; }
    }
    if (lbl && !state.agreed) lbl.style.opacity = '1';
    applyPayLock();
  }
  window.AWM_renderAgreement = renderAgreement;

  function confirmAgree() {
    if (state.agreed) return;
    state.agreed = true;
    if (window.AWM_haptic) window.AWM_haptic('success');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1) Morph the slider thumb IN PLACE: arrow → green check, enlarge, ring spin.
    const sc = byId('slideConfirm'), lbl = byId('slideLabel');
    if (sc) sc.classList.add('confirmed', 'just-confirmed');
    if (lbl) lbl.textContent = T[state.lang].agreeDone;

    // 2) Celebratory burst over the whole pay pane (survives the gate reveal).
    playConfirmBurst();

    // 3) Reveal the pay body only AFTER the animation has played.
    const finish = () => {
      renderAgreement();                       // un-gates + parks thumb
      const body = byId('payBody');
      if (body) { body.classList.remove('reveal'); void body.offsetWidth; body.classList.add('reveal'); }
      if (sc) sc.classList.remove('just-confirmed');
      // The QR is now visible — begin watching the chain immediately so the
      // payment is detected automatically (no "Я оплатил" needed).
      if (window.AWM_startVerify) window.AWM_startVerify();
    };
    if (reduce) finish();
    else setTimeout(finish, 900);
  }

  // Celebratory "Подтверждено ✓" that opens over the pay pane and fades.
  function playConfirmBurst() {
    const host = document.querySelector('.cart-pane.pay-pane') || byId('agreeBlock');
    if (!host) return;
    const old = host.querySelector('.confirm-burst'); if (old) old.remove();
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const b = document.createElement('div');
    b.className = 'confirm-burst';
    b.innerHTML =
      '<div class="cb-card">' +
        '<span class="cb-checkwrap">' +
          '<span class="cb-ring" aria-hidden="true"></span>' +
          '<span class="cb-ring cb-ring2" aria-hidden="true"></span>' +
          '<span class="cb-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
        '</span>' +
        '<span class="cb-text">' + (state.lang === 'ru' ? 'Подтверждено' : 'Confirmed') + '</span>' +
      '</div>';
    host.appendChild(b);
    const ttl = reduce ? 500 : 1250;
    setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 300); }, ttl);
  }
  function initAgreeHold() {
    const track = byId('slideTrack'), thumb = byId('slideThumb');
    if (!track || !thumb || thumb._wired) return;
    thumb._wired = true;
    let dragging = false, startX = 0, lastFrac = 0;
    const maxFrac = () => 1;
    const onDown = (e) => {
      if (state.agreed) return;
      dragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      thumb.classList.add('dragging');
      if (window.AWM_haptic) window.AWM_haptic('selection');
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const max = track.clientWidth - thumb.offsetWidth - 8;
      const frac = Math.max(0, Math.min(1, (x - startX) / max));
      lastFrac = frac;
      setSlidePos(frac);
      if (frac >= 0.97) { dragging = false; thumb.classList.remove('dragging'); setSlidePos(1); confirmAgree(); }
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      thumb.classList.remove('dragging');
      // Stay on the RIGHT once dragged past the midpoint — slide forward and
      // confirm so the check parks where the user left it, instead of snapping
      // back to the left. Only an early release (barely moved) snaps back.
      if (!state.agreed) {
        if (lastFrac >= 0.5) { setSlidePos(1); confirmAgree(); }
        else setSlidePos(0);
      }
    };
    thumb.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    // Touch fallbacks
    thumb.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }
  window.AWM_initAgreeHold = initAgreeHold;

  // ---------- Receipt ----------
  function buildReceipt() {
    const c = getCurrentCompute();
    const tr = T[state.lang];

    state.pendingCode = (_codeLocked && _frozen && _frozen.code) ? _frozen.code : (state.pendingCode || P.makePaymentCode({ service: state.service, username: state.username, total: c.total }));

    const svc = SERVICES[state.service];
    byId('rcService').textContent = svc.name[state.lang] + (
      state.service === 'premium' ? ' · ' + SERVICES.premium.tiers.find(t => t.months === state.premiumMonths).label[state.lang] + (state.premiumGift ? ' · @' + state.premiumGift : '')
      : state.service === 'stars' ? ' · ' + P.formatInt(state.starsQty) + ' ★'
      : ''
    );

    hideRow('rcFeeRow'); hideRow('rcPromoRow'); hideRow('rcDonationRow');
    if (byId('rcDiscRow')) hideRow('rcDiscRow');

    // Discount row (stars packs / premium tiers).
    if (byId('rcDiscRow') && (c.discountPct || 0) > 0 && c.valid) {
      const usdSaved = c.discountUsd != null ? c.discountUsd : 0;
      setRow('rcDiscRow', 'rcDiscVal', `−${c.discountPct}%`, usdSaved > 0 ? `≈ −${P.formatUsd(usdSaved)}` : '');
    }

    if (state.service === 'custom' || state.service === 'deal') {
      byId('rcBaseKey').textContent = tr.sumBase;
      byId('rcBaseVal').innerHTML = fmtTonUsd(c.total, c.totalUsd);
    } else if (state.service === 'mint') {
      byId('rcBaseKey').textContent = state.lang === 'ru' ? 'База' : 'Base';
      byId('rcBaseVal').innerHTML = fmtTonUsd(c.base, P.usdFromTon(c.base));
      setRow('rcFeeRow', 'rcFeeVal', `${P.formatTon(c.fee)} TON`, `${c.feePercent}% · ≈ ${P.formatUsd(P.usdFromTon(c.fee))}`);
      byId('rcFeeKey').textContent = tr.sumFee;
    } else if (state.service === 'boost') {
      byId('rcBaseKey').textContent = state.lang === 'ru' ? 'Ставка' : 'Bid';
      byId('rcBaseVal').innerHTML = fmtTonUsd(c.base, P.usdFromTon(c.base));
      setRow('rcFeeRow', 'rcFeeVal', `${P.formatTon(c.fee)} TON`, `${c.feePercent}% · ${state.lang === 'ru' ? 'оплачивается' : 'charged'}`);
      byId('rcFeeKey').textContent = tr.sumFee;
    } else if (state.service === 'stars') {
      byId('rcBaseKey').textContent = state.lang === 'ru' ? 'Звёзды' : 'Stars';
      byId('rcBaseVal').innerHTML = `${P.formatInt(state.starsQty)} ★<span class="sub">${P.formatUsd(c.totalUsd)} · 1★ = $${SERVICES.stars.starUsd}</span>`;
    } else if (state.service === 'premium') {
      const tier = SERVICES.premium.tiers.find(t => t.months === state.premiumMonths);
      byId('rcBaseKey').textContent = tier.label[state.lang];
      byId('rcBaseVal').innerHTML = fmtTonUsd(c.total, c.totalUsd);
    }

    const promo = applyPromo(c.total);
    if (promo.code && promo.valid) {
      setRow('rcPromoRow', 'rcPromoVal', `${promo.label}`, `#${promo.code}`);
      byId('promoStatus').className = 'promo-status ok';
      byId('promoStatus').textContent = tr.promoOk.replace('{c}', promo.code).replace('{l}', promo.label);
    } else if (promo.code && !promo.valid) {
      byId('promoStatus').className = 'promo-status warn';
      byId('promoStatus').textContent = tr.promoBad.replace('{c}', promo.code);
    } else {
      byId('promoStatus').className = 'promo-status';
      byId('promoStatus').textContent = '';
    }

    const donationFlat = Math.max(0, state.donationFlat);
    const donationPercentPart = state.donationPercent > 0 && c.total > 0 ? +(c.total * state.donationPercent / 100).toFixed(4) : 0;
    const donation = +(donationFlat + donationPercentPart).toFixed(4);
    byId('donationTotal').textContent = '+' + P.formatTon(donation) + ' TON';
    // Multi-currency value of the tip (USD + RUB), shown under the TON amount.
    const fiatEl = byId('donationFiat');
    if (fiatEl) {
      if (donation > 0) {
        const usd = P.usdFromTon(donation);
        fiatEl.textContent = '≈ ' + P.formatUsd(usd) + ' · ' + fiatFromUsd(usd).replace(/^.*·\s*/, '');
        fiatEl.style.visibility = 'visible';
      } else { fiatEl.textContent = ''; }
    }
    $$('[data-donation]').forEach(b => {
      const v = Number(b.dataset.donation);
      b.classList.toggle('active', v === state.donationPercent && v !== 0);
      // Visual hint: pre-suggest 5% when nothing is chosen yet, so it invites a tap.
      b.classList.toggle('suggested', v === 5 && state.donationPercent === 0 && !(state.donationFlat > 0));
    });
    if (donation > 0) setRow('rcDonationRow', 'rcDonationVal', '+' + P.formatTon(donation) + ' TON', state.donationPercent ? state.donationPercent + '%' : null);

    byId('rcRate').textContent = '$' + RateStore.tonUsd.toFixed(3);
    byId('rcWhen').textContent = new Date().toLocaleString(state.lang === 'ru' ? 'ru-RU' : 'en-US', { dateStyle: 'short', timeStyle: 'medium' });

    const finalTon = Math.max(0.01, +(c.total - (promo.valid ? promo.discount : 0) + donation).toFixed(4));
    _lastFinalTon = finalTon;
    const usdtMode = isUsdtDeal();
    const fiatEl2 = byId('rcTotalFiat');
    byId('rcTotal').innerHTML = '<span class="pt-ton">' + payPrimary(finalTon) + '</span>';
    if (fiatEl2) {
      if (usdtMode) {
        const usd = finalTon; // 1 USDT ≈ $1
        fiatEl2.innerHTML = '<span class="ptf">≈ ' + P.formatTon(P.tonFromUsd(usd)) + ' TON</span>'
                          + '<span class="ptf">≈ ' + fiat2Line(usd) + '</span>';
      } else {
        fiatEl2.innerHTML = fmtPayFiat(P.usdFromTon(finalTon));
      }
    }
    // Total-discount chip near the pay total — combines pack/tier discount AND
    // any promo code, shown as a percent + money saved.
    const ptSave = byId('payTopSave');
    if (ptSave) {
      const pct = c.discountPct || 0;
      const baseSaveUsd = (c.discountUsd != null ? c.discountUsd : 0);
      const promoSaveTon = promo.valid ? promo.discount : 0;
      const totalSaveUsd = baseSaveUsd + P.usdFromTon(promoSaveTon);
      if ((pct > 0 || promoSaveTon > 0) && c.valid) {
        let txt = tr.sumDiscount;                       // "Скидка" / "Discount"
        if (pct > 0) txt += ` −${pct}%`;
        if (totalSaveUsd > 0.005) txt += ` · −${P.formatUsd(totalSaveUsd)}`;
        ptSave.textContent = txt;
        ptSave.classList.remove('hidden');
      } else ptSave.classList.add('hidden');
    }
    // Standalone discount card on the pay step (next to the promo field).
    const dCard = byId('discCard'), dVal = byId('discCardVal'), dSub = byId('discCardSub');
    if (dCard && dVal) {
      const pct = c.discountPct || 0;
      const baseSaveUsd = (c.discountUsd != null ? c.discountUsd : 0);
      const promoSaveTon = promo.valid ? promo.discount : 0;
      const totalSaveUsd = baseSaveUsd + P.usdFromTon(promoSaveTon);
      if ((pct > 0 || promoSaveTon > 0) && c.valid) {
        dVal.textContent = pct > 0 ? ('−' + pct + '%') : ('−' + P.formatTon(promoSaveTon) + ' TON');
        if (dSub) dSub.textContent = totalSaveUsd > 0.005 ? ('≈ −' + P.formatUsd(totalSaveUsd)) : (promo.valid ? ('#' + promo.code) : '');
        dCard.setAttribute('data-on', 'true');
      } else {
        dVal.textContent = state.lang === 'ru' ? 'нет' : 'none';
        if (dSub) dSub.textContent = '';
        dCard.setAttribute('data-on', 'false');
      }
    }
    byId('rcCode').textContent = state.pendingCode;
    // Track the current code in the session history so the verifier can match a
    // payment made against it even after the code later rotates.
    if (!Array.isArray(window.AWM_paymentCodes)) window.AWM_paymentCodes = [];
    if (state.pendingCode && !window.AWM_paymentCodes.includes(state.pendingCode)) window.AWM_paymentCodes.push(state.pendingCode);
    const comment = buildFullComment({ compute: c, promo, donation, finalTon, code: state.pendingCode });
    // While the QR/code is locked (open zoom or payment in progress) keep the
    // EXACT same link & QR — never regenerate it from a refreshed rate.
    const link = (_codeLocked && _frozen && _frozen.link) ? _frozen.link : buildPaymentLink(finalTon, comment);
    state.payLink = link;
    byId('payNow').href = link;
    renderPayQr(link);
    const thanksEl = byId('donateThanks');
    if (thanksEl) thanksEl.hidden = !(donation > 0);
    const tipPlateEl = byId('tipPlate');
    if (tipPlateEl) tipPlateEl.classList.toggle('is-tipped', donation > 0);
    byId('payNowAmount').textContent = '· ' + payPrimary(finalTon);
    // Per-service Pay button label from the payment config.
    if (window.AWM_payLabel) {
      const lbl = byId('payNow').querySelector('[data-i18n="payNow"]');
      if (lbl) lbl.textContent = window.AWM_payLabel(state.service, state.lang);
    }
    const rwEl = byId('rcWallet'); if (rwEl) rwEl.textContent = WALLET;
    // Context for the on-chain payment verifier.
    window.AWM_paymentContext = {
      wallet: WALLET,
      nano: toNano(finalTon),
      currency: usdtMode ? 'USDT' : 'TON',
      usdtUnits: usdtMode ? Math.round(finalTon * 1e6) : 0,
      usdtMaster: usdtMode && window.AWM_PAYCONFIG && window.AWM_PAYCONFIG.usdt ? window.AWM_PAYCONFIG.usdt.master : null,
      finalTon: finalTon,
      usd: P.usdFromTon(finalTon),
      rub: P.rubFromTon(finalTon),
      code: state.pendingCode,
      comment: comment,
      service: SERVICES[state.service].name[state.lang],
      recipient: recipientUsername(),
      username: state.username,
      rate: RateStore.tonUsd,
      when: new Date().toISOString()
    };
    // Stage-1 mirror + live order preview
    const svcName = byId('rcService').textContent;
    if (byId('rcServiceMirror')) byId('rcServiceMirror').textContent = svcName;
    if (byId('cartPreviewTon')) byId('cartPreviewTon').textContent = P.formatTon(finalTon) + ' TON';
    if (byId('cartPreviewUsd')) byId('cartPreviewUsd').textContent = '≈ ' + fiatFromTon(finalTon);
    if (byId('cartFootTotal')) byId('cartFootTotal').textContent = P.formatTon(finalTon) + ' TON';
    if (byId('rcServiceIco')) {
      const icoName = state.service === 'custom' ? 'wallet' : state.service === 'stars' ? 'star' : state.service;
      renderIcon(byId('rcServiceIco'), icoName);
    }

    const post = byId('postActionBtn');
    if (state.service === 'mint') { post.classList.remove('hidden'); post.textContent = T[state.lang].postMint; }
    else if (state.service === 'boost') { post.classList.remove('hidden'); post.textContent = T[state.lang].postBoost; }
    else { post.classList.add('hidden'); }

    byId('rcOk').textContent = '';
    byId('rcWarn').textContent = '';
    // recipient summary row (stage 3)
    if (state.service === 'custom' || state.service === 'mint') hideRow('rcRecipientRow');
    else { const r = recipientUsername(); setRow('rcRecipientRow', 'rcRecipientVal', r ? '@' + r : '—'); }
    // Small "what / who" line under the QR: service, composition and target account.
    paintPaySvcNote();
    state.ctaArmed = false;
    updateCtaHint();
  }

  function paintPaySvcNote() {
    const note = byId('paySvcNote'); if (!note) return;
    const ru = state.lang !== 'en';
    const svcName = SERVICES[state.service].name[state.lang];
    const meRaw = state.username || '';
    const rcp = recipientUsername();
    const parts = [];
    parts.push('<span class="psn-k">' + (ru ? 'Услуга' : 'Service') + '</span> ' + svcName);
    let comp = '';
    if (state.service === 'stars') comp = P.formatInt(state.starsQty || 0) + ' ★';
    else if (state.service === 'premium') comp = (state.premiumMonths || 0) + (ru ? ' мес' : ' mo') + ' Premium';
    if (comp) parts.push('<span class="psn-k">' + (ru ? 'Состав' : 'Items') + '</span> ' + comp);
    if (rcp && rcp !== meRaw) {
      if (meRaw) parts.push('<span class="psn-k">' + (ru ? 'Аккаунт' : 'Account') + '</span> @' + meRaw);
      parts.push('<span class="psn-hot">' + (ru ? 'Кому' : 'For') + ' @' + rcp + '</span>');
    } else {
      parts.push('<span class="psn-k">' + (ru ? 'Аккаунт' : 'Account') + '</span> ' + (meRaw ? '@' + meRaw : (ru ? 'не указан' : 'not set')));
    }
    note.innerHTML = parts.join('<span class="psn-dot" aria-hidden="true">·</span>');
    note.hidden = false;
  }

  function renderOrderCard() {
    const svc = SERVICES[state.service];
    byId('rcService').textContent = svc.name[state.lang] + (
      state.service === 'premium' ? ' · ' + SERVICES.premium.tiers.find(t => t.months === state.premiumMonths).label[state.lang] + (state.premiumGift ? ' · @' + state.premiumGift : '')
      : state.service === 'stars' ? ' · ' + P.formatInt(state.starsQty) + ' ★'
      : ''
    );
    if (byId('rcServiceIco')) {
      const icoName = state.service === 'custom' ? 'wallet' : state.service === 'stars' ? 'star' : state.service;
      renderIcon(byId('rcServiceIco'), icoName);
    }
    if (byId('rcServiceMirror')) byId('rcServiceMirror').textContent = byId('rcService').textContent;

    // Discount badge in the order card (состав).
    const oc = getCurrentCompute();
    const saveEl = byId('rcServiceSave');
    if (saveEl) {
      const pct = oc.discountPct || 0;
      if (pct > 0 && oc.valid) {
        const tr = T[state.lang];
        const usdSaved = oc.discountUsd != null ? oc.discountUsd : 0;
        saveEl.textContent = `${tr.sumDiscount} −${pct}%` + (usdSaved > 0 ? ` · ≈ −${P.formatUsd(usdSaved)}` : '');
        saveEl.classList.remove('hidden');
      } else {
        saveEl.classList.add('hidden');
      }
    }
  }

  function openReceiptCart() {
    state.ctaArmed = false;
    state.pendingCode = null;   // fresh order code per cart session (stable across live refreshes)
    state.paymentInitiated = false;   // step 4 stays locked until Pay / Copy link
    window.AWM_paymentCodes = [];      // fresh code history for the verifier
    if (window.AWM_resetVerify) window.AWM_resetVerify();
    renderOrderCard();
    setCartStep(1);
    openOverlay('receipt');
    updateCtaHint();
  }
  window.AWM_openReceiptCart = openReceiptCart;

  // ---------- 3-stage cart: editors, details, validation ----------
  function setStarsQty(v) {
    v = clamp(Math.trunc(v), 1, SERVICES.stars.maxQty);
    state.starsQty = v;
    byId('starQty').value = String(v);
    updatePreviews(); updateSummary();
  }
  function setPremiumMonths(m) {
    state.premiumMonths = m;
    renderTiers();
    updatePreviews(); updateSummary();
  }
  // Step the active service's quantity/amount. Pack-aware for stars, tier-aware
  // for premium, plain magnitude step for TON amounts.
  function cartStep(dir) {
    if (state.service === 'stars') {
      const packs = SERVICES.stars.packs.map(p => p.qty);
      const idx = packs.indexOf(state.starsQty);
      if (idx !== -1) setStarsQty(packs[clamp(idx + (dir === 'up' ? 1 : -1), 0, packs.length - 1)]);
      else setStarsQty(clamp(state.starsQty + (dir === 'up' ? 50 : -50), SERVICES.stars.minQty, SERVICES.stars.maxQty));
    } else if (state.service === 'premium') {
      const months = SERVICES.premium.tiers.map(t => t.months);
      const idx = months.indexOf(state.premiumMonths);
      setPremiumMonths(months[clamp(idx + (dir === 'up' ? 1 : -1), 0, months.length - 1)]);
    } else {
      const field = state.service === 'custom' ? 'customAmount' : state.service === 'deal' ? 'dealAmount' : state.service === 'mint' ? 'mintBid' : 'boostBid';
      stepInput(field, dir);
    }
    renderOrderCard(); syncCartTotals();
    refreshCartEditValue();
  }

  function cartEditModel() {
    if (state.service === 'stars')   return { num: P.formatInt(state.starsQty), unit: '★', adj: true };
    if (state.service === 'premium') { const t = SERVICES.premium.tiers.find(t => t.months === state.premiumMonths); return { num: t ? t.months : 0, unit: state.lang === 'ru' ? 'мес' : 'mo', adj: true }; }
    if (state.service === 'mint')    return { num: state.mintBidTon ? formatDecimalDisplay(state.mintBidTon) : '0', unit: 'TON', adj: true };
    if (state.service === 'boost')   return { num: state.boostBidTon ? formatDecimalDisplay(state.boostBidTon) : '0', unit: 'TON', adj: true };
    if (state.service === 'deal')    return { num: state.dealAmountTon ? formatDecimalDisplay(state.dealAmountTon) : '0', unit: isUsdtDeal() ? 'USDT' : 'TON', adj: true };
    return { num: state.customAmountTon ? formatDecimalDisplay(state.customAmountTon) : '0', unit: 'TON', adj: true };
  }
  function refreshCartEditValue() {
    const m = cartEditModel();
    const numEl = byId('cartEditNum'), unitEl = byId('cartEditUnit');
    if (numEl) numEl.textContent = m.num;
    if (unitEl) unitEl.textContent = m.unit;
  }
  function renderCartEdit() {
    const host = byId('cartEdit');
    if (!host) return;
    const m = cartEditModel();
    const tr = T[state.lang];
    const label = state.service === 'stars' ? (state.lang === 'ru' ? 'Количество звёзд' : 'Stars amount')
      : state.service === 'premium' ? (state.lang === 'ru' ? 'Срок подписки' : 'Subscription length')
      : state.service === 'mint' ? (state.lang === 'ru' ? 'Ставка за NFT-ник' : 'NFT bid')
      : state.service === 'boost' ? (state.lang === 'ru' ? 'Сумма повышения ставки' : 'Boost bid')
      : (state.lang === 'ru' ? 'Сумма оплаты' : 'Amount');
    host.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'qedit';
    wrap.innerHTML = `
      <div class="qedit-label">${label}</div>
      <div class="qstep" tabindex="0" role="spinbutton" aria-label="${label}">
        <button class="qbtn" type="button" data-dir="down" aria-label="−">−</button>
        <div class="qval"><span class="qnum" id="cartEditNum">${m.num}</span><span class="qunit" id="cartEditUnit">${m.unit}</span></div>
        <button class="qbtn" type="button" data-dir="up" aria-label="+">+</button>
      </div>
    `;
    host.appendChild(wrap);

    // quick chips for stars / premium
    if (state.service === 'stars') {
      const chips = document.createElement('div');
      chips.className = 'qchips';
      SERVICES.stars.packs.forEach(p => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'qchip' + (p.qty === state.starsQty ? ' active' : '');
        b.textContent = P.formatInt(p.qty);
        b.addEventListener('click', () => { setStarsQty(p.qty); renderOrderCard(); syncCartTotals(); renderCartEdit(); });
        chips.appendChild(b);
      });
      host.appendChild(chips);
    } else if (state.service === 'premium') {
      const chips = document.createElement('div');
      chips.className = 'qchips';
      SERVICES.premium.tiers.forEach(t => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'qchip' + (t.months === state.premiumMonths ? ' active' : '');
        b.textContent = t.label[state.lang];
        b.addEventListener('click', () => { setPremiumMonths(t.months); renderOrderCard(); syncCartTotals(); renderCartEdit(); });
        chips.appendChild(b);
      });
      host.appendChild(chips);
    }

    const step = wrap.querySelector('.qstep');
    wrap.querySelectorAll('.qbtn').forEach(b => b.addEventListener('click', () => cartStep(b.dataset.dir)));
    step.addEventListener('wheel', (e) => { e.preventDefault(); cartStep(e.deltaY < 0 ? 'up' : 'down'); }, { passive: false });
    step.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); cartStep('up'); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); cartStep('down'); }
    });
    // horizontal swipe to step
    let sx = 0, acc = 0, drag = false;
    step.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; acc = 0; drag = true; }, { passive: true });
    step.addEventListener('touchmove', (e) => {
      if (!drag) return;
      acc += e.touches[0].clientX - sx; sx = e.touches[0].clientX;
      while (Math.abs(acc) >= 26) { cartStep(acc > 0 ? 'up' : 'down'); acc += acc > 0 ? -26 : 26; }
    }, { passive: true });
    step.addEventListener('touchend', () => { drag = false; }, { passive: true });
  }

  function makeDetailField(opts) {
    // opts: {id, label, hint, prefix, value, placeholder, kind:'user'|'wallet'|'text', onInput}
    const field = document.createElement('div');
    field.className = 'cd-field' + (opts.multiline ? ' cd-field-full' : '');
    field.id = 'cd_' + opts.id;
    const lab = document.createElement('label');
    lab.className = 'cd-label';
    lab.textContent = opts.label + (opts.required ? ' *' : '');
    field.appendChild(lab);
    const wrap = document.createElement('div');
    wrap.className = 'input-wrap';
    if (opts.prefix) {
      const pre = document.createElement('span');
      pre.className = 'input-prefix';
      pre.textContent = opts.prefix;
      wrap.appendChild(pre);
    }
    const input = document.createElement(opts.multiline ? 'textarea' : 'input');
    if (!opts.multiline) input.type = 'text';
    if (opts.multiline) { input.rows = 3; input.classList.add('cd-textarea'); }
    input.className = 'input' + (opts.multiline ? ' cd-textarea' : '') + (opts.prefix ? ' with-prefix' : '');
    input.placeholder = opts.placeholder || '';
    input.value = opts.value || '';
    // Let the browser remember/offer past entries (stable name, no autocomplete=off).
    input.name = 'awm_' + (opts.id || 'field');
    input.autocomplete = opts.kind === 'user' ? 'username' : 'on';
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('autocorrect', 'off');
    input.spellcheck = false;
    input.addEventListener('input', () => {
      if (opts.kind === 'user') {
        // Sanitize WITHOUT flinging the caret to the end. We measure how many
        // valid chars sit left of the caret, reformat, then drop the caret back
        // after that same count — so editing mid-string / deleting stays put.
        const raw = input.value;
        const selPos = input.selectionStart ?? raw.length;
        const fixed = applyUsernameLive(raw);
        if (fixed !== raw) {
          const before = applyUsernameLive(raw.slice(0, selPos));
          let caret = Math.min(before.length, fixed.length);
          input.value = fixed;
          try { input.setSelectionRange(caret, caret); } catch {}
        }
      }
      else if (opts.kind === 'wallet') {
        const raw = input.value;
        const selPos = input.selectionStart ?? raw.length;
        const c = translitWallet(raw);
        if (c !== raw) {
          const before = translitWallet(raw.slice(0, selPos));
          input.value = c;
          try { input.setSelectionRange(before.length, before.length); } catch {}
        }
      }
      window.AWM_clearMiss(field);
      opts.onInput(input.value);
      if (opts.mirror) { const m = byId(opts.mirror); if (m && m.value !== input.value) m.value = input.value; }
      renderOrderCard(); syncCartTotals();
    });
    wrap.appendChild(input);
    field.appendChild(wrap);
    // Enter walks to the next field; if this is the last one, it advances the
    // cart to the pay step. Arrows are reserved for value steppers elsewhere.
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (opts.multiline) return;   // comment textarea: Enter inserts a newline
      e.preventDefault(); e.stopPropagation();
      const host = byId('cartDetails');
      const inputs = host ? [...host.querySelectorAll('.cd-field input')] : [];
      const idx = inputs.indexOf(input);
      const next = inputs[idx + 1];
      if (next) { next.focus(); next.select && next.select(); }
      else { input.blur(); if (window.AWM_gotoCartStep) window.AWM_gotoCartStep(3); }
    });
    if (opts.hint) {
      const h = document.createElement('div');
      h.className = 'cd-hint';
      h.textContent = opts.hint;
      field.appendChild(h);
    }
    return field;
  }
  function renderCartDetails() {
    const host = byId('cartDetails');
    if (!host) return;
    host.innerHTML = '';
    const ru = state.lang === 'ru';
    // Gentle prompt to review the order before paying.
    const note = document.createElement('div');
    note.className = 'cd-review-note';
    note.innerHTML = '<span class="cd-review-ico" aria-hidden="true">✓</span>' +
      (ru ? 'Проверьте детали заказа перед оплатой.' : 'Review your order details before paying.');
    host.appendChild(note);
    const add = (o) => host.appendChild(makeDetailField(o));
    // Red, attention-grabbing condition callout.
    const addWarn = (text) => {
      const w = document.createElement('div');
      w.className = 'cd-warn-red';
      w.innerHTML = '<span class="cd-warn-ico" aria-hidden="true">!</span><span class="cd-warn-tx">' + text + '</span>';
      host.appendChild(w);
    };
    const usernamePrefill = state.username ? '@' + state.username : '';
    // Small grey policy note (refund rules live on the pay step; here we only
    // explain what each field is for — no scary refund UI).
    const addInfo = (text) => {
      const i = document.createElement('div');
      i.className = 'cd-info-note';
      i.textContent = text;
      host.appendChild(i);
    };

    if (state.service === 'stars') {
      // Delivery target only. Defaults to the user's own @ — they just verify.
      if (!state.starsRecipient) state.starsRecipient = state.username || '';
      add({ id: 'starsRecipient', required: true, kind: 'user', prefix: '@',
        label: ru ? 'Кому зачислить звёзды' : 'Deliver stars to',
        value: state.starsRecipient,
        placeholder: 'username',
        hint: ru ? 'Подставлен ваш ник — проверьте получателя.' : 'Pre-filled with your username — verify the recipient.',
        onInput: (v) => { state.starsRecipient = applyUsernameLive(v); } });
    } else if (state.service === 'premium') {
      if (!state.premiumGift && state.username) state.premiumGift = state.username;
      add({ id: 'premiumGift', required: true, kind: 'user', prefix: '@', mirror: 'premiumGift',
        label: ru ? 'Кому оформить Premium' : 'Activate Premium for',
        value: state.premiumGift || state.username || '',
        placeholder: 'username',
        hint: ru ? 'Подставлен ваш ник — проверьте получателя.' : 'Pre-filled with your username — verify the recipient.',
        onInput: (v) => { state.premiumGift = applyUsernameLive(v); } });
    } else if (state.service === 'mint') {
      addWarn(ru
        ? 'Для минта NFT-юзернейма у вас должен быть канал, созданный минимум 2 недели назад.'
        : 'To mint an NFT username you must own a channel created at least 2 weeks ago.');
      // Minting delivers an NFT to a TON wallet — that wallet IS required.
      add({ id: 'returnWallet', required: true, kind: 'wallet', mirror: 'returnWallet',
        label: ru ? 'TON-кошелёк для получения NFT' : 'TON wallet to receive the NFT',
        value: state.returnWallet, placeholder: 'UQ… / EQ…',
        hint: ru ? 'Минтим NFT-юзернейм на этот кошелёк.' : 'The NFT username is minted to this wallet.',
        onInput: (v) => { state.returnWallet = v.trim(); } });
    } else if (state.service === 'boost') {
      addWarn(ru
        ? 'Юзернейм должен быть NFT и лежать на криптокошельке (Tonkeeper и т.п.).'
        : 'The username must be an NFT held on a crypto wallet (e.g. Tonkeeper).');
      add({ id: 'boostTarget', required: true, kind: 'user', prefix: '@', mirror: 'boostTarget',
        label: ru ? 'NFT-юзернейм для ставки' : 'NFT username for the bid',
        value: state.boostTarget, placeholder: 'username',
        onInput: (v) => { state.boostTarget = applyUsernameLive(v); } });
    } else if (state.service === 'deal') {
      addInfo(ru
        ? 'Официальная оплата по сделке. Укажите, с кем сделка и за что — либо вставьте специальный код сделки.'
        : 'Official deal payment. State who the deal is with and what for — or paste the special deal code.');
      add({ id: 'dealCounterparty', required: true, kind: 'user', prefix: '@',
        label: ru ? 'С кем сделка' : 'Deal with',
        value: state.dealCounterparty, placeholder: 'username',
        hint: ru ? 'Telegram-юзернейм второй стороны.' : 'The counterparty\'s Telegram username.',
        onInput: (v) => { state.dealCounterparty = applyUsernameLive(v); } });
      add({ id: 'dealDesc', required: true, kind: 'text',
        label: ru ? 'Описание сделки или код' : 'Deal description or code',
        value: state.dealDesc, placeholder: ru ? 'за что / спец-код' : 'what for / special code',
        hint: ru ? 'Коротко опишите предмет сделки или вставьте код, который я выдал.' : 'Briefly describe the deal or paste the code I gave you.',
        onInput: (v) => { state.dealDesc = v.trim(); } });
    } else { // custom — direct payment, nothing to deliver.
      addInfo(ru
        ? 'Прямая оплата — получателю уходит ровно сумма заказа. Реквизиты не требуются.'
        : 'Direct payment — the exact amount goes to the recipient. No extra details needed.');
    }

    // Contact — optional secondary channel for support / order tracking.
    // Pre-filled with the username; the user can leave it as-is or clear it.
    if (state.service !== 'custom') {
      if (!state.contact) state.contact = usernamePrefill;
      add({ id: 'contact', required: false, kind: 'text',
        label: ru ? 'Доп. связь (необязательно)' : 'Extra contact (optional)',
        value: state.contact, placeholder: '@username / email',
        hint: ru ? 'Запасной канал для статуса заказа. Можно оставить пустым.' : 'Backup channel for order status. Can be left empty.',
        onInput: (v) => { state.contact = v.trim(); } });
    } else if (!state.contact) {
      state.contact = usernamePrefill;
    }

    // Optional free-form comment — available on EVERY service. Full-width
    // multiline so it fills the row instead of leaving an empty grid cell.
    add({ id: 'comment', required: false, kind: 'text', multiline: true,
      label: ru ? 'Комментарий (необязательно)' : 'Comment (optional)',
      value: state.comment, placeholder: ru ? 'Пара слов о заказе, пожелания, детали для связи…' : 'A note about the order, wishes, contact details…',
      onInput: (v) => { state.comment = v; } });

    if (window.AWM_reflectWallet) window.AWM_reflectWallet();
  }

  // When a previously-flagged field is corrected, flash its border green once
  // and then drop the error state entirely (instead of just vanishing).
  window.AWM_clearMiss = function (el) {
    if (!el || !el.classList.contains('cd-miss')) { if (el) el.classList.remove('cd-miss'); return; }
    el.classList.remove('cd-miss', 'cd-shake');
    el.classList.remove('cd-fixed'); void el.offsetWidth; el.classList.add('cd-fixed');
    setTimeout(() => el.classList.remove('cd-fixed'), 900);
  };
  function markDetailMiss(id) {
    const el = byId('cd_' + id);
    if (el) { el.classList.add('cd-miss'); el.classList.remove('cd-shake'); void el.offsetWidth; el.classList.add('cd-shake'); }
  }
  function validateStage1(mark) {
    let ok = true;
    if (state.service === 'custom') {
      ok = state.customAmountTon >= SERVICES.custom.minTon;
      // Block direct payment unless a reason is actually stated: either a
      // concrete reason is picked, or "other" is filled in with text.
      const reasonOk = state.customReason && state.customReason !== 'other'
        ? true
        : !!(state.customReasonText && state.customReasonText.trim().length >= 2);
      if (!reasonOk) {
        ok = false;
        if (mark) {
          const rw = byId('reasonWrap');
          const cf = byId('reasonCustomField');
          // reveal the custom-reason input if hidden, and flag both
          if (state.customReason === 'other' && cf) cf.hidden = false;
          [rw, cf].forEach((el) => {
            if (!el) return;
            el.classList.add('cd-miss'); el.classList.remove('cd-shake');
            void el.offsetWidth; el.classList.add('cd-shake');
          });
          const ci = byId('reasonCustomInput');
          if (ci) setTimeout(() => ci.focus(), 30);
          const note = byId('reasonNote');
          if (note) {
            note.textContent = state.lang === 'ru'
              ? 'Укажите причину платежа, чтобы продолжить — это назначение перевода.'
              : 'State the payment reason to continue — this is the transfer purpose.';
            note.classList.add('is-warn');
          }
        }
      }
    }
    else if (state.service === 'deal') ok = state.dealAmountTon >= SERVICES.deal.minTon;
    else if (state.service === 'stars') ok = state.starsQty >= SERVICES.stars.minQty;
    else if (state.service === 'premium') ok = !!state.premiumMonths;
    else if (state.service === 'mint') ok = true; // NFT mint: bid is optional
    else if (state.service === 'boost') ok = state.boostBidTon >= SERVICES.boost.minBidTon;
    if (!ok && mark) {
      const s = byId('cartEdit')?.querySelector('.qstep');
      if (s) { s.classList.remove('cd-shake'); void s.offsetWidth; s.classList.add('cd-shake'); }
      if (window.AWM_haptic) window.AWM_haptic('error');
    }
    return ok;
  }
  function validateStage2(mark) {
    const miss = [];
    if (state.service === 'stars') {
      if (!isValidUsername(state.starsRecipient || state.username)) miss.push('starsRecipient');
    } else if (state.service === 'premium') {
      if (!isValidUsername(state.premiumGift || state.username)) miss.push('premiumGift');
    } else if (state.service === 'mint') {
      // NFT delivery wallet is required.
      if (!state.returnWallet || state.returnWallet.length < 10) miss.push('returnWallet');
    } else if (state.service === 'boost') {
      if (!isValidUsername(state.boostTarget)) miss.push('boostTarget');
    } else if (state.service === 'deal') {
      if (!isValidUsername(state.dealCounterparty)) miss.push('dealCounterparty');
      if (!state.dealDesc || state.dealDesc.trim().length < 2) miss.push('dealDesc');
    }
    // Contact is now OPTIONAL (extra/backup channel) — not validated.
    if (miss.length && mark) { miss.forEach(markDetailMiss); if (window.AWM_haptic) window.AWM_haptic('error'); }
    return miss.length === 0;
  }
  window.AWM_validateStage1 = validateStage1;
  window.AWM_validateStage2 = validateStage2;

  let _prevCartStep = 1;
  function setCartStep(n) {
    const sheet = document.querySelector('.receipt-sheet');
    if (!sheet) return;
    const dir = n >= _prevCartStep ? 'fwd' : 'back';
    _prevCartStep = n;
    // Returning to the editing steps (or back to the pay step from the receipt)
    // unlocks the flow again so the code/QR resume rotating.
    if (n <= 3) { state.paymentInitiated = false; if (window.AWM_resetVerify) window.AWM_resetVerify(); }
    sheet.setAttribute('data-cart-step', String(n));
    sheet.querySelectorAll('.cart-pane').forEach(p => { p.hidden = (p.dataset.pane !== String(n)); });
    // stepper chips: active + completed states (only the chips, not foot buttons)
    sheet.querySelectorAll('.cart-step').forEach(b => {
      const s = +b.dataset.goStep;
      b.classList.toggle('is-active', s === n);
      b.classList.toggle('is-done', s < n);
    });
    renderOrderCard();
    if (n === 1) renderCartEdit();
    if (n === 2) { renderCartDetails(); buildReceipt(); 
      // Auto-capture the first detail field so the user can type immediately.
      setTimeout(() => {
        const f = document.querySelector('#cartDetails .cd-field input');
        if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
      }, 220);
    }
    if (n === 3) { buildReceipt(); renderAgreement(); initAgreeHold(); /* on-chain search starts when the QR is opened or «Оплатить» is pressed — not on the pay screen itself */ }
    if (n === 4) enterReceiptStage();
    // Rotating code/QR runs only on the pay step; it freezes on the receipt.
    if (n === 3) startCodeRotation(); else stopCodeRotation();
    // Step 4 (receipt) is reachable only once payment has been initiated.
    sheet.querySelectorAll('.cart-step[data-go-step="4"]').forEach(b => b.classList.toggle('is-locked', !state.paymentInitiated));
    syncCartTotals();
    const inner = sheet.querySelector('.sheet-inner');
    if (inner) inner.scrollTop = 0;
    // animated slide-in for the newly shown pane
    const pane = sheet.querySelector(`.cart-pane[data-pane="${n}"]`);
    if (pane) {
      pane.classList.remove('slide-fwd', 'slide-back');
      void pane.offsetWidth;
      pane.classList.add(dir === 'fwd' ? 'slide-fwd' : 'slide-back');
    }
    if (window.AWM_haptic) window.AWM_haptic('light');
  }
  window.AWM_setCartStep = setCartStep;

  // No-skip navigation: you may always go back, but only forward when every
  // earlier stage validates.
  function gotoCartStep(n) {
    const cur = +(document.querySelector('.receipt-sheet')?.getAttribute('data-cart-step') || 1);
    if (n <= cur) { setCartStep(n); return; }
    // The receipt step opens only after the user pressed Pay / Copy link.
    if (n >= 4 && !state.paymentInitiated) { return; }
    if (n >= 2 && !validateStage1(true)) { if (cur !== 1) setCartStep(1); return; }
    if (n >= 3 && !validateStage2(true)) { if (cur !== 2) setCartStep(2); return; }
    setCartStep(n);
  }
  window.AWM_gotoCartStep = gotoCartStep;

  function syncCartTotals() {
    const c = getCurrentCompute();
    const promo = applyPromo(c.total);
    const donation = computeDonationTon(c.total);
    const finalTon = Math.max(0, c.total - (promo.valid ? promo.discount : 0) + donation);
    const t = payPrimary(finalTon);
    ['cartFootTotal', 'cartFootTotal2'].forEach(id => { const el = byId(id); if (el) el.textContent = t; });
    const pv = byId('cartPreviewTon'); if (pv) pv.textContent = payPrimary(finalTon);
    const pu = byId('cartPreviewUsd'); if (pu) pu.textContent = paySecondary(finalTon);
  }
  window.AWM_syncCartTotals = syncCartTotals;
  function cartLiveRefresh() {
    if (!byId('receiptOverlay').classList.contains('visible')) return;
    if (state.paymentInitiated) return;   // amounts lock once the user is paying / on the receipt
    buildReceipt(); syncCartTotals();
  }

  // ---------- Stage 4: on-chain receipt ----------
  function shortMid(s, head, tail) {
    s = String(s || ''); head = head || 6; tail = tail || 5;
    return s.length > head + tail + 1 ? s.slice(0, head) + '…' + s.slice(-tail) : s;
  }
  function enterReceiptStage() {
    const ctx = window.AWM_paymentContext || {};
    const ru = state.lang === 'ru';
    const set = (id, v) => { const el = byId(id); if (el) el.textContent = v; };
    set('rrService', ctx.service || '—');
    const recRow = byId('rrRecipientRow');
    if (recRow) {
      if (ctx.recipient) { recRow.hidden = false; set('rrRecipient', '@' + ctx.recipient); }
      else recRow.hidden = true;
    }
    set('rrPayer', ctx.username ? '@' + ctx.username : (ru ? '—' : '—'));
    set('rrCode', ctx.code || '—');
    set('rrRate', '$' + Number(ctx.rate || 0).toFixed(3) + ' / TON');
    const isUsdt = ctx.currency === 'USDT';
    set('rrAmountTon', isUsdt ? (Number(ctx.finalTon || 0).toFixed(2) + ' USDT') : (P.formatTon(ctx.finalTon || 0) + ' TON'));
    set('rrAmountFiat', isUsdt ? ('≈ ' + P.formatTon(P.tonFromUsd(ctx.finalTon || 0)) + ' TON') : ('≈ ' + fiatFromUsd(ctx.usd || 0)));
    set('rrWallet', shortMid(ctx.wallet, 6, 6));
    set('rrFootId', 'notelegram.com · ' + (ctx.code || ''));
    set('rrIssued', new Date().toLocaleString(ru ? 'ru-RU' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }));
    registerBackendOrder(ctx);
    if (window.AWM_startVerify) window.AWM_startVerify();
  }
  // Tell the backend about this order so its TON watcher can verify payment and
  // the bot can notify you. POST with PUBLIC data ONLY — no secret keys ever
  // leave the browser; all secret checks happen server-side via .env.
  function registerBackendOrder(ctx) {
    try {
      const be = (window.AWM_PAYCONFIG && window.AWM_PAYCONFIG.backend) || {};
      if (!be.base || !ctx || !ctx.nano) return;
      const ep = (be.endpoints && be.endpoints.createOrder) || '/order/create';
      const body = {
        service: state.service,
        amount_nano: String(ctx.nano || 0),
        comment: ctx.code || '',
        code: ctx.code || '',
        recipient: ctx.recipient || '',
        qty: state.starsQty || 0,
        months: state.premiumMonths || 0
      };
      fetch(be.base.replace(/\/+$/, '') + ep, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => {});
    } catch (e) {}
  }
  window.AWM_enterReceiptStage = enterReceiptStage;
  // Carry the user to step 4 (the only way to reach the receipt).
  function goToReceiptStep() {
    state.paymentInitiated = true;
    setCartStep(4);
  }
  window.AWM_goToReceiptStep = goToReceiptStep;

  // ---------- CTA flow ----------
  function handleCtaPress() {
    if (!validateStage1(true)) {
      // Highlight the unfilled service field on the main screen. The highlight
      // is removed automatically as soon as the user touches/edits the field
      // (handled by the field input listeners).
      validateFieldsOnly();
      return;
    }
    // Mint lets you into the cart with nothing filled in — username and the
    // delivery wallet are collected later, on the cart's "Details" step.
    if (!state.username && state.service !== 'mint') { openUsernamePrompt(true); return; }
    openReceiptCart();
  }
  let _usernameForCheckout = false;
  function openUsernamePrompt(forCheckout) {
    _usernameForCheckout = !!forCheckout;
    // Opened from the top pill (user's own choice) — never leave the CTA armed,
    // so a following Enter can't fling them into the cart.
    if (!forCheckout) disarmCta();
    byId('usernameInput').value = state.username ? '@' + state.username : '@';
    refreshToolBtn(byId('usernameInput'));
    openOverlay('username');
    setTimeout(() => {
      const inp = byId('usernameInput');
      inp.focus();
      try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch {}
    }, 140);
  }
  function saveUsername() {
    const v = byId('usernameInput').value;
    if (!isValidUsername(v)) {
      const el = byId('usernameInput');
      el.setCustomValidity(T[state.lang].invalidUsername);
      el.reportValidity();
      el.focus();
      return false;
    }
    state.username = applyUsernameLive(v);
    byId('usernameInput').setCustomValidity('');
    renderUserPill();
    closeOverlay('username');
    if (window.AWM_haptic) window.AWM_haptic('success');
    // If the username was requested as a checkout gate (i.e. the user did NOT
    // open it from the top pill themselves), carry them straight into the cart
    // with a smooth transition — no second tap needed.
    if (_usernameForCheckout) {
      _usernameForCheckout = false;
      disarmCta();
      // Brief celebratory pulse on the pill, then open the cart.
      const pill = byId('userPill');
      if (pill) { pill.classList.remove('pill-confirmed'); void pill.offsetWidth; pill.classList.add('pill-confirmed'); }
      setTimeout(() => openReceiptCart(), 260);
    } else {
      // Edited from the top pill on the user's own initiative — just save.
      // Never auto-advance to the cart; only the CTA may do that.
      disarmCta();
    }
    return true;
  }
  // Arm the main CTA: focus it, scroll it into view, show a "press Enter again"
  // hint underneath. A second Enter / click runs the checkout.
  function armCta() {
    state.ctaArmed = true;
    const cta = byId('payCta');
    if (!cta) return;
    cta.classList.add('kbd-focus', 'cta-armed');
    try { cta.focus({ preventScroll: false }); } catch (e) { cta.focus(); }
    const card = document.querySelector('.panel') || cta;
    try { window.scrollTo({ top: document.scrollingElement.scrollHeight, behavior: 'smooth' }); } catch (e) {}
    updateCtaHint();
    if (window.AWM_haptic) window.AWM_haptic('light');
  }
  window.AWM_armCta = armCta;
  function smartEnter() {
    const ov = topOverlay();
    if (ov === 'username') return saveUsername();
    if (ov === 'service' || ov === 'info') return closeOverlay(ov);
    if (ov === 'receipt') {
      const sheet = document.querySelector('.receipt-sheet');
      const step = sheet ? +sheet.getAttribute('data-cart-step') : 1;
      if (step < 3) { gotoCartStep(step + 1); return; }
      if (step === 3) {
        const link = byId('payNow').href;
        if (link && link !== '#' && !link.endsWith('#')) window.open(link, '_blank', 'noopener');
        goToReceiptStep();
      }
      return;
    }
    const cta = byId('payCta');
    if (state.ctaArmed && document.activeElement === cta) {
      state.ctaArmed = false;
      cta.classList.remove('kbd-focus', 'cta-armed');
      cta.querySelector('.cta-sub')?.remove();
      openReceiptCart();
      return;
    }
    // IMPORTANT: a stray Enter (focus on body, the top pill, a pack card, etc.)
    // must NEVER fling the user into the cart — especially right after they set
    // their @username from the top pill. Enter only proceeds when the pay button
    // is the focused/armed element. Otherwise, if the order is fillable, we just
    // ARM the CTA (focus it + "press Enter to pay"); a deliberate second Enter goes.
    if (document.activeElement === cta) { handleCtaPress(); return; }
    if (validateStage1(false) && state.username) { armCta(); }
  }
  function smartEscape() {
    const ov = topOverlay();
    if (ov) return closeOverlay(ov);
    if (document.activeElement && ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) document.activeElement.blur();
  }
  // Retract the armed "press Enter to continue" hint if the user does something else.
  function disarmCta() {
    if (!state.ctaArmed) return;
    state.ctaArmed = false;
    const cta = byId('payCta');
    if (cta) { cta.classList.remove('kbd-focus', 'cta-armed'); cta.querySelector('.cta-sub')?.remove(); }
    updateCtaHint();
  }
  window.AWM_disarmCta = disarmCta;

  async function copyText(txt, okMsg) {
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch {}
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        ta.style.left = '0'; ta.style.top = '0';
        document.body.appendChild(ta);
        ta.select(); ta.setSelectionRange(0, ta.value.length);
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {}
    }
    if (ok) { byId('rcOk').textContent = okMsg; byId('rcWarn').textContent = ''; }
    else { showCopyFallback(txt, okMsg); }
  }
  function showCopyFallback(txt, okMsg) {
    const ov = byId('copyFallback');
    const ta = byId('cfText');
    if (!ov || !ta) { byId('rcWarn').textContent = T[state.lang].copyFail; return; }
    ta.value = txt;
    ov.classList.add('visible');
    ov.setAttribute('aria-hidden', 'false');
    setTimeout(() => { ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length); }, 120);
    byId('cfClose').onclick = () => { ov.classList.remove('visible'); ov.setAttribute('aria-hidden', 'true'); };
    byId('cfTry').onclick = () => { ov.classList.remove('visible'); copyText(txt, okMsg); };
  }
  function setInfoTab(name) {
    $$('#infoTabs .info-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    $$('.info-pane').forEach(p => p.classList.toggle('hidden', p.dataset.pane !== name));
  }

  // ---------- Username live input ----------
  function bindUsernameField(inputId) {
    const el = byId(inputId);
    if (!el) return;
    el.addEventListener('input', () => {
      const raw = el.value;
      // Where the caret was BEFORE we reformat — so we can restore it instead
      // of flinging it to the end (the old bug: deleting mid-string jumped the
      // caret to the tail of the username).
      const selPos = el.selectionStart ?? raw.length;
      const startsAt = raw.trim().startsWith('@') || raw.length === 0;
      const fixed = applyUsernameLive(raw);
      const newVal = fixed ? '@' + fixed : (startsAt ? '@' : '');
      // Count sanitized chars left of the caret, then place the caret after the
      // same number of chars in the formatted value (+1 for the leading '@').
      const sanitizedBefore = applyUsernameLive(raw.slice(0, selPos));
      let caret = (newVal.startsWith('@') ? 1 : 0) + sanitizedBefore.length;
      if (caret > newVal.length) caret = newVal.length;
      el.value = newVal;
      // Persist sanitized value to state so validation / receipt see it.
      if (inputId === 'boostTarget') state.boostTarget = fixed;
      else if (inputId === 'premiumGift') state.premiumGift = fixed;
      try { el.setSelectionRange(caret, caret); } catch {}
      el.setCustomValidity('');
      el.classList.add('is-typing');
      setTimeout(() => el.classList.remove('is-typing'), 160);
      refreshToolBtn(el);
      // remove red highlight on parent field
      const field = el.closest('.field');
      if (field) field.classList.remove('required-miss', 'required-pulse');
      if (inputId === 'premiumGift' || inputId === 'boostTarget') {
        updateSummary();
        if (byId('receiptOverlay').classList.contains('visible')) buildReceipt();
      }
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();   // don't let the window-level smartEnter also fire
        if (inputId === 'usernameInput') saveUsername();
      }
    });
  }

  // ---------- Numeric inputs ----------
  function bindNumericInput(id, kind) {
    const el = byId(id);
    if (!el) return;
    el.addEventListener('keypress', (e) => {
      if (e.ctrlKey || e.metaKey) return;
      // Translate '.', '?', 'ю', '/' to comma for decimal fields
      if (kind === 'decimal' && ['.', '?', ',', '/', 'ю', 'Б', 'б', 'Ю'].includes(e.key)) {
        e.preventDefault();
        const start = el.selectionStart, end = el.selectionEnd;
        // only one comma allowed
        if (el.value.includes(',')) return;
        el.value = el.value.slice(0, start) + ',' + el.value.slice(end);
        try { el.setSelectionRange(start + 1, start + 1); } catch {}
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      if (kind === 'integer') {
        if (!/[0-9]/.test(e.key)) e.preventDefault();
      } else if (kind === 'decimal') {
        if (!/[0-9]/.test(e.key)) e.preventDefault();
      }
    });
    el.addEventListener('input', () => {
      if (kind === 'decimal') el.value = normalizeDecimal(el.value);
      else if (kind === 'integer') el.value = el.value.replace(/[^\d]/g, '');
      el.classList.add('is-typing');
      setTimeout(() => el.classList.remove('is-typing'), 140);
      pulseDisplay(id + 'Display');
      const slider = byId(id + 'Slider');
      if (slider) {
        const smax = Number(slider.max);
        slider.value = String(Math.min(parseNum(el.value), smax));
      }
      const field = el.closest('.field');
      if (field) field.classList.remove('required-miss', 'required-pulse');
      updatePreviews(); updateSummary();
    });
    el.addEventListener('beforeinput', (e) => {
      // Mobile keyboards send '.' via composition — translate to comma
      if (kind === 'decimal' && e.data === '.') {
        e.preventDefault();
        const start = el.selectionStart, end = el.selectionEnd;
        if (el.value.includes(',')) return;
        el.value = el.value.slice(0, start) + ',' + el.value.slice(end);
        try { el.setSelectionRange(start + 1, start + 1); } catch {}
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    el.addEventListener('paste', (e) => {
      const txt = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      const cleaned = kind === 'integer' ? txt.replace(/[^\d]/g, '') : normalizeDecimal(txt);
      if (cleaned !== txt) {
        e.preventDefault();
        const start = el.selectionStart, end = el.selectionEnd;
        el.value = el.value.slice(0, start) + cleaned + el.value.slice(end);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    // Wheel-to-step. Amount fields are handled by the .amount-display listener
    // in init(); only bind here for inputs outside a display (e.g. donation) to
    // avoid double-stepping.
    if (!el.closest('.amount-display')) {
      el.addEventListener('wheel', (e) => {
        if (document.activeElement !== el) return;
        e.preventDefault();
        stepInput(id, e.deltaY < 0 ? 'up' : 'down');
      }, { passive: false });
    }
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp')   { e.preventDefault(); stepInput(id, 'up'); }
      if (e.key === 'ArrowDown') { e.preventDefault(); stepInput(id, 'down'); }
    });
  }
  function bindSlider() { /* sliders removed */ }

  // ---------- Persistent ambient geometry ----------
  // ---------- Ambient background geometry ----------
  // Layered, depth-tiered rounded rectangles: large + blurred far back,
  // crisper + smaller near front. Reads tweakable config so the panel can
  // reshape the whole mood (density / opacity / motion / hue).
  const BG_DEFAULTS = { density: 1, opacity: 1, motion: 1, palette: 'cool' };
  function bgConfig() { return Object.assign({}, BG_DEFAULTS, window.AWM_bgConfig || {}); }
  function initBackgroundShapes(force) {
    const host = byId('bgShapes');
    if (!host) return;
    if (host.children.length && !force) return;
    host.innerHTML = '';
    const cfg = bgConfig();
    const rand = (a, b) => a + Math.random() * (b - a);
    const vw = window.innerWidth, vh = window.innerHeight;
    const area = vw * vh;

    // Three depth tiers. Each tier is a layer in the "stack".
    const TIERS = [
      { key: 'far',  blur: [6, 11],  op: [.05, .10], size: [.42, .62], dur: [70, 110], rot: 8,  round: [34, 64] },
      { key: 'mid',  blur: [2, 4],   op: [.08, .15], size: [.24, .40], dur: [52, 84],  rot: 12, round: [22, 40] },
      { key: 'near', blur: [0, 1],   op: [.10, .20], size: [.13, .24], dur: [40, 66],  rot: 16, round: [14, 26] },
    ];
    // Base counts scale with viewport area, then by the density tweak.
    const baseTotal = Math.max(7, Math.round(area / 110000));
    const totals = { far: Math.round(baseTotal * .32), mid: Math.round(baseTotal * .40), near: Math.round(baseTotal * .42) };

    const placed = []; // {cx,cy,r} in px — used to bias toward low overlap
    const minSide = Math.min(vw, vh);

    TIERS.forEach(tier => {
      const n = Math.max(1, Math.round(totals[tier.key] * cfg.density));
      for (let i = 0; i < n; i++) {
        const side = Math.round(minSide * rand(tier.size[0], tier.size[1]) * 0.6);
        const ratio = rand(0.72, 1.4);
        const w = Math.round(side * (ratio > 1 ? 1 : ratio));
        const h = Math.round(side * (ratio > 1 ? 1 / ratio : 1));
        // Pick the least-crowded of a few candidate positions (soft anti-stack).
        let best = null, bestScore = -Infinity;
        for (let k = 0; k < 5; k++) {
          const cx = rand(-0.05, 1.05) * vw;
          const cy = rand(-0.05, 1.05) * vh;
          let nearest = Infinity;
          for (const p of placed) {
            const d = Math.hypot(p.cx - cx, p.cy - cy) - (p.r + Math.max(w, h) / 2);
            if (d < nearest) nearest = d;
          }
          if (!best || nearest > bestScore) { bestScore = nearest; best = { cx, cy }; }
        }
        if (!best) best = { cx: rand(0, 1) * vw, cy: rand(0, 1) * vh };
        placed.push({ cx: best.cx, cy: best.cy, r: Math.max(w, h) / 2 });

        const piece = document.createElement('span');
        piece.className = 'bg-shape s-' + tier.key;
        piece.style.left = `${Math.round(best.cx - w / 2)}px`;
        piece.style.top  = `${Math.round(best.cy - h / 2)}px`;
        piece.style.width  = `${w}px`;
        piece.style.height = `${h}px`;
        piece.style.borderRadius = Math.round(rand(tier.round[0], tier.round[1])) + 'px';
        piece.style.setProperty('--rot',  `${Math.round(rand(-tier.rot, tier.rot))}deg`);
        piece.style.setProperty('--dx',   `${Math.round(rand(-22, 22) * cfg.motion)}px`);
        piece.style.setProperty('--dy',   `${Math.round(rand(-18, 18) * cfg.motion)}px`);
        piece.style.setProperty('--spin', `${Math.round(rand(-tier.rot, tier.rot) * cfg.motion)}deg`);
        const baseDur = rand(tier.dur[0], tier.dur[1]);
        piece.style.setProperty('--dur', `${Math.round(cfg.motion > 0 ? baseDur / cfg.motion : 99999)}s`);
        piece.style.setProperty('--o', (rand(tier.op[0], tier.op[1]) * cfg.opacity).toFixed(3));
        piece.style.setProperty('--blur', rand(tier.blur[0], tier.blur[1]).toFixed(1) + 'px');
        piece.style.setProperty('--delay', `${-Math.random() * 40}s`);
        host.appendChild(piece);
      }
    });
    host.setAttribute('data-palette', cfg.palette);
  }
  window.AWM_regenBackground = () => initBackgroundShapes(true);

  // ---------- Floating "space" text field ----------
  // A small physics field: persistent tokens drift, rotate slightly and bounce
  // off the walls and each other (like debris in space). The @username, once
  // entered, is spat out from the centre and then floats here forever. Other
  // words stream in from one edge and fade away as they reach the centre.
  let trailRAF = null, trailSpawnTimer = null;
  const SPACE = [];        // persistent physics bodies {el,x,y,vx,vy,w,h,ang,va,r}
  let usernameToken = null;

  function ambientWords() {
    const w = ['AWM // PAY', 'TON', 'NFT', '$' + RateStore.tonUsd.toFixed(2)];
    return w;
  }
  function crossWords() {
    return ['STARS', 'PREMIUM', 'BOOST', 'NFT', 'AWM // PAY', 'TON', '★', '$' + RateStore.tonUsd.toFixed(2)];
  }

  function measure(el) {
    const r = el.getBoundingClientRect();
    return { w: r.width || 70, h: r.height || 20 };
  }
  function addSpaceToken(text, opts) {
    const host = byId('bgTrails');
    if (!host) return null;
    opts = opts || {};
    const el = document.createElement('span');
    el.className = 'bg-trail space' + (opts.cls ? ' ' + opts.cls : '');
    el.textContent = text;
    el.style.fontSize = (opts.size || (13 + Math.random() * 9)).toFixed(0) + 'px';
    host.appendChild(el);
    const { w, h } = measure(el);
    const W = window.innerWidth, H = window.innerHeight;
    const speed = opts.speed != null ? opts.speed : 0.22 + Math.random() * 0.22;
    const dir = Math.random() * Math.PI * 2;
    const body = {
      el, w, h,
      x: opts.x != null ? opts.x : Math.random() * (W - w),
      y: opts.y != null ? opts.y : Math.random() * (H - h),
      vx: opts.vx != null ? opts.vx : Math.cos(dir) * speed,
      vy: opts.vy != null ? opts.vy : Math.sin(dir) * speed,
      ang: 0, va: (Math.random() * 2 - 1) * 0.05,
      r: Math.max(w, h) * 0.46
    };
    SPACE.push(body);
    if (opts.pop) { el.classList.add('pop'); }
    return body;
  }

  function physicsStep() {
    const W = window.innerWidth, H = window.innerHeight;
    for (const b of SPACE) {
      b.x += b.vx; b.y += b.vy; b.ang += b.va;
      if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
      else if (b.x + b.w > W) { b.x = W - b.w; b.vx = -Math.abs(b.vx); }
      if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
      else if (b.y + b.h > H) { b.y = H - b.h; b.vy = -Math.abs(b.vy); }
    }
    // pairwise elastic collisions (equal mass)
    for (let i = 0; i < SPACE.length; i++) {
      for (let j = i + 1; j < SPACE.length; j++) {
        const a = SPACE[i], c = SPACE[j];
        const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
        const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
        let dx = cx - ax, dy = cy - ay;
        let dist = Math.hypot(dx, dy) || 0.001;
        const min = a.r + c.r;
        if (dist < min) {
          const nx = dx / dist, ny = dy / dist;
          const overlap = (min - dist) / 2;
          a.x -= nx * overlap; a.y -= ny * overlap;
          c.x += nx * overlap; c.y += ny * overlap;
          const va = a.vx * nx + a.vy * ny;
          const vc = c.vx * nx + c.vy * ny;
          const diff = vc - va;
          a.vx += diff * nx; a.vy += diff * ny;
          c.vx -= diff * nx; c.vy -= diff * ny;
          a.el.classList.add('hit'); c.el.classList.add('hit');
          clearTimeout(a._ht); clearTimeout(c._ht);
          a._ht = setTimeout(() => a.el.classList.remove('hit'), 240);
          c._ht = setTimeout(() => c.el.classList.remove('hit'), 240);
        }
      }
    }
    for (const b of SPACE) {
      b.el.style.transform = `translate3d(${b.x}px,${b.y}px,0) rotate(${b.ang}deg)`;
    }
    trailRAF = requestAnimationFrame(physicsStep);
  }

  // Transient word: drifts in from an edge and fades out near the centre.
  function spawnCrossWord() {
    const host = byId('bgTrails');
    if (!host) return;
    if (host.querySelectorAll('.cross').length > 4) return;
    const el = document.createElement('span');
    el.className = 'bg-trail cross var-' + (1 + Math.floor(Math.random() * 3));
    el.textContent = crossWords()[Math.floor(Math.random() * crossWords().length)];
    el.style.fontSize = (13 + Math.random() * 12).toFixed(0) + 'px';
    const W = window.innerWidth, H = window.innerHeight;
    const fromLeft = Math.random() > .5;
    const y = (12 + Math.random() * 74);
    const cx = W / 2 + (Math.random() * 120 - 60);
    el.style.setProperty('--x0', (fromLeft ? -160 : W + 160) + 'px');
    el.style.setProperty('--y0', `${y}vh`);
    el.style.setProperty('--x1', `${cx}px`);
    el.style.setProperty('--y1', `${y - 6 + Math.random() * 12}vh`);
    el.style.setProperty('--r0', (Math.random() * 14 - 7) + 'deg');
    el.style.setProperty('--r1', (Math.random() * 14 - 7) + 'deg');
    el.style.setProperty('--dur', (11 + Math.random() * 7).toFixed(1) + 's');
    el.addEventListener('animationend', () => el.remove());
    host.appendChild(el);
  }

  // Public: previously spat the @username into a floating physics field.
  // Per request, the username no longer flies/bounces around the screen — this
  // is now a no-op kept only so existing callers stay safe.
  function spawnTrail() { /* disabled: no floating username */ }
  window.AWM_spawnTrail = spawnTrail;

  function startTrails() {
    // Disabled: ambient motion is now handled by the per-service background
    // scenes (assets/scenes.js) — stars get a starfield, premium gets crowns,
    // deal gets handshakes, etc. No more flying words.
  }

  // ---------- Telegram Mini App integration (phone logic) ----------
  let TG = null;
  // Global haptic helper — safe no-op outside Telegram.
  window.AWM_haptic = function (kind) {
    try {
      const h = TG && TG.HapticFeedback;
      if (!h) return;
      if (TG.isVersionAtLeast && !TG.isVersionAtLeast('6.1')) return;
      if (kind === 'success' || kind === 'error' || kind === 'warning') h.notificationOccurred(kind);
      else if (kind === 'select') h.selectionChanged();
      else h.impactOccurred(kind || 'light'); // 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
    } catch {}
  };

  function initTelegram() {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) { document.documentElement.classList.add('no-tg'); return; }
    TG = tg;
    document.documentElement.classList.add('is-tg');
    try { tg.ready(); } catch {}
    try { tg.expand(); } catch {}
    const atLeast = (v) => { try { return tg.isVersionAtLeast && tg.isVersionAtLeast(v); } catch { return false; } };
    // Mini App full-screen (Bot API 8.0+): open edge-to-edge inside Telegram.
    try { if (atLeast('8.0') && tg.requestFullscreen) tg.requestFullscreen(); } catch {}
    try { if (atLeast('8.0') && tg.lockOrientation) tg.lockOrientation(); } catch {}
    try { if (atLeast('6.2') && tg.enableClosingConfirmation) tg.enableClosingConfirmation(); } catch {}
    document.documentElement.classList.add('is-miniapp');
    // Keep the sheet from snapping closed while the user scrolls a long form.
    try { if (atLeast('7.7') && tg.disableVerticalSwipes) tg.disableVerticalSwipes(); } catch {}
    // Match Telegram chrome to our dark glass.
    try { if (atLeast('6.1')) { tg.setHeaderColor && tg.setHeaderColor('#0c1018'); tg.setBackgroundColor && tg.setBackgroundColor('#07090e'); } } catch {}

    // Live viewport height → CSS var, so the sticky CTA never hides behind the keyboard.
    const applyViewport = () => {
      const h = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
      document.documentElement.style.setProperty('--tg-vh', h + 'px');
    };
    applyViewport();
    try { tg.onEvent && tg.onEvent('viewportChanged', applyViewport); } catch {}

    // Prefill username from the Telegram account — the whole point of a Mini App.
    try {
      const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
      if (u && u.username && !state.username && isValidUsername(u.username)) {
        state.username = applyUsernameLive(u.username);
        renderUserPill();
      }
    } catch {}

    // Hardware/Telegram Back button mirrors our Escape flow.
    try {
      const bb = tg.BackButton;
      if (bb && atLeast('6.1')) {
        const syncBack = () => { if (topOverlay()) bb.show(); else bb.hide(); };
        bb.onClick(() => smartEscape());
        window.AWM_syncBack = syncBack;
        syncBack();
      }
    } catch {}
  }
  // Re-evaluate the Back button whenever overlays open/close.
  const _openOverlay = openOverlay, _closeOverlay = closeOverlay;
  openOverlay = function (n) { _openOverlay(n); if (window.AWM_syncBack) window.AWM_syncBack(); };
  closeOverlay = function (n) { _closeOverlay(n); if (window.AWM_syncBack) window.AWM_syncBack(); };

  // ---------- Init ----------
  function init() {
    // Seed default input values BEFORE the first render reads them back,
    // otherwise applyI18n()→updatePreviews() zeroes the 100-stars / 50-TON defaults.
    byId('starQty').value = String(state.starsQty);
    byId('boostBid').value = String(state.boostBidTon);

    applyI18n();
    renderModeHeadIcons();
    applyServiceAccent(state.service);
    startTrails();
    initTelegram();

    // Subtle tactile feedback on every tap (no-op outside Telegram).
    document.addEventListener('pointerdown', (e) => {
      if (e.target.closest && e.target.closest('button, .pack-card, .tier-card, .service-option, .donation-pill, .cta, .sheet-btn, .lang-btn')) {
        window.AWM_haptic('light');
      }
    }, { passive: true });

    byId('starQty').value = String(state.starsQty);
    byId('boostBid').value = String(state.boostBidTon);

    $$('[data-tool-target]').forEach(btn => {
      const input = byId(btn.dataset.toolTarget);
      if (!input) return;
      refreshToolBtn(input);
      btn.addEventListener('click', () => handleToolBtn(input));
      input.addEventListener('input', () => refreshToolBtn(input));
    });

    $$('[data-step]').forEach(btn => btn.addEventListener('click', () => stepInput(btn.dataset.step, btn.dataset.dir)));

    // Deal currency segmented control (TON / USDT). Display + comment only —
    // on-chain settlement stays in TON; USDT details are arranged in support.
    $$('#dealCurSeg .dcs-btn').forEach(b => b.addEventListener('click', () => {
      $$('#dealCurSeg .dcs-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.dealCurrency = b.dataset.cur;
      const unit = byId('dealAmtUnit'); if (unit) unit.textContent = b.dataset.cur;
      const hint = byId('dealCurHint');
      if (hint) hint.textContent = (state.dealCurrency === 'USDT')
        ? (state.lang === 'ru'
            ? 'USDT (TON): оплата автоматическая на сайте — кошелёк откроет перевод USD₮ на точную сумму.'
            : 'USDT (TON): automatic on-site payment — your wallet opens a USD₮ transfer for the exact amount.')
        : (state.lang === 'ru'
            ? 'Сумма сделки в TON. С кем и за что — укажете на шаге «Детали», либо вставьте код сделки.'
            : 'Deal amount in TON. State who and what for on the Details step, or paste the code.');
      if (window.AWM_haptic) window.AWM_haptic('select');
    }));

    // Wheel over an amount field steps it ONLY when that field is focused
    // (click it first). Otherwise the wheel scrolls the page as normal — this
    // is what unblocks page scrolling when the cursor is over a field.
    $$('.amount-display').forEach(disp => {
      disp.addEventListener('wheel', (e) => {
        const input = disp.querySelector('input.amt-main');
        if (!input || document.activeElement !== input) return;
        e.preventDefault();
        stepInput(input.id, e.deltaY < 0 ? 'up' : 'down');
      }, { passive: false });
    });
    bindNumericInput('customAmount',  'decimal');
    bindNumericInput('dealAmount',     'decimal');
    bindNumericInput('mintBid',       'integer');
    bindNumericInput('boostBid',      'integer');
    bindNumericInput('starQty',       'integer');
    bindNumericInput('donationInput', 'decimal');

    bindUsernameField('boostTarget');
    bindUsernameField('usernameInput');
    bindUsernameField('premiumGift');

    // Custom service — reason picker. Default "Другое"; choosing it reveals a
    // free-text field. The note explains the donation-by-default rule.
    (function wireReason() {
      const sel = byId('customReasonSelect');
      const cf = byId('reasonCustomField');
      const ci = byId('reasonCustomInput');
      const note = byId('reasonNote');
      if (!sel) return;
      const T = () => (state.lang === 'ru' ? {
        other: 'Без указания причины платёж считается донатом (добровольной поддержкой), а не оплатой товара или услуги.',
        services: 'Оплата за оказанную или будущую услугу по договорённости с получателем.',
        debt: 'Возврат ранее одолженных средств. Возврат денег возможен при ошибке — если обратиться в течение часа и услуга не оказана.',
        donation: 'Добровольная поддержка — без встречных обязательств.',
        goods: 'Оплата конкретного товара по договорённости с продавцом.',
        prepay: 'Аванс или предоплата по договорённости. Условия возврата оговариваются заранее.',
        deposit: 'Бронь или возвращаемый депозит по договорённости.',
        gift: 'Перевод в подарок другому пользователю.',
        agreement: 'Оплата по предварительной договорённости (по сговору сторон).',
        tip: 'Чаевые — добровольная благодарность.'
      } : {
        other: 'Without a stated reason, the payment counts as a donation (voluntary support), not a payment for goods or a service.',
        services: 'Payment for a rendered or upcoming service agreed with the recipient.',
        debt: 'Returning previously borrowed funds. Refunds are possible on error — if you reach out within an hour and the service was not rendered.',
        donation: 'Voluntary support — with no obligation in return.',
        goods: 'Payment for a specific item agreed with the seller.',
        prepay: 'Advance or prepayment by agreement. Refund terms are set in advance.',
        deposit: 'A booking or refundable deposit by agreement.',
        gift: 'A transfer as a gift to another user.',
        agreement: 'Payment by prior arrangement between the parties.',
        tip: 'A tip — voluntary appreciation.'
      });
      const sync = () => {
        const v = sel.value;
        state.customReason = v;
        const isOther = v === 'other';
        if (cf) cf.hidden = !isOther;
        if (note) note.textContent = (T()[v] || '');
        if (note) note.classList.toggle('is-warn', isOther);
        if (isOther && ci) setTimeout(() => ci.focus(), 30);
        // Fixing the reason clears (with a green flash) any earlier miss highlight.
        if (window.AWM_clearMiss) { window.AWM_clearMiss(byId('reasonWrap')); if (!isOther) window.AWM_clearMiss(byId('reasonCustomField')); }
      };
      sel.addEventListener('change', sync);
      if (ci) ci.addEventListener('input', () => { state.customReasonText = ci.value.trim(); if (ci.value.trim() && window.AWM_clearMiss) { window.AWM_clearMiss(byId('reasonCustomField')); window.AWM_clearMiss(byId('reasonWrap')); } });
      sel.value = 'other';
      sync();

      // ---- Custom themed dropdown (replaces the native white OS popup) ----
      const trigger = byId('reasonTrigger');
      const trigLabel = byId('reasonTriggerLabel');
      if (trigger) {
        const opts = Array.from(sel.options);

        // Bottom-sheet portal lives on <body> so it escapes the cart's
        // clipped/stacked context (that was the "invisible but clickable" bug).
        let scrim = null, sheet = null;

        const buildSheet = () => {
          scrim = document.createElement('div');
          scrim.className = 'cdrop-scrim';
          sheet = document.createElement('div');
          sheet.className = 'cdrop-sheet';
          sheet.setAttribute('role', 'listbox');
          const title = (state.lang === 'ru') ? 'Причина платежа' : 'Payment reason';
          sheet.innerHTML = '<div class="cdrop-grip" aria-hidden="true"></div><div class="cdrop-sheet-title">' + title + '</div><div class="cdrop-sheet-list"></div>';
          const list = sheet.querySelector('.cdrop-sheet-list');
          opts.forEach(o => {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'cdrop-opt' + (o.value === sel.value ? ' active' : '');
            row.dataset.val = o.value;
            row.setAttribute('role', 'option');
            row.setAttribute('aria-selected', o.value === sel.value ? 'true' : 'false');
            row.innerHTML = '<span class="cdrop-opt-tx">' + o.textContent + '</span><span class="cdrop-opt-tick" aria-hidden="true">✓</span>';
            row.addEventListener('click', () => {
              sel.value = o.value;
              sel.dispatchEvent(new Event('change', { bubbles: true }));
              syncTrigger();
              closePop();
              if (window.AWM_haptic) window.AWM_haptic('select');
            });
            list.appendChild(row);
          });
          scrim.addEventListener('click', closePop);
          document.body.appendChild(scrim);
          document.body.appendChild(sheet);
        };

        const syncTrigger = () => {
          const cur = opts.find(o => o.value === sel.value) || opts[0];
          if (trigLabel) trigLabel.textContent = cur.textContent;
        };

        const openPop = () => {
          if (sheet) return;
          buildSheet();
          // force reflow then animate in
          void sheet.offsetWidth;
          requestAnimationFrame(() => { scrim.classList.add('open'); sheet.classList.add('open'); });
          trigger.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
          if (window.AWM_haptic) window.AWM_haptic('selection');
        };
        const closePop = () => {
          trigger.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          if (!sheet) return;
          const s = sheet, sc = scrim;
          sheet = null; scrim = null;
          s.classList.remove('open'); sc.classList.remove('open');
          setTimeout(() => { s.remove(); sc.remove(); }, 280);
        };
        const togglePop = () => (trigger.classList.contains('open') ? closePop() : openPop());
        trigger.addEventListener('click', (e) => { e.stopPropagation(); togglePop(); });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && trigger.classList.contains('open')) closePop();
        });
        syncTrigger();
        window.AWM_syncReasonTrigger = syncTrigger;
      }

      window.AWM_syncReason = () => { sync(); if (window.AWM_syncReasonTrigger) window.AWM_syncReasonTrigger(); };   // re-localise on language switch
    })();

    ['returnWallet', 'mintWallet', 'mintContact', 'boostContact'].forEach(id => {
      const el = byId(id);
      if (!el) return;
      const isWallet = id.endsWith('Wallet');
      el.addEventListener('input', () => {
        if (isWallet) {
          // wallets are ASCII only (UQ.../EQ...) — strip cyrillic & space
          const cleaned = el.value.replace(/[^\x21-\x7E]/g, '');
          if (cleaned !== el.value) el.value = cleaned;
        }
        refreshToolBtn(el);
        const field = el.closest('.field');
        if (field) field.classList.remove('required-miss', 'required-pulse');
        updatePreviews();
      });
      el.addEventListener('keypress', (e) => {
        if (!isWallet) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/[\x21-\x7E]/.test(e.key)) e.preventDefault();
      });
    });

    // Promo
    byId('promoInput').addEventListener('input', () => {
      const v = byId('promoInput').value.replace(/^#+/, '').replace(/[^a-zA-Zа-яА-Я0-9]/g, '').toUpperCase();
      byId('promoInput').value = v;
      state.promoCode = v;
      refreshToolBtn(byId('promoInput'));
      cartLiveRefresh();
    });

    // Donation — strict, exclusive options. A custom amount overrides the % pills.
    // Donation: a custom flat amount and a percent can be combined (additive).
    byId('donationInput').addEventListener('input', () => {
      state.donationFlat = parseNum(byId('donationInput').value);
      cartLiveRefresh();
    });
    $$('[data-donation]').forEach(btn => btn.addEventListener('click', () => {
      const p = Number(btn.dataset.donation);
      // Toggle: tapping the active percent clears it; flat amount is untouched.
      state.donationPercent = (state.donationPercent === p) ? 0 : p;
      cartLiveRefresh();
      const tj = byId('tipPlate');
      if (tj) { tj.classList.remove('tipjar-pop'); void tj.offsetWidth; tj.classList.add('tipjar-pop'); }
      if (window.AWM_haptic) window.AWM_haptic('select');
    }));

    // Tap the inline QR → open the branded enlarged view + start the search.
    byId('qrTap')?.addEventListener('click', () => openQrZoom());
    byId('qrOpenHint')?.addEventListener('click', () => openQrZoom());
    byId('qrZoomFull')?.addEventListener('click', () => {
      const ov = byId('qrZoomOverlay');
      const card = ov?.querySelector('.qrzoom-card');
      if (!ov) return;
      ov.classList.toggle('maximized');
      const target = card || ov;
      if (ov.classList.contains('maximized')) {
        const req = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
        if (req) { try { const p = req.call(target); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
      } else {
        try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
      }
      if (window.AWM_haptic) window.AWM_haptic('light');
    });
    byId('qrZoomClose')?.addEventListener('click', () => closeQrZoom());
    byId('qrZoomOverlay')?.addEventListener('click', (e) => { if (e.target === byId('qrZoomOverlay')) closeQrZoom(); });
    byId('qrZoomShare')?.addEventListener('click', () => shareCurrentLink());
    byId('qrZoomNew')?.addEventListener('click', () => {
      // While the QR is open the code is locked, so use the locked-refresh path
      // (forces a fresh code/QR, restarts the 10-min window and the search).
      if (window.AWM_refreshLockedCode) window.AWM_refreshLockedCode();
      else if (window.AWM_rotateCode) window.AWM_rotateCode();
    });

    // Save the payment QR as a PNG (from the zoom view).
    byId('qrZoomSave')?.addEventListener('click', () => {
      const canvas = byId('qrZoomCanvas')?.querySelector('canvas') || byId('qrCanvas')?.querySelector('canvas');
      if (!canvas) return;
      try {
        const a = document.createElement('a');
        a.download = (state.pendingCode || 'awm-pay') + '.png';
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a); a.click(); a.remove();
      } catch (e) {}
    });

    byId('openServicePicker').addEventListener('click', () => openOverlay('service'));
    byId('userPill').addEventListener('click', () => openUsernamePrompt());
    byId('infoBtn').addEventListener('click', () => openOverlay('info'));
    $$('#infoTabs .info-tab-btn').forEach(b => b.addEventListener('click', () => setInfoTab(b.dataset.tab)));

    $$('[data-close]').forEach(btn => btn.addEventListener('click', () => closeOverlay(btn.dataset.close)));
    $$('.overlay').forEach(ov => ov.addEventListener('click', e => {
      if (e.target !== ov) return;
      // The pay/cart sheet closes only from the TOP strip or the far TOP
      // corners — never from the side backdrop hugging the sheet (avoids
      // accidental closes while interacting near the edges).
      if (ov.id === 'receiptOverlay') {
        const vh = window.innerHeight || 1, vw = window.innerWidth || 1;
        const topStrip = e.clientY < vh * 0.16;
        const topCorner = e.clientY < vh * 0.32 && (e.clientX < vw * 0.12 || e.clientX > vw * 0.88);
        if (topStrip || topCorner) closeOverlay('receipt');
        return;
      }
      closeOverlay(ov.id.replace('Overlay', ''));
    }));
    $$('.sheet-handle').forEach(bindSheetHandle);

    byId('saveUsername').addEventListener('click', () => saveUsername());
    byId('cancelUsername').addEventListener('click', () => closeOverlay('username'));

    const setLang = (lang) => {
      if (!lang || lang === state.lang) return;
      state.lang = lang;
      $$('.lang-btn').forEach(x => x.classList.toggle('active', x.dataset.lang === lang));
      applyI18n();
      renderModeHeadIcons();
      renderStarPacks();
      renderTiers();
      renderBidPacks('mint');
      renderBidPacks('boost');
      updatePreviews(); updateSummary();
      if (window.AWM_syncReason) window.AWM_syncReason();
    };
    // Language control: a tap ANYWHERE on the switch flips RU↔EN — tapping the
    // already-active side flips it too (only two languages, so any tap toggles).
    const langSwitch = document.querySelector('.lang-switch');
    if (langSwitch) {
      langSwitch.addEventListener('click', () => {
        setLang(state.lang === 'ru' ? 'en' : 'ru');
      });
    }

    byId('payCta').addEventListener('click', () => {
      if (state.ctaArmed) {
        state.ctaArmed = false;
        byId('payCta').classList.remove('kbd-focus', 'cta-armed');
        byId('payCta').querySelector('.cta-sub')?.remove();
        openReceiptCart();
        return;
      }
      handleCtaPress();
    });
    byId('copyLinkBtn').addEventListener('click', () => { copyText(state.payLink || byId('payNow').href, T[state.lang].linkCopied); });
    // Share the payment link straight into a Telegram chat. Inside the Telegram
    // Mini App we use the native openTelegramLink; in a browser, the native share
    // sheet (navigator.share) or the Telegram share URL as a fallback.
    function shareCurrentLink() {
      const url = state.payLink || byId('payNow').href || '';
      if (!url || url === '#') return;
      const text = T[state.lang].shareTgText || '';
      const tgShare = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);
      if (window.AWM_haptic) window.AWM_haptic('light');
      // 1) Inside Telegram — native chat picker.
      try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(tgShare); return;
        }
      } catch (e) {}
      // 2) Browser with Web Share API (mobile) — native share sheet.
      try {
        if (navigator.share) {
          navigator.share({ title: 'notelegram.com', text: text, url: url }).catch(() => {});
          return;
        }
      } catch (e) {}
      // 3) Fallback — Telegram share URL in a new tab.
      try { window.open(tgShare, '_blank', 'noopener'); }
      catch (e) { copyText(url, T[state.lang].linkCopied); }
    }
    window.AWM_shareLink = shareCurrentLink;
    byId('shareTgBtn')?.addEventListener('click', () => shareCurrentLink());
    byId('payNow').addEventListener('click', () => {
      if (window.AWM_haptic) window.AWM_haptic('light');
      // Lock the code/amount for the full 10-min window the moment the user
      // commits to paying, then advance to the on-chain search screen.
      if (window.AWM_lockCode) window.AWM_lockCode();
      // The href opens the wallet; advance to the on-chain search screen so the
      // payment is tracked and the user can return to the pay screen from there.
      setTimeout(() => { if (window.AWM_goToReceiptStep) window.AWM_goToReceiptStep(); }, 350);
    });

    // ----- QR tools: Save image · Share code (Download/Forward) · Make new -----
    function saveQrPng() {
      const canvas = byId('qrCanvas')?.querySelector('canvas') || byId('qrZoomCanvas')?.querySelector('canvas');
      if (!canvas) return false;
      try {
        const a = document.createElement('a');
        a.download = 'notelegram-' + String(state.pendingCode || 'pay').replace(/[^\w-]/g, '') + '.png';
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a); a.click(); a.remove();
        if (window.AWM_haptic) window.AWM_haptic('light');
        return true;
      } catch (e) { return false; }
    }
    function forwardCode() {
      const url = state.payLink || byId('payNow').href || '';
      if (!url || url === '#') return;
      const codeLbl = T[state.lang].codeLabel || 'Код';
      const text = (T[state.lang].shareTgText || '') + (state.pendingCode ? ('\n' + codeLbl + ': ' + state.pendingCode) : '');
      const share = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);
      try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) window.Telegram.WebApp.openTelegramLink(share);
        else window.open(share, '_blank', 'noopener');
        if (window.AWM_haptic) window.AWM_haptic('light');
      } catch (e) { window.open(share, '_blank', 'noopener'); }
    }
    const shareMenu = byId('qrShareMenu'), shareCodeBtn = byId('shareCodeBtn');
    function closeShareMenu() { if (shareMenu) shareMenu.hidden = true; if (shareCodeBtn) shareCodeBtn.setAttribute('aria-expanded', 'false'); }
    byId('saveQrBtn')?.addEventListener('click', saveQrPng);
    shareCodeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!shareMenu) return;
      const open = shareMenu.hidden;
      shareMenu.hidden = !open;
      shareCodeBtn.setAttribute('aria-expanded', String(open));
    });
    byId('shareCodeDownload')?.addEventListener('click', () => { closeShareMenu(); saveQrPng(); });
    byId('shareCodeForward')?.addEventListener('click', () => { closeShareMenu(); forwardCode(); });
    document.addEventListener('click', (e) => { if (shareMenu && !shareMenu.hidden && !(e.target.closest && e.target.closest('.qr-share-wrap'))) closeShareMenu(); });
    byId('newQrBtn')?.addEventListener('click', () => {
      if (window.AWM_rotateCode) window.AWM_rotateCode();
      if (window.AWM_haptic) window.AWM_haptic('medium');
      const b = byId('newQrBtn'); if (b) { b.classList.remove('did'); void b.offsetWidth; b.classList.add('did'); }
    });
    byId('copyWalletBtn')?.addEventListener('click', () => copyText(WALLET, T[state.lang].walletCopied));
    byId('rcCopyCode').addEventListener('click', () => copyText(state.pendingCode, T[state.lang].codeCopied));

    // Cart 3-stage navigation — every [data-go-step] button + the stepper chips
    document.querySelectorAll('[data-go-step]').forEach(b =>
      b.addEventListener('click', () => gotoCartStep(+b.dataset.goStep)));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const a = document.activeElement;
        if (a && a.tagName === 'TEXTAREA') return;
        if (a && a.matches?.('button, a[href]') && a.id !== 'payCta') return;
        e.preventDefault();
        smartEnter();
      }
      if (e.key === 'Escape') { e.preventDefault(); smartEscape(); }
      // Main-screen arrow navigation: ↑/↓ step the current service's amount or
      // tier. ←/→ are reserved for SWITCHING service (handled in enhance.js) —
      // they must NOT also step the value, otherwise arrowing away from Stars
      // bumps the star count on the way out.
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (topOverlay()) return;
        const a = document.activeElement;
        if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) return; // field has its own stepping
        e.preventDefault();
        stepMainService(e.key === 'ArrowUp' ? 'up' : 'down');
      }
    });

    RateStore.on(renderRate);
    P.startRatePolling(8_000);
    renderRate();
    startChart();

    // Realtime ticking clock on the open receipt (date + seconds), independent
    // of the order code so refreshing the time never regenerates the payment code.
    setInterval(() => {
      if (!byId('receiptOverlay').classList.contains('visible')) return;
      const el = byId('rcWhen');
      if (el) el.textContent = new Date().toLocaleString(state.lang === 'ru' ? 'ru-RU' : 'en-US', { dateStyle: 'short', timeStyle: 'medium' });
    }, 1000);

    // Retract the armed CTA hint when the user interacts elsewhere.
    document.addEventListener('pointerdown', (e) => {
      if (state.ctaArmed && !(e.target.closest && e.target.closest('#payCta'))) disarmCta();
    }, true);
    document.addEventListener('input', () => disarmCta());
    document.querySelectorAll('.service-picker, [data-mode-switch]').forEach(el =>
      el.addEventListener('click', () => disarmCta()));

    syncModeUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
