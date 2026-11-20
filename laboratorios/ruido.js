/* Laboratorio de la Unidad 3: presupuesto de enlace WiFi. */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;
  const { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss } = window.GUIDE.labUtil;
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
})();
