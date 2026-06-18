/* =========================================================
   AWM // PAY — qr.js
   Self-contained QR Code generator (no network, no deps).
   Port of Project Nayuki's QR Code generator (MIT). Trimmed to what
   we need: byte/alphanumeric/numeric auto-segmentation, ECC, masking,
   versions 1–40. Exposes window.AWM_QR.
   ========================================================= */
(function () {
  'use strict';

  // ---- Reed–Solomon over GF(256) ----
  function getModule(grid, x, y) { return grid[y][x]; }

  function QrCode(version, ecl, dataCodewords, mask) {
    this.version = version;
    this.size = version * 4 + 17;
    this.ecl = ecl;
    var size = this.size;
    var modules = [];
    var isFn = [];
    for (var i = 0; i < size; i++) { modules.push(new Array(size).fill(false)); isFn.push(new Array(size).fill(false)); }
    this.modules = modules; this.isFunction = isFn;

    drawFunctionPatterns(this);
    var allCodewords = addEccAndInterleave(this, dataCodewords);
    drawCodewords(this, allCodewords);

    if (mask === -1) {
      var minPenalty = Infinity;
      for (var m = 0; m < 8; m++) {
        applyMask(this, m); drawFormatBits(this, m);
        var penalty = getPenaltyScore(this);
        if (penalty < minPenalty) { mask = m; minPenalty = penalty; }
        applyMask(this, m);
      }
    }
    this.mask = mask;
    applyMask(this, mask);
    drawFormatBits(this, mask);
    this.isFunction = null;
  }

  // ECC level: { ordinal, formatBits }
  var ECC = {
    LOW:      { ordinal: 0, fb: 1 },
    MEDIUM:   { ordinal: 1, fb: 0 },
    QUARTILE: { ordinal: 2, fb: 3 },
    HIGH:     { ordinal: 3, fb: 2 }
  };

  var MIN_VERSION = 1, MAX_VERSION = 40;

  function setFunctionModule(qr, x, y, isDark) { qr.modules[y][x] = isDark; qr.isFunction[y][x] = true; }

  function drawFunctionPatterns(qr) {
    var size = qr.size;
    for (var i = 0; i < size; i++) {
      setFunctionModule(qr, 6, i, i % 2 === 0);
      setFunctionModule(qr, i, 6, i % 2 === 0);
    }
    drawFinderPattern(qr, 3, 3);
    drawFinderPattern(qr, size - 4, 3);
    drawFinderPattern(qr, 3, size - 4);

    var alignPos = getAlignmentPatternPositions(qr.version);
    var numAlign = alignPos.length;
    for (var a = 0; a < numAlign; a++) {
      for (var b = 0; b < numAlign; b++) {
        if (!(a === 0 && b === 0 || a === 0 && b === numAlign - 1 || a === numAlign - 1 && b === 0))
          drawAlignmentPattern(qr, alignPos[a], alignPos[b]);
      }
    }
    drawFormatBits(qr, 0);
    drawVersion(qr);
  }

  function drawFormatBits(qr, mask) {
    var data = qr.ecl.fb << 3 | mask;
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var bits = (data << 10 | rem) ^ 0x5412;
    var size = qr.size;
    for (var i = 0; i <= 5; i++) setFunctionModule(qr, 8, i, getBit(bits, i));
    setFunctionModule(qr, 8, 7, getBit(bits, 6));
    setFunctionModule(qr, 8, 8, getBit(bits, 7));
    setFunctionModule(qr, 7, 8, getBit(bits, 8));
    for (var i = 9; i < 15; i++) setFunctionModule(qr, 14 - i, 8, getBit(bits, i));
    for (var i = 0; i < 8; i++) setFunctionModule(qr, size - 1 - i, 8, getBit(bits, i));
    for (var i = 8; i < 15; i++) setFunctionModule(qr, 8, size - 15 + i, getBit(bits, i));
    setFunctionModule(qr, 8, size - 8, true);
  }

  function drawVersion(qr) {
    if (qr.version < 7) return;
    var rem = qr.version;
    for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    var bits = qr.version << 12 | rem;
    for (var i = 0; i < 18; i++) {
      var bit = getBit(bits, i);
      var a = qr.size - 11 + i % 3, b = Math.floor(i / 3);
      setFunctionModule(qr, a, b, bit);
      setFunctionModule(qr, b, a, bit);
    }
  }

  function drawFinderPattern(qr, x, y) {
    for (var dy = -4; dy <= 4; dy++) {
      for (var dx = -4; dx <= 4; dx++) {
        var dist = Math.max(Math.abs(dx), Math.abs(dy));
        var xx = x + dx, yy = y + dy;
        if (0 <= xx && xx < qr.size && 0 <= yy && yy < qr.size)
          setFunctionModule(qr, xx, yy, dist !== 2 && dist !== 4);
      }
    }
  }

  function drawAlignmentPattern(qr, x, y) {
    for (var dy = -2; dy <= 2; dy++)
      for (var dx = -2; dx <= 2; dx++)
        setFunctionModule(qr, x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }

  function getAlignmentPatternPositions(version) {
    if (version === 1) return [];
    var numAlign = Math.floor(version / 7) + 2;
    var step = (version === 32) ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var result = [6];
    for (var pos = version * 4 + 10; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  // ---- ECC tables ----
  var ECC_CODEWORDS_PER_BLOCK = [
    [-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
    [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
    [-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
    [-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]
  ];
  var NUM_ERROR_CORRECTION_BLOCKS = [
    [-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
    [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],
    [-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],
    [-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]
  ];

  function getNumRawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }
  function getNumDataCodewords(ver, ecl) {
    return Math.floor(getNumRawDataModules(ver) / 8) -
      ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
  }

  function reedSolomonComputeDivisor(degree) {
    var result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    var root = 1;
    for (var i = 0; i < degree; i++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = reedSolomonMultiply(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = reedSolomonMultiply(root, 0x02);
    }
    return result;
  }
  function reedSolomonComputeRemainder(data, divisor) {
    var result = new Array(divisor.length).fill(0);
    data.forEach(function (b) {
      var factor = b ^ result.shift();
      result.push(0);
      divisor.forEach(function (coef, i) { result[i] ^= reedSolomonMultiply(coef, factor); });
    });
    return result;
  }
  function reedSolomonMultiply(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xFF;
  }

  function addEccAndInterleave(qr, data) {
    var ver = qr.version, ecl = qr.ecl;
    var numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
    var blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
    var rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
    var numShortBlocks = numBlocks - rawCodewords % numBlocks;
    var shortBlockLen = Math.floor(rawCodewords / numBlocks);
    var blocks = [];
    var rsDiv = reedSolomonComputeDivisor(blockEccLen);
    for (var i = 0, k = 0; i < numBlocks; i++) {
      var dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
      k += dat.length;
      var ecc = reedSolomonComputeRemainder(dat, rsDiv);
      if (i < numShortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var result = [];
    for (var i = 0; i < blocks[0].length; i++) {
      for (var j = 0; j < blocks.length; j++) {
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(blocks[j][i]);
      }
    }
    return result;
  }

  function drawCodewords(qr, data) {
    var size = qr.size, i = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (!qr.isFunction[y][x] && i < data.length * 8) {
            qr.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }

  function applyMask(qr, mask) {
    for (var y = 0; y < qr.size; y++) {
      for (var x = 0; x < qr.size; x++) {
        var invert;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = x * y % 2 + x * y % 3 === 0; break;
          case 6: invert = (x * y % 2 + x * y % 3) % 2 === 0; break;
          case 7: invert = ((x + y) % 2 + x * y % 3) % 2 === 0; break;
        }
        if (!qr.isFunction[y][x] && invert) qr.modules[y][x] = !qr.modules[y][x];
      }
    }
  }

  function getPenaltyScore(qr) {
    var size = qr.size, result = 0;
    var modules = qr.modules;
    for (var y = 0; y < size; y++) {
      var runColor = false, runX = 0, runHistory = [0,0,0,0,0,0,0];
      for (var x = 0; x < size; x++) {
        if (modules[y][x] === runColor) {
          runX++;
          if (runX === 5) result += 3;
          else if (runX > 5) result++;
        } else { finderPenaltyAddHistory(runX, runHistory, size); if (!runColor) result += finderPenaltyCountPatterns(runHistory) * 40; runColor = modules[y][x]; runX = 1; }
      }
      result += finderPenaltyTerminateAndCount(runColor, runX, runHistory, size) * 40;
    }
    for (var x = 0; x < size; x++) {
      var runColor = false, runY = 0, runHistory = [0,0,0,0,0,0,0];
      for (var y = 0; y < size; y++) {
        if (modules[y][x] === runColor) {
          runY++;
          if (runY === 5) result += 3;
          else if (runY > 5) result++;
        } else { finderPenaltyAddHistory(runY, runHistory, size); if (!runColor) result += finderPenaltyCountPatterns(runHistory) * 40; runColor = modules[y][x]; runY = 1; }
      }
      result += finderPenaltyTerminateAndCount(runColor, runY, runHistory, size) * 40;
    }
    for (var y = 0; y < size - 1; y++)
      for (var x = 0; x < size - 1; x++) {
        var c = modules[y][x];
        if (c === modules[y][x+1] && c === modules[y+1][x] && c === modules[y+1][x+1]) result += 3;
      }
    var dark = 0;
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) if (modules[y][x]) dark++;
    var total = size * size;
    var k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    result += k * 10;
    return result;
  }
  function finderPenaltyCountPatterns(rh) {
    var n = rh[1];
    var core = n > 0 && rh[2] === n && rh[3] === n * 3 && rh[4] === n && rh[5] === n;
    return (core && rh[0] >= n * 4 && rh[6] >= n ? 1 : 0) + (core && rh[6] >= n * 4 && rh[0] >= n ? 1 : 0);
  }
  function finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, rh, size) {
    if (currentRunColor) { finderPenaltyAddHistory(currentRunLength, rh, size); currentRunLength = 0; }
    currentRunLength += size;
    finderPenaltyAddHistory(currentRunLength, rh, size);
    return finderPenaltyCountPatterns(rh);
  }
  function finderPenaltyAddHistory(currentRunLength, rh, size) {
    if (rh[0] === 0) currentRunLength += size;
    rh.pop(); rh.unshift(currentRunLength);
  }

  function getBit(x, i) { return ((x >>> i) & 1) !== 0; }

  // ---- Segments ----
  function QrSegment(mode, numChars, bitData) { this.mode = mode; this.numChars = numChars; this.bitData = bitData; }

  var Mode = {
    NUMERIC:      { modeBits: 0x1, cc: [10,12,14] },
    ALPHANUMERIC: { modeBits: 0x2, cc: [9,11,13] },
    BYTE:         { modeBits: 0x4, cc: [8,16,16] }
  };
  function numCharCountBits(mode, ver) {
    return mode.cc[Math.floor((ver + 7) / 17)];
  }

  var ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

  function makeBytes(data) {
    var bb = [];
    data.forEach(function (b) { for (var i = 7; i >= 0; i--) bb.push((b >>> i) & 1); });
    return new QrSegment(Mode.BYTE, data.length, bb);
  }
  function makeNumeric(digits) {
    var bb = [];
    for (var i = 0; i < digits.length;) {
      var n = Math.min(digits.length - i, 3);
      appendBits(parseInt(digits.substr(i, n), 10), n * 3 + 1, bb);
      i += n;
    }
    return new QrSegment(Mode.NUMERIC, digits.length, bb);
  }
  function makeAlphanumeric(text) {
    var bb = [];
    var i;
    for (i = 0; i + 2 <= text.length; i += 2) {
      var t = ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45 + ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
      appendBits(t, 11, bb);
    }
    if (i < text.length) appendBits(ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
    return new QrSegment(Mode.ALPHANUMERIC, text.length, bb);
  }
  function appendBits(val, len, bb) { for (var i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1); }

  function toUtf8Bytes(str) {
    str = encodeURI(str);
    var result = [];
    for (var i = 0; i < str.length; i++) {
      if (str.charAt(i) !== "%") result.push(str.charCodeAt(i));
      else { result.push(parseInt(str.substr(i + 1, 2), 16)); i += 2; }
    }
    return result;
  }

  function makeSegments(text) {
    if (text === "") return [];
    if (/^[0-9]*$/.test(text)) return [makeNumeric(text)];
    if (new RegExp("^[" + "A-Z0-9 $%*+./:\\-" + "]*$").test(text)) return [makeAlphanumeric(text)];
    return [makeBytes(toUtf8Bytes(text))];
  }

  function getTotalBits(segs, ver) {
    var result = 0;
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      var ccbits = numCharCountBits(seg.mode, ver);
      if (seg.numChars >= (1 << ccbits)) return Infinity;
      result += 4 + ccbits + seg.bitData.length;
    }
    return result;
  }

  function encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcl) {
    minVer = minVer || MIN_VERSION; maxVer = maxVer || MAX_VERSION;
    if (mask === undefined) mask = -1;
    if (boostEcl === undefined) boostEcl = true;
    var version, dataUsedBits;
    for (version = minVer; ; version++) {
      var dataCapacityBits = getNumDataCodewords(version, ecl) * 8;
      var usedBits = getTotalBits(segs, version);
      if (usedBits <= dataCapacityBits) { dataUsedBits = usedBits; break; }
      if (version >= maxVer) throw new Error("Data too long");
    }
    [ECC.MEDIUM, ECC.QUARTILE, ECC.HIGH].forEach(function (newEcl) {
      if (boostEcl && dataUsedBits <= getNumDataCodewords(version, newEcl) * 8) ecl = newEcl;
    });

    var bb = [];
    segs.forEach(function (seg) {
      appendBits(seg.mode.modeBits, 4, bb);
      appendBits(seg.numChars, numCharCountBits(seg.mode, version), bb);
      seg.bitData.forEach(function (b) { bb.push(b); });
    });
    var dataCapacityBits = getNumDataCodewords(version, ecl) * 8;
    appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
    appendBits(0, (8 - bb.length % 8) % 8, bb);
    for (var padByte = 0xEC; bb.length < dataCapacityBits; padByte ^= 0xEC ^ 0x11)
      appendBits(padByte, 8, bb);

    var dataCodewords = [];
    while (dataCodewords.length * 8 < bb.length) dataCodewords.push(0);
    bb.forEach(function (b, i) { dataCodewords[i >>> 3] |= b << (7 - (i & 7)); });

    return new QrCode(version, ecl, dataCodewords, mask);
  }

  function encodeText(text, ecl) {
    return encodeSegments(makeSegments(text), ecl || ECC.MEDIUM);
  }

  // ---- Public render helpers ----
  function renderCanvas(text, opts) {
    opts = opts || {};
    var ecl = ECC[opts.ecc || "MEDIUM"] || ECC.MEDIUM;
    var qr;
    try { qr = encodeText(text, ecl); }
    catch (e) { qr = encodeText(text, ECC.LOW); }
    var border = opts.border == null ? 2 : opts.border;
    var pxPerModule = opts.scale || 6;
    var dim = (qr.size + border * 2);
    var canvas = document.createElement("canvas");
    var ratio = (window.devicePixelRatio || 1);
    var cssSize = opts.size || dim * pxPerModule;
    canvas.width = Math.round(cssSize * ratio);
    canvas.height = Math.round(cssSize * ratio);
    canvas.style.width = cssSize + "px";
    canvas.style.height = cssSize + "px";
    var ctx = canvas.getContext("2d");
    var s = canvas.width / dim;
    ctx.fillStyle = opts.light || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = opts.dark || "#000000";
    for (var y = 0; y < qr.size; y++) {
      for (var x = 0; x < qr.size; x++) {
        if (qr.modules[y][x])
          ctx.fillRect(Math.floor((x + border) * s), Math.floor((y + border) * s), Math.ceil(s), Math.ceil(s));
      }
    }
    return canvas;
  }

  window.AWM_QR = {
    encodeText: encodeText,
    ECC: ECC,
    renderCanvas: renderCanvas
  };
})();
