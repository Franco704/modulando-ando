/* Unidad 10 (final): redes inalámbricas. Fuente: NUEVO/Comunicaciones - Unidad 10.pdf (apunte de alumno sobre las diapositivas)
   y lo que los parciales toman de WiFi (WLAN, no WPAN; límites de potencia en las bandas de uso compartido). */
(() => {
  const { LESSONS, h } = window.GUIDE;
  const { note, def, table, lab } = h;

  LESSONS.push({
    id: 'redes-inalambricas',
    module: 'u10',
    video: false,
    title: 'Redes inalámbricas: WPAN, WLAN, WMAN y WWAN',
    keywords: 'redes inalámbricas wireless WPAN WLAN WMAN WWAN IEEE 802.15 802.11 802.16 WiFi Bluetooth NFC LTE 5G infrarrojo RFID punto de acceso AP router antena FHSS DSSS OFDM MIMO 2,4 GHz 5 GHz ISM',
    tldr: 'Una red inalámbrica conecta dispositivos con <strong>ondas electromagnéticas</strong> (radio y microondas) en lugar de cables. Se clasifican por alcance: <strong>WPAN</strong> (802.15, Bluetooth), <strong>WLAN</strong> (802.11, WiFi), <strong>WMAN</strong> (802.16) y <strong>WWAN</strong> (telefonía móvil: LTE, 5G).',
    goals: ['Clasificar una red inalámbrica por su alcance y su norma IEEE.', 'Describir los componentes de una red WiFi.', 'Comparar redes inalámbricas y cableadas.', 'Explicar para qué sirven el espectro ensanchado y MIMO.'],
    body: `
      ${def('Red inalámbrica', 'Sistema de comunicación que permite la transmisión de datos y la conexión entre dispositivos sin cables físicos: usa ondas electromagnéticas, como las de radio y microondas, para llevar la información de un punto a otro.', 'Unidad 10')}
      <p>Se usan para la conexión a Internet, la comunicación móvil, IoT (Internet de las cosas), la comunicación en tiempo real y el streaming.</p>

      <h2>Tipos de red y sus normas</h2>
      ${table(['Red', 'Alcance', 'Norma', 'Ejemplos'], [
        ['<strong>WPAN</strong>: Wireless Personal Area Network', 'Unos metros, alrededor de una persona', 'IEEE 802.15', 'Bluetooth, ZigBee, NFC, infrarrojo'],
        ['<strong>WLAN</strong>: Wireless Local Area Network', 'Una casa, un edificio, un campus', 'IEEE 802.11', 'WiFi'],
        ['<strong>WMAN</strong>: Wireless Metropolitan Area Network', 'Una ciudad', 'IEEE 802.16', 'WiMAX'],
        ['<strong>WWAN</strong>: Wireless Wide Area Network', 'Un país, el mundo', 'Telefonía móvil (3GPP)', 'LTE (4G), 5G'],
      ])}
      ${note('WiFi es una <strong>WLAN</strong> (IEEE 802.11), no una WPAN: las de área personal son las de muy corto alcance, como Bluetooth (802.15). Lo toman como V o F en el tercer parcial.', 'exam')}
      ${lab(0)}

      <h2>Tecnologías comunes</h2>
      ${table(['Tecnología', 'Qué es', 'Uso típico'], [
        ['WiFi', 'Red inalámbrica por radiofrecuencia que conecta dispositivos a Internet y a redes locales', 'Casas, oficinas, lugares públicos'],
        ['Bluetooth', 'Enlace de corto alcance entre dispositivos', 'Auriculares, parlantes, teclados, periféricos'],
        ['NFC', 'Transferencia de datos cuando los dispositivos están muy próximos (centímetros)', 'Pagos móviles, control de acceso, etiquetas'],
        ['LTE', 'Comunicación móvil de alta velocidad (4G)', 'Datos en teléfonos y dispositivos móviles'],
        ['5G', 'Siguiente generación móvil: más velocidad, baja latencia y más dispositivos conectados', 'Telefonía, IoT, aplicaciones en tiempo real'],
        ['Infrarrojo (IR)', 'Luz infrarroja con línea de vista', 'Controles remotos'],
        ['RFID', 'Identificación por ondas de radio', 'Inventarios, control de acceso, seguimiento de productos'],
      ])}

      <h2>Inalámbricas contra cableadas</h2>
      ${table(['', 'Inalámbricas', 'Cableadas'], [
        ['Movilidad', 'Sí: el usuario se mueve dentro de la cobertura', 'No: el equipo queda atado al punto de red'],
        ['Instalación', 'Rápida y barata, sin tender cables; fácil de ampliar', 'Hay que cablear; ampliar cuesta más'],
        ['Velocidad y estabilidad', 'Menor y variable: depende de la distancia, los obstáculos y la cantidad de usuarios', 'Mayor y estable'],
        ['Interferencias', 'Comparte el espectro con otras redes y equipos', 'Muy inmunes (sobre todo la fibra)'],
        ['Seguridad', 'La señal sale al aire: necesita cifrado (WPA2/WPA3)', 'Hay que acceder físicamente al cable'],
      ])}

      <h2>WLAN: WiFi</h2>
      <p>WiFi (Wireless Fidelity) da acceso móvil de banda ancha a Internet a muy bajo costo. Todo se rige por el estándar <strong>IEEE 802.11</strong> y sus variantes, y hoy usa las bandas de <strong>2,4 GHz y 5 GHz</strong>, clasificadas como de <strong>uso compartido</strong> (ISM): no requieren licencia, pero hay límites para la potencia que se puede radiar y los protocolos que se pueden usar, para garantizar el uso común de esas frecuencias.</p>
      <h3>Componentes</h3>
      <ul>
        <li><strong>Punto de acceso (AP)</strong>: une la red cableada con la red WiFi; es el puente que deja a los dispositivos inalámbricos acceder a la red y compartir recursos.</li>
        <li><strong>Antenas</strong>: una o más, conectadas al punto de acceso.</li>
        <li><strong>Terminal WiFi</strong>: el dispositivo del usuario.</li>
        <li><strong>Router</strong>: dirige el tráfico entre la LAN y la red externa, asigna direcciones IP y aporta seguridad (firewall).</li>
      </ul>
      <h3>Cómo comparten el aire: espectro ensanchado, OFDM y MIMO</h3>
      <p>Las primeras WiFi usaban <strong>FHSS</strong> (Frequency Hopping Spread Spectrum, 2 Mbps): el transmisor salta de una frecuencia a otra siguiendo una secuencia que conoce el receptor, y así esquiva interferencias. Después vinieron DSSS y, sobre todo, <strong>OFDM</strong>: muchas subportadoras <strong>ortogonales</strong> (el producto entre dos de ellas promedia cero, así que se pueden solapar sin interferirse), la misma idea que DMT en ADSL. <strong>MIMO</strong> agrega varias antenas en cada extremo para mandar varios flujos a la vez: más antenas, más velocidad y mejor cobertura.</p>
      ${note('El presupuesto de enlace de un WiFi (potencia, ganancias de antena, pérdidas en el espacio libre y sensibilidad) está en la Unidad 3: <a href="#/dbm-enlace">dBm y enlaces</a>.', 'tip')}
    `,
    labs: [{ type: 'classify', title: '¿Qué tipo de red es?', intro: 'Ubicá cada tecnología según su alcance.', buckets: ['WPAN', 'WLAN', 'WMAN', 'WWAN'], items: [
      { t: 'Bluetooth entre el celular y los auriculares', b: 0, why: 'IEEE 802.15, unos metros.' },
      { t: 'WiFi de la facultad', b: 1, why: 'IEEE 802.11.' },
      { t: 'NFC para pagar con el celular', b: 0, why: 'Centímetros de alcance.' },
      { t: 'WiMAX que cubre una ciudad', b: 2, why: 'IEEE 802.16.' },
      { t: 'Datos móviles 4G (LTE)', b: 3, why: 'Red celular de área amplia.' },
      { t: '5G', b: 3, why: 'Red celular de área amplia.' },
      { t: 'Punto de acceso de una oficina', b: 1, why: 'Es el corazón de una WLAN.' },
    ] }],
    quiz: [
      { q: 'V o F: La tecnología WiFi pertenece a las Wireless Personal Area Networks.', o: ['Verdadero', 'Falso'], a: 1, e: 'WiFi es una WLAN (IEEE 802.11). Las WPAN son Bluetooth o ZigBee (802.15).' },
      { q: '¿Qué norma rige las WLAN?', o: ['IEEE 802.3', 'IEEE 802.11', 'IEEE 802.15', 'IEEE 802.16'], a: 1, e: '802.3 es Ethernet cableada; 802.15 las WPAN y 802.16 las WMAN.' },
      { q: '¿Qué bandas usa hoy WiFi?', o: ['900 MHz y 1,8 GHz', '2,4 GHz y 5 GHz', '26 kHz a 1,1 MHz', '1310 y 1550 nm'], a: 1, e: 'Bandas de uso compartido (ISM).' },
      { q: '¿Qué componente une la red cableada con la red WiFi?', o: ['El router', 'El punto de acceso', 'El splitter', 'El DSLAM'], a: 1, e: 'El AP es el puente entre los dispositivos inalámbricos y la red cableada.' },
      { q: 'V o F: En WiFi hay límites sobre la potencia que se puede radiar y los protocolos que se pueden usar, para garantizar el uso común de esas frecuencias.', o: ['Verdadero', 'Falso'], a: 0, e: 'Son bandas de uso libre, pero reguladas.' },
      { q: '¿Qué agrega MIMO?', o: ['Más canales de voz en el par de cobre', 'Varias antenas en cada extremo para mandar varios flujos a la vez', 'Saltos de frecuencia', 'Cifrado'], a: 1, e: 'Multiple Input, Multiple Output.' },
      { q: '¿Qué tecnología se usa para pagos móviles a pocos centímetros?', o: ['RFID de largo alcance', 'NFC', 'LTE', 'Infrarrojo'], a: 1, e: 'Near Field Communication.' },
    ],
    open: [
      { t: 'text', q: 'Nombrá dos ventajas y dos desventajas de una red inalámbrica frente a una cableada.', k: [['movilidad', 'moverse', 'sin cables'], ['instalacion', 'barata', 'facil', 'ampliar'], ['interferencia', 'velocidad', 'estabilidad', 'menor'], ['seguridad', 'cifrado', 'aire']], e: '<p>Ventajas: movilidad e instalación rápida y barata, fácil de ampliar. Desventajas: menor velocidad y estabilidad, interferencias por compartir el espectro y seguridad (la señal sale al aire y necesita cifrado).</p>' },
    ],
  });
})();
