import { test } from 'node:test';
import assert from 'node:assert';
import { init, CardSightAIError, AuthenticationError } from '../dist/esm/index.js';

test('SDK initialization', async (t) => {
  await t.test('should throw error when no API key provided', () => {
    // Clear env variable for this test
    const originalKey = process.env.CARDSIGHTAI_API_KEY;
    delete process.env.CARDSIGHTAI_API_KEY;

    assert.throws(
      () => init(),
      AuthenticationError,
      'Should throw AuthenticationError when no API key'
    );

    // Restore env variable
    if (originalKey) {
      process.env.CARDSIGHTAI_API_KEY = originalKey;
    }
  });

  await t.test('should initialize with API key from config', () => {
    const client = init({ apiKey: 'test_key_123' });
    assert(client, 'Client should be created');
    assert(client.health, 'Client should have health methods');
    assert(client.catalog, 'Client should have catalog methods');
    assert(client.collections, 'Client should have collections methods');
  });

  await t.test('should initialize with API key from environment', () => {
    process.env.CARDSIGHTAI_API_KEY = 'test_env_key';
    const client = init();
    assert(client, 'Client should be created from env variable');
    delete process.env.CARDSIGHTAI_API_KEY;
  });
});

test('Error classes', async (t) => {
  await t.test('CardSightAIError should have correct properties', () => {
    const error = new CardSightAIError('Test error', 404, { detail: 'Not found' }, { url: '/test' });
    assert.strictEqual(error.name, 'CardSightAIError');
    assert.strictEqual(error.message, 'Test error');
    assert.strictEqual(error.status, 404);
    assert.deepStrictEqual(error.response, { detail: 'Not found' });
    assert.deepStrictEqual(error.request, { url: '/test' });
  });

  await t.test('AuthenticationError should have correct message', () => {
    const error = new AuthenticationError();
    assert.strictEqual(error.name, 'AuthenticationError');
    assert(error.message.includes('API key'), 'Error message should mention API key');
  });
});

test('Client structure', async (t) => {
  const client = init({ apiKey: 'test_key' });

  await t.test('should have all main endpoint groups', () => {
    assert(client.health, 'Should have health endpoints');
    assert(client.identify, 'Should have identify endpoints');
    assert(client.catalog, 'Should have catalog endpoints');
    assert(client.collections, 'Should have collections endpoints');
    assert(client.autocomplete, 'Should have autocomplete endpoints');
    assert(client.ai, 'Should have AI endpoints');
    assert(client.feedback, 'Should have feedback endpoints');
    assert(client.raw, 'Should have raw client access');
  });

  await t.test('health endpoints should exist', () => {
    assert(typeof client.health.check === 'function', 'Should have health.check()');
    assert(typeof client.health.checkAuth === 'function', 'Should have health.checkAuth()');
  });

  await t.test('catalog endpoints should exist', () => {
    assert(typeof client.catalog.cards.list === 'function', 'Should have catalog.cards.list()');
    assert(typeof client.catalog.cards.get === 'function', 'Should have catalog.cards.get()');
    assert(typeof client.catalog.sets.list === 'function', 'Should have catalog.sets.list()');
    assert(typeof client.catalog.manufacturers === 'function', 'Should have catalog.manufacturers()');
    assert(typeof client.catalog.parallels.list === 'function', 'Should have catalog.parallels.list()');
    assert(typeof client.catalog.parallels.get === 'function', 'Should have catalog.parallels.get()');
  });
});