/* Laboratorios de la Unidad 6: paridad, CRC, Hamming y ARQ. */
(() => {
  const L = window.GUIDE.LABS;
  const { plot, num, esc } = window.GUIDE.h;
  const X = window.GUIDE.cx;
  const PI = Math.PI;
  const { sliders, toggle, select, textIn, chips, shell, eng, niceTicks, bitsOnly, rng, gauss } = window.GUIDE.labUtil;
  /* ---------- Paridad VRC/LRC sobre una palabra ASCII ---------- */
  L.parity = (el, cfg) => {
    let even = cfg.even !== false, flips = new Set();
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('w', 'Palabra (ASCII 7 bits, hasta 8 letras)', cfg.word || 'REDES', 'maxlength="8"')}</div>`);
    toggle(el, 'Paridad', [['par', 'Paridad par'], ['impar', 'Paridad impar']], even ? 'par' : 'impar', (k) => { even = k === 'par'; draw(); });
    el.insertAdjacentHTML('beforeend', '<div class="par-out"></div><div class="lab-read" aria-live="polite"></div><div class="lab-row"><button class="btn sm" type="button" data-act="clr">Quitar errores</button></div>');
    const out = el.querySelector('.par-out'), read = el.querySelector('.lab-read');
    const pbit = (bits) => String((X.ones(bits) + (even ? 0 : 1)) % 2);
    const draw = () => {
      const w = el.querySelector('[data-t="w"]').value.slice(0, 8) || 'A';
      // fila por carácter: b6..b0 + VRC (calculado en el emisor)
      const rows = [...w].map((ch) => { const b = X.ascii7(ch); return b + pbit(b); });
      const lrc = Array.from({ length: 8 }, (_, j) => pbit(rows.map((r) => r[j]).join(''))).join('');
      const all = [...rows, lrc];
      // recibido = enviado con los bits tocados invertidos
      const rx = all.map((r, i) => [...r].map((c, j) => (flips.has(`${i},${j}`) ? (c === '1' ? '0' : '1') : c)).join(''));
      const badRow = rx.map((r) => X.ones(r) % 2 !== (even ? 0 : 1));
      const badCol = Array.from({ length: 8 }, (_, j) => X.ones(rx.map((r) => r[j]).join('')) % 2 !== (even ? 0 : 1));
      out.innerHTML = `<div class="table-wrap"><table class="mtab"><thead><tr><th></th>${['b6', 'b5', 'b4', 'b3', 'b2', 'b1', 'b0', 'VRC'].map((h, j) => `<th class="${badCol[j] ? 'bad' : ''}">${h}</th>`).join('')}<th></th></tr></thead><tbody>
        ${rx.map((r, i) => `<tr><th>${i < rows.length ? esc(w[i]) : 'LRC'}</th>${[...r].map((c, j) => `<td class="${flips.has(`${i},${j}`) ? 'bad' : j === 7 || i === rows.length ? 'par' : ''}"><button type="button" data-i="${i}" data-j="${j}" aria-label="Invertir bit">${c}</button></td>`).join('')}<td>${badRow[i] ? '<span class="chip err">✗</span>' : ''}</td></tr>`).join('')}</tbody></table></div>`;
      const nr = badRow.filter(Boolean).length, nc = badCol.filter(Boolean).length;
      read.innerHTML = chips([['Errores introducidos', flips.size, flips.size ? 'warn' : ''], ['Filas con paridad mal (VRC)', nr, nr ? 'err' : 'ok'], ['Columnas con paridad mal (LRC)', nc, nc ? 'err' : 'ok'],
        flips.size && !nr && !nc && ['Detección', 'ninguna: los errores se compensan', 'err'], nr === 1 && nc === 1 && ['Corrección', `bit en fila ${badRow.indexOf(true) + 1}, columna ${['b6', 'b5', 'b4', 'b3', 'b2', 'b1', 'b0', 'VRC'][badCol.indexOf(true)]}`, 'ok']])
        + '<p class="lab-note">Tocá cualquier bit para simular un error. Con un solo error, VRC marca la fila y LRC la columna: el cruce dice qué bit corregir. Probá dos errores en la misma fila (VRC no los ve) o cuatro en un rectángulo (no los ve nadie).</p>';
    };
    out.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const k = `${b.dataset.i},${b.dataset.j}`; flips.has(k) ? flips.delete(k) : flips.add(k); draw(); });
    el.querySelector('[data-t="w"]').addEventListener('input', () => { flips.clear(); draw(); });
    el.querySelector('[data-act="clr"]').addEventListener('click', () => { flips.clear(); draw(); });
    draw();
  };

  /* ---------- CRC: división módulo 2 paso a paso ---------- */
  function divText(dividend, steps, r) {
    // arma la división larga alineada en columnas
    const lines = [`<b>${dividend}</b>`];
    steps.forEach((s, k) => {
      const pad = ' '.repeat(s.at);
      if (k) lines.push(`${pad}${s.top}`);
      lines.push(`${pad}${s.gen}  ← G(x)`);
      lines.push(`${pad}${'─'.repeat(r + 1)}`);
    });
    return lines;
  }
  L.crc = (el, cfg) => {
    let mode = cfg.mode || 'tx';
    toggle(el, 'Modo', [['tx', 'Calcular el CRC a enviar'], ['rx', 'Verificar lo recibido']], mode, (k) => { mode = k; draw(); });
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('m', 'Mensaje M(x) [bits]', cfg.msg || '10110111')}${textIn('g', 'Generador G(x) [bits]', cfg.gen || '110011')}${textIn('r', 'Trama recibida T′(x) [bits]', cfg.rx || '1011011101001')}</div>
      <div class="crc-out" aria-live="polite"></div><div class="lab-row"><button class="btn sm" type="button" data-act="err">Simular un error en la trama</button></div>`);
    const out = el.querySelector('.crc-out');
    const poly = (b) => { const n = b.length - 1; const t = [...b].map((c, i) => (c === '1' ? (n - i === 0 ? '1' : n - i === 1 ? 'x' : `x${String(n - i).replace(/./g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`) : null)).filter(Boolean); return t.join(' + ') || '0'; };
    const draw = () => {
      el.querySelector('[data-t="m"]').closest('label').hidden = mode !== 'tx';
      el.querySelector('[data-t="r"]').closest('label').hidden = mode !== 'rx';
      const g = bitsOnly(el.querySelector('[data-t="g"]').value, 17);
      if (g.length < 2 || g[0] !== '1') { out.innerHTML = '<p class="note warn">El generador tiene que empezar con 1 y tener al menos 2 bits.</p>'; return; }
      const r = g.length - 1;
      if (mode === 'tx') {
        const m = bitsOnly(el.querySelector('[data-t="m"]').value, 32);
        if (!m) { out.innerHTML = '<p class="lab-note">Escribí el mensaje en bits.</p>'; return; }
        const c = X.crc(m, g);
        out.innerHTML = `${chips([['M(x)', poly(m)], ['G(x)', `${poly(g)} (grado r = ${r})`], ['xʳ·M(x)', `${m} + ${r} ceros`]])}
          <div class="divlong">${divText(c.padded, c.steps, r).join('\n')}\n${' '.repeat(c.padded.length - r)}<i>${c.rem}</i>  ← resto R(x)</div>
          ${chips([['R(x)', c.rem, 'acc'], ['T(x) = xʳ·M(x) + R(x)', c.tx, 'ok']])}
          <p class="lab-note">Se agregan r ceros (r = grado de G), se divide en módulo 2 (restar es XOR: sin acarreo ni préstamo) y el resto de r bits reemplaza a esos ceros. La trama enviada es divisible por G(x).</p>`;
      } else {
        const rx = bitsOnly(el.querySelector('[data-t="r"]').value, 48);
        if (rx.length <= r) { out.innerHTML = '<p class="lab-note">La trama tiene que ser más larga que el generador.</p>'; return; }
        const c = X.crcCheck(rx, g), okk = !c.rem.includes('1');
        out.innerHTML = `<div class="divlong">${divText(rx, c.steps, r).join('\n')}\n${' '.repeat(rx.length - r)}<i>${c.rem}</i>  ← resto</div>
          ${chips([['Resto', c.rem, okk ? 'ok' : 'err'], ['Resultado', okk ? 'sin error detectado' : 'HAY ERROR: se descarta la trama', okk ? 'ok' : 'err'], okk && ['Datos', rx.slice(0, -r)]])}
          <p class="lab-note">El receptor divide la trama completa por el mismo G(x). Resto cero: se acepta. Resto distinto de cero: hubo error (CRC detecta, no corrige: se pide retransmitir).</p>`;
      }
    };
    el.querySelector('[data-act="err"]').addEventListener('click', () => {
      const inp = el.querySelector('[data-t="r"]');
      if (mode === 'tx') { const c = X.crc(bitsOnly(el.querySelector('[data-t="m"]').value, 32), bitsOnly(el.querySelector('[data-t="g"]').value, 17)); inp.value = c.tx; }
      const b = bitsOnly(inp.value, 48), k = Math.floor(Math.random() * b.length);
      inp.value = b.slice(0, k) + (b[k] === '1' ? '0' : '1') + b.slice(k + 1);
      mode = 'rx';
      el.querySelectorAll('.toggle button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.k === 'rx'));
      draw();
    });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) draw(); });
    draw();
  };

  /* ---------- Código de Hamming con la disposición de la cátedra ---------- */
  L.hamming = (el, cfg) => {
    let mode = cfg.mode || 'tx';
    toggle(el, 'Modo', [['tx', 'Codificar datos'], ['rx', 'Decodificar lo recibido']], mode, (k) => { mode = k; flips.clear(); draw(); });
    el.insertAdjacentHTML('beforeend', `<div class="lab-in">${textIn('d', 'Datos n [bits]', cfg.data || '1001101')}${textIn('r', 'Palabra recibida [bits]', cfg.rx || '10001100100')}</div><div class="hm-out" aria-live="polite"></div>`);
    const out = el.querySelector('.hm-out');
    const flips = new Set();
    const isP = (k) => (k & (k - 1)) === 0;
    const draw = () => {
      el.querySelector('[data-t="d"]').closest('label').hidden = mode !== 'tx';
      el.querySelector('[data-t="r"]').closest('label').hidden = mode !== 'rx';
      let word;
      if (mode === 'tx') {
        const d = bitsOnly(el.querySelector('[data-t="d"]').value, 26);
        if (!d) { out.innerHTML = '<p class="lab-note">Escribí los datos en bits.</p>'; return; }
        word = X.hammingEncode(d).word;
      } else word = bitsOnly(el.querySelector('[data-t="r"]').value, 31);
      if (word.length < 3) { out.innerHTML = '<p class="lab-note">Escribí al menos 3 bits.</p>'; return; }
      const N = word.length;
      const lay = X.hammingLayout(N - Math.ceil(Math.log2(N + 1)));
      const rx = [...word].map((c, j) => (flips.has(N - j) ? (c === '1' ? '0' : '1') : c)).join('');
      const dec = X.hammingDecode(rx);
      const pos = Array.from({ length: N }, (_, j) => N - j);
      const label = (k) => (lay.lab[k] || (isP(k) ? 'p' : 'n'));
      const p = dec.p;
      out.innerHTML = `${mode === 'tx' ? chips([['n', `${N - p} bits de datos`], ['p', `${p} de paridad: 2^${p} = ${2 ** p} ≥ n + p + 1 = ${N + 1}`, 'acc'], ['Palabra a transmitir', word, 'ok']]) : ''}
        <p class="lab-note">${mode === 'tx' ? 'Tocá un bit de la palabra para simular un error en el canal.' : 'Tocá un bit si querés agregar otro error.'}</p>
        <div class="bitrow pos">${pos.map((k, j) => `<button type="button" data-k="${k}" class="${flips.has(k) ? 'flip' : isP(k) ? 'pb' : ''}" aria-label="Posición ${k}"><small>${label(k)}·${k}</small>${rx[j]}</button>`).join('')}</div>
        <div class="table-wrap"><table class="mtab"><thead><tr><th>Control</th>${pos.map((k) => `<th>${k}</th>`).join('')}<th>Resultado</th></tr></thead><tbody>
          ${Array.from({ length: p }, (_, i) => `<tr><th>p${i + 1} (pos. ${2 ** i})</th>${pos.map((k, j) => ((k >> i) & 1 ? `<td class="${isP(k) ? 'par' : ''}">${rx[j]}</td>` : '<td></td>')).join('')}<td class="${dec.checks[i] ? 'bad' : ''}">${dec.checks[i]}</td></tr>`).join('')}
        </tbody></table></div>
        ${chips([['Síndrome (p' + Array.from({ length: p }, (_, i) => p - i).join(' p') + ')', `${[...dec.checks].reverse().join('')}₂ = ${dec.syn}`, dec.syn ? 'err' : 'ok'], ['Diagnóstico', dec.syn ? (dec.syn <= N ? `error en la posición ${dec.syn}` : 'más de un error: no se puede corregir') : 'sin error', dec.syn ? 'err' : 'ok'], dec.syn && dec.syn <= N && ['Corregida', dec.corrected, 'ok'], ['Datos', dec.data, 'acc']])}
        <p class="lab-note">Posiciones numeradas de derecha (1) a izquierda; los bits de paridad van en 1, 2, 4, 8… y cada pᵢ controla (paridad par) las posiciones cuyo número en binario tiene un 1 en el lugar i. Leídos de p${p} a p1, los resultados forman el número de la posición errónea. Con 2 errores el síndrome apunta a un bit equivocado: Hamming corrige 1 o detecta 2, no las dos cosas a la vez.</p>`;
    };
    out.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; const k = +b.dataset.k; flips.has(k) ? flips.delete(k) : flips.add(k); draw(); });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-t]')) { flips.clear(); draw(); } });
    draw();
  };

  /* ---------- ARQ: qué se retransmite cuando se pierde una trama ---------- */
  L.arq = (el, cfg) => {
    let proto = cfg.proto || 'gbn';
    el.insertAdjacentHTML('beforeend', `<div class="lab-row">${select('p', 'Protocolo', [['sw', 'Parada y espera'], ['gbn', 'Ir N atrás (go-back-N)'], ['sr', 'Retransmisión selectiva']], proto)}</div>`);
    const v = sliders(el, [
      { id: 'n', label: 'Tramas a enviar', min: 4, max: 10, step: 1, value: 8 },
      { id: 'w', label: 'Ventana (tramas sin confirmar)', min: 2, max: 7, step: 1, value: 4 },
      { id: 'l', label: 'Trama que se pierde', min: 0, max: 9, step: 1, value: 2 },
    ], () => draw());
    const [host, read] = shell(el);
    const draw = () => {
      const n = v.n, lost = Math.min(v.l, n - 1), W = proto === 'sw' ? 1 : v.w;
      // secuencia de envíos: { k, st: 'ok' | 'lost' | 'drop' (llega pero se descarta) | 're' }
      const seq = [];
      if (proto === 'sw') for (let k = 0; k < n; k++) { if (k === lost) seq.push({ k, st: 'lost' }, { k, st: 're' }); else seq.push({ k, st: 'ok' }); }
      else {
        const burst = Math.min(n, lost + W);   // lo que alcanza a salir antes de que venza el temporizador o llegue el NAK
        for (let k = 0; k < burst; k++) seq.push({ k, st: k === lost ? 'lost' : k > lost && proto === 'gbn' ? 'drop' : 'ok' });
        if (proto === 'gbn') { for (let k = lost; k < n; k++) seq.push({ k, st: 're' }); }
        else { seq.push({ k: lost, st: 're' }); for (let k = burst; k < n; k++) seq.push({ k, st: 'ok' }); }
      }
      const C = { ok: 'ok', lost: 'n', drop: 'w', re: 'acc' };
      const cw = 40, W2 = Math.max(460, seq.length * cw + 20);
      host.innerHTML = `<div class="wave-wrap"><svg class="dg" viewBox="0 0 ${W2} 120" style="max-width:none;min-width:${W2}px" role="img" aria-label="Secuencia de tramas enviadas">
        <text x="10" y="16" class="ts tl">Orden en que salen las tramas →</text>
        ${seq.map((s, i) => `<g><rect x="${10 + i * cw}" y="30" width="${cw - 6}" height="40" rx="6" class="b ${C[s.st]}"/><text x="${10 + i * cw + (cw - 6) / 2}" y="50" class="t">${s.k}</text>
          <text x="${10 + i * cw + (cw - 6) / 2}" y="86" class="ts">${{ ok: '✓', lost: 'perdida', drop: 'descart.', re: 'reenvío' }[s.st]}</text></g>`).join('')}
      </svg></div>`;
      const extra = seq.length - n;
      read.innerHTML = chips([['Envíos totales', seq.length, 'acc'], ['Retransmisiones', extra, extra > 1 ? 'warn' : 'ok'], ['Ventana', W]])
        + `<p class="lab-note">${{ sw: 'Parada y espera: una trama por vez; si no llega el ACK antes del temporizador (time-out) se reenvía esa trama. Simple, pero el canal pasa la mayor parte del tiempo esperando.', gbn: 'Ir N atrás: se envían hasta W tramas sin esperar. El receptor descarta todo lo que llega después de la trama perdida, así que el emisor repite desde la perdida en adelante. Receptor simple, pero se reenvían tramas que habían llegado bien.', sr: 'Retransmisión selectiva: el receptor guarda las tramas que llegan fuera de orden y pide solo la que falta (NAK). Es la más eficiente en el uso del canal, a costa de buffers y lógica en el receptor.' }[proto]}</p>`;
    };
    el.querySelector('[data-s="p"]').addEventListener('change', (e) => { proto = e.target.value; draw(); });
    draw();
  };
})();
