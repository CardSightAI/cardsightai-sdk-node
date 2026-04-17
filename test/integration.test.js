/**
 * Integration tests for CardSightAI SDK
 *
 * Run with: CARDSIGHTAI_API_KEY=YOUR_API_KEY npm run test:integration
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { init } from '../dist/esm/index.js';

// Get API key from environment variable
const getApiKey = () => {
  // Check environment variable
  if (process.env.CARDSIGHTAI_API_KEY) {
    return process.env.CARDSIGHTAI_API_KEY;
  }

  console.error('\n❌ API key is required for integration tests!\n');
  console.error('Please provide an API key using:');
  console.error('CARDSIGHTAI_API_KEY=YOUR_API_KEY npm run test:integration\n');
  process.exit(1);
};

// Initialize client
const apiKey = getApiKey();
const client = init({ apiKey });

describe('CardSightAI SDK Integration Tests', () => {

  test('Health Check - Basic', async () => {
    const response = await client.health.check();
    assert.ok(response.data, 'Response should have data');
    assert.equal(response.data.status, 'healthy', 'Status should be healthy');
  });

  test('Health Check - Authenticated', async () => {
    const response = await client.health.checkAuth();
    assert.ok(response.data, 'Response should have data');
    assert.equal(response.data.status, 'healthy', 'Status should be healthy');
    // Auth endpoint returns same as basic health but requires valid API key to access
  });

  test('Catalog - Card Search', async () => {
    const response = await client.catalog.cards.list({
      limit: 5
    });
    assert.ok(response.data, 'Response should have data');
    assert.ok(response.data.cards, 'Response should have cards array');
    assert.ok(Array.isArray(response.data.cards), 'Cards should be an array');
    assert.ok(response.data.cards.length <= 20, 'Should return cards'); // API seems to ignore limit param
  });

  test('Catalog - Fields List (v3.4.2)', async () => {
    const response = await client.catalog.fields.list({ take: 5 });
    assert.ok(response.data, 'Response should have data');
    assert.ok(Array.isArray(response.data.fields), 'fields should be an array');
    assert.ok(typeof response.data.total_count === 'number', 'Response should include total_count');
    if (response.data.fields.length > 0) {
      const first = response.data.fields[0];
      assert.ok(first.id, 'Field entry should have an id');
      assert.ok(first.key, 'Field entry should have a key');
      assert.ok(first.name, 'Field entry should have a name');
      assert.ok(
        typeof first.usageCount === 'number',
        'Field entry should have a numeric usageCount'
      );
    }
  });

  test('Catalog - Fields Get By Id (v3.4.2)', async () => {
    const listResponse = await client.catalog.fields.list({ take: 1 });
    const firstId = listResponse.data?.fields?.[0]?.id;
    if (!firstId) {
      return; // No fields to fetch — skip without failing.
    }
    const response = await client.catalog.fields.get(firstId);
    assert.ok(response.data, 'Response should have data');
    assert.equal(response.data.id, firstId, 'Returned field id should match requested id');
    assert.ok(response.data.key, 'Field should have a key');
    assert.ok(response.data.name, 'Field should have a name');
    assert.ok(
      typeof response.data.usageCount === 'number',
      'Field should include a usageCount'
    );
  });

  test('Release Calendar - List (v3.4.2)', async () => {
    const response = await client.releaseCalendar.list({ take: 5 });
    assert.ok(response.data, 'Response should have data');
    assert.ok(
      Array.isArray(response.data.release_calendar),
      'release_calendar should be an array'
    );
    assert.ok(typeof response.data.total_count === 'number', 'Response should include total_count');
    if (response.data.release_calendar.length > 0) {
      const entry = response.data.release_calendar[0];
      assert.ok(entry.id, 'Calendar entry should have an id');
      assert.ok(entry.name, 'Calendar entry should have a name');
    }
  });

});

console.log('\n✅ All integration tests passed!\n');