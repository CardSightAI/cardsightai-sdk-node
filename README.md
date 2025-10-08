# CardSight AI Node.js SDK

Official TypeScript/JavaScript SDK for the CardSight AI REST API.

## Features

- 🚀 **Full TypeScript Support** - Complete type safety with auto-generated types from OpenAPI spec
- 🔐 **Built-in Authentication** - Automatic API key handling via environment variable or config
- ⚡ **Modern Architecture** - Uses native fetch API (Node.js 18+)
- 🎯 **Minimal Dependencies** - Only essential packages for maximum reliability
- 📦 **Dual Module Support** - Works with both CommonJS and ESM
- 🛠️ **Developer Friendly** - Intuitive API with comprehensive error handling

## Getting Started

### Get Your Free API Key

Sign up for a **free API key** at [https://cardsight.ai](https://cardsight.ai) - no credit card required! You'll get instant access to:
- Card identification from images
- Full catalog search and browsing
- AI-powered natural language search
- Collection management features

### Installation

```bash
npm install cardsightai
```

## Quick Start

```typescript
import { init } from 'cardsightai';

// Initialize the client
const client = init({
  apiKey: 'your_api_key_here' // or set CARDSIGHTAI_API_KEY env variable
});

// Test your connection
const health = await client.health.checkAuth();
console.log('API Status:', health.data);

// Identify a card from an image
const imageFile = // ... your image File, Blob, or Buffer
const result = await client.identify.card(imageFile);
console.log('Identified Card:', result.data);
```

## Authentication

The SDK requires an API key for authentication. You can provide it in two ways:

### Option 1: Environment Variable (Recommended)

```bash
export CARDSIGHTAI_API_KEY=your_api_key_here
```

Then initialize without parameters:

```typescript
import { init } from 'cardsightai';
const client = init();
```

### Option 2: Direct Configuration

```typescript
import { init } from 'cardsightai';

const client = init({
  apiKey: 'your_api_key_here'
});
```

## Usage Examples

### Card Identification

```typescript
// From a File object (browser)
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const result = await client.identify.card(file);

// From a Buffer (Node.js)
import { readFileSync } from 'fs';
const imageBuffer = readFileSync('path/to/card.jpg');
const result = await client.identify.card(imageBuffer);

// From a Blob
const blob = await fetch(imageUrl).then(r => r.blob());
const result = await client.identify.card(blob);
```

### Catalog Operations

```typescript
// Search for cards
const cards = await client.catalog.cards.list({
  year: 2023,
  manufacturer: 'Topps',
  player: 'Aaron Judge',
  limit: 10
});

// Get a specific card
const card = await client.catalog.cards.get('card_id_here');

// Get sets
const sets = await client.catalog.sets.list({
  year: 2023,
  manufacturer: 'Topps'
});

// Get cards in a set
const setCards = await client.catalog.sets.cards('set_id_here');
```

### Collection Management

```typescript
// List your collections
const collections = await client.collections.list();

// Create a new collection
const newCollection = await client.collections.create({
  name: 'My Vintage Cards',
  description: 'Pre-1980 baseball cards',
  isPublic: false
});

// Add a card to collection
await client.collections.cards.add('collection_id', {
  cardId: 'card_id',
  quantity: 1,
  condition: 'NM',
  purchasePrice: 50.00,
  notes: 'Purchased at card show'
});

// Get collection analytics
const analytics = await client.collections.analytics('collection_id');
console.log('Collection Value:', analytics.data.totalValue);
```

### AI-Powered Search

```typescript
// Natural language card search
const results = await client.ai.query(
  'Show me all Mike Trout rookie cards from 2011'
);

// Complex queries
const results = await client.ai.query(
  'What are the most valuable baseball cards from the 1990s?'
);
```

### Autocomplete for Search

```typescript
// Autocomplete player names
const players = await client.autocomplete.cards('Aaron J');

// Autocomplete set names
const sets = await client.autocomplete.sets('2023 Top');

// Autocomplete manufacturers
const manufacturers = await client.autocomplete.manufacturers('Pan');
```

### Error Handling

```typescript
import { CardSightAIError, AuthenticationError } from 'cardsightai';

try {
  const result = await client.catalog.cards.get('invalid_id');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof CardSightAIError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Response:', error.response);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Advanced Configuration

```typescript
const client = init({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.cardsight.ai', // Custom API endpoint (default)
  timeout: 60000, // Request timeout in ms (default: 30000)
  headers: {
    'X-Custom-Header': 'value' // Additional headers
  }
});
```

## TypeScript Support

The SDK is written in TypeScript and provides complete type definitions:

```typescript
import {
  CardSightAI,
  CardSightAIConfig,
  CardSightAIError,
  type Card,
  type Collection,
  type paths
} from 'cardsightai';

// All responses are fully typed
const cards = await client.catalog.cards.list();
// cards.data is typed based on the OpenAPI schema

// Access generated types directly
import type { paths } from 'cardsightai';
type CardResponse = paths['/v1/catalog/cards/{id}']['get']['responses']['200']['content']['application/json'];
```

## Direct API Access

For advanced use cases, you can access the underlying OpenAPI client:

```typescript
// Use the raw OpenAPI client
const response = await client.raw.GET('/v1/catalog/cards/{id}', {
  params: {
    path: { id: 'card_123' },
    query: { includePrice: true }
  }
});

// Full control over requests
const response = await client.raw.POST('/v1/custom/endpoint', {
  body: { custom: 'data' },
  headers: { 'X-Custom': 'header' }
});
```

## API Endpoints

The SDK provides convenient methods for all CardSightAI API endpoints:

- **Health**: `health.check()`, `health.checkAuth()`
- **Identification**: `identify.card()`
- **Catalog**: `catalog.cards`, `catalog.sets`, `catalog.releases`, `catalog.manufacturers`
- **Collections**: Full CRUD operations for collections and cards
- **AI Search**: `ai.query()`
- **Autocomplete**: Search suggestions for all entity types
- **Feedback**: Submit feedback for cards and identifications

## Requirements

- Node.js 20.0 or higher
- API key from [CardSight AI](https://cardsight.ai) (free, no credit card required)

## Testing

Run integration tests with your API key:

```bash
CARDSIGHTAI_API_KEY=YOUR_API_KEY npm run test:integration
```

See [test/README.md](test/README.md) for detailed testing documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For support, please contact support@cardsight.ai or visit our [documentation](https://api.cardsight.ai/documentation)
