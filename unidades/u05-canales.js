/* Unidad 5 (2do parcial): canales de comunicaciones. Guía "Unidad 5 Canales de Comunicaciones" y apuntes 5.1 a 5.4.
   TP 5: información de una señal de niveles, Nyquist sin ruido, muestreo, Shannon, eficiencia espectral, niveles máximos y tiempos mínimos.
   Convención de la cátedra: M = √(1 + SNR) se redondea a la potencia de 2 inferior. */
(() => {
  const { LESSONS, h, cx: X } = window.GUIDE;
  const { note, def, table, eq, frac, lab, num, chart } = h;
  const eng = (v, u, d = 3) => window.GUIDE.labUtil.eng(v, u, d);

  const c4 = X.shannon(20e6, 10), c4b = X.shannon(20e6, 20);
  const c5 = X.shannon(3200, 100);
  const R7 = 720 * 1280 * 3 * 25;
  const I8 = 600 * X.log2(10), C8 = X.shannon(1000, 15);

  LESSONS.push(
    {
      id: 'informacion-senal',
      module: 'u5',
      title: 'Información de una señal y capacidad del canal',
      keywords: 'información de una señal niveles de tensión equiprobables símbolos codificación binaria canal de información canal físico capacidad del canal segundo teorema de Shannon R menor o igual que C codificador de fuente codificador de canal',
      tldr: 'Una señal con <strong>N niveles</strong> equiprobables y m símbolos en un tiempo T lleva <mark>I = m·log₂N bits</mark>. Si se usan menos niveles, hacen falta más símbolos (o símbolos más cortos) para mandar lo mismo. La <strong>capacidad C</strong> de un canal es la máxima información por segundo que transfiere; Shannon probó que si <strong>R ≤ C</strong> existe una codificación con errores arbitrariamente pequeños, y si R &gt; C no.',
      goals: ['Calcular la información de una señal de N niveles.', 'Codificar símbolos en bits y dibujar la señal v(t) (TP 5, ejercicio 1).', 'Distinguir canal de información y canal físico, y codificador de fuente y de canal.', 'Enunciar el segundo teorema de Shannon.'],
      body: `
        <h2>Información de una señal</h2>
        <p>Si cada símbolo puede ser uno de N niveles equiprobables de tensión y en un tiempo T se envían m = T/T<sub>s</sub> símbolos:</p>
        ${eq(`I = m·log₂N = ${frac('T', 'T<sub>s</sub>')}·log₂N [bit en T segundos]`, 'Información de una señal')}
        <ul><li>Ejemplo 1: 8 niveles (0 a 7 V), T<sub>s</sub> = 1 s, T = 16 s → I = 16 × 3 = <strong>48 bits</strong>.</li>
        <li>Ejemplo 2: 16 niveles de 0,5 V → 16 × 4 = <strong>64 bits</strong>.</li>
        <li>Ejemplo 3: 8 niveles con T<sub>s</sub> = 0,5 s → 48 bits en 8 s.</li></ul>
        <p>No se puede dividir la señal en niveles infinitamente chicos ni acortar los símbolos sin límite: el ruido hace indistinguibles los niveles muy cercanos y el ancho de banda del canal limita qué tan cortos pueden ser los pulsos. Esos dos límites son Shannon y Nyquist.</p>
        ${fig4()}
        <h2>Canal de información y canal físico</h2>
        ${table(['Canal de información', 'Canal físico'], [['Especificaciones externas del sistema, estudiadas con la Teoría de la Información: eficiencia, velocidad y calidad; usa codificación y redundancia para preservar la integridad', 'Características físicas y eléctricas del medio (cable, fibra, aire con antenas), estudiadas con ingeniería de comunicaciones']])}
        <p>Entre la fuente y el canal hay dos codificadores: el <strong>de fuente</strong> (quita redundancia: menos símbolos para lo mismo, Huffman) y el <strong>de canal</strong> (agrega redundancia controlada para transmitir confiablemente sobre un canal ruidoso, Unidad 6).</p>
        <h2>Capacidad y segundo teorema de Shannon</h2>
        ${def('Capacidad del canal', 'Medida de la cantidad de información que un canal puede transferir por unidad de tiempo. Se simboliza C y se mide en bits/segundo.', 'Guía de la Unidad 5')}
        ${eq('R ≤ C → existe una codificación con frecuencia de errores arbitrariamente pequeña; R &gt; C → no es posible transmitir sin errores', 'Segundo teorema de Shannon')}
        <p>El primer teorema (codificación de la fuente) trata de cuánto se puede comprimir; el segundo, de cuánto se puede transmitir confiablemente. La velocidad de datos depende de tres factores: el <strong>ancho de banda</strong>, los <strong>niveles</strong> de la señal y la <strong>calidad del canal</strong> (ruido).</p>`,
      exercises: [
        { title: 'Cuatro símbolos con cuatro niveles', official: '5.1', level: 1, prompt: '<p>Una fuente genera A, B, C, D equiprobables, que se transmiten con 4 niveles (0, 1, 2, 3 V) y T<sub>s</sub> = 1 s. a) Información si se transmite 4 s. b) Bits por símbolo. c) Tabla de codificación. d) Dibujar v(t) para ABCD. e) Con solo 2 niveles (0 y 1 V), ¿cuánto tiempo se necesita?</p>',
          solution: { explain: `<p><b>a)</b> I = (4 s/1 s)·log₂4 = 4 × 2 = <strong>8 bits</strong>. <b>b)</b> log₂4 = <strong>2 bits/símbolo</strong>. <b>c)</b> A = 00 → 0 V, B = 01 → 1 V, C = 10 → 2 V, D = 11 → 3 V.</p>
            ${chart({ x: [0, 4.3], y: [0, 3.6], h: 180, xl: 't [s]', yl: 'v [V]', ticks: { x: [1, 2, 3, 4], y: [1, 2, 3] }, curves: [{ pts: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3]], cls: 'c-sig' }], texts: ['A', 'B', 'C', 'D'].map((t, i) => ({ x: i + 0.5, y: i + 0.35, t, cls: 'c-res' })) }, '<b>d)</b> v(t) para ABCD con 4 niveles.')}
            <p><b>e)</b> Con 2 niveles cada símbolo necesita 2 pulsos binarios: 8 pulsos. Manteniendo pulsos de 1 s, tarda <strong>8 s</strong> (el doble). Para mantener los 4 s, los pulsos deben durar 0,5 s: el doble de velocidad de señalización, que exige más ancho de banda.</p>` } },
      ],
      quiz: [
        { q: 'Una señal de 16 niveles equiprobables envía 10 símbolos. Información total:', o: ['16 bits', '40 bits', '160 bits', '10 bits'], a: 1, e: '10 × log₂16.' },
        { q: 'Si una fuente tiene R > C…', o: ['se transmite sin errores', 'no es posible transmitir sin errores', 'la capacidad aumenta', 'hay que usar Huffman'], a: 1, e: 'Segundo teorema de Shannon.' },
        { q: 'El codificador de canal…', o: ['quita redundancia', 'agrega redundancia controlada para combatir errores', 'modula la portadora', 'comprime el mensaje'], a: 1, e: 'El de fuente es el que la quita.' },
        { q: 'Pasar de 4 a 2 niveles manteniendo la duración de cada pulso hace que la transmisión…', o: ['tarde la mitad', 'tarde el doble', 'tarde lo mismo', 'sea imposible'], a: 1, e: 'Cada símbolo necesita 2 pulsos binarios.' },
        { q: 'La capacidad de un canal se mide en…', o: ['Hz', 'bit/s', 'dB', 'baudios'], a: 1, e: 'Información por unidad de tiempo.' },
      ],
      open: [
        { t: 'num', q: 'Señal de 8 niveles equiprobables, símbolos de 0,25 s, transmitida durante 2 s. ¿Cuántos bits lleva?', a: 24, u: 'bit', e: '<p>m = 2/0,25 = 8 símbolos; I = 8 × log₂8 = 24 bits.</p>' },
        { t: 'text', q: 'Enunciá el segundo teorema de Shannon.', k: [['r', 'tasa', 'velocidad'], ['c', 'capacidad'], ['menor', '≤', '<=', 'no supera'], ['error', 'arbitrariamente', 'pequen']], need: 3, e: '<p>Dado un canal de capacidad C y una fuente de tasa R: si R ≤ C existe una técnica de codificación que permite transmitir con una frecuencia de errores arbitrariamente pequeña, pese al ruido; si R &gt; C, no es posible transmitir sin errores.</p>' },
      ],
    },
    {
      id: 'muestreo',
      module: 'u5',
      title: 'Teorema de muestreo de Nyquist',
      keywords: 'muestreo teorema de Nyquist Shannon frecuencia de muestreo fs 2 fmax frecuencia de Nyquist aliasing filtro antialiasing señal limitada en banda reconstrucción',
      tldr: 'Una señal limitada en banda se reconstruye completa a partir de sus muestras si se muestrea a <mark>f<sub>s</sub> ≥ 2·f<sub>máx</sub></mark> (frecuencia de Nyquist). Basta con dos muestras por ciclo de la componente más alta. Si se muestrea más lento aparece <strong>aliasing</strong>: las muestras parecen de otra señal más lenta. Por eso antes se filtra con un pasa bajos.',
      goals: ['Enunciar el teorema de muestreo y calcular la frecuencia mínima de muestreo.', 'Explicar el aliasing y el filtro antialiasing.'],
      body: `
        <p>Nyquist (1924) mostró que no hace falta enviar todos los infinitos puntos de una señal analógica: alcanza con <strong>dos muestras por ciclo</strong> de su componente de mayor frecuencia para recuperarla en el receptor.</p>
        ${def('Teorema de muestreo', 'Toda señal limitada en banda se puede reconstruir completamente a partir de las muestras tomadas de ella, siempre que el muestreo se realice como mínimo al doble de la máxima frecuencia de la señal.', 'Guía de la Unidad 5')}
        ${eq('f<sub>s</sub> ≥ 2·f<sub>máx</sub> &nbsp;&nbsp; f<sub>Nyquist</sub> = 2·f<sub>máx</sub>', 'Condición de muestreo')}
        ${lab(0)}
        <p>Por eso la telefonía muestrea la voz (limitada a 4 kHz) a <strong>8 kHz</strong>, y el CD de audio (hasta ~20 kHz) a <strong>44,1 kHz</strong>. La señal se pasa antes por un <strong>filtro pasa bajos</strong> que elimina lo que esté por encima de f<sub>s</sub>/2: si no, esas componentes se pliegan sobre la banda útil (aliasing) y ya no se pueden separar.</p>
        ${note('El teorema exige una señal <strong>limitada en banda</strong>. La “frecuencia de Nyquist” se usa con dos sentidos: la frecuencia mínima de muestreo (2·f<sub>máx</sub>) o la máxima frecuencia representable (f<sub>s</sub>/2). En la guía es la primera.', 'warn')}`,
      labs: [{ type: 'sampling', title: 'Muestreo y aliasing', intro: 'Bajá fs por debajo de 2f: ¿qué frecuencia parece tener la señal reconstruida?', f: 4, fs: 10 }],
      exercises: [
        { title: 'Frecuencia mínima de muestreo', official: '5.3', level: 1, prompt: '<p>Dada una señal analógica de 4 kHz, indicar la mínima frecuencia de muestreo para reconstruirla en el receptor.</p>', solution: { explain: '<p>f<sub>s</sub> ≥ 2·f<sub>máx</sub> = 2 × 4 kHz = <strong>8 kHz</strong> (8000 muestras por segundo, una cada 125 µs: es la frecuencia de muestreo de la telefonía digital).</p>' } },
      ],
      quiz: [
        { q: 'Una señal tiene f<sub>máx</sub> = 15 kHz. La frecuencia mínima de muestreo es…', o: ['7,5 kHz', '15 kHz', '30 kHz', '45 kHz'], a: 2, e: '2·f<sub>máx</sub>.' },
        { q: 'El aliasing ocurre cuando…', o: ['se muestrea por encima de 2f<sub>máx</sub>', 'se muestrea por debajo de 2f<sub>máx</sub>', 'la señal es digital', 'hay ruido térmico'], a: 1, e: 'Las muestras coinciden con las de otra señal más lenta.' },
        { q: '¿Para qué se usa un filtro pasa bajos antes de muestrear?', o: ['para amplificar', 'para limitar la banda y evitar aliasing', 'para modular', 'para cuantificar'], a: 1, e: 'Filtro antialiasing.' },
        { q: 'La voz telefónica se muestrea a…', o: ['4 kHz', '8 kHz', '44,1 kHz', '64 kHz'], a: 1, e: 'Voz limitada a 4 kHz.' },
      ],
      open: [
        { t: 'num', q: 'Un audio tiene componentes hasta 20 kHz. ¿Frecuencia mínima de muestreo en kHz?', a: 40, u: 'kHz', e: '<p>2 × 20 = 40 kHz (el CD usa 44,1 kHz para dejar margen al filtro).</p>' },
        { t: 'num', q: 'Una señal de 3 kHz se muestrea a 5 kHz. ¿A qué frecuencia (kHz) aparece el alias?', a: 2, u: 'kHz', e: '<p>|f − f<sub>s</sub>| = |3 − 5| = 2 kHz: como f<sub>s</sub> &lt; 2f, la señal reconstruida parece de 2 kHz.</p>' },
        { t: 'text', q: 'Enunciá el teorema de muestreo.', k: [['limitada en banda', 'limitada'], ['muestra'], ['doble', '2', 'dos veces'], ['maxima', 'mayor', 'fmax']], need: 3, e: '<p>Una señal limitada en banda puede reconstruirse completamente a partir de sus muestras si la frecuencia de muestreo es al menos el doble de su máxima frecuencia: f<sub>s</sub> ≥ 2f<sub>máx</sub>.</p>' },
      ],
    },
    {
      id: 'nyquist-capacidad',
      module: 'u5',
      title: 'Capacidad de un canal sin ruido: Nyquist',
      keywords: 'Nyquist canal ideal sin ruido capacidad 2B log2 M niveles dibits ancho de banda velocidad máxima canal de voz',
      tldr: 'En un canal ideal (sin ruido) de ancho de banda B, Nyquist demostró que la velocidad máxima es <mark>C = 2B·log₂M</mark> [bps], con M niveles de señal. Con 2 niveles, C = 2B. Más niveles, más bits por símbolo; pero en un canal real el ruido limita cuántos niveles se pueden distinguir.',
      goals: ['Calcular la capacidad de Nyquist para M niveles.', 'Explicar por qué no se pueden agregar niveles sin límite.'],
      body: `
        ${eq('C = 2B·log₂M [bps]', 'Capacidad de Nyquist (canal ideal sin ruido)')}
        <p>Un canal de ancho de banda B admite como máximo <strong>2B símbolos por segundo</strong> sin que se superpongan; cada símbolo de M niveles lleva log₂M bits.</p>
        <p>Ejemplo 5 de la guía: canal de voz de 3100 Hz con un módem binario → C = 2 × 3100 × 1 = <strong>6200 bps</strong>. Con 4 niveles (dibits): 2 × 3100 × 2 = <strong>12 400 bps</strong>.</p>
        ${table(['M (niveles)', 'bits/símbolo', 'C con B = 3100 Hz'], [2, 4, 8, 16, 64].map((M) => [M, X.log2(M), `${num(X.nyquist(3100, M))} bps`]))}
        ${note('Nyquist sugiere que bastaría con agregar niveles para subir la capacidad sin límite. No es así: el receptor tiene que <strong>distinguir</strong> los niveles, y el ruido lo impide cuando están muy juntos. Además, a mayor velocidad más daño hace el ruido. Shannon puso ese límite.', 'warn')}`,
      exercises: [
        { title: 'Cobre de 20 MHz con 4 niveles', official: '5.2', level: 1, prompt: '<p>Un medio de cobre tiene 20 MHz de ancho de banda y se supone ideal (sin ruido). ¿Cuántos bps se pueden enviar con señales digitales de 4 niveles?</p>', solution: { explain: `<p>C = 2B·log₂M = 2 × 20·10⁶ × log₂4 = 2 × 20·10⁶ × 2 = <strong>${eng(X.nyquist(20e6, 4), 'bps')}</strong>.</p>` } },
      ],
      quiz: [
        { q: 'La fórmula de Nyquist para un canal sin ruido es…', o: ['C = B log₂(1 + S/N)', 'C = 2B log₂M', 'C = B/2', 'C = 2B/M'], a: 1, e: 'M = niveles.' },
        { q: 'Un canal de 4 kHz con 2 niveles admite como máximo…', o: ['4 kbps', '8 kbps', '16 kbps', '2 kbps'], a: 1, e: '2 × 4000 × 1.' },
        { q: 'Si se pasa de 4 a 16 niveles en el mismo canal ideal, la capacidad…', o: ['se duplica', 'se cuadruplica', 'no cambia', 'baja'], a: 0, e: 'log₂16/log₂4 = 4/2.' },
        { q: '¿Qué limita en la práctica la cantidad de niveles?', o: ['El ancho de banda', 'El ruido', 'La longitud de onda', 'La entropía'], a: 1, e: 'Los niveles muy cercanos no se distinguen.' },
      ],
      open: [
        { t: 'num', q: 'Canal ideal de 3 kHz con 8 niveles: ¿capacidad en kbps?', a: 18, u: 'kbps', e: '<p>C = 2 × 3000 × 3 = 18 000 bps = 18 kbps.</p>' },
        { t: 'num', q: '¿Cuántos niveles hacen falta para mandar 64 kbps por un canal ideal de 8 kHz?', a: 16, u: 'niveles', e: '<p>64 000 = 2 × 8000 × log₂M → log₂M = 4 → M = 16.</p>' },
      ],
    },
    {
      id: 'shannon',
      module: 'u5',
      title: 'Capacidad con ruido: Shannon-Hartley',
      keywords: 'Shannon Hartley capacidad canal con ruido B log2 1 + S/N SNR veces dB eficiencia espectral bps/Hz niveles máximos raíz de 1 + SNR Eb/N0 energía de bit',
      tldr: 'Con ruido, la capacidad máxima es <mark>C = B·log₂(1 + S/N)</mark>, con la SNR <strong>en veces</strong>. La <strong>eficiencia espectral</strong> C/B = log₂(1 + S/N) [bps/Hz] solo depende de la calidad del canal. Igualando con Nyquist, la cantidad máxima de niveles distinguibles es <strong>M = √(1 + S/N)</strong>.',
      goals: ['Calcular la capacidad de Shannon pasando la SNR de dB a veces.', 'Calcular la eficiencia espectral y los niveles máximos.', 'Despejar la SNR o el ancho de banda necesarios.', 'Resolver los ejercicios 4 a 8 del TP 5.', 'Relacionar SNR con E<sub>b</sub>/N₀.'],
      body: `
        ${eq('C = B·log₂(1 + S/N) [bps]', 'Capacidad de Shannon (canal con ruido blanco)')}
        ${note('La SNR va <strong>en veces</strong>: 24 dB → 10<sup>2,4</sup> = 251 (la guía usa 255 para que 1 + SNR = 256); 20 dB → 100; 30 dB → 1000.', 'warn')}
        <h3>Ejemplos de la guía</h3>
        <ul>
          <li>Canal entre 3 y 4 MHz (B = 1 MHz) con 24 dB: C = 10⁶ × log₂256 = <strong>8 Mbps</strong>.</li>
          <li>Canal de voz de 3000 Hz con S/N = 1023: C = 3000 × 10 = <strong>30 kbps</strong>. Con S/N = 100: 19 975 bps; con 1000: 29 902 bps.</li>
          <li>Para 20 Mbps en 3 MHz: log₂(1 + SNR) = 20/3 → SNR = 2<sup>6,67</sup> − 1 ≈ 100 → <strong>20 dB</strong>.</li>
        </ul>
        ${lab(0)}
        <h2>Eficiencia espectral</h2>
        ${eq('E = C/B = log₂(1 + S/N) [bps/Hz]', 'Eficiencia espectral máxima')}
        <p>Cuántos bits por segundo entran por cada Hz del canal: <strong>depende solo del ruido</strong>. Subir la potencia ayuda poco (es logarítmica) y además aumenta las no linealidades; subir B también mete más ruido (N = kTB), así que la SNR baja.</p>
        <h2>Shannon-Hartley: niveles máximos</h2>
        ${eq('2B·log₂M = B·log₂(1 + S/N) → M = √(1 + S/N)', 'Niveles distinguibles')}
        <p>La raíz convierte la relación de potencias en una relación de tensiones. Ejemplo 11: 24 dB → M = √256 = <strong>16 niveles</strong>. Ejemplo 12: 20 dB → M = √101 = 10,04 → <strong>8 niveles</strong> (potencia de 2 inferior).</p>
        <h2>E<sub>b</sub>/N₀</h2>
        ${eq(`${frac('S', 'N')} = ${frac('E<sub>b</sub>/T<sub>b</sub>', 'N₀·B')} = ${frac('E<sub>b</sub>', 'N₀')} · ${frac('R', 'B')} &nbsp;&nbsp; → &nbsp; ${frac('E<sub>b</sub>', 'N₀')} = ${frac('SNR', 'R/B')}`, 'Relación entre SNR y Eb/N0')}
        <p>E<sub>b</sub>/N₀ es la “SNR por bit”: energía de cada bit sobre la densidad de ruido. Sirve para comparar la BER de distintas modulaciones sin depender del ancho de banda (adimensional).</p>`,
      labs: [{ type: 'shannon', title: 'Capacidad de Shannon y niveles de Nyquist', intro: 'Canal WiFi de 20 MHz. Duplicá la SNR (sumá 3 dB): ¿se duplica C?', B: 20, snr: 10 }],
      exercises: [
        { title: 'Canal WiFi de 20 MHz con SNR = 10', official: '5.4', level: 2, prompt: '<p>Canal WiFi de 20 MHz con SNR de 10 veces. a) Máxima velocidad. b) Eficiencia espectral y su significado. c) Máximo nivel de señales digitales. d) Para duplicar la capacidad con el mismo ancho de banda se propone duplicar la SNR a 20 veces. ¿Alcanza?</p>',
          solution: { explain: `<p><b>a)</b> C = 20·10⁶ × log₂(1 + 10) = 20·10⁶ × 3,459 = <strong>${eng(c4, 'bps')}</strong>.</p><p><b>b)</b> E = C/B = log₂11 = <strong>${num(X.log2(11), 3)} bps/Hz</strong>: cada Hz del canal transporta como máximo ~3,46 bit/s; depende solo de la SNR.</p><p><b>c)</b> M = √(1 + 10) = 3,32 → <strong>2 niveles</strong> (potencia de 2 inferior; con 4 niveles el ruido ya no permite distinguirlos con seguridad).</p><p><b>d)</b> Con SNR = 20: C = 20·10⁶ × log₂21 = ${eng(c4b, 'bps')}, solo un ${num((c4b / c4 - 1) * 100, 0)} % más. <strong>No alcanza</strong>: la capacidad crece con el logaritmo de la SNR. Para duplicarla hace falta log₂(1 + SNR) = 2·log₂11 → 1 + SNR = 121 → <strong>SNR = 120</strong> (20,8 dB).</p>` } },
        { title: 'Teclado de 120 caracteres por línea telefónica', official: '5.5', level: 2, prompt: '<p>Un teclado de 120 caracteres envía palabras binarias. a) Bits por carácter. b) ¿Cuántos caracteres por segundo por una línea de 3,2 kHz y SNR de 20 dB?</p>',
          solution: { explain: `<p><b>a)</b> log₂120 = 6,91 → hacen falta <strong>7 bits</strong> (palabras binarias enteras).</p><p><b>b)</b> SNR = 10<sup>2</sup> = 100. C = 3200 × log₂101 = <strong>${num(c5, 0)} bps</strong>. Caracteres/s = ${num(c5, 0)}/7 ≈ <strong>${num(c5 / 7, 0)} caracteres/s</strong>. (Si se usa la información por carácter, 6,91 bits, como en el ejemplo 10 de la guía: ${num(c5 / X.log2(120), 0)} caracteres/s, el límite teórico.)</p>` } },
        { title: 'SNR para transmitir a R = 2B', official: '5.6', level: 2, prompt: '<p>Calcular la SNR en dB de un canal telefónico para transmitir dígitos binarios a R = 2B bps.</p>', solution: { explain: `<p>Hace falta C ≥ 2B: B·log₂(1 + S/N) = 2B → log₂(1 + S/N) = 2 → S/N = 3 → <strong>${num(X.dB(3), 2)} dB</strong>. Es la SNR mínima para llegar a la velocidad de Nyquist con 2 niveles.</p>` } },
        { title: 'Ancho de banda para TV', official: '5.7', level: 3, prompt: '<p>Una imagen de TV tiene 720 líneas de 1280 elementos con 8 niveles equiprobables de brillo; 25 imágenes por segundo, canal con S/N = 31. ¿Qué ancho de banda hace falta?</p>', solution: { explain: `<p>Información por elemento: log₂8 = 3 bits. R = 720 × 1280 × 3 × 25 = <strong>${eng(R7, 'bps')}</strong>. Con R = C = B·log₂(1 + 31) = 5B → B = ${eng(R7, 'bps')}/5 = <strong>${eng(R7 / 5, 'Hz')}</strong>.</p>` } },
        { title: 'Tiempo mínimo para 600 dígitos decimales', official: '5.8', level: 2, prompt: '<p>Tiempo mínimo para transmitir 600 dígitos decimales por un canal de 1 kHz con S/N = 15.</p>', solution: { explain: `<p>Información: 600 × log₂10 = ${num(I8, 1)} bits. C = 1000 × log₂16 = 4000 bps. t = ${num(I8, 1)}/4000 = <strong>${num(I8 / C8, 3)} s</strong>.</p>` } },
      ],
      quiz: [
        { q: 'En la fórmula de Shannon, la SNR se usa…', o: ['en dB', 'en veces', 'en dBm', 'en Hz'], a: 1, e: 'Hay que pasar los dB a veces.' },
        { q: 'B = 1 MHz y SNR = 255: C vale…', o: ['1 Mbps', '8 Mbps', '255 Mbps', '2 Mbps'], a: 1, e: 'log₂256 = 8.' },
        { q: 'Duplicar la SNR de un canal con SNR alta…', o: ['duplica C', 'suma aproximadamente B bps a C', 'no cambia C', 'cuadruplica C'], a: 1, e: 'log₂(2x) = 1 + log₂x.' },
        { q: 'La eficiencia espectral máxima depende de…', o: ['el ancho de banda', 'la SNR', 'la frecuencia central', 'la longitud del cable'], a: 1, e: 'E = log₂(1 + S/N).' },
        { q: 'Con SNR = 24 dB (≈ 255), los niveles máximos son…', o: ['8', '16', '255', '4'], a: 1, e: '√256.' },
        { q: 'Si se aumenta B en un canal con ruido blanco…', o: ['la SNR sube', 'la SNR baja porque entra más ruido', 'el ruido no cambia', 'C baja siempre'], a: 1, e: 'N = kTB.' },
        { q: 'E<sub>b</sub>/N₀ es…', o: ['la potencia de ruido', 'la SNR normalizada por bit', 'la tasa de bits', 'la eficiencia espectral'], a: 1, e: 'E<sub>b</sub>/N₀ = SNR/(R/B).' },
      ],
      open: [
        { t: 'num', q: 'Canal de 4 MHz con SNR de 30 dB. ¿Capacidad en Mbps? (2 decimales)', a: X.shannon(4e6, 1000) / 1e6, tol: 0.005, u: 'Mbps', e: `<p>SNR = 1000. C = 4·10⁶ × log₂1001 = ${num(X.shannon(4e6, 1000) / 1e6, 2)} Mbps.</p>` },
        { t: 'num', q: 'WiFi de 20 MHz con SNR 20 dB: ¿capacidad en Mbps? (2 decimales)', a: X.shannon(20e6, 100) / 1e6, tol: 0.005, u: 'Mbps', e: `<p>C = 20·10⁶ × log₂101 = ${num(X.shannon(20e6, 100) / 1e6, 2)} Mbps (ejemplo 13 de la guía).</p>` },
        { t: 'num', q: '¿Qué SNR en dB necesita un canal de 20 MHz para 100 Mbps? (1 decimal)', a: X.dB(2 ** 5 - 1), tol: 0.01, u: 'dB', e: `<p>log₂(1 + SNR) = 100/20 = 5 → SNR = 31 → ${num(X.dB(31), 1)} dB.</p>` },
        { t: 'num', q: 'SNR = 20 dB. Según Shannon-Hartley, ¿cuántos niveles (potencia de 2) se pueden usar?', a: 8, u: 'niveles', e: '<p>M = √101 = 10,04 → 8 niveles.</p>' },
        { t: 'num', q: 'Eficiencia espectral máxima (bps/Hz) con SNR = 15.', a: 4, u: 'bps/Hz', e: '<p>log₂16 = 4 bps/Hz.</p>' },
        { t: 'text', q: '¿Por qué no se puede aumentar indefinidamente la capacidad subiendo la potencia de la señal?', k: [['logarit', 'log'], ['no lineal', 'intermodulacion', 'interfer', 'canales adyacentes', 'ruido']], e: '<p>Porque la capacidad crece con el logaritmo de la SNR (duplicar la potencia suma poco), y porque al subir la potencia aumentan las no linealidades del sistema (ruido de intermodulación) y la interferencia sobre canales adyacentes.</p>' },
      ],
    },
  );

  // Señal de niveles del ejemplo 4 de la guía, como figura de la primera lección
  function fig4() {
    return chart({ x: [0, 4.3], y: [0, 3.6], h: 170, xl: 't [s]', yl: 'v [V]', ticks: { x: [1, 2, 3, 4], y: [1, 2, 3] }, curves: [{ pts: [[0, 2], [1, 2], [1, 0], [2, 0], [2, 3], [3, 3], [3, 1], [4, 1]], cls: 'c-sig' }], texts: ['10', '00', '11', '01'].map((t, i) => ({ x: i + 0.5, y: 3.3, t, cls: 'c-res' })) }, 'Cuatro niveles: cada símbolo lleva 2 bits. Con dos niveles harían falta pulsos de la mitad de duración para mandar lo mismo en el mismo tiempo.');
  }
})();
