/* Motor de la guía: índice, rutas por hash, progreso, cuestionarios, preguntas abiertas con corrección inmediata,
   repaso, simulacros por parcial y final, taller de gráficas, fórmulas y laboratorios. */
(() => {
  const { UNITS, LESSONS, LABS } = window.GUIDE;
  const ALL_MODULES = window.GUIDE.MODULES;
  // Solo los módulos que ya tienen lecciones cargadas; el resto se muestra como pendiente
  const MODULES = ALL_MODULES.filter((m) => LESSONS.some((l) => l.module === m.id));
  const PENDING = ALL_MODULES.filter((m) => !MODULES.includes(m));
  const NAME = 'Modulando Ando';
  const $ = (s, el = document) => el.querySelector(s);
  const main = $('#main');
  const toc = $('#toc');
  const rail = $('#rail');
  const sidebar = $('#sidebar');
  const scrim = $('#scrim');
  const menuBtn = $('#menuBtn');
  const cx = window.GUIDE.cx;
  const REPO = 'https://github.com/Franco704/modulando-ando';
  // Guías hermanas: página publicada y repositorio de cada una
  const SIBLINGS = [
    ['Backeando Ando', 'Desarrollo de software backend (C#, ASP.NET, EF Core)', 'backeando-ando'],
    ['Fronteando Ando', 'Desarrollo frontend (HTML, CSS, JavaScript, React)', 'fronteando-ando'],
    ['Diseñando Ando', 'Diseño de Sistemas de Información (UML, GRASP, GoF)', 'disenando-ando'],
    ['Iterando Ando', 'Matemática Superior (Laplace, métodos numéricos, Fourier)', 'iterando-ando'],
    ['Economizar', 'Economía (micro y macro con gráficas)', 'economizar'],
    ['Probando Ando', 'Probabilidad y Estadística (Bayes, distribuciones, intervalos, tests)', 'probando-ando'],
  ];

  // ---------- Almacenamiento (puede fallar en modo privado) ----------
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  let done = new Set(store.get('ma-done', []));
  // Resultado por pregunta: { [qid]: { ok, tries } }. qid = leccion:indice (opción múltiple) o leccion:oN (abierta)
  let answers = store.get('ma-answers', {});
  let best = store.get('ma-best', {});
  const saveAnswers = () => store.set('ma-answers', answers);

  // Todas las preguntas con su id, módulo y lección
  const QUESTIONS = LESSONS.flatMap((l) => (l.quiz || []).map((q, i) => ({ ...q, id: `${l.id}:${i}`, lesson: l, module: l.module })));
  const OPENS = LESSONS.flatMap((l) => (l.open || []).map((q, i) => ({ ...q, id: `${l.id}:o${i}`, lesson: l, module: l.module, open: true })));
  const qById = Object.fromEntries([...QUESTIONS, ...OPENS].map((q) => [q.id, q]));

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const unitOf = (u) => UNITS.find((x) => x.id === u);
  // Módulos que entran en un parcial: el final integra todos
  const modsOfUnit = (u) => (unitOf(u)?.all ? MODULES : MODULES.filter((m) => m.unit === u));
  const tagOf = (m) => `Unidad ${m.tema} · TP ${m.tp}`;

  // ---------- Índice ----------
  const lessonsOf = (modId) => LESSONS.filter((l) => l.module === modId);
  const modOf = (id) => ALL_MODULES.find((m) => m.id === id);
  const modDone = (m) => lessonsOf(m.id).filter((l) => done.has(l.id)).length;

  function renderToc(filter = '') {
    const q = norm(filter.trim());
    let html = '';
    let n = 0;
    for (const u of UNITS) {
      let unitHtml = '';
      for (const mod of MODULES.filter((m) => m.unit === u.id)) {
        const items = LESSONS.map((l, i) => ({ l, i })).filter(({ l }) => l.module === mod.id);
        const visible = items.filter(({ l }) => !q || norm(`${l.title} ${l.keywords || ''} ${mod.title}`).includes(q));
        n += visible.length;
        if (!visible.length) continue;
        const open = q || visible.some(({ l }) => l.id === currentId()) || currentId() === `quiz/${mod.id}`;
        unitHtml += `<details class="toc-module" ${open ? 'open' : ''}>
          <summary><span><small class="toc-tema">${tagOf(mod)}</small> ${mod.title}</span><span class="toc-count">${modDone(mod)}/${items.length}</span></summary>
          <ol>${visible.map(({ l, i }) => `<li><a class="toc-link${done.has(l.id) ? ' is-done' : ''}" href="#/${l.id}" data-id="${l.id}">
            <span class="n">${i + 1}</span><span class="t">${l.title}</span><span class="check" aria-hidden="true"></span>${done.has(l.id) ? '<span class="sr-only"> (completada)</span>' : ''}</a></li>`).join('')}
            ${q ? '' : `<li><a class="toc-link toc-quiz" href="#/quiz/${mod.id}" data-id="quiz/${mod.id}"><span class="n" aria-hidden="true">?</span><span class="t">Cuestionario del módulo</span>${best[mod.id] != null ? `<span class="toc-score">${best[mod.id]}%</span>` : ''}</a></li>`}
          </ol></details>`;
      }
      if (!q) unitHtml += PENDING.filter((m) => m.unit === u.id).map((m) => `<p class="toc-pending"><small class="toc-tema">${tagOf(m)}</small> ${m.title}: pendiente</p>`).join('');
      if (unitHtml) html += `<section class="toc-unit" data-u="${u.id}"><h2>${u.title}<span>${u.name}</span></h2>${unitHtml}</section>`;
    }
    toc.innerHTML = n ? html : `<p class="toc-empty">No hay temas con “${esc(filter)}”. Probá con otra palabra.</p>`;
    markCurrent();
  }
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function markCurrent() {
    const id = currentId();
    toc.querySelectorAll('.toc-link').forEach((a) => {
      if (a.dataset.id === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function updateProgress() {
    const total = LESSONS.length;
    const count = LESSONS.filter((l) => done.has(l.id)).length;
    $('#progressFill').style.width = `${(count / total) * 100}%`;
    $('#progressText').textContent = `${count} de ${total}`;
    const pending = reviewIds().length;
    const badge = $('#reviewCount');
    badge.hidden = !pending;
    badge.textContent = pending;
  }
  const reviewIds = () => Object.keys(answers).filter((id) => qById[id] && !answers[id].ok);

  // ---------- Rutas ----------
  const currentId = () => decodeURIComponent(location.hash.replace(/^#\/?/, ''));

  let firstLoad = true;
  async function route() {
    const id = currentId();
    const idx = LESSONS.findIndex((l) => l.id === id);
    // Pantalla de entrada al cambiar de módulo; si mientras tanto cambió el hash, gana la ruta nueva
    if (idx !== -1) { await ANIM.intro(id, firstLoad); if (currentId() !== id) return; }
    firstLoad = false;
    rail.innerHTML = '';
    document.body.dataset.view = 'page';
    delete document.body.dataset.unit;
    if (idx !== -1) renderLesson(idx);
    else if (id.startsWith('quiz/') && MODULES.includes(modOf(id.slice(5)))) renderModuleQuiz(modOf(id.slice(5)));
    else if (id === 'repaso') renderReview();
    else if (id.startsWith('simulacro')) renderExam(unitOf(id.slice(10)));
    else if (id.startsWith('abiertas')) renderOpenPage(id.slice(9));
    else if (id === 'graficas') renderGraphs();
    else if (id === 'formulas') renderFormulas();
    else renderHome();
    renderToc($('#search').value);   // abre el módulo de la página actual
    closeMenu();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  // ---------- Portada: el curso como un recorrido del transmisor al receptor ----------
  function moduleScore(modId) {
    const qs = [...QUESTIONS, ...OPENS].filter((q) => q.module === modId && answers[q.id]);
    if (qs.length < 3) return null;
    return Math.round((qs.filter((q) => answers[q.id].ok).length / qs.length) * 100);
  }

  function renderHome() {
    document.title = NAME;
    document.body.dataset.view = 'home';
    const resume = LESSONS.find((l) => !done.has(l.id)) || LESSONS[0];
    const curIdx = MODULES.findIndex((m) => m.id === resume.module);
    const nEx = LESSONS.reduce((a, l) => a + (l.exercises?.length || 0), 0);
    const nOfficial = LESSONS.reduce((a, l) => a + (l.exercises || []).filter((e) => e.official).length, 0);
    const nLabs = LESSONS.reduce((a, l) => a + (l.labs?.length || 0), 0);

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

    const h = window.GUIDE.h;
    // Bits 1 0 1 1 → onda cuadrada y su aproximación con 3 armónicas: del dato a la señal
    const sq = (t) => (Math.floor(t) % 2 === 0 ? 1 : -1);
    const four = (t) => (4 / Math.PI) * [1, 3, 5].reduce((a, k) => a + Math.sin(k * Math.PI * t) / k, 0);
    const heroPlot = h.plot({ x: [0, 4], y: [-1.6, 1.8], w: 360, h: 240, xl: 't', yl: 'v', alt: 'Onda cuadrada y su aproximación con tres armónicas',
      curves: [{ f: sq, n: 400, cls: 'c-s pl-dash' }, { f: four, n: 240, cls: 'c-f', label: 'Σ 3 armónicas' }],
      texts: ['1', '0', '1', '0'].map((b, i) => ({ x: i + 0.5, y: 1.55, t: b, cls: 'c-root' })) });
    const nP = (u) => modsOfUnit(u).reduce((a, m) => a + QUESTIONS.filter((q) => q.module === m.id).length, 0);
    main.innerHTML = `
      <article class="home">
        <header class="hero">
          <div class="hero-grid">
            <div>
              <p class="hero-kicker">Comunicación de Datos 2026 · UTN-FRT · Ingeniería en Sistemas de Información</p>
              <h1>Comunicación de Datos, <em>del bit a la señal</em>.</h1>
              <p class="lede">Los parciales piden definir, comparar y calcular: decibeles, entropía, capacidad de un canal, CRC, Hamming, códigos de línea y modulaciones. Esta guía junta la teoría de la cátedra con gráficas que se mueven: ${LESSONS.length} lecciones, ${nLabs} laboratorios, ${QUESTIONS.length} preguntas de opción múltiple, ${OPENS.length} preguntas abiertas que se corrigen al instante y ${nEx} ejercicios resueltos paso a paso, ${nOfficial} de ellos de los trabajos prácticos.</p>
            </div>
            <div class="hero-plot" aria-hidden="true">${heroPlot}</div>
          </div>
          <ol class="route" aria-label="Recorrido del curso">
            <li class="end" aria-hidden="true"><span class="verb">Fuente</span></li>
            ${stops}
            <li class="end ok" aria-hidden="true"><span class="verb">Destino</span></li>
          </ol>
          <div class="hero-actions">
            <a class="btn primary" href="#/${resume.id}">${done.size ? 'Seguir con' : 'Empezar con'} “${resume.title}”</a>
            <a class="btn" href="#/abiertas">Preguntas abiertas</a>
            <a class="btn" href="#/graficas">Taller de gráficas</a>
            <a class="btn" href="#/formulas">Fórmulas</a>
            <a class="btn" href="${REPO}" target="_blank" rel="noopener">Repositorio en GitHub</a>
            <button class="btn" type="button" data-act="also">También probá…</button>
            ${reviewIds().length ? `<a class="btn" href="#/repaso">Repasar ${reviewIds().length} preguntas falladas</a>` : ''}
          </div>
          ${weak ? `<p class="weak">Tu punto más flojo por ahora es <a href="#/quiz/${weak.m.id}">${weak.m.title}</a>, con ${weak.s}% de aciertos. Conviene repasarlo antes de seguir.</p>` : ''}
        </header>
        <div class="exam-cards">
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
          <ul class="also">${SIBLINGS.map(([n, d, slug]) => `<li><a class="also-main" href="https://franco704.github.io/${slug}/" target="_blank" rel="noopener"><b>${n}</b><span>${d}</span></a><a class="also-repo" href="https://github.com/Franco704/${slug}" target="_blank" rel="noopener" aria-label="Repositorio de ${n}">repositorio</a></li>`).join('')}</ul>
        </section>
        <section class="home-how">
          <h2>Cómo estudiar con esta guía</h2>
          <ol>
            <li>Leé la teoría de cada lección en orden: cada unidad se apoya en la anterior (sin decibeles no hay SNR, sin SNR no hay Shannon).</li>
            <li>En cada laboratorio, anticipá qué va a pasar antes de mover el control. Así se entrena el parcial.</li>
            <li>Respondé las de opción múltiple y las <a href="#/abiertas">preguntas abiertas</a>: los cálculos se corrigen con tolerancia y unidades (podés escribir “133 Mbps” o “−100,8 dBm”), las teóricas por conceptos clave.</li>
            <li>Resolvé los ejercicios de los TP con lápiz, papel y calculadora antes de abrir la solución.</li>
            <li>Antes de cada parcial: su simulacro, la hoja de <a href="#/formulas">fórmulas</a> y lo que falles va a <a href="#/repaso">Repasar</a>.</li>
          </ol>
          <p class="kbd-line">Atajos: <kbd>←</kbd> <kbd>→</kbd> para moverte entre lecciones, <kbd>/</kbd> para buscar.</p>
        </section>
      </article>`;
    $('[data-act="also"]', main).addEventListener('click', () => $('#tambien').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    // El paquete recorre la ruta una sola vez y se detiene en el módulo actual
    const route = $('.route', main);
    route.style.setProperty('--cols', ALL_MODULES.length + 2);
    route.style.setProperty('--stop', ALL_MODULES.indexOf(MODULES[curIdx]) + 1);
    requestAnimationFrame(() => route.classList.add('go'));
  }

  // ---------- Lección ----------
  function renderSources(l) {
    return (l.sources || []).map((s) => `
      <details class="source">
        <summary><span>${s.title}</span><span class="host">${s.url ? new URL(s.url).hostname.replace('www.', '') : s.ref || ''}</span></summary>
        <div class="source-body">
          <ul>${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>
          ${s.url ? `<p><a href="${s.url}" target="_blank" rel="noopener">Abrir la fuente</a></p>` : ''}
        </div>
      </details>`).join('');
  }

  const LEVEL = { 1: 'Básico', 2: 'Intermedio', 3: 'Desafío' };
  function renderExercises(l) {
    let practice = 0;
    return (l.exercises || []).map((ex) => {
      const s = ex.solution;
      const tag = ex.official ? `TP ${ex.official.split('.')[0]}, ejercicio ${ex.official.split('.')[1]}` : `Práctica ${++practice}`;
      return `
        <article class="exercise${ex.official ? ' official' : ''}">
          <header class="ex-head">
            <span class="ex-tag">${tag}</span>
            ${ex.level ? `<span class="ex-level" data-level="${ex.level}">${LEVEL[ex.level]}</span>` : ''}
          </header>
          <h3>${ex.title}</h3>
          <div class="ex-prompt">${ex.prompt}</div>
          ${ex.hints ? `<details class="hint"><summary>Ver pistas</summary><ul>${ex.hints.map((h) => `<li>${h}</li>`).join('')}</ul></details>` : ''}
          <details class="solution">
            <summary>Ver solución</summary>
            <div class="sol-body"><div class="sol-explain">${s.explain}</div></div>
          </details>
        </article>`;
    }).join('');
  }

  function renderLesson(idx) {
    const l = LESSONS[idx];
    const mod = modOf(l.module);
    const prev = LESSONS[idx - 1];
    const next = LESSONS[idx + 1];
    const labs = l.labs || [];
    document.body.dataset.unit = mod.unit;
    document.title = `${l.title}, ${NAME}`;

    // Laboratorios no ubicados en el cuerpo se agregan al final de la teoría
    const where = l.body + (l.exercises || []).map((e) => e.prompt + e.solution.explain).join('');
    const placed = new Set([...where.matchAll(/data-lab="(\d+)"/g)].map((m) => +m[1]));
    const rest = labs.map((_, i) => i).filter((i) => !placed.has(i)).map((i) => `<div class="lab-mount" data-lab="${i}"></div>`).join('');
    const exercises = renderExercises(l);
    const sources = renderSources(l);
    const quiz = QUESTIONS.filter((q) => q.lesson === l);
    const opens = OPENS.filter((q) => q.lesson === l);

    main.innerHTML = `
      <article class="lesson">
        <div class="lesson-glyph" aria-hidden="true">${ANIM.glyph(mod.id)}</div>
        <p class="crumb"><span class="unit-tag sm">${unitOf(mod.unit).title}</span> <a href="#/${lessonsOf(mod.id)[0].id}">Unidad ${mod.tema}: ${mod.title}</a>, lección ${idx + 1} de ${LESSONS.length}</p>
        <h1>${l.title}</h1>
        <p class="tldr">${l.tldr}</p>
        ${l.goals ? `<div class="goals"><p>Al terminar vas a poder:</p><ul>${l.goals.map((g) => `<li>${g}</li>`).join('')}</ul></div>` : ''}
        <div class="body">${l.body}${rest}</div>
        ${quiz.length ? `<section class="check-sec" id="comprobar"><h2>Comprobá lo que entendiste</h2><p class="sec-lede">Elegí una respuesta: la corrección es inmediata. Lo que falles queda guardado para repasar.</p><div class="quiz-mount"></div></section>` : ''}
        ${opens.length ? `<section class="check-sec" id="abiertas"><h2>Respondé con tus palabras</h2><p class="sec-lede">Preguntas abiertas como las del parcial. Los cálculos aceptan unidades y redondeo; las teóricas se corrigen por los conceptos que no pueden faltar.</p><div class="open-mount"></div></section>` : ''}
        ${exercises ? `<section class="practice" id="ejercicios"><h2>Ejercicios</h2><p class="sec-lede">Resolvelos en papel, con calculadora, antes de abrir la solución. Equivocarse acá es gratis.</p>${exercises}</section>` : ''}
        ${sources ? `<section class="sources" id="bibliografia"><h2>Bibliografía</h2><p class="sec-lede">Qué dice cada fuente sobre este tema.</p>${sources}</section>` : ''}
        <div class="done-row">
          <button class="btn done-btn" id="doneBtn" type="button" aria-pressed="${done.has(l.id)}">${done.has(l.id) ? 'Lección completada' : 'Marcar como completada'}</button>
        </div>
        <nav class="pager" aria-label="Lecciones">
          ${prev ? `<a class="prev" href="#/${prev.id}"><small>Anterior</small><strong>${prev.title}</strong></a>` : '<span></span>'}
          ${next ? `<a class="next" href="#/${next.id}"><small>Siguiente</small><strong>${next.title}</strong></a>` : `<a class="next" href="#/quiz/${mod.id}"><small>Para cerrar</small><strong>Cuestionario del módulo</strong></a>`}
        </nav>
      </article>`;

    main.querySelectorAll('.lab-mount').forEach((el) => {
      const cfg = labs[+el.dataset.lab];
      if (cfg) mountLab(el, cfg);
    });
    if (quiz.length) renderQuiz($('.quiz-mount', main), quiz, { mode: 'inline' });
    if (opens.length) renderOpen($('.open-mount', main), opens, { mode: 'inline' });

    $('#doneBtn').addEventListener('click', (e) => {
      done.has(l.id) ? done.delete(l.id) : done.add(l.id);
      store.set('ma-done', [...done]);
      const on = done.has(l.id);
      e.currentTarget.setAttribute('aria-pressed', on);
      e.currentTarget.textContent = on ? 'Lección completada' : 'Marcar como completada';
      renderToc($('#search').value);
      updateProgress();
    });
    renderRail();
  }

  // Índice de la página a la derecha (pantallas anchas)
  function renderRail() {
    const hs = [...main.querySelectorAll('.lesson > .body > h2, .lesson > section > h2')];
    if (hs.length < 3) return;
    hs.forEach((h, i) => { if (!h.id) h.id = `s-${i}-${norm(h.textContent).replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`; });
    rail.innerHTML = `<p>En esta lección</p><ol>${hs.map((h) => `<li><a href="#${h.id}" data-target="${h.id}">${h.textContent}</a></li>`).join('')}</ol>`;
    rail.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(a.dataset.target).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }));
    const links = new Map([...rail.querySelectorAll('a')].map((a) => [a.dataset.target, a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.removeAttribute('aria-current'));
          links.get(en.target.id)?.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    hs.forEach((h) => io.observe(h));
  }

  const record = (q, ok) => {
    const prev = answers[q.id] || { tries: 0 };
    answers[q.id] = { ok, tries: prev.tries + 1 };
    saveAnswers();
    updateProgress();
  };

  // ---------- Cuestionarios de opción múltiple ----------
  const shuffle = window.GUIDE.util.shuffle;
  // mode 'inline': corrige cada pregunta al responder. 'exam': corrige todo al final (extra: preguntas abiertas que se corrigen junto con estas).
  function renderQuiz(el, qs, { mode, onFinish, extra } = {}) {
    const letters = 'ABCDEF';
    // Las opciones se muestran en orden aleatorio para que la posición no delate la respuesta
    const order = Object.fromEntries(qs.map((q) => [q.id, shuffle(q.o.map((_, i) => i))]));
    el.innerHTML = `<ol class="quiz ${mode}">${qs.map((q, n) => `
      <li class="q" data-id="${q.id}">
        <fieldset>
          <legend><span class="q-n">${n + 1}.</span> ${q.q}${mode === 'exam' || mode === 'review' ? `<span class="q-from">${q.lesson.title}</span>` : ''}</legend>
          <div class="q-opts">${order[q.id].map((i, k) => `
            <label class="opt"><input type="radio" name="q-${q.id}" value="${i}"><span class="opt-l" aria-hidden="true">${letters[k]}</span><span class="opt-t">${q.o[i]}</span></label>`).join('')}
          </div>
          <div class="q-feedback" aria-live="polite"></div>
        </fieldset>
      </li>`).join('')}</ol>
      ${mode === 'exam' ? '<div class="exam-extra"></div><div class="exam-actions"><button class="btn primary" type="button" data-act="grade">Corregir</button><p class="exam-left"></p></div><div class="exam-result" aria-live="polite"></div>' : ''}`;

    const showFeedback = (li, q, chosen) => {
      const ok = chosen === q.a;
      li.classList.add(ok ? 'is-ok' : 'is-bad');
      li.querySelectorAll('.opt').forEach((lab) => {
        const input = lab.querySelector('input');
        const i = +input.value;
        if (i === q.a) lab.classList.add('right');
        else if (i === chosen) lab.classList.add('wrong');
        input.disabled = true;
      });
      const correctLetter = letters[order[q.id].indexOf(q.a)];
      li.querySelector('.q-feedback').innerHTML = `<p><strong>${ok ? 'Correcto.' : chosen < 0 ? `Sin responder: la respuesta es la ${correctLetter}.` : `Incorrecto: la respuesta es la ${correctLetter}.`}</strong> ${q.e || ''}</p>
        ${!ok ? `<p class="q-link"><a href="#/${q.lesson.id}">Releer “${q.lesson.title}”</a></p>` : ''}`;
      return ok;
    };

    if (mode !== 'exam') {
      el.querySelectorAll('.q').forEach((li) => {
        const q = qById[li.dataset.id];
        li.addEventListener('change', (e) => record(q, showFeedback(li, q, +e.target.value)));
      });
      return;
    }

    const grader = extra?.length ? renderOpen($('.exam-extra', el), extra, { mode: 'exam', start: qs.length }) : null;
    const left = $('.exam-left', el);
    const total = qs.length + (extra?.length || 0);
    const updateLeft = () => {
      const n = el.querySelectorAll('.q input:checked').length + (grader ? grader.answered() : 0);
      left.textContent = n < total ? `Respondiste ${n} de ${total}.` : 'Respondiste todas.';
    };
    el.addEventListener('change', updateLeft);
    el.addEventListener('input', updateLeft);
    updateLeft();
    $('[data-act="grade"]', el).addEventListener('click', (e) => {
      let ok = 0;
      const byMod = {};
      const tally = (q, good) => { ok += good; (byMod[q.module] ||= { ok: 0, n: 0 }).n++; if (good) byMod[q.module].ok++; };
      el.querySelectorAll('.q').forEach((li) => {
        const q = qById[li.dataset.id];
        const chosen = li.querySelector('input:checked');
        const good = chosen ? showFeedback(li, q, +chosen.value) : (showFeedback(li, q, -1), false);
        record(q, good);
        tally(q, good);
      });
      grader?.grade().forEach(([q, good]) => tally(q, good));
      const pct = Math.round((ok / total) * 100);
      e.currentTarget.remove();
      left.remove();
      const C = 2 * Math.PI * 52;   // circunferencia del anillo
      const rows = Object.entries(byMod).map(([m, r]) => `<li><span>${modOf(m).title}</span><span>${r.ok} de ${r.n}</span></li>`).join('');
      $('.exam-result', el).innerHTML = `
        <div class="score ${pct >= 60 ? 'pass' : 'fail'}">
          <svg class="ring" viewBox="0 0 120 120" role="img" aria-label="${pct}% de respuestas correctas"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" style="--c:${C};stroke-dasharray:${C};stroke-dashoffset:${C * (1 - pct / 100)}"/><text x="60" y="69">${pct}%</text></svg>
          <p>${ok} de ${total} correctas. ${pct >= 80 ? 'Muy bien: este tema está firme.' : pct >= 60 ? 'Aprobado, pero repasá las que fallaste.' : 'Todavía no: volvé a las lecciones marcadas y repetí.'}</p>
          ${Object.keys(byMod).length > 1 ? `<ul class="score-mods">${rows}</ul>` : ''}
          <p><a class="btn" href="#/${currentId()}" data-act="again">Hacer otro intento</a></p>
        </div>`;
      $('[data-act="again"]', el).addEventListener('click', (ev) => { ev.preventDefault(); route(); });
      onFinish?.(pct);
      $('.exam-result', el).scrollIntoView({ block: 'center' });
    });
  }

  // ---------- Preguntas abiertas ----------
  const checkOpen = cx.checkOpen;
  const openInput = (q) => (q.t === 'text'
    ? `<textarea rows="3" aria-label="Tu respuesta" placeholder="Escribí tu respuesta como en el parcial"></textarea>`
    : `<input type="text" inputmode="${q.t === 'bits' ? 'numeric' : 'decimal'}" autocomplete="off" spellcheck="false" aria-label="Tu respuesta" placeholder="${q.t === 'bits' ? 'Ej: 1011 0110' : `Ej: 12,5${q.u ? ` ${q.u}` : ''}`}">${q.u ? `<span class="oq-u">${q.u}</span>` : ''}`);
  const KIND = { num: 'Cálculo', text: 'Teórica', bits: 'Bits' };
  // mode 'inline' / 'review': botón Comprobar por pregunta. 'exam': se corrige todo junto (devuelve { grade, answered })
  function renderOpen(el, qs, { mode, start = 0 } = {}) {
    el.innerHTML = `<ol class="oq-list" start="${start + 1}">${qs.map((q, n) => `
      <li class="oq" data-id="${q.id}" data-t="${q.t}">
        <p class="oq-q"><span class="q-n">${start + n + 1}.</span> <span class="oq-kind">${KIND[q.t]}</span> ${q.q}${mode !== 'inline' ? `<span class="q-from">${q.lesson.title}</span>` : ''}</p>
        <div class="oq-in">${openInput(q)}${mode === 'exam' ? '' : '<button class="btn sm primary" type="button" data-act="check">Comprobar</button>'}</div>
        <div class="oq-fb" aria-live="polite"></div>
      </li>`).join('')}</ol>`;
    const feedback = (li, q, res) => {
      li.classList.remove('is-ok', 'is-bad');
      li.classList.add(res.ok ? 'is-ok' : 'is-bad');
      const self = !res.ok && q.t === 'text' && !res.empty && mode !== 'exam';
      li.querySelector('.oq-fb').innerHTML = `${res.html}
        <details class="oq-model" ${res.ok || mode === 'exam' ? '' : 'open'}><summary>${q.t === 'text' ? 'Respuesta modelo' : 'Desarrollo'}</summary><div>${q.e}</div></details>
        ${self ? '<p class="oq-self"><button class="btn sm" type="button" data-act="self">Mi respuesta decía lo mismo con otras palabras</button></p>' : ''}
        ${!res.ok ? `<p class="q-link"><a href="#/${q.lesson.id}">Releer “${q.lesson.title}”</a></p>` : ''}`;
    };
    const val = (li) => li.querySelector('input, textarea').value;
    if (mode !== 'exam') {
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const li = b.closest('.oq'), q = qById[li.dataset.id];
        if (b.dataset.act === 'check') { const res = checkOpen(q, val(li)); feedback(li, q, res); if (!res.empty) record(q, res.ok); }
        if (b.dataset.act === 'self') { record(q, true); li.classList.replace('is-bad', 'is-ok'); b.closest('.oq-self').innerHTML = '<span class="chip ok">Marcada como correcta</span>'; }
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); e.target.closest('.oq').querySelector('[data-act="check"]').click(); }
      });
      return null;
    }
    return {
      answered: () => [...el.querySelectorAll('.oq')].filter((li) => val(li).trim()).length,
      grade: () => [...el.querySelectorAll('.oq')].map((li) => {
        const q = qById[li.dataset.id], res = checkOpen(q, val(li));
        feedback(li, q, res);
        li.querySelector('input, textarea').disabled = true;
        record(q, res.ok);
        return [q, res.ok];
      }),
    };
  }

  // Página con todas las preguntas abiertas, filtrables por parcial
  function renderOpenPage(u) {
    const unit = unitOf(u);
    document.title = `Preguntas abiertas, ${NAME}`;
    if (unit) document.body.dataset.unit = unit.id;
    const mods = unit ? modsOfUnit(unit.id) : MODULES;
    const qs = OPENS.filter((q) => mods.some((m) => m.id === q.module));
    const solved = qs.filter((q) => answers[q.id]?.ok).length;
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb">Práctica para el parcial</p>
        <h1>Preguntas abiertas</h1>
        <p class="tldr">Como en el parcial: hay que escribir la respuesta, no elegirla. <mark>Cálculos</mark>: escribí el número con o sin unidad (133,16 · 133,16 Mbps · 1,3e8). <mark>Teóricas</mark>: se buscan los conceptos que no pueden faltar; si dijiste lo mismo con otras palabras, podés marcarla como correcta después de leer la respuesta modelo. <mark>Bits</mark>: la cadena exacta, con o sin espacios.</p>
        <div class="toggle open-filter" role="group" aria-label="Filtrar por parcial">
          <a class="btn sm" href="#/abiertas" aria-pressed="${!unit}">Todas (${OPENS.length})</a>
          ${UNITS.filter((x) => !x.all).map((x) => `<a class="btn sm" data-u="${x.id}" href="#/abiertas/${x.id}" aria-pressed="${unit === x}">${x.title} (${OPENS.filter((q) => modOf(q.module).unit === x.id).length})</a>`).join('')}
        </div>
        <p class="sec-lede">${solved} de ${qs.length} resueltas bien.</p>
        ${mods.map((m) => {
          const mq = qs.filter((q) => q.module === m.id);
          return mq.length ? `<section class="open-mod" data-u="${m.unit}"><h2><span class="mod-n">${tagOf(m)}</span>${m.title}</h2><div class="open-mount" data-m="${m.id}"></div></section>` : '';
        }).join('')}
      </article>`;
    let k = 0;
    main.querySelectorAll('.open-mount').forEach((el) => { const mq = qs.filter((q) => q.module === el.dataset.m); renderOpen(el, mq, { mode: 'review', start: k }); k += mq.length; });
  }

  function renderModuleQuiz(mod) {
    document.title = `Cuestionario: ${mod.title}`;
    document.body.dataset.unit = mod.unit;
    const pool = QUESTIONS.filter((q) => q.module === mod.id);
    const opool = OPENS.filter((q) => q.module === mod.id);
    // Prioriza las que fallaste o nunca respondiste
    const weight = (q) => (answers[q.id]?.ok === false ? 0 : answers[q.id] ? 2 : 1);
    const qs = shuffle(pool).sort((a, b) => weight(a) - weight(b)).slice(0, 15);
    const os = shuffle(opool).sort((a, b) => weight(a) - weight(b)).slice(0, 3);
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb"><a href="#/${lessonsOf(mod.id)[0].id}">${mod.title}</a>, cuestionario</p>
        <h1>Cuestionario: ${mod.title}</h1>
        <p class="tldr">${qs.length} preguntas de opción múltiple de las ${pool.length} del módulo y ${os.length} abiertas. Aparecen primero las que fallaste y las que nunca respondiste. ${best[mod.id] != null ? `Tu mejor resultado: ${best[mod.id]}%.` : ''}</p>
        <div class="quiz-mount"></div>
      </article>`;
    renderQuiz($('.quiz-mount', main), qs, {
      mode: 'exam', extra: os,
      onFinish: (pct) => { best[mod.id] = Math.max(best[mod.id] ?? 0, pct); store.set('ma-best', best); renderToc($('#search').value); },
    });
  }

  function renderReview() {
    document.title = `Repasar, ${NAME}`;
    const ids = reviewIds();
    const qs = ids.map((id) => qById[id]).filter((q) => !q.open);
    const os = ids.map((id) => qById[id]).filter((q) => q.open);
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb">Práctica personalizada</p>
        <h1>Repasar</h1>
        ${ids.length ? `<p class="tldr">Estas son las ${ids.length} preguntas que respondiste mal la última vez. Cuando aciertes una, sale de la lista.</p><div class="quiz-mount"></div>${os.length ? '<h2>Abiertas</h2><div class="open-mount"></div>' : ''}`
          : `<p class="tldr">No tenés preguntas pendientes. Cada vez que falles una, en una lección, un cuestionario o un simulacro, aparece acá para que la vuelvas a intentar.</p>
             <p>${UNITS.map((u, i) => `<a class="btn${i ? '' : ' primary'}" href="#/simulacro/${u.id}">Simulacro: ${u.title.toLowerCase()}</a>`).join(' ')}</p>`}
      </article>`;
    if (qs.length) renderQuiz($('.quiz-mount', main), qs, { mode: 'review' });
    if (os.length) renderOpen($('.open-mount', main), os, { mode: 'review' });
  }

  function renderExam(unit) {
    if (!unit) { location.replace(`#/simulacro/${MODULES.find((m) => m.id === (LESSONS.find((l) => !done.has(l.id)) || LESSONS[0]).module).unit}`); return; }
    document.title = `Simulacro ${unit.title.toLowerCase()}, ${NAME}`;
    document.body.dataset.unit = unit.id;
    const mods = modsOfUnit(unit.id);
    // Reparte las preguntas entre los temas del parcial para que ninguno domine
    const spread = (pool, max) => {
      const byMod = mods.map((m) => shuffle(pool.filter((q) => q.module === m.id))).filter((a) => a.length);
      const out = [];
      for (let i = 0; out.length < max && byMod.some((a) => a[i]); i++) shuffle(byMod).forEach((a) => a[i] && out.length < max && out.push(a[i]));
      return out;
    };
    const qs = spread(QUESTIONS, 20);
    const os = spread(OPENS, 5);
    const pend = PENDING.filter((m) => unit.all || m.unit === unit.id);
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb">Práctica personalizada · otros simulacros: ${UNITS.filter((u) => u !== unit).map((u) => `<a href="#/simulacro/${u.id}">${u.title.toLowerCase()}</a>`).join(', ')}</p>
        <h1>Simulacro: ${unit.title.toLowerCase()}</h1>
        <p class="tldr">${qs.length} preguntas de opción múltiple y ${os.length} abiertas de ${unit.name} (${mods.map((m) => `U${m.tema}`).join(', ')}). Respondé todas y corregí al final. ${pend.length ? `Todavía no entran ${pend.map((m) => m.title).join(' ni ')}: su contenido está pendiente.` : ''} La práctica de cálculo se completa con los ejercicios de los TP de cada lección.</p>
        <div class="quiz-mount"></div>
      </article>`;
    renderQuiz($('.quiz-mount', main), shuffle(qs), { mode: 'exam', extra: os });
  }

  // ---------- Taller de gráficas: todos los laboratorios de gráficas juntos, por parcial ----------
  const GRAPH_LABS = ['wave', 'compose', 'fourier', 'pulses', 'filter', 'link', 'hbin', 'huffman', 'sampling', 'shannon', 'hamming', 'crc', 'parity', 'linecode', 'modulation', 'constellation', 'pcm', 'fdm', 'tdm', 'topology', 'arq', 'analog'];
  function renderGraphs() {
    document.title = `Taller de gráficas, ${NAME}`;
    const all = LESSONS.flatMap((l) => (l.labs || []).filter((c) => GRAPH_LABS.includes(c.type)).map((c) => ({ c, l, m: modOf(l.module) })));
    main.innerHTML = `
      <article class="lesson graphs-page">
        <p class="crumb">Para el parcial</p>
        <h1>Taller de gráficas</h1>
        <p class="tldr">Los ${all.length} laboratorios gráficos de la guía en un solo lugar. Para cada uno: <mark>predecí</mark> el resultado (cuántas armónicas pasan, si el enlace llega, qué bit está mal, cómo queda la onda), después mové el control y comprobá. Al lado de cada uno está la lección donde se explica.</p>
        ${UNITS.filter((u) => !u.all).map((u) => `<section class="graph-unit" data-u="${u.id}"><h2><span class="unit-tag">${u.title}</span>${u.name}</h2>
          ${all.filter((x) => x.m.unit === u.id).map((x) => `<div class="graph-item"><p class="graph-from">Unidad ${x.m.tema} · <a href="#/${x.l.id}">${x.l.title}</a></p><div class="lab-mount" data-g="${all.indexOf(x)}"></div></div>`).join('')}
        </section>`).join('')}
      </article>`;
    main.querySelectorAll('[data-g]').forEach((el) => mountLab(el, all[+el.dataset.g].c));
  }

  // ---------- Fórmulas: hoja de repaso armada desde GUIDE.FORMULAS ----------
  function renderFormulas() {
    document.title = `Fórmulas, ${NAME}`;
    const F = window.GUIDE.FORMULAS || [];
    main.innerHTML = `
      <article class="lesson formulas-page">
        <p class="crumb">Para el parcial</p>
        <h1>Fórmulas</h1>
        <p class="tldr">Todo lo que hay que saber calcular, parcial por parcial. Tocá el nombre del tema para ir a la lección donde se explica cada fórmula.</p>
        ${UNITS.filter((u) => MODULES.some((m) => m.unit === u.id && F.some((f) => f.m === m.id))).map((u) => `<section data-u="${u.id}"><h2><span class="unit-tag">${u.title}</span>${u.name}</h2>
          ${MODULES.filter((m) => m.unit === u.id && F.some((f) => f.m === m.id)).map((m) => `<h3><a href="#/${lessonsOf(m.id)[0].id}">Unidad ${m.tema}: ${m.title}</a></h3>
            <div class="cards">${F.filter((f) => f.m === m.id).map((f) => `<div class="card"><b>${f.n}</b><div class="f">${f.f}</div>${f.d ? `<p class="muted-s">${f.d}</p>` : ''}</div>`).join('')}</div>`).join('')}
        </section>`).join('')}
      </article>`;
  }

  // ---------- Laboratorios ----------
  function mountLab(el, cfg) {
    const fn = LABS[cfg.type];
    if (!fn) { el.innerHTML = `<p class="note warn">Laboratorio desconocido: ${esc(cfg.type)}</p>`; return; }
    el.innerHTML = `<section class="lab" aria-label="Laboratorio: ${esc(cfg.title)}">
      <header class="lab-head"><span class="lab-kind">Laboratorio</span><h3 class="lab-title">${cfg.title}</h3></header>
      ${cfg.intro ? `<p class="lab-intro">${cfg.intro}</p>` : ''}
      <div class="lab-body"></div></section>`;
    try { fn($('.lab-body', el), cfg, { esc }); }
    catch (err) { $('.lab-body', el).innerHTML = `<p class="note warn">No se pudo iniciar el laboratorio: ${esc(err.message)}</p>`; console.error(err); }
  }

  // ---------- Menú móvil ----------
  function openMenu() { sidebar.classList.add('open'); scrim.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { sidebar.classList.remove('open'); scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => (sidebar.classList.contains('open') ? closeMenu() : openMenu()));
  scrim.addEventListener('click', closeMenu);

  // ---------- Tema ----------
  $('#themeBtn').addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
    try { localStorage.setItem('ma-theme', root.dataset.theme); } catch {}
  });

  // ---------- Teclado ----------
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable]') || e.altKey || e.ctrlKey || e.metaKey) return;
    const idx = LESSONS.findIndex((l) => l.id === currentId());
    if (e.key === 'ArrowRight' && idx > -1 && idx < LESSONS.length - 1) location.hash = `#/${LESSONS[idx + 1].id}`;
    if (e.key === 'ArrowLeft' && idx > 0) location.hash = `#/${LESSONS[idx - 1].id}`;
    if (e.key === 'Escape') closeMenu();
    if (e.key === '/') { e.preventDefault(); openMenu(); $('#search').focus(); }
  });

  $('#search').addEventListener('input', (e) => renderToc(e.target.value));
  window.addEventListener('hashchange', route);
  renderToc();
  updateProgress();
  route();
})();
