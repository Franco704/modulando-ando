# Modulando Ando

Guía de estudio de **Comunicación de Datos 2026 (UTN-FRT, Ingeniería en Sistemas de Información)**, armada con las guías de la cátedra (Ing. Carrasco, Ing. Such), los apuntes de cada unidad, los trabajos prácticos 1 a 9, los cuestionarios del campus y los parciales y finales de años anteriores. Separada por instancia de examen, cada una con su color:

- **Primer parcial** (azul): Unidad 1 Sistemas de comunicación, Unidad 2 Análisis de señales, Unidad 3 Atenuación, distorsión y ruido.
- **Segundo parcial** (violeta): Unidad 4 Teoría de la información, Unidad 5 Canales de comunicaciones, Unidad 6 Errores en la transmisión.
- **Tercer parcial** (verde azulado): Unidad 7 Técnicas de transmisión, Unidad 8 Modulación y multiplexación, Unidad 9 Redes de acceso (módem, xDSL y fibra).
- **Final** (ámbar): todas las unidades más la Unidad 10 (pendiente).

Contenido:

- **Parciales y finales resueltos** (`#/parciales`): 17 exámenes reales (parciales 2023 a 2025 en sus distintos temas y seis finales de 2019), 73 ítems resueltos con su teoría, ranking de lo que más se repite y qué unidades pesan más. Cada afirmación de verdadero o falso queda además como pregunta en su lección, marcada “tomada en parcial”.
- **Teoría a fondo** para lo que toman los parciales y no estaba en las guías: qué espectro sale de cada señal (serie, transformada, sinc, 1/T y 1/p), teorema de codificación de fuente, códigos prefijo e información mutua, y detección contra corrección (distancia mínima, FEC, ARQ, repetición).
- **Unidad 9** cargada desde el TP 9 y su cuestionario: POTS y PSTN, módem DTE/DCE, ADSL, DMT, DSLAM, VDSL2, FTTx y redes ópticas pasivas (GPON).
- Preguntas de los cuestionarios del campus de las unidades 1 a 8.
- 44 lecciones con la teoría de la cátedra, glifo animado por unidad y pantalla de entrada con el error típico del parcial.
- 40 laboratorios interactivos: senoidal y espectro, señal compuesta, sumas de Fourier, tren de pulsos (sinc), filtros, presupuesto de enlace WiFi, H(p), Huffman con árbol, muestreo y aliasing, Shannon, paridad VRC/LRC, CRC paso a paso, Hamming de la cátedra, ARQ, códigos de línea (NRZ a HDB3), modulaciones con constelación, QAM con ruido, PCM, FDM, TDM, topologías y AM/FM/PM.
- 517 preguntas de opción múltiple y 137 **preguntas abiertas corregidas al instante**: cálculos con tolerancia y unidades (“133 Mbps”, “−100,8 dBm”, “10^-4”), teóricas por conceptos clave (con respuesta modelo y la opción de marcarla como correcta) y cadenas de bits exactas (CRC, Hamming, paridad).
- 119 ejercicios resueltos: los de los TP 1 a 9 y los de los parciales. Los números de CRC, Hamming, Huffman, ruido, enlaces, TDM y códigos de línea se calculan en la página con el mismo código que los laboratorios.
- Cuestionario por módulo, simulacro de cada parcial y del final (opción múltiple + abiertas), repaso de lo fallado, taller de gráficas y hoja de fórmulas.

Sitio en GitHub Pages: [franco704.github.io/modulando-ando](https://franco704.github.io/modulando-ando/)

No necesita instalación: es HTML, CSS y JavaScript. Abrí `index.html`. El progreso se guarda en el navegador.

Pruebas: `node tests/cx.test.js` (cálculos contra los ejemplos de la guía y los TP) y `node tests/content.test.js` (estructura del contenido; también verifica que cada pregunta abierta acepte su propia respuesta y que cada ítem de parcial tenga su resolución).

## Cargar la Unidad 10

El módulo `u10` (final) ya existe en `js/content/_helpers.js` y se muestra como “pendiente”. Para cargarlo:

1. Cambiar en `MODULES` el `title`, `stop` y `blurb` de `u10`.
2. Crear `js/content/10-<tema>.js` con el mismo formato que los demás (`LESSONS.push({ id, module: 'u10', … })`) y sumarlo a `index.html` antes de `formulas.js`.
3. Opcional: fórmulas en `js/content/formulas.js`, y la pantalla de entrada y el glifo del módulo en `js/anim.js` (`PIPES`, `TRAPS`, `GLYPHS`).

Apenas un módulo tiene lecciones deja de figurar como pendiente y entra en su simulacro y en el del final.

## Cargar un parcial nuevo

En `js/content/parciales.js`: sumar el examen a `EXAMS` (`id`, `unit`, `short`, `title`, `sub`, `items`) y, para cada ítem, un ejercicio con `exam: ['<id>#<ítem>']` en la lección que corresponda (o `vf(...)` si es de verdadero o falso). El test falla si un ítem queda sin resolver.

Criterio: donde la foto de un parcial muestra una marca del alumno que contradice la teoría de la cátedra, la resolución sigue la teoría y lo aclara.

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
