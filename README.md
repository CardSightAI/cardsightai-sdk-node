# CardSight AI Node.js SDK

![NPM Version](https://img.shields.io/npm/v/cardsightai)
![Node LTS](https://img.shields.io/node/v-lts/cardsightai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Official TypeScript/JavaScript SDK for [CardSight AI](https://cardsight.ai) REST API**

The most comprehensive baseball card identification and collection management platform.
**2M+ Cards** • **AI-Powered Recognition** • **Free Tier Available**

**Quick Links:** [Getting Started](#getting-started) • [Installation](#installation) • [Examples](#usage-examples) • [API Documentation](https://api.cardsight.ai/documentation) • [Support](#support)

---

## Features

- **Full TypeScript Support** - Complete type safety with auto-generated types from OpenAPI
- **Multi-Card Detection** - Identify multiple cards in a single image with confidence scores
- **Universal Compatibility** - Works in Node.js, browsers, and edge runtimes
- **Dual Module System** - Supports both ESM and CommonJS
- **Smart Error Handling** - Detailed error types with retry capabilities
- **Minimal Dependencies** - Only one runtime dependency (openapi-fetch)
- **100% API Coverage** - All CardSight AI endpoints fully implemented

## Key Capabilities

| Feature | Description | Primary Methods |
|---------|-------------|-----------------|
| **Card Identification** | Identify multiple cards from images using AI | `identify.card()` |
| **Catalog Search** | Search 2M+ baseball cards database | `catalog.cards.list()`, `catalog.sets.list()` |
| **Random Catalog** | Pack opening simulations with parallel odds | `catalog.random.cards()`, `catalog.random.sets()` |
| **Collections** | Manage owned card collections with analytics | `collections.create()`, `collections.cards.add()` |
| **Collectors** | Manage collector profiles with names | `collectors.create()`, `collectors.update()` |
| **Lists** | Track wanted cards (wishlists) | `lists.create()`, `lists.cards.add()` |
| **Binders** | Organize collection subsets | `collections.binders.create()` |
| **Grading** | PSA, BGS, SGC grade information | `grades.companies.list()` |
| **AI Search** | Natural language queries | `ai.query()` |
| **Autocomplete** | Search suggestions for all entities | `autocomplete.cards()` |

## Requirements

- Node.js 20.0+ (uses native fetch)
- TypeScript 5.0+ (optional, for TypeScript projects)
- API Key from [cardsight.ai](https://cardsight.ai) (free tier available)

## Installation

```bash
# npm
npm install cardsightai

# yarn
yarn add cardsightai

# pnpm
pnpm add cardsightai
```

## Getting Started

### Get Your Free API Key

Get started in minutes with a **free API key** from [cardsight.ai](https://cardsight.ai) - no credit card required!

### Quick Start (< 5 minutes)

```javascript
import { CardSightAI } from 'cardsightai';

// 1. Initialize the client
const client = new CardSightAI({ apiKey: 'your_api_key_here' });

// 2. Identify a card from an image
const imageFile = // ... File, Blob, Buffer, or ArrayBuffer
const result = await client.identify.card(imageFile);

// 3. Access the identification results
if (result.data?.success) {
  // The API can detect multiple cards in a single image
  const detection = result.data.detections?.[0]; // Get best match
  if (detection?.card) {
    console.log(`Card: ${detection.card.name}`);
    console.log(`Confidence: ${detection.confidence}`); // "High", "Medium", or "Low"
    console.log(`Total cards detected: ${result.data.detections.length}`);
  }
}
```

That's it! The SDK handles all API communication, type safety, and error handling automatically.

## Usage Examples

### Card Identification

The identification endpoint uses AI to detect baseball cards in images. It can identify multiple cards in a single image and returns confidence levels for each detection.

```typescript
import { CardSightAI } from 'cardsightai';
import { readFileSync } from 'fs';

const client = new CardSightAI({ apiKey: 'your_api_key' });

// From a File object (browser)
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const result = await client.identify.card(file);

// From a Buffer (Node.js)
const imageBuffer = readFileSync('path/to/card.jpg');
const result = await client.identify.card(imageBuffer);

// From a Blob (browser/fetch)
const blob = await fetch(imageUrl).then(r => r.blob());
const result = await client.identify.card(blob);

// Process the results
if (result.data?.success && result.data.detections) {
  // Check if any cards were detected
  if (result.data.detections.length === 0) {
    console.log('No cards detected in image');
    return;
  }

  // Process all detected cards
  console.log(`Detected ${result.data.detections.length} card(s)`);

  for (const detection of result.data.detections) {
    console.log(`\nConfidence: ${detection.confidence}`);

    if (detection.card) {
      console.log(`  Name: ${detection.card.name}`);
      console.log(`  Year: ${detection.card.year}`);
      console.log(`  Manufacturer: ${detection.card.manufacturer}`);
      console.log(`  Set: ${detection.card.setName || detection.card.releaseName}`);
      console.log(`  Number: ${detection.card.number || 'N/A'}`);
      console.log(`  Card ID: ${detection.card.id}`);
    }
  }

  // Access request metadata
  console.log(`\nRequest ID: ${result.data.requestId}`);
  console.log(`Processing time: ${result.data.processingTime}ms`);
}
```

#### Response Structure

```typescript
// Single card detected
{
  success: true,
  requestId: "req_abc123",
  detections: [
    {
      confidence: "High",  // Confidence level: "High", "Medium", or "Low"
      card: {
        id: "cd4e3a2f-8b9d-4c7e-a1b2-3d4e5f6g7h8i",
        year: "2023",
        manufacturer: "Topps",
        releaseName: "Series 1",
        setName: "Base Set",
        name: "Mike Trout",
        number: "27"
      }
    }
  ],
  processingTime: 1250  // Time in milliseconds
}

// Multiple cards detected - the API returns all detected cards
{
  success: true,
  requestId: "req_xyz789",
  detections: [
    {
      confidence: "High",
      card: { /* Aaron Judge card details */ }
    },
    {
      confidence: "Medium",
      card: { /* Shohei Ohtani card details */ }
    }
  ],
  processingTime: 1500
}

// No cards detected - empty detections array
{
  success: true,
  requestId: "req_def456",
  detections: [],
  processingTime: 800
}
```

### Working with Identification Results

The SDK provides utility functions to simplify working with multi-card detection results:

```typescript
import {
  getHighestConfidenceDetection,
  filterByConfidence,
  getDetectedCards,
  hasDetections,
  formatCardDisplay
} from 'cardsightai';

const result = await client.identify.card(imageFile);

// Get the highest confidence detection (best match)
const bestMatch = getHighestConfidenceDetection(result.data);
if (bestMatch?.card) {
  console.log('Best match:', formatCardDisplay(bestMatch.card));
  // Output: "2023 Topps Series 1 Base Set Mike Trout #27"
}

// Filter by confidence level
const highConfidenceOnly = filterByConfidence(result.data, 'High');
const mediumAndAbove = filterByConfidence(result.data, 'Medium');

// Get all card objects (excludes empty detections)
const cards = getDetectedCards(result.data);
cards.forEach(card => {
  console.log(`- ${formatCardDisplay(card)}`);
});

// Check if any cards were detected
if (hasDetections(result.data)) {
  console.log(`Found ${result.data.detections.length} card(s)`);
}
```

### Catalog Operations

Search and retrieve cards, sets, releases, and other catalog data:

```typescript
// Search for specific cards
const cards = await client.catalog.cards.list({
  year: 2023,
  manufacturer: 'Topps',
  player: 'Aaron Judge',
  take: 10,  // Limit results
  skip: 0    // Pagination offset
});

// Get a specific card by ID
const card = await client.catalog.cards.get('card_uuid');

// Search sets
const sets = await client.catalog.sets.list({
  year: 2023,
  manufacturer: 'Topps',
  take: 20
});

// Get cards in a specific set
const setCards = await client.catalog.sets.cards('set_uuid');

// Search releases (product lines like "Chrome", "Series 1")
const releases = await client.catalog.releases.list({
  name: 'Chrome',
  yearFrom: 2020,
  yearTo: 2024
});

// Get manufacturers
const manufacturers = await client.catalog.manufacturers.list();

// Get segments (Baseball, Football, etc.)
const segments = await client.catalog.segments.list();

// Get all parallels/variations
const parallels = await client.catalog.parallels.list();

// Get catalog statistics
const stats = await client.catalog.statistics.get();
console.log(`Total cards: ${stats.data?.totalCards}`);
console.log(`Total sets: ${stats.data?.totalSets}`);
```

### Random Catalog (Pack Opening & Discovery)

The random endpoints enable pack opening simulations and discovery features by returning random results instead of paginated sorted results:

```typescript
// Pack opening simulation - Get 10 random cards from a set with parallel odds
const pack = await client.catalog.random.cards({
  setId: 'set_uuid',
  count: 10,
  includeParallels: true  // Enable parallel conversion odds
});

// Process the pack
if (pack.data?.cards) {
  pack.data.cards.forEach(card => {
    if (card.isParallel) {
      console.log(`🌟 PARALLEL: ${card.name} - ${card.parallelName}`);
      if (card.numberedTo) {
        console.log(`   Numbered to ${card.numberedTo}!`);
      }
    } else {
      console.log(`Base: ${card.name} #${card.number}`);
    }
  });
}

// Discovery feature - Get 5 random releases from 2023
const randomReleases = await client.catalog.random.releases({
  count: 5,
  year: 2023
});

// Get random sets from a specific release
const randomSets = await client.catalog.random.sets({
  releaseId: 'release_uuid',
  count: 6
});

// Player collection building - Get random player cards
const randomPlayerCards = await client.catalog.random.cards({
  playerName: 'Mike Trout',
  count: 3
});

// Random cards with filters (no parallels)
const randomCards = await client.catalog.random.cards({
  year: 2024,
  manufacturerId: 'manufacturer_uuid',
  count: 20
});
```

#### Parallel Odds System

When `includeParallels: true` is set on `catalog.random.cards()`, each card has a weighted probability of converting to a parallel variant:

1. **Numbered Parallels** (e.g., /1, /10, /50): Individual rolls with boosted odds, rarest to most common
2. **Unlimited Parallels** (e.g., Refractor, Rainbow): One collective roll, then random selection if successful
3. **Base Cards**: Returned if no parallel rolls succeed

Parallel cards include additional fields:
- `isParallel: true`
- `parallelId: string` - UUID of the parallel
- `parallelName: string` - Name like "Gold Refractor"
- `numberedTo: number | null` - Serial number limit (e.g., 50 for /50)

**Note**: `setId` and `releaseId` are mutually exclusive on the cards endpoint.

### Collection Management

Manage personal card collections with full CRUD operations:

```typescript
// Create a new collection
const collection = await client.collections.create({
  name: 'My Vintage Cards',
  description: 'Pre-1980 baseball cards',
  isPublic: false,
  collectorId: 'collector_uuid'  // Required: links to a collector profile
});

// Add cards to collection with detailed information
await client.collections.cards.add({
  collectionId: collection.data.id,
  cards: [{
    cardId: 'card_uuid',
    quantity: 1,
    buyPrice: '50.00',    // Store purchase price
    buyDate: '2024-01-15', // Track purchase date
    gradeId: 'grade_uuid', // Optional: PSA 10, BGS 9.5, etc.
    condition: 'NM',       // Near Mint, Excellent, etc.
    notes: 'Pulled from pack'
  }]
});

// Update collection card (e.g., after selling)
await client.collections.cards.update(
  'collection_uuid',
  'card_uuid',
  {
    sellPrice: '150.00',
    soldDate: '2024-10-01'
  }
);

// Get collection analytics
const analytics = await client.collections.analytics('collection_uuid');
console.log(`Total cards: ${analytics.data?.totalCards}`);
console.log(`Total value: ${analytics.data?.totalValue}`);
console.log(`Total spent: ${analytics.data?.totalSpent}`);

// Get collection breakdown by various categories
const breakdown = await client.collections.breakdown({
  collectionId: 'collection_uuid',
  groupBy: 'year'  // Options: 'year', 'manufacturer', 'set', 'grade'
});

// List all collections for a collector
const collections = await client.collections.list({
  collectorId: 'collector_uuid',
  take: 10
});
```

### Binders (Collection Organization)

Organize collections into binders (subsets):

```typescript
// Create a binder within a collection
const binder = await client.collections.binders.create(
  'collection_uuid',
  {
    name: 'Hall of Famers',
    description: 'Cards of HOF players'
  }
);

// Add collection cards to binder
await client.collections.binders.cards.add(
  'collection_uuid',
  'binder_uuid',
  {
    collectionCardIds: ['card1_uuid', 'card2_uuid']
  }
);

// List cards in a binder
const binderCards = await client.collections.binders.cards.list(
  'collection_uuid',
  'binder_uuid'
);
```

### Lists (Want Lists / Wishlists)

Track cards you want to acquire:

```typescript
// Create a want list
const list = await client.lists.create({
  name: 'Rookies to Find',
  description: '2024 rookie cards I need'
});

// Add cards to the list
await client.lists.cards.add('list_uuid', {
  cards: [
    { cardId: 'card_uuid_1' },
    { cardId: 'card_uuid_2' }
  ]
});

// Get all cards in a list
const listCards = await client.lists.cards.list('list_uuid');

// Remove card from list when acquired
await client.lists.cards.delete('list_uuid', 'card_uuid');
```

### Grading Information

Access grading company data and grade values:

```typescript
// Get all grading companies (PSA, BGS, SGC, etc.)
const companies = await client.grades.companies.list();

// Get grading types for a company (e.g., PSA Regular, PSA DNA)
const types = await client.grades.companies.types('PSA');

// Get specific grades for a grading type
const grades = await client.grades.companies.grades('PSA', 'psa_regular');
// Returns grades like 10, 9, 8, with half grades where applicable
```

### AI-Powered Search

Use natural language to search the catalog:

```typescript
// Ask questions in natural language
const response = await client.ai.query({
  query: 'Show me Mike Trout rookie cards worth over $100',
  maxResults: 10
});

// The AI understands context and intent
const response2 = await client.ai.query({
  query: 'What are the most valuable cards from 2023 Topps Chrome?'
});
```

### Autocomplete

Provide search suggestions for users:

```typescript
// Get card name suggestions
const suggestions = await client.autocomplete.cards({
  query: 'aaron',  // User typed "aaron"
  take: 5
});
// Returns: ["Aaron Judge", "Hank Aaron", "Aaron Nola", ...]

// Autocomplete for other entities
const sets = await client.autocomplete.sets({ query: 'chrome' });
const manufacturers = await client.autocomplete.manufacturers({ query: 'top' });
const releases = await client.autocomplete.releases({ query: 'series' });
const segments = await client.autocomplete.segments({ query: 'base' });
const parallels = await client.autocomplete.parallels({ query: 'ref' });
```

### Image Retrieval

Get card images directly:

```typescript
// Get card image (returns binary data by default)
const imageData = await client.images.getCard('card_uuid');

// Get image as base64 JSON
const imageJson = await client.images.getCard('card_uuid', { format: 'json' });

// Get collection card images
const collectionImage = await client.collections.cards.getImage(
  'collection_uuid',
  'card_uuid'
);

// Get thumbnail
const thumbnail = await client.collections.cards.getThumbnail(
  'collection_uuid',
  'card_uuid'
);
```

### Feedback System

Submit feedback to improve the platform:

```typescript
// Report identification issues
await client.feedback.identify('identification_request_id', {
  correct: false,
  suggestedCardId: 'correct_card_uuid',
  comments: 'Wrong year detected'
});

// Submit general feedback
await client.feedback.general({
  type: 'bug',  // 'bug', 'feature', 'improvement', 'other'
  title: 'Search not finding parallel cards',
  description: 'Detailed description here...',
  email: 'user@example.com'  // Optional
});

// Report issues with specific entities
await client.feedback.card('card_uuid', {
  type: 'incorrect',  // 'incorrect', 'missing', 'duplicate', 'other'
  description: 'Player name is misspelled',
  suggestedCorrection: 'Correct spelling here'
});
```

## TypeScript Support

The SDK provides complete TypeScript support with auto-generated types:

```typescript
import {
  CardSightAI,
  CardSightAIError,
  IdentifyResult,
  CardDetection,
  DetectedCard,
  Card,
  Set,
  Collection
} from 'cardsightai';

// All methods are fully typed
const client = new CardSightAI({ apiKey: 'key' });

// TypeScript knows the exact shape of responses
const result = await client.catalog.cards.get('id');
if (result.data) {
  // TypeScript knows all available fields
  console.log(result.data.name);
  console.log(result.data.year);
  console.log(result.data.manufacturer);
}

// Use types in your functions
function processDetection(detection: CardDetection): void {
  if (detection.confidence === 'High' && detection.card) {
    console.log(`High confidence: ${detection.card.name}`);
  }
}
```

## Error Handling

The SDK provides detailed error information:

```typescript
import { CardSightAIError, AuthenticationError } from 'cardsightai';

try {
  const result = await client.identify.card(imageFile);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof CardSightAIError) {
    console.error(`API Error ${error.status}: ${error.message}`);

    // Access detailed error information
    console.error('Request ID:', error.requestId);
    console.error('Response:', error.response);

    // Some errors are retryable
    if (error.status === 503) {
      // Service temporarily unavailable, retry later
    }
  }
}
```

## Configuration

```typescript
import { CardSightAI } from 'cardsightai';

