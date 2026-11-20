/* Unidad 1 (1er parcial): sistemas de comunicación. Guía de la cátedra "Unidad 1 Sistemas de Comunicación 2026" y apuntes 1.2 a 1.9.
   TP 1: esquema de sistemas modernos, cuadro de redes, estandarización, OSI/TCP-IP y comparación de dos cables de par trenzado. */
(() => {
  const { LESSONS, h } = window.GUIDE;
  const { note, def, table, lab, fig, flow } = h;

  // Esquema fuente → destino con un "dato" que recorre el canal
  const schema = fig(`<svg class="dg" viewBox="0 0 640 170" role="img" aria-label="Esquema de un sistema de comunicación: fuente, transmisor, canal con ruido, receptor y destino">
    ${[['Fuente', 'genera el mensaje', 10], ['Transmisor', 'codifica / modula', 140], ['Canal', 'medio de transmisión', 270], ['Receptor', 'decodifica', 400], ['Destino', 'usa el mensaje', 530]].map(([t, s, x], i) => `<rect x="${x}" y="70" width="100" height="56" rx="8" class="b ${i === 2 ? 'w' : 'acc'}"/><text x="${x + 50}" y="92" class="t">${t}</text><text x="${x + 50}" y="111" class="ts">${s}</text>`).join('')}
    ${[110, 240, 370, 500].map((x) => `<line x1="${x}" y1="98" x2="${x + 28}" y2="98" class="ln"/><path d="M${x + 30} 98l-8-4v8z" class="ah"/>`).join('')}
    <rect x="270" y="8" width="100" height="32" rx="8" class="b n"/><text x="320" y="24" class="t">Ruido</text><line x1="320" y1="40" x2="320" y2="66" class="ln n"/><path d="M320 70l-4-8h8z" class="ah" style="fill:var(--err)"/>
    <circle r="6" class="dot mv" style="offset-path: path('M60 150 H580'); --dur: 4s"/><text x="320" y="160" class="ts">mensaje → señal → señal + ruido → mensaje aproximado</text>
  </svg>`, 'El modelo de la Unidad 1. El ruido se suma en el canal: lo que llega al destino es una aproximación del mensaje original.');

  const osiRows = [
    ['7 Aplicación', 'Se entiende con el usuario: servicios de información distribuida', 'HTTP, DNS, SMTP, POP, FTP, Telnet, SSH, DHCP'],
    ['6 Presentación', 'Traductor: formato, cifrado, compresión', 'HTML, JPEG, MP3, AVI, TLS (en parte)'],
    ['5 Sesión', 'Administra el diálogo entre aplicaciones', 'RPC, SIP, establecimiento de sesión'],
    ['4 Transporte', 'Transporte extremo a extremo, confiable y económico', 'TCP, UDP, SCTP'],
    ['3 Red', 'Encaminamiento entre redes: establecer, mantener y terminar conexiones', 'IP, ICMP, ARP*, OSPF, IPsec'],
    ['2 Enlace de datos', 'Tramas, control de errores y de flujo, acceso al medio', 'Ethernet 802.3, 802.11 (MAC/LLC), PPP, HDLC, Frame Relay, ATM'],
    ['1 Física', 'Características eléctricas, mecánicas y funcionales para mover bits', 'RJ-45, RS-232, 100BASE-TX, xDSL, SDH, FTTx'],
  ];

  LESSONS.push(
    {
      id: 'sistema-comunicacion',
      module: 'u1',
      title: 'El sistema de comunicación',
      keywords: 'objetivo fuente transmisor canal receptor destino ruido transductor datos telecomunicación entrega exactitud puntualidad jitter',
      tldr: 'Todo sistema de comunicación sirve para <mark>intercambiar información entre dos o más entidades</mark>. El modelo tiene cinco bloques: <strong>fuente → transmisor → canal → receptor → destino</strong>, y una fuente de <strong>ruido</strong> que se suma en el canal. Su efectividad depende de cuatro características: entrega, exactitud, puntualidad y jitter.',
      goals: ['Dibujar el esquema de un sistema de comunicación y explicar cada bloque.', 'Ubicar los bloques en un sistema real (WiFi, 4G, FTTH, streaming).', 'Definir las cuatro características de efectividad de la transmisión de datos.'],
      body: `
        <h2>Objetivo y definiciones</h2>
        ${def('Objetivo de un sistema de comunicación', 'El objetivo principal de todo sistema de comunicaciones es intercambiar información entre dos o más entidades.', 'Guía de la Unidad 1')}
        <p>La comunicación puede ser <strong>local</strong> (cara a cara) o <strong>remota</strong>. <em>Telecomunicación</em> (tele = lejos, en griego) es la comunicación a distancia: telefonía, telegrafía, televisión, redes de datos.</p>
        ${def('Datos', 'Hechos, conceptos e instrucciones presentados en cualquier formato acordado entre las partes que crean y utilizan dichos datos.', 'Forouzan, citado en la guía')}
        ${def('Transmisión de datos', 'Intercambio de información entre dos dispositivos a través de alguna forma de medio de transmisión, como un cable de cobre, fibra óptica o el espacio (señal electromagnética).', 'Guía de la Unidad 1')}
        <p>Para que la transmisión sea posible, los dispositivos forman parte de un sistema de <strong>hardware</strong> (equipos físicos) y <strong>software</strong> (programas). Una <strong>red de telecomunicaciones</strong> es una infraestructura que da comunicación entre múltiples entidades, de manera eficiente, usando distintas tecnologías (eléctricas, electrónicas, electromagnéticas, ópticas).</p>
        <h2>El esquema de cinco bloques</h2>
        ${schema}
        ${table(['Bloque', 'Qué hace', 'Ejemplo (WiFi doméstico)'], [
          ['<strong>Fuente</strong>', 'Genera la información (audio, video, datos), analógica o digital. Selecciona el mensaje de un conjunto de mensajes posibles. Se describe por el ancho de banda que ocupa.', 'La notebook que manda un archivo'],
          ['<strong>Transmisor</strong>', 'Transforma y codifica el mensaje en una señal apropiada para el canal. Si la información no es eléctrica, un <strong>transductor</strong> la convierte.', 'Placa WiFi: codifica y modula en 2,4 o 5 GHz'],
          ['<strong>Canal</strong>', 'Medio por el que viaja la señal: desde una línea simple hasta una red compleja (sistema de transmisión).', 'El aire (medio no guiado)'],
          ['<strong>Fuente de ruido</strong>', 'Distorsiones o adiciones no deseadas que afectan a la señal: errores de transmisión, distorsión de imagen o sonido.', 'Microondas, otras redes WiFi, paredes'],
          ['<strong>Receptor</strong>', 'Transforma la señal recibida en un formato entendible para el destino; decodifica una <em>aproximación</em> del mensaje.', 'El router: demodula y decodifica'],
          ['<strong>Destino</strong>', 'Recibe y usa el mensaje.', 'El servidor o el otro equipo'],
        ])}
        ${note('El transmisor casi nunca envía los datos “tal cual” los genera la fuente: los transforma en señales electromagnéticas aptas para el canal. Ejemplo de la guía: el módem convierte los bits de la PC en señales analógicas que viajan por la red telefónica.', 'tip')}
        ${lab(0)}
        <h2>Efectividad: cuatro características</h2>
        ${table(['Característica', 'Significa'], [
          ['<strong>Entrega</strong>', 'Los datos llegan al destino correcto, y solo a él.'],
          ['<strong>Exactitud</strong>', 'Llegan sin errores (o con los errores detectados y corregidos).'],
          ['<strong>Puntualidad</strong>', 'Llegan a tiempo: el video o la voz tarde no sirven.'],
          ['<strong>Jitter</strong> (retardo variable)', 'Variación del tiempo de llegada de los paquetes: si unos llegan a 30 ms y otros a 40 ms, el audio o video se entrecorta.'],
        ])}
        ${note('El TP 1 pide identificar los ruidos de cada sistema: EMI (interferencia electromagnética) y RFI (de radiofrecuencia) en cobre e inalámbricos, pérdidas ópticas en fibra, jitter en streaming. Todo eso se estudia en detalle en la Unidad 3.', 'exam')}`,
      labs: [
        { type: 'classify', title: 'Cada pieza en su bloque', intro: 'Sistema: una videollamada por 4G. ¿En qué bloque del esquema va cada elemento?', buckets: ['Fuente', 'Transmisor', 'Canal', 'Ruido', 'Receptor', 'Destino'],
          items: [
            { t: 'La cámara y el micrófono del celular (con su transductor)', b: 0, why: 'Generan la información.' },
            { t: 'El módem 4G del celular que modula la señal', b: 1, why: 'Adapta la señal al canal.' },
            { t: 'El espacio libre entre el celular y la antena', b: 2, why: 'Medio no guiado.' },
            { t: 'La interferencia de otras celdas y la lluvia', b: 3, why: 'Se suma a la señal en el canal.' },
            { t: 'La estación base que demodula', b: 4, why: 'Recupera el mensaje.' },
            { t: 'La persona que ve la videollamada del otro lado', b: 5, why: 'Usa el mensaje.' },
            { t: 'El jitter de la red de transporte', b: 3, why: 'Es una perturbación del sistema: retardo variable.' },
          ] },
      ],
      exercises: [
        { title: 'Dos sistemas modernos con el esquema de la Unidad 1', official: '1.1', level: 1, prompt: '<p>Elegir dos sistemas modernos (4G/5G, WiFi doméstico, FTTH, streaming). Para cada uno: dibujar el modelo señalando cada componente, identificar los ruidos presentes e indicar si el medio es guiado o no guiado.</p>',
          solution: { explain: `${table(['Bloque', 'Enlace WiFi doméstico', 'Fibra FTTH'], [
            ['Fuente', 'Notebook / celular (datos)', 'Servidor del proveedor (datos, video, voz)'],
            ['Transmisor', 'Placa WiFi: codifica, modula (OFDM) a 2,4/5 GHz y la antena irradia', 'OLT del proveedor: láser que convierte bits en pulsos de luz'],
            ['Canal', 'Aire: <strong>no guiado</strong>', 'Fibra monomodo y splitters ópticos: <strong>guiado</strong>'],
            ['Ruido', 'Interferencia de otras redes y microondas (RFI), atenuación por paredes, multitrayecto, ruido térmico del receptor', 'Pérdidas ópticas (atenuación dB/km, empalmes, conectores, splitters), dispersión, curvaturas'],
            ['Receptor', 'Router: antena, demodulador, decodificador', 'ONT en la casa: fotodetector que vuelve la luz a bits'],
            ['Destino', 'Servidor o equipo de la red', 'Router y equipos del usuario'],
          ])}<p>En 4G/5G el canal es no guiado (espacio libre) con ruido por interferencia entre celdas, multitrayecto y desvanecimiento; en streaming se suma el <strong>jitter</strong> de la red, que el reproductor compensa con un buffer.</p>` } },
      ],
      quiz: [
        { q: '¿Cuál es el objetivo principal de un sistema de comunicación?', o: ['Amplificar señales', 'Intercambiar información entre dos o más entidades', 'Eliminar el ruido', 'Conectar computadoras a Internet'], a: 1, e: 'Definición textual de la guía.' },
        { q: 'El bloque que adapta el mensaje a una forma apropiada para el canal es…', o: ['la fuente', 'el transmisor', 'el receptor', 'el destino'], a: 1, e: 'Transforma o codifica la información para el medio.' },
        { q: 'Si la información de la fuente no es eléctrica (sonido, luz), se convierte con…', o: ['un repetidor', 'un transductor', 'un multiplexor', 'un filtro'], a: 1, e: 'El transductor (por ejemplo, un micrófono) está dentro del transmisor.' },
        { q: '¿Dónde se ubica la fuente de ruido en el modelo?', o: ['En la fuente', 'En el canal', 'Solo en el receptor', 'En el destino'], a: 1, e: 'Se suma a la señal mientras viaja por el canal.' },
        { q: 'El jitter es…', o: ['la pérdida de potencia', 'la variación del retardo de llegada de los paquetes', 'un error de un bit', 'la interferencia entre pares'], a: 1, e: 'Retardo variable: afecta sobre todo a audio y video en tiempo real.' },
        { q: '¿Cuál NO es una de las cuatro características de efectividad?', o: ['Entrega', 'Exactitud', 'Puntualidad', 'Modulación'], a: 3, e: 'Son entrega, exactitud, puntualidad y jitter.' },
      ],
      open: [
        { t: 'text', q: 'Nombrá los cinco bloques del esquema de un sistema de comunicación, en orden.', k: [['fuente'], ['transmisor', 'emisor'], ['canal', 'medio'], ['receptor'], ['destino']], need: 5, e: '<p>Fuente → Transmisor → Canal (donde se suma el ruido) → Receptor → Destino.</p>' },
        { t: 'text', q: '¿Qué hace el receptor y por qué se dice que entrega una “aproximación” del mensaje?', k: [['decodifica', 'demodula', 'transforma'], ['ruido', 'distorsion', 'atenuacion'], ['destino', 'formato']], e: '<p>El receptor transforma la señal que llega del canal en un formato entendible para el destino (demodula y decodifica). Como en el canal la señal sufrió ruido, atenuación y distorsión, lo que reconstruye es una aproximación del mensaje original.</p>' },
        { t: 'text', q: 'Definí jitter y decí a qué tipo de tráfico perjudica más.', k: [['variacion', 'variable'], ['retardo', 'demora', 'tiempo de llegada'], ['tiempo real', 'video', 'voz', 'audio', 'streaming']], e: '<p>Jitter es la variación del retardo con que llegan los paquetes. Perjudica al tráfico en tiempo real (voz, videollamadas, streaming), que se entrecorta si los paquetes no llegan con un ritmo constante.</p>' },
      ],
      sources: [{ title: 'Stallings, cap. 1: modelo para las comunicaciones', ref: 'Stallings, 7ª ed.', points: ['Fuente, transmisor, sistema de transmisión, receptor y destino.', 'El transmisor genera señales electromagnéticas a partir de los datos.'] }],
    },
    {
      id: 'redes-topologias',
      module: 'u1',
      title: 'Redes: conexiones, topologías y alcance',
      keywords: 'red nodo enlace punto a punto multipunto topología malla estrella bus anillo rendimiento fiabilidad seguridad LAN MAN WAN PAN SAN ancho de banda latencia',
      tldr: 'Una red es un conjunto de <strong>nodos</strong> unidos por <strong>enlaces</strong>. La línea puede ser <mark>punto a punto</mark> (dedicada) o <mark>multipunto</mark> (compartida en espacio o tiempo). La forma física es la <strong>topología</strong>: malla, estrella, bus o anillo. Según el área que cubren, las redes son PAN, LAN, MAN, WAN y SAN.',
      goals: ['Comparar las cuatro topologías básicas: ventajas, desventajas y cantidad de enlaces.', 'Explicar los criterios de una red efectiva: rendimiento, fiabilidad y seguridad.', 'Completar el cuadro comparativo PAN, LAN, MAN, WAN y SAN del TP 1.'],
      body: `
        <h2>Red, nodo y enlace</h2>
        ${def('Red', 'Conjunto de dispositivos (a menudo denominados nodos) conectados por enlaces de un medio físico, mediante cable o inalámbricos, usando protocolos específicos.', 'Guía de la Unidad 1')}
        <p>Un <strong>nodo</strong> puede ser una computadora, una impresora o cualquier dispositivo capaz de enviar o recibir datos. El objetivo de la red es <strong>compartir recursos</strong>: archivos, impresoras, almacenamiento.</p>
        <h2>Criterios de una red efectiva</h2>
        ${table(['Criterio', 'Depende de / se mide por'], [
          ['<strong>Rendimiento</strong>', 'Número de usuarios, tipo de medio, capacidad del hardware y eficiencia del software. Métricas: <strong>ancho de banda</strong> y <strong>latencia</strong>, que son contradictorias: para enviar más datos se sube el ancho de banda, pero la congestión aumenta la latencia.'],
          ['<strong>Fiabilidad</strong>', 'Frecuencia de fallas, tiempo de recuperación de un enlace y robustez ante una catástrofe.'],
          ['<strong>Seguridad</strong>', 'Protección frente a accesos no autorizados, fallas y modificaciones, y políticas para recuperarse de interrupciones y pérdidas de datos.'],
        ])}
        <h2>Tipo de conexión</h2>
        ${table(['Punto a punto', 'Multipunto'], [[
          'Enlace dedicado entre dos dispositivos: toda la capacidad del canal se reserva para ellos.',
          'Varios dispositivos comparten el enlace. Si lo usan a la vez es <strong>compartido espacialmente</strong>; si lo usan por turnos, <strong>de tiempo compartido</strong>.',
        ]])}
        <h2>Topología física</h2>
        <p>Es la representación geométrica de la relación entre enlaces y nodos. Se elige según la distribución de los equipos, el tráfico y el presupuesto.</p>
        ${lab(0)}
        ${table(['Topología', 'Característica', 'Ventajas', 'Desventajas'], [
          ['<strong>Malla</strong>', 'Enlace punto a punto dedicado con cada otro nodo: n(n − 1)/2 enlaces, n − 1 puertos por nodo', 'Robusta, privada, fallas fáciles de aislar', 'Mucho cable y muchos puertos'],
          ['<strong>Estrella</strong>', 'Cada nodo solo se une al concentrador central', 'Barata por nodo (1 puerto), fácil de instalar y reconfigurar; si falla un enlace solo cae ese nodo', 'Punto único de falla: si cae el concentrador, cae la red'],
          ['<strong>Bus</strong>', 'Cable troncal con derivaciones (latiguillos)', 'Sencilla, usa poco cable', 'Difícil de reconfigurar y aislar fallas; una rotura del troncal corta todo'],
          ['<strong>Anillo</strong>', 'Cada nodo se une a sus dos vecinos; la señal circula en un sentido y cada nodo tiene un repetidor', 'Agregar o quitar un nodo mueve dos conexiones; fallas fáciles de aislar', 'Tráfico unidireccional; si se corta el cable o falla una estación, se paraliza la red'],
        ])}
        ${note('La cantidad de enlaces de una malla completa de n nodos es <strong>n(n − 1)/2</strong> (5 nodos → 10 enlaces; 10 nodos → 45). Cada nodo necesita n − 1 puertos de E/S.', 'exam')}
        <h2>Según la zona geográfica</h2>
        ${lab(1)}
        ${table(['Tipo', 'Alcance', 'Uso y medios', 'Velocidades típicas', 'Ejemplos'], [
          ['<strong>PAN</strong> (personal)', 'Centímetros a pocos metros alrededor de una persona', 'Dispositivos personales; radio de corto alcance (Bluetooth, IrDA, ZigBee, USB inalámbrico). Baja potencia.', 'Bluetooth 5: hasta 2 Mbps', 'Celular con auriculares y reloj'],
          ['<strong>LAN</strong> (local)', 'Edificio o campus, pocos km', 'Compartir recursos en una organización; Ethernet (cobre, fibra) y WiFi. Privada, administración centralizada.', 'De Mbps a Gbps (generalmente ≥ 1000 Mbps)', 'Red de una oficina o de la facultad'],
          ['<strong>MAN</strong> (metropolitana)', 'Una ciudad', 'Interconecta LAN; fibra, cable, enlaces alquilados; tecnologías MPLS, ATM, Frame Relay.', 'Altas, mayores que las WAN', 'Red de TV por cable de una ciudad'],
          ['<strong>WAN</strong> (extensa)', 'País o continente', 'Interconecta LAN y MAN; líneas telefónicas, fibra, cables submarinos, satélites, microondas; hosts + subred de conmutación (routers).', 'Muy variables', 'Internet, red de un banco con sucursales'],
          ['<strong>SAN</strong> (almacenamiento)', 'Data center', 'Conecta servidores con almacenamiento; tráfico separado del de usuario; Fibre Channel, iSCSI, FCoE; redundante.', 'Muy altas', 'Almacenamiento de un centro de datos'],
        ])}`,
      labs: [
        { type: 'topology', title: 'Topologías: enlaces, puertos y fallas', intro: 'Cambiá la topología y la cantidad de nodos. Después hacé fallar un enlace: ¿a quién afecta?', topo: 'malla', n: 5 },
        { type: 'classify', title: '¿Qué tipo de red es?', buckets: ['PAN', 'LAN', 'MAN', 'WAN', 'SAN'], items: [
          { t: 'Auriculares Bluetooth conectados al celular', b: 0 },
          { t: 'Las PC y la impresora de un laboratorio de la facultad', b: 1 },
          { t: 'La red de fibra que une las sucursales de una empresa dentro de San Miguel de Tucumán', b: 2 },
          { t: 'La red que une las sedes de un banco en todo el país', b: 3 },
          { t: 'Servidores conectados por Fibre Channel a un arreglo de discos', b: 4 },
          { t: 'Un smartwatch sincronizando con la tablet', b: 0 },
          { t: 'Internet', b: 3, why: 'Es la WAN por excelencia: interconecta redes en todo el mundo.' },
        ] },
      ],
      exercises: [
        { title: 'Cuadro comparativo de redes por alcance', official: '1.2', level: 1, prompt: '<p>Realizar un cuadro comparativo de PAN, LAN, MAN, WAN y SAN con: lugares que abarca, tipos de enlaces, utilización, velocidades y ejemplos.</p>', solution: { explain: '<p>Es el cuadro de la teoría (“Según la zona geográfica”). Puntos que la cátedra espera ver: PAN centrada en una persona y de baja potencia; LAN privada y de alta velocidad; MAN a nivel ciudad interconectando LAN; WAN de gran alcance con subred de conmutación y mayor costo; SAN dedicada al almacenamiento con tráfico separado del de usuario y protocolos propios (Fibre Channel, iSCSI, FCoE).</p>' } },
        { title: 'Malla para 8 edificios', level: 2, prompt: '<p>Se quiere unir 8 edificios con una malla completa. ¿Cuántos enlaces y cuántos puertos por edificio hacen falta? ¿Y con una estrella?</p>', solution: { explain: '<p>Malla: n(n − 1)/2 = 8·7/2 = <strong>28 enlaces</strong> y 7 puertos por edificio. Estrella: 8 enlaces (uno por edificio al concentrador) y 1 puerto por edificio, más un concentrador de 8 puertos, que es el punto único de falla.</p>' } },
      ],
      quiz: [
        { q: '¿Cuántos enlaces necesita una malla completa de 6 nodos?', o: ['6', '12', '15', '30'], a: 2, e: 'n(n − 1)/2 = 6·5/2 = 15.' },
        { q: 'La mayor desventaja de la topología estrella es…', o: ['usa mucho cable', 'depende de un punto único (el concentrador)', 'el tráfico es unidireccional', 'es difícil agregar nodos'], a: 1, e: 'Si cae el concentrador, cae toda la red.' },
        { q: 'En una topología anillo, cada dispositivo…', o: ['se une a todos los demás', 'se une al concentrador', 'tiene un repetidor que regenera la señal', 'se conecta con un latiguillo al troncal'], a: 2, e: 'La señal pasa de nodo en nodo y cada uno la regenera.' },
        { q: 'Una línea multipunto que los usuarios usan por turnos es…', o: ['compartida espacialmente', 'de tiempo compartido', 'punto a punto', 'dedicada'], a: 1, e: 'Si la usan a la vez, compartida espacialmente.' },
        { q: '¿Qué red usa protocolos como Fibre Channel o iSCSI?', o: ['PAN', 'LAN', 'WAN', 'SAN'], a: 3, e: 'Red de almacenamiento, con tráfico separado del de usuario.' },
        { q: 'Las dos métricas del rendimiento de una red son…', o: ['seguridad y fiabilidad', 'ancho de banda y latencia', 'BER y SNR', 'topología y medio'], a: 1, e: 'Y son contradictorias: más tráfico, más congestión y latencia.' },
        { q: 'Una red que cubre una ciudad e interconecta LAN es una…', o: ['PAN', 'MAN', 'SAN', 'WAN'], a: 1, e: 'Metropolitan Area Network.' },
      ],
      open: [
        { t: 'num', q: '¿Cuántos enlaces punto a punto necesita una topología en malla completa de 12 dispositivos?', a: 66, tol: 0, u: 'enlaces', e: '<p>n(n − 1)/2 = 12·11/2 = 66.</p>' },
        { t: 'text', q: 'Compará malla y estrella: una ventaja y una desventaja de cada una.', k: [['malla'], ['estrella'], ['robusta', 'falla', 'privacidad', 'seguridad'], ['cable', 'puertos', 'costo', 'cara'], ['concentrador', 'hub', 'switch', 'punto unico', 'central']], e: '<p><b>Malla</b>: robusta y privada (si falla un enlace el resto sigue, fallas fáciles de aislar), pero necesita mucho cable y muchos puertos. <b>Estrella</b>: barata y fácil de instalar y reconfigurar (un puerto por nodo), pero todo depende del concentrador: punto único de falla.</p>' },
        { t: 'text', q: '¿Por qué ancho de banda y latencia se consideran métricas contradictorias?', k: [['ancho de banda', 'mas datos'], ['latencia', 'retardo', 'demora'], ['congestion', 'trafico']], e: '<p>Para enviar más datos se aumenta el ancho de banda utilizado, pero más tráfico genera congestión en la red, y la congestión aumenta la latencia.</p>' },
      ],
    },
    {
      id: 'normalizacion',
      module: 'u1',
      title: 'Estandarización y organismos de normalización',
      keywords: 'estándar norma arquitectura cerrada abierta ISO IEEE 802 ITU-T UIT ISOC IETF IAB ATM forum ANSI TIA EIA ETSI interoperabilidad',
      tldr: 'Un <strong>estándar</strong> es un acuerdo documentado con especificaciones técnicas que se usan de forma consistente. Permite que equipos de <mark>distintos fabricantes se comuniquen</mark>. Las arquitecturas cerradas (propietarias) solo funcionan con equipos del mismo fabricante. Organismos clave: ISO, IEEE (comité 802), UIT-T, ISOC/IETF, ATM Forum, ANSI, TIA y ETSI.',
      goals: ['Explicar qué es una arquitectura cerrada y por qué hace falta estandarizar.', 'Enumerar ventajas y desventajas de los estándares.', 'Asociar cada organismo con lo que normaliza.'],
      body: `
        <h2>Qué es un estándar</h2>
        ${def('Estándar', 'Acuerdos documentados que contienen especificaciones técnicas u otros criterios precisos para ser usados consistentemente como reglas, guías o definiciones de características, para asegurar que los materiales, productos, procesos y servicios cumplan con su propósito.', 'Guía de la Unidad 1')}
        <p>Deben estar <strong>documentados</strong> (escritos) para que todos los interpreten igual. Son “la esencia de la interconexión de redes”: al comprar un celular importa primero que cumpla los estándares de bandas y capacidad, no la marca.</p>
        <h2>Arquitecturas cerradas y abiertas</h2>
        <p>Una <strong>arquitectura cerrada</strong> (propietaria) es la que define un fabricante para sus propios equipos: solo se comunican entre sí y el cliente queda atado a ese proveedor. Ejemplos históricos: SNA de IBM, DECnet de Digital, AppleTalk de Apple, NetBEUI de Microsoft. Las redes incompatibles entre sí fueron el motivo por el que ISO creó el modelo OSI (Open Systems Interconnection): una arquitectura <strong>abierta</strong>.</p>
        ${table(['Beneficios', 'Desventajas'], [[
          '<ul><li>Marcas reemplazables y soluciones independientes del vendedor</li><li>Productos de distintos fabricantes se comunican</li><li>Uso universal y productos menos costosos</li><li>Acceso a un mercado mayor</li><li>Más flexibilidad para el comprador</li></ul>',
          '<ul><li>Tienden a <strong>congelar la tecnología</strong>: mientras un estándar se desarrolla, revisa y adopta, pueden aparecer técnicas mejores</li><li><strong>Proliferación</strong> de estándares para la misma función, por falta de cooperación entre organismos</li></ul>',
        ]])}
        <h2>Organismos principales</h2>
        ${table(['Organismo', 'Qué es / qué normaliza'], [
          ['<strong>ISOC</strong> (Internet Society)', 'Asociación de más de 150 organizaciones; agrupa a los responsables de normalizar Internet: <strong>IAB</strong> (arquitectura) e <strong>IETF</strong> (ingeniería, publica los RFC).'],
          ['<strong>IEEE</strong>, comité 802', 'Redes LAN y MAN: 802.3 Ethernet, 802.5 Token Ring, 802.11 WiFi, 802.15 Bluetooth/PAN, 802.16 WiMAX, puentes y VLAN.'],
          ['<strong>UIT-T</strong> (ITU-T)', 'Sector de normalización de la Unión Internacional de Telecomunicaciones (ONU): coordina gobiernos y sector privado en redes y servicios globales (por ejemplo G.992 ADSL; 3GPP para telefonía móvil).'],
          ['<strong>ATM Forum</strong>', 'Promueve productos y especificaciones interoperables de ATM (Asynchronous Transfer Mode).'],
          ['<strong>ISO</strong>', 'Federación no gubernamental de organismos nacionales de más de 140 países (uno por país); creó el modelo OSI; ISO 8877 (conectores RJ), ISO/IEC 11801 (cableado).'],
          ['<strong>ANSI</strong>', 'Supervisa los estándares en EE. UU. (sin fines de lucro).'],
          ['<strong>TIA</strong> (y EIA)', 'Acreditada por ANSI; normas de cableado: TIA-568 (cableado estructurado, pines RJ-45), TIA-569 (canalizaciones), TIA-598 (colores de fibra), TIA-942 (data centers).'],
          ['<strong>ETSI</strong>', 'Instituto europeo: estandarizó GSM (2G), GPRS/EDGE y UMTS (3G).'],
        ])}
        ${lab(0)}`,
      labs: [
        { type: 'classify', title: '¿Quién lo normaliza?', buckets: ['IEEE 802', 'UIT-T', 'IETF / ISOC', 'ISO', 'TIA/EIA', 'ETSI'], items: [
          { t: 'WiFi (802.11)', b: 0 }, { t: 'Ethernet (802.3)', b: 0 }, { t: 'ADSL (G.992)', b: 1 }, { t: 'Los RFC que definen TCP/IP', b: 2 },
          { t: 'El modelo de referencia OSI', b: 3 }, { t: 'Cableado estructurado TIA-568', b: 4 }, { t: 'GSM y UMTS', b: 5 }, { t: 'Código de colores de fibra TIA-598', b: 4 },
        ] },
      ],
      exercises: [
        { title: 'Preguntas sobre estandarización', official: '1.3', level: 1, prompt: '<p>a) ¿Qué son las arquitecturas cerradas? Ejemplos. b) ¿Por qué es necesaria la estandarización? c) ¿Qué ventajas tiene en las redes de telecomunicaciones? d) ¿Cuáles son los principales organismos?</p>',
          solution: { explain: '<p><b>a)</b> Arquitecturas propietarias de un fabricante, cuyos equipos solo se comunican entre sí (SNA de IBM, DECnet, AppleTalk). <b>b)</b> Porque las redes construidas con hardware y software distintos eran incompatibles y no podían comunicarse; los estándares garantizan la interoperabilidad. <b>c)</b> Productos de distintos fabricantes se comunican, marcas reemplazables, menor costo, mercado mayor y más flexibilidad para el comprador. <b>d)</b> ISO, IEEE (comité 802), UIT-T, ISOC (IETF, IAB), ATM Forum, y además ANSI, TIA/EIA y ETSI.</p>' } },
      ],
      quiz: [
        { q: 'Una arquitectura cerrada es aquella que…', o: ['no tiene capas', 'es propietaria: solo funciona con equipos del mismo fabricante', 'no usa cables', 'fue definida por ISO'], a: 1, e: 'Por ejemplo SNA de IBM.' },
        { q: '¿Qué comité del IEEE normaliza las LAN y MAN?', o: ['802', '568', 'G.992', 'X.25'], a: 0, e: '802.3 Ethernet, 802.11 WiFi, 802.15 Bluetooth.' },
        { q: 'Una desventaja de los estándares es que…', o: ['encarecen los productos', 'tienden a congelar la tecnología', 'impiden la interoperabilidad', 'atan al cliente a un fabricante'], a: 1, e: 'Mientras se aprueba un estándar pueden aparecer técnicas mejores.' },
        { q: 'El IETF pertenece a…', o: ['la ONU', 'la ISOC', 'el IEEE', 'la TIA'], a: 1, e: 'Internet Society: IAB e IETF.' },
        { q: 'ETSI estandarizó…', o: ['Ethernet', 'GSM y UMTS', 'el modelo OSI', 'TCP/IP'], a: 1, e: '2G y 3G en Europa.' },
        { q: 'ISO es…', o: ['una empresa de EE. UU.', 'una federación de organismos nacionales de normalización', 'un sector de la UIT', 'un comité del IEEE'], a: 1, e: 'Más de 140 países, uno por país; no gubernamental.' },
      ],
      open: [
        { t: 'text', q: '¿Por qué es necesaria la estandarización en las redes de datos?', k: [['incompatib', 'distintos fabricantes', 'diferentes fabricantes', 'distintas marcas'], ['comunic', 'interoperab', 'interconex']], e: '<p>Porque redes y equipos desarrollados con hardware y software diferentes resultaban incompatibles y no podían comunicarse. Los estándares garantizan la interoperabilidad: equipos de distintos fabricantes pueden comunicarse.</p>' },
        { t: 'text', q: 'Nombrá dos ventajas y una desventaja de los estándares.', k: [['fabricante', 'marca', 'vendedor', 'interoperab', 'comunic'], ['costo', 'barato', 'economic', 'mercado', 'flexib', 'universal'], ['congela', 'prolifer']], e: '<p>Ventajas: productos de distintos fabricantes se comunican (marcas reemplazables), menor costo, uso universal, mercado mayor, flexibilidad para el comprador. Desventajas: congelan la tecnología y proliferan estándares para la misma función.</p>' },
      ],
    },
    {
      id: 'osi-tcpip',
      module: 'u1',
      title: 'Modelos de capas: OSI y TCP/IP',
      keywords: 'modelo de referencia OSI ISO siete capas aplicación presentación sesión transporte red enlace física TCP/IP cuatro capas internet acceso a la red protocolo encapsulamiento conmutación de paquetes',
      tldr: 'Los protocolos se organizan en <strong>capas</strong>: cada una ofrece un servicio a la de arriba. El modelo <mark>OSI</mark> de ISO tiene <strong>7 capas</strong> (física, enlace, red, transporte, sesión, presentación, aplicación) y es un modelo teórico de referencia. <mark>TCP/IP</mark> tiene <strong>4</strong> (acceso a la red, internet, transporte, aplicación) y es el que usa Internet.',
      goals: ['Dibujar las 7 capas de OSI y las 4 de TCP/IP y hacerlas corresponder.', 'Ubicar protocolos conocidos en su capa.', 'Resumir semejanzas y diferencias entre los dos modelos.'],
      body: `
        <h2>Por qué capas</h2>
        <p>Dividir la comunicación en capas <strong>reduce la complejidad</strong>, estandariza las interfaces, facilita el diseño modular, asegura la interoperabilidad, acelera la evolución (se cambia una capa sin tocar las demás) y simplifica la enseñanza. Las capas inferiores (física y enlace) se implementan sobre todo en <strong>hardware</strong>; las superiores, en <strong>software</strong>.</p>
        <h2>Modelo OSI (ISO)</h2>
        ${table(['Capa', 'Función', 'Protocolos y ejemplos'], osiRows)}
        ${note('Regla para recordarlas de abajo hacia arriba: <strong>F</strong>ísica, <strong>E</strong>nlace, <strong>R</strong>ed, <strong>T</strong>ransporte, <strong>S</strong>esión, <strong>P</strong>resentación, <strong>A</strong>plicación.', 'tip')}
        ${lab(0)}
        <h2>Modelo TCP/IP</h2>
        <p>Lo creó el Departamento de Defensa de EE. UU. (DoD) para una red que sobreviviera a cualquier circunstancia, incluso una guerra nuclear. Es el estándar histórico y técnico de Internet.</p>
        ${fig(`<svg class="dg" viewBox="0 0 520 300" role="img" aria-label="Correspondencia entre las capas OSI y TCP/IP">
          ${['Aplicación', 'Presentación', 'Sesión', 'Transporte', 'Red', 'Enlace de datos', 'Física'].map((t, i) => `<rect x="20" y="${10 + i * 40}" width="190" height="34" rx="6" class="b ${i < 3 ? 'acc' : i === 3 ? 'ok' : i === 4 ? 'w' : 'n'}"/><text x="115" y="${27 + i * 40}" class="t">${7 - i} ${t}</text>`).join('')}
          ${[['Aplicación', 0, 3, 'acc'], ['Transporte', 3, 1, 'ok'], ['Internet', 4, 1, 'w'], ['Acceso a la red', 5, 2, 'n']].map(([t, a, n, c]) => `<rect x="310" y="${10 + a * 40}" width="190" height="${n * 40 - 6}" rx="6" class="b ${c}"/><text x="405" y="${7 + a * 40 + (n * 40) / 2}" class="t">${t}</text>`).join('')}
          <text x="115" y="296" class="ts">OSI (7 capas)</text><text x="405" y="296" class="ts">TCP/IP (4 capas)</text>
          ${[0, 3, 4, 5].map((a) => `<line x1="210" y1="${27 + a * 40}" x2="310" y2="${27 + a * 40}" class="ln d"/>`).join('')}
        </svg>`, 'TCP/IP junta sesión, presentación y aplicación en una sola capa de aplicación, y física con enlace en la de acceso a la red.')}
        ${table(['Capa TCP/IP', 'Protocolos'], [['Aplicación', 'HTTP, DNS, SMTP, FTP, SSH, DHCP, SNMP, RIP'], ['Transporte', 'TCP, UDP, DCCP'], ['Internet', 'IP, ICMP, IGMP, IPsec, ARP'], ['Acceso a la red', 'Ethernet 802.3, 802.11, ATM, FDDI, enlaces serie y ópticos']])}
        <h2>Semejanzas y diferencias</h2>
        ${table(['', 'OSI', 'TCP/IP'], [
          ['Naturaleza', 'Modelo teórico de referencia; se definió <strong>antes</strong> que los protocolos', 'Modelo práctico; se armó a partir de protocolos que ya funcionaban'],
          ['Capas', '7, con sesión, presentación y aplicación independientes, y física y enlace separadas', '4: sesión y presentación van dentro de aplicación; física y enlace forman acceso a la red'],
          ['Uso', 'Las redes no se construyen sobre OSI: se usa como guía y para enseñar', 'Internet y la mayoría de las redes actuales; miles de aplicaciones con APIs bien documentadas'],
          ['Servicios e interfaces', 'Distingue claramente servicios, interfaces y protocolos', 'No los separa tan claramente'],
        ])}
        ${note('<strong>Semejanzas</strong>: los dos se dividen en capas, los dos usan <strong>conmutación de paquetes</strong> (no de circuitos: cada paquete puede tomar una ruta distinta) y los dos tienen capas de transporte y de red equivalentes.', 'exam')}
        <h2>La capa física, el piso de esta materia</h2>
        <p>Comunicación de Datos estudia sobre todo la <strong>capa 1</strong>: toma la trama completa de la capa de enlace y la convierte en una secuencia de señales que se envían una por vez por el medio: pulsos eléctricos en el cobre, pulsos de luz en la fibra, ondas de radio en el aire. Define cuatro áreas de estándares: propiedades físicas y eléctricas de los medios, propiedades mecánicas de los conectores, representación de los bits (<strong>codificación</strong>, Unidad 7) y señales de control (<strong>señalización</strong>). En el receptor hace lo inverso: recupera las señales, las convierte en bits y entrega la trama al enlace.</p>
        ${lab(1)}`,
      labs: [
        { type: 'order', title: 'Ordená las capas OSI de abajo (1) hacia arriba (7)', items: ['Física', 'Enlace de datos', 'Red', 'Transporte', 'Sesión', 'Presentación', 'Aplicación'], explain: 'F-E-R-T-S-P-A. Física y enlace en hardware; de red hacia arriba, software.' },
        { type: 'classify', title: '¿En qué capa OSI trabaja?', buckets: ['1 Física', '2 Enlace', '3 Red', '4 Transporte', '7 Aplicación'], items: [
          { t: 'Conector RJ-45 y niveles de tensión del cable', b: 0 }, { t: 'Ethernet: direcciones MAC y tramas', b: 1 }, { t: 'IP: direccionamiento y ruteo', b: 2 }, { t: 'TCP: entrega confiable con control de flujo', b: 3 },
          { t: 'HTTP pidiendo una página web', b: 4 }, { t: 'HDLC y PPP', b: 1 }, { t: 'UDP', b: 3 }, { t: 'xDSL y fibra FTTH', b: 0 }, { t: 'ICMP (ping)', b: 2 }, { t: 'DNS', b: 4 },
        ] },
      ],
      exercises: [
        { title: 'OSI y TCP/IP', official: '1.4', level: 1, prompt: '<p>Dibujar los modelos OSI y TCP/IP con sus capas. a) Resumir similitudes y diferencias. b) Dar ejemplos de usos de esos estándares.</p>',
          solution: { explain: '<p>El dibujo es la figura de correspondencia de la teoría. <b>a)</b> Semejanzas: ambos en capas, conmutación de paquetes, transporte y red equivalentes. Diferencias: 7 vs 4 capas, OSI teórico (definido antes que sus protocolos) vs TCP/IP práctico, OSI separa servicios, interfaces y protocolos. <b>b)</b> OSI: como referencia para diseñar, enseñar y diagnosticar fallas (“es un problema de capa 2”). TCP/IP: Internet, navegación web (HTTP sobre TCP sobre IP sobre Ethernet o WiFi), correo (SMTP), videollamadas (UDP).</p>' } },
      ],
      quiz: [
        { q: '¿Cuántas capas tiene el modelo OSI?', o: ['4', '5', '7', '8'], a: 2, e: 'Física, enlace, red, transporte, sesión, presentación y aplicación.' },
        { q: 'En TCP/IP, las funciones de sesión y presentación quedan en la capa de…', o: ['transporte', 'internet', 'aplicación', 'acceso a la red'], a: 2, e: 'TCP/IP las combina en aplicación.' },
        { q: 'IP pertenece a la capa…', o: ['de enlace', 'de red (internet)', 'de transporte', 'física'], a: 1, e: 'Direccionamiento y ruteo.' },
        { q: 'TCP y UDP pertenecen a la capa…', o: ['de red', 'de transporte', 'de sesión', 'de aplicación'], a: 1, e: 'Capa 4.' },
        { q: '¿Qué tienen en común OSI y TCP/IP?', o: ['La cantidad de capas', 'Usan conmutación de paquetes', 'Los dos fueron definidos antes que sus protocolos', 'Ninguno se usa en la práctica'], a: 1, e: 'Los paquetes pueden tomar rutas distintas.' },
        { q: 'La capa física se ocupa de…', o: ['las direcciones IP', 'las características eléctricas, mecánicas y funcionales para mover bits', 'el control de flujo extremo a extremo', 'el formato de los datos'], a: 1, e: 'Convierte la trama en señales.' },
        { q: '¿Quién creó el modelo TCP/IP?', o: ['ISO', 'IEEE', 'el Departamento de Defensa de EE. UU.', 'la UIT-T'], a: 2, e: 'Para una red capaz de sobrevivir a cualquier circunstancia.' },
      ],
      open: [
        { t: 'text', q: 'Nombrá las siete capas del modelo OSI.', k: [['fisica'], ['enlace'], ['red'], ['transporte'], ['sesion'], ['presentacion'], ['aplicacion']], need: 7, e: '<p>1 Física, 2 Enlace de datos, 3 Red, 4 Transporte, 5 Sesión, 6 Presentación, 7 Aplicación.</p>' },
        { t: 'text', q: 'Nombrá las cuatro capas de TCP/IP y qué capas OSI agrupa cada una.', k: [['acceso a la red', 'acceso al medio', 'acceso de red', 'subred'], ['internet'], ['transporte'], ['aplicacion'], ['fisica'], ['sesion', 'presentacion']], need: 5, e: '<p>Acceso a la red (física + enlace), Internet (red), Transporte (transporte), Aplicación (sesión + presentación + aplicación).</p>' },
        { t: 'text', q: 'Dá dos diferencias entre el modelo OSI y el modelo TCP/IP.', k: [['7', 'siete'], ['4', 'cuatro'], ['teorico', 'referencia', 'guia'], ['practico', 'internet', 'implementa']], need: 3, e: '<p>OSI tiene 7 capas y TCP/IP 4. OSI es un modelo teórico de referencia, definido antes de los protocolos (las redes no se construyen sobre él, se usa como guía); TCP/IP es práctico y es el que usa Internet. OSI separa claramente servicios, interfaces y protocolos.</p>' },
      ],
      sources: [{ title: 'Tanenbaum, cap. 1: modelos de referencia', ref: 'Tanenbaum y Wetherall, 5ª ed.', points: ['Crítica al modelo OSI: mal momento, mala tecnología, malas implementaciones.', 'TCP/IP no distingue claramente servicio, interfaz y protocolo.'] }],
    },
    {
      id: 'medios-guiados',
      module: 'u1',
      title: 'Medios guiados: par trenzado, coaxial y fibra óptica',
      keywords: 'medio guiado cobre par trenzado UTP STP FTP categoría 5e 6 6A coaxial 50 ohm 75 ohm RG-58 RG-59 fibra óptica monomodo multimodo índice escalonado gradual núcleo revestimiento LED láser atenuación ventana diafonía',
      tldr: 'Los medios guiados confinan la señal: <strong>par trenzado</strong> (el más barato y usado; el trenzado reduce la diafonía), <strong>coaxial</strong> (más inmune, mayor ancho de banda) y <strong>fibra óptica</strong> (luz por reflexión total: muchísimo ancho de banda, poca atenuación e inmune a EMI). La fibra <mark>monomodo</mark> llega más lejos y más rápido que la <mark>multimodo</mark>.',
      goals: ['Comparar UTP, STP y FTP y las categorías de par trenzado.', 'Explicar las características de transmisión del coaxial.', 'Distinguir fibra monomodo, multimodo de índice escalonado y gradual; LED y láser.', 'Comparar fibra con cobre y resolver el ejercicio 5 del TP 1.'],
      body: `
        <h2>Clasificación de los medios</h2>
        <p>El medio de transmisión es el soporte físico que une a los equipos. El tipo de señal depende del medio: <strong>pulsos eléctricos</strong> en el cobre, <strong>pulsos de luz</strong> en la fibra y <strong>ondas electromagnéticas</strong> en los inalámbricos.</p>
        ${table(['Guiados', 'No guiados'], [['Cables de cobre (par trenzado, coaxial) y fibra óptica: la señal viaja confinada', 'Radio, microondas, infrarrojo, satélite: la señal se propaga libremente por aire o vacío']])}
        <h2>Par trenzado</h2>
        <p>Dos conductores de cobre aislados y trenzados en espiral; cada par es un enlace y se agrupan muchos pares en una envoltura. <strong>El trenzado reduce la interferencia electromagnética (diafonía) entre pares vecinos.</strong> Es el medio guiado más barato y más usado: telefonía (bucle de abonado hasta la central), cableado de edificios y LAN.</p>
        ${table(['Tipo', 'Blindaje', 'Características'], [
          ['<strong>UTP</strong> (Unshielded)', 'Sin blindaje', 'El más barato y fácil de instalar; sensible a EMI externa y a pares cercanos. Máx. 100 m.'],
          ['<strong>STP</strong> (Shielded)', 'Malla de cobre', 'Menos interferencias; más caro y difícil de manipular. Máx. 100 m.'],
          ['<strong>FTP / ScTP</strong> (Foil / Screened)', 'Lámina (foil) que envuelve todos los pares', 'Intermedio: buena protección con costo moderado. Máx. 100 m.'],
        ])}
        ${table(['Categoría', 'Ancho de banda', 'Velocidad', 'Aplicación'], [
          ['Cat 3', '16 MHz', '16 Mbps', 'Telefonía, 10BASE-T'], ['Cat 5', '100 MHz', '100 Mbps', 'Fast Ethernet 100BASE-TX'], ['Cat 5e', '100 MHz', '1 Gbps', 'Gigabit Ethernet 1000BASE-T'],
          ['Cat 6', '200–250 MHz', '1 Gbps (10 Gbps a corta distancia)', 'Gigabit, banda ancha'], ['Cat 6A', '500 MHz', '10 Gbps', '10GBASE-T'], ['Cat 7', '600 MHz', '10 Gbps', 'Video de alta calidad'],
        ])}
        <h2>Coaxial</h2>
        <p>Un conductor central rodeado por un aislante dieléctrico y un conductor exterior cilíndrico (malla), con funda protectora; diámetro de 1 a 2,5 cm. Es <strong>mucho menos susceptible a interferencias y diafonía</strong> que el par trenzado, cubre más distancia y admite más estaciones en una línea compartida.</p>
        <ul><li>Transmite señales analógicas y digitales, con mejor respuesta en frecuencia que el par trenzado (analógica hasta ~400 MHz).</li>
        <li>Sus limitaciones: atenuación, ruido térmico y ruido de intermodulación. En analógica necesita amplificadores cada pocos km (más cerca cuanto mayor la frecuencia); en digital, repetidores cada ~1 km.</li>
        <li><strong>50 Ω (RG-58)</strong>: banda base, transmisión digital. <strong>75 Ω (RG-59)</strong>: banda ancha, transmisión analógica (TV por cable).</li></ul>
        <h2>Fibra óptica</h2>
        ${fig(`<svg class="dg" viewBox="0 0 600 170" role="img" aria-label="Fibra óptica: núcleo, revestimiento y cubierta, con un rayo que avanza por reflexión total">
          <rect x="20" y="30" width="560" height="110" rx="20" class="b"/><rect x="20" y="52" width="560" height="66" class="b w"/><rect x="20" y="70" width="560" height="30" class="b acc"/>
          <text x="560" y="42" class="ts" text-anchor="end">cubierta</text><text x="560" y="62" class="ts" text-anchor="end">revestimiento (n₂ menor)</text><text x="560" y="86" class="ts" text-anchor="end">núcleo (n₁)</text>
          <path id="ray" d="M30 85 L110 72 L190 98 L270 72 L350 98 L430 72 L510 98" class="ln acc" style="stroke-width:2.4"/>
          <circle r="5" class="dot mv" style="offset-path: path('M30 85 L110 72 L190 98 L270 72 L350 98 L430 72 L510 98'); --dur: 3s"/>
          <text x="300" y="160" class="ts">la luz rebota en el límite núcleo-revestimiento (reflexión total interna)</text>
        </svg>`, 'Tres secciones concéntricas. El núcleo tiene mayor índice de refracción que el revestimiento: por eso la luz queda atrapada.')}
        <p>Medio flexible y muy fino (2 a 130 µm) que conduce luz, basado en la <strong>reflexión y refracción</strong>. Componentes del enlace: <strong>fuente de luz</strong> (diodo LED o láser), la fibra y el <strong>detector</strong> (fotodiodo). Las menores pérdidas se logran con sílice fundida ultrapura.</p>
        ${table(['', 'Monomodo', 'Multimodo'], [
          ['Núcleo', '8,3 a 10 µm (del orden de la longitud de onda)', '50 o 62,5 µm'],
          ['Propagación', 'Prácticamente en línea recta: un solo modo', 'Múltiples caminos: los rayos llegan en distintos tiempos (dispersión modal)'],
          ['Prestaciones', 'Menos pérdidas, > 10 Gbps, hasta ~400 km con láser', 'Más pérdidas, distancias menores a ~2 km'],
          ['Costo y manejo', 'Más cara y difícil de manipular', 'Más económica y fácil de conectar; tolera componentes menos precisos'],
          ['Fuente típica', 'Láser (ILD)', 'LED'],
        ])}
        <p>La multimodo puede ser de <strong>índice escalonado</strong> (índice constante en el núcleo: los rayos rebotan en zigzag) o de <strong>índice gradual</strong> (el índice disminuye hacia afuera y curva los rayos, que llegan más juntos: menos dispersión).</p>
        ${table(['Característica', 'LED', 'Láser (ILD)'], [['Velocidad máxima', 'Baja (~622 Mb/s)', 'Alta (10 Gb/s)'], ['Fibra', 'Multimodo', 'Monomodo y multimodo'], ['Distancia', 'Hasta ~2 km', 'Hasta ~160 km'], ['Vida media', 'Larga', 'Corta'], ['Sensibilidad a la temperatura', 'Pequeña', 'Elevada'], ['Costo', 'Bajo', 'Alto']])}
        ${table(['Fibra', '1ª ventana 850 nm', '2ª ventana 1310 nm', '3ª ventana 1550 nm'], [['Monomodo 8,1 µm', '—', '0,5 dB/km', '0,25 dB/km'], ['Multimodo 50 µm', '2,4 dB/km', '0,6 dB/km', '0,5 dB/km'], ['Multimodo 62,5 µm', '3,0 dB/km', '0,7 dB/km', '0,3 dB/km']])}
        <h2>Fibra frente a cobre</h2>
        ${table(['', 'Cobre', 'Fibra'], [
          ['Ancho de banda', '10 Mbps a 10 Gbps', '10 Mbps a 100 Gbps (y mucho más con WDM)'], ['Distancia', '1 a 100 m (repetidores cada ~5 km en enlaces largos)', '1 a 100 000 m (repetidores cada ~30 km)'],
          ['Inmunidad a EMI/RFI y peligros eléctricos', 'Baja', 'Total'], ['Peso', '1000 pares de 1 km: 8000 kg', '2 fibras con más capacidad: 100 kg'], ['Costo de medios, conectores e instalación', 'Más bajo', 'Más alto'],
          ['Seguridad', 'Fácil de intervenir', 'No tiene fugas de luz, difícil de intervenir'],
        ])}
        ${note('Problemas de la fibra: más cara para la misma distancia (aunque con más capacidad), requiere otras habilidades y equipos para empalmar, manejo más cuidadoso, interfaces más caras y es <strong>unidireccional</strong>: para comunicar en ambos sentidos hacen falta 2 fibras o 2 longitudes de onda en una.', 'warn')}`,
      labs: [
        { type: 'classify', title: 'Medio y característica', buckets: ['Par trenzado', 'Coaxial', 'Fibra monomodo', 'Fibra multimodo'], items: [
          { t: 'El trenzado reduce la diafonía', b: 0 }, { t: '75 Ω para TV por cable', b: 1 }, { t: 'Núcleo de ~9 µm, láser, cientos de km', b: 2 }, { t: 'Núcleo de 62,5 µm, LED, menos de 2 km', b: 3 },
          { t: 'Máximo 100 m en una LAN Ethernet', b: 0 }, { t: 'Índice gradual para reducir la dispersión', b: 3 }, { t: 'Conductor central, dieléctrico y malla', b: 1 }, { t: 'Enlaces submarinos de larga distancia', b: 2 },
        ] },
      ],
      exercises: [
        { title: 'Dos cables de par trenzado de CommScope', official: '1.5', level: 2, prompt: '<p>Comparar los dos cables de las hojas de datos del TP (SYSTIMAX PowerSUM 1061B y NETCONNECT CS44Z1) en normas, estándares, especificaciones técnicas y de construcción, e indicar los casos de uso.</p>',
          solution: { explain: `${table(['', '1061B (107091936)', 'CS44Z1 (1859218-1)'], [
            ['Categoría ANSI/TIA', '5e', '6A'], ['Tipo', 'U/UTP (sin blindaje)', 'F/UTP (blindaje de lámina aluminio/poliéster)'],
            ['Normas de transmisión', 'ANSI/TIA-568.2-D, EN 50288-3-1, ISO/IEC 11801 Clase D', 'ANSI/TIA-568.2-D, EN 50288-6-1, ISO/IEC 11801 Clase EA'],
            ['Frecuencia máxima', '200 MHz', '500 MHz (Cat 6A)'], ['Conductores', '4 pares, 8 conductores sólidos, 24 AWG, cobre desnudo', '4 pares, 8 conductores sólidos, 23 AWG (más gruesos)'],
            ['Resistencia DC máx.', '9,38 Ω/100 m', '7,8 Ω/100 m'], ['Velocidad de propagación (NVP)', '69 %', '69 %'], ['Impedancia', '100 Ω (estándar)', '100 Ω ± 15 Ω; delay skew máx. 45 ns'],
            ['Diámetro', '5,2 mm', '7,2 mm'], ['Vaina', 'PVC, CMR (no plenum, para montantes)', 'LSZH (bajo humo y cero halógenos)'], ['Peso', '29,2 kg/km', '60,1 kg/km'],
            ['Temperatura de operación', '−20 a +60 °C', '−20 a +75 °C'], ['PoE', 'Cumple IEEE 802.3bt Tipo 4', 'Cumple IEEE 802.3bt Tipo 4'], ['Presentación', 'Caja de 305 m', 'Carrete de 305 m'],
          ])}<p><b>Casos de uso.</b> 1061B Cat 5e UTP: cableado horizontal de oficinas y hogares con Gigabit Ethernet (1000BASE-T) y PoE, donde no hay mucha interferencia; más barato y fácil de instalar. CS44Z1 Cat 6A F/UTP: 10GBASE-T hasta 100 m, data centers, entornos con EMI (industria, cerca de motores o cables de potencia) y lugares donde se exige LSZH por seguridad ante incendios (túneles, hospitales, espacios públicos).</p>` } },
      ],
      quiz: [
        { q: 'El propósito del trenzado de los pares es…', o: ['aumentar la resistencia', 'reducir la diafonía entre pares', 'aumentar la velocidad de la luz', 'abaratar el cable'], a: 1, e: 'Las interferencias inducidas se cancelan.' },
        { q: 'Longitud máxima de un segmento UTP en Ethernet:', o: ['10 m', '100 m', '500 m', '2 km'], a: 1, e: '100 m para 10BASE-T, 100BASE-TX y 1000BASE-T.' },
        { q: 'El coaxial de 75 Ω (RG-59) se usa para…', o: ['banda base digital', 'banda ancha analógica (TV por cable)', 'fibra óptica', 'telefonía de abonado'], a: 1, e: 'El de 50 Ω (RG-58) es el de banda base digital.' },
        { q: 'La fibra monomodo, frente a la multimodo…', o: ['tiene el núcleo más grande', 'llega más lejos y a más velocidad', 'usa LED', 'es más barata'], a: 1, e: 'Núcleo de ~9 µm, láser, menos dispersión.' },
        { q: 'En la fibra de índice gradual…', o: ['el índice es constante en el núcleo', 'el índice disminuye hacia afuera y curva los rayos', 'no hay revestimiento', 'la luz viaja en línea recta'], a: 1, e: 'Los rayos llegan más juntos: menos dispersión modal.' },
        { q: 'Una desventaja de la fibra es…', o: ['la sensibilidad a EMI', 'que es unidireccional: hacen falta 2 fibras para full dúplex', 'su gran peso', 'la corrosión'], a: 1, e: 'O dos longitudes de onda en la misma fibra.' },
        { q: 'La fibra está basada en…', o: ['la inducción electromagnética', 'la reflexión total interna', 'la difracción', 'el efecto Joule'], a: 1, e: 'El núcleo tiene mayor índice de refracción que el revestimiento.' },
      ],
      open: [
        { t: 'text', q: '¿Por qué se trenzan los pares de cobre?', k: [['interferencia', 'diafonia', 'crosstalk', 'emi'], ['par', 'adyacente', 'vecino', 'cancel']], e: '<p>Para reducir la interferencia electromagnética (diafonía) entre pares adyacentes dentro de la misma envoltura: los ruidos inducidos se cancelan en cada vuelta.</p>' },
        { t: 'text', q: 'Compará fibra monomodo y multimodo en núcleo, distancia y costo.', k: [['monomodo'], ['multimodo'], ['nucleo', 'diametro', 'micr'], ['distancia', 'km', 'lejos'], ['cara', 'costo', 'economica', 'barata']], need: 4, e: '<p>Monomodo: núcleo de 8 a 10 µm, la luz va casi en línea recta, menos pérdidas, grandes distancias (cientos de km con láser) y > 10 Gbps; más cara. Multimodo: núcleo de 50 o 62,5 µm, varios caminos (dispersión), menos de 2 km; más barata y fácil de conectar (LED).</p>' },
        { t: 'text', q: 'Nombrá tres ventajas de la fibra óptica frente al cobre.', k: [['ancho de banda', 'capacidad', 'velocidad'], ['atenuacion', 'distancia', 'repetidor'], ['inmune', 'emi', 'interferencia', 'electromagnet'], ['peso', 'liviana', 'tamano', 'delgada'], ['segur', 'intervenir', 'corrosi']], need: 3, e: '<p>Mayor ancho de banda; menor atenuación (repetidores cada ~30 km en vez de ~5 km); inmunidad total a la interferencia electromagnética y a los peligros eléctricos; menor tamaño y peso; no la afectan sustancias corrosivas; difícil de intervenir.</p>' },
      ],
    },
    {
      id: 'medios-no-guiados',
      module: 'u1',
      title: 'Medios no guiados: radio, microondas e infrarrojo',
      keywords: 'inalámbrico no guiado espectro electromagnético radio microondas infrarrojo satélite antena direccional omnidireccional sectorial línea de vista IEEE 802.11 wifi 802.15 bluetooth 802.16 wimax CSMA/CA',
      tldr: 'Los medios no guiados no confinan la señal: se propaga por el aire o el vacío y se transmite y recibe con <strong>antenas</strong>. Por frecuencia: <strong>radio</strong> (30 MHz–1 GHz, omnidireccional), <strong>microondas</strong> (2–40 GHz, haces direccionales, punto a punto y satélite) e <strong>infrarrojo</strong> (alcance de una habitación). Una antena <mark>direccional</mark> llega más lejos en un sector; una <mark>omnidireccional</mark> cubre 360° con menos alcance.',
      goals: ['Ubicar radio, microondas e infrarrojo en el espectro y dar usos de cada uno.', 'Comparar antenas direccionales, sectoriales y omnidireccionales.', 'Conocer las variantes de IEEE 802.11 y los estándares 802.15 y 802.16.'],
      body: `
        <h2>Bandas de los medios no guiados</h2>
        ${fig(`<svg class="dg" viewBox="0 0 620 120" role="img" aria-label="Espectro: radio, microondas, infrarrojo y luz visible">
          ${[['Radio', '30 MHz – 1 GHz', 20, 150, 'acc'], ['Microondas', '2 – 40 GHz', 175, 150, 'ok'], ['Infrarrojo', '3·10¹¹ – 2·10¹⁴ Hz', 330, 150, 'w'], ['Luz (fibra)', '~2·10¹⁴ Hz (850–1550 nm)', 485, 120, 'n']].map(([t, s, x, w, c]) => `<rect x="${x}" y="22" width="${w}" height="50" rx="6" class="b ${c}"/><text x="${x + w / 2}" y="42" class="t">${t}</text><text x="${x + w / 2}" y="60" class="ts">${s}</text>`).join('')}
          <line x1="20" y1="90" x2="600" y2="90" class="ln"/><path d="M604 90l-8-4v8z" class="ah"/><text x="310" y="110" class="ts">frecuencia creciente → longitud de onda menor, haz más direccional</text>
        </svg>`, 'Rangos de la guía de la cátedra. A mayor frecuencia, más direccional el haz y mayor la pérdida en el espacio libre (Unidad 3).')}
        ${table(['Medio', 'Rango', 'Propagación', 'Usos'], [
          ['<strong>Ondas de radio</strong>', '30 MHz a 1 GHz', 'Omnidireccional; atraviesa paredes', 'Radio AM y FM, radio marítima, TV, teléfonos inalámbricos'],
          ['<strong>Microondas</strong>', '2 a 40 GHz', 'Haces muy direccionales: punto a punto con línea de vista', 'Telefonía móvil, enlaces satelitales, LAN inalámbricas (WiFi 2,4 y 5 GHz)'],
          ['<strong>Infrarrojo</strong>', '3·10¹¹ a 2·10¹⁴ Hz', 'No atraviesa paredes', 'Enlaces locales punto a punto o multipunto en un área chica (una habitación): controles remotos, IrDA'],
          ['<strong>Satélite</strong>', 'Microondas', 'Estación terrena → satélite (repetidor) → estación terrena', 'TV, Internet en zonas remotas, LEO (constelaciones de órbita baja)'],
        ])}
        <h2>Antenas</h2>
        <p>En la transmisión la antena <strong>irradia</strong> energía electromagnética al medio; en la recepción <strong>capta</strong> las ondas que la rodean.</p>
        ${table(['Configuración', 'Cómo emite', 'Consecuencia'], [
          ['<strong>Direccional</strong>', 'Concentra la energía en un haz', 'Mayor alcance; las antenas deben estar alineadas (línea de vista). Fuera del haz no se escucha nada.'],
          ['<strong>Sectorial</strong>', 'Cubre un ángulo (60°, 90°, 120°)', 'Compromiso entre alcance y cobertura (estaciones base, puntos de acceso de exterior)'],
          ['<strong>Omnidireccional</strong>', 'En los 360° (diagrama disperso)', 'La pueden recibir varias antenas desde cualquier punto; menor alcance que una direccional'],
        ])}
        ${note('La “ganancia” de una antena no agrega potencia: la <strong>concentra</strong> en una dirección. Se mide en <strong>dBi</strong> (respecto de una antena isotrópica ideal) y se usa en el presupuesto de enlace del TP 3.', 'tip')}
        <h2>Estándares IEEE 802 inalámbricos</h2>
        ${table(['Estándar', 'Velocidad', 'Banda'], [['802.11a', '54 Mbps', '5 GHz'], ['802.11b', '11 Mbps', '2,4 GHz'], ['802.11g', '54 Mbps', '2,4 GHz'], ['802.11n (WiFi 4)', '600 Mbps', '2,4 y 5 GHz'], ['802.11ac (WiFi 5)', '~1 Gbps', '5 GHz'], ['802.11ad', '7 Gbps', '60 GHz']])}
        <ul><li><strong>802.11 (WiFi)</strong>: LAN inalámbrica; el acceso al medio es <strong>CSMA/CA</strong> (escuchar el canal y evitar colisiones, porque en radio no se pueden detectar).</li>
        <li><strong>802.15 (Bluetooth / WPAN)</strong>: hasta ~3 Mbps, emparejamiento a 1–100 m.</li>
        <li><strong>802.16 (WiMAX)</strong>: hasta ~1 Gbps, punto a multipunto para acceso de banda ancha inalámbrica.</li></ul>
        ${lab(0)}`,
      labs: [
        { type: 'classify', title: '¿Radio, microondas o infrarrojo?', buckets: ['Radio', 'Microondas', 'Infrarrojo'], items: [
          { t: 'Radio FM a 100 MHz', b: 0 }, { t: 'Enlace punto a punto entre dos edificios con antenas parabólicas', b: 1 }, { t: 'Control remoto del televisor', b: 2 },
          { t: 'WiFi a 5 GHz', b: 1 }, { t: 'TV abierta en VHF', b: 0 }, { t: 'Enlace satelital', b: 1 }, { t: 'Comunicación que no atraviesa las paredes de una habitación', b: 2 },
        ] },
      ],
      quiz: [
        { q: 'El rango de las microondas según la cátedra es…', o: ['30 MHz a 1 GHz', '2 a 40 GHz', '3·10¹¹ a 2·10¹⁴ Hz', '300 a 3000 Hz'], a: 1, e: 'Haces muy direccionales, punto a punto.' },
        { q: 'Una antena omnidireccional, frente a una direccional…', o: ['tiene más alcance', 'cubre 360° con menos alcance', 'necesita línea de vista', 'no irradia'], a: 1, e: 'La direccional concentra la energía y llega más lejos.' },
        { q: '¿Qué técnica de acceso al medio usa WiFi?', o: ['CSMA/CD', 'CSMA/CA', 'Token passing', 'TDM'], a: 1, e: 'Evita colisiones porque en radio no se pueden detectar.' },
        { q: '802.11b trabaja a…', o: ['54 Mbps en 5 GHz', '11 Mbps en 2,4 GHz', '600 Mbps', '7 Gbps en 60 GHz'], a: 1, e: '802.11a: 54 Mbps en 5 GHz.' },
        { q: 'El infrarrojo es útil para…', o: ['enlaces de larga distancia', 'enlaces locales en un área muy limitada', 'televisión satelital', 'atravesar paredes'], a: 1, e: 'Una habitación.' },
        { q: 'Bluetooth corresponde al estándar…', o: ['802.3', '802.11', '802.15', '802.16'], a: 2, e: 'WPAN.' },
      ],
      open: [
        { t: 'text', q: 'Compará una antena direccional con una omnidireccional.', k: [['direccional'], ['omnidireccional', '360'], ['alcance', 'lejos', 'distancia'], ['haz', 'concentra', 'alineada', 'linea de vista', 'zona']], need: 3, e: '<p>La direccional concentra la energía en un haz hacia una zona: tiene mayor alcance, pero las antenas deben estar alineadas y fuera del haz no hay comunicación. La omnidireccional irradia en los 360°: se puede comunicar desde cualquier punto, con menor alcance.</p>' },
        { t: 'text', q: '¿Por qué los enlaces de microondas punto a punto necesitan línea de vista?', k: [['direccional', 'haz'], ['alineada', 'linea de vista', 'obstacul', 'vista']], e: '<p>Porque a esas frecuencias los haces son muy direccionales y la onda no rodea obstáculos: las antenas de emisión y recepción deben estar alineadas, “en la línea de mira”.</p>' },
      ],
    },
  );
})();
