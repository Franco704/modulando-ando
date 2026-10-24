// Autocomprobación de js/labs/cx.js contra los ejemplos de la guía de la cátedra y los TP. Uso: node tests/cx.test.js
const assert = require('assert');
global.window = { GUIDE: { h: { num: (v) => String(v) } } };
require('../js/labs/cx.js');
const X = window.GUIDE.cx, near = (a, b, t = 1e-3) => assert(Math.abs(a - b) < t, `${a} ≠ ${b}`);
// U3: dBm, espacio libre (ejemplo 9) y ruido (ejemplos 12 y 13, TP 3.2)
near(X.dBm(63.1e-3), 18, 0.01); near(X.fspl(5800, 0.1), 87.71, 0.01); near(X.noiseDbm(17, 1), -174, 0.05); near(X.noiseDbm(25, 20e6), -100.85, 0.01);
// U4: entropía (ejemplo 7) y Huffman del ejemplo 16: código por código
near(X.entropy([0.5, 0.25, 0.125, 0.125]), 1.75);
const h16 = X.huffman([0.2, 0.01, 0.4, 0.04, 0.1, 0.02, 0.07, 0.16].map((p, i) => ({ s: `x${i}`, p })));
assert.deepStrictEqual(h16.codes, { x0: '000', x1: '010111', x2: '1', x3: '01010', x4: '011', x5: '010110', x6: '0100', x7: '001' }); near(h16.L, 2.44);
near(X.huffman(X.freqs('TRESTRISTESTIGRES')).L * 17, 43);   // TP 4.8: 43 bits
// U5: Nyquist y Shannon (ejemplos 5, 6, 13; TP 5)
near(X.nyquist(3100, 4), 12400); near(X.shannon(1e6, 255), 8e6); near(X.shannon(20e6, 100) / 1e6, 133.16, 0.01); assert.strictEqual(X.pow2Floor(X.levels(100)), 8);
// U6: CRC de la guía, TP 6.2 y Hamming de la guía, TP 6.7
assert.strictEqual(X.crc('10110111', '110011').tx, '1011011101001'); assert.strictEqual(X.crcCheck('1011011101001', '110011').rem, '00000');
assert.strictEqual(X.crc(X.bcd(87), '110011').tx, '1000011101111');
assert.strictEqual(X.hammingEncode('1001101').word, '10011100101'); assert.strictEqual(X.hammingDecode('10001100101').syn, 8);
const d7 = X.hammingDecode('10001100100'); assert.strictEqual(d7.syn, 9); assert.strictEqual(d7.data, '1011101');
assert.strictEqual(X.minDist(['0000', '1110', '1001', '0111']), 2);
// U7: códigos de línea del TP 7.5
const s = (k) => X.lineCode('10000000011100001', k).map(([a, b]) => `${a}${b}`).join(',');
assert.strictEqual(s('b8zs'), '11,00,00,00,11,-1-1,00,-1-1,11,-1-1,11,-1-1,00,00,00,00,11');
assert.strictEqual(s('hdb3'), '11,00,00,00,11,-1-1,00,00,-1-1,11,-1-1,11,00,00,00,11,-1-1');
assert.strictEqual(X.dmanchDecode(X.lineCode('1011000110', 'dmanch')), '1011000110');
// Corrector de abiertas
assert(X.parseNum('133,16 Mbps') === 133.16e6 && X.parseNum('10^-4') === 1e-4 && X.parseNum('1.234,5') === 1234.5);
assert(X.checkOpen({ t: 'num', a: 133.16, u: 'Mbps' }, '133,16 Mbps').ok && X.checkOpen({ t: 'num', a: 133.16, u: 'Mbps' }, '133160000').ok && !X.checkOpen({ t: 'num', a: 133.16, u: 'Mbps' }, '120').ok);
assert(X.checkOpen({ t: 'num', a: 3, u: 'ms' }, '3 ms').ok && X.checkOpen({ t: 'bits', a: '1011 0110' }, '10110110').ok);
assert(X.checkOpen({ t: 'text', k: [['fuente'], ['canal']] }, 'La fuente envía por el canal').ok);
console.log('cx.js: todo OK');
