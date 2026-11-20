/* Portada: el curso como un recorrido del transmisor al receptor, simulacros por parcial y guías hermanas. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
  // Guías hermanas: página publicada y repositorio de cada una
  // [nombre, materia, slug, año de la carrera]
  const SIBLINGS = [
    ['Integrando Ando', 'Análisis Matemático II (límites, derivadas, integrales múltiples, en 3D)', 'integrando-ando', 2],
    ['Operando Ando', 'Sistemas Operativos (procesos, planificación, memoria, archivos)', 'operando-ando', 2],
    ['Backeando Ando', 'Desarrollo de software backend (C#, ASP.NET, EF Core)', 'backeando-ando', 3],
    ['Fronteando Ando', 'Desarrollo frontend (HTML, CSS, JavaScript, React)', 'fronteando-ando', 3],
    ['Diseñando Ando', 'Diseño de Sistemas de Información (UML, GRASP, GoF)', 'disenando-ando', 3],
    ['Iterando Ando', 'Matemática Superior (Laplace, métodos numéricos, Fourier)', 'iterando-ando', 3],
    ['Probando Ando', 'Probabilidad y Estadística (Bayes, distribuciones, intervalos, tests)', 'probando-ando', 3],
    ['Economizar', 'Economía (micro y macro con gráficas)', 'economizar', 3],
  ];
  function moduleScore(modId) {
    const qs = [...QUESTIONS, ...OPENS].filter((q) => q.module === modId && answers[q.id]);
    if (qs.length < 3) return null;
    return Math.round((qs.filter((q) => answers[q.id].ok).length / qs.length) * 100);
  }

  const HERO_MODES = [['nrz', 'NRZ'], ['manchester', 'Manchester'], ['ami', 'AMI'], ['ask', 'ASK'], ['fsk', 'FSK'], ['bpskC', 'BPSK'], ['qpsk', 'QPSK']];
  function renderHome() {
    document.title = NAME;
    document.body.dataset.view = 'home';
    const resume = LESSONS.find((l) => !done.has(l.id)) || LESSONS[0];
    const curIdx = MODULES.findIndex((m) => m.id === resume.module);
    const nEx = LESSONS.reduce((a, l) => a + (l.exercises?.length || 0), 0);
    const nOfficial = LESSONS.reduce((a, l) => a + (l.exercises || []).filter((e) => e.official).length, 0);
    const nLabs = LESSONS.reduce((a, l) => a + (l.labs?.length || 0), 0);
    const nPx = EXS.filter(({ ex }) => ex.exam).length;

    const stops = ALL_MODULES.map((m) => {
      const i = MODULES.indexOf(m);
      if (i === -1) return `<li class="stop pending" style="--p:0"><span class="stop-link"><span class="stop-dot" aria-hidden="true"></span><span class="stop-name">${m.stop}</span><span class="sr-only">: ${m.title}, pendiente</span></span></li>`;
      const total = lessonsOf(m.id).length;
      const d = modDone(m);
      const state = d === total ? 'done' : i === curIdx ? 'current' : i < curIdx ? 'partial' : '';
      return `<li class="stop ${state}" style="--p:${total ? d / total : 0}">
        <a href="#/${lessonsOf(m.id)[0].id}"><span class="stop-dot" aria-hidden="true"></span><span class="stop-name">${m.stop}</span><span class="sr-only">: ${m.title}, ${d} de ${total} lecciones</span></a></li>`;
    }).join('');

    // Punto débil: módulo con peor resultado en preguntas respondidas
    const scored = MODULES.map((m) => ({ m, s: moduleScore(m.id) })).filter((x) => x.s != null).sort((a, b) => a.s - b.s);
    const weak = scored[0] && scored[0].s < 70 ? scored[0] : null;

    const units = UNITS.map((u) => {
      const mods = ALL_MODULES.filter((m) => m.unit === u.id);
      if (!mods.length && !u.all) return '';
      return `
      <section class="home-unit" data-u="${u.id}">
        <h2><span class="unit-tag">${u.title}</span>${u.name}</h2>
        ${u.all ? `<p class="unit-note">El final toma <strong>todas las unidades</strong> (${MODULES.map((m) => m.tema).join(', ')}) más la Unidad 10. Su simulacro mezcla preguntas de toda la guía.</p>` : ''}
        <ul class="mod-list">${mods.map((m) => {
          if (!MODULES.includes(m)) return `<li class="mod-pending"><div><span class="mod-title"><span class="mod-n">${tagOf(m)}</span>${m.title}</span>
            <span class="mod-blurb">Pendiente: ${m.blurb}. Cuando se cargue aparece acá con su teoría, laboratorios y preguntas.</span></div></li>`;
          const total = lessonsOf(m.id).length; const d = modDone(m); const s = moduleScore(m.id);
          return `<li><a href="#/${lessonsOf(m.id)[0].id}">
            <span class="mod-title"><span class="mod-n">${tagOf(m)}</span>${m.title}</span>
            <span class="mod-blurb">${total} lecciones: ${m.blurb}</span>
            <span class="mod-meter" aria-hidden="true"><span style="width:${(d / total) * 100}%"></span></span>
            <span class="mod-meta">${d === total ? 'Completo' : d ? `${d} de ${total} hechas` : 'Sin empezar'}${s != null ? `, ${s}% de aciertos` : ''}</span>
          </a></li>`;
        }).join('')}</ul>
      </section>`;
    }).join('');

    const nP = (u) => modsOfUnit(u).reduce((a, m) => a + QUESTIONS.filter((q) => q.module === m.id).length, 0);
    main.innerHTML = `
      <article class="home">
        <header class="hero">
          <div class="hero-grid">
            <div class="hero-txt">
              <p class="hero-kicker">Comunicación de Datos 2026, UTN-FRT, Ingeniería en Sistemas de Información</p>
              <h1>Comunicación de Datos, del bit a la señal.</h1>
              <p class="lede">La teoría de la cátedra, laboratorios que se mueven y los parciales reales resueltos paso a paso: ${LESSONS.length} lecciones, ${nLabs} laboratorios, ${QUESTIONS.length + OPENS.length} preguntas que se corrigen al instante y ${nEx} ejercicios, ${nPx} de ellos de <a href="#/parciales">${EXAMS.length} parciales y finales</a>.</p>
              <div class="hero-actions">
                <a class="btn primary" href="#/${resume.id}">${done.size ? 'Seguir con' : 'Empezar con'} “${resume.title}”</a>
                <a class="btn" href="#/parciales">Ver los parciales resueltos</a>
                ${reviewIds().length ? `<a class="btn" href="#/repaso">Repasar ${reviewIds().length} preguntas falladas</a>` : ''}
              </div>
              ${weak ? `<p class="weak">Tu punto más flojo por ahora es <a href="#/quiz/${weak.m.id}">${weak.m.title}</a>, con ${weak.s}% de aciertos. Conviene repasarlo antes de seguir.</p>` : ''}
            </div>
            <section class="hero-inst" aria-label="Probá: tocá los bits y elegí cómo se transmiten">
              <div class="hi-bits" role="group" aria-label="Bits a transmitir">${[1, 0, 1, 1, 0, 0, 1, 0].map((b, i) => `<button type="button" data-b="${i}" aria-pressed="${!!b}" aria-label="Bit ${i + 1}">${b}</button>`).join('')}</div>
              <div class="toggle hi-mode" role="group" aria-label="Código o modulación">${HERO_MODES.map(([k, t], i) => `<button type="button" data-m="${k}" aria-pressed="${!i}">${t}</button>`).join('')}</div>
              <div class="scope"><div class="wave-wrap hi-wave"></div></div>
              <p class="hi-read" aria-live="polite"></p>
            </section>
          </div>
          <ol class="route" aria-label="Recorrido del curso">
            <li class="end" aria-hidden="true"><span class="verb">Fuente</span></li>
            ${stops}
            <li class="end ok" aria-hidden="true"><span class="verb">Destino</span></li>
          </ol>
        </header>
        <div class="exam-cards">
          <a class="exam-card" data-u="px" href="#/parciales"><span class="ec-k">Parciales reales</span><span class="ec-t">Lo que toma la cátedra</span><span class="ec-m">${EXAMS.length} parciales y finales, ${nPx} ejercicios resueltos y lo que más se repite</span></a>
          ${UNITS.map((u) => `<a class="exam-card" data-u="${u.id}" href="#/simulacro/${u.id}"><span class="ec-k">${u.title}</span><span class="ec-t">Simulacro: ${u.name}</span><span class="ec-m">${u.all ? 'Unidades 1 a 10' : `Unidades ${ALL_MODULES.filter((m) => m.unit === u.id).map((m) => m.tema).join(', ')}`}: ${Math.min(20, nP(u.id))} de opción múltiple + ${Math.min(5, modsOfUnit(u.id).reduce((a, m) => a + OPENS.filter((q) => q.module === m.id).length, 0))} abiertas</span></a>`).join('')}
        </div>
        ${units}
        <section class="home-links">
          <div class="repo-card">
            <svg viewBox="0 0 16 16" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            <div><h2>El código está abierto</h2><p>Si encontrás un error, querés proponer una pregunta o ver cómo está hecha la guía, revisá el repositorio en GitHub.</p></div>
            <a class="btn" href="${REPO}" target="_blank" rel="noopener">Ver el repositorio</a>
          </div>
          <h2 class="also-h" id="tambien">También probá:</h2>
          ${[[2, '2.º año'], [3, '3.er año']].map(([a, t]) => `<h3 class="also-y">${t}</h3><ul class="also">${SIBLINGS.filter((s) => s[3] === a).map(([n, d, slug]) => `<li><a class="also-main" href="https://franco704.github.io/${slug}/" target="_blank" rel="noopener"><b>${n}</b><span>${d}</span></a><a class="also-repo" href="https://github.com/Franco704/${slug}" target="_blank" rel="noopener" aria-label="Repositorio de ${n}">repositorio</a></li>`).join('')}</ul>`).join('')}
        </section>
        <section class="home-how">
          <h2>Cómo estudiar con esta guía</h2>
          <ol>
            <li>Leé la teoría de cada lección en orden: cada unidad se apoya en la anterior (sin decibeles no hay SNR, sin SNR no hay Shannon).</li>
            <li>En cada laboratorio, anticipá qué va a pasar antes de mover el control. Así se entrena el parcial.</li>
            <li>Respondé las de opción múltiple y las <a href="#/abiertas">preguntas abiertas</a>: los cálculos se corrigen con tolerancia y unidades (podés escribir “133 Mbps” o “−100,8 dBm”), las teóricas por conceptos clave.</li>
            <li>Resolvé los ejercicios de los TP con lápiz, papel y calculadora antes de abrir la solución.</li>
            <li>Antes de cada parcial: los <a href="#/parciales">parciales reales</a> resueltos, su simulacro, la hoja de <a href="#/formulas">fórmulas</a> y lo que falles va a <a href="#/repaso">Repasar</a>.</li>
          </ol>
          <p class="kbd-line">Atajos: <kbd>←</kbd> <kbd>→</kbd> para moverte entre lecciones, <kbd>/</kbd> para buscar.</p>
        </section>
      </article>`;
    // El paquete recorre la ruta una sola vez y se detiene en el módulo actual
    const route = $('.route', main);
    route.style.setProperty('--cols', ALL_MODULES.length + 2);
    route.style.setProperty('--stop', ALL_MODULES.indexOf(MODULES[curIdx]) + 1);
    requestAnimationFrame(() => route.classList.add('go'));
  }
  // El instrumento de la portada: los mismos bits como código de línea o como modulación
  function heroInstrument() {
    const X = window.GUIDE.cx, U = window.GUIDE.labUtil;
    const box = $('.hero-inst', main);
    let mode = HERO_MODES[0][0];
    const draw = () => {
      const bits = [...box.querySelectorAll('[data-b]')].map((b) => (b.getAttribute('aria-pressed') === 'true' ? '1' : '0')).join('');
      const line = ['nrz', 'manchester', 'ami'].includes(mode);
      const wave = $('.hi-wave', box);
      if (line) {
        wave.innerHTML = U.waveSvg([...bits], X.lineCode(bits, mode), { unipolar: mode === 'nrz', alt: `Código ${mode}` });
      } else {
        const m = X.MODS[mode];
        wave.innerHTML = U.symbolWave(X.groups(bits, m.n).map((g) => { const p = m.map[g]; return { A: p.A, ph: p.ph < 0 ? p.ph + 360 : p.ph, cyc: m.freq ? 1 + m.freq[g] : 2, top: g }; }), { sw: 360 / (8 / m.n), h: 110, alt: `Señal ${m.name}` });
      }
      const n = line ? 1 : X.MODS[mode].n;
      $('.hi-read', box).textContent = line
        ? { nrz: 'NRZ: 1 → +V, 0 → 0 V. Simple, pero con muchos bits iguales seguidos el receptor pierde el reloj.', manchester: 'Manchester: un cambio en la mitad de cada bit. Siempre sincroniza, a costa del doble de ancho de banda.', ami: 'AMI: los 1 alternan +V y −V y los 0 son 0 V. Sin componente continua, pero los ceros seguidos no sincronizan.' }[mode]
        : `${X.MODS[mode].name}: ${n} bit${n > 1 ? 's' : ''} por símbolo, así que ${bits.length} bits viajan en ${bits.length / n} símbolos (r = R / ${n}).`;
    };
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.b) { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.textContent = on ? 1 : 0; }
      if (b.dataset.m) { mode = b.dataset.m; box.querySelectorAll('[data-m]').forEach((x) => x.setAttribute('aria-pressed', x === b)); }
      draw();
    });
    draw();
  }
  A.page((id) => id === '', (id) => { renderHome(id); heroInstrument(); });
})();
