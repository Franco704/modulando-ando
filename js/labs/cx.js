/* Cálculos de Comunicación de Datos: decibeles, información, Huffman, capacidad, CRC, Hamming, códigos de línea y modulaciones.
   Funciones puras (sin DOM): las usan los laboratorios y las soluciones, y se prueban con node tests/cx.test.js. */
(() => {
  const log2 = Math.log2;
  const dB = (ratio) => 10 * Math.log10(ratio);
  const fromDb = (db) => 10 ** (db / 10);
  const dBm = (watts) => dB(watts / 1e-3);
  const fromDbm = (dbm) => 1e-3 * fromDb(dbm);
  const K = 1.38e-23;   // constante de Boltzmann que usa la cátedra

  // ---------- Señales ----------
  const C0 = 3e8;
  const lambda = (f, v = C0) => v / f;

  // ---------- Ruido y enlaces ----------
  const noiseW = (tC, B) => K * (tC + 273) * B;
  const noiseDbm = (tC, B) => dBm(noiseW(tC, B));
  // Pérdida en el espacio libre (f en MHz, d en km)
  const fspl = (fMHz, dKm) => 32.45 + 20 * Math.log10(fMHz) + 20 * Math.log10(dKm);

  // ---------- Información ----------
  const info = (p) => -log2(p);
  const entropy = (ps) => ps.reduce((a, p) => a + (p > 0 ? -p * log2(p) : 0), 0);
  // Frecuencias de un texto en orden de primera aparición: [{ s, n, p }]
  function freqs(text) {
    const m = new Map();
    for (const ch of text) m.set(ch, (m.get(ch) || 0) + 1);
    return [...m].map(([s, n]) => ({ s, n, p: n / text.length }));
  }

  /* Huffman: une siempre las dos probabilidades menores; a la rama de mayor probabilidad le toca 0 y a la menor 1
     (empates: el que estaba antes en la lista va arriba). Devuelve { codes: {s: '01'}, L, H, eta, tree }.
     Los códigos pueden variar según cómo se desempate; las longitudes y L̄ son las mismas. */
  function huffman(items) {
    let seq = 0;
    let nodes = items.map((it) => ({ s: it.s, p: it.p, n: it.n, id: seq++ }));
    if (nodes.length === 1) return { codes: { [nodes[0].s]: '0' }, L: 1, H: 0, eta: 0, tree: nodes[0] };
    while (nodes.length > 1) {
      nodes.sort((a, b) => b.p - a.p || a.id - b.id);
      const lo = nodes.pop(), hi = nodes.pop();
      nodes.push({ p: hi.p + lo.p, kids: [hi, lo], id: seq++ });
    }
    const codes = {};
    const walk = (nd, c) => (nd.kids ? nd.kids.forEach((k, i) => walk(k, c + i)) : (codes[nd.s] = c));
    walk(nodes[0], '');
    const L = items.reduce((a, it) => a + it.p * codes[it.s].length, 0);
    const H = entropy(items.map((it) => it.p));
    return { codes, L, H, eta: H / L, tree: nodes[0] };
  }

  // ---------- Capacidad ----------
  const nyquist = (B, M) => 2 * B * log2(M);
  const shannon = (B, snr) => B * log2(1 + snr);
  // Niveles que alcanzan el límite de Shannon: M = √(1 + SNR); la cátedra lo redondea a la potencia de 2 inferior
  const levels = (snr) => Math.sqrt(1 + snr);
  const pow2Floor = (x) => 2 ** Math.floor(log2(x) + 1e-9);

  // ---------- Errores ----------
  const ones = (bits) => [...bits].filter((b) => b === '1').length;
  const hdist = (a, b) => [...a].reduce((n, c, i) => n + (c !== b[i]), 0);
  const minDist = (words) => Math.min(...words.flatMap((a, i) => words.slice(i + 1).map((b) => hdist(a, b))));
  const ascii7 = (ch) => ch.charCodeAt(0).toString(2).padStart(7, '0');
  const bcd = (digits) => [...String(digits)].map((d) => (+d).toString(2).padStart(4, '0')).join('');

  /* CRC por división módulo 2. msg y gen son cadenas de bits. Devuelve { padded, rem, tx, steps }
     steps: [{ at, top, gen, out }] cada resta (XOR) de la división larga, para mostrarla en pantalla */
  function crcDivide(bits, gen) {
    const r = gen.length - 1;
    const a = [...bits].map(Number);
    const g = [...gen].map(Number);
    const steps = [];
    for (let i = 0; i + r < a.length; i++) {
      if (!a[i]) continue;
      const top = a.slice(i, i + r + 1).join('');
      for (let j = 0; j <= r; j++) a[i + j] ^= g[j];
      steps.push({ at: i, top, gen, out: a.slice(i, i + r + 1).join('') });
    }
    return { rem: a.slice(-r).join(''), steps };
  }
  function crc(msg, gen) {
    const padded = msg + '0'.repeat(gen.length - 1);
    const { rem, steps } = crcDivide(padded, gen);
    return { padded, rem, tx: msg + rem, steps };
  }
  const crcCheck = (rx, gen) => crcDivide(rx, gen);

  /* Hamming como en la cátedra: posiciones numeradas de derecha (1) a izquierda, paridad par,
     bits de paridad en las posiciones potencia de 2. Los datos se escriben de izquierda (MSB) a derecha. */
  const isPow2 = (k) => (k & (k - 1)) === 0;
  const parityCount = (n) => { let p = 0; while (2 ** p < n + p + 1) p++; return p; };
  function hammingLayout(n) {
    const p = parityCount(n), N = n + p;
    // etiqueta de cada posición, de N a 1: p1, p2, n1 ...
    const lab = {}; let di = 0, pi = 0;
    for (let k = 1; k <= N; k++) lab[k] = isPow2(k) ? `p${++pi}` : `n${++di}`;
    return { n, p, N, lab };
  }
  // Recorre las posiciones: bitAt(k) del vector indexado por posición
  const covers = (pi, k) => (k >> pi) & 1;
  function hammingEncode(data) {
    const { p, N, lab } = hammingLayout(data.length);
    const at = {}; // posición → bit
    const d = [...data].reverse();   // n1 es el último carácter
    let di = 0;
    for (let k = 1; k <= N; k++) if (!isPow2(k)) at[k] = +d[di++];
    for (let i = 0; i < p; i++) {
      const k = 2 ** i;
      let s = 0;
      for (let q = 1; q <= N; q++) if (q !== k && covers(i, q)) s ^= at[q];
      at[k] = s;
    }
    const word = Array.from({ length: N }, (_, j) => at[N - j]).join('');
    return { word, p, N, lab };
  }
  function hammingDecode(word) {
    const N = word.length;
    const at = {};
    for (let j = 0; j < N; j++) at[N - j] = +word[j];
    let p = 0; while (2 ** p <= N) p++;
    const checks = [];
    let syn = 0;
    for (let i = 0; i < p; i++) {
      let s = 0;
      for (let q = 1; q <= N; q++) if (covers(i, q)) s ^= at[q];
      checks.push(s);
      syn |= s << i;
    }
    const fixed = { ...at };
    if (syn && syn <= N) fixed[syn] ^= 1;
    const corrected = Array.from({ length: N }, (_, j) => fixed[N - j]).join('');
    const data = Array.from({ length: N }, (_, j) => N - j).filter((k) => !isPow2(k)).map((k) => fixed[k]).join('');
    return { syn, checks, corrected, data, p, N };
  }

  /* ---------- Códigos de línea ----------
     Devuelve dos niveles por bit (primera y segunda mitad), en múltiplos de la amplitud: 1, 0 o −1. */
  function lineCode(bits, scheme) {
    const b = [...bits].map(Number);
    const out = [];
    let lvl = 1, last = -1, sinceV = 0;
    switch (scheme) {
      case 'nrz': return b.map((x) => [x, x]);
      case 'nrzl': return b.map((x) => [x ? 1 : -1, x ? 1 : -1]);
      // NRZ-I: la línea venía en −; cada 1 invierte el nivel. Así un flujo que empieza con 1 arranca en positivo, como pide el TP 7.
      case 'nrzi': lvl = -1; return b.map((x) => { if (x) lvl = -lvl; return [lvl, lvl]; });
      case 'rz': return b.map((x) => [x ? 1 : -1, 0]);
      case 'manchester': return b.map((x) => (x ? [-1, 1] : [1, -1]));
      // Diferencial: transición al inicio si el bit es 0; siempre transición a mitad de bit. Nivel previo: positivo.
      case 'dmanch': return b.map((x) => { if (!x) lvl = -lvl; const v = [lvl, -lvl]; lvl = -lvl; return v; });
      case 'ami': return b.map((x) => { if (!x) return [0, 0]; last = -last; return [last, last]; });
      case 'b8zs': {
        for (let i = 0; i < b.length; i++) {
          if (!b[i] && b.slice(i, i + 8).length === 8 && b.slice(i, i + 8).every((x) => !x)) {
            const V = last, B = -last;   // 000VB0VB
            [0, 0, 0, V, B, 0, B, V].forEach((v) => out.push([v, v]));
            i += 7;
            continue;
          }
          if (b[i]) { last = -last; out.push([last, last]); } else out.push([0, 0]);
        }
        return out;
      }
      case 'hdb3': {
        for (let i = 0; i < b.length; i++) {
          if (!b[i] && b.slice(i, i + 4).length === 4 && b.slice(i, i + 4).every((x) => !x)) {
            if (sinceV % 2) { [0, 0, 0, last].forEach((v) => out.push([v, v])); }   // impar: 000V
            else { const B = -last; [B, 0, 0, B].forEach((v) => out.push([v, v])); last = B; }   // par: B00V
            sinceV = 0;
            i += 3;
            continue;
          }
          if (b[i]) { last = -last; sinceV++; out.push([last, last]); } else out.push([0, 0]);
        }
        return out;
      }
      default: throw new Error(`código desconocido: ${scheme}`);
    }
  }
  // Manchester diferencial al revés: hay transición al comienzo del bit ⇒ 0
  function dmanchDecode(halves, start = 1) {
    let prev = start;
    return halves.map(([a, bb]) => { const bit = a === prev ? 1 : 0; prev = bb; return bit; }).join('');
  }

  // ---------- Modulaciones digitales: punto de la constelación de cada símbolo ----------
  const deg = Math.PI / 180;
  const polar = (A, ph) => ({ A, ph, i: A * Math.cos(ph * deg), q: A * Math.sin(ph * deg) });
  const MODS = {
    ask: { n: 1, name: 'ASK (OOK)', map: { 0: polar(0, 0), 1: polar(1, 0) } },
    fsk: { n: 1, name: 'FSK', map: { 0: polar(1, 0), 1: polar(1, 0) }, freq: { 0: 1, 1: 2 } },
    bpsk: { n: 1, name: 'BPSK', map: { 0: polar(1, 180), 1: polar(1, 0) } },
    // QPSK de la cátedra (Tomasi): 00→135°, 01→−135°, 10→45°, 11→−45°
    qpsk: { n: 2, name: 'QPSK', map: { '00': polar(1, 135), '01': polar(1, -135), '10': polar(1, 45), '11': polar(1, -45) } },
    ask4: { n: 2, name: '4-ASK', map: { '00': polar(0.25, 0), '01': polar(0.5, 0), '10': polar(0.75, 0), '11': polar(1, 0) } },
    psk8: { n: 3, name: '8-PSK', map: { '000': polar(1, -112.5), '001': polar(1, -157.5), '010': polar(1, -67.5), '011': polar(1, -22.5), '100': polar(1, 112.5), '101': polar(1, 157.5), '110': polar(1, 67.5), '111': polar(1, 22.5) } },
    qam8: { n: 3, name: '8-QAM', map: { '000': polar(0.765, -135), '001': polar(1.848, -135), '010': polar(0.765, -45), '011': polar(1.848, -45), '100': polar(0.765, 135), '101': polar(1.848, 135), '110': polar(0.765, 45), '111': polar(1.848, 45) } },
  };
  // 16-PSK: fases cada 22,5° en código Gray; 16-QAM: 2 bits para I y 2 para Q (Gray: 00→−3, 01→−1, 11→1, 10→3)
  const gray = (k) => k ^ (k >> 1);
  MODS.psk16 = { n: 4, name: '16-PSK', map: Object.fromEntries(Array.from({ length: 16 }, (_, k) => [gray(k).toString(2).padStart(4, '0'), polar(1, 11.25 + k * 22.5)])) };
  const G2 = { '00': -3, '01': -1, '11': 1, '10': 3 };
  MODS.qam16 = { n: 4, name: '16-QAM', map: Object.fromEntries(Object.keys(G2).flatMap((a) => Object.keys(G2).map((c) => { const i = G2[a], q = G2[c]; return [a + c, { i: i / 3, q: q / 3, A: Math.hypot(i, q) / 3, ph: Math.atan2(q, i) / deg }]; }))) };
  const groups = (bits, n) => (bits.match(new RegExp(`.{1,${n}}`, 'g')) || []).map((g) => g.padEnd(n, '0'));

  // Parser de respuestas numéricas: "1,5", "2e-4", "10^-5", "133 Mbps", "−80 dBm", "1.234,5"
  const PREF = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9, T: 1e12 };
  function parseNum(raw) {
    let s = String(raw).trim().replace(/[−–]/g, '-').replace(/\s+/g, ' ');
    if (!s) return NaN;
    s = s.replace(/×\s*10\^?/g, 'e').replace(/x\s*10\^/gi, 'e').replace(/\*\s*10\^/g, 'e').replace(/^10\^/, '1e');
    // separadores: "1.234,5" → 1234.5 ; "1,5" → 1.5 ; "1.5" → 1.5 ; "50.000" → 50000
    const m = s.match(/^([-+]?[\d.,]+)(e[-+]?\d+)?\s*([a-zA-Zµ%/°]*)/);
    if (!m) return NaN;
    let n = m[1];
    if (n.includes(',') && n.includes('.')) n = n.replace(/\./g, '').replace(',', '.');
    else if (n.includes(',')) n = n.replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(n.replace(/^[-+]/, ''))) n = n.replace(/\./g, '');
    let v = parseFloat(n + (m[2] || ''));
    const u = m[3];
    // prefijo SI solo si va pegado a una unidad conocida o solo ("k", "M"); "m" solo cuenta como mili si sigue una unidad
    const pm = u.match(/^([pnuµmkKMGT])(bps|bit|b|hz|Hz|w|W|s|baud|Bd|B)?/);
    if (pm && (pm[2] || (u.length === 1 && pm[1] !== 'm'))) v *= PREF[pm[1]];
    return v;
  }

  // ---------- Corrección de preguntas abiertas (ver _helpers.js) ----------
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const UNIT_RE = /^([pnuµmkKMGT])(bps|bit|b|hz|Hz|w|W|s|baud|Bd|B)$/;
  // Corrige una respuesta: { ok, html } (html = devolución específica de la respuesta)
  function checkOpen(q, raw) {
    const txt = String(raw || '').trim();
    if (!txt) return { ok: false, empty: true, html: '<p><strong>Sin responder.</strong></p>' };
    if (q.t === 'num') {
      const full = parseNum(txt);
      const plain = parseNum(txt.replace(/[a-zA-Zµ%°/][^]*$/, ''));
      const um = q.u && q.u.match(UNIT_RE);
      const cands = [plain, full, um ? full / PREF[um[1]] : NaN].filter(Number.isFinite);
      if (!cands.length) return { ok: false, html: '<p><strong>No pude leer un número.</strong> Escribilo así: 133,16 · 2e-4 · 10^-5 · −100,8 dBm.</p>' };
      const tol = q.tol ?? 0.02;
      const ok = cands.some((v) => (q.a === 0 ? Math.abs(v) < 1e-9 : Math.abs(v - q.a) <= Math.abs(q.a) * tol));
      const near = !ok && cands.some((v) => q.a !== 0 && Math.abs(v - q.a) <= Math.abs(q.a) * 0.1);
      return { ok, html: `<p><strong>${ok ? 'Correcto.' : near ? 'Cerca, pero no: revisá el redondeo o un paso intermedio.' : 'Incorrecto.'}</strong> La respuesta es <b>${window.GUIDE.h.num(q.a, 4)}${q.u ? ` ${q.u}` : ''}</b>.</p>` };
    }
    if (q.t === 'bits') {
      const got = txt.replace(/[^01]/g, ''), want = q.a.replace(/[^01]/g, '');
      const ok = got === want;
      const diff = got.length === want.length ? [...got].map((c, i) => (c === want[i] ? c : `<mark>${c}</mark>`)).join('') : esc(got);
      return { ok, html: `<p><strong>${ok ? 'Correcto.' : got.length !== want.length ? `Incorrecto: tu cadena tiene ${got.length} bits y la correcta ${want.length}.` : 'Incorrecto: los bits marcados no coinciden.'}</strong></p>${ok ? '' : `<p class="mono">Tu respuesta: ${diff}<br>Correcta: ${want}</p>`}` };
    }
    // Texto: cuenta cuántos conceptos aparecen (cualquiera de sus sinónimos, sin tildes ni mayúsculas)
    const t = norm(txt);
    const hits = q.k.map((g) => g.some((w) => t.includes(norm(w))));
    const n = hits.filter(Boolean).length;
    const need = q.need ?? (q.k.length <= 2 ? q.k.length : q.k.length - 1);
    const ok = n >= need && txt.length >= 12;
    return { ok, html: `<p><strong>${ok ? 'Bien: están los conceptos clave.' : `Faltan conceptos: encontré ${n} de los ${need} necesarios.`}</strong></p>
      <ul class="oq-keys">${q.k.map((g, i) => `<li class="${hits[i] ? 'hit' : 'miss'}">${hits[i] ? '✓' : '✗'} ${g[0]}</li>`).join('')}</ul>` };
  }

  window.GUIDE.cx = {
    log2, dB, fromDb, dBm, fromDbm, K, C0, lambda, noiseW, noiseDbm, fspl,
    info, entropy, freqs, huffman, nyquist, shannon, levels, pow2Floor,
    ones, hdist, minDist, ascii7, bcd, crc, crcCheck, hammingLayout, hammingEncode, hammingDecode, parityCount,
    lineCode, dmanchDecode, MODS, groups, parseNum, checkOpen,
  };
})();
