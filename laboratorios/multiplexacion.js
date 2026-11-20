/* Laboratorios de la Unidad 8: FDM y TDM. */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;
  const { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss } = window.GUIDE.labUtil;
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

  /* ---------- TDM síncrono: armado de la trama, con los casos de los parciales ---------- */
  const TDM_PRESETS = [
    ['Temas 1 y 3 (2025)', { n: 10, r: 10, b: 8, s: 1 }], ['Tema 2 (2025)', { n: 10, r: 10, b: 1, s: 8 }], ['Tema 3, otra versión', { n: 5, r: 20, b: 1, s: 8 }],
    ['Finales 2019', { n: 4, r: 2, b: 8, s: 1 }], ['TP 8', { n: 30, r: 100, b: 8, s: 1 }],
  ];
  L.tdm = (el, cfg) => {
    const st = { n: cfg.n || 10, r: cfg.r || 10, b: cfg.b || 8, s: cfg.s ?? 1 };
    el.insertAdjacentHTML('beforeend', `<div class="lab-row presets" role="group" aria-label="Casos de los parciales">${TDM_PRESETS.map(([t], i) => `<button type="button" class="btn sm" data-p="${i}">${t}</button>`).join('')}</div>
      <div class="tdm-ctl"><div class="seg-row"><span>Cada canal aporta</span><div class="toggle" role="group" aria-label="Unidad por canal" data-g="b">${[[1, '1 bit'], [2, '2 bits'], [4, '4 bits'], [8, '1 byte']].map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join('')}</div></div>
      <div class="seg-row"><span>Sincronismo por trama</span><div class="toggle" role="group" aria-label="Sincronismo por trama" data-g="s">${[[0, 'nada'], [1, '1 bit'], [8, '1 byte']].map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join('')}</div></div></div>`);
    const v = sliders(el, [{ id: 'n', label: 'Canales N', min: 2, max: 32, step: 1, value: st.n }, { id: 'r', label: 'Velocidad de cada canal [kbps]', min: 1, max: 200, step: 1, value: st.r }], (vals) => { st.n = vals.n; st.r = vals.r; draw(); });
    el.insertAdjacentHTML('beforeend', '<div class="scope tdm-scope"><p class="scope-cap tdm-cap"></p><div class="tdm-frame"></div><p class="scope-cap tdm-time"></p></div><div class="lab-read tdm-read" aria-live="polite"></div>');
    const sync = (g, k) => el.querySelectorAll(`[data-g="${g}"] button`).forEach((x) => x.setAttribute('aria-pressed', +x.dataset.k === k));
    const draw = () => {
      sync('b', st.b); sync('s', st.s);
      const t = X.tdm(st.n, st.r * 1e3, st.b, st.s);
      const show = Math.min(st.n, 12), more = st.n > show;
      const cells = [];
      if (st.s) cells.push(`<div class="tdm-slot sync" style="--w:${st.s}"><b>S</b><span>${st.s === 8 ? '1 byte' : `${st.s} bit`}</span></div>`);
      for (let c = 0; c < show; c++) cells.push(`<div class="tdm-slot" style="--w:${st.b};--h:${(c * 360) / Math.max(show, 6)}"><b>C${c + 1}</b><span>${'<i></i>'.repeat(Math.min(st.b, 8))}</span></div>`);
      if (more) cells.push(`<div class="tdm-slot more" style="--w:2"><b>…C${st.n}</b></div>`);
      el.querySelector('.tdm-cap').innerHTML = `Una trama: ${st.s ? `${st.s} bit${st.s > 1 ? 's' : ''} de sincronismo + ` : ''}${st.n} ranuras de ${st.b} bit${st.b > 1 ? 's' : ''}`;
      const fr = el.querySelector('.tdm-frame');
      fr.innerHTML = `<div class="tdm-row">${cells.join('')}</div><div class="tdm-sweep" aria-hidden="true"></div>`;
      fr.style.setProperty('--dur', `${Math.min(4, Math.max(1.2, t.bits / 40))}s`);
      el.querySelector('.tdm-time').textContent = `sale cada ${eng(t.Tf, 's')} (${eng(t.fps, 'tramas/s')})`;
      el.querySelector('.tdm-read').innerHTML = `<ol class="steps">
        <li><b>Bits de la trama:</b> N × unidad + sincronismo = ${st.n} × ${st.b} + ${st.s} = <strong>${t.bits} bits</strong></li>
        <li><b>Duración:</b> lo que tarda un canal en juntar su unidad = ${st.b} bit${st.b > 1 ? 's' : ''} / ${num(st.r)} kbps = <strong>${eng(t.Tf, 's')}</strong></li>
        <li><b>Tasa del enlace:</b> ${t.bits} bits / ${eng(t.Tf, 's')} = <strong>${eng(t.R, 'bps')}</strong></li>
        <li><b>Verificación:</b> datos ${st.n} × ${num(st.r)} kbps = ${eng(t.data, 'bps')} + sincronismo ${eng(t.sync, 'bps')} = ${eng(t.data + t.sync, 'bps')}</li></ol>`
        + chips([['Eficiencia', `${num((t.data / t.R) * 100, 2)} %`, 'acc'], ['Sincronismo', `${num((t.sync / t.R) * 100, 2)} % de la línea`, t.sync / t.R > 0.2 ? 'warn' : '']]);
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.p) {
        Object.assign(st, TDM_PRESETS[+b.dataset.p][1]);
        ['n', 'r'].forEach((k) => { const inp = el.querySelector(`input[data-id="${k}"]`); inp.value = st[k]; v[k] = st[k]; inp.dispatchEvent(new Event('input')); });
        draw();
      } else if (b.dataset.k) { st[b.closest('[data-g]').dataset.g] = +b.dataset.k; draw(); }
    });
    draw();
  };
})();
