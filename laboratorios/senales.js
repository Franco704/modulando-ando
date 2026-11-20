/* Laboratorios de la Unidad 2: senoidal, señal compuesta, Fourier, tren de pulsos y filtros. */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;
  const { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss } = window.GUIDE.labUtil;
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
})();
