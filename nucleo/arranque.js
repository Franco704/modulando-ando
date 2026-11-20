/* Arranque: menú móvil, tema claro u oscuro, atajos de teclado y primera ruta. Se carga al final. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
  const sidebar = $('#sidebar'), scrim = $('#scrim'), menuBtn = $('#menuBtn');
  // ---------- Menú móvil ----------
  function openMenu() { sidebar.classList.add('open'); scrim.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { sidebar.classList.remove('open'); scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => (sidebar.classList.contains('open') ? closeMenu() : openMenu()));
  scrim.addEventListener('click', closeMenu);
  A.openMenu = openMenu;
  A.closeMenu = closeMenu;

  // ---------- Tema ----------
  $('#themeBtn').addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
    try { localStorage.setItem('ma-theme', root.dataset.theme); } catch {}
  });

  // ---------- Teclado ----------
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable]') || e.altKey || e.ctrlKey || e.metaKey) return;
    const idx = LESSONS.findIndex((l) => l.id === currentId());
    if (e.key === 'ArrowRight' && idx > -1 && idx < LESSONS.length - 1) location.hash = `#/${LESSONS[idx + 1].id}`;
    if (e.key === 'ArrowLeft' && idx > 0) location.hash = `#/${LESSONS[idx - 1].id}`;
    if (e.key === 'Escape') closeMenu();
    if (e.key === '/') { e.preventDefault(); openMenu(); $('#search').focus(); }
  });

  // Enlaces dentro de la misma página (#seccion): se desplazan sin tocar la ruta (#/…)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]:not([href^="#/"])');
    const target = a && a.getAttribute('href').length > 1 && document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: smooth() });
    if (target.tabIndex >= 0 || target.id === 'main') target.focus({ preventScroll: true });
  });

  $('#search').addEventListener('input', (e) => A.renderToc(e.target.value));
  window.addEventListener('hashchange', A.route);
  A.renderToc();
  A.updateProgress();
  A.route();
})();
