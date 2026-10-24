/* Unidad 3 (1er parcial): atenuación, distorsión y ruido. Guía "UNIDAD 3 Atenuación, Distorsión y Ruido 2026" y apuntes 3.1 a 3.4.
   TP 3: presupuesto de un radioenlace WiFi con la matriz de antenas Aruba, y ruido térmico/SNR de un receptor 802.11n.
   La figura del ejercicio 1 (largos de cable, distancia, antena A) no viene en el texto: se resuelve en forma general y con un caso de ejemplo. */
(() => {
  const { LESSONS, h, cx: X } = window.GUIDE;
  const { note, def, table, eq, frac, lab, num } = h;
  const r2 = (v) => num(v, 2);

  // Caso de ejemplo del TP 3.1 (datos supuestos donde falta la figura)
  const ex = { pt: X.dBm(63.1e-3), cab: 3 * 0.35, ga: 14, d: 1, s: -80, m: 10 };
  const need = ex.s + ex.m;
  const gB = (f) => need - (ex.pt - ex.cab + ex.ga - X.fspl(f, ex.d) - ex.cab);

  LESSONS.push(
    {
      id: 'decibel',
      module: 'u3',
      title: 'Deterioro de la señal y el decibel',
      keywords: 'atenuación ganancia decibel dB logaritmo potencia relación pérdida amplificador repetidor suma de decibeles mitad de potencia 3 dB fibra coaxial empalme conector',
      tldr: 'La señal que llega nunca es igual a la enviada: sufre <strong>atenuación</strong>, <strong>distorsión</strong> y <strong>ruido</strong>. La atenuación y la ganancia se miden en <mark>decibeles: dB = 10·log(P₂/P₁)</mark>. Negativo es pérdida, positivo es ganancia, y lo mejor: en una cadena de etapas <strong>los dB se suman</strong>. −3 dB es perder la mitad de la potencia; +10 dB, multiplicarla por 10.',
      goals: ['Enumerar los tres deterioros de una señal y las causas de la atenuación.', 'Calcular ganancias y pérdidas en dB y volver a veces.', 'Encadenar etapas sumando dB (líneas, amplificadores, enlaces de fibra).'],
      body: `
        <h2>Los tres deterioros</h2>
        <p>En las señales analógicas, los deterioros degradan la calidad; en las digitales, generan <strong>bits erróneos</strong> (un 1 se lee como 0 o al revés). Son tres: <strong>atenuación</strong>, <strong>distorsión</strong> y <strong>ruido</strong>.</p>
        ${def('Atenuación', 'Debilitamiento de la señal debido a la resistencia eléctrica que presenta el canal y los demás elementos de la transmisión; se manifiesta como un descenso de la amplitud (energía, potencia) de la señal transmitida.', 'Guía de la Unidad 3')}
        ${table(['Medio', 'Causa de la atenuación'], [['Cobre (par trenzado, coaxial)', 'Resistencia eléctrica de los conductores'], ['Fibra óptica', 'Dispersión: la luz choca con impurezas y se esparce'], ['Radio', 'Esparcimiento de la onda en el espacio: aumenta con la distancia y la frecuencia']])}
        <p>Otras causas: longitud, materiales y construcción, pérdidas de inserción en terminaciones y reflexiones por cambios de impedancia. <strong>La atenuación crece con la frecuencia.</strong> Se compensa con <strong>amplificadores</strong> (analógico) o <strong>repetidores</strong> que regeneran (digital). La señal recibida debe superar el umbral del receptor y estar por encima del ruido.</p>
        <h2>El decibel</h2>
        ${eq(`dB = 10·log₁₀ ${frac('P₂', 'P₁')}`, 'Ganancia o atenuación (P₂ salida, P₁ entrada)')}
        ${eq(`${frac('P₂', 'P₁')} = 10<sup>dB/10</sup>`, 'De dB a veces')}
        ${table(['Relación', 'dB', 'Relación', 'dB'], [['10 000', '40', '16', '12'], ['1000', '30', '8', '9'], ['100', '20', '4', '6'], ['10', '10', '2', '3'], ['1', '0', '1', '0'], ['0,1', '−10', '0,5', '−3'], ['0,01', '−20', '0,25', '−6'], ['0,001', '−30', '0,125', '−9']])}
        ${note('Atajos de memoria: ×2 = +3 dB, ×10 = +10 dB, ½ = −3 dB, 1/10 = −10 dB. Entonces ×20 = +13 dB y ×1000 = +30 dB.', 'tip')}
        ${lab(0)}
        <h2>En una cadena, los dB se suman</h2>
        <p>Ejemplo de la guía: la señal se atenúa 3 dB, se amplifica 7 dB y vuelve a atenuarse 3 dB: total −3 + 7 − 3 = <strong>+1 dB</strong>. En veces habría que multiplicar 0,5 × 5 × 0,5.</p>
        <h3>Ejemplos de la cátedra</h3>
        <ul>
          <li><strong>Coaxial</strong> de 5 km con 0,3 dB/km y 2 mW a la entrada: pérdida 1,5 dB → P<sub>sal</sub> = 2 mW × 10<sup>−0,15</sup> = 2 × 0,707 = <strong>1,41 mW</strong>.</li>
          <li><strong>Amplificador</strong> de 13 dB con 4 mW de entrada: 10<sup>1,3</sup> = 19,95 → <strong>79,8 mW</strong>.</li>
          <li><strong>Enlace óptico</strong> de 50 km, 3 mW, conectores de 3 dB (dos), empalmes de 0,1 dB cada 2 km (26 empalmes según la guía), fibra de 0,4 dB/km: 6 + 2,6 + 20 = 28,6 dB → P<sub>RX</sub> = 3 mW × 10<sup>−2,86</sup> = <strong>4,1 µW</strong>.</li>
        </ul>`,
      labs: [
        { type: 'calc', title: 'Calculadora de decibeles', intro: 'Ganancia o pérdida en dB a partir de dos potencias, y la potencia de salida a partir de los dB.',
          fields: [{ id: 'p1', label: 'P entrada [mW]', value: 2 }, { id: 'p2', label: 'P salida [mW]', value: 1.41 }, { id: 'db', label: 'Ganancia en dB (para el segundo cálculo)', value: -1.5 }],
          run: (v) => `P₂/P₁ = ${num(v.p2 / v.p1, 4)} → ${num(X.dB(v.p2 / v.p1), 3)} dB (${v.p2 < v.p1 ? 'atenuación' : 'ganancia'})\nCon ${num(v.db, 2)} dB: P₂ = P₁ × 10^(${num(v.db, 2)}/10) = ${num(v.p1, 3)} × ${num(X.fromDb(v.db), 4)} = ${num(v.p1 * X.fromDb(v.db), 4)} mW` },
      ],
      exercises: [
        { title: 'Línea con amplificadores', level: 2, prompt: '<p>Un transmisor entrega 10 mW a una línea de 20 km con 0,5 dB/km. A los 10 km hay un amplificador de 8 dB. ¿Qué potencia llega al final?</p>', solution: { explain: '<p>Total en dB: −0,5·20 + 8 = −2 dB. P = 10 mW × 10<sup>−0,2</sup> = 10 × 0,631 = <strong>6,31 mW</strong>. La posición del amplificador no cambia el resultado en dB (sí importa en la práctica para no caer bajo el ruido).</p>' } },
      ],
      quiz: [
        { q: 'Una señal pierde la mitad de su potencia. La atenuación es…', o: ['−1 dB', '−2 dB', '−3 dB', '−10 dB'], a: 2, e: '10·log 0,5 = −3,01 dB.' },
        { q: 'Un amplificador multiplica la potencia por 100. Su ganancia es…', o: ['2 dB', '10 dB', '20 dB', '100 dB'], a: 2, e: '10·log 100 = 20 dB.' },
        { q: 'Etapas de −3 dB, +7 dB y −3 dB dan en total…', o: ['−1 dB', '+1 dB', '+13 dB', '−63 dB'], a: 1, e: 'En dB se suman.' },
        { q: 'La atenuación de un medio…', o: ['baja con la frecuencia', 'sube con la frecuencia', 'no depende de la frecuencia', 'solo existe en radio'], a: 1, e: 'Por eso aparece la distorsión por atenuación.' },
        { q: 'En fibra óptica la atenuación se debe principalmente a…', o: ['la resistencia del cobre', 'la dispersión de la luz en impurezas', 'la temperatura', 'el ruido de disparo'], a: 1, e: 'La luz se esparce y pierde energía.' },
        { q: '+13 dB equivalen aproximadamente a multiplicar por…', o: ['13', '20', '26', '130'], a: 1, e: '10 dB = ×10, 3 dB = ×2 → ×20.' },
      ],
      open: [
        { t: 'num', q: 'Una señal de 5 mW atraviesa un cable con 6 dB de pérdida. ¿Qué potencia sale, en mW? (2 decimales)', a: 5 * X.fromDb(-6), tol: 0.02, u: 'mW', e: `<p>P = 5 × 10<sup>−0,6</sup> = 5 × 0,251 = ${r2(5 * X.fromDb(-6))} mW (−6 dB ≈ un cuarto).</p>` },
        { t: 'num', q: 'Entran 4 mW y salen 0,4 mW. ¿Cuál es la ganancia en dB?', a: -10, e: '<p>10·log(0,4/4) = 10·log 0,1 = −10 dB.</p>' },
        { t: 'num', q: 'Enlace de fibra de 30 km a 0,25 dB/km con 2 conectores de 0,5 dB y 1 mW de transmisor: ¿cuántos µW llegan? (1 decimal)', a: 1000 * X.fromDb(-(30 * 0.25 + 1)), tol: 0.02, u: 'µW', e: `<p>Pérdida total: 7,5 + 1 = 8,5 dB. P = 1 mW × 10<sup>−0,85</sup> = ${num(1000 * X.fromDb(-8.5), 1)} µW.</p>` },
        { t: 'text', q: '¿Por qué en comunicaciones se usan los decibeles en lugar de relaciones de potencia en veces?', k: [['suma', 'restan', 'sumar'], ['etapa', 'cadena', 'puntos', 'varios'], ['logarit', 'rango', 'grandes', 'chicos']], need: 2, e: '<p>Porque los dB se suman o restan cuando la señal pasa por varias etapas (en veces habría que multiplicar), y porque la escala logarítmica maneja cómodamente relaciones enormes o diminutas (de pW a W).</p>' },
      ],
    },
    {
      id: 'dbm-enlace',
      module: 'u3',
      title: 'dBm, dBi, RSSI y presupuesto de un enlace WiFi',
      keywords: 'dBm potencia absoluta 1 mW dBi antena isotrópica ganancia RSSI sensibilidad del receptor margen pérdida en el espacio libre FSPL 32,45 presupuesto de enlace radioenlace Aruba 2,4 GHz 5,8 GHz',
      tldr: 'El <strong>dBm</strong> expresa una potencia respecto de 1 mW (0 dBm = 1 mW, 30 dBm = 1 W, −30 dBm = 1 µW). El <strong>dBi</strong>, la ganancia de una antena respecto de la isotrópica. En un radioenlace: <mark>RSSI = P<sub>Tx</sub> − L<sub>cables</sub> + G<sub>antenas</sub> − L<sub>espacio libre</sub></mark>, con L<sub>EL</sub> = 32,45 + 20 log f[MHz] + 20 log d[km]. El enlace funciona si RSSI supera la sensibilidad con el margen pedido.',
      goals: ['Convertir entre mW y dBm.', 'Calcular la pérdida en el espacio libre.', 'Armar el presupuesto de un enlace y calcular RSSI y margen.', 'Elegir la antena de la matriz Aruba que hace viable el enlace (TP 3).'],
      body: `
        <h2>dBm: potencia absoluta</h2>
        ${eq(`P<sub>dBm</sub> = 10·log ${frac('P', '1 mW')} &nbsp;&nbsp; P = 10<sup>P<sub>dBm</sub>/10</sup> mW`, 'dBm')}
        ${table(['Potencia', 'dBm', 'Potencia', 'dBm'], [['1 W = 1000 mW', '30', '1 mW', '0'], ['100 mW', '20', '0,5 mW', '−3'], ['10 mW', '10', '1 µW', '−30'], ['2 mW', '3', '1 nW', '−60'], ['63,1 mW', '18', '10 pW', '−80']])}
        ${note('Regla de oro: <strong>dBm ± dB = dBm</strong>. Una potencia más una ganancia da una potencia. Nunca se suman dos dBm (sería multiplicar dos potencias).', 'warn')}
        <h2>dBi: ganancia de antena</h2>
        ${def('dBi', 'Decibeles de ganancia sobre un radiador isotrópico: relación logarítmica entre la potencia que emite una antena en su dirección principal y la que emitiría una antena isotrópica.', 'Guía de la Unidad 3')}
        <p>La isotrópica irradia igual en todas las direcciones; no existe, pero sirve de referencia. Si una antena “produce” 2 mW donde la isotrópica produce 1 mW, tiene 10·log 2 = <strong>3 dBi</strong>; con 3 mW, 4,8 dBi. Es su <strong>directividad</strong>: concentra, no crea energía.</p>
        <h2>RSSI, sensibilidad y margen</h2>
        <p>El <strong>RSSI</strong> (Received Signal Strength Indicator) es la potencia recibida en dBm (negativa). Cada receptor tiene una <strong>sensibilidad</strong> S: el mínimo RSSI que entiende (WiFi 2,4 GHz a 11 Mbps: −82 dBm). Si RSSI &lt; S se pierde el servicio. El <strong>margen</strong> = RSSI − S protege contra lluvia, desvanecimientos e interferencias.</p>
        <h2>Pérdida en el espacio libre</h2>
        <p>La potencia se reparte sobre un frente de onda cada vez más grande: la densidad cae con la distancia y la pérdida crece con la frecuencia.</p>
        ${eq('L<sub>EL</sub> [dB] = 32,45 + 20·log f[MHz] + 20·log d[km] = 92,44 + 20·log f[GHz] + 20·log d[km]', 'Pérdida en el espacio libre')}
        <p>Duplicar la distancia suma 6 dB de pérdida; a 5,8 GHz se pierden 20·log(5800/2400) = <strong>7,66 dB</strong> más que a 2,4 GHz.</p>
        <h2>El presupuesto del enlace</h2>
        ${eq('RSSI = P<sub>Tx</sub> − L<sub>cable Tx</sub> + G<sub>antena Tx</sub> − L<sub>EL</sub> + G<sub>antena Rx</sub> − L<sub>cable Rx</sub> ≥ S + margen', 'Presupuesto de enlace')}
        <p>Ejemplo 9 de la guía (5,8 GHz, 100 m → L<sub>EL</sub> = 87,71 dB): RSSI = 20 − 1 + 3 − 87,71 + 1 − 1 = <strong>−65,71 dBm</strong> &gt; −82 dBm: funciona, con margen 16,29 dB. A 1 km (L<sub>EL</sub> = 107,71 dB) da −85,71 dBm &lt; −82: no funciona; con un amplificador de 12 dB y antenas de 16 y 1 dBi vuelve a −65,71 dBm.</p>
        ${lab(0)}`,
      labs: [
        { type: 'link', title: 'Presupuesto de un radioenlace', intro: 'La línea muestra el nivel de la señal etapa por etapa. Ajustá hasta que el RSSI quede sobre la línea de margen. Cambiá la frecuencia y mirá cuánto cambia la antena necesaria.', pt: 18, lt: 1.05, gt: 14, d: 1, gr: 8, lr: 1.05, s: -80, m: 10, f: 5800 },
      ],
      exercises: [
        { title: 'Radioenlace 5,8 / 2,4 GHz y la matriz Aruba', official: '3.1', level: 3, prompt: '<p>Lado A: transmisor de 63,1 mW, coaxial de 0,35 dB/m, antena que amplifica y envía a 5,8 GHz hacia B. Lado B: coaxial del mástil con la misma atenuación; sensibilidad −80 dBm. a) Calcular la ganancia en dBi de la antena de B para un margen de recepción de 10 dB. b) Elegir la antena de la matriz Aruba. c) y d) Lo mismo a 2,4 GHz. e) Explicar la diferencia.</p><p class="muted-s">Los largos de cable, la distancia y la antena A están en la figura del TP, que no viene en el texto. La solución da la fórmula general y un caso de ejemplo; reemplazá los datos de tu figura en el laboratorio de la lección.</p>',
          hints: ['Pasá 63,1 mW a dBm.', 'RSSI necesario = sensibilidad + margen.', 'Despejá G<sub>B</sub> del presupuesto de enlace.'],
          solution: { explain: `<p><b>Datos comunes.</b> P<sub>Tx</sub> = 10·log(63,1 mW/1 mW) = <strong>18 dBm</strong>. RSSI necesario = −80 + 10 = <strong>−70 dBm</strong>. Pérdida de cada coaxial = 0,35 dB/m × largo.</p>
            ${eq('G<sub>B</sub> = −70 − (18 − L<sub>cA</sub> + G<sub>A</sub> − L<sub>EL</sub> − L<sub>cB</sub>)', 'Antena B necesaria')}
            <p><b>Caso de ejemplo</b> (datos supuestos): cables de 3 m (1,05 dB cada uno), antena A de 14 dBi, d = 1 km.</p>
            ${table(['', '5,8 GHz', '2,4 GHz'], [
              ['L<sub>EL</sub> a 1 km', `${r2(X.fspl(5800, 1))} dB`, `${r2(X.fspl(2400, 1))} dB`],
              ['Nivel sin G<sub>B</sub>: 18 − 1,05 + 14 − L<sub>EL</sub> − 1,05', `${r2(ex.pt - ex.cab + ex.ga - X.fspl(5800, 1) - ex.cab)} dBm`, `${r2(ex.pt - ex.cab + ex.ga - X.fspl(2400, 1) - ex.cab)} dBm`],
              ['G<sub>B</sub> mínima', `<strong>${r2(gB(5800))} dBi</strong>`, `<strong>${r2(gB(2400))} dBi</strong>`],
              ['Antena Aruba (≥ G<sub>B</sub>, en la banda)', 'ANT-3X3-5010 (10 dBi omni, 4,9–5,875 GHz) o, para punto a punto, ANT-2X2-5314 (14 dBi direccional)', 'AP-ANT-20W (2 dBi) o cualquiera de ≥ 0,2 dBi en 2,4 GHz; para punto a punto, ANT-2X2-2314 (14 dBi)'],
            ])}
            <p><b>e)</b> La pérdida en el espacio libre depende de 20·log f: a 2,4 GHz se pierden 20·log(5800/2400) = <strong>7,66 dB menos</strong> que a 5,8 GHz, para cualquier distancia. Por eso la antena de B necesita 7,66 dBi menos de ganancia. A mayor frecuencia, mayor atenuación.</p>` } },
      ],
      quiz: [
        { q: '0 dBm equivale a…', o: ['0 W', '1 mW', '1 W', '10 mW'], a: 1, e: 'La referencia es 1 mW.' },
        { q: '20 dBm equivalen a…', o: ['20 mW', '100 mW', '1 W', '2 mW'], a: 1, e: '10^(20/10) = 100 mW.' },
        { q: 'P<sub>Tx</sub> = 20 dBm con un cable de 2 dB y una antena de 10 dBi irradia…', o: ['28 dBm', '32 dBm', '28 dB', '200 mW'], a: 0, e: 'dBm − dB + dBi = dBm.' },
        { q: 'Si la distancia de un radioenlace se duplica, la pérdida en el espacio libre…', o: ['se duplica', 'aumenta 6 dB', 'aumenta 3 dB', 'no cambia'], a: 1, e: '20·log 2 = 6 dB.' },
        { q: 'Un receptor tiene sensibilidad −82 dBm y recibe −70 dBm. El margen es…', o: ['−12 dB', '12 dB', '152 dB', '−152 dBm'], a: 1, e: 'RSSI − S = −70 − (−82).' },
        { q: 'El dBi mide…', o: ['potencia absoluta', 'la ganancia de una antena respecto de la isotrópica', 'el ruido', 'la sensibilidad'], a: 1, e: 'Directividad.' },
        { q: 'A igual distancia, un enlace a 5,8 GHz frente a uno a 2,4 GHz…', o: ['pierde menos', 'pierde unos 7,7 dB más', 'pierde lo mismo', 'no tiene pérdida'], a: 1, e: '20·log(5800/2400).' },
      ],
      open: [
        { t: 'num', q: 'Un transmisor entrega 200 mW. ¿Cuántos dBm son? (2 decimales)', a: X.dBm(0.2), tol: 0.005, u: 'dBm', e: `<p>10·log(200) = ${r2(X.dBm(0.2))} dBm.</p>` },
        { t: 'num', q: '¿Cuántos mW son 27 dBm? (1 decimal)', a: X.fromDb(27), tol: 0.01, u: 'mW', e: `<p>10<sup>2,7</sup> = ${num(X.fromDb(27), 1)} mW (27 = 30 − 3: la mitad de 1 W).</p>` },
        { t: 'num', q: 'Pérdida en el espacio libre a 2400 MHz y 2 km, en dB (2 decimales).', a: X.fspl(2400, 2), tol: 0.002, u: 'dB', e: `<p>32,45 + 20·log 2400 + 20·log 2 = 32,45 + 67,60 + 6,02 = ${r2(X.fspl(2400, 2))} dB.</p>` },
        { t: 'num', q: 'P<sub>Tx</sub> = 20 dBm, cables de 1 dB en cada lado, antenas de 3 dBi y 1 dBi, L<sub>EL</sub> = 87,71 dB. ¿RSSI en dBm?', a: -65.71, tol: 0.002, u: 'dBm', e: '<p>20 − 1 + 3 − 87,71 + 1 − 1 = −65,71 dBm (ejemplo 9 de la guía).</p>' },
        { t: 'text', q: '¿Qué es la sensibilidad de un receptor y qué es el margen de un enlace?', k: [['minim', 'menor'], ['potencia', 'nivel', 'senal', 'rssi'], ['margen'], ['diferencia', 'por encima', 'resta', 'sobre']], e: '<p>La sensibilidad es la mínima potencia de señal (RSSI, en dBm) que el receptor es capaz de recibir de forma inteligible. El margen es la diferencia entre el RSSI recibido y la sensibilidad: cuánto puede empeorar el enlace (lluvia, desvanecimientos) antes de caerse.</p>' },
      ],
    },
    {
      id: 'distorsion',
      module: 'u3',
      title: 'Distorsión',
      keywords: 'distorsión por atenuación retardo armónicas intermodulación ecualizador velocidad de propagación fase no lineal amplificador',
      tldr: 'La <strong>distorsión</strong> es la alteración de la forma de la señal por la respuesta imperfecta del sistema. A diferencia del ruido, <mark>desaparece cuando la señal deja de aplicarse</mark>. Tres clases: <strong>por atenuación</strong> (cada frecuencia se atenúa distinto: se corrige con ecualizadores), <strong>por retardo</strong> (cada frecuencia viaja a distinta velocidad: crítica en datos digitales) y <strong>por armónicas</strong> (dispositivos no lineales crean múltiplos no deseados).',
      goals: ['Definir distorsión y diferenciarla del ruido.', 'Explicar las distorsiones por atenuación, retardo y armónicas, y cómo se combaten.'],
      body: `
        ${def('Distorsión', 'Alteración de la forma de la señal deseada debido a la respuesta imperfecta del sistema a ella misma. A diferencia del ruido y la interferencia, la distorsión desaparece cuando la señal deja de aplicarse.', 'Guía de la Unidad 3')}
        <p>Una señal está formada por muchas frecuencias (Unidad 2). Si el medio no las trata a todas por igual, la suma que llega tiene otra forma.</p>
        ${table(['Clase', 'Causa', 'Efecto y remedio'], [
          ['<strong>Por atenuación</strong>', 'La atenuación crece con la frecuencia: las armónicas altas llegan más débiles que las bajas', 'Los pulsos se redondean. Se corrige con <strong>ecualizadores</strong> o amplificadores que amplifican más las frecuencias altas'],
          ['<strong>Por retardo</strong>', 'Cada componente viaja a distinta velocidad (típico de medios guiados): llegan con distinto retardo, desfasadas', 'Los bits se “desparraman” sobre los vecinos (interferencia entre símbolos); es crítica en transmisión digital a alta velocidad'],
          ['<strong>Por armónicas</strong>', 'Dispositivos no lineales (amplificadores de potencia saturados) generan múltiplos de la frecuencia original', 'Aparecen frecuencias que no estaban; junto con la <strong>intermodulación</strong> (sumas y diferencias de frecuencias) forman el ruido correlacionado'],
        ])}
        ${lab(0)}
        ${note('Para distinguir en el examen: si al apagar la señal el efecto desaparece, es <strong>distorsión</strong> (o ruido correlacionado); si sigue estando, es <strong>ruido</strong> no correlacionado.', 'exam')}`,
      labs: [
        { type: 'fourier', title: 'Distorsión por atenuación: perder armónicas', intro: 'Un canal que atenúa las frecuencias altas deja pasar solo las primeras armónicas. Bajá el número de armónicas y mirá cómo se redondea el pulso: eso es distorsión.', fn: 'sq01', n: 3 },
      ],
      quiz: [
        { q: 'La diferencia clave entre distorsión y ruido es que la distorsión…', o: ['es aleatoria', 'desaparece cuando la señal deja de aplicarse', 'solo afecta a la fibra', 'se mide en dBm'], a: 1, e: 'Depende de la propia señal.' },
        { q: 'La distorsión por atenuación se corrige con…', o: ['repetidores', 'ecualizadores', 'antenas', 'filtros pasa altos'], a: 1, e: 'Igualan la atenuación en la banda.' },
        { q: 'La distorsión por retardo se produce porque…', o: ['la señal es débil', 'cada frecuencia viaja a distinta velocidad', 'hay rayos', 'el amplificador satura'], a: 1, e: 'Llegan desfasadas.' },
        { q: 'Las armónicas no deseadas aparecen en…', o: ['dispositivos lineales', 'dispositivos no lineales', 'la fibra monomodo', 'el vacío'], a: 1, e: 'Por ejemplo, un amplificador de potencia de grandes señales.' },
        { q: '¿Qué distorsión es particularmente crítica en transmisión digital?', o: ['Por retardo', 'Por armónicas', 'Ninguna', 'La del ruido cósmico'], a: 0, e: 'Los pulsos se superponen.' },
      ],
      open: [
        { t: 'text', q: 'Definí distorsión y explicá en qué se diferencia del ruido.', k: [['forma', 'alteracion', 'altera'], ['respuesta', 'sistema', 'imperfect'], ['desaparece', 'deja de aplicarse', 'sin senal', 'depende de la senal']], e: '<p>Es la alteración de la forma de la señal por la respuesta imperfecta del sistema. A diferencia del ruido, desaparece cuando la señal deja de aplicarse: depende de la propia señal.</p>' },
        { t: 'text', q: 'Nombrá las tres clases de distorsión que estudia la cátedra.', k: [['atenuacion'], ['retardo'], ['armonica']], need: 3, e: '<p>Distorsión por atenuación, por retardo y por armónicas.</p>' },
      ],
    },
    {
      id: 'tipos-ruido',
      module: 'u3',
      title: 'Ruido: definición y clases',
      keywords: 'ruido correlacionado no correlacionado externo interno cósmico atmosférico impulsivo inducido diafonía NEXT disparo shot partición térmico intermodulación detección',
      tldr: 'El <strong>ruido</strong> es toda señal indeseable que se suma a la transmitida; es <strong>aditivo</strong>, aleatorio y siempre está. Se divide en <mark>no correlacionado</mark> (existe haya o no señal: externo e interno) y <mark>correlacionado</mark> (solo con señal: armónicas e intermodulación). Externos: cósmico, atmosférico, impulsivo, inducido, diafonía. Internos: disparo, partición y <strong>térmico</strong>.',
      goals: ['Definir ruido y explicar por qué se modela con probabilidades.', 'Clasificar los ruidos en correlacionados y no correlacionados, externos e internos.', 'Describir cada tipo de ruido y dar un ejemplo.'],
      body: `
        ${def('Ruido', 'Señal indeseable que se inserta en algún punto entre el emisor y el receptor y tiene un efecto directo en las prestaciones del sistema: cualquier tensión o corriente no deseada que aparece en un receptor.', 'Guía de la Unidad 3')}
        <p>Suele ser muy chico (µV), pero el receptor amplifica todo lo que llega, señal y ruido. Es <strong>aditivo</strong> (se suma a la señal) y aleatorio: hay que estudiarlo con modelos probabilísticos. En digital, el receptor debe <strong>decidir</strong> en cada instante si llegó un 1 o un 0 a partir de la señal deformada: ese es el problema de la <strong>detección</strong>.</p>
        ${lab(0)}
        <h2>Clasificación</h2>
        ${table(['Grupo', 'Tipo', 'Origen'], [
          ['<strong>No correlacionado externo</strong> (lo produce el medio o el entorno)', 'Cósmico', 'Sol y estrellas: radiación en un amplio rango de frecuencias'],
          ['', 'Atmosférico (estática)', 'Rayos: descargas eléctricas que se propagan a gran distancia'],
          ['', 'Impulsivo', 'Picos de gran amplitud y muy corta duración: líneas de potencia, iluminación, conmutaciones'],
          ['', 'Inducido', 'Motores y electrodomésticos que actúan como antenas emisoras; el medio hace de receptora'],
          ['', 'Diafonía (NEXT, crosstalk)', 'Acoplamiento entre líneas vecinas: una actúa como antena emisora y otra como receptora'],
          ['<strong>No correlacionado interno</strong> (en el receptor)', 'De disparo (shot)', 'Variaciones aleatorias del flujo de portadores en diodos y transistores'],
          ['', 'De partición', 'Una corriente que se divide en dos caminos (emisor = base + colector en un BJT)'],
          ['', '<strong>Térmico</strong>', 'Agitación térmica de los electrones en cualquier conductor: está siempre'],
          ['<strong>Correlacionado</strong> (solo con señal)', 'Armónicas e intermodulación', 'Amplificación no lineal: múltiplos y combinaciones (f₁ ± f₂) de las frecuencias de la señal'],
        ])}
        ${note('Los no correlacionados “siempre están”, haya señal o no. Los correlacionados existen solo ligados a la señal (son en realidad formas de distorsión no lineal).', 'exam')}`,
      labs: [
        { type: 'classify', title: '¿Qué ruido es?', buckets: ['Externo', 'Interno', 'Correlacionado'], items: [
          { t: 'Un rayo durante una tormenta', b: 0 }, { t: 'Agitación térmica en las resistencias del receptor', b: 1 }, { t: 'Productos de intermodulación de un amplificador saturado', b: 2 },
          { t: 'La conversación del par vecino que se escucha en la línea (diafonía)', b: 0 }, { t: 'Variaciones del flujo de electrones en un transistor (disparo)', b: 1 }, { t: 'Un motor de licuadora cerca del cable', b: 0 }, { t: 'Radiación del Sol', b: 0 }, { t: 'Armónicas generadas por un dispositivo no lineal', b: 2 },
        ] },
      ],
      quiz: [
        { q: 'El ruido no correlacionado…', o: ['solo existe con señal', 'existe haya o no señal', 'es siempre externo', 'es la distorsión por retardo'], a: 1, e: 'Siempre está.' },
        { q: 'La diafonía (NEXT) es un ruido…', o: ['interno', 'externo por acoplamiento entre líneas', 'correlacionado', 'cósmico'], a: 1, e: 'Una línea hace de antena emisora y otra de receptora.' },
        { q: 'El ruido de disparo se produce en…', o: ['resistencias', 'dispositivos activos (diodos, transistores)', 'la atmósfera', 'la fibra'], a: 1, e: 'Variaciones aleatorias del flujo de portadores.' },
        { q: 'La intermodulación es un ruido…', o: ['correlacionado', 'atmosférico', 'térmico', 'de partición'], a: 0, e: 'Aparece por amplificación no lineal de la señal.' },
        { q: 'Un pico de alta amplitud y muy corta duración es ruido…', o: ['térmico', 'impulsivo', 'cósmico', 'de partición'], a: 1, e: 'Líneas de potencia, conmutaciones.' },
        { q: 'El ruido es aditivo: significa que…', o: ['se multiplica por la señal', 'se suma a la señal', 'aparece solo en la fuente', 'se puede eliminar del todo'], a: 1, e: 'Señal + ruido.' },
      ],
      open: [
        { t: 'text', q: '¿Cuál es la diferencia entre ruido correlacionado y no correlacionado? Dá un ejemplo de cada uno.', k: [['no correlacionado', 'independiente', 'siempre'], ['correlacionado'], ['termico', 'cosmico', 'atmosferico', 'impulsivo', 'inducido', 'diafonia', 'disparo', 'particion'], ['intermodulacion', 'armonica']], e: '<p>El no correlacionado no depende de la señal: existe haya o no señal (térmico, cósmico, atmosférico, impulsivo, diafonía). El correlacionado existe solo ligado a la señal: lo produce la amplificación no lineal (armónicas e intermodulación).</p>' },
        { t: 'text', q: 'Nombrá tres ruidos externos y dos internos.', k: [['cosmico', 'atmosferico', 'estatica'], ['impulsivo', 'inducido'], ['diafonia', 'next', 'crosstalk', 'interferencia'], ['termico'], ['disparo', 'shot', 'particion']], need: 4, e: '<p>Externos: cósmico, atmosférico (estática), impulsivo, inducido, diafonía (NEXT). Internos: de disparo (shot), de partición y térmico.</p>' },
      ],
    },
    {
      id: 'ruido-termico',
      module: 'u3',
      title: 'Ruido térmico, SNR y factor de ruido',
      keywords: 'ruido térmico densidad de potencia de ruido N0 kT Boltzmann potencia de ruido kTB -174 dBm/Hz relación señal ruido SNR dB veces factor de ruido índice de ruido figura de ruido NF',
      tldr: 'El ruido térmico tiene una <strong>densidad de potencia</strong> plana (ruido blanco): <mark>N₀ = k·T</mark> [W/Hz], con k = 1,38·10⁻²³ J/K y T en Kelvin. En un ancho de banda B, la potencia es <mark>N = k·T·B</mark>: a 17 °C son −174 dBm por cada Hz. La calidad de la señal se mide con la <strong>SNR = S/N</strong> (en veces o en dB). Todo circuito real empeora la SNR: su <strong>factor de ruido</strong> F = SNR<sub>entrada</sub>/SNR<sub>salida</sub> &gt; 1.',
      goals: ['Calcular N₀ y N = kTB en W y en dBm.', 'Calcular la SNR en veces y en dB.', 'Resolver el ejercicio 2 del TP 3 (ruido de un receptor 802.11n).', 'Definir factor e índice de ruido.'],
      body: `
        <h2>Densidad de potencia de ruido térmico</h2>
        <p>La agitación térmica mueve los electrones al azar y genera una tensión aleatoria en todo componente que disipa calor (resistencias, cables, guías de onda). Su espectro es <strong>plano</strong>: igual en todas las frecuencias.</p>
        ${eq('N₀ = k·T [W/Hz] &nbsp;&nbsp; k = 1,38·10⁻²³ J/K &nbsp;&nbsp; T [K] = T [°C] + 273', 'Densidad de potencia de ruido')}
        <p>Características: <strong>aleatorio</strong>, <strong>blanco</strong> (en todas las frecuencias), resistivo, presente en todos los dispositivos, <strong>predecible</strong> y aditivo. Solo depende de la temperatura.</p>
        <p>Ejemplo 11: T = 17 °C = 290 K → N₀ = 1,38·10⁻²³ × 290 = <strong>4,002·10⁻²¹ W/Hz</strong>.</p>
        <h2>Potencia de ruido en un ancho de banda</h2>
        ${eq('N = N₀·B = k·T·B [W] &nbsp;&nbsp; N<sub>dBm</sub> = 10·log(kTB / 1 mW)', 'Potencia de ruido térmico')}
        ${table(['B (a 17 °C)', 'N [W]', 'N [dBm]'], [['1 Hz', '4,0·10⁻²¹', '−174'], ['1 MHz', '4,0·10⁻¹⁵', '−114'], ['10 MHz', '4,0·10⁻¹⁴', '−111 (−110,98)'], ['20 MHz (a 25 °C)', '8,22·10⁻¹⁴', '−100,8']])}
        ${note('Para una temperatura dada, la potencia de ruido depende <strong>solo del ancho de banda</strong>: un canal de 10 MHz tiene el mismo ruido entre 0 y 10 MHz que entre 190 y 200 MHz. Atajo: N[dBm] ≈ −174 + 10·log B.', 'tip')}
        ${lab(0)}
        <h2>Relación señal a ruido</h2>
        ${eq(`SNR = ${frac('S', 'N')} (veces) &nbsp;&nbsp; SNR<sub>dB</sub> = 10·log ${frac('S', 'N')} = S<sub>dBm</sub> − N<sub>dBm</sub>`, 'Relación señal a ruido')}
        <p>Ejemplos de la guía: S = 10 mW y N = 1 µW → SNR = 10 000 veces = 40 dB. S = 60 mW, N = 5 mW → 12 veces = 10,8 dB (alta); S = 6 mW, N = 5 mW → 1,2 veces = 0,8 dB (baja). La potencia de la señal no puede subirse indefinidamente: perturba canales vecinos y los equipos tienen potencia limitada.</p>
        ${note('Continuación del ejemplo 9 (5,8 GHz, B = 20 MHz, 25 °C → N = −100,8 dBm): con RSSI = −65,71 dBm, SNR = 35,1 dB; en el límite de la sensibilidad (−82 dBm), SNR = 18,8 dB.', 'tip')}
        <h2>Factor e índice de ruido</h2>
        ${eq(`F = ${frac('S<sub>i</sub>/N<sub>i</sub>', 'S<sub>o</sub>/N<sub>o</sub>')} (adimensional) &nbsp;&nbsp; NF = 10·log F [dB]`, 'Factor de ruido e índice (figura) de ruido')}
        <p>En un circuito ideal F = 1 (NF = 0 dB). Un circuito real siempre tiene F &gt; 1: la SNR a la salida es <strong>peor</strong> que a la entrada, <strong>aunque el circuito amplifique</strong>, porque suma su propio ruido (al menos el térmico).</p>`,
      labs: [
        { type: 'calc', title: 'Ruido térmico y SNR', intro: 'Potencia de ruido de un receptor y la SNR con una señal dada.',
          fields: [{ id: 't', label: 'Temperatura [°C]', value: 25 }, { id: 'b', label: 'Ancho de banda [MHz]', value: 20 }, { id: 's', label: 'Señal recibida [dBm]', value: -80 }],
          run: (v) => { const N = X.noiseW(v.t, v.b * 1e6), nd = X.dBm(N); return `T = ${num(v.t + 273, 1)} K\nN₀ = kT = ${(X.K * (v.t + 273)).toExponential(4)} W/Hz\nN = kTB = ${N.toExponential(4)} W = ${num(nd, 2)} dBm\nSNR = ${num(v.s, 2)} − (${num(nd, 2)}) = ${num(v.s - nd, 2)} dB = ${num(X.fromDb(v.s - nd), 2)} veces`; } },
      ],
      exercises: [
        { title: 'Ruido y SNR del receptor 802.11n', official: '3.2', level: 2, prompt: '<p>El receptor trabaja a 25 °C con un canal 802.11n de 20 MHz. a) y b) Calcular la potencia total de ruido térmico en W y en dBm. c) Con sensibilidad −80 dBm, ¿cuál es la SNR límite en dB? d) ¿Qué representa físicamente esa SNR y por qué es crítica?</p>',
          solution: { explain: `<p><b>a) y b)</b> T = 25 + 273 = 298 K. N₀ = 1,38·10⁻²³ × 298 = 4,11·10⁻²¹ W/Hz. N = N₀·B = 4,11·10⁻²¹ × 20·10⁶ = <strong>${X.noiseW(25, 20e6).toExponential(3)} W</strong> = 10·log(8,22·10⁻¹⁴/10⁻³) = <strong>${r2(X.noiseDbm(25, 20e6))} dBm</strong>.</p>
            <p><b>c)</b> SNR<sub>límite</sub> = S − N = −80 − (${r2(X.noiseDbm(25, 20e6))}) = <strong>${r2(-80 - X.noiseDbm(25, 20e6))} dB</strong> (≈ 121 veces).</p>
            <p><b>d)</b> Es cuántas veces la señal mínima que el receptor entiende supera al piso de ruido térmico de su propio ancho de banda. Por debajo de esa SNR el receptor no puede decidir con confiabilidad si llegó un 1 o un 0 (la BER se dispara) o tiene que bajar a una modulación más simple y lenta. Es crítico porque el ruido térmico no se puede eliminar: lo fija la temperatura y el ancho de banda del canal.</p>` } },
      ],
      quiz: [
        { q: 'La densidad de potencia de ruido térmico depende de…', o: ['el ancho de banda', 'la temperatura', 'la frecuencia central', 'la señal'], a: 1, e: 'N₀ = kT.' },
        { q: 'A 17 °C, la potencia de ruido en 1 Hz es aproximadamente…', o: ['0 dBm', '−174 dBm', '−114 dBm', '−30 dBm'], a: 1, e: '4·10⁻²¹ W.' },
        { q: 'Si el ancho de banda se multiplica por 10, la potencia de ruido…', o: ['no cambia', 'sube 10 dB', 'sube 3 dB', 'baja 10 dB'], a: 1, e: 'N = kTB.' },
        { q: 'S = 1 mW y N = 1 µW. La SNR es…', o: ['3 dB', '30 dB', '1000 dB', '60 dB'], a: 1, e: '1000 veces = 30 dB.' },
        { q: 'El factor de ruido de un amplificador real es…', o: ['menor que 1', 'igual a 1', 'mayor que 1', 'cero'], a: 2, e: 'Siempre empeora la SNR.' },
        { q: 'El ruido térmico se llama blanco porque…', o: ['no se ve', 'tiene igual densidad en todas las frecuencias', 'es pequeño', 'solo aparece de día'], a: 1, e: 'Espectro plano.' },
        { q: 'En N = kTB, la temperatura va en…', o: ['°C', '°F', 'K', 'cualquier unidad'], a: 2, e: 'T[K] = T[°C] + 273.' },
      ],
      open: [
        { t: 'num', q: 'Potencia de ruido térmico (en dBm) de un receptor a 27 °C con B = 1 MHz. (2 decimales)', a: X.noiseDbm(27, 1e6), tol: 0.001, u: 'dBm', e: `<p>N = 1,38·10⁻²³ × 300 × 10⁶ = 4,14·10⁻¹⁵ W → ${r2(X.noiseDbm(27, 1e6))} dBm.</p>` },
        { t: 'num', q: 'Señal de −70 dBm con ruido de −100 dBm: ¿SNR en veces?', a: 1000, e: '<p>SNR = −70 − (−100) = 30 dB = 10³ veces.</p>' },
        { t: 'num', q: 'Un amplificador recibe SNR = 40 dB y entrega SNR = 36 dB. ¿Cuál es su factor de ruido F (en veces)? (2 decimales)', a: X.fromDb(4), tol: 0.01, e: `<p>NF = 40 − 36 = 4 dB → F = 10<sup>0,4</sup> = ${r2(X.fromDb(4))}.</p>` },
        { t: 'text', q: '¿Qué es la relación señal a ruido y por qué no se mejora simplemente subiendo la potencia del transmisor sin límite?', k: [['relacion', 'cociente', 'cuantas veces'], ['senal'], ['ruido'], ['canales adyacentes', 'interfer', 'perturba', 'limitad', 'no lineal', 'intermodulacion']], e: '<p>Es el cociente entre la potencia de la señal y la del ruido en un punto (en veces o en dB). No se puede subir la potencia sin límite porque perturbaría a los canales adyacentes, aumentarían las no linealidades (intermodulación) y los amplificadores y canales tienen potencia limitada.</p>' },
      ],
    },
  );
})();
