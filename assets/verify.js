/* =========================================================
   AWM Payment Miniapp — verify.js
   On-chain payment verification (read-only, no backend).
   Polls the public TON API (tonapi.io) for an incoming transfer to the
   receiving wallet whose comment carries the order code. When matched, the
   user gets a verified receipt they can download / open in an explorer.

   NOTE: this is *verification*, which is safe and possible fully client-side.
   Actually crediting Stars/Premium still needs a bot/back-end to act on a
   confirmed payment — this front-end proves the payment landed.
   ========================================================= */
(function () {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const CFG = () => (window.AWM_PAYCONFIG || {});
  const VAPI = () => (CFG().verifyApi || { base: 'https://tonapi.io/v2', token: '', explorer: 'https://tonviewer.com/' });
  const POLL_MS = 5000;
  const TIMEOUT_MS = 60 * 60 * 1000; // keep watching for up to 1 hour after "Я оплатил"

  let timer = null, startedAt = 0, ctx = null, found = null, watching = false;

  function ru() { return (document.documentElement.lang || 'ru') !== 'en'; }
  const TXT = {
    waiting:  { ru: 'Ждём оплату…',        en: 'Waiting for payment…' },
    waitSub:  { ru: 'Проверяем блокчейн TON автоматически', en: 'Auto-checking the TON blockchain' },
    checking: { ru: 'Проверяем…',           en: 'Checking…' },
    paid:     { ru: 'Оплата подтверждена',  en: 'Payment confirmed' },
    paidSub:  { ru: 'Платёж найден в блокчейне', en: 'Found on-chain' },
    none:     { ru: 'Платёж пока не виден', en: 'Payment not seen yet' },
    noneSub:  { ru: 'Оплатите и нажмите обновить', en: 'Pay, then tap refresh' },
    offline:  { ru: 'Автопроверка недоступна', en: 'Auto-check unavailable' },
    offSub:   { ru: 'Откройте чек вручную по коду', en: 'Verify manually by code' },
    timeout:  { ru: 'Время ожидания вышло (1 час)',  en: 'Timed out (1 hour)' },
  };
  const t = (k) => (ru() ? TXT[k].ru : TXT[k].en);

  // Human-readable "how long we've been searching" for the status line.
  function elapsedTxt() {
    const ms = Math.max(0, Date.now() - startedAt);
    const mins = Math.floor(ms / 60000), secs = Math.floor((ms % 60000) / 1000);
    if (mins <= 0) return ru() ? ('ищем ' + secs + ' с') : (secs + 's elapsed');
    return ru() ? ('ищем ' + mins + ' мин') : (mins + ' min elapsed');
  }

  function setStatus(stateName, title, sub) {
    const s = byId('verifyStatus');
    if (s) { s.dataset.state = stateName; byId('verifyTitle').textContent = title; byId('verifySub').textContent = sub; }
    // Mirror a concise status onto the compact pay-screen (step 3) line AND the
    // QR-zoom view so the user sees the auto-check running in both places.
    const r = ru();
    const stateClass = ({ paid: 'paid', offline: 'offline', timeout: 'timeout' })[stateName] || 'searching';
    let mirrorTx;
    if (stateName === 'paid') mirrorTx = r ? 'Оплата найдена — открываем чек' : 'Payment found — opening receipt';
    else if (stateName === 'offline') mirrorTx = r ? 'Автопроверка недоступна' : 'Auto-check unavailable';
    else if (stateName === 'timeout') mirrorTx = r ? 'Время вышло — нажмите «Проверить»' : 'Timed out — tap “Recheck”';
    else mirrorTx = (r ? 'Проверяем оплату…' : 'Auto-checking payment…') + ' · ' + elapsedTxt();
    [['qrWatch', 'qrWatchTx'], ['qrZoomWatch', 'qrZoomWatchTx']].forEach(([wid, tid]) => {
      const w = byId(wid); if (!w) return;
      w.dataset.state = stateClass;
      const tx = byId(tid); if (tx) tx.textContent = mirrorTx;
    });
  }

  function show() { const b = byId('verifyBlock'); if (b) b.hidden = false; }
  function reset() {
    stop();
    found = null;
    watching = false;
    const b = byId('verifyBlock'); if (b) b.hidden = true;
    const r = byId('verifyReceipt'); if (r) r.hidden = true;
    setStatus('idle', t('waiting'), t('waitSub'));
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  // normalize a TON address to its raw lowercase hex form for comparison
  function sameWallet(a, b) {
    if (!a || !b) return false;
    const norm = (x) => String(x).toLowerCase().replace(/^0:/, '').replace(/[^0-9a-z_-]/g, '');
    return norm(a).slice(-48) === norm(b).slice(-48) || a === b;
  }

  // ---- Verification providers ----------------------------------------------
  // Several independent read-only APIs are tried in order until one confirms the
  // incoming transfer (code in comment + amount ≥ expected). If a provider is
  // unavailable (CORS/rate-limit/offline) we fall through to the next one.
  // Each returns: 'found' (already reported), 'none' (reachable, no match yet),
  // or throws (unavailable → try next).
  // Match an incoming transfer to THIS order. The code may have rotated while
  // the user was paying, so we accept a payment whose comment carries ANY of
  // the codes shown this session (window.AWM_paymentCodes), not just the latest.
  function matches(comment, amountNano) {
    const cm = String(comment || '').toUpperCase();
    const codes = (Array.isArray(window.AWM_paymentCodes) && window.AWM_paymentCodes.length)
      ? window.AWM_paymentCodes : [ctx.code];
    const codeHit = codes.some((c) => c && cm.includes(String(c).toUpperCase()));
    const amountHit = Number(amountNano || 0) >= ctx.nano * 0.94; // tolerate rounding
    return codeHit && amountHit;
  }

  // 1) tonapi.io v2 — rich event model.
  async function provTonapi() {
    const v = VAPI();
    const base = v.base || 'https://tonapi.io/v2';
    const url = `${base}/accounts/${encodeURIComponent(ctx.wallet)}/events?limit=20`;
    const headers = { Accept: 'application/json' };
    if (v.token) headers.Authorization = 'Bearer ' + v.token;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('tonapi http ' + res.status);
    const data = await res.json();
    for (const ev of (data.events || [])) {
      for (const act of (ev.actions || [])) {
        const tr = act.TonTransfer;
        if (tr && matches(tr.comment, tr.amount)) {
          onFound({ hash: ev.event_id, amount: Number(tr.amount), utime: ev.timestamp || Math.floor(Date.now() / 1000) });
          return 'found';
        }
      }
    }
    return 'none';
  }

  // 2) toncenter v2 — getTransactions (api key optional).
  async function provToncenterV2() {
    const cfg = (CFG().toncenter || {});
    const base = cfg.base || 'https://toncenter.com/api/v2';
    const key = cfg.key ? ('&api_key=' + encodeURIComponent(cfg.key)) : '';
    const url = `${base}/getTransactions?address=${encodeURIComponent(ctx.wallet)}&limit=20&archival=true${key}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('toncenter http ' + res.status);
    const data = await res.json();
    for (const tx of (data.result || [])) {
      const inMsg = tx.in_msg || {};
      const comment = (inMsg.message || inMsg.comment || '');
      if (matches(comment, inMsg.value)) {
        onFound({ hash: (tx.transaction_id && tx.transaction_id.hash) || '', amount: Number(inMsg.value), utime: tx.utime || Math.floor(Date.now() / 1000) });
        return 'found';
      }
    }
    return 'none';
  }

  // 3) toncenter v3 — newer indexed endpoint.
  async function provToncenterV3() {
    const cfg = (CFG().toncenterV3 || {});
    const base = cfg.base || 'https://toncenter.com/api/v3';
    const key = cfg.key ? ('&api_key=' + encodeURIComponent(cfg.key)) : '';
    const url = `${base}/transactions?account=${encodeURIComponent(ctx.wallet)}&limit=20&sort=desc${key}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('toncenter v3 http ' + res.status);
    const data = await res.json();
    for (const tx of (data.transactions || [])) {
      const inMsg = tx.in_msg || {};
      const comment = (inMsg.message_content && inMsg.message_content.decoded && inMsg.message_content.decoded.comment) || inMsg.comment || '';
      const val = inMsg.value;
      if (matches(comment, val)) {
        onFound({ hash: tx.hash || '', amount: Number(val), utime: (tx.now || Math.floor(Date.now() / 1000)) });
        return 'found';
      }
    }
    return 'none';
  }

  const PROVIDERS = [provTonapi, provToncenterV2, provToncenterV3];

  async function pollOnce() {
    if (!ctx) return false;
    setStatus('checking', t('checking'), t('waitSub'));
    let anyReachable = false;
    for (const prov of PROVIDERS) {
      try {
        const r = await prov();
        anyReachable = true;
        if (r === 'found') return true;
      } catch (err) {
        // this provider is down — try the next one
      }
    }
    setStatus(anyReachable ? 'searching' : 'offline',
      anyReachable ? t('none') : t('offline'),
      anyReachable ? (t('noneSub') + ' · ' + elapsedTxt()) : t('offSub'));
    return false;
  }

  function onFound(tx) {
    found = tx;
    watching = false;
    stop();
    setStatus('paid', t('paid'), t('paidSub'));
    if (window.AWM_haptic) window.AWM_haptic('success');
    // The QR is now irrelevant — close the enlarged/fullscreen view and show a
    // quick success check before the receipt slides in.
    if (window.AWM_onPaymentFound) { try { window.AWM_onPaymentFound(); } catch (e) {} }
    const r = byId('verifyReceipt');
    if (r) r.hidden = false;
    byId('vrTxHash').textContent = shorten(tx.hash);
    byId('vrPaidAmt').textContent = (tx.amount / 1e9).toFixed(4) + ' TON';
    byId('vrTime').textContent = new Date(tx.utime * 1000).toLocaleString(ru() ? 'ru-RU' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
    const exp = byId('vrExplorer');
    if (exp) exp.href = (VAPI().explorer || 'https://tonviewer.com/') + ctx.wallet;
    // Glide straight to the receipt — the chain is the source of truth, no tap needed.
    const sheet = document.querySelector('.receipt-sheet');
    const step = +((sheet && sheet.getAttribute('data-cart-step')) || 0);
    if (step !== 4 && window.AWM_goToReceiptStep) { setTimeout(() => { if (found) window.AWM_goToReceiptStep(); }, 450); }
  }

  function shorten(h) { h = String(h || ''); return h.length > 16 ? h.slice(0, 8) + '…' + h.slice(-6) : h; }

  function start() {
    const newCtx = window.AWM_paymentContext;
    if (!newCtx) return;
    // Already confirmed for this exact code — just re-render the receipt.
    if (found && ctx && ctx.code === newCtx.code) { ctx = newCtx; show(); onFound(found); return; }
    // Already watching this same code — don't restart the timer (keeps the
    // elapsed counter honest when start() is called again on step change).
    if (watching && timer && ctx && ctx.code === newCtx.code) { show(); return; }
    ctx = newCtx;
    show();
    startedAt = Date.now();
    found = null;
    watching = true;
    setStatus('searching', t('waiting'), t('waitSub'));
    stop();
    // The TON chain is the source of truth — always watch it directly so the
    // receipt is issued from a real on-chain transfer (typically within ~30s).
    const be = (window.AWM_PAYCONFIG && window.AWM_PAYCONFIG.backend) || {};
    if (be.base && be.sse && window.EventSource) { try { attachServerStream(be); } catch (e) {} }
    pollOnce();
    timer = setInterval(() => {
      if (found) { stop(); return; }
      if (Date.now() - startedAt > TIMEOUT_MS) { stop(); watching = false; setStatus('timeout', t('timeout'), t('noneSub')); return; }
      pollOnce();
    }, POLL_MS);
  }

  // Optional accelerator: if the VPS is live it pushes an instant "paid" event.
  // Purely additive — on-chain polling keeps running as the reliable fallback.
  function attachServerStream(be) {
    const orderId = (ctx && ctx.code) || '';
    if (!be.sse || !window.EventSource) return;
    try {
      const es = new EventSource(be.base.replace(/\/+$/, '') + be.sse + '?code=' + encodeURIComponent(orderId));
      es.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data);
          if (d.status === 'paid' || d.status === 'done') {
            es.close();
            onFound({ hash: d.tx || d.hash || orderId, amount: d.amount_nano || ctx.nano, utime: d.utime || Math.floor(Date.now() / 1000) });
          }
        } catch (e) {}
      };
      es.onerror = () => { try { es.close(); } catch (e) {} };
    } catch (e) {}
  }

  function buildReceiptText() {
    const c = ctx || {};
    const ru = (document.documentElement.lang || 'ru') !== 'en';
    const paidTon = (found ? found.amount / 1e9 : c.finalTon) || 0;
    const lines = [
      'notelegram.com — AWM // PAY',
      ru ? 'Чек об оплате' : 'Payment receipt',
      '────────────────────',
      (ru ? 'Услуга:    ' : 'Service:   ') + (c.service || '—'),
      c.recipient ? ((ru ? 'Получатель: @' : 'Recipient: @') + c.recipient) : null,
      c.username ? ((ru ? 'Плательщик: @' : 'Payer:     @') + c.username) : null,
      (ru ? 'Сумма:     ' : 'Amount:    ') + paidTon + ' TON',
      '           ≈ $' + Number(c.usd || 0).toFixed(2) + ' · ₽' + Math.round(c.rub || 0),
      (ru ? 'Код:       ' : 'Code:      ') + (c.code || '—'),
      (ru ? 'Курс:      ' : 'Rate:      ') + '$' + Number(c.rate || 0).toFixed(3) + ' / TON',
      (ru ? 'Кошелёк:   ' : 'Wallet:    ') + (c.wallet || '—'),
      found ? ((ru ? 'Транзакция: ' : 'Tx:        ') + found.hash) : null,
      found ? ((ru ? 'Подтверждено: ' : 'Confirmed: ') + new Date(found.utime * 1000).toISOString())
            : ((ru ? 'Выдан:     ' : 'Issued:    ') + (c.when || new Date().toISOString())),
      (ru ? 'Статус:    ' : 'Status:    ') + (found ? (ru ? 'ОПЛАЧЕНО ✓' : 'CONFIRMED ✓') : (ru ? 'ОЖИДАНИЕ' : 'PENDING')),
      '────────────────────',
      (ru ? 'Поддержка: ' : 'Support: ') + 'https://t.me/NoTelegramSupport',
      'notelegram.com',
    ].filter(Boolean);
    return lines.join('\n');
  }
  function downloadReceipt() {
    const blob = new Blob([buildReceiptText()], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'notelegram-receipt-' + ((ctx && ctx.code) || 'order').replace(/[^\w-]/g, '') + '.txt';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ---- Proper PDF receipt -------------------------------------------------
  // Built as a branded, A4-friendly HTML document opened in a new tab that
  // auto-triggers the print dialog — the user picks “Save as PDF”. This keeps
  // Cyrillic perfect (system fonts) and needs no external PDF library.
  function esc(s) { return String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }
  function receiptHtml() {
    const c = ctx || {};
    const r = ru();
    const paidTon = (found ? found.amount / 1e9 : c.finalTon) || 0;
    const rows = [
      [r ? 'Услуга' : 'Service', c.service || '—'],
      c.recipient ? [r ? 'Получатель' : 'Recipient', '@' + c.recipient] : null,
      c.username ? [r ? 'Плательщик' : 'Payer', '@' + c.username] : null,
      [r ? 'Код заказа' : 'Order code', c.code || '—'],
      [r ? 'Курс' : 'Rate', '$' + Number(c.rate || 0).toFixed(3) + ' / TON'],
      [r ? 'Кошелёк' : 'Wallet', c.wallet || '—'],
      found ? [r ? 'Транзакция' : 'Transaction', found.hash] : null,
      [found ? (r ? 'Подтверждено' : 'Confirmed') : (r ? 'Выдан' : 'Issued'),
        (found ? new Date(found.utime * 1000) : new Date()).toLocaleString(r ? 'ru-RU' : 'en-US')],
    ].filter(Boolean);
    const status = found ? (r ? 'ОПЛАЧЕНО' : 'PAID') : (r ? 'ОЖИДАНИЕ' : 'PENDING');
    const usd = Number(c.usd || 0).toFixed(2), rub = Math.round(c.rub || 0);
    const ok = !!found;
    return '<!doctype html><html lang="' + (r ? 'ru' : 'en') + '"><head><meta charset="utf-8"><title>notelegram.com — ' + (r ? 'Чек' : 'Receipt') + ' ' + esc(c.code || '') + '</title><style>'
      + '*{box-sizing:border-box;margin:0;padding:0}'
      + "body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#fff;color:#0f1622;padding:40px;-webkit-print-color-adjust:exact;print-color-adjust:exact}"
      + '.doc{max-width:620px;margin:0 auto;border:1px solid #e4e9f2;border-radius:18px;overflow:hidden}'
      + '.top{padding:26px 32px;background:linear-gradient(135deg,#0b1422,#16243a);color:#eaf2ff;display:flex;justify-content:space-between;align-items:center}'
      + '.brand{font-weight:800;font-size:20px}.brand span{color:#7fd0ff}'
      + '.badge{font-size:12px;font-weight:800;letter-spacing:.12em;padding:6px 12px;border-radius:999px;background:' + (ok ? 'rgba(56,210,160,.2)' : 'rgba(255,200,80,.18)') + ';color:' + (ok ? '#1f8a5b' : '#a6791b') + ';border:1px solid ' + (ok ? 'rgba(56,210,160,.5)' : 'rgba(255,200,80,.5)') + '}'
      + '.amt{padding:28px 32px 8px}.amt .ton{font-size:38px;font-weight:900;letter-spacing:-.02em}.amt .fiat{color:#5b6678;font-size:15px;margin-top:4px}'
      + 'table{width:100%;border-collapse:collapse;margin:14px 0}'
      + 'td{padding:11px 32px;font-size:14px;border-top:1px solid #eef2f8}'
      + 'td.k{color:#6b7587;width:42%}td.v{text-align:right;font-weight:600;word-break:break-all}'
      + '.foot{padding:18px 32px 26px;color:#8a93a5;font-size:12px;display:flex;justify-content:space-between;border-top:1px solid #eef2f8}'
      + '@media print{body{padding:0}.doc{border:none;border-radius:0;max-width:none}}'
      + '</style></head><body><div class="doc">'
      + '<div class="top"><div class="brand">notelegram<span>.com</span></div><div class="badge">' + status + (ok ? ' ✓' : '') + '</div></div>'
      + '<div class="amt"><div class="ton">' + paidTon + ' TON</div><div class="fiat">≈ $' + usd + ' · ₽' + rub + '</div></div>'
      + '<table>' + rows.map((row) => '<tr><td class="k">' + esc(row[0]) + '</td><td class="v">' + esc(row[1]) + '</td></tr>').join('') + '</table>'
      + '<div class="foot"><span>' + (r ? 'Поддержка' : 'Support') + ': t.me/NoTelegramSupport</span><span>notelegram.com</span></div>'
      + '</div><scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();},250);}</scr' + 'ipt></body></html>';
  }
  function downloadReceiptPDF() {
    const w = window.open('', '_blank');
    if (!w) { downloadReceipt(); return; }      // popup blocked — fall back to .txt
    w.document.open(); w.document.write(receiptHtml()); w.document.close();
  }

  function init() {
    // The app navigates to the receipt step and calls AWM_startVerify itself,
    // so we don't auto-start on the Pay click here (avoids a double start).
    const recheck = byId('verifyRecheck');
    if (recheck) recheck.addEventListener('click', () => { if (!ctx) ctx = window.AWM_paymentContext; show(); pollOnce(); });
    const dl = byId('vrDownload');
    if (dl) dl.addEventListener('click', downloadReceiptPDF);
    window.AWM_resetVerify = reset;
    window.AWM_startVerify = start;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
