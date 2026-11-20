/* Taller de gráficas: todos los laboratorios gráficos juntos, por parcial. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
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
    main.querySelectorAll('[data-g]').forEach((el) => A.mountLab(el, all[+el.dataset.g].c));
  }
  A.page((id) => id === 'graficas', renderGraphs);
})();