// Basic configuration
const client = new CardSightAI({
  apiKey: 'your_api_key'  // Required
});

// Advanced configuration
const client = new CardSightAI({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.cardsight.ai',  // Custom API endpoint
  timeout: 30000,  // Request timeout in milliseconds
  headers: {  // Additional headers
    'X-Custom-Header': 'value'
  }
});

// Using environment variables
// Set CARDSIGHTAI_API_KEY in your environment
const client = new CardSightAI();  // Automatically uses env variable
```

## Environment Variables

The SDK supports the following environment variables:

```bash
CARDSIGHTAI_API_KEY=your_api_key_here  # API key for authentication
```

## API Endpoint Coverage

The SDK provides 100% coverage of all CardSight AI REST API endpoints:

| Category | Endpoints | SDK Methods |
|----------|-----------|------------|
| **Health** | 2 | `health.check()`, `health.checkAuth()` |
| **Identification** | 1 | `identify.card()` |
| **Catalog** | 17 | `catalog.cards.*`, `catalog.sets.*`, `catalog.releases.*`, `catalog.random.*` |
| **Collections** | 23 | `collections.*`, `collections.cards.*`, `collections.binders.*` |
| **Collectors** | 5 | `collectors.*` |
| **Lists** | 8 | `lists.*`, `lists.cards.*` |
| **Grades** | 3 | `grades.companies.*` |
| **Autocomplete** | 6 | `autocomplete.*` |
| **AI** | 1 | `ai.query()` |
| **Images** | 3 | `images.*`, `collections.cards.getImage()` |
| **Feedback** | 8 | `feedback.*` |
| **Subscription** | 1 | `subscription.get()` |

## Building from Source

```bash
# Clone the repository
git clone https://github.com/cardsightai/cardsightai-sdk-node.git
cd cardsightai-sdk-node

