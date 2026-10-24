/* Unidad 7 (3er parcial): técnicas de transmisión de la información. Guía "7.0 Unidad 7 Técnicas de transmisión de la información 2026" y apuntes 7.1 a 7.6.
   TP 7: bits y baudios, overhead asincrónico/sincrónico y códigos de línea (NRZ, NRZ-I, RZ, Manchester, Manchester diferencial, AMI, B8ZS, HDB3).
   Las formas de onda se generan con cx.lineCode (convenciones del enunciado del TP; ver los comentarios de cx.js). */
(() => {
  const { LESSONS, h, cx: X } = window.GUIDE;
  const { note, def, table, eq, frac, lab, num } = h;
  const BITS = '10000000011100001';
  const sym = (hv) => hv.map(([a, b]) => { const c = (l) => (l > 0 ? '+' : l < 0 ? '−' : '0'); return a === b ? c(a) : c(a) + c(b); }).join(' ');
  const row = (k) => sym(X.lineCode(BITS, k));
  const asyncBits = 50000 * 11, syncBits = 50 * (8000 + 64);

  LESSONS.push(
    {
      id: 'bits-baudios',
      module: 'u7',
      title: 'Bits, símbolos y baudios',
      keywords: 'transmisión analógica digital banda base modulación bit símbolo elemento de señal elemento de datos tasa de bits tasa de símbolos baudio R = r log2 N throughput velocidad efectiva ancho de banda digital',
      tldr: 'Los datos son digitales; se transmiten como señal digital (<strong>codificación de línea</strong>, banda base) o analógica (<strong>modulación</strong>). Los <strong>bits</strong> son lo que se quiere enviar; los <strong>símbolos</strong> (elementos de señal), lo que se envía. <mark>R = r·log₂N</mark>: bps = baudios × bits por símbolo. Solo con 2 niveles bps y baudios coinciden.',
      goals: ['Distinguir codificación de línea y modulación.', 'Diferenciar elemento de datos y elemento de señal.', 'Convertir entre tasa de bits y de baudios (TP 7, ejercicios 1 a 3).', 'Distinguir velocidad de transmisión y throughput.'],
      body: `
        <h2>Dos formas de transmitir datos digitales</h2>
        ${table(['Datos digitales → señal digital', 'Datos digitales → señal analógica'], [['<strong>Codificación de línea</strong>: transmisión en <strong>banda base</strong> (o banda angosta). Unidad 7.', '<strong>Modulación</strong> de una portadora; el receptor demodula (módem). Unidad 8.']])}
        <p>La elección la impone el medio: no todos admiten señales digitales (el aire, la línea telefónica de voz) ni todos las analógicas.</p>
        <h2>Elemento de datos y elemento de señal</h2>
        ${table(['', 'Bit (elemento de datos)', 'Símbolo (elemento de señal)'], [['Qué es', 'La menor unidad de información', 'La menor unidad de la señal en el tiempo (un nivel, una fase)'], ['Rol', 'Lo que hay que enviar: son transportados', 'Lo que se envía: son los portadores'], ['Tasa', 'Tasa de bits R [bps]', 'Tasa de símbolos r [baudios]']])}
        ${eq(`R = r·log₂N = ${frac('1', 'T<sub>s</sub>')}·log₂N &nbsp;&nbsp; n = log₂N [bits/baudio]`, 'Tasa de bits y tasa de símbolos')}
        <p>N = número de niveles (o estados) de la señal. Objetivo de la comunicación de datos: <strong>subir la tasa de bits y bajar la de símbolos</strong>: más velocidad con menos ancho de banda.</p>
        ${table(['N', 'n = log₂N', 'r', 'R = r·n'], [2, 4, 8, 16, 32, 64, 128].map((N) => [N, X.log2(N), '1200 baud', `${num(1200 * X.log2(N))} bps`]))}
        ${note('En algunos códigos un símbolo lleva <strong>menos</strong> de un bit: Manchester usa 2 elementos de señal por bit (½ bit/baudio). En otros, como 4B/3T, 4 bits viajan en 3 símbolos (4/3 bit/baudio).', 'tip')}
        <h2>Velocidad, throughput y ancho de banda</h2>
        <ul>
          <li><strong>Velocidad de transferencia</strong>: bits por segundo que se transmiten. <strong>Throughput</strong> (velocidad efectiva): bits por segundo que el receptor <strong>acepta como válidos</strong> (sin overhead ni retransmisiones).</li>
          <li><strong>Ancho de banda (Hz)</strong>: rango de frecuencias que pasa el canal, B = f₂ − f₁. Una señal digital no periódica tiene un ancho de banda teórico infinito, pero el <strong>efectivo</strong> (donde está la mayor parte de la energía) es finito.</li>
          <li><strong>Ancho de banda digital</strong>: así se llama comúnmente a la cantidad de datos por segundo (una línea ADSL “de 256 kbps”). E1 = 2,048 Mbps, T1 = 1,544 Mbps, STM-1/OC-3 = 155,52 Mbps.</li>
        </ul>`,
      exercises: [
        { title: 'Tasa de baudios con 3 bits por símbolo', official: '7.1', level: 1, prompt: '<p>Cada símbolo transporta 3 bits y la tasa de bits es 150 kbps. ¿Tasa de baudios?</p>', solution: { explain: '<p>r = R/n = 150 000/3 = <strong>50 000 baudios</strong>.</p>' } },
        { title: '4 bits por unidad, 1000 unidades por segundo', official: '7.2', level: 1, prompt: '<p>Una señal analógica lleva 4 bits en cada unidad y se envían 1000 unidades por segundo. Tasa de baudios y de bits.</p>', solution: { explain: '<p>r = <strong>1000 baudios</strong>; R = 1000 × 4 = <strong>4000 bps</strong>.</p>' } },
        { title: '64 estados, 10 000 veces por segundo', official: '7.3', level: 1, prompt: '<p>Un modulador transmite símbolos de 64 estados posibles, 10 000 veces por segundo. Tasa de baudios y de bits.</p>', solution: { explain: '<p>r = <strong>10 000 baudios</strong>; n = log₂64 = 6 → R = <strong>60 000 bps</strong>.</p>' } },
      ],
      quiz: [
        { q: 'La transmisión de datos digitales como señal digital se llama…', o: ['modulación', 'codificación de línea (banda base)', 'multiplexación', 'muestreo'], a: 1, e: 'También banda angosta.' },
        { q: 'Una señal de 16 niveles a 2400 baudios transmite…', o: ['2400 bps', '4800 bps', '9600 bps', '38 400 bps'], a: 2, e: '2400 × 4.' },
        { q: 'bps y baudios coinciden cuando…', o: ['N = 2', 'N = 4', 'siempre', 'nunca'], a: 0, e: 'log₂2 = 1.' },
        { q: 'El throughput es…', o: ['la velocidad máxima del canal', 'los bits por segundo aceptados como válidos', 'la tasa de baudios', 'el ancho de banda en Hz'], a: 1, e: 'Velocidad efectiva.' },
        { q: 'El objetivo es aumentar la tasa de bits y reducir la de símbolos porque…', o: ['baja el ruido térmico', 'menos símbolos necesitan menos ancho de banda', 'aumenta la BER', 'elimina la componente continua'], a: 1, e: 'El ancho de banda depende de la tasa de símbolos.' },
      ],
      open: [
        { t: 'num', q: 'Un módem envía 2400 baudios con 8 estados por símbolo. ¿Cuántos bps?', a: 7200, u: 'bps', e: '<p>R = 2400 × log₂8 = 7200 bps.</p>' },
        { t: 'num', q: 'Se quieren 56 kbps con 7 bits por símbolo. ¿Cuántos baudios?', a: 8000, u: 'baud', e: '<p>r = 56 000/7 = 8000 baudios.</p>' },
        { t: 'text', q: '¿Cuál es la diferencia entre un bit y un baudio?', k: [['bit', 'dato', 'informacion'], ['simbolo', 'senal', 'cambio de estado', 'elemento de senal'], ['log', 'niveles', 'varios bits', 'n bits']], need: 2, e: '<p>El bit es la unidad de información (lo que se quiere enviar); el baudio mide símbolos o cambios de estado de la señal por segundo (lo que se envía). Un símbolo puede llevar varios bits: R = r·log₂N.</p>' },
      ],
    },
    {
      id: 'modos-transmision',
      module: 'u7',
      title: 'Serie y paralelo, asincrónica y sincrónica, simplex y dúplex',
      keywords: 'transmisión paralelo serie sincronismo reloj asincrónica start stop bit de arranque parada sincrónica orientada al carácter orientada al bit BSC HDLC bandera 01111110 bit stuffing overhead simplex half duplex full duplex',
      tldr: 'En <strong>paralelo</strong> viajan n bits a la vez por n hilos (rápido, caro, corto); en <strong>serie</strong>, uno tras otro por un hilo. En serie hace falta <strong>sincronismo</strong>: la transmisión <mark>asincrónica</mark> enmarca cada carácter con bits de start y stop (mucho overhead); la <mark>sincrónica</mark> manda bloques largos con banderas y cabeceras (overhead mínimo). Según el sentido: <strong>simplex</strong>, <strong>half-duplex</strong> y <strong>full-duplex</strong>.',
      goals: ['Comparar transmisión serie y paralelo.', 'Explicar el sincronismo y el error de reloj.', 'Calcular el overhead de una transmisión asincrónica y una sincrónica (TP 7, ejercicio 4).', 'Describir la trama HDLC.', 'Distinguir simplex, half y full dúplex con ejemplos.'],
      body: `
        <h2>Paralelo y serie</h2>
        ${table(['', 'Paralelo', 'Serie'], [['Cómo', 'n bits en un ciclo de reloj, por n hilos', 'Un bit por ciclo, por un hilo (se serializa y deserializa)'], ['Ventaja', 'Velocidad n veces mayor', 'Costo n veces menor; largas distancias'], ['Desventaja', 'Caro: solo distancias cortas (buses internos)', 'n veces más lento a igual reloj'], ['Uso', 'Transferencias internas', 'Comunicaciones de datos']])}
        <h2>Sincronismo</h2>
        ${def('Sincronismo', 'Que la fuente y el receptor de datos tengan una base de tiempo común para poder reconocer de forma inequívoca la transmisión de un 1 y de un 0.', 'Guía de la Unidad 7')}
        <p>Si el reloj del receptor va más rápido o más lento, lee bits de más o de menos. Ejemplo 2: reloj del receptor 0,1 % más rápido → a 1 kbps recibe 1001 bps (1 bit extra por segundo); a 1 Mbps, <strong>1000 bits extra</strong>. Una señal con <strong>autosincronización</strong> incluye transiciones que permiten reajustar el reloj (Manchester).</p>
        <h2>Asincrónica</h2>
        <p>Se envía carácter por carácter, a intervalos variables. La línea en reposo está en 1 (marca); el <strong>bit de start</strong> (0) avisa que llega un carácter y arranca el muestreo; siguen los datos (y la paridad); el <strong>bit de stop</strong> (1, o 1,5 o 2) devuelve la línea al reposo para reconocer el próximo start.</p>
        ${fig5()}
        <h2>Sincrónica</h2>
        <p>Un bloque completo viaja como flujo continuo, sin start/stop; el receptor cuenta los bits, así que el reloj es crítico. Entre bloques hay caracteres de sincronismo (SYN ASCII = 10010110) o banderas.</p>
        ${table(['Orientada al carácter', 'Orientada al bit'], [['El bloque es una secuencia de caracteres; el control usa caracteres especiales; atada a ASCII/EBCDIC (BSC de IBM)', 'El bloque es una secuencia de bits; el control va en la posición de los campos; transparente al código, más eficiente y fiable (HDLC, base de los protocolos de enlace actuales)']])}
        ${table(['Bandera', 'Dirección', 'Control', 'Información', 'FCS', 'Bandera'], [['01111110', '8 bits', '8 o 16 bits', 'variable (múltiplo de 8)', 'CRC-16 o CRC-32', '01111110']])}
        <p>Trama HDLC (ISO 3309/4335). Para que la bandera no aparezca dentro de los datos se usa <strong>bit stuffing</strong>: después de cinco 1 seguidos el emisor inserta un 0, que el receptor quita.</p>
        ${note('En asincrónica el overhead es constante y alto (con 8 datos + start + stop, 2 de cada 10 bits = 20 %); en sincrónica es casi despreciable y mejora cuanto más grande el bloque. Por eso la sincrónica domina entre computadoras, a pesar de equipos más caros.', 'exam')}
        ${lab(0)}
        <h2>Sentido de la comunicación</h2>
        ${table(['Modo', 'Funcionamiento', 'Ejemplos'], [['<strong>Simplex</strong>', 'Un solo sentido; el receptor no puede responder', 'Radiodifusión de TV y radio, buscapersonas'], ['<strong>Half-duplex</strong>', 'Ambos sentidos, pero uno por vez (comparten la frecuencia)', 'Radio de banda ciudadana, walkie-talkie (“cambio”)'], ['<strong>Full-duplex</strong>', 'Ambos sentidos a la vez (dos frecuencias o dos pares)', 'Telefonía, Ethernet conmutada']])}`,
      labs: [
        { type: 'calc', title: 'Overhead: asincrónica contra sincrónica', fields: [{ id: 'c', label: 'Caracteres (bytes)', value: 50000 }, { id: 'ov', label: 'Bits extra por carácter (start + paridad + stop)', value: 3 }, { id: 'f', label: 'Bytes por trama sincrónica', value: 1000 }, { id: 'h', label: 'Bits de cabecera + CRC por trama', value: 64 }],
          run: (v) => { const a = v.c * (8 + v.ov), fr = Math.ceil(v.c / v.f), s = v.c * 8 + fr * v.h; return `Asincrónica: ${num(v.c)} × ${8 + v.ov} = ${num(a)} bits · overhead ${num((v.ov / (8 + v.ov)) * 100, 2)} % del total\nSincrónica: ${num(fr)} tramas × (${num(v.f * 8)} + ${num(v.h)}) = ${num(s)} bits · overhead ${num((fr * v.h / s) * 100, 3)} %\nLa sincrónica manda ${num((1 - s / a) * 100, 1)} % menos bits`; } },
      ],
      exercises: [
        { title: 'Archivo de 50 000 caracteres', official: '7.4', level: 2, prompt: '<p>Transmisión asincrónica con 1 bit de start, 8 de datos, 1 de paridad y 1 de stop; archivo de 50 000 caracteres. a) Total de bits. b) Porcentaje de overhead. c) Comparar con sincrónica en tramas de 1000 bytes con 32 bits de cabecera y 32 de CRC. d) ¿Cuál es más eficiente?</p>',
          solution: { explain: `<p><b>a)</b> 50 000 × 11 = <strong>${num(asyncBits)} bits</strong>. <b>b)</b> 3 bits de control de cada 11: <strong>27,27 %</strong> del total (37,5 % si se mide sobre los 8 bits de datos).</p><p><b>c)</b> 50 000 bytes / 1000 = 50 tramas; cada una 8000 + 64 bits → <strong>${num(syncBits)} bits</strong>. Overhead: 64/8064 = <strong>0,79 %</strong> (0,8 % sobre los datos).</p><p><b>d)</b> La sincrónica: manda ${num(asyncBits - syncBits)} bits menos (−${num((1 - syncBits / asyncBits) * 100, 1)} %). La asincrónica solo conviene para tráfico esporádico carácter por carácter (un teclado), por su simpleza y bajo costo.</p>` } },
      ],
      quiz: [
        { q: 'En transmisión asincrónica, la línea en reposo está en…', o: ['0', '1 (marca)', 'alta impedancia', 'cualquier nivel'], a: 1, e: 'El bit de start es un 0.' },
        { q: 'Con 1 start, 7 datos, 1 paridad y 1 stop, el overhead es…', o: ['10 %', '20 %', '30 %', '3 %'], a: 2, e: '3 de 10 bits.' },
        { q: 'La bandera de HDLC es…', o: ['10010110', '01111110', '11111111', '10101010'], a: 1, e: 'Con bit stuffing para la transparencia.' },
        { q: 'Un walkie-talkie es…', o: ['simplex', 'half-duplex', 'full-duplex', 'paralelo'], a: 1, e: 'Ambos sentidos, de a uno.' },
        { q: 'La transmisión paralelo se usa en…', o: ['enlaces de larga distancia', 'distancias cortas (buses internos)', 'fibra óptica', 'satélites'], a: 1, e: 'Es cara: n hilos.' },
        { q: 'Un reloj de receptor 0,1 % más rápido a 1 Mbps recibe…', o: ['1 bit extra por segundo', '1000 bits extra por segundo', '0,1 bit extra', 'ningún bit extra'], a: 1, e: 'Ejemplo 2 de la guía.' },
        { q: 'La transmisión orientada al bit…', o: ['depende de ASCII', 'es transparente al código', 'usa start y stop', 'no usa CRC'], a: 1, e: 'El control va en la posición de los campos.' },
      ],
      open: [
        { t: 'num', q: '10 000 caracteres en asincrónica con 1 start, 8 datos y 2 stop. ¿Overhead en % del total? (2 decimales)', a: (3 / 11) * 100, tol: 0.005, u: '%', e: '<p>3/11 = 27,27 %.</p>' },
        { t: 'num', q: 'Tramas sincrónicas de 500 bytes con 48 bits de cabecera y CRC: ¿eficiencia en %? (2 decimales)', a: (4000 / 4048) * 100, tol: 0.001, u: '%', e: `<p>4000/(4000 + 48) = ${num((4000 / 4048) * 100, 2)} %.</p>` },
        { t: 'text', q: 'Compará transmisión asincrónica y sincrónica.', k: [['start', 'arranque', 'parada', 'stop'], ['caracter'], ['bloque', 'trama'], ['overhead', 'eficien', 'sobrecarga'], ['reloj', 'sincron']], need: 4, e: '<p>Asincrónica: carácter por carácter, cada uno con bit de start y de stop; simple y barata pero con overhead alto y constante (~20–27 %). Sincrónica: bloques largos como flujo continuo, con banderas o caracteres de sincronismo y cabecera; el reloj es crítico y los equipos más caros, pero el overhead es mínimo y se usa entre computadoras.</p>' },
        { t: 'text', q: 'Definí simplex, half-duplex y full-duplex con un ejemplo de cada uno.', k: [['simplex'], ['half'], ['full'], ['un sentido', 'una direccion', 'unidireccional'], ['simultane', 'a la vez', 'al mismo tiempo']], need: 4, e: '<p>Simplex: un solo sentido (TV, radio). Half-duplex: ambos sentidos pero no a la vez (radio CB, walkie-talkie). Full-duplex: ambos sentidos simultáneamente (telefonía).</p>' },
      ],
    },
    {
      id: 'codigos-linea',
      module: 'u7',
      title: 'Códigos de línea: NRZ, RZ y Manchester',
      keywords: 'código de línea requisitos autosincronización componente continua DC transparencia inmunidad al ruido densidad espectral unipolar NRZ polar NRZ-L NRZ-I RZ Manchester Manchester diferencial bifase Ethernet Token Ring',
      tldr: 'Un código de línea convierte bits en niveles de tensión. Debe dar <strong>autosincronización</strong>, evitar la <strong>componente continua</strong>, ser inmune al ruido, transparente y con un espectro adecuado al canal. <strong>NRZ</strong> es simple pero sin sincronismo en rachas largas; <strong>RZ</strong> vuelve a cero a mitad de bit; <mark>Manchester</mark> tiene una transición a mitad de cada bit (0: + → −, 1: − → +) y el <mark>diferencial</mark> codifica el 0 con una transición extra al comienzo.',
      goals: ['Enumerar los requisitos de un código de línea.', 'Dibujar NRZ, NRZ-I, RZ, Manchester y Manchester diferencial para una secuencia.', 'Comparar sus ventajas (componente continua, sincronismo, ancho de banda).', 'Decodificar una señal Manchester diferencial.'],
      body: `
        <h2>Requisitos de un código de línea</h2>
        ${table(['Requisito', 'Significa'], [['Autosincronización', 'Suficientes transiciones para recuperar el reloj de bit'], ['Detección de errores', 'Que ciertas violaciones del código revelen errores'], ['Inmunidad al ruido', 'Baja probabilidad de confundir niveles'], ['Densidad espectral', 'Que el espectro de la señal se ajuste a la respuesta del canal (sin continua si el canal no la pasa)'], ['Transparencia', 'Funcionar igual con cualquier secuencia de unos y ceros']])}
        <h2>Unipolar NRZ</h2>
        <p>1 → +V, 0 → 0 V; no retorna a cero a mitad de bit. Problemas: <strong>componente continua</strong> (valor medio ≠ 0: no pasa por transformadores ni por algunos medios), mala inmunidad al ruido y <strong>pérdida de sincronismo</strong> con rachas largas.</p>
        <h2>Polares</h2>
        <ul>
          <li><strong>NRZ-L</strong> (Level): el nivel (+ o −) es el valor del bit.</li>
          <li><strong>NRZ-I</strong> (Invert): un 1 invierte el nivel; un 0 lo mantiene. Las rachas de 1 sincronizan; las de 0 no.</li>
          <li><strong>RZ</strong> (Return to Zero): tres niveles; + para el 1 y − para el 0 en la primera mitad, y 0 en la segunda. Transición en cada bit (sincroniza) pero usa el <strong>doble de ancho de banda</strong>.</li>
          <li><strong>Manchester</strong> (bifase): siempre hay transición a mitad de bit. Convención del TP: <strong>0 = + → −, 1 = − → +</strong>. Autosincronizado y sin continua; el doble de ancho de banda. Ethernet 10BASE-T.</li>
          <li><strong>Manchester diferencial</strong>: siempre transición a mitad de bit (reloj); el valor se lee al <strong>comienzo</strong> del bit: <strong>transición = 0</strong>, sin transición = 1. No importa la polaridad, solo si hay cambio. Token Ring.</li>
        </ul>
        ${lab(0)}
        <h3>Resultado para la secuencia del TP: ${BITS}</h3>
        ${table(['Código', 'Niveles por bit (dos signos = primera y segunda mitad)'], [['NRZ (0/+5 V)', row('nrz')], ['NRZ-I (±5 V, empieza +)', row('nrzi')], ['RZ polar (±3 V)', row('rz')], ['Manchester', row('manchester')], ['Manchester diferencial', row('dmanch')]].map(([a, b]) => [a, `<span class="mono">${b}</span>`]))}
        ${note('Convenciones (las del enunciado del TP 7): NRZ-I “comienza con voltaje positivo” → como el primer bit es un 1, se interpreta que la línea venía en − y el 1 la invierte a +. Manchester diferencial “comienza con voltaje positivo en t = 0” → el primer bit (1, sin transición inicial) arranca en +. Si tu cátedra usa otra referencia, la forma es la misma invertida.', 'warn')}`,
      labs: [{ type: 'linecode', title: 'Codificador de línea', intro: 'La secuencia del TP 7. Elegí cada código o “Todos juntos” para compararlos.', bits: BITS, scheme: 'manchester' }],
      exercises: [
        { title: 'Decodificar Manchester diferencial', official: '7.6', level: 2, prompt: '<p>Con Manchester diferencial (sin inversión si el dato es 1, con inversión si es 0) se recibe el flujo de la figura del TP. Identificar los datos.</p><p class="muted-s">La figura no viene en el texto. Ejemplo: niveles por mitad de bit, empezando de una línea en +: (+ −)(+ −)(− +)(+ −)(− +)(− +).</p>',
          solution: { explain: `<p>Regla: mirá el <strong>comienzo</strong> de cada bit comparado con el final del anterior. Si hay transición → 0; si no → 1. La transición de la mitad es solo reloj.</p>${table(['Bit', 'Mitades', 'Fin del anterior', '¿Transición al inicio?', 'Dato'], [['1', '+ −', '+ (línea)', 'no', '1'], ['2', '+ −', '−', 'sí', '0'], ['3', '− +', '−', 'no', '1'], ['4', '+ −', '+', 'no', '1'], ['5', '− +', '−', 'no', '1'], ['6', '− +', '+', 'sí', '0']])}<p>Datos: <strong>${X.dmanchDecode([[1, -1], [1, -1], [-1, 1], [1, -1], [-1, 1], [-1, 1]])}</strong>. Verificalo codificando esos bits en el laboratorio.</p>` } },
      ],
      quiz: [
        { q: 'El principal problema del NRZ unipolar es…', o: ['usa mucho ancho de banda', 'tiene componente continua y pierde sincronismo en rachas largas', 'tiene tres niveles', 'no se puede decodificar'], a: 1, e: 'Valor medio distinto de cero.' },
        { q: 'En Manchester (convención del TP) un 1 es…', o: ['+ → −', '− → +', 'nivel +', 'nivel 0'], a: 1, e: 'Y el 0 es + → −.' },
        { q: 'En Manchester diferencial, el valor del bit se determina por…', o: ['el nivel en la mitad', 'la presencia o ausencia de transición al comienzo del bit', 'la amplitud', 'la polaridad del pulso'], a: 1, e: 'Transición al comienzo = 0.' },
        { q: 'En NRZ-I, un 0…', o: ['invierte el nivel', 'mantiene el nivel', 'vuelve a cero', 'es un pulso negativo'], a: 1, e: 'El 1 invierte.' },
        { q: 'Manchester necesita, frente a NRZ…', o: ['la mitad del ancho de banda', 'el doble del ancho de banda', 'el mismo', 'cuatro veces más'], a: 1, e: 'Dos elementos de señal por bit.' },
        { q: 'Un código autosincronizado…', o: ['no tiene transiciones', 'incluye transiciones suficientes para recuperar el reloj', 'necesita un cable de reloj aparte', 'usa paridad'], a: 1, e: 'Manchester lo es.' },
      ],
      open: [
        { t: 'text', q: '¿Qué ventajas tiene Manchester frente a NRZ y cuál es su costo?', k: [['transicion', 'sincron', 'reloj'], ['continua', 'dc', 'valor medio'], ['ancho de banda', 'doble']], e: '<p>Manchester tiene una transición a mitad de cada bit: es autosincronizado y no tiene componente continua. Su costo es que usa el doble de ancho de banda (dos elementos de señal por bit).</p>' },
        { t: 'text', q: 'Nombrá tres requisitos que debe cumplir un código de línea.', k: [['sincron'], ['error'], ['ruido'], ['espectr', 'densidad'], ['transparen'], ['continua', 'dc']], need: 3, e: '<p>Autosincronización, capacidad de detección de errores, inmunidad al ruido, densidad espectral adecuada al canal (sin continua) y transparencia.</p>' },
        { t: 'num', q: 'En Manchester, ¿cuántos baudios se necesitan para transmitir 10 Mbps?', a: 20e6, u: 'baud', e: '<p>Dos elementos de señal por bit: 20 Mbaudios (20 millones de cambios por segundo, como máximo).</p>' },
      ],
    },
    {
      id: 'codigos-bipolares',
      module: 'u7',
      title: 'Códigos bipolares: AMI, B8ZS y HDB3',
      keywords: 'bipolar AMI alternate mark inversion violación B8ZS 000VB0VB T1 HDB3 000V B00V E1 sustitución de ceros sincronismo espectro banda base aleatorización scrambling codificación en bloques',
      tldr: 'En <strong>AMI</strong> el 0 es 0 V y los 1 alternan + y −: sin continua y con detección de errores (dos pulsos iguales seguidos = violación), pero las rachas de ceros pierden el sincronismo. <mark>B8ZS</mark> reemplaza cada 8 ceros por 000VB0VB (T1); <mark>HDB3</mark> no permite más de 3 ceros: 4 ceros → 000V o B00V según la paridad de pulsos desde la última sustitución (E1).',
      goals: ['Codificar en AMI.', 'Aplicar las sustituciones de B8ZS y HDB3 y marcar las violaciones.', 'Explicar por qué se sustituyen ceros y cómo el receptor recupera los datos.'],
      body: `
        <h2>AMI (Alternate Mark Inversion)</h2>
        <p>0 → 0 V; cada 1 → pulso de polaridad opuesta al 1 anterior. Ventajas: <strong>sin componente continua</strong> y <strong>detección de errores</strong> (dos pulsos seguidos de igual polaridad son una violación imposible). Problema: una racha larga de ceros es una línea plana: <strong>se pierde el sincronismo</strong>. Solución: <strong>aleatorización</strong> (scrambling): reemplazar las rachas de ceros por patrones con violaciones intencionales que el receptor reconoce.</p>
        <h2>B8ZS (Bipolar with 8 Zeros Substitution)</h2>
        <p>Cada grupo de <strong>8 ceros</strong> se reemplaza por <strong>000VB0VB</strong>: V = violación (misma polaridad que el pulso anterior), B = pulso bipolar normal (alterna). Si el último pulso fue +: 000+−0−+; si fue −: 000−+0+−. Se usa en T1 (EE. UU.).</p>
        <h2>HDB3 (High Density Bipolar 3)</h2>
        <p>Nunca más de 3 ceros seguidos. Cada grupo de <strong>4 ceros</strong> se reemplaza según la cantidad de pulsos (unos) desde la última sustitución:</p>
        ${table(['Pulsos desde la última sustitución', 'Patrón', 'Por qué'], [['Impar', '<strong>000V</strong>', 'V con la polaridad del último pulso'], ['Par', '<strong>B00V</strong>', 'B opuesto al último pulso y V igual a B: así las violaciones alternan y no se acumula continua']])}
        <p>Se usa en E1 (Europa, Argentina).</p>
        ${lab(0)}
        <h3>Resultado para ${BITS} (primer 1 positivo)</h3>
        ${table(['Código', 'Niveles'], [['AMI', row('ami')], ['B8ZS', row('b8zs')], ['HDB3', row('hdb3')]].map(([a, b]) => [a, `<span class="mono">${b}</span>`]))}
        <ul>
          <li><strong>B8ZS</strong>: tras el primer 1 (+) vienen 8 ceros → 000+−0−+ (V en la 4.ª y 7.ª posición); el siguiente 1 sigue la alternancia del + original: −.</li>
          <li><strong>HDB3</strong>: tras el + hay 1 pulso (impar) → 000+ (V). Siguen 4 ceros con 0 pulsos desde la sustitución (par) → B00V = −00−. Después 111 → + − +, y 4 ceros con 3 pulsos (impar) → 000+. El último 1 → −.</li>
        </ul>
        ${note('El receptor reconoce la sustitución porque ve una violación (V): en B8ZS, el patrón 000VB0VB vuelve a ser 8 ceros; en HDB3, el V y el B que lo precede (si lo hay) vuelven a ser ceros.', 'tip')}
        <h2>Espectros en banda base</h2>
        <p>NRZ concentra la energía en bajas frecuencias e incluye continua; Manchester la corre hacia la tasa de bits (sin continua, banda doble); AMI y sus variantes tienen continua nula y el máximo cerca de la mitad de la tasa de bits, ocupando menos ancho de banda que Manchester. Por eso las líneas de telefonía digital usan bipolares.</p>`,
      labs: [{ type: 'linecode', title: 'AMI, B8ZS y HDB3', intro: 'Las zonas sombreadas son los pulsos que reemplazan ceros: V (violación) y B (relleno).', bits: BITS, scheme: 'hdb3' }],
      exercises: [
        { title: 'Ocho códigos para la misma secuencia', official: '7.5', level: 3, prompt: `<p>Convertir el flujo ${BITS} en: NRZ (0 y +5 V), NRZ-I (±5 V, empezando positivo), RZ polar (±3 V), Manchester, Manchester diferencial (empezando positivo), AMI (±12 V, primer 1 positivo), B8ZS y HDB3 (±5 V, primer 1 positivo).</p>`,
          solution: { explain: `<p>Usá el laboratorio con “Todos juntos” para ver las ocho formas de onda. En niveles (+ = tensión positiva del código, − = negativa, dos signos = mitades del bit):</p>${table(['Código', 'Niveles'], [['NRZ', 'nrz'], ['NRZ-I', 'nrzi'], ['RZ', 'rz'], ['Manchester', 'manchester'], ['Manch. diferencial', 'dmanch'], ['AMI', 'ami'], ['B8ZS', 'b8zs'], ['HDB3', 'hdb3']].map(([n, k]) => [n, `<span class="mono">${row(k)}</span>`]))}<p>Amplitudes: NRZ 0/+5 V, NRZ-I ±5 V, RZ ±3 V, AMI ±12 V, B8ZS y HDB3 ±5 V.</p>` } },
      ],
      quiz: [
        { q: 'En AMI, un 0 se representa con…', o: ['+V', '−V', '0 V', 'una transición'], a: 2, e: 'Los 1 alternan.' },
        { q: 'Una violación bipolar es…', o: ['dos pulsos consecutivos de igual polaridad', 'un pulso de 0 V', 'una transición a mitad de bit', 'un error de paridad'], a: 0, e: 'Imposible en AMI: o error, o sustitución intencional.' },
        { q: 'B8ZS reemplaza cada grupo de 8 ceros por…', o: ['000V', 'B00V', '000VB0VB', '00000000'], a: 2, e: 'T1.' },
        { q: 'En HDB3, si desde la última sustitución hubo un número par de pulsos, 4 ceros se reemplazan por…', o: ['000V', 'B00V', '000VB0VB', '0000'], a: 1, e: 'Impar → 000V.' },
        { q: 'HDB3 garantiza que nunca haya más de…', o: ['2 ceros seguidos', '3 ceros seguidos', '7 ceros seguidos', '8 ceros seguidos'], a: 1, e: 'High Density Bipolar 3.' },
        { q: 'El problema de AMI que resuelven B8ZS y HDB3 es…', o: ['la componente continua', 'la pérdida de sincronismo en rachas de ceros', 'el ancho de banda', 'la paridad'], a: 1, e: 'Aleatorización.' },
      ],
      open: [
        { t: 'text', q: 'Codificá 1100101 en AMI empezando con el primer 1 positivo (escribí + − 0 por bit).', k: [['+ - 0 0 + 0 -', '+-00+0-', '+ − 0 0 + 0 −', '+−00+0−']], need: 1, e: '<p>1 → +, 1 → −, 0, 0, 1 → +, 0, 1 → −: <b>+ − 0 0 + 0 −</b>.</p>' },
        { t: 'text', q: '¿Por qué AMI no tiene componente continua y qué problema conserva?', k: [['alterna', 'alternan', 'positivo y negativo', 'polaridad'], ['ceros', 'rachas', 'sincron']], e: '<p>Porque los 1 se representan con pulsos que alternan + y −: se compensan y el valor medio es cero. Conserva el problema de las rachas largas de ceros (línea plana): se pierde el sincronismo; por eso existen B8ZS y HDB3.</p>' },
        { t: 'text', q: 'Explicá la regla de sustitución de HDB3.', k: [['4 ceros', 'cuatro ceros'], ['000v'], ['b00v'], ['par'], ['impar']], need: 4, e: '<p>Cada grupo de 4 ceros se reemplaza: si desde la última sustitución hubo un número impar de pulsos, por 000V (V con la misma polaridad que el último pulso); si fue par, por B00V (B opuesto al último pulso y V igual a B).</p>' },
      ],
    },
  );

  // Carácter asincrónico: la "F" de la guía con start, paridad y stop
  function fig5() {
    const bits = ['1', '1', '0', '1', '0', '0', '0', '1', '1', '0', '1', '1', '1'];
    const lb = ['reposo', 'reposo', 'start', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'paridad', 'stop', 'reposo'];
    const W = 600, bw = (W - 40) / bits.length, y = (b) => (b === '1' ? 30 : 80);
    let d = `M20 ${y(bits[0])}`;
    bits.forEach((b, i) => { d += ` L${20 + i * bw} ${y(b)} L${20 + (i + 1) * bw} ${y(b)}`; });
    return h.fig(`<svg class="dg" viewBox="0 0 ${W} 130" role="img" aria-label="Carácter asincrónico: reposo en 1, bit de start, datos, paridad y stop">
      ${bits.map((b, i) => `<rect x="${20 + i * bw}" y="20" width="${bw}" height="72" class="b ${lb[i] === 'start' || lb[i] === 'stop' ? 'w' : lb[i] === 'paridad' ? 'acc' : lb[i] === 'reposo' ? '' : 'ok'}" style="opacity:.35"/><text x="${20 + i * bw + bw / 2}" y="108" class="ts" style="font-size:9px">${lb[i]}</text><text x="${20 + i * bw + bw / 2}" y="14" class="ts">${b}</text>`).join('')}
      <path d="${d}" class="ln acc" style="stroke-width:2.6"/></svg>`, 'Transmisión asincrónica de un carácter: la línea en reposo está en 1, el start (0) marca el comienzo, y el stop (1) la devuelve al reposo. Los datos van del bit menos significativo al más significativo.');
  }
})();
