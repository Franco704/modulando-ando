/* Unidad 9 (3er parcial): redes de acceso. TP 9 (POTS y PSTN, ADSL a VDSL2, redes de acceso óptico), cuestionario de la Unidad 9 (2025)
   y los ítems de MODEM y ADSL de los parciales y del final del 07/05/2019. */
(() => {
  const { LESSONS, h } = window.GUIDE;
  const { note, def, table, eq } = h;

  LESSONS.push(
    {
      id: 'modem-xdsl',
      module: 'u9',
      title: 'Red telefónica, módem y tecnologías xDSL',
      keywords: 'POTS PSTN red telefónica conmutada bucle de abonado par trenzado módem DTE DCE ADSL ADSL2 ADSL2+ VDSL VDSL2 splitter DSLAM ATU-R ATU-C DMT FDM banda vocal 4 kHz 25 kHz 1104 kHz cable módem asimétrico',
      tldr: 'El <strong>módem</strong> (DCE) convierte las señales digitales del DTE en analógicas aptas para la línea. <strong>ADSL</strong> reutiliza el par de cobre del teléfono: multiplexa voz y datos <mark>en frecuencia</mark> (voz hasta 4 kHz, datos de ≈ 25 kHz a 1104 kHz), el <strong>splitter</strong> separa la voz de los datos y en la central un <strong>DSLAM</strong> concentra a los abonados. La banda de datos se parte en subportadoras de 4,3125 kHz (<strong>DMT</strong>), cada una con la QAM que su SNR permita.',
      goals: ['Distinguir POTS (servicio) de PSTN (red).', 'Ubicar DTE, DCE y línea en un enlace con módem.', 'Describir el reparto espectral de ADSL, el splitter, el DSLAM y DMT.', 'Comparar ADSL, ADSL2+, VDSL y VDSL2, y explicar por qué la distancia manda.'],
      body: `
        <h2>POTS y PSTN</h2>
        ${table(['', 'Qué es', 'Ejemplo'], [
          ['<strong>PSTN</strong> (Public Switched Telephone Network)', 'La <strong>red</strong>: centrales de conmutación de circuitos, troncales y bucles de abonado', 'La infraestructura de la compañía telefónica'],
          ['<strong>POTS</strong> (Plain Old Telephone Service)', 'El <strong>servicio</strong> básico de voz que corre sobre esa red, en la banda vocal (300 Hz a 3,4 kHz, canal de 4 kHz)', 'El teléfono fijo analógico'],
        ])}
        <p>Las dos hablan de la telefonía tradicional y están atadas: POTS usa la banda vocal y la PSTN transporta esa banda. La diferencia es de nivel: <strong>red</strong> contra <strong>servicio</strong> (TP 9, ejercicio 1).</p>
        <h2>El módem: DTE, DCE y línea</h2>
        ${def('Módem', 'Dispositivo que convierte las señales digitales procedentes de un emisor (por ejemplo un ordenador) en señales analógicas, para su transmisión a través de un medio que puede ser un circuito telefónico o un circuito punto a punto; en el otro extremo hace la conversión inversa (MOdulador-DEModulador).', 'Cuestionario de la Unidad 9, 2025.')}
        ${table(['Elemento', 'Nombre', 'Ejemplo (cable módem)'], [
          ['<strong>DTE</strong>', 'Equipo Terminal de Datos: genera o consume los datos', 'Computadora'],
          ['<strong>DCE</strong>', 'Equipo de Terminación del Circuito de Datos: adapta la señal a la línea', 'Cable módem (o módem ADSL)'],
          ['<strong>Línea</strong>', 'Medio de transmisión', 'Cable coaxil (o par telefónico)'],
        ])}
        <p>Un módem telefónico clásico usa solo la banda vocal: por eso se quedó en 56 kbps. xDSL usa el <strong>mismo par</strong> pero mucho más espectro.</p>
        <h2>ADSL: voz y datos en el mismo par</h2>
        <p>ADSL (Asymmetric Digital Subscriber Line) es <strong>asimétrico</strong>: más velocidad de bajada que de subida, porque el usuario descarga más de lo que sube. Reparte el espectro del par trenzado:</p>
        ${table(['Banda', 'Uso'], [['0 a 4 kHz', 'Voz (POTS), intacta'], ['≈ 25 kHz a 138 kHz', 'Datos ascendentes (subida)'], ['138 kHz a 1104 kHz', 'Datos descendentes (bajada)']])}
        <ul>
          <li><strong>Multiplexación voz/datos en frecuencia</strong> (FDM) y <strong>dúplex en frecuencia</strong>: subida y bajada en bandas distintas. No es TDM.</li>
          <li>El <strong>splitter</strong> es un par de filtros (pasabajos y pasaaltos) en cada extremo: <strong>separa la voz de los canales de datos</strong> ascendente y descendente. No multiplexa la subida con la bajada y no opera solo en la banda vocal.</li>
          <li>En el domicilio, el módem es el <strong>ATU-R</strong>; en la central, el <strong>ATU-C</strong>. Los ATU-C de muchos abonados están en el <strong>DSLAM</strong> (DSL Access Multiplexer): un multiplexor (TDM) en la central telefónica que da a los abonados acceso a los servicios xDSL sobre el par de cobre. La voz sigue hacia la matriz de conmutación.</li>
          <li>El módem ADSL clásico opera en el margen frecuencial de 25,875 kHz a 1104 kHz (hasta 1104 kHz) y proporciona acceso de banda ancha <strong>sobre par de cobre</strong>, no sobre coaxil.</li>
        </ul>
        <h2>DMT: muchas subportadoras, cada una con su QAM</h2>
        <p>DMT (Discrete Multi-Tone) divide la banda de 1,1 MHz en <strong>256 subportadoras</strong> espaciadas <strong>en forma constante</strong> (4,3125 kHz). Para cada subportadora se mide la SNR y se elige el <strong>máximo n-QAM</strong> posible: donde el ruido es bajo, más bits por símbolo; donde es alto, menos o ninguno. Es la idea de la QAM adaptativa (Unidad 8) aplicada a cada tono.</p>
        ${eq('R ≈ Σ<sub>i</sub> r<sub>s</sub> · log₂ M<sub>i</sub> &nbsp;&nbsp; (M<sub>i</sub> según la SNR de la subportadora i)', 'Velocidad de DMT')}
        <h2>De ADSL a VDSL2</h2>
        ${table(['Tecnología', 'Espectro', 'Velocidad típica', 'Alcance'], [
          ['ADSL', 'hasta 1,1 MHz', '8 Mbps bajada / 1 Mbps subida', 'varios km'],
          ['ADSL2+', 'hasta 2,2 MHz', '24 Mbps bajada', 'menos de 3 km para el máximo'],
          ['VDSL', 'hasta 12 MHz', '50 Mbps', 'menos de 1 km'],
          ['VDSL2', 'hasta 30 MHz (12 MHz en perfiles urbanos)', '100 Mbps o más, simétrico o asimétrico', 'máximo a menos de 300 m'],
        ])}
        <p>ADSL2 y ADSL2+ son tecnologías preparadas para ofrecer tasas sensiblemente mayores que el ADSL convencional; VDSL es una línea de abonado digital de muy alta velocidad sobre distancias cortas, con una velocidad que depende de la longitud de la línea. A más frecuencia, más atenuación en el cobre (Unidad 3): por eso cuanto más espectro usa la tecnología, <strong>más corto</strong> tiene que ser el bucle.</p>
        ${note('Pasar de ADSL a VDSL2 (TP 9, ejercicio 2) obliga a <strong>acortar el cobre</strong>: llevar fibra hasta un nodo o armario cerca del usuario (FTTN/FTTC) e instalar ahí el DSLAM VDSL2. Gana ancho de banda, velocidad y modo simétrico; pierde con la distancia: lejos del nodo puede rendir como ADSL2+.', 'exam')}`,
      exercises: [
        { title: 'POTS y PSTN', official: '9.1', level: 1, prompt: '<p>Compare brevemente similitudes y diferencias entre POTS (Plain Old Telephone Service) y PSTN (Public Switched Telephone Network).</p>',
          solution: { explain: '<p><b>Similitudes:</b> los dos términos se refieren a la red telefónica tradicional y están relacionados: el servicio POTS usa la banda vocal (canal de 4 kHz) y la PSTN es la red que transporta esa banda. POTS opera sobre la infraestructura PSTN.</p><p><b>Diferencias:</b> PSTN es la <strong>infraestructura de red</strong> (centrales de conmutación de circuitos, troncales, bucles de abonado); POTS es el <strong>servicio</strong> básico de voz que corre sobre ella.</p>' } },
        { title: 'Reemplazar ADSL por VDSL2', official: '9.2', level: 2, prompt: '<p>Un ISP planea reemplazar su red ADSL por VDSL2 en una zona urbana. a) ¿Qué cambios de infraestructura serían necesarios? b) ¿Qué ventajas técnicas se obtendrían? c) ¿Cómo afectaría la distancia a los usuarios?</p>',
          solution: { explain: `<p><b>a)</b> Acortar el bucle de cobre: ya no sirve el par completo desde la central. Hay que desplegar <strong>fibra óptica</strong> hasta nodos, armarios o sótanos de edificio cercanos (topología FTTN, FTTC o FTTB), instalar ahí <strong>DSLAM VDSL2</strong> (u ONU) y reconectar el cobre del usuario a ese nodo.</p>
            <p><b>b)</b> Más espectro (hasta 12 MHz o más, contra 1,1 MHz de ADSL y 2,2 MHz de ADSL2+), por lo tanto más velocidad (100 Mbps o más en distancias cortas, contra 8 y 24 Mbps), y la posibilidad de operar en modo <strong>simétrico</strong> o asimétrico.</p>
            <p><b>c)</b> La distancia es el factor crítico: las velocidades máximas solo se logran a menos de ≈ 300 m del nodo; el rendimiento cae bruscamente con la longitud (la atenuación crece con la frecuencia) y a distancias largas VDSL2 puede rendir como ADSL2+ o menos.</p>` } },
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
      ],
      open: [
        { t: 'text', q: '¿Qué diferencia hay entre POTS y PSTN?', k: [['red', 'infraestructura'], ['servicio'], ['voz', 'vocal', 'telefon']], need: 2, e: '<p>PSTN es la red pública conmutada (infraestructura); POTS es el servicio telefónico básico de voz que corre sobre ella.</p>' },
        { t: 'text', q: '¿Qué hace el splitter de ADSL y dónde está el DSLAM?', k: [['separa', 'filtro', 'filtra'], ['voz'], ['datos'], ['central']], need: 3, e: '<p>El splitter filtra y separa la voz (0 a 4 kHz) de los datos ascendentes y descendentes. El DSLAM es el multiplexor de acceso que está en la central telefónica y concentra los módems ADSL de los abonados.</p>' },
        { t: 'text', q: '¿Cómo decide DMT cuántos bits lleva cada subportadora?', k: [['snr', 'señal a ruido', 'ruido'], ['qam'], ['subportadora', 'tono', 'portadora']], need: 2, e: '<p>Mide la SNR de cada subportadora y le asigna la QAM de mayor orden que esa SNR permita: más bits donde el canal es bueno, menos donde es ruidoso.</p>' },
      ],
      sources: [{ title: 'Trabajo Práctico 9', ref: 'Cátedra de Comunicación de Datos, UTN-FRT', points: ['POTS y PSTN.', 'Reemplazo de ADSL por VDSL2: infraestructura FTTx, ventajas y efecto de la distancia.'] },
        { title: 'Cuestionario de la Unidad 9', ref: 'Campus virtual UTN-FRT, 2025', points: ['Esquema ATU-R, splitter, bucle de abonado, ATU-C y matriz.', 'DSLAM, DMT, DTE/DCE y definición de módem.'] }],
    },

    {
      id: 'acceso-optico',
      module: 'u9',
      title: 'Redes de acceso óptico: FTTx y PON',
      keywords: 'fibra óptica red de acceso FTTx FTTN FTTC FTTB FTTH PON red óptica pasiva GPON EPON OLT ONU ONT splitter óptico WDM TDMA 1490 nm 1310 nm 1550 nm',
      tldr: 'FTTx dice <strong>hasta dónde llega la fibra</strong>: nodo (FTTN), acera (FTTC), edificio (FTTB) u hogar (FTTH); el resto es cobre. Una <strong>PON</strong> (red óptica pasiva) no tiene ningún dispositivo activo entre la central y el usuario: la <strong>OLT</strong> (en la central) y las <strong>ONU</strong> (en el usuario) son activas; el <strong>splitter</strong> óptico es pasivo. En GPON la bajada es <mark>broadcast en 1490 nm</mark> y la subida <mark>TDMA en 1310 nm</mark>.',
      goals: ['Comparar fibra y cobre en la red de acceso.', 'Diferenciar FTTN, FTTC, FTTB y FTTH.', 'Identificar elementos activos y pasivos de una PON.', 'Explicar el tráfico de subida y bajada en GPON.'],
      body: `
        <h2>Fibra contra cobre</h2>
        ${table(['Fibra (PON)', 'Cobre (xDSL)'], [
          ['Mucho más ancho de banda y velocidad', 'Velocidad limitada por la atenuación del par'],
          ['Baja atenuación, inmune a interferencias electromagnéticas', 'Pierde velocidad y sufre ruido con la distancia'],
          ['Una fibra compartida por muchos usuarios (splitter)', 'Un par por abonado'],
          ['Despliegue mucho más costoso', 'Aprovecha el plantel existente (ADSL2+, VDSL2) sin grandes inversiones'],
        ])}
        <h2>FTTx: hasta dónde llega la fibra</h2>
        ${table(['Topología', 'La fibra llega a…', 'Tramo final'], [
          ['<strong>FTTN</strong> (Node)', 'un nodo o armario del barrio', 'cobre, más de 300 m'],
          ['<strong>FTTC</strong> (Curb)', 'la acera o un poste', 'cobre, menos de 300 m'],
          ['<strong>FTTB</strong> (Building)', 'el edificio (sótano o sala de comunicaciones)', 'cobre (VDSL2) o cableado LAN'],
          ['<strong>FTTH</strong> (Home)', 'el interior del domicilio', 'ninguno: 100 % fibra'],
        ])}
        <h2>Red óptica pasiva (PON)</h2>
        ${def('PON', 'Redes de fibra óptica que no utilizan ningún otro dispositivo activo entre la central y el terminal del usuario.', 'Cuestionario de la Unidad 9, 2025.')}
        ${table(['Elemento', 'Tipo', 'Dónde'], [
          ['<strong>OLT</strong> (Optical Line Terminal)', 'Activo', 'En la central: punto de partida de la red, terminal en el proveedor de servicios'],
          ['<strong>ONU / ONT</strong> (Optical Network Unit / Terminal)', 'Activo', 'En el usuario (o en el edificio/nodo en FTTB/FTTC)'],
          ['<strong>Splitter óptico</strong>', 'Pasivo (sin energía)', 'En la red de distribución: divide la luz de una fibra en varias'],
        ])}
        <p><strong>GPON</strong> (Gigabit-capable PON) es el estándar de la <strong>ITU-T</strong>: 2,5 Gbps de bajada y 1,25 Gbps de subida. <strong>EPON</strong> (Ethernet PON) es el estándar del <strong>IEEE</strong>.</p>
        <h2>Subida y bajada en GPON</h2>
        ${table(['', 'Bajada (OLT → ONU)', 'Subida (ONU → OLT)'], [
          ['Método', 'Broadcast: la OLT emite una señal continua que el splitter reparte a todas las ONU (cada una se queda con lo suyo; va cifrado)', 'TDMA: cada ONU transmite en ráfagas dentro de las ventanas de tiempo que le asigna la OLT, para no colisionar'],
          ['Longitud de onda', '1490 nm datos (1550 nm video, opcional)', '1310 nm'],
        ])}
        <p>Subida y bajada comparten <strong>una sola fibra</strong> gracias a que usan longitudes de onda distintas (<strong>WDM</strong>, la FDM de la luz).</p>`,
      exercises: [
        { title: 'Redes de acceso óptico', official: '9.3', level: 2, prompt: '<p>Explique para las redes de acceso óptico: a) ventajas y desventajas respecto a las redes de cobre; b) diferencias entre FTTC, FTTN, FTTB y FTTH; c) redes EPON y GPON; d) elementos activos y pasivos; e) tráfico de subida y bajada en GPON.</p>',
          solution: { explain: `<p><b>a)</b> Ventajas: mucho más ancho de banda, menor atenuación e inmunidad al ruido, una fibra compartida por muchos usuarios. Desventaja: el despliegue es mucho más caro; el cobre con ADSL2+ o VDSL2 aprovecha el plantel existente.</p>
            <p><b>b)</b> Difieren en hasta dónde llega la fibra: FTTN a un nodo del barrio (cobre de más de 300 m), FTTC a la acera (menos de 300 m de cobre), FTTB al edificio (cobre o LAN interna) y FTTH hasta el hogar (100 % fibra).</p>
            <p><b>c)</b> Las dos son PON: GPON es de la ITU-T (2,5 Gbps de bajada, 1,25 Gbps de subida); EPON es del IEEE y transporta tramas Ethernet.</p>
            <p><b>d)</b> Activos: OLT (central) y ONU/ONT (usuario). Pasivo: el splitter óptico.</p>
            <p><b>e)</b> Bajada: broadcast de la OLT a todas las ONU en 1490 nm (video en 1550 nm). Subida: TDMA, cada ONU en su ventana de tiempo, en 1310 nm. Subida y bajada conviven en la misma fibra por WDM.</p>` } },
      ],
      quiz: [
        { q: 'En una PON, ¿cuál es el único elemento pasivo?', o: ['la OLT', 'la ONU', 'el splitter óptico', 'el DSLAM'], a: 2, e: 'No necesita energía: divide la luz.' },
        { q: 'En la tecnología PON, el dispositivo activo en el nodo de distribución que sirve como terminal en el proveedor de servicios es…', o: ['la ONU', 'la OLT', 'el DSLAM', 'el ATU-R'], a: 1, e: 'Optical Line Terminal. Cuestionario de la Unidad 9.' },
        { q: 'En GPON, el tráfico de subida usa…', o: ['broadcast en 1490 nm', 'TDMA en 1310 nm', 'FDM en 1550 nm', 'CSMA/CD'], a: 1, e: 'Cada ONU transmite en su ventana de tiempo.' },
        { q: 'FTTB significa que la fibra llega…', o: ['al hogar', 'al edificio', 'a la acera', 'al nodo del barrio'], a: 1, e: 'Building: después, cobre o LAN dentro del edificio.' },
        { q: 'GPON es un estándar de…', o: ['IEEE', 'ITU-T', 'ETSI', 'ANSI'], a: 1, e: 'EPON es de IEEE.' },
        { q: 'Subida y bajada comparten una sola fibra en GPON gracias a…', o: ['TDM', 'WDM (longitudes de onda distintas)', 'CDMA', 'la paridad'], a: 1, e: '1310 nm sube, 1490 nm baja.' },
      ],
      open: [
        { t: 'text', q: '¿Qué diferencia hay entre FTTC y FTTH?', k: [['acera', 'curb', 'poste'], ['hogar', 'home', 'domicilio', 'casa'], ['cobre']], need: 2, e: '<p>En FTTC la fibra llega a la acera y el último tramo (menos de 300 m) es de cobre; en FTTH la fibra llega hasta el hogar, sin cobre.</p>' },
        { t: 'text', q: '¿Cómo se ordena el tráfico de subida en GPON y por qué hace falta?', k: [['tdma', 'tdm', 'tiempo', 'ventana'], ['comparten', 'compartida', 'misma fibra', 'colision']], need: 2, e: '<p>Con TDMA: todas las ONU comparten la misma fibra hacia la OLT, así que cada una transmite en ráfagas dentro de la ventana de tiempo que le asigna la OLT, para no colisionar.</p>' },
      ],
      sources: [{ title: 'Trabajo Práctico 9', ref: 'Cátedra de Comunicación de Datos, UTN-FRT', points: ['Redes de acceso óptico: ventajas, FTTx, EPON y GPON, elementos activos y pasivos, subida y bajada.'] }],
    },
  );
})();
