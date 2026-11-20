/* Tercer parcial 2025 (temas 1, 2, 3 y la otra versión del tema 3), resuelto paso a paso con el criterio de la cátedra.
   Fuente: carpeta NUEVO (enunciados, resoluciones detalladas, resumen y apuntes de alumnos). Notación: R = bps, r = baudios,
   M = símbolos, n = log₂M, Tb y Ts = tiempos de bit y de símbolo. Tablas de bits de las diapositivas de la Unidad 8 (MODS.*C en calculos.js).
   Los números salen de calculos.js (tdm, point, classify, download) para que coincidan con los laboratorios. */
(() => {
  const { h, cx: X, labUtil: U } = window.GUIDE;
  const { add, vf, V, F } = window.GUIDE.examKit;
  const { table, num, fig, dev } = h;
  const deg = (v) => `${num(v, 1)}°`;
  const plane = (pts, cap, opts) => fig(`<div class="fig-c">${U.constPlane(pts, opts)}</div>`, cap);
  const wave = (syms, cap, opts) => fig(`<div class="wave-wrap">${U.symbolWave(syms, opts)}</div>`, cap);
  const modPts = (k, label = (b) => b) => Object.entries(X.MODS[k].map).map(([b, p]) => ({ i: p.i, q: p.q, label: label(b) }));

  // ================= TDM sincrónica: el mismo método en los cuatro temas =================
  const tdmDev = (n, r, u, s, extra = {}) => {
    const t = X.tdm(n, r, u, s);
    const uName = u === 1 ? '1 bit (entrelazado a nivel de bit)' : `${u} bits = 1 byte (entrelazado a nivel de carácter)`;
    const sName = s === 1 ? '1 bit por trama' : `${s} bits = 1 byte por trama`;
    const ms = (v) => (v >= 1e-3 ? `${num(v * 1e3, 3)} ms` : `${num(v * 1e6, 3)} µs`);
    return dev({
      datos: [`N = ${n} canales`, `Velocidad de cada canal = ${num(r / 1e3)} kbps = ${num(r)} bps`, `Unidad = ${uName}`, `Sincronismo = ${sName}`],
      piden: ['La capacidad del enlace: la tasa a la salida del multiplexor, en bps'],
      antes: 'El multiplexor toma una unidad de cada canal, las pone una al lado de la otra y le agrega el sincronismo: eso es una trama. Siempre son tres cuentas: cuántos bits tiene la trama, cuánto dura, y tasa = bits / duración.',
      partes: [{ pasos: [
        ['Bits de una trama', `Entra una unidad de cada canal más el sincronismo: ${n} × ${u} + ${s} = <strong>${t.bits} bits</strong>.`],
        ['Duración de una trama', `La trama sale cada vez que un canal juntó una unidad nueva: ${u} bit${u > 1 ? 's' : ''} / ${num(r)} bps = <strong>${ms(t.Tf)}</strong> (${num(t.fps)} tramas por segundo).`],
        ['Tasa del enlace', `En ese tiempo hay que despachar los ${t.bits} bits: ${t.bits} bits / ${ms(t.Tf)} = <strong>${num(t.R)} bps = ${num(t.R / 1e3, 3)} kbps</strong>.`],
        ['Verificación', `Datos solos: ${n} × ${num(r / 1e3)} kbps = ${num(t.data / 1e3)} kbps. Sincronismo: ${s} bit${s > 1 ? 's' : ''} × ${num(t.fps)} tramas/s = ${num(t.sync / 1e3, 3)} kbps. Total ${num((t.data + t.sync) / 1e3, 3)} kbps: coincide. La tasa siempre da un poco más que la suma de los canales.`],
      ] }],
      parcial: `Trama = ${n} × ${u} + ${s} = ${t.bits} bits. Duración = ${u} bit${u > 1 ? 's' : ''} / ${num(r / 1e3)} kbps = ${ms(t.Tf)}. Capacidad = ${t.bits} bits / ${ms(t.Tf)} = ${num(t.R / 1e3, 3)} kbps.`,
      ojo: extra.ojo || ['Leé bien los dos datos que cambian entre temas: si la unidad es un bit o un byte, y si el sincronismo es un bit o un byte. Entrelazar a nivel de bit hace salir muchas más tramas por segundo, y cada una lleva su sincronismo.'],
    });
  };
  add('multiplexacion',
    { title: 'TDM de 10 canales de 10 kbps, carácter y 1 bit de sincronismo (3er parcial 2025, temas 1 y 3)', exam: ['3p-2025-t1#1', '3p-t4#4'], level: 2,
      prompt: '<p>Se dispone de un sistema de multiplexación TDM sincrónica de 10 canales. Cada fuente genera 10 kbps. Suponiendo que las transmisiones están entrelazadas a nivel de carácter (byte) y que se utiliza un único bit por trama para el sincronismo, ¿qué capacidad es necesaria para el enlace compartido?</p>',
      hints: ['Una trama lleva un byte de cada canal y un bit de sincronismo.', 'Un canal tarda 8 bits / 10 kbps en juntar su byte.'],
      solution: { explain: tdmDev(10, 10e3, 8, 1) + h.lab(0) }, },
    { title: 'TDM de 10 canales de 10 kbps, bit y 1 byte de sincronismo (3er parcial 2025, tema 2)', exam: ['3p-2025#4'], level: 2,
      prompt: '<p>Se dispone de un sistema de multiplexación TDM síncrona de 10 canales. Cada fuente genera 10 kbps. Suponiendo que las transmisiones están entrelazadas a nivel de bit y que se utiliza un único byte por trama para el sincronismo, ¿qué capacidad es necesaria para el enlace compartido?</p>',
      solution: { explain: tdmDev(10, 10e3, 1, 8, { ojo: ['Comparalo con los temas 1 y 3: allá el sincronismo suma 1,25 kbps (101,25 kbps en total) y acá 80 kbps, porque salen 10 000 tramas por segundo y cada una lleva su byte. Es la respuesta “180 Kbps” del cuestionario de la Unidad 8.'] }) } },
    { title: 'TDM de 5 canales de 20 kbps, bit y 1 byte de sincronismo (3er parcial 2025, tema 3, otra versión)', exam: ['3p-t3#4'], level: 2,
      prompt: '<p>Se dispone de un sistema de multiplexación TDM síncrona de 5 canales. Cada fuente genera 20 kbps. Suponiendo que las transmisiones están entrelazadas a nivel de bit y que se utiliza un único byte por trama para el sincronismo, ¿qué capacidad es necesaria para el enlace compartido?</p>',
      solution: { explain: tdmDev(5, 20e3, 1, 8) } },
  );
  // El laboratorio de la trama, con el caso del tema 1 cargado, dentro de la primera solución
  const mux = window.GUIDE.LESSONS.find((l) => l.id === 'multiplexacion');
  mux.labs = [...(mux.labs || [])];
  const tdmLabIndex = mux.labs.length;
  mux.labs.push({ type: 'tdm', title: 'La trama del tema 1, armada', intro: 'Mové la unidad entre bit y byte y el sincronismo entre bit y byte: así se pasa de un tema al otro.', n: 10, r: 10, b: 8, s: 1 });
  const ex1 = mux.exercises.find((e) => e.exam?.includes('3p-2025-t1#1'));
  ex1.solution.explain = ex1.solution.explain.replace('data-lab="0"', `data-lab="${tdmLabIndex}"`);

  // ================= Señal NRZ modulada en una M-aria (temas 1 y 2) =================
  const nrzDev = (key, nombre) => {
    const m = X.MODS[key], M = 2 ** m.n, R = 1 / 100e-6, r = R / m.n;
    const tabla = key === 'psk8C'
      ? table(['Tribit', 'Decimal', 'Cuenta', 'Fase', 'Amplitud'], Object.keys(m.map).map((b, k) => [`<span class="mono">${b}</span>`, k, `${k} × 45°`, deg(k * 45), 'A']))
      : table(['Tribit', 'Fase (dos primeros bits)', 'Amplitud (último bit)'], Object.keys(m.map).map((b) => [`<span class="mono">${b}</span>`, `${b.slice(0, 2)} → ${deg(+m.map[b].ph.toFixed(0))}`, `${b[2]} → ${b[2] === '1' ? 'A2 (grande)' : 'A1 (chica)'}`]));
    return dev({
      datos: ['Código de línea: NRZ', 'Tiempo de bit: T<sub>b</sub> = 100 µs', `Modulación: ${nombre}, o sea M = ${M}`],
      piden: ['a) B de la señal en banda base', 'b) B de la señal modulada', 'c) Constelación', 'd) Tabla de verdad'],
      antes: 'Es una cadena: los bits primero se vuelven pulsos NRZ (banda base, inciso a) y después entran al modulador, que los agrupa y los monta sobre una portadora (incisos b, c y d).',
      partes: [
        { h: 'Primero: del tiempo de bit a la velocidad de transmisión', pasos: [
          ['Pasar T<sub>b</sub> a segundos', 'µ es una millonésima: T<sub>b</sub> = 100 × 10⁻⁶ s = 0,0001 s.'],
          ['Velocidad de transmisión', `Si cada bit dura T<sub>b</sub>, en un segundo entran 1/T<sub>b</sub>: R = 1 / 0,0001 s = <strong>${num(R)} bps = 10 kbps</strong>. Atajo: T<sub>b</sub> en µs da R en Mbps (1/100 = 0,01 Mbps).`],
        ] },
        { h: 'a) Ancho de banda de la señal en banda base', pasos: [
          ['Fórmula de la cátedra', 'En el espectro de la señal NRZ el lóbulo principal va de 0 a 1/T<sub>b</sub>: B = 1 / T<sub>b</sub> = <strong>10 kHz</strong>. En NRZ el ancho de banda en Hz vale lo mismo que la velocidad en bps.'],
        ] },
        { h: `b) Ancho de banda de la señal modulada en ${nombre}`, pasos: [
          ['Bits por símbolo', `n = log₂M = log₂${M} = <strong>${m.n} bits</strong> (tribits), porque 2³ = 8. Con calculadora: log 8 / log 2 = 0,903 / 0,301 = 3.`],
          ['Velocidad de modulación', `El modulador junta los bits de a ${m.n}: r = R / log₂M = ${num(R)} / ${m.n} = <strong>${num(r, 1)} baudios</strong>. Otra forma: cada símbolo dura T<sub>s</sub> = ${m.n} × 100 µs = ${m.n * 100} µs y r = 1/T<sub>s</sub>.`],
          ['Ancho de banda modulado', `Fórmula de las M-arias: B<sub>M-ario</sub> = R / log₂M = ${num(R)} / ${m.n} ≈ <strong>${num(r / 1e3, 2)} kHz</strong>. Al modular, el ancho de banda baja tres veces, porque cada símbolo lleva 3 bits.`],
        ] },
        { h: 'c) Diagrama de constelación', html: key === 'psk8C'
          ? plane(modPts(key), '8-PSK de la cátedra: 8 puntos sobre una circunferencia, cada 45°, en orden binario y en sentido antihorario.', { circles: [1] })
          : plane(modPts(key), '8-QAM de la cátedra: 4 fases sobre los ejes y 2 amplitudes (dos circunferencias).', { circles: [0.5, 1] }),
          pasos: key === 'psk8C' ? [
            ['Cuántos puntos', 'M = 8 puntos.'],
            ['A qué distancia', 'En PSK la amplitud no cambia: todos a la misma distancia A, sobre una circunferencia.'],
            ['Cada cuántos grados', '360° / 8 = <strong>45°</strong>: 0°, 45°, 90°, …, 315°.'],
            ['Qué bits van en cada punto', 'En orden binario desde 0° y en sentido antihorario: 000, 001, 010, …, 111.'],
          ] : [
            ['Cómo se reparten los 8 símbolos', 'QAM combina amplitud y fase. La 8-QAM de la cátedra usa 2 amplitudes × 4 fases = 8 (M ≤ fases × amplitudes, y siempre más fases que amplitudes, porque la amplitud es más sensible al ruido).'],
            ['Dónde van los puntos', 'Las 4 fases separadas 90° (0°, 90°, 180°, 270°) caen sobre los ejes; en cada una, un punto a A1 (chica) y otro a A2 (grande).'],
          ] },
        { h: 'd) Tabla de verdad', html: tabla, pasos: [key === 'psk8C'
          ? ['Truco para no equivocarse', 'Pasar el tribit a decimal y multiplicar por 45°: 101 = 5 → 225°. Ejemplo: 000 011 110 101 sale con fases 0°, 135°, 270° y 225°, cada símbolo de 300 µs.']
          : ['Regla de la cátedra', 'Los dos primeros bits dan la fase (00 → 0°, 01 → 90°, 10 → 180°, 11 → 270°) y el último la amplitud (0 → chica, 1 → grande). Ejemplo: 101 → 180° con amplitud grande.']] },
      ],
      parcial: `R = 1/T<sub>b</sub> = 10 kbps. a) B = 1/T<sub>b</sub> = 10 kHz. b) n = log₂8 = 3; B<sub>M-ario</sub> = R/log₂M = 10 kbps/3 = 3,33 kHz (r = 3,33 kBaudios). c) ${key === 'psk8C' ? '8 puntos sobre una circunferencia, separados 45°' : '8 puntos sobre los ejes: 2 amplitudes × 4 fases'}. d) La tabla de arriba.`,
      ojo: ['En los dibujos de espectro de la cátedra la señal modulada ocupa 2B alrededor de la portadora. Si en clase calcularon el ancho modulado así, da 2 × 3,33 = 6,67 kHz. Con la fórmula de la diapositiva de M-arias es 3,33 kHz: escribí la fórmula que usaste.',
        key === 'psk8C' ? 'La tabla 8-PSK de las diapositivas de Tomasi (en la lección) usa otras fases (±22,5°, ±67,5°…). En el parcial se usa la de la cátedra: orden binario cada 45°.' : 'En 8-PSK los 8 puntos van en una sola circunferencia; en 8-QAM, en dos. Por eso 8-QAM los separa más para la misma potencia.'],
    });
  };
  add('modulacion-digital',
    { title: 'NRZ de 100 µs modulada en 8PSK (3er parcial 2025, tema 1)', exam: ['3p-2025-t1#2'], level: 2,
      prompt: '<p>Si se desea transmitir una señal codificada en NRZ, con un tiempo de bit de 100 µs y luego modularla en 8PSK, se pide: a) ancho de banda de la señal de banda base; b) ancho de banda de la señal modulada en 8PSK; c) diagrama de constelación; d) tabla de verdad.</p>',
      hints: ['R = 1/T<sub>b</sub>.', 'B<sub>NRZ</sub> = 1/T<sub>b</sub> y B<sub>M-ario</sub> = R/log₂M.'],
      solution: { explain: nrzDev('psk8C', '8-PSK') } },
    { title: 'NRZ de 100 µs modulada en 8QAM (3er parcial 2025, tema 2)', exam: ['3p-2025#3'], level: 2,
      prompt: '<p>Si se desea transmitir una señal codificada en NRZ, con un tiempo de bit de 100 µs y luego modularla en 8QAM, se pide: a) ancho de banda de la señal de banda base; b) ancho de banda de la señal modulada en 8QAM; c) diagrama de constelación; d) tabla de verdad.</p>',
      solution: { explain: nrzDev('qam8C', '8-QAM') } },
  );

  // ================= Constelación dada → modulación, tabla y baudios =================
  const quadRow = (b, i, q) => { const p = X.point(i, q); const how = p.quad === 1 ? `${deg(p.ref)}` : p.quad === 2 ? `180° − ${deg(p.ref)} = ${deg(p.th)}` : p.quad === 3 ? `180° + ${deg(p.ref)} = ${deg(p.th)}` : p.quad === 4 ? `360° − ${deg(p.ref)} = ${deg(p.th)}` : `${deg(p.th)} (sobre un eje)`;
    return [`<span class="mono">${b}</span>`, num(i), num(q), p.quad ? `${p.quad}.º` : 'eje', num(p.A, 2), how]; };
  const T1 = [['01', 2, 2], ['10', -2, 2], ['00', -2, -2], ['11', 2, -2]];
  add('modulacion-digital', { title: 'Constelación de cuatro puntos en (±2, ±2) con R = 80 kbps (3er parcial 2025, tema 1)', exam: ['3p-2025-t1#3'], level: 2,
    prompt: `<p>Para la constelación de la figura indicar: a) de qué tipo de modulación digital se trata; b) la tabla de verdad; c) si la velocidad de datos es de 80 kbps, ¿cuál es la velocidad de símbolos?</p>${plane(T1.map(([b, i, q]) => ({ i, q, label: b })), 'La constelación del parcial: 01 en (2, 2), 10 en (−2, 2), 00 en (−2, −2) y 11 en (2, −2).')}`,
    hints: ['Calculá la distancia de cada punto al centro con Pitágoras.', 'Misma distancia y distinto ángulo es PSK.'],
    solution: { explain: dev({
      datos: ['4 puntos, cada uno con sus 2 bits y sus coordenadas (I, Q)', 'Para c): R = 80 kbps'],
      piden: ['a) Tipo de modulación', 'b) Tabla de verdad (amplitud y fase)', 'c) Velocidad de símbolos en baudios'],
      antes: 'Es el camino inverso al ejercicio 2: acá el dibujo es el dato. El eje horizontal es I (en fase) y el vertical Q (cuadratura); cada punto se lee (I, Q).',
      partes: [
        { h: 'a) Tipo de modulación', pasos: [
          ['Contar los puntos', 'Hay 4 → M = 4 y n = log₂4 = 2 bits por símbolo (por eso cada punto tiene un dibit).'],
          ['Distancia al centro', 'Es la amplitud, con Pitágoras: A = √(I² + Q²) = √(2² + 2²) = √8 = <strong>2,83</strong>. Los signos se van al elevar al cuadrado: los cuatro dan 2,83.'],
          ['Conclusión', 'Regla: misma distancia y distinto ángulo → PSK; distintas distancias → QAM (o ASK si están sobre una recta). Acá: <strong>QPSK (4-PSK)</strong>.'],
        ] },
        { h: 'b) Tabla de verdad', html: table(['Dibit', 'I', 'Q', 'Cuadrante', 'Amplitud', 'Fase'], T1.map(([b, i, q]) => quadRow(b, i, q))), pasos: [
          ['Ángulo de referencia', 'α = arctg(|Q| / |I|) = arctg(2/2) = arctg 1 = <strong>45°</strong> (calculadora en DEG, SHIFT + tan).'],
          ['Ubicarlo en su cuadrante', 'La calculadora siempre devuelve el del primer cuadrante; la fase se mide desde I positivo en sentido antihorario: 2.º cuadrante 180° − α, 3.º 180° + α, 4.º 360° − α.'],
        ] },
        { h: 'c) Velocidad de símbolos', pasos: [
          ['Despejar r de R = r · log₂M', 'r = R / log₂M = 80 kbps / 2 = <strong>40 kBaudios</strong>. Dato extra: T<sub>s</sub> = 1/r = 25 µs.'],
        ] },
      ],
      parcial: 'a) 4 puntos de igual amplitud (√(2² + 2²) = 2,83) y distinta fase → QPSK. b) 01 → 2,83 a 45°; 10 → 2,83 a 135°; 00 → 2,83 a 225°; 11 → 2,83 a 315°. c) r = 80 kbps / log₂4 = 40 kBaudios.',
      ojo: ['La asignación de bits de este dibujo (01 → 45°, 10 → 135°…) no es la de la QPSK de las diapositivas (10 → 45°, 00 → 135°…). No importa: la tabla se arma con los bits que trae el dibujo.'],
    }) } });

  const seq = '11000110';
  const bpsk = [['0', 2, 0], ['1', -2, 0]], psk4 = [['00', 2, 0], ['01', 0, 2], ['10', -2, 0], ['11', 0, -2]];
  const seqTable = (n, map) => { const gs = X.groups(seq, n); return table(['Símbolo', ...gs.map((_, k) => k + 1)], [[n === 1 ? 'Bit' : 'Dibit', ...gs.map((g) => `<span class="mono">${g}</span>`)], ['Amplitud', ...gs.map((g) => num(X.point(...map[g]).A))], ['Fase', ...gs.map((g) => deg(X.point(...map[g]).th))]]); };
  const toMap = (rows) => Object.fromEntries(rows.map(([b, i, q]) => [b, [i, q]]));
  add('modulacion-digital', { title: 'Constelaciones BPSK y 4-PSK para 11000110 (3er parcial 2025, tema 3)', exam: ['3p-t4#2'], level: 1,
    prompt: '<p>Indique qué tipo de modulación se tiene para las siguientes constelaciones, y realice la tabla de la verdad (amplitud/fase de cada uno de los símbolos) para la secuencia 11000110: a) dos puntos en (2, 0) y (−2, 0); b) cuatro puntos en (0, 2), (2, 0), (0, −2) y (−2, 0).</p>',
    solution: { explain: dev({
      datos: ['a) 2 puntos en (2, 0) y (−2, 0)', 'b) 4 puntos en (0, 2), (2, 0), (0, −2) y (−2, 0)', 'Secuencia 11000110'],
      piden: ['Para cada constelación: tipo de modulación, tabla de verdad y los símbolos de la secuencia'],
      antes: 'Para cada constelación, siempre lo mismo: contar los puntos (M), sacar amplitud y fase de cada uno, decidir la modulación, armar la tabla y cortar la secuencia en grupos de n = log₂M bits.',
      partes: [
        { h: 'a) Dos puntos', html: plane(bpsk.map(([b, i, q]) => ({ i, q, label: b })), 'BPSK: dos puntos de amplitud 2, a 0° y 180°.', { circles: [2] }), pasos: [
          ['Contar', 'M = 2 → n = 1 bit por símbolo.'],
          ['Amplitud y fase', 'Los dos están a distancia 2. (2, 0) está a la derecha: 0°. (−2, 0) a la izquierda: 180°.'],
          ['Modulación', 'Misma amplitud, solo cambia la fase: <strong>BPSK</strong>. Tabla de la cátedra: 0 → 0°, 1 → 180°.'],
          ['Secuencia', `Se lee de a un bit: 8 símbolos.${seqTable(1, toMap(bpsk))}`],
        ] },
        { h: 'b) Cuatro puntos', html: plane(psk4.map(([b, i, q]) => ({ i, q, label: b })), '4-PSK sobre los ejes: amplitud 2 a 0°, 90°, 180° y 270°.', { circles: [2] }), pasos: [
          ['Contar', 'M = 4 → n = 2 bits (dibits).'],
          ['Amplitud y fase', 'Una coordenada es 0 y la otra ±2: todas con A = 2. Sobre los ejes la fase se lee del dibujo: (2, 0) → 0°, (0, 2) → 90°, (−2, 0) → 180°, (0, −2) → 270°. Con I = 0, arctg(Q/I) no sirve (no se divide por cero).'],
          ['Modulación', 'Cuatro fases separadas 90° con la misma amplitud: <strong>4-PSK</strong> (QPSK con los puntos sobre los ejes). Tabla de la cátedra: 00 → 0°, 01 → 90°, 10 → 180°, 11 → 270°.'],
          ['Secuencia', `Ahora de a dos: 11 · 00 · 01 · 10.${seqTable(2, toMap(psk4))}`],
        ] },
      ],
      parcial: 'a) 2 puntos de amplitud 2 a 0° y 180° → BPSK. 0 → A = 2, 0°; 1 → A = 2, 180°. Secuencia: 180°, 180°, 0°, 0°, 0°, 180°, 180°, 0°. b) 4 puntos de amplitud 2 a 0°, 90°, 180°, 270° → 4-PSK. 00 → 0°; 01 → 90°; 10 → 180°; 11 → 270°. Secuencia 11·00·01·10 → 270°, 0°, 90°, 180°.',
      ojo: ['Con los mismos 8 bits BPSK necesita 8 símbolos y 4-PSK solo 4: el doble de bits con la misma velocidad de modulación.', 'El enunciado no dice qué bits lleva cada punto: se usan las tablas de la diapositiva de PSK de la Unidad 8. Si el dibujo trae los bits, se usan esos.'],
    }) } });

  const qpskC = [['10', 2, 2], ['00', -2, 2], ['01', -2, -2], ['11', 2, -2]];
  add('modulacion-digital', { title: 'Constelaciones OOK y QPSK para 11000110 (3er parcial 2025, tema 3, otra versión)', exam: ['3p-t3#2'], level: 1,
    prompt: '<p>Indique qué tipo de modulación se tiene para las siguientes constelaciones, y realice la tabla de la verdad (amplitud/fase de cada uno de los símbolos) para la secuencia 11000110: a) dos puntos en (0, 0) y (2, 0); b) cuatro puntos en (−2, −2), (−2, 2), (2, −2) y (2, 2).</p>',
    solution: { explain: dev({
      datos: ['a) 2 puntos en (0, 0) y (2, 0)', 'b) 4 puntos en (±2, ±2)', 'Secuencia 11000110'],
      piden: ['Tipo de modulación y tabla de verdad para la secuencia, en cada constelación'],
      partes: [
        { h: 'a) Dos puntos, uno en el origen', html: plane([{ i: 0, q: 0, label: '0' }, { i: 2, q: 0, label: '1' }], 'OOK: portadora apagada (0) o encendida con amplitud 2 (1).'), pasos: [
          ['Amplitudes', '(0, 0) tiene A = 0: la portadora está apagada. (2, 0) tiene A = 2 y fase 0°.'],
          ['Modulación', 'Cambia solo la amplitud y los puntos están sobre una recta: <strong>ASK</strong>, en su forma <strong>OOK</strong> (on-off keying). n = 1 bit: 1 → A = 2, 0 → A = 0.'],
          ['Secuencia', table(['Bit', ...'11000110'], [['Amplitud', ...[...'11000110'].map((b) => (b === '1' ? '2' : '0'))]])],
        ] },
        { h: 'b) Cuatro puntos en las diagonales', html: plane(qpskC.map(([b, i, q]) => ({ i, q, label: b })), 'QPSK de la cátedra: 10 → 45°, 00 → 135°, 01 → 225°, 11 → 315°.', { circles: [Math.hypot(2, 2)] }), pasos: [
          ['Amplitud', 'A = √(2² + 2²) = 2,83 en los cuatro: misma amplitud, distinta fase → <strong>QPSK</strong>, 2 bits por símbolo.'],
          ['Fases', 'α = arctg(2/2) = 45°, ubicado en cada cuadrante: 45°, 135°, 225°, 315°.'],
          ['Tabla de la cátedra', 'Sin bits en el dibujo, se usa la QPSK de las diapositivas: 10 → 45°, 00 → 135°, 01 → 225°, 11 → 315°.'],
          ['Secuencia', `11 · 00 · 01 · 10.${seqTable(2, toMap(qpskC))}`],
        ] },
      ],
      parcial: 'a) OOK (ASK): 1 → A = 2, 0 → A = 0; la secuencia sale 2, 2, 0, 0, 0, 2, 2, 0. b) QPSK, A = 2,83: 10 → 45°, 00 → 135°, 01 → 225°, 11 → 315°; la secuencia 11·00·01·10 sale 315°, 135°, 225°, 45°.',
    }) } });

  // ================= Diagramas de tiempo =================
  const T1w = [['11', 0], ['01', 180], ['10', 270], ['00', 90]];
  add('modulacion-digital', { title: 'Diagrama de tiempo QPSK a 1 kbps (3er parcial 2025, tema 1)', exam: ['3p-2025-t1#4'], level: 2,
    prompt: `<p>El siguiente diagrama de tiempo es el resultado de una transmisión digital a una velocidad de 1 kbps. Indicar: a) de qué tipo de modulación se trata; b) el diagrama de constelación; c) la tabla de verdad; d) la velocidad del símbolo en kBaudios; e) el tiempo del bit en µs.</p>${wave(T1w.map(([b, ph]) => ({ A: 1, ph, top: `${ph}° [${b}]` })), 'El diagrama del parcial, redibujado: cuatro símbolos con su fase y sus dos bits.')}`,
    hints: ['Compará un símbolo con el siguiente: ¿qué cambió, la altura, lo apretado de los ciclos o dónde arranca la onda?'],
    solution: { explain: dev({
      datos: ['R = 1 kbps = 1000 bps', 'Onda con 4 símbolos; sobre cada uno, su fase y sus 2 bits'],
      piden: ['a) Tipo', 'b) Constelación', 'c) Tabla', 'd) r en kBaudios', 'e) T<sub>b</sub> en µs'],
      antes: 'Un diagrama de tiempo muestra la portadora ya modulada. Se compara un símbolo con el siguiente: la altura (amplitud), lo apretado de los ciclos (frecuencia) o el punto del ciclo donde arranca (fase).',
      partes: [
        { h: 'a) Tipo de modulación', pasos: [
          ['¿Cambia la amplitud?', 'No: siempre llega a +1 y −1. No es ASK ni QAM.'],
          ['¿Cambia la frecuencia?', 'No: todos los símbolos tienen la misma cantidad de ciclos. No es FSK.'],
          ['¿Cambia la fase?', 'Sí: en la unión entre símbolos la onda pega un salto. Es PSK.'],
          ['¿Cuántas fases?', 'Cuatro (0°, 90°, 180°, 270°) → M = 4, 2 bits cada una: <strong>QPSK (4-PSK)</strong>.'],
        ] },
        { h: 'b) y c) Constelación y tabla', html: plane(T1w.map(([b, ph]) => { const r = ph * Math.PI / 180; return { i: Math.round(Math.cos(r)), q: Math.round(Math.sin(r)), label: b }; }), 'Los cuatro puntos caen sobre los ejes, con amplitud 1.', { circles: [1] }) + table(['Dibit', 'Amplitud', 'Fase'], [['11', 1, '0°'], ['00', 1, '90°'], ['01', 1, '180°'], ['10', 1, '270°']]), pasos: [
          ['Anotar lo que muestra cada símbolo', '[11] → 0°, [01] → 180°, [10] → 270°, [00] → 90°, amplitud 1.'],
          ['Pasarlo al dibujo', 'Circunferencia de radio 1: 0° a la derecha, 90° arriba, 180° a la izquierda y 270° abajo. Es la QPSK del ejercicio 3 girada 45°.'],
        ] },
        { h: 'd) y e) Velocidades', pasos: [
          ['Velocidad del símbolo', 'r = R / log₂M = 1000 / 2 = 500 baudios = <strong>0,5 kBaudios</strong>.'],
          ['Tiempo de bit', 'T<sub>b</sub> = 1/R = 1/1000 = 0,001 s = 1 ms = <strong>1000 µs</strong>.'],
        ] },
      ],
      parcial: 'a) Amplitud y frecuencia constantes, 4 fases → QPSK. b) 4 puntos de amplitud 1 en 0°, 90°, 180° y 270°. c) 11 → 0°; 00 → 90°; 01 → 180°; 10 → 270°. d) r = 1 kbps / 2 = 0,5 kBaudios. e) T<sub>b</sub> = 1/1000 = 1000 µs.',
      ojo: ['Piden el tiempo de <strong>bit</strong>, no el de símbolo. El de símbolo es el doble: T<sub>s</sub> = 1/500 = 2000 µs.'],
    }) } });

  const T3w = [['00', 135, '+135°'], ['11', -45, '−45°'], ['10', 45, '−45° (+45°)'], ['01', -135, '−135°'], ['01', -135, '−135°']];
  add('modulacion-digital', { title: 'Diagrama de tiempo QPSK para 0011100101 a 10 kbps (3er parcial 2025, tema 3)', exam: ['3p-t4#3'], level: 2,
    prompt: `<p>El siguiente diagrama de tiempo es el resultado de una transmisión digital de la secuencia de datos 0011100101. Indicar: a) de qué tipo de modulación digital se trata; b) el diagrama de su constelación y su tabla de verdad; c) si la velocidad de transmisión es de 10 kbps, ¿cuál es el tiempo de duración de cada símbolo?</p>${wave(T3w.map(([, ph, l]) => ({ A: 2, ph, cyc: 1, bottom: l })), 'El diagrama del parcial: cinco símbolos de amplitud 2, rotulados +135°, −45°, −45°, −135° y −135°.')}`,
    solution: { explain: dev({
      datos: ['Secuencia 0011100101 (10 bits)', '5 símbolos de amplitud 2, con una fase escrita debajo de cada uno', 'Para c): R = 10 kbps'],
      piden: ['a) Tipo', 'b) Constelación y tabla', 'c) T<sub>s</sub>'],
      antes: 'Hay que relacionar tres cosas: los bits, los tramos del dibujo y la fase de cada tramo.',
      partes: [
        { h: 'a) Tipo', pasos: [
          ['Bits por símbolo', '10 bits / 5 símbolos = 2 bits → M = 2² = 4.'],
          ['Qué cambia', 'La amplitud (siempre ±2) y la frecuencia (un ciclo por símbolo) no; la fase sí: <strong>QPSK</strong>.'],
        ] },
        { h: 'b) Constelación y tabla', pasos: [
          ['Cortar de a dos', '0011100101 → 00 · 11 · 10 · 01 · 01.'],
          ['Emparejar con las fases', table(['Símbolo', 1, 2, 3, 4, 5], [['Dibit', '00', '11', '10', '01', '01'], ['Fase escrita', '+135°', '−45°', '−45°', '−135°', '−135°'], ['Fase de la onda', '+135°', '−45°', '<strong>+45°</strong>', '−135°', '−135°']])],
          ['Pasar las negativas a 0°–360°', '−45° + 360° = 315°; −135° + 360° = 225°.'],
          ['Tabla y puntos', `${table(['Dibit', 'Fase', '0° a 360°', 'Amplitud', 'I = A·cos θ', 'Q = A·sen θ'], [['00', '+135°', '135°', 2, '−1,41', '+1,41'], ['01', '−135°', '225°', 2, '−1,41', '−1,41'], ['10', '+45°', '45°', 2, '+1,41', '+1,41'], ['11', '−45°', '315°', 2, '+1,41', '−1,41']])}${plane(qpskC.map(([b, i, q]) => ({ i: i / Math.SQRT2, q: q / Math.SQRT2, label: b })), 'Coincide con la QPSK de la cátedra: un punto por cuadrante.', { circles: [2] })}`],
        ] },
        { h: 'c) Duración del símbolo', pasos: [
          ['Velocidad de modulación', 'r = R / log₂M = 10 000 / 2 = 5000 baudios.'],
          ['Tiempo de símbolo', 'T<sub>s</sub> = 1/r = 1/5000 = 0,0002 s = <strong>200 µs</strong>. Control: T<sub>b</sub> = 100 µs y cada símbolo lleva 2 bits.'],
        ] },
      ],
      parcial: 'a) Amplitud y frecuencia constantes, cambia la fase, 2 bits por símbolo → QPSK. b) 4 puntos de amplitud 2 en 45°, 135°, 225° y 315°: 00 → 135°; 01 → 225°; 10 → 45°; 11 → 315°. c) r = 10 kbps / 2 = 5 kBaudios → T<sub>s</sub> = 200 µs.',
      ojo: ['El tercer símbolo está rotulado −45°, igual que el segundo, pero son dibits distintos (11 y 10) y no pueden tener la misma fase. La onda del tercero arranca arriba y subiendo, que es +45°, y además coincide con la tabla de la cátedra (10 → 45°). En el parcial, aclaralo por escrito o consultalo.'],
    }) } });

  // 8-QAM leída de un diagrama de 8 baudios (tema 2 y la otra versión del tema 3)
  const Q8 = [['101', 2, 180], ['100', 1, 180], ['001', 2, 0], ['000', 1, 0], ['010', 1, 90], ['011', 2, 90], ['110', 1, 270], ['111', 2, 270]];
  const how = { 0: 'en cero, subiendo', 90: 'arriba', 180: 'en cero, bajando', 270: 'abajo' };
  const qam8Dev = (Ts, label) => {
    const r = 1 / Ts, Tsx = Ts >= 1e-3 ? `${num(Ts * 1e3)} ms` : `${num(Ts * 1e6)} µs`;
    return dev({
      datos: ['Un dibujo de 8 símbolos (8 baudios), sin los bits', 'La onda tiene dos alturas distintas', `Marca de tiempo: ${Tsx}`],
      piden: ['a) Tipo', 'b) Tabla de verdad y constelación', 'c) r (señalización) y R (transmisión)'],
      antes: 'Es el dibujo de 8-QAM de la diapositiva de la Unidad 8, sin los bits y con otro tiempo. Símbolo por símbolo, se mira la altura de la onda y dónde arranca.',
      partes: [
        { h: 'a) Tipo', html: wave(Q8.map(([b, A, ph]) => ({ A, ph, cyc: 2, top: b, bottom: `${ph}°` })), 'La lectura de cada baud (referencia seno): arriba el tribit de la cátedra, abajo la fase.'), pasos: [
          ['¿Cambia la amplitud?', 'Sí: tramos altos y otros a la mitad. Son 2 amplitudes: no es PSK pura.'],
          ['¿Cambia la frecuencia?', 'No: 2 ciclos por baud en todos. No es FSK.'],
          ['¿Cambia la fase?', 'Sí: la onda arranca en cero subiendo, en cero bajando, desde arriba o desde abajo. Son 4 fases.'],
          ['Conclusión', 'Cambian amplitud y fase a la vez: QAM. M = 2 amplitudes × 4 fases = 8 → <strong>8-QAM</strong>, 3 bits por símbolo.'],
        ] },
        { h: 'b) Tabla y constelación', html: table(['Baud', ...Q8.map((_, k) => k + 1)], [['Altura', ...Q8.map(([, A]) => (A === 2 ? 'grande' : 'chica'))], ['Cómo arranca', ...Q8.map(([, , ph]) => how[ph])], ['Fase', ...Q8.map(([, , ph]) => `${ph}°`)], ['Tribit', ...Q8.map(([b]) => `<span class="mono">${b}</span>`)]]) + plane(modPts('qam8C'), '8-QAM: los puntos sobre los ejes, en dos circunferencias (A1 adentro, A2 afuera).', { circles: [0.5, 1] }), pasos: [
          ['Asignar los bits', 'El dibujo no trae los bits: se usa la regla de la diapositiva. Los dos primeros bits dan la fase (00 → 0°, 01 → 90°, 10 → 180°, 11 → 270°) y el último la amplitud (0 → chica, 1 → grande).'],
          ['Ordenar la tabla', '000 → A1, 0°; 001 → A2, 0°; 010 → A1, 90°; 011 → A2, 90°; 100 → A1, 180°; 101 → A2, 180°; 110 → A1, 270°; 111 → A2, 270°. Sin escala vertical, las amplitudes quedan como A1 y A2 (la grande ≈ el doble).'],
        ] },
        { h: 'c) Velocidades', pasos: [
          ['Tiempo de símbolo', `La marca de ${Tsx} está sobre un baud: T<sub>s</sub> = ${Tsx}.`],
          ['Velocidad de señalización', `r = 1/T<sub>s</sub> = <strong>${num(r / 1e3, 3)} kBaudios</strong>${r >= 1e6 ? ` (${num(r / 1e6, 3)} MBaudio)` : ''}.`],
          ['Velocidad de transmisión', `R = r · log₂8 = ${num(r / 1e3, 3)} k × 3 = <strong>${num(3 * r / 1e3, 3)} kbps</strong>.`],
        ] },
      ],
      parcial: `a) 2 amplitudes × 4 fases = 8 símbolos → 8-QAM, 3 bits por símbolo. b) 000 → A1, 0°; 001 → A2, 0°; 010 → A1, 90°; 011 → A2, 90°; 100 → A1, 180°; 101 → A2, 180°; 110 → A1, 270°; 111 → A2, 270°. c) T<sub>s</sub> = ${Tsx}: r = ${num(r / 1e3, 3)} kBaudios y R = ${num(3 * r / 1e3, 3)} kbps.`,
      ojo: [`${label} En la diapositiva de la cátedra la marca de tiempo (1 ms) abarca los 8 baudios juntos. Si en tu dibujo la marca cubre todo el tren, T<sub>s</sub> = ${Tsx} / 8 y todo se multiplica por 8 (${num(8 * r / 1e3, 3)} kBaudios y ${num(24 * r / 1e3, 3)} kbps). Mirá qué tramo abarca y aclaralo en la respuesta.`],
    });
  };
  add('modulacion-digital',
    { title: 'Diagrama temporal 8-QAM con baudios de 1 µs (3er parcial 2025, tema 2)', exam: ['3p-2025#2'], level: 2,
      prompt: '<p>Según el diagrama temporal de una señal modulada (8 tramos rotulados “1 baud”, con la marca “1 µs”), indicar: a) tipo de modulación digital; b) su tabla de verdad y el diagrama de constelación; c) velocidad de señalización y velocidad de transmisión.</p>',
      solution: { explain: qam8Dev(1e-6, 'La marca de 1 µs está sobre el primer baud.') } },
    { title: 'Diagrama temporal 8-QAM con baudios de 10 µs (3er parcial 2025, tema 3, otra versión)', exam: ['3p-t3#3'], level: 2,
      prompt: '<p>Según el diagrama temporal de una señal modulada (8 tramos rotulados “1 baud”, con la marca “10 µs” sobre un baud), indicar: a) tipo de modulación digital; b) su tabla de verdad y el diagrama de constelación; c) velocidad de señalización y velocidad de transmisión.</p>',
      solution: { explain: qam8Dev(10e-6, 'En los apuntes que circulan se tomó 10 µs por baud: r = 100 000 baudios y R = 300 kbps.') } },
  );

  // ================= Tiempo de descarga (tema 2) =================
  add('modem-xdsl', { title: 'Descargar 2 Mb con MODEM 56K y con ADSL 1M (3er parcial 2025, tema 2)', exam: ['3p-2025#5'], level: 1,
    prompt: '<p>Un archivo contiene 2 Mb. ¿Cuánto tiempo demora en descargar este archivo por un canal de 56 kbps (MODEM 56K)? ¿Y por uno de 1 Mbps (ADSL 1M)?</p>',
    solution: { explain: dev({
      datos: ['Tamaño = 2 Mb (megabits)', 'Canal 1: R = 56 kbps', 'Canal 2: R = 1 Mbps'],
      piden: ['El tiempo de descarga en cada canal'],
      antes: 'R dice cuántos bits pasan por segundo, así que t = tamaño / R. Lo único delicado es usar las mismas unidades.',
      partes: [{ pasos: [
        ['Tamaño en bits', 'Mb con b minúscula son megabits: 2 Mb = 2 000 000 bits.'],
        ['Velocidades en bps', '56 kbps = 56 000 bps; 1 Mbps = 1 000 000 bps.'],
        ['Módem de 56 kbps', `t = 2 000 000 / 56 000 = <strong>${num(X.download(2e6, 56e3), 2)} s</strong>.`],
        ['ADSL de 1 Mbps', `t = 2 000 000 / 1 000 000 = <strong>${num(X.download(2e6, 1e6), 2)} s</strong>.`],
        ['Control', 'ADSL es 1 000 000 / 56 000 ≈ 17,9 veces más rápido, y 35,71 / 2 ≈ 17,9.'],
      ] }],
      parcial: '2 Mb = 2 000 000 bits. Módem: t = 2 000 000 / 56 000 = 35,71 s. ADSL: t = 2 000 000 / 1 000 000 = 2 s.',
      ojo: ['Mb (megabits) no es MB (megabytes). Con 2 MB habría que multiplicar por 8 (16 000 000 bits): 285,7 s y 16 s.'],
    }) } });

  // ================= V o F del tema 1: 18 afirmaciones =================
  vf('codigos-linea', ['3p-2025-t1#5'], 'V o F sobre códigos de línea, modulaciones, Shannon y Nyquist (3er parcial 2025, tema 1)', 'Sobre las siguientes afirmaciones responder con VERDADERO / FALSO. Método: separar cada frase en partes y revisar cada una; si una parte es falsa, toda la frase es falsa. Atención a los absolutos (“la más”, “el triple”, “a la mitad”).', [
    ['La codificación NRZ es la más eficiente en términos de ancho de banda requerido B proporcional a la tasa de bits R<sub>b</sub>, pero su desventaja crítica es la total ausencia de capacidad de sincronización automática en presencia de largas secuencias de unos o ceros.', V, 'Parte 1: entre los códigos de la cátedra, NRZ es el de menor ancho de banda. Parte 2: con muchos bits iguales la señal no cambia y el receptor pierde el reloj. Es la más discutible por el “la más eficiente”; lo esperable es V.', 'codigos-linea'],
    ['En comparación con NRZ, una de las mejoras esenciales de AMI es la eliminación completa de la componente de DC, aunque mantiene un problema de sincronización para largas secuencias de ceros.', V, 'Los 1 alternan +V y −V (promedio cero) y los 0 son 0 V: muchos seguidos dejan la línea sin cambios.', 'codigos-bipolares'],
    ['HDB3 resuelve la limitación de sincronización de AMI al reemplazar cualquier secuencia de cuatro ceros consecutivos por una secuencia que incluye un pulso de violación bipolar, para asegurar un número mínimo de transiciones.', V, 'Cuatro ceros se cambian por 000V o B00V: nunca hay más de tres ceros seguidos.', 'codigos-bipolares'],
    ['Como 4B/5B mapea 4 bits de datos a 5 símbolos, su eficiencia es menor a la unidad (80 %), lo que implica que el ancho de banda mínimo requerido es menor que el de NRZ pura.', F, 'Parte 1 cierta (4 de cada 5 = 80 %). Parte 2 falsa: al mandar más bits por la línea hace falta <strong>más</strong> ancho de banda, no menos.', 'codigos-linea'],
    ['Una señal Manchester requiere el triple de ancho de banda que una NRZ a la misma tasa de bits, debido a que la tasa de baudios de Manchester es el doble de la de NRZ.', F, 'Manchester tiene dos cambios por bit: el doble de baudios da el <strong>doble</strong> de ancho de banda, no el triple. La frase se contradice sola.', 'codigos-linea'],
    ['El principal objetivo de HDB3 y B8ZS es aumentar la tasa de bits sobre un canal dado, sin modificar la tasa de baudios, utilizando más niveles de voltaje.', F, 'Su objetivo es el sincronismo con ceros seguidos. Usan los mismos 3 niveles de AMI y no cambian la tasa de bits.', 'codigos-bipolares'],
    ['ASK es la técnica más robusta frente al ruido e interferencia impulsiva, porque las variaciones de amplitud son más sencillas de detectar que las de fase o frecuencia.', F, 'El ruido se suma a la amplitud, justo donde ASK lleva la información: la cátedra la marca como muy susceptible al ruido.', 'modulacion-digital'],
    ['En M-PSK, al aumentar M (de 4-PSK a 8-PSK) aumentan los bits por símbolo (log₂M), lo que mejora la eficiencia espectral, pero requiere mayor SNR en el receptor.', V, 'Más bits por símbolo, y los puntos quedan más juntos: se confunden con menos ruido.', 'modulacion-digital'],
    ['M-QAM es preferida sobre M-PSK para M ≥ 16, porque al combinar amplitud y fase los puntos quedan más espaciados para una potencia dada, lo que mejora la inmunidad al ruido.', V, 'PSK pone todos los puntos en una circunferencia; QAM los reparte por el plano y quedan más separados.', 'modulacion-digital'],
    ['FSK, particularmente la no coherente, ofrece menor BER que ASK y PSK con ruido uniforme, siendo la preferida en enlaces con restricciones de potencia.', F, 'FSK es más inmune que ASK, pero no que PSK: a igual potencia PSK tiene menos errores.', 'modulacion-digital'],
    ['BPSK y QPSK tienen la misma eficiencia espectral (bits/s/Hz), ya que QPSK duplica la tasa de bits sin incrementar la tasa de baudios.', F, 'Si QPSK manda el doble de bits con los mismos baudios (el mismo ancho de banda), su eficiencia es el <strong>doble</strong>. Se contradice.', 'modulacion-digital'],
    ['La principal distinción entre QAM y M-PSK es que QAM varía la amplitud en la componente I y la fase en la componente Q, mientras que M-PSK solo varía la fase.', F, 'QAM es ASK + PSK: varía la amplitud de las dos componentes y el resultado cambia en amplitud y fase. La parte de M-PSK es cierta; la de QAM no.', 'modulacion-digital'],
    ['El teorema de Shannon-Hartley establece que la capacidad de un canal con AWGN es directamente proporcional a B y depende logarítmicamente de la SNR.', V, 'C = B · log₂(1 + SNR): B multiplica y la SNR está dentro del logaritmo.', 'shannon'],
    ['Si la potencia de ruido se duplica, la capacidad de Shannon se reduce a la mitad, con B y S constantes.', F, 'La SNR está dentro de un logaritmo. Con SNR = 1000, C = 9,97·B; con el doble de ruido (SNR = 500), C = 8,97·B: baja un 10 %, no la mitad.', 'shannon'],
    ['La modulación digital adaptativa implica que el transmisor ajusta dinámicamente el esquema (de 16-QAM a QPSK) según la SNR del canal en tiempo real, para mantener una BER objetivo.', V, 'Es la definición de QAM adaptativo de la cátedra.', 'qam-adaptativo'],
    ['La modulación adaptativa usa esquemas de alto orden (64-QAM) cuando la SNR es baja y cambia a bajo orden (BPSK) cuando la SNR es alta.', F, 'Está al revés: M = √(1 + SNR). Con SNR alta se puede usar M grande; con SNR baja hay que bajar M.', 'qam-adaptativo'],
    ['El teorema de Nyquist establece que la tasa máxima de símbolos sin ISI en un canal de ancho B es 2B baudios, sin considerar el ruido.', V, 'C = 2B · log₂M, con 2B símbolos por segundo. El ruido lo tiene en cuenta Shannon.', 'nyquist-capacidad'],
    ['Para un canal de 4 kHz con SNR de 30 dB, la capacidad de Shannon es aproximadamente 40 kbps.', V, '30 dB = 10³ = 1000 veces. C = 4000 × log₂(1001) = 4000 × 9,97 ≈ 39 870 bps ≈ 40 kbps.', 'shannon'],
  ]);
})();
