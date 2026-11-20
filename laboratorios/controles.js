/* Controles compartidos por todos los laboratorios: deslizadores, botones, selectores, lecturas y formato de números. */
/* Cada laboratorio redibuja al mover un control; los cálculos vienen de calculos.js (los mismos que usan las soluciones y las pruebas). */
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
  // Plano I/Q: points = [{ i, q, label?, on? }]; circles = radios a marcar. Escala común para que se vean distancias reales
  function constPlane(points, opts = {}) {
    const S = opts.size || 240, c = S / 2, R = opts.max || Math.max(1, ...points.map((p) => Math.hypot(p.i, p.q))) * 1.25;
    const k = (S / 2 - 18) / R, X = (v) => c + v * k, Y = (v) => c - v * k;
    const ring = (r) => `<circle cx="${c}" cy="${c}" r="${r * k}" class="cp-ring"/>`;
    return `<svg class="cplane" viewBox="0 0 ${S} ${S}" role="img" aria-label="${esc(opts.alt || 'Diagrama de constelación')}">
      ${(opts.circles || []).map(ring).join('')}
      <line x1="8" y1="${c}" x2="${S - 8}" y2="${c}" class="cp-ax"/><line x1="${c}" y1="8" x2="${c}" y2="${S - 8}" class="cp-ax"/>
      <text x="${S - 8}" y="${c + 16}" class="cp-axl">I</text><text x="${c - 14}" y="16" class="cp-axl">Q</text>
      ${points.map((p) => `<g class="cp-pt${p.on ? ' on' : ''}"${p.key != null ? ` data-k="${p.key}"` : ''}><circle cx="${X(p.i)}" cy="${Y(p.q)}" r="${p.on ? 7 : 5.5}"/>${p.label != null ? (() => { const r = Math.hypot(p.i, p.q), ux = r ? p.i / r : 0, uy = r ? p.q / r : 1; return `<text x="${(X(p.i) + ux * 16).toFixed(1)}" y="${(Y(p.q) - uy * 15 + 4).toFixed(1)}">${p.label}</text>`; })() : ''}</g>`).join('')}
    </svg>`;
  }
  // Onda modulada símbolo por símbolo con referencia seno: s(t) = A·sen(2π·c·t + φ). syms = [{ A, ph, cyc?, top?, bottom? }]
  function symbolWave(syms, opts = {}) {
    const sw = opts.sw || 72, H = opts.h || 130, pad = 8, W = pad * 2 + syms.length * sw, mid = H / 2 + 6;
    const Amax = opts.amax || Math.max(1e-9, ...syms.map((s) => s.A));
    let d = '';
    syms.forEach((s, i) => {
      const cyc = s.cyc ?? opts.cyc ?? 1.5;
      for (let j = 0; j <= 48; j++) {
        const u = j / 48, x = pad + i * sw + u * sw, y = mid - (s.A / Amax) * (H / 2 - 24) * Math.sin(2 * PI * cyc * u + (s.ph * PI) / 180);
        d += `${i || j ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
    return `<svg class="swave" viewBox="0 0 ${W} ${H + 16}" role="img" aria-label="${esc(opts.alt || 'Señal modulada')}">
      ${syms.map((s, i) => `<g class="sw-sym${s.on ? ' on' : ''}" data-i="${i}"><rect x="${pad + i * sw}" y="14" width="${sw}" height="${H - 8}" class="sw-hit"/><line x1="${pad + i * sw}" y1="14" x2="${pad + i * sw}" y2="${H + 6}" class="sw-grid"/>
        ${s.top != null ? `<text x="${pad + i * sw + sw / 2}" y="11" class="sw-top">${s.top}</text>` : ''}${s.bottom != null ? `<text x="${pad + i * sw + sw / 2}" y="${H + 15}" class="sw-bot">${s.bottom}</text>` : ''}</g>`).join('')}
      <line x1="${pad}" y1="${mid}" x2="${W - pad}" y2="${mid}" class="sw-zero"/><path d="${d}" class="sw-sig"/></svg>`;
  }
  window.GUIDE.labUtil = { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss, constPlane, symbolWave };
})();
