/* Unidad 6 (2do parcial): errores en la transmisión de datos. Guía "Unidad 6 Errores en la transmisión de datos 2026" y apuntes 6.1 a 6.6.
   TP 6: paridad, CRC con G(x) = x⁵ + x⁴ + x + 1, BER, distancia de Hamming y código de Hamming (disposición de la cátedra: posiciones de derecha a izquierda, paridad par).
   CRC y Hamming se calculan con cx.js, verificado contra los ejemplos de la guía (tests/cx.test.js). */
(() => {
  const { LESSONS, h, cx: X } = window.GUIDE;
  const { note, def, table, eq, lab, num } = h;
  const mono = (s) => `<span class="mono">${s}</span>`;

  const G = '110011';
  const m87 = X.bcd(87), c87 = X.crc(m87, G), rx2 = X.crcCheck('111001011011', G);
  const divHtml = (c, dividend) => {
    const r = G.length - 1, lines = [dividend];
    c.steps.forEach((s, k) => { const pad = ' '.repeat(s.at); if (k) lines.push(pad + s.top); lines.push(`${pad}${s.gen}`); lines.push(pad + '─'.repeat(r + 1)); });
    lines.push(`${' '.repeat(dividend.length - r)}${c.rem}  ← resto`);
    return `<div class="divlong">${lines.join('\n')}</div>`;
  };
  const coma = [...'COMA'].map(X.ascii7), cama = [...'CAMA'].map(X.ascii7);
  const C6 = ['0000', '1110', '1001', '0111'];
  const d7 = X.hammingDecode('10001100100');
  const ham = X.hammingEncode('1001101');
  const posRow = (N) => Array.from({ length: N }, (_, j) => N - j);

  LESSONS.push(
    {
      id: 'errores-ber',
      module: 'u6',
      title: 'Control de errores y tasa de error BER',
      keywords: 'control de errores detección corrección errores aislados agrupados ráfagas BER bit error rate tasa de errores típica telefonía LAN fibra ASCII EBCDIC',
      tldr: 'Atenuación, distorsión y ruido producen errores. El <strong>control de errores</strong> tiene dos partes: <mark>detectar</mark> (saber que hubo error, sin saber dónde) y <mark>corregir</mark>. Los errores pueden ser aislados, agrupados o en <strong>ráfagas</strong>. La <strong>BER</strong> = bits erróneos / bits totales: telefonía ~10⁻⁶, LAN de cobre 10⁻⁸ a 10⁻⁹, fibra hasta 10⁻¹¹.',
      goals: ['Definir detección y corrección de errores.', 'Clasificar los errores según su distribución en el tiempo.', 'Calcular la BER y compararla con los valores típicos (TP 6, ejercicios 3 y 4).', 'Conocer los códigos ASCII y EBCDIC.'],
      body: `
        <h2>Detección y corrección</h2>
        ${def('Detección de errores', 'Proceso de monitorear la información recibida y determinar cuándo ha ocurrido un error de transmisión. No identifica qué bit es erróneo: solo indica que hubo un error.', 'Guía de la Unidad 6')}
        <p>Ante un error detectado se puede <strong>no tomarlo en cuenta</strong> (si el uso de los datos lo tolera: abarata y acelera) o <strong>corregirlo</strong>, agregando <strong>redundancia</strong>: bits que no llevan información. Más redundancia protege más pero baja la eficiencia. Con bloques chicos se retransmite poco pero hay mucho overhead; con bloques grandes más bloques salen con error y hay que retransmitirlos.</p>
        <h2>Tipos de errores</h2>
        ${table(['Tipo', 'Descripción'], [['<strong>Aislados (simples)</strong>', 'Afectan a un solo bit cada vez; independientes entre sí'], ['<strong>Agrupados</strong>', 'Ocurren en tandas de cierta duración, sin afectar necesariamente bits seguidos'], ['<strong>En ráfagas</strong>', 'Afectan a varios bits consecutivos en períodos indeterminados']])}
        <p>Un ruido impulsivo de 0,5 s destruye 600 × 0,5 = 300 bits a 600 bps, pero 1200 Mbps × 0,5 = 600 Mbits a 1200 Mbps: <strong>a mayor velocidad, más bits afectados por la misma ráfaga</strong>.</p>
        <h2>BER</h2>
        ${eq('BER = bits erróneos recibidos / total de bits recibidos', 'Tasa de error de bit')}
        <p>Ejemplo 1: 20 bits erróneos en 2 Mbit → BER = 20/(2·10⁶) = <strong>10⁻⁵</strong>. Se mide enviando un patrón conocido durante un tiempo (o sesión) y contando los bits que llegan distintos, con un medidor de BER.</p>
        ${table(['Calidad del sistema', 'BER'], [['Muy bueno', '10⁻⁹ a 10⁻¹⁰'], ['Bueno', '10⁻⁶'], ['Degradado', '10⁻³ a 10⁻⁶'], ['Dañado', '&gt; 10⁻³']])}
        ${table(['Medio', 'BER típica'], [['Red telefónica actual', '10⁻⁶'], ['LAN (par trenzado)', '10⁻⁸ a 10⁻⁹'], ['Fibra óptica', 'hasta 10⁻¹¹'], ['Línea digital ATM 155–622 Mbps', '10⁻⁸ a 10⁻⁹']])}
        <h2>Códigos de caracteres</h2>
        <ul><li><strong>ASCII</strong>: 7 bits, 128 combinaciones (b0 el menos significativo, b6 el más); el octavo bit (b7) queda libre para la <strong>paridad</strong>.</li>
        <li><strong>EBCDIC</strong>: 8 bits, 256 caracteres; nació con el IBM System/360 y se usa en mainframes de IBM.</li></ul>
        ${lab(0)}`,
      labs: [
        { type: 'calc', title: 'BER y calidad del enlace', fields: [{ id: 'e', label: 'Bits erróneos', value: 30 }, { id: 'n', label: 'Bits totales', value: 300000 }],
          run: (v) => { const b = v.e / v.n; const q = b > 1e-3 ? 'dañado' : b > 1e-6 ? 'degradado' : b > 1e-9 ? 'bueno' : 'muy bueno'; return `BER = ${num(v.e)} / ${num(v.n)} = ${b.toExponential(2)}\nCalidad: sistema ${q}\nUna LAN Ethernet debería estar entre 1e-8 y 1e-9`; } },
      ],
      exercises: [
        { title: 'Qué es la BER', official: '6.3', level: 1, prompt: '<p>Indicar qué es el BER, cómo se mide y las tasas típicas de las redes de telefonía y LAN.</p>', solution: { explain: '<p>La BER (Bit Error Rate) relaciona los bits recibidos con error con el total de bits transmitidos en un tiempo o sesión. Se mide transmitiendo una secuencia conocida y contando los bits que llegan distintos (medidor de tasa de error). Valores típicos: telefonía ~10⁻⁶; LAN de cobre 10⁻⁸ a 10⁻⁹ (fibra hasta 10⁻¹¹).</p>' } },
        { title: 'BER de una LAN Ethernet', official: '6.4', level: 1, prompt: '<p>En una LAN Ethernet se reciben 30 bits erróneos en 300 000. Calcular la BER y evaluar la red.</p>', solution: { explain: '<p>BER = 30/300 000 = <strong>10⁻⁴</strong>. Una LAN debería tener 10⁻⁸ a 10⁻⁹: esta red está entre 10 000 y 100 000 veces peor de lo esperado. Según la escala de la cátedra es un sistema <strong>degradado</strong> (10⁻³ a 10⁻⁶), cerca de dañado: revisar cableado, conectores, interferencias o equipos.</p>' } },
      ],
      quiz: [
        { q: 'La detección de errores…', o: ['indica qué bit está mal', 'indica que hubo un error, sin saber cuál bit', 'corrige el error', 'evita que ocurran'], a: 1, e: 'Para saber cuál hace falta corrección.' },
        { q: '20 bits erróneos en 2 Mbit dan una BER de…', o: ['10⁻⁴', '10⁻⁵', '10⁻⁶', '2·10⁻⁵'], a: 1, e: '20/2·10⁶.' },
        { q: 'BER típica de una LAN de par trenzado:', o: ['10⁻³', '10⁻⁶', '10⁻⁸ a 10⁻⁹', '10⁻¹⁵'], a: 2, e: 'Telefonía ~10⁻⁶.' },
        { q: 'Un error que afecta varios bits consecutivos es…', o: ['aislado', 'en ráfaga', 'agrupado', 'de paridad'], a: 1, e: 'Típico del ruido impulsivo.' },
        { q: 'ASCII usa…', o: ['5 bits', '7 bits (más uno de paridad)', '8 bits sin paridad', '16 bits'], a: 1, e: '128 combinaciones.' },
        { q: 'Una misma ráfaga de ruido afecta más bits cuanto…', o: ['menor la velocidad', 'mayor la velocidad de transmisión', 'más largo el cable', 'menor la frecuencia'], a: 1, e: 'Bits perdidos = R × duración.' },
      ],
      open: [
        { t: 'num', q: 'Se reciben 5 bits erróneos en 50 Mbit. ¿BER? (escribila como 1e-7, 10^-7, etc.)', a: 1e-7, e: '<p>5/(50·10⁶) = 10⁻⁷.</p>' },
        { t: 'num', q: 'Un ruido impulsivo dura 2 ms en un enlace de 100 Mbps. ¿Cuántos bits afecta?', a: 200000, u: 'bit', e: '<p>100·10⁶ × 0,002 = 200 000 bits.</p>' },
        { t: 'text', q: '¿Cuál es la diferencia entre detectar y corregir un error?', k: [['detect'], ['corregir', 'correccion'], ['cual bit', 'que bit', 'posicion', 'ubicar', 'donde']], e: '<p>Detectar es saber que hubo un error en lo recibido, sin saber qué bit lo tiene. Corregir es recuperar el dato correcto: ya sea pidiendo la retransmisión (ARQ) o ubicando y arreglando el bit erróneo en el receptor (FEC).</p>' },
      ],
    },
    {
      id: 'paridad',
      module: 'u6',
      title: 'Redundancia, cuenta exacta y paridad VRC/LRC',
      keywords: 'redundancia repetición cuenta exacta paridad par impar VRC LRC BCC block check character paridad bidimensional detección corrección matriz',
      tldr: 'Para detectar errores no hay que usar todas las combinaciones del código: un error debe convertir una palabra válida en una <strong>inválida</strong>. Métodos simples: repetición, cuenta exacta y <mark>paridad</mark> (un bit que deja par o impar la cantidad de unos). <strong>VRC</strong> pone paridad por carácter, <strong>LRC</strong> por columna (un carácter BCC al final del bloque); juntos ubican y <strong>corrigen</strong> un error simple.',
      goals: ['Explicar por qué la redundancia permite detectar errores.', 'Calcular el bit de paridad par o impar.', 'Armar y verificar VRC, LRC y la matriz VRC/LRC.', 'Saber qué errores escapan a cada método (TP 6, ejercicio 1).'],
      body: `
        <h2>La idea de la redundancia</h2>
        <p>Si un código de N bits usa las 2ᴺ combinaciones, un error transforma una palabra en otra que <strong>también</strong> es válida: imposible detectarlo. BCD usa solo 10 de las 16 combinaciones de 4 bits: si se envía 0011 y llega 1011, se detecta (no existe en BCD); pero si llega 0010 (el “2”), pasa inadvertido.</p>
        ${note('Condición necesaria y suficiente para detectar un error en un bit: que toda palabra del código, al cambiar cualquiera de sus bits, se transforme en una combinación que <strong>no pertenezca al código</strong>.', 'exam')}
        ${table(['Método', 'Cómo funciona', 'Limitación'], [
          ['<strong>Repetición</strong>', 'Enviar cada símbolo n veces; si no coinciden, gana el más repetido', 'Multiplica el tiempo de transmisión'],
          ['<strong>Cuenta exacta</strong>', 'Toda palabra tiene un número fijo de unos (por ejemplo 3)', 'No detecta un 1→0 y un 0→1 en la misma palabra'],
          ['<strong>Paridad</strong>', 'Un bit extra hace par (paridad par) o impar el total de unos', 'No detecta errores dobles (en número par)'],
        ])}
        <h2>VRC: paridad por carácter</h2>
        <p>Se agrega un bit de paridad a los 7 bits de cada carácter ASCII. Ejemplo: “A” = 1000001 tiene dos unos → con paridad par se agrega 0. El receptor cuenta los unos de cada carácter: si no cumplen la paridad, hubo error. Mejora una línea con BER 10⁻⁵ a ~10⁻⁷, pero <strong>no detecta la doble inversión</strong>.</p>
        <h2>LRC: paridad por columna</h2>
        <p>Se calcula la paridad de cada <strong>posición</strong> de bit a lo largo del bloque de caracteres y se envía al final un carácter de control, el <strong>BCC</strong> (Block Check Character). Detecta históricamente entre el 75 y el 98 % de los errores; falla, por ejemplo, con un error en b2 en dos caracteres distintos.</p>
        <h2>VRC/LRC: paridad bidimensional</h2>
        <p>Con las dos a la vez, un error simple marca <strong>una fila</strong> (VRC) y <strong>una columna</strong> (LRC): el cruce es el bit erróneo y se puede corregir. Solo pasan inadvertidos errores en número par de bits en iguales posiciones de un número par de caracteres (cuatro esquinas de un rectángulo).</p>
        ${lab(0)}`,
      labs: [{ type: 'parity', title: 'Matriz VRC/LRC', intro: 'Tocá un bit para simular un error. Probá uno, dos en la misma fila y cuatro formando un rectángulo.', word: 'REDES' }],
      exercises: [
        { title: 'Bloque ASCII con paridad par', official: '6.1', level: 2, prompt: '<p>Se recibe un bloque de 7 caracteres ASCII de 7 bits con paridad PAR (imagen del TP). a) ¿Hubo errores? b) ¿Se pueden corregir con este método? c) ¿Pudo haber más errores? d) Identificar la palabra transmitida.</p><p class="muted-s">El bloque está en una imagen que no viene en el texto. El procedimiento:</p>',
          solution: { explain: '<ol><li>Para cada carácter (fila) contá los unos incluyendo el bit de paridad: si da impar, ese carácter tiene error (VRC).</li><li>Si el bloque trae el carácter LRC/BCC, contá los unos de cada columna: la columna impar marca la posición.</li><li><b>b)</b> Con VRC solo: se detecta pero no se corrige. Con VRC + LRC y un único error, el cruce fila-columna ubica el bit y se corrige invirtiéndolo.</li><li><b>c)</b> Sí: errores dobles en un mismo carácter mantienen la paridad y pasan inadvertidos; la paridad nunca garantiza que no hubo más errores.</li><li><b>d)</b> Pasá cada fila de 7 bits a decimal y buscá el carácter en la tabla ASCII (A = 65 = 1000001, a = 97 = 1100001).</li></ol><p>Practicá con la matriz del laboratorio: escribí la palabra, introducí errores y aplicá los pasos.</p>' } },
      ],
      quiz: [
        { q: 'El bit de paridad par de 1011001 es…', o: ['0', '1', 'depende del bit de stop', 'no se puede calcular'], a: 0, e: 'Tiene cuatro unos: ya es par.' },
        { q: 'La paridad simple NO detecta…', o: ['un error en un bit', 'dos errores en el mismo carácter', 'un error en el bit de paridad', 'tres errores'], a: 1, e: 'La paridad se mantiene.' },
        { q: 'El BCC es…', o: ['un bit de paridad por carácter', 'el carácter de paridad longitudinal al final del bloque', 'un polinomio CRC', 'un código de Hamming'], a: 1, e: 'Block Check Character (LRC).' },
        { q: 'Con VRC + LRC y un solo error…', o: ['solo se detecta', 'se ubica fila y columna y se corrige', 'no se detecta', 'se pide retransmisión obligatoria'], a: 1, e: 'Paridad bidimensional.' },
        { q: 'Un código que usa todas las combinaciones de sus N bits…', o: ['detecta todos los errores', 'no puede detectar errores', 'corrige un error', 'tiene distancia 3'], a: 1, e: 'Todo error da otra palabra válida.' },
      ],
      open: [
        { t: 'bits', q: 'Agregá el bit de paridad IMPAR al final de 1100101 y escribí los 8 bits.', a: '11001011', e: '<p>1100101 tiene cuatro unos (par): para que el total sea impar se agrega 1 → 11001011.</p>' },
        { t: 'bits', q: 'Escribí la letra “C” en ASCII de 7 bits con su bit de paridad par al final (8 bits).', a: '10000111', e: '<p>C = 67 = 1000011 (tres unos) → paridad par: 1 → 10000111.</p>' },
        { t: 'text', q: '¿Por qué la combinación VRC/LRC puede corregir un error simple y VRC sola no?', k: [['fila', 'caracter'], ['columna', 'posicion'], ['cruce', 'interseccion', 'ubica', 'coordenada']], e: '<p>VRC sola indica qué carácter (fila) tiene error, pero no qué bit. Con LRC además se sabe qué columna (posición) falla: el cruce de la fila y la columna ubica el bit erróneo, que se corrige invirtiéndolo.</p>' },
      ],
    },
    {
      id: 'crc',
      module: 'u6',
      title: 'Código de redundancia cíclica (CRC)',
      keywords: 'CRC código de redundancia cíclica polinomio generador G(x) módulo 2 XOR división resto R(x) T(x) CRC-16 CRC-CCITT CRC-12 ráfagas detección',
      tldr: 'El CRC trata los bits como coeficientes de un polinomio. Se agregan <strong>r ceros</strong> al mensaje (r = grado de G(x)), se divide en <mark>módulo 2</mark> (XOR, sin acarreos) por el generador G(x) y el <strong>resto R(x)</strong> reemplaza esos ceros: T(x) = xʳ·M(x) + R(x). El receptor divide lo recibido por G(x): <strong>resto cero, sin error</strong>.',
      goals: ['Escribir un mensaje como polinomio.', 'Calcular el CRC por división módulo 2.', 'Verificar una trama recibida (TP 6, ejercicio 2).', 'Conocer los polinomios estándar y qué errores detectan.'],
      body: `
        <p>La paridad es simple pero limitada; en transmisión sincrónica de bloques grandes hacen falta métodos más seguros (los errores vienen en ráfagas) y eficientes (pocos bits de control). El CRC usa aritmética <strong>módulo 2</strong>: sumar y restar son lo mismo, un <strong>XOR</strong> bit a bit (0 ± 0 = 0, 1 ± 1 = 0, 1 ± 0 = 1).</p>
        <h2>Procedimiento</h2>
        <ol>
          <li>Mensaje → polinomio M(x) de grado n: 10110111 = x⁷ + x⁵ + x⁴ + x² + x + 1.</li>
          <li>Generador G(x) de grado r: 110011 = x⁵ + x⁴ + x + 1 (r = 5).</li>
          <li>P(x) = xʳ·M(x): agregar r ceros → 1011011100000.</li>
          <li>Dividir P(x) por G(x) en módulo 2 y quedarse con el resto R(x) (r bits).</li>
          <li>T(x) = P(x) + R(x): los r ceros se reemplazan por el resto. Se transmite T(x).</li>
          <li>Se recibe T′(x) = T(x) + E(x) (E = errores del canal). El receptor divide T′(x) por G(x): <strong>R = 0, no hay error</strong>; R ≠ 0, hay error.</li>
        </ol>
        ${divHtml(X.crc('10110111', G), X.crc('10110111', G).padded)}
        <p>Ejemplo de la guía: R(x) = 1001 (con 5 bits: 01001) y T(x) = <strong>${mono(X.crc('10110111', G).tx)}</strong>. Al dividir T(x) por G(x) el resto da 00000.</p>
        ${note('Errores típicos: agregar tantos ceros como bits tiene G (son <strong>r = bits de G − 1</strong>); restar con préstamo en vez de XOR; olvidarse de que cuando el primer bit es 0 se “baja” un bit sin restar.', 'warn')}
        ${lab(0)}
        <h2>Polinomios estándar</h2>
        ${table(['Nombre', 'G(x)'], [['CRC-12', 'x¹² + x¹¹ + x³ + x² + x + 1'], ['CRC-16', 'x¹⁶ + x¹⁵ + x² + 1'], ['CRC-CCITT', 'x¹⁶ + x¹² + x⁵ + 1 (HDLC)']])}
        <p>Con 16 bits detectan el <strong>100 %</strong> de los errores simples, dobles, en número impar de bits y en ráfagas de hasta 16 bits; el 99,997 % de las ráfagas de 17 bits y el 99,998 % de las de 18 o más.</p>`,
      labs: [{ type: 'crc', title: 'CRC paso a paso', intro: 'Arranca con el ejemplo de la guía. Cambiá el mensaje por 10000111 (87 en BCD, TP 6) y después simulá un error.', msg: '10110111', gen: G }],
      exercises: [
        { title: '87 en BCD con CRC', official: '6.2', level: 2, prompt: '<p>Enviar 87 en BCD con CRC y G(x) = x⁵ + x⁴ + x¹ + x⁰. a) Determinar la información a enviar (procedimiento). b) Con el mismo generador, ¿la cadena recibida 111001011011 contiene error?</p>',
          solution: { explain: `<p><b>a)</b> 87 en BCD: 8 = 1000, 7 = 0111 → M = ${mono(m87)}. G = ${mono(G)} (grado 5): se agregan 5 ceros → ${mono(c87.padded)}.</p>${divHtml(c87, c87.padded)}<p>Resto R = ${mono(c87.rem)}. Información a enviar: T = ${mono(c87.tx)}.</p>
            <p><b>b)</b> Se divide la cadena recibida por G:</p>${divHtml(rx2, '111001011011')}<p>El resto es ${mono(rx2.rem)}: <strong>no se detecta error</strong>, la cadena es divisible por G(x). Los datos serían ${mono('1110010')} (la cadena sin los 5 bits de CRC). Ojo: resto cero significa que no se detectó error, no que sea imposible que lo haya (podría ser un patrón múltiplo de G).</p>` } },
      ],
      quiz: [
        { q: 'Si G(x) = x⁴ + x + 1, ¿cuántos ceros se agregan al mensaje?', o: ['3', '4', '5', 'ninguno'], a: 1, e: 'r = grado de G = 4 (G tiene 5 bits).' },
        { q: 'La resta en módulo 2 equivale a…', o: ['AND', 'OR', 'XOR', 'NOT'], a: 2, e: 'Sin acarreo ni préstamo.' },
        { q: 'El receptor detecta error si…', o: ['el resto es cero', 'el resto es distinto de cero', 'el cociente es cero', 'la paridad es par'], a: 1, e: 'T(x) es divisible por G(x).' },
        { q: '10110111 como polinomio es…', o: ['x⁷ + x⁵ + x⁴ + x² + x + 1', 'x⁸ + x⁶ + x⁵ + x³ + x²', 'x⁷ + x⁶ + x⁴ + x³ + x', '7 + 5 + 4 + 2 + 1'], a: 0, e: 'Cada 1 es un término.' },
        { q: 'Un CRC de 16 bits detecta…', o: ['solo errores simples', 'todas las ráfagas de hasta 16 bits', 'ninguna ráfaga', 'solo errores pares'], a: 1, e: 'Y casi todas las más largas.' },
        { q: 'T(x) se forma…', o: ['dividiendo M por G', 'reemplazando los r ceros agregados por el resto', 'sumando G al mensaje', 'agregando un bit de paridad'], a: 1, e: 'T(x) = xʳM(x) + R(x).' },
      ],
      open: [
        { t: 'bits', q: 'Calculá el resto CRC (4 bits) del mensaje 1101 con G = 10011.', a: X.crc('1101', '10011').rem, e: `<p>Se agregan 4 ceros: 11010000. Dividiendo por 10011 en módulo 2 queda R = ${X.crc('1101', '10011').rem}; T = ${X.crc('1101', '10011').tx}.</p>` },
        { t: 'bits', q: 'Mensaje 101011 y G = 1011. Escribí la trama completa a transmitir T(x).', a: X.crc('101011', '1011').tx, e: `<p>xʳM = 101011000; resto = ${X.crc('101011', '1011').rem}; T = ${X.crc('101011', '1011').tx}.</p>` },
        { t: 'text', q: 'Explicá cómo el receptor verifica una trama con CRC.', k: [['divide', 'division'], ['generador', 'g(x)', 'polinomio'], ['resto'], ['cero', '0']], e: '<p>Divide la trama recibida completa (datos + CRC) por el mismo polinomio generador G(x) en módulo 2. Si el resto es cero, no se detecta error y se acepta; si es distinto de cero, hubo error y se descarta (o se pide retransmisión).</p>' },
      ],
    },
    {
      id: 'arq-fec',
      module: 'u6',
      title: 'Corrección de errores: ARQ y FEC',
      keywords: 'ARQ automatic repeat request parada y espera stop and wait ACK NAK time-out transmisión continua go-back-N ir N atrás retransmisión selectiva ventana FEC forward error correction códigos de bloque Reed-Solomon LDPC convolucionales',
      tldr: 'Detectado un error, se corrige <strong>hacia atrás</strong> con <mark>ARQ</mark> (el receptor pide repetir: parada y espera, ir N atrás o retransmisión selectiva) o <strong>hacia adelante</strong> con <mark>FEC</mark> (el receptor corrige solo gracias a la redundancia: Hamming, Reed-Solomon, convolucionales). FEC no necesita canal de retorno: sirve para tiempo real y difusión.',
      goals: ['Comparar parada y espera, ir N atrás y retransmisión selectiva.', 'Explicar FEC, sus ventajas y desventajas, y sus tipos de códigos.', 'Elegir ARQ o FEC según la aplicación.'],
      body: `
        <h2>ARQ: corrección hacia atrás</h2>
        <p>Usa solo detección (paridad o CRC): cuando el receptor encuentra un error, pide al transmisor que repita el bloque, tantas veces como haga falta. Tecnología sencilla y poca memoria.</p>
        ${table(['Variante', 'Funcionamiento', 'Ventajas y desventajas'], [
          ['<strong>Parada y espera</strong>', 'Envía una trama y espera el ACK. Sin ACK antes del time-out, o con NACK, reenvía la misma', 'Muy simple; el canal pasa mucho tiempo ocioso'],
          ['<strong>Ir N atrás</strong> (go-back-N)', 'Envía hasta W tramas numeradas sin confirmar (ventana). Un ACK de N confirma todas las anteriores; un NAK de N obliga a repetir desde N en adelante', 'Receptor simple (descarta lo que llega fuera de orden); reenvía tramas que habían llegado bien'],
          ['<strong>Retransmisión selectiva</strong>', 'El receptor guarda las tramas fuera de orden y pide (NAK) solo la dañada o faltante', 'La más eficiente en el uso del medio; requiere buffers y lógica para reordenar'],
        ])}
        ${lab(0)}
        <h2>FEC: corrección hacia adelante</h2>
        <p>Usa códigos <strong>autocorrectores</strong>: se agrega suficiente redundancia para que el receptor ubique y corrija los errores sin retransmisión.</p>
        ${table(['Ventajas', 'Desventajas'], [['No necesita canal de retorno: sirve para muchos destinos a la vez (difusión) y para tiempo real; ahorra el ancho de banda de las retransmisiones', 'Envía muchos más bits de redundancia; si hay demasiados errores, igual hay que retransmitir']])}
        ${table(['Familia', 'Ejemplos'], [['<strong>Códigos de bloque</strong>: bloques de tamaño fijo + bits redundantes', 'Hamming (corrige 1 bit, detecta 2), Reed-Solomon (ráfagas: CD, DVD, QR), LDPC (bloques grandes en canales muy ruidosos: WiFi, 5G)'], ['<strong>Convolucionales</strong>: flujo de longitud arbitraria; la paridad se genera con una ventana deslizante', 'Código convolucional binario (telefonía móvil, satélite)']])}
        ${note('Criterio de elección: con canal de retorno y tolerancia al retardo (transferencia de archivos, banca) → ARQ. Sin canal de retorno, con difusión o tiempo real (TV satelital, sondas espaciales, audio en vivo) → FEC.', 'exam')}`,
      labs: [{ type: 'arq', title: '¿Qué se retransmite cuando se pierde una trama?', intro: 'Compará los tres protocolos con la misma trama perdida y la misma ventana.', proto: 'gbn' }],
      quiz: [
        { q: 'En parada y espera, si vence el temporizador sin ACK…', o: ['se envía la trama siguiente', 'se reenvía la misma trama', 'se corta la comunicación', 'se envía un NAK'], a: 1, e: 'Interpreta que no llegó.' },
        { q: 'En ir N atrás, si se pierde la trama 3 de 0 a 6…', o: ['se reenvía solo la 3', 'se reenvían de la 3 en adelante', 'se reenvían todas', 'no se reenvía nada'], a: 1, e: 'El receptor descarta lo que llega fuera de orden.' },
        { q: 'La retransmisión selectiva, frente a ir N atrás…', o: ['es más simple en el receptor', 'usa mejor el canal pero necesita buffers', 'no numera las tramas', 'no usa NAK'], a: 1, e: 'Reenvía solo lo dañado.' },
        { q: 'FEC es especialmente útil cuando…', o: ['hay canal de retorno rápido', 'no hay canal de retorno o es tiempo real', 'los errores son raros', 'se usa paridad simple'], a: 1, e: 'Difusión, satélite, sondas.' },
        { q: '¿Qué código corrige ráfagas y se usa en CD y códigos QR?', o: ['Hamming', 'Reed-Solomon', 'paridad', 'Manchester'], a: 1, e: 'Código de bloque para ráfagas.' },
        { q: 'ARQ es corrección…', o: ['hacia adelante', 'hacia atrás (retransmisión)', 'por paridad bidimensional', 'por convolución'], a: 1, e: 'Automatic Repeat reQuest.' },
      ],
      open: [
        { t: 'text', q: 'Compará ARQ y FEC: cómo corrige cada uno y cuándo conviene.', k: [['retransmi', 'repet', 'pide'], ['redundancia', 'receptor corrige', 'autocorrect', 'sin retransmision'], ['canal de retorno', 'retorno', 'tiempo real', 'difusion', 'broadcast', 'satelit']], e: '<p>ARQ detecta el error y pide la retransmisión (corrección hacia atrás): simple, necesita canal de retorno y tolera retardo. FEC envía redundancia suficiente para que el receptor corrija solo (hacia adelante): no necesita canal de retorno, sirve para tiempo real y difusión, a costa de más bits.</p>' },
        { t: 'num', q: 'Go-back-N con ventana 4: se envían las tramas 0 a 7 y se pierde la 2. ¿Cuántas transmisiones en total? (las que salieron antes del aviso son 0 a 5)', a: 12, u: 'envíos', e: '<p>Salen 0, 1, 2 (perdida), 3, 4, 5 = 6 envíos; luego se repite desde la 2 hasta la 7 = 6 envíos. Total 12 (4 retransmisiones de tramas que habían llegado bien más la perdida). Comprobalo en el laboratorio.</p>' },
      ],
    },
    {
      id: 'hamming',
      module: 'u6',
      title: 'Distancia de Hamming y código de Hamming',
      keywords: 'distancia de Hamming distancia mínima detectar D = H - 1 corregir C = (H-1)/2 código de Hamming bits de paridad 2^p ≥ n + p + 1 posiciones potencia de 2 síndrome FEC',
      tldr: 'La <strong>distancia de Hamming</strong> entre dos palabras es la cantidad de bits en que difieren. Con distancia mínima H, un código <mark>detecta H − 1 errores y corrige (H − 1)/2</mark>. El <strong>código de Hamming</strong> agrega p bits de paridad en las posiciones 1, 2, 4, 8… con 2ᵖ ≥ n + p + 1; al recibir, los controles forman el <strong>síndrome</strong>: el número de la posición errónea.',
      goals: ['Calcular distancias y la distancia mínima de un código.', 'Deducir cuántos errores detecta y corrige un código.', 'Codificar con Hamming en la disposición de la cátedra.', 'Decodificar, ubicar y corregir un error (TP 6, ejercicios 5 a 8).'],
      body: `
        <h2>Distancia de Hamming</h2>
        ${def('Distancia de Hamming', 'Número de bits que tienen que cambiarse para transformar una palabra de código válida en otra palabra válida.', 'Guía de la Unidad 6')}
        <p>Ejemplos de la guía: d(1011101, 1001001) = 2; d(2143896, 2233796) = 3; d(“tener”, “reses”) = 3. La <strong>distancia mínima</strong> de un código es la menor entre todos sus pares: {100, 111, 011} → mín(2, 3, 1) = 1.</p>
        ${eq('H ≥ D + 1 → D = H − 1', 'Detectar D errores')}
        ${eq('H ≥ 2C + 1 → C = (H − 1)/2', 'Corregir C errores')}
        ${eq('H − 1 = D + C (con D ≥ C)', 'Las dos a la vez')}
        ${table(['H', 'Posibilidades'], [['2 (paridad)', 'D = 1, C = 0: detecta 1, no corrige'], ['3', 'D = 2, C = 0, o bien D = 1 y C = 1'], ['4', 'D = 3 y C = 0, o D = 2 y C = 1'], ['5', 'Detecta 4 o corrige 2 (ejemplo 5 de la guía)']])}
        <h2>Código de Hamming</h2>
        <p>Se agregan p bits de paridad a n bits de datos. Cada bit de paridad controla (con paridad par) un grupo de posiciones; los p resultados forman un número binario que indica la posición del bit erróneo (0 = sin error). Para poder señalar las n + p posiciones más el caso “sin error”:</p>
        ${eq('2ᵖ ≥ n + p + 1', 'Bits de paridad necesarios')}
        ${table(['n (datos)', 'p', 'n + p'], [[4, 3, 7], [5, 4, 9], [7, 4, 11], [8, 4, 12], [11, 4, 15], [16, 5, 21]])}
        <p><strong>Disposición de la cátedra</strong>: las posiciones se numeran de <strong>derecha (1) a izquierda</strong>; los bits de paridad van en las posiciones potencia de 2 (1, 2, 4, 8…) y los datos en las demás. p<sub>i</sub> controla las posiciones cuyo número en binario tiene un 1 en el lugar i: p1 → 1, 3, 5, 7, 9, 11; p2 → 2, 3, 6, 7, 10, 11; p3 → 4–7; p4 → 8–11.</p>
        ${table(['Posición', ...posRow(11).map(String)], [['Bit', ...posRow(11).map((k) => ham.lab[k])], ['1001101 →', ...[...ham.word].map((b, j) => (ham.lab[11 - j].startsWith('p') ? `<b>${b}</b>` : b))]])}
        <p>Ejemplo de la guía: datos 1001101 → se transmite <strong>${mono(ham.word)}</strong>. Si llega con la posición 8 invertida (10001100101), los controles dan p4 p3 p2 p1 = 1 0 0 0 = 8: error en la posición 8.</p>
        ${lab(0)}
        ${note('Hamming de distancia 3 corrige 1 error <strong>o</strong> detecta 2, no las dos cosas a la vez: con dos errores el síndrome apunta a una posición equivocada y la “corrección” agrega un tercer error.', 'warn')}`,
      labs: [{ type: 'hamming', title: 'Código de Hamming de la cátedra', intro: 'Codificá 1001101 y tocá un bit para simular el error del canal. En modo decodificar está la palabra del TP 6, ejercicio 7.', data: '1001101' }],
      exercises: [
        { title: 'Distancias de Hamming', official: '6.5', level: 1, prompt: '<p>Calcular la distancia de Hamming entre a) 1011101 y 1001001; b) 011010 y 111110; c) “COMA” y “CAMA” en ASCII de 7 bits. Interpretar c) en errores detectables y corregibles.</p>',
          solution: { explain: `<p><b>a)</b> 1011101 ⊕ 1001001 = 0010100 → <strong>2</strong>. <b>b)</b> 011010 ⊕ 111110 = 100100 → <strong>2</strong>.</p>${table(['Letra', 'COMA', 'CAMA', 'Diferencias'], [0, 1, 2, 3].map((i) => [i + 1, mono(coma[i]), mono(cama[i]), X.hdist(coma[i], cama[i])]))}<p><b>c)</b> Solo difieren O (1001111) y A (1000001): distancia <strong>${X.hdist(coma.join(''), cama.join(''))}</strong>. Si esas dos palabras fueran un código, con H = 3 se podrían detectar hasta H − 1 = 2 errores o corregir (H − 1)/2 = 1: hacen falta 3 errores para que “COMA” se convierta en “CAMA” sin que se note.</p>` } },
        { title: 'Distancia mínima de un código', official: '6.6', level: 2, prompt: '<p>C = {0000, 1110, 1001, 0111}. a) Distancia mínima. b) Errores detectables y corregibles. c) Si se recibe 1010, ¿puede corregirse?</p>',
          solution: { explain: `${table(['Par', 'd'], C6.flatMap((a, i) => C6.slice(i + 1).map((b) => [`${a} – ${b}`, X.hdist(a, b)])))}<p><b>a)</b> H = <strong>${X.minDist(C6)}</strong>. <b>b)</b> D = H − 1 = <strong>1</strong>; C = (H − 1)/2 = 0,5 → <strong>0</strong>: detecta un error pero no corrige. <b>c)</b> 1010 no pertenece al código: se detecta el error. Distancias de 1010 a cada palabra: ${C6.map((w) => `${w}: ${X.hdist(w, '1010')}`).join(', ')}. La más cercana es 1110 (a distancia 1), pero como H = 2 el código no garantiza corrección: hay recepciones equidistantes de dos palabras válidas (1000 está a distancia 1 de 0000 y de 1001), así que adivinar la más cercana no es confiable. Lo correcto es <strong>detectar y pedir retransmisión</strong>.</p>` } },
        { title: 'Decodificar 10001100100', official: '6.7', level: 2, prompt: '<p>Se recibe 10001100100. Con Hamming, determinar si llegó sin error; si tiene error, corregirlo y dar el mensaje original en bits.</p>',
          solution: { explain: `<p>11 bits → p = 4 (posiciones 1, 2, 4, 8) y 7 de datos.</p>${table(['Control', 'Posiciones', 'Bits', 'Resultado'], [0, 1, 2, 3].map((i) => { const ks = posRow(11).filter((k) => (k >> i) & 1); return [`p${i + 1}`, ks.join(', '), ks.map((k) => '10001100100'[11 - k]).join(' '), d7.checks[i]]; }))}<p>Síndrome p4 p3 p2 p1 = ${[...d7.checks].reverse().join('')} = <strong>${d7.syn}</strong>: error en la posición ${d7.syn}. Corregida: ${mono(d7.corrected)}. Quitando las posiciones 8, 4, 2 y 1, el mensaje original es <strong>${mono(d7.data)}</strong>.</p>` } },
        { title: '1456 en BCD con Hamming', official: '6.8', level: 3, prompt: '<p>Transmitir 1456 en BCD con código Hamming: cantidad de mensajes, codificación y mensajes transmitidos.</p>',
          solution: { explain: `<p>Cada dígito BCD tiene 4 bits: n = 4 → 2ᵖ ≥ 4 + p + 1 → <strong>p = 3</strong> (Hamming 7,4). Se mandan <strong>4 mensajes</strong> de 7 bits (28 bits).</p>${table(['Dígito', 'BCD (n4 n3 n2 n1)', 'Hamming (pos. 7…1)'], [...'1456'].map((d) => [d, mono(X.bcd(d)), mono(X.hammingEncode(X.bcd(d)).word)]))}<p>Disposición: n4 n3 n2 p3 n1 p2 p1. Alternativa: codificar los 16 bits juntos (p = 5, 21 bits): ${mono(X.hammingEncode(X.bcd(1456)).word)}; es más eficiente pero corrige un solo error en todo el número.</p>` } },
      ],
      quiz: [
        { q: 'd(10110, 11011) =', o: ['1', '2', '3', '4'], a: 2, e: '10110 ⊕ 11011 = 01101.' },
        { q: 'Un código con distancia mínima 5 puede corregir…', o: ['1 error', '2 errores', '4 errores', '5 errores'], a: 1, e: '(5 − 1)/2.' },
        { q: 'Para 7 bits de datos, Hamming necesita…', o: ['3 bits de paridad', '4 bits de paridad', '5', '7'], a: 1, e: '2⁴ = 16 ≥ 7 + 4 + 1.' },
        { q: 'En Hamming los bits de paridad van en las posiciones…', o: ['impares', '1, 2, 4, 8…', 'al final', 'pares'], a: 1, e: 'Potencias de 2.' },
        { q: 'El síndrome 0110 indica…', o: ['sin error', 'error en la posición 6', 'error en la posición 3', 'dos errores'], a: 1, e: '0110₂ = 6.' },
        { q: 'La paridad simple tiene distancia mínima…', o: ['1', '2', '3', '4'], a: 1, e: 'Detecta 1, no corrige.' },
        { q: 'Con distancia mínima 3, un código puede…', o: ['detectar 3', 'detectar 2 o corregir 1', 'corregir 2', 'nada'], a: 1, e: 'H − 1 = D + C.' },
      ],
      open: [
        { t: 'num', q: 'Distancia de Hamming entre 1101011 y 0111001.', a: X.hdist('1101011', '0111001'), u: 'bits', e: `<p>XOR = 1010010 → ${X.hdist('1101011', '0111001')} bits distintos.</p>` },
        { t: 'num', q: '¿Cuántos bits de paridad necesita Hamming para 12 bits de datos?', a: X.parityCount(12), u: 'bits', e: '<p>2⁵ = 32 ≥ 12 + 5 + 1 = 18 (con p = 4: 16 ≥ 17 no alcanza) → p = 5.</p>' },
        { t: 'bits', q: 'Codificá los datos 1011 con Hamming (disposición de la cátedra, 7 bits de la posición 7 a la 1).', a: X.hammingEncode('1011').word, e: `<p>Posiciones 7 6 5 4 3 2 1 = n4 n3 n2 p3 n1 p2 p1 = 1 0 1 p3 1 p2 p1. p1 (pos. 3, 5, 7) = 1⊕1⊕1 = 1; p2 (3, 6, 7) = 1⊕0⊕1 = 0; p3 (5, 6, 7) = 1⊕0⊕1 = 0 → ${X.hammingEncode('1011').word}.</p>` },
        { t: 'num', q: 'Se recibe 1001110 (Hamming 7,4 de la cátedra). ¿En qué posición está el error? (0 si no hay)', a: X.hammingDecode('1001110').syn, e: `<p>Controles p3 p2 p1 = ${[...X.hammingDecode('1001110').checks].reverse().join('')} → posición ${X.hammingDecode('1001110').syn}; corregida ${X.hammingDecode('1001110').corrected}.</p>` },
        { t: 'text', q: '¿Qué relación hay entre la distancia mínima de un código y los errores que detecta y corrige?', k: [['h - 1', 'h-1', 'd = h', 'distancia menos uno', 'h−1'], ['(h - 1)/2', '(h-1)/2', '2c + 1', '2c+1', 'mitad'], ['detecta', 'detectar'], ['corrige', 'corregir']], need: 3, e: '<p>Con distancia mínima H se detectan D = H − 1 errores y se corrigen C = (H − 1)/2 (H ≥ 2C + 1). En general H − 1 = D + C con D ≥ C.</p>' },
      ],
    },

    {
      id: 'errores-afondo',
      module: 'u6',
      title: 'A fondo: detectar o corregir, cuánta redundancia y qué código',
      keywords: 'detección corrección redundancia paridad bit de paridad número impar de errores CRC división polinomial ráfagas Hamming distancia mínima esferas H ≥ 2C + 1 H − 1 = D + C códigos de bloque código de repetición FEC ARQ Hamming (7,4) eficiencia',
      tldr: 'Detectar es saber <strong>que</strong> hubo error; corregir es saber <strong>dónde</strong> y arreglarlo sin retransmitir, y por eso cuesta <mark>más bits de redundancia</mark>. La paridad detecta solo un número <strong>impar</strong> de errores; el CRC <strong>detecta</strong> (no corrige) y es el mejor para ráfagas; Hamming corrige 1 bit. La capacidad la fija la distancia mínima: <strong>H ≥ 2C + 1</strong>, y en general <strong>H − 1 = D + C</strong> con D ≥ C.',
      goals: ['Diferenciar detección, corrección, ARQ y FEC.', 'Usar la distancia mínima para decir cuántos errores se detectan y corrigen.', 'Ubicar paridad, CRC, Hamming y repetición según lo que hacen.', 'Resolver los V o F de errores del 2do parcial y del final.'],
      body: `
        <h2>Cuatro ideas que la cátedra mezcla a propósito</h2>
        ${table(['Concepto', 'Qué hace', 'Ojo con'], [
          ['<strong>Detección</strong>', 'Identifica si el mensaje se alteró (paridad, CRC)', 'No dice qué bit falló'],
          ['<strong>Corrección</strong>', 'Reconstruye el mensaje original sin pedir retransmisión', 'Necesita más redundancia que detectar'],
          ['<strong>ARQ</strong>', 'Detecta y pide retransmisión', 'Depende de un método de detección (CRC); no es independiente de él'],
          ['<strong>FEC</strong>', 'Corrige en el receptor, “hacia adelante”', 'No retransmite: eso es ARQ'],
        ])}
        <p>Monitorear lo recibido y determinar que hubo un error es <strong>detección</strong>; el <strong>control de errores</strong> es más amplio: diseño, equipos y enlaces que bajen la tasa de errores, más las técnicas para detectarlos y corregirlos. Más bits de redundancia dan más protección pero bajan la eficiencia. Los errores en <strong>ráfaga</strong> son los más frecuentes y difíciles; los causa sobre todo el ruido impulsivo. Un error aislado aparece con ruido blanco que confunde al receptor en un bit.</p>
        <h2>Distancia mínima y capacidad</h2>
        ${eq('Detectar D errores: H ≥ D + 1 &nbsp;&nbsp; Corregir C errores: H ≥ 2C + 1 &nbsp;&nbsp; Ambos: H − 1 = D + C (D ≥ C)', 'Distancia mínima H de un código')}
        <p>Geométricamente: alrededor de cada palabra válida se dibuja una “esfera” de radio C; si las esferas no se solapan, cualquier palabra con hasta C errores cae en la esfera de la correcta. Por eso hace falta H = 2C + 1, no H = C + 1. Si dos palabras están a distancia d, hacen falta <strong>d</strong> errores (no d − 1) para convertir una en la otra.</p>
        ${table(['H', 'Detecta', 'Corrige', 'Ejemplo'], [['2', '1', '0', 'paridad simple'], ['3', '2 (o 1 y corrige 1)', '1', 'Hamming, repetición triple'], ['4', '3 (o 2 y corrige 1)', '1', 'Hamming extendido'], ['5', '4', '2', 'repetición ×5']])}
        ${note('Cuestionario de la Unidad 6: un conjunto de palabras A = 0000111, B = 0001110, C = 0011100, D = 0111000 tiene distancia mínima 2 (A-B difieren en 2 bits): detecta 1 error y no corrige. Una distancia de 4 permite detectar 2 y corregir 1.', 'exam')}
        <h2>Cada código en su lugar</h2>
        ${table(['Código', 'Qué hace', 'Detalle'], [
          ['Paridad (VRC)', 'Detecta un número <strong>impar</strong> de errores', 'Con un número par el bit de paridad no cambia y el error pasa desapercibido'],
          ['CRC', 'Detecta (no corrige); excelente para <strong>ráfagas</strong>', 'División polinómica módulo 2 (operaciones con polinomios)'],
          ['Hamming', 'Corrige 1 bit y detecta (H = 3); hasta 2 errores sin corregir', 'Bits de paridad en las posiciones potencia de 2 (1, 2, 4, 8, …); cada uno cubre un conjunto de posiciones. Un error en un bit de paridad también se detecta y se corrige'],
          ['Hamming (7,4)', '7 bits: 4 de datos y 3 de paridad', 'Corrige 1 error; detecta 2 si no se usa para corregir'],
          ['Repetición', 'Corrige por mayoría', '111 → si llega 101 o 110 se decide 1'],
        ])}
        <p>Los códigos de bloque (Hamming) codifican y decodifican bloque a bloque, independientemente del resto del mensaje. Con p bits de paridad, Hamming protege como máximo n = 2<sup>p</sup> − p − 1 bits de datos: con p = 4, n = 11 (como máximo, no como mínimo y no 7).</p>
        ${note('“Los códigos de detección son más eficientes en ancho de banda que los de corrección porque requieren menos redundancia” es verdadero. “El CRC es un método de corrección” es falso: el CRC detecta.', 'exam')}`,
      quiz: [
        { q: 'El bit de paridad detecta…', o: ['cualquier error', 'un número impar de errores', 'un número par de errores', 'ráfagas largas'], a: 1, e: 'Con dos errores la paridad no cambia.' },
        { q: 'Para corregir C errores hace falta una distancia mínima…', o: ['C + 1', '2C', '2C + 1', 'C − 1'], a: 2, e: 'Esferas de radio C sin solaparse.' },
        { q: 'El CRC es un método de…', o: ['corrección de errores', 'detección de errores, muy bueno para ráfagas', 'compresión', 'modulación'], a: 1, e: 'Se usa con ARQ.' },
        { q: 'Con p = 4 bits de paridad, Hamming protege como máximo…', o: ['7 bits de datos', '11 bits de datos', '15 bits de datos', '4 bits de datos'], a: 1, e: '2⁴ ≥ n + 4 + 1 → n ≤ 11. Cuestionario de la Unidad 6.' },
        { q: 'FEC significa que el receptor…', o: ['pide retransmisión', 'corrige sin retransmisión', 'descarta la trama', 'solo detecta'], a: 1, e: 'Forward Error Correction.' },
        { q: 'ARQ es…', o: ['independiente de la paridad o el CRC', 'un método que depende de la detección (por ejemplo CRC) y retransmite', 'un código corrector', 'una modulación'], a: 1, e: 'Cuestionario de la Unidad 6.' },
        { q: 'Un código con distancia mínima 4 puede…', o: ['corregir 2', 'detectar 2 y corregir 1', 'detectar 4', 'nada'], a: 1, e: 'H − 1 = 3 = D + C con D = 2, C = 1.' },
      ],
      open: [
        { t: 'num', q: '¿Cuántos errores puede corregir un código con distancia mínima 7?', a: 3, e: '<p>C = (7 − 1)/2 = 3.</p>' },
        { t: 'num', q: '¿Cuántos bits de datos protege como máximo un Hamming con 5 bits de paridad?', a: 26, u: 'bits', e: '<p>n = 2⁵ − 5 − 1 = 26.</p>' },
        { t: 'text', q: '¿Por qué corregir cuesta más redundancia que detectar?', k: [['distancia'], ['posicion', 'donde', 'cual bit', 'ubicar'], ['bits', 'redundancia']], need: 2, e: '<p>Para detectar alcanza con saber que la palabra no es válida (H ≥ D + 1); para corregir hay que saber cuál bit falló, lo que exige que la palabra recibida siga más cerca de la original que de cualquier otra (H ≥ 2C + 1): más distancia, más bits de redundancia.</p>' },
      ],
      sources: [{ title: 'Redes de computadoras', ref: 'Tanenbaum y Wetherall, 5ª ed., sección 3.2', points: ['Distancia de Hamming: d + 1 para detectar d errores, 2d + 1 para corregirlos.', 'Códigos de Hamming, de repetición y CRC.'] },
        { title: 'Cuestionario de la Unidad 6 y 2do parcial 2025', ref: 'Cátedra de Comunicación de Datos, UTN-FRT', points: ['Relación H − 1 = D + C, detección contra corrección, ARQ y FEC.'] }],
    },
  );
})();
