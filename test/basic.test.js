import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
import {
  init,
  CardSightAIError,
  AuthenticationError,
  isExactMatch,
  isSetLevelMatch,
  getExactMatches,
  hasFields,
  getFields,
  getFieldValue,
  formatFieldValues,
  hasSuggestions,
  getSuggestions,
  isNumberedCard,
  getNumberedTo,
  formatCardDisplay,
  hasParallel,
  getParallelInfo,
  isNumberedParallel,
  formatParallelDisplay,
  hasParallelSuggestions,
  getParallelSuggestions,
  getBestParallelSuggestion,
  filterParallelSuggestionsByConfidence,
  formatParallelSuggestion
} from '../dist/esm/index.js';

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

test('CommonJS build', async (t) => {
  await t.test('dist/cjs loads via require() despite the root "type": "module"', () => {
    const require = createRequire(import.meta.url);
    const cjs = require('../dist/cjs/index.js');
    assert.strictEqual(typeof cjs.CardSightAI, 'function', 'CardSightAI class should be exported');
    assert.strictEqual(typeof cjs.init, 'function', 'init() should be exported');
    assert.strictEqual(typeof cjs.hasParallelSuggestions, 'function', 'utilities should be exported');
  });
});

test('Client structure', async (t) => {
  const client = init({ apiKey: 'test_key' });

  await t.test('should have all main endpoint groups', () => {
    assert(client.health, 'Should have health endpoints');
    assert(client.identify, 'Should have identify endpoints');
    assert(client.detect, 'Should have detect endpoints');
    assert(client.catalog, 'Should have catalog endpoints');
    assert(client.collections, 'Should have collections endpoints');
    assert(client.autocomplete, 'Should have autocomplete endpoints');
    assert(client.ai, 'Should have AI endpoints');
    assert(client.pricing, 'Should have pricing endpoints');
    assert(client.marketplace, 'Should have marketplace endpoints');
    assert(client.feedback, 'Should have feedback endpoints');
    assert(client.raw, 'Should have raw client access');
  });

  await t.test('health endpoints should exist', () => {
    assert(typeof client.health.check === 'function', 'Should have health.check()');
    assert(typeof client.health.checkAuth === 'function', 'Should have health.checkAuth()');
  });

  await t.test('identify endpoints should exist', () => {
    assert(typeof client.identify.card === 'function', 'Should have identify.card()');
    assert(
      typeof client.identify.cardBySegment === 'function',
      'Should have identify.cardBySegment()'
    );
    assert(typeof client.identify.sets.list === 'function', 'Should have identify.sets.list()');
    assert(typeof client.identify.sets.check === 'function', 'Should have identify.sets.check()');
  });

  await t.test('detect endpoints should exist', () => {
    assert(typeof client.detect.card === 'function', 'Should have detect.card()');
  });

  await t.test('catalog endpoints should exist', () => {
    assert(typeof client.catalog.cards.list === 'function', 'Should have catalog.cards.list()');
    assert(typeof client.catalog.cards.get === 'function', 'Should have catalog.cards.get()');
    assert(typeof client.catalog.sets.list === 'function', 'Should have catalog.sets.list()');
    assert(typeof client.catalog.manufacturers === 'function', 'Should have catalog.manufacturers()');
    assert(typeof client.catalog.parallels.list === 'function', 'Should have catalog.parallels.list()');
    assert(typeof client.catalog.parallels.get === 'function', 'Should have catalog.parallels.get()');
    assert(typeof client.catalog.fields.list === 'function', 'Should have catalog.fields.list()');
    assert(typeof client.catalog.fields.get === 'function', 'Should have catalog.fields.get()');
  });

  await t.test('releaseCalendar endpoints should exist', () => {
    assert(
      typeof client.releaseCalendar.list === 'function',
      'Should have releaseCalendar.list()'
    );
  });

  await t.test('pricing & marketplace endpoints should exist', () => {
    assert(typeof client.pricing.get === 'function', 'Should have pricing.get()');
    assert(typeof client.pricing.bulk === 'function', 'Should have pricing.bulk()');
    assert(typeof client.pricing.search === 'function', 'Should have pricing.search()');
    assert(typeof client.pricing.timeseries === 'function', 'Should have pricing.timeseries()');
    assert(typeof client.marketplace.get === 'function', 'Should have marketplace.get()');
    assert(typeof client.marketplace.search === 'function', 'Should have marketplace.search()');
  });
});

