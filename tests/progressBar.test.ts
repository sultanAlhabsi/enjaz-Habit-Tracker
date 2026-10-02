import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProgressBarValue } from '../src/utils/habitUtils.ts';

test('normalizeProgressBarValue: standard percentage values (0 to 100)', () => {
  assert.equal(normalizeProgressBarValue(0), 0);
  assert.equal(normalizeProgressBarValue(25), 0.25);
  assert.equal(normalizeProgressBarValue(50), 0.5);
  assert.equal(normalizeProgressBarValue(75), 0.75);
  assert.equal(normalizeProgressBarValue(100), 1.0);
});

test('normalizeProgressBarValue: fixes the 1% and fractional percentage spike bug', () => {
  // CRITICAL FIX: In the old code, progress = 1 evaluated (1 > 1 ? 1/100 : 1) -> 1.0 (100% full!).
  // Now 1% must normalize strictly to 0.01.
  assert.equal(normalizeProgressBarValue(1), 0.01);
  assert.notEqual(normalizeProgressBarValue(1), 1.0);

  // Fractional percentage: 0.5% (e.g. 1 out of 200)
  assert.equal(normalizeProgressBarValue(0.5), 0.005);
  assert.notEqual(normalizeProgressBarValue(0.5), 0.5);

  // 1.5% (e.g. 3 out of 200)
  assert.equal(normalizeProgressBarValue(1.5), 0.015);

  // 0.02% (e.g. 1 out of 5000 steps)
  assert.equal(normalizeProgressBarValue(0.02), 0.0002);
});

test('normalizeProgressBarValue: ratio mode (0 to 1) when isRatio is true', () => {
  assert.equal(normalizeProgressBarValue(0, true), 0);
  assert.equal(normalizeProgressBarValue(0.005, true), 0.005);
  assert.equal(normalizeProgressBarValue(0.01, true), 0.01);
  assert.equal(normalizeProgressBarValue(0.5, true), 0.5);
  assert.equal(normalizeProgressBarValue(1.0, true), 1.0);
});

test('normalizeProgressBarValue: bounds clamping and safe fallback for NaN/negative', () => {
  assert.equal(normalizeProgressBarValue(-10), 0);
  assert.equal(normalizeProgressBarValue(150), 1.0);
  assert.equal(normalizeProgressBarValue(NaN), 0);
  assert.equal(normalizeProgressBarValue(-5, true), 0);
  assert.equal(normalizeProgressBarValue(2.5, true), 1.0);
});

test('normalizeProgressBarValue: simulation of 200-count habit monotonic progression', () => {
  const targetCount = 200;
  const values: number[] = [];

  for (let count = 0; count <= targetCount; count++) {
    const rawRatio = count / targetCount;
    const progressPercent = Math.min(100, Math.max(0, rawRatio * 100));
    const normalized = normalizeProgressBarValue(progressPercent);
    values.push(normalized);
  }

  // Ensure 0 is 0
  assert.equal(values[0], 0);

  // Ensure 1 of 200 is 0.005 (NOT 1.0)
  assert.equal(values[1], 0.005);

  // Ensure 2 of 200 is 0.010 (NOT 1.0)
  assert.equal(values[2], 0.01);

  // Ensure 3 of 200 is 0.015
  assert.equal(values[3], 0.015);

  // Ensure 200 of 200 is 1.0
  assert.equal(values[200], 1.0);

  // Strictly non-decreasing throughout the entire range (no sudden jumps to 1.0 and snapping back)
  for (let i = 1; i < values.length; i++) {
    assert.ok(
      values[i] >= values[i - 1],
      `Progress value at count ${i} (${values[i]}) must be >= count ${i - 1} (${values[i - 1]})`
    );
  }
});

test('normalizeProgressBarValue: simulation of 5000-step habit progression', () => {
  const targetCount = 5000;
  
  // 1 step out of 5000
  const norm1 = normalizeProgressBarValue((1 / targetCount) * 100);
  assert.ok(norm1 > 0 && norm1 < 0.001);

  // 25 steps out of 5000 (0.5%)
  const norm25 = normalizeProgressBarValue((25 / targetCount) * 100);
  assert.equal(norm25, 0.005);

  // 50 steps out of 5000 (1%)
  const norm50 = normalizeProgressBarValue((50 / targetCount) * 100);
  assert.equal(norm50, 0.01);

  // 2500 steps out of 5000 (50%)
  const norm2500 = normalizeProgressBarValue((2500 / targetCount) * 100);
  assert.equal(norm2500, 0.5);

  // 5000 steps out of 5000 (100%)
  const norm5000 = normalizeProgressBarValue((5000 / targetCount) * 100);
  assert.equal(norm5000, 1.0);
});
