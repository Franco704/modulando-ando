/* Parciales y finales reales: cada ítem con su resolución, lo que más se repite y qué unidades pesan más. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
  function renderParciales() {
    document.title = `Parciales resueltos, ${NAME}`;
    const withExam = EXS.filter(({ ex }) => ex.exam);
    const n = EXAMS.reduce((a, e) => a + e.items.length, 0);
    // Ranking: ejercicios que aparecen en más de un examen
    const nExams = (ex) => new Set(ex.exam.map((k) => k.split('#')[0])).size;
    const top = withExam.filter(({ ex }) => nExams(ex) > 1).sort((a, b) => nExams(b.ex) - nExams(a.ex));
    const byMod = MODULES.map((m) => ({ m, k: withExam.filter(({ l }) => l.module === m.id).reduce((a, { ex }) => a + ex.exam.length, 0) })).filter((x) => x.k).sort((a, b) => b.k - a.k);
    const item = (e, [num, text]) => {
      const hit = withExam.find(({ ex }) => ex.exam.includes(`${e.id}#${num}`));
      return `<details class="exam-q"><summary>${num}. ${text}${hit ? ` <small>· Unidad ${modOf(hit.l.module).tema}</small>` : ''}</summary>
        ${hit ? `${A.renderExercises({ exercises: [hit.ex] })}<p class="q-link"><a href="#/${hit.l.id}">Ver la teoría: “${hit.l.title}”</a></p>` : '<p class="muted-s">Sin resolución cargada.</p>'}</details>`;
    };
    main.innerHTML = `
      <article class="lesson exams-page">
        <p class="crumb">Para el parcial</p>
        <h1>Parciales y finales resueltos</h1>
        <p class="tldr">Los ${EXAMS.length} exámenes de la cátedra que tenemos (parciales 2023 a 2025 y finales 2019), ítem por ítem y resueltos como se espera en el examen. La cátedra arma casi todo con <mark>verdadero o falso</mark> sobre definiciones y con unos pocos cálculos que se repiten: imagen de video, Shannon y Nyquist, CRC, Hamming, constelaciones y TDM. Las afirmaciones de V o F también están como preguntas en las lecciones, marcadas “tomada en parcial”.</p>
        <h2>Lo que más se repite</h2>
        <ol class="freq">${top.map(({ ex, l }) => `<li><span class="n">×${nExams(ex)}</span><span><a href="#/${l.id}">${ex.title}</a><small>Unidad ${modOf(l.module).tema} · ${[...new Set(ex.exam.map((k) => examById[k.split('#')[0]]?.short))].join(', ')}</small></span></li>`).join('')}</ol>
        <h2>Qué temas pesan más</h2>
        <ol class="freq">${byMod.map(({ m, k }) => `<li><span class="n">${k}</span><span><a href="#/${lessonsOf(m.id)[0].id}">Unidad ${m.tema}: ${m.title}</a><small>${k === 1 ? 'ítem' : 'ítems'} de ${n} en total</small></span></li>`).join('')}</ol>
        ${UNITS.map((u) => { const ex = EXAMS.filter((e) => e.unit === u.id); return ex.length ? `<section data-u="${u.id}"><h2><span class="unit-tag">${u.title}</span>${u.name}</h2>
          ${ex.map((e) => `<details class="exam-block" data-u="${u.id}"><summary><b>${e.title}</b><span>${e.sub} · ${e.items.length} ítems</span></summary>
            <div class="exam-body">${e.note ? `<p class="muted-s">${e.note}</p>` : ''}${e.items.map((it) => item(e, it)).join('')}</div></details>`).join('')}</section>` : ''; }).join('')}
      </article>`;
  }
  A.page((id) => id === 'parciales', renderParciales);
})();
