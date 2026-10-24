/* Laboratorios de Comunicación de Datos. Cada uno redibuja al mover un control; la primera vista se anima y los redibujos no.
   Los cálculos vienen de cx.js (los mismos que usan las soluciones y las pruebas). */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;

  // ---------- Controles ----------
  // Deslizadores: defs = [{ id, label, min, max, step, value, fmt? }]
  function sliders(el, defs, onChange) {
    const v = Object.fromEntries(defs.map((d) => [d.id, d.value]));
    el.insertAdjacentHTML('beforeend', `<div class="sl-grid">${defs.map((d) => `
      <label class="sl"><span class="sl-l">${d.label}</span>
        <input type="range" data-id="${d.id}" min="${d.min}" max="${d.max}" step="${d.step || 1}" value="${d.value}">
        <output data-o="${d.id}">${d.fmt ? d.fmt(d.value) : num(d.value)}</output></label>`).join('')}</div>`);
    el.querySelectorAll('.sl input').forEach((inp) => {
      const d = defs.find((x) => x.id === inp.dataset.id);
      if (!d) return;
      inp.addEventListener('input', () => {
        v[d.id] = +inp.value;
        el.querySelector(`[data-o="${d.id}"]`).textContent = d.fmt ? d.fmt(v[d.id]) : num(v[d.id]);
        onChange(v, d.id);
      });
    });
    return v;
  }
  // Grupo de botones excluyentes: opts = [[valor, texto]]
  function toggle(el, label, opts, val, onChange) {
    el.insertAdjacentHTML('beforeend', `<div class="toggle" role="group" aria-label="${label}">${opts.map(([k, t]) => `<button type="button" data-k="${k}" aria-pressed="${k === val}">${t}</button>`).join('')}</div>`);
    const box = [...el.querySelectorAll('.toggle')].at(-1);
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      onChange(b.dataset.k);
    }));
  }
  const select = (id, label, opts, val) => `<label class="lab-sel"><span>${label}</span><select data-s="${id}">${opts.map(([k, t]) => `<option value="${k}" ${k === val ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`;
  const textIn = (id, label, val, extra = '') => `<label><span>${label}</span><input type="text" data-t="${id}" value="${esc(val)}" spellcheck="false" autocomplete="off" ${extra}></label>`;
  const chips = (arr) => `<div class="rd">${arr.filter(Boolean).map(([k, val, cls]) => `<span class="chip ${cls || ''}"><b>${k}</b> <span>${val}</span></span>`).join('')}</div>`;
  const shell = (el) => { el.insertAdjacentHTML('beforeend', '<div class="pl-host"></div><div class="lab-read" aria-live="polite"></div>'); return [el.querySelector('.pl-host'), el.querySelector('.lab-read')]; };
  const niceTicks = ([a, b], n = 5) => {
    const raw = (b - a) / n, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw);
    const out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  };
  // Formato con prefijo: 133160000 → "133,16 M"
  function eng(v, unit = '', d = 3) {
    if (!Number.isFinite(v)) return '—';
    if (v === 0) return `0 ${unit}`;
    const P = [[1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f']];
    const [f, p] = P.find(([f]) => Math.abs(v) >= f * 0.9995) || P.at(-1);
    return `${num(v / f, d)} ${p}${unit}`;
  }
  const bitsOnly = (s, max = 64) => String(s).replace(/[^01]/g, '').slice(0, max);
  // Generador pseudoaleatorio con semilla (el ruido se ve igual en cada redibujo)
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * PI * r());
  window.GUIDE.labUtil = { sliders, toggle, select, chips, shell, eng, niceTicks };

  /* ---------- Onda senoidal: A, f, fase, período y longitud de onda ---------- */
  const MEDIA = { vac: [3e8, 'aire / vacío (3·10⁸ m/s)'], cu: [2e8, 'cobre (≈ 2·10⁸ m/s)'], fo: [2.04e8, 'fibra (≈ 2·10⁸ m/s)'], snd: [340, 'sonido en el aire (340 m/s)'] };
  L.wave = (el, cfg) => {
    let med = 'vac';
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('m', 'Medio', Object.entries(MEDIA).map(([k, [, t]]) => [k, t]), med)}</div>`);
    const v = sliders(el, [
      { id: 'A', label: 'Amplitud A [V]', min: 0.5, max: 5, step: 0.5, value: cfg.A || 3 },
      { id: 'f', label: 'Frecuencia f [Hz]', min: 50, max: 1000, step: 50, value: cfg.f || 250 },
      { id: 'ph', label: 'Fase φ [°]', min: 0, max: 360, step: 15, value: cfg.ph || 0, fmt: (x) => `${x}°` },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const draw = () => {
      const tmax = 10; // ms
      const s = (t) => v.A * Math.sin(2 * PI * v.f * t / 1000 + (v.ph * PI) / 180);
      const T = 1000 / v.f;
      const time = plot({ x: [0, tmax], y: [-5.6, 5.6], w: 440, h: 220, xl: 't [ms]', yl: 'v', anim: first, ticks: { x: niceTicks([0, tmax], 5), y: [-5, 5] },
        curves: [{ f: s, n: 600, cls: 'c-sig' }],
        segs: T <= tmax ? [{ from: [0, -5.2], to: [T, -5.2], cls: 'c-res' }] : [], texts: T <= tmax ? [{ x: T / 2, y: -4.6, t: `T = ${num(T, 3)} ms`, cls: 'c-res' }] : [],
        guides: [{ x: 0, y: s(0), xt: '', yt: num(s(0), 2) }] });
      const spec = plot({ x: [0, 1100], y: [0, 5.8], w: 440, h: 150, xl: 'f [Hz]', yl: '|A|', anim: first, ticks: { x: [250, 500, 750, 1000], y: [5] },
        segs: [{ from: [v.f, 0], to: [v.f, v.A], cls: 'stem c-sig' }], points: [{ x: v.f, y: v.A, cls: 'c-sig', r: 4, label: `${v.f} Hz`, pos: 'ne' }] });
      host.innerHTML = time + `<div class="pl-host-2">${spec}</div>`;
      first = false;
      const lam = MEDIA[med][0] / v.f;
      read.innerHTML = chips([['T', `${num(T, 4)} ms = ${num(T * 1000, 1)} µs = ${num(T / 1000, 6)} s`, 'acc'], ['ω = 2πf', `${num(2 * PI * v.f, 1)} rad/s`], ['λ = v/f', eng(lam, 'm')], ['φ', `${v.ph}° = ${num((v.ph * PI) / 180, 3)} rad`]])
        + '<p class="lab-note">El dominio del tiempo muestra la forma; el de la frecuencia, una sola línea a f con altura A: una senoidal pura tiene ancho de banda cero. La fase corre la onda en el tiempo sin cambiar su espectro de amplitud.</p>';
    };
    el.querySelector('[data-s="m"]').addEventListener('change', (e) => { med = e.target.value; draw(); });
    draw();
  };

  /* ---------- Señal compuesta: suma de senoidales y su espectro (ancho de banda absoluto) ---------- */
  L.compose = (el, cfg) => {
    const f0 = cfg.f0 || 8;
    const v = sliders(el, [
      { id: 'dc', label: 'Continua A₀', min: 0, max: 20, step: 1, value: cfg.dc ?? 15 },
      { id: 'a1', label: `A₁ a ${f0} Hz`, min: 0, max: 15, step: 1, value: cfg.a1 ?? 10 },
      { id: 'a2', label: `A₂ a ${2 * f0} Hz`, min: 0, max: 15, step: 1, value: cfg.a2 ?? 5 },
      { id: 'a3', label: `A₃ a ${3 * f0} Hz`, min: 0, max: 15, step: 1, value: cfg.a3 ?? 0 },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const draw = () => {
      const comp = [[0, v.dc], [f0, v.a1], [2 * f0, v.a2], [3 * f0, v.a3]].filter(([, a]) => a > 0);
      const s = (t) => v.dc + v.a1 * Math.sin(2 * PI * f0 * t) + v.a2 * Math.sin(2 * PI * 2 * f0 * t) + v.a3 * Math.sin(2 * PI * 3 * f0 * t);
      const ys = Array.from({ length: 200 }, (_, k) => s(k / 200 / f0 * 2));
      const lo = Math.min(0, ...ys) - 2, hi = Math.max(...ys) + 2;
      const time = plot({ x: [0, 2 / f0], y: [lo, hi], w: 440, h: 220, xl: 't [s]', yl: 'f(t)', anim: first, ticks: { x: [1 / f0, 2 / f0], y: niceTicks([lo, hi], 4) },
        curves: [{ f: s, n: 500, cls: 'c-sig' }], hlines: v.dc ? [{ y: v.dc, cls: 'c-res', label: `A₀ = ${v.dc}` }] : [] });
      const fs = comp.map(([f]) => f);
      const fmin = Math.min(...fs), fmax = Math.max(...fs);
      const spec = plot({ x: [-2, 3.6 * f0], y: [0, 22], w: 440, h: 160, xl: 'f [Hz]', yl: 'A', anim: first, ticks: { x: [f0, 2 * f0, 3 * f0], y: [10, 20] },
        segs: [...comp.map(([f, a]) => ({ from: [f, 0], to: [f, a], cls: 'stem c-sig' })), ...(comp.length > 1 ? [{ from: [fmin, 20.5], to: [fmax, 20.5], cls: 'c-res' }] : [])],
        texts: comp.length > 1 ? [{ x: (fmin + fmax) / 2, y: 21.4, t: `B = ${fmax - fmin} Hz`, cls: 'c-res' }] : [] });
      host.innerHTML = time + `<div class="pl-host-2">${spec}</div>`;
      first = false;
      read.innerHTML = chips([['f(t)', `${v.dc || ''}${comp.filter(([f]) => f).map(([f, a]) => ` + ${a} sen(2π·${f}t)`).join('')}`.replace(/^ \+ /, ''), 'acc'], ['Frecuencia fundamental', `${f0} Hz (T = ${num(1000 / f0, 1)} ms)`], ['Ancho de banda absoluto', comp.length ? `${fmax} − ${fmin} = ${fmax - fmin} Hz` : '—']])
        + '<p class="lab-note">El ancho de banda absoluto es la diferencia entre la frecuencia más alta y la más baja que contiene la señal (la continua cuenta como f = 0). Todas las componentes son múltiplos de la fundamental: por eso la suma vuelve a ser periódica.</p>';
    };
    draw();
  };

  /* ---------- Serie de Fourier: sumas parciales y espectro unilateral ---------- */
  // Coeficientes de cada forma (período normalizado): [a0/2, (n) => [an, bn]]
  const FWAVES = {
    sq: { l: 'Cuadrada ±1 (impar)', dc: 0, c: (n) => [0, n % 2 ? 4 / (n * PI) : 0], f: (u) => (u < 0.5 ? 1 : -1) },
    sq01: { l: 'Pulsos 0 y 1 (ciclo 50 %)', dc: 0.5, c: (n) => [0, n % 2 ? 2 / (n * PI) : 0], f: (u) => (u < 0.5 ? 1 : 0) },
    saw: { l: 'Diente de sierra', dc: 0, c: (n) => [0, (2 * (n % 2 ? 1 : -1)) / (n * PI)], f: (u) => (u < 0.5 ? 2 * u : 2 * u - 2) },
    tri: { l: 'Triangular (par)', dc: 0, c: (n) => [n % 2 ? 8 / (n * n * PI * PI) : 0, 0], f: (u) => (u < 0.5 ? 1 - 4 * u : 4 * u - 3) },
  };
  L.fourier = (el, cfg) => {
    let fid = cfg.fn || 'sq';
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('f', 'Forma de onda', Object.entries(FWAVES).map(([k, o]) => [k, o.l]), fid)}</div>`);
    const v = sliders(el, [
      { id: 'n', label: 'Armónicas sumadas (hasta n =)', min: 1, max: 49, step: 1, value: cfg.n || 5 },
      { id: 'T', label: 'Período T [ms]', min: 1, max: 10, step: 1, value: cfg.T || 1 },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const draw = () => {
      const o = FWAVES[fid], T = v.T;
      const S = (t) => { const u = t / T; let s = o.dc; for (let k = 1; k <= v.n; k++) { const [a, b] = o.c(k); s += a * Math.cos(2 * PI * k * u) + b * Math.sin(2 * PI * k * u); } return s; };
      const ideal = (t) => o.f((((t / T) % 1) + 1) % 1);
      const time = plot({ x: [0, 2 * T], y: [-1.5, 1.5], w: 440, h: 220, xl: 't [ms]', yl: 'f(t)', anim: first, ticks: { x: [T / 2, T, 1.5 * T, 2 * T], y: [-1, 1] },
        curves: [{ f: ideal, n: 800, cls: 'c-car', dash: true }, { f: S, n: 700, cls: 'c-sig', label: `hasta n = ${v.n}` }] });
      const M = 11, f0 = 1000 / T;
      const amps = Array.from({ length: M }, (_, k) => { const [a, b] = o.c(k + 1); return Math.hypot(a, b); });
      const spec = plot({ x: [-0.4 * f0, (M + 0.6) * f0], y: [0, 1.45], w: 440, h: 170, xl: 'f [Hz]', yl: 'cₙ', anim: first, ticks: { x: [1, 3, 5, 7, 9].map((k) => k * f0), y: [0.5, 1] },
        segs: [...(o.dc ? [{ from: [0, 0], to: [0, o.dc], cls: 'stem c-res' }] : []), ...amps.map((a, k) => ({ from: [(k + 1) * f0, 0], to: [(k + 1) * f0, a], cls: `stem c-sig${k + 1 > v.n ? ' pl-faint' : ''}` }))] });
      host.innerHTML = time + `<div class="pl-host-2">${spec}</div>`;
      first = false;
      const nz = amps.map((a, k) => [k + 1, a]).filter(([, a]) => a > 1e-9).slice(0, 4);
      read.innerHTML = chips([['f₀ = 1/T', `${num(f0, 2)} Hz`, 'acc'], ['a₀/2 (continua)', num(o.dc, 3)], ...nz.map(([k, a]) => [`c${k}`, `${num(a, 4)} a ${num(k * f0, 1)} Hz`])])
        + `<p class="lab-note">${fid === 'tri' ? 'Función par: solo cosenos (bₙ = 0) y las amplitudes caen como 1/n²: con pocas armónicas ya se parece mucho.' : fid === 'saw' ? 'Función impar: solo senos y aparecen todas las armónicas, pares e impares, con amplitud 2/(nπ).' : 'Simetría de media onda: solo armónicas impares, con amplitud ∝ 1/n.'} Cambiar T solo corre las líneas del espectro (f = n/T): los coeficientes son los mismos para T = 1 s o T = 10 s. En los saltos queda un sobrepico de ~9 % (fenómeno de Gibbs).</p>`;
    };
    el.querySelector('[data-s="f"]').addEventListener('change', (e) => { fid = e.target.value; draw(); });
    draw();
  };

  /* ---------- Tren de pulsos: espectro sinc, primer cero en 1/p ---------- */
  L.pulses = (el, cfg) => {
    const v = sliders(el, [
      { id: 'A', label: 'Amplitud A', min: 1, max: 5, step: 1, value: cfg.A || 1 },
      { id: 'p', label: 'Ancho del pulso p [ms]', min: 0.5, max: 8, step: 0.5, value: cfg.p || 4 },
      { id: 'T', label: 'Período T [ms]', min: 5, max: 60, step: 1, value: cfg.T || 20 },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const sinc = (x) => (Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x);
    const draw = () => {
      const { A, p, T } = v;
      const pulse = (t) => { const u = ((((t + T / 2) % T) + T) % T) - T / 2; return Math.abs(u) <= p / 2 ? A : 0; };
      const time = plot({ x: [-T * 1.1, T * 1.1], y: [-0.4, 5.6], w: 440, h: 190, xl: 't [ms]', yl: 'f(t)', anim: first, ticks: { x: [-T, -p / 2, p / 2, T], y: [A] },
        curves: [{ f: pulse, n: 900, cls: 'c-sig' }] });
      const f0 = 1000 / T, fz = 1000 / p, fmax = 2.6 * fz;
      const Cn = (n) => ((A * p) / T) * sinc((n * PI * p) / T);
      const nmax = Math.floor(fmax / f0);
      const top = (A * p) / T;
      const spec = plot({ x: [-fmax, fmax], y: [-top * 0.35, top * 1.25], w: 440, h: 200, xl: 'f [Hz]', yl: 'Cₙ', anim: first, ticks: { x: [-2 * fz, -fz, fz, 2 * fz] },
        curves: [{ f: (f) => top * sinc((PI * f * p) / 1000), n: 400, cls: 'c-car', dash: true }],
        segs: Array.from({ length: 2 * nmax + 1 }, (_, k) => k - nmax).map((n) => ({ from: [n * f0, 0], to: [n * f0, Cn(n)], cls: `stem ${Cn(n) < 0 ? 'c-mod' : 'c-sig'}` })),
        points: [{ x: fz, y: 0, cls: 'c-res', r: 4, label: '1/p', pos: 'n' }] });
      host.innerHTML = time + `<div class="pl-host-2">${spec}</div>`;
      first = false;
      read.innerHTML = chips([['C₀ = A·p/T', num(top, 4), 'acc'], ['f₀ = 1/T', `${num(f0, 2)} Hz`], ['Primer cero 1/p', `${num(fz, 2)} Hz`], ['Ancho de banda (hasta el primer cero)', `${num(fz, 2)} Hz`], ['Líneas por lóbulo', num(T / p, 2)]])
        + '<p class="lab-note">Las líneas están en múltiplos de 1/T y su envolvente es una sinc que se anula en 1/p, 2/p… Achicar el pulso ensancha el espectro (más ancho de banda); alargar el período junta las líneas: con T → ∞ el espectro se vuelve continuo y aparece la transformada de Fourier. Los valores negativos son armónicas desfasadas 180°.</p>';
    };
    draw();
  };

  /* ---------- Filtros: qué componentes pasan ---------- */
  L.filter = (el, cfg) => {
    let type = cfg.kind || 'lp';
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('k', 'Filtro', [['lp', 'Pasa bajos'], ['hp', 'Pasa altos'], ['bp', 'Pasa banda'], ['bs', 'Rechaza banda']], type)}</div>
      <div class="lab-in">${textIn('c', 'Componentes de la señal [Hz], separadas por coma', (cfg.comps || [100, 300, 600, 1000]).join(', '))}</div>`);
    const v = sliders(el, [
      { id: 'f1', label: 'f de corte (o f₁) [Hz]', min: 50, max: 1100, step: 10, value: cfg.fc || 400 },
      { id: 'f2', label: 'f₂ (pasa/rechaza banda) [Hz]', min: 100, max: 1200, step: 10, value: cfg.f2 || 800 },
      { id: 'n', label: 'Orden del filtro', min: 1, max: 6, step: 1, value: cfg.order || 2 },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    // Respuesta de tipo Butterworth: |H| = 1/√(1 + (f/fc)^(2n)); a fc cae a 0,707 (−3 dB)
    const lp = (f, fc, n) => 1 / Math.sqrt(1 + (f / fc) ** (2 * n));
    const hp = (f, fc, n) => (f <= 0 ? 0 : 1 / Math.sqrt(1 + (fc / f) ** (2 * n)));
    const draw = () => {
      const a = Math.min(v.f1, v.f2), b = Math.max(v.f1, v.f2);
      const H = { lp: (f) => lp(f, v.f1, v.n), hp: (f) => hp(f, v.f1, v.n), bp: (f) => lp(f, b, v.n) * hp(f, a, v.n), bs: (f) => Math.min(1, lp(f, a, v.n) + hp(f, b, v.n)) }[type];
      const comps = el.querySelector('[data-t="c"]').value.split(/[,;\s]+/).map(Number).filter((x) => x > 0 && x <= 1300).slice(0, 12);
      const res = comps.map((f) => ({ f, g: H(f), pass: H(f) >= 1 / Math.SQRT2 }));
      host.innerHTML = plot({ x: [0, 1300], y: [0, 1.25], w: 440, h: 240, xl: 'f [Hz]', yl: '|H(f)|', anim: first, ticks: { x: [200, 400, 600, 800, 1000, 1200], y: [0.707, 1] },
        curves: [{ f: H, n: 400, cls: 'c-res', label: '|H(f)|' }], hlines: [{ y: 1 / Math.SQRT2, cls: 'c-tan', label: '−3 dB' }],
        segs: res.map((r) => ({ from: [r.f, 0], to: [r.f, 1.05], cls: `stem ${r.pass ? 'c-pass' : 'c-stop'}` })),
        points: res.map((r) => ({ x: r.f, y: r.g, r: 4, cls: r.pass ? 'c-pass' : 'c-stop' })) });
      first = false;
      read.innerHTML = chips(res.map((r) => [`${r.f} Hz`, `${r.pass ? 'pasa' : 'se atenúa'} (${num(20 * Math.log10(Math.max(r.g, 1e-6)), 1)} dB)`, r.pass ? 'ok' : 'err']))
        + `<p class="lab-note">Se considera que pasa la componente con ganancia ≥ 0,707 (no más de 3 dB de caída). ${type === 'lp' || type === 'hp' ? `Un filtro de orden ${v.n} cae ${20 * v.n} dB por década (${6 * v.n} dB por octava) lejos de la frecuencia de corte.` : `Banda: ${a} a ${b} Hz (ancho ${b - a} Hz).`} El filtro ideal sería un escalón; los reales tienen una zona de transición, por eso conviene que la componente quede lejos del corte.</p>`;
    };
    el.querySelector('[data-s="k"]').addEventListener('change', (e) => { type = e.target.value; draw(); });
    el.querySelector('[data-t="c"]').addEventListener('input', draw);
    draw();
  };

  /* ---------- Presupuesto de enlace WiFi: niveles en dBm a lo largo del enlace ---------- */
  L.link = (el, cfg) => {
    let fq = String(cfg.f || 5800);
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('f', 'Frecuencia', [['2400', '2,4 GHz'], ['5800', '5,8 GHz']], fq)}</div>`);
    const v = sliders(el, [
      { id: 'pt', label: 'Potencia del transmisor [dBm]', min: 0, max: 30, step: 1, value: cfg.pt ?? 18 },
      { id: 'lt', label: 'Pérdida cable A [dB]', min: 0, max: 10, step: 0.5, value: cfg.lt ?? 1 },
      { id: 'gt', label: 'Ganancia antena A [dBi]', min: 0, max: 30, step: 1, value: cfg.gt ?? 14 },
      { id: 'd', label: 'Distancia [km]', min: 0.1, max: 20, step: 0.1, value: cfg.d ?? 1 },
      { id: 'gr', label: 'Ganancia antena B [dBi]', min: 0, max: 30, step: 1, value: cfg.gr ?? 14 },
      { id: 'lr', label: 'Pérdida cable B [dB]', min: 0, max: 10, step: 0.5, value: cfg.lr ?? 1 },
      { id: 's', label: 'Sensibilidad del receptor [dBm]', min: -95, max: -60, step: 1, value: cfg.s ?? -80 },
      { id: 'm', label: 'Margen pedido [dB]', min: 0, max: 20, step: 1, value: cfg.m ?? 10 },
    ], () => draw());
    const [host, read] = shell(el);
    let first = true;
    const draw = () => {
      const fspl = X.fspl(+fq, v.d);
      const lv = [v.pt, v.pt - v.lt, v.pt - v.lt + v.gt, v.pt - v.lt + v.gt - fspl, v.pt - v.lt + v.gt - fspl + v.gr, v.pt - v.lt + v.gt - fspl + v.gr - v.lr];
      const rssi = lv[5], margin = rssi - v.s, need = v.s + v.m;
      const grNeed = need - (v.pt - v.lt + v.gt - fspl - v.lr);
      const pts = lv.flatMap((y, i) => (i ? [[i, lv[i - 1]], [i, y]] : [[0, y]]));
      pts.push([6, rssi]);
      const ok = rssi >= need;
      host.innerHTML = plot({ x: [0, 6.2], y: [-110, 50], w: 460, h: 280, xl: ' ', yl: 'dBm', anim: first, ticks: { y: [-100, -80, -60, -40, -20, 20, 40] },
        curves: [{ pts, cls: ok ? 'c-pass' : 'c-stop' }],
        hlines: [{ y: v.s, cls: 'c-stop', label: `S = ${v.s} dBm` }, { y: need, cls: 'c-tan', label: `S + margen = ${need} dBm` }],
        texts: [['Tx', 0.25], ['cable', 1], ['antena', 2], ['espacio libre', 3], ['antena', 4], ['cable', 5], ['Rx', 5.9]].map(([t, x]) => ({ x, y: 44, t, cls: 'pl-tick' })),
        points: [{ x: 6, y: rssi, cls: ok ? 'c-pass' : 'c-stop' }] });
      first = false;
      read.innerHTML = chips([['Pérdida en el espacio libre', `${num(fspl, 2)} dB`, 'acc'], ['RSSI', `${num(rssi, 2)} dBm`, ok ? 'ok' : 'err'], ['Margen', `${num(margin, 2)} dB`, margin >= v.m ? 'ok' : 'err'], ['Ganancia mínima de la antena B', `${num(grNeed, 2)} dBi`]])
        + `<p class="lab-note">RSSI = P<sub>Tx</sub> − L<sub>cable</sub> + G<sub>antena</sub> − L<sub>espacio libre</sub> + G<sub>antena</sub> − L<sub>cable</sub>: en dB todo se suma. L<sub>EL</sub> = 32,45 + 20 log f[MHz] + 20 log d[km]: a 2,4 GHz se pierden ${num(X.fspl(5800, v.d) - X.fspl(2400, v.d), 2)} dB menos que a 5,8 GHz a la misma distancia, por eso la antena necesaria es más chica.</p>`;
    };
    el.querySelector('[data-s="f"]').addEventListener('change', (e) => { fq = e.target.value; draw(); });
    draw();
  };

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

  /* ---------- Paridad VRC/LRC sobre una palabra ASCII ---------- */
  L.parity = (el, cfg) => {
    let even = cfg.even !== false, flips = new Set();
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('w', 'Palabra (ASCII 7 bits, hasta 8 letras)', cfg.word || 'REDES', 'maxlength="8"')}</div>`);
    toggle(el, 'Paridad', [['par', 'Paridad par'], ['impar', 'Paridad impar']], even ? 'par' : 'impar', (k) => { even = k === 'par'; draw(); });
    el.insertAdjacentHTML('beforeend', '<div class="par-out"></div><div class="lab-read" aria-live="polite"></div><div class="lab-row"><button class="btn sm" type="button" data-act="clr">Quitar errores</button></div>');
    const out = el.querySelector('.par-out'), read = el.querySelector('.lab-read');
    const pbit = (bits) => String((X.ones(bits) + (even ? 0 : 1)) % 2);
    const draw = () => {
      const w = el.querySelector('[data-t="w"]').value.slice(0, 8) || 'A';
      // fila por carácter: b6..b0 + VRC (calculado en el emisor)
      const rows = [...w].map((ch) => { const b = X.ascii7(ch); return b + pbit(b); });
      const lrc = Array.from({ length: 8 }, (_, j) => pbit(rows.map((r) => r[j]).join(''))).join('');
      const all = [...rows, lrc];
      // recibido = enviado con los bits tocados invertidos
      const rx = all.map((r, i) => [...r].map((c, j) => (flips.has(`${i},${j}`) ? (c === '1' ? '0' : '1') : c)).join(''));
      const badRow = rx.map((r) => X.ones(r) % 2 !== (even ? 0 : 1));
      const badCol = Array.from({ length: 8 }, (_, j) => X.ones(rx.map((r) => r[j]).join('')) % 2 !== (even ? 0 : 1));
      out.innerHTML = `<div class="table-wrap"><table class="mtab"><thead><tr><th></th>${['b6', 'b5', 'b4', 'b3', 'b2', 'b1', 'b0', 'VRC'].map((h, j) => `<th class="${badCol[j] ? 'bad' : ''}">${h}</th>`).join('')}<th></th></tr></thead><tbody>
        ${rx.map((r, i) => `<tr><th>${i < rows.length ? esc(w[i]) : 'LRC'}</th>${[...r].map((c, j) => `<td class="${flips.has(`${i},${j}`) ? 'bad' : j === 7 || i === rows.length ? 'par' : ''}"><button type="button" data-i="${i}" data-j="${j}" aria-label="Invertir bit">${c}</button></td>`).join('')}<td>${badRow[i] ? '<span class="chip err">✗</span>' : ''}</td></tr>`).join('')}</tbody></table></div>`;
      const nr = badRow.filter(Boolean).length, nc = badCol.filter(Boolean).length;
      read.innerHTML = chips([['Errores introducidos', flips.size, flips.size ? 'warn' : ''], ['Filas con paridad mal (VRC)', nr, nr ? 'err' : 'ok'], ['Columnas con paridad mal (LRC)', nc, nc ? 'err' : 'ok'],
        flips.size && !nr && !nc && ['Detección', 'ninguna: los errores se compensan', 'err'], nr === 1 && nc === 1 && ['Corrección', `bit en fila ${badRow.indexOf(true) + 1}, columna ${['b6', 'b5', 'b4', 'b3', 'b2', 'b1', 'b0', 'VRC'][badCol.indexOf(true)]}`, 'ok']])
        + '<p class="lab-note">Tocá cualquier bit para simular un error. Con un solo error, VRC marca la fila y LRC la columna: el cruce dice qué bit corregir. Probá dos errores en la misma fila (VRC no los ve) o cuatro en un rectángulo (no los ve nadie).</p>';
    };
    out.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const k = `${b.dataset.i},${b.dataset.j}`; flips.has(k) ? flips.delete(k) : flips.add(k); draw(); });
    el.querySelector('[data-t="w"]').addEventListener('input', () => { flips.clear(); draw(); });
    el.querySelector('[data-act="clr"]').addEventListener('click', () => { flips.clear(); draw(); });
    draw();
  };

  /* ---------- CRC: división módulo 2 paso a paso ---------- */
  function divText(dividend, steps, r) {
    // arma la división larga alineada en columnas
    const lines = [`<b>${dividend}</b>`];
    steps.forEach((s, k) => {
      const pad = ' '.repeat(s.at);
      if (k) lines.push(`${pad}${s.top}`);
      lines.push(`${pad}${s.gen}  ← G(x)`);
      lines.push(`${pad}${'─'.repeat(r + 1)}`);
    });
    return lines;
  }
  L.crc = (el, cfg) => {
    let mode = cfg.mode || 'tx';
    toggle(el, 'Modo', [['tx', 'Calcular el CRC a enviar'], ['rx', 'Verificar lo recibido']], mode, (k) => { mode = k; draw(); });
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('m', 'Mensaje M(x) [bits]', cfg.msg || '10110111')}${textIn('g', 'Generador G(x) [bits]', cfg.gen || '110011')}${textIn('r', 'Trama recibida T′(x) [bits]', cfg.rx || '1011011101001')}</div>
      <div class="crc-out" aria-live="polite"></div><div class="lab-row"><button class="btn sm" type="button" data-act="err">Simular un error en la trama</button></div>`);
    const out = el.querySelector('.crc-out');
    const poly = (b) => { const n = b.length - 1; const t = [...b].map((c, i) => (c === '1' ? (n - i === 0 ? '1' : n - i === 1 ? 'x' : `x${String(n - i).replace(/./g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`) : null)).filter(Boolean); return t.join(' + ') || '0'; };
    const draw = () => {
      el.querySelector('[data-t="m"]').closest('label').hidden = mode !== 'tx';
      el.querySelector('[data-t="r"]').closest('label').hidden = mode !== 'rx';
      const g = bitsOnly(el.querySelector('[data-t="g"]').value, 17);
      if (g.length < 2 || g[0] !== '1') { out.innerHTML = '<p class="note warn">El generador tiene que empezar con 1 y tener al menos 2 bits.</p>'; return; }
      const r = g.length - 1;
      if (mode === 'tx') {
        const m = bitsOnly(el.querySelector('[data-t="m"]').value, 32);
        if (!m) { out.innerHTML = '<p class="lab-note">Escribí el mensaje en bits.</p>'; return; }
        const c = X.crc(m, g);
        out.innerHTML = `${chips([['M(x)', poly(m)], ['G(x)', `${poly(g)} (grado r = ${r})`], ['xʳ·M(x)', `${m} + ${r} ceros`]])}
          <div class="divlong">${divText(c.padded, c.steps, r).join('\n')}\n${' '.repeat(c.padded.length - r)}<i>${c.rem}</i>  ← resto R(x)</div>
          ${chips([['R(x)', c.rem, 'acc'], ['T(x) = xʳ·M(x) + R(x)', c.tx, 'ok']])}
          <p class="lab-note">Se agregan r ceros (r = grado de G), se divide en módulo 2 (restar es XOR: sin acarreo ni préstamo) y el resto de r bits reemplaza a esos ceros. La trama enviada es divisible por G(x).</p>`;
      } else {
        const rx = bitsOnly(el.querySelector('[data-t="r"]').value, 48);
        if (rx.length <= r) { out.innerHTML = '<p class="lab-note">La trama tiene que ser más larga que el generador.</p>'; return; }
        const c = X.crcCheck(rx, g), okk = !c.rem.includes('1');
        out.innerHTML = `<div class="divlong">${divText(rx, c.steps, r).join('\n')}\n${' '.repeat(rx.length - r)}<i>${c.rem}</i>  ← resto</div>
          ${chips([['Resto', c.rem, okk ? 'ok' : 'err'], ['Resultado', okk ? 'sin error detectado' : 'HAY ERROR: se descarta la trama', okk ? 'ok' : 'err'], okk && ['Datos', rx.slice(0, -r)]])}
          <p class="lab-note">El receptor divide la trama completa por el mismo G(x). Resto cero: se acepta. Resto distinto de cero: hubo error (CRC detecta, no corrige: se pide retransmitir).</p>`;
      }
    };
    el.querySelector('[data-act="err"]').addEventListener('click', () => {
      const inp = el.querySelector('[data-t="r"]');
      if (mode === 'tx') { const c = X.crc(bitsOnly(el.querySelector('[data-t="m"]').value, 32), bitsOnly(el.querySelector('[data-t="g"]').value, 17)); inp.value = c.tx; }
      const b = bitsOnly(inp.value, 48), k = Math.floor(Math.random() * b.length);
      inp.value = b.slice(0, k) + (b[k] === '1' ? '0' : '1') + b.slice(k + 1);
      mode = 'rx';
      el.querySelectorAll('.toggle button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.k === 'rx'));
      draw();
    });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) draw(); });
    draw();
  };

  /* ---------- Código de Hamming con la disposición de la cátedra ---------- */
  L.hamming = (el, cfg) => {
    let mode = cfg.mode || 'tx';
    toggle(el, 'Modo', [['tx', 'Codificar datos'], ['rx', 'Decodificar lo recibido']], mode, (k) => { mode = k; flips.clear(); draw(); });
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('d', 'Datos n [bits]', cfg.data || '1001101')}${textIn('r', 'Palabra recibida [bits]', cfg.rx || '10001100100')}</div><div class="hm-out" aria-live="polite"></div>`);
    const out = el.querySelector('.hm-out');
    const flips = new Set();
    const isP = (k) => (k & (k - 1)) === 0;
    const draw = () => {
      el.querySelector('[data-t="d"]').closest('label').hidden = mode !== 'tx';
      el.querySelector('[data-t="r"]').closest('label').hidden = mode !== 'rx';
      let word;
      if (mode === 'tx') {
        const d = bitsOnly(el.querySelector('[data-t="d"]').value, 26);
        if (!d) { out.innerHTML = '<p class="lab-note">Escribí los datos en bits.</p>'; return; }
        word = X.hammingEncode(d).word;
      } else word = bitsOnly(el.querySelector('[data-t="r"]').value, 31);
      if (word.length < 3) { out.innerHTML = '<p class="lab-note">Escribí al menos 3 bits.</p>'; return; }
      const N = word.length;
      const lay = X.hammingLayout(N - Math.ceil(Math.log2(N + 1)));
      const rx = [...word].map((c, j) => (flips.has(N - j) ? (c === '1' ? '0' : '1') : c)).join('');
      const dec = X.hammingDecode(rx);
      const pos = Array.from({ length: N }, (_, j) => N - j);
      const label = (k) => (lay.lab[k] || (isP(k) ? 'p' : 'n'));
      const p = dec.p;
      out.innerHTML = `${mode === 'tx' ? chips([['n', `${N - p} bits de datos`], ['p', `${p} de paridad: 2^${p} = ${2 ** p} ≥ n + p + 1 = ${N + 1}`, 'acc'], ['Palabra a transmitir', word, 'ok']]) : ''}
        <p class="lab-note">${mode === 'tx' ? 'Tocá un bit de la palabra para simular un error en el canal.' : 'Tocá un bit si querés agregar otro error.'}</p>
        <div class="bitrow pos">${pos.map((k, j) => `<button type="button" data-k="${k}" class="${flips.has(k) ? 'flip' : isP(k) ? 'pb' : ''}" aria-label="Posición ${k}"><small>${label(k)}·${k}</small>${rx[j]}</button>`).join('')}</div>
        <div class="table-wrap"><table class="mtab"><thead><tr><th>Control</th>${pos.map((k) => `<th>${k}</th>`).join('')}<th>Resultado</th></tr></thead><tbody>
          ${Array.from({ length: p }, (_, i) => `<tr><th>p${i + 1} (pos. ${2 ** i})</th>${pos.map((k, j) => ((k >> i) & 1 ? `<td class="${isP(k) ? 'par' : ''}">${rx[j]}</td>` : '<td></td>')).join('')}<td class="${dec.checks[i] ? 'bad' : ''}">${dec.checks[i]}</td></tr>`).join('')}
        </tbody></table></div>
        ${chips([['Síndrome (p' + Array.from({ length: p }, (_, i) => p - i).join(' p') + ')', `${[...dec.checks].reverse().join('')}₂ = ${dec.syn}`, dec.syn ? 'err' : 'ok'], ['Diagnóstico', dec.syn ? (dec.syn <= N ? `error en la posición ${dec.syn}` : 'más de un error: no se puede corregir') : 'sin error', dec.syn ? 'err' : 'ok'], dec.syn && dec.syn <= N && ['Corregida', dec.corrected, 'ok'], ['Datos', dec.data, 'acc']])}
        <p class="lab-note">Posiciones numeradas de derecha (1) a izquierda; los bits de paridad van en 1, 2, 4, 8… y cada pᵢ controla (paridad par) las posiciones cuyo número en binario tiene un 1 en el lugar i. Leídos de p${p} a p1, los resultados forman el número de la posición errónea. Con 2 errores el síndrome apunta a un bit equivocado: Hamming corrige 1 o detecta 2, no las dos cosas a la vez.</p>`;
    };
    out.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; const k = +b.dataset.k; flips.has(k) ? flips.delete(k) : flips.add(k); draw(); });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) { flips.clear(); draw(); } });
    draw();
  };

  /* ---------- ARQ: qué se retransmite cuando se pierde una trama ---------- */
  L.arq = (el, cfg) => {
    let proto = cfg.proto || 'gbn';
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('p', 'Protocolo', [['sw', 'Parada y espera'], ['gbn', 'Ir N atrás (go-back-N)'], ['sr', 'Retransmisión selectiva']], proto)}</div>`);
    const v = sliders(el, [
      { id: 'n', label: 'Tramas a enviar', min: 4, max: 10, step: 1, value: 8 },
      { id: 'w', label: 'Ventana (tramas sin confirmar)', min: 2, max: 7, step: 1, value: 4 },
      { id: 'l', label: 'Trama que se pierde', min: 0, max: 9, step: 1, value: 2 },
    ], () => draw());
    const [host, read] = shell(el);
    const draw = () => {
      const n = v.n, lost = Math.min(v.l, n - 1), W = proto === 'sw' ? 1 : v.w;
      // secuencia de envíos: { k, st: 'ok' | 'lost' | 'drop' (llega pero se descarta) | 're' }
      const seq = [];
      if (proto === 'sw') for (let k = 0; k < n; k++) { if (k === lost) seq.push({ k, st: 'lost' }, { k, st: 're' }); else seq.push({ k, st: 'ok' }); }
      else {
        const burst = Math.min(n, lost + W);   // lo que alcanza a salir antes de que venza el temporizador o llegue el NAK
        for (let k = 0; k < burst; k++) seq.push({ k, st: k === lost ? 'lost' : k > lost && proto === 'gbn' ? 'drop' : 'ok' });
        if (proto === 'gbn') { for (let k = lost; k < n; k++) seq.push({ k, st: 're' }); }
        else { seq.push({ k: lost, st: 're' }); for (let k = burst; k < n; k++) seq.push({ k, st: 'ok' }); }
      }
      const C = { ok: 'ok', lost: 'n', drop: 'w', re: 'acc' };
      const cw = 40, W2 = Math.max(460, seq.length * cw + 20);
      host.innerHTML = `<div class="wave-wrap"><svg class="dg" viewBox="0 0 ${W2} 120" style="max-width:none;min-width:${W2}px" role="img" aria-label="Secuencia de tramas enviadas">
        <text x="10" y="16" class="ts tl">Orden en que salen las tramas →</text>
        ${seq.map((s, i) => `<g><rect x="${10 + i * cw}" y="30" width="${cw - 6}" height="40" rx="6" class="b ${C[s.st]}"/><text x="${10 + i * cw + (cw - 6) / 2}" y="50" class="t">${s.k}</text>
          <text x="${10 + i * cw + (cw - 6) / 2}" y="86" class="ts">${{ ok: '✓', lost: 'perdida', drop: 'descart.', re: 'reenvío' }[s.st]}</text></g>`).join('')}
      </svg></div>`;
      const extra = seq.length - n;
      read.innerHTML = chips([['Envíos totales', seq.length, 'acc'], ['Retransmisiones', extra, extra > 1 ? 'warn' : 'ok'], ['Ventana', W]])
        + `<p class="lab-note">${{ sw: 'Parada y espera: una trama por vez; si no llega el ACK antes del temporizador (time-out) se reenvía esa trama. Simple, pero el canal pasa la mayor parte del tiempo esperando.', gbn: 'Ir N atrás: se envían hasta W tramas sin esperar. El receptor descarta todo lo que llega después de la trama perdida, así que el emisor repite desde la perdida en adelante. Receptor simple, pero se reenvían tramas que habían llegado bien.', sr: 'Retransmisión selectiva: el receptor guarda las tramas que llegan fuera de orden y pide solo la que falta (NAK). Es la más eficiente en el uso del canal, a costa de buffers y lógica en el receptor.' }[proto]}</p>`;
    };
    el.querySelector('[data-s="p"]').addEventListener('change', (e) => { proto = e.target.value; draw(); });
    draw();
  };

  /* ---------- Códigos de línea ---------- */
  const LCODES = {
    nrz: ['NRZ unipolar', '1 → +V, 0 → 0', 'Componente continua y sin sincronismo en rachas largas.'],
    nrzi: ['NRZ-I (polar)', 'cada 1 invierte el nivel; el 0 lo mantiene', 'Rachas de 0 sin transiciones; los 1 sí sincronizan.'],
    rz: ['RZ polar', '1 → +V, 0 → −V, vuelve a 0 a mitad de bit', 'Transición en cada bit, pero usa el doble de ancho de banda.'],
    manchester: ['Manchester', '0: + → −, 1: − → + (transición a mitad de bit)', 'Autosincronizado, sin continua; ancho de banda doble (Ethernet 10BASE-T).'],
    dmanch: ['Manchester diferencial', 'siempre transición a mitad de bit; el 0 agrega una al comienzo', 'Autosincronizado; lo que importa es si hay transición, no la polaridad (Token Ring).'],
    ami: ['AMI bipolar', '0 → 0 V, los 1 alternan + y −', 'Sin continua y detecta errores (dos pulsos iguales seguidos = violación), pero las rachas de 0 pierden el sincronismo.'],
    b8zs: ['B8ZS', 'AMI, y cada 8 ceros → 000VB0VB', 'Las violaciones V (pulso con la misma polaridad que el anterior) marcan la sustitución (T1, EE. UU.).'],
    hdb3: ['HDB3', 'AMI, y cada 4 ceros → 000V (impar de 1 desde la última sustitución) o B00V (par)', 'Nunca más de 3 ceros seguidos (E1, Europa).'],
  };
  // Dibuja dos niveles por bit; marca violaciones (V) y pulsos de relleno (B)
  function waveSvg(bits, halves, opts = {}) {
    const bw = opts.bw || 34, H = opts.h || 110, pad = 34, W = pad + bits.length * bw + 10;
    const y = (l) => (opts.top || 26) + ((1 - l) * (H - 46)) / 2;
    let d = `M${pad} ${y(halves[0][0])}`;
    halves.forEach(([a, b], i) => { const x0 = pad + i * bw; d += ` L${x0} ${y(a)} L${x0 + bw / 2} ${y(a)} L${x0 + bw / 2} ${y(b)} L${x0 + bw} ${y(b)}`; });
    const grid = bits.map((_, i) => `<line x1="${pad + i * bw}" y1="18" x2="${pad + i * bw}" y2="${H - 14}" class="grid"/>`).join('');
    const labels = bits.map((b, i) => `<text x="${pad + i * bw + bw / 2}" y="13" class="bit">${b}</text>`).join('');
    const marks = (opts.marks || []).map(([i, t]) => `<rect x="${pad + i * bw}" y="18" width="${bw}" height="${H - 32}" class="sub"/><text x="${pad + i * bw + bw / 2}" y="${H - 2}" class="vio">${t}</text>`).join('');
    return `<svg class="wave" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.alt || 'Forma de onda')}">${marks}${grid}<line x1="${pad}" y1="${y(0)}" x2="${W - 10}" y2="${y(0)}" class="zero"/>
      <text x="${pad - 6}" y="${y(1) + 4}" class="lv">+V</text><text x="${pad - 6}" y="${y(0) + 4}" class="lv">0</text>${opts.unipolar ? '' : `<text x="${pad - 6}" y="${y(-1) + 4}" class="lv">−V</text>`}
      <path d="${d}" class="sig"/>${labels}</svg>`;
  }
  // En B8ZS y HDB3, ubica los pulsos sustituidos: pulso donde el dato era 0
  function subMarks(bits, halves, scheme) {
    if (scheme !== 'b8zs' && scheme !== 'hdb3') return [];
    const out = [];
    let last = 0;
    halves.forEach(([a], i) => { if (a !== 0) { if (bits[i] === '0') out.push([i, a === last ? 'V' : 'B']); last = a; } });
    return out;
  }
  L.linecode = (el, cfg) => {
    let sc = cfg.scheme || 'manchester';
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('b', 'Bits', cfg.bits || '10000000011100001')}</div>
      <div class="lab-row">${select('s', 'Código', [...Object.entries(LCODES).map(([k, [n]]) => [k, n]), ['all', 'Todos juntos']], sc)}</div><div class="lc-out" aria-live="polite"></div>`);
    const out = el.querySelector('.lc-out');
    const one = (bits, k) => { const hv = X.lineCode(bits, k); return `<p class="lc-cap"><b>${LCODES[k][0]}</b>: ${LCODES[k][1]}</p><div class="wave-wrap">${waveSvg([...bits], hv, { marks: subMarks(bits, hv, k), unipolar: k === 'nrz', alt: LCODES[k][0] })}</div>`; };
    const draw = () => {
      const bits = bitsOnly(el.querySelector('[data-t="b"]').value, 32);
      if (!bits) { out.innerHTML = '<p class="lab-note">Escribí una secuencia de bits.</p>'; return; }
      if (sc === 'all') { out.innerHTML = Object.keys(LCODES).map((k) => one(bits, k)).join(''); return; }
      const hv = X.lineCode(bits, sc);
      const dc = hv.reduce((a, [p, q]) => a + p + q, 0) / (2 * hv.length);
      let run = 0, maxRun = 0, prev = null;
      hv.flat().forEach((l) => { run = l === prev ? run + 1 : 1; prev = l; maxRun = Math.max(maxRun, run); });
      out.innerHTML = one(bits, sc) + chips([['Valor medio', num(dc, 3), Math.abs(dc) < 0.15 ? 'ok' : 'warn'], ['Tramo más largo sin transición', `${num(maxRun / 2, 1)} bits`, maxRun / 2 > 2 ? 'warn' : 'ok']]) + `<p class="lab-note">${LCODES[sc][2]} ${sc === 'b8zs' || sc === 'hdb3' ? 'Sombreados: los pulsos que reemplazan ceros (V = violación de la alternancia, B = pulso bipolar normal).' : ''}</p>`;
    };
    el.querySelector('[data-s="s"]').addEventListener('change', (e) => { sc = e.target.value; draw(); });
    el.querySelector('[data-t="b"]').addEventListener('input', draw);
    draw();
  };

  /* ---------- Modulaciones digitales: onda y constelación ---------- */
  function constSvg(mod, active = []) {
    const pts = Object.entries(mod.map);
    const R = Math.max(...pts.map(([, p]) => Math.hypot(p.i, p.q))) || 1;
    const S = 150, c = S / 2, k = (S / 2 - 26) / R;
    const fsk = !!mod.freq;
    return `<svg class="dg" viewBox="0 0 ${S} ${S}" style="max-width:220px" role="img" aria-label="Diagrama de constelación de ${mod.name}">
      <line x1="8" y1="${c}" x2="${S - 8}" y2="${c}" class="ln d"/><line x1="${c}" y1="8" x2="${c}" y2="${S - 8}" class="ln d"/>
      <text x="${S - 10}" y="${c - 5}" class="ts">I</text><text x="${c + 8}" y="14" class="ts">Q</text>
      ${fsk ? `<text x="${c}" y="${c + 30}" class="ts">FSK: f₁ y f₂ (no se dibuja en I/Q)</text>` : pts.map(([b, p]) => `<circle cx="${c + p.i * k}" cy="${c - p.q * k}" r="${active.includes(b) ? 6 : 4}" class="${active.includes(b) ? 'dot' : 'b'}" ${active.includes(b) ? '' : 'style="stroke-width:1.4"'}/>
        <text x="${c + p.i * k}" y="${c - p.q * k + (p.q >= 0 ? -10 : 14)}" class="ts" style="font-size:${mod.n > 3 ? 7 : 8.5}px">${b}</text>`).join('')}
    </svg>`;
  }
  L.modulation = (el, cfg) => {
    let mk = cfg.mod || 'qpsk';
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('b', 'Bits', cfg.bits || '101100011110001001101011')}${textIn('r', 'Tasa binaria Rb [bit/s]', cfg.rate || '96000')}</div>
      <div class="lab-row">${select('m', 'Modulación', Object.entries(X.MODS).map(([k, m]) => [k, m.name]), mk)}</div><div class="md-out" aria-live="polite"></div>`);
    const out = el.querySelector('.md-out');
    const draw = () => {
      const mod = X.MODS[mk];
      const bits = bitsOnly(el.querySelector('[data-t="b"]').value, 48);
      const Rb = X.parseNum(el.querySelector('[data-t="r"]').value) || 0;
      if (!bits) { out.innerHTML = '<p class="lab-note">Escribí una secuencia de bits.</p>'; return; }
      const syms = X.groups(bits, mod.n).slice(0, 16);
      const Amax = Math.max(...Object.values(mod.map).map((p) => p.A || 1));
      // 2 ciclos de portadora por símbolo (FSK: 1 o 2 según el bit); la fase se mide respecto de un coseno
      const sw = 60, H = 120, pad = 10, W = pad * 2 + syms.length * sw;
      let d = '';
      syms.forEach((s, i) => {
        const p = mod.map[s], cyc = mod.freq ? mod.freq[s] : 2;
        for (let k = 0; k <= 40; k++) {
          const u = k / 40, x = pad + i * sw + u * sw;
          const yv = ((p.A || 0) / Amax) * Math.cos(2 * PI * cyc * u + ((p.ph || 0) * PI) / 180);
          d += `${i || k ? 'L' : 'M'}${x.toFixed(1)} ${(H / 2 + 8 - yv * (H / 2 - 22)).toFixed(1)}`;
        }
      });
      const sv = `<div class="wave-wrap"><svg class="wave" viewBox="0 0 ${W} ${H + 10}" role="img" aria-label="Señal modulada ${mod.name}">
        ${syms.map((s, i) => `<line x1="${pad + i * sw}" y1="18" x2="${pad + i * sw}" y2="${H + 4}" class="grid"/><text x="${pad + i * sw + sw / 2}" y="13" class="bit">${s}</text>`).join('')}
        <line x1="${pad}" y1="${H / 2 + 8}" x2="${W - pad}" y2="${H / 2 + 8}" class="zero"/><path d="${d}" class="sig"/></svg></div>`;
      const r = Rb / mod.n;
      const M = 2 ** mod.n;
      out.innerHTML = `${sv}<div class="pl-pair"><div>${constSvg(mod, syms)}</div><div>${chips([['M', `${M} símbolos`], ['n = log₂M', `${mod.n} bit/símbolo`, 'acc'], [`Símbolos para ${bits.length} bits`, Math.ceil(bits.length / mod.n)], ['r = Rb/n', eng(r, 'baud')], ['Ts = 1/r', eng(1 / r, 's')], ['Tb = 1/Rb', eng(1 / Rb, 's')]])}
        <p class="lab-note">${mk === 'ask4' ? '4-ASK y QPSK mueven 2 bits por símbolo: misma tasa de baudios, pero 4-ASK distingue niveles de amplitud (más sensible al ruido) y QPSK fases.' : mk.startsWith('qam') ? 'QAM combina amplitud y fase: M ≤ (n.º de fases) × (n.º de amplitudes). Más puntos en el mismo plano → más juntos → más sensible al ruido.' : mk === 'fsk' ? 'FSK: el 1 y el 0 se distinguen por la frecuencia; la amplitud es constante, por eso es robusta al ruido de amplitud.' : 'Las fases de la cátedra (Tomasi) para QPSK: 00 → 135°, 01 → −135°, 10 → 45°, 11 → −45°.'}</p></div></div>`;
    };
    el.querySelector('[data-s="m"]').addEventListener('change', (e) => { mk = e.target.value; draw(); });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) draw(); });
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

  /* ---------- FDM: mapa espectral con bandas de guarda ---------- */
  L.fdm = (el, cfg) => {
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('w', 'Anchos de los canales [kHz]', (cfg.widths || [20, 20, 15, 15, 10, 10, 5, 5]).join(', '))}</div>`);
    const v = sliders(el, [{ id: 'g', label: 'Banda de guarda [kHz]', min: 0, max: 5, step: 0.25, value: cfg.guard ?? 2 }, { id: 'av', label: 'Enlace disponible [kHz]', min: 40, max: 200, step: 1, value: cfg.avail ?? 110 }], () => draw());
    const [host, read] = shell(el);
    const draw = () => {
      const w = el.querySelector('[data-t="w"]').value.split(/[,;\s]+/).map(Number).filter((x) => x > 0).slice(0, 12);
      let f = 0;
      const ch = w.map((x) => { const a = f; f = a + x + v.g; return [a, a + x]; });
      const total = ch.length ? ch.at(-1)[1] : 0;
      const maxX = Math.max(total, v.av) * 1.06;
      const S = 600, sx = (x) => 10 + (x / maxX) * (S - 20);
      host.innerHTML = `<div class="wave-wrap"><svg class="dg" viewBox="0 0 ${S} 130" style="max-width:none" role="img" aria-label="Mapa espectral FDM">
        <rect x="${sx(0)}" y="22" width="${sx(v.av) - sx(0)}" height="60" class="b" style="fill:none;stroke-dasharray:5 4"/><text x="${sx(v.av)}" y="16" class="ts" text-anchor="end">disponible ${v.av} kHz</text>
        ${ch.map(([a, b], i) => `<rect x="${sx(a)}" y="30" width="${Math.max(1, sx(b) - sx(a))}" height="44" rx="3" class="b ${b > v.av ? 'n' : 'acc'}"/><text x="${(sx(a) + sx(b)) / 2}" y="52" class="ts">${i + 1}</text>
          <text x="${(sx(a) + sx(b)) / 2}" y="96" class="ts" style="font-size:8.5px">${num((a + b) / 2, 2)}</text>`).join('')}
        <line x1="${sx(0)}" y1="78" x2="${sx(maxX / 1.06)}" y2="78" class="ln"/><text x="10" y="118" class="ts tl">frecuencia central de cada canal [kHz] · total ${num(total, 2)} kHz</text>
      </svg></div>`;
      const deficit = total - v.av;
      read.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Canal</th><th>Ancho</th><th>Banda [kHz]</th><th>Central</th></tr></thead><tbody>${ch.map(([a, b], i) => `<tr><td>${i + 1}</td><td>${w[i]}</td><td>${num(a, 2)} – ${num(b, 2)}</td><td>${num((a + b) / 2, 2)}</td></tr>`).join('')}</tbody></table></div>`
        + chips([['Ancho total Σanchos + (N−1)·guarda', `${w.reduce((a, b) => a + b, 0)} + ${Math.max(0, w.length - 1)}·${v.g} = ${num(total, 2)} kHz`, 'acc'], ['Resultado', deficit > 0 ? `faltan ${num(deficit, 2)} kHz` : `sobran ${num(-deficit, 2)} kHz`, deficit > 0 ? 'err' : 'ok'], deficit > 0 && w.length > 1 && ['Guarda máxima que entra', `${num(Math.max(0, (v.av - w.reduce((a, b) => a + b, 0)) / (w.length - 1)), 3)} kHz`]]);
    };
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) draw(); });
    draw();
  };

  /* ---------- TDM síncrono: armado de la trama ---------- */
  L.tdm = (el, cfg) => {
    const v = sliders(el, [
      { id: 'n', label: 'Fuentes', min: 2, max: 32, step: 1, value: cfg.n || 30 },
      { id: 'r', label: 'Tasa de cada fuente [kbps]', min: 8, max: 200, step: 4, value: cfg.r || 100 },
      { id: 'b', label: 'Bits por fuente en cada trama', min: 1, max: 16, step: 1, value: cfg.b || 8 },
      { id: 's', label: 'Bits de sincronismo por trama', min: 0, max: 8, step: 1, value: cfg.s ?? 1 },
    ], () => draw());
    const [host, read] = shell(el);
    const draw = () => {
      const size = v.n * v.b + v.s, fr = (v.r * 1e3) / v.b, out = size * fr;
      const show = Math.min(v.n, 12), S = 600, cw = (S - 40) / (show + (v.n > show ? 1 : 0) + (v.s ? 0.7 : 0));
      let x = 10;
      let g = '';
      if (v.s) { g += `<rect x="${x}" y="30" width="${cw * 0.7 - 3}" height="40" rx="4" class="b w"/><text x="${x + (cw * 0.7 - 3) / 2}" y="50" class="ts">S</text>`; x += cw * 0.7; }
      for (let k = 0; k < show; k++) { g += `<rect x="${x}" y="30" width="${cw - 3}" height="40" rx="4" class="b acc"/><text x="${x + (cw - 3) / 2}" y="50" class="ts">F${k + 1}</text>`; x += cw; }
      if (v.n > show) g += `<text x="${x + cw / 2}" y="50" class="t">…F${v.n}</text>`;
      host.innerHTML = `<svg class="dg" viewBox="0 0 ${S} 100" role="img" aria-label="Trama TDM">${g}<text x="10" y="18" class="ts tl">una trama = ${v.s ? `${v.s} bit de sincronismo + ` : ''}${v.n} ranuras de ${v.b} bits</text><text x="10" y="90" class="ts tl">duración ${eng(1 / fr, 's')}</text></svg>`;
      read.innerHTML = chips([['Tamaño de trama', `${v.n}·${v.b} + ${v.s} = ${size} bits`, 'acc'], ['Tramas por segundo', `${num(v.r * 1e3, 0)} / ${v.b} = ${eng(fr, 'tramas/s')}`], ['Duración de trama', eng(1 / fr, 's')], ['Tasa de salida', eng(out, 'bps'), 'acc'], ['Eficiencia', `${num(((v.n * v.b) / size) * 100, 2)} %`]])
        + '<p class="lab-note">En TDM síncrono cada fuente tiene su ranura fija en cada trama, transmita o no: se envía una trama por cada grupo de b bits de una fuente, así que la tasa de tramas es r/b. La salida es (tamaño de trama) × (tramas por segundo). E1: 32 ranuras de 8 bits, 8000 tramas/s = 2,048 Mbps.</p>';
    };
    draw();
  };

  /* ---------- Topologías físicas: enlaces y puertos ---------- */
  L.topology = (el, cfg) => {
    let tp = cfg.topo || 'malla';
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('t', 'Topología', [['malla', 'Malla completa'], ['estrella', 'Estrella'], ['bus', 'Bus'], ['anillo', 'Anillo']], tp)}</div>`);
    const v = sliders(el, [{ id: 'n', label: 'Dispositivos', min: 3, max: 12, step: 1, value: cfg.n || 5 }, { id: 'f', label: 'Enlace que falla (0 = ninguno)', min: 0, max: 12, step: 1, value: 0 }], () => draw());
    const [host, read] = shell(el);
    const draw = () => {
      const n = v.n, S = 300, c = S / 2, R = 105;
      const P = Array.from({ length: n }, (_, k) => [c + R * Math.cos((2 * PI * k) / n - PI / 2), c + R * Math.sin((2 * PI * k) / n - PI / 2)]);
      let links = [], hub = null;
      if (tp === 'malla') for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) links.push([P[i], P[j]]);
      if (tp === 'estrella') { hub = [c, c]; links = P.map((p) => [hub, p]); }
      if (tp === 'anillo') links = P.map((p, i) => [p, P[(i + 1) % n]]);
      let bus = '';
      if (tp === 'bus') { const xs = P.map((_, k) => 30 + (k * (S - 60)) / (n - 1)); bus = `<line x1="20" y1="${c}" x2="${S - 20}" y2="${c}" class="ln" style="stroke-width:4"/>`; links = xs.map((x, k) => [[x, c], [x, k % 2 ? c + 60 : c - 60]]); P.splice(0, n, ...xs.map((x, k) => [x, k % 2 ? c + 60 : c - 60])); }
      const fail = v.f > 0 && v.f <= links.length ? v.f - 1 : -1;
      host.innerHTML = `<svg class="dg" viewBox="0 0 ${S} ${S}" style="max-width:320px" role="img" aria-label="Topología ${tp} con ${n} dispositivos">${bus}
        ${links.map(([a, b], i) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ln${i === fail ? ' n d' : ''}" ${i === fail ? 'style="stroke-width:3"' : ''}/>`).join('')}
        ${hub ? `<rect x="${c - 18}" y="${c - 14}" width="36" height="28" rx="5" class="b w"/><text x="${c}" y="${c}" class="ts">hub</text>` : ''}
        ${P.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="13" class="b acc"/><text x="${x}" y="${y}" class="ts">${k + 1}</text>`).join('')}</svg>`;
      const info = {
        malla: [n * (n - 1) / 2, n - 1, 'Robusta y privada: si cae un enlace, el resto sigue. Cara: muchos cables y puertos.', 'solo se corta el par afectado'],
        estrella: [n, 1, 'Barata y fácil de reconfigurar; todo depende del concentrador (punto único de falla).', 'solo queda aislado ese dispositivo'],
        bus: [`1 troncal + ${n} derivaciones`, 1, 'Poco cable y simple, pero difícil de reconfigurar y aislar fallas.', 'una rotura del troncal corta la red'],
        anillo: [n, 2, 'Cada nodo regenera y retransmite; tráfico en un sentido.', 'sin anillo doble, se paraliza toda la red'],
      }[tp];
      read.innerHTML = chips([['Enlaces', info[0], 'acc'], ['Puertos por dispositivo', info[1]], fail >= 0 && ['Si falla el enlace ' + v.f, info[3], 'warn']]) + `<p class="lab-note">${info[2]} ${tp === 'malla' ? `Malla completa: n(n − 1)/2 = ${n}·${n - 1}/2 = ${n * (n - 1) / 2} enlaces.` : ''}</p>`;
    };
    el.querySelector('[data-s="t"]').addEventListener('change', (e) => { tp = e.target.value; draw(); });
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
