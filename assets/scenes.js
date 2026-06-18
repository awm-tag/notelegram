/* =========================================================
   AWM // PAY — scenes.js  (optimised)
   Per-service ambient background. Each service paints its OWN distinct design
   on a single <canvas>, tinted by the active accent colour:
     • stars   — constellation network (points + proximity links)
     • premium — luxe aurora ribbons of light + sparkles
     • deal    — transfer lanes: packets flow between two endpoints
     • mint    — blockchain: a username minted block-by-block down a chain
     • boost   — ascending area chart + rising arrows
     • custom  — calm bokeh orbs + flying circles
   Performance: device-pixel-ratio is capped, the loop is frame-limited, and all
   node glows are pre-rendered to sprite canvases (no per-frame gradients or
   shadowBlur). Honours reduced-motion. The motif cross-fades on service change.
   ========================================================= */
(function () {
  'use strict';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;
  let host = null, current = null;

  function ensureHost() {
    if (host && document.body.contains(host)) return host;
    host = document.getElementById('bgScene');
    if (!host) {
      host = document.createElement('div');
      host.id = 'bgScene';
      host.className = 'bg-scene';
      host.setAttribute('aria-hidden', 'true');
      const ref = document.getElementById('bgShapes');
      if (ref && ref.parentNode) ref.parentNode.insertBefore(host, ref.nextSibling);
      else document.body.insertBefore(host, document.body.firstChild);
    }
    return host;
  }

  // A motif element built from an icon sprite symbol (used by the swipe burst).
  function useIcon(id) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    const use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#' + id);
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Pre-rendered radial glow sprite — drawImage of this is far cheaper than
  // building a gradient every frame.
  function makeSprite(acc, mode) {
    const s = 64, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    if (mode === 'white') {
      grd.addColorStop(0, 'rgba(255,255,255,0.98)');
      grd.addColorStop(0.35, `rgba(${acc},0.78)`);
      grd.addColorStop(1, `rgba(${acc},0)`);
    } else {
      grd.addColorStop(0, `rgba(${acc},1)`);
      grd.addColorStop(0.42, `rgba(${acc},0.42)`);
      grd.addColorStop(1, `rgba(${acc},0)`);
    }
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    return c;
  }

  // ---- Shared, performance-minded canvas scaffold ----------------------------
  // init(W,H,acc) → state (may expose state.resize / state.recolor).
  // frame(ctx,W,H,acc,state) draws ONE frame. fps caps the redraw rate.
  function canvasScene(init, frame, fps) {
    const cv = document.createElement('canvas');
    cv.className = 'sc-canvas';
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, raf = 0, state = null, last = 0, acc = '120,170,255', accT = 0;
    let shakeAmt = 0;
    const interval = 1000 / (fps || 32);
    function readAccent() {
      const s = getComputedStyle(ensureHost()).getPropertyValue('--accent-rgb').trim();
      return s || '120,170,255';
    }
    function size() {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);    // cap DPR → mobile-safe
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (state && state.resize) state.resize(W, H, acc);
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!cv.isConnected) { cancelAnimationFrame(raf); cleanup(); return; }
      if (document.hidden) return;
      if (now - last < interval) return;                    // frame-limit
      last = now;
      if ((accT++ % 24) === 0) {
        const a = readAccent();
        if (a !== acc) { acc = a; if (state && state.recolor) state.recolor(acc); }
      }
      frame(ctx, W, H, acc, state);
      // smooth GPU-cheap camera shake (scenes call state.shake(amt) on impacts)
      if (shakeAmt > 0.15) {
        const dx = (Math.random() * 2 - 1) * shakeAmt, dy = (Math.random() * 2 - 1) * shakeAmt;
        const rot = (Math.random() * 2 - 1) * shakeAmt * 0.12;
        cv.style.transform = `scale(1.045) translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
        shakeAmt *= 0.86;
      } else if (shakeAmt !== 0) { shakeAmt = 0; cv.style.transform = 'scale(1.045)'; }
    }
    function onResize() { size(); }
    function cleanup() { window.removeEventListener('resize', onResize); }
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => {
      size(); acc = readAccent();
      state = init(W, H, acc);
      if (state) state.shake = (a) => { shakeAmt = Math.min(16, shakeAmt + a); };
      if (state && state.recolor) state.recolor(acc);
      cv.style.willChange = 'transform'; cv.style.transform = 'scale(1.045)';
      raf = requestAnimationFrame(loop);
    });
    return cv;
  }

  // 1) STARS — constellation network: glowing points drift & wrap the edges,
  //    lines appear between nearby points, occasional signal pulses fire.
  function starsScene() {
    let gAcc = null, gWhite = null;
    return canvasScene((W, H) => {
      const nodes = [];
      for (let i = 0; i < 210; i++) nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4),
        r: Math.random() < 0.2 ? rand(2.8, 4.4) : rand(1.2, 2.6),
        tw: Math.random() * TAU, ts: rand(1.2, 2.6), wander: Math.random() * TAU,
        hue: Math.random() < 0.22 ? ['255,225,150', '150,205,255', '255,170,210'][(Math.random() * 3) | 0] : null
      });
      return { nodes, pulses: [], recolor(a) { gAcc = makeSprite(a, 'acc'); gWhite = makeSprite(a, 'white'); } };
    }, (ctx, W, H, acc, st) => {
      ctx.clearRect(0, 0, W, H);
      const ns = st.nodes, reach = 150, reach2 = reach * reach;
      for (const n of ns) {
        n.wander += rand(-0.25, 0.25);
        n.vx += Math.cos(n.wander) * 0.005; n.vy += Math.sin(n.wander) * 0.005;
        n.vx *= 0.97; n.vy *= 0.97;
        const sp = Math.hypot(n.vx, n.vy); if (sp > 1) { n.vx /= sp; n.vy /= sp; }
        n.x += n.vx; n.y += n.vy; n.tw += 0.016 * n.ts;
        const m = 6;
        if (n.x < -m) n.x = W + m; else if (n.x > W + m) n.x = -m;
        if (n.y < -m) n.y = H + m; else if (n.y > H + m) n.y = -m;
      }
      ctx.lineWidth = 1;
      const links = [];
      for (let i = 0; i < ns.length; i++) {
        const a = ns[i];
        for (let j = i + 1; j < ns.length; j++) {
          const b = ns[j];
          const dx = b.x - a.x; if (dx > reach || dx < -reach) continue;
          const dy = b.y - a.y; if (dy > reach || dy < -reach) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach2) {
            const s = 1 - Math.sqrt(d2) / reach;
            ctx.strokeStyle = `rgba(${acc},${(s * 0.32).toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            links.push(a, b);
          }
        }
      }
      if (links.length && Math.random() < 0.04) {
        const k = ((Math.random() * links.length / 2) | 0) * 2;
        st.pulses.push({ a: links[k], b: links[k + 1], t: 0, sp: rand(0.02, 0.035) });
      }
      for (let i = st.pulses.length - 1; i >= 0; i--) {
        const p = st.pulses[i]; p.t += p.sp;
        if (p.t >= 1) { st.pulses.splice(i, 1); continue; }
        const e = p.t < 0.5 ? p.t * 2 : (1 - p.t) * 2;
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t, sz = 13 * e + 4;
        ctx.globalAlpha = e; ctx.drawImage(gWhite, x - sz / 2, y - sz / 2, sz, sz); ctx.globalAlpha = 1;
      }
      for (const n of ns) {
        const tw = 0.6 + 0.4 * Math.sin(n.tw), rr = n.r * 4.3 * (0.85 + 0.32 * tw);
        ctx.globalAlpha = Math.min(1, tw + 0.15); ctx.drawImage(gAcc, n.x - rr, n.y - rr, rr * 2, rr * 2); ctx.globalAlpha = 1;
        if (n.hue) {   // colored stars: a soft tinted halo over the accent glow
          ctx.globalAlpha = Math.min(0.7, tw); ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rr * 0.8);
          g.addColorStop(0, `rgba(${n.hue},0.8)`); g.addColorStop(1, `rgba(${n.hue},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, rr * 0.8, 0, TAU); ctx.fill();
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }
        ctx.fillStyle = `rgba(255,255,255,${(0.95 * tw).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 0.7, 0, TAU); ctx.fill();
      }
    });
  }

  // Shared 3D helper: rotate a point (Y then X) and apply light perspective.
  function proj3(v, ry, rx, cx, cy, scale) {
    const cyr = Math.cos(ry), syr = Math.sin(ry);
    let x = v.x * cyr - v.z * syr, z = v.x * syr + v.z * cyr, y = v.y;
    const cxr = Math.cos(rx), sxr = Math.sin(rx);
    let y2 = y * cxr - z * sxr, z2 = y * sxr + z * cxr;
    const d = 1 + z2 * 0.32;                 // depth → scale & brightness
    return { x: cx + x * scale * d, y: cy + y2 * scale * d, d };
  }

  // Techno-blueprint backdrop — drawn behind a hero shape. Two distinct layouts.
  // `kind`: 'hex' (premium — concentric hex rings + radial spokes + scan ticks)
  //         'grid' (deal — perspective grid floor + node crosses + data ribbons)
  function technoBackdrop(ctx, W, H, acc, t, kind) {
    ctx.save();
    if (kind === 'hex') {
      const cx = W / 2, cy = H * 0.42;
      // radial spokes
      ctx.strokeStyle = `rgba(${acc},0.05)`; ctx.lineWidth = 1;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * TAU + t * 0.0008;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * W, cy + Math.sin(a) * H); ctx.stroke();
      }
      // concentric hexagon rings, slowly rotating + breathing
      const maxR = Math.hypot(W, H) * 0.6;
      for (let r = 60; r < maxR; r += 78) {
        const rot = t * 0.0011 + r * 0.004;
        const rr = r + Math.sin(t * 0.02 + r * 0.01) * 6;
        ctx.strokeStyle = `rgba(${acc},${(0.10 - r / maxR * 0.06).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const a = rot + (k / 6) * TAU;
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // sweeping scan line
      const sa = t * 0.012;
      const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(sa) * maxR, cy + Math.sin(sa) * maxR);
      g.addColorStop(0, `rgba(${acc},0.18)`); g.addColorStop(1, `rgba(${acc},0)`);
      ctx.strokeStyle = g; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sa) * maxR, cy + Math.sin(sa) * maxR); ctx.stroke();
      // corner ticks
      ctx.fillStyle = `rgba(${acc},0.4)`;
      ctx.font = '10px JetBrains Mono, monospace'; ctx.textBaseline = 'top';
      ctx.globalAlpha = 0.5;
      ctx.fillText('TG · PREMIUM', 16, 16);
      ctx.textAlign = 'right'; ctx.fillText('NODES ' + (40 + Math.floor(Math.sin(t * 0.05) * 4)), W - 16, 16);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    } else {
      // 'grid' — perspective floor receding to a horizon, scanning verticals
      const hy = H * 0.36;
      ctx.strokeStyle = `rgba(${acc},0.06)`; ctx.lineWidth = 1;
      // horizontal receding lines
      for (let i = 0; i < 16; i++) {
        const p = i / 16, y = hy + (H - hy) * (p * p);
        ctx.globalAlpha = 0.7 - p * 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // converging verticals
      const vanish = W / 2 + Math.sin(t * 0.005) * W * 0.12;
      for (let i = -10; i <= 10; i++) {
        const xb = W / 2 + i * (W / 14);
        ctx.strokeStyle = `rgba(${acc},0.05)`;
        ctx.beginPath(); ctx.moveTo(xb, H); ctx.lineTo(vanish, hy); ctx.stroke();
      }
      // upper data ribbons (flat techno waves, not a chart)
      for (let r = 0; r < 3; r++) {
        const yb = hy * (0.3 + 0.22 * r), amp = 8 + r * 5, ph = t * (0.01 + r * 0.004);
        ctx.strokeStyle = `rgba(${acc},${(0.12 - r * 0.03).toFixed(3)})`; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 14) {
          const y = yb + Math.sin(x / 90 + ph) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // moving scan column
      const sx = (t * 2.2) % W;
      const g = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
      g.addColorStop(0, `rgba(${acc},0)`); g.addColorStop(0.5, `rgba(${acc},0.10)`); g.addColorStop(1, `rgba(${acc},0)`);
      ctx.fillStyle = g; ctx.fillRect(sx - 30, hy, 60, H - hy);
      // HUD ticks
      ctx.fillStyle = `rgba(${acc},0.45)`; ctx.font = '10px JetBrains Mono, monospace';
      ctx.textBaseline = 'top'; ctx.globalAlpha = 0.5;
      ctx.fillText('ESCROW · SECURE', 16, 16);
      ctx.textAlign = 'right'; ctx.fillText('TX ' + ('0000' + (Math.floor(t) % 9999)).slice(-4), W - 16, 16);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // 2) PREMIUM — a 3D rotating brilliant-cut DIAMOND of glowing points: rainbow
  //    facet shimmer, slow prismatic light rays, and a premium sparkle field.
  //    Rich and luxe, smooth, frame-limited. (function name kept for the map.)
  function crownScene() {
    const PUR = '180,120,255', PINK = '240,135,228', GOLD2 = '255,200,128', CYAN = '150,210,255', HOT = '255,240,255';
    const RAY = [PUR, PINK, GOLD2, CYAN];
    let gPur = null, gPink = null, gGold2 = null, gCyan = null, gHot = null;
    const sprites = () => [gPur, gPink, gGold2, gCyan];
    // brilliant-cut diamond: girdle ring + flat table octagon + bottom culet
    const V = [], E = [], facets = [];
    const N = 8, girdle = [], table = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * TAU, ca = Math.cos(a), sa = Math.sin(a);
      girdle.push(V.push({ x: ca, y: 0, z: sa }) - 1);
      table.push(V.push({ x: ca * 0.46, y: -0.52, z: sa * 0.46 }) - 1);
    }
    const culet = V.push({ x: 0, y: 0.96, z: 0 }) - 1;
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      E.push([girdle[i], girdle[j]], [table[i], table[j]], [girdle[i], table[i]], [girdle[j], table[i]], [girdle[i], culet]);
    }
    facets.push(...table, culet);
    return canvasScene((W, H) => {
      const stars = [];
      for (let i = 0; i < 60; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: rand(0.6, 2), tw: Math.random() * TAU, ts: rand(1, 2.4), hue: (Math.random() * 4) | 0, vy: rand(-0.12, -0.03) });
      return { ry: 0.3, t: 0, sparks: [], spark: 0, stars,
        recolor() { gPur = makeSprite(PUR, 'acc'); gPink = makeSprite(PINK, 'acc'); gGold2 = makeSprite(GOLD2, 'acc'); gCyan = makeSprite(CYAN, 'acc'); gHot = makeSprite(HOT, 'white'); } };
    }, (ctx, W, H, acc, st) => {
      st.t++; st.ry += 0.009;
      ctx.clearRect(0, 0, W, H);
      technoBackdrop(ctx, W, H, PUR, st.t, 'hex');
      const cx = W / 2, cy = H * 0.44, scale = Math.min(W, H) * 0.34, rx = -0.38;

      // premium sparkle field (multi-color, drifting up, wrapping)
      const sp = sprites();
      for (const s of st.stars) {
        s.tw += 0.03 * s.ts; s.y += s.vy;
        if (s.y < -6) { s.y = H + 6; s.x = Math.random() * W; }
        const a = 0.25 + 0.55 * Math.abs(Math.sin(s.tw)), sz = s.r * 3.2;
        ctx.globalAlpha = a; ctx.drawImage(sp[s.hue], s.x - sz, s.y - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
      }

      // prismatic light rays sweeping from the gem centre (rainbow dispersion)
      for (let i = 0; i < 8; i++) {
        const a = st.t * 0.003 + i / 8 * TAU, len = Math.min(W, H) * 0.7;
        const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len;
        const g = ctx.createLinearGradient(cx, cy, ex, ey);
        g.addColorStop(0, `rgba(${RAY[i % 4]},0.16)`); g.addColorStop(1, `rgba(${RAY[i % 4]},0)`);
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
      }

      const P = V.map(v => proj3(v, st.ry, rx, cx, cy, scale));
      // edges, hue cycling for prismatic sheen
      ctx.lineWidth = 1.2;
      for (let ei = 0; ei < E.length; ei++) {
        const [a, b] = E[ei], pa = P[a], pb = P[b], d = (pa.d + pb.d) / 2;
        const col = RAY[(ei + (st.t * 0.04 | 0)) % 4];
        ctx.strokeStyle = `rgba(${col},${Math.max(0.06, 0.1 + 0.26 * (d - 0.75)).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2, sz = 2.6 * d;
        ctx.globalAlpha = Math.max(0.16, 0.5 * (d - 0.4));
        ctx.drawImage(sp[(ei + 1) % 4], mx - sz, my - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
      }
      // vertices — bright glowing points, rainbow cycling
      for (let vi = 0; vi < P.length; vi++) {
        const p = P[vi], sz = (6.5 + 6 * (p.d - 0.75));
        ctx.globalAlpha = Math.max(0.3, Math.min(1, p.d - 0.12));
        ctx.drawImage(sp[vi % 4], p.x - sz, p.y - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
      }
      // facet cores (table + culet) — white twinkle
      for (let fi = 0; fi < facets.length; fi++) {
        const p = P[facets[fi]], tw = 0.6 + 0.4 * Math.sin(st.t * 0.08 + fi);
        ctx.fillStyle = `rgba(255,255,255,${(0.8 * tw * Math.max(0.3, p.d - 0.4)).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.6 * p.d, 0, TAU); ctx.fill();
      }
      // gentle prismatic sparkle burst (no jarring shake)
      st.spark--;
      if (st.spark <= 0) {
        st.spark = 44 + (Math.random() * 36 | 0);
        const p = P[facets[(Math.random() * facets.length) | 0]];
        for (let q = 0; q < 12; q++) { const a = Math.random() * TAU, v = rand(0.8, 3); st.sparks.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, hue: (Math.random() * 4) | 0 }); }
      }
      for (let i = st.sparks.length - 1; i >= 0; i--) {
        const s = st.sparks[i]; s.x += s.vx; s.y += s.vy; s.vx *= 0.92; s.vy *= 0.92; s.life -= 0.032;
        if (s.life <= 0) { st.sparks.splice(i, 1); continue; }
        const sz = 2 + 3 * s.life;
        ctx.globalAlpha = s.life; ctx.drawImage(sp[s.hue], s.x - sz, s.y - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
      }
    }, 32);
  }

  // 3) DEAL — 3-party escrow (GOLD/ORANGE): BUYER ▸ GUARANTOR ▸ SELLER arranged
  //    in a triangle, linked by a flowing mesh. Value-packets route buyer→
  //    guarantor→seller (and refunds back) in glowing arcs that burst & flash
  //    the receiving node. Orbit rings, dozens of gold motes, gentle impact.
  function dealScene() {
    const GOLD = '242,188,86', AMBER = '245,140,48', HOT = '255,236,200';
    let gGold = null, gAmber = null, gHot = null;
    return canvasScene((W, H) => {
      const motes = [];
      for (let i = 0; i < 80; i++) motes.push({
        x: Math.random() * W, y: Math.random() * H, vx: rand(-0.45, 0.45), vy: rand(-0.45, 0.45),
        r: rand(0.8, 2.6), tw: Math.random() * TAU, ts: rand(1, 2.6), kind: Math.random() < 0.5 ? 0 : 1
      });
      return { motes, shots: [], bursts: [], t: 0, fireT: 12,
        nodes: [
          { key: 'buy',  label: 'ПОКУПАТЕЛЬ', sub: 'BUYER',     flash: 0 },
          { key: 'grt',  label: 'ГАРАНТ',     sub: 'GUARANTOR', flash: 0 },
          { key: 'sell', label: 'ПРОДАВЕЦ',   sub: 'SELLER',    flash: 0 }
        ],
        recolor() { gGold = makeSprite(GOLD, 'acc'); gAmber = makeSprite(AMBER, 'acc'); gHot = makeSprite(HOT, 'white'); } };
    }, (ctx, W, H, acc, st) => {
      st.t++;
      ctx.clearRect(0, 0, W, H);
      const termR = Math.min(W, H) * 0.04 + 13;
      // node positions: triangle — guarantor on top, buyer/seller below
      const pos = {
        buy:  { x: W * 0.16, y: H * 0.66 },
        grt:  { x: W * 0.50, y: H * 0.26 },
        sell: { x: W * 0.84, y: H * 0.66 }
      };
      st.nodes[0].p = pos.buy; st.nodes[1].p = pos.grt; st.nodes[2].p = pos.sell;

      // ── free-flying motes ──
      for (const m of st.motes) {
        m.x += m.vx; m.y += m.vy; m.tw += 0.03 * m.ts;
        const pad = 12;
        if (m.x < -pad) m.x = W + pad; else if (m.x > W + pad) m.x = -pad;
        if (m.y < -pad) m.y = H + pad; else if (m.y > H + pad) m.y = -pad;
        const a = 0.3 + 0.5 * Math.abs(Math.sin(m.tw)), sz = m.r * 3.4;
        ctx.globalAlpha = a; ctx.drawImage(m.kind ? gAmber : gGold, m.x - sz, m.y - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(255,244,222,${(0.7 * a).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 0.7, 0, TAU); ctx.fill();
      }

      // ── escrow mesh: 3 edges with flowing dashes ──
      const edges = [['buy', 'grt'], ['grt', 'sell'], ['buy', 'sell']];
      ctx.lineWidth = 1.2;
      for (const [a, b] of edges) {
        const pa = pos[a], pb = pos[b];
        ctx.strokeStyle = `rgba(${GOLD},0.14)`;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        // flowing dash spark along the edge
        const fl = (st.t * 0.01) % 1;
        for (let d = 0; d < 3; d++) {
          const t = (fl + d / 3) % 1;
          const x = pa.x + (pb.x - pa.x) * t, y = pa.y + (pb.y - pa.y) * t;
          ctx.globalAlpha = 0.5 * Math.sin(t * Math.PI); ctx.drawImage(gGold, x - 4, y - 4, 8, 8); ctx.globalAlpha = 1;
        }
      }

      // ── fire packets along the escrow route ──
      st.fireT--;
      if (st.fireT <= 0) {
        st.fireT = 22 + (Math.random() * 22 | 0);
        // weighted routes: buyer→guarantor, guarantor→seller, refunds back
        const routes = [['buy', 'grt'], ['grt', 'sell'], ['grt', 'buy'], ['sell', 'grt']];
        const r = routes[(Math.random() < 0.5 ? 0 : (Math.random() * routes.length | 0))];
        const from = pos[r[0]], to = pos[r[1]];
        const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2 - rand(40, 90);
        st.shots.push({ from, to, mx, my, t: 0, sp: rand(0.016, 0.026), sz: rand(5, 9), toKey: r[1] });
      }

      // ── projectiles: quadratic arc via control point ──
      for (let i = st.shots.length - 1; i >= 0; i--) {
        const s = st.shots[i]; s.t += s.sp;
        const at = (tt) => {
          const u = 1 - tt;
          return [u * u * s.from.x + 2 * u * tt * s.mx + tt * tt * s.to.x,
                  u * u * s.from.y + 2 * u * tt * s.my + tt * tt * s.to.y];
        };
        for (let k = 1; k <= 7; k++) {
          const tt = s.t - k * 0.03; if (tt < 0) break;
          const [tx, ty] = at(tt); const a = (1 - k / 8) * 0.5, sz = s.sz * (1 - k / 12) * 2.2;
          ctx.globalAlpha = a; ctx.drawImage(gAmber, tx - sz, ty - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
        }
        const [x, y] = at(Math.min(1, s.t)); const gs = s.sz * 3.4;
        ctx.drawImage(gHot, x - gs, y - gs, gs * 2, gs * 2);
        ctx.fillStyle = 'rgba(255,252,244,0.95)';
        ctx.beginPath(); ctx.arc(x, y, s.sz * 0.7, 0, TAU); ctx.fill();
        if (s.t >= 1) {
          const [ex, ey] = at(1);
          for (let q = 0; q < 14; q++) { const a = Math.random() * TAU, v = rand(1, 3.6); st.bursts.push({ x: ex, y: ey, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 }); }
          const node = st.nodes.find(n => n.key === s.toKey); if (node) node.flash = 1;
          if (st.shake) st.shake(2.2);
          st.shots.splice(i, 1);
        }
      }

      // ── bursts ──
      for (let i = st.bursts.length - 1; i >= 0; i--) {
        const p = st.bursts[i]; p.x += p.vx; p.y += p.vy; p.vx *= 0.9; p.vy *= 0.9; p.life -= 0.035;
        if (p.life <= 0) { st.bursts.splice(i, 1); continue; }
        const sz = (2 + 3 * p.life);
        ctx.globalAlpha = p.life; ctx.drawImage(gGold, p.x - sz, p.y - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
      }

      // ── three nodes with hex rings, orbit dots, labels ──
      ctx.textAlign = 'center';
      for (const n of st.nodes) {
        n.flash *= 0.88;
        const P = n.p, pulse = 0.7 + 0.3 * Math.sin(st.t * 0.06 + (n.key === 'grt' ? 1 : 0)) + n.flash * 0.8;
        const r = termR * (0.82 + 0.12 * pulse), halo = r * 2.6 * (1 + n.flash * 0.5);
        ctx.globalAlpha = Math.min(1, 0.5 + n.flash); ctx.drawImage(gGold, P.x - halo, P.y - halo, halo * 2, halo * 2); ctx.globalAlpha = 1;
        // hex ring
        ctx.strokeStyle = `rgba(${HOT},${(0.45 + 0.4 * pulse).toFixed(3)})`; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) { const a = st.t * 0.012 + k / 6 * TAU; const px = P.x + Math.cos(a) * r, py = P.y + Math.sin(a) * r; if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
        ctx.closePath(); ctx.stroke();
        // orbit dots
        for (let k = 0; k < 4; k++) {
          const a = -st.t * 0.03 + k / 4 * TAU, ox = P.x + Math.cos(a) * r * 1.35, oy = P.y + Math.sin(a) * r * 1.35;
          ctx.drawImage(gGold, ox - 4, oy - 4, 8, 8);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(P.x, P.y, 4 + n.flash * 3, 0, TAU); ctx.fill();
        // labels (RU above, role below)
        ctx.fillStyle = `rgba(${HOT},0.85)`; ctx.font = '700 11px JetBrains Mono, monospace'; ctx.textBaseline = 'bottom';
        ctx.fillText(n.label, P.x, P.y - r - 8);
        ctx.fillStyle = `rgba(${GOLD},0.5)`; ctx.font = '9px JetBrains Mono, monospace'; ctx.textBaseline = 'top';
        ctx.fillText(n.sub, P.x, P.y + r + 6);
      }
    }, 50);
  }

  // 4) MINT — blockchain: a username is committed block-by-block down a chain.
  //    A mint head travels the chain; passed blocks confirm (light up + ◆).
  function mintScene() {
    let gAcc = null, gWhite = null;
    const st = { blocks: [], n: 0 };
    st.build = (W, H) => {
      const n = Math.max(6, Math.round(W / 95));
      st.blocks = [];
      const gap = W / (n - 1);
      for (let i = 0; i < n; i++) st.blocks.push({ x: i * gap, y: H * 0.5 + Math.sin(i * 1.25) * Math.min(60, H * 0.16), seed: Math.random() * TAU });
      st.n = n;
      // data particles streaming vertically into the chain (commit activity)
      st.parts = [];
      for (let i = 0; i < 95; i++) {
        const bi = (Math.random() * n) | 0;
        st.parts.push({ bi, side: Math.random() < 0.5 ? -1 : 1, off: rand(0, 1), sp: rand(0.004, 0.013), dist: rand(50, 170), x: 0, y: 0 });
      }
      // floating hash glyphs
      st.hash = [];
      for (let i = 0; i < 30; i++) st.hash.push({ x: Math.random() * W, y: Math.random() * H, vy: rand(-0.34, -0.1), tw: Math.random() * TAU, ts: rand(1, 2), ch: '01'[i % 2], sz: rand(8, 13) });
      // drifting ◆ glints in the depth
      st.glints = [];
      for (let i = 0; i < 16; i++) st.glints.push({ x: Math.random() * W, y: Math.random() * H, tw: Math.random() * TAU, ts: rand(0.8, 1.8), sz: rand(5, 11), vx: rand(-0.15, 0.15), vy: rand(-0.12, 0.12), sp: Math.random() * TAU });
    };
    return canvasScene((W, H) => {
      st.build(W, H);
      st.resize = (W, H) => st.build(W, H);
      st.recolor = (a) => { gAcc = makeSprite(a, 'acc'); gWhite = makeSprite(a, 'white'); };
      st.t = 0;
      return st;
    }, (ctx, W, H, acc, s) => {
      s.t++;
      const cycle = s.n + 3;
      const prog = (s.t * 0.0095) % cycle;     // mint head position along the chain (gentle, smooth)
      ctx.clearRect(0, 0, W, H);
      // hashing glyphs drifting up (background processing)
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const hsh of s.hash) {
        hsh.y += hsh.vy; hsh.tw += 0.04 * hsh.ts;
        if (hsh.y < -10) { hsh.y = H + 10; hsh.x = Math.random() * W; }
        if (Math.random() < 0.02) hsh.ch = '01'[(Math.random() * 2) | 0];
        ctx.globalAlpha = 0.12 + 0.16 * Math.abs(Math.sin(hsh.tw));
        ctx.fillStyle = `rgba(${acc},1)`; ctx.font = `${hsh.sz | 0}px JetBrains Mono, monospace`;
        ctx.fillText(hsh.ch, hsh.x, hsh.y);
      }
      ctx.globalAlpha = 1;
      // drifting ◆ glints (depth + sparkle)
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const g of s.glints) {
        g.x += g.vx; g.y += g.vy; g.tw += 0.03 * g.ts; g.sp += 0.02;
        if (g.x < -12) g.x = W + 12; else if (g.x > W + 12) g.x = -12;
        if (g.y < -12) g.y = H + 12; else if (g.y > H + 12) g.y = -12;
        const a = 0.1 + 0.18 * Math.abs(Math.sin(g.tw));
        ctx.globalAlpha = a; ctx.drawImage(gAcc, g.x - g.sz, g.y - g.sz, g.sz * 2, g.sz * 2);
        ctx.globalAlpha = a + 0.16; ctx.fillStyle = `rgba(${acc},1)`;
        ctx.font = `${(g.sz * 1.4) | 0}px JetBrains Mono, monospace`; ctx.fillText('◆', g.x, g.y);
      }
      ctx.globalAlpha = 1;
      // data particles streaming into their block (commit/transfer activity)
      for (const p of s.parts) {
        const blk = s.blocks[p.bi]; if (!blk) continue;
        p.off += p.sp; if (p.off > 1) p.off -= 1;
        const t = p.off, ease = 1 - (1 - t) * (1 - t);
        const x = blk.x, y = blk.y + p.side * p.dist * (1 - ease);
        const fade = Math.min(1, t * 3) * (1 - t);
        ctx.globalAlpha = 0.4 + 0.6 * fade;
        const sz = 4 + 3 * fade;
        ctx.drawImage(gAcc, x - sz, y - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
      }
      ctx.lineWidth = 1.4;
      for (let i = 0; i < s.blocks.length - 1; i++) {
        const a = s.blocks[i], b = s.blocks[i + 1];
        const lit = prog > i + 1 ? 0.6 : 0.18;
        ctx.strokeStyle = `rgba(${acc},${lit})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < s.blocks.length; i++) {
        const b = s.blocks[i];
        const confirmed = prog > i + 1;
        const head = Math.abs(prog - (i + 1)) < 0.5;
        if (confirmed || head) {
          const gg = 20 + (head ? 10 * Math.cos((prog - (i + 1)) * Math.PI) : 0);
          ctx.globalAlpha = head ? 1 : 0.6;
          ctx.drawImage(gAcc, b.x - gg, b.y - gg, gg * 2, gg * 2); ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = `rgba(${acc},${confirmed || head ? 1 : 0.5})`;
        ctx.lineWidth = 1.6; roundRect(ctx, b.x - 9, b.y - 9, 18, 18, 4); ctx.stroke();
        ctx.fillStyle = `rgba(${acc},${confirmed ? 1 : 0.45})`;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(confirmed ? '◆' : '·', b.x, b.y + 1);
      }
      const hi = Math.floor(prog);
      if (s.lastHi == null) s.lastHi = hi;
      if (hi > s.lastHi) s.lastHi = hi;   // (no shake — kept smooth)
      if (hi >= 1 && hi <= s.blocks.length - 1) {
        const a = s.blocks[hi - 1], b = s.blocks[hi], f = prog - hi;
        const x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
        // orbiting “minting” ring around the head — the NFT forming
        ctx.save(); ctx.translate(x, y);
        ctx.strokeStyle = `rgba(${acc},${(0.3 + 0.2 * Math.sin(s.t * 0.1)).toFixed(3)})`;
        ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke();
        for (let k = 0; k < 5; k++) {
          const a2 = s.t * 0.05 + k / 5 * TAU;
          const ox = Math.cos(a2) * 22, oy = Math.sin(a2) * 22;
          ctx.drawImage(gAcc, ox - 4, oy - 4, 8, 8);
        }
        ctx.restore();
        ctx.drawImage(gWhite, x - 12, y - 12, 24, 24);
      }
    }, 30);
  }

  // 5) BOOST — a live crypto-trading backdrop: scrolling green/red candlesticks,
  //    a fast "beating" EMA line, volume bars, a grid, and floating ▲/▼ tickers.
  //    Dense & intense but ultra-smooth: sub-candle scroll, frame-limited, light
  //    fills so it stays a BACKGROUND (never competes with the foreground card).
  function boostScene() {
    const UP = '56,210,160', DN = '240,96,116';     // crypto green / red
    const st = { candles: [], ema: [], scroll: 0, t: 0, cw: 16, tickers: [] };
    function pushCandle() {
      const prev = st.candles.length ? st.candles[st.candles.length - 1].c : 0.5;
      const drift = 0.006;                            // gentle upward bias (boost)
      let c = prev + rand(-0.06, 0.06) + drift;
      c = Math.max(0.12, Math.min(0.9, c));
      const o = prev;
      const hi = Math.max(o, c) + rand(0.005, 0.05);
      const lo = Math.min(o, c) - rand(0.005, 0.05);
      st.candles.push({ o, c, h: hi, l: lo, v: rand(0.2, 1) });
      // EMA(period 8)
      const k = 2 / (8 + 1), prevE = st.ema.length ? st.ema[st.ema.length - 1] : c;
      st.ema.push(c * k + prevE * (1 - k));
    }
    return canvasScene((W, H) => {
      st.cw = Math.max(9, Math.round(W / 38));
      const need = Math.ceil(W / st.cw) + 3;
      st.candles = []; st.ema = [];
      for (let i = 0; i < need; i++) pushCandle();
      st.tickers = [];
      for (let i = 0; i < 11; i++) st.tickers.push({ x: Math.random() * W, y: Math.random() * H, vy: rand(0.25, 0.9), up: Math.random() < 0.62, val: rand(0.1, 9.9), sz: rand(9, 15), op: rand(0.14, 0.34) });
      st.resize = (w) => { st.cw = Math.max(9, Math.round(w / 38)); };
      return st;
    }, (ctx, W, H, acc, s) => {
      s.t++;
      ctx.clearRect(0, 0, W, H);
      const top = H * 0.08, bot = H * 0.82, span = bot - top;
      const Y = (v) => bot - v * span;                // value 0..1 → y

      // faint grid (horizontal + vertical), scrolls with the candles
      ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${acc},0.06)`;
      for (let i = 0; i <= 4; i++) { const y = top + (span / 4) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      const gridStep = s.cw * 4;
      for (let gx = -((s.scroll) % gridStep); gx < W; gx += gridStep) { ctx.beginPath(); ctx.moveTo(gx, top); ctx.lineTo(gx, H); ctx.stroke(); }

      // scroll: advance, shift a candle in when we pass one cell
      s.scroll += s.cw * 0.035;
      while (s.scroll >= s.cw) { s.scroll -= s.cw; s.candles.shift(); s.ema.shift(); pushCandle(); }
      const off = s.scroll;
      const n = s.candles.length;
      const bw = Math.max(3, s.cw * 0.62);

      // volume bars (bottom)
      const vTop = bot + 6, vH = H - bot - 10;
      for (let i = 0; i < n; i++) {
        const cd = s.candles[i]; const x = i * s.cw - off;
        const up = cd.c >= cd.o;
        ctx.fillStyle = `rgba(${up ? UP : DN},0.22)`;
        const h = Math.max(1, cd.v * vH);
        ctx.fillRect(x - bw / 2, vTop + (vH - h), bw, h);
      }

      // candlesticks
      for (let i = 0; i < n; i++) {
        const cd = s.candles[i]; const x = i * s.cw - off;
        const up = cd.c >= cd.o, col = up ? UP : DN;
        ctx.strokeStyle = `rgba(${col},0.62)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, Y(cd.h)); ctx.lineTo(x, Y(cd.l)); ctx.stroke();
        const yO = Y(cd.o), yC = Y(cd.c);
        ctx.fillStyle = `rgba(${col},0.5)`;
        ctx.fillRect(x - bw / 2, Math.min(yO, yC), bw, Math.max(2, Math.abs(yC - yO)));
      }

      // EMA line — a clean, smooth curve (quadratic midpoints), no per-frame
      // jitter so it glides instead of vibrating.
      ctx.beginPath();
      let px = -off, py = Y(s.ema[0]);
      ctx.moveTo(px, py);
      for (let i = 1; i < n; i++) {
        const x = i * s.cw - off, y = Y(s.ema[i]);
        ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
        px = x; py = y;
      }
      ctx.lineTo(px, py);
      ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.stroke();
      // glowing head dot at the latest EMA point
      const hx = (n - 1) * s.cw - off, hy = Y(s.ema[n - 1]);
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 10);
      g.addColorStop(0, `rgba(255,255,255,0.9)`); g.addColorStop(0.4, `rgba(${acc},0.6)`); g.addColorStop(1, `rgba(${acc},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, TAU); ctx.fill();

      // floating ▲/▼ % tickers
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const tk of s.tickers) {
        tk.y -= tk.vy; if (tk.y < -12) { tk.y = H + 12; tk.x = Math.random() * W; tk.up = Math.random() < 0.62; tk.val = rand(0.1, 9.9); }
        ctx.globalAlpha = tk.op; ctx.fillStyle = `rgba(${tk.up ? UP : DN},1)`;
        ctx.font = `${tk.sz | 0}px JetBrains Mono, monospace`;
        ctx.fillText(`${tk.up ? '▲' : '▼'}${tk.val.toFixed(1)}%`, tk.x, tk.y);
      }
      ctx.globalAlpha = 1;
    });
  }

  // 6) CUSTOM (товары/услуги) — many different-sized soft circles drifting, each
  //    orbited by little glowing dots (coins of value circling each payment).
  function orbsScene() {
    let gAcc = null, gWhite = null;
    return canvasScene((W, H) => {
      const orbs = [];
      // even spread: jittered grid of cells so circles cover the whole frame
      const cols = 5, rows = 4;
      for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
        const cw = W / cols, ch = H / rows;
        const r = rand(24, 70);
        const dots = [];
        const dn = 2 + Math.round(r / 28);
        for (let k = 0; k < dn; k++) dots.push({ a: Math.random() * TAU, sp: rand(0.006, 0.015) * (Math.random() < 0.5 ? 1 : -1), rr: r * rand(1.12, 1.5), sz: rand(1.4, 2.6), tw: Math.random() * TAU });
        orbs.push({
          x: cw * (gx + 0.5) + rand(-cw * 0.28, cw * 0.28),
          y: ch * (gy + 0.5) + rand(-ch * 0.28, ch * 0.28),
          r, vx: rand(-0.12, 0.12), vy: rand(-0.1, 0.1), op: rand(0.06, 0.13),
          ph: Math.random() * TAU, ps: rand(0.004, 0.01), dots
        });
      }
      // ambient even dust for uniform sparkle coverage
      const dust = [];
      for (let i = 0; i < 60; i++) dust.push({ x: Math.random() * W, y: Math.random() * H, r: rand(0.7, 1.8), tw: Math.random() * TAU, ts: rand(1, 2.2), vx: rand(-0.1, 0.1), vy: rand(-0.1, 0.1) });
      return { orbs, dust, t: 0, recolor(a) { gAcc = makeSprite(a, 'acc'); gWhite = makeSprite(a, 'white'); } };
    }, (ctx, W, H, acc, st) => {
      ctx.clearRect(0, 0, W, H);
      st.t++;
      // ambient dust (even coverage)
      for (const d of st.dust) {
        d.tw += 0.02 * d.ts; d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; else if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; else if (d.y > H) d.y = 0;
        const a = 0.18 + 0.32 * Math.abs(Math.sin(d.tw)), sz = d.r * 3;
        ctx.globalAlpha = a; ctx.drawImage(gAcc, d.x - sz, d.y - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
      }
      // soft connecting mesh between nearby orbs (even, web-like)
      ctx.lineWidth = 1;
      for (let i = 0; i < st.orbs.length; i++) for (let j = i + 1; j < st.orbs.length; j++) {
        const a = st.orbs[i], b = st.orbs[j], dx = a.x - b.x, dy = a.y - b.y, dist = Math.hypot(dx, dy);
        if (dist < W / 4) { ctx.strokeStyle = `rgba(${acc},${((1 - dist / (W / 4)) * 0.06).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (const o of st.orbs) {
        o.ph += o.ps; o.x += o.vx; o.y += o.vy;
        const m = o.r + 30;
        if (o.x < -m) o.x = W + m; else if (o.x > W + m) o.x = -m;
        if (o.y < -m) o.y = H + m; else if (o.y > H + m) o.y = -m;
        const pr = o.r * (0.92 + 0.08 * Math.sin(o.ph));
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, pr);
        g.addColorStop(0, `rgba(${acc},${o.op})`);
        g.addColorStop(0.7, `rgba(${acc},${(o.op * 0.4).toFixed(3)})`);
        g.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, pr, 0, TAU); ctx.fill();
        ctx.strokeStyle = `rgba(${acc},${(o.op * 1.8 + 0.05).toFixed(3)})`;
        ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(o.x, o.y, pr, 0, TAU); ctx.stroke();
        for (const d of o.dots) {
          d.a += d.sp; d.tw += 0.05;
          const dx = o.x + Math.cos(d.a) * d.rr, dy = o.y + Math.sin(d.a) * d.rr * 0.6;
          const tw = 0.6 + 0.4 * Math.sin(d.tw), sz = d.sz * 3.2 * tw;
          ctx.globalAlpha = 0.5 + 0.4 * tw;
          ctx.drawImage(gAcc, dx - sz, dy - sz, sz * 2, sz * 2); ctx.globalAlpha = 1;
          ctx.fillStyle = `rgba(255,255,255,${(0.8 * tw).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(dx, dy, d.sz * 0.7, 0, TAU); ctx.fill();
        }
      }
    }, 40);
  }

  const SCENES = {
    stars:   () => starsScene(),
    premium: () => crownScene(),
    deal:    () => dealScene(),
    mint:    () => mintScene(),
    boost:   () => boostScene(),
    custom:  () => orbsScene()
  };

  function render(service, dir) {
    const changed = service !== current;
    current = service;
    const h = ensureHost();
    h.setAttribute('data-scene', service);
    ensureNebula();
    // cross-fade: fade out, swap, fade in. setTimeout (not rAF) so a swap still
    // completes if the tab is backgrounded mid-change.
    h.classList.add('is-swapping');
    clearTimeout(h._swapT);
    h._swapT = setTimeout(() => {
      if (service !== current) return;
      h.innerHTML = '';
      if (!reduce) {
        try {
          const build = SCENES[service] || SCENES.custom;
          h.appendChild(build());
        } catch (err) {
          console.error('[scene build]', service, err && err.message, err);
        }
      }
      clearTimeout(h._swapInT);
      h._swapInT = setTimeout(() => { if (service === current) h.classList.remove('is-swapping'); }, 30);
    }, 180);
    if (changed && !reduce) {
      h.classList.add('sc-rush');
      clearTimeout(h._rushT);
      h._rushT = setTimeout(() => h.classList.remove('sc-rush'), 1100);
    }
    if (changed && dir) burst(service, dir);
    if (changed && !reduce) hyperjump();
  }
  window.AWM_onServiceChange = render;

  // ---- NEBULA: persistent neon-smoke layer behind every scene ---------------
  // Big soft hue blobs drifting on sine paths, additively blended. Lives OUTSIDE
  // the host (so scene swaps never destroy it) and runs at a gentle 20 fps.
  let nebula = null;
  function ensureNebula() {
    if (nebula && nebula.isConnected) return;
    if (reduce) return;
    nebula = document.createElement('canvas');
    nebula.id = 'nebCanvas';
    nebula.setAttribute('aria-hidden', 'true');
    Object.assign(nebula.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '0', pointerEvents: 'none' });
    const h = ensureHost();
    h.parentNode.insertBefore(nebula, h);
    const ctx = nebula.getContext('2d');
    let W = 0, H = 0, last = 0, t = Math.random() * 1000;
    const HUES = ['130,80,255', '0,190,255', '255,90,200', '255,170,60'];
    const blobs = [];
    for (let i = 0; i < 4; i++) blobs.push({
      hue: i, baseR: rand(0.34, 0.5), spx: rand(0.00018, 0.0003), spy: rand(0.00013, 0.00025),
      phx: Math.random() * TAU, phy: Math.random() * TAU, op: rand(0.05, 0.085)
    });
    const size = () => {
      W = nebula.clientWidth; H = nebula.clientHeight;
      const d = 0.5;                                  // quarter-res — it's pure blur
      nebula.width = Math.max(2, Math.round(W * d)); nebula.height = Math.max(2, Math.round(H * d));
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    size();
    window.addEventListener('resize', size);
    const loop = (now) => {
      if (!nebula.isConnected) return;
      requestAnimationFrame(loop);
      if (document.hidden || now - last < 50) return;   // 20 fps
      last = now; t = now;
      // accent participates so the nebula always matches the active service
      const accStr = getComputedStyle(ensureHost()).getPropertyValue('--accent-rgb').trim() || '120,170,255';
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const hue = i === 0 ? accStr : HUES[(i + 1) % HUES.length];
        const x = W * (0.5 + 0.42 * Math.sin(t * b.spx + b.phx));
        const y = H * (0.5 + 0.4 * Math.cos(t * b.spy + b.phy));
        const r = Math.min(W, H) * b.baseR * (1 + 0.08 * Math.sin(t * 0.0004 + i));
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${hue},${b.op})`);
        g.addColorStop(0.6, `rgba(${hue},${(b.op * 0.4).toFixed(3)})`);
        g.addColorStop(1, `rgba(${hue},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    requestAnimationFrame(loop);
  }

  // ---- HYPERJUMP: one-shot radial light-streak burst on service switch ------
  function hyperjump() {
    const cv = document.createElement('canvas');
    Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '0', pointerEvents: 'none' });
    const h = ensureHost();
    h.parentNode.insertBefore(cv, h.nextSibling);
    const ctx = cv.getContext('2d');
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W; cv.height = H;
    const cx = W / 2, cy = H * 0.45;
    const accStr = getComputedStyle(h).getPropertyValue('--accent-rgb').trim() || '120,170,255';
    const streaks = [];
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * TAU;
      streaks.push({ a, r0: rand(20, 90), len: rand(60, 190), sp: rand(9, 20), w: rand(1, 2.6) });
    }
    const t0 = performance.now(), DUR = 620;
    const loop = (now) => {
      const t = (now - t0) / DUR;
      if (t >= 1) { cv.remove(); return; }
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      const fade = 1 - t;
      // centre flash
      const fr = 90 * (1 - t) + 30;
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
      fg.addColorStop(0, `rgba(255,255,255,${(0.30 * fade).toFixed(3)})`);
      fg.addColorStop(0.4, `rgba(${accStr},${(0.22 * fade).toFixed(3)})`);
      fg.addColorStop(1, `rgba(${accStr},0)`);
      ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, fr, 0, TAU); ctx.fill();
      // streaks racing outward
      ctx.lineCap = 'round';
      for (const s of streaks) {
        const r1 = s.r0 + s.sp * (t * DUR) * 0.14;
        const r2 = r1 + s.len * (0.4 + t);
        ctx.strokeStyle = `rgba(${accStr},${(0.5 * fade).toFixed(3)})`;
        ctx.lineWidth = s.w * fade + 0.3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1);
        ctx.lineTo(cx + Math.cos(s.a) * r2, cy + Math.sin(s.a) * r2);
        ctx.stroke();
      }
    };
    requestAnimationFrame(loop);
  }

  // One-shot flurry of the service's glyph, flying in the swipe direction.
  function burst(service, dir) {
    if (reduce) return;
    const h = ensureHost();
    const layer = document.createElement('div');
    layer.className = 'sc-burst';
    h.appendChild(layer);
    const goRight = dir === 'prev';
    const cfg = {
      stars:   { glyph: '★',  n: 20, rise: [60, 120], spin: 30, dur: [650, 1150] },
      premium: { icon: 'ico-premium', n: 13, rise: [80, 150], spin: 18, dur: [800, 1300] },
      deal:    { icon: 'ico-deal',    n: 12, rise: [40, 90],  spin: 24, dur: [850, 1300] },
      mint:    { icon: 'ico-mint',    n: 12, rise: [50, 100], spin: 40, dur: [800, 1300] },
      boost:   { glyph: '⌃', n: 16, rise: [90, 160], spin: 12, dur: [600, 1000] },
      custom:  { ring: true, n: 14, rise: [40, 90], spin: 0, dur: [700, 1200] }
    }[service] || { glyph: '★', n: 14, rise: [60, 120], spin: 24, dur: [700, 1200] };

    for (let i = 0; i < cfg.n; i++) {
      const p = document.createElement('span');
      p.className = 'sc-p';
      if (cfg.icon) { p.classList.add('sc-p-ico'); p.appendChild(useIcon(cfg.icon)); }
      else if (cfg.ring) { p.classList.add('sc-p-ring'); }
      else { p.textContent = cfg.glyph; }
      const sz = rand(14, 38);
      p.style.setProperty('--sz', Math.round(sz) + 'px');
      const startX = goRight ? rand(-8, 55) : rand(45, 108);
      const startY = rand(82, 116);
      p.style.left = startX + '%';
      p.style.top = startY + '%';
      layer.appendChild(p);
      const dx = (goRight ? 1 : -1) * rand(28, 70);
      const dy = -rand(cfg.rise[0], cfg.rise[1]) * 0.6;
      const dur = rand(cfg.dur[0], cfg.dur[1]);
      const delay = rand(0, 240);
      const rot = cfg.spin ? rand(-cfg.spin, cfg.spin) : 0;
      p.animate([
        { transform: 'translate(0,0) scale(.35) rotate(0deg)', opacity: 0 },
        { opacity: 0.95, offset: 0.18 },
        { opacity: 0.9, offset: 0.7 },
        { transform: `translate(${dx}vw, ${dy}vh) scale(1) rotate(${rot}deg)`, opacity: 0 }
      ], { duration: dur, delay, easing: 'cubic-bezier(.18,.7,.25,1)', fill: 'forwards' });
    }
    setTimeout(() => layer.remove(), 1700);
  }

  function init() {
    const svc = (window.AWM_getService && window.AWM_getService()) || 'custom';
    render(svc);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
