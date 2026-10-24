/* Unidad 4 (2do parcial): teoría de la información y codificación. Guía "Unidad 4 Teoría de la Información y Codificación" y apuntes 4-1 a 4-5.
   TP 4: información de eventos, entropía, H(p), tasa de información, redundancia y Huffman (TRES TRISTES TIGRES).
   Las tablas de Huffman se calculan con cx.huffman, el mismo algoritmo que reproduce el ejemplo 16 de la guía. */
(() => {
  const { LESSONS, h, cx: X } = window.GUIDE;
  const { note, def, table, eq, frac, lab, num } = h;
  const n3 = (v) => num(v, 3);

  const word = 'TRESTRISTESTIGRES';
  const wf = X.freqs(word), whf = X.huffman(wf);
  const ascii8 = [...word].map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  const huffBits = [...word].map((c) => whf.codes[c]).join('');
  const e16 = [0.2, 0.01, 0.4, 0.04, 0.1, 0.02, 0.07, 0.16].map((p, i) => ({ s: `x${i}`, p }));
  const h16 = X.huffman(e16);
  const H7 = X.entropy([1 / 16, 1 / 4, 1 / 2, 3 / 16]);

  LESSONS.push(
    {
      id: 'medida-informacion',
      module: 'u4',
      title: 'Información y su medida',
      keywords: 'teoría de la información Shannon Weaver 1948 Hartley medida de la información bit nat hartley logaritmo probabilidad sorpresa incertidumbre mensaje fuente',
      tldr: 'La Teoría de la Información (Shannon, 1948) busca <strong>transmitir información a la máxima velocidad posible con la mínima cantidad de errores</strong>. La información de un mensaje mide su sorpresa: <mark>I = log₂(1/P) = −log₂P</mark> bits. Un evento seguro no informa; uno improbable informa mucho. Con base 2 la unidad es el <strong>bit</strong>.',
      goals: ['Explicar el problema que resuelve la teoría de la información.', 'Calcular la información de un evento y de una secuencia de eventos independientes.', 'Conocer las unidades (bit, nat, hartley) y las propiedades de la medida.'],
      body: `
        <h2>El problema de Shannon</h2>
        <p>Claude Shannon y Warren Weaver (1948) crearon la teoría matemática que sostiene toda la comunicación y la codificación actuales. El problema:</p>
        ${def('Problema de la teoría de la información', 'Poder transmitir información a la máxima velocidad posible por un canal de comunicaciones, con una mínima cantidad de errores posible.', 'Guía de la Unidad 4')}
        <p>Trata tres conceptos: la <strong>medida de la información</strong>, la <strong>capacidad de un canal</strong> para transferirla y la <strong>codificación</strong> para usar el canal a su máxima capacidad. No importa el significado del mensaje: importa cuánta incertidumbre resuelve.</p>
        <h2>Cuánta información trae un mensaje</h2>
        <p>Si una fuente elige un mensaje x<sub>i</sub> con probabilidad P(x<sub>i</sub>), la información debe cumplir: ser mayor cuanto menos probable es el mensaje, valer 0 si el mensaje es seguro (P = 1), no ser negativa y ser <strong>aditiva</strong> para mensajes independientes (I(A y B) = I(A) + I(B)). Hartley (1928) mostró que la única función que cumple todo es el logaritmo:</p>
        ${eq(`I(x<sub>i</sub>) = log₂ ${frac('1', 'P(x<sub>i</sub>)')} = −log₂ P(x<sub>i</sub>) [bit]`, 'Cantidad de información')}
        ${table(['Base del logaritmo', 'Unidad'], [['2', '<strong>bit</strong> (binary digit)'], ['e', 'nat'], ['10', 'hartley (dit)']])}
        ${note('Con la calculadora: log₂ x = log x / log 2 = ln x / ln 2.', 'tip')}
        <h3>Ejemplos de la guía</h3>
        <ul>
          <li>Una moneda (dos resultados equiprobables): I = log₂ 2 = <strong>1 bit</strong>. Esa es la definición del bit de información.</li>
          <li>16 resultados equiprobables: I = log₂ 16 = <strong>4 bits</strong>.</li>
          <li>Tres tiradas de moneda: 2³ = 8 resultados → 3 bits (la información se suma: 1 + 1 + 1).</li>
        </ul>
        ${lab(0)}`,
      labs: [
        { type: 'calc', title: 'Información de un evento', fields: [{ id: 'f', label: 'Casos favorables', value: 13 }, { id: 't', label: 'Casos totales (equiprobables)', value: 52 }, { id: 'k', label: 'Eventos independientes iguales', value: 1 }],
          run: (v) => { const p = v.f / v.t, i = X.info(p); return `P = ${num(v.f)}/${num(v.t)} = ${num(p, 5)}\nI = log₂(1/P) = ${num(i, 4)} bit\n${v.k > 1 ? `${num(v.k)} eventos independientes: ${num(v.k)} × ${num(i, 4)} = ${num(v.k * i, 4)} bit` : ''}`; } },
      ],
      exercises: [
        { title: 'Información de una carta', official: '4.1', level: 1, prompt: '<p>Hallar la información que se tiene al saber que una carta de un mazo de 52 es: de corazones; una figura; una figura de corazones.</p>',
          solution: { explain: `<p>Corazones: P = 13/52 = 1/4 → I = log₂ 4 = <strong>2 bits</strong>.<br>Figura (J, Q, K de 4 palos = 12): P = 12/52 → I = log₂(52/12) = <strong>${n3(X.info(12 / 52))} bits</strong>.<br>Figura de corazones (3): P = 3/52 → I = log₂(52/3) = <strong>${n3(X.info(3 / 52))} bits</strong>. Es la suma de las dos anteriores (2 + 2,115) porque palo y tipo de carta son independientes.</p>` } },
        { title: 'Una letra del alfabeto español', official: '4.2', level: 1, prompt: '<p>Hallar la información de elegir una letra del alfabeto español (27 letras).</p>', solution: { explain: `<p>Suponiendo letras equiprobables: I = log₂ 27 = <strong>${n3(X.log2(27))} bits</strong>.</p>` } },
        { title: 'La palabra MIGUEL', official: '4.3', level: 1, prompt: '<p>Hallar la información total de enviar la palabra MIGUEL con el alfabeto anterior.</p>', solution: { explain: `<p>Seis letras independientes: I = 6 × log₂ 27 = 6 × 4,755 = <strong>${num(6 * X.log2(27), 2)} bits</strong>.</p>` } },
      ],
      quiz: [
        { q: 'La información de un mensaje es mayor cuanto…', o: ['más probable es', 'menos probable es', 'más largo es', 'más importante es para el usuario'], a: 1, e: 'I = log₂(1/P).' },
        { q: 'Un evento seguro (P = 1) aporta…', o: ['1 bit', 'infinitos bits', '0 bits', '−1 bit'], a: 2, e: 'log₂ 1 = 0: no hay sorpresa.' },
        { q: '¿Cuánta información da elegir uno de 8 símbolos equiprobables?', o: ['1 bit', '3 bits', '8 bits', '0,125 bits'], a: 1, e: 'log₂ 8 = 3.' },
        { q: 'Si se usa logaritmo natural, la unidad es…', o: ['bit', 'nat', 'hartley', 'baudio'], a: 1, e: 'Base 10: hartley.' },
        { q: 'La información de dos eventos independientes es…', o: ['el producto de sus informaciones', 'la suma de sus informaciones', 'la mayor de las dos', 'siempre 1 bit'], a: 1, e: 'Por eso se usa el logaritmo.' },
        { q: '¿Quién publicó la teoría matemática de la comunicación en 1948?', o: ['Nyquist', 'Fourier', 'Shannon (con Weaver)', 'Hamming'], a: 2, e: 'Hartley había propuesto la medida logarítmica en 1928.' },
      ],
      open: [
        { t: 'num', q: '¿Cuántos bits de información da sacar un número de un dado de 6 caras? (3 decimales)', a: X.log2(6), tol: 0.002, u: 'bit', e: `<p>log₂ 6 = ${n3(X.log2(6))} bits.</p>` },
        { t: 'num', q: 'Un evento tiene probabilidad 1/32. ¿Cuánta información aporta en bits?', a: 5, u: 'bit', e: '<p>log₂ 32 = 5 bits.</p>' },
        { t: 'text', q: '¿Por qué la medida de la información usa un logaritmo?', k: [['aditiv', 'suma', 'sumar'], ['independiente'], ['probabilidad', 'producto', 'multiplic']], e: '<p>Porque la información de eventos independientes debe sumarse, mientras sus probabilidades se multiplican: la única función que convierte productos en sumas (y vale 0 para P = 1 y crece al bajar P) es el logaritmo (Hartley).</p>' },
      ],
    },
    {
      id: 'entropia',
      module: 'u4',
      title: 'Entropía y redundancia de una fuente',
      keywords: 'entropía información promedio H(x) bits por símbolo entropía máxima log2 N equiprobables fuente binaria H(p) fuente de memoria nula redundancia incertidumbre',
      tldr: 'La <strong>entropía</strong> es la información <em>promedio</em> por símbolo de una fuente: <mark>H = Σ P(x<sub>i</sub>)·log₂(1/P(x<sub>i</sub>))</mark> [bit/símbolo]. Va de 0 (fuente segura) a <strong>H<sub>máx</sub> = log₂N</strong> (N símbolos equiprobables). La <strong>redundancia</strong> mide lo que le falta para el máximo: (H<sub>máx</sub> − H)/H<sub>máx</sub>.',
      goals: ['Calcular la entropía de una fuente y su entropía máxima.', 'Graficar e interpretar la entropía de la fuente binaria H(p).', 'Calcular e interpretar la redundancia.', 'Calcular probabilidades e información a partir de una cadena de caracteres (TP 4, ejercicio 4).'],
      body: `
        <h2>Información promedio</h2>
        <p>En una secuencia larga de L símbolos, el símbolo x<sub>i</sub> aparece unas L·P(x<sub>i</sub>) veces y aporta L·P(x<sub>i</sub>)·I(x<sub>i</sub>) bits. Dividiendo por L:</p>
        ${eq(`H(x) = Σ<sub>i</sub> P(x<sub>i</sub>) log₂ ${frac('1', 'P(x<sub>i</sub>)')} [bit/símbolo]`, 'Entropía de la fuente')}
        ${eq('0 ≤ H(x) ≤ log₂ N', 'Cotas de la entropía')}
        <p>Ejemplo 7 de la guía: A, B, C, D con P = 0,5; 0,25; 0,125; 0,125 → H = 0,5·1 + 0,25·2 + 2·0,125·3 = <strong>1,75 bit/símbolo</strong>. Si fueran equiprobables: H<sub>máx</sub> = log₂ 4 = 2.</p>
        ${note('La entropía es la incertidumbre de la fuente: es <strong>máxima cuando todos los símbolos son equiprobables</strong> (no se puede adivinar el próximo) y cero cuando uno es seguro. También es el número medio mínimo de bits para codificar cada símbolo (lección de Huffman).', 'exam')}
        <h2>La fuente binaria</h2>
        ${eq('H(p) = −p log₂ p − (1 − p) log₂(1 − p)', 'Fuente binaria sin memoria, P(s₀) = p')}
        ${lab(0)}
        <p>Puntos interesantes de la curva: <strong>p = 0 o 1</strong> → H = 0 (la fuente siempre emite lo mismo); <strong>p = 0,5</strong> → H = 1 bit, el máximo; es simétrica respecto de 0,5 y muy “plana” cerca del máximo (con p = 0,25 todavía H = 0,81).</p>
        <h2>Redundancia</h2>
        ${eq(`R = ${frac('H<sub>máx</sub> − H', 'H<sub>máx</sub>')} · 100 %`, 'Redundancia de una fuente')}
        <p>Una fuente es redundante cuando sus símbolos no son equiprobables o dependen unos de otros (en español, después de “q” casi siempre viene “u”). El inglés tiene ~50 % de redundancia. Ejemplo 10: fuente binaria con P(0) = 1/4 → H = 0,811; R = (1 − 0,811)/1 = <strong>18,9 %</strong> (la guía lo redondea a 20 %).</p>
        ${table(['Entropía', 'Redundancia'], [['Lo impredecible, la información nueva', 'Lo predecible o convencional'], ['Alta con probabilidades parecidas', 'Alta con probabilidades muy distintas'], ['Mensaje con mucha información', 'Mensaje con poco contenido nuevo, pero más resistente a errores']])}
        ${note('La redundancia no es solo desperdicio: bien usada, permite detectar y corregir errores (Unidad 6). La codificación de fuente la quita; la de canal la agrega de forma controlada.', 'tip')}`,
      labs: [
        { type: 'hbin', title: 'Entropía de la fuente binaria H(p)', intro: 'Mové p. ¿Dónde está el máximo? ¿Cuánto vale H con p = 0,1?', p: 0.25 },
        { type: 'huffman', title: 'Probabilidades, información y entropía de una cadena', intro: 'Escribí una cadena (como las del ejercicio 4 del TP): la tabla calcula P(x) e I(x) de cada símbolo y la entropía.', text: 'AABBBBCD', mode: 'text' },
      ],
      exercises: [
        { title: 'Entropía de cadenas de caracteres', official: '4.4', level: 2, prompt: '<p>Para cada cadena: a) probabilidad e información de cada símbolo; b) entropía; c) entropía máxima teórica; d) ordenar las entropías de menor a mayor. ¿Qué se observa?</p><p class="muted-s">Las cadenas del TP están en una imagen. Se resuelve con cuatro cadenas típicas: AAAA, AAAB, AABB y ABCD.</p>',
          solution: { explain: `${table(['Cadena', 'P(x) e I(x)', 'H [bit/símb.]', 'H<sub>máx</sub> = log₂N'], [
            ['AAAA', 'A: 1 → 0 bit', '0', '0 (N = 1)'],
            ['AAAB', 'A: 3/4 → 0,415 · B: 1/4 → 2', n3(X.entropy([0.75, 0.25])), '1'],
            ['AABB', 'A: 1/2 → 1 · B: 1/2 → 1', '1', '1'],
            ['ABCD', 'cada una 1/4 → 2', '2', '2'],
          ])}<p><b>d)</b> 0 &lt; 0,811 &lt; 1 &lt; 2. Se observa que la entropía crece con la cantidad de símbolos distintos y con lo parejas que son sus probabilidades: llega al máximo log₂N cuando son equiprobables. El laboratorio de la lección resuelve cualquier cadena.</p>` } },
        { title: 'Fuente binaria H(p)', official: '4.5', level: 1, prompt: '<p>Fuente binaria sin memoria con P(s₀) = p y P(s₁) = q = 1 − p. a) Formular H(p). b) Graficarla. c) Interpretar los puntos interesantes.</p>', solution: { explain: '<p>a) H(p) = −p log₂p − (1 − p) log₂(1 − p). b) Es la curva del laboratorio. c) H(0) = H(1) = 0: sin incertidumbre (siempre el mismo símbolo). H(0,5) = 1 bit: máximo, símbolos equiprobables. Simetría: H(p) = H(1 − p). Cerca de 0,5 la curva es casi plana: desbalances chicos casi no bajan la entropía; cerca de 0 o 1 cae bruscamente.</p>' } },
      ],
      quiz: [
        { q: 'La entropía de una fuente es…', o: ['la información del símbolo más probable', 'la información promedio por símbolo', 'la cantidad de símbolos', 'la velocidad de la fuente'], a: 1, e: 'H = Σ P·I.' },
        { q: 'La entropía máxima de una fuente de 8 símbolos es…', o: ['1', '3 bits/símbolo', '8 bits/símbolo', '0,125'], a: 1, e: 'log₂ 8.' },
        { q: 'H(p) de la fuente binaria es máxima en…', o: ['p = 0', 'p = 0,25', 'p = 0,5', 'p = 1'], a: 2, e: 'Vale 1 bit.' },
        { q: 'A, B, C, D con P = ½, ¼, ⅛, ⅛ tienen entropía…', o: ['2', '1,75', '1,5', '1'], a: 1, e: 'Ejemplo 7 de la guía.' },
        { q: 'Una fuente con H = H<sub>máx</sub> tiene redundancia…', o: ['100 %', '50 %', '0 %', 'negativa'], a: 2, e: 'Sus símbolos son equiprobables.' },
        { q: 'Una fuente que siempre emite el mismo símbolo tiene entropía…', o: ['máxima', 'cero', '1 bit', 'infinita'], a: 1, e: 'No hay incertidumbre.' },
      ],
      open: [
        { t: 'num', q: 'Entropía (bit/símbolo) de una fuente con P = 0,5; 0,25; 0,125; 0,0625; 0,0625. (3 decimales)', a: X.entropy([0.5, 0.25, 0.125, 0.0625, 0.0625]), tol: 0.002, e: `<p>H = 0,5·1 + 0,25·2 + 0,125·3 + 2·0,0625·4 = ${n3(X.entropy([0.5, 0.25, 0.125, 0.0625, 0.0625]))} bit/símbolo.</p>` },
        { t: 'num', q: 'Redundancia (%) de una fuente binaria con P(0) = 0,1. (1 decimal)', a: (1 - X.entropy([0.1, 0.9])) * 100, tol: 0.01, u: '%', e: `<p>H = −0,1 log₂0,1 − 0,9 log₂0,9 = ${n3(X.entropy([0.1, 0.9]))}; R = (1 − H)/1 = ${num((1 - X.entropy([0.1, 0.9])) * 100, 1)} %.</p>` },
        { t: 'num', q: 'Una fuente tiene 10 símbolos equiprobables. ¿Cuál es su entropía? (3 decimales)', a: X.log2(10), tol: 0.002, e: `<p>H = H<sub>máx</sub> = log₂ 10 = ${n3(X.log2(10))} bit/símbolo.</p>` },
        { t: 'text', q: '¿Cuándo es máxima la entropía de una fuente y cuánto vale?', k: [['equiprobable', 'igual probabilidad', 'misma probabilidad', 'igualmente probables'], ['log', 'log2']], e: '<p>Es máxima cuando todos los símbolos son equiprobables, y vale H<sub>máx</sub> = log₂ N bits/símbolo (N = cantidad de símbolos).</p>' },
      ],
    },
    {
      id: 'tasa-informacion',
      module: 'u4',
      title: 'Tasa de información',
      keywords: 'tasa de información velocidad de información R bits por segundo duración promedio del símbolo tasa de símbolos r entropía fuente telegráfica',
      tldr: 'Dos fuentes con la misma entropía pueden ser una más rápida que otra. La <strong>tasa de información</strong> es la información por segundo: <mark>R = H/σ̄ = r·H</mark> [bit/s], donde σ̄ es la duración promedio de un símbolo y r = 1/T<sub>s</sub> los símbolos por segundo. R es máxima cuando los símbolos son equiprobables.',
      goals: ['Calcular la tasa de información con duraciones iguales y distintas.', 'Resolver los ejercicios 6 y 7 del TP 4.', 'Explicar qué pasa con R al cambiar las probabilidades.'],
      body: `
        ${eq(`R = ${frac('H', 'σ̄')} [bit/s] &nbsp;&nbsp; σ̄ = Σ P(x<sub>i</sub>)·σ<sub>i</sub> [s/símbolo]`, 'Tasa de información')}
        ${eq(`Si todos duran T<sub>s</sub>: r = ${frac('1', 'T<sub>s</sub>')} y R = r·H; equiprobables: R = ${frac('log₂ N', 'T<sub>s</sub>')}`, 'Duración constante')}
        <h3>Ejemplo 11: fuente telegráfica</h3>
        <p>Punto con P = 2/3 y duración 0,2 s; raya con P = 1/3 y 0,4 s. H = (2/3)log₂(3/2) + (1/3)log₂3 = 0,918 bit/símbolo. σ̄ = (2/3)·0,2 + (1/3)·0,4 = 0,267 s. R = 0,918/0,267 = <strong>3,44 bit/s</strong>.</p>
        <h3>Ejemplo 12</h3>
        <p>A, B, C, D con P = ½, ¼, ⅛, ⅛ a r = 1000 símbolos/s: R = 1000 × 1,75 = <strong>1750 bps</strong>. Si fueran equiprobables: 1000 × 2 = 2000 bps. <strong>La velocidad de información es máxima con símbolos equiprobables.</strong></p>
        ${lab(0)}
        ${note('No confundir R (bits de <em>información</em> por segundo) con la tasa binaria del canal (dígitos binarios por segundo). Si cada letra se manda con 2 pulsos de 1 ms, el canal lleva 1000 dígitos/s; pero si las letras no son equiprobables, cada dígito transporta menos de 1 bit de información.', 'warn')}`,
      labs: [
        { type: 'calc', title: 'Tasa de información', intro: 'Probabilidades separadas por coma y duración de cada símbolo.', fields: [{ id: 'p', label: 'Probabilidades', type: 'text', value: '0.5, 0.25, 0.125, 0.125' }, { id: 'ts', label: 'Duración de cada símbolo [ms]', value: 1 }],
          run: (v) => { const ps = String(v.p).split(',').map((x) => X.parseNum(x)).filter((x) => x > 0); const H = X.entropy(ps), tot = ps.reduce((a, b) => a + b, 0); return `${Math.abs(tot - 1) > 0.01 ? `⚠ Las probabilidades suman ${num(tot, 3)}\n` : ''}H = ${num(H, 4)} bit/símbolo (Hmáx = ${num(X.log2(ps.length), 4)})\nr = 1/Ts = ${num(1000 / v.ts, 2)} símbolos/s\nR = r·H = ${num((1000 / v.ts) * H, 2)} bit/s\nRedundancia = ${num((1 - H / X.log2(ps.length)) * 100, 2)} %`; } },
      ],
      exercises: [
        { title: 'Pulsos de cuatro niveles', official: '4.6', level: 1, prompt: '<p>Se transmiten pulsos de 1 ms que pueden tomar 1, 2, 3 o 4 V con probabilidades ½, ¼, ⅛, ⅛. Calcular R.</p>', solution: { explain: '<p>H = 0,5·1 + 0,25·2 + 0,125·3 + 0,125·3 = 1,75 bit/pulso. r = 1/1 ms = 1000 pulsos/s. R = r·H = <strong>1750 bit/s</strong>.</p>' } },
        { title: 'Alfabeto A E I U con dos pulsos por letra', official: '4.7', level: 2, prompt: '<p>Cada letra de A, E, I, U se codifica con dos pulsos binarios de 1 ms. a) R si son equiprobables. b) R con P<sub>A</sub> = 1/16, P<sub>E</sub> = 1/4, P<sub>I</sub> = 1/2, P<sub>U</sub> = 3/16. c) Redundancia. d) Conclusión.</p>',
          solution: { explain: `<p>Cada letra dura 2 ms → r = 500 letras/s.</p><p><b>a)</b> H = log₂4 = 2 bit/letra → R = 500 × 2 = <strong>1000 bit/s</strong>.</p><p><b>b)</b> H = (1/16)·4 + (1/4)·2 + (1/2)·1 + (3/16)·log₂(16/3) = 0,25 + 0,5 + 0,5 + 0,453 = <strong>${num(H7, 4)} bit/letra</strong> → R = 500 × ${num(H7, 4)} = <strong>${num(500 * H7, 1)} bit/s</strong>.</p><p><b>c)</b> R<sub>ed</sub> = (2 − ${num(H7, 3)})/2 = <strong>${num(((2 - H7) / 2) * 100, 2)} %</strong>: casi un 15 % de los dígitos transmitidos no lleva información nueva.</p><p><b>d)</b> El canal manda siempre 1000 dígitos binarios por segundo, pero la información real baja cuando las letras no son equiprobables. Codificando con longitudes variables (Huffman) se podría acercar la tasa del canal a la entropía.</p>` } },
      ],
      quiz: [
        { q: 'La tasa de información se mide en…', o: ['bit/símbolo', 'bit/s', 'baudios', 'Hz'], a: 1, e: 'R = H/σ̄.' },
        { q: 'Una fuente emite 2000 símbolos/s con H = 1,5 bit/símbolo. R vale…', o: ['1333 bit/s', '3000 bit/s', '2000 bit/s', '1,5 bit/s'], a: 1, e: 'R = r·H.' },
        { q: 'Con símbolos de distinta duración, R se calcula con…', o: ['la duración máxima', 'la duración promedio σ̄ = Σ P·σ', 'la mínima', 'no se puede'], a: 1, e: 'Ejemplo de la fuente telegráfica.' },
        { q: 'Para una velocidad de símbolos fija, R es máxima cuando…', o: ['un símbolo es muy probable', 'los símbolos son equiprobables', 'hay pocos símbolos', 'los símbolos duran más'], a: 1, e: 'Porque H es máxima.' },
        { q: 'Cuatro símbolos equiprobables de 1 ms dan…', o: ['1000 bit/s', '2000 bit/s', '4000 bit/s', '500 bit/s'], a: 1, e: 'log₂4/1 ms.' },
      ],
      open: [
        { t: 'num', q: 'Una fuente emite 8 símbolos equiprobables, cada uno de 0,5 ms. ¿Cuál es R en bit/s?', a: 6000, u: 'bit/s', e: '<p>H = log₂8 = 3; r = 1/0,5 ms = 2000 símb/s; R = 6000 bit/s.</p>' },
        { t: 'num', q: 'Punto (P = 2/3, 0,2 s) y raya (P = 1/3, 0,4 s). ¿R en bit/s? (2 decimales)', a: X.entropy([2 / 3, 1 / 3]) / ((2 / 3) * 0.2 + (1 / 3) * 0.4), tol: 0.01, u: 'bit/s', e: `<p>H = 0,918; σ̄ = 0,267 s; R = ${num(X.entropy([2 / 3, 1 / 3]) / ((2 / 3) * 0.2 + (1 / 3) * 0.4), 2)} bit/s (ejemplo 11 de la guía).</p>` },
        { t: 'text', q: 'Dos fuentes tienen la misma entropía. ¿Alcanza la entropía para compararlas? Explicá.', k: [['no'], ['velocidad', 'rapida', 'tasa', 'por segundo', 'duracion'], ['r·h', 'r*h', 'h/', 'tasa de informacion']], need: 2, e: '<p>No: la entropía dice cuánta información trae cada símbolo, pero no cuántos símbolos por segundo emite la fuente. Hay que comparar la tasa de información R = H/σ̄ = r·H en bit/s.</p>' },
      ],
    },
    {
      id: 'huffman',
      module: 'u4',
      title: 'Codificación de fuente y algoritmo de Huffman',
      keywords: 'codificación de la fuente codificador óptimo longitud promedio de la palabra código eficiencia teorema de codificación de la fuente código de prefijo instantáneo unívocamente decodificable Huffman árbol ASCII Morse compresión',
      tldr: 'El codificador de fuente busca usar el <strong>mínimo número de bits</strong>: códigos cortos para los símbolos frecuentes y largos para los raros (como Morse). La longitud promedio es <mark>L̄ = Σ P·L<sub>i</sub></mark> y el teorema de Shannon dice que <strong>L̄ ≥ H</strong>. La eficiencia es η = H/L̄. <strong>Huffman</strong> arma el código óptimo uniendo siempre las dos probabilidades menores.',
      goals: ['Calcular la longitud promedio y la eficiencia de un código.', 'Enunciar el teorema de codificación de la fuente.', 'Construir el árbol de Huffman y codificar un mensaje.', 'Comparar ASCII y Huffman en bits y tiempo (TP 4, ejercicio 8).'],
      body: `
        <h2>El codificador óptimo</h2>
        <p>El codificador de fuente transforma los símbolos en palabras binarias. Es óptimo si usa el mínimo número de bits: <strong>códigos cortos para mensajes frecuentes y largos para los poco frecuentes</strong>. Morse ya lo hacía: la “e”, la letra más usada en inglés, es un solo punto.</p>
        ${eq('L̄ = Σ P(x<sub>i</sub>)·L<sub>i</sub> [dígitos binarios/símbolo]', 'Longitud promedio de la palabra código')}
        ${eq(`L̄ ≥ H(x) &nbsp;&nbsp; η = ${frac('H(x)', 'L̄')}`, 'Teorema de codificación de la fuente y eficiencia')}
        <p>Ningún código unívocamente decodificable usa en promedio menos dígitos que la entropía: <strong>H es el límite de compresión</strong>. Ejemplo 14 de la guía: x₁ con P = ½ y x₂, x₃ con ¼ → H = 1,5; el código 0, 10, 11 tiene L̄ = 1,5: eficiencia 100 %. Con 2 bits fijos, L̄ = 2 y η = 75 %.</p>
        <p>Los buenos códigos son <strong>de prefijo</strong> (instantáneos): ninguna palabra es el comienzo de otra, así que “010001101011” se decodifica sin separadores.</p>
        <h2>El algoritmo de Huffman</h2>
        <ol>
          <li>Ordenar los símbolos de mayor a menor probabilidad.</li>
          <li>Sumar las dos probabilidades menores y reordenar la nueva columna de mayor a menor.</li>
          <li>Repetir hasta que quede una sola probabilidad (1).</li>
          <li>Recorrer el árbol desde la raíz asignando 0 y 1 en cada bifurcación: la palabra de cada símbolo es el camino hasta él.</li>
        </ol>
        <p>Ejemplo 16 de la guía (8 símbolos): el algoritmo da exactamente el código de la cátedra.</p>
        ${table(['Símbolo', 'P', 'I [bit]', 'Código'], e16.map((it) => [it.s, num(it.p, 2), num(X.info(it.p), 2), `<span class="mono">${h16.codes[it.s]}</span>`]))}
        <p>H = <strong>${num(h16.H, 2)}</strong> bit/símbolo, L̄ = <strong>${num(h16.L, 2)}</strong> dígitos/símbolo, η = ${num(h16.eta * 100, 1)} %. Con código fijo harían falta 3 bits (η = ${num((h16.H / 3) * 100, 1)} %).</p>
        ${lab(0)}
        ${note('Si hay empates, el árbol puede salir distinto y algunos códigos cambian, pero <strong>las longitudes y L̄ son las mismas</strong>: cualquier árbol de Huffman bien armado es válido en el parcial.', 'exam')}`,
      labs: [
        { type: 'huffman', title: 'Huffman paso a paso', intro: 'Arranca con el mensaje del TP 4. Probá el modo “Probabilidades” con el ejemplo 16 de la guía: x0=0.2, x1=0.01, x2=0.4, x3=0.04, x4=0.1, x5=0.02, x6=0.07, x7=0.16.', text: word, rate: '10' },
      ],
      exercises: [
        { title: 'TRES TRISTES TIGRES en ASCII y en Huffman', official: '4.8', level: 3, prompt: '<p>Se envía TRESTRISTESTIGRES con R = 10 bit/s y ASCII de 8 bits por letra. a) Cadena de bits. b) Árbol de Huffman. c) Cadena con Huffman. d) Longitud promedio en ASCII y en Huffman. e) Tiempo de cada transmisión. f) Conclusión.</p>',
          solution: { explain: `<p>17 letras: ${wf.map((it) => `${it.s} ×${it.n}`).join(', ')}.</p>
            <p><b>a)</b> ASCII: <span class="mono">${ascii8}</span> (17 × 8 = 136 bits).</p>
            <p><b>b)</b> Probabilidades: T y S 4/17, R y E 3/17, I 2/17, G 1/17. Se unen G + I = 3/17, luego R + E… El árbol completo está en el laboratorio.</p>
            ${table(['Letra', 'P', 'Código', 'L<sub>i</sub>'], [...wf].sort((a, b) => b.p - a.p).map((it) => [it.s, `${it.n}/17`, `<span class="mono">${whf.codes[it.s]}</span>`, whf.codes[it.s].length]))}
            <p><b>c)</b> <span class="mono">${huffBits.match(/.{1,8}/g).join(' ')}</span> (${huffBits.length} bits).</p>
            <p><b>d)</b> ASCII: L̄ = 8 bits/letra. Huffman: L̄ = ${huffBits.length}/17 = <strong>${num(whf.L, 3)}</strong> bits/letra (H = ${num(whf.H, 3)}, η = ${num(whf.eta * 100, 1)} %).</p>
            <p><b>e)</b> ASCII: 136/10 = <strong>13,6 s</strong>. Huffman: ${huffBits.length}/10 = <strong>${num(huffBits.length / 10, 1)} s</strong>.</p>
            <p><b>f)</b> Huffman manda el mismo mensaje con un ${num((1 - huffBits.length / 136) * 100, 0)} % menos de bits porque aprovecha que las letras no son equiprobables y casi alcanza el límite de la entropía. Contra: el receptor necesita la tabla de códigos, y un error de un bit desincroniza la decodificación de las palabras siguientes.</p>` } },
      ],
      quiz: [
        { q: 'El teorema de codificación de la fuente dice que…', o: ['L̄ ≤ H', 'L̄ ≥ H', 'L̄ = 2H', 'H ≥ log₂N'], a: 1, e: 'La entropía es el límite inferior de la longitud promedio.' },
        { q: 'En Huffman, en cada paso se combinan…', o: ['las dos probabilidades mayores', 'las dos probabilidades menores', 'la mayor y la menor', 'todas'], a: 1, e: 'Y se reordena.' },
        { q: 'Un código de prefijo es aquel en que…', o: ['todas las palabras tienen la misma longitud', 'ninguna palabra es el comienzo de otra', 'empieza con 0', 'usa paridad'], a: 1, e: 'Se decodifica sin separadores.' },
        { q: 'H = 2,38 y L̄ = 2,44. La eficiencia es…', o: ['102,5 %', '97,5 %', '2,4 %', '50 %'], a: 1, e: 'η = H/L̄.' },
        { q: 'Un codificador óptimo asigna a los símbolos más probables…', o: ['palabras más largas', 'palabras más cortas', 'la misma longitud', 'bits de paridad'], a: 1, e: 'Como Morse.' },
        { q: 'Si dos árboles de Huffman del mismo mensaje dan códigos distintos…', o: ['uno está mal', 'puede ser por desempates; L̄ es la misma', 'hay que usar el más largo', 'no son de prefijo'], a: 1, e: 'Las longitudes coinciden.' },
      ],
      open: [
        { t: 'num', q: 'Código con L = 1, 2, 3, 3 para P = 0,5; 0,25; 0,125; 0,125. ¿Longitud promedio?', a: 1.75, e: '<p>L̄ = 0,5·1 + 0,25·2 + 0,125·3 + 0,125·3 = 1,75 dígitos/símbolo (= H: eficiencia 100 %).</p>' },
        { t: 'num', q: 'Una fuente tiene H = 2,1 bit/símbolo y su código L̄ = 2,4. ¿Eficiencia en %?', a: 87.5, u: '%', e: '<p>η = 2,1/2,4 = 0,875 = 87,5 %.</p>' },
        { t: 'num', q: 'Un mensaje de 50 caracteres se manda en ASCII de 8 bits a 100 bit/s. ¿Cuántos segundos tarda?', a: 4, u: 's', e: '<p>50 × 8 = 400 bits; 400/100 = 4 s.</p>' },
        { t: 'text', q: 'Describí el algoritmo de Huffman.', k: [['orden', 'mayor a menor'], ['menor', 'dos ultimas', 'dos menores'], ['suma', 'combina', 'une'], ['0', '1', 'arbol', 'rama']], need: 3, e: '<p>Se ordenan los símbolos de mayor a menor probabilidad; se suman las dos probabilidades menores y se reordena; se repite hasta llegar a 1. Luego se recorre el árbol asignando 0 y 1 en cada bifurcación: el camino hasta cada símbolo es su palabra código (más corta cuanto más probable).</p>' },
      ],
      sources: [{ title: 'Huffman en la guía de la cátedra', ref: 'Guía Unidad 4, ejemplo 16', points: ['Tabla con columnas de probabilidades reordenadas en cada paso.', 'Los bits se leen recorriendo el árbol hasta el símbolo original.'] }],
    },
  );
})();
