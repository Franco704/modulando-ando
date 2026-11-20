/* Laboratorios de la Unidad 8: modulaciones digitales, constelación con ruido, PCM y AM/FM/PM. */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;
  const { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss, constPlane, symbolWave } = window.GUIDE.labUtil;
  /* ---------- Modulaciones digitales: onda y constelación ---------- */
  L.modulation = (el, cfg) => {
    let mk = cfg.mod || 'qpsk', active = -1, timer = null;
    const ORDER = ['ask', 'fsk', 'bpskC', 'psk4', 'qpsk', 'ask4', 'psk8C', 'qam8C', 'bpsk', 'psk8', 'qam8', 'psk16', 'qam16'];
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('b', 'Bits', cfg.bits || '101100011110001001101011')}${textIn('r', 'Tasa binaria R [bit/s]', cfg.rate || '96000')}</div>
      <div class="lab-row">${select('m', 'Modulación', ORDER.map((k) => [k, X.MODS[k].name + (['bpsk', 'psk8', 'qam8'].includes(k) ? ' (Tomasi)' : '')]), mk)}<button type="button" class="btn sm primary" data-act="play">Reproducir</button></div>
      <div class="md-grid"><div class="scope md-wave"><p class="scope-cap">Tocá un símbolo para ver su punto</p><div class="wave-wrap"></div></div><div class="scope md-plane"></div></div><div class="md-out" aria-live="polite"></div>`);
    const draw = () => {
      const mod = X.MODS[mk];
      const bits = bitsOnly(el.querySelector('[data-t="b"]').value, 48);
      const Rb = X.parseNum(el.querySelector('[data-t="r"]').value) || 0;
      if (!bits) { el.querySelector('.md-out').innerHTML = '<p class="lab-note">Escribí una secuencia de bits.</p>'; return; }
      const syms = X.groups(bits, mod.n).slice(0, 16);
      const amax = Math.max(...Object.values(mod.map).map((p) => p.A || 1));
      el.querySelector('.md-wave .wave-wrap').innerHTML = symbolWave(syms.map((s, i) => { const p = mod.map[s]; return { A: p.A || 0, ph: p.ph || 0, cyc: mod.freq ? 1 + mod.freq[s] * 0.75 : 2, top: s, on: i === active }; }), { sw: 64, h: 120, amax, alt: `Señal ${mod.name}` });
      const cur = active >= 0 ? syms[active] : null;
      el.querySelector('.md-plane').innerHTML = mod.freq ? '<p class="lab-note">FSK no se dibuja en el plano I/Q: el 0 y el 1 usan dos frecuencias con la misma amplitud.</p>'
        : constPlane(Object.entries(mod.map).map(([b, p]) => ({ i: p.i, q: p.q, label: b, on: b === cur })), { size: 230, circles: [...new Set(Object.values(mod.map).map((p) => +p.A.toFixed(3)))].filter((r) => r > 0), alt: `Constelación ${mod.name}` });
      const r = Rb / mod.n, M = 2 ** mod.n, p = cur && mod.map[cur];
      el.querySelector('.md-out').innerHTML = (p ? `<p class="md-now">Símbolo ${active + 1}: <span class="mono">${cur}</span> → amplitud ${num(p.A, 3)}, fase ${num(p.ph < 0 ? p.ph + 360 : p.ph, 1)}°</p>` : '')
        + chips([['M', `${M} símbolos`], ['n = log₂M', `${mod.n} bit/símbolo`, 'acc'], [`Símbolos para ${bits.length} bits`, Math.ceil(bits.length / mod.n)], ['r = R/n', eng(r, 'baud')], ['T<sub>s</sub> = 1/r', eng(1 / r, 's')], ['T<sub>b</sub> = 1/R', eng(1 / Rb, 's')]])
        + `<p class="lab-note">${mk.endsWith('C') || mk === 'psk4' ? 'Tabla de la cátedra (diapositivas de la Unidad 8): la que se usa en el parcial.' : mk.startsWith('qam') ? 'QAM combina amplitud y fase: M ≤ fases × amplitudes. Más puntos en el mismo plano → más juntos → más sensibles al ruido.' : mk === 'ask4' ? '4-ASK y QPSK llevan 2 bits por símbolo: misma tasa de baudios, pero 4-ASK distingue alturas (más sensible al ruido) y QPSK fases.' : mk === 'fsk' ? 'FSK: el 1 y el 0 se distinguen por la frecuencia; la amplitud es constante.' : 'QPSK de la cátedra: 00 → 135°, 01 → 225°, 10 → 45°, 11 → 315°.'}</p>`;
    };
    const total = () => X.groups(bitsOnly(el.querySelector('[data-t="b"]').value, 48), X.MODS[mk].n).slice(0, 16).length;
    el.querySelector('[data-s="m"]').addEventListener('change', (e) => { mk = e.target.value; active = -1; clearInterval(timer); draw(); });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) { active = -1; draw(); } });
    el.addEventListener('click', (e) => {
      const sym = e.target.closest('.sw-sym');
      if (sym) { clearInterval(timer); active = +sym.dataset.i; draw(); return; }
      if (e.target.closest('[data-act="play"]')) {
        clearInterval(timer); active = 0; draw();
        timer = setInterval(() => { if (!el.isConnected || ++active >= total()) { clearInterval(timer); if (el.isConnected) { active = -1; draw(); } return; } draw(); }, 800);
      }
    });
    draw();
  };

  /* ---------- Constelación con ruido y QAM adaptativo ---------- */
  const QAM_SNR = [[2, 'QPSK', 15.8], [4, '16-QAM', 21.8], [6, '64-QAM', 27.8], [8, '256-QAM', 33.8], [9, '512-QAM', 36.8], [10, '1024-QAM', 39.8], [12, '4096-QAM', 45.8], [14, '16384-QAM', 51.8]];
  L.constellation = (el, cfg) => {
    let M = String(cfg.M || 16);
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('M', 'Constelación', [['4', 'QPSK (4)'], ['16', '16-QAM'], ['64', '64-QAM']], M)}</div>`);
    const v = sliders(el, [{ id: 's', label: 'SNR [dB]', min: 0, max: 45, step: 1, value: cfg.snr ?? 20 }, { id: 'baud', label: 'Tasa de símbolos [baudios]', min: 500, max: 5000, step: 500, value: 1000 }], () => draw());
    const [host, read] = shell(el);
    const draw = () => {
      const m = +M, side = Math.sqrt(m), lv = Array.from({ length: side }, (_, k) => 2 * k - side + 1);
      const pts = lv.flatMap((i) => lv.map((q) => [i, q]));
      const Es = pts.reduce((a, [i, q]) => a + i * i + q * q, 0) / m;
      const sigma = Math.sqrt(Es / X.fromDb(v.s) / 2);
      const r = rng(7);
      let err = 0;
      const cloud = [];
      for (let k = 0; k < 600; k++) {
        const [i, q] = pts[k % m], ri = i + sigma * gauss(r), rq = q + sigma * gauss(r);
        const dec = (x) => Math.max(lv[0], Math.min(lv.at(-1), 2 * Math.round((x + side - 1) / 2) - side + 1));
        if (dec(ri) !== i || dec(rq) !== q) err++;
        cloud.push([ri, rq, dec(ri) !== i || dec(rq) !== q]);
      }
      const lim = side + 0.4;
      host.innerHTML = plot({ x: [-lim, lim], y: [-lim, lim], w: 320, h: 320, xl: 'I', yl: 'Q', anim: false,
        vlines: lv.slice(1).map((x) => ({ x: x - 1, cls: 'pl-faint' })), hlines: lv.slice(1).map((y) => ({ y: y - 1, cls: 'pl-faint' })),
        points: [...cloud.map(([x, y, bad]) => ({ x, y, r: 1.6, cls: bad ? 'c-stop' : 'c-sig' })), ...pts.map(([x, y]) => ({ x, y, r: 3.5, cls: 'c-res' }))] });
      const best = [...QAM_SNR].reverse().find(([, , s]) => v.s >= s);
      read.innerHTML = chips([['Símbolos mal decididos', `${err} de 600 (${num((err / 600) * 100, 1)} %)`, err ? 'err' : 'ok'], ['Mejor QAM para BER < 10⁻⁷', best ? `${best[1]}: ${best[0]} bit/símbolo` : 'ninguno de la tabla', 'acc'], best && ['Tasa de datos', `${v.baud} baud × ${best[0]} = ${eng(v.baud * best[0], 'bps')}`]])
        + '<p class="lab-note">Cada nube es un símbolo recibido con ruido; el receptor decide por el punto más cercano (las líneas finas son los bordes de decisión). Con más puntos en el plano, la misma SNR alcanza para equivocarse: por eso el QAM adaptativo baja de 256-QAM a 16-QAM o QPSK cuando empeora el canal. La tabla de la cátedra da la SNR mínima de cada orden.</p>';
    };
    el.querySelector('[data-s="M"]').addEventListener('change', (e) => { M = e.target.value; draw(); });
    draw();
  };

  /* ---------- PCM: muestreo, cuantificación y codificación ---------- */
  L.pcm = (el, cfg) => {
    const v = sliders(el, [
      { id: 'n', label: 'Bits por muestra n', min: 1, max: 8, step: 1, value: cfg.n || 3 },
      { id: 'fs', label: 'Muestras por período de la señal', min: 4, max: 32, step: 1, value: cfg.k || 12 },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const draw = () => {
      const Lv = 2 ** v.n, D = 2 / Lv;
      const s = (t) => 0.9 * Math.sin(2 * PI * t) + 0.08 * Math.sin(6 * PI * t);
      const q = (x) => Math.min(Lv - 1, Math.max(0, Math.floor((x + 1) / D)));   // índice del nivel
      const mid = (k) => -1 + (k + 0.5) * D;
      const N = v.fs, samples = Array.from({ length: N }, (_, k) => k / N);
      const stair = samples.flatMap((t) => [[t, mid(q(s(t)))], [t + 1 / N, mid(q(s(t)))]]);
      host.innerHTML = plot({ x: [0, 1], y: [-1.2, 1.3], w: 460, h: 260, xl: 't / T', yl: 'x', anim: first, ticks: { x: [0.25, 0.5, 0.75, 1], y: [-1, 1] },
        hlines: Lv <= 16 ? Array.from({ length: Lv - 1 }, (_, k) => ({ y: -1 + (k + 1) * D, cls: 'pl-faint' })) : [],
        curves: [{ f: s, n: 300, cls: 'c-sig', label: 'analógica' }, { pts: stair, cls: 'c-res', label: 'cuantificada' }],
        points: samples.map((t) => ({ x: t, y: s(t), r: 3, cls: 'c-sig' })) });
      first = false;
      const codes = samples.slice(0, 6).map((t) => q(s(t)).toString(2).padStart(v.n, '0'));
      read.innerHTML = chips([['Niveles 2ⁿ', Lv, 'acc'], ['Escalón Δ', num(D, 4)], ['Error máximo Δ/2', num(D / 2, 4)], ['SQNR ≈ 6,02n + 1,76', `${num(6.02 * v.n + 1.76, 1)} dB`], ['Primeras palabras', codes.join(' ')], ['Tasa', `fs × n = ${N} × ${v.n} = ${N * v.n} bits por período`]])
        + '<p class="lab-note">PCM: muestreo (PAM), cuantificación (se redondea cada muestra al nivel más cercano: ahí aparece el error o ruido de cuantificación) y codificación (cada nivel se escribe en n bits). Cada bit extra duplica los niveles y suma ~6 dB de relación señal/ruido de cuantificación. La telefonía usa 8 kHz × 8 bits = 64 kbps con cuantificación no uniforme (ley A en Europa y Argentina, ley µ en EE. UU.).</p>';
    };
    draw();
  };

  /* ---------- Modulación analógica: AM, FM y PM ---------- */
  L.analog = (el, cfg) => {
    let kind = cfg.kind || 'am';
    toggle(el, 'Tipo', [['am', 'AM'], ['fm', 'FM'], ['pm', 'PM']], kind, (k) => { kind = k; draw(); });
    const v = sliders(el, [{ id: 'm', label: 'Índice de modulación', min: 0, max: 1.5, step: 0.05, value: 0.7 }, { id: 'fc', label: 'Portadora (ciclos por ciclo de la moduladora)', min: 6, max: 30, step: 1, value: 14 }], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const draw = () => {
      const a = (t) => Math.sin(2 * PI * t);
      const mod = {
        am: (t) => (1 + v.m * a(t)) * Math.cos(2 * PI * v.fc * t),
        fm: (t) => Math.cos(2 * PI * v.fc * t - v.m * 4 * Math.cos(2 * PI * t)),
        pm: (t) => Math.cos(2 * PI * v.fc * t + v.m * 2 * a(t)),
      }[kind];
      host.innerHTML = plot({ x: [0, 1], y: [-2.7, 2.7], w: 460, h: 240, xl: 't', yl: ' ', anim: first, ticks: { y: [-1, 1] },
        curves: [{ f: mod, n: 1400, cls: 'c-mod', label: 'modulada' }, { f: (t) => (kind === 'am' ? 1 + v.m * a(t) : 2.2 + 0.4 * a(t)), n: 200, cls: 'c-sig', dash: true, label: 'moduladora' }] });
      first = false;
      read.innerHTML = `<p class="lab-note">${{ am: `AM: la amplitud de la portadora sigue a la moduladora. Con índice m > 1 hay sobremodulación: la envolvente se cruza y el receptor de envolvente distorsiona (${v.m > 1 ? 'pasa ahora' : 'probá con m > 1'}).`, fm: 'FM: la frecuencia instantánea sube y baja con la moduladora; la amplitud es constante, por eso es más inmune al ruido de amplitud, a costa de más ancho de banda.', pm: 'PM: la fase de la portadora se adelanta y atrasa con la moduladora. FM y PM son modulaciones angulares: en FM manda la moduladora y en PM su derivada.' }[kind]}</p>`;
    };
    draw();
  };
})();