test('Field value utility functions (v3.4.2)', async (t) => {
  const pokemon = {
    confidence: 'High',
    card: {
      id: 'uuid-pokemon',
      name: 'Charizard',
      fields: [
        { key: 'HP', value: '120' },
        { key: 'RARITY', value: 'Holo Rare' },
        { key: 'ARTIST', value: 'Mitsuhiro Arita' }
      ]
    }
  };
  const empty = { confidence: 'Medium', card: { id: 'uuid-x' } };

  await t.test('hasFields detects presence of field data', () => {
    assert.strictEqual(hasFields(pokemon), true);
    assert.strictEqual(hasFields(empty), false);
  });

  await t.test('getFields returns the array or empty', () => {
    assert.strictEqual(getFields(pokemon).length, 3);
    assert.deepStrictEqual(getFields(empty), []);
  });

  await t.test('getFieldValue looks up by key (case-insensitive)', () => {
    assert.strictEqual(getFieldValue(pokemon, 'HP'), '120');
    assert.strictEqual(getFieldValue(pokemon, 'hp'), '120');
    assert.strictEqual(getFieldValue(pokemon, 'Rarity'), 'Holo Rare');
    assert.strictEqual(getFieldValue(pokemon, 'MISSING'), undefined);
    assert.strictEqual(getFieldValue(empty, 'HP'), undefined);
  });

  await t.test('formatFieldValues joins key/value pairs', () => {
    assert.strictEqual(
      formatFieldValues(pokemon),
      'HP: 120 · RARITY: Holo Rare · ARTIST: Mitsuhiro Arita'
    );
    assert.strictEqual(formatFieldValues(pokemon, ', '), 'HP: 120, RARITY: Holo Rare, ARTIST: Mitsuhiro Arita');
    assert.strictEqual(formatFieldValues(empty), '');
  });
});

test('Card suggestion utility functions (v3.4.2)', async (t) => {
  const withSuggestions = {
    confidence: 'Medium',
    card: {
      id: 'uuid-a',
      name: 'Reprint Candidate',
      suggestions: [
        { id: 'uuid-b', setName: '1989 Topps' },
        { id: 'uuid-c', setName: '1990 Topps' }
      ]
    }
  };
  const without = { confidence: 'High', card: { id: 'uuid-x' } };

  await t.test('hasSuggestions detects alternative candidates', () => {
    assert.strictEqual(hasSuggestions(withSuggestions), true);
    assert.strictEqual(hasSuggestions(without), false);
  });

  await t.test('getSuggestions returns the array or empty', () => {
    assert.strictEqual(getSuggestions(withSuggestions).length, 2);
    assert.deepStrictEqual(getSuggestions(without), []);
  });
});

test('Card suggestions are full card records (v4.0.0)', async (t) => {
  await t.test('formatCardDisplay works on a CardSuggestion entry', () => {
    const alt = {
      id: 'uuid-b',
      year: '1989',
      manufacturer: 'Upper Deck',
      releaseName: 'Upper Deck',
      setName: 'Base Set',
      name: 'Ken Griffey Jr.',
      number: '1'
    };
    assert.strictEqual(formatCardDisplay(alt), '1989 Upper Deck Upper Deck Base Set Ken Griffey Jr. #1');
  });
});

