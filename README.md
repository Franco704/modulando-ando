# Modulando Ando

Guía de estudio de **Comunicación de Datos 2026 (UTN-FRT, Ingeniería en Sistemas de Información)**, armada con las guías de la cátedra (Ing. Carrasco, Ing. Such), los apuntes de cada unidad y los trabajos prácticos 1 a 8. Separada por instancia de examen, cada una con su color:

- **Primer parcial** (azul): Unidad 1 Sistemas de comunicación, Unidad 2 Análisis de señales, Unidad 3 Atenuación, distorsión y ruido.
- **Segundo parcial** (violeta): Unidad 4 Teoría de la información, Unidad 5 Canales de comunicaciones, Unidad 6 Errores en la transmisión.
- **Tercer parcial** (verde azulado): Unidad 7 Técnicas de transmisión, Unidad 8 Modulación y multiplexación, Unidad 9 (pendiente).
- **Final** (ámbar): todas las unidades más la Unidad 10 (pendiente).

Contenido:

- 39 lecciones con la teoría de la cátedra, glifo animado por unidad y pantalla de entrada con el error típico del parcial.
- 40 laboratorios interactivos: senoidal y espectro, señal compuesta, sumas de Fourier, tren de pulsos (sinc), filtros, presupuesto de enlace WiFi, H(p), Huffman con árbol, muestreo y aliasing, Shannon, paridad VRC/LRC, CRC paso a paso, Hamming de la cátedra, ARQ, códigos de línea (NRZ a HDB3), modulaciones con constelación, QAM con ruido, PCM, FDM, TDM, topologías y AM/FM/PM.
- 231 preguntas de opción múltiple y 124 **preguntas abiertas corregidas al instante**: cálculos con tolerancia y unidades (“133 Mbps”, “−100,8 dBm”, “10^-4”), teóricas por conceptos clave (con respuesta modelo y la opción de marcarla como correcta) y cadenas de bits exactas (CRC, Hamming, paridad).
- 54 ejercicios resueltos, la mayoría de los TP 1 a 8. Los números de CRC, Hamming, Huffman y códigos de línea se calculan en la página con el mismo código que los laboratorios.
- Cuestionario por módulo, simulacro de cada parcial y del final (opción múltiple + abiertas), repaso de lo fallado, taller de gráficas y hoja de fórmulas.

Sitio en GitHub Pages: [franco704.github.io/modulando-ando](https://franco704.github.io/modulando-ando/)

No necesita instalación: es HTML, CSS y JavaScript. Abrí `index.html`. El progreso se guarda en el navegador.

Pruebas: `node tests/cx.test.js` (cálculos contra los ejemplos de la guía y los TP) y `node tests/content.test.js` (estructura del contenido; también verifica que cada pregunta abierta acepte su propia respuesta).

## Cargar la Unidad 9 y la Unidad 10

Los módulos `u9` (tercer parcial) y `u10` (final) ya existen en `js/content/_helpers.js` y se muestran como “pendientes”. Para cargarlos:

1. Cambiar en `MODULES` el `title`, `stop` y `blurb` de `u9` o `u10`.
2. Crear `js/content/09-<tema>.js` (o `10-…`) con el mismo formato que los demás (`LESSONS.push({ id, module: 'u9', … })`) y sumarlo a `index.html` antes de `formulas.js`.
3. Opcional: fórmulas en `js/content/formulas.js`, y la pantalla de entrada y el glifo del módulo en `js/anim.js` (`PIPES`, `TRAPS`, `GLYPHS`).

Apenas un módulo tiene lecciones deja de figurar como pendiente y entra en su simulacro y en el del final.

## Datos que faltan de los TP

Algunos ejercicios dependen de imágenes que no vienen en el texto de los TP (TP 2 ej. 2 a 6, TP 3 ej. 1, TP 4 ej. 4, TP 6 ej. 1 y TP 7 ej. 5b). Se resuelven con el método completo y un caso equivalente o de ejemplo, indicado como tal.

## También probá

- [Backeando Ando](https://franco704.github.io/backeando-ando/) ([repositorio](https://github.com/Franco704/backeando-ando))
- [Fronteando Ando](https://franco704.github.io/fronteando-ando/) ([repositorio](https://github.com/Franco704/fronteando-ando))
- [Diseñando Ando](https://franco704.github.io/disenando-ando/) ([repositorio](https://github.com/Franco704/disenando-ando))
- [Iterando Ando](https://franco704.github.io/iterando-ando/) ([repositorio](https://github.com/Franco704/iterando-ando))
- [Economizar](https://franco704.github.io/economizar/) ([repositorio](https://github.com/Franco704/economizar))
- [Probando Ando](https://franco704.github.io/probando-ando/) ([repositorio](https://github.com/Franco704/probando-ando))

## Agradecimientos

A **Mateo Rusconi**, autor original de las animaciones que esta guía hereda de Backeando Ando: la pantalla de entrada a cada tema, los glifos animados de las lecciones y los microefectos de los cuestionarios vienen de su "Laboratorio Frontend DSW".
