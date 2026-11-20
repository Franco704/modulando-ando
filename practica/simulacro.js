/* Simulacro de cada parcial y del final: preguntas repartidas entre las unidades que entran. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
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
    A.renderQuiz($('.quiz-mount', main), shuffle(qs), { mode: 'exam', extra: os });
  }
  A.page((id) => id.startsWith('simulacro'), (id) => renderExam(unitOf(id.slice(10))));
})();
