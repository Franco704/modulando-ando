/* Laboratorios de las Unidades 4 y 5: entropía, Huffman, muestreo y Shannon. */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;
  const { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss } = window.GUIDE.labUtil;
  /* ---------- Entropía de la fuente binaria H(p) ---------- */
  L.hbin = (el, cfg) => {
    const v = sliders(el, [{ id: 'p', label: 'p = P(s₀)', min: 0, max: 1, step: 0.01, value: cfg.p ?? 0.25 }], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const H = (p) => X.entropy([p, 1 - p]);
    const draw = () => {
      const p = v.p, h = H(p);
      host.innerHTML = plot({ x: [0, 1.05], y: [0, 1.15], w: 440, h: 260, xl: 'p', yl: 'H(p)', anim: first, ticks: { x: [0.25, 0.5, 0.75, 1], y: [0.5, 1] },
        curves: [{ f: H, n: 200, dom: [0.0001, 0.9999], cls: 'c-sig', label: 'H(p)' }], guides: [{ x: p, y: h, xt: num(p, 2), yt: num(h, 3), cls: 'c-res' }],
        points: [{ x: p, y: h, cls: 'c-res' }, { x: 0.5, y: 1, cls: 'c-pass', r: 3, label: 'máximo', pos: 'n' }] });
      first = false;
      read.innerHTML = chips([['I(s₀) = log₂(1/p)', p > 0 ? `${num(X.info(p), 3)} bit` : '∞'], ['I(s₁)', p < 1 ? `${num(X.info(1 - p), 3)} bit` : '∞'], ['H', `${num(h, 4)} bit/símbolo`, 'acc'], ['Redundancia (Hmáx − H)/Hmáx', `${num((1 - h) * 100, 1)} %`]])
        + '<p class="lab-note">H(p) = −p log₂p − (1 − p) log₂(1 − p). Vale 0 cuando la fuente es segura (p = 0 o 1: no hay sorpresa) y es máxima, 1 bit, cuando los dos símbolos son equiprobables. La curva es simétrica: da lo mismo cuál de los dos símbolos sea el probable.</p>';
    };
    draw();
  };

  /* ---------- Huffman: tabla, árbol y cadena codificada ---------- */
  function treeSvg(tree, codes) {
    // ubica las hojas en orden y los nodos internos en el promedio de sus hijos
    let leaf = 0, depth = 0;
    const lay = (nd, d) => { depth = Math.max(depth, d); nd.d = d; if (nd.kids) { nd.kids.forEach((k) => lay(k, d + 1)); nd.x = (nd.kids[0].x + nd.kids[1].x) / 2; } else nd.x = leaf++; };
    lay(tree, 0);
    const W = Math.max(320, leaf * 54), H = 46 + depth * 58, sx = (x) => 28 + (x * (W - 56)) / Math.max(1, leaf - 1), sy = (d) => 24 + d * 58;
    let g = '';
    const walk = (nd) => {
      if (!nd.kids) return;
      nd.kids.forEach((k, i) => {
        g += `<line x1="${sx(nd.x)}" y1="${sy(nd.d)}" x2="${sx(k.x)}" y2="${sy(k.d)}" class="ed"/><text x="${(sx(nd.x) + sx(k.x)) / 2 + (i ? 7 : -7)}" y="${(sy(nd.d) + sy(k.d)) / 2 - 4}" class="eb">${i}</text>`;
        walk(k);
      });
    };
    walk(tree);
    const nodes = (nd) => (nd.kids ? `<circle cx="${sx(nd.x)}" cy="${sy(nd.d)}" r="15" class="nd"/><text x="${sx(nd.x)}" y="${sy(nd.d)}">${num(nd.p, 2)}</text>${nd.kids.map(nodes).join('')}`
      : `<rect x="${sx(nd.x) - 20}" y="${sy(nd.d) - 15}" width="40" height="30" rx="6" class="lf"/><text x="${sx(nd.x)}" y="${sy(nd.d) - 5}">${esc(nd.s === ' ' ? '␣' : nd.s)}</text><text x="${sx(nd.x)}" y="${sy(nd.d) + 8}" style="font-size:9px">${codes[nd.s]}</text>`);
    return `<svg class="tree" viewBox="0 0 ${W} ${H}" style="max-width:${Math.round(W * 1.15)}px;display:block;margin:8px auto" role="img" aria-label="Árbol de Huffman">${g}${nodes(tree)}</svg>`;
  }
  L.huffman = (el, cfg) => {
    let mode = cfg.mode || 'text';
    toggle(el, 'Entrada', [['text', 'Mensaje'], ['prob', 'Probabilidades']], mode, (k) => { mode = k; draw(); });
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('m', 'Mensaje a codificar', cfg.text || 'TRESTRISTESTIGRES')}${textIn('p', 'Probabilidades (símbolo=p, separadas por coma)', cfg.probs || 'A=0.5, B=0.25, C=0.125, D=0.125')}${textIn('r', 'Tasa R [bit/s] (para el tiempo)', cfg.rate || '10')}</div><div class="hf-out" aria-live="polite"></div>`);
    const out = el.querySelector('.hf-out');
    const draw = () => {
      el.querySelector('[data-t="m"]').closest('label').hidden = mode !== 'text';
      el.querySelector('[data-t="p"]').closest('label').hidden = mode !== 'prob';
      el.querySelector('[data-t="r"]').closest('label').hidden = mode !== 'text';
      let items, msg = '';
      if (mode === 'text') {
        msg = el.querySelector('[data-t="m"]').value.slice(0, 60);
        if (!msg) { out.innerHTML = '<p class="lab-note">Escribí un mensaje.</p>'; return; }
        items = X.freqs(msg);
      } else {
        items = el.querySelector('[data-t="p"]').value.split(',').map((s) => s.split('=')).filter((x) => x.length === 2).map(([s, p]) => ({ s: s.trim(), p: X.parseNum(p) })).filter((x) => x.s && x.p > 0);
        const tot = items.reduce((a, x) => a + x.p, 0);
        if (!items.length) { out.innerHTML = '<p class="lab-note">Formato: A=0.5, B=0.25, …</p>'; return; }
        if (Math.abs(tot - 1) > 0.01) { out.innerHTML = `<p class="note warn">Las probabilidades suman ${num(tot, 3)}: tienen que sumar 1.</p>`; return; }
      }
      const hf = X.huffman(items);
      const sorted = [...items].sort((a, b) => b.p - a.p);
      const fixed = Math.ceil(X.log2(Math.max(2, items.length)));
      const R = X.parseNum(el.querySelector('[data-t="r"]').value) || 10;
      const enc = msg ? [...msg].map((c) => hf.codes[c]).join('') : '';
      out.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Símbolo</th>${mode === 'text' ? '<th>Veces</th>' : ''}<th>P(x)</th><th>I(x) [bit]</th><th>Código</th><th>Lᵢ</th></tr></thead><tbody>
        ${sorted.map((it) => `<tr><td class="mono">${esc(it.s === ' ' ? '␣' : it.s)}</td>${mode === 'text' ? `<td>${it.n}</td>` : ''}<td>${num(it.p, 4)}</td><td>${num(X.info(it.p), 3)}</td><td class="mono">${hf.codes[it.s]}</td><td>${hf.codes[it.s].length}</td></tr>`).join('')}</tbody></table></div>
        ${items.length > 1 ? treeSvg(hf.tree, hf.codes) : ''}
        ${chips([['H(x)', `${num(hf.H, 4)} bit/símbolo`, 'acc'], ['L̄ = Σ P·Lᵢ', `${num(hf.L, 4)} dígitos/símbolo`, 'acc'], ['Eficiencia η = H/L̄', `${num(hf.eta * 100, 2)} %`], ['Con longitud fija', `${fixed} bits/símbolo`]])}
        ${msg ? `<p class="lab-note"><b>ASCII (8 bits):</b> ${msg.length} × 8 = ${msg.length * 8} bits → ${num((msg.length * 8) / R, 3)} s a ${num(R)} bit/s.<br><b>Huffman:</b> ${enc.length} bits → ${num(enc.length / R, 3)} s. Ahorro: ${num((1 - enc.length / (msg.length * 8)) * 100, 1)} %.</p><p class="mono">${enc.match(/.{1,8}/g).join(' ')}</p>` : ''}
        <p class="lab-note">Huffman ordena de mayor a menor probabilidad, suma las dos menores y repite; cada bifurcación lleva 0 (rama más probable) o 1. El código es de prefijo: ninguna palabra es el comienzo de otra, así que se decodifica sin separadores. Los códigos pueden cambiar según cómo se desempate, pero L̄ es la misma.</p>`;
    };
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) draw(); });
    draw();
  };

  /* ---------- Muestreo y aliasing ---------- */
  L.sampling = (el, cfg) => {
    const v = sliders(el, [
      { id: 'f', label: 'Frecuencia de la señal f [kHz]', min: 1, max: 10, step: 0.5, value: cfg.f || 4 },
      { id: 'fs', label: 'Frecuencia de muestreo fs [kHz]', min: 2, max: 40, step: 0.5, value: cfg.fs || 10 },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const draw = () => {
      const { f, fs } = v, tmax = 1; // ms
      const s = (t) => Math.sin(2 * PI * f * t);
      // frecuencia aparente: se pliega alrededor de fs/2
      let fa = f % fs; if (fa > fs / 2) fa = fs - fa;
      const sign = (f % fs) > fs / 2 ? -1 : 1;
      const n = Math.floor(tmax * fs);
      const samples = Array.from({ length: n + 1 }, (_, k) => [k / fs, s(k / fs)]);
      const ok = fs >= 2 * f;
      host.innerHTML = plot({ x: [0, tmax], y: [-1.4, 1.5], w: 460, h: 240, xl: 't [ms]', yl: 'x', anim: first, ticks: { x: [0.25, 0.5, 0.75, 1], y: [-1, 1] },
        curves: [{ f: s, n: 800, cls: 'c-sig', label: `${f} kHz` }, ...(ok ? [] : [{ f: (t) => sign * Math.sin(2 * PI * fa * t), n: 400, cls: 'c-stop', dash: true, label: `alias ${num(fa, 2)} kHz` }])],
        segs: samples.map(([t, y]) => ({ from: [t, 0], to: [t, y], cls: 'c-res' })), points: samples.map(([t, y]) => ({ x: t, y, r: 3.5, cls: 'c-res' })) });
      first = false;
      read.innerHTML = chips([['Frecuencia de Nyquist 2·f', `${num(2 * f, 2)} kHz`, 'acc'], ['fs / f', `${num(fs / f, 2)} muestras por ciclo`], ['Resultado', ok ? 'se puede reconstruir' : `aliasing: se reconstruye ${num(fa, 2)} kHz`, ok ? 'ok' : 'err']])
        + '<p class="lab-note">Teorema de muestreo: una señal limitada en banda se reconstruye si fs ≥ 2·f<sub>máx</sub>. Por debajo, las muestras de la señal verdadera coinciden con las de otra de menor frecuencia (|f − k·fs|): el receptor no puede distinguirlas. Por eso antes de muestrear se pone un filtro pasa bajos (antialiasing).</p>';
    };
    draw();
  };

  /* ---------- Capacidad de Shannon y niveles de Nyquist ---------- */
  L.shannon = (el, cfg) => {
    const v = sliders(el, [
      { id: 'B', label: 'Ancho de banda B [MHz]', min: 0.1, max: 40, step: 0.1, value: cfg.B || 20 },
      { id: 's', label: 'SNR [dB]', min: -5, max: 50, step: 0.5, value: cfg.snr ?? 10 },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const draw = () => {
      const B = v.B * 1e6, snr = X.fromDb(v.s), C = X.shannon(B, snr);
      const M = X.levels(snr), M2 = X.pow2Floor(M);
      host.innerHTML = plot({ x: [-5, 50], y: [0, X.shannon(B, X.fromDb(50)) / 1e6 * 1.12], w: 440, h: 250, xl: 'SNR [dB]', yl: 'C [Mbps]', anim: first, ticks: { x: [0, 10, 20, 30, 40, 50] },
        curves: [{ f: (d) => X.shannon(B, X.fromDb(d)) / 1e6, n: 200, cls: 'c-sig', label: 'C', at: 44 }],
        guides: [{ x: v.s, y: C / 1e6, xt: '', yt: num(C / 1e6, 2), cls: 'c-res' }], points: [{ x: v.s, y: C / 1e6, cls: 'c-res' }] });
      first = false;
      read.innerHTML = chips([['SNR', `${num(snr, 3)} veces`], ['C', eng(C, 'bps'), 'acc'], ['Eficiencia C/B', `${num(C / B, 3)} bps/Hz`], ['M = √(1+SNR)', `${num(M, 3)} → ${M2} niveles`], ['Nyquist con M', eng(X.nyquist(B, M2), 'bps')]])
        + '<p class="lab-note">Cada 3 dB más de SNR suman ~1 bit/s por Hz cuando la SNR es alta: duplicar la potencia no duplica la capacidad (es logarítmica). En cambio, duplicar B duplica C si la SNR no cambia. Igualando Nyquist y Shannon sale la cantidad máxima de niveles distinguibles, M = √(1+SNR); se toma la potencia de 2 inferior.</p>';
    };
    draw();
  };
})();
