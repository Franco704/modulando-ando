/* Índice lateral (unidades, módulos y lecciones con su avance), buscador y barra de progreso. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
  const toc = $('#toc');
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
  A.renderToc = renderToc;
  A.markCurrent = markCurrent;
  A.updateProgress = updateProgress;
})();
