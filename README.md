# CardSight AI Node.js SDK

![NPM Version](https://img.shields.io/npm/v/cardsightai)
![Node LTS](https://img.shields.io/node/v-lts/cardsightai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript SDK for the CardSight AI REST API - The most comprehensive baseball card identification and collection management platform.

## 📋 Quick Reference

| Feature | Description | Primary Methods |
|---------|-------------|-----------------|
| **Card Identification** | Identify cards from images using AI | `identify.card()` |
| **Catalog Search** | Search 2M+ baseball cards database | `catalog.cards.list()`, `catalog.sets.list()` |
| **Collections** | Manage owned card collections | `collections.create()`, `.cards.add()`, `.analytics()` |
| **Lists** | Track wanted cards (wishlists) | `lists.create()`, `.cards.add()` |
| **Binders** | Organize collection subsets | `collections.binders.create()`, `.cards.add()` |
| **Grading** | PSA, BGS, SGC grade information | `grades.companies.list()`, `.types()`, `.grades()` |
| **AI Search** | Natural language queries | `ai.query()` |
| **Autocomplete** | Search suggestions | `autocomplete.cards()`, `.sets()`, `.manufacturers()` |
| **Images** | Card image retrieval | `images.getCard()` |
| **Analytics** | Collection insights | `collections.analytics()`, `.breakdown()` |

## 🚀 Features

- **Full TypeScript Support** - Complete type safety with auto-generated types from [OpenAPI spec](https://api.cardsight.ai/documentation/json)
- **Built-in Authentication** - Automatic API key handling via environment variable or config
- **Modern Architecture** - Uses native fetch API (Node.js 20+) with minimal dependencies
- **Dual Module Support** - Works seamlessly with both CommonJS and ESM
- **Comprehensive Error Handling** - Detailed error messages with status codes and responses
- **100% API Coverage** - All CardSight AI endpoints are fully implemented
- **Type-Safe Parameters** - Full IntelliSense support for all API parameters
- **Auto-Generated Types** - Types are generated directly from the live API specification

## Getting Started

### Get Your Free API Key

Sign up for a **free API key** at [https://cardsight.ai](https://cardsight.ai) - no credit card required! You'll get instant access to:
- Card identification from images
- Full catalog search and browsing
- AI-powered natural language search
- Collection management features

### Installation

Using npm:
```bash
npm install cardsightai
```

Using yarn:
```bash
yarn add cardsightai
```

Using pnpm:
```bash
pnpm add cardsightai
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

## 📚 Complete API Reference

The SDK provides full coverage of all CardSight AI endpoints, organized into logical groups:

### 🏥 Health & Status
```typescript
// Check API status
await client.health.check();

// Verify authentication
await client.health.checkAuth();
```

### 🔍 Card Identification
```typescript
// Identify a card from an image
const result = await client.identify.card(imageFile, {
  returnList: true  // Include similar cards in response
});
```

### 📖 Catalog Operations

#### Cards
```typescript
// Search cards with filters
const cards = await client.catalog.cards.list({
  year: '2023',
  manufacturer: 'Topps',
  player: 'Aaron Judge',
  sort: 'name',
  order: 'asc',
  take: 20
});

// Get specific card details
const card = await client.catalog.cards.get('card_id');
```

#### Sets
```typescript
// List sets
const sets = await client.catalog.sets.list({
  year: '2023',
  manufacturer: 'Topps'
});

// Get set details
const set = await client.catalog.sets.get('set_id');

// Get cards in a set
const setCards = await client.catalog.sets.cards('set_id');
```

#### Other Catalog Data
```typescript
// Releases
const releases = await client.catalog.releases.list();
const release = await client.catalog.releases.get('release_id');

// Manufacturers
const manufacturers = await client.catalog.manufacturers();

// Segments
const segments = await client.catalog.segments();

// Parallels
const parallels = await client.catalog.parallels();

// Attributes
const attributes = await client.catalog.attributes.list();
```

### 🗃️ Collections Management

#### Collection CRUD
```typescript
// List collections
const collections = await client.collections.list({
  name: 'vintage',
  collectorId: 'collector_uuid'
});

// Create collection
const newCollection = await client.collections.create({
  collectorId: 'collector_uuid',
  name: 'My Vintage Cards',
  description: 'Pre-1980 baseball cards'
});

// Update collection
await client.collections.update('collection_id', {
  name: 'Updated Name',
  description: 'Updated description'
});

// Delete collection
await client.collections.delete('collection_id');
```

#### Collection Cards
```typescript
// Add card to collection
await client.collections.cards.add('collection_id', {
  cardId: 'card_uuid',
  parallelId: 'parallel_uuid',  // optional
  gradeId: 'grade_uuid',         // optional
  quantity: 1,
  buyPrice: '50.00',
  buyDate: '2024-01-15'
});

// Update card in collection
await client.collections.cards.update('collection_id', 'card_id', {
  quantity: 2,
  sellPrice: '100.00'
});

// Remove card from collection
await client.collections.cards.delete('collection_id', 'card_id');
```

#### Collection Binders (v1.1.1+)
```typescript
// Create binder
await client.collections.binders.create('collection_id', {
  name: 'For Sale',
  description: 'Cards available for sale'
});

// List binders
const binders = await client.collections.binders.list('collection_id');

// Add card to binder
await client.collections.binders.cards.add('collection_id', 'binder_id', {
  collectionCardId: 'collection_card_uuid'
});

// Remove from binder
await client.collections.binders.cards.delete('collection_id', 'binder_id', 'card_id');
```

#### Collection Analytics
```typescript
// Get collection analytics
const analytics = await client.collections.analytics('collection_id');

// Get collection breakdown
const breakdown = await client.collections.breakdown('collection_id', {
  groupBy: 'release'  // Required: 'release', 'year', 'grade', 'player', or 'manufacturer'
});

// Track set progress
const progress = await client.collections.setProgress.list('collection_id');
```

### 📝 Lists Management (Want Lists, Wishlists) - v1.1.4+

```typescript
// Create a want list
const list = await client.lists.create({
  collectorId: 'collector_uuid',
  name: 'My Want List',
  description: 'Cards I want to acquire'
});

// Update list
await client.lists.update('list_id', {
  name: 'Updated Want List'
});

// Add cards to list (single or batch)
await client.lists.cards.add('list_id', {
  cardId: 'card_uuid'
});

// Batch add
await client.lists.cards.add('list_id', [
  { cardId: 'card1' },
  { cardId: 'card2' }
]);

// Remove card from list
await client.lists.cards.delete('list_id', 'card_id');

// Delete entire list
await client.lists.delete('list_id');
```

### 👥 Collectors Management

```typescript
// List collectors
const collectors = await client.collectors.list();

// Create collector with optional name
const collector = await client.collectors.create({
  name: 'Eric'  // Optional: Name of the collector (e.g., "Mike", "Eric")
});

// Get a specific collector
const collectorDetails = await client.collectors.get('collector_id');

// Update collector name
await client.collectors.update('collector_id', {
  name: 'Mike'  // Optional: Update the collector's name
});

// Delete collector (also deletes associated collections)
await client.collectors.delete('collector_id');
```

### 🏆 Grading Information (v1.0.5+)

```typescript
// List grading companies (PSA, BGS, SGC, etc.)
const companies = await client.grades.companies.list();

// Get grading types for a company
const types = await client.grades.companies.types('company_id');

// Get specific grades (1-10 with half grades)
const grades = await client.grades.companies.grades('company_id', 'type_id');
```

### 🖼️ Images

```typescript
// Get card image
const image = await client.images.getCard('card_id', {
  format: 'raw'  // 'raw' (default, returns JPEG) or 'json' (returns metadata)
});
```

### 🤖 AI-Powered Features

```typescript
// Natural language query
const results = await client.ai.query({
  query: 'Show me all Mike Trout rookie cards from 2011',
  context: {
    collectionId: 'optional_collection_id'
  }
});
```

### 🔎 Autocomplete

```typescript
// Get search suggestions
const cardSuggestions = await client.autocomplete.cards('Aaron J');
const setSuggestions = await client.autocomplete.sets('2023 Top');
const manufacturerSuggestions = await client.autocomplete.manufacturers('Pan');
const releaseSuggestions = await client.autocomplete.releases('Chrome');
const segmentSuggestions = await client.autocomplete.segments('Base');
const yearSuggestions = await client.autocomplete.years('202');
```

### 💬 Feedback

```typescript
// Submit general feedback
await client.feedback.general({
  message: 'Great service!',
  rating: 5
});

// Submit card-specific feedback
await client.feedback.card('card_id', {
  message: 'Price seems incorrect',
  suggestedPrice: '25.00'
});

// Submit identification feedback
await client.feedback.identify('identification_id', {
  correct: false,
  suggestedCardId: 'correct_card_id'
});
```

### 💳 Subscription

```typescript
// Get subscription details
const subscription = await client.subscription.get();

```

## 🤖 For AI Agents & LLMs

This SDK is optimized for AI agent integration. When using this SDK:

1. **Authentication**: Set `CARDSIGHTAI_API_KEY` environment variable or pass `apiKey` in config
2. **Type Safety**: All methods are fully typed - TypeScript will catch parameter errors
3. **Error Handling**: All methods return typed responses with error details
4. **Pagination**: Use `take` and `skip` parameters for paginated endpoints
5. **Filtering**: Most list endpoints support filtering by name, ID, date ranges, etc.
6. **Batch Operations**: Lists and some collection endpoints support batch operations

### Common Patterns

```typescript
// Initialize once
const client = init({ apiKey: process.env.CARDSIGHTAI_API_KEY });

// All methods return { data, error, response } structure
const { data, error } = await client.catalog.cards.list();

if (error) {
  console.error('Error:', error.message, 'Status:', error.status);
} else {
  console.log('Cards:', data.cards);
}

// Pagination pattern
let skip = 0;
const take = 100;
let hasMore = true;

while (hasMore) {
  const { data } = await client.catalog.cards.list({ take, skip });
  // Process data.cards
  skip += take;
  hasMore = data.cards.length === take;
}
```

## ⚙️ Requirements

- **Node.js**: 20.0 or higher
- **API Key**: Get free at [cardsight.ai](https://cardsight.ai) (no credit card required)
- **TypeScript**: 5.0+ (optional, for TypeScript projects)

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

## 📦 Version History

For detailed version history and release notes, see [CHANGELOG.md](CHANGELOG.md).

## 🔗 Resources & Support

### Documentation
- **API Documentation**: [api.cardsight.ai/documentation](https://api.cardsight.ai/documentation)
- **OpenAPI Specification**: [api.cardsight.ai/documentation/json](https://api.cardsight.ai/documentation/json)
- **SDK Source**: [GitHub Repository](https://github.com/cardsightai/cardsightai-node-sdk)

### Support
- **Email**: support@cardsight.ai
- **Issues**: [GitHub Issues](https://github.com/cardsightai/cardsightai-node-sdk/issues)
- **Website**: [cardsight.ai](https://cardsight.ai)
