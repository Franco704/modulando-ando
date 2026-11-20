/* Laboratorios del 3er parcial (Unidad 8): leer una constelación, reconocer una modulación en un diagrama de tiempo
   y pasar de una señal NRZ a una M-aria. Usan las tablas de la cátedra (MODS.*C) y point/classify de calculos.js. */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const { sliders, select, textIn, chips, shell, eng, bitsOnly, constPlane, symbolWave } = window.GUIDE.labUtil;
  const deg = (v) => `${num(v, 1)}°`;
  const shuffle = window.GUIDE.util.shuffle;

  /* ---------- Leer una constelación: puntos → M, amplitud, fase, tipo y tabla ---------- */
  const PRESETS = {
    t1e3: ['Tema 1, ej. 3', [[2, 2, '01'], [-2, 2, '10'], [-2, -2, '00'], [2, -2, '11']], '80000'],
    t3a: ['Tema 3, ej. 2a', [[2, 0, '0'], [-2, 0, '1']]],
    t3b: ['Tema 3, ej. 2b', [[2, 0, '00'], [0, 2, '01'], [-2, 0, '10'], [0, -2, '11']]],
    bisa: ['Otra versión, 2a', [[0, 0, '0'], [2, 0, '1']]],
    bisb: ['Otra versión, 2b', [[2, 2, '10'], [-2, 2, '00'], [-2, -2, '01'], [2, -2, '11']]],
    q8: ['8-QAM de la cátedra', Object.entries(X.MODS.qam8C.map).map(([b, p]) => [Math.round(p.i * 2), Math.round(p.q * 2), b])],
  };
  L.constlector = (el, cfg) => {
    let pts = (PRESETS[cfg.preset || 't1e3'][1]).map(([i, q, b]) => ({ i, q, b }));
    let active = -1, timer = null;
    el.insertAdjacentHTML('beforeend', `
      <div class="lab-row presets" role="group" aria-label="Constelaciones de los parciales">${Object.entries(PRESETS).map(([k, [t]]) => `<button type="button" class="btn sm" data-p="${k}">${t}</button>`).join('')}<button type="button" class="btn sm" data-p="clear">Vaciar</button></div>
      <div class="cl-grid">
        <div class="scope cl-plane"><p class="scope-cap">Tocá la grilla para poner o sacar puntos</p><div class="cl-svg"></div></div>
        <div class="cl-side"><div class="lab-in">${textIn('seq', 'Secuencia a transmitir', cfg.seq || '11000110')}${textIn('R', 'Velocidad R [bps]', PRESETS[cfg.preset || 't1e3'][2] || '10000')}</div><div class="cl-steps" aria-live="polite"></div></div>
      </div>
      <div class="scope cl-wave"><div class="lab-row"><button type="button" class="btn sm primary" data-act="play">Transmitir la secuencia</button><span class="scope-cap">Tocá un símbolo para ver su punto</span></div><div class="wave-wrap"></div></div>
      <div class="cl-table"></div>`);
    const $ = (s) => el.querySelector(s);
    const S = 260, G = 3, k = (S / 2 - 18) / (G + 0.6);
    const draw = () => {
      // bits: los que trae el preset; si el punto es nuevo, en orden de fase y amplitud
      const n = Math.max(1, Math.ceil(Math.log2(Math.max(2, pts.length))));
      const auto = [...pts].sort((a, b) => X.point(a.i, a.q).th - X.point(b.i, b.q).th || Math.hypot(a.i, a.q) - Math.hypot(b.i, b.q));
      pts.forEach((p) => { if (!p.b || p.b.length !== n) p.b = auto.indexOf(p).toString(2).padStart(n, '0'); });
      const grid = [];
      for (let i = -G; i <= G; i++) for (let q = -G; q <= G; q++) grid.push(`<circle cx="${S / 2 + i * k}" cy="${S / 2 - q * k}" r="9" class="cl-slot" data-i="${i}" data-q="${q}" tabindex="0" role="button" aria-label="Punto (${i}, ${q})"/>`);
      const svg = constPlane(pts.map((p, j) => ({ i: p.i, q: p.q, label: p.b, on: j === active })), { size: S, max: G + 0.6, circles: [...new Set(pts.map((p) => +Math.hypot(p.i, p.q).toFixed(3)))].filter((r) => r > 0), alt: 'Constelación editable' });
      $('.cl-svg').innerHTML = svg.replace('</svg>', `<g class="cl-slots">${grid.join('')}</g></svg>`);
      const M = pts.length, info = M >= 2 ? X.classify(pts.map((p) => [p.i, p.q])) : null;
      const R = X.parseNum($('[data-t="R"]').value) || 0;
      const pow2 = M >= 2 && (M & (M - 1)) === 0;
      const why = !info ? '' : info.kind === 'PSK' ? `todos a la misma distancia (${num(info.amps[0], 2)}) y ${info.phases.length} fases distintas` : info.kind === 'ASK' ? 'cambia solo la amplitud, sobre una misma recta' : `${info.amps.length} amplitudes y ${info.phases.length} fases: combina amplitud y fase`;
      const name = !info ? '' : info.kind === 'PSK' ? ({ 2: 'BPSK', 4: 'QPSK (4-PSK)', 8: '8-PSK' }[M] || `${M}-PSK`) : info.kind === 'ASK' ? (M === 2 && info.amps.includes(0) ? 'ASK (OOK)' : `${M}-ASK`) : `${M}-QAM`;
      $('.cl-steps').innerHTML = M < 2 ? '<p class="lab-note">Poné al menos dos puntos.</p>' : `<ol class="steps">
        <li><b>Contar los puntos.</b> M = ${M}${pow2 ? ` → n = log₂${M} = <strong>${n} bit${n > 1 ? 's' : ''}</strong> por símbolo` : ' (no es potencia de 2: faltan o sobran puntos)'}.</li>
        <li><b>Distancias al centro.</b> ${info.amps.map((a) => num(a, 2)).join(', ')}.</li>
        <li><b>Decidir.</b> ${why} → <strong>${name}</strong>.</li>
        ${R ? `<li><b>Baudios.</b> r = R / n = ${eng(R, 'bps')} / ${n} = <strong>${eng(R / n, 'baudios')}</strong>; T<sub>s</sub> = ${eng(n / R, 's')}.</li>` : ''}</ol>`;
      $('.cl-table').innerHTML = M < 2 ? '' : `<div class="table-wrap"><table><thead><tr><th>Bits</th><th>(I, Q)</th><th>Amplitud √(I² + Q²)</th><th>Fase</th></tr></thead><tbody>${[...pts].sort((a, b) => a.b.localeCompare(b.b)).map((p) => {
        const c = X.point(p.i, p.q);
        const f = c.A < 1e-9 ? '— (apagada)' : c.quad === 0 ? `${deg(c.th)} (sobre un eje)` : c.quad === 1 ? `arctg(${Math.abs(p.q)}/${Math.abs(p.i)}) = ${deg(c.ref)}` : `${['', '', '180° − ', '180° + ', '360° − '][c.quad]}${deg(c.ref)} = ${deg(c.th)}`;
        return `<tr><td class="mono">${p.b}</td><td>(${p.i}, ${p.q})</td><td>${num(c.A, 2)}</td><td>${f}</td></tr>`;
      }).join('')}</tbody></table></div>`;
      // la secuencia, símbolo por símbolo
      const bits = bitsOnly($('[data-t="seq"]').value, 48);
      const groups = M >= 2 ? X.groups(bits, n) : [];
      const byBits = Object.fromEntries(pts.map((p) => [p.b, p]));
      const syms = groups.map((g, j) => { const p = byBits[g]; const c = p ? X.point(p.i, p.q) : { A: 0, th: 0 }; return { A: c.A, ph: c.th, cyc: 1.5, top: g, bottom: p ? (c.A ? deg(c.th) : 'A = 0') : '?', on: active >= 0 && pts[active] === p && j === playing }; });
      $('.cl-wave .wave-wrap').innerHTML = syms.length ? symbolWave(syms, { sw: 64, h: 120, alt: 'Secuencia modulada' }) : '<p class="lab-note">Escribí una secuencia de bits.</p>';
    };
    let playing = -1;
    const focusSym = (j) => {
      const bits = bitsOnly($('[data-t="seq"]').value, 48), n = Math.max(1, Math.ceil(Math.log2(Math.max(2, pts.length))));
      const g = X.groups(bits, n)[j];
      playing = j; active = pts.findIndex((p) => p.b === g); draw();
    };
    el.addEventListener('click', (e) => {
      const slot = e.target.closest('.cl-slot');
      if (slot) {
        const i = +slot.dataset.i, q = +slot.dataset.q, at = pts.findIndex((p) => p.i === i && p.q === q);
        if (at >= 0) pts.splice(at, 1); else if (pts.length < 16) pts.push({ i, q });
        pts.forEach((p) => { delete p.b; }); active = -1; draw(); return;
      }
      const b = e.target.closest('[data-p]');
      if (b) { clearInterval(timer); pts = b.dataset.p === 'clear' ? [] : PRESETS[b.dataset.p][1].map(([i, q, bb]) => ({ i, q, b: bb })); if (PRESETS[b.dataset.p]?.[2]) $('[data-t="R"]').value = PRESETS[b.dataset.p][2]; active = playing = -1; draw(); return; }
      const sym = e.target.closest('.sw-sym');
      if (sym) { clearInterval(timer); focusSym(+sym.dataset.i); return; }
      if (e.target.closest('[data-act="play"]')) {
        clearInterval(timer);
        const total = X.groups(bitsOnly($('[data-t="seq"]').value, 48), Math.max(1, Math.ceil(Math.log2(Math.max(2, pts.length))))).length;
        let j = 0; focusSym(0);
        timer = setInterval(() => { j++; if (j >= total || !el.isConnected) { clearInterval(timer); return; } focusSym(j); }, 900);
      }
    });
    el.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.cl-slot')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) { active = playing = -1; draw(); } });
    draw();
  };

  /* ---------- ¿Qué modulación es? Diagramas de tiempo al azar ---------- */
  const POOL = [
    { k: 'ask', name: 'ASK (OOK)', what: 'amp', n: 1, map: { 0: [0, 0], 1: [1, 0] } },
    { k: 'ask4', name: '4-ASK', what: 'amp', n: 2, map: { '00': [0.25, 0], '01': [0.5, 0], '10': [0.75, 0], '11': [1, 0] } },
    { k: 'fsk', name: 'FSK', what: 'freq', n: 1, map: { 0: [1, 0], 1: [1, 0] }, cyc: { 0: 1, 1: 2.5 } },
    { k: 'bpsk', name: 'BPSK', what: 'phase', n: 1, mod: 'bpskC' },
    { k: 'qpsk', name: 'QPSK', what: 'phase', n: 2, mod: 'qpsk' },
    { k: 'psk4', name: '4-PSK sobre los ejes', what: 'phase', n: 2, mod: 'psk4' },
    { k: 'psk8', name: '8-PSK', what: 'phase', n: 3, mod: 'psk8C' },
    { k: 'qam8', name: '8-QAM', what: 'both', n: 3, mod: 'qam8C' },
  ];
  const WHAT = [['amp', 'La amplitud'], ['freq', 'La frecuencia'], ['phase', 'La fase'], ['both', 'Amplitud y fase']];
  L.diagrama = (el) => {
    let cur, step, score = { ok: 0, n: 0 }, showBits = false;
    el.insertAdjacentHTML('beforeend', `<div class="scope"><div class="lab-row"><span class="scope-cap dg-meta"></span><label class="sw-bits"><input type="checkbox"> Mostrar los bits</label></div><div class="wave-wrap"></div></div><div class="dg-q" aria-live="polite"></div>`);
    const $ = (s) => el.querySelector(s);
    const symsOf = (c) => {
      const keys = Object.keys(c.mod ? X.MODS[c.mod].map : c.map);
      const order = [];
      while (order.length < (keys.length >= 8 ? 8 : 6)) order.push(...shuffle(keys));
      order.length = keys.length >= 8 ? 8 : 6;
      return order.map((b) => {
        if (c.mod) { const p = X.MODS[c.mod].map[b]; return { b, A: p.A, ph: p.ph < 0 ? p.ph + 360 : p.ph, cyc: 2 }; }
        return { b, A: c.map[b][0], ph: 0, cyc: c.cyc ? c.cyc[b] : 2 };
      });
    };
    const drawWave = () => { $('.wave-wrap').innerHTML = symbolWave(cur.syms.map((s) => ({ ...s, top: showBits ? s.b : null })), { sw: 70, h: 120, alt: 'Diagrama de tiempo a identificar' }); };
    const next = () => {
      const c = POOL[Math.floor(Math.random() * POOL.length)];
      const R = [1e3, 9600, 10e3, 80e3][Math.floor(Math.random() * 4)];
      cur = { c, R, syms: symsOf(c) };
      step = 0;
      $('.dg-meta').textContent = `Transmisión a ${eng(R, 'bps')}. Aciertos: ${score.ok} de ${score.n}`;
      drawWave(); ask();
    };
    const ask = () => {
      const c = cur.c, M = 2 ** c.n;
      if (step === 0) $('.dg-q').innerHTML = `<p class="drill-t">1. Compará un símbolo con el siguiente: ¿qué cambia?</p><div class="drill-opts">${WHAT.map(([k, t]) => `<button type="button" class="btn sm" data-w="${k}">${t}</button>`).join('')}</div>`;
      if (step === 1) $('.dg-q').innerHTML = `<p class="drill-t">2. ¿Cuántos símbolos distintos hay (M)?</p><div class="drill-opts">${[2, 4, 8].map((m) => `<button type="button" class="btn sm" data-m="${m}">M = ${m}</button>`).join('')}</div>`;
      if (step === 2) {
        const r = cur.R / c.n;
        $('.dg-q').innerHTML = `<div class="dg-answer"><p class="drill-t">Es <strong>${c.name}</strong>: ${c.n} bit${c.n > 1 ? 's' : ''} por símbolo.</p>
          <ol class="steps"><li>r = R / log₂M = ${eng(cur.R, 'bps')} / ${c.n} = <strong>${eng(r, 'baudios')}</strong></li><li>T<sub>s</sub> = 1 / r = <strong>${eng(1 / r, 's')}</strong>; T<sub>b</sub> = 1 / R = ${eng(1 / cur.R, 's')}</li></ol>
          ${c.mod ? `<div class="fig-c">${constPlane(Object.entries(X.MODS[c.mod].map).map(([b, p]) => ({ i: p.i, q: p.q, label: b })), { size: 200, circles: [...new Set(Object.values(X.MODS[c.mod].map).map((p) => +p.A.toFixed(3)))] })}</div>` : `<p class="lab-note">${c.k === 'fsk' ? 'FSK no se dibuja en el plano I/Q: el 0 y el 1 usan dos frecuencias (f₁ y f₂) con la misma amplitud.' : 'Los puntos de ASK quedan sobre una sola recta (el eje I), a distintas distancias.'}</p>`}
          <button type="button" class="btn primary sm" data-act="next">Otro diagrama</button></div>`;
        $('.sw-bits input').checked = showBits = true; drawWave();
      }
    };
    el.addEventListener('change', (e) => { if (e.target.matches('.sw-bits input')) { showBits = e.target.checked; drawWave(); } });
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.act === 'next') { next(); return; }
      const c = cur.c;
      const good = b.dataset.w ? b.dataset.w === c.what : +b.dataset.m === 2 ** c.n;
      b.classList.add(good ? 'is-right' : 'is-wrong');
      if (!good) { b.disabled = true; score.n++; $('.dg-meta').textContent = `Transmisión a ${eng(cur.R, 'bps')}. Aciertos: ${score.ok} de ${score.n}`; const hint = b.dataset.w ? 'Mirá la altura de cada tramo, lo apretado de los ciclos y dónde arranca la onda en cada línea punteada.' : 'Contá cuántas formas distintas de tramo aparecen (altura + punto de arranque).'; if (!el.querySelector('.dg-hint')) b.parentElement.insertAdjacentHTML('afterend', `<p class="lab-note dg-hint">${hint}</p>`); return; }
      score.ok++; score.n++; step++; ask();
    });
    next();
  };

  /* ---------- De NRZ a una M-aria: anchos de banda ---------- */
  L.nrzmod = (el, cfg) => {
    let M = String(cfg.M || 8);
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('M', 'Modulación M-aria', [['2', 'M = 2 (BPSK)'], ['4', 'M = 4 (QPSK)'], ['8', 'M = 8 (8-PSK u 8-QAM)'], ['16', 'M = 16 (16-QAM)'], ['64', 'M = 64 (64-QAM)']], M)}</div>`);
    const v = sliders(el, [{ id: 'tb', label: 'Tiempo de bit T<sub>b</sub> [µs]', min: 10, max: 500, step: 10, value: cfg.tb || 100, fmt: (x) => `${x} µs` }], () => draw());
    el.insertAdjacentHTML('beforeend', '<div class="pl-pair"><div class="scope"><p class="scope-cap">Banda base NRZ</p><div class="pl-host nm-a"></div></div><div class="scope"><p class="scope-cap">Señal modulada alrededor de f<sub>c</sub></p><div class="pl-host nm-b"></div></div></div><div class="lab-read nm-r" aria-live="polite"></div>');
    let first = true;
    const sinc2 = (x) => (Math.abs(x) < 1e-9 ? 1 : (Math.sin(Math.PI * x) / (Math.PI * x)) ** 2);
    const draw = () => {
      const Tb = v.tb * 1e-6, R = 1 / Tb, n = Math.log2(+M), r = R / n, kHz = 1e3;
      const B0 = R / kHz, Bm = r / kHz, top = B0 * 2.6;
      el.querySelector('.nm-a').innerHTML = plot({ x: [0, top], y: [0, 1.15], w: 300, h: 190, xl: 'f [kHz]', yl: ' ', anim: first, ticks: { x: [B0, 2 * B0] },
        areas: [{ pts: [[0, 0], ...Array.from({ length: 41 }, (_, j) => [B0 * j / 40, sinc2(j / 40)]), [B0, 0]], cls: 'a-sig' }],
        curves: [{ f: (f) => sinc2(f / B0), n: 200, cls: 'c-sig' }], texts: [{ x: B0 / 2, y: 0.45, t: `B = ${num(B0, 2)} kHz`, cls: 'c-sig' }] });
      const fc = 3 * Bm, span = fc + 2.6 * Bm;
      el.querySelector('.nm-b').innerHTML = plot({ x: [0, span], y: [0, 1.15], w: 300, h: 190, xl: 'f [kHz]', yl: ' ', anim: first, ticks: { x: [fc - Bm, fc, fc + Bm] },
        areas: [{ pts: [[fc - Bm, 0], ...Array.from({ length: 41 }, (_, j) => { const f = fc - Bm + (2 * Bm * j) / 40; return [f, sinc2((f - fc) / Bm)]; }), [fc + Bm, 0]], cls: 'a-mod' }],
        curves: [{ f: (f) => sinc2((f - fc) / Bm), n: 240, cls: 'c-mod' }], vlines: [{ x: fc, cls: 'pl-faint', label: 'f_c' }], texts: [{ x: fc, y: 0.45, t: `2B = ${num(2 * Bm, 2)} kHz`, cls: 'c-mod' }] });
      first = false;
      el.querySelector('.nm-r').innerHTML = `<ol class="steps">
        <li>R = 1 / T<sub>b</sub> = 1 / ${v.tb} µs = <strong>${eng(R, 'bps')}</strong></li>
        <li>Banda base NRZ: B = 1 / T<sub>b</sub> = <strong>${num(B0, 2)} kHz</strong></li>
        <li>n = log₂${M} = ${n} → r = R / n = <strong>${eng(r, 'baudios')}</strong></li>
        <li>Modulada (fórmula de las M-arias): B<sub>M-ario</sub> = R / log₂M = <strong>${num(Bm, 3)} kHz</strong>. El dibujo ocupa 2B alrededor de la portadora: ${num(2 * Bm, 3)} kHz.</li></ol>`
        + chips([['Ahorro de ancho de banda', `${num(B0 / Bm, 2)} veces`, 'acc'], ['T<sub>s</sub> = n·T<sub>b</sub>', `${num(n * v.tb, 0)} µs`]]);
    };
    el.querySelector('[data-s="M"]').addEventListener('change', (e) => { M = e.target.value; draw(); });
    draw();
  };
})();
