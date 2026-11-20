/* Lección: teoría, laboratorios ubicados en el cuerpo, preguntas, ejercicios resueltos, bibliografía e índice de la página. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
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
      const px = !ex.official && ex.exam;
      const tag = ex.official ? `TP ${ex.official.split('.')[0]}, ejercicio ${ex.official.split('.')[1]}` : px ? 'Ejercicio de parcial' : `Práctica ${++practice}`;
      return `
        <article class="exercise${ex.official ? ' official' : px ? ' parcial' : ''}">
          <header class="ex-head">
            <span class="ex-tag${px ? ' px' : ''}">${tag}</span>
            ${ex.level ? `<span class="ex-level" data-level="${ex.level}">${LEVEL[ex.level]}</span>` : ''}
          </header>
          ${ex.exam ? `<p class="ex-exams"><span class="chip">${ex.official ? 'También tomado en' : 'Tomado en'}</span>${examChips(ex.exam)}</p>` : ''}
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
        ${l.video === false ? '' : `<details class="lesson-video"><summary>Ver el video resumen de esta lección</summary>
          <video controls playsinline preload="none" src="videos/${l.id}.mp4"></video>
          <a href="#/videos/${l.id}">Ver todos los videos de corrido desde acá</a></details>`}
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
      if (cfg) A.mountLab(el, cfg);
    });
    if (quiz.length) A.renderQuiz($('.quiz-mount', main), quiz, { mode: 'inline' });
    if (opens.length) A.renderOpen($('.open-mount', main), opens, { mode: 'inline' });

    $('#doneBtn').addEventListener('click', (e) => {
      done.has(l.id) ? done.delete(l.id) : done.add(l.id);
      store.set('ma-done', [...done]);
      const on = done.has(l.id);
      e.currentTarget.setAttribute('aria-pressed', on);
      e.currentTarget.textContent = on ? 'Lección completada' : 'Marcar como completada';
      A.renderToc($('#search').value);
      A.updateProgress();
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
  A.renderExercises = renderExercises;
  A.renderSources = renderSources;
  A.renderRail = renderRail;
  A.page((id) => LESSONS.some((l) => l.id === id), (id) => renderLesson(LESSONS.findIndex((l) => l.id === id)));
})();
