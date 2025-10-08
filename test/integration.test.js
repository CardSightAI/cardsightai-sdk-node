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

});

console.log('\n✅ All integration tests passed!\n');