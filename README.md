# Modulando Ando

Guía de estudio de **Comunicación de Datos 2026 (UTN-FRT, Ingeniería en Sistemas de Información)**, armada con las guías de la cátedra (Ing. Carrasco, Ing. Such), los apuntes de cada unidad, los trabajos prácticos 1 a 9, los cuestionarios del campus y los parciales y finales de años anteriores. Separada por instancia de examen, cada una con su color:

- **Primer parcial** (azul): Unidad 1 Sistemas de comunicación, Unidad 2 Análisis de señales, Unidad 3 Atenuación, distorsión y ruido.
- **Segundo parcial** (violeta): Unidad 4 Teoría de la información, Unidad 5 Canales de comunicaciones, Unidad 6 Errores en la transmisión.
- **Tercer parcial** (verde azulado): Unidad 7 Técnicas de transmisión, Unidad 8 Modulación y multiplexación, Unidad 9 Equipos de comunicación de datos (módem, xDSL y fibra).
- **Final** (ámbar): todas las unidades más la Unidad 10 (redes inalámbricas).

Contenido:

- **Parciales y finales resueltos** (`#/parciales`): 18 exámenes reales (parciales 2023 a 2025 en sus distintos temas y seis finales de 2019), 78 ítems resueltos con su teoría, ranking de lo que más se repite y qué unidades pesan más. Cada afirmación de verdadero o falso queda además como pregunta en su lección, marcada “tomada en parcial”.
- **Videos de resumen** (`#/videos`): un video corto por lección (`videos/<id>.mp4`), separados por parcial y de corrido, con enlace a cada lección; cada lección tiene también el suyo arriba. El test falla si una lección no tiene video.
- **Teoría a fondo** para lo que toman los parciales y no estaba en las guías: qué espectro sale de cada señal (serie, transformada, sinc, 1/T y 1/p), teorema de codificación de fuente, códigos prefijo e información mutua, y detección contra corrección (distancia mínima, FEC, ARQ, repetición).
- **Unidad 9** completa, desde el apunte de la cátedra, sus cinco lecturas (banda ancha, ADSL, redes ópticas, MODEM y redes PON), el TP 9 y su cuestionario: módem DTE/DCE y normas V (FSK a TCM, V.90/V.92), interfaz RS-232/V.24 y módem nulo, xDSL, ADSL, splitter, DSLAM, VDSL/VDSL2, DMT con bitswapping y Reed-Solomon, FTTx, PON y presupuesto óptico, y las tecnologías PON de APON a NG-PON2 con la capa física de GPON.
- **Tercer parcial 2025 resuelto paso a paso** (temas 1, 2, 3 y la otra versión del tema 3), con el criterio de la cátedra: datos y lo que piden, pasos numerados, “cómo queda escrito en el parcial” y los “ojo” de cada ejercicio (TDM, NRZ + 8PSK/8QAM, constelaciones, diagramas de tiempo, descarga y los V o F). La lección **Cómo resolver el tercer parcial** junta el método y los laboratorios para practicar cada tipo de ejercicio, y la de jerarquías suma el cuadro de la trama E1.
- **Unidad 10**: redes inalámbricas (WPAN, WLAN, WMAN, WWAN, WiFi y sus componentes, espectro ensanchado, OFDM y MIMO).
- Preguntas de los cuestionarios del campus de las unidades 1 a 8.
- 50 lecciones con la teoría de la cátedra, glifo animado por unidad y pantalla de entrada con el error típico del parcial.
- 56 laboratorios interactivos, con aspecto de instrumento (pantalla de vidrio y lecturas): senoidal y espectro, señal compuesta, sumas de Fourier, tren de pulsos (sinc), filtros, presupuesto de enlace WiFi, H(p), Huffman con árbol, muestreo y aliasing, Shannon, paridad VRC/LRC, CRC paso a paso, Hamming de la cátedra, ARQ, códigos de línea (NRZ a HDB3), modulaciones con constelación que se reproduce símbolo por símbolo, lector de constelaciones (con las de los parciales), “¿qué modulación es?” con diagramas de tiempo al azar, de NRZ a M-aria, la trama TDM con los casos de cada tema, V o F por partes, QAM con ruido, PCM, FDM, topologías y AM/FM/PM.
- 602 preguntas de opción múltiple y 163 **preguntas abiertas corregidas al instante**: cálculos con tolerancia y unidades (“133 Mbps”, “−100,8 dBm”, “10^-4”), teóricas por conceptos clave (con respuesta modelo y la opción de marcarla como correcta) y cadenas de bits exactas (CRC, Hamming, paridad).
- 141 ejercicios resueltos: los de los TP 1 a 9 y los de los parciales. Los números de CRC, Hamming, Huffman, ruido, enlaces, TDM y códigos de línea se calculan en la página con el mismo código que los laboratorios.
- Cuestionario por módulo, simulacro de cada parcial y del final (opción múltiple + abiertas), repaso de lo fallado, taller de gráficas y hoja de fórmulas.

