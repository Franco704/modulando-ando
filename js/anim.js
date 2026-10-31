/* Animaciones: pantalla de entrada al cambiar de tema y glifo animado en la cabecera de cada lección.
   Adaptadas del "Laboratorio Frontend DSW" de Mateo Rusconi. Expone window.ANIM; app.js lo usa en route() y renderLesson(). */
(() => {
  const { LESSONS, MODULES, UNITS } = window.GUIDE;
  const RM = matchMedia('(prefers-reduced-motion: reduce)');

  // Cadena de pasos que se enciende etapa por etapa en la pantalla de entrada
  const PIPES = {
    u1: ['Fuente', 'Transmisor', 'Canal + ruido', 'Receptor', 'Destino'],
    u2: ['f(t)', 'Fourier', 'aₙ, bₙ, Cₙ', 'Espectro', 'Ancho de banda'],
    u3: ['P en W', '10·log', 'dB / dBm', 'Σ ganancias − pérdidas', 'RSSI ≥ S'],
    u4: ['P(x)', 'I = log₂ 1/P', 'H = Σ P·I', 'R = r·H', 'Huffman'],
    u5: ['B', 'Nyquist 2B log₂M', 'SNR', 'Shannon B log₂(1+S/N)', 'R ≤ C'],
    u6: ['Datos', '+ redundancia', 'Canal', 'Detectar', 'Corregir'],
    u7: ['Bits', 'Símbolos', 'R = r·log₂N', 'Código de línea', 'Banda base'],
    u8: ['Bits', 'n = log₂M', 'Fase + amplitud', 'Portadora', 'Multiplexar'],
    u9: ['DTE', 'Módem (DCE)', 'Splitter + par de cobre', 'DSLAM / OLT', 'Fibra · Internet'],
  };

  // trap = la confusión típica del tema
  const TRAPS = {
    u1: 'OSI tiene <b>7 capas</b> y TCP/IP <b>4</b>: TCP/IP junta aplicación, presentación y sesión en una, y física con enlace en <b>acceso a la red</b>.',
    u2: 'El ancho de banda es <b>f<sub>máx</sub> − f<sub>mín</sub></b>, no la frecuencia más alta. Y en el tren de pulsos el primer cero del espectro está en <b>1/p</b> (ancho del pulso), no en 1/T.',
    u3: 'dB es una <b>relación</b>; dBm es una <b>potencia</b> referida a 1 mW. Se suman dBm + dB, nunca dBm + dBm. Y la temperatura del ruido térmico va en <b>Kelvin</b>.',
    u4: 'La información de un símbolo es log₂(<b>1/P</b>): cuanto <b>menos</b> probable, más información. La entropía es máxima cuando los símbolos son <b>equiprobables</b>.',
    u5: 'En Shannon la SNR va en <b>veces</b>, no en dB: 20 dB son 100 veces. Duplicar la SNR <b>no</b> duplica la capacidad.',
    u6: 'En el CRC se agregan <b>r ceros</b> (r = grado de G, una menos que sus bits). En Hamming de la cátedra las posiciones se numeran de <b>derecha a izquierda</b>.',
    u7: 'Bits por segundo y baudios coinciden solo con <b>2 niveles</b>: R = r·log₂N. Manchester tiene transición en la <b>mitad</b> de cada bit; el diferencial mira el <b>comienzo</b>.',
    u8: 'Baudios = bps / <b>log₂M</b>. QPSK y 4-ASK tienen la misma tasa de símbolos; en QAM, M ≤ fases × amplitudes. Nyquist del muestreo: <b>fs ≥ 2·f<sub>máx</sub></b>.',
    u9: 'ADSL multiplexa voz y datos en <b>frecuencia</b> (el splitter los separa); el <b>DSLAM</b> está en la central. En DMT lo espaciado en forma constante son las <b>frecuencias</b> y en cada una se mide la <b>SNR</b>. En GPON la bajada es <b>broadcast</b> y la subida <b>TDMA</b>; el splitter óptico es <b>pasivo</b>.',
  };

  // Un SVG de 150×120 por tema. Sin animación (reduced-motion) cada uno queda en un estado final legible.
  const d = (s) => `style="animation-delay:${s}s"`;
  const AX = '<path d="M12 8V108H142" class="gx-strong"/>';
  const sine = (x0, x1, y0, amp, cyc, n = 60) => Array.from({ length: n + 1 }, (_, k) => { const x = x0 + ((x1 - x0) * k) / n; return `${k ? 'L' : 'M'}${x.toFixed(1)} ${(y0 - amp * Math.sin((2 * Math.PI * cyc * k) / n)).toFixed(1)}`; }).join('');
  const sq = (n) => Array.from({ length: 61 }, (_, k) => { const x = 10 + k * 2.1, t = (k / 60) * Math.PI * 4; let y = 0; for (let h = 1; h <= n; h += 2) y += Math.sin(h * t) / h; return `${k ? 'L' : 'M'}${x.toFixed(1)} ${(60 - 30 * (4 / Math.PI) * y).toFixed(1)}`; }).join('');
  const GLYPHS = {
    u1: `<rect x="6" y="46" width="30" height="28" rx="5" class="gx-soft"/><text x="21" y="64" class="gx-t gx-tc">Tx</text>
      <rect x="114" y="46" width="30" height="28" rx="5" class="gx-soft"/><text x="129" y="64" class="gx-t gx-tc">Rx</text>
      <path d="M36 60H114" class="gx-strong gx-dash"/><path d="M75 22V44" class="gx-sup"/><text x="75" y="16" class="gx-t" style="fill:var(--c-s)">ruido</text>
      <circle cx="40" cy="60" r="5" class="gx-eqf gx-flow"/>`,
    u2: `<path d="M8 60H142" class="gx-line"/><path d="${sq(1)}" class="gx-dem gx-kw4" ${d(0)}/><path d="${sq(3)}" class="gx-dem gx-kw4" ${d(1.2)}/><path d="${sq(5)}" class="gx-dem gx-kw4" ${d(2.4)}/><path d="${sq(15)}" class="gx-dem gx-kw4" ${d(3.6)}/>`,
    u3: `${AX}<path d="M14 20H40V34H66V70H92V58H118V96H140" class="gx-acc-s gx-draw" pathLength="1"/><path d="M14 88H142" class="gx-sup gx-dash"/><text x="120" y="84" class="gx-t" style="fill:var(--c-s)">S</text><text x="44" y="28" class="gx-t gx-tc">−dB</text><text x="94" y="52" class="gx-t gx-tc">+dBi</text>`,
    u4: `${AX}<path d="${Array.from({ length: 41 }, (_, k) => { const p = 0.0001 + (k / 40) * 0.9998; const h = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p); return `${k ? 'L' : 'M'}${(14 + p * 126).toFixed(1)} ${(106 - h * 90).toFixed(1)}`; }).join('')}" class="gx-dem gx-draw" pathLength="1"/><circle cx="77" cy="16" r="5" class="gx-eqf gx-pop" ${d(1.2)}/><text x="100" y="30" class="gx-t gx-tc">H(p)</text>`,
    u5: `${AX}<path d="${Array.from({ length: 41 }, (_, k) => { const s = k / 40; return `${k ? 'L' : 'M'}${(14 + s * 126).toFixed(1)} ${(106 - Math.log2(1 + 300 * s) / Math.log2(301) * 88).toFixed(1)}`; }).join('')}" class="gx-acc-s gx-draw" pathLength="1"/><text x="104" y="98" class="gx-t">SNR</text><text x="40" y="26" class="gx-t gx-tc">C = B log₂(1+S/N)</text>`,
    u6: ['1', '0', '1', '1', '0', '0', '1'].map((b, i) => `<rect x="${8 + i * 19.5}" y="44" width="17" height="30" rx="4" class="${i === 3 ? 'gx-soft gx-swapA' : 'gx-box'}"/><text x="${16.5 + i * 19.5}" y="63" class="gx-t gx-ink">${b}</text>`).join('')
      + `<rect x="66.5" y="44" width="17" height="30" rx="4" class="gx-swapB" style="fill:var(--err-soft);stroke:var(--err)"/><text x="75" y="63" class="gx-t gx-swapB" style="fill:var(--err)">0</text><text x="75" y="96" class="gx-t gx-swapB" style="fill:var(--err)">síndrome = 4</text>`,
    u7: `<path d="M8 82H142" class="gx-line"/><path d="M10 40H28V84H46V84H64V40H82V84H100V40H118V40H140" class="gx-dem gx-draw" pathLength="1"/>${['1', '0', '0', '1', '0', '1', '1'].map((b, i) => `<text x="${19 + i * 18}" y="28" class="gx-t gx-ink">${b}</text>`).join('')}`,
    u8: `<path d="M8 60H142" class="gx-line"/><path d="${sine(10, 140, 60, 26, 6, 120)}" class="gx-pmg-s gx-draw" pathLength="1"/><path d="M75 8V112" class="gx-line gx-dash"/>
      ${[[45, 135], [-45, 45], [135, -135], [-135, -45]].map(([a], i) => `<circle cx="${75 + 34 * Math.cos((a * Math.PI) / 180)}" cy="${60 - 34 * Math.sin((a * Math.PI) / 180)}" r="5" class="gx-eqf gx-pop" ${d(0.6 + i * 0.3)}/>`).join('')}`,
    u9: `${AX}${[6, 9, 11, 12, 12, 11, 4, 3, 9, 8, 7, 5, 4].map((b, i) => `<rect x="${17 + i * 9.6}" y="${106 - b * 6.5}" width="7" height="${b * 6.5}" rx="1.5" class="gx-soft gx-grow-y" ${d((i * 0.12).toFixed(2))}/>`).join('')}<text x="80" y="18" class="gx-t gx-tc">bits por tono</text>`,
  };
  const glyph = (modId) => (GLYPHS[modId] ? `<svg viewBox="0 0 150 120" focusable="false">${GLYPHS[modId]}</svg>` : '');

  // Pantalla de entrada: se cierra sola, con un clic o con cualquier tecla
  function interstitial(n, title, mod) {
    return new Promise((res) => {
      const unit = UNITS.find((u) => u.id === mod.unit);
      const tag = `Unidad ${mod.tema} · TP ${mod.tp} · ${unit.title}`;
      const stages = PIPES[mod.id];
      const el = document.createElement('div');
      el.className = 'inter';
      el.dataset.u = mod.unit;
      el.tabIndex = -1;
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', `Lección ${n}: ${title.replace(/<[^>]*>/g, '')}`);
      el.innerHTML = `<div class="inter-box">
        <p class="inter-typed" style="--steps:${tag.length}" aria-hidden="true">${tag}</p>
        <h2>${mod.title}</h2>
        <p class="inter-pipe" aria-hidden="true">${stages.map((s, i) => `${i ? '<span class="ar">→</span>' : ''}<span class="s" ${d((0.35 + i * 0.16).toFixed(2))}>${s}</span>`).join('')}</p>
        <p class="inter-trap"><span class="lbl">Error típico en el parcial</span>${TRAPS[mod.id]}</p>
        <p class="inter-hint">Tocá o presioná una tecla para entrar</p>
      </div>`;
      let closed = false;
      const end = (e) => {
        if (closed) return;
        closed = true;
        // La tecla que cierra no llega a los atajos de la guía (flechas, /, Escape)
        if (e?.type === 'keydown') { e.preventDefault(); e.stopPropagation(); }
        window.removeEventListener('keydown', end, true);
        el.classList.add('out');
        setTimeout(() => el.remove(), 330);
        res();
      };
      el.addEventListener('click', end);
      window.addEventListener('keydown', end, true);
      document.body.append(el);
      el.focus();
      setTimeout(end, 3200);
    });
  }

  // Al entrar a una lección de otro tema. skip = true solo registra el tema (primera carga).
  let lastModule = null;
  function intro(lessonId, skip) {
    const i = LESSONS.findIndex((l) => l.id === lessonId);
    const mod = MODULES.find((m) => m.id === LESSONS[i]?.module);
    if (!mod || mod.id === lastModule) return Promise.resolve();
    lastModule = mod.id;
    if (skip || RM.matches || !PIPES[mod.id]) return Promise.resolve();
    return interstitial(i + 1, LESSONS[i].title, mod);
  }

  window.ANIM = { intro, glyph };
})();
