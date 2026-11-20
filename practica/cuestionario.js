/* Opción múltiple: corrección inmediata en las lecciones o al final en cuestionarios y simulacros; cuestionario de cada módulo. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
  // ---------- Cuestionarios de opción múltiple ----------
  // mode 'inline': corrige cada pregunta al responder. 'exam': corrige todo al final (extra: preguntas abiertas que se corrigen junto con estas).
  function renderQuiz(el, qs, { mode, onFinish, extra } = {}) {
    const letters = 'ABCDEF';
    // Las opciones se muestran en orden aleatorio para que la posición no delate la respuesta
    const order = Object.fromEntries(qs.map((q) => [q.id, shuffle(q.o.map((_, i) => i))]));
    el.innerHTML = `<ol class="quiz ${mode}">${qs.map((q, n) => `
      <li class="q" data-id="${q.id}">
        <fieldset>
          <legend><span class="q-n">${n + 1}.</span> ${q.q}${q.exam ? '<span class="q-src px">tomada en parcial</span>' : ''}${mode === 'exam' || mode === 'review' ? `<span class="q-from">${q.lesson.title}</span>` : ''}</legend>
          <div class="q-opts">${order[q.id].map((i, k) => `
            <label class="opt"><input type="radio" name="q-${q.id}" value="${i}"><span class="opt-l" aria-hidden="true">${letters[k]}</span><span class="opt-t">${q.o[i]}</span></label>`).join('')}
          </div>
          <div class="q-feedback" aria-live="polite"></div>
        </fieldset>
      </li>`).join('')}</ol>
      ${mode === 'exam' ? '<div class="exam-extra"></div><div class="exam-actions"><button class="btn primary" type="button" data-act="grade">Corregir</button><p class="exam-left"></p></div><div class="exam-result" aria-live="polite"></div>' : ''}`;

    const showFeedback = (li, q, chosen) => {
      const ok = chosen === q.a;
      li.classList.add(ok ? 'is-ok' : 'is-bad');
      li.querySelectorAll('.opt').forEach((lab) => {
        const input = lab.querySelector('input');
        const i = +input.value;
        if (i === q.a) lab.classList.add('right');
        else if (i === chosen) lab.classList.add('wrong');
        input.disabled = true;
      });
      const correctLetter = letters[order[q.id].indexOf(q.a)];
      li.querySelector('.q-feedback').innerHTML = `<p><strong>${ok ? 'Correcto.' : chosen < 0 ? `Sin responder: la respuesta es la ${correctLetter}.` : `Incorrecto: la respuesta es la ${correctLetter}.`}</strong> ${q.e || ''}</p>
        ${!ok ? `<p class="q-link"><a href="#/${q.lesson.id}">Releer “${q.lesson.title}”</a></p>` : ''}`;
      return ok;
    };

    if (mode !== 'exam') {
      el.querySelectorAll('.q').forEach((li) => {
        const q = qById[li.dataset.id];
        li.addEventListener('change', (e) => A.record(q, showFeedback(li, q, +e.target.value)));
      });
      return;
    }

    const grader = extra?.length ? A.renderOpen($('.exam-extra', el), extra, { mode: 'exam', start: qs.length }) : null;
    const left = $('.exam-left', el);
    const total = qs.length + (extra?.length || 0);
    const updateLeft = () => {
      const n = el.querySelectorAll('.q input:checked').length + (grader ? grader.answered() : 0);
      left.textContent = n < total ? `Respondiste ${n} de ${total}.` : 'Respondiste todas.';
    };
    el.addEventListener('change', updateLeft);
    el.addEventListener('input', updateLeft);
    updateLeft();
    $('[data-act="grade"]', el).addEventListener('click', (e) => {
      let ok = 0;
      const byMod = {};
      const tally = (q, good) => { ok += good; (byMod[q.module] ||= { ok: 0, n: 0 }).n++; if (good) byMod[q.module].ok++; };
      el.querySelectorAll('.q').forEach((li) => {
        const q = qById[li.dataset.id];
        const chosen = li.querySelector('input:checked');
        const good = chosen ? showFeedback(li, q, +chosen.value) : (showFeedback(li, q, -1), false);
        A.record(q, good);
        tally(q, good);
      });
      grader?.grade().forEach(([q, good]) => tally(q, good));
      const pct = Math.round((ok / total) * 100);
      e.currentTarget.remove();
      left.remove();
      const C = 2 * Math.PI * 52;   // circunferencia del anillo
      const rows = Object.entries(byMod).map(([m, r]) => `<li><span>${modOf(m).title}</span><span>${r.ok} de ${r.n}</span></li>`).join('');
      $('.exam-result', el).innerHTML = `
        <div class="score ${pct >= 60 ? 'pass' : 'fail'}">
          <svg class="ring" viewBox="0 0 120 120" role="img" aria-label="${pct}% de respuestas correctas"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" style="--c:${C};stroke-dasharray:${C};stroke-dashoffset:${C * (1 - pct / 100)}"/><text x="60" y="69">${pct}%</text></svg>
          <p>${ok} de ${total} correctas. ${pct >= 80 ? 'Muy bien: este tema está firme.' : pct >= 60 ? 'Aprobado, pero repasá las que fallaste.' : 'Todavía no: volvé a las lecciones marcadas y repetí.'}</p>
          ${Object.keys(byMod).length > 1 ? `<ul class="score-mods">${rows}</ul>` : ''}
          <p><a class="btn" href="#/${currentId()}" data-act="again">Hacer otro intento</a></p>
        </div>`;
      $('[data-act="again"]', el).addEventListener('click', (ev) => { ev.preventDefault(); A.route(); });
      onFinish?.(pct);
      $('.exam-result', el).scrollIntoView({ block: 'center' });
    });
  }

  function renderModuleQuiz(mod) {
    document.title = `Cuestionario: ${mod.title}`;
    document.body.dataset.unit = mod.unit;
    const pool = QUESTIONS.filter((q) => q.module === mod.id);
    const opool = OPENS.filter((q) => q.module === mod.id);
    // Prioriza las que fallaste o nunca respondiste
    const weight = (q) => (answers[q.id]?.ok === false ? 0 : answers[q.id] ? 2 : 1);
    const qs = shuffle(pool).sort((a, b) => weight(a) - weight(b)).slice(0, 15);
    const os = shuffle(opool).sort((a, b) => weight(a) - weight(b)).slice(0, 3);
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb"><a href="#/${lessonsOf(mod.id)[0].id}">${mod.title}</a>, cuestionario</p>
        <h1>Cuestionario: ${mod.title}</h1>
        <p class="tldr">${qs.length} preguntas de opción múltiple de las ${pool.length} del módulo y ${os.length} abiertas. Aparecen primero las que fallaste y las que nunca respondiste. ${best[mod.id] != null ? `Tu mejor resultado: ${best[mod.id]}%.` : ''}</p>
        <div class="quiz-mount"></div>
      </article>`;
    renderQuiz($('.quiz-mount', main), qs, {
      mode: 'exam', extra: os,
      onFinish: (pct) => { best[mod.id] = Math.max(best[mod.id] ?? 0, pct); store.set('ma-best', best); A.renderToc($('#search').value); },
    });
  }
  A.renderQuiz = renderQuiz;
  A.page((id) => id.startsWith('quiz/') && MODULES.includes(modOf(id.slice(5))), (id) => renderModuleQuiz(modOf(id.slice(5))));
})();
