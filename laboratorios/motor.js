/* Monta un laboratorio registrado en GUIDE.LABS dentro de un contenedor, con su cabecera y manejo de errores. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
  const LABS = window.GUIDE.LABS;
  function mountLab(el, cfg) {
    const fn = LABS[cfg.type];
    if (!fn) { el.innerHTML = `<p class="note warn">Laboratorio desconocido: ${esc(cfg.type)}</p>`; return; }
    el.innerHTML = `<section class="lab" aria-label="Laboratorio: ${esc(cfg.title)}">
      <header class="lab-head"><span class="lab-kind"><svg viewBox="0 0 24 12" width="22" height="11" aria-hidden="true"><path d="M1 6c2.5-6 4.5-6 7 0s4.5 6 7 0 4.5-6 7 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Laboratorio</span><h3 class="lab-title">${cfg.title}</h3></header>
      ${cfg.intro ? `<p class="lab-intro">${cfg.intro}</p>` : ''}
      <div class="lab-body"></div></section>`;
    try { fn($('.lab-body', el), cfg, { esc }); }
    catch (err) { $('.lab-body', el).innerHTML = `<p class="note warn">No se pudo iniciar el laboratorio: ${esc(err.message)}</p>`; console.error(err); }
  }
  A.mountLab = mountLab;
})();
