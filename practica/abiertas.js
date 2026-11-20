/* Preguntas abiertas corregidas al instante (cálculos con unidades, teóricas por conceptos, cadenas de bits) y su página por parcial. */
(() => {
  const A = window.GUIDE.app;
  const { NAME, REPO, UNITS, LESSONS, EXAMS, ALL_MODULES, MODULES, PENDING, QUESTIONS, OPENS, qById, examById, EXS, $, main, rail, store, done, answers, best, esc, norm, unitOf, modsOfUnit, tagOf, lessonsOf, modOf, modDone, examChips, reviewIds, smooth, shuffle, cx, currentId } = A;
  // ---------- Preguntas abiertas ----------
  const checkOpen = cx.checkOpen;
  const openInput = (q) => (q.t === 'text'
    ? `<textarea rows="3" aria-label="Tu respuesta" placeholder="Escribí tu respuesta como en el parcial"></textarea>`
    : `<input type="text" inputmode="${q.t === 'bits' ? 'numeric' : 'decimal'}" autocomplete="off" spellcheck="false" aria-label="Tu respuesta" placeholder="${q.t === 'bits' ? 'Ej: 1011 0110' : `Ej: 12,5${q.u ? ` ${q.u}` : ''}`}">${q.u ? `<span class="oq-u">${q.u}</span>` : ''}`);
  const KIND = { num: 'Cálculo', text: 'Teórica', bits: 'Bits' };
  // mode 'inline' / 'review': botón Comprobar por pregunta. 'exam': se corrige todo junto (devuelve { grade, answered })
  function renderOpen(el, qs, { mode, start = 0 } = {}) {
    el.innerHTML = `<ol class="oq-list" start="${start + 1}">${qs.map((q, n) => `
      <li class="oq" data-id="${q.id}" data-t="${q.t}">
        <p class="oq-q"><span class="q-n">${start + n + 1}.</span> <span class="oq-kind">${KIND[q.t]}</span> ${q.q}${mode !== 'inline' ? `<span class="q-from">${q.lesson.title}</span>` : ''}</p>
        <div class="oq-in">${openInput(q)}${mode === 'exam' ? '' : '<button class="btn sm primary" type="button" data-act="check">Comprobar</button>'}</div>
        <div class="oq-fb" aria-live="polite"></div>
      </li>`).join('')}</ol>`;
    const feedback = (li, q, res) => {
      li.classList.remove('is-ok', 'is-bad');
      li.classList.add(res.ok ? 'is-ok' : 'is-bad');
      const self = !res.ok && q.t === 'text' && !res.empty && mode !== 'exam';
      li.querySelector('.oq-fb').innerHTML = `${res.html}
        <details class="oq-model" ${res.ok || mode === 'exam' ? '' : 'open'}><summary>${q.t === 'text' ? 'Respuesta modelo' : 'Desarrollo'}</summary><div>${q.e}</div></details>
        ${self ? '<p class="oq-self"><button class="btn sm" type="button" data-act="self">Mi respuesta decía lo mismo con otras palabras</button></p>' : ''}
        ${!res.ok ? `<p class="q-link"><a href="#/${q.lesson.id}">Releer “${q.lesson.title}”</a></p>` : ''}`;
    };
    const val = (li) => li.querySelector('input, textarea').value;
    if (mode !== 'exam') {
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const li = b.closest('.oq'), q = qById[li.dataset.id];
        if (b.dataset.act === 'check') { const res = checkOpen(q, val(li)); feedback(li, q, res); if (!res.empty) A.record(q, res.ok); }
        if (b.dataset.act === 'self') { A.record(q, true); li.classList.replace('is-bad', 'is-ok'); b.closest('.oq-self').innerHTML = '<span class="chip ok">Marcada como correcta</span>'; }
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); e.target.closest('.oq').querySelector('[data-act="check"]').click(); }
      });
      return null;
    }
    return {
      answered: () => [...el.querySelectorAll('.oq')].filter((li) => val(li).trim()).length,
      grade: () => [...el.querySelectorAll('.oq')].map((li) => {
        const q = qById[li.dataset.id], res = checkOpen(q, val(li));
        feedback(li, q, res);
        li.querySelector('input, textarea').disabled = true;
        A.record(q, res.ok);
        return [q, res.ok];
      }),
    };
  }

  // Página con todas las preguntas abiertas, filtrables por parcial
  function renderOpenPage(u) {
    const unit = unitOf(u);
    document.title = `Preguntas abiertas, ${NAME}`;
    if (unit) document.body.dataset.unit = unit.id;
    const mods = unit ? modsOfUnit(unit.id) : MODULES;
    const qs = OPENS.filter((q) => mods.some((m) => m.id === q.module));
    const solved = qs.filter((q) => answers[q.id]?.ok).length;
    main.innerHTML = `
      <article class="lesson quiz-page">
        <p class="crumb">Práctica para el parcial</p>
        <h1>Preguntas abiertas</h1>
        <p class="tldr">Como en el parcial: hay que escribir la respuesta, no elegirla. <mark>Cálculos</mark>: escribí el número con o sin unidad (133,16 · 133,16 Mbps · 1,3e8). <mark>Teóricas</mark>: se buscan los conceptos que no pueden faltar; si dijiste lo mismo con otras palabras, podés marcarla como correcta después de leer la respuesta modelo. <mark>Bits</mark>: la cadena exacta, con o sin espacios.</p>
        <div class="toggle open-filter" role="group" aria-label="Filtrar por parcial">
          <a class="btn sm" href="#/abiertas" aria-pressed="${!unit}">Todas (${OPENS.length})</a>
          ${UNITS.filter((x) => !x.all).map((x) => `<a class="btn sm" data-u="${x.id}" href="#/abiertas/${x.id}" aria-pressed="${unit === x}">${x.title} (${OPENS.filter((q) => modOf(q.module).unit === x.id).length})</a>`).join('')}
        </div>
        <p class="sec-lede">${solved} de ${qs.length} resueltas bien.</p>
        ${mods.map((m) => {
          const mq = qs.filter((q) => q.module === m.id);
          return mq.length ? `<section class="open-mod" data-u="${m.unit}"><h2><span class="mod-n">${tagOf(m)}</span>${m.title}</h2><div class="open-mount" data-m="${m.id}"></div></section>` : '';
        }).join('')}
      </article>`;
    let k = 0;
    main.querySelectorAll('.open-mount').forEach((el) => { const mq = qs.filter((q) => q.module === el.dataset.m); renderOpen(el, mq, { mode: 'review', start: k }); k += mq.length; });
  }
  A.renderOpen = renderOpen;
  A.page((id) => id.startsWith('abiertas'), (id) => renderOpenPage(id.slice(9)));
})();