# Install dependencies
npm install

# Generate types from OpenAPI spec
npm run generate

# Build the SDK
npm run build

# Run tests
npm test
```

## Testing

```bash
# Run unit tests
npm test

# Run integration tests (requires API key)
export CARDSIGHTAI_API_KEY=your_api_key
npm run test:integration
```

## Browser Support

The SDK works in modern browsers with native fetch support:

```html
<!-- Use via CDN -->
<script type="module">
  import { CardSightAI } from 'https://cdn.jsdelivr.net/npm/cardsightai/+esm';

  const client = new CardSightAI({ apiKey: 'your_api_key' });
  // Use the client...
</script>
```

## Edge Runtime Support

The SDK is compatible with edge runtimes like Cloudflare Workers and Vercel Edge Functions:

```typescript
// Cloudflare Worker example
export default {
  async fetch(request: Request) {
    const client = new CardSightAI({ apiKey: 'your_api_key' });

    // Process request...
    const result = await client.catalog.cards.list({ take: 10 });

    return Response.json(result);
  }
};
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

## Support

- **Email**: support@cardsight.ai
- **Website**: [cardsight.ai](https://cardsight.ai)
- **API Documentation**: [api.cardsight.ai/documentation](https://api.cardsight.ai/documentation)
- **Issues**: [GitHub Issues](https://github.com/cardsightai/cardsightai-sdk-node/issues)

---

*Built with ❤️ by CardSight AI*