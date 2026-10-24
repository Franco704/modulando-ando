// Autocomprobación del contenido: carga todos los temas y valida su estructura. Uso: node tests/content.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
global.window = {};
const files = ['content/_helpers', 'labs/core', 'labs/cx', 'labs/coms', ...fs.readdirSync(path.join(__dirname, '../js/content')).filter((f) => /^\d\d-.*\.js$/.test(f)).sort().map((f) => `content/${f.slice(0, -3)}`), 'content/formulas', 'content/parciales'];
files.forEach((f) => fs.existsSync(path.join(__dirname, `../js/${f}.js`)) && require(`../js/${f}.js`));
const { LESSONS, MODULES, LABS, FORMULAS = [], EXAMS, cx } = window.GUIDE;
const ids = new Set();
for (const l of LESSONS) {
  assert(!ids.has(l.id), `id repetido ${l.id}`); ids.add(l.id);
  assert(MODULES.some((m) => m.id === l.module), `módulo inexistente en ${l.id}`);
  for (const c of l.labs || []) assert(LABS[c.type], `lab ${c.type} en ${l.id}`);
  for (const q of l.quiz || []) assert(q.a >= 0 && q.a < q.o.length, `respuesta fuera de rango en ${l.id}: ${q.q}`);
  for (const q of l.open || []) {
    assert(['num', 'text', 'bits'].includes(q.t) && q.q && q.e, `abierta mal formada en ${l.id}: ${q.q}`);
    if (q.t === 'num') { assert(Number.isFinite(q.a), `abierta numérica sin a en ${l.id}`); assert(cx.checkOpen(q, String(q.a).replace('.', ',')).ok, `la respuesta propia no valida en ${l.id}: ${q.q}`); }
    if (q.t === 'bits') assert(/^[01 ]+$/.test(q.a) && cx.checkOpen(q, q.a).ok, `bits mal en ${l.id}`);
    if (q.t === 'text') { assert(Array.isArray(q.k) && q.k.every((g) => Array.isArray(g) && g.length), `conceptos mal en ${l.id}`); const need = q.need ?? (q.k.length <= 2 ? q.k.length : q.k.length - 1); assert(need <= q.k.length, `need > conceptos en ${l.id}`); assert(cx.checkOpen(q, q.k.map((g) => g[0]).join(' ') + ' respuesta completa').ok, `los conceptos no validan en ${l.id}: ${q.q}`); }
  }
  for (const e of l.exercises || []) assert(!e.official || /^\d+\.\d+$/.test(e.official), `official mal en ${l.id}`);
  const placed = [...l.body.matchAll(/data-lab="(\d+)"/g)].map((m) => +m[1]);
  placed.forEach((i) => assert(l.labs && l.labs[i], `lab(${i}) sin definir en ${l.id}`));
  assert(!/NaN|undefined/.test(l.body + JSON.stringify(l.exercises || []) + JSON.stringify(l.open || [])), `NaN/undefined en ${l.id}`);
}
// Parciales: cada etiqueta exam apunta a un ítem existente y cada ítem tiene su resolución (un ejercicio)
const items = new Set(EXAMS.flatMap((e) => e.items.map(([k]) => `${e.id}#${k}`)));
const solved = LESSONS.flatMap((l) => (l.exercises || []).flatMap((x) => x.exam || []));
const tagged = LESSONS.flatMap((l) => [...(l.exercises || []), ...(l.quiz || [])].flatMap((x) => x.exam || []));
tagged.forEach((k) => assert(items.has(k), `etiqueta de parcial inexistente: ${k}`));
items.forEach((k) => assert(solved.includes(k), `ítem de parcial sin resolver: ${k}`));
FORMULAS.forEach((f) => assert(MODULES.some((m) => m.id === f.m), `fórmula con módulo inexistente ${f.n}`));
const n = (k) => LESSONS.reduce((a, l) => a + (l[k]?.length || 0), 0);
const loaded = MODULES.filter((m) => LESSONS.some((l) => l.module === m.id)).map((m) => m.id);
console.log(`contenido OK: ${EXAMS.length} exámenes (${items.size} ítems), ${LESSONS.length} lecciones (${loaded.join(', ')}), ${n('labs')} laboratorios, ${n('quiz')} preguntas, ${n('open')} abiertas, ${n('exercises')} ejercicios`);
