/* Unidad 2 (1er parcial): análisis de señales. Guía "UNIDAD 2 Análisis de Señales 2026" y apuntes 2.2 a 2.8.
   TP 2: período y frecuencia, clasificación, parámetros, serie de Fourier, espectro de Cn, tren de pulsos y filtros.
   Los ejercicios 2 a 6 del TP dependen de gráficos que no vienen en el texto: se resuelven con el método y casos equivalentes. */
(() => {
  const { LESSONS, h } = window.GUIDE;
  const { note, def, table, eq, frac, lab, chart, num } = h;
  const PI = Math.PI;

  LESSONS.push(
    {
      id: 'clasificacion-senales',
      module: 'u2',
      title: 'Qué es una señal y cómo se clasifica',
      keywords: 'señal variable independiente dependiente continua discreta analógica digital determinística aleatoria estocástica periódica aperiódica período fundamental condición de periodicidad',
      tldr: 'Una señal es una función del tiempo que representa información. Se clasifica <strong>en el tiempo</strong> (continua o discreta), <strong>en amplitud</strong> (analógica o digital), según su <strong>determinación</strong> (determinística o aleatoria) y según si se repite (<mark>periódica: f(t) = f(t ± nT)</mark>, o aperiódica).',
      goals: ['Clasificar una señal en los cuatro criterios de la cátedra.', 'Enunciar la condición de periodicidad y el período fundamental.', 'Distinguir señal continua de analógica y discreta de digital.'],
      body: `
        <h2>Definición</h2>
        ${def('Señal', 'Función del tiempo t que toma un único valor en cada punto y que representa una información. El tiempo es la variable independiente; el valor que toma (tensión, corriente, potencia) es la variable dependiente.', 'Guía de la Unidad 2')}
        <p>La información está en el <strong>patrón que varía</strong>. El éxito de la transmisión depende de la calidad de la señal y de las características del medio.</p>
        <h2>Cuatro criterios de clasificación</h2>
        ${table(['Criterio', 'Clases', 'Cómo distinguirlas'], [
          ['<strong>En el tiempo</strong>', 'Continua · Discreta', 'Continua: t es real, x(t) existe para todo t. Discreta: n es entero, x[n] solo existe en instantes aislados (x[0,5] no está definido). Suelen venir del muestreo de una analógica.'],
          ['<strong>En amplitud</strong>', 'Analógica · Digital', 'Analógica: la amplitud toma cualquier valor de un rango (análoga al fenómeno físico). Digital: solo ciertos valores discretos (niveles); la crea el hombre.'],
          ['<strong>Determinación</strong>', 'Determinística · Aleatoria', 'Determinística: no hay incertidumbre, una ecuación y = f(t) la describe. Aleatoria (proceso estocástico): no se sabe qué valor toma en cada instante; se describe con probabilidades (el ruido).'],
          ['<strong>Repetición</strong>', 'Periódica · Aperiódica', 'Periódica: repite ciclos. Aperiódica: no se repite (período infinito).'],
        ])}
        ${note('Son criterios independientes: una señal digital puede ser continua en el tiempo (un tren de pulsos NRZ en el cable) o discreta (una secuencia de muestras cuantificadas). Analógica y digital hablan de la <strong>amplitud</strong>; continua y discreta, del <strong>tiempo</strong>.', 'warn')}
        <h2>Condición de periodicidad</h2>
        ${eq('f(t) = f(t ± nT) para todo t, con n entero', 'Señal continua periódica')}
        ${eq('x[n] = x[n ± mN]', 'Señal discreta periódica')}
        <p>El <strong>período fundamental T₀</strong> es el <strong>menor</strong> valor positivo de T que cumple la condición. La cátedra agrega que también la derivada debe repetirse: df(t)/dt = df(t + nT)/dt, es decir, la forma completa (valor y pendiente) se repite.</p>
        ${lab(0)}`,
      labs: [
        { type: 'classify', title: 'Clasificá en amplitud y tiempo', buckets: ['Analógica continua', 'Analógica discreta', 'Digital continua', 'Digital discreta'], items: [
          { t: 'La tensión de un micrófono mientras alguien habla', b: 0 },
          { t: 'Las muestras (sin cuantificar) de esa tensión tomadas cada 125 µs', b: 1 },
          { t: 'Una señal NRZ de ±5 V en un cable', b: 2 },
          { t: 'Las muestras cuantificadas a 8 bits de un audio PCM', b: 3 },
          { t: 'La temperatura del cuerpo registrada en forma continua', b: 0 },
          { t: 'La salida de un reloj digital (onda cuadrada 0/5 V)', b: 2 },
        ] },
      ],
      exercises: [
        { title: 'Clasificación y características de una señal', official: '2.3', level: 1, prompt: '<p>Para la señal propuesta en el TP (una senoidal): a) ¿es determinística, aleatoria o estocástica? Explicar cada una. b) ¿Es periódica? ¿Por qué? c) ¿Cuáles son las condiciones de periodicidad? d) Inferir A, f (eje x en ms), T, λ y φ. e) Graficar su espectro.</p><p class="muted-s">El gráfico no está en el texto del TP: usá el laboratorio de la lección siguiente para practicar el inciso d con cualquier senoidal.</p>',
          solution: { explain: `<p><b>a)</b> Una senoidal es <strong>determinística</strong>: una ecuación A sen(2πft + φ) da su valor en todo instante. Aleatoria o estocástica (sinónimos en la guía) es la que tiene incertidumbre en cada instante, como el ruido. <b>b)</b> Sí: repite su forma cada T. <b>c)</b> f(t) = f(t ± nT) para todo t (y la derivada también se repite); T₀ es el menor T que lo cumple. <b>d)</b> Se lee: A = valor pico; T = tiempo entre dos crestas (en ms); f = 1/T; λ = v/f (en el aire v = 3·10⁸ m/s); φ = cuánto está corrida respecto de un seno que arranca en 0 subiendo: si en t = 0 vale A sen φ, φ = arcsen(f(0)/A) (cuidado con el cuadrante). <b>e)</b> Una sola línea vertical de altura A en f.</p>` } },
        { title: 'Clasificar señales', official: '2.2', level: 1, prompt: '<p>Clasificar las señales del TP en analógicas, digitales, continuas o discretas.</p>', solution: { explain: '<p>Para cada gráfico hacé dos preguntas: ¿la curva existe en todo instante (continua) o solo en puntos aislados (discreta)? ¿La amplitud toma cualquier valor (analógica) o solo algunos niveles (digital)? El laboratorio de la lección tiene los cuatro casos típicos.</p>' } },
      ],
      quiz: [
        { q: 'Una señal discreta es aquella cuya…', o: ['amplitud toma pocos valores', 'variable independiente solo toma valores aislados (enteros)', 'frecuencia es baja', 'forma no se repite'], a: 1, e: 'Discreta habla del tiempo; digital, de la amplitud.' },
        { q: 'El ruido es un ejemplo de señal…', o: ['determinística', 'aleatoria', 'periódica', 'digital'], a: 1, e: 'No se puede predecir su valor: se modela con probabilidades.' },
        { q: 'El período fundamental es…', o: ['el mayor T que cumple f(t) = f(t + T)', 'el menor T positivo que cumple f(t) = f(t + T)', 'siempre 1 s', 'la inversa de la amplitud'], a: 1, e: 'Si T cumple, 2T también; el fundamental es el menor.' },
        { q: 'Una señal NRZ de ±5 V en un cable es…', o: ['analógica continua', 'digital continua', 'digital discreta', 'analógica discreta'], a: 1, e: 'Niveles discretos (digital) pero existe en todo instante (continua).' },
        { q: 'Una señal aperiódica puede pensarse como…', o: ['una periódica de período cero', 'una periódica de período infinito', 'una digital', 'una discreta'], a: 1, e: 'Es la idea que lleva de la serie a la transformada de Fourier.' },
      ],
      open: [
        { t: 'text', q: '¿Cuál es la diferencia entre una señal analógica y una digital?', k: [['amplitud', 'valor'], ['cualquier', 'continu', 'infinitos'], ['discret', 'niveles', 'ciertos valores']], e: '<p>La analógica puede tomar cualquier valor de amplitud dentro de su rango (varía en forma continua); la digital solo toma ciertos valores discretos (niveles).</p>' },
        { t: 'text', q: 'Escribí la condición de periodicidad de una señal continua y definí período fundamental.', k: [['f(t) = f(t', 'f(t)=f(t', 'nt', 't + t', 't+t'], ['menor', 'minimo', 'mas chico']], e: '<p>f(t) = f(t ± nT) para todo t (n entero). El período fundamental T₀ es el menor valor positivo de T que cumple la igualdad.</p>' },
      ],
    },
    {
      id: 'parametros-espectro',
      module: 'u2',
      title: 'Parámetros de una senoidal, espectro y ancho de banda',
      keywords: 'amplitud frecuencia período fase longitud de onda velocidad de propagación frecuencia angular señal compuesta dominio del tiempo dominio de la frecuencia espectro ancho de banda absoluto efectivo armónicas',
      tldr: 'Una senoidal f(t) = A sen(2πft + φ) queda definida por <strong>amplitud A</strong>, <strong>frecuencia f = 1/T</strong> y <strong>fase φ</strong>; viajando por un medio tiene <strong>longitud de onda λ = v/f</strong>. Toda señal es una suma de senoidales: su <mark>espectro</mark> muestra qué frecuencias contiene, y el <mark>ancho de banda</mark> es el rango que ocupan (f<sub>máx</sub> − f<sub>mín</sub>).',
      goals: ['Calcular T, f, ω y λ y convertir entre unidades (ms, µs, s).', 'Pasar una señal compuesta al dominio de la frecuencia.', 'Calcular el ancho de banda absoluto y explicar el efectivo.'],
      body: `
        <h2>La senoidal y sus parámetros</h2>
        ${eq('f(t) = A sen(ωt + φ) = A sen(2πft + φ)', 'Senoidal')}
        ${table(['Parámetro', 'Qué es', 'Unidad'], [
          ['Amplitud A', 'Valor máximo (pico) de la señal', 'V, A, W'],
          ['Período T', 'Duración de un ciclo', 's (ms, µs)'],
          ['Frecuencia f = 1/T', 'Ciclos por segundo', 'Hz'],
          ['Frecuencia angular ω = 2πf = 2π/T', 'Radianes por segundo', 'rad/s'],
          ['Fase φ', 'Posición de la onda respecto del origen de tiempos', '° o rad'],
          ['Longitud de onda λ = v·T = v/f', 'Distancia que recorre la onda en un período', 'm'],
        ])}
        ${note('Ejemplos de la guía: sonido a 340 m/s y 20 kHz → λ = 340/20 000 = 0,017 m = <strong>17 mm</strong>. WiFi a 2,4 GHz en el espacio libre → λ = 3·10⁸/2,4·10⁹ = <strong>12,5 cm</strong>.', 'tip')}
        ${lab(0)}
        <h2>Señales compuestas y espectro</h2>
        <p>Fourier mostró que una señal periódica es una suma de senoidales de frecuencias múltiplos de la fundamental. El ejemplo de la cátedra:</p>
        ${eq('f(t) = 15 + 10 sen(2π·8t) + 5 sen(2π·16t)', 'Señal compuesta')}
        <p>Tiene una <strong>componente continua</strong> de 15 (f = 0), una <strong>fundamental</strong> de 8 Hz y una armónica de 16 Hz. En el <strong>dominio del tiempo</strong> se ve una curva ondulada; en el <strong>dominio de la frecuencia</strong>, tres líneas verticales: en 0, 8 y 16 Hz con alturas 15, 10 y 5. Eso es el <strong>espectro</strong>.</p>
        ${lab(1)}
        <h2>Ancho de banda</h2>
        ${def('Ancho de banda absoluto', 'Diferencia entre la frecuencia más alta y la más baja que contiene una señal compuesta. Se mide en Hz.', 'Guía de la Unidad 2')}
        ${eq('B = f<sub>máx</sub> − f<sub>mín</sub>', 'Ancho de banda')}
        ${def('Ancho de banda efectivo', 'El ancho de banda que contiene la mayor parte de la energía del espectro de la señal.', 'Guía de la Unidad 2')}
        <p>Una onda cuadrada tiene infinitas armónicas (ancho de banda absoluto infinito), pero casi toda su energía está en las primeras: su ancho de banda efectivo es finito. Generalmente, <strong>a mayor ancho de banda, mayor capacidad de transportar información</strong> (lo cuantifica Shannon en la Unidad 5).</p>
        ${note('Error típico: decir que el ancho de banda de una señal entre 450 y 500 Hz es 500 Hz. Es 500 − 450 = <strong>50 Hz</strong>. Un canal WiFi de 2412 MHz de frecuencia central ocupa 22 MHz (en 802.11b): el ancho de banda no es la frecuencia.', 'exam')}`,
      labs: [
        { type: 'wave', title: 'Una senoidal en el tiempo y en la frecuencia', intro: 'Mové amplitud, frecuencia y fase. ¿Qué cambia en el espectro cuando cambia la fase?', A: 3, f: 250 },
        { type: 'compose', title: 'Señal compuesta y ancho de banda', intro: 'Arranca con el ejemplo de la cátedra: 15 + 10 sen 2π8t + 5 sen 2π16t. Agregá la tercera armónica y mirá cómo cambia el ancho de banda.' },
      ],
      exercises: [
        { title: 'Período, frecuencia y espectro', official: '2.1', level: 1, prompt: '<p>a) Una onda senoidal completa su ciclo en 20 ms. Indicar T (en µs y en s) y f en Hz. b) El ancho de banda de una señal periódica es 50 Hz y la frecuencia más alta 500 Hz. Calcular la más baja y dibujar el espectro si contiene todas las frecuencias enteras con la misma amplitud.</p>',
          solution: { explain: `<p><b>a)</b> T = 20 ms = 20 000 µs = 0,02 s; f = 1/T = 1/0,02 s = <strong>50 Hz</strong>.</p><p><b>b)</b> B = f<sub>máx</sub> − f<sub>mín</sub> → f<sub>mín</sub> = 500 − 50 = <strong>450 Hz</strong>. El espectro: 51 líneas de igual altura en 450, 451, …, 500 Hz.</p>${chart({ x: [430, 520], y: [0, 1.4], h: 170, xl: 'f [Hz]', yl: 'A', ticks: { x: [450, 475, 500] }, segs: Array.from({ length: 51 }, (_, k) => ({ from: [450 + k, 0], to: [450 + k, 1], cls: 'stem c-sig' })), texts: [{ x: 475, y: 1.25, t: 'B = 50 Hz', cls: 'c-res' }] }, 'Todas las frecuencias enteras entre 450 y 500 Hz con la misma amplitud.')}` } },
        { title: 'Longitud de onda en distintos medios', level: 1, prompt: '<p>Calcular λ para: a) una portadora WiFi de 5,8 GHz en el aire; b) una señal de 100 MHz en un coaxial con v = 2·10⁸ m/s; c) un tono de 1 kHz en el aire (sonido).</p>', solution: { explain: '<p>a) λ = 3·10⁸/5,8·10⁹ = 0,0517 m ≈ <strong>5,17 cm</strong>. b) λ = 2·10⁸/10⁸ = <strong>2 m</strong>. c) λ = 340/1000 = <strong>0,34 m</strong>. A mayor frecuencia, menor λ (y antenas más chicas).</p>' } },
      ],
      quiz: [
        { q: 'Una señal tiene T = 4 ms. Su frecuencia es…', o: ['4 Hz', '25 Hz', '250 Hz', '4000 Hz'], a: 2, e: 'f = 1/0,004 = 250 Hz.' },
        { q: 'La longitud de onda de una señal de 2,4 GHz en el espacio libre es…', o: ['1,25 m', '12,5 cm', '1,25 cm', '125 m'], a: 1, e: '3·10⁸/2,4·10⁹ = 0,125 m.' },
        { q: 'Una señal contiene componentes de 300 Hz a 3400 Hz. Su ancho de banda es…', o: ['3400 Hz', '3100 Hz', '3700 Hz', '300 Hz'], a: 1, e: 'B = f<sub>máx</sub> − f<sub>mín</sub>.' },
        { q: 'En f(t) = 15 + 10 sen(2π·8t) + 5 sen(2π·16t), el 15 es…', o: ['la fundamental', 'la componente continua', 'la segunda armónica', 'la fase'], a: 1, e: 'Componente de frecuencia cero.' },
        { q: 'El espectro de una senoidal pura es…', o: ['una línea a su frecuencia', 'una banda continua', 'infinitas líneas', 'una sinc'], a: 0, e: 'Ancho de banda cero.' },
        { q: 'Cambiar la fase de una senoidal modifica…', o: ['su espectro de amplitud', 'su posición en el tiempo', 'su frecuencia', 'su amplitud'], a: 1, e: 'El espectro de amplitud no cambia.' },
        { q: 'El ancho de banda efectivo es…', o: ['la frecuencia más alta', 'el rango que contiene la mayor parte de la energía', 'siempre infinito', 'la frecuencia de la fundamental'], a: 1, e: 'Por eso las señales digitales tienen ancho de banda efectivo finito.' },
      ],
      open: [
        { t: 'num', q: 'Una senoidal completa 8 ciclos en 2 ms. ¿Cuál es su frecuencia en kHz?', a: 4, u: 'kHz', e: '<p>T = 2 ms/8 = 0,25 ms → f = 1/0,25 ms = 4000 Hz = 4 kHz.</p>' },
        { t: 'num', q: '¿Cuál es la longitud de onda (en cm) de una portadora WiFi de 5 GHz en el aire?', a: 6, u: 'cm', e: '<p>λ = c/f = 3·10⁸/5·10⁹ = 0,06 m = 6 cm.</p>' },
        { t: 'num', q: 'Una señal tiene componentes de 1, 3, 5 y 7 kHz. ¿Cuál es su ancho de banda en kHz?', a: 6, u: 'kHz', e: '<p>B = 7 − 1 = 6 kHz.</p>' },
        { t: 'text', q: '¿Qué muestra el espectro de una señal y qué es su ancho de banda?', k: [['frecuencia'], ['amplitud', 'componentes', 'contiene'], ['diferencia', 'maxima', 'rango', 'mayor y la menor']], e: '<p>El espectro muestra las componentes de frecuencia que forman la señal, con su amplitud (dominio de la frecuencia). El ancho de banda es el rango que ocupan: la diferencia entre la frecuencia más alta y la más baja.</p>' },
      ],
    },
    {
      id: 'serie-fourier',
      module: 'u2',
      title: 'Serie de Fourier trigonométrica',
      keywords: 'Fourier serie trigonométrica armónica fundamental coeficientes a0 an bn Dirichlet onda cuadrada simetría par impar componente continua espectro unilateral Gibbs truncada',
      tldr: 'Toda función periódica “razonable” (que cumple las <strong>condiciones de Dirichlet</strong>) es una suma de una constante y senos y cosenos de frecuencias <mark>múltiplos de la fundamental f₀ = 1/T</mark>. Los coeficientes se calculan con integrales sobre un período. La onda cuadrada ±1 da f(t) = (4/π)[sen ω₀t + ⅓ sen 3ω₀t + ⅕ sen 5ω₀t + …]: solo armónicas impares.',
      goals: ['Escribir la serie y las fórmulas de a₀, aₙ y bₙ.', 'Enunciar las condiciones de Dirichlet.', 'Calcular la serie de la onda cuadrada y usar la simetría para ahorrar cuentas.', 'Dibujar el espectro unilateral de las primeras armónicas.'],
      body: `
        <h2>La serie</h2>
        ${eq(`f(t) = ${frac('a₀', '2')} + Σ<sub>n=1</sub><sup>∞</sup> [aₙ cos(nω₀t) + bₙ sen(nω₀t)]`, 'Serie trigonométrica')}
        ${eq(`ω₀ = 2πf₀ = ${frac('2π', 'T')}`, 'Frecuencia angular fundamental')}
        <p>La componente de frecuencia nω₀ es la <strong>n-ésima armónica</strong>; la primera (n = 1) es la <strong>fundamental</strong> y tiene el mismo período que f(t). a₀/2 es la <strong>componente continua</strong> (valor medio).</p>
        ${eq(`a₀ = ${frac('2', 'T')} ∫<sub>−T/2</sub><sup>T/2</sup> f(t) dt &nbsp;&nbsp; aₙ = ${frac('2', 'T')} ∫<sub>−T/2</sub><sup>T/2</sup> f(t) cos(nω₀t) dt &nbsp;&nbsp; bₙ = ${frac('2', 'T')} ∫<sub>−T/2</sub><sup>T/2</sup> f(t) sen(nω₀t) dt`, 'Coeficientes')}
        <h2>Condiciones de Dirichlet</h2>
        <ul><li>f(t) periódica de período T.</li><li>Número <strong>finito de máximos y mínimos</strong> en un período.</li><li>Número <strong>finito de discontinuidades</strong>, ninguna infinita.</li><li>f y f′ seccionalmente continuas.</li><li><strong>Absolutamente integrable</strong> en un período: ∫<sub>T</sub>|f(t)|dt &lt; ∞.</li></ul>
        <h2>Ejemplo de la cátedra: onda cuadrada ±1</h2>
        <p>f(t) = −1 para −T/2 &lt; t &lt; 0 y f(t) = 1 para 0 &lt; t &lt; T/2.</p>
        <ol>
          <li><strong>a₀</strong> = (2/T)[∫<sub>−T/2</sub><sup>0</sup> −dt + ∫<sub>0</sub><sup>T/2</sup> dt] = (2/T)(−T/2 + T/2) = <strong>0</strong>: el valor medio es cero.</li>
          <li><strong>aₙ</strong> = (2/T)[−sen(nω₀t)/(nω₀)|<sub>−T/2</sub><sup>0</sup> + sen(nω₀t)/(nω₀)|<sub>0</sub><sup>T/2</sup>]; como nω₀·T/2 = nπ y sen(±nπ) = 0, <strong>aₙ = 0</strong>.</li>
          <li><strong>bₙ</strong> = (2/(nω₀T))[1 − cos(nπ) − cos(nπ) + 1] = (2/(nπ))(1 − cos nπ) = (2/(nπ))(1 − (−1)ⁿ): vale <strong>0 para n par y 4/(nπ) para n impar</strong>.</li>
        </ol>
        ${eq(`f(t) = ${frac('4', 'π')} [sen ω₀t + ${frac('1', '3')} sen 3ω₀t + ${frac('1', '5')} sen 5ω₀t + ${frac('1', '7')} sen 7ω₀t + …]`, 'Serie de la onda cuadrada')}
        ${lab(0)}
        <h2>Atajos por simetría</h2>
        ${table(['Si f es…', 'Entonces', 'Ejemplo'], [
          ['<strong>Par</strong>: f(−t) = f(t)', 'bₙ = 0: solo cosenos (y a₀)', 'Triangular centrada, coseno'],
          ['<strong>Impar</strong>: f(−t) = −f(t)', 'a₀ = 0 y aₙ = 0: solo senos', 'Cuadrada ±1 del ejemplo, diente de sierra'],
          ['Simetría de <strong>media onda</strong>: f(t + T/2) = −f(t)', 'Solo armónicas impares', 'Cuadrada, triangular'],
        ])}
        ${note('La componente continua se estima a ojo: es el <strong>valor medio</strong> (área de un período dividida por T). Una cuadrada que va de 0 a A con ciclo del 50 % tiene continua A/2. Cambiar el período (T = 1 s o T = 10 s) <strong>no cambia los coeficientes</strong>, solo las frecuencias de las armónicas (n/T): eso pregunta el TP 2.', 'exam')}
        <h2>Señal truncada</h2>
        <p>En la práctica, un canal deja pasar solo las primeras armónicas: la señal recibida es la serie <strong>truncada</strong>. Con hasta la 7.ª armónica la cuadrada ya se reconoce; con 49 o 99 casi no se distingue, salvo un sobrepico cerca de los saltos (fenómeno de Gibbs). Esto conecta ancho de banda con forma de la señal: un canal angosto redondea los pulsos.</p>`,
      labs: [
        { type: 'fourier', title: 'Sumas parciales de Fourier', intro: 'Arranca en la onda cuadrada del ejemplo. Sumá armónicas y mirá el espectro: ¿por qué las pares no aparecen?', fn: 'sq', n: 5 },
      ],
      exercises: [
        { title: 'Serie de Fourier de una función periódica', official: '2.4', level: 2, prompt: '<p>Para la función periódica del TP: a) estimar la componente continua; b) demostrar y calcular los coeficientes de la serie trigonométrica; c) ¿cómo cambian los coeficientes con T = 1 s y con T = 10 s?; d) expresar f(t) con las primeras cinco armónicas existentes (amplitudes y frecuencias); e) indicar la frecuencia fundamental; f) dibujar el espectro de esas cinco armónicas.</p><p class="muted-s">El gráfico no está en el texto del TP. Se resuelve con un tren de pulsos de 0 a A = 1 con ciclo del 50 % (el caso típico); el procedimiento es el mismo para la figura de la práctica.</p>',
          solution: { explain: `<p>Tomando el origen en el comienzo del pulso: f(t) = 1 para 0 &lt; t &lt; T/2 y 0 para T/2 &lt; t &lt; T.</p>
            <p><b>a)</b> Continua = valor medio = (1·T/2)/T = <strong>1/2</strong> (a₀ = 1).</p>
            <p><b>b)</b> aₙ = (2/T)∫<sub>0</sub><sup>T/2</sup> cos(nω₀t)dt = (2/T)·sen(nπ)/(nω₀) = 0. bₙ = (2/T)∫<sub>0</sub><sup>T/2</sup> sen(nω₀t)dt = (2/T)(1 − cos nπ)/(nω₀) = (1 − (−1)ⁿ)/(nπ) → <strong>bₙ = 2/(nπ) para n impar</strong> y 0 para n par.</p>
            <p><b>c)</b> Los coeficientes <strong>no dependen de T</strong> (al integrar, T se simplifica). Lo que cambia es f₀ = 1/T: con T = 1 s las armónicas están en 1, 3, 5… Hz; con T = 10 s, en 0,1, 0,3, 0,5… Hz.</p>
            <p><b>d)</b> Con T = 1 s: f(t) = 0,5 + 0,637 sen(2π·1t) + 0,212 sen(2π·3t) + 0,127 sen(2π·5t) + 0,091 sen(2π·7t) + 0,071 sen(2π·9t).</p>
            <p><b>e)</b> f₀ = 1/T (1 Hz para T = 1 s).</p>
            ${chart({ x: [-0.6, 10], y: [0, 0.75], h: 190, xl: 'f [Hz]', yl: 'cₙ', ticks: { x: [1, 3, 5, 7, 9], y: [0.5] }, segs: [[0, 0.5], [1, 2 / PI], [3, 2 / (3 * PI)], [5, 2 / (5 * PI)], [7, 2 / (7 * PI)], [9, 2 / (9 * PI)]].map(([f, a], i) => ({ from: [f, 0], to: [f, a], cls: `stem ${i ? 'c-sig' : 'c-res'}` })) }, '<b>f)</b> Espectro con T = 1 s: continua 0,5 y armónicas impares con amplitud 2/(nπ).')}` } },
      ],
      quiz: [
        { q: 'Las armónicas de una señal periódica de período T están en…', o: ['frecuencias cualesquiera', 'múltiplos enteros de 1/T', 'solo en 1/T', 'divisores de T'], a: 1, e: 'f = n·f₀ = n/T.' },
        { q: 'En la onda cuadrada ±1 simétrica, los coeficientes aₙ son…', o: ['4/(nπ)', 'cero', '1/n', '2/(nπ)'], a: 1, e: 'Es impar: solo senos.' },
        { q: 'Si una función es par, entonces…', o: ['aₙ = 0', 'bₙ = 0', 'a₀ = 0', 'no tiene serie'], a: 1, e: 'Solo quedan cosenos y la continua.' },
        { q: 'La amplitud de la 3.ª armónica de la cuadrada ±1 es…', o: ['4/π', '4/(3π)', '3/(4π)', '0'], a: 1, e: 'bₙ = 4/(nπ) para n impar.' },
        { q: '¿Qué pasa con los coeficientes si el período pasa de 1 s a 10 s?', o: ['se dividen por 10', 'no cambian; cambian las frecuencias', 'se multiplican por 10', 'desaparecen las armónicas impares'], a: 1, e: 'Las armónicas se juntan: f₀ = 0,1 Hz.' },
        { q: '¿Cuál NO es una condición de Dirichlet?', o: ['Finitos máximos y mínimos por período', 'Finitas discontinuidades finitas', 'Absolutamente integrable', 'Que sea una función par'], a: 3, e: 'La paridad solo simplifica el cálculo.' },
        { q: 'a₀/2 representa…', o: ['la amplitud de la fundamental', 'el valor medio (componente continua)', 'la fase', 'la potencia'], a: 1, e: 'Componente de frecuencia cero.' },
      ],
      open: [
        { t: 'num', q: 'En la serie de la onda cuadrada ±1, ¿cuánto vale la amplitud de la 5.ª armónica? (con 3 decimales)', a: 4 / (5 * PI), tol: 0.01, e: `<p>b₅ = 4/(5π) = ${num(4 / (5 * PI), 4)}.</p>` },
        { t: 'num', q: 'Una cuadrada va de 0 a 6 V con ciclo de trabajo del 50 %. ¿Cuánto vale su componente continua en V?', a: 3, u: 'V', e: '<p>Valor medio = 6·(T/2)/T = 3 V.</p>' },
        { t: 'num', q: 'Una señal periódica tiene T = 0,5 ms. ¿A qué frecuencia (en kHz) está su 3.ª armónica?', a: 6, u: 'kHz', e: '<p>f₀ = 1/0,5 ms = 2 kHz; 3.ª armónica: 3·2 = 6 kHz.</p>' },
        { t: 'text', q: '¿Qué dice el teorema de Fourier sobre las funciones periódicas?', k: [['periodica'], ['suma', 'serie'], ['seno', 'coseno', 'senoidal', 'sinusoidal'], ['multiplo', 'armonica', 'fundamental']], e: '<p>Toda función periódica de comportamiento razonable (que cumple Dirichlet) se puede expresar como una suma (serie), posiblemente infinita, de una constante más senos y cosenos de frecuencias múltiplos de la fundamental 1/T.</p>' },
      ],
    },
    {
      id: 'fourier-compleja',
      module: 'u2',
      title: 'Serie compleja, tren de pulsos y transformada de Fourier',
      keywords: 'serie compleja fasores euler Cn espectro bilateral frecuencias negativas tren de pulsos rectangulares sinc ancho del pulso ciclo de trabajo transformada de Fourier señal aperiódica espectro continuo',
      tldr: 'Con las fórmulas de Euler, la serie se escribe como suma de <strong>fasores</strong> e<sup>jnω₀t</sup> con coeficientes <strong>Cₙ</strong>, en frecuencias positivas y negativas. Para un tren de pulsos de ancho p y período T, <mark>Cₙ = (Ap/T)·sinc(nπp/T)</mark>: líneas cada 1/T bajo una envolvente que se anula en <strong>1/p</strong>. Si T → ∞ el pulso queda solo y el espectro se vuelve continuo: la <strong>transformada de Fourier</strong>.',
      goals: ['Pasar de la serie trigonométrica a la compleja y relacionar Cₙ con aₙ y bₙ.', 'Calcular C₀, f₀ y el ancho de banda de un tren de pulsos.', 'Explicar qué pasa con el espectro al achicar el pulso o al alargar el período.', 'Distinguir espectro discreto (periódicas) de continuo (aperiódicas).'],
      body: `
        <h2>De senos y cosenos a fasores</h2>
        <p>Usando cos θ = (e<sup>jθ</sup> + e<sup>−jθ</sup>)/2 y sen θ = (e<sup>jθ</sup> − e<sup>−jθ</sup>)/2j:</p>
        ${eq(`f(t) = Σ<sub>n=−∞</sub><sup>∞</sup> Cₙ e<sup>jnω₀t</sup> &nbsp;&nbsp; Cₙ = ${frac('1', 'T')} ∫<sub>0</sub><sup>T</sup> f(t) e<sup>−jnω₀t</sup> dt`, 'Serie compleja')}
        ${eq(`C₀ = ${frac('a₀', '2')} &nbsp;&nbsp; Cₙ = ${frac('aₙ − jbₙ', '2')} &nbsp;&nbsp; C₋ₙ = ${frac('aₙ + jbₙ', '2')}`, 'Relación con la trigonométrica')}
        <p>Para la cuadrada ±1: Cₙ = −j(1 − (−1)ⁿ)/(nπ) → |Cₙ| = 2/(nπ) para n impar, la mitad de bₙ = 4/(nπ): la amplitud de cada armónica se reparte entre +nf₀ y −nf₀.</p>
        ${table(['Espectro trigonométrico', 'Espectro complejo'], [
          ['Suma de senos y cosenos', 'Suma de fasores'], ['Solo frecuencias positivas (unilateral)', 'Frecuencias positivas y negativas (bilateral)'], ['Componentes siempre reales', 'Componentes reales o imaginarias'], ['Discreto en frecuencia, analógico en amplitud', 'Discreto en frecuencia, analógico en amplitud'],
        ])}
        ${note('Las frecuencias negativas son un resultado matemático de usar fasores, no algo físico. Un espectro dibujado simétrico respecto de f = 0 (con líneas en −f₀, −2f₀…) es el de la <strong>serie compleja</strong>: así se reconoce en el TP 2, ejercicio 5.', 'exam')}
        <h2>Tren de pulsos rectangulares</h2>
        <p>Pulsos de amplitud A y ancho p, centrados en el origen, que se repiten cada T:</p>
        ${eq(`Cₙ = ${frac('A·p', 'T')} · ${frac('sen(nω₀p/2)', 'nω₀p/2')} = ${frac('A·p', 'T')} · sinc(${frac('nπp', 'T')})`, 'Coeficientes del tren de pulsos')}
        ${lab(0)}
        <ul>
          <li>Las armónicas están en múltiplos de <strong>1/T</strong>.</li>
          <li><strong>C₀ = A·p/T</strong> (valor medio: A por el ciclo de trabajo p/T).</li>
          <li>La amplitud baja al subir n, siguiendo la envolvente sinc. El <strong>primer cruce por cero</strong> está en <strong>1/p</strong>: ese es el ancho de banda práctico (lóbulo principal).</li>
          <li>Amplitudes negativas = armónicas desfasadas 180°.</li>
          <li><strong>Pulso más angosto → espectro más ancho</strong>. Período más largo → líneas más juntas.</li>
        </ul>
        <h2>De la serie a la transformada</h2>
        <p>Si T → ∞ con p fijo, la señal deja de ser periódica (queda un solo pulso), nω₀ → ω, ω₀ → dω y la suma se transforma en integral: el espectro pasa de <strong>discreto</strong> a <strong>continuo</strong>.</p>
        ${eq(`F(ω) = ∫<sub>−∞</sub><sup>∞</sup> f(t) e<sup>−jωt</sup> dt &nbsp;&nbsp; f(t) = ${frac('1', '2π')} ∫<sub>−∞</sub><sup>∞</sup> F(ω) e<sup>jωt</sup> dω`, 'Transformada de Fourier y su inversa')}
        ${eq(`Pulso de amplitud A y ancho p: F(ω) = A·p · ${frac('sen(ωp/2)', 'ωp/2')}`, 'Transformada del pulso rectangular')}
        ${table(['Señal', 'Herramienta', 'Espectro'], [['Periódica', 'Serie de Fourier', 'Discreto (líneas en n/T)'], ['Aperiódica', 'Transformada de Fourier', 'Continuo (densidad espectral)']])}`,
      labs: [
        { type: 'pulses', title: 'Tren de pulsos y su espectro sinc', intro: 'Achicá el ancho del pulso p: ¿qué le pasa al primer cero del espectro? Después estirá T al máximo.', A: 1, p: 4, T: 20 },
      ],
      exercises: [
        { title: 'Leer un espectro de Cₙ', official: '2.5', level: 2, prompt: '<p>Para el espectro de Cₙ del TP: a) ¿es el resultado de la serie compleja? b) ¿Tiene componente continua C₀? ¿Cuánto vale? c) ¿Cuál es f₀? d) Dibujar f(t). e) ¿Cuál es su ancho de banda?</p><p class="muted-s">El gráfico no está en el texto. Ejemplo equivalente: líneas en 0, ±1, ±2, ±3 kHz con C₀ = 0,5, C±1 = 0,32, C±2 = 0, C±3 = −0,11.</p>',
          solution: { explain: '<p><b>a)</b> Sí: aparecen líneas en frecuencias negativas (espectro bilateral, simétrico). <b>b)</b> La línea en f = 0 es C₀ = 0,5 (valor medio). <b>c)</b> La separación entre líneas: f₀ = 1 kHz → T = 1 ms. <b>d)</b> C₂ = 0 y las impares alternan signo: es el patrón de un tren de pulsos con ciclo 50 % (p = T/2) y A = 1 (C₀ = Ap/T = 0,5; C₁ = 0,5·sinc(π/2) = 0,318). Se dibuja un tren de pulsos de amplitud 1, ancho 0,5 ms y período 1 ms. <b>e)</b> Con armónicas hasta 3 kHz: B = 3 kHz − 0 = 3 kHz (frecuencias positivas: el ancho de banda físico se mide del lado positivo).</p>' } },
        { title: 'Un pulso de ancho a', official: '2.6', level: 2, prompt: '<p>Para un pulso rectangular f(t) de ancho a: a) ¿su espectro sería el de la serie compleja? b) ¿Tiene C₀? c) Ancho de banda si a = 4 ms. d) Si el pulso se angosta, ¿qué pasa con el ancho de banda? Graficar.</p>',
          solution: { explain: `<p><b>a)</b> Si es un solo pulso (aperiódico), no: su espectro es continuo y se obtiene con la <strong>transformada</strong> de Fourier, F(ω) = A·a·sinc(ωa/2). Si se repite periódicamente, sí, con líneas bajo esa envolvente. <b>b)</b> En f = 0 el espectro vale A·a (área del pulso): hay componente de frecuencia cero (para un tren periódico, C₀ = A·a/T). <b>c)</b> El primer cero está en f = 1/a = 1/4 ms = <strong>250 Hz</strong>: ese es el ancho de banda del lóbulo principal. <b>d)</b> Ancho de banda y duración son inversos: si a baja a 2 ms, B sube a 500 Hz; a 1 ms, 1 kHz.</p>${chart({ x: [-1200, 1200], y: [-0.3, 1.15], h: 200, xl: 'f [Hz]', yl: '|F|/Aa', ticks: { x: [-1000, -500, -250, 250, 500, 1000] }, curves: [{ f: (f) => (f === 0 ? 1 : Math.sin(PI * f * 0.004) / (PI * f * 0.004)), n: 400, cls: 'c-sig', label: 'a = 4 ms' }, { f: (f) => (f === 0 ? 1 : Math.sin(PI * f * 0.002) / (PI * f * 0.002)), n: 400, cls: 'c-res', label: 'a = 2 ms' }] }, 'Al angostar el pulso, el primer cero se aleja de 250 a 500 Hz.')}` } },
      ],
      quiz: [
        { q: 'Un espectro con líneas en frecuencias negativas corresponde a…', o: ['la serie trigonométrica', 'la serie compleja', 'una señal aleatoria', 'un filtro'], a: 1, e: 'Espectro bilateral.' },
        { q: 'En un tren de pulsos, el primer cero del espectro está en…', o: ['1/T', '1/p', 'p/T', 'T/p'], a: 1, e: 'p = ancho del pulso.' },
        { q: 'Si se achica el ancho del pulso, el ancho de banda…', o: ['disminuye', 'aumenta', 'no cambia', 'se anula'], a: 1, e: 'Tiempo y frecuencia son inversos.' },
        { q: 'C₀ de un tren de pulsos de amplitud 2, ancho 1 ms y período 5 ms vale…', o: ['2', '0,4', '0,2', '10'], a: 1, e: 'A·p/T = 2·1/5.' },
        { q: 'El espectro de una señal aperiódica es…', o: ['discreto', 'continuo', 'nulo', 'periódico'], a: 1, e: 'Se calcula con la transformada.' },
        { q: '|Cₙ| de la serie compleja respecto de la amplitud trigonométrica cₙ es…', o: ['el doble', 'la mitad', 'igual', 'el cuadrado'], a: 1, e: 'Se reparte entre +n y −n.' },
      ],
      open: [
        { t: 'num', q: 'Un tren de pulsos tiene ancho p = 0,5 ms. ¿Cuál es su ancho de banda (hasta el primer cero) en kHz?', a: 2, u: 'kHz', e: '<p>B = 1/p = 1/0,5 ms = 2000 Hz = 2 kHz.</p>' },
        { t: 'num', q: 'Pulsos de amplitud 5 V, ancho 2 ms y período 10 ms: ¿cuánto vale C₀ en V?', a: 1, u: 'V', e: '<p>C₀ = A·p/T = 5·2/10 = 1 V.</p>' },
        { t: 'text', q: '¿Qué pasa con el espectro de un tren de pulsos cuando el período T tiende a infinito?', k: [['aperiodic', 'deja de ser periodica', 'un solo pulso'], ['continuo'], ['transformada']], e: '<p>La señal deja de ser periódica (queda un solo pulso), las líneas del espectro se juntan (la separación 1/T → 0) y el espectro pasa de discreto a continuo: se obtiene la transformada de Fourier.</p>' },
      ],
    },
    {
      id: 'filtros',
      module: 'u2',
      title: 'Filtros: tipos y respuesta en frecuencia',
      keywords: 'filtro pasa bajos pasa altos pasa banda rechaza banda frecuencia de corte banda de paso banda atenuada pasivo activo RC primer orden -3 dB 0,707 década octava atenuación fase',
      tldr: 'Un filtro deja pasar algunas frecuencias y atenúa otras: <strong>pasa bajos</strong>, <strong>pasa altos</strong>, <strong>pasa banda</strong> y <strong>rechaza banda</strong>. La <mark>frecuencia de corte</mark> es donde la ganancia cae a 0,707 (<strong>−3 dB</strong>, mitad de potencia). El RC de primer orden tiene f<sub>c</sub> = 1/(2πRC) y cae 20 dB por década.',
      goals: ['Definir filtro y su efecto sobre el espectro.', 'Indicar qué deja pasar cada tipo de filtro.', 'Decidir qué componentes pasan por un filtro dado (TP 2, ejercicio 7).', 'Calcular la frecuencia de corte de un filtro RC.'],
      body: `
        <h2>Qué es un filtro</h2>
        ${def('Filtro', 'Elemento que discrimina una determinada frecuencia o gama de frecuencias de una señal eléctrica que pasa a través de él, pudiendo modificar tanto su amplitud como su fase.', 'Guía de la Unidad 2')}
        <p>Sobre el espectro, el filtro <strong>multiplica</strong> cada componente por su ganancia |H(f)|: las que caen en la banda de paso salen casi iguales, las otras salen atenuadas. Los canales reales se comportan como filtros (por eso tienen un ancho de banda).</p>
        ${table(['Tipo', 'Deja pasar', 'Atenúa'], [
          ['<strong>Pasa bajos</strong>', 'De continua (0 Hz) hasta f<sub>c</sub>', 'Por encima de f<sub>c</sub>'],
          ['<strong>Pasa altos</strong>', 'Por encima de f<sub>c</sub>', 'De 0 a f<sub>c</sub>'],
          ['<strong>Pasa banda</strong>', 'Entre f₁ y f₂', 'Por debajo de f₁ y por encima de f₂'],
          ['<strong>Rechaza banda</strong>', 'Por debajo de f₁ y por encima de f₂', 'Entre f₁ y f₂'],
        ])}
        ${lab(0)}
        <h2>Definiciones</h2>
        <ul>
          <li><strong>Frecuencia de corte</strong>: aquella en la que la ganancia en tensión cae de 1 a 0,707 (−3 dB). La potencia cae a la mitad.</li>
          <li><strong>Banda de paso</strong>: frecuencias que se atenúan menos de 3 dB. <strong>Banda atenuada</strong>: el resto.</li>
          <li><strong>Pasivos</strong>: solo resistencias, capacitores y bobinas; no amplifican, no necesitan alimentación. <strong>Activos</strong>: con amplificadores operacionales; pueden tener ganancia y no cargan a la fuente, pero necesitan alimentación y tienen límite de frecuencia.</li>
          <li><strong>Orden</strong>: cantidad de células básicas. Primer orden: −20 dB/década (−6 dB/octava, cada vez que la frecuencia se duplica). Orden n: −20n dB/década.</li>
        </ul>
        <h2>Filtro RC de primer orden</h2>
        ${eq(`f<sub>c</sub> = ${frac('1', '2πRC')} &nbsp;&nbsp; |G<sub>v</sub>| = ${frac('1', '√(1 + (f/f<sub>c</sub>)²)')} (pasa bajos)`, 'RC: frecuencia de corte y ganancia')}
        <p>La frecuencia de corte es aquella en la que la reactancia del capacitor iguala a la resistencia (X<sub>C</sub> = R). A f<sub>c</sub> la ganancia es 1/√2 = 0,707 y la salida está desfasada 45° respecto de la entrada.</p>
        ${note('Ejemplo: R = 1 kΩ y C = 100 nF → f<sub>c</sub> = 1/(2π·1000·10⁻⁷) ≈ 1592 Hz.', 'tip')}`,
      labs: [
        { type: 'filter', title: '¿Qué componentes pasan?', intro: 'La señal del TP tiene 100, 300, 600 y 1000 Hz. Probá el pasa bajos de 400 Hz y el pasa altos de 500 Hz.', kind: 'lp', fc: 400, order: 2 },
      ],
      exercises: [
        { title: 'Filtros y espectro', official: '2.7', level: 1, prompt: '<p>a) Definir filtro e indicar su efecto en el espectro. b) Para pasa bajos, pasa altos, pasa banda y rechaza banda: qué porción deja pasar y cuál atenúa (esquema de entrada y salida). c) Una señal con 100 Hz, 300 Hz, 600 Hz y 1 kHz se aplica a un pasa bajos de f<sub>c</sub> = 400 Hz y a un pasa altos de f<sub>c</sub> = 500 Hz. ¿Qué componentes pasan?</p>',
          solution: { explain: `<p><b>a)</b> Un filtro discrimina frecuencias: multiplica cada componente del espectro por su ganancia, deja pasar las de la banda de paso y atenúa las demás (también puede cambiar la fase). <b>b)</b> Tabla de la teoría.</p>
            <p><b>c)</b> <strong>Pasa bajos 400 Hz</strong>: pasan <strong>100 y 300 Hz</strong> (por debajo del corte); 600 Hz y 1 kHz se atenúan. <strong>Pasa altos 500 Hz</strong>: pasan <strong>600 Hz y 1 kHz</strong>; 100 y 300 Hz se atenúan.</p>
            ${chart({ x: [0, 1150], y: [0, 1.3], h: 170, xl: 'f [Hz]', yl: 'salida', ticks: { x: [100, 300, 600, 1000] }, curves: [{ pts: [[0, 1], [400, 1], [400, 0], [1150, 0]], cls: 'c-res pl-dash', label: 'PB ideal' }], segs: [[100, 1, 'c-pass'], [300, 1, 'c-pass'], [600, 0.25, 'c-stop'], [1000, 0.1, 'c-stop']].map(([f, a, c]) => ({ from: [f, 0], to: [f, a], cls: `stem ${c}` })) }, 'Pasa bajos de 400 Hz: a la salida quedan 100 y 300 Hz (en un filtro real, 600 Hz y 1 kHz salen muy atenuadas, no en cero).')}
            <p>Ojo con la zona de transición: un filtro real no corta en seco. Con f<sub>c</sub> = 400 Hz y orden 1, 600 Hz cae solo ~5 dB; por eso se usan filtros de orden mayor cuando las componentes están cerca del corte.</p>` } },
      ],
      quiz: [
        { q: 'La frecuencia de corte se define donde la ganancia en tensión cae a…', o: ['0', '0,5', '0,707 (−3 dB)', '0,1 (−20 dB)'], a: 2, e: 'La potencia cae a la mitad.' },
        { q: 'Un filtro que deja pasar entre f₁ y f₂ es…', o: ['pasa bajos', 'pasa altos', 'pasa banda', 'rechaza banda'], a: 2, e: 'El rechaza banda hace lo opuesto.' },
        { q: 'Un filtro RC de primer orden atenúa, lejos del corte…', o: ['6 dB por década', '20 dB por década', '3 dB por década', '40 dB por octava'], a: 1, e: 'Equivale a 6 dB por octava.' },
        { q: 'La frecuencia de corte de un RC es…', o: ['RC', '1/RC', '1/(2πRC)', '2πRC'], a: 2, e: 'Donde X<sub>C</sub> = R.' },
        { q: 'Una componente de 1 kHz atraviesa un pasa bajos de 400 Hz…', o: ['sin cambios', 'atenuada', 'amplificada', 'desplazada a 400 Hz'], a: 1, e: 'Está en la banda atenuada.' },
        { q: 'Una ventaja de los filtros pasivos es que…', o: ['amplifican', 'no necesitan alimentación', 'no cargan a la fuente', 'tienen cualquier orden sin bobinas'], a: 1, e: 'Solo R, L y C.' },
      ],
      open: [
        { t: 'num', q: 'Filtro RC con R = 10 kΩ y C = 10 nF. ¿Cuál es su frecuencia de corte en Hz? (redondeá a entero)', a: 1 / (2 * PI * 1e4 * 1e-8), tol: 0.01, u: 'Hz', e: `<p>f<sub>c</sub> = 1/(2π·10⁴·10⁻⁸) = ${num(1 / (2 * PI * 1e4 * 1e-8), 1)} Hz.</p>` },
        { t: 'text', q: 'Una señal con 100 Hz, 300 Hz, 600 Hz y 1 kHz entra a un pasa altos de 500 Hz. ¿Qué componentes pasan y por qué?', k: [['600'], ['1000', '1 khz', '1khz'], ['mayor', 'encima', 'superior', 'arriba']], e: '<p>Pasan 600 Hz y 1 kHz, porque están por encima de la frecuencia de corte de 500 Hz (banda de paso del pasa altos); 100 y 300 Hz quedan atenuadas.</p>' },
        { t: 'text', q: 'Definí frecuencia de corte de un filtro.', k: [['ganancia', 'tension', 'amplitud', 'potencia'], ['0,707', '0.707', '3 db', '-3', 'mitad']], e: '<p>Es la frecuencia en la que la ganancia en tensión del filtro cae de 1 a 0,707 (−3 dB): la potencia de salida es la mitad.</p>' },
      ],
    },
  );
})();
