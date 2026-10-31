/* Unidad 9 (3er parcial): Equipos de comunicación de datos (DCE). Apunte de la cátedra 9.0 (módem, xDSL, DMT, DSLAM, VDSL, FTTx y PON)
   y sus lecturas: 9.1 Tecnologías de acceso de banda ancha, 9.2 ADSL, 9.3 Redes ópticas, 9.4 MODEM y 9.5 Tecnologías en redes PON.
   Además, TP 9, el cuestionario de la Unidad 9 (2025) y los ítems de MODEM y ADSL de los parciales (ver parciales.js). */
(() => {
  const { LESSONS, h } = window.GUIDE;
  const { note, def, table, eq, lab, flow, num } = h;

  // Bits por subportadora DMT: límite de Shannon (nQAM ≤ 1 + SNR) y criterio práctico de la lectura 9.2 (BER < 10⁻⁷: SNR ≈ 9,8 + 3n dB)
  const dmtBits = (snrDb) => {
    const theo = Math.floor(Math.log2(1 + 10 ** (snrDb / 10)) + 1e-9);
    const prac = Math.min(14, Math.floor((snrDb - 9.8) / 3 + 1e-9));
    return { theo, prac: prac < 2 ? 0 : prac };
  };
  // Lectura 9.2: tabla QAM contra SNR; la fórmula tiene que reproducirla
  [[21.8, 4], [27.8, 6], [33.8, 8], [36.8, 9], [39.9, 10], [45.9, 12], [51.9, 14]].forEach(([s, n]) => console.assert(dmtBits(s).prac === n, `dmtBits(${s})`));

  LESSONS.push(
    {
      id: 'modem',
      module: 'u9',
      title: 'El módem (DCE): clasificación, velocidad y normas V',
      keywords: 'módem MODEM DTE DCE data set modulador demodulador clasificación analógico digital RDSI cable módem partes scrambler ecualizador RTS CTS DCD banda vocal 300 3400 Hz 2400 Hz dúplex semidúplex 1200 Hz baudios bps dibit tribit Nyquist FSK PSK QAM TCM trellis convolución V.21 V.22 V.26 V.27 V.29 V.32 V.34 V.90 V.92 56K Bell 103',
      tldr: 'El <strong>módem</strong> (DCE) toma los datos del <strong>DTE</strong> y los convierte en una señal apta para la línea. El analógico usa la <strong>banda vocal</strong>: para datos quedan ≈ <mark>2400 Hz</mark> (600 a 3000 Hz), y su velocidad es <mark>R = B·log₂M</mark>, con B = 1200 Hz por sentido en dúplex o 2400 Hz en semidúplex. Para ir más rápido que los baudios que permite el canal se mandan más bits por símbolo (FSK → PSK → QAM → TCM), hasta los <strong>56 kbps</strong> de V.90, que logra evitar la cuantificación en un sentido.',
      goals: ['Definir DTE, DCE y módem, y clasificar los módems.', 'Recorrer los bloques del transmisor y el receptor de un módem.', 'Calcular la velocidad de un módem en dúplex y semidúplex.', 'Relacionar cada norma V con su modulación y su velocidad, y explicar por qué el techo es 56 kbps.'],
      body: `
        <h2>Definición: DTE y DCE</h2>
        ${def('Módem', 'El módem es un dispositivo que convierte las señales digitales procedentes de un emisor o fuente (por ejemplo, un ordenador) en señales analógicas, para su transmisión a través de un medio que puede ser un circuito telefónico o un circuito punto a punto.', 'Apunte de la Unidad 9, cátedra de Comunicación de Datos.')}
        <p>El nombre sale de sus dos funciones: <strong>MO</strong>dulador-<strong>DEM</strong>odulador. También se lo llama <em>data set</em>.</p>
        ${table(['Equipo', 'Qué es', 'Ejemplos'], [
          ['<strong>DTE</strong> (Data Terminal Equipment)', 'Equipo terminal de datos: genera o consume datos digitales', 'Terminal, computadora, impresora, fax'],
          ['<strong>DCE</strong> (Data Circuit-terminating Equipment)', 'Cualquier unidad funcional que transmita o reciba datos a través de una red en forma de señal digital o analógica. A nivel físico toma los datos del DTE, los convierte en una señal apropiada y la introduce en el enlace', 'Módem telefónico, módem ADSL, cable módem'],
        ])}
        ${flow('DTE (d(t) digital)', 'DCE: modula sobre la portadora p(t)', 'Línea: m(t) analógica', 'DCE: demodula', 'DTE (d(t) digital)')}
        <h2>Clasificación</h2>
        ${table(['Tipo', 'Cómo funciona', 'Velocidad'], [
          ['<strong>1. Analógico</strong> (a. externo, b. interno)', 'Convierte las señales digitales de la computadora en señales telefónicas analógicas y a la inversa, sobre la línea telefónica estándar', '9,6 a 56 kbps'],
          ['<strong>2. Digital</strong>', 'Necesita una línea digital: <strong>RDSI</strong> (Red Digital de Servicios Integrados), la evolución natural de la línea convencional. Puede usar los mismos hilos de cobre de la línea analógica', '128 kbps'],
          ['<strong>3. Cable módem</strong>', 'Accede a Internet por la red de TV por cable. Caja externa con dos conexiones: el cable coaxil a la pared y Ethernet a la computadora', 'Superior a los anteriores'],
        ])}
        <p>La lectura 9.4 los clasifica además por <strong>modo de transmisión</strong> (símplex, semidúplex, dúplex), <strong>técnica</strong> (asincrónico o sincrónico), <strong>uso de la línea</strong> (sub-banda de voz, banda vocal, banda ancha, líneas dedicadas), inteligencia (acepta comandos), fabricación (externo, tarjeta interna o de rack), ecualización (manual o automática), capacidad multipuerto (con un multiplexor TDM), seguridad (contraseña, listas de números, <em>callback</em>), selección de velocidades y voz/datos simultáneos.</p>
        <h2>Partes de un módem</h2>
        <p>Tres bloques: una <strong>fuente de potencia</strong> (alimenta los circuitos), un <strong>transmisor</strong> (pulsos digitales → señal analógica) y un <strong>receptor</strong> (el proceso inverso).</p>
        ${table(['Transmisor (hacia la línea)', 'Receptor (desde la línea)'], [
          ['1. <strong>Scrambler</strong>: aleatoriza los datos para que no haya rachas largas de 0 o 1', '1. <strong>Filtro y ecualizador</strong>: limpia y compensa la distorsión de la línea'],
          ['2. <strong>Codificador</strong> de datos', '2. <strong>Demodulador</strong>'],
          ['3. <strong>Modulador</strong>', '3. <strong>Decodificador</strong> de datos'],
          ['4. <strong>Filtro y amplificador</strong>', '4. <strong>Descrambler</strong>'],
        ])}
        <p>Los <strong>circuitos de control</strong> manejan el diálogo con el DTE: <em>Request to Send</em> (RTS, el DTE pide transmitir), <em>Clear to Send</em> (CTS, el módem habilita) y <em>Data Carrier Detect</em> (DCD, hay portadora en la línea). Los módems <strong>sincrónicos</strong> además recuperan el reloj de la señal recibida.</p>
        <h2>El ancho de banda telefónico</h2>
        <p>La línea telefónica tradicional deja pasar de <strong>300 Hz a 3300 Hz</strong> (3400 Hz en la lectura). Para voz se usa todo ese rango, porque se tolera mucha distorsión sin perder inteligibilidad. Los datos exigen más exactitud: el <strong>ancho de banda efectivo para datos es de 2400 Hz</strong>, de <strong>600 Hz a 3000 Hz</strong>.</p>
        <h2>Velocidad del módem</h2>
        ${eq('R = (1/T<sub>s</sub>)·log₂M = B<sub>M-ario</sub>·log₂M', 'Velocidad de un módem M-ario')}
        ${table(['Modo', 'Reparto de los 2400 Hz', 'B<sub>M-ario</sub>'], [
          ['<strong>Dúplex</strong>', 'Mitad para subir y mitad para bajar, al mismo tiempo', '1200 Hz por sentido'],
          ['<strong>Semidúplex</strong>', 'Toda la banda en un sentido por vez', '2400 Hz'],
        ])}
        <p>Ejemplo: un módem 16-QAM (4 bits por símbolo) logra 1200 × 4 = <strong>4800 bps</strong> por sentido en dúplex y 2400 × 4 = <strong>9600 bps</strong> en semidúplex (es la V.29).</p>
        ${lab(0)}
        <h2>Bits por segundo contra baudios</h2>
        <p><strong>bps</strong> es la cantidad de bits transferidos por segundo; el <strong>baudio</strong> (por Baudot) es la cantidad de cambios de estado de la señal por segundo. Nyquist (1928): un canal de ancho W admite como mucho <strong>2W baudios</strong>; para un canal de voz de 3 kHz son 6000 baudios. Para pasar ese límite cada cambio de señal lleva varios bits (Unidades 7 y 8):</p>
        ${table(['Modulación', 'Unidad', 'Bits/baudio', 'Bit rate con N baudios'], [
          ['ASK, FSK, 2-PSK', 'Bit', '1', 'N'], ['4-PSK, 4-QAM', 'Dibit', '2', '2N'], ['8-PSK, 8-QAM', 'Tribit', '3', '3N'], ['16-QAM', 'Quadbit', '4', '4N'],
          ['32-QAM', 'Pentabit', '5', '5N'], ['64-QAM', 'Hexabit', '6', '6N'], ['128-QAM', 'Septabit', '7', '7N'], ['256-QAM', 'Octabit', '8', '8N'],
        ])}
        <h2>Modulaciones de los módems de banda vocal</h2>
        <h3>FSK: 300 bps (Bell 103/113, ITU V.21)</h3>
        <p>La portadora alterna entre dos frecuencias: <strong>marca</strong> (1 lógico) y <strong>espacio</strong> (0 lógico). Para el dúplex, el que origina la llamada y el que responde usan pares de frecuencias distintos:</p>
        ${table(['Módem', '', 'Origen', 'Respuesta'], [['Bell 103/113', 'Marca', '1270 Hz', '2225 Hz'], ['', 'Espacio', '1070 Hz', '2025 Hz'], ['ITU V.21', 'Marca', '980 Hz', '1650 Hz'], ['', 'Espacio', '1180 Hz', '1850 Hz']])}
        <h3>PSK: dos fases, dibits y tribits</h3>
        <p>Con dos fases (0° = espacio, 180° = marca) se manda 1 bit por cambio. Con <strong>PSK multinivel</strong> el módem agrupa los bits y elige la fase según el grupo: <strong>V.26</strong> (2400 bps sincrónico, línea dedicada de 4 hilos) manda <strong>dibits</strong> con 4 fases (patrón A: 0°, 90°, 180°, 270°; patrón B: 45°, 135°, 225°, 315°); <strong>V.27</strong> (4800 bps) manda <strong>tribits</strong> con 8 fases separadas 45°. El modulador de cuatro fases separa los bits pares e impares en una rama en fase (I) y otra en cuadratura (Q).</p>
        <h3>QAM: V.29 a 9600 bps</h3>
        <p>QAM combina fase y amplitud. <strong>V.29</strong> usa una portadora de <strong>1700 Hz</strong> a <strong>2400 baudios</strong> con 16 puntos (8 fases y 4 amplitudes): 4 bits por cambio → <strong>9600 bps</strong>. El primer bit, junto con la fase, elige la amplitud; los otros tres usan los mismos saltos de fase que V.27.</p>
        <h3>TCM: modulación codificada Trellis</h3>
        <p>Los primeros módems de 14 400 bps usaban QAM con grupos de 6 bits 2400 veces por segundo, pero sus puntos quedaban tan <strong>amontonados</strong> que el ruido los hacía equivocar: en ciertas condiciones un módem de 9600 bps andaba mejor. <strong>TCM</strong> agrega un <strong>bit redundante</strong> a cada grupo con un <strong>codificador de convolución</strong>, y así tolera <strong>el doble de potencia de ruido</strong> que la QAM convencional: llegó a 33,6 kbps sobre la red telefónica.</p>
        <p>Codificador de convolución de la lectura: por cada bit de datos b<sub>i</sub> sale el par P<sub>i</sub>b<sub>i</sub>, con P<sub>i</sub> = b<sub>i</sub> ⊕ b<sub>i−1</sub> (el bit anterior arranca en 0). Para b₄b₃b₂b₁ = 1101 (entra primero b₁): P₁ = 1, P₂ = 1, P₃ = 1, P₄ = 0 → P₄b₄P₃b₃P₂b₂P₁b₁ = <strong>01111011</strong>.</p>
        <h2>Normas ITU-T (serie V)</h2>
        ${table(['Norma', 'Velocidad', 'Técnica', 'Modulación', 'Línea'], [
          ['V.21', '300 bps', 'Asincrónico', 'FSK', 'Conmutada'],
          ['V.22', '1200 bps', 'Asinc./sinc.', 'PSK', 'Conmutada/dedicada'],
          ['V.22bis', '2400 bps', 'Asincrónico', 'QAM', 'Conmutada'],
          ['V.23', '1200 bps', 'Asinc./sinc.', 'FSK', 'Conmutada'],
          ['V.26', '2400 bps', 'Sincrónico', 'PSK (dibits)', 'Dedicada'],
          ['V.27', '4800 bps', 'Sincrónico', 'PSK (tribits)', 'Dedicada'],
          ['V.29', '9600 bps', 'Sincrónico', 'QAM (16 puntos)', 'Dedicada'],
          ['V.32', '9600 bps', 'Asincrónico', 'TCM/QAM', 'Conmutada/dedicada'],
          ['V.32bis', '14 400 bps', 'Asincrónico', 'TCM/QAM', 'Conmutada/dedicada'],
          ['V.33', '14 400 bps', 'Sincrónico', 'TCM', 'Dedicada'],
          ['V.34', '28 800 y 33 600 bps (con compresión)', 'Asincrónico', 'TCM', 'Conmutada/dedicada'],
          ['V.90', '56 000 bps bajada / 33 600 bps subida', 'Asincrónico', 'TCM + PCM', 'Conmutada/dedicada'],
          ['V.92', '56 000 bps bajada / 48 000 bps subida', 'Asincrónico', 'TCM + PCM', 'Conmutada'],
        ])}
        <h2>Los módems de 56K: V.90 y V.92</h2>
        <p>En una llamada común la señal pasa dos veces por un conversor PCM y el <strong>ruido de cuantificación</strong> limita la velocidad a ≈ 33,6 kbps. Si uno de los extremos es un <strong>proveedor de Internet conectado en forma digital</strong> y la señal no pasa por un conversor PCM, se elimina la cuantificación en una dirección y la tasa sube a <strong>56 kbps</strong> (en ese sentido).</p>
        <p>V.90 (UIT, 1998; unificó las tecnologías X2 de 3COM y K56flex de Rockwell) exige: un extremo <strong>digital</strong> (troncal T1, RDSI PRI o BRI), soporte V.90 en <strong>los dos extremos</strong> y <strong>una sola conversión</strong> analógica-digital. V.92 (junio de 2000) agrega:</p>
        <ul>
          <li><strong>Modem on Hold</strong>: suspender la llamada de datos para atender una de voz y retomarla sin perder la conexión.</li>
          <li><strong>Quick Connect</strong>: si la línea no cambió, saltea parte de la secuencia de pruebas y reduce el tiempo de conexión un 50 % o más.</li>
          <li><strong>V.PCM Upstream</strong>: la subida llega a 48 000 bps (contra 33 600 en V.90). Compresión V.44 (V.90 usa V.42bis); fax a 14 400 bps en las dos.</li>
        </ul>
        ${note('El techo de 56 kbps del módem analógico es el <strong>problema</strong> que resuelve xDSL: en lugar de exprimir la banda vocal, usa el espectro del par de cobre que la telefonía deja <strong>sin usar</strong> (siguiente lección).', 'exam')}
        ${lab(1)}`,
      labs: [
        { type: 'calc', title: 'Velocidad de un módem de banda vocal', intro: 'R = B<sub>M-ario</sub>·log₂M sobre los 2400 Hz útiles para datos.',
          fields: [{ id: 'm', label: 'Modulación', options: ['2-PSK', '4-PSK / 4-QAM', '8-PSK', '16-QAM', '32-QAM', '64-QAM'], value: '16-QAM' }, { id: 'modo', label: 'Modo', options: ['Dúplex', 'Semidúplex'], value: 'Dúplex' }],
          run: (v) => { const M = { '2-PSK': 2, '4-PSK / 4-QAM': 4, '8-PSK': 8, '16-QAM': 16, '32-QAM': 32, '64-QAM': 64 }[v.m]; const B = v.modo === 'Dúplex' ? 1200 : 2400; const n = Math.log2(M); return `Bits por símbolo: log₂${M} = ${n}\nB = ${B} Hz (${v.modo === 'Dúplex' ? '2400 Hz repartidos en subida y bajada' : 'toda la banda en un sentido por vez'})\nR = ${B} × ${n} = ${num(B * n, 0)} bps${v.modo === 'Dúplex' ? ' por sentido' : ''}`; } },
        { type: 'classify', title: '¿Qué modulación usa cada norma?', buckets: ['FSK', 'PSK', 'QAM', 'TCM'], items: [
          { t: 'V.21 (300 bps)', b: 0, why: 'Marca y espacio en dos frecuencias.' }, { t: 'Bell 103', b: 0, why: '1270/1070 Hz al originar.' }, { t: 'V.26 (2400 bps, dibits)', b: 1, why: 'Cuatro fases.' },
          { t: 'V.27 (4800 bps, tribits)', b: 1, why: 'Ocho fases.' }, { t: 'V.29 (9600 bps a 2400 baudios)', b: 2, why: '16 puntos de fase y amplitud.' }, { t: 'V.22bis (2400 bps)', b: 2 },
          { t: 'V.33 (14 400 bps)', b: 3, why: 'Bit redundante de convolución.' }, { t: 'V.34 (28 800 bps)', b: 3 }, { t: 'V.23 (1200 bps)', b: 0 },
        ] },
      ],
      exercises: [
        { title: 'Velocidad de un módem dúplex y semidúplex', level: 1, prompt: '<p>Un módem usa la banda útil para datos de una línea telefónica (600 a 3000 Hz) con 8-PSK. a) ¿Qué velocidad alcanza en dúplex? b) ¿Y en semidúplex? c) ¿Cuántos baudios admitiría Nyquist en un canal de voz de 3 kHz?</p>',
          solution: { explain: '<p>8-PSK → log₂8 = 3 bits por símbolo.</p><p><b>a)</b> Dúplex: 2400 Hz repartidos en dos sentidos → B = 1200 Hz → R = 1200 × 3 = <strong>3600 bps</strong> por sentido.</p><p><b>b)</b> Semidúplex: B = 2400 Hz → R = 2400 × 3 = <strong>7200 bps</strong>.</p><p><b>c)</b> 2W = 2 × 3000 = <strong>6000 baudios</strong>; para superar ese número de bps hay que meter más bits por baudio (PSK multinivel, QAM, TCM).</p>' } },
        { title: 'Por qué 56K solo en un sentido', level: 2, prompt: '<p>Explique por qué un módem V.90 alcanza 56 kbps de bajada pero solo 33,6 kbps de subida, y qué condiciones necesita la conexión.</p>',
          solution: { explain: '<p>La velocidad del módem analógico la limita el <strong>ruido de cuantificación</strong> del conversor PCM de la central. Si el proveedor de Internet está conectado en forma <strong>digital</strong> (T1, RDSI PRI o BRI), en la bajada la señal no pasa por un conversor PCM: no hay cuantificación en ese sentido y se llega a 56 kbps. En la subida la señal del usuario sí se digitaliza en la central, así que queda en 33,6 kbps (V.92 lo lleva a 48 kbps con V.PCM Upstream).</p><p>Condiciones: un extremo digital, soporte V.90 en los dos extremos y una sola conversión analógica-digital.</p>' } },
        { title: 'Codificador de convolución (TCM)', level: 2, prompt: '<p>Un codificador de convolución genera, por cada bit de datos b<sub>i</sub>, el par P<sub>i</sub>b<sub>i</sub> con P<sub>i</sub> = b<sub>i</sub> ⊕ b<sub>i−1</sub> (registro inicial en 0). Codifique b₄b₃b₂b₁ = 1101 (entra primero b₁) y explique para qué sirve en un módem.</p>',
          solution: { explain: '<p>b₁ = 1, b₂ = 0, b₃ = 1, b₄ = 1.</p><p>P₁ = 1 ⊕ 0 = 1 · P₂ = 0 ⊕ 1 = 1 · P₃ = 1 ⊕ 0 = 1 · P₄ = 1 ⊕ 1 = 0.</p><p>Salida P₄b₄P₃b₃P₂b₂P₁b₁ = <strong>01111011</strong>.</p><p>Es el bit redundante de la <strong>modulación codificada Trellis</strong>: el receptor usa la secuencia completa para decidir qué punto de la constelación se mandó, lo que permite tolerar el doble de potencia de ruido que una QAM sin codificar.</p>' } },
      ],
      quiz: [
        { q: 'El DCE…', o: ['genera o consume los datos', 'toma los datos del DTE, los convierte en una señal apropiada y la introduce en el enlace', 'es siempre un módem analógico', 'es el medio de transmisión'], a: 1, e: 'Data Circuit-terminating Equipment.' },
        { q: 'El módem digital necesita una línea…', o: ['de fibra', 'RDSI, y alcanza 128 kbps', 'coaxil de TV', 'dedicada de 4 hilos'], a: 1, e: 'Red Digital de Servicios Integrados.' },
        { q: 'El ancho de banda efectivo de una línea telefónica para datos es…', o: ['300 a 3400 Hz', '2400 Hz (600 a 3000 Hz)', '4 kHz', '1,1 MHz'], a: 1, e: 'Los datos exigen más exactitud que la voz.' },
        { q: 'Un módem dúplex de banda vocal dispone, por sentido, de…', o: ['2400 Hz', '1200 Hz', '4000 Hz', '600 Hz'], a: 1, e: 'Los 2400 Hz se reparten entre subida y bajada.' },
        { q: 'V.29 logra 9600 bps porque…', o: ['usa FSK a 9600 baudios', 'usa 16 puntos de fase y amplitud (4 bits) a 2400 baudios', 'usa 8 fases a 3200 baudios', 'no tiene ruido de cuantificación'], a: 1, e: 'Portadora de 1700 Hz.' },
        { q: 'TCM mejora a la QAM convencional porque…', o: ['usa menos bits por símbolo', 'agrega un bit redundante con un codificador de convolución y tolera el doble de ruido', 'elimina el ruido de cuantificación', 'usa dos portadoras'], a: 1, e: 'Modulación codificada Trellis.' },
        { q: 'Los 56 kbps de V.90 se consiguen…', o: ['en los dos sentidos', 'en la bajada, si el proveedor está conectado en forma digital y no hay conversión PCM en ese sentido', 'solo con fibra', 'usando la banda de 25 kHz a 1104 kHz'], a: 1, e: 'Se elimina la cuantificación en una dirección.' },
        { q: 'La función “Quick Connect” de V.92…', o: ['sube la velocidad de subida a 48 kbps', 'reduce el tiempo de conexión salteando parte de las pruebas si la línea no cambió', 'permite atender una llamada de voz sin cortar los datos', 'comprime con V.44'], a: 1, e: 'Hasta 50 % menos de tiempo de conexión.' },
        { q: 'Un módem que manda tribits a 1600 baudios transmite…', o: ['1600 bps', '3200 bps', '4800 bps', '6400 bps'], a: 2, e: '3 × 1600: es V.27.' },
        { q: 'En el transmisor del módem, el scrambler…', o: ['filtra el ruido de la línea', 'aleatoriza los datos para evitar rachas largas de 0 o 1', 'detecta la portadora', 'ecualiza la línea'], a: 1, e: 'El receptor tiene el descrambler.' },
      ],
      open: [
        { t: 'num', q: '¿Qué velocidad alcanza un módem 16-QAM semidúplex sobre los 2400 Hz útiles de la línea telefónica? (en bps)', a: 9600, u: 'bps', e: '<p>R = 2400 × log₂16 = 2400 × 4 = 9600 bps.</p>' },
        { t: 'num', q: 'Un módem dúplex usa 64-QAM sobre la banda de datos de la línea telefónica. ¿Qué velocidad logra por sentido? (en bps)', a: 7200, u: 'bps', e: '<p>B = 1200 Hz por sentido; R = 1200 × 6 = 7200 bps.</p>' },
        { t: 'bits', q: 'Codificador de convolución con P<sub>i</sub> = b<sub>i</sub> ⊕ b<sub>i−1</sub> y salida P₄b₄P₃b₃P₂b₂P₁b₁. ¿Qué sale para b₄b₃b₂b₁ = 1101?', a: '01111011', e: '<p>P₁ = 1, P₂ = 1, P₃ = 1, P₄ = 0 → 01 11 10 11 leído como P₄b₄ P₃b₃ P₂b₂ P₁b₁ = 01111011.</p>' },
        { t: 'text', q: '¿Qué diferencia hay entre DTE y DCE?', k: [['genera', 'consume', 'terminal', 'computadora'], ['convierte', 'adapta', 'señal'], ['enlace', 'linea', 'red', 'medio']], need: 2, e: '<p>El DTE (computadora, terminal) genera o consume los datos; el DCE (módem) los convierte en una señal apta para la línea y la introduce en el enlace.</p>' },
        { t: 'text', q: '¿Por qué el módem analógico no puede pasar de 56 kbps y qué tecnología lo supera?', k: [['banda vocal', 'vocal', '4 khz', '3400', 'cuantificacion'], ['xdsl', 'adsl', 'dsl']], need: 2, e: '<p>Porque solo usa la banda vocal (y la cuantificación PCM de la central lo limita). xDSL lo supera usando el espectro del par de cobre por encima de la banda vocal.</p>' },
      ],
      sources: [
        { title: 'Unidad 9: Equipos de comunicación de datos (DCE)', ref: 'Apunte de la cátedra de Comunicación de Datos, UTN-FRT (9.0)', points: ['Definición, clasificación y elementos del módem.', 'Ancho de banda telefónico y velocidad del módem en dúplex y semidúplex.', 'Normas V y módems de 56K.'] },
        { title: 'MODEM: Modulator/Demodulator', ref: 'Lectura 9.4 de la Unidad 9', points: ['Partes y tipos de módem, FSK, PSK multinivel, QAM y TCM.', 'Constelaciones V.26, V.27 y V.29; codificador de convolución.', 'V.90 y V.92; tablas de normas Bell e ITU.'] },
      ],
    },

    {
      id: 'interfaz-dte-dce',
      module: 'u9',
      title: 'Interfaz DTE-DCE: RS-232 (V.24), módem nulo y comandos Hayes',
      keywords: 'interfaz serie RS-232 RS-232C EIA V.24 CCITT DB-25 DB-9 patillas TxD RxD RTS CTS DSR DTR DCD RI NRZ-L niveles de tensión 3 15 voltios módem nulo null modem cruzado balanceado no balanceado RS-422 RS-423 RS-449 Hayes AT handshaking RDSI TE NT RJ45 protocolos nivel físico',
      tldr: 'El DTE y el DCE se conectan por una <strong>interfaz serie</strong>; la más común es <strong>RS-232C</strong> (EIA), equivalente a la <strong>V.24</strong> del CCITT. Se especifica en cuatro características: <mark>mecánicas, eléctricas, funcionales y de procedimiento</mark>. Datos en <strong>NRZ-L</strong>: el 0 es un voltaje <strong>positivo</strong> y el 1 uno <strong>negativo</strong> (entre 3 y 15 V). Es <strong>no balanceada</strong>: ≈ 15 m y 20 kbps. Para unir dos DTE sin módem se usa un <strong>módem nulo</strong> que cruza TX con RX.',
      goals: ['Ubicar la interfaz DTE-DCE y sus cuatro características.', 'Reconocer las señales principales de RS-232 y sus niveles eléctricos.', 'Explicar el módem nulo.', 'Comparar interfaces balanceadas y no balanceadas.'],
      body: `
        <h2>Protocolos de comunicación</h2>
        <p>Un protocolo es un conjunto de reglas, requerimientos, secuencias y procedimientos para transmitir información desde y hacia un terminal; tienen que ser los mismos en el transmisor y el receptor. La lectura 9.4 distingue cuatro niveles: <strong>físico</strong>, de <strong>dispositivo</strong>, de <strong>enlace</strong> y de <strong>aplicación</strong>. El de nivel físico define la interconexión física y eléctrica entre los equipos y el significado de las señales de control que se intercambian el adaptador y el módem antes de transmitir (<strong>handshaking</strong>, por RS-232, RS-449 o V.24). La transferencia real de los datos usa además un protocolo de enlace (Unidad 6).</p>
        <h2>RS-232C y V.24</h2>
        <p><strong>RS-232C</strong> es la tercera revisión de la norma RS-232 de la EIA (Asociación de Industrias Electrónicas); el CCITT hizo la versión internacional, <strong>V.24</strong>. Las diferencias son mínimas y se usan como sinónimos. Cada pareja DTE-DCE se especifica en cuatro características:</p>
        ${table(['Característica', 'Qué define'], [
          ['<strong>Mecánicas</strong>', 'Número de contactos y su distribución (conector DB-25, ISO 2110, o DB-9)'],
          ['<strong>Eléctricas</strong>', 'Niveles de tensión y temporización; la señalización es digital'],
          ['<strong>Funcionales</strong>', 'La función de cada contacto (patilla)'],
          ['<strong>De procedimiento</strong>', 'La sucesión de señales en una aplicación determinada'],
        ])}
        <h3>Mecánicas y funcionales</h3>
        <p>De los 25 hilos del DB-25 solo <strong>4</strong> llevan datos; los otros 21 son de control, temporización, tierra y pruebas (9 y 10 reservados, 11 sin asignar). Cada función tiene su <strong>espejo</strong> para el sentido opuesto, lo que permite el dúplex: la patilla 2 transmite y la 3 recibe. El <strong>DB-9</strong> es la versión reducida para conexiones asíncronas simples, sin correspondencia patilla a patilla con el DB-25.</p>
        ${table(['Patilla (DB-25)', 'Señal', 'Sentido'], [
          ['1', 'Blindaje (tierra de protección)', '—'], ['2', '<strong>Transmisión de datos</strong> (TxD)', 'DTE → DCE'], ['3', '<strong>Recepción de datos</strong> (RxD)', 'DCE → DTE'],
          ['4', 'Petición para enviar (RTS)', 'DTE → DCE'], ['5', 'Listo para enviar (CTS)', 'DCE → DTE'], ['6', 'DCE listo (DSR)', 'DCE → DTE'],
          ['7', 'Tierra de señal', '—'], ['8', 'Detector de señal de línea recibida, portadora (DCD)', 'DCE → DTE'], ['20', 'DTE listo (DTR)', 'DTE → DCE'], ['22', 'Llamada entrante (RI)', 'DCE → DTE'],
        ])}
        <h3>Eléctricas</h3>
        <p>Los datos van en <strong>NRZ-L</strong> (Unidad 7) con el <strong>0 como voltaje positivo y el 1 como voltaje negativo</strong>. Para ser datos la amplitud debe estar <strong>entre 3 y 15 V o entre −3 y −15 V</strong>: dos rangos de 12 V. Mientras el pulso caiga en un rango aceptable su precisión no importa, así que es poco probable que el ruido lo vuelva irreconocible.</p>
        <h3>De procedimiento</h3>
        <p>Cada DTE envía por su patilla 2 y su DCE recibe en la patilla 2; cada DTE recibe por la 3 lo que su DCE le entrega por la 3. El tráfico de la patilla 3 siempre <strong>entra</strong> al DTE. La secuencia típica: DTR (20) y DSR (6) indican que los equipos están listos, llega la llamada (22), aparece la portadora (8), RTS (4) pide enviar, CTS (5) habilita, y los datos van por 2 y 3. Las tierras 1 y 7 están siempre activas.</p>
        ${lab(0)}
        <h2>Módem nulo</h2>
        <p>Para conectar dos DTE sin DCE ni red de por medio. Con un cable RS-232 recto los dos DTE transmitirían por el mismo hilo (patilla 2) y escucharían el mismo hilo (3): cada uno le transmite a la patilla de <strong>transmisión</strong> del otro, el circuito de recepción queda aislado y el de transmisión solo tiene colisiones. El <strong>módem nulo</strong> cruza los cables: la <strong>2 de un DTE con la 3 del otro</strong> y viceversa (y recablea otras señales de control con el mismo criterio), para que cada DTE crea que tiene un DCE y una red delante. Puede ser un cable (lo más usado), un dispositivo o una caja de conexión.</p>
        <h2>Interfaces no balanceadas y balanceadas</h2>
        <p>RS-232 es <strong>no balanceada</strong>: el receptor mide V<sub>T</sub> contra tierra y recibe V<sub>R</sub> = V<sub>T</sub> + n(t). Es sensible al ruido: no sirve para distancias largas ni velocidades altas. En una interfaz <strong>balanceada</strong> la señal viaja por dos hilos (V<sub>T+</sub> y V<sub>T−</sub>) muy próximos, que reciben el mismo ruido; el receptor resta: V<sub>R</sub> = V<sub>T+</sub> − V<sub>T−</sub> + n(t) − n(t), y el ruido se cancela.</p>
        ${table(['', 'RS-232-C', 'RS-422-A', 'RS-423-A', 'RS-449'], [
          ['Distancia máxima', '15 m', '1 a 1,5 km', '1 a 1,5 km', '60 m'],
          ['Tasa máxima', '20 kbps', '10 Mbps', '100 kbps', '20 kbps / 2 Mbps'],
          ['Balanceada', 'No', 'Sí', 'No', 'No / Sí (usa RS-423 o RS-422)'],
        ])}
        <h2>Otras interfaces y control del módem</h2>
        <ul>
          <li><strong>Interfaz física de RDSI</strong>: conecta el equipo terminal <strong>TE</strong> con el de terminación de red <strong>NT</strong> (≈ DTE y DCE). Usa menos circuitos que RS-232 y más lógica de control, con un conector de 8 contactos (ISO 8877, <strong>RJ45</strong>).</li>
          <li><strong>Comandos Hayes</strong>: el lenguaje de órdenes estándar para gestionar el módem desde el software. Todas empiezan con el prefijo <strong>AT</strong> (<em>attention</em>), por ejemplo ATD para marcar.</li>
        </ul>`,
      labs: [
        { type: 'classify', title: '¿Quién activa cada señal de RS-232?', buckets: ['DTE → DCE', 'DCE → DTE', 'Tierra'], items: [
          { t: 'Patilla 2: transmisión de datos', b: 0 }, { t: 'Patilla 3: recepción de datos', b: 1, why: 'Siempre entra al DTE.' }, { t: 'Patilla 4: petición para enviar (RTS)', b: 0 },
          { t: 'Patilla 5: listo para enviar (CTS)', b: 1 }, { t: 'Patilla 6: DCE listo (DSR)', b: 1 }, { t: 'Patilla 20: DTE listo (DTR)', b: 0 },
          { t: 'Patilla 8: detección de portadora (DCD)', b: 1, why: 'El módem avisa que hay señal en la línea.' }, { t: 'Patilla 22: llamada entrante (RI)', b: 1 }, { t: 'Patilla 7: señal', b: 2 },
        ] },
      ],
      exercises: [
        { title: 'Dos computadoras por RS-232 sin módem', level: 2, prompt: '<p>Se quieren conectar dos computadoras por sus puertos RS-232 con un cable recto. ¿Por qué no funciona y cómo se resuelve?</p>',
          solution: { explain: '<p>Las dos son <strong>DTE</strong>: las dos transmiten por la patilla 2 y reciben por la 3. Con un cable recto cada una transmite sobre la patilla de transmisión de la otra: la recepción (3) queda aislada y en el hilo 2 solo hay colisiones. Se resuelve con un <strong>módem nulo</strong>: un cable (o caja) que cruza la 2 de una con la 3 de la otra y recablea las señales de control (RTS/CTS, DTR/DSR) para que cada DTE crea que tiene un DCE delante.</p>' } },
        { title: 'Ruido en una interfaz balanceada', level: 2, prompt: '<p>Un transmisor envía V<sub>T</sub> = 5 V y el cable recoge 2 V de ruido. ¿Qué recibe una interfaz no balanceada? ¿Y una balanceada que manda +5 V y −5 V por dos hilos muy próximos?</p>',
          solution: { explain: '<p>No balanceada: V<sub>R</sub> = V<sub>T</sub> + n = 5 + 2 = <strong>7 V</strong> (el ruido se suma a la señal).</p><p>Balanceada: los dos hilos reciben el mismo ruido: (5 + 2) − (−5 + 2) = <strong>10 V</strong>, la diferencia de la señal sin ruido. Por eso RS-422 llega a 10 Mbps y más de 1 km, contra 20 kbps y 15 m de RS-232.</p>' } },
      ],
      quiz: [
        { q: 'RS-232C es equivalente a la norma…', o: ['V.90 de la UIT', 'V.24 del CCITT', 'G.992.1', 'IEEE 802.3'], a: 1, e: 'Las diferencias son mínimas.' },
        { q: 'En RS-232 un 0 lógico es…', o: ['un voltaje negativo entre −3 y −15 V', 'un voltaje positivo entre 3 y 15 V', '0 V', '5 V TTL'], a: 1, e: 'NRZ-L: 0 positivo, 1 negativo.' },
        { q: 'Las cuatro características de la interfaz DTE-DCE son…', o: ['física, enlace, red y transporte', 'mecánicas, eléctricas, funcionales y de procedimiento', 'tensión, corriente, potencia e impedancia', 'símplex, semidúplex, dúplex y multipunto'], a: 1, e: 'Mecánicas (conector), eléctricas (niveles), funcionales (patillas), de procedimiento (secuencia).' },
        { q: 'Un módem nulo sirve para…', o: ['conectar dos DTE sin DCE, cruzando TX con RX', 'conectar un módem a la línea telefónica', 'anular el eco de la línea', 'apagar el módem a distancia'], a: 0, e: 'Patilla 2 de uno con la 3 del otro.' },
        { q: 'RS-232 no sirve para distancias largas porque…', o: ['usa codificación Manchester', 'es no balanceada: el ruido se suma a la señal', 'usa fibra', 'solo tiene 9 patillas'], a: 1, e: '≈ 15 m y 20 kbps.' },
        { q: 'Los comandos Hayes empiezan con…', o: ['AT', 'RS', 'V.', 'DB'], a: 0, e: 'Attention.' },
        { q: 'En la interfaz de RDSI, el TE y el NT corresponden aproximadamente a…', o: ['DCE y DTE', 'DTE y DCE', 'ATU-R y ATU-C', 'OLT y ONU'], a: 1, e: 'Conector RJ45 (ISO 8877).' },
      ],
      open: [
        { t: 'text', q: '¿Qué es un módem nulo y por qué hace falta?', k: [['dte', 'computadora'], ['cruz', 'cruza', 'cruzado', 'cruce'], ['transmi', 'tx', 'patilla 2'], ['recep', 'rx', 'patilla 3']], need: 3, e: '<p>Una interfaz (cable o caja) que conecta dos DTE sin DCE cruzando la transmisión (patilla 2) de uno con la recepción (patilla 3) del otro; con un cable recto ambos transmitirían por el mismo hilo.</p>' },
        { t: 'text', q: '¿Por qué una interfaz balanceada soporta más distancia y velocidad que RS-232?', k: [['dos hilos', 'diferencia', 'resta', 'diferencial'], ['ruido'], ['cancela', 'anula', 'elimina']], need: 2, e: '<p>Porque la señal va por dos hilos próximos que reciben el mismo ruido; el receptor toma la diferencia y el ruido se cancela.</p>' },
      ],
      sources: [{ title: 'MODEM: Modulator/Demodulator', ref: 'Lectura 9.4 de la Unidad 9', points: ['Protocolos de comunicación y niveles.', 'RS-232C/V.24: especificaciones mecánicas, eléctricas, funcionales y de procedimiento; DB-25 y DB-9.', 'Módem nulo, interfaces balanceadas (RS-422, RS-423, RS-449), RDSI y comandos Hayes.'] }],
    },

    {
      id: 'modem-xdsl',
      module: 'u9',
      title: 'Banda ancha sobre cobre: ADSL, DSLAM y VDSL',
      keywords: 'POTS PSTN red telefónica conmutada bucle de abonado par trenzado B-ISDN xDSL ADSL HDSL SDSL IDSL CDSL SHDSL G.lite ADSL2 ADSL2+ VDSL VDSL2 splitter microfiltro DSLAM ATM STM-1 ATU-R ATU-C asimétrico FDM cancelación de eco banda vocal 4 kHz 25 kHz 138 kHz 1104 kHz ANSI T1.413 G.992.1 G.dmt G.992.2 G.994.1 FTTCab VoDSL cable módem',
      tldr: '<strong>xDSL</strong> convierte el par de cobre telefónico en una línea de alta velocidad usando el espectro que la voz deja <strong>sin usar</strong>. <strong>ADSL</strong> crea tres canales independientes y los multiplexa <mark>en frecuencia</mark>: voz 0 a 4 kHz, subida ≈ 26 a 138 kHz y bajada 138 a 1104 kHz (dúplex en frecuencia). El <strong>splitter</strong> separa la voz de los datos; en la central, el <strong>DSLAM</strong> reúne los módems ATU-C de todos los abonados. A más espectro, más velocidad y menos alcance: ADSL 8/1 Mbps, ADSL2+ 24/2 Mbps, VDSL ≈ 52 Mbps a 300 m.',
      goals: ['Distinguir POTS (servicio) de PSTN (red) y explicar el problema que resuelve xDSL.', 'Describir los canales y el reparto espectral de ADSL, el splitter, el DSLAM y sus normas.', 'Comparar la familia xDSL, de ADSL a VDSL2, y explicar por qué la distancia manda.', 'Reconocer las restricciones del par de cobre: atenuación, bridged taps y diafonía.'],
      body: `
        <h2>POTS y PSTN</h2>
        ${table(['', 'Qué es', 'Ejemplo'], [
          ['<strong>PSTN</strong> (Public Switched Telephone Network)', 'La <strong>red</strong>: centrales de conmutación de circuitos, troncales y bucles de abonado', 'La infraestructura de la compañía telefónica'],
          ['<strong>POTS</strong> (Plain Old Telephone Service)', 'El <strong>servicio</strong> telefónico ordinario, tradicional o telefonía básica, en la banda vocal (300 Hz a 3,4 kHz, canal de 4 kHz)', 'El teléfono fijo analógico'],
        ])}
        <p>Las dos hablan de la telefonía tradicional y están atadas: POTS usa la banda vocal y la PSTN transporta esa banda por una conexión conmutada. Esa banda sirve para la voz y para los datos por módem (fax, V.32, V.90): la comunicación es <strong>módem a módem en banda POTS a través de la PSTN</strong>, hasta el <em>access server</em> con su <em>pool</em> de módems del proveedor. La diferencia entre POTS y PSTN es de nivel: <strong>red</strong> contra <strong>servicio</strong> (TP 9, ejercicio 1).</p>
        <h2>Del módem analógico a la banda ancha</h2>
        ${table(['Problema', 'Solución'], [
          ['El bit rate de los módems analógicos está limitado a <strong>56 kbps</strong>', 'Módem <strong>xDSL</strong>'],
          ['La PSTN no es apropiada para tráfico de datos a alta velocidad', 'Redirigir el tráfico de datos hacia una red específica (<strong>B-ISDN</strong>, RDSI de banda ancha)'],
        ])}
        <p>Por encima de los 3400 Hz el espectro del par de cobre queda <strong>sin usar</strong>. <strong>DSL</strong> (Digital Subscriber Line, línea de abonado digital) es el nombre global de las tecnologías que dan una conexión digital sobre la línea de abonado de la red telefónica local; <strong>xDSL</strong> es la familia que transporta información multimedia a mayor velocidad que el módem usando las mismas líneas convencionales, gracias a modulaciones modernas y al procesamiento digital de señales.</p>
        ${table(['Tecnología', 'Tipo', 'Distancia', 'Bajada', 'Subida'], [
          ['IDSL (ISDN DSL)', 'Simétrico', '5400 m', '128 kbps', '128 kbps'],
          ['SDSL (Symmetric)', 'Simétrico', '3000 m', '1,544 Mbps', '1,544 Mbps'],
          ['HDSL (High bitrate, 2 pares)', 'Simétrico', '3600 m', '1,544 Mbps', '1,544 Mbps'],
          ['SHDSL (1 par / 2 pares)', 'Simétrico', '1800 m', '2,312 / 4,624 Mbps', '2,312 / 4,624 Mbps'],
          ['ADSL G.lite (CDSL, DSL Lite)', 'Asimétrico', '5400 m', '1,5 Mbps', '512 kbps'],
          ['ADSL (Asymmetric)', 'Asimétrico', '3600 m', '8 Mbps', '928 kbps'],
          ['VDSL (Very high bitrate)', 'Asim. / sim.', '300 m', '52 / 26 Mbps', '6 / 26 Mbps'],
          ['VDSL', 'Asim. / sim.', '1000 m', '26 / 13 Mbps', '3 / 13 Mbps'],
        ])}
        <h2>ADSL: tres canales sobre el mismo par</h2>
        <p><strong>ADSL</strong> (Asymmetric Digital Subscriber Line) convierte el par de cobre de la línea telefónica normal en una línea de alta velocidad, usando las frecuencias que no transportan la voz. Establece <strong>tres canales independientes</strong>:</p>
        <ul>
          <li><strong>Datos</strong>: dos canales de alta velocidad, recepción (<em>downstream</em>, red → usuario) y envío (<em>upstream</em>, usuario → red).</li>
          <li><strong>Voz</strong>: un canal para el servicio telefónico básico (POTS).</li>
        </ul>
        <p>Los canales de datos son <strong>asimétricos</strong>: downstream &gt; upstream, porque en el acceso a la información el volumen recibido es mucho mayor que el enviado (se pide una página con unos pocos bytes y se reciben kilobytes de texto e imágenes).</p>
        <h3>Reparto espectral: FDM</h3>
        <p>ADSL es una tecnología de multiplexación basada en <strong>FDM</strong>: aprovecha el ancho de banda que no usa la telefonía y transmite en los dos sentidos a la vez por una única línea.</p>
        ${table(['Banda', 'Uso', 'Ancho'], [['0 a 4 kHz', 'Voz (POTS), intacta', '4 kHz'], ['≈ 26 kHz a 138 kHz (26 a 108 kHz en el apunte)', 'Datos ascendentes (subida)', '≈ 80 a 110 kHz'], ['138 kHz a 1104 kHz', 'Datos descendentes (bajada)', '≈ 1 MHz']])}
        <ul>
          <li><strong>Multiplexación voz/datos en frecuencia</strong> y <strong>dúplex en frecuencia</strong>: subida y bajada en bandas distintas. No es TDM.</li>
          <li>Como no se solapa con la banda POTS, el usuario puede <strong>hablar por teléfono mientras navega</strong>. Un módem de banda vocal no puede convivir así con el teléfono, porque ocupa la misma banda.</li>
          <li>El módem ADSL clásico opera de ≈ 25 kHz (24 kHz en la lectura) a <strong>1104 kHz</strong>, sobre el <strong>par de cobre</strong>.</li>
        </ul>
        ${note('La separación de los sentidos puede hacerse por <strong>FDM</strong> (los espectros de subida y bajada no se solapan: módem más simple, pero la bajada pierde las frecuencias bajas, que son las que menos se atenúan) o por <strong>cancelación de eco</strong> (la bajada se superpone con la subida y un cancelador las separa: más caudal, más complejidad). La lectura 9.1 dice que se impuso la cancelación de eco.')}
        <h3>Splitter, ATU-R, ATU-C</h3>
        <ul>
          <li>El módem del usuario es el <strong>ATU-R</strong> (ADSL Terminal Unit-Remote) y el de la central el <strong>ATU-C</strong> (ADSL Terminal Unit-Central). Como los caudales son distintos en cada sentido, los dos módems son distintos.</li>
          <li>Delante de cada uno va un <strong>splitter</strong>: un conjunto de <strong>dos filtros, un pasabajos y un pasaaltos</strong>, que separa las señales de baja frecuencia (telefonía, hacia la RTC) de las de alta frecuencia (datos ADSL). <strong>Separa la voz de los canales de datos</strong> ascendente y descendente; no multiplexa la subida con la bajada y no opera solo en la banda vocal. Hace falta porque las frecuencias bajas de ADSL “molestan” en el espectro audible, y porque al descolgar y colgar el teléfono cambia la impedancia de la línea, lo que afecta al módem.</li>
          <li><strong>Splitter o microfiltros</strong>: el splitter se instala después del PTR, a la entrada de la vivienda, y hay que extender el cableado hasta la PC. Los <strong>microfiltros</strong> (pasabajos) van entre la roseta y cada teléfono (máximo 3 equipos): más económicos, sin instalación ni cableado nuevo, pero menos fiables y con más ruido. <strong>G.lite</strong> (G.992.2) es el ADSL pensado para microfiltros: 1,5 Mbps de bajada y 512 kbps de subida, solo transporte ATM.</li>
        </ul>
        <h3>Ventajas de ADSL</h3>
        <ul>
          <li>Uso simultáneo de Internet y teléfono o fax por la misma línea.</li>
          <li><strong>Always online</strong>: conexión permanente a gran velocidad.</li>
          <li>Tarifa plana, con facturación independiente de la voz.</li>
          <li>Acceso a servicios y contenidos de banda ancha.</li>
          <li>Mayor seguridad: el par es un medio <strong>no compartido</strong>.</li>
          <li>Aprovecha una infraestructura ya desplegada, lo que acorta la implantación.</li>
        </ul>
        <h3>Normas</h3>
        ${table(['Norma', 'Contenido'], [
          ['ANSI T1.413 edición 1 (1995) y 2 (1998)', 'Primeras especificaciones de ADSL; la segunda, basada en ATM'],
          ['ITU-T G.992.1 (<strong>G.dmt</strong>)', 'Basada en T1.413 ed. 2 + handshaking. Anexo A: sobre POTS; anexo B: sobre RDSI (ISDN); anexo C: RDSI japonesa'],
          ['ITU-T G.992.2 (<strong>G.lite</strong>)', 'Versión reducida (bajada hasta ≈ 548 kHz), sin splitter del lado del cliente'],
          ['ITU-T G.994.1 (<strong>G.hs</strong>)', 'Procedimiento de handshaking de los transceptores DSL'],
        ])}
        <p>Los espectros de ADSL nunca se solapan con POTS pero sí con el acceso básico RDSI; por eso existe el anexo B, con la subida corrida por encima de los 138 kHz.</p>
        <h2>Red de acceso de cobre y DSLAM</h2>
        <p>En la central, la voz del splitter va a la <strong>matriz de conmutación</strong> (PSTN) y los datos al <strong>DSLAM</strong>.</p>
        ${def('DSLAM', 'Es un multiplexor localizado en la central telefónica que proporciona a los abonados acceso a los servicios DSL sobre cable de par trenzado de cobre.', 'Apunte de la Unidad 9 (Digital Subscriber Line Access Multiplexer).')}
        <p>El DSLAM agrupa muchas tarjetas, cada una con varios <strong>ATU-C</strong>, y <strong>concentra</strong> el tráfico de todos los enlaces ADSL hacia la red WAN. Integrar los ATU-C en un solo equipo ocupa menos espacio en la central y fue clave para el despliegue masivo de ADSL.</p>
        <p><strong>DSLAM ATM</strong>: los estándares y la industria impusieron el modelo de <strong>ATM sobre ADSL</strong>; el DSLAM pasa a ser un <strong>conmutador ATM</strong> con múltiples interfaces, y las WAN pueden ser <strong>STM-1, STM-4, E3</strong> u otras estandarizadas (Unidad 8). Del lado del proveedor, un BRAS (servidor de acceso remoto de banda ancha) termina las conexiones; como alternativas a ATM aparecieron PPP, Frame Relay y Ethernet sobre ADSL. Con ese ancho de banda también se pueden llevar varias líneas de voz empaquetada sobre el mismo par: <strong>VoDSL</strong> (por ATM AAL2, que reparte dinámicamente el ancho de banda entre voz y datos y con supresión de silencio recupera hasta 50 %).</p>
        <h2>ADSL2 y ADSL2+</h2>
        <p>Tecnologías preparadas para tasas mayores que el ADSL convencional sobre la <strong>misma</strong> infraestructura de cobre:</p>
        ${table(['Tecnología', 'Bajada / subida máximas', 'Espectro'], [['ADSL', '8 / 1 Mbps', 'hasta 1,1 MHz'], ['ADSL2', '12 / 2 Mbps', 'hasta 1,1 MHz'], ['ADSL2+', '24 / 2 Mbps', 'hasta 2,2 MHz']])}
        <h2>VDSL y VDSL2</h2>
        <p>ADSL alcanza unos 8 Mbps en distancias de varios km, pero no basta para servicios integrados con video. La alternativa: llevar <strong>fibra óptica</strong> hasta unidades ópticas de red (<strong>ONU</strong>) en el barrio y hacer la conexión final por el cobre telefónico. Son las topologías <strong>FTTx</strong> (siguiente lección): FTTN (nodo), FTTB (edificio), FTTC (acera); la lectura nombra también FTTCab (gabinete en la calle) y FTTEx (desde la central, para abonados muy cercanos).</p>
        <p>Una de las tecnologías que usan FTTN, FTTB y FTTC es <strong>VDSL</strong> (línea de abonado digital de muy alta velocidad): transmite a alta velocidad sobre <strong>distancias cortas</strong> por pares trenzados, con una velocidad que <strong>depende de la longitud de la línea</strong>. La máxima de red a cliente está entre <strong>51 y 55 Mbps sobre 300 m</strong>; de cliente a red también supera a ADSL, y puede operar en modo <strong>simétrico o asimétrico</strong>.</p>
        ${table(['Distancia', 'Bajada', 'Subida', 'Modo'], [['300 m', '52 Mbps', '6,4 Mbps', 'Asimétrico'], ['300 m', '26 Mbps', '26 Mbps', 'Simétrico'], ['1000 m', '26 Mbps', '3,2 Mbps', 'Asimétrico'], ['1000 m', '13 Mbps', '13 Mbps', 'Simétrico'], ['1500 m', '13 Mbps', '1,6 Mbps', 'Asimétrico']])}
        <ul>
          <li><strong>VDSL2</strong>, evolución del ADSL: <strong>300 Mbps de bajada y 100 de subida</strong> en modo asimétrico, o <strong>100/100 Mbps</strong> simétrico, en condiciones ideales (sin resistencia del par y casi sin distancia a la central).</li>
          <li>VDSL usa <strong>cuatro canales</strong> de datos, dos de bajada y dos de subida, con lo que aumenta sustancialmente la potencia de transmisión.</li>
          <li>Espectro: puede usar hasta <strong>30 MHz</strong>; el plan especificado llega a 12 MHz. Duplexación por división de frecuencia (<strong>FDD</strong>); códigos de línea DMT o QAM/CAP, con preferencia de los fabricantes por FDD-DMT. Con un splitter en cada extremo convive con POTS o RDSI.</li>
        </ul>
        ${table(['Tecnología', 'Espectro', 'Velocidad típica', 'Alcance'], [
          ['ADSL', 'hasta 1,1 MHz', '8 Mbps bajada / 1 Mbps subida', 'varios km (0 a 5,4 km)'],
          ['ADSL2+', 'hasta 2,2 MHz', '24 Mbps bajada', 'máximo ≈ 1,5 km para buen rendimiento'],
          ['VDSL', 'hasta 12 MHz', '51 a 55 Mbps a 300 m', 'menos de 1,5 km'],
          ['VDSL2', 'hasta 30 MHz', '100 Mbps o más, simétrico o asimétrico', 'máximo a menos de 300 m'],
        ])}
        <h2>Cobertura: xDSL contra distancia</h2>
        <p>Para aprovechar ADSL2+ y VDSL2 <strong>no hay que superar las distancias máximas</strong>: si no, se pierde ancho de banda por el ruido que suma el largo del cable. En la red de cobre estructurada el <strong>primario</strong> mide en promedio 1600 m y el <strong>secundario</strong> 300 m: ADSL2+ rinde hasta ≈ 1,5 km y VDSL2 hasta ≈ 300 m.</p>
        <h3>Restricciones del par de cobre</h3>
        <ul>
          <li><strong>Atenuación contra frecuencia y distancia</strong>: en el par la atenuación por unidad de longitud crece con la frecuencia (R = ρ·x/S<sub>eff</sub>, y por efecto pelicular la sección efectiva baja con la frecuencia), y la total crece con el largo (Unidad 3). Con cable de 0,5 mm a 150 kHz: <strong>32 dB en 4 km y 55 dB en 5 km</strong>. Por eso la velocidad de ADSL cae con la distancia: ≈ 8 Mbps cerca de la central y ≈ 2 Mbps de bajada y 0,9 de subida a 2,6 km en el peor caso de ruido.</li>
          <li><strong>Bridged taps</strong> (derivaciones abiertas del par): generan ecos que se suman a la señal principal y aumentan la atenuación en ciertas frecuencias.</li>
          <li><strong>Diafonía</strong> (crosstalk) entre pares del mismo cable: <strong>NEXT</strong> (extremo cercano: el transmisor de un par interfiere al receptor de otro en el mismo extremo) y <strong>FEXT</strong> (extremo lejano). En ADSL no hay NEXT, solo FEXT, porque la subida y la bajada usan bandas distintas; sí aparece NEXT cuando en el mismo multipar conviven ADSL sobre POTS y ADSL sobre RDSI, porque la bajada de uno se solapa con la recepción del otro.</li>
          <li><strong>Ruido externo</strong>: baja la SNR de las subportadoras y con ella el caudal (DMT, siguiente lección).</li>
        </ul>
        ${note('Pasar de ADSL a VDSL2 (TP 9, ejercicio 2) obliga a <strong>acortar el cobre</strong>: llevar fibra hasta un nodo o armario cerca del usuario (FTTN/FTTC) e instalar ahí el DSLAM VDSL2. Gana ancho de banda, velocidad y modo simétrico; pierde con la distancia: lejos del nodo puede rendir como ADSL2+.', 'exam')}
        ${lab(0)}`,
      labs: [
        { type: 'classify', title: '¿Dónde está cada elemento del enlace ADSL?', buckets: ['Domicilio del usuario', 'Bucle de abonado', 'Central telefónica'], items: [
          { t: 'ATU-R', b: 0, why: 'ADSL Terminal Unit-Remote.' }, { t: 'ATU-C', b: 2, why: 'Dentro del DSLAM.' }, { t: 'DSLAM', b: 2 }, { t: 'Par trenzado de cobre', b: 1 },
          { t: 'Matriz de conmutación de voz (PSTN)', b: 2 }, { t: 'Microfiltros entre roseta y teléfono', b: 0 }, { t: 'Bridged taps', b: 1, why: 'Derivaciones del par que generan ecos.' }, { t: 'PC (DTE)', b: 0 },
        ] },
      ],
      exercises: [
        { title: 'POTS y PSTN', official: '9.1', level: 1, prompt: '<p>Compare brevemente similitudes y diferencias entre POTS (Plain Old Telephone Service) y PSTN (Public Switched Telephone Network).</p>',
          solution: { explain: '<p><b>Similitudes:</b> los dos términos se refieren a la red telefónica tradicional y están relacionados: el servicio POTS usa la banda vocal (canal de 4 kHz) y la PSTN es la red que transporta esa banda. POTS opera sobre la infraestructura PSTN.</p><p><b>Diferencias:</b> PSTN es la <strong>infraestructura de red</strong> (centrales de conmutación de circuitos, troncales, bucles de abonado); POTS es el <strong>servicio</strong> básico de voz que corre sobre ella.</p>' } },
        { title: 'Reemplazar ADSL por VDSL2', official: '9.2', level: 2, prompt: '<p>Un ISP planea reemplazar su red ADSL por VDSL2 en una zona urbana. a) ¿Qué cambios de infraestructura serían necesarios? b) ¿Qué ventajas técnicas se obtendrían? c) ¿Cómo afectaría la distancia a los usuarios?</p>',
          solution: { explain: `<p><b>a)</b> Acortar el bucle de cobre: ya no sirve el par completo desde la central. Hay que desplegar <strong>fibra óptica</strong> hasta nodos, armarios o sótanos de edificio cercanos (topología FTTN, FTTC o FTTB), instalar ahí <strong>DSLAM VDSL2</strong> (u ONU) y reconectar el cobre del usuario a ese nodo.</p>
            <p><b>b)</b> Más espectro (hasta 12 MHz o más, contra 1,1 MHz de ADSL y 2,2 MHz de ADSL2+), por lo tanto más velocidad (100 Mbps o más en distancias cortas, contra 8 y 24 Mbps), y la posibilidad de operar en modo <strong>simétrico</strong> o asimétrico.</p>
            <p><b>c)</b> La distancia es el factor crítico: las velocidades máximas solo se logran a menos de ≈ 300 m del nodo; el rendimiento cae bruscamente con la longitud (la atenuación crece con la frecuencia) y a distancias largas VDSL2 puede rendir como ADSL2+ o menos.</p>` } },
        { title: 'Canales y ancho de banda de ADSL', level: 1, prompt: '<p>a) ¿Cuántos canales establece ADSL sobre la línea y cuáles son? b) Con el reparto del apunte (voz 0-4 kHz, subida 26-108 kHz, bajada 138-1104 kHz), ¿qué ancho de banda tiene cada canal de datos? c) ¿Por qué es asimétrico?</p>',
          solution: { explain: '<p><b>a)</b> Tres canales independientes: voz (POTS), datos descendentes y datos ascendentes.</p><p><b>b)</b> Subida: 108 − 26 = <strong>82 kHz ≈ 80 kHz</strong>. Bajada: 1104 − 138 = <strong>966 kHz ≈ 1 MHz</strong>. Con la misma eficiencia espectral, la bajada lleva ≈ 12 veces más bits.</p><p><b>c)</b> Porque en el acceso a la información el usuario recibe mucho más de lo que envía: la petición de una página son unos pocos bytes y la respuesta, kilobytes.</p>' } },
        { title: 'Splitter o microfiltros', level: 1, prompt: '<p>Un usuario contrata ADSL y tiene tres teléfonos en distintas rosetas. Compare la instalación con splitter y con microfiltros.</p>',
          solution: { explain: '<p><b>Splitter:</b> se coloca uno solo después del PTR, a la entrada de la vivienda; separa voz (pasabajos) y datos (pasaaltos) y hay que llevar un cableado nuevo hasta la PC. Es la solución más fiable y con menos ruido.</p><p><b>Microfiltros:</b> un filtro pasabajos entre cada roseta y su teléfono (máximo 3 equipos). Es más económica y no requiere instalación ni cableado nuevo, pero es menos fiable y con más posibilidad de ruido. G.lite se diseñó para esta modalidad.</p>' } },
      ],
      quiz: [
        { q: 'ADSL multiplexa voz y datos…', o: ['en tiempo, con dúplex en frecuencia', 'en frecuencia, con dúplex en frecuencia', 'en tiempo, con dúplex en tiempo', 'en frecuencia, con dúplex en tiempo'], a: 1, e: 'Voz en 0-4 kHz y datos arriba; subida y bajada en bandas distintas. Final del 07/05/2019.' },
        { q: 'El filtro “splitter” de ADSL…', o: ['multiplexa el canal ascendente con el descendente', 'opera solo en la banda vocal', 'separa la voz de los canales de datos ascendente y descendente', 'convierte la señal digital en analógica'], a: 2, e: 'Es un par de filtros pasabajos/pasaaltos. Cuestionario de la Unidad 9.' },
        { q: 'El DSLAM es…', o: ['un multiplexor FDM en el domicilio del usuario', 'un multiplexor TDM en la central que da acceso xDSL sobre par de cobre', 'un multiplexor DWDM sobre fibra óptica', 'un multiplexor TDM sobre cable coaxil'], a: 1, e: 'DSL Access Multiplexer, en la central telefónica. Cuestionario de la Unidad 9.' },
        { q: 'El módem ADSL clásico opera en el margen frecuencial…', o: ['de la banda vocal', 'hasta 4 kHz', 'de ≈ 25 kHz a 1104 kHz', 'de 0 a 12 MHz'], a: 2, e: 'La banda vocal queda para el teléfono.' },
        { q: 'En DMT las subportadoras…', o: ['no están espaciadas en forma constante', 'están espaciadas en forma constante y en cada una se mide la SNR para elegir el máximo n-QAM', 'llevan todas la misma QAM', 'se usan para transmitir voz'], a: 1, e: '256 tonos de 4,3125 kHz. Parcial 3, tema 3, y cuestionario de la Unidad 9.' },
        { q: 'En un enlace con cable módem, la computadora es…', o: ['el DCE', 'el DTE', 'la línea de transmisión', 'el splitter'], a: 1, e: 'DTE: equipo terminal de datos; el cable módem es el DCE y el coaxil la línea.' },
        { q: 'xDSL transporta datos a mayor velocidad que un módem analógico usando…', o: ['líneas de fibra óptica', 'las mismas líneas telefónicas de cobre', 'el espectro radioeléctrico', 'cable coaxil'], a: 1, e: 'Usa el par de cobre existente, pero mucho más espectro que la banda vocal. Cuestionario de la Unidad 9 (la afirmación con “fibra” es falsa).' },
        { q: 'VDSL2 alcanza sus velocidades máximas…', o: ['a cualquier distancia', 'a menos de ≈ 300 m del nodo', 'solo con fibra hasta el hogar', 'a más de 5 km'], a: 1, e: 'A más frecuencia, más atenuación del cobre.' },
        { q: 'ADSL2+ alcanza como máximo…', o: ['8/1 Mbps', '12/2 Mbps', '24/2 Mbps', '52/6 Mbps'], a: 2, e: 'ADSL 8/1, ADSL2 12/2, ADSL2+ 24/2.' },
        { q: 'En el DSLAM ATM, las interfaces WAN pueden ser…', o: ['RS-232 y V.24', 'STM-1, STM-4, E3', 'DB-9 y DB-25', 'GPON y EPON'], a: 1, e: 'El DSLAM pasa a ser un conmutador ATM.' },
        { q: 'VDSL transmite de red a cliente entre 51 y 55 Mbps sobre líneas de…', o: ['300 m', '1500 m', '3 km', '5,4 km'], a: 0, e: 'A 1000 m baja a 26 Mbps asimétrico.' },
        { q: '¿Cuál de estas tecnologías xDSL es simétrica?', o: ['ADSL', 'G.lite', 'HDSL', 'ADSL2+'], a: 2, e: 'HDSL, SDSL, SHDSL e IDSL son simétricas; VDSL puede ser las dos cosas.' },
        { q: 'G.dmt anexo B especifica ADSL…', o: ['sobre POTS', 'sobre RDSI (ISDN)', 'sin splitter', 'sobre fibra'], a: 1, e: 'El anexo A es sobre POTS y el C, RDSI japonesa.' },
        { q: 'En ADSL no hay NEXT (diafonía de extremo cercano) porque…', o: ['usa fibra', 'subida y bajada usan bandas de frecuencia distintas', 'el par es blindado', 'usa TDMA'], a: 1, e: 'Solo FEXT, salvo que convivan ADSL sobre POTS y sobre RDSI en el mismo multipar.' },
        { q: 'Una ventaja de ADSL frente al módem de banda vocal es…', o: ['funciona sobre fibra', 'puede coexistir en el mismo bucle con el servicio telefónico', 'es simétrico', 'no depende de la distancia'], a: 1, e: 'No se solapa con la banda POTS.' },
      ],
      open: [
        { t: 'text', q: '¿Qué diferencia hay entre POTS y PSTN?', k: [['red', 'infraestructura'], ['servicio'], ['voz', 'vocal', 'telefon']], need: 2, e: '<p>PSTN es la red pública conmutada (infraestructura); POTS es el servicio telefónico básico de voz que corre sobre ella.</p>' },
        { t: 'text', q: '¿Qué hace el splitter de ADSL y dónde está el DSLAM?', k: [['separa', 'filtro', 'filtra'], ['voz'], ['datos'], ['central']], need: 3, e: '<p>El splitter filtra y separa la voz (0 a 4 kHz) de los datos ascendentes y descendentes. El DSLAM es el multiplexor de acceso que está en la central telefónica y concentra los módems ADSL de los abonados.</p>' },
        { t: 'text', q: '¿Cómo decide DMT cuántos bits lleva cada subportadora?', k: [['snr', 'señal a ruido', 'ruido'], ['qam'], ['subportadora', 'tono', 'portadora']], need: 2, e: '<p>Mide la SNR de cada subportadora y le asigna la QAM de mayor orden que esa SNR permita: más bits donde el canal es bueno, menos donde es ruidoso.</p>' },
        { t: 'num', q: 'Con el reparto del apunte (bajada de 138 kHz a 1104 kHz), ¿qué ancho de banda tiene el canal descendente de ADSL? (en kHz)', a: 966, u: 'kHz', e: '<p>1104 − 138 = 966 kHz ≈ 1 MHz.</p>' },
        { t: 'text', q: '¿Por qué VDSL necesita llevar la fibra cerca del usuario?', k: [['distancia', 'corta', 'longitud', '300'], ['atenua', 'frecuencia'], ['fibra', 'fttx', 'fttn', 'fttc', 'onu', 'nodo']], need: 2, e: '<p>Porque usa frecuencias mucho más altas (hasta 12 o 30 MHz) y en el cobre la atenuación crece con la frecuencia y la longitud: solo rinde en tramos cortos (≈ 300 m), así que la fibra tiene que llegar a un nodo, acera o edificio cercano.</p>' },
      ],
      sources: [
        { title: 'Unidad 9: Equipos de comunicación de datos (DCE)', ref: 'Apunte de la cátedra de Comunicación de Datos, UTN-FRT (9.0)', points: ['Módem de banda ancha, familia xDSL, ADSL, ADSL2 y ADSL2+.', 'FDM para ADSL, red de acceso con pares de cobre, DSLAM y DSLAM ATM.', 'VDSL, VDSL2 y cobertura xDSL contra distancia.'] },
        { title: 'Tecnologías de acceso de banda ancha', ref: 'Lectura 9.1 de la Unidad 9', points: ['Comparativa xDSL, FDM contra cancelación de eco, G.lite, DSLAM, VDSL y VoDSL.'] },
        { title: 'A.D.S.L – Banda Ancha', ref: 'Lectura 9.2 de la Unidad 9', points: ['Splitter, normas ANSI e ITU-T, restricciones: atenuación, bridged taps y diafonía.'] },
        { title: 'Trabajo Práctico 9', ref: 'Cátedra de Comunicación de Datos, UTN-FRT', points: ['POTS y PSTN.', 'Reemplazo de ADSL por VDSL2: infraestructura FTTx, ventajas y efecto de la distancia.'] },
        { title: 'Cuestionario de la Unidad 9', ref: 'Campus virtual UTN-FRT, 2025', points: ['Esquema ATU-R, splitter, bucle de abonado, ATU-C y matriz.', 'DSLAM, DMT, DTE/DCE y definición de módem.'] },
      ],
    },

    {
      id: 'dmt',
      module: 'u9',
      title: 'DMT: multitono discreto, bitswapping y corrección de errores en ADSL',
      keywords: 'DMT Discrete Multi Tone multitono discreto subportadoras 256 canales 4,3125 kHz canal de guarda upstream downstream 1,44 Mbps 13,44 Mbps nQAM 4-QAM 16384-QAM SNR bitswapping showtime margen de ruido CAP IFFT FFT superframe símbolo DMT 17 ms 250 µs 4000 baudios Reed Solomon RS(255,239) entrelazado interleaving Trellis ganancia de código 7,616 Mbps',
      tldr: '<strong>DMT</strong> parte el espectro de ADSL (1,104 MHz) en <mark>256 canales de 4,3125 kHz</mark> y modula cada uno con su propia <strong>n-QAM</strong>, elegida según la SNR que se mide en ese canal (de 4-QAM, 2 bits, a 16384-QAM, 14 bits). Canal 0 para la voz, 1 a 5 de guarda, <strong>6 a 30 para subir</strong> y <strong>31 a 255 para bajar</strong>: 224 × 4 kHz × 15 bits = 13,44 Mbps teóricos, ≈ 8 Mbps reales. Si la SNR de un canal cae, sus bits se reubican en otros (<strong>bitswapping</strong>). Reed-Solomon (255,239) corrige hasta 8 bytes por palabra.',
      goals: ['Explicar por qué DMT aprovecha mejor el canal que una sola portadora.', 'Repartir los 256 canales de ADSL y calcular las velocidades teóricas.', 'Relacionar la SNR de una subportadora con su n-QAM, y explicar el bitswapping.', 'Calcular la protección y el overhead de Reed-Solomon y la velocidad neta de ADSL.'],
      body: `
        <h2>De una portadora a muchas</h2>
        <p>Con una sola portadora, R = (1/T<sub>s</sub>)·log₂M = B·log₂M (Unidad 8): en un canal de ancho 2B, la banda base, 2ASK, 2PSK u 8QAM cambian solo la cantidad de bits por símbolo. El techo lo pone Shannon (Unidad 5); igualándolo con Nyquist sale cuántos niveles admite el canal:</p>
        ${eq('C = 2B·log₂M = B·log₂(1 + SNR) &nbsp;⟹&nbsp; B·log₂M² = B·log₂(1 + SNR) &nbsp;⟹&nbsp; M = √(1 + SNR)', 'Niveles según la SNR (N = kTB, SNR<sub>dB</sub> = 10·log S/N)')}
        <p>El problema del par de cobre es que la SNR <strong>no es pareja</strong>: la atenuación crece con la frecuencia y hay interferencias en bandas puntuales. Con una sola portadora toda la señal queda atada al peor tramo. <strong>DMT</strong> divide la banda en muchos canales angostos (el flujo R<sub>b</sub> se reparte en N flujos de R<sub>b</sub>/N), y en cada uno elige la M que su propia SNR permite.</p>
        ${def('DMT', 'En ADSL se modulan múltiples frecuencias portadoras usando nQAM. Estas frecuencias están espaciadas en forma constante y para cada portadora se mide el SNR para determinar el máximo nQAM posible de obtener. La composición de todas las frecuencias es puesta sobre la línea. Este principio se denomina Discrete Multi Tone (DMT).', 'Apunte de la Unidad 9.')}
        <ul>
          <li>Mínimo: <strong>4-QAM</strong>, 2 bits/símbolo. Máximo: <strong>16384-QAM</strong>, 14 bits/símbolo.</li>
          <li>Un <strong>símbolo DMT</strong> es la suma de los símbolos de todas las portadoras durante un tiempo de símbolo T<sub>s</sub> (por ejemplo 4-QAM en f₁, 16-QAM en f₂, 4-QAM en f₃…).</li>
          <li>Al principio coexistieron dos técnicas para ADSL: <strong>CAP</strong> (Carrierless Amplitude/Phase, una sola portadora) y <strong>DMT</strong>; ANSI, ETSI e ITU eligieron DMT. El módem la implementa con una <strong>IFFT</strong> al modular y una <strong>FFT</strong> al demodular (Unidad 2), en un DSP: el ATU-C hace la IFFT de 512 muestras para la bajada y el ATU-R una de 64 para la subida. Por eso el ATU-C maneja hasta 256 subportadoras y el ATU-R como máximo 32.</li>
          <li>La SNR de cada subportadora se estima al inicio, cuando el ATU-R y el ATU-C establecen el enlace, con una <strong>secuencia de entrenamiento</strong> predefinida.</li>
        </ul>
        <h2>Los 256 canales de ADSL</h2>
        <p>El ancho de banda de la línea (<strong>1,104 MHz</strong>) se divide en <strong>256 canales de 4,3125 kHz</strong> (cada subportadora modulada ocupa 4 kHz):</p>
        ${table(['Canales', 'Uso', 'Detalle'], [
          ['<strong>0</strong>', 'Voz', '4 kHz para POTS'],
          ['<strong>1 a 5</strong>', 'Guarda', 'Separan la voz de los datos'],
          ['<strong>6 a 30</strong>', 'Subida (upstream)', '24 canales de datos + 1 de control'],
          ['<strong>31 a 255</strong>', 'Bajada (downstream)', '224 canales de datos + 1 de control'],
        ])}
        ${eq('R = canales de datos × 4 kHz × bits por baudio', 'Velocidad teórica de DMT')}
        ${table(['Sentido', 'Máxima teórica', 'Máxima real'], [
          ['Subida', '24 × 4 kHz × 15 bits = <strong>1,44 Mbps</strong>', '≈ 1 Mbps'],
          ['Bajada', '224 × 4 kHz × 15 bits = <strong>13,44 Mbps</strong>', '≈ 8 Mbps'],
        ])}
        <p>La real es menor porque <strong>algunos canales no se pueden usar por el nivel de ruido</strong>. (El apunte calcula con 15 bits por baudio; la lectura 9.2 fija el máximo en 14.) En la norma G.dmt anexo A la lectura usa las portadoras <strong>7 a 29</strong> para subir y <strong>38 a 255</strong> para bajar, dejando más guarda.</p>
        ${lab(0)}
        <h2>Cuántos bits por subportadora</h2>
        <p>La lectura 9.2 da la SNR mínima para modular n bits con un BER &lt; 10<sup>−7</sup>. Se usa en los dos sentidos: qué SNR hace falta para n bits, o cuántos bits entran con una SNR dada. Cada bit extra cuesta ≈ <strong>3 dB</strong> (SNR ≈ 9,8 + 3n dB).</p>
        ${table(['Bits/símbolo', 'QAM', 'SNR (dB) para BER &lt; 10⁻⁷'], [['4', '16-QAM', '21,8'], ['6', '64-QAM', '27,8'], ['8', '256-QAM', '33,8'], ['9', '512-QAM', '36,8'], ['10', '1024-QAM', '39,9'], ['12', '4096-QAM', '45,9'], ['14', '16384-QAM', '51,9']])}
        <p>Shannon da el límite teórico (n ≤ log₂(1 + SNR), sin margen de error); la tabla da lo que se usa en la práctica.</p>
        ${lab(1)}
        <h2>Bitswapping</h2>
        <ul>
          <li>Después de la inicialización se usa una QAM <strong>menor</strong> que la posible en la mayoría de las portadoras. Ejemplo del apunte: la SNR medida da como máximo <strong>4096-QAM (12 bits)</strong>, y se usa <strong>1024-QAM (10 bits)</strong>; quedan 2 bits de reserva que pueden reubicarse en esa portadora.</li>
          <li>Durante el <strong>showtime</strong> (operación del módem) la SNR se mide en todas las portadoras a intervalos regulares (por defecto <strong>10 s</strong>).</li>
          <li>Si una interferencia degrada la SNR de un grupo de portadoras, baja su máximo de bits; los bits que ya no entran se <strong>reubican</strong> en otras portadoras donde la n-QAM usada es menor que la posible.</li>
          <li>Los módems intentan desparramarlos sobre la <strong>mayor cantidad de portadoras posible</strong>: el margen de ruido queda repartido sobre todo el espectro.</li>
        </ul>
        <p>El ATU-R se engancha (con un PLL) con una <strong>portadora piloto</strong> de la bajada; cuanto mejor el enganche, mejor la SNR global.</p>
        <h2>Trama ADSL: el superframe</h2>
        <p>Un <strong>superframe</strong> dura <strong>17 ms</strong> y tiene 68 <strong>símbolos de datos</strong> (DS) más un <strong>símbolo de sincronización</strong> (SS), que asegura la sincronización y detecta una posible pérdida de trama.</p>
        ${eq('T<sub>s</sub> = 17 ms / 69 = 246,4 µs &nbsp;·&nbsp; para los datos: 17 ms / 68 = <strong>250 µs</strong> → 4000 símbolos/s', 'Período de símbolo ADSL')}
        <h2>Detección y corrección de errores</h2>
        <p>Hay que elegir: <strong>corregir</strong> (con el riesgo de introducir errores al “corregir” mal) o solo <strong>detectar</strong> más errores sin agregar ninguno (Unidad 6). Algunos mecanismos, como ATM, pasan de corrección a detección apenas ven errores, porque los errores vienen en <strong>ráfagas</strong>.</p>
        <h3>Reed-Solomon RS(n, k)</h3>
        ${eq('d = n − k + 1 &nbsp;·&nbsp; c = (d − 1)/2 &nbsp;·&nbsp; overhead = (n − k)/n', 'Distancia, bytes corregibles y overhead')}
        <p>ADSL usa <strong>RS(255, 239)</strong>: palabras de 255 bytes con 239 de mensaje y <strong>16 de redundancia</strong> → d = 17 → corrige hasta <strong>8 bytes</strong> erróneos por palabra, con un overhead de 16/255 = <strong>6,3 %</strong>. Un símbolo de datos corresponde a una palabra RS de 255 bytes (algunos son de <em>framing</em> para la comunicación entre módems: EOC, AOC, IB, CRC).</p>
        ${eq('con RS: (255 − 16 − 1) × 8 × 4000 = 7,616 Mbps &nbsp;·&nbsp; sin RS: (255 − 1) × 8 × 4000 = 8,128 Mbps', 'Máxima velocidad de bajada de datos')}
        <h3>Entrelazado (interleaving)</h3>
        <p>Una ráfaga que destruye más bytes de los que una palabra puede corregir se pierde. Con el <strong>modo entrelazado</strong> los bytes de varias palabras se mezclan antes de transmitir: la ráfaga se reparte y cada palabra recibe pocos errores (ejemplo de la lectura: 6 bytes perdidos quedan en 1 byte por bloque), que RS corrige. El precio es más retardo. Por eso ADSL tiene un camino <strong>FAST</strong> (Trellis o RS, sin entrelazado) y uno <strong>INTERLEAVED</strong> (Trellis + RS + entrelazado).</p>
        <h3>Código Trellis y ganancia de código</h3>
        <p>Trellis es opcional en ADSL: corrige mirando los datos <strong>completos</strong>, como en el lenguaje (en “the water is <em>let</em> and cold” la palabra suelta no parece un error, pero por el contexto tiene que ser <em>wet</em>). Al corregir parte de los errores, la detección y corrección bajan la SNR que se necesita para una constelación: eso es la <strong>ganancia de código</strong>.</p>
        ${table(['QAM', 'Sin codificar', 'Trellis (≈ 5,5 dB)', 'RS (≈ 4 dB)', 'Trellis + RS (≈ 9 dB)'], [['16-QAM (4 bits)', '21,5 dB', '16 dB', '17,5 dB', '12,5 dB'], ['64-QAM (6 bits)', '27,5 dB', '22 dB', '23,5 dB', '18,5 dB']])}
        <p>La lectura distingue además la velocidad de línea <strong>alcanzable</strong> (máxima según la SNR medida) de la <strong>usada</strong>, y la velocidad ATM posible de la usada: entre una y otra se va el overhead de Trellis, Reed-Solomon y <em>framing</em>.</p>
        ${note('Lo que está espaciado en forma constante en DMT son las <strong>frecuencias</strong> de las subportadoras (4,3125 kHz), no los tiempos; y lo que se mide en cada una es la <strong>SNR</strong>, para elegir el máximo n-QAM. Es una V o F frecuente del tercer parcial.', 'exam')}`,
      labs: [
        { type: 'calc', title: 'Velocidad de DMT', intro: 'R = canales de datos × velocidad de símbolo × bits por baudio. Por defecto, la bajada de ADSL del apunte.',
          fields: [{ id: 'n', label: 'Canales de datos', value: 224 }, { id: 'rs', label: 'Baudios por canal [kHz]', value: 4 }, { id: 'b', label: 'Bits por baudio (2 a 15)', value: 15 }, { id: 'u', label: 'Canales inutilizables por ruido', value: 0 }],
          run: (v) => { const n = Math.max(0, v.n - v.u), R = n * v.rs * 1e3 * v.b; return `Canales útiles: ${num(v.n, 0)} − ${num(v.u, 0)} = ${num(n, 0)}\nR = ${num(n, 0)} × ${num(v.rs, 3)} kHz × ${num(v.b, 0)} bits = ${num(R / 1e6, 3)} Mbps\n${v.b > 15 || v.b < 2 ? 'Fuera de rango: DMT usa de 2 (4-QAM) a 15 bits por baudio.' : ''}`; } },
        { type: 'calc', title: 'Bits de una subportadora según su SNR', intro: 'Límite de Shannon y criterio práctico de la lectura 9.2 (BER &lt; 10⁻⁷).',
          fields: [{ id: 's', label: 'SNR de la subportadora [dB]', value: 40 }, { id: 'm', label: 'Margen que se deja [bits]', value: 2 }],
          run: (v) => { const { theo, prac } = dmtBits(v.s); const used = Math.max(0, prac - v.m); return `SNR = ${num(10 ** (v.s / 10), 0)} veces\nShannon: n ≤ log₂(1 + SNR) = ${theo} bits (sin margen de error)\nPráctico (BER < 10⁻⁷): n = ${prac} bits${prac ? ` → ${2 ** prac}-QAM` : ' → la portadora no se usa (4-QAM pide 15,8 dB)'}\nCon ${num(v.m, 0)} bits de margen: ${used >= 2 ? `${used} bits → ${2 ** used}-QAM; quedan ${prac - used} bits para bitswapping` : 'no se usa'}`; } },
      ],
      exercises: [
        { title: 'Velocidades teóricas y reales de ADSL', level: 1, prompt: '<p>Con DMT de 256 canales y 15 bits por baudio a 4 kbaudios por canal: a) ¿qué velocidad teórica tiene la subida (canales 6 a 30) y la bajada (canales 31 a 255)? b) ¿Por qué en la práctica se logra ≈ 1 y ≈ 8 Mbps?</p>',
          solution: { explain: '<p><b>a)</b> Subida: 25 canales, 1 de control → 24 de datos: 24 × 4 kHz × 15 = <strong>1,44 Mbps</strong>. Bajada: 225 canales, 1 de control → 224: 224 × 4 kHz × 15 = <strong>13,44 Mbps</strong>.</p><p><b>b)</b> Porque no todos los canales soportan 15 bits: la SNR de cada uno limita su n-QAM, y algunos no se pueden usar por el ruido. Además se deja margen para bitswapping y hay overhead de Reed-Solomon y framing.</p>' } },
        { title: 'Bitswapping', level: 2, prompt: '<p>Al inicializar, la SNR de una portadora permite 4096-QAM y se configura 1024-QAM. Durante el showtime una interferencia baja la SNR de un grupo de portadoras. Explique qué hace el módem.</p>',
          solution: { explain: '<p>4096-QAM son 12 bits y 1024-QAM son 10: quedan <strong>2 bits de margen</strong> en esa portadora. Durante el showtime el módem mide la SNR de todas las portadoras cada ≈ 10 s. En las afectadas baja el máximo de bits, así que los bits que ya no entran se <strong>reubican</strong> en otras portadoras cuya n-QAM usada es menor que la posible (las que tienen margen). Los reparte sobre la mayor cantidad de portadoras posible, para que el margen de ruido quede repartido en todo el espectro y la velocidad total no cambie.</p>' } },
        { title: 'Reed-Solomon en ADSL', level: 2, prompt: '<p>ADSL usa RS(255, 239) con 4000 símbolos de datos por segundo y 1 byte de framing por palabra. a) Distancia y bytes corregibles. b) Overhead. c) Máxima velocidad de bajada de datos con y sin RS. d) ¿Qué agrega el entrelazado?</p>',
          solution: { explain: '<p><b>a)</b> d = 255 − 239 + 1 = <strong>17</strong>; c = (17 − 1)/2 = <strong>8 bytes</strong> por palabra.</p><p><b>b)</b> 16/255 = <strong>6,3 %</strong>.</p><p><b>c)</b> Con RS: (255 − 16 − 1) × 8 × 4000 = <strong>7,616 Mbps</strong>. Sin RS: (255 − 1) × 8 × 4000 = <strong>8,128 Mbps</strong>.</p><p><b>d)</b> Mezcla los bytes de varias palabras: una ráfaga larga queda repartida en pocos errores por palabra, que RS sí corrige. Cuesta retardo.</p>' } },
        { title: 'SNR y n-QAM de una subportadora', level: 2, prompt: '<p>Una subportadora tiene SNR = 34 dB. a) ¿Cuántos bits admite según la tabla de la lectura 9.2 (BER &lt; 10⁻⁷)? b) ¿Y como límite de Shannon? c) Si se usa Trellis + RS (≈ 9 dB de ganancia), ¿cuántos bits entran?</p>',
          solution: { explain: `<p><b>a)</b> 256-QAM necesita 33,8 dB y 512-QAM 36,8 dB: con 34 dB entran <strong>${dmtBits(34).prac} bits (256-QAM)</strong>.</p><p><b>b)</b> 34 dB = ${num(10 ** 3.4, 0)} veces → log₂(1 + 2512) = 11,3 → <strong>${dmtBits(34).theo} bits</strong> como techo teórico, sin margen de error.</p><p><b>c)</b> La SNR equivalente es ≈ 34 + 9 = 43 dB → <strong>${dmtBits(43).prac} bits</strong> (2048-QAM).</p>` } },
      ],
      quiz: [
        { q: 'En ADSL, el espectro de 1,104 MHz se divide en…', o: ['24 canales de 46 kHz', '256 canales de 4,3125 kHz', '1104 canales de 1 kHz', '2 canales: subida y bajada'], a: 1, e: 'Cada subportadora modulada ocupa 4 kHz.' },
        { q: 'Los canales 1 a 5 de DMT…', o: ['llevan la voz', 'son bandas de guarda', 'son de subida', 'son de control'], a: 1, e: 'El canal 0 es la voz.' },
        { q: 'La velocidad teórica de bajada de ADSL es…', o: ['1,44 Mbps', '8 Mbps', '13,44 Mbps', '24 Mbps'], a: 2, e: '224 × 4 kHz × 15 bits.' },
        { q: 'En DMT, la n-QAM de cada subportadora va de…', o: ['2-QAM a 64-QAM', '4-QAM (2 bits) a 16384-QAM (14 bits)', '16-QAM a 256-QAM', 'siempre 1024-QAM'], a: 1, e: 'Según la SNR medida.' },
        { q: 'El bitswapping…', o: ['intercambia la subida con la bajada', 'reubica los bits de portadoras cuya SNR se degradó en otras con margen', 'invierte el orden de los bits', 'cambia de DMT a CAP'], a: 1, e: 'La SNR se mide cada ≈ 10 s en showtime.' },
        { q: 'En RS(255, 239) se corrigen hasta…', o: ['16 bytes', '8 bytes', '17 bytes', '239 bytes'], a: 1, e: 'd = 17, c = (d − 1)/2.' },
        { q: 'El overhead de RS(255, 239) es…', o: ['≈ 1 %', '≈ 6,3 %', '≈ 16 %', '≈ 50 %'], a: 1, e: '16/255.' },
        { q: 'El superframe ADSL dura 17 ms y tiene…', o: ['69 símbolos de datos', '68 símbolos de datos y 1 de sincronización', '256 símbolos', '17 símbolos'], a: 1, e: 'T<sub>s</sub> de datos = 250 µs.' },
        { q: 'El entrelazado (interleaving) sirve para…', o: ['aumentar la velocidad', 'repartir las ráfagas de errores entre varias palabras para que RS pueda corregirlas', 'separar voz y datos', 'medir la SNR'], a: 1, e: 'A costa de retardo.' },
        { q: 'Trellis + Reed-Solomon dan una ganancia de código de aproximadamente…', o: ['3 dB', '5,5 dB', '9 dB', '20 dB'], a: 2, e: 'Trellis ≈ 5,5 dB y RS ≈ 4 dB.' },
        { q: 'Los organismos de normalización eligieron para ADSL…', o: ['CAP', 'DMT', 'FSK', 'OOK'], a: 1, e: 'CAP usaba una sola portadora.' },
        { q: 'En DMT, cada bit adicional por subportadora requiere aproximadamente…', o: ['1 dB más de SNR', '3 dB más de SNR', '6 dB más de SNR', 'el doble de ancho de banda'], a: 1, e: 'Tabla de la lectura: 16-QAM 21,8 dB, 64-QAM 27,8 dB.' },
      ],
      open: [
        { t: 'num', q: '¿Cuál es la velocidad teórica de subida de ADSL con 24 canales de datos, 4 kbaudios y 15 bits por baudio? (en Mbps)', a: 1.44, u: 'Mbps', e: '<p>24 × 4000 × 15 = 1 440 000 bps = 1,44 Mbps.</p>' },
        { t: 'num', q: '¿Cuántos bytes erróneos por palabra corrige un código Reed-Solomon RS(255, 239)?', a: 8, e: '<p>d = 255 − 239 + 1 = 17; c = (17 − 1)/2 = 8.</p>' },
        { t: 'num', q: '¿Qué velocidad máxima de bajada de datos logra ADSL con Reed-Solomon, (255 − 16 − 1) bytes × 8 × 4000 símbolos/s? (en Mbps)', a: 7.616, u: 'Mbps', e: '<p>238 × 8 × 4000 = 7 616 000 bps.</p>' },
        { t: 'num', q: 'Un superframe ADSL dura 17 ms y tiene 68 símbolos de datos. ¿Cuántos símbolos de datos por segundo se transmiten?', a: 4000, e: '<p>T<sub>s</sub> = 17 ms/68 = 250 µs → 1/250 µs = 4000 símbolos/s.</p>' },
        { t: 'text', q: '¿Qué es el bitswapping?', k: [['snr', 'ruido'], ['reubica', 'reasigna', 'mueve', 'redistribuye', 'realoca'], ['bits'], ['portadora', 'subportadora', 'canal']], need: 3, e: '<p>Cuando la SNR de algunas portadoras se degrada durante la operación, sus bits se reubican en otras portadoras con margen (n-QAM usada menor que la posible), repartiéndolos sobre la mayor cantidad posible.</p>' },
      ],
      sources: [
        { title: 'Unidad 9: Equipos de comunicación de datos (DCE)', ref: 'Apunte de la cátedra de Comunicación de Datos, UTN-FRT (9.0)', points: ['Técnicas de multicanalización: DMT, M = √(1 + SNR), reparto de los 256 canales y velocidades.', 'Bitswapping y margen de ruido.'] },
        { title: 'A.D.S.L – Banda Ancha', ref: 'Lectura 9.2 de la Unidad 9', points: ['QAM contra SNR, DMT, bitswapping y superframe.', 'Reed-Solomon, entrelazado, Trellis y ganancia de código; velocidades ADSL.'] },
        { title: 'Tecnologías de acceso de banda ancha', ref: 'Lectura 9.1 de la Unidad 9', points: ['CAP contra DMT, IFFT/FFT en ATU-C y ATU-R, secuencia de entrenamiento.'] },
      ],
    },

    {
      id: 'acceso-optico',
      module: 'u9',
      title: 'Redes de acceso: FTTx y redes ópticas pasivas (PON)',
      keywords: 'red de acceso última milla lazo de abonado FTTx FTTN FTTC FTTB FTTH FTTCab FTTEx HFC inalámbrica satélite PON red óptica pasiva OLT ONU ONT splitter óptico árbol broadcast TDMA ráfagas burst WDM 1490 nm 1310 nm 1550 nm punto a punto AOEN MDU presupuesto óptico clase B clase C triple play IPTV GPON EPON',
      tldr: 'La <strong>red de acceso</strong> (última milla) une al usuario con el último nodo de la red. FTTx dice <strong>hasta dónde llega la fibra</strong>: nodo (FTTN), acera (FTTC), edificio (FTTB) u hogar (FTTH); el resto es cobre. Una <strong>PON</strong> no tiene ningún dispositivo activo entre la central y el usuario: la <strong>OLT</strong> (central) y las <strong>ONU</strong> (usuario) son activas; el <strong>splitter</strong> óptico es pasivo. La bajada se <mark>reparte entre todos</mark> (broadcast, 1490 nm) y la subida va <mark>en ráfagas TDMA</mark> (1310 nm), en una sola fibra gracias a WDM.',
      goals: ['Enumerar los esquemas de red de acceso cableada y comparar fibra con cobre.', 'Diferenciar FTTN, FTTC, FTTB y FTTH, y PON de punto a punto.', 'Identificar los elementos activos y pasivos de una PON y su planta externa.', 'Explicar el tráfico de subida y bajada y calcular un presupuesto óptico.'],
      body: `
        <h2>Redes de acceso</h2>
        <p>La red de acceso abarca los elementos que soportan los enlaces entre los usuarios finales y el último nodo de la red: el <strong>lazo de abonado</strong> o <strong>última milla</strong>. Sus componentes son los medios (par de cobre, coaxil, fibra, canal radioeléctrico) y los equipos que adecuan la señal a ellos. En una red de telecomunicaciones se distinguen la red de <strong>transporte</strong> (une nodos entre sí), la de <strong>acceso</strong> (une los nodos con los clientes) y la <strong>red interna del cliente</strong>.</p>
        <p>Para ofrecer servicios de banda ancha hubo que desplegar nuevas redes basadas en el coaxil y la fibra. Los esquemas actuales de redes de acceso cableadas son:</p>
        <ul>
          <li><strong>xDSL</strong> (Digital Subscriber Line), sobre el par de cobre.</li>
          <li><strong>FTTN</strong> (Fiber To The Node), <strong>FTTB</strong> (Building), <strong>FTTC</strong> (Curb) y <strong>FTTH</strong> (Home).</li>
          <li><strong>HFC</strong> (Hybrid Fiber Coax), la red híbrida de los cable módems.</li>
        </ul>
        <p>Además están las redes de acceso <strong>inalámbricas</strong> y por <strong>satélite</strong>.</p>
        <h2>Fibra contra cobre</h2>
        ${table(['Fibra (PON)', 'Cobre (xDSL)'], [
          ['Mucho más ancho de banda y velocidad', 'Velocidad limitada por la atenuación del par'],
          ['Baja atenuación, inmune a interferencias electromagnéticas', 'Pierde velocidad y sufre ruido con la distancia'],
          ['Una fibra compartida por muchos usuarios (splitter)', 'Un par por abonado'],
          ['Despliegue mucho más costoso', 'Aprovecha el plantel existente (ADSL2+, VDSL2) sin grandes inversiones'],
        ])}
        <h2>FTTx: hasta dónde llega la fibra</h2>
        ${table(['Topología', 'La fibra llega a…', 'Tramo final'], [
          ['<strong>FTTN</strong> (Node)', 'un nodo o armario del barrio (FTTCab, gabinete, ≈ 300 m o más del abonado)', 'cobre (xDSL), más de 300 m'],
          ['<strong>FTTC</strong> (Curb)', 'la acera o un poste, un gabinete cercano', 'cobre, menos de 300 m (≈ 20 m según la lectura 9.1)'],
          ['<strong>FTTB</strong> (Building)', 'el edificio (sótano o sala de comunicaciones, con una ONT)', 'cobre (VDSL2) o cableado LAN'],
          ['<strong>FTTH</strong> (Home)', 'el interior del domicilio', 'ninguno: 100 % fibra'],
        ])}
        <p>En FTTN, FTTC y FTTB una <strong>ONU</strong> recibe la fibra (el <em>feeder</em>) y distribuye por cobre con xDSL en distancias cortas. Solo en FTTH/FTTB se eliminan todos los componentes electrónicos activos de la planta exterior.</p>
        ${note('La cátedra recomienda: cuando ya hay <strong>plantel de cobre instalado</strong>, la solución más conveniente es <strong>FTTC</strong> y terminar la última milla con <strong>ADSL2+ o VDSL2</strong>; mejorando y reacomodando el plantel se llega con más ancho de banda sin grandes inversiones. <strong>FTTH</strong> es excelente cuando <strong>no hay ninguna infraestructura previa</strong>, porque hoy PON es mucho más costosa que xDSL.', 'exam')}
        <h2>Tecnología PON</h2>
        ${def('PON', 'Son redes de fibra óptica que no utilizan ningún otro dispositivo activo entre la central y el terminal y permiten compartir una misma fibra entre múltiples usuarios con múltiples servicios.', 'Apunte de la Unidad 9 (Passive Optical Network).')}
        <p>A diferencia de xDSL, el medio es la <strong>fibra óptica</strong>. Al reemplazar los elementos activos por pasivos baja mucho el costo de operación y mantenimiento. PON se usa sobre todo en redes <strong>FTTH</strong> y en edificios de viviendas multifamiliares (<strong>MDU</strong>).</p>
        ${table(['Elemento', 'Tipo', 'Dónde y qué hace'], [
          ['<strong>OLT</strong> (Optical Line Terminal), uno', 'Activo', 'En la central (CO): punto de partida de la red, terminal en el proveedor de servicios. Agrega la voz de la PSTN, los datos de un router y el video'],
          ['<strong>Splitters</strong> (divisores ópticos), varios', 'Pasivo (sin energía)', 'En la red de distribución: dividen la luz de una fibra en varias'],
          ['<strong>ONU / ONT</strong> (Optical Network Unit / Terminal), varias', 'Activo', 'En el usuario (o en el edificio/nodo en FTTB/FTTC): convierte la señal óptica en eléctrica para teléfonos, computadoras y TV'],
        ])}
        <p>Desde la central parte una red troncal de fibra que se va <strong>dividiendo</strong> al pasar por los splitters, creando ramificaciones que se comunican en forma bidireccional con la troncal <strong>pero no entre ellas</strong>: es un árbol punto a multipunto. Típicamente una rama alimenta a 32 clientes y la OLT puede estar a <strong>20 km</strong>.</p>
        <h3>FTTH punto a punto o PON</h3>
        ${table(['Punto a punto (PTP, AOEN)', 'PON'], [
          ['Una fibra y un láser dedicados por usuario', 'Se hace “splitting” de la fibra una o más veces en el campo (1 a 32 veces)'],
          ['No comparte fibra ni ancho de banda', 'La fibra y el ancho de banda se comparten entre usuarios'],
          ['La configuración más simple; All-Optical Ethernet Network', 'Mayores pérdidas ópticas y menor alcance (≈ 20 km)'],
          ['Más fibra y más transmisores en la central', 'Sin componentes activos en el campo'],
        ])}
        <h2>Subida y bajada en una PON</h2>
        ${table(['', 'Bajada (downstream, OLT → ONU)', 'Subida (upstream, ONU → OLT)'], [
          ['Método', 'Se <strong>divide entre todos los usuarios</strong>: una señal de potencia constante que el splitter reparte a todas las ONU. Cada ONU se queda con sus paquetes y descarta los ajenos (por eso va cifrada)', 'En <strong>modo burst</strong> (ráfagas): cada ONU transmite en las ventanas de tiempo que le asigna la OLT. Es <strong>TDM</strong> (TDMA): evita colisiones en el splitter y requiere sincronización'],
          ['Longitud de onda (GPON)', '1490 nm datos (1550 nm video, opcional)', '1310 nm'],
        ])}
        <p>Subida y bajada comparten <strong>una sola fibra</strong> porque usan longitudes de onda distintas, combinadas con acopladores <strong>WDM</strong> (la FDM de la luz, Unidad 8). Se puede transmitir en ambos sentidos por una fibra, pero hacen falta acopladores, y <strong>la fibra es menos cara que los acopladores</strong>; la PON FTTH es de los únicos sistemas que lo hacen porque su arquitectura ya se basa en acopladores. Hay variantes de <em>splitting</em>: por <strong>división de potencia</strong> (se comparten la potencia y el ancho de banda; disponible y barato) o por <strong>WDM</strong> (una λ dedicada por usuario: pocas pérdidas y mucho ancho de banda, pero componentes caros).</p>
        <h2>Planta externa y presupuesto óptico</h2>
        <p>Entre la central y el cliente: cables de fibra (<em>feeder</em> de la CO al splitter, distribución hasta la caja de bajada y acometida), acopladores WDM, <strong>FDH</strong> (gabinetes de distribución con los splitters), cajas de empalme y de bajada y conectores SC/APC. El <strong>splitter</strong> es un dispositivo bidireccional pasivo, de gran ancho de banda, que solo agrega atenuación: en bajada divide la señal entre sus salidas y en subida combina las de las ONT; puede haber varios en cascada (1:2 a 1:32 en G.983, hasta 1:64 en G.984). Se fabrican en guía de onda planar (muchos puertos) o por fusión bicónica (pocos puertos).</p>
        ${eq('pérdida ideal del splitter 1:N = 10·log N dB &nbsp;·&nbsp; pérdida total = splitter + empalmes + conectores + α·L ≤ clase', 'Presupuesto óptico')}
        ${table(['Clase', 'Pérdida admitida'], [['A', '5 a 20 dB'], ['B', '10 a 25 dB'], ['C', '15 a 30 dB'], ['B+ (GPON)', '28 dB']])}
        <p>Escenario típico de la lectura 9.3: splitter 1:32 (16-17 dB) + 4 empalmes de fusión de 0,05 dB + 18,2 km de fibra G.652 a 0,27 dB/km en 1490 nm = 17 + 0,2 + 4,9 = <strong>22,1 dB</strong>, dentro de la clase B.</p>
        ${lab(0)}
        <h2>Para qué: triple play</h2>
        <p><strong>Triple play</strong> es la provisión de voz, datos y video sobre una plataforma integrada IP (IPTV), típicamente ≈ 20 Mbps por cliente; con telefonía celular es <em>cuádruple play</em>. Una sola infraestructura de transporte y de acceso soporta los tres servicios. La OLT integra telefonía e Internet; el video se convierte a formato óptico y las tres señales, en λ distintas, se acoplan en un acoplador WDM hacia la misma fibra.</p>`,
      labs: [
        { type: 'calc', title: 'Presupuesto de un enlace PON', intro: 'Suma de pérdidas desde la OLT hasta la ONT, comparada con la clase óptica.',
          fields: [{ id: 'n', label: 'Splitter 1:N (N)', value: 32 }, { id: 'ex', label: 'Pérdida en exceso del splitter [dB]', value: 2 }, { id: 'L', label: 'Fibra [km]', value: 18.2 }, { id: 'a', label: 'Atenuación de la fibra [dB/km]', value: 0.27 }, { id: 'e', label: 'Empalmes', value: 4 }, { id: 'ep', label: 'Pérdida por empalme [dB]', value: 0.05 }, { id: 'c', label: 'Conectores (0,5 dB c/u)', value: 0 }, { id: 'cl', label: 'Clase', options: ['B (25 dB)', 'B+ (28 dB)', 'C (30 dB)'], value: 'B (25 dB)' }],
          run: (v) => { const sp = 10 * Math.log10(v.n) + v.ex, fib = v.L * v.a, emp = v.e * v.ep, con = v.c * 0.5, tot = sp + fib + emp + con, max = +v.cl.match(/\((\d+)/)[1]; return `Splitter: 10·log ${num(v.n, 0)} + ${num(v.ex, 2)} = ${num(sp, 2)} dB\nFibra: ${num(v.L, 2)} km × ${num(v.a, 3)} = ${num(fib, 2)} dB\nEmpalmes: ${num(v.e, 0)} × ${num(v.ep, 2)} = ${num(emp, 2)} dB · Conectores: ${num(con, 2)} dB\nTotal: ${num(tot, 2)} dB → ${tot <= max ? `cumple la clase ${v.cl} (sobran ${num(max - tot, 2)} dB)` : `NO cumple la clase ${v.cl} (faltan ${num(tot - max, 2)} dB)`}`; } },
      ],
      exercises: [
        { title: 'Redes de acceso óptico', official: '9.3', level: 2, prompt: '<p>Explique para las redes de acceso óptico: a) ventajas y desventajas respecto a las redes de cobre; b) diferencias entre FTTC, FTTN, FTTB y FTTH; c) redes EPON y GPON; d) elementos activos y pasivos; e) tráfico de subida y bajada en GPON.</p>',
          solution: { explain: `<p><b>a)</b> Ventajas: mucho más ancho de banda, menor atenuación e inmunidad al ruido, una fibra compartida por muchos usuarios. Desventaja: el despliegue es mucho más caro; el cobre con ADSL2+ o VDSL2 aprovecha el plantel existente.</p>
            <p><b>b)</b> Difieren en hasta dónde llega la fibra: FTTN a un nodo del barrio (cobre de más de 300 m), FTTC a la acera (menos de 300 m de cobre), FTTB al edificio (cobre o LAN interna) y FTTH hasta el hogar (100 % fibra).</p>
            <p><b>c)</b> Las dos son PON: GPON es de la ITU-T (G.984: 2,488 Gbps de bajada, 1,244 Gbps de subida, hasta 64 usuarios, NRZ y encapsulado GEM); EPON es del IEEE (802.3ah: 1,25 Gbps simétricos, 32 usuarios, 8B/10B) y transporta tramas Ethernet.</p>
            <p><b>d)</b> Activos: OLT (central) y ONU/ONT (usuario). Pasivo: el splitter óptico.</p>
            <p><b>e)</b> Bajada: broadcast de la OLT a todas las ONU en 1490 nm (video en 1550 nm). Subida: TDMA, cada ONU en su ventana de tiempo, en 1310 nm. Subida y bajada conviven en la misma fibra por WDM.</p>` } },
        { title: 'Presupuesto óptico de una PON', level: 2, prompt: '<p>Una PON tiene un splitter 1:32 de 17 dB, 4 empalmes de 0,05 dB y 18,2 km de fibra a 0,27 dB/km en 1490 nm. ¿Cuál es la pérdida total? ¿Cumple la clase B (10 a 25 dB)? ¿Y si el splitter fuera 1:64?</p>',
          solution: { explain: '<p>Fibra: 18,2 × 0,27 = 4,9 dB. Empalmes: 4 × 0,05 = 0,2 dB. Total = 17 + 0,2 + 4,9 = <strong>22,1 dB</strong> → cumple la clase B (sobran 2,9 dB).</p><p>Con 1:64 cada división por 2 agrega 10·log 2 ≈ 3 dB (más el exceso real): ≈ 20 dB de splitter → ≈ 25,1 dB, al límite de la clase B; haría falta la clase B+ (28 dB) o C.</p>' } },
        { title: 'FTTC o FTTH', level: 1, prompt: '<p>Un operador tiene que dar 50 Mbps en dos barrios: uno con plantel de cobre en buen estado y otro nuevo, sin infraestructura. ¿Qué solución le recomienda en cada caso?</p>',
          solution: { explain: '<p><b>Barrio con cobre:</b> <strong>FTTC</strong> (o FTTN) y terminar la última milla con <strong>VDSL2</strong> (o ADSL2+) desde un gabinete a menos de ≈ 300 m: con una mejora del plantel se llega con más ancho de banda sin grandes inversiones.</p><p><b>Barrio nuevo:</b> <strong>FTTH</strong> con PON: si de todos modos hay que tender cableado, conviene que sea fibra hasta el hogar, sin elementos activos en la planta externa.</p>' } },
      ],
      quiz: [
        { q: 'En una PON, ¿cuál es el único elemento pasivo?', o: ['la OLT', 'la ONU', 'el splitter óptico', 'el DSLAM'], a: 2, e: 'No necesita energía: divide la luz.' },
        { q: 'En la tecnología PON, el dispositivo activo en el nodo de distribución que sirve como terminal en el proveedor de servicios es…', o: ['la ONU', 'la OLT', 'el DSLAM', 'el ATU-R'], a: 1, e: 'Optical Line Terminal. Cuestionario de la Unidad 9.' },
        { q: 'En GPON, el tráfico de subida usa…', o: ['broadcast en 1490 nm', 'TDMA en 1310 nm', 'FDM en 1550 nm', 'CSMA/CD'], a: 1, e: 'Cada ONU transmite en su ventana de tiempo.' },
        { q: 'FTTB significa que la fibra llega…', o: ['al hogar', 'al edificio', 'a la acera', 'al nodo del barrio'], a: 1, e: 'Building: después, cobre o LAN dentro del edificio.' },
        { q: 'GPON es un estándar de…', o: ['IEEE', 'ITU-T', 'ETSI', 'ANSI'], a: 1, e: 'EPON es de IEEE.' },
        { q: 'Subida y bajada comparten una sola fibra en GPON gracias a…', o: ['TDM', 'WDM (longitudes de onda distintas)', 'CDMA', 'la paridad'], a: 1, e: '1310 nm sube, 1490 nm baja.' },
        { q: 'En una PON, las ramificaciones del árbol…', o: ['se comunican entre sí', 'se comunican con la troncal pero no entre ellas', 'son anillos', 'tienen repetidores activos'], a: 1, e: 'Punto a multipunto.' },
        { q: 'Si ya hay plantel de cobre, la cátedra recomienda…', o: ['FTTH con PON', 'FTTC y la última milla con ADSL2+ o VDSL2', 'módems V.92', 'satélite'], a: 1, e: 'FTTH conviene cuando no hay infraestructura previa.' },
        { q: 'HFC es…', o: ['una PON de Ethernet', 'una red híbrida de fibra y coaxil', 'un tipo de xDSL', 'una red satelital'], a: 1, e: 'Hybrid Fiber Coax: la del cable módem.' },
        { q: 'FTTH punto a punto (AOEN) frente a PON…', o: ['comparte la fibra entre 32 usuarios', 'dedica una fibra y un láser por usuario, sin compartir ancho de banda', 'usa splitters en cascada', 'tiene más pérdidas ópticas'], a: 1, e: 'PON comparte fibra y ancho de banda, con más pérdidas.' },
        { q: 'La pérdida ideal de un splitter 1:32 es…', o: ['3 dB', '15 dB', '32 dB', '0 dB, es pasivo'], a: 1, e: '10·log 32 ≈ 15 dB; en la práctica 16 a 17 dB.' },
        { q: 'En la bajada de una PON, cada ONU…', o: ['recibe solo su señal porque el splitter la dirige', 'recibe todo, se queda con sus paquetes y descarta los ajenos', 'transmite en su ventana', 'usa CSMA/CD'], a: 1, e: 'Broadcast cifrado.' },
      ],
      open: [
        { t: 'text', q: '¿Qué diferencia hay entre FTTC y FTTH?', k: [['acera', 'curb', 'poste'], ['hogar', 'home', 'domicilio', 'casa'], ['cobre']], need: 2, e: '<p>En FTTC la fibra llega a la acera y el último tramo (menos de 300 m) es de cobre; en FTTH la fibra llega hasta el hogar, sin cobre.</p>' },
        { t: 'text', q: '¿Cómo se ordena el tráfico de subida en GPON y por qué hace falta?', k: [['tdma', 'tdm', 'tiempo', 'ventana', 'rafaga', 'burst'], ['comparten', 'compartida', 'misma fibra', 'colision']], need: 2, e: '<p>Con TDMA: todas las ONU comparten la misma fibra hacia la OLT, así que cada una transmite en ráfagas dentro de la ventana de tiempo que le asigna la OLT, para no colisionar.</p>' },
        { t: 'num', q: 'PON con splitter de 17 dB, 4 empalmes de 0,05 dB y 18,2 km de fibra a 0,27 dB/km. ¿Pérdida total? (en dB)', a: 22.1, u: 'dB', tol: 0.01, e: '<p>17 + 0,2 + 4,914 = 22,1 dB.</p>' },
        { t: 'text', q: '¿Qué significa que una PON sea “pasiva”?', k: [['activo', 'energia', 'alimentacion', 'electronic'], ['central', 'olt'], ['usuario', 'terminal', 'onu', 'ont']], need: 2, e: '<p>Que entre la central (OLT) y el terminal del usuario (ONU/ONT) no hay ningún dispositivo activo: solo fibra y splitters, que no necesitan energía.</p>' },
      ],
      sources: [
        { title: 'Unidad 9: Equipos de comunicación de datos (DCE)', ref: 'Apunte de la cátedra de Comunicación de Datos, UTN-FRT (9.0)', points: ['Redes de acceso y FTTx; configuración FTTB/FTTC.', 'Tecnología PON: composición, árbol, downstream y upstream.'] },
        { title: 'Redes ópticas', ref: 'Lectura 9.3 de la Unidad 9 (Ing. E. Schmidberg)', points: ['FTTH punto a punto y PON, tipos de splitting, planta externa y escenario de pérdidas.', 'Triple play e IPTV.'] },
        { title: 'Tecnologías de acceso de banda ancha', ref: 'Lectura 9.1 de la Unidad 9', points: ['Red de acceso, APON sobre FTTx, OLT y ONT, WDM de tres longitudes de onda.'] },
        { title: 'Trabajo Práctico 9', ref: 'Cátedra de Comunicación de Datos, UTN-FRT', points: ['Redes de acceso óptico: ventajas, FTTx, EPON y GPON, elementos activos y pasivos, subida y bajada.'] },
      ],
    },

    {
      id: 'pon-tecnologias',
      module: 'u9',
      title: 'Tecnologías PON: de APON a NG-PON2 y la capa física de GPON',
      keywords: 'APON BPON EPON GEPON GPON XG-PON XGS-PON NG-PON2 10G-EPON TWDM-PON WDM-PON LR-GPON G.983 G.984 G.987 G.989 IEEE 802.3ah FSAN ATM celdas GEM GFP NRZ scrambling 8B/10B AES churning PLOAM OMCI DBA longitudes de onda transceptor láser LED fotodiodo OOK IM/DD Reed-Solomon FEC greenfield brownfield',
      tldr: 'Los estándares PON vienen de la <strong>UIT</strong> (APON → BPON → <strong>GPON</strong> → XG-PON → XGS-PON → NG-PON2) y del <strong>IEEE</strong> (EPON, GEPON, 10G-EPON). <strong>GPON</strong> (G.984): <mark>2,5 Gbps de bajada y 1,2 Gbps de subida</mark>, hasta 64 usuarios a 20 km. En su capa física los bits van en <strong>NRZ con scrambling</strong>, modulados por <strong>OOK</strong> (luz encendida = 1, apagada = 0) con detección directa por fotodiodo, y protegidos con <strong>FEC Reed-Solomon (255,239)</strong>.',
      goals: ['Ordenar la evolución de las tecnologías PON con sus velocidades y organismos.', 'Comparar BPON, GPON y EPON.', 'Ubicar las longitudes de onda de GPON, XG-PON, XGS-PON y NG-PON2.', 'Describir la capa física de GPON: transceptor, codificación, modulación y FEC.'],
      body: `
        <h2>Clasificación</h2>
        <p>Los estándares PON fueron desarrollados por la <strong>Unión Internacional de Telecomunicaciones</strong> (a partir del consorcio <strong>FSAN</strong>, Full Service Access Network, formado en 1995 por operadores de todo el mundo) y por el <strong>IEEE</strong>:</p>
        ${table(['Tecnología', 'Organismo / norma', 'Características'], [
          ['<strong>APON</strong> (ATM-PON)', 'ITU-T G.983 (1998), la primera PON', 'Transporta celdas <strong>ATM</strong> de 53 bytes (3 identifican la ONU/ONT); 155 Mbps simétrico o 622/155 Mbps; 32 usuarios por puerto, 20 km, NRZ, seguridad <em>churning</em>'],
          ['<strong>BPON</strong> (Broadband PON)', 'ITU-T G.983.1 a G.983.8', 'Mejora de APON: agrega Ethernet, video, WDM. 155 o 622 Mbps, 32 usuarios, 20 km, NRZ, AES. G.983.3 asigna λ (1260-1360 nm sube, 1480-1500 nm baja); G.983.4 asignación dinámica de ancho de banda; G.983.5 protección'],
          ['<strong>EPON</strong> (Ethernet PON)', 'IEEE 802.3ah (EFM, 2004)', 'Transporta <strong>tramas Ethernet</strong> en lugar de celdas ATM; 1,25 Gbps simétricos repartidos entre las ONU; 32 usuarios, 20 km, <strong>8B/10B</strong>, AES, QoS, gestión por SNMP'],
          ['<strong>GEPON</strong> (Gigabit Ethernet PON)', 'IEEE', 'Gigabit Ethernet + PON: 1,25 Gbps simétricos, 32 clientes por puerto, 20 km, triple play'],
          ['<strong>GPON</strong> (Gigabit-capable PON)', 'ITU-T G.984.1 a G.984.4 (2004)', '2,488 Gbps de bajada y 1,244 Gbps de subida (también simétrico), hasta 64 clientes (1:128 máximo) a 20 km; encapsulado <strong>GEM</strong>, NRZ, OAM PLOAM y OMCI, AES, DBA, video RF'],
          ['<strong>XG-PON</strong> (10 Gigabit PON)', 'ITU-T G.987 (2010)', '10 Gbps de bajada y 2,5 Gbps de subida (XG-PON1); el apunte lo asocia también a 10G-EPON, que es su par del IEEE'],
          ['<strong>XGS-PON</strong> (Symmetric XG-PON)', 'ITU-T', '10 Gbps simétricos (XG-PON2)'],
          ['<strong>NG-PON2</strong> (Next-Gen PON 2)', 'ITU-T G.989', '40 Gbps: TWDM-PON, 4 a 8 pares de canales de λ, cada uno compartido por TDM'],
        ])}
        <h2>BPON, GPON y EPON frente a frente</h2>
        ${table(['', 'BPON', 'GPON', 'EPON'], [
          ['Bajada (Mbps)', '1244, 622, 155', '2488, 1244', '1250'],
          ['Subida (Mbps)', '622, 155', '2488, 1244, 622, 155', '1250'],
          ['Código de línea', 'NRZ + scrambling', 'NRZ + scrambling', '8B/10B'],
          ['División máxima', '1:32', '1:128 (1:64 en la práctica)', '1:32'],
          ['Alcance', '20 km', '60 km lógicos (20 km entre ONT)', '20 km'],
          ['Norma', 'ITU-T G.983.x', 'ITU-T G.984.x', 'IEEE 802.3ah'],
          ['Video RF', 'No', 'Sí', 'No'],
          ['Eficiencia típica', '83 % bajada, 80 % subida', '93 % bajada, 94 % subida', '73 % bajada, 61 % subida'],
          ['OAM', 'PLOAM + OMCI', 'PLOAM + OMCI', 'Ethernet OAM (+ SNMP)'],
          ['Seguridad de bajada', 'Churning o AES', 'AES', 'No definida'],
        ])}
        <p><strong>GEM</strong> (GPON Encapsulation Method), basado en <strong>GFP</strong> (Generic Framing Procedure), permite llevar Ethernet o TDM además de ATM, y sube la eficiencia del 60 % al 93 %. Con <strong>DBA</strong> (asignación dinámica de ancho de banda) la OLT reparte la subida según la demanda; con las configuraciones adecuadas un usuario puede tener más de 100 Mbps.</p>
        <h2>Evolución y longitudes de onda</h2>
        ${table(['', 'GPON', 'XG-PON', 'XGS-PON', 'NG-PON2'], [
          ['Subida (nm)', '1260-1360', '1260-1280', '1260-1280', '1524-1544 (1528-1540, 1532-1540)'],
          ['Bajada (nm)', '1480-1500', '1575-1580', '1575-1580', '1596-1603'],
          ['Video (nm)', '1530-1565', '1530-1565', '—', '—'],
          ['Subida (Gbps)', '1,2', '2,5 / 10', '10', '40'],
          ['Bajada (Gbps)', '2,5', '10', '10', '40'],
        ])}
        <p>Las bandas casi no se solapan, así que una generación nueva puede <strong>convivir</strong> con la anterior sobre la misma fibra (un elemento de coexistencia en la central combina y separa las λ). Por eso se habla de migración <strong>greenfield</strong> (área nueva o reemplazo del cobre, sin requisitos de coexistencia) y <strong>brownfield</strong> (sobre una red de fibra en explotación con GPON, XG-PON, GEPON o 10G-EPON). Otras variantes: <strong>LR-GPON</strong> (largo alcance, 20 a 100 km, recupera el 96 % de las fallas en 50 ms), <strong>WDM-PON</strong> (una λ por usuario con el mismo ancho de banda, evita atascos) y <strong>PtP WDM-PON</strong> (canal de λ dedicado por ONU).</p>
        ${note('La lectura 9.5 da para TWDM-PON 1524-1544 nm de bajada y 1596-1603 nm de subida; la tabla del apunte de la cátedra (y la norma G.989) los da al revés. En el parcial seguí el apunte: <strong>NG-PON2 sube en 1524-1544 nm y baja en 1596-1603 nm</strong>.', 'warn')}
        ${lab(0)}
        <h2>Arquitectura PON: la capa física</h2>
        <ul>
          <li><strong>Transceptor</strong>: transmisor y receptor en un solo módulo. El transmisor toma una entrada eléctrica y la convierte en una salida óptica de un <strong>diodo láser o LED</strong>.</li>
          <li>La luz se acopla a la fibra con un <strong>conector</strong> y viaja por la planta de cables. En el otro extremo se acopla a un receptor, donde un <strong>detector</strong> convierte la luz en señal eléctrica y se acondiciona para el equipo.</li>
        </ul>
        <h3>Codificación: NRZ con scrambling</h3>
        <p>Los bits se codifican directamente (1 = nivel alto, 0 = nivel bajo, Unidad 7). Un <strong>scrambler</strong> (aleatorizador, polinomio 1 + x³⁹ + x⁵⁸ según el apunte) evita largas secuencias de 1 o de 0: asegura suficientes <strong>transiciones</strong>, que son cruciales para recuperar el <strong>reloj</strong> en el receptor, y evita problemas de nivel de continua y de detección. (EPON, en cambio, usa 8B/10B.)</p>
        <h3>Modulación: OOK con detección directa</h3>
        <p>Modulación por <strong>intensidad con detección directa</strong> (IM/DD), formato <strong>OOK</strong> (On-Off Keying, una ASK, Unidad 8): <strong>bit 1 → luz encendida</strong>, <strong>bit 0 → luz apagada</strong>. Es simple y económica, ideal para sistemas pasivos. El receptor usa <strong>fotodiodos</strong>: detección <strong>no coherente</strong>, que solo mira la intensidad.</p>
        <h3>Corrección de errores: FEC Reed-Solomon</h3>
        <ul>
          <li><strong>RS(255, 239)</strong>: 16 bytes de redundancia por cada 239 de datos; corrige hasta <strong>8 bytes</strong> erróneos por palabra (el mismo código que ADSL, lección anterior).</li>
          <li>Se puede <strong>habilitar o deshabilitar</strong> según la calidad de la fibra o la distancia.</li>
          <li>Mejora la sensibilidad óptica del receptor entre <strong>2 y 3 dB</strong> y aumenta la fiabilidad en tramos largos o con divisores grandes.</li>
        </ul>
        ${note('Conclusión de la lectura 9.5: GPON es una solución práctica y eficiente para el ancho de banda y la QoS. Los <strong>operadores</strong> ganan porque los equipos pasivos bajan los costos de operación y mantenimiento; los <strong>usuarios</strong>, porque tienen servicios de mejor calidad y velocidad que con otras tecnologías de cable.')}`,
      labs: [
        { type: 'classify', title: '¿De qué organismo es cada PON?', buckets: ['ITU-T (FSAN)', 'IEEE'], items: [
          { t: 'APON (G.983)', b: 0 }, { t: 'BPON', b: 0 }, { t: 'EPON (802.3ah)', b: 1 }, { t: 'GEPON', b: 1 }, { t: 'GPON (G.984)', b: 0 },
          { t: 'XG-PON (G.987)', b: 0 }, { t: '10G-EPON', b: 1, why: 'El par del IEEE de XG-PON.' }, { t: 'NG-PON2 (G.989)', b: 0 },
        ] },
        { type: 'order', title: 'Ordená las PON de la UIT de la más antigua a la más nueva', items: ['APON', 'BPON', 'GPON', 'XG-PON', 'XGS-PON', 'NG-PON2'], explain: 'APON (1998, ATM) → BPON (banda ancha) → GPON (2004, Gigabit) → XG-PON (2010, 10G) → XGS-PON (10G simétrico) → NG-PON2 (40G, TWDM).' },
      ],
      exercises: [
        { title: 'Capacidad de una OLT', level: 1, prompt: '<p>Una OLT tiene 14 tarjetas de 4 puertos GPON. ¿Cuántos clientes puede soportar y por qué? ¿Cuánto ancho de banda de bajada le toca a cada uno en el peor caso?</p>',
          solution: { explain: '<p>Cada puerto GPON alimenta un árbol PON con splitters de hasta <strong>1:64</strong> en la práctica: 14 × 4 × 64 = <strong>3584 clientes</strong> (con 1:32, 1792).</p><p>Los 2,488 Gbps de bajada de cada puerto se comparten: 2488/64 ≈ <strong>39 Mbps</strong> por cliente si todos usan el máximo a la vez (≈ 78 Mbps con 1:32). Como no todos transmiten a la vez, con DBA cada uno puede tener picos de más de 100 Mbps.</p>' } },
        { title: 'Capa física de GPON', level: 2, prompt: '<p>Describa cómo se transmite un bit en GPON: codificación, modulación, detección y corrección de errores. ¿Por qué hace falta el scrambling?</p>',
          solution: { explain: '<p><b>Codificación:</b> NRZ (1 = nivel alto, 0 = nivel bajo) con scrambling. <b>Modulación:</b> OOK por intensidad (IM/DD): bit 1 = láser encendido, bit 0 = apagado. <b>Detección:</b> directa con fotodiodo, no coherente (solo intensidad). <b>Errores:</b> FEC Reed-Solomon (255, 239), corrige 8 bytes por palabra y mejora la sensibilidad 2 a 3 dB; se puede deshabilitar en enlaces buenos.</p><p>El scrambling evita rachas largas de 1 o de 0, que en NRZ no tienen transiciones: sin transiciones el receptor pierde el reloj y aparecen problemas de nivel de continua.</p>' } },
        { title: 'Comparar GPON y EPON', level: 2, prompt: '<p>Compare GPON y EPON en organismo, velocidades, usuarios por puerto, código de línea y transporte.</p>',
          solution: { explain: `${table(['', 'GPON', 'EPON'], [['Organismo', 'ITU-T G.984', 'IEEE 802.3ah'], ['Velocidad', '2,488 Gbps bajada / 1,244 Gbps subida', '1,25 Gbps simétricos'], ['Usuarios por puerto', 'hasta 64 (1:128)', '32'], ['Código de línea', 'NRZ + scrambling', '8B/10B'], ['Transporte', 'GEM (Ethernet, TDM) y ATM', 'Tramas Ethernet'], ['Eficiencia', '≈ 93 %', '≈ 61-73 %']])}<p>GPON es más rápida y eficiente; EPON es más simple y natural para redes Ethernet.</p>` } },
      ],
      quiz: [
        { q: 'La primera PON estandarizada fue…', o: ['EPON', 'APON (G.983)', 'GPON', 'NG-PON2'], a: 1, e: 'Del FSAN, adoptada por la UIT en 1998, sobre ATM.' },
        { q: 'EPON transporta…', o: ['celdas ATM de 53 bytes', 'tramas Ethernet', 'tramas E1', 'paquetes GEM'], a: 1, e: 'IEEE 802.3ah.' },
        { q: 'GPON ofrece…', o: ['155/155 Mbps', '1,25/1,25 Gbps', '2,5 Gbps de bajada y 1,2 Gbps de subida', '10/10 Gbps'], a: 2, e: '2,488 y 1,244 Gbps.' },
        { q: 'XGS-PON es…', o: ['10 Gbps simétrico', '40 Gbps', '2,5 Gbps simétrico', 'una PON del IEEE'], a: 0, e: 'Symmetric XG-PON.' },
        { q: 'NG-PON2 alcanza…', o: ['2,5 Gbps', '10 Gbps', '40 Gbps', '100 Gbps'], a: 2, e: 'TWDM-PON.' },
        { q: 'La modulación de GPON es…', o: ['16-QAM', 'OOK por intensidad: luz encendida = 1, apagada = 0', 'DMT', 'FSK'], a: 1, e: 'IM/DD.' },
        { q: 'El receptor de GPON detecta la señal…', o: ['en forma coherente, con fase', 'con fotodiodos, solo la intensidad (no coherente)', 'con un DSLAM', 'por FFT'], a: 1, e: 'Simple y económico.' },
        { q: 'El scrambling en GPON sirve para…', o: ['cifrar los datos', 'evitar rachas largas de 0 o 1 y asegurar transiciones para el reloj', 'corregir errores', 'multiplexar ONU'], a: 1, e: 'También evita problemas de nivel DC.' },
        { q: 'La FEC de GPON (RS 255, 239)…', o: ['corrige 16 bytes y es obligatoria', 'corrige hasta 8 bytes y se puede habilitar o deshabilitar', 'detecta pero no corrige', 'solo actúa en la subida'], a: 1, e: 'Mejora la sensibilidad 2 a 3 dB.' },
        { q: 'El código de línea de EPON es…', o: ['NRZ + scrambling', '8B/10B', 'Manchester', 'HDB3'], a: 1, e: 'BPON y GPON usan NRZ + scrambling.' },
        { q: 'GPON baja en la banda de…', o: ['1260-1360 nm', '1480-1500 nm', '1575-1580 nm', '1596-1603 nm'], a: 1, e: 'Sube en 1260-1360 nm y el video va en 1530-1565 nm.' },
        { q: 'GEM, el encapsulado de GPON, se basa en…', o: ['ATM', 'GFP (Generic Framing Procedure)', 'HDLC', 'PPP'], a: 1, e: 'Lleva Ethernet o TDM.' },
      ],
      open: [
        { t: 'num', q: 'Una OLT tiene 14 tarjetas de 4 puertos GPON con splitters 1:64. ¿Cuántos clientes soporta?', a: 3584, e: '<p>14 × 4 × 64 = 3584.</p>' },
        { t: 'text', q: '¿Cómo se modula y detecta la luz en GPON?', k: [['ook', 'on-off', 'encendid', 'intensidad', 'ask'], ['fotodiodo', 'detector', 'directa', 'no coherente']], need: 2, e: '<p>Por intensidad (IM/DD) en formato OOK: luz encendida para el 1 y apagada para el 0; el receptor detecta en forma directa con un fotodiodo, solo la intensidad.</p>' },
        { t: 'text', q: '¿Qué diferencia a GPON de EPON?', k: [['itu', 'g.984'], ['ieee', '802.3'], ['ethernet'], ['2,5', '2.5', '2,488', '1,25', '1.25', 'gbps', 'velocidad']], need: 3, e: '<p>GPON es de la ITU-T (G.984), con 2,5/1,25 Gbps, hasta 64 usuarios, NRZ y GEM; EPON es del IEEE (802.3ah), con 1,25 Gbps simétricos, 32 usuarios, 8B/10B y tramas Ethernet.</p>' },
      ],
      sources: [
        { title: 'Unidad 9: Equipos de comunicación de datos (DCE)', ref: 'Apunte de la cátedra de Comunicación de Datos, UTN-FRT (9.0)', points: ['Tecnología PON: clasificación, evolución y características.', 'Arquitectura PON, capa física: transceptor, NRZ con scrambling, OOK y FEC Reed-Solomon.'] },
        { title: 'Tecnologías de redes PON', ref: 'Lectura 9.5 de la Unidad 9 (Ing. J. C. Paradiso, CePETel, 2020)', points: ['APON, BPON, EPON, GEPON y GPON; comparativa BPON/GPON/EPON.', 'XG-PON, LR-GPON, WDM-PON, NG-PON2 (TWDM y PtP WDM), coexistencia y migración.'] },
      ],
    },
  );
})();
