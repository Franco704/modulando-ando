/* Cierre del 3er parcial (Unidades 7, 8 y 9): el resumen de la cátedra convertido en lección, con los laboratorios
   para practicar cada tipo de ejercicio. Fuente: NUEVO/Resumen_3er_Parcial_Comunicaciones.pdf y las resoluciones detalladas.
   Además, el ejercicio de la trama E1 de los apuntes, en la lección de jerarquías. */
(() => {
  const { LESSONS, h, cx: X, labUtil: U } = window.GUIDE;
  const { note, table, eq, lab, num, fig, dev } = h;
  const mono = (s) => `<span class="mono">${s}</span>`;
  const tbl = (k, cap, circles) => `<figure class="ct"><div class="fig-c">${U.constPlane(Object.entries(X.MODS[k].map).map(([b, p]) => ({ i: p.i, q: p.q, label: b })), { size: 190, circles })}</div><figcaption>${cap}</figcaption></figure>`;

  LESSONS.push({
    id: 'tercer-parcial',
    module: 'u8',
    video: false,
    title: 'Cómo resolver el tercer parcial',
    keywords: 'tercer parcial resumen método velocidad de transmisión velocidad de modulación baudios constelación tabla de verdad diagrama de tiempo TDM trama sincronismo NRZ ancho de banda M-aria descarga verdadero falso',
    tldr: 'El tercer parcial se arma con <strong>seis tipos de ejercicio</strong> que se repiten en todos los temas: V o F de teoría, NRZ + modulación, constelación dada, diagrama de tiempo, TDM sincrónica y tiempo de descarga. Todos salen de <strong>R = r · log₂M</strong>, de reconocer qué cambia en la portadora y de tres cuentas para la trama.',
    goals: ['Distinguir R (bps) de r (baudios) y pasar de una a la otra.', 'Reconocer ASK, FSK, PSK y QAM en una constelación o en un diagrama de tiempo.', 'Armar la tabla de verdad con la asignación de bits de la cátedra.', 'Resolver cualquier TDM sincrónica con tres cuentas.', 'Juzgar un V o F partiendo la frase en partes.'],
    body: `
      <h2>Qué toman</h2>
      ${table(['Tipo de ejercicio', 'Aparece en', 'Qué hay que saber', 'Practicalo en'], [
        ['V o F de teoría', 'los tres temas', 'Códigos de línea, tipos de transmisión, modulaciones, PCM, módems', '<a href="#s-vf">el método por partes</a>'],
        ['NRZ + modulación (8PSK, 8QAM)', 'temas 1 y 2', 'Pasar T<sub>b</sub> a R, anchos de banda, constelación, tabla', '<a href="#s-nrz">de NRZ a M-aria</a>'],
        ['Constelación dada', 'temas 1 y 3', 'Reconocer la modulación, tabla de verdad, baudios', '<a href="#s-leer">leer una constelación</a>'],
        ['Diagrama de tiempo', 'los tres temas', 'Reconocer la modulación, constelación, velocidades', '<a href="#s-diag">¿qué modulación es?</a>'],
        ['TDM sincrónica', 'los tres temas', 'Bits de la trama, duración y tasa del enlace', '<a href="#s-tdm">la trama</a>'],
        ['Tiempo de descarga', 'tema 2', 't = tamaño / R', '<a href="#s-r">bits y símbolos</a>'],
      ])}
      <p>Los cinco ejercicios de cada tema están resueltos paso a paso en <a href="#/parciales">Parciales resueltos</a> y en las lecciones de cada unidad.</p>

      <h2 id="s-r">Bits, símbolos y velocidades</h2>
      <p>Los <strong>bits</strong> son la información; los <strong>símbolos</strong> son lo que viaja por la línea (un nivel de tensión o un tramo de portadora). “Los bits son transportados y los símbolos son los portadores.”</p>
      ${table(['Letra', 'Nombre', 'Qué cuenta', 'Unidad'], [
        ['R', 'Velocidad de transmisión (tasa de bits)', 'Bits por segundo', 'bps'],
        ['r', 'Velocidad de modulación o de señalización', 'Símbolos por segundo', 'baudios'],
        ['M', 'Cantidad de símbolos distintos', 'Los puntos de la constelación', '—'],
        ['n', 'Bits por símbolo', 'n = log₂M', 'bits'],
        ['T<sub>b</sub>, T<sub>s</sub>', 'Tiempos de bit y de símbolo', 'T<sub>s</sub> = n · T<sub>b</sub>', 's'],
        ['B', 'Ancho de banda', 'Rango de frecuencias que ocupa la señal', 'Hz'],
      ])}
      ${eq('R = 1/T<sub>b</sub> &nbsp; r = 1/T<sub>s</sub> &nbsp; R = r · log₂M', 'Las tres que resuelven casi todo')}
      ${note('Con el tiempo de <strong>bit</strong> se calcula R (mayúscula); con el de <strong>símbolo</strong>, r (minúscula). En 8-PSK con T<sub>b</sub> = 100 µs: R = 10 000 bps; cada símbolo lleva 3 bits y dura 300 µs, r = 3333,3 baudios. Control: 3333,3 × 3 = 10 000.', 'exam')}
      <p>Ejemplo: un canal de 1200 baudios da 1200 bps con M = 2, 2400 con M = 4, 3600 con M = 8 y 4800 con M = 16. Los baudios no cambian: sube la cantidad de niveles. El costo es que los símbolos quedan más parecidos y el ruido produce más errores.</p>
      ${table(['Fórmula', 'Qué da'], [
        ['B = 1/T<sub>b</sub>', 'Ancho de banda de la señal NRZ en banda base'],
        ['B<sub>M-ario</sub> = R / log₂M', 'Ancho de banda de la señal modulada M-aria (igual a los baudios)'],
        ['R = f<sub>s</sub> · n, con f<sub>s</sub> ≥ 2 f<sub>máx</sub>', 'Velocidad de una señal PCM'],
        ['tasa = bits de la trama / duración de la trama', 'Capacidad de un enlace TDM'],
        ['t = tamaño / R', 'Tiempo para transmitir un archivo (tamaño en bits; 1 byte = 8 bits)'],
      ])}

      <h2 id="s-leer">Reconocer la modulación</h2>
      ${table(['Si me dan…', 'Miro…', 'Conclusión'], [
        ['Una constelación', 'Cuántos puntos hay', 'Eso es M, y n = log₂M'],
        ['', 'Todos a la misma distancia del centro', 'PSK (2: BPSK; 4: QPSK; 8: 8-PSK)'],
        ['', 'Distintas distancias y ángulos', 'QAM (sobre una sola recta: ASK)'],
        ['Un diagrama de tiempo', 'Cambia la altura de la onda', 'ASK'],
        ['', 'Cambia lo apretado de los ciclos', 'FSK'],
        ['', 'Altura constante, la onda salta entre símbolos', 'PSK'],
        ['', 'Cambian la altura y la fase', 'QAM'],
      ])}
      <p>Para pasar un punto (I, Q) a amplitud y fase: A = √(I² + Q²) y θ = arctg(Q/I), ubicado en su cuadrante (2.º: 180° − α; 3.º: 180° + α; 4.º: 360° − α). Si el punto cae sobre un eje, la fase se lee del dibujo.</p>
      ${lab(0)}
      <h3>Las tablas de verdad de la cátedra</h3>
      <p>Si el dibujo no trae los bits, se usan estas (diapositivas de la Unidad 8). Si los trae, mandan los del dibujo.</p>
      <div class="ct-grid">
        ${tbl('bpskC', 'BPSK: 0 → 0°, 1 → 180°', [1])}
        ${tbl('psk4', '4-PSK: 00 → 0°, 01 → 90°, 10 → 180°, 11 → 270°', [1])}
        ${tbl('qpsk', 'QPSK: 00 → 135°, 01 → 225°, 10 → 45°, 11 → 315°', [1])}
        ${tbl('psk8C', '8-PSK: orden binario cada 45° (101 = 5 → 225°)', [1])}
        ${tbl('qam8C', '8-QAM: los dos primeros bits dan la fase y el último la amplitud', [0.5, 1])}
      </div>
      <h3 id="s-diag">Leer un diagrama de tiempo</h3>
      <p>Compará cada tramo con el siguiente en las líneas punteadas. Con referencia seno, la fase se ve en dónde arranca la onda: 0° en cero subiendo, 90° arriba, 180° en cero bajando, 270° abajo.</p>
      ${lab(1)}

      <h2 id="s-nrz">De NRZ a una modulación M-aria</h2>
      <p>Es una cadena: los bits se vuelven pulsos NRZ (banda base, B = 1/T<sub>b</sub>) y después el modulador los agrupa de a n = log₂M y los monta en la portadora (B<sub>M-ario</sub> = R / log₂M). Al modular en 8-PSK u 8-QAM el ancho de banda baja tres veces.</p>
      ${lab(2)}
      ${note('En los dibujos de espectro de la cátedra la señal modulada ocupa 2B alrededor de la portadora. Si en clase calcularon así el ancho modulado, multiplicá por 2 y escribí qué fórmula usaste.', 'warn')}

      <h2>PCM en tres pasos</h2>
      ${table(['Paso', 'Qué entra', 'Qué hace', 'Qué sale'], [
        ['1. Muestreo', 'Señal analógica', 'Mide la señal cada T segundos (f<sub>s</sub> ≥ 2 f<sub>máx</sub>)', 'Señal PAM: discreta en el tiempo, continua en amplitud'],
        ['2. Cuantificación', 'Las muestras', 'Redondea cada una a uno de los M niveles (un número <strong>finito</strong>)', 'Discreta en tiempo y amplitud, con error de cuantificación'],
        ['3. Codificación', 'Los niveles', 'Escribe cada nivel con n bits (M = 2ⁿ)', 'Pulsos binarios'],
      ])}
      <p>Telefonía: f<sub>máx</sub> = 4 kHz → f<sub>s</sub> = 8000 muestras/s; con 8 bits, R = 64 kbps. Las trampas del V o F: el muestreo parte de señales <strong>analógicas</strong> (no digitales) y la cuantificación usa un número <strong>discreto</strong> de niveles (no continuo).</p>

      <h2 id="s-tdm">TDM sincrónica: tres cuentas</h2>
      <p>Cada canal tiene su ranura fija en todas las tramas, tenga o no datos. En cada ranura va una unidad (1 bit u 1 byte) y al principio de la trama, el sincronismo.</p>
      ${table(['Paso', 'Fórmula'], [['a) Bits de la trama', 'N × bits de la unidad + bits de sincronismo'], ['b) Duración de la trama', 'bits de la unidad / velocidad de un canal'], ['c) Tasa del enlace', 'bits de la trama / duración']])}
      ${lab(3)}
      ${table(['Caso', 'Trama', 'Duración', 'Tasa'], [[10, 8, 1], [10, 1, 8], [5, 1, 8, 20e3], [4, 8, 1, 2e3]].map(([n, u, s, r = 10e3]) => { const t = X.tdm(n, r, u, s); return [`${n} canales de ${num(r / 1e3)} kbps, ${u === 8 ? 'byte' : 'bit'}, sincronismo de ${s === 8 ? '1 byte' : '1 bit'}`, `${t.bits} bits`, t.Tf >= 1e-3 ? `${num(t.Tf * 1e3)} ms` : `${num(t.Tf * 1e6)} µs`, `${num(t.R / 1e3, 3)} kbps`]; }))}

      <h2 id="s-vf">V o F: partir la frase</h2>
      <p>Casi todas dicen “pasa esto, y por eso pasa aquello”. Se separa en partes, se revisa cada una y, si una sola es falsa, toda la frase es falsa. Atención a los absolutos (“la más”, “el triple”, “a la mitad”) y a las frases que se contradicen solas.</p>
      ${lab(4)}
    `,
    labs: [
      { type: 'constlector', title: 'Leé una constelación', intro: 'Cargá una constelación de los parciales o armá la tuya tocando la grilla. Después transmití la secuencia y mirá qué punto usa cada símbolo.', preset: 't1e3' },
      { type: 'diagrama', title: '¿Qué modulación es?', intro: 'Un diagrama de tiempo al azar, como en el parcial. Respondé qué cambia y cuántos símbolos hay; después se calculan r y T<sub>s</sub>.' },
      { type: 'nrzmod', title: 'De NRZ a la portadora', intro: 'El ejercicio 2 de los temas 1 y 2. Mové T<sub>b</sub> y M: mirá cómo se angosta el espectro al agrupar bits.', tb: 100, M: 8 },
      { type: 'tdm', title: 'La trama, tema por tema', intro: 'Cargá el caso de cada tema y mirá cuánto pesa el sincronismo cuando se entrelaza a nivel de bit.', n: 10, r: 10, b: 8, s: 1 },
      { type: 'vfpartes', title: 'V o F por partes', intro: 'Marcá cada parte como verdadera o falsa. La frase solo es verdadera si todas sus partes lo son.', items: [
        { parts: [['4B/5B mapea 4 bits de datos en 5 símbolos: su eficiencia es del 80 %.', true, '4 de cada 5 bits enviados son datos.'], ['Por eso necesita menos ancho de banda que NRZ.', false, 'Manda más bits por la línea: necesita más ancho de banda, no menos.']] },
        { parts: [['Manchester tiene una tasa de baudios del doble que NRZ.', true, 'Dos cambios por bit.'], ['Por eso requiere el triple de ancho de banda.', false, 'El doble de baudios da el doble de ancho de banda.']] },
        { parts: [['En M-PSK, al aumentar M aumentan los bits por símbolo.', true, 'n = log₂M.'], ['Eso mejora la eficiencia espectral.', true, 'Más bits con los mismos baudios.'], ['Pero requiere mayor SNR.', true, 'Los puntos quedan más juntos.']] },
        { parts: [['Si el ruido se duplica, la SNR se reduce a la mitad.', true, 'S/N con N doble.'], ['Entonces la capacidad de Shannon se reduce a la mitad.', false, 'La SNR está dentro de un logaritmo: con SNR = 1000 → 500, C baja de 9,97·B a 8,97·B (un 10 %).']] },
        { parts: [['En la asíncrona cada carácter lleva 7 bits + paridad + inicio + parada = 10 bits.', true, 'Es el formato típico.'], ['No requiere reloj porque usa los bits de paridad para sincronizar.', false, 'Sincronizan los bits de inicio y parada; la paridad detecta errores.']] },
        { parts: [['ADSL transmite voz y datos en dúplex.', true, 'Subida y bajada a la vez.'], ['Lo hace repartiendo el tiempo (TDM).', false, 'Separa por frecuencia (FDM): voz 0–4 kHz, subida 26–108 kHz, bajada 138–1104 kHz.']] },
      ] },
    ],
    quiz: [
      { q: 'Una señal QPSK transmite a 10 kbps. ¿Cuánto dura cada símbolo?', o: ['100 µs', '200 µs', '50 µs', '400 µs'], a: 1, e: 'r = R / log₂4 = 5000 baudios → T<sub>s</sub> = 1/5000 = 200 µs (dos tiempos de bit).' },
      { q: 'Una constelación tiene 8 puntos en dos circunferencias, sobre los ejes. ¿Qué modulación es?', o: ['8-PSK', '8-QAM', '8-ASK', 'FSK'], a: 1, e: 'Distintas distancias y ángulos: QAM, con 2 amplitudes × 4 fases.' },
      { q: 'En un diagrama de tiempo la amplitud y la cantidad de ciclos no cambian, pero la onda salta al cambiar de símbolo. ¿Qué modulación es?', o: ['ASK', 'FSK', 'PSK', 'QAM'], a: 2, e: 'Solo cambia la fase.' },
      { q: 'Con la tabla 8-PSK de la cátedra, ¿qué fase lleva el tribit 110?', o: ['135°', '225°', '270°', '315°'], a: 2, e: '110 = 6, y 6 × 45° = 270°.' },
      { q: 'En TDM sincrónica, ¿por qué entrelazar a nivel de bit con un byte de sincronismo da una tasa mucho mayor que a nivel de carácter con un bit?', o: ['Porque los bits viajan más rápido', 'Porque salen muchas más tramas por segundo y cada una lleva su sincronismo', 'Porque la trama tiene más canales', 'Porque cambia la velocidad de cada fuente'], a: 1, e: 'Con unidad de 1 bit, la trama sale cada 1/r segundos: con 10 kbps son 10 000 tramas/s, cada una con 8 bits de sincronismo (80 kbps solo de sincronismo).' },
      { q: 'Un archivo de 2 MB (megabytes) se descarga a 1 Mbps. ¿Cuánto tarda?', o: ['2 s', '16 s', '0,25 s', '8 s'], a: 1, e: '2 MB × 8 = 16 Mb; 16 Mb / 1 Mbps = 16 s. Con 2 Mb (megabits) serían 2 s.' },
    ],
    open: [
      { t: 'num', q: 'TDM sincrónica de 10 canales de 10 kbps, entrelazado de carácter y 1 bit de sincronismo por trama. ¿Capacidad del enlace?', a: 101.25, u: 'kbps', e: '<p>Trama = 10 × 8 + 1 = 81 bits; duración = 8/10 000 = 0,8 ms; tasa = 81 / 0,8 ms = 101,25 kbps.</p>' },
      { t: 'num', q: 'Igual, pero entrelazado de bit y 1 byte de sincronismo por trama. ¿Capacidad del enlace?', a: 180, u: 'kbps', e: '<p>Trama = 10 × 1 + 8 = 18 bits; duración = 1/10 000 = 0,1 ms; tasa = 18 / 0,1 ms = 180 kbps.</p>' },
      { t: 'num', q: 'Señal NRZ con T<sub>b</sub> = 100 µs modulada en 8-PSK. Ancho de banda de la señal modulada con la fórmula de las M-arias.', a: 3.333, u: 'kHz', tol: 0.01, e: '<p>R = 10 kbps; B<sub>M-ario</sub> = R / log₂8 = 10 000 / 3 ≈ 3,33 kHz.</p>' },
      { t: 'num', q: 'Una QPSK transmite a 80 kbps. ¿Velocidad de símbolos?', a: 40, u: 'kbaud', e: '<p>r = R / log₂4 = 80 / 2 = 40 kBaudios.</p>' },
      { t: 'num', q: '¿Cuánto tarda en descargarse un archivo de 2 Mb por un módem de 56 kbps?', a: 35.71, u: 's', tol: 0.01, e: '<p>t = 2 000 000 / 56 000 = 35,71 s.</p>' },
      { t: 'text', q: '¿Por qué la cuantificación es el paso donde aparece el error en PCM?', k: [['redonde', 'aproxim', 'nivel mas cercano', 'niveles'], ['finito', 'discreto', 'numero limitado'], ['error de cuantificacion', 'diferencia', 'error']], e: '<p>Porque cada muestra, que puede valer cualquier cosa, se redondea al nivel permitido más cercano de un conjunto <strong>finito</strong> (M = 2ⁿ). La diferencia es el error de cuantificación, menor cuantos más niveles (más bits por muestra).</p>' },
    ],
  });

  // Ejercicio de la trama E1 (apuntes del 3er parcial)
  const jer = LESSONS.find((l) => l.id === 'jerarquias');
  jer.exercises = [...(jer.exercises || []), { title: 'Completar el cuadro de la trama E1', level: 1,
    prompt: '<p>Dada la estructura de las tramas del nivel E1 de la jerarquía PDH para transmitir canales de voz (32 ranuras de 1 byte en 125 µs: canal 0, canales 1 a 15, canal 16, canales 17 a 31), completar considerando canales estándar PCM de 64 kbps: a) duración de cada canal (time slot); b) máximo número de comunicaciones simultáneas de voz; c) carga útil de datos por trama; d) bits extra para señalización y sincronismo.</p>',
    hints: ['La trama dura lo mismo que un período de muestreo de la voz: 1/8000 s.', 'Los canales 0 y 16 no llevan voz.'],
    solution: { explain: dev({
      datos: ['Trama E1: 32 ranuras de 8 bits = 256 bits', 'Duración de la trama: 125 µs (8000 tramas/s)', 'Canal de voz PCM: 64 kbps = 8 bits × 8000'],
      piden: ['a) Time slot', 'b) Comunicaciones de voz', 'c) Carga útil por trama', 'd) Bits de señalización y sincronismo'],
      partes: [{ pasos: [
        ['Duración de cada canal', 'La trama se reparte en 32 ranuras iguales: 125 µs / 32 = <strong>3,906 µs</strong>.'],
        ['Comunicaciones simultáneas', 'El canal 0 lleva el sincronismo (alineación de trama) y el 16 la señalización: quedan <strong>30 canales de voz</strong>.'],
        ['Carga útil', '30 canales × 8 bits = <strong>240 bits</strong> por trama (30 × 64 kbps = 1,92 Mbps de voz).'],
        ['Bits extra', '2 ranuras × 8 bits = <strong>16 bits</strong> por trama (128 kbps). Control: 240 + 16 = 256 bits × 8000 = 2,048 Mbps.'],
      ] }],
      parcial: `a) 125 µs / 32 = 3,906 µs. b) 30 canales de voz (32 − sincronismo − señalización). c) 30 × 8 = 240 bits. d) 2 × 8 = 16 bits. Total ${mono('256 bits × 8000 = 2,048 Mbps')}.`,
    }) } }];
})();