Sitio en GitHub Pages: [franco704.github.io/modulando-ando](https://franco704.github.io/modulando-ando/)

No necesita instalación: es HTML, CSS y JavaScript. Abrí `index.html`. El progreso se guarda en el navegador.

Pruebas: `node tests/cx.test.js` (cálculos contra los ejemplos de la guía, los TP y el tercer parcial) y `node tests/content.test.js` (estructura del contenido; también verifica que cada pregunta abierta acepte su propia respuesta y que cada ítem de parcial tenga su resolución).

## Cómo está organizado

Las carpetas dicen qué hace la guía (arquitectura “screaming”); cada una trae su JavaScript y su CSS:

- `nucleo/`: el espacio `GUIDE` con las unidades, módulos y ayudantes de contenido (`guia.js`), el estado y el router con registro de pantallas (`app.js`, cada vista se registra con `A.page(coincide, mostrar)`), el arranque y los estilos comunes (`estilos/`: tokens, base y marco).
- `unidades/`: la teoría de cada unidad (`u01-…` a `u10-…`) y el cierre del tercer parcial (`u08b-tercer-parcial.js`).
- `laboratorios/`: el motor, los controles compartidos, los cálculos (`calculos.js`, los mismos que usan soluciones y pruebas) y un archivo por tema.
- `lecciones/`: la lección, el índice lateral y la pantalla de entrada de cada módulo.
- `practica/`: cuestionarios, preguntas abiertas, repaso y simulacros.
- `parciales/`: los exámenes reales (`examenes.js`), el tercer parcial 2025 paso a paso (`tercer-parcial.js`) y su vista.
- `portada/`, `formulas/`, `graficas/`, `videos/`: cada pantalla con lo suyo (los videos `.mp4` viven en `videos/`).

El orden de carga está en `index.html`: núcleo, laboratorios, contenido y después las vistas. Una lección sin video declara `video: false`.

## Cargar una unidad o una lección

1. Crear `unidades/uNN-<tema>.js` con el mismo formato que los demás (`LESSONS.push({ id, module, … })`) y sumarlo a `index.html` en el bloque de contenido.
2. Si es un módulo nuevo, completar `MODULES` en `nucleo/guia.js`; opcional: fórmulas en `formulas/formulas.js` y la pantalla de entrada en `lecciones/entrada.js` (`PIPES`, `TRAPS`, `GLYPHS`).

## Cargar un parcial nuevo

En `parciales/examenes.js`: sumar el examen a `EXAMS` (`id`, `unit`, `short`, `title`, `sub`, `items`) y, para cada ítem, un ejercicio con `exam: ['<id>#<ítem>']` en la lección que corresponda (o `vf(...)` si es de verdadero o falso). El test falla si un ítem queda sin resolver.

Criterio: donde la foto de un parcial muestra una marca del alumno que contradice la teoría de la cátedra, la resolución sigue la teoría y lo aclara.

## Datos que faltan de los TP

Algunos ejercicios dependen de imágenes que no vienen en el texto de los TP (TP 2 ej. 2 a 6, TP 3 ej. 1, TP 4 ej. 4, TP 6 ej. 1 y TP 7 ej. 5b). En el tercer parcial, las figuras se reconstruyeron desde las resoluciones detalladas; donde el enunciado tiene un error (el −45° repetido del tema 3) o admite dos lecturas (“n valores”, el ancho de banda modulado como B o 2B), la resolución lo aclara. Se resuelven con el método completo y un caso equivalente o de ejemplo, indicado como tal.

## También probá

### 2.º año

- [Integrando Ando](https://franco704.github.io/integrando-ando/): Análisis Matemático II ([repositorio](https://github.com/Franco704/integrando-ando))
- [Operando Ando](https://franco704.github.io/operando-ando/): Sistemas Operativos ([repositorio](https://github.com/Franco704/operando-ando))

### 3.er año

- [Backeando Ando](https://franco704.github.io/backeando-ando/): Desarrollo de Software, backend ([repositorio](https://github.com/Franco704/backeando-ando))
- [Fronteando Ando](https://franco704.github.io/fronteando-ando/): Desarrollo de Software, frontend ([repositorio](https://github.com/Franco704/fronteando-ando))
- [Diseñando Ando](https://franco704.github.io/disenando-ando/): Diseño de Sistemas de Información ([repositorio](https://github.com/Franco704/disenando-ando))
- [Iterando Ando](https://franco704.github.io/iterando-ando/): Matemática Superior ([repositorio](https://github.com/Franco704/iterando-ando))
- [Probando Ando](https://franco704.github.io/probando-ando/): Probabilidad y Estadística ([repositorio](https://github.com/Franco704/probando-ando))
- [Economizar](https://franco704.github.io/economizar/): Economía ([repositorio](https://github.com/Franco704/economizar))

## Agradecimientos

A **Mateo Rusconi**, autor original de las animaciones que esta guía hereda de Backeando Ando: la pantalla de entrada a cada tema, los glifos animados de las lecciones y los microefectos de los cuestionarios vienen de su "Laboratorio Frontend DSW".
