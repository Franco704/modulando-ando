/* Unidad 8 (3er parcial): modulación y multiplexación de señales. Guía "8.0 Unidad 8 Modulación y Multiplexación de Señales 2026" y apuntes 81 a 86.
   TP 8 parte I: bits, símbolos y tasas en FSK/QPSK/4-ASK/16-QAM, fasores y constelaciones, n-QAM adaptativo.
   TP 8 parte II: PCM y almacenamiento, FDM con bandas de guarda y TDM síncrono.
   Tablas de fases: QPSK de la cátedra (Tomasi); 8-PSK y 8-QAM de Tomasi; 16-PSK y 16-QAM con código Gray (ver cx.js). */
(() => {
  const { LESSONS, h, cx: X } = window.GUIDE;
  const { note, def, table, eq, frac, lab, num } = h;
  const eng = (v, u, d = 3) => window.GUIDE.labUtil.eng(v, u, d);
  const BITS = '101100011110001001101011';
  const RB = 96000;
  const mono = (s) => `<span class="mono">${s}</span>`;
  const fas = (k) => { const m = X.MODS[k]; return X.groups(BITS, m.n).map((g) => { const p = m.map[g]; return `${mono(g)} → ${num(p.A, 3)}∠${num(p.ph, 1)}°`; }).join('<br>'); };
  const tp1 = [['FSK', 'fsk'], ['QPSK', 'qpsk'], ['4-ASK', 'ask4'], ['16-QAM', 'qam16']];
  const pcm = [['Voz telefónica', 8e3, 8, 1], ['Audio de alta calidad', 48e3, 16, 2], ['Sensores industriales', 2e3, 12, 8]];
  const fdmW = [20, 20, 15, 15, 10, 10, 5, 5];
  let f0 = 0;
  const fdm = fdmW.map((w) => { const a = f0; f0 = a + w + 2; return [a, a + w]; });
  const fdmTot = fdm.at(-1)[1];

  LESSONS.push(
    {
      id: 'modulacion-intro',
      module: 'u8',
      title: 'Modulación: por qué y de qué tipos',
      keywords: 'modulación portadora moduladora demodulación módem tipos de modulación analógica digital por pulsos codificación de línea AM FM PM índice de modulación sobremodulación antena longitud de onda FDM',
      tldr: 'Modular es colocar la información (señal <strong>moduladora</strong>) en una <strong>portadora</strong> de alta frecuencia, variando su amplitud, frecuencia o fase. Se modula para que las antenas tengan tamaños razonables, para compartir el espectro (<strong>FDM</strong>), para adaptar la señal al medio y para mejorar la inmunidad al ruido. Según moduladora y portadora: <mark>analógica, digital, por pulsos y codificación de línea</mark>.',
      goals: ['Explicar las razones para modular.', 'Clasificar las modulaciones según moduladora y portadora.', 'Describir AM, FM y PM.'],
      body: `
        ${def('Modulación', 'Proceso de colocar la información contenida en una señal, generalmente de baja frecuencia, sobre una señal de alta frecuencia (portadora), que sufre la modificación de alguno de sus parámetros (amplitud, frecuencia o fase) en función de la moduladora.', 'Guía de la Unidad 8')}
        <p>La <strong>demodulación</strong> es el proceso inverso. Un <strong>módem</strong> contiene modulador y demodulador.</p>
        <h2>Por qué modular</h2>
        <ul><li>Si todos transmitieran en banda base, se interferirían: con portadoras distintas se comparte el espectro (<strong>FDM</strong>).</li>
        <li>Las antenas deben medir del orden de λ/4: para 3 kHz serían 25 km; a 100 MHz, 75 cm.</li>
        <li>A altas frecuencias la transmisión es más eficiente y se adapta a las características del medio.</li>
        <li>Algunas modulaciones (FM) mejoran la inmunidad al ruido.</li></ul>
        ${table(['Moduladora', 'Portadora', 'Tipo', 'Ejemplos'], [['Analógica a(t)', 'Analógica', '<strong>Modulación analógica</strong>', 'AM, FM, PM'], ['Digital d(t)', 'Analógica', '<strong>Modulación digital</strong>', 'ASK, FSK, PSK, QAM'], ['Analógica a(t)', 'Digital (tren de pulsos)', '<strong>Modulación por pulsos</strong>', 'PAM, PWM (PDM), PPM, PCM'], ['Digital d(t)', 'Digital', '<strong>Codificación de línea</strong>', 'NRZ, Manchester, AMI (Unidad 7)']])}
        <h2>Modulación analógica</h2>
        ${table(['Tipo', 'Qué varía', 'Características'], [['<strong>AM</strong>', 'Amplitud de la portadora', 'Simple; sensible al ruido de amplitud; con índice m &gt; 1 hay sobremodulación'], ['<strong>FM</strong>', 'Frecuencia instantánea', 'Amplitud constante: más inmune al ruido; más ancho de banda'], ['<strong>PM</strong>', 'Fase', 'Modulación angular, emparentada con FM']])}
        ${lab(0)}`,
      labs: [{ type: 'analog', title: 'AM, FM y PM', intro: 'Mové el índice de modulación. En AM probá m > 1: ¿qué le pasa a la envolvente?', kind: 'am' }],
      quiz: [
        { q: 'La señal que transporta la información en la modulación es…', o: ['la portadora', 'la moduladora', 'el ruido', 'el filtro'], a: 1, e: 'La portadora es la de alta frecuencia.' },
        { q: 'Modulación con moduladora digital y portadora analógica:', o: ['analógica', 'digital (ASK, FSK, PSK)', 'por pulsos', 'codificación de línea'], a: 1, e: 'Es lo que hace un módem.' },
        { q: 'Una razón para modular es…', o: ['eliminar el ruido térmico', 'usar antenas de tamaño razonable', 'reducir la entropía', 'aumentar la BER'], a: 1, e: 'Las antenas escalan con λ.' },
        { q: 'FM es más inmune al ruido que AM porque…', o: ['usa menos ancho de banda', 'la información no está en la amplitud', 'tiene más potencia', 'no usa portadora'], a: 1, e: 'El ruido afecta sobre todo la amplitud.' },
        { q: 'PAM, PWM y PPM son modulaciones…', o: ['analógicas', 'digitales', 'por pulsos', 'de línea'], a: 2, e: 'Moduladora analógica, portadora de pulsos.' },
      ],
      open: [
        { t: 'text', q: 'Nombrá tres razones para modular una señal.', k: [['antena'], ['fdm', 'multiplex', 'compartir', 'espectro', 'interfer'], ['eficien', 'alta frecuencia', 'medio', 'adapt'], ['ruido']], need: 3, e: '<p>Para que las antenas tengan tamaños razonables; para compartir el espectro entre usuarios (FDM) sin interferirse; para adaptar la señal al medio y transmitir con más eficiencia a alta frecuencia; y algunas modulaciones mejoran la inmunidad al ruido.</p>' },
        { t: 'text', q: 'Clasificá las modulaciones según el tipo de moduladora y de portadora.', k: [['analogica'], ['digital'], ['pulsos'], ['codificacion de linea', 'linea']], need: 4, e: '<p>Analógica-analógica: modulación analógica (AM, FM, PM). Digital-analógica: modulación digital (ASK, FSK, PSK, QAM). Analógica-pulsos: modulación por pulsos (PAM, PWM, PPM, PCM). Digital-digital: codificación de línea.</p>' },
      ],
    },
    {
      id: 'modulacion-digital',
      module: 'u8',
      title: 'Modulación digital: ASK, FSK, PSK y QAM',
      keywords: 'ASK OOK FSK PSK BPSK DPSK QPSK 8-PSK 16-PSK M-aria QAM 8-QAM 16-QAM constelación fasor diagrama I Q bit baudio símbolo tasa de símbolos Tomasi',
      tldr: 'Se varía la <strong>amplitud</strong> (ASK), la <strong>frecuencia</strong> (FSK) o la <strong>fase</strong> (PSK) de la portadora según los bits. Las <strong>M-arias</strong> agrupan n = log₂M bits por símbolo: QPSK (4 fases, 2 bits), 8-PSK, y <mark>QAM</mark>, que combina amplitud y fase (M ≤ fases × amplitudes). Cada símbolo es un punto en el <strong>diagrama de constelación</strong>; la tasa de símbolos es r = R/n.',
      goals: ['Describir ASK, FSK y PSK con ventajas y desventajas.', 'Calcular M, n, cantidad de símbolos, baudios y T<sub>s</sub> (TP 8-I, ejercicios 1 y 3).', 'Deducir los fasores y la constelación de 8-PSK, 16-PSK, 8-QAM y 16-QAM (ejercicio 2).'],
      body: `
        <h2>Binarias</h2>
        ${table(['Modulación', 'Qué cambia con el bit', 'Ventajas', 'Desventajas'], [
          ['<strong>ASK</strong> (OOK si un nivel es 0)', 'Amplitud: 1 → A, 0 → 0', 'Simple y barata; usada en fibra óptica (luz encendida/apagada)', 'Muy sensible al ruido y a cambios de ganancia'],
          ['<strong>FSK</strong>', 'Frecuencia: 1 → f₁, 0 → f₂', 'Amplitud constante: robusta al ruido de amplitud', 'Más ancho de banda'],
          ['<strong>PSK / BPSK</strong>', 'Fase: 0° y 180°', 'La más robusta al ruido de las tres', 'Necesita referencia de fase en el receptor (DPSK la toma del símbolo anterior)'],
        ])}
        <h2>M-arias: varios bits por símbolo</h2>
        ${eq('n = log₂M &nbsp;&nbsp; r = R/n [baudios] &nbsp;&nbsp; T<sub>s</sub> = 1/r = n·T<sub>b</sub>', 'Bits por símbolo y tasa de símbolos')}
        <p>Al aumentar M se mandan más bits con el mismo ancho de banda (que depende de la tasa de símbolos), pero los puntos quedan más juntos y el sistema se vuelve más sensible al ruido.</p>
        ${table(['Entrada', 'Fase QPSK (cátedra)'], [['00', '135°'], ['01', '225° (−135°)'], ['10', '45°'], ['11', '315° (−45°)']])}
        <p>QPSK es un modulador BPSK doble con desplazamientos de 90°: 2 bits por símbolo. Ejemplo 8-QAM de la guía: T<sub>s</sub> = 125 µs → r = 8 kbaudios; R = 8000 × log₂8 = <strong>24 kbps</strong>.</p>
        <h2>QAM</h2>
        <p>Combina ASK y PSK con máximo contraste entre símbolos. Como la amplitud es más vulnerable al ruido, siempre hay <strong>más fases que amplitudes</strong>:</p>
        ${eq('M ≤ (n.º de fases) × (n.º de amplitudes)', 'Puntos de una constelación QAM')}
        ${lab(0)}
        ${note('Los fasores dependen de la tabla que use la cátedra. Aquí: QPSK, 8-PSK y 8-QAM como en Tomasi (8-QAM: amplitudes 0,765 y 1,848 en ±45° y ±135°); 16-PSK cada 22,5° en código Gray; 16-QAM con 2 bits para I y 2 para Q (00 → −3, 01 → −1, 11 → +1, 10 → +3). En el parcial, usá la tabla que te den.', 'warn')}`,
      labs: [{ type: 'modulation', title: 'Bits, símbolos y constelación', intro: 'La cadena y la tasa del TP 8. Cambiá la modulación y mirá cuántos símbolos hacen falta y qué puntos se usan.', bits: BITS, rate: String(RB), mod: 'qpsk' }],
      exercises: [
        { title: 'Telemetría por radioenlace: bits, símbolos y tasas', official: '8.1', level: 2, prompt: `<p>Cadena ${mono(BITS)} con R<sub>b</sub> = 96 kbit/s. Completar M, n, r, T<sub>s</sub> y cantidad de símbolos para FSK, QPSK, 4-ASK y 16-QAM (agrupando desde la izquierda). 1) Secuencia de símbolos. 2) Formas de onda. 3) ¿Por qué QPSK y 4-ASK tienen la misma tasa de símbolos? 4) ¿Cuál transmite menos símbolos?</p>`,
          solution: { explain: `${table(['Modulación', 'M', 'n', 'Símbolos', 'r', 'T<sub>s</sub>'], tp1.map(([nm, k]) => { const n = X.MODS[k].n; return [nm, 2 ** n, n, BITS.length / n, eng(RB / n, 'baud'), eng(n / RB, 's')]; }))}
            <p><b>1)</b> FSK: cada bit es un símbolo (24). QPSK y 4-ASK: ${mono(X.groups(BITS, 2).join(' '))}. 16-QAM: ${mono(X.groups(BITS, 4).join(' '))}.</p>
            <p><b>2)</b> En el laboratorio: FSK alterna dos frecuencias, QPSK cambia la fase cada 2 bits, 4-ASK cambia la amplitud cada 2 bits, 16-QAM cambia amplitud y fase cada 4 bits.</p>
            <p><b>3)</b> Porque las dos llevan n = 2 bits por símbolo: r = R<sub>b</sub>/2 = 48 kbaud. Difieren en qué distinguen (fases o amplitudes), no en cuántos bits mueven.</p>
            <p><b>4)</b> <strong>16-QAM</strong>: 6 símbolos en vez de 24 (FSK) o 12 (QPSK, 4-ASK); a cambio, necesita mejor SNR.</p>` } },
        { title: 'Fasores y constelaciones', official: '8.2', level: 3, prompt: `<p>Deducir los fasores y graficar la constelación de ${mono(BITS)} con a) 8-PSK, b) 16-PSK, c) 8-QAM, d) 16-QAM.</p>`,
          solution: { explain: `${table(['8-PSK (3 bits)', '16-PSK (4 bits)', '8-QAM (3 bits)', '16-QAM (4 bits, amplitud normalizada)'], [[fas('psk8'), fas('psk16'), fas('qam8'), fas('qam16')]])}<p>Las constelaciones están en el laboratorio de la lección (elegí cada modulación: los puntos usados por la cadena aparecen resaltados). Las PSK tienen todos los puntos sobre un círculo (amplitud constante); las QAM, en varios anillos.</p>` } },
        { title: 'Velocidad de salida de cada modulador', official: '8.3', level: 1, prompt: '<p>Velocidad de salida (baudios) de los moduladores del ejercicio anterior con una fuente de 28 800 bps.</p>', solution: { explain: `${table(['Modulador', 'n', 'r = 28 800/n'], [['8-PSK', 3, '9600 baudios'], ['16-PSK', 4, '7200 baudios'], ['8-QAM', 3, '9600 baudios'], ['16-QAM', 4, '7200 baudios']])}` } },
      ],
      quiz: [
        { q: 'En OOK…', o: ['un nivel de amplitud es cero', 'cambia la frecuencia', 'cambia la fase', 'se usan 4 niveles'], a: 0, e: 'On-Off Keying, un caso de ASK.' },
        { q: '¿Cuántos bits por símbolo lleva 64-QAM?', o: ['4', '6', '8', '64'], a: 1, e: 'log₂64.' },
        { q: 'R = 48 kbps con 16-QAM. La tasa de símbolos es…', o: ['48 kbaud', '24 kbaud', '12 kbaud', '3 kbaud'], a: 2, e: '48 000/4.' },
        { q: 'En QAM hay más fases que amplitudes porque…', o: ['las fases son más baratas', 'los cambios de amplitud son más sensibles al ruido', 'es una norma', 'la fase no ocupa ancho de banda'], a: 1, e: 'Guía de la Unidad 8.' },
        { q: 'En la QPSK de la cátedra, el dibit 10 tiene fase…', o: ['45°', '135°', '225°', '315°'], a: 0, e: '00 → 135°, 01 → 225°, 11 → 315°.' },
        { q: 'La modulación binaria más robusta al ruido es…', o: ['ASK', 'FSK', 'PSK', 'OOK'], a: 2, e: 'Los símbolos están en fases opuestas.' },
        { q: 'Un diagrama de constelación muestra…', o: ['la señal en el tiempo', 'cada símbolo como un punto de amplitud y fase (I, Q)', 'el espectro', 'la BER'], a: 1, e: 'Cada punto es un símbolo.' },
      ],
      open: [
        { t: 'num', q: 'Un modulador 8-QAM recibe 36 kbps. ¿Cuántos baudios entrega?', a: 12000, u: 'baud', e: '<p>r = 36 000/3 = 12 000 baudios.</p>' },
        { t: 'num', q: 'Símbolos de 50 µs con 32 estados: ¿tasa de bits en kbps?', a: 100, u: 'kbps', e: '<p>r = 1/50 µs = 20 000 baud; R = 20 000 × 5 = 100 kbps.</p>' },
        { t: 'num', q: '¿Cuántos símbolos hacen falta para enviar 48 bits con 8-PSK?', a: 16, u: 'símbolos', e: '<p>48/3 = 16 símbolos.</p>' },
        { t: 'text', q: '¿Por qué QPSK y 4-ASK tienen la misma tasa de símbolos si sus constelaciones son distintas?', k: [['2 bits', 'dos bits', 'n = 2', 'n=2', 'log2 4', '4 simbolos', 'cuatro'], ['fase'], ['amplitud']], e: '<p>Porque ambas tienen M = 4 símbolos y llevan n = 2 bits por símbolo: r = R/2. La diferencia es que QPSK distingue los símbolos por la fase y 4-ASK por la amplitud (más sensible al ruido).</p>' },
      ],
    },
    {
      id: 'qam-adaptativo',
      module: 'u8',
      title: 'n-QAM adaptativo: SNR y orden de modulación',
      keywords: 'QAM adaptativo SNR BER 10^-7 orden de modulación 16-QAM 64-QAM 256-QAM 1024-QAM 4096-QAM constelación con ruido eficiencia espectral radioenlace',
      tldr: 'Las modulaciones de orden alto (256-QAM, 1024-QAM) dan más bits por símbolo pero necesitan más SNR: sus puntos están más juntos. El <strong>QAM adaptativo</strong> elige en cada momento el mayor orden que la SNR del canal soporta con la BER objetivo, y baja cuando el canal empeora. Con la tabla de la cátedra: <mark>bits/símbolo ↔ SNR mínima para BER &lt; 10⁻⁷</mark>.',
      goals: ['Interpretar la tabla SNR vs orden de QAM en sus dos sentidos.', 'Elegir el orden de QAM y la tasa de datos para una SNR dada (TP 8-I, ejercicio 4).'],
      body: `
        ${table(['Bits/símbolo', 'QAM', 'SNR [dB] para BER &lt; 10⁻⁷'], [[4, '16-QAM', '21,8'], [6, '64-QAM', '27,8'], [8, '256-QAM', '33,8'], [9, '512-QAM', '36,8'], [10, '1024-QAM', '39,8'], [12, '4096-QAM', '45,8'], [14, '16384-QAM', '51,8']])}
        <p>La tabla se lee de dos formas: (1) ¿qué SNR mínima hace falta para modular n bits por símbolo?; (2) ¿cuántos bits se pueden modular con una SNR dada? Cada 2 bits más por símbolo cuestan unos 6 dB.</p>
        ${lab(0)}
        <p>Ventaja: máxima tasa posible en cada momento (con buen tiempo, 1024-QAM; con lluvia, 64-QAM o QPSK) sin perder el enlace. Desventaja: el ancho de banda útil y la tasa varían con el canal.</p>`,
      labs: [{ type: 'constellation', title: 'Constelación con ruido', intro: 'Bajá la SNR hasta que los puntos se mezclen. ¿Con qué SNR 64-QAM empieza a equivocarse?', M: 16, snr: 22 }],
      exercises: [
        { title: 'Mejor tasa con SNR de 43,9 dB', official: '8.4', level: 1, prompt: '<p>Un modulador trabaja a 1000 baudios y el canal tiene SNR = 43,9 dB. ¿Cuál es su mejor tasa de datos? (usar la tabla de la cátedra)</p>', solution: { explain: '<p>Se busca el mayor orden cuya SNR mínima no supere 43,9 dB: 1024-QAM pide 39,8 dB (sí) y 4096-QAM 45,8 dB (no). → <strong>1024-QAM, 10 bits/símbolo</strong>. R = 1000 × 10 = <strong>10 kbps</strong>.</p>' } },
      ],
      quiz: [
        { q: 'Con SNR = 30 dB, el mayor orden de la tabla es…', o: ['16-QAM', '64-QAM', '256-QAM', '1024-QAM'], a: 1, e: '256-QAM pide 33,8 dB.' },
        { q: 'Si el canal empeora, un sistema adaptativo…', o: ['sube el orden de QAM', 'baja el orden de QAM', 'mantiene el orden', 'apaga el enlace'], a: 1, e: 'Menos puntos, más separados.' },
        { q: '256-QAM necesita más SNR que 16-QAM porque…', o: ['usa más potencia', 'sus puntos están más juntos', 'tiene menos fases', 'usa FSK'], a: 1, e: 'El ruido mueve los puntos al vecino.' },
        { q: 'A 2000 baudios con 256-QAM se transmiten…', o: ['8 kbps', '16 kbps', '512 kbps', '2 kbps'], a: 1, e: '2000 × 8.' },
      ],
      open: [
        { t: 'num', q: 'Canal con SNR 35 dB y modulador de 5000 baudios. Según la tabla, ¿mejor tasa en kbps?', a: 40, u: 'kbps', e: '<p>256-QAM (33,8 dB ≤ 35 &lt; 36,8): 8 bits × 5000 = 40 kbps.</p>' },
        { t: 'text', q: '¿Qué ventaja y qué precio tienen las modulaciones QAM de orden alto?', k: [['bits', 'velocidad', 'tasa', 'eficiencia'], ['ruido', 'snr', 'interferencia']], e: '<p>Llevan más bits por símbolo: más velocidad y eficiencia espectral con el mismo ancho de banda. El precio es que son mucho menos resistentes al ruido y la interferencia: necesitan más SNR para la misma BER.</p>' },
      ],
    },
    {
      id: 'pcm',
      module: 'u8',
      title: 'Modulación por pulsos y PCM',
      keywords: 'PAM PWM PDM PPM PCM muestreo retención cuantificación codificación niveles 2^n error de cuantificación cuantificación uniforme no uniforme ley A ley mu compansión 64 kbps 8 kHz 8 bits CD 44,1 kHz códec',
      tldr: 'En la modulación por pulsos la amplitud de cada muestra controla la <strong>amplitud</strong> (PAM), el <strong>ancho</strong> (PWM) o la <strong>posición</strong> (PPM) de un pulso. <mark>PCM</mark> va más allá: <strong>muestrea</strong>, <strong>cuantifica</strong> (redondea a 2ⁿ niveles) y <strong>codifica</strong> cada muestra en n bits. Tasa = f<sub>s</sub> × n × canales: la voz telefónica, 8 kHz × 8 bits = 64 kbps.',
      goals: ['Comparar PAM, PWM y PPM.', 'Describir las tres etapas de PCM.', 'Explicar la cuantificación uniforme y no uniforme (ley A, ley µ).', 'Calcular tasa, niveles y almacenamiento de PCM (TP 8-II, ejercicio 1).'],
      body: `
        <h2>PAM, PWM y PPM</h2>
        ${table(['Tipo', 'La muestra controla', 'Ventajas', 'Desventajas'], [['<strong>PAM</strong>', 'La amplitud del pulso', 'Simple: es el primer paso de PCM (muestreo y retención)', 'Sensible al ruido de amplitud'], ['<strong>PWM</strong> (PDM)', 'El ancho (duración) del pulso', 'Más inmune al ruido; control de motores y potencia', 'Potencia variable; más ancho de banda'], ['<strong>PPM</strong>', 'La posición del pulso dentro de su ranura (más amplitud, más a la derecha)', 'Pulsos de ancho y amplitud constantes: potencia constante', 'Necesita sincronismo preciso']])}
        <h2>PCM: las tres etapas</h2>
        <ol><li><strong>Muestreo y retención</strong> (PAM): previo filtro pasa bajos; f<sub>s</sub> ≥ 2f<sub>máx</sub>; la muestra se retiene mientras se mide.</li>
        <li><strong>Cuantificación</strong>: cada muestra se asigna al nivel más cercano de 2ⁿ niveles. La diferencia es el <strong>error (ruido) de cuantificación</strong>, como máximo Δ/2.</li>
        <li><strong>Codificación</strong>: cada nivel se escribe con n bits. El conjunto codificador + decodificador es el <strong>códec</strong>.</li></ol>
        ${lab(0)}
        ${eq('Niveles = 2ⁿ &nbsp;&nbsp; R = f<sub>s</sub> · n · canales [bps]', 'PCM')}
        <p>Ejemplos de la guía: telefonía, 8000 muestras/s × 8 bits = <strong>64 kbps</strong>; CD, 44 100 × 16 = <strong>705,6 kbps</strong> por canal.</p>
        <h2>Cuantificación uniforme y no uniforme</h2>
        <p>Con escalones iguales, las señales débiles quedan con muy pocos niveles: el error relativo es grande. Soluciones: más niveles (más bits) o <strong>cuantificación no uniforme</strong>: más niveles para amplitudes chicas y menos para las grandes (compansión). En telefonía, 256 intervalos (8 bits): <strong>ley A</strong> (Europa, Argentina: 13 segmentos) y <strong>ley µ</strong> (EE. UU., Japón).</p>
        ${note('Ventajas de lo digital: inmunidad al ruido (se regenera en vez de amplificar), almacenamiento y procesamiento, compresión, medición sencilla y detección y corrección de errores.', 'tip')}`,
      labs: [{ type: 'pcm', title: 'Muestreo, cuantificación y codificación', intro: 'Subí y bajá los bits por muestra: mirá el escalón, el error y la SQNR.', n: 3, k: 12 }],
      exercises: [
        { title: 'PCM y almacenamiento de tres servicios', official: '8.5', level: 2, prompt: '<p>Voz telefónica (8 kHz, 8 bits, 1 canal), audio de alta calidad (48 kHz, 16 bits, 2 canales) y sensores (2 kHz, 12 bits, 8 canales). 1) Tasa de cada servicio y total. 2) Niveles por muestra. 3) Frecuencia máxima de las señales. 4) Almacenamiento por hora en Mbits. 5) ¿Por qué esto no predice el tamaño de un archivo comprimido?</p>',
          solution: { explain: `${table(['Servicio', 'Tasa f<sub>s</sub>·n·canales', 'Niveles 2ⁿ', 'f<sub>máx</sub> = f<sub>s</sub>/2', 'Por hora (×3600)'], pcm.map(([s, fs, b, c]) => [s, eng(fs * b * c, 'bps'), num(2 ** b), eng(fs / 2, 'Hz'), `${num((fs * b * c * 3600) / 1e6, 1)} Mbit`]))}
            <p><b>1)</b> Total: ${eng(pcm.reduce((a, [, fs, b, c]) => a + fs * b * c, 0), 'bps')}. <b>4)</b> Total por hora: ${num(pcm.reduce((a, [, fs, b, c]) => a + fs * b * c * 3600, 0) / 1e6, 1)} Mbit (≈ ${num(pcm.reduce((a, [, fs, b, c]) => a + fs * b * c * 3600, 0) / 8e9, 2)} GB).</p>
            <p><b>3)</b> Por Nyquist, la máxima frecuencia representable es la mitad de f<sub>s</sub> (en la práctica algo menos por el filtro antialiasing).</p>
            <p><b>5)</b> PCM sin compresión manda todas las muestras con todos sus bits, siempre igual. Un compresor aprovecha la redundancia y lo que el oído no percibe (MP3, AAC) o la repetición de los datos: el tamaño final depende del contenido (silencio, ruido, música) y del algoritmo, no solo de f<sub>s</sub>, n y canales.</p>` } },
      ],
      quiz: [
        { q: 'En PPM, la información está en…', o: ['la amplitud del pulso', 'el ancho del pulso', 'la posición del pulso', 'la frecuencia de la portadora'], a: 2, e: 'Ancho y amplitud constantes.' },
        { q: 'Las tres etapas de PCM son…', o: ['modulación, filtrado y amplificación', 'muestreo, cuantificación y codificación', 'codificación, multiplexación y modulación', 'muestreo, compresión y cifrado'], a: 1, e: 'Muestreo y retención primero.' },
        { q: 'Con 8 bits por muestra hay…', o: ['8 niveles', '16 niveles', '256 niveles', '64 niveles'], a: 2, e: '2⁸.' },
        { q: 'La tasa de la voz telefónica PCM es…', o: ['8 kbps', '56 kbps', '64 kbps', '128 kbps'], a: 2, e: '8000 × 8.' },
        { q: 'La cuantificación no uniforme…', o: ['da más niveles a las amplitudes chicas', 'da más niveles a las grandes', 'usa un solo nivel', 'elimina el muestreo'], a: 0, e: 'Ley A y ley µ.' },
        { q: 'En Argentina la telefonía usa…', o: ['ley µ', 'ley A', 'cuantificación uniforme', 'PPM'], a: 1, e: 'Norma europea.' },
      ],
      open: [
        { t: 'num', q: 'Audio estéreo a 44,1 kHz y 16 bits. ¿Tasa PCM en kbps? (1 decimal)', a: 1411.2, u: 'kbps', e: '<p>44 100 × 16 × 2 = 1 411 200 bps = 1411,2 kbps.</p>' },
        { t: 'num', q: 'Un sensor de 1 kHz de f<sub>máx</sub> se muestrea a la frecuencia de Nyquist con 10 bits. ¿Bits por segundo?', a: 20000, u: 'bps', e: '<p>f<sub>s</sub> = 2 kHz; R = 2000 × 10 = 20 000 bps.</p>' },
        { t: 'num', q: '¿Cuántos Mbit ocupa una hora de voz telefónica PCM sin compresión? (1 decimal)', a: 230.4, u: 'Mbit', e: '<p>64 000 × 3600 = 230,4 Mbit.</p>' },
        { t: 'text', q: '¿Qué es el error de cuantificación y cómo se reduce?', k: [['diferencia', 'redonde', 'aproxim'], ['nivel'], ['bits', 'niveles', 'no uniforme', 'ley a', 'ley mu']], need: 3, e: '<p>Es la diferencia entre el valor real de la muestra y el nivel de cuantificación al que se redondea (como máximo medio escalón). Se reduce usando más bits por muestra (más niveles) o cuantificación no uniforme (ley A o µ), que da más niveles a las señales débiles.</p>' },
      ],
    },
    {
      id: 'multiplexacion',
      module: 'u8',
      title: 'Multiplexación: FDM, TDM y WDM',
      keywords: 'multiplexación multicanalización FDM división de frecuencia banda de guarda TDM división de tiempo síncrono estadístico ranura trama bit de sincronismo eficiencia WDM longitud de onda',
      tldr: 'Multiplexar es compartir un medio entre varias señales. <strong>FDM</strong>: cada canal en su banda de frecuencias, separada por <strong>bandas de guarda</strong>. <strong>TDM</strong>: cada fuente en su <strong>ranura de tiempo</strong> dentro de una trama (síncrono: ranura fija; estadístico: según demanda). <strong>WDM</strong>: FDM con colores de luz en la fibra. Ancho FDM = Σ anchos + guardas; tasa TDM = bits por trama × tramas por segundo.',
      goals: ['Calcular el ancho total y el mapa espectral de un sistema FDM (TP 8-II, ejercicio 2).', 'Armar una trama TDM síncrona y calcular tamaño, tasa, duración y eficiencia (ejercicio 3).', 'Comparar TDM síncrono y estadístico, y explicar WDM.'],
      body: `
        <h2>FDM: división de frecuencia</h2>
        <p>Cada señal modula una portadora distinta; los canales se ubican uno al lado del otro en el espectro y se separan con <strong>bandas de guarda</strong> para que los filtros reales puedan separarlos. Radio, TV, telefonía analógica.</p>
        ${eq('B<sub>total</sub> = Σ B<sub>canal</sub> + (N − 1)·B<sub>guarda</sub> (sin guardas en los extremos)', 'Ancho de banda FDM')}
        ${lab(0)}
        <h2>TDM: división de tiempo</h2>
        <p>Las fuentes digitales se turnan: cada trama tiene una <strong>ranura</strong> para cada fuente, más bits de sincronismo para que el receptor encuentre el comienzo.</p>
        ${eq('Trama = N·b + s bits &nbsp;&nbsp; Tramas/s = R<sub>fuente</sub>/b &nbsp;&nbsp; R<sub>salida</sub> = (N·b + s)·tramas/s &nbsp;&nbsp; η = N·b/(N·b + s)', 'TDM síncrono')}
        ${table(['TDM síncrono', 'TDM estadístico (asíncrono)'], [['Cada fuente tiene su ranura fija en cada trama, transmita o no', 'Las ranuras se asignan solo a las fuentes con datos; hace falta dirección en cada ranura'], ['Simple; desperdicia ranuras con tráfico irregular', 'Aprovecha mejor el enlace; más complejo']])}
        ${lab(1)}
        <h2>WDM</h2>
        <p>Multiplexación por división de longitud de onda: varias portadoras ópticas (colores) en la misma fibra. Es FDM a frecuencias ópticas y es la razón de las enormes capacidades de la fibra.</p>`,
      labs: [
        { type: 'fdm', title: 'Mapa espectral FDM', intro: 'Los ocho canales del TP 8 con 2 kHz de guarda en un enlace de 110 kHz. ¿Cuánto falta? Probá achicar la guarda.', widths: fdmW, guard: 2, avail: 110 },
        { type: 'tdm', title: 'Trama TDM síncrona', intro: 'El caso del TP 8: 30 fuentes de 100 kbps, 8 bits por fuente y 1 bit de sincronismo.', n: 30, r: 100, b: 8, s: 1 },
      ],
      exercises: [
        { title: 'Ocho canales FDM', official: '8.6', level: 2, prompt: '<p>Ocho canales de 20, 20, 15, 15, 10, 10, 5 y 5 kHz se ubican desde 0 kHz, con 2 kHz de guarda entre adyacentes y sin guardas en los extremos. 1) Ancho total. 2) Banda y frecuencia central de cada canal. 3) Mapa espectral. 4) Si el enlace es de 110 kHz, déficit y modificación cuantificada.</p>',
          solution: { explain: `<p><b>1)</b> Σ anchos = 100 kHz; 7 guardas × 2 = 14 kHz → <strong>${fdmTot} kHz</strong>.</p>${table(['Canal', 'Ancho', 'Banda [kHz]', 'Central [kHz]'], fdm.map(([a, b], i) => [i + 1, fdmW[i], `${a} – ${b}`, num((a + b) / 2, 1)]))}
            <p><b>3)</b> El laboratorio de la lección dibuja el mapa a escala.</p>
            <p><b>4)</b> Déficit: ${fdmTot} − 110 = <strong>${fdmTot - 110} kHz</strong>. Opciones: reducir las guardas a (110 − 100)/7 = <strong>1,43 kHz</strong> (exige filtros más selectivos); o achicar los dos canales de 20 kHz a 18 kHz (96 + 14 = 110 kHz justos); o pasar un canal de 5 kHz a otro enlace (95 + 6 × 2 = 107 kHz).</p>` } },
        { title: 'TDM de 30 fuentes de 100 kbps', official: '8.7', level: 2, prompt: '<p>TDM síncrono de 30 fuentes de 100 kbps; cada trama lleva 8 bits de cada fuente y 1 bit de sincronismo. a) Tamaño de trama. b) Tasa de tramas. c) Duración de la trama. d) Tasa de salida. e) Eficiencia.</p>',
          solution: { explain: '<p><b>a)</b> 30 × 8 + 1 = <strong>241 bits</strong>. <b>b)</b> Cada fuente aporta 8 bits por trama: 100 000/8 = <strong>12 500 tramas/s</strong>. <b>c)</b> 1/12 500 = <strong>80 µs</strong>. <b>d)</b> 241 × 12 500 = <strong>3,0125 Mbps</strong>. <b>e)</b> 240/241 = <strong>99,59 %</strong>.</p>' } },
      ],
      quiz: [
        { q: 'Las bandas de guarda en FDM sirven para…', o: ['sincronizar', 'separar canales con filtros reales', 'corregir errores', 'aumentar la potencia'], a: 1, e: 'Evitan la interferencia entre canales vecinos.' },
        { q: 'En TDM síncrono, una fuente sin datos…', o: ['cede su ranura', 'ocupa igual su ranura (vacía)', 'se desconecta', 'usa FDM'], a: 1, e: 'El estadístico la cedería.' },
        { q: '10 fuentes de 64 kbps, 8 bits por ranura y 1 bit de sincronismo: tamaño de trama…', o: ['80', '81', '90', '640'], a: 1, e: '10·8 + 1.' },
        { q: 'WDM es…', o: ['TDM en cobre', 'FDM con longitudes de onda en fibra', 'un código de línea', 'una modulación digital'], a: 1, e: 'Colores de luz.' },
        { q: 'Tres canales de 4 kHz con guardas de 1 kHz entre ellos ocupan…', o: ['12 kHz', '14 kHz', '15 kHz', '16 kHz'], a: 1, e: '12 + 2·1.' },
      ],
      open: [
        { t: 'num', q: '24 canales de voz de 4 kHz en FDM con guardas de 0,5 kHz entre ellos. ¿Ancho total en kHz? (1 decimal)', a: 24 * 4 + 23 * 0.5, u: 'kHz', e: '<p>96 + 23 × 0,5 = 107,5 kHz.</p>' },
        { t: 'num', q: 'TDM: 4 fuentes de 250 kbps, 1 bit por fuente por trama, sin sincronismo. ¿Tasa de salida en Mbps?', a: 1, u: 'Mbps', e: '<p>Trama de 4 bits × 250 000 tramas/s = 1 Mbps.</p>' },
        { t: 'num', q: 'Trama TDM de 20 fuentes × 8 bits + 2 bits de sincronismo: ¿eficiencia en %? (2 decimales)', a: (160 / 162) * 100, tol: 0.001, u: '%', e: `<p>160/162 = ${num((160 / 162) * 100, 2)} %.</p>` },
        { t: 'text', q: 'Compará TDM síncrono y TDM estadístico.', k: [['fija', 'siempre', 'asignada'], ['demanda', 'datos', 'necesidad', 'activa'], ['desperdic', 'vacia', 'eficien', 'aprovecha']], e: '<p>En el síncrono cada fuente tiene una ranura fija en cada trama, la use o no: es simple pero desperdicia capacidad con tráfico irregular. En el estadístico las ranuras se asignan según la demanda (fuentes con datos), con una dirección en cada ranura: aprovecha mejor el enlace, a costa de complejidad.</p>' },
      ],
    },
    {
      id: 'jerarquias',
      module: 'u8',
      title: 'Jerarquías digitales: E1, T1, PDH y SDH',
      keywords: 'jerarquía digital E1 T1 32 time slots 24 canales 2,048 Mbps 1,544 Mbps 125 µs 8000 tramas PDH plesiócrona E2 E3 E4 T2 T3 SDH SONET STM-1 155,52 Mbps STM-4 STM-16 STM-64 sincrónica',
      tldr: 'La telefonía digital multiplexa canales de 64 kbps en TDM. <mark>E1</mark> (Europa): 32 ranuras de 8 bits cada 125 µs = <strong>2,048 Mbps</strong> (30 de voz + 2 de servicio). <mark>T1</mark> (EE. UU.): 24 ranuras + 1 bit = 193 bits cada 125 µs = <strong>1,544 Mbps</strong>. <strong>PDH</strong> agrupa tributarios con relojes casi iguales (bits de relleno); <strong>SDH</strong> es sincrónica: STM-1 = 155,52 Mbps y sus múltiplos STM-4, 16, 64.',
      goals: ['Calcular la tasa de E1 y T1 a partir de su trama.', 'Conocer los niveles de PDH.', 'Explicar las ventajas de SDH sobre PDH.'],
      body: `
        ${table(['', 'E1 (Europa, Argentina)', 'T1 (EE. UU., Japón)'], [['Canales de voz', '30 (+ 2 ranuras de sincronismo y señalización)', '24'], ['Trama', '32 ranuras × 8 bits = 256 bits', '24 × 8 + 1 bit de sincronismo = 193 bits'], ['Período de trama', '125 µs (8000 tramas/s)', '125 µs'], ['Velocidad', '256 × 8000 = 2,048 Mbps', '193 × 8000 = 1,544 Mbps'], ['Cuantificación', 'Ley A', 'Ley µ'], ['Código de línea', 'HDB3', 'B8ZS (antes AMI)']])}
        ${note('Las dos usan canales de voz PCM de 64 kbps (8000 muestras/s × 8 bits): por eso el período de trama es 125 µs, el tiempo entre dos muestras de un mismo canal.', 'tip')}
        <h2>PDH: jerarquía plesiócrona</h2>
        ${table(['Nivel europeo', 'Canales', 'Velocidad', 'Nivel americano', 'Canales', 'Velocidad'], [['E1', 30, '2,048 Mbps', 'T1', 24, '1,544 Mbps'], ['E2 = 4 × E1 + sinc.', 120, '8,448 Mbps', 'T2 = 4 × T1', 96, '6,312 Mbps'], ['E3', 480, '34,368 Mbps', 'T3', 672, '44,736 Mbps'], ['E4', 1920, '139,264 Mbps', 'T4', 4032, '274,176 Mbps']])}
        <p>“Plesiócrona” = casi sincrónica: cada tributario tiene su propio reloj, apenas distinto, y al multiplexar se agregan <strong>bits de relleno</strong>. Por eso los niveles no son múltiplos exactos y, para extraer un E1 de un E4, hay que demultiplexar todo escalón por escalón.</p>
        <h2>SDH: jerarquía sincrónica</h2>
        <p>Desarrollada en EE. UU. como <strong>SONET</strong> y adoptada por la UIT-T como SDH. Todos los equipos usan una referencia de reloj común. La trama básica es el <strong>STM-1</strong> (Synchronous Transport Module 1) de <strong>155,52 Mbps</strong>, que transporta tributarios E1, E3, E4 (PDH), ATM o IP. Los niveles superiores son múltiplos exactos: STM-4 (622 Mbps), STM-16 (2,5 Gbps), STM-64 (10 Gbps).</p>
        ${table(['PDH', 'SDH'], [['Relojes independientes, bits de relleno', 'Reloj común: sincrónica'], ['Para sacar un tributario hay que demultiplexar todos los niveles', 'Se puede insertar o extraer un tributario directamente (add-drop)'], ['Normas distintas en Europa, EE. UU. y Japón', 'Norma mundial; gran capacidad de gestión y protección (anillos)']])}`,
      quiz: [
        { q: 'La velocidad de un E1 es…', o: ['1,544 Mbps', '2,048 Mbps', '64 kbps', '155,52 Mbps'], a: 1, e: '32 × 8 × 8000.' },
        { q: 'Una trama T1 tiene…', o: ['256 bits', '193 bits', '32 ranuras', '125 bits'], a: 1, e: '24 × 8 + 1.' },
        { q: 'El período de trama de E1 y T1 es 125 µs porque…', o: ['es un estándar arbitrario', 'es el tiempo entre muestras de voz a 8 kHz', 'lo fija la fibra', 'es la mitad de 250 µs'], a: 1, e: '1/8000.' },
        { q: 'STM-1 transmite a…', o: ['2,048 Mbps', '34 Mbps', '155,52 Mbps', '2,5 Gbps'], a: 2, e: 'Trama básica de SDH.' },
        { q: 'Una desventaja de PDH es que…', o: ['es sincrónica', 'para extraer un tributario hay que demultiplexar todo', 'no usa TDM', 'no transporta voz'], a: 1, e: 'SDH permite add-drop directo.' },
        { q: 'E2 equivale aproximadamente a…', o: ['2 E1', '4 E1 + sincronismo', '8 E1', '30 E1'], a: 1, e: '8,448 Mbps.' },
      ],
      open: [
        { t: 'num', q: '¿Cuántos bits tiene una trama E1?', a: 256, u: 'bits', e: '<p>32 ranuras × 8 bits = 256 bits.</p>' },
        { t: 'num', q: 'Una trama de 193 bits se repite 8000 veces por segundo. ¿Velocidad en Mbps? (3 decimales)', a: 1.544, tol: 0.001, u: 'Mbps', e: '<p>193 × 8000 = 1 544 000 bps = 1,544 Mbps (T1).</p>' },
        { t: 'text', q: '¿Qué ventaja tiene SDH sobre PDH?', k: [['sincron', 'reloj comun', 'misma referencia'], ['extraer', 'insertar', 'add', 'drop', 'demultiplex', 'tributario']], e: '<p>SDH es sincrónica (todos los equipos usan una referencia de reloj común), así que un tributario se puede insertar o extraer directamente sin demultiplexar toda la jerarquía; además es una norma mundial con mejor gestión y protección. En PDH cada nivel tiene su reloj y bits de relleno.</p>' },
      ],
    },
  );
})();
