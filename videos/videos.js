/* Videos de resumen (#/videos o #/videos/<lección>): de corrido, agrupados por parcial. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
  // Videos de resumen (#/videos o #/videos/<lección>): todos de corrido, agrupados por parcial, con salto a cada lección
  // Solo las lecciones que tienen video (las nuevas pueden declarar video: false)
  const VIDS = LESSONS.filter((l) => l.video !== false);
  function renderVideos(start) {
    let cur = Math.max(start, 0);
    document.title = `Videos de resumen, ${NAME}`;
    const units = UNITS.filter((u) => !u.all && MODULES.some((m) => m.unit === u.id));
    main.innerHTML = `
      <article class="lesson videos">
        <h1>Videos de resumen</h1>
        <p class="tldr">Un video corto por lección, separados por parcial. Se reproducen de corrido: cuando termina uno arranca el siguiente. Si algo no te cierra, abrí la lección de la que habla.</p>
        <div class="vid-player">
          <video controls playsinline preload="metadata"></video>
          <p class="vid-now"><span></span><a href="#/">Ir a la lección →</a></p>
        </div>
        <label class="vid-auto"><input type="checkbox" checked /> Reproducir el siguiente automáticamente</label>
        ${units.map((u) => `<section data-u="${u.id}"><h2><span class="unit-tag">${u.title}</span> ${u.name}</h2>
          <ol class="vid-list">${VIDS.map((l, i) => ({ l, i })).filter(({ l }) => modOf(l.module).unit === u.id).map(({ l, i }) => `<li><button type="button" data-i="${i}"><span class="n">${i + 1}</span>${l.title}</button><a href="#/${l.id}">lección</a></li>`).join('')}</ol></section>`).join('')}
      </article>`;
    const video = $('video', main);
    const btns = [...main.querySelectorAll('.vid-list button')];
    const play = (i, auto) => {
      cur = i;
      video.src = `videos/${VIDS[i].id}.mp4`;
      if (auto) video.play().catch(() => {});
      document.body.dataset.unit = modOf(VIDS[i].module).unit;   // el reproductor toma el color del parcial
      $('.vid-now span', main).textContent = `${i + 1}. ${VIDS[i].title}`;
      $('.vid-now a', main).href = `#/${VIDS[i].id}`;
      btns.forEach((b) => b.toggleAttribute('aria-current', +b.dataset.i === i));
    };
    btns.forEach((b) => b.addEventListener('click', () => { play(+b.dataset.i, true); video.scrollIntoView({ block: 'nearest' }); }));
    video.addEventListener('ended', () => { if ($('.vid-auto input', main).checked && cur < VIDS.length - 1) play(cur + 1, true); });
    play(cur, false);
  }
  A.page((id) => id === 'videos' || id.startsWith('videos/'), (id) => renderVideos(VIDS.findIndex((l) => l.id === id.slice(7))));
})();
