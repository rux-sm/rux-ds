// Reference-vector tests for contrast.mjs. Run with `node --test
// theme-creator/contrast.test.mjs` — Node 22's built-in runner, no new
// dependency. A visual "does the warning show" check in the browser is not
// a substitute for these: it can pass with a systematically wrong formula
// as long as the wrongness happens to land on the same side of the
// threshold for whatever value someone tried by hand.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, relativeLuminance, contrastRatio, meetsThreshold } from './contrast.mjs';

test('hexToRgb parses 6-digit and 3-digit, with and without #, any case', () => {
  assert.deepEqual(hexToRgb('#8a3ffc'), { r: 138, g: 63, b: 252 });
  assert.deepEqual(hexToRgb('8A3FFC'), { r: 138, g: 63, b: 252 });
  assert.deepEqual(hexToRgb('#fff'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(hexToRgb('000'), { r: 0, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('ABC'), { r: 170, g: 187, b: 204 });
});

test('hexToRgb rejects anything that is not exactly 3 or 6 hex digits', () => {
  for (const bad of ['', '#', 'red', '#12345', '#1234567', 'gggggg', null, undefined]) {
    assert.equal(hexToRgb(bad), null);
  }
});

test('relativeLuminance: pure black is 0, pure white is 1', () => {
  assert.equal(relativeLuminance('#000000'), 0);
  assert.equal(relativeLuminance('#ffffff'), 1);
});

test('relativeLuminance accepts a hex string or a pre-parsed {r,g,b} identically', () => {
  assert.equal(relativeLuminance('#8a3ffc'), relativeLuminance({ r: 138, g: 63, b: 252 }));
});

test('contrastRatio is symmetric regardless of argument order', () => {
  assert.equal(contrastRatio('#8a3ffc', '#ffffff'), contrastRatio('#ffffff', '#8a3ffc'));
  assert.equal(contrastRatio('#161616', '#f4f4f4'), contrastRatio('#f4f4f4', '#161616'));
});

test('contrastRatio: black on white and white on black are both 21:1', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#ffffff') - 21) < 1e-9);
  assert.ok(Math.abs(contrastRatio('#ffffff', '#000000') - 21) < 1e-9);
});

test('contrastRatio: identical colors are 1:1', () => {
  assert.ok(Math.abs(contrastRatio('#8a3ffc', '#8a3ffc') - 1) < 1e-9);
});

test('contrastRatio returns null when either side does not parse', () => {
  assert.equal(contrastRatio('not-a-color', '#ffffff'), null);
  assert.equal(contrastRatio('#ffffff', ''), null);
});

test('meetsThreshold: boundary is inclusive at exactly 3.0 and 4.5', () => {
  assert.equal(meetsThreshold(3.0, 3.0), true);
  assert.equal(meetsThreshold(2.999999, 3.0), false);
  assert.equal(meetsThreshold(4.5, 4.5), true);
  assert.equal(meetsThreshold(4.499999, 4.5), false);
});

test('meetsThreshold propagates an unparsable ratio as null, not a false pass', () => {
  assert.equal(meetsThreshold(null, 4.5), null);
});
