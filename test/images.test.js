import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { createServer } from 'node:http';
import { init, CardSightAIError } from '../dist/esm/index.js';

// Image endpoints return binary bytes, not JSON. These tests run the SDK's image
// methods against a local server, so they need no API key.

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

let server;
let baseUrl;
let lastRequestUrl;

before(async () => {
  server = createServer((req, res) => {
    lastRequestUrl = req.url;
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname.includes('missing')) {
      const body = JSON.stringify({ message: 'Card image not found' });
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(body);
      return;
    }

    const isPng = url.searchParams.get('png') === '1' || url.pathname.includes('png');
    const bytes = isPng ? PNG : JPEG;
    const headers = { 'Content-Type': isPng ? 'image/png' : 'image/jpeg' };
    // openapi-fetch takes a different path when Content-Length is missing, so cover both
    if (!url.pathname.includes('chunked')) {
      headers['Content-Length'] = String(bytes.length);
    }
    res.writeHead(200, headers);
    res.end(bytes);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
});

function client() {
  return init({ apiKey: 'test-key', baseUrl });
}

async function assertImage(result, expectedBytes, expectedType) {
  assert.ok(result.data instanceof Blob, 'data should be a Blob');
  assert.strictEqual(result.data.type, expectedType);
  assert.deepStrictEqual(Buffer.from(await result.data.arrayBuffer()), expectedBytes);
  assert.strictEqual(result.response.headers.get('Content-Type'), expectedType);
}

const imageMethods = [
  {
    name: 'collections.cards.getImage',
    call: (c, cardId) => c.collections.cards.getImage('collection-1', cardId),
    path: (cardId) => `/v1/collection/collection-1/cards/${cardId}/image`
  },
  {
    name: 'collections.cards.getThumbnail',
    call: (c, cardId) => c.collections.cards.getThumbnail('collection-1', cardId),
    path: (cardId) => `/v1/collection/collection-1/cards/${cardId}/image/thumb`
  },
  {
    name: 'images.getCard',
    call: (c, cardId) => c.images.getCard(cardId),
    path: (cardId) => `/v1/images/cards/${cardId}`
  }
];

for (const method of imageMethods) {
  test(`${method.name} returns image bytes`, async (t) => {
    await t.test('returns a JPEG as a Blob when Content-Length is set', async () => {
      const result = await method.call(client(), 'card-1');
      assert.strictEqual(lastRequestUrl, method.path('card-1'));
      await assertImage(result, JPEG, 'image/jpeg');
    });

    await t.test('returns a JPEG as a Blob when Content-Length is missing', async () => {
      const result = await method.call(client(), 'chunked-card');
      await assertImage(result, JPEG, 'image/jpeg');
    });

    await t.test('returns a PNG as a Blob', async () => {
      const result = await method.call(client(), 'png-card');
      await assertImage(result, PNG, 'image/png');
    });

    await t.test('throws CardSightAIError on a 404', async () => {
      await assert.rejects(
        () => method.call(client(), 'missing-card'),
        (error) => {
          assert.ok(error instanceof CardSightAIError);
          assert.strictEqual(error.status, 404);
          assert.strictEqual(error.message, 'Card image not found');
          return true;
        }
      );
    });
  });
}
