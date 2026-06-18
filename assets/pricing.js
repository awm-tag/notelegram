/* =========================================================
   AWM Payment Miniapp — Pricing Engine & Services Registry
   ========================================================= */

(function (global) {
  'use strict';

  // ---------- Services registry (extensible) ----------
  const SERVICES = {
    custom: {
      id: 'custom',
      code: 'CST',
      group: 'manual',
      name: { ru: 'Оплата товаров и услуг', en: 'Goods & services payment' },
      sub:  { ru: 'Оплата по договорённости: услуги, возврат долга, донат.', en: 'Agreed payment: services, debt return, donation.' },
      teaser: { ru: 'от 0.1 TON', en: 'from 0.1 TON' },
      minTon: 0.1,
      requiresUsername: true,
      icon: 'wallet'
    },
    deal: {
      id: 'deal',
      code: 'DEAL',
      group: 'manual',
      name: { ru: 'Сделка', en: 'Deal' },
      sub:  { ru: 'Официальная оплата по конкретной сделке.', en: 'Official payment for a specific deal.' },
      teaser: { ru: 'TON / USDT', en: 'TON / USDT' },
      minTon: 0.1,
      requiresUsername: true,
      icon: 'deal'
    },
    mint: {
      id: 'mint',
      code: 'MNT',
      group: 'manual',
      name: { ru: 'Минт юзернейма', en: 'Username mint' },
      sub:  { ru: 'Превращение юзернейма в Telegram NFT.', en: 'Turning a Telegram username into NFT.' },
      teaser: { ru: 'от 7 TON', en: 'from 7 TON' },
      baseTon: 7,
      minBidTon: 50,
      // Preset bid amounts with a commission discount. "feature" → gold "выгодно".
      bidPacks: [
        { bid: 104,  disc: 0.03, feature: true },
        { bid: 250,  disc: 0.01 },
        { bid: 500,  disc: 0.01 },
        { bid: 666,  disc: 0.04, feature: true },
        { bid: 1000, disc: 0.02 },
        { bid: 1250, disc: 0.02 },
        { bid: 1500, disc: 0.03 },
        { bid: 2000, disc: 0.04, feature: true }
      ],
      requiresUsername: true,
      icon: 'mint'
    },
    boost: {
      id: 'boost',
      code: 'BST',
      group: 'manual',
      name: { ru: 'Повышение ставки на NFT', en: 'NFT bid increase' },
      sub:  { ru: 'Оплата — доп. услуга от желаемой суммы. Шкала 10% → 7.5% — чем выше ставка, тем ниже %.', en: 'You pay an add-on of the target bid. Tier 10% → 7.5% — higher bid, lower %.' },
      teaser: { ru: '10% → 7.5%', en: '10% → 7.5%' },
      minBidTon: 50,
      bidPacks: [
        { bid: 104,  disc: 0.03, feature: true },
        { bid: 250,  disc: 0.01 },
        { bid: 500,  disc: 0.01 },
        { bid: 666,  disc: 0.04, feature: true },
        { bid: 1000, disc: 0.02 },
        { bid: 1250, disc: 0.02 },
        { bid: 1500, disc: 0.03 },
        { bid: 2000, disc: 0.04, feature: true }
      ],
      requiresUsername: true,
      icon: 'boost'
    },
    stars: {
      id: 'stars',
      code: 'STR',
      group: 'auto',
      name: { ru: 'Покупка Stars', en: 'Stars purchase' },
      sub:  { ru: 'Telegram Stars по актуальному курсу.', en: 'Telegram Stars at live rate.' },
      teaser: { ru: 'от 50 ☆', en: 'from 50 ☆' },
      starUsd: 0.015,             // base rate per star
      starsFee: 0.05,             // +5% on custom qty
      packDiscount: { small: 0.01, large: 0.02 },   // 50–5000 → 1%, 10000+ → 2%
      packsBigThreshold: 10000,
      bonusOver: 100000,
      bonus: 0,
      packs: [
        { qty: 50, disc: 0.03, feature: true },
        { qty: 100 },
        { qty: 250 },
        { qty: 500 },
        { qty: 1000, disc: 0.03, feature: true },
        { qty: 2500, disc: 0.02 },
        { qty: 5000, disc: 0.02 },
        { qty: 10000, disc: 0.02 }
      ],
      minQty: 50,
      maxQty: 1_000_000,
      requiresUsername: true,
      icon: 'star'
    },
    premium: {
      id: 'premium',
      code: 'PRM',
      group: 'auto',
      name: { ru: 'Telegram Premium', en: 'Telegram Premium' },
      sub:  { ru: 'Подписка на 3 / 6 / 12 месяцев.', en: 'Subscription for 3 / 6 / 12 months.' },
      teaser: { ru: 'от 2.3 TON', en: 'from 2.3 TON' },
      tiers: [
        { months: 3,  usd: 11.99, disc: 0.01, label: { ru: '3 месяца', en: '3 months' } },
        { months: 6,  usd: 15.99, disc: 0.02, label: { ru: '6 месяцев', en: '6 months' } },
        { months: 12, usd: 28.99, disc: 0.03, feature: true, label: { ru: '12 месяцев', en: '12 months' } }
      ],
      serviceFee: 0.05,            // hidden — applied silently
      requiresUsername: true,
      icon: 'premium'
    }
  };

  // Auto-services (instant, anytime) first, then manually-processed ones.
  const SERVICE_ORDER = ['stars', 'premium', 'custom', 'deal', 'mint', 'boost'];

  // ---------- Apply commission overrides from payment-config.js ----------
  // Lets you set e.g. 17% on Stars/Premium without touching the engine.
  (function applyConfigCommissions() {
    const cfg = (window.AWM_PAYCONFIG && window.AWM_PAYCONFIG.services) || {};
    if (cfg.stars && cfg.stars.commissionPct != null) {
      SERVICES.stars.starsFee = cfg.stars.commissionPct / 100;
      // Keep the small pack discounts as a visible incentive (packs stay
      // cheaper than a custom quantity even with the flat commission).
      SERVICES.stars.packDiscount = { small: 0.01, large: 0.02 };
      SERVICES.stars.packsBigThreshold = 10000;
      SERVICES.stars.bonus = 0;
    }
    if (cfg.premium && cfg.premium.commissionPct != null) {
      SERVICES.premium.serviceFee = cfg.premium.commissionPct / 100;
    }
  })();

  // ---------- Mint / boost commission tiers ----------
  function tieredPercent(base) {
    if (!Number.isFinite(base) || base <= 0) return 0;
    if (base > 10000) return 7.5;
    if (base >  5000) return 8;
    if (base >  1000) return 8.5;
    if (base >   500) return 9;
    if (base >   200) return 9.5;
    return 10;
  }

  // ---------- Pricing Engine ----------
  // Live TON/USD rate. Pulls from CoinGecko every 15s with cache fallback.
  const RateStore = {
    tonUsd: 5.40,        // sane fallback
    usdRub: 90,          // USD→RUB fx fallback (refreshed with the rate)
    usdEur: 0.92,        // USD→EUR fx fallback
    lastUpdatedAt: 0,
    lastSource: 'fallback',
    listeners: new Set(),

    isStale() {
      if (!this.lastUpdatedAt) return true;
      return (Date.now() - this.lastUpdatedAt) > 60_000; // >1m old = stale
    },

    set(rate, source) {
      const n = Number(rate);
      if (!Number.isFinite(n) || n <= 0) return false;
      this.tonUsd = n;
      this.lastUpdatedAt = Date.now();
      this.lastSource = source || 'api';
      try { localStorage.setItem('awm_ton_usd', JSON.stringify({ r: n, t: this.lastUpdatedAt })); } catch {}
      this.notify();
      return true;
    },

    restore() {
      try {
        const raw = localStorage.getItem('awm_ton_usd');
        if (!raw) return;
        const { r, t } = JSON.parse(raw);
        if (Number.isFinite(r) && r > 0) {
          this.tonUsd = r;
          this.lastUpdatedAt = t || 0;
          this.lastSource = 'cache';
        }
      } catch {}
    },

    on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
    notify() { this.listeners.forEach(fn => { try { fn(this); } catch {} }); }
  };

  async function fetchRate() {
    const urls = [
      'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd,rub,eur',
      'https://api.coinbase.com/v2/prices/TON-USD/spot'
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) continue;
        const data = await res.json();
        let value = null;
        if (data['the-open-network']?.usd) {
          value = data['the-open-network'].usd;
          // Derive USD→RUB from TON priced in both currencies.
          const rub = data['the-open-network'].rub;
          if (rub && value) { const fx = rub / value; if (Number.isFinite(fx) && fx > 0) RateStore.usdRub = fx; }
          const eur = data['the-open-network'].eur;
          if (eur && value) { const fx = eur / value; if (Number.isFinite(fx) && fx > 0) RateStore.usdEur = fx; }
        } else if (data?.data?.amount) value = parseFloat(data.data.amount);
        if (value && RateStore.set(value, url.includes('coingecko') ? 'coingecko' : 'coinbase')) return;
      } catch {}
    }
  }

  function startRatePolling(intervalMs = 15_000) {
    RateStore.restore();
    fetchRate();
    setInterval(fetchRate, intervalMs);
  }

  // ---------- Money helpers ----------
  function round(n, p = 4) {
    if (!Number.isFinite(n)) return 0;
    const f = Math.pow(10, p);
    return Math.round(n * f) / f;
  }
  function tonFromUsd(usd) { return round((usd || 0) / (RateStore.tonUsd || 1), 4); }
  function usdFromTon(ton) { return round((ton || 0) * (RateStore.tonUsd || 0), 2); }
  function rubFromUsd(usd) { return round((usd || 0) * (RateStore.usdRub || 0), 0); }
  function rubFromTon(ton) { return rubFromUsd(usdFromTon(ton)); }
  function eurFromUsd(usd) { return round((usd || 0) * (RateStore.usdEur || 0), 2); }
  function eurFromTon(ton) { return eurFromUsd(usdFromTon(ton)); }
  function formatRub(v) {
    const n = Math.round(Number(v) || 0);
    return '₽' + new Intl.NumberFormat('ru-RU').format(n);
  }
  function formatEur(v) {
    const n = Number(v) || 0;
    return '€' + new Intl.NumberFormat('en-US', { minimumFractionDigits: n < 100 ? 2 : 0, maximumFractionDigits: 2 }).format(n);
  }

  function formatTon(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    if (n === 0) return '0';
    if (n < 0.01) return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    if (n < 1)    return (Math.round(n * 1000) / 1000).toString();
    if (n < 100)  return (Math.round(n * 100)  / 100).toString();
    return Math.round(n).toString();
  }
  function formatUsd(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '$0';
    if (Math.abs(n) < 1)  return '$' + n.toFixed(2);
    if (Math.abs(n) < 100) return '$' + n.toFixed(2);
    return '$' + Math.round(n).toString();
  }
  function formatInt(n) {
    return new Intl.NumberFormat('en-US').format(Math.trunc(Number(n) || 0));
  }

  // ---------- Compute price for any selection ----------
  // selection: { service, ... }
  function compute(selection) {
    const s = selection || {};
    const svc = SERVICES[s.service] || SERVICES.custom;
    const result = {
      service: svc.id,
      serviceName: svc.name,
      currency: 'TON',
      base: 0,
      baseUsd: 0,
      fee: 0,
      feeUsd: 0,
      feePercent: 0,
      discountPct: 0,
      total: 0,
      totalUsd: 0,
      label: '',          // short qty label (e.g. "250 ⭐", "12 months")
      breakdown: [],      // [{ k, v, sub }]
      valid: false,
      reason: ''
    };

    if (svc.id === 'custom' || svc.id === 'deal') {
      const ton = Math.max(0, Number(s.amountTon) || 0);
      result.base = ton;
      result.total = ton;
      result.valid = ton >= svc.minTon;
      if (!result.valid) result.reason = 'min_amount';
      result.breakdown.push({ k: 'amount', v: ton });
    }

    else if (svc.id === 'mint') {
      const bid = Math.max(0, Math.trunc(Number(s.bidTon) || 0));
      result.base = svc.baseTon;
      const p = bid >= svc.minBidTon ? tieredPercent(bid) : 0;
      result.feePercent = p;
      const pack = (svc.bidPacks || []).find(x => x.bid === bid);
      const disc = pack ? (pack.disc || 0) : 0;
      const grossFee = bid * p / 100;
      result.fee = round(grossFee * (1 - disc), 4);
      result.discountPct = +(disc * 100).toFixed(0);
      result.discountTon = round(grossFee * disc, 4);
      result.discountUsd = usdFromTon(result.discountTon);
      result.total = round(result.base + result.fee, 4);
      result.valid = bid >= svc.minBidTon;
      if (!result.valid) result.reason = 'min_bid';
      result.breakdown.push({ k: 'base', v: result.base });
      result.breakdown.push({ k: 'fee', v: result.fee, sub: p + '%' });
    }

    else if (svc.id === 'boost') {
      const bid = Math.max(0, Math.trunc(Number(s.bidTon) || 0));
      const p = bid >= svc.minBidTon ? tieredPercent(bid) : 0;
      result.feePercent = p;
      const pack = (svc.bidPacks || []).find(x => x.bid === bid);
      const disc = pack ? (pack.disc || 0) : 0;
      const grossFee = bid * p / 100;
      result.fee = round(grossFee * (1 - disc), 4);
      result.discountPct = +(disc * 100).toFixed(0);
      result.discountTon = round(grossFee * disc, 4);
      result.discountUsd = usdFromTon(result.discountTon);
      result.base = bid;
      result.total = result.fee;
      result.valid = bid >= svc.minBidTon;
      if (!result.valid) result.reason = 'min_bid';
      result.breakdown.push({ k: 'bid', v: bid });
      result.breakdown.push({ k: 'fee', v: result.fee, sub: p + '%' });
    }

    else if (svc.id === 'stars') {
      const qty = Math.max(0, Math.trunc(Number(s.starsQty) || 0));
      const linearUsd = qty * svc.starUsd * (1 + (svc.starsFee || 0));
      let discount = 0;
      const pack = svc.packs.find(p => p.qty === qty);
      if (pack) {
        // Per-pack discount override wins; otherwise small/large tier.
        discount = (pack.disc != null)
          ? pack.disc
          : (qty >= svc.packsBigThreshold ? svc.packDiscount.large : svc.packDiscount.small);
      }
      if (qty > svc.bonusOver) discount += svc.bonus;
      const usd = +(linearUsd * (1 - discount)).toFixed(2);
      const ton = tonFromUsd(usd);
      result.base = tonFromUsd(linearUsd);   // pre-discount reference
      result.baseUsd = +linearUsd.toFixed(2);
      result.total = ton;
      result.totalUsd = usd;
      result.discountPct = +(discount * 100).toFixed(1);
      result.discountUsd = +(linearUsd - usd).toFixed(2);
      result.isPack = !!pack;
      result.label = formatInt(qty) + ' ★';
      result.valid = qty >= svc.minQty && qty <= svc.maxQty;
      if (qty < svc.minQty) result.reason = 'min_stars';
      else if (qty > svc.maxQty) result.reason = 'max_stars';
      result.breakdown.push({ k: 'qty', v: qty });
      return finalize(result);
    }

    else if (svc.id === 'premium') {
      const months = Number(s.months) || 0;
      const tier = svc.tiers.find(t => t.months === months);
      if (tier) {
        const usdBase = tier.usd;
        const disc = tier.disc || 0;
        const usdAfterFee = usdBase * (1 + svc.serviceFee);
        const usdTotal = round(usdAfterFee * (1 - disc), 2);
        result.baseUsd = usdBase;
        result.feeUsd = round(usdBase * svc.serviceFee, 2);
        result.feePercent = svc.serviceFee * 100;
        result.discountPct = +(disc * 100).toFixed(0);
        result.totalUsd = usdTotal;
        result.base = tonFromUsd(usdBase);
        result.fee = tonFromUsd(result.feeUsd);
        result.total = tonFromUsd(usdTotal);
        result.label = tier.label;
        result.valid = true;
        result.breakdown.push({ k: 'months', v: months });
      } else {
        result.reason = 'no_tier';
      }
      return finalize(result);
    }

    return finalize(result);
  }

  function finalize(r) {
    if (!r.baseUsd && r.base) r.baseUsd = usdFromTon(r.base);
    if (!r.feeUsd && r.fee)   r.feeUsd  = usdFromTon(r.fee);
    if (!r.totalUsd && r.total) r.totalUsd = usdFromTon(r.total);
    return r;
  }

  // ---------- Individual payment code generator ----------
  // Format: #<obfuscated_username>-<service_code>-<amount_code>-<random_5_chars>
  // Username is obfuscated with a deterministic FNV-1a hash → base36 (no PII leak).
  // Amount code is base36(round(total*1000)).
  // Random 5 chars: A-Z / 0-9 — link-safe.

  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  }

  function obfuscateUsername(username) {
    const norm = String(username || 'guest').toLowerCase().replace(/[^a-z0-9_]/g, '');
    return fnv1a(norm || 'guest');
  }

  function randomChars(n) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    const arr = new Uint8Array(n);
    try { crypto.getRandomValues(arr); }
    catch { for (let i = 0; i < n; i++) arr[i] = Math.floor(Math.random() * 256); }
    for (let i = 0; i < n; i++) out += chars[arr[i] % chars.length];
    return out;
  }

  function amountCode(totalTon) {
    const n = Math.max(0, Math.round((Number(totalTon) || 0) * 1000));
    return n.toString(36).toUpperCase().padStart(3, '0').slice(0, 6);
  }

  function makePaymentCode({ service, username, total }) {
    const svcCode = (SERVICES[service]?.code) || 'XXX';
    const u = obfuscateUsername(username);
    const a = amountCode(total);
    const r = randomChars(5);
    if (service === 'deal') {
      // Deal codes start with digits — a clean, invoice-style number.
      const num = (Math.abs(parseInt(u, 36)) % 1000000).toString().padStart(6, '0');
      return `#${num}-${svcCode}-${a}-${r}`;
    }
    return `#${u}-${svcCode}-${a}-${r}`;
  }

  // ---------- Public API ----------
  global.AWMPricing = {
    SERVICES, SERVICE_ORDER,
    RateStore,
    startRatePolling,
    compute,
    tieredPercent,
    tonFromUsd, usdFromTon,
    rubFromUsd, rubFromTon, formatRub,
    eurFromUsd, eurFromTon, formatEur,
    formatTon, formatUsd, formatInt,
    makePaymentCode,
    obfuscateUsername
  };
})(window);
