/* Hoja de fórmulas armada desde GUIDE.FORMULAS (formulas.js), parcial por parcial. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
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
  A.page((id) => id === 'formulas', renderFormulas);
})();
