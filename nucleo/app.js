/* Núcleo de la guía: estado guardado (progreso, respuestas, mejores notas), ayudantes comunes y el router por hash.
   Cada funcionalidad (portada, lecciones, práctica, parciales, fórmulas, gráficas, videos) se registra con A.page(coincide, mostrar)
   y expone lo que otras usan en window.GUIDE.app (A). Se carga después del contenido y antes de las vistas. */
(() => {
  const { UNITS, LESSONS, EXAMS } = window.GUIDE;
  const ALL_MODULES = window.GUIDE.MODULES;
  // Solo los módulos que ya tienen lecciones cargadas; el resto se muestra como pendiente
  const MODULES = ALL_MODULES.filter((m) => LESSONS.some((l) => l.module === m.id));
  const PENDING = ALL_MODULES.filter((m) => !MODULES.includes(m));
  const $ = (s, el = document) => el.querySelector(s);

  // ---------- Almacenamiento (puede fallar en modo privado) ----------
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const done = new Set(store.get('ma-done', []));
  // Resultado por pregunta: { [qid]: { ok, tries } }. qid = leccion:indice (opción múltiple) o leccion:oN (abierta)
  const answers = store.get('ma-answers', {});
  const best = store.get('ma-best', {});

  // Todas las preguntas con su id, módulo y lección
  const QUESTIONS = LESSONS.flatMap((l) => (l.quiz || []).map((q, i) => ({ ...q, id: `${l.id}:${i}`, lesson: l, module: l.module })));
  const OPENS = LESSONS.flatMap((l) => (l.open || []).map((q, i) => ({ ...q, id: `${l.id}:o${i}`, lesson: l, module: l.module, open: true })));
  const qById = Object.fromEntries([...QUESTIONS, ...OPENS].map((q) => [q.id, q]));
  // Parciales reales: cada ejercicio o pregunta con exam: ['2p-2025-t1#4'] queda enlazado al ítem 4 de ese examen
  const examById = Object.fromEntries(EXAMS.map((e) => [e.id, e]));
  const EXS = LESSONS.flatMap((l) => (l.exercises || []).map((ex) => ({ ex, l })));

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const unitOf = (u) => UNITS.find((x) => x.id === u);
  // Módulos que entran en un parcial: el final integra todos
  const modsOfUnit = (u) => (unitOf(u)?.all ? MODULES : MODULES.filter((m) => m.unit === u));
  const tagOf = (m) => `Unidad ${m.tema}, TP ${m.tp}`;
  const lessonsOf = (modId) => LESSONS.filter((l) => l.module === modId);
  const modOf = (id) => ALL_MODULES.find((m) => m.id === id);
  const modDone = (m) => lessonsOf(m.id).filter((l) => done.has(l.id)).length;
  const examChips = (list) => list.map((k) => examById[k.split('#')[0]]).filter(Boolean)
    .filter((e, i, a) => a.indexOf(e) === i).map((e) => `<a class="chip" href="#/parciales">${e.short}</a>`).join('');
  const reviewIds = () => Object.keys(answers).filter((id) => qById[id] && !answers[id].ok);
  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  const A = {
    NAME: 'Modulando Ando', REPO: 'https://github.com/Franco704/modulando-ando',
    UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS,
    $, main: $('#main'), rail: $('#rail'), store, done, answers, best,
    esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth,
    shuffle: window.GUIDE.util.shuffle, cx: window.GUIDE.cx,
    pages: [],
    // Registro de pantallas: la primera cuya condición acepta el id de la ruta la dibuja
    page(match, render) { A.pages.push({ match, render }); },
    currentId: () => decodeURIComponent(location.hash.replace(/^#\/?/, '')),
    record(q, ok) {
      const prev = answers[q.id] || { tries: 0 };
      answers[q.id] = { ok, tries: prev.tries + 1 };
      store.set('ma-answers', answers);
      A.updateProgress();
    },
  };
  window.GUIDE.app = A;

  // ---------- Rutas ----------
  let firstLoad = true;
  A.route = async () => {
    const id = A.currentId();
    // Pantalla de entrada al cambiar de módulo; si mientras tanto cambió el hash, gana la ruta nueva
    if (LESSONS.some((l) => l.id === id)) { await window.ANIM.intro(id, firstLoad); if (A.currentId() !== id) return; }
    firstLoad = false;
    A.rail.innerHTML = '';
    document.body.dataset.view = 'page';
    delete document.body.dataset.unit;
    const p = A.pages.find((x) => x.match(id)) || A.pages.find((x) => x.match(''));
    p.render(id);
    A.renderToc($('#search').value);   // abre el módulo de la página actual
    document.querySelectorAll('.top-links a').forEach((l) => {
      const k = l.getAttribute('href').slice(2);
      if (k && (id === k || id.startsWith(`${k}/`))) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
    });
    A.closeMenu();
    window.scrollTo(0, 0);
    A.main.focus({ preventScroll: true });
  };
})();
