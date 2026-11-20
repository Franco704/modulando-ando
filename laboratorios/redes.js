/* Laboratorio de la Unidad 1: topologías físicas. */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;
  const { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss } = window.GUIDE.labUtil;
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
})();
