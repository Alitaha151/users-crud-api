const test = require('node:test');
const assert = require('node:assert/strict');
const { validateUser } = require('../src/validation');

test('validates and normalizes a new user', () => {
  const result = validateUser({ name: ' Ada Lovelace ', email: 'ADA@example.com', age: 36 });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.values, {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    age: 36
  });
});

test('rejects missing required fields and invalid values', () => {
  const result = validateUser({ name: ' ', email: 'not-an-email', age: 151 });
  assert.equal(result.errors.length, 3);
});

test('allows a partial update and nullable age', () => {
  const result = validateUser({ age: null }, { partial: true });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.values, { age: null });
});

test('rejects empty updates and unknown fields', () => {
  assert.equal(validateUser({}, { partial: true }).errors.length, 1);
  assert.deepEqual(validateUser({ role: 'admin' }, { partial: true }).errors, [
    'Unknown field: role.',
    'Provide at least one field to update.'
  ]);
});
