/* Parciales y finales reales de la cátedra (carpeta Parciales-Finales/): registro de cada examen con sus ítems y la resolución de cada uno,
   cargada como ejercicio en la lección que le corresponde. exam: ['2p-2025-t1#4'] = ítem 4 del 2do parcial 2025, tema 1.
   Los V o F se cargan una vez (vf) y generan la resolución del ítem y una pregunta por afirmación en la lección (marcada "tomada en parcial").
   Los ítems que se repiten entre exámenes comparten un ejercicio. CRC, Hamming, ruido y enlaces se calculan con cx.js. */
(() => {
  const { LESSONS, EXAMS, h, cx: X } = window.GUIDE;
  const { table, note, eq, num } = h;
  const lesson = (id) => { const l = LESSONS.find((x) => x.id === id); if (!l) throw new Error(`Lección inexistente: ${id}`); return l; };
  const add = (id, ...exs) => { const l = lesson(id); l.exercises = [...(l.exercises || []), ...exs]; };
  const mono = (s) => `<span class="mono">${s}</span>`;
  const V = true, F = false;
  const vfTag = (v) => `<span class="vf ${v ? 'v' : 'f'}">${v ? 'V' : 'F'}</span>`;

  // Cada afirmación entra una sola vez como pregunta de su lección, aunque la tomen varios exámenes
  const asked = new Map();
  function vf(id, exam, title, intro, rows) {
    add(id, { title, exam, level: 1, prompt: `<p>${intro}</p><ol>${rows.map(([s]) => `<li>${s}</li>`).join('')}</ol>`,
      solution: { explain: table(['Afirmación', '', 'Por qué'], rows.map(([s, v, w]) => [s, vfTag(v), w])) } });
    rows.forEach(([s, v, w, lid]) => {
      if (asked.has(s)) { asked.get(s).exam.push(...exam); return; }
      const q = { q: `V o F: ${s}`, o: ['Verdadero', 'Falso'], a: v ? 0 : 1, e: w, exam: [...exam] };
      asked.set(s, q);
      const l = lesson(lid || id); l.quiz = [...(l.quiz || []), q];
    });
  }
  // Preguntas de los cuestionarios del campus (no son ítems de examen)
  const cq = (id, rows) => { const l = lesson(id); l.quiz = [...(l.quiz || []), ...rows.map(([s, v, w]) => ({ q: `V o F (cuestionario): ${s}`, o: ['Verdadero', 'Falso'], a: v ? 0 : 1, e: w }))]; };

  // ---------- Cálculos que se repiten ----------
  const K = 1.38e-23;
  const tdm = (n, rs, b, s) => { const bits = n * b + s, fps = rs / b; return { bits, fps, R: bits * fps, data: n * rs, Tf: 1 / fps }; };
  const tdmHtml = (n, rs, b, s, unit) => { const t = tdm(n, rs, b, s); return `<p>Cada trama lleva ${b} bit${b > 1 ? 's' : ''} de cada fuente (${unit}) más ${s} bit${s > 1 ? 's' : ''} de sincronismo: ${n} × ${b} + ${s} = <strong>${t.bits} bits</strong>. Cada fuente entrega ${num(rs)} bps, o sea ${num(t.fps)} grupos de ${b} bits por segundo: <strong>${num(t.fps)} tramas/s</strong>.</p>${eq(`R = ${t.bits} bits × ${num(t.fps)} tramas/s = <strong>${num(t.R)} bps</strong>`, 'Capacidad del enlace compartido')}<p>Control: datos puros ${n} × ${num(rs)} = ${num(t.data)} bps; el resto (${num(t.R - t.data)} bps) es sincronismo.</p>`; };
  // Imagen de video: px píxeles con niv niveles equiprobables, r imágenes/s
  const vid = (px, niv, r) => { const I = px * Math.log2(niv); return { I, R: I * r }; };
  const hamTable = (w, d) => table(['Control', 'Resultado'], d.checks.map((c, i) => [`p${i + 1} (posiciones con el bit ${i + 1} en 1)`, c])) + `<p>Síndrome p${d.p}…p1 = ${[...d.checks].reverse().join('')}₂ = <strong>${d.syn}</strong>${d.syn ? `: error en la posición ${d.syn} (contando de derecha a izquierda). Corregida: ${mono(d.corrected)}` : ': no hay error'}.</p>`;
  const ham = (w) => { const d = X.hammingDecode(w); return `<p>${w.length} bits → 2ᵖ ≥ n + p + 1 da <strong>p = ${d.p}</strong> bits de paridad (posiciones ${Array.from({ length: d.p }, (_, i) => 2 ** i).join(', ')}) y ${w.length - d.p} de datos. Con la disposición de la cátedra (posiciones de derecha a izquierda, paridad par):</p>${hamTable(w, d)}<p>Quitando los bits de paridad, los datos puros son <strong>${mono(d.data)}</strong>.</p>`; };
  const crcHtml = (m, g, label) => { const c = X.crc(m, g); return `<p>G(x) = x⁵ + x⁴ + x + 1 → ${mono(g)} (grado r = 5): se agregan 5 ceros, ${mono(c.padded)}, y se divide módulo 2 por ${mono(g)}.</p><p>Resto R(x) = <strong>${mono(c.rem)}</strong>. ${label}: T(x) = M(x)·x⁵ + R(x) = <strong>${mono(c.tx)}</strong>.</p><p>Control: ${mono(c.tx)} dividido por ${mono(g)} da resto ${mono(X.crcCheck(c.tx, g).rem)}.</p>`; };
  const G = '110011';

  EXAMS.push(
    { id: '1p-2023', unit: 'p1', short: '1P 2023', title: 'Primer parcial 2023', sub: 'comisión 3K4 · cinco ejercicios',
      items: [['1', 'V o F sobre redes de comunicaciones (LAN, MAN, WAN, PAN, SAN, WLAN, ETSI)'], ['2', 'V o F sobre señales (digital, determinística, aleatoria, periódica, par e impar, serie de Fourier)'], ['3', 'V o F sobre la serie de Fourier de una señal de período T = 1 ms y ciclo de actividad p'],
        ['4', 'SNR en dB de un dispositivo a 30 °C, entre 1000 y 1024 MHz, con P<sub>S</sub> = 10⁻⁹ W'], ['5', 'RSSI de un radioenlace de 5 km a 2,4 GHz y viabilidad con margen ≥ 12 dB']] },
    { id: '1p-2024', unit: 'p1', short: '1P 2024', title: 'Primer parcial 2024', sub: '04/06/2024 · comisión 3K3', note: 'De la foto solo se leen los ejercicios 1 y 2; el 3 quedó en blanco.',
      items: [['1', 'V o F sobre redes de comunicaciones (red, canal, punto a punto, topología, capa física, medios)'], ['2', 'V o F sobre señales (frecuencias constituyentes, discretas, analógicas, aleatorias, impar, serie compleja)']] },
    { id: '1p-mod', unit: 'p1', short: '1P modelo', title: 'Primer parcial, modelo de práctica', sub: 'tres ejercicios de V o F con las respuestas marcadas',
      items: [['1', 'V o F sobre una red de comunicaciones (20 afirmaciones)'], ['2', 'V o F sobre señales y ancho de banda'], ['3', 'V o F sobre la serie de Fourier de una señal de período T y ciclo de actividad A']] },

    { id: '2p-2025-t1', unit: 'p2', short: '2P 2025 T1', title: 'Segundo parcial 2025, tema 1', sub: '2025 · cinco ejercicios de 2 puntos',
      items: [['1', 'V o F sobre entropía, redundancia, información promedio y capacidad del canal'], ['2', 'Video 600 × 500 píxeles, 16 niveles, 30 imágenes/s, SNR = 1023: peso de la imagen, entropía y ancho de banda'], ['3', 'Canal de 8 Mbps con SNR = 255: ancho de banda, niveles admisibles, ¿máximo o mínimo?'],
        ['4', 'CRC con G(x) = x⁵ + x⁴ + x + 1: palabra código para M(x) = 10110111'], ['5', 'Hamming: se recibe 10011100101; ¿hay error? ¿Datos puros?']] },
    { id: '2p-2025-t2', unit: 'p2', short: '2P 2025 T2', title: 'Segundo parcial 2025, tema 2', sub: '2025 · cinco ejercicios de 2 puntos',
      items: [['1', 'V o F sobre entropía, Huffman, códigos prefijo, información mutua, detección y corrección (23 afirmaciones)'], ['2', 'Video 600 × 500 píxeles, 16 niveles, 30 imágenes/s, SNR = 1023'], ['3', 'Canal de 8 Mbps con SNR de 25 dB: ancho de banda, niveles admisibles, ¿máximo o mínimo?'],
        ['4', 'CRC con G(x) = x⁵ + x⁴ + x + 1 para M(x) = 10110111'], ['5', 'Hamming: se recibe 10011100101']] },
    { id: '2p-2025-v5', unit: 'p2', short: '2P 2025 hoja', title: 'Segundo parcial 2025, hoja de V o F', sub: '2025 · ejercicio 5 de otro tema',
      items: [['5', 'V o F sobre información, Huffman, distancia de Hamming, códigos de bloque, repetición, FEC y Hamming (7,4)']] },
    { id: '2p-2025-c', unit: 'p2', short: '2P 2025 corr.', title: 'Segundo parcial 2025, tema corregido', sub: '2025 · resuelto por un alumno y corregido por la cátedra', note: 'Corrección de la cátedra: dado M, la SNR que se calcula es la <strong>mínima</strong> (no la máxima).',
      items: [['1', 'Canal de B = 1 MHz con 16 niveles: SNR en dB, ¿máxima o mínima?, capacidad'], ['2', 'CRC: ¿la palabra 1011011101000 recibida con G(x) = x⁵ + x⁴ + x + 1 tiene error?'], ['3', 'Hamming: se recibe 11110000100; ¿hay error? ¿Datos puros?'], ['4', 'Video a R = 50,40 Mbps por un canal de B = 5,04 MHz: SNR, entropía a 20 img/s y peso de la imagen']] },
    { id: '2p-mod', unit: 'p2', short: '2P modelo', title: 'Segundo parcial, modelo', sub: 'sin fecha · cinco ejercicios',
      items: [['1', 'Relación entre los M niveles de codificación y la SNR: elegir la afirmación verdadera'], ['2', 'Canal de 8 Mbps y 1 MHz: SNR admisible y niveles de codificación'], ['3', 'CRC con G(x) = x⁵ + x⁴ + x + 1 para M(x) = 10110111'], ['4', 'Hamming: se recibe 10011100101'], ['5', 'V o F sobre definiciones de la transmisión de datos (baudio, niveles, síncrona, RZ)']] },

    { id: '3p-t3', unit: 'p3', short: '3P tema 3', title: 'Tercer parcial, tema 3', sub: 'sin fecha · cinco ejercicios',
      items: [['1', 'V o F sobre la codificación PCM'], ['2', 'Constelaciones: a) (0,0) y (2,0); b) (±2, ±2). Tipo y tabla de verdad para 11000110'], ['3', 'Diagrama temporal de una señal modulada (8 baudios de 10 µs): tipo, tabla de verdad, constelación y velocidades'], ['4', 'TDM síncrona de 5 canales de 20 kbps, entrelazado de bit, 1 byte de sincronismo por trama'], ['5', 'V o F sobre MODEM, ADSL, DMT y WiFi']] },
    { id: '3p-t4', unit: 'p3', short: '3P tema 4', title: 'Tercer parcial, tema 4', sub: 'comisión 3K2 · cinco ejercicios', note: 'La foto corta la tasa de las fuentes del ejercicio 4; se resuelve con el método y un caso de ejemplo indicado como tal.',
      items: [['1', 'V o F sobre la codificación PCM'], ['2', 'Constelaciones: a) (2,0) y (−2,0); b) (0,2), (2,0), (0,−2), (−2,0). Tipo y tabla de verdad para 11000110'], ['3', 'Diagrama temporal con fases +135°, −45°, … para 001110010101: tipo, constelación y duración de símbolo a 10 kbps'], ['4', 'TDM síncrona de 10 canales entrelazados a nivel de carácter con sincronismo por trama'], ['5', 'V o F sobre MODEM, ADSL, splitter, DSLAM y WiFi']] },
    { id: '3p-2025', unit: 'p3', short: '3P 2025', title: 'Tercer parcial 2025', sub: 'noviembre de 2025 · cinco ejercicios',
      items: [['1', 'V o F sobre transmisión de datos (niveles, velocidad de modulación, síncrona, asíncrona, Manchester, AMI, NRZ)'], ['2', 'Diagrama temporal de una señal modulada (8 baudios de 1 µs): tipo, tabla de verdad, constelación y velocidades'], ['3', 'Señal NRZ con T<sub>b</sub> = 100 µs modulada en 8QAM: anchos de banda, constelación y tabla de verdad'], ['4', 'TDM síncrona de 10 canales de 10 kbps, entrelazado de bit, 1 byte de sincronismo'], ['5', 'Tiempo de descarga de un archivo de 2 MB con MODEM 56K y con ADSL 1M']] },

    { id: 'f-2019-02', unit: 'final', short: 'Final 18/02/19', title: 'Final del 18/02/2019', sub: '9° llamado, mesa I',
      items: [['1', 'Serie compleja de un tren de pulsos (período T, ciclo p): elegir la conclusión'], ['2', 'Video 640 × 480, 16 niveles, 30 imágenes/s, SNR de 30 dB'], ['3', 'V o F sobre el código Hamming y la distancia de Hamming'], ['4', 'TDM síncrona de 4 canales de 2 kbps, entrelazado de carácter, 1 bit de sincronismo']] },
    { id: 'f-2019-05', unit: 'final', short: 'Final 07/05/19', title: 'Final del 07/05/2019', sub: '10° llamado, mesa I',
      items: [['1', 'Espectro de una señal periódica: componente continua, fundamental, ancho del pulso y si es serie compleja'], ['2', 'Ruido a 27 °C en 10 MHz: densidad, potencia, tensión en 50 Ω y SNR con P<sub>S</sub> = 10⁻¹⁵ W'], ['3', 'Diagrama temporal de una señal modulada (8 baudios de 1 ms): tipo, constelación y velocidades'], ['4', 'V o F sobre ADSL (multiplexación, dúplex, márgenes de frecuencia, splitter)']] },
    { id: 'f-2019-06', unit: 'final', short: 'Final 27/06/19', title: 'Final del 27/06/2019', sub: 'cinco ejercicios',
      items: [['1', 'Espectro sinc continuo: ¿serie o transformada? Ancho del pulso para B = 1 MHz. ¿Qué pasa si el pulso se angosta?'], ['2', 'Dispositivo a 27 °C con P<sub>S</sub> = 10⁻¹⁵ W y SNR de 30 dB: densidad y potencia de ruido, ancho de banda'], ['3', 'Video 640 × 480, 16 niveles, 30 imágenes/s, SNR de 30 dB'], ['4', 'Hamming: se recibe 01100101110'], ['5', 'Diagrama temporal de una señal modulada (8 baudios de 1 ms)']] },
    { id: 'f-2019-07', unit: 'final', short: 'Final 27/07/19', title: 'Final del 27/07/2019', sub: 'cinco ejercicios', note: 'La figura del ejercicio 2 no está en el archivo; es el mismo espectro del final del 27/06/2019.',
      items: [['1', 'V o F sobre el código Hamming'], ['2', 'Espectro X(f) resultado del análisis de Fourier de x(t)'], ['3', 'TDM síncrona de 4 canales de 2 kbps, carácter, 1 bit de sincronismo (8000 / 8150 / 8250 / 8350 bps)'], ['4', 'PSK con T<sub>S</sub> = 1 ms contra 8QAM con T<sub>S</sub> = 2 ms: velocidad y ancho de banda'], ['5', 'V o F sobre el proceso de codificación PCM']] },
    { id: 'f-2019-08', unit: 'final', short: 'Final 05/08/19', title: 'Final del 05/08/2019', sub: 'cinco ejercicios',
      items: [['1', 'Serie trigonométrica de un tren de pulsos: elegir la afirmación'], ['2', 'Video 640 × 480, 8 niveles, 20 imágenes/s por un canal de 5 MHz: peso, entropía y SNR requerida'], ['3', 'Hamming de 12 bits E4F (hex) recibido: valor original en hexadecimal'], ['4', 'Dos constelaciones (cuatro puntos sobre el eje y cuatro en cruz): tipo, diagrama temporal para 101101011100 y R con T<sub>S</sub> = 1 ms'], ['5', 'TDM síncrono de 8 fuentes de 10 kbps, 4 bits por fuente y 1 byte de sincronismo']] },
    { id: 'f-2019-09', unit: 'final', short: 'Final 03/09/19', title: 'Final del 03/09/2019', sub: 'cinco ejercicios',
      items: [['1', 'V o F sobre el análisis de Fourier (espectros discretos, continuos, sinc, ancho de pulso)'], ['2', 'Video 640 × 480, 32 niveles: información por imagen, imágenes/s a 46 Mbps y ancho de banda con 30 dB'], ['3', 'Diagrama temporal QPSK para 1001110000: tipo, constelación y duración de símbolo a 20 kbps'], ['4', 'Hamming: se recibe 10001100101'], ['5', 'TDM síncrona de 4 canales de 2 kbps, carácter, 1 bit de sincronismo']] },
  );

  // ================= Unidad 1 =================
  const redes = {
    etsi: ['La entidad ETSI se encarga de establecer estándares para redes Ethernet.', F, 'Ethernet la normaliza el IEEE (802.3). ETSI es el instituto europeo de normas de telecomunicaciones (GSM, por ejemplo).', 'normalizacion'],
    lan: ['Una red LAN cubre un área geográfica extensa.', F, 'LAN es local: un edificio o un campus. El área extensa es la WAN.'],
    wan: ['WAN es el acrónimo de Wide Area Network.', V, 'Red de área amplia.'],
    man: ['MAN es el acrónimo de Metropolitan Area Network.', V, 'Red de área metropolitana.'],
    pan: ['Una red PAN se utiliza para conectar dispositivos en un área local, como una casa u oficina pequeña.', V, 'La cátedra la dio por verdadera: PAN conecta los dispositivos personales de un usuario en su entorno cercano (pocos metros). Ojo: la red de toda la casa u oficina es más bien una LAN.'],
    wlan: ['WLAN es el acrónimo de Wireless Local Area Network.', V, 'LAN inalámbrica (WiFi).'],
    san: ['SAN es el acrónimo de Storage Area Network y se utiliza para conectar dispositivos de almacenamiento en una organización.', V, 'Red de almacenamiento: vincula servidores con discos y cabinas de almacenamiento.'],
    wlanCable: ['Una red WLAN utiliza cables para conectar dispositivos.', F, 'Es inalámbrica.'],
    panAmplia: ['Un PAN se utiliza para conectar dispositivos en una amplia área geográfica.', F, 'PAN es personal (pocos metros).'],
    manLan: ['Una red MAN es más pequeña que una red LAN.', F, 'Al revés: LAN es local y MAN metropolitana.'],
    sanHogar: ['Una red SAN se utiliza para compartir archivos e impresoras en un hogar.', F, 'Eso es una LAN doméstica; la SAN es de almacenamiento en una organización.'],
    manSuc: ['Las redes MAN son ideales para empresas y organizaciones que necesitan una red de tamaño intermedio para conectar diferentes sucursales dentro de una ciudad o región.', V, 'Tamaño intermedio, alcance de una ciudad.'],
    p2p: ['Dentro de los tipos de redes la conexión punto a punto proporciona un enlace dedicado entre dispositivos que pueden estar cercanos o distantes.', V, 'El enlace punto a punto es dedicado (toda su capacidad para los dos extremos). Ojo: en la corrección del 1er parcial 2024 la cátedra la marcó como falsa; el punto débil es que punto a punto es un <strong>tipo de conexión</strong> (punto a punto o multipunto), no un “tipo de red” (LAN, MAN, WAN). En el examen, justificá esa distinción.'],
    info: ['La información que pueden intercambiar los ordenadores de una red puede ser de lo más variada: correos electrónicos, videos, imágenes, música en formato MP3, registros de una base de datos, páginas web, etc.', V, 'Cualquier dato digitalizado.', 'sistema-comunicacion'],
    inversaNo: ['La función inversa de la capa física no es la de recuperar estas señales individuales desde los medios, restaurarlas para sus representaciones de bit y enviar los bits hacia la capa de enlace de datos como una trama completa.', F, 'Sí es esa: en recepción la capa física recupera las señales del medio, las vuelve bits y los entrega a la capa de enlace como una trama.', 'osi-tcpip'],
    inversa: ['La función inversa de la capa física es la de recuperar estas señales individuales desde los medios, restaurarlas para sus representaciones de bit y enviar los bits hacia la capa de enlace de datos como una trama completa.', V, 'Es la recepción: señales → bits → trama hacia la capa de enlace.', 'osi-tcpip'],
    paquetes: ['Tanto los modelos OSI-ISO como TCP/IP conmutan paquetes de datos: los paquetes individuales pueden tomar rutas alternativas hasta el destino, a diferencia de las redes conmutadas por circuitos, en las que todos los paquetes usan una misma ruta.', V, 'Conmutación de paquetes. El cuestionario de la Unidad 1 lo pregunta al revés (“usan conmutación de circuitos”), y eso es falso.', 'osi-tcpip'],
    wanPers: ['Una red WAN se utiliza para conectar dispositivos personales, como teléfonos móviles o tabletas.', F, 'Eso es una PAN.'],
    panCiudad: ['Una red PAN abarca una zona geográfica amplia como una ciudad o un estado.', F, 'Eso es una WAN (o MAN para la ciudad).'],
    topoEsp: ['El término topología física se refiere a la forma en que está diseñada la red en cuanto a la distribución espacial de los equipos, el tráfico que va a soportar la red y el presupuesto (la relación inversión vs prestaciones).', V, 'Es la definición de la cátedra: la forma física de la red según cómo se reparten los equipos, el tráfico y el costo.'],
    topoTemp: ['El término topología física se refiere a la forma en que está diseñada la red en cuanto a la distribución temporal de los equipos, el tráfico que va a soportar la red y el presupuesto (la relación inversión vs prestaciones).', F, 'La distribución de los equipos es <strong>espacial</strong>, no temporal. Es la trampa respecto de la definición.'],
    panSuc: ['Las redes PAN son ideales para conectar diferentes sucursales de una empresa ubicada en diferentes ciudades o países.', F, 'Eso es una WAN.'],
    wanSuc: ['Las redes WAN son utilizadas para conectar diferentes sucursales de una empresa ubicada en diferentes ciudades o países.', V, 'Área amplia.'],
    red: ['Una red de comunicaciones es un conjunto de dispositivos (a menudo denominados nodos) conectados mediante un único medio físico y usando distintos protocolos.', F, 'Los nodos se conectan por enlaces de un medio físico (cable o inalámbrico) usando protocolos <strong>específicos</strong> (comunes), no un único medio y protocolos distintos.', 'sistema-comunicacion'],
    canal: ['En una red, el canal es el medio a través del cual se lleva la señal de información que se quiere transmitir; puede ser desde una sencilla línea de transmisión hasta una compleja red que conecte a la fuente con el destino.', V, 'Definición de canal del esquema del sistema de comunicación.', 'sistema-comunicacion'],
    medios: ['La transmisión de estos datos se produce a través de un medio de transmisión o combinación de distintos medios: cables de cobre, fibra óptica, tecnología inalámbrica, enlaces vía satélite.', V, 'Medios guiados y no guiados.', 'medios-guiados'],
    guiadosRadio: ['Los medios guiados transmiten señales que son patrones de transmisiones de radio, señales electromagnéticas, que viajan por cables especiales.', F, 'Las transmisiones de radio son de medios <strong>no guiados</strong>. En los guiados las señales son pulsos eléctricos (cobre) o de luz (fibra).', 'medios-guiados'],
  };
  const R = (...ks) => ks.map((k) => redes[k]);
  vf('redes-topologias', ['1p-2023#1'], 'V o F sobre redes (1er parcial 2023)', 'Sobre las siguientes afirmaciones sobre una red de comunicaciones, indicar cuáles son VERDADERAS o FALSAS.',
    R('etsi', 'lan', 'wan', 'man', 'pan', 'wlan', 'san', 'wlanCable', 'panAmplia', 'manLan', 'sanHogar'));
  vf('redes-topologias', ['1p-mod#1'], 'V o F sobre una red de comunicaciones (modelo)', 'Sobre las siguientes afirmaciones sobre una red de comunicaciones, indicar cuáles son VERDADERAS o FALSAS.',
    R('etsi', 'lan', 'wan', 'man', 'pan', 'wlan', 'san', 'wlanCable', 'panAmplia', 'manLan', 'sanHogar', 'manSuc', 'p2p', 'info', 'inversaNo', 'paquetes', 'wanPers', 'panCiudad', 'topoEsp', 'panSuc', 'wanSuc'));
  vf('sistema-comunicacion', ['1p-2024#1'], 'V o F sobre redes (1er parcial 2024)', 'Sobre las siguientes afirmaciones sobre una red de comunicaciones, indicar cuáles son VERDADERAS o FALSAS.',
    R('red', 'canal', 'p2p', 'topoTemp', 'inversa', 'medios', 'guiadosRadio'));

  cq('sistema-comunicacion', [
    ['Normalmente los datos generados por la fuente no se transmiten tal como son generados: el transmisor transforma y codifica la información, generando exclusivamente señales electromagnéticas.', F, 'La palabra “exclusivamente” la hace falsa (la cátedra la corrigió así): el transmisor adapta la información al canal, que puede ser eléctrica, óptica o de radio.'],
    ['Una fuente es la generadora de la información que se quiere enviar (audio, video, datos); puede ser analógica o digital, y si no es eléctrica se convierte con un transductor dentro del transmisor.', V, 'Esquema fuente → transmisor.'],
    ['Para que la transmisión de datos sea posible, los dispositivos deben ser parte de un sistema de comunicación formado por hardware y software.', V, 'Equipos y programas (protocolos).'],
  ]);
  cq('normalizacion', [
    ['ITU, IEEE, ISOC e ITU-T son organismos responsables de definir estándares de comunicación, pero solo de la capa física.', F, 'Definen normas de muchas capas (IEEE 802 cubre física y enlace; ISOC/IETF, protocolos de Internet).'],
    ['Los estándares son acuerdos comerciales entre empresas que contienen especificaciones técnicas para asegurar que los productos cumplan su propósito.', F, 'Son acuerdos <strong>documentados</strong> (no comerciales entre empresas), elaborados por consenso y aprobados por un organismo reconocido.'],
    ['Los estándares hacen la vida más simple, permitiendo mayor fiabilidad y efectividad en los bienes y servicios, sin depender de una marca o fabricante.', V, 'Interoperabilidad.'],
  ]);
  cq('redes-topologias', [
    ['Un enlace punto a punto es un enlace dedicado entre dos dispositivos donde la capacidad del canal es compartida en el espacio o en el tiempo.', F, 'Compartir el canal es multipunto; el punto a punto es dedicado.'],
    ['La ventaja de una topología en malla es que utiliza pocos cables y un número reducido de puertos de entrada/salida.', F, 'Es su desventaja: n(n − 1)/2 enlaces y n − 1 puertos por equipo.'],
    ['En una topología estrella cada dispositivo solo tiene un enlace punto a punto dedicado con el controlador central; los dispositivos no están enlazados entre sí.', V, 'Todo pasa por el concentrador.'],
  ]);
  cq('medios-guiados', [
    ['La fibra óptica posee mayor ancho de banda, menor tamaño y peso, menor atenuación y aislamiento electromagnético.', V, 'Sus ventajas frente al cobre.'],
    ['Para los medios guiados como el cobre las señales son patrones de pulsos electromagnéticos y para la fibra óptica son patrones de luz.', F, 'La cátedra la corrigió como falsa: en el cobre las señales son pulsos <strong>eléctricos</strong>; las ondas electromagnéticas son de los medios no guiados.'],
  ]);
  cq('medios-no-guiados', [['Los medios no guiados no confinan las señales en ningún cable: se propagan libremente; los más importantes son el aire y el vacío.', V, 'Radio, microondas, satélite.']]);

  // ================= Unidad 2 =================
  const sen = {
    digital: ['La amplitud de una señal digital exhibe una variación discreta sobre su campo de actividad; no se producen en el mundo físico como tales, sino que son creadas por el hombre.', V, 'Definición de la cátedra (en el modelo un alumno la anotó como “señal analógica”, pero es la de digital).', 'clasificacion-senales'],
    det: ['Una señal se dice determinística cuando no existe incertidumbre con respecto a su valor en cualquier tiempo: una ecuación matemática explícita describe su comportamiento en el tiempo.', V, 'Por ejemplo, A sen(2πft).', 'clasificacion-senales'],
    aleatSi: ['Una señal se dice aleatoria cuando existe incertidumbre con respecto a su valor en cualquier tiempo; se puede denominar también proceso estocástico.', V, 'Ruido, voz.', 'clasificacion-senales'],
    aleatNo: ['Una señal se dice aleatoria cuando no existe incertidumbre con respecto a su valor en cualquier tiempo; se puede denominar también proceso estocástico.', F, 'Aleatoria es justamente con incertidumbre.', 'clasificacion-senales'],
    aper: ['Las señales aperiódicas son aquellas que no tienen repeticiones definidas; matemáticamente se definen como periódicas de período infinito.', V, 'T → ∞.', 'clasificacion-senales'],
    perMal: ['Las señales periódicas son aquellas que no tienen repeticiones definidas; matemáticamente se definen como periódicas de período infinito.', F, 'Esa es la definición de aperiódica.', 'clasificacion-senales'],
    par: ['Una señal f(t) es par si se refleja en el eje vertical (ordenada) y cumple con f(t) = f(−t).', V, 'Simetría respecto del eje vertical (coseno).', 'clasificacion-senales'],
    imparMal: ['Una señal f(t) es impar si se refleja en el eje vertical (ordenada) y cumple f(t) = f(−t).', F, 'Esa es la par. Impar: f(−t) = −f(t), simetría respecto del origen (seno).', 'clasificacion-senales'],
    imparEje: ['Una señal f(t) se dice que es impar si se refleja en el eje vertical (ordenada) y cumple con f(t) = −f(−t).', F, 'La ecuación es la de impar, pero la impar no se refleja en el eje vertical: es simétrica respecto del <strong>origen</strong>.', 'clasificacion-senales'],
    mitad: ['En la serie de Fourier compleja las armónicas tienen una frecuencia múltiplo de la fundamental 1/2T (y así están equiespaciadas unas con otras).', F, 'La fundamental es 1/T; las rayas están separadas 1/T.', 'espectros-afondo'],
    neg180: ['En la serie de Fourier compleja, cuando las amplitudes se hacen negativas significa que las armónicas tienen un desfasaje de 180°.', V, '−|C| = |C|·e^{jπ}.', 'espectros-afondo'],
    neg360: ['En la serie de Fourier compleja, cuando las amplitudes se hacen negativas significa que las armónicas tienen un desfasaje de 360°.', F, 'Es de 180°; 360° es no desfasar.', 'espectros-afondo'],
    trigPos: ['En la serie de Fourier trigonométrica existen armónicas solo para frecuencias positivas.', V, 'Las negativas aparecen en la forma compleja.', 'espectros-afondo'],
    rectSinc: ['Si x(t) es una señal rectangular y periódica, las amplitudes de sus componentes espectrales corresponden a la función envolvente sinc discreta.', V, 'C<sub>n</sub> = (Ap/T)·sinc(np/T).', 'espectros-afondo'],
    discAper: ['Un espectro X(f) será discreto y aperiódico si su señal x(t) es periódica en el tiempo.', V, 'Periódico en un dominio ↔ discreto en el otro. (En un modelo un alumno la marcó falsa; por teoría y por el cuestionario de la Unidad 2 es verdadera.)', 'espectros-afondo'],
    frecs: ['Cualquier señal electromagnética (analógica o digital) está formada por una serie de frecuencias constituyentes.', V, 'Es lo que dice el análisis de Fourier.', 'clasificacion-senales'],
    discretas: ['Las señales discretas son aquellas donde la variable independiente toma solo un conjunto de valores continuos en el tiempo.', F, 'En las discretas la variable independiente toma valores <strong>discretos</strong> (instantes de muestreo).', 'clasificacion-senales'],
    analog: ['La amplitud de una señal analógica exhibe una variación continua sobre su campo de actividad; la gran mayoría de las señales que existen en el mundo son analógicas.', V, 'Voz, temperatura.', 'clasificacion-senales'],
    detMal: ['Las señales determinísticas son aquellas que poseen incertidumbre con respecto a su valor en cualquier tiempo y no pueden expresarse mediante una ecuación matemática explícita.', F, 'Esa es la aleatoria.', 'clasificacion-senales'],
    perOk: ['Las señales periódicas son aquellas señales que describen ciclos repetitivos a lo largo del tiempo.', V, 'f(t) = f(t + T).', 'clasificacion-senales'],
    bwEf: ['Ancho de banda efectivo es el ancho de banda que contiene la menor parte de la energía del espectro de la señal y se mide en Hz.', F, 'Contiene la <strong>mayor</strong> parte de la energía.', 'parametros-espectro'],
    discAperPer: ['Un espectro X(f) discreto y aperiódico es el resultado del análisis de Fourier de una señal x(t) periódica en el tiempo.', V, 'Serie de Fourier.', 'espectros-afondo'],
    bw1k: ['Si el ancho de banda B del espectro X(f) fuera de 1 µs, el ancho del pulso rectangular aperiódico es de 1 kHz.', F, 'B = 1/p: un pulso de 1 µs ocupa 1 MHz (y las unidades están cruzadas). 1 kHz corresponde a 1 ms.', 'espectros-afondo'],
  };
  const S = (...ks) => ks.map((k) => sen[k]);
  vf('clasificacion-senales', ['1p-2023#2'], 'V o F sobre señales (1er parcial 2023)', 'Sobre las siguientes afirmaciones, indicar cuáles son VERDADERAS o FALSAS.',
    S('digital', 'det', 'aleatNo', 'aper', 'perMal', 'par', 'imparMal', 'mitad', 'neg180', 'trigPos'));
  vf('clasificacion-senales', ['1p-mod#2'], 'V o F sobre señales (modelo)', 'Sobre las siguientes afirmaciones, indicar cuáles son VERDADERAS o FALSAS.',
    S('digital', 'det', 'aleatSi', 'aleatNo', 'aper', 'perMal', 'par', 'imparMal', 'mitad', 'neg180', 'trigPos', 'rectSinc', 'discAper', 'detMal', 'perOk', 'bwEf', 'discAperPer', 'bw1k'));
  vf('clasificacion-senales', ['1p-2024#2'], 'V o F sobre señales (1er parcial 2024)', 'Sobre las siguientes afirmaciones, indicar cuáles son VERDADERAS o FALSAS.',
    S('frecs', 'discretas', 'analog', 'aleatNo', 'imparEje', 'mitad', 'neg360'));

  vf('espectros-afondo', ['1p-2023#3'], 'V o F sobre la serie de Fourier de un tren de pulsos (T = 1 ms, p = 0,5 ms)', 'Para una señal f(t) de período T = 1 ms y ciclo de actividad p (pulsos alternados de amplitud ±A, como en la figura del parcial), indicar cuáles son VERDADERAS o FALSAS.', [
    ['Al realizar la serie de Fourier compleja, el espectro de líneas se compone de rayas espectrales separadas 1/p.', F, 'Separadas 1/T; 1/p es el primer cero de la envolvente.'],
    ['Al realizar la serie trigonométrica, el valor medio será cero si p = 0,5 ms y solo existen armónicas pares que se alternan entre valores positivos y negativos.', F, 'Con p = T/2 se anulan las pares: quedan las <strong>impares</strong>.'],
    ['En la serie compleja las amplitudes de las armónicas disminuyen con la disminución del orden n.', F, 'Disminuyen al <strong>aumentar</strong> n (envolvente sinc).'],
    ['En la serie compleja los valores de la amplitud de las armónicas corresponden a la envolvente de la función sinc(p).', V, 'C<sub>n</sub> ∝ sinc(np/T).'],
    ['En la forma compleja, las amplitudes de las armónicas están en función de T.', V, 'Por el factor p/T.'],
    ['En la forma compleja, el espectro se compone de rayas espectrales separadas 1 kHz.', V, '1/T = 1/1 ms = 1 kHz.'],
    ['En la serie compleja, el valor medio será cero si p = 0,5 ms y solo existen las armónicas impares, que se alternan entre valores positivos y negativos.', V, 'Onda simétrica ±A con ciclo del 50 %: sin continua y solo impares, con signos alternados (sinc).'],
    ['En la serie trigonométrica, el valor de la frecuencia fundamental será de 1 ms y a₀ = A.', F, 'La fundamental es 1 kHz (1 ms es el período) y a₀ es el valor medio (cero en esta onda), no A.'],
    ['En la serie compleja, la serie estará formada por una sumatoria infinita de senos y cosenos.', F, 'La compleja es una suma infinita de <strong>fasores</strong>; senos y cosenos es la trigonométrica.'],
  ]);
  vf('espectros-afondo', ['1p-mod#3'], 'V o F sobre la serie de Fourier (modelo)', 'Para una señal f(t) de período T = 1 ms y ciclo de actividad A, indicar cuáles son VERDADERAS o FALSAS.', [
    ['En la serie compleja, el espectro se compone de rayas espectrales separadas 1/A (ciclo de actividad).', F, 'Separadas 1/T.'],
    ['En la serie compleja, las amplitudes de las armónicas disminuirán con la disminución del orden m.', F, 'Disminuyen al aumentar el orden.'],
    ['En la serie compleja, los valores de la amplitud de las armónicas corresponden a la envolvente de la función sinc.', V, 'Tren de pulsos rectangulares.'],
    ['Al aplicar la forma compleja de la serie de Fourier, existen también armónicas para las frecuencias negativas.', V, 'Espectro bilateral.'],
    ['Al aplicar la forma compleja, las amplitudes de las armónicas están en función de T.', V, 'Factor A·p/T.'],
    ['En la serie trigonométrica, el valor de la frecuencia fundamental corresponde a 1/T (1 kHz si T = 1 ms).', V, 'La armónica sobre la inversa de 1/T es la fundamental: período 1 ms ↔ 1 kHz.'],
    ['En la serie compleja, la serie estará formada por una secuencia infinita de senos y cosenos.', F, 'Fasores (exponenciales complejas).'],
  ]);

  const fourierMc = (title, exam, intro, opts, ans, why) => add('espectros-afondo', { title, exam, level: 2, prompt: `<p>${intro}</p><ol type="a">${opts.map((o) => `<li>${o}</li>`).join('')}</ol>`, solution: { explain: why } });
  fourierMc('Serie compleja de un tren de pulsos (final 18/02/2019)', ['f-2019-02#1'], 'Se tiene una señal de período T y ciclo de actividad p. Al realizar la serie de Fourier en forma compleja se puede concluir que:',
    ['el espectro de líneas se compone de rayas separadas 1/T', 'la amplitud de las armónicas disminuye con el aumento del orden', 'la amplitud de las armónicas corresponde a la envolvente sinc', 'existen armónicas para frecuencias negativas', 'todas las anteriores', 'ninguna de las anteriores'], 4,
    `<p>Las cuatro primeras son propiedades de la serie compleja de un tren de pulsos: rayas cada 1/T, envolvente sinc que decrece con n, espectro bilateral. Respuesta: <strong>e) todas las anteriores</strong>.</p>`);
  fourierMc('Serie trigonométrica de un tren de pulsos (final 05/08/2019)', ['f-2019-08#1'], 'Para un tren de pulsos de amplitud A, ancho p y período T, al realizar la serie de Fourier trigonométrica se puede afirmar que:',
    ['el espectro se compone de rayas separadas 1/p', 'las amplitudes disminuyen con el aumento del orden n', 'las amplitudes corresponden a la envolvente sinc', 'las amplitudes pueden ser positivas o negativas, pero siempre son reales', 'existen armónicas para frecuencias negativas', 'a) y c)', 'b) y d)', 'ninguna'], 6,
    `${table(['Opción', '', 'Por qué'], [['a', vfTag(F), 'Rayas cada 1/T.'], ['b', vfTag(V), 'La envolvente decrece.'], ['c', vfTag(V), 'También describe la envolvente.'], ['d', vfTag(V), 'a<sub>n</sub> reales, con signo (180°).'], ['e', vfTag(F), 'La trigonométrica es unilateral.']])}<p>Como la a) es falsa, la f) cae. La opción de la cátedra es <strong>g) b) y d)</strong>.</p>`);
  vf('espectros-afondo', ['f-2019-09#1'], 'V o F sobre el análisis de Fourier (final 03/09/2019)', 'Al aplicar el análisis de Fourier (AdF) sobre una señal x(t), podemos afirmar que:', [
    ['Si x(t) es periódica, su espectro está formado de rayas separadas 1/T cuyas amplitudes disminuyen con el aumento del orden n de las armónicas.', V, 'Tren de pulsos: sinc decreciente.'],
    ['Si x(t) es aperiódica, su espectro está formado por armónicas cuyas amplitudes pueden ser positivas y negativas.', F, 'Una aperiódica no tiene armónicas: su espectro es continuo (marcada en rojo en el original).'],
    ['Si x(t) es rectangular y periódica, las amplitudes de sus componentes espectrales corresponden a la función envolvente sinc discreta.', V, 'Ver arriba.'],
    ['Un espectro X(f) continuo y periódico es el resultado del AdF de una señal x(t) aperiódica en el tiempo.', F, 'Continuo y periódico sale de una señal discreta (muestreada); la aperiódica continua da un espectro continuo y aperiódico.'],
    ['Si x(t) es un pulso rectangular de ancho p, la envolvente sinc describe su respuesta en frecuencia y posee un ancho de banda B = 1/p.', V, 'Primer cero en 1/p.'],
    ['Un espectro X(f) será discreto y aperiódico si su señal x(t) es periódica en el tiempo.', V, 'Serie de Fourier.'],
    ['Si x(t) es periódica de período T, las amplitudes de sus componentes espectrales varían en función del período T.', F, 'La cátedra la marcó falsa en este final: lo que fija la forma es el ancho p (la envolvente sinc tiene ceros en 1/p) y T solo fija la separación. Ojo: en el modelo de parcial la frase “las amplitudes están en función de T” se dio por verdadera (factor p/T).'],
    ['Un espectro X(f) discreto y periódico es el resultado del AdF de una señal x(t) periódica en el tiempo.', F, 'Discreto y periódico requiere una señal periódica <strong>y</strong> discreta.'],
    ['Si el ancho de banda B del espectro X(f) fuera de 1 µs, el ancho del pulso aperiódico es de 1 MHz.', F, 'Unidades cruzadas: B se mide en Hz y el pulso en segundos (1 MHz ↔ 1 µs).'],
    ['Si x(t) es de período T, cuando las amplitudes de sus componentes espectrales se hacen negativas significa que la armónica tiene un desfasaje de 180°.', V, 'Signo menos = 180°.'],
  ]);
  add('espectros-afondo',
    { title: 'Leer un espectro de líneas (final 07/05/2019)', exam: ['f-2019-05#1'], level: 2, prompt: '<p>La gráfica es el espectro C<sub>n</sub> de una señal periódica: raya central de 2,50, rayas cada 1 kHz (de −8 a 8 kHz) y ceros de la envolvente en ±4 kHz y ±8 kHz. a) ¿Tiene componente continua? ¿Cuánto vale? b) Frecuencia fundamental. c) Ancho del pulso. d) ¿Es el resultado de la serie compleja? Justificar.</p>',
      solution: { explain: `<p><b>a)</b> Sí: la raya en f = 0 es la componente continua, <strong>C₀ = 2,5</strong> (= A·p/T).</p><p><b>b)</b> Las rayas están cada 1 kHz: <strong>f₀ = 1 kHz</strong> (T = 1 ms).</p><p><b>c)</b> El primer cero de la envolvente está en 1/p = 4 kHz → <strong>p = 0,25 ms</strong> (y A = 2,5 × T/p = 10).</p><p><b>d)</b> Sí: hay rayas en frecuencias <strong>negativas</strong> y amplitudes con signo, propio de la forma compleja (la trigonométrica solo tiene frecuencias positivas).</p>` } },
    { title: 'Espectro sinc continuo (finales 27/06 y 27/07/2019)', exam: ['f-2019-06#1', 'f-2019-07#2'], level: 2, prompt: '<p>Se tiene el espectro X(f) de la figura: una sinc continua de altura a con ceros en múltiplos de 1/a. a) ¿Es resultado de la serie de Fourier compleja o de la transformada? Justificar. b) Ancho del pulso si el ancho de banda de X(f) es 1 MHz. c) Si el ancho del pulso disminuye, ¿qué pasa con el ancho de banda?</p>',
      solution: { explain: '<p><b>a)</b> De la <strong>transformada de Fourier</strong>: el espectro es continuo (no son rayas), así que la señal es aperiódica: un pulso rectangular aislado de ancho a.</p><p><b>b)</b> B = 1/p → <strong>p = 1/1 MHz = 1 µs</strong>.</p><p><b>c)</b> Son inversos: si el pulso se angosta, el primer cero 1/p se aleja y el <strong>ancho de banda aumenta</strong>.</p>' } },
  );

  // ================= Unidad 3 =================
  const n4 = X.noiseW(30, 24e6), snr4 = 1e-9 / n4;
  const fs5 = X.fspl(2400, 5), rssi5 = 18 - 9 + 21 - fs5 + 12 - 9;
  add('dbm-enlace', { title: 'Radioenlace de 5 km a 2,4 GHz (1er parcial 2023)', exam: ['1p-2023#5'], level: 2,
    prompt: '<p>Se necesita conocer la potencia de recepción (RSSI) de un radioenlace a 5 km que opera a 2,4 GHz. Lado A: transmisor de 18 dBm, mástil de 10 m, cable coaxial de 0,9 dB/m, antena de 21 dBi. Lado B: mástil de 10 m, cable de 0,9 dB/m, antena de 12 dBi, sensibilidad del receptor −80 dBm. Indicar si el sistema es viable (margen ≥ 12 dB).</p>',
    solution: { explain: `${table(['Concepto', 'Valor'], [['Potencia del transmisor', '+18 dBm'], ['Cable A (10 m × 0,9 dB/m)', '−9 dB'], ['Antena A', '+21 dBi'], [`Espacio libre: 32,45 + 20 log 2400 + 20 log 5`, `−${num(fs5, 2)} dB`], ['Antena B', '+12 dBi'], ['Cable B', '−9 dB'], ['<strong>RSSI</strong>', `<strong>${num(rssi5, 2)} dBm</strong>`]])}<p>Margen = RSSI − sensibilidad = ${num(rssi5, 2)} − (−80) = <strong>${num(rssi5 + 80, 2)} dB</strong>. Ni siquiera supera la sensibilidad, y se piden 12 dB: <strong>no es viable</strong>. Habría que acortar los cables (subir el equipo al mástil), usar antenas de más ganancia o bajar la distancia.</p>` } });
  add('ruido-termico',
    { title: 'SNR de un dispositivo a 30 °C (1er parcial 2023)', exam: ['1p-2023#4'], level: 1, prompt: '<p>Un dispositivo trabaja a T = 30 °C con un rango de operación de 1000 a 1024 MHz y transmite con P<sub>S</sub> = 10⁻⁹ W. Calcular la SNR en dB.</p>',
      solution: { explain: `<p>B = 1024 − 1000 = 24 MHz; T = 303 K.</p>${eq(`N = k·T·B = 1,38×10⁻²³ × 303 × 24×10⁶ = ${num(n4 * 1e13, 3)}×10⁻¹³ W`, 'Ruido térmico')}<p>SNR = 10⁻⁹ / ${num(n4 * 1e13, 3)}×10⁻¹³ = ${num(snr4, 0)} veces → <strong>${num(10 * Math.log10(snr4), 2)} dB</strong> (≈ 40 dB).</p>` } },
    { title: 'Ruido en 10 MHz y tensión de ruido (final 07/05/2019)', exam: ['f-2019-05#2'], level: 2, prompt: '<p>Dispositivo a 27 °C con 10 MHz de ancho de banda. a) Densidad de potencia del ruido. b) Potencia total. c) Tensión de ruido con resistencia interna de 50 Ω y carga de 50 Ω. d) SNR en dB si P<sub>S</sub> = 10⁻¹⁵ W.</p>',
      solution: { explain: `<p><b>a)</b> N₀ = k·T = 1,38×10⁻²³ × 300 = <strong>4,14×10⁻²¹ W/Hz</strong>.</p><p><b>b)</b> N = N₀·B = <strong>4,14×10⁻¹⁴ W</strong> (−103,8 dBm).</p><p><b>c)</b> Tensión de ruido en circuito abierto: V<sub>n</sub> = √(4kTBR) = √(4 × 4,14×10⁻¹⁴ × 50) = <strong>${num(Math.sqrt(4 * 4.14e-14 * 50) * 1e6, 2)} µV</strong>. Con la carga adaptada (50 Ω) cae la mitad sobre ella: ${num(Math.sqrt(4 * 4.14e-14 * 50) * 1e6 / 2, 2)} µV.</p><p><b>d)</b> SNR = 10⁻¹⁵ / 4,14×10⁻¹⁴ = 0,0242 → <strong>${num(10 * Math.log10(1e-15 / 4.14e-14), 1)} dB</strong>: la señal está por debajo del ruido.</p>` } },
    { title: 'Ancho de banda a partir de la SNR (final 27/06/2019)', exam: ['f-2019-06#2'], level: 2, prompt: '<p>Un dispositivo a 27 °C transmite con P<sub>S</sub> = 10⁻¹⁵ W y tiene una SNR de 30 dB. Determinar: a) la densidad de potencia del ruido; b) la potencia total del ruido; c) el ancho de banda de operación.</p>',
      solution: { explain: `<p><b>a)</b> N₀ = k·T = 1,38×10⁻²³ × 300 = <strong>4,14×10⁻²¹ W/Hz</strong>.</p><p><b>b)</b> 30 dB = 1000 veces → N = P<sub>S</sub>/1000 = <strong>10⁻¹⁸ W</strong>.</p><p><b>c)</b> B = N/N₀ = 10⁻¹⁸ / 4,14×10⁻²¹ = <strong>${num(1e-18 / 4.14e-21 / 1e3, 1)} kHz</strong>.</p>` } },
  );
  cq('decibel', [
    ['Si entre un nodo y otro la señal resultante es 4 veces más chica, la relación da −6 dB.', V, '10 log(1/4) = −6 dB.'],
    ['Si entre un nodo y otro la señal resultante es 4 veces más chica, la relación da −3 dB.', F, '−3 dB es la mitad.'],
    ['Si la señal resultante es 10 000 veces más grande, la relación da 40 dB.', V, '10 log 10⁴.'],
    ['dBi es una unidad de potencia relativa a un mW.', F, 'Esa es dBm. dBi es ganancia de antena respecto del radiador isotrópico.'],
    ['dBi son los decibelios de ganancia sobre un radiador isotrópico.', V, 'Antenas.'],
    ['dB son los decibelios de ganancia sobre un radiador isotrópico.', F, 'dB es una relación cualquiera; sobre el isotrópico es dBi.'],
  ]);
  cq('dbm-enlace', [
    ['RSSI es la señal mínima que es capaz de recibir el receptor de forma inteligible.', F, 'Eso es la <strong>sensibilidad</strong>. RSSI es la potencia que efectivamente llega.'],
    ['La atenuación es una función creciente de la distancia entre los nodos.', V, 'A mayor distancia, mayor atenuación.'],
    ['A mayor frecuencia, mayor atenuación.', V, 'Por eso VDSL2 necesita bucles cortos.'],
    ['A mayor frecuencia, menor atenuación.', F, 'Al revés.'],
  ]);
  cq('tipos-ruido', [
    ['Ruido es una señal indeseable que se inserta en algún punto entre el emisor y el receptor.', V, 'Definición.'],
    ['Ruido es una señal deseable que se inserta entre el emisor y el receptor.', F, 'Es indeseable.'],
    ['Ruido es el debilitamiento de la señal debido a la resistencia eléctrica.', F, 'Eso es la atenuación.'],
    ['Ruidos correlacionados son los que existen solo ligados a la existencia de la señal.', V, 'Distorsión armónica, intermodulación.'],
    ['Ruido impulsivo es generado por el movimiento aleatorio de los electrones en un conductor.', F, 'Ese es el térmico; el impulsivo son picos breves (rayos, conmutaciones).'],
    ['En cualquier sistema de comunicaciones la señal que se recibe será idéntica a la transmitida.', F, 'Siempre hay atenuación, distorsión y ruido.'],
  ]);
  cq('distorsion', [
    ['La distorsión es la alteración solo de la amplitud de la señal debido a la respuesta imperfecta del sistema.', F, 'Es la alteración de la <strong>forma</strong> de la señal.'],
    ['La distorsión es la alteración de la forma de la señal deseada debido a la respuesta imperfecta del sistema a ella misma.', V, 'Definición.'],
  ]);
  cq('ruido-termico', [
    ['El ruido térmico es generado por el movimiento aleatorio de los electrones en un conductor, creando una señal extra no enviada por el transmisor.', V, 'Agitación térmica.'],
    ['La potencia de ruido térmico, en el dominio de la frecuencia, presenta una respuesta plana.', V, 'Ruido blanco: N₀ constante.'],
    ['Para una T dada, la potencia de ruido térmico de un canal de 1 MHz es idéntica si la banda va de 1 a 2 MHz o de 19 a 20 MHz.', V, 'N = kTB: solo importa el ancho.'],
    ['La potencia térmica generada en un ancho de banda de 1 Hz se mide en [W/Hz].', V, 'Es la densidad N₀ = kT.'],
    ['Con N = 4,002×10⁻¹⁵ W en 1 MHz, la temperatura de trabajo es 17 °C.', V, 'T = N/(kB) = 290 K = 17 °C. (El cuestionario escribe 10⁻¹⁴, pero la respuesta aceptada, 17 °C, corresponde a 10⁻¹⁵.)'],
    ['Con B = 100 MHz y T = 27 °C, la potencia de ruido térmico es 4,14×10⁻¹³ W.', V, '1,38×10⁻²³ × 300 × 10⁸.'],
  ]);

  // ================= Unidad 4 y 5 =================
  const info = {
    equi: ['Cuando todos los símbolos son igualmente probables (distribución de probabilidad plana), todos aportan información relevante y la entropía es máxima.', V, 'H = log₂N es el máximo. El cuestionario de la Unidad 4 lo pregunta negado (“no todos aportan”) y eso es falso.', 'entropia'],
    prom: ['La entropía también se puede considerar como la cantidad de información promedio que contienen los símbolos usados por la fuente.', V, 'H = Σ P·I.', 'entropia'],
    redund: ['La redundancia es el resultado de una alta probabilidad y la entropía de una baja probabilidad.', V, 'Lo probable es predecible (redundante); lo improbable es incierto (entrópico). El cuestionario de la Unidad 4: “redundancia es aquello que es predecible o convencional en un mensaje, su opuesto es la entropía”.', 'informacion-afondo'],
    predec: ['Un mensaje con baja predecibilidad es entrópico y tiene alto contenido informativo; en cambio un mensaje con alta predecibilidad es redundante y tiene bajo contenido informativo.', V, 'Lo impredecible informa.', 'informacion-afondo'],
    hProm: ['La información promedio (bits/símbolo) será la información total de la secuencia dividida por el número de símbolos de la misma, y se representa con la letra H.', V, 'Entropía.', 'entropia'],
    snrBaja: ['En la expresión de la capacidad de un canal real, limitada por su ancho de banda B y su SNR, al disminuir la SNR los niveles M de codificación pueden aumentar y permiten mayores tasas de transmisión R.', F, 'Menos SNR → menos niveles distinguibles (M = √(1 + SNR)) → menos tasa.', 'nyquist-capacidad'],
    snrAlta: ['En la expresión de la capacidad de un canal, al aumentar la SNR los niveles M de codificación pueden aumentar y permiten mayores tasas de transmisión R.', V, 'M = √(1 + SNR).', 'nyquist-capacidad'],
    mMax: ['En la relación entre un canal ideal y el real, conociendo la SNR, el valor obtenido de M es el máximo valor de niveles con que puede ser codificada la señal.', V, '2B log₂M ≤ B log₂(1 + SNR) → M ≤ √(1 + SNR): es un máximo.', 'nyquist-capacidad'],
    blanco: ['Ya que el ruido se ha supuesto blanco, cuanto mayor sea el ancho de banda B, más densidad de ruido N₀ se introducirá. Por lo tanto, cuando aumenta B, disminuye la SNR.', F, 'Con ruido blanco la <strong>densidad</strong> N₀ es constante; lo que crece con B es la <strong>potencia</strong> de ruido N = N₀·B (y por eso baja la SNR). El error está en “más densidad”.', 'shannon'],
    shannonH: ['La entropía de una fuente de información, según Shannon, mide la cantidad promedio de información que un observador recibe al presenciar los eventos de dicha fuente; su unidad más común es el bit por símbolo y representa la incertidumbre de la fuente.', V, 'Definición.', 'entropia'],
    mutuaMal: ['La información mutua mide la reducción de la incertidumbre en una variable cuando no se conoce el valor de otra, lo que la convierte en una medida de su independencia.', F, 'Es al <strong>conocer</strong> la otra y mide <strong>dependencia</strong>.', 'informacion-afondo'],
    fija: ['La codificación de longitud fija no tiene en cuenta las probabilidades de los símbolos para la compresión, por lo que es óptima cuando las probabilidades de todos los símbolos son iguales.', V, 'Caso equiprobable.', 'informacion-afondo'],
    prefijo: ['Un código de prefijo, como el de Huffman, es aquel en el que ningún código es el prefijo de otro, lo que asegura una decodificación sin ambigüedades.', V, 'Cada símbolo es una hoja del árbol.', 'informacion-afondo'],
    hSup: ['La entropía de una fuente es el límite superior de la longitud de código promedio para cualquier codificador, por lo que la entropía es menor o igual que la longitud promedio del código.', F, 'Es el límite <strong>inferior</strong> (H ≤ L̄). La segunda mitad es correcta y contradice a la primera.', 'informacion-afondo'],
    teorema: ['El teorema del codificador de fuente de Shannon establece que es imposible comprimir los datos de una fuente a una tasa inferior a su entropía (sin pérdida de información).', V, 'H ≤ L̄.', 'informacion-afondo'],
    huffOpt: ['Un codificador de Huffman es considerado óptimo, ya que produce la longitud de palabra promedio más corta para un conjunto dado de probabilidades de símbolos.', V, 'Entre los códigos símbolo a símbolo.', 'huffman'],
    huffVar: ['El algoritmo de Huffman genera códigos de longitud variable que son óptimos en el sentido de que producen la menor longitud de código promedio para una distribución de probabilidad dada.', V, 'Longitud variable.', 'huffman'],
    sorpresa: ['La información autocontenida (o sorpresa) de un evento de probabilidad p(x) es inversamente proporcional a su probabilidad; se expresa como I(x) = log<sub>b</sub> p(x), donde b es la base (2 para bits).', F, 'Falta el signo: I(x) = −log<sub>b</sub> p(x) = log<sub>b</sub>(1/p). Como está escrita daría información negativa; además la relación es logarítmica, no inversamente proporcional.', 'medida-informacion'],
    sinMem: ['La velocidad de la entropía de una fuente estacionaria sin memoria es numéricamente igual a la entropía de la fuente por sí misma, porque en una fuente sin memoria la incertidumbre de cada símbolo es independiente de los anteriores.', V, 'Por símbolo, sin memoria, la tasa de entropía es H.', 'informacion-afondo'],
    optLargos: ['Un codificador óptimo siempre asigna códigos más largos a los símbolos menos probables y más cortos a los más probables.', V, 'Es la idea de Huffman.', 'huffman'],
    binaria: ['La entropía de una fuente binaria con probabilidades p y 1 − p es máxima cuando ambos símbolos tienen la misma probabilidad: H(p) = −[p log₂p + (1 − p) log₂(1 − p)], con máximo en p = 0,5.', V, 'H(0,5) = 1 bit.', 'informacion-afondo'],
    huffFija: ['Un codificador de Huffman es un ejemplo de codificación de longitud fija, óptima cuando todos los símbolos tienen la misma probabilidad.', F, 'Huffman es de longitud <strong>variable</strong>.', 'huffman'],
    mutuaOk: ['La información mutua entre dos variables aleatorias mide la cantidad de información que se obtiene sobre una de ellas al observar la otra; es una medida de la dependencia y es simétrica.', V, 'I(X;Y) = I(Y;X).', 'informacion-afondo'],
    capacidad: ['La capacidad de un canal, según el teorema de Shannon, es la máxima tasa a la que se puede transmitir información con un error arbitrariamente pequeño; es fundamental para determinar el límite de la velocidad en un sistema ruidoso.', V, 'R ≤ C.', 'shannon'],
    hMayor: ['La entropía de una fuente siempre es mayor o igual que la longitud de código promedio de cualquier codificador de longitud variable (cota de Shannon), y establece el límite superior de la compresión sin pérdida.', F, 'Es <strong>menor</strong> o igual: H ≤ L̄.', 'informacion-afondo'],
    redCod: ['La redundancia de un código es la diferencia entre la longitud de código promedio y la entropía de la fuente; redundancia cero significa que se alcanzó el límite teórico de compresión sin pérdida.', V, 'L̄ − H.', 'informacion-afondo'],
    detec: ['La detección de errores tiene como objetivo identificar si un mensaje ha sido alterado durante la transmisión, con técnicas como la paridad o el CRC que añaden redundancia.', V, 'Definición.', 'errores-afondo'],
    correc: ['La corrección de errores, a diferencia de la detección, permite al receptor reconstruir el mensaje original sin solicitar retransmisión, y requiere más bits de redundancia.', V, 'FEC.', 'errores-afondo'],
    paridad: ['El bit de paridad solo puede identificar si ocurrió un número impar de errores en un bloque; si el número de errores es par, el error pasa desapercibido.', V, 'La paridad no cambia con dos errores.', 'errores-afondo'],
    hammingVarios: ['El código de Hamming es un código de detección y corrección de errores, útil en comunicaciones con ruido, ya que puede corregir un único bit de error en un bloque de datos.', V, 'Corrige 1 y detecta hasta 2 (distancia 3).', 'errores-afondo'],
    crcCorr: ['El CRC es un método de corrección de errores que se basa en la división polinomial; es uno de los métodos más potentes para detectar ráfagas de errores.', F, 'El CRC <strong>detecta</strong>, no corrige.', 'errores-afondo'],
    dist: ['La distancia de Hamming entre dos palabras binarias es el número de posiciones en las que los bits son diferentes; determina la capacidad de detección y corrección de un código.', V, 'Definición.', 'errores-afondo'],
    cMas1: ['Un código es capaz de corregir C errores si su distancia mínima de Hamming es H = C + 1 o mayor, así las esferas de radio C alrededor de cada palabra no se solapan.', F, 'Hace falta H ≥ 2C + 1.', 'errores-afondo'],
    bloques: ['Los códigos de bloques, como el de Hamming, operan sobre bloques de datos de tamaño fijo: la codificación y decodificación se hacen bloque a bloque, independientemente del resto del mensaje.', V, 'Códigos (n, k).', 'errores-afondo'],
    pot2: ['En el código de Hamming los bits de paridad se colocan en las posiciones que son potencias de dos, y cada uno cubre un conjunto específico de bits.', V, '1, 2, 4, 8, …', 'hamming'],
    repet: ['En un código de repetición simple, si un bit 1 se repite tres veces (111), el receptor puede inferir que el bit original era 1 si recibe 101 o 110.', V, 'Decisión por mayoría: corrige 1 error.', 'errores-afondo'],
    fecMal: ['Un código de corrección hacia adelante (FEC) se basa en la retransmisión automática del mensaje cuando se detecta un error.', F, 'Eso es ARQ; FEC corrige sin retransmitir.', 'errores-afondo'],
    h74: ['El código de Hamming (7,4) tiene 7 bits en total, 4 de datos y 3 de paridad; puede corregir un único bit de error y detectar hasta dos errores en un bloque.', V, 'Distancia mínima 3.', 'hamming'],
    detEfic: ['Los códigos de detección de errores son más eficientes en ancho de banda que los de corrección, porque requieren menos bits de redundancia.', V, 'Detectar cuesta menos que corregir.', 'errores-afondo'],
  };
  const I = (...ks) => ks.map((k) => info[k]);
  vf('entropia', ['2p-2025-t1#1'], 'V o F sobre información y capacidad (2do parcial 2025, tema 1)', 'Indicar VERDADERO o FALSO sobre las siguientes definiciones básicas:',
    I('equi', 'prom', 'redund', 'predec', 'hProm', 'snrBaja', 'snrAlta', 'mMax', 'blanco'));
  const lista2 = ['shannonH', 'mutuaMal', 'fija', 'prefijo', 'hSup', 'teorema', 'huffOpt', 'huffVar', 'sorpresa', 'sinMem', 'optLargos', 'binaria', 'huffFija', 'mutuaOk', 'capacidad', 'hMayor', 'redCod', 'predec', 'detec', 'correc', 'paridad', 'hammingVarios', 'crcCorr'];
  vf('informacion-afondo', ['2p-2025-t2#1'], 'V o F sobre información, códigos y errores (2do parcial 2025, tema 2)', 'Indicar VERDADERO o FALSO sobre las siguientes definiciones básicas:', I(...lista2));
  vf('errores-afondo', ['2p-2025-v5#5'], 'V o F sobre información y control de errores (2do parcial 2025, ejercicio 5)', 'Indicar VERDADERO o FALSO sobre las siguientes definiciones básicas:',
    I(...lista2.slice(8), 'dist', 'cMas1', 'bloques', 'pot2', 'repet', 'fecMal', 'h74', 'detEfic'));

  const v6 = vid(600 * 500, 16, 30), b6 = v6.R / Math.log2(1024);
  add('shannon',
    { title: 'Video 600 × 500 con 16 niveles (2do parcial 2025)', exam: ['2p-2025-t1#2', '2p-2025-t2#2'], level: 2, prompt: '<p>Una señal de video en escala de grises transmite imágenes de 600 × 500 píxeles; cada uno puede asumir 16 niveles de brillo equiprobables. La tasa es de 30 imágenes/s y la relación señal a ruido es 1023. a) Peso de cada imagen. b) Entropía de la fuente si todas las imágenes fueran equiprobables. c) Ancho de banda requerido.</p>',
      solution: { explain: `<p><b>a)</b> 300 000 píxeles × log₂16 = 300 000 × 4 = <strong>1,2 Mbit</strong> por imagen (150 kB).</p><p><b>b)</b> Hay 16<sup>300 000</sup> imágenes posibles y equiprobables: H = log₂(16<sup>300 000</sup>) = <strong>1,2×10⁶ bits/imagen</strong>. La entropía coincide con el peso porque todo es equiprobable.</p><p><b>c)</b> R = r·H = 30 × 1,2×10⁶ = 36 Mbps. Con Shannon, B = R / log₂(1 + SNR) = 36×10⁶ / log₂1024 = 36×10⁶/10 = <strong>${num(b6 / 1e6, 1)} MHz</strong>.</p>` } },
    { title: 'Video 640 × 480 con 16 niveles y 30 dB (finales 18/02 y 27/06/2019)', exam: ['f-2019-02#2', 'f-2019-06#3'], level: 2, prompt: '<p>Video en escala de grises de 640 × 480 píxeles, 16 niveles equiprobables, 30 imágenes/s y SNR de 30 dB. a) Peso de cada imagen. b) Entropía si todas las imágenes fueran equiprobables. c) Ancho de banda requerido.</p>',
      solution: { explain: (() => { const v = vid(640 * 480, 16, 30); return `<p><b>a)</b> 307 200 × 4 = <strong>${num(v.I / 1e6, 4)} Mbit</strong> por imagen.</p><p><b>b)</b> H = log₂(16<sup>307 200</sup>) = <strong>${num(v.I)} bits/imagen</strong>.</p><p><b>c)</b> R = 30 × ${num(v.I)} = ${num(v.R / 1e6, 3)} Mbps. 30 dB = 1000 veces: B = R / log₂(1001) = ${num(v.R / 1e6, 3)}×10⁶ / ${num(Math.log2(1001), 3)} = <strong>${num(v.R / Math.log2(1001) / 1e6, 2)} MHz</strong>.</p>`; })() } },
    { title: 'Video 640 × 480 con 8 niveles por un canal de 5 MHz (final 05/08/2019)', exam: ['f-2019-08#2'], level: 2, prompt: '<p>Video de 640 × 480 píxeles, 8 niveles equiprobables, 20 imágenes/s, por un canal de 5 MHz. a) Peso de cada imagen. b) Entropía si las imágenes fueran equiprobables. c) SNR requerida.</p>',
      solution: { explain: (() => { const v = vid(640 * 480, 8, 20), s = 2 ** (v.R / 5e6) - 1; return `<p><b>a)</b> 307 200 × log₂8 = <strong>${num(v.I)} bits</strong> (921,6 kbit).</p><p><b>b)</b> H = ${num(v.I)} bits/imagen.</p><p><b>c)</b> R = 20 × ${num(v.I)} = ${num(v.R / 1e6, 3)} Mbps. SNR = 2<sup>R/B</sup> − 1 = 2<sup>${num(v.R / 5e6, 3)}</sup> − 1 = <strong>${num(s, 2)} veces = ${num(10 * Math.log10(s), 1)} dB</strong>.</p>`; })() } },
    { title: 'Video 640 × 480 con 32 niveles a 46 Mbps (final 03/09/2019)', exam: ['f-2019-09#2'], level: 2, prompt: '<p>Video de 640 × 480 píxeles, 32 niveles equiprobables. a) Información por imagen. b) Imágenes por segundo si R = 46 Mbps. c) Ancho de banda requerido si la SNR es de 30 dB.</p>',
      solution: { explain: (() => { const v = vid(640 * 480, 32, 1); return `<p><b>a)</b> 307 200 × 5 = <strong>${num(v.I / 1e6, 3)} Mbit</strong>.</p><p><b>b)</b> r = R/I = 46×10⁶ / ${num(v.I)} = <strong>${num(46e6 / v.I, 2)} ≈ 30 imágenes/s</strong>.</p><p><b>c)</b> B = 46×10⁶ / log₂1001 = <strong>${num(46e6 / Math.log2(1001) / 1e6, 2)} MHz</strong>.</p>`; })() } },
    { title: 'Video a 50,4 Mbps por un canal de 5,04 MHz (2do parcial 2025, corregido)', exam: ['2p-2025-c#4'], level: 2, prompt: '<p>Video en escala de grises a R = 50,40 Mbps por un canal de B = 5,04 MHz. a) Relación señal a ruido del canal en veces. b) Entropía de la fuente si se transmiten 20 imágenes/s. c) Peso de las imágenes si fueran equiprobables.</p>',
      solution: { explain: '<p><b>a)</b> R = B log₂(1 + SNR) → SNR = 2<sup>R/B</sup> − 1 = 2<sup>10</sup> − 1 = <strong>1023 veces</strong> (30,1 dB).</p><p><b>b)</b> R = r·H → H = 50,4×10⁶ / 20 = <strong>2,52×10⁶ bits/imagen</strong>.</p><p><b>c)</b> Con imágenes equiprobables el peso es igual a la entropía: <strong>2,52 Mbit</strong> por imagen (315 kB). Por ejemplo, 630 000 píxeles de 16 niveles, o 840 000 de 8 niveles.</p>' } },
  );
  const b25 = 8e6 / Math.log2(1 + 10 ** 2.5), m25 = Math.sqrt(1 + 10 ** 2.5);
  add('nyquist-capacidad',
    { title: 'Canal de 8 Mbps con SNR = 255 (2do parcial 2025, tema 1)', exam: ['2p-2025-t1#3'], level: 2, prompt: '<p>Un canal tiene capacidad máxima de 8 Mbps y SNR de 255. a) Ancho de banda B necesario. b) Niveles de codificación admisibles con esa SNR. c) ¿Ese M es el máximo o el mínimo posible?</p>',
      solution: { explain: '<p><b>a)</b> B = C / log₂(1 + SNR) = 8×10⁶ / log₂256 = 8×10⁶/8 = <strong>1 MHz</strong>.</p><p><b>b)</b> Igualando Nyquist y Shannon, 2B log₂M = B log₂(1 + SNR) → M = √(1 + SNR) = √256 = <strong>16 niveles</strong>.</p><p><b>c)</b> Es el <strong>máximo</strong>: con más niveles el ruido no deja distinguirlos.</p>' } },
    { title: 'Canal de 8 Mbps con SNR de 25 dB (2do parcial 2025, tema 2)', exam: ['2p-2025-t2#3'], level: 2, prompt: '<p>Un canal tiene capacidad máxima de 8 Mbps y SNR de 25 dB. a) Ancho de banda B. b) Niveles de codificación admisibles. c) ¿Máximo o mínimo?</p>',
      solution: { explain: `<p>25 dB = 10<sup>2,5</sup> = 316,2 veces.</p><p><b>a)</b> B = 8×10⁶ / log₂(317,2) = <strong>${num(b25 / 1e3, 1)} kHz</strong> (≈ 0,96 MHz).</p><p><b>b)</b> M = √(1 + SNR) = ${num(m25, 2)} → se toma la potencia de 2 inferior: <strong>M = 16</strong>.</p><p><b>c)</b> Es el <strong>máximo</strong> admisible.</p>` } },
    { title: 'Canal de 8 Mbps y 1 MHz (2do parcial, modelo)', exam: ['2p-mod#2'], level: 2, prompt: '<p>Un canal tiene capacidad máxima de 8 Mbps y ancho de banda de 1 MHz. a) SNR admisible para lograr esa capacidad. b) Niveles de codificación admisibles; ¿ese valor es el máximo o el mínimo?</p>',
      solution: { explain: '<p><b>a)</b> SNR = 2<sup>C/B</sup> − 1 = 2⁸ − 1 = <strong>255 veces (24,07 dB)</strong>: es la SNR <strong>mínima</strong> para llegar a 8 Mbps.</p><p><b>b)</b> M = √(1 + 255) = <strong>16 niveles</strong>, el <strong>máximo</strong> que esa SNR permite distinguir.</p>' } },
    { title: 'Canal de 1 MHz con 16 niveles (2do parcial 2025, corregido)', exam: ['2p-2025-c#1'], level: 2, prompt: '<p>Un canal de B = 1 MHz transmite con 16 niveles de codificación. a) SNR (en dB) con la que es posible la transmisión. b) ¿Ese valor es el máximo o el mínimo posible? c) Capacidad del canal.</p>',
      solution: { explain: '<p><b>a)</b> M = √(1 + SNR) → SNR = M² − 1 = 255 → 10 log 255 = <strong>24,07 dB</strong>.</p><p><b>b)</b> Es la SNR <strong>mínima</strong>: con menos SNR no se distinguen 16 niveles (la cátedra corrigió “máxima” por “mínima”).</p><p><b>c)</b> C = B log₂(1 + SNR) = 10⁶ × log₂256 = <strong>8 Mbps</strong> (igual que Nyquist: 2B log₂16).</p>' } },
    { title: 'Niveles M y SNR: elegir la verdadera (2do parcial, modelo)', exam: ['2p-mod#1'], level: 1, prompt: '<p>Según la relación entre los M niveles de codificación y la SNR se puede afirmar que: a) al disminuir la SNR los niveles M pueden aumentar y permitir mayores tasas R; b) al aumentar la SNR los niveles M disminuyen y permiten mayores tasas R; c) conociendo la SNR, el valor obtenido de M es el mínimo de niveles con que puede codificarse la señal; d) ninguna es verdadera.</p>',
      solution: { explain: '<p>a) Falsa: menos SNR, menos niveles. b) Falsa: más SNR permite <strong>más</strong> niveles. c) Falsa: M = √(1 + SNR) es el <strong>máximo</strong>. Respuesta: <strong>d) ninguna de las afirmaciones es verdadera</strong>.</p>' } },
  );
  cq('medida-informacion', [
    ['Si una fuente usa un abecedario de 32 símbolos equiprobables, la cantidad de información por símbolo es 5 bits.', V, 'log₂32.'],
    ['La selección de un mensaje entre cuatro igualmente probables requiere 2 bits.', V, 'log₂4.'],
    ['La cantidad de información está en función inversa de la probabilidad: a mayor probabilidad menor información.', V, 'I = log₂(1/P).'],
    ['Si no hay posibilidad de elección (un solo mensaje posible), no hay incertidumbre ni información.', V, 'P = 1 → I = 0.'],
    ['Si la fuente puede elegir libremente entre muchos mensajes, el usuario tendrá muy poca incertidumbre.', F, 'Tendrá mucha.'],
  ]);
  cq('entropia', [
    ['Si el número de mensajes N de una fuente disminuye, la fuente se hace menos entrópica.', V, 'H ≤ log₂N baja. (En el cuestionario 2025 figura como falsa; por teoría, con símbolos equiprobables es verdadera.)'],
    ['Si el número de resultados equiprobables aumenta, la entropía también aumenta.', V, 'log₂N.'],
    ['Un mensaje con símbolos altamente previsibles es más entrópico.', F, 'Es redundante.'],
    ['Con símbolos de igual probabilidad, numéricamente la cantidad de información es menor que la entropía.', F, 'Son iguales: H = I = log₂N.'],
  ]);
  cq('huffman', [['Un código óptimo siempre tiene la misma longitud para todos los símbolos.', F, 'Solo en el caso equiprobable.']]);
  cq('tasa-informacion', [
    ['La meta del diseño es transmitir información a la máxima velocidad con la máxima potencia y el mínimo ancho de banda.', F, 'Con la <strong>mínima</strong> potencia (y mínimo ancho de banda y error).'],
    ['La codificación se emplea para adaptar la fuente al canal para una transferencia de información con un máximo de confiabilidad.', V, 'Codificador de fuente y de canal.'],
    ['La velocidad de información R de una fuente es máxima cuando la entropía es máxima.', V, 'R = r·H.'],
  ]);
  cq('informacion-senal', [
    ['La capacidad de un canal se mide en bits/símbolo.', F, 'En bits por segundo.'],
    ['Si R > C no es posible transmitir sin errores.', V, 'Segundo teorema de Shannon.'],
    ['Si R ≤ C existe una codificación que permite transmitir con una frecuencia de errores arbitrariamente pequeña, pese al ruido.', V, 'Segundo teorema de Shannon.'],
    ['El codificador transforma los mensajes generados por la fuente: convierte una secuencia de símbolos en otra distinta.', V, 'Definición.'],
  ]);
  cq('muestreo', [['Para reconstruir una señal limitada en banda hay que muestrearla al menos al doble de su máxima frecuencia (frecuencia de Nyquist).', V, 'fs ≥ 2 f<sub>máx</sub>.']]);
  cq('nyquist-capacidad', [
    ['Un canal de 3 MHz con un módem de 4 niveles tiene capacidad de 12 Mbps.', V, '2 × 3 MHz × log₂4.'],
    ['Para 12 Mbps en un canal de 3 MHz hacen falta 4 niveles.', V, '12 = 6 log₂M → M = 4.'],
  ]);

  // ================= Unidad 6 =================
  const crcT = X.crc('10110111', G), chk = X.crcCheck('1011011101000', G);
  add('crc',
    { title: 'Palabra código CRC para 10110111 (2do parcial 2025)', exam: ['2p-2025-t1#4', '2p-2025-t2#4', '2p-mod#3'], level: 2, prompt: '<p>Dado el polinomio generador CRC G(x) = x⁵ + x⁴ + x + 1, determinar la palabra código T(x) a transmitir para el mensaje M(x) = 10110111.</p>',
      solution: { explain: crcHtml('10110111', G, 'Palabra a transmitir') } },
    { title: '¿Llegó bien 1011011101000? (2do parcial 2025, corregido)', exam: ['2p-2025-c#2'], level: 2, prompt: '<p>Con G(x) = x⁵ + x⁴ + x + 1, determinar si la palabra código T(x) = 1011011101000, transmitida por un canal con ruido, tiene error.</p>',
      solution: { explain: `<p>Se divide la palabra recibida completa (sin agregar ceros) por ${mono(G)}. El resto es <strong>${mono(chk.rem)}</strong> ≠ 0: <strong>hay error</strong>. (La palabra correcta para el mensaje 10110111 es ${mono(crcT.tx)}: difiere en el último bit.)</p><p>El alumno llegó a la conclusión correcta pero con un resto mal calculado: conviene verificar la división restando de a 6 bits y bajando siempre un bit.</p>` } },
  );
  add('hamming',
    { title: 'Hamming: se recibe 10011100101 (2do parcial 2025)', exam: ['2p-2025-t1#5', '2p-2025-t2#5', '2p-mod#4'], level: 2, prompt: '<p>Se recibe R(x) = 10011100101 en un receptor con código corrector Hamming. a) ¿Tiene error? ¿En qué posición? b) Secuencia pura de datos n sin los bits de paridad p.</p>', solution: { explain: ham('10011100101') } },
    { title: 'Hamming: se recibe 11110000100 (2do parcial 2025, corregido)', exam: ['2p-2025-c#3'], level: 2, prompt: '<p>Se recibe R(x) = 11110000100 con código corrector Hamming. a) ¿Tiene error? ¿En qué posición? b) Datos puros.</p>', solution: { explain: `${ham('11110000100')}<p>Es lo que resolvió el alumno (sin corregir los datos serían 1110001; corregidos, 1110000).</p>` } },
    { title: 'Hamming: se recibe 01100101110 (final 27/06/2019)', exam: ['f-2019-06#4'], level: 2, prompt: '<p>Se recibe R(x) = 01100101110 con código corrector Hamming. a) ¿Tiene error? ¿En qué posición? b) Datos puros.</p>', solution: { explain: ham('01100101110') } },
    { title: 'Hamming: se recibe 10001100101 (final 03/09/2019)', exam: ['f-2019-09#4'], level: 2, prompt: '<p>Se recibe 10001100101 con código corrector Hamming. a) ¿Tiene error? ¿En qué posición? b) Datos puros.</p>', solution: { explain: `${ham('10001100101')}<p>Compará con el TP 6, ejercicio 7 (10001100100): cambia un bit y cambia el síndrome.</p>` } },
    { title: 'Hamming de 12 bits E4F (final 05/08/2019)', exam: ['f-2019-08#3'], level: 3, prompt: '<p>Llega un código Hamming de 12 bits cuyo valor hexadecimal es E4F. ¿Cuál es el valor original en hexadecimal? Se asume a lo sumo un error simple.</p>',
      solution: { explain: (() => { const w = '111001001111', d = X.hammingDecode([...w].reverse().join('')); return `<p>E4F = ${mono('1110 0100 1111')}. 12 bits → 4 de paridad y 8 de datos (Hamming (12, 8)).</p><p>Con la numeración de la cátedra (de derecha a izquierda) el síndrome da ${X.hammingDecode(w).syn}, una posición que no existe en 12 bits: señal de que este ejercicio (tomado de la bibliografía clásica) numera las posiciones <strong>de izquierda a derecha</strong>. Así, paridades en las posiciones 1, 2, 4 y 8 desde la izquierda:</p><p>Síndrome = <strong>${d.syn}</strong>: el error está en la posición ${d.syn}, que es un bit de <strong>paridad</strong>. Los datos (posiciones 3, 5, 6, 7, 9, 10, 11, 12) no se tocan: ${mono('1010 1111')} = <strong>AF (hex)</strong>.</p>`; })() } },
  );
  const hamVf = [
    ['Si el error de un bit se produjera en alguno de los bits p de paridad añadidos a los datos n, al hacer la decodificación Hamming en el receptor el mismo puede ser detectado y corregido.', V, 'El síndrome apunta a esa posición como a cualquier otra.'],
    ['Se define distancia de Hamming como el número de bits que tienen que cambiarse para transformar una palabra código válida en otra palabra código que puede ser válida o no.', F, 'Es entre dos palabras <strong>válidas</strong>: el número de bits en que difieren.'],
    ['Si dos palabras código difieren en una distancia d, se necesitan d − 1 errores para convertir una en la otra.', F, 'Se necesitan <strong>d</strong> errores.'],
    ['Para corregir d errores de un bit entre dos palabras código es necesario un código con una distancia de Hamming de al menos 2d + 1.', V, 'H ≥ 2C + 1.'],
    ['Si el número de bits añadidos es p = 4, esto permite detectar errores de un bit sobre n = 7 bits de datos como máximo.', F, 'Con p = 4 se protegen hasta n = 11 bits (2⁴ ≥ n + 5).'],
  ];
  vf('errores-afondo', ['f-2019-02#3'], 'V o F sobre el método Hamming (final 18/02/2019)', 'De acuerdo al método de codificación Hamming, indicar cuál de las afirmaciones es VERDADERA o FALSA:', [hamVf[1], hamVf[2], hamVf[3], hamVf[4], hamVf[0]]);
  vf('errores-afondo', ['f-2019-07#1'], 'V o F sobre el método Hamming (final 27/07/2019)', 'De acuerdo al método de codificación Hamming, indicar cuál de las afirmaciones es VERDADERA o FALSA:', hamVf);
  cq('crc', [['Dentro de los métodos de detección, el CRC se basa en operaciones aritméticas con polinomios en módulo 2.', V, 'División polinómica sin acarreo (XOR).']]);
  cq('errores-afondo', [
    ['Un conjunto de símbolos con distancia de Hamming 4 permite detectar 2 errores y corregir 1.', V, 'H − 1 = 3 = D + C.'],
    ['El proceso de monitorear la información recibida y determinar cuándo hubo un error se denomina corrección de errores.', F, 'Es detección.'],
    ['Como método de corrección de errores, ARQ depende de sistemas de detección como el CRC.', V, 'Detecta y retransmite.'],
    ['ARQ es un método de detección y corrección independiente de la paridad o el CRC.', F, 'Depende de ellos.'],
    ['Las técnicas de detección de errores indican que ocurrió un error y a la vez identifican cuál bit es erróneo.', F, 'Eso es corrección.'],
    ['La tasa de errores BER relaciona la cantidad de bits recibidos sin error con el total transmitido.', F, 'Relaciona los bits <strong>erróneos</strong> con el total.'],
  ]);

  // ================= Unidad 7 =================
  const tx = {
    niveles: ['Una de las maneras de aumentar la velocidad de transmisión sin aumentar la velocidad de modulación, la tasa de errores y el ancho de banda es aumentando el número de niveles de codificación de la señal.', V, 'R = r·log₂N: más bits por baudio con la misma tasa de símbolos (la cátedra la da por verdadera; en la práctica más niveles necesitan más SNR).', 'bits-baudios'],
    vmod: ['Se denomina velocidad de modulación a la inversa de la medida del intervalo de tiempo nominal más corto entre dos instantes significativos sucesivos de la señal modulada; también, a la inversa del tiempo que dura el elemento más corto de la señal que se utiliza para crear un pulso.', V, 'Baudios = 1/T<sub>s</sub>.', 'bits-baudios'],
    sinc: ['La transmisión síncrona es eficiente, fiable y se utiliza para transferir una gran cantidad de datos; proporciona comunicación en tiempo real (chat, videoconferencia, conversaciones telefónicas).', V, 'Grandes bloques con reloj común. (El cuestionario la pregunta con “pequeñas cantidades” y así es falsa.)', 'modos-transmision'],
    asinc: ['En la transmisión asíncrona los datos fluyen en modo half dúplex, 1 byte o un carácter a la vez, en un flujo continuo; el carácter de 7 bits con paridad, inicio y parada suma 10 bits, y no requiere reloj porque usa los bits de paridad para indicar al receptor cómo interpretar los datos.', F, 'Lo que sincroniza al receptor son los bits de <strong>inicio y parada</strong>, no el de paridad (que sirve para detectar errores). Además no es necesariamente half dúplex.', 'modos-transmision'],
    manch: ['En la codificación polar bifásica (Manchester) la señal cambia en medio del intervalo del bit, pero sin retorno a cero, continuando el resto del intervalo en el polo opuesto; la primera mitad determina el valor del bit y la segunda sincroniza, combinando las ideas de RZ y NRZ-L.', V, 'Definición de la cátedra. Si se invierten las mitades (la primera sincroniza), es falsa.', 'codigos-linea'],
    ami: ['La codificación AMI tiene un BW más reducido y no crea componente de DC; con largas secuencias de ceros se afecta la sincronización, y se usan técnicas de aleatorización como B8ZS y HDB3.', V, 'Sustituyen las secuencias de ceros.', 'codigos-bipolares'],
    nrz: ['La ventaja de la codificación de línea NRZ es que permite la recuperación de reloj y no tiene componente continua.', F, 'Al revés: NRZ tiene componente continua y pierde el sincronismo con secuencias largas iguales.', 'codigos-linea'],
    baudio: ['El baudio es el número de cambios altos/bajos que hacen los símbolos en la línea de transmisión por segundo.', V, 'Cambios de estado de la señal por segundo.', 'bits-baudios'],
    objetivo: ['Un objetivo en la comunicación de datos es incrementar la tasa de bits, al mismo tiempo que aumenta la tasa de símbolos.', F, 'Se busca subir la tasa de bits y <strong>bajar</strong> la de símbolos (menos ancho de banda).', 'bits-baudios'],
    sincHalf: ['En la transmisión síncrona, los datos fluyen en modo half dúplex, 1 byte o un carácter a la vez, en un flujo continuo de bytes.', F, 'Eso describe a la asíncrona (carácter a carácter); la síncrona manda bloques grandes con reloj común.', 'modos-transmision'],
    rz: ['La codificación polar RZ utiliza dos niveles de tensión (+V y −V), la señal no cambia dentro del tiempo del bit y posee mayor ocupación de ancho de banda.', F, 'RZ usa <strong>tres</strong> niveles (+V, 0, −V) y vuelve a cero en la mitad de cada bit; por eso ocupa el doble de ancho de banda.', 'codigos-linea'],
  };
  const T = (...ks) => ks.map((k) => tx[k]);
  vf('modos-transmision', ['3p-2025#1'], 'V o F sobre transmisión de datos (3er parcial 2025)', 'Sobre las siguientes afirmaciones, indicar cuáles son VERDADERAS o FALSAS:', T('niveles', 'vmod', 'sinc', 'asinc', 'manch', 'ami', 'nrz'));
  vf('bits-baudios', ['2p-mod#5'], 'V o F sobre definiciones de la transmisión de datos (2do parcial, modelo)', 'Indicar Verdadero o Falso las siguientes definiciones básicas de la transmisión de datos:', T('baudio', 'objetivo', 'niveles', 'sincHalf', 'rz'));
  cq('bits-baudios', [
    ['Si cada unidad de señal lleva 10 bits y se envían 1635 unidades por segundo, la tasa es 16 350 bps.', V, 'R = r·n.'],
    ['Si cada símbolo codifica 6 bits y la tasa es 8,6 kbps, la tasa de baudios es ≈ 1433 baudios.', V, '8600/6.'],
    ['El throughput es el número medio de bits por unidad de tiempo que el receptor acepta como válidos.', V, 'Velocidad efectiva.'],
    ['En comunicaciones digitales los símbolos son transportados por los bits.', F, 'Al revés: los bits viajan en símbolos (variaciones de voltaje); el símbolo es la unidad más corta de la señal.'],
    ['El ancho de banda es un recurso infinito.', F, 'Es finito y su demanda crece.'],
    ['Para señales analógicas, el ancho de banda se mide en bps.', F, 'En Hz; en bps se mide el “ancho de banda digital”.'],
  ]);
  cq('modos-transmision', [
    ['La transmisión paralela es más rápida en un factor N que la serie, pero más cara y limitada a distancias cortas.', V, 'N cables.'],
    ['La transmisión serie es más rápida que la paralela en un factor N.', F, 'Es la paralela.'],
    ['La transmisión síncrona se usa para grandes bloques de datos con tasas de bits muy altas.', V, 'Sin bits de arranque por carácter.'],
    ['En la asíncrona cada byte lleva dos bits de arranque y uno de parada.', F, 'Un bit de arranque y uno (o más) de parada.'],
    ['El costo de los dispositivos asíncronos es mayor que el de los síncronos.', F, 'Son más simples y baratos.'],
  ]);
  cq('codigos-bipolares', [
    ['La pseudoternaria es la alternativa de AMI: el 1 se codifica como 0 V y el 0 alternando +V y −V.', V, 'Es AMI con los papeles invertidos.'],
    ['Una desventaja de AMI son los problemas de sincronización con largas cadenas de ceros.', V, 'Por eso B8ZS y HDB3.'],
    ['B8ZS y HDB3 sustituyen largas secuencias de unos en AMI.', F, 'Sustituyen secuencias de <strong>ceros</strong>.'],
  ]);
  cq('codigos-linea', [['Una característica que NO deben cumplir los códigos de línea es la “transferencia” (independencia respecto de la secuencia de unos y ceros).', F, 'Sí la deben cumplir, igual que la autosincronización, la detección de errores y la inmunidad al ruido; el cuestionario la usa como distractor.']]);

  // ================= Unidad 8 =================
  const pcm = {
    nbits: ['En función del número de valores en la cuantificación se usan más o menos bits: con n bits por muestra se pueden representar 2ⁿ valores de tensión diferentes.', V, 'M = 2ⁿ.'],
    cuantCont: ['La cuantificación es el proceso, dentro de PCM, en el que se decide el número continuo de valores de tensión que se va a considerar para representar las muestras.', F, 'Se decide un número <strong>discreto</strong> (finito) de niveles: cuantificar es discretizar la amplitud.'],
    cuantDisc: ['La cuantificación es el proceso, dentro de PCM, en el que se decide el número discreto de valores de tensión que se va a considerar para representar las muestras analógicas tomadas.', V, 'M = 2ⁿ niveles.'],
    muestreo: ['El muestreo consiste en el proceso de conversión de señales continuas a señales discretas en el tiempo, midiendo la señal en momentos periódicos de tiempo T<sub>s</sub>.', V, 'fs = 1/T<sub>s</sub> ≥ 2 f<sub>máx</sub>.'],
    muestreoDig: ['El muestreo consiste en el proceso de conversión de señales digitales a señales discretas en el tiempo, midiendo la señal en momentos periódicos de tiempo T<sub>s</sub>.', F, 'Se muestrean señales <strong>continuas</strong> (analógicas), no digitales.'],
    stream: ['PCM es un procedimiento de modulación utilizado para transformar una señal analógica en una secuencia de bits conocida como trama o stream PCM.', V, 'Definición.'],
    error2n: ['Al cuantificar hay que hacer corresponder un valor analógico con uno de los 2ⁿ valores posibles, con un error de cuantificación menor cuanto mayor sea el número n de niveles y, por tanto, de bits por muestra.', V, 'Más bits, escalones más finos.'],
    errorN: ['Al cuantificar hay que hacer corresponder un valor analógico con uno de los n valores posibles, con un error de cuantificación menor cuanto mayor sea el número de niveles y de bits por muestra.', F, 'Los valores posibles son 2ⁿ, no n.'],
    pam: ['PCM es un sistema de transmisión mediante pulsos binarios codificados que se obtienen a partir de una señal PAM mediante un proceso de muestreo, cuantificación y codificación.', V, 'PAM → cuantificación → código binario.'],
    primero: ['Para convertir una señal analógica a PCM, el primer paso es muestrearla, obteniendo una señal discreta en el tiempo pero continua en su amplitud.', V, 'Eso es PAM; la amplitud se discretiza después, al cuantificar.'],
    primeroCuant: ['En PCM primero se cuantifica la señal usando PAM y luego se usa un código binario para designar cada nivel en cada tiempo de muestreo.', F, 'Primero se <strong>muestrea</strong> (PAM), después se cuantifica y se codifica.'],
    multinivel: ['PCM es un sistema de transmisión mediante pulsos multinivel que se obtienen de un código de una señal digital moduladora mediante cuantificación y codificación.', F, 'Los pulsos son <strong>binarios</strong> y la moduladora es <strong>analógica</strong>.'],
    discretizar: ['La señal original se compone de valores continuos en el tiempo; para discretizarla en el tiempo se divide en un grupo finito de magnitudes discretas entre un límite superior y uno inferior.', F, 'Dividir la amplitud en magnitudes discretas entre límites es <strong>cuantificar</strong> (discretizar la amplitud); en el tiempo se discretiza muestreando.'],
    proceso: ['PCM es un sistema que se obtiene a partir de una señal moduladora analógica variable en el tiempo, mediante muestreo, retención, cuantificación y codificación.', V, 'Las cuatro etapas.'],
  };
  const P = (...ks) => ks.map((k) => pcm[k]);
  vf('pcm', ['3p-t3#1'], 'V o F sobre PCM (3er parcial, tema 3)', 'Sobre las siguientes afirmaciones de la codificación PCM, indicar cuáles son VERDADERAS o FALSAS:', P('nbits', 'cuantCont', 'muestreo', 'stream', 'error2n'));
  vf('pcm', ['3p-t4#1'], 'V o F sobre PCM (3er parcial, tema 4)', 'Sobre las siguientes afirmaciones de la codificación PCM, indicar cuáles son VERDADERAS o FALSAS:', P('pam', 'errorN', 'primero', 'muestreoDig', 'cuantDisc'));
  vf('pcm', ['f-2019-07#5'], 'V o F sobre PCM (final 27/07/2019)', 'Sobre las siguientes afirmaciones del proceso de la codificación PCM, indicar cuáles son VERDADERAS o FALSAS:', P('error2n', 'primeroCuant', 'multinivel', 'primero', 'discretizar', 'proceso'));
  cq('pcm', [
    ['El proceso de cuantificación introduce necesariamente un error, el error de cuantificación.', V, 'Se reemplaza la amplitud real por un nivel aproximado.'],
    ['La velocidad de muestreo mínima de una señal es igual al doble de su frecuencia máxima.', V, 'Nyquist.'],
    ['El proceso por el que se obtiene la señal moduladora partiendo de la señal modulada es la demodulación.', V, 'Inversa de la modulación.'],
  ]);

  const qam8Fig = (tb, label) => { const vs = 1 / tb; return `<p><b>a)</b> En cada baudio la portadora toma una de <strong>2 amplitudes</strong> (1 V y 2 V) y una de <strong>4 fases</strong>: 8 estados → <strong>8-QAM</strong> (n = log₂8 = 3 bits por baudio).</p><p><b>b)</b> Tabla de verdad: cada combinación de 3 bits es un par amplitud/fase (por ejemplo, el bit más a la derecha elige la amplitud y los otros dos la fase, como en la tabla de la Unidad 8). La constelación son 4 puntos sobre un círculo de radio 1 y 4 sobre uno de radio 2, en las mismas 4 fases.</p><p><b>c)</b> ${label}: V<sub>s</sub> = 1/T<sub>s</sub> = 1/${tb >= 1e-3 ? `${num(tb * 1e3)} ms` : `${num(tb * 1e6)} µs`} = <strong>${num(vs / 1e3)} kbaudios</strong>. V<sub>t</sub> = V<sub>s</sub> × 3 = <strong>${num(3 * vs / 1e3)} kbps</strong>.</p>`; };
  add('modulacion-digital',
    { title: 'Diagrama temporal 8-QAM con baudios de 1 ms (finales 07/05 y 27/06/2019)', exam: ['f-2019-05#3', 'f-2019-06#5'], level: 2, prompt: '<p>El diagrama muestra 8 baudios de 1 ms con los grupos 000, 001, 010, 011, 100, 101, 110, 111; la portadora tiene picos de 1 V o de 2 V y distintas fases. a) Tipo de modulación. b) Constelación. c) Velocidad de señalización. d) Velocidad de transmisión.</p>', solution: { explain: qam8Fig(1e-3, 'Cada baudio dura 1 ms') } },
    { title: 'Diagrama temporal 8-QAM con baudios de 10 µs (3er parcial, tema 3)', exam: ['3p-t3#3'], level: 2, prompt: '<p>Diagrama temporal de una señal modulada: 8 baudios de 10 µs, con dos amplitudes y varias fases. a) Tipo de modulación. b) Tabla de verdad y constelación. c) Velocidades de señalización y de transmisión.</p>', solution: { explain: qam8Fig(10e-6, 'Cada baudio dura 10 µs') } },
    { title: 'Diagrama temporal 8-QAM con baudios de 1 µs (3er parcial 2025)', exam: ['3p-2025#2'], level: 2, prompt: '<p>Diagrama temporal de una señal modulada: 8 baudios de 1 µs, con dos amplitudes y varias fases. a) Tipo de modulación. b) Tabla de verdad y constelación. c) Velocidades de señalización y de transmisión.</p>', solution: { explain: `${qam8Fig(1e-6, 'Cada baudio dura 1 µs')}<p>Es la misma figura del cuestionario de la Unidad 8 (3 bits por baudio, 1 Mbaudio).</p>` } },
    { title: 'Constelaciones de dos y cuatro puntos (3er parcial, tema 3)', exam: ['3p-t3#2'], level: 1, prompt: '<p>Indicar el tipo de modulación y la tabla de verdad (amplitud/fase) para la secuencia 11000110: a) dos puntos en (0,0) y (2,0); b) cuatro puntos en (−2,−2), (−2,2), (2,−2) y (2,2).</p>',
      solution: { explain: `<p><b>a)</b> Un punto en el origen (portadora apagada) y otro con amplitud 2: <strong>ASK (OOK)</strong>, 1 bit por símbolo. 1 → A = 2, 0°; 0 → A = 0.</p>${table(['Bit', '1', '1', '0', '0', '0', '1', '1', '0'], [['Amplitud', '2', '2', '0', '0', '0', '2', '2', '0']])}<p><b>b)</b> Cuatro puntos de igual amplitud (2√2 ≈ 2,83) en 45°, 135°, 225° y 315°: <strong>QPSK</strong> (4-QAM), 2 bits por símbolo. Con código Gray: 11 → 45°, 01 → 135°, 00 → 225°, 10 → 315°.</p>${table(['Dibit', '11', '00', '01', '10'], [['Fase', '45°', '225°', '135°', '315°'], ['Punto', '(2, 2)', '(−2, −2)', '(−2, 2)', '(2, −2)']])}` } },
    { title: 'Constelaciones BPSK y QPSK (3er parcial, tema 4)', exam: ['3p-t4#2'], level: 1, prompt: '<p>Indicar el tipo de modulación y la tabla de verdad para 11000110: a) dos puntos en (2,0) y (−2,0); b) cuatro puntos en (0,2), (2,0), (0,−2) y (−2,0).</p>',
      solution: { explain: `<p><b>a)</b> Misma amplitud, fases 0° y 180°: <strong>BPSK</strong>. 1 → 0°, 0 → 180°.</p>${table(['Bit', '1', '1', '0', '0', '0', '1', '1', '0'], [['Fase', '0°', '0°', '180°', '180°', '180°', '0°', '0°', '180°']])}<p><b>b)</b> Misma amplitud (2), fases 0°, 90°, 180° y 270°: <strong>QPSK</strong>. Por ejemplo 00 → 0°, 01 → 90°, 11 → 180°, 10 → 270° (Gray).</p>${table(['Dibit', '11', '00', '01', '10'], [['Fase', '180°', '0°', '90°', '270°']])}` } },
    { title: 'Diagrama QPSK con fases ±45° y ±135° (3er parcial tema 4 y final 03/09/2019)', exam: ['3p-t4#3', 'f-2019-09#3'], level: 2, prompt: '<p>Un diagrama temporal muestra símbolos con fases +135°, −45°, +45°, −135°… para una secuencia de datos (1001110000 en el final; 001110010101 en el parcial). a) Tipo de modulación. b) Constelación. c) Duración de cada símbolo si la velocidad de transmisión es de 20 kbps (final) o 10 kbps (parcial).</p>',
      solution: { explain: `<p><b>a)</b> Amplitud constante y 4 fases distintas: <strong>QPSK</strong>, 2 bits por símbolo. En el final, 10 01 11 00 00 → +135°, −45°, +45°, −135°, −135°.</p>${table(['Dibit', '10', '01', '11', '00'], [['Fase (final 03/09/2019)', '+135°', '−45°', '+45°', '−135°']])}<p><b>b)</b> Cuatro puntos sobre un círculo, en ±45° y ±135°.</p><p><b>c)</b> T<sub>s</sub> = n/R: con 20 kbps, 2/20 000 = <strong>0,1 ms</strong>; con 10 kbps, 2/10 000 = <strong>0,2 ms</strong>.</p>` } },
    { title: 'Constelación 4-ASK y QPSK con T<sub>S</sub> = 1 ms (final 05/08/2019)', exam: ['f-2019-08#4'], level: 2, prompt: '<p>Constelación 1: cuatro puntos sobre el eje real (00, 10, 01, 11). Constelación 2: cuatro puntos en cruz (10 a 0°, 01 a 90°, 11 a 180°, 00 a 270°). a) Tipo de modulación. b) Diagrama temporal para 101101011100. c) R si T<sub>S</sub> = 1 ms.</p>',
      solution: { explain: `<p><b>a)</b> 1: cuatro amplitudes sobre el mismo eje → <strong>4-ASK</strong> (4-PAM). 2: misma amplitud y cuatro fases → <strong>QPSK</strong>.</p><p><b>b)</b> Dibits 10 11 01 01 11 00: en 4-ASK, seis símbolos con las amplitudes de cada punto; en QPSK, fases 0°, 180°, 90°, 90°, 180°, 270°.</p><p><b>c)</b> En los dos casos 2 bits por símbolo: R = 2/1 ms = <strong>2 kbps</strong> (1 kbaudio).</p>` } },
    { title: 'PSK con 1 ms contra 8QAM con 2 ms (final 27/07/2019)', exam: ['f-2019-07#4'], level: 2, prompt: '<p>Alternativa 1: PSK con T<sub>S</sub> = 1 ms. Alternativa 2: 8QAM con T<sub>S</sub> = 2 ms. a) ¿Cuál logra mayor R en kbps? b) Compare los anchos de banda y las ventajas.</p>',
      solution: { explain: '<p><b>a)</b> PSK binaria: 1 bit/1 ms = <strong>1 kbps</strong>. 8QAM: 3 bits/2 ms = <strong>1,5 kbps</strong>. Gana 8QAM.</p><p><b>b)</b> El ancho de banda depende de la tasa de símbolos: PSK ≈ 1/T<sub>S</sub> = 1 kHz; 8QAM ≈ 500 Hz. 8QAM manda más bits con la mitad del ancho de banda (más eficiencia espectral), pero sus puntos están más juntos y mezcla amplitudes: necesita más SNR. BPSK es más robusta al ruido.</p>' } },
    { title: 'NRZ de 100 µs modulada en 8QAM (3er parcial 2025)', exam: ['3p-2025#3'], level: 2, prompt: '<p>Se transmite una señal NRZ con tiempo de bit de 100 µs y luego se modula en 8QAM. a) Ancho de banda de la señal de banda base. b) Ancho de banda de la señal modulada. c) Constelación. d) Tabla de verdad.</p>',
      solution: { explain: `<p>R = 1/100 µs = 10 kbps.</p><p><b>a)</b> NRZ: la peor secuencia (1010…) es una cuadrada de período 2T<sub>b</sub>; su fundamental es R/2: <strong>B ≈ 5 kHz</strong> (mínimo de Nyquist; si se toma el primer cero del espectro, B = R = 10 kHz).</p><p><b>b)</b> 8QAM: 3 bits por baudio → r = 10 000/3 = ${num(1e4 / 3, 0)} baudios. El ancho de banda de la señal modulada es ≈ r: <strong>≈ 3,33 kHz</strong> (con el mismo criterio de Nyquist, r/2 a cada lado de la portadora).</p><p><b>c) y d)</b> 8 estados: 2 amplitudes × 4 fases. Tabla de la cátedra: 000 → 0,765 a −135°; 001 → 1,848 a −135°; 010 → 0,765 a −45°; 011 → 1,848 a −45°; 100 → 0,765 a 135°; 101 → 1,848 a 135°; 110 → 0,765 a 45°; 111 → 1,848 a 45°.</p>` } },
  );
  cq('modulacion-digital', [
    ['Con 8 puntos en (−1,0), (−2,0), (0,−1), (0,−2), (0,1), (0,2), (1,0) y (2,0) la modulación es 8-QAM.', V, '2 amplitudes × 4 fases.'],
    ['Si una señal 4ASK tiene un tiempo de símbolo de 1 ms, su tasa de datos es 2000 bps.', V, '2 bits/1 ms.'],
    ['Si una QPSK transmite a 20 kbps, cada símbolo dura 0,1 ms.', V, 'T<sub>s</sub> = 2/20 000.'],
    ['Si una 16QAM transmite a 16 kbps, cada símbolo dura 0,25 ms.', V, '4 bits por símbolo → 4000 baudios.'],
    ['La señal moduladora es la que contiene la información.', V, 'La portadora solo la transporta.'],
  ]);

  add('multiplexacion',
    { title: 'TDM de 4 canales de 2 kbps con 1 bit de sincronismo (finales 2019)', exam: ['f-2019-02#4', 'f-2019-07#3', 'f-2019-09#5'], level: 2, prompt: '<p>TDM sincrónica de 4 canales; cada fuente genera 2 kbps. Las transmisiones se entrelazan a nivel de carácter (bytes) y se usa un único bit por trama para el sincronismo. ¿Qué capacidad necesita el enlace compartido? Justificar. (Opciones según el final: 6000, 6250, 8000, 8150, 8250, 8350 o 8750 bps.)</p>',
      solution: { explain: `${tdmHtml(4, 2000, 8, 1, 'un byte')}<p>Respuesta: <strong>8250 bps</strong>. 8000 bps olvida el sincronismo.</p>` } },
    { title: 'TDM de 5 canales de 20 kbps con 1 byte de sincronismo (3er parcial, tema 3)', exam: ['3p-t3#4'], level: 2, prompt: '<p>TDM síncrona de 5 canales; cada fuente genera 20 kbps. Entrelazado a nivel de bit y un byte por trama para el sincronismo. ¿Qué capacidad necesita el enlace?</p>', solution: { explain: tdmHtml(5, 20000, 1, 8, 'un bit') } },
    { title: 'TDM de 10 canales de 10 kbps con 1 byte de sincronismo (3er parcial 2025)', exam: ['3p-2025#4'], level: 2, prompt: '<p>TDM síncrona de 10 canales; cada fuente genera 10 kbps. Entrelazado a nivel de bit y un byte por trama para el sincronismo. ¿Qué capacidad necesita el enlace?</p>', solution: { explain: `${tdmHtml(10, 10000, 1, 8, 'un bit')}<p>Es la respuesta “180 Kbps” del cuestionario de la Unidad 8.</p>` } },
    { title: 'TDM de 10 canales entrelazados por carácter (3er parcial, tema 4)', exam: ['3p-t4#4'], level: 2, prompt: '<p>TDM sincrónica de 10 canales, entrelazados a nivel de carácter (bytes), con sincronismo por trama. ¿Qué capacidad necesita el enlace compartido? (La tasa de cada fuente no se lee en la foto: se resuelve con 10 kbps y 1 bit de sincronismo como ejemplo.)</p>',
      solution: { explain: `${tdmHtml(10, 10000, 8, 1, 'un byte')}<p>Método general: trama = N·8 + s bits; tramas/s = R<sub>fuente</sub>/8; R = trama × tramas/s. Con un byte de sincronismo en lugar de un bit: 88 bits × 1250 = 110 kbps.</p>` } },
    { title: 'TDM de 8 fuentes con 4 bits por fuente (final 05/08/2019)', exam: ['f-2019-08#5'], level: 2, prompt: '<p>TDM síncrono para 8 fuentes de 10 kbps. Cada trama lleva 4 bits de cada fuente más un byte de sincronización. a) Bits por trama. b) Tasa a la salida. c) Tasa pura de datos. d) Duración de la trama.</p>',
      solution: { explain: (() => { const t = tdm(8, 10000, 4, 8); return `<p><b>a)</b> 8 × 4 + 8 = <strong>${t.bits} bits</strong>.</p><p><b>b)</b> Tramas/s = 10 000/4 = ${num(t.fps)} → R = ${t.bits} × ${num(t.fps)} = <strong>${num(t.R / 1e3)} kbps</strong>.</p><p><b>c)</b> Datos puros: 8 × 10 = <strong>80 kbps</strong> (eficiencia 80 %).</p><p><b>d)</b> T = 1/${num(t.fps)} = <strong>${num(t.Tf * 1e3, 1)} ms</strong>.</p>`; })() } },
  );
  cq('multiplexacion', [
    ['Un multiplexor que combina 14 canales de 5 kbps con ranuras de 2 bits y sin sincronismo necesita 70 kbps.', V, '14 × 5 kbps.'],
    ['Con 6 canales de 108 bps, unidad de 1 byte y 1 byte de sincronismo, la trama tiene 56 bits.', V, '(6 + 1) × 8.'],
  ]);

  // ================= Unidad 9 =================
  vf('modem-xdsl', ['3p-t3#5'], 'V o F sobre MODEM, ADSL y WiFi (3er parcial, tema 3)', 'Respecto de las tecnologías de los MODEM, ¿cuál de las siguientes afirmaciones es VERDADERA o FALSA?', [
    ['ADSL utiliza TDM para voz y datos y transmisión FDX en frecuencia.', F, 'Voz y datos se multiplexan en <strong>frecuencia</strong>.'],
    ['El filtro “splitter” de ADSL multiplexa el canal de voz ascendente y descendente.', F, 'El splitter <strong>separa</strong> la voz de los datos; no multiplexa.'],
    ['El módem ADSL clásico opera en un margen frecuencial de hasta 1,1 MHz.', V, 'Hasta 1104 kHz.'],
    ['En DMT los tiempos están espaciados en forma constante y para cada portadora se mide la SNR para determinar el máximo QAM posible.', F, 'Lo que está espaciado en forma constante son las <strong>frecuencias</strong> de las subportadoras, no los tiempos.'],
    ['En WiFi hay límites sobre la potencia que se puede radiar y los protocolos que se pueden usar, con el fin de garantizar el uso común de esas frecuencias del espectro radioeléctrico.', V, 'Bandas ISM de uso libre pero regulado.'],
  ]);
  vf('modem-xdsl', ['3p-t4#5'], 'V o F sobre MODEM, ADSL y DSLAM (3er parcial, tema 4)', 'Respecto de las tecnologías de los MODEM, ¿cuál de las siguientes afirmaciones es VERDADERA o FALSA?', [
    ['ADSL utiliza TDM para voz y datos y transmisión FDX en tiempo.', F, 'FDM para voz y datos, dúplex en frecuencia.'],
    ['El filtro “splitter” de ADSL separa los canales de datos ascendente y descendente de la voz.', V, 'Filtros pasabajos y pasaaltos.'],
    ['El módem ADSL clásico proporciona acceso de banda ancha sobre pares telefónicos.', V, 'Sobre el par de cobre telefónico, no sobre coaxil ni fibra (cuestionario de la Unidad 9). En la foto del parcial aparece marcada F; por teoría es verdadera.'],
    ['DSLAM es un multiplexor localizado en la central telefónica que proporciona acceso a los servicios xDSL.', V, 'DSL Access Multiplexer.'],
    ['La tecnología WiFi pertenece a las redes conocidas como Wireless Personal Area Networks.', F, 'WiFi (IEEE 802.11) es una <strong>WLAN</strong>; las WPAN son Bluetooth o ZigBee (IEEE 802.15). En la foto del parcial aparece marcada V; por teoría es falsa.'],
  ]);
  vf('modem-xdsl', ['f-2019-05#4'], 'V o F sobre ADSL (final 07/05/2019)', 'Respecto de las tecnologías ADSL, ¿cuál de las siguientes afirmaciones es VERDADERA o FALSA?', [
    ['ADSL utiliza multiplexación de voz/datos en frecuencia y transmisión dúplex en tiempo.', F, 'Dúplex en frecuencia.'],
    ['El módem ADSL clásico opera en el margen frecuencial hasta 4 kHz.', F, 'Esa es la banda vocal.'],
    ['ADSL utiliza multiplexación de voz/datos en tiempo y transmisión dúplex en frecuencia.', F, 'Voz/datos en frecuencia.'],
    ['El módem ADSL clásico opera en el margen frecuencial de 24 kHz a 1104 kHz.', V, '≈ 25 kHz a 1104 kHz.'],
    ['El filtro “splitter” de ADSL solo opera en el margen frecuencial de la banda vocal.', F, 'Separa la banda vocal de la de datos: opera sobre todo el espectro.'],
    ['ADSL utiliza multiplexación de voz/datos en frecuencia y transmisión dúplex en frecuencia.', V, 'La correcta.'],
    ['El filtro “splitter” de ADSL multiplexa el canal de datos ascendente y descendente.', F, 'Separa voz de datos.'],
    ['El módem ADSL clásico opera en el margen frecuencial hasta 1104 kHz.', V, 'Límite superior de ADSL.'],
    ['ADSL utiliza multiplexación de voz/datos en tiempo y transmisión dúplex en tiempo.', F, 'Todo es en frecuencia.'],
    ['El módem ADSL clásico opera en el margen frecuencial de la banda vocal.', F, 'Esa banda queda para el teléfono.'],
  ]);
  add('modem-xdsl', { title: 'Descargar 2 MB con MODEM 56K y con ADSL 1M (3er parcial 2025)', exam: ['3p-2025#5'], level: 1, prompt: '<p>Un archivo contiene 2 MB. ¿Cuánto tarda en descargarse por un canal de 56 kbps (MODEM 56K)? ¿Y por uno de 1 Mbps (ADSL 1M)?</p>',
    solution: { explain: '<p>2 MB = 2 × 10⁶ bytes × 8 = 16 × 10⁶ bits.</p><p>MODEM 56K: t = 16×10⁶ / 56×10³ = <strong>285,7 s ≈ 4 min 46 s</strong>.</p><p>ADSL 1M: t = 16×10⁶ / 10⁶ = <strong>16 s</strong>.</p><p>Si se toma 1 MB = 2²⁰ bytes, son 16,78 Mbit: 299,6 s y 16,8 s. ADSL es ≈ 18 veces más rápido porque usa el espectro del par hasta 1,1 MHz y no solo la banda vocal.</p>' } });
})();
