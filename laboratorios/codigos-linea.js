/* Laboratorio de la Unidad 7: códigos de línea (NRZ a HDB3). */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;
  const { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss } = window.GUIDE.labUtil;
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
  window.GUIDE.labUtil.waveSvg = waveSvg;
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
})();
