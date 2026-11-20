/* Repaso: vuelven las preguntas falladas hasta acertarlas. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
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
    if (qs.length) A.renderQuiz($('.quiz-mount', main), qs, { mode: 'review' });
    if (os.length) A.renderOpen($('.open-mount', main), os, { mode: 'review' });
  }
  A.page((id) => id === 'repaso', renderReview);
})();