test('Parallel suggestion utility functions (v4.0.0, beta)', async (t) => {
  const gold = { id: 'p1', name: 'Gold Refractor', numberedTo: 50, confidence: 'Medium' };
  const orange = { id: 'p2', name: 'Orange Refractor', numberedTo: 25, confidence: 'High' };
  const plain = { id: 'p3', name: 'Refractor' }; // confidence not assessed
  const multi = { confidence: 'High', card: { id: 'u', parallelSuggestions: [gold, orange, plain] } };
  const single = {
    confidence: 'High',
    card: { id: 'u', parallelSuggestions: [{ id: 'p9', name: 'Black Prizm', confidence: 'High' }] }
  };
  const none = { confidence: 'High', card: { id: 'u' } };
  const emptyList = { confidence: 'High', card: { id: 'u', parallelSuggestions: [] } };

  await t.test('hasParallelSuggestions detects any parallel evidence', () => {
    assert.strictEqual(hasParallelSuggestions(multi), true);
    assert.strictEqual(hasParallelSuggestions(single), true);
    assert.strictEqual(hasParallelSuggestions(none), false);
    assert.strictEqual(hasParallelSuggestions(emptyList), false);
  });

  await t.test('getParallelSuggestions returns the array or empty', () => {
    assert.strictEqual(getParallelSuggestions(multi).length, 3);
    assert.deepStrictEqual(getParallelSuggestions(none), []);
    assert.deepStrictEqual(getParallelSuggestions(emptyList), []);
  });

  await t.test('getBestParallelSuggestion returns the first (engine-ranked) entry', () => {
    // Ranking and confidence are independent: the first entry wins even though a later
    // entry carries a higher confidence tier.
    assert.strictEqual(getBestParallelSuggestion(multi), gold);
    assert.strictEqual(getBestParallelSuggestion(none), undefined);
    assert.strictEqual(getBestParallelSuggestion(emptyList), undefined);
  });

  await t.test('filterParallelSuggestionsByConfidence keeps order and drops unassessed entries', () => {
    assert.deepStrictEqual(filterParallelSuggestionsByConfidence(multi, 'High'), [orange]);
    assert.deepStrictEqual(filterParallelSuggestionsByConfidence(multi, 'Medium'), [gold, orange]);
    // "Low" still excludes entries with no confidence value (not assessed is not Low)
    assert.deepStrictEqual(filterParallelSuggestionsByConfidence(multi, 'Low'), [gold, orange]);
    assert.deepStrictEqual(filterParallelSuggestionsByConfidence(none, 'Low'), []);
  });

  await t.test('formatParallelSuggestion formats name, print run, and confidence', () => {
    assert.strictEqual(formatParallelSuggestion(gold), 'Gold Refractor /50 - Medium confidence');
    assert.strictEqual(formatParallelSuggestion(orange), 'Orange Refractor /25 - High confidence');
    assert.strictEqual(formatParallelSuggestion(plain), 'Refractor');
    assert.strictEqual(
      formatParallelSuggestion(single.card.parallelSuggestions[0]),
      'Black Prizm - High confidence'
    );
  });

  await t.test('legacy parallel helpers read the best-match suggestion', () => {
    assert.strictEqual(hasParallel(multi), true);
    assert.strictEqual(hasParallel(none), false);
    assert.strictEqual(hasParallel(emptyList), false);

    assert.strictEqual(getParallelInfo(multi), gold);
    assert.strictEqual(getParallelInfo(none), undefined);

    assert.strictEqual(isNumberedParallel(multi), true);
    assert.strictEqual(isNumberedParallel(single), false);
    assert.strictEqual(isNumberedParallel(none), false);

    assert.strictEqual(formatParallelDisplay(multi), 'Gold Refractor /50');
    assert.strictEqual(formatParallelDisplay(single), 'Black Prizm');
    assert.strictEqual(formatParallelDisplay(none), '');
  });
});

test('Numbered card utility functions (v3.4.2)', async (t) => {
  const numbered = { confidence: 'High', card: { id: 'u', numberedTo: 25 } };
  const base = { confidence: 'High', card: { id: 'u' } };

  await t.test('isNumberedCard detects print run on base card', () => {
    assert.strictEqual(isNumberedCard(numbered), true);
    assert.strictEqual(isNumberedCard(base), false);
  });

  await t.test('getNumberedTo returns print run or undefined', () => {
    assert.strictEqual(getNumberedTo(numbered), 25);
    assert.strictEqual(getNumberedTo(base), undefined);
  });
});

test('Match-level utility functions', async (t) => {
  await t.test('isExactMatch should detect exact matches', () => {
    const exact = { confidence: 'High', card: { id: 'uuid', name: 'Mike Trout' } };
    const setLevel = { confidence: 'Medium', card: { setId: 'set-uuid', year: '2023' } };
    const noMatch = { confidence: 'Low', card: {} };

    assert.strictEqual(isExactMatch(exact), true, 'Should be exact match when card has id');
    assert.strictEqual(isExactMatch(setLevel), false, 'Should not be exact match without card id');
    assert.strictEqual(isExactMatch(noMatch), false, 'Should not be exact match for empty card');
  });

  await t.test('isSetLevelMatch should detect set-level matches', () => {
    const exact = { confidence: 'High', card: { id: 'uuid', setId: 'set-uuid' } };
    const setLevel = { confidence: 'Medium', card: { setId: 'set-uuid', year: '2023' } };
    const noMatch = { confidence: 'Low', card: {} };

    assert.strictEqual(isSetLevelMatch(exact), false, 'Exact match should not be set-level');
    assert.strictEqual(isSetLevelMatch(setLevel), true, 'Should be set-level match');
    assert.strictEqual(isSetLevelMatch(noMatch), false, 'No match should not be set-level');
  });

  await t.test('getExactMatches should filter exact matches', () => {
    const result = {
      success: true,
      requestId: 'req-1',
      detections: [
        { confidence: 'High', card: { id: 'uuid-1', name: 'Card 1' } },
        { confidence: 'Medium', card: { setId: 'set-uuid', year: '2023' } },
        { confidence: 'Low', card: {} }
      ]
    };

    const matches = getExactMatches(result);
    assert.strictEqual(matches.length, 1, 'Should return only exact matches');
    assert.strictEqual(matches[0].card.id, 'uuid-1', 'Should return the exact match detection');
  });

  await t.test('getExactMatches should handle empty detections', () => {
    assert.deepStrictEqual(getExactMatches({ success: true, requestId: 'r' }), []);
    assert.deepStrictEqual(
      getExactMatches({ success: true, requestId: 'r', detections: [] }),
      []
    );
  });
});