# CardSight AI Node.js SDK

![NPM Version](https://img.shields.io/npm/v/cardsightai)
![Node LTS](https://img.shields.io/node/v-lts/cardsightai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Official TypeScript/JavaScript SDK for [CardSight AI](https://cardsight.ai) REST API**

The most comprehensive baseball card identification and collection management platform.
**14M+ Trading Cards** • **8,250+ Identifiable Sets** • **AI-Powered Recognition** • **Free Tier Available**

**Quick Links:** [Getting Started](#getting-started) • [Installation](#installation) • [Examples](#usage-examples) • [API Documentation](https://api.cardsight.ai/documentation) • [Support](#support)

---

## Features

- **Full TypeScript Support** - Complete type safety with auto-generated types from OpenAPI
- **Multi-Card Detection** - Identify multiple cards in a single image with confidence scores
- **Parallel Identification (beta)** - Ranked parallel variant candidates with per-entry confidence tiers, launched for baseball
- **Flexible Metadata via Fields** - Search and surface arbitrary card properties (HP, Rarity, Artist, Mana Cost, etc.) across any trading card game
- **Universal Compatibility** - Works in Node.js, browsers, and edge runtimes
- **Dual Module System** - Supports both ESM and CommonJS
- **Smart Error Handling** - Typed errors carrying the HTTP status, response body, and request context
- **Minimal Dependencies** - Only one runtime dependency (openapi-fetch)
- **100% API Coverage** - All CardSight AI endpoints fully implemented

## Key Capabilities

| Feature | Description | Primary Methods |
|---------|-------------|-----------------|
| **Card Identification** | Identify multiple cards from images using AI; free pre-flight set identifiability lookups | `identify.card()`, `identify.cardBySegment()`, `identify.sets.list()`, `identify.sets.check()` |
| **Card Detection** | Check if trading cards are present in an image | `detect.card()` |
| **Catalog Search** | Fuzzy search across cards, sets, releases, parallels | `catalog.search()`, `catalog.cards.list()` |
| **Random Catalog** | Pack opening simulations with parallel odds | `catalog.random.cards()`, `catalog.random.sets()` |
| **Collections** | Manage owned card collections with analytics | `collections.create()`, `collections.cards.add()` |
| **Collectors** | Manage collector profiles with names | `collectors.create()`, `collectors.update()` |
| **Lists** | Track wanted cards (wishlists) | `lists.create()`, `lists.cards.add()` |
| **Binders** | Organize collection subsets | `collections.binders.create()` |
| **Pricing** | Completed sales data for cards; candlestick price time series; free-text title search | `pricing.get()`, `pricing.bulk()`, `pricing.timeseries()`, `pricing.search()` |
| **Marketplace** | Active marketplace listings for cards; free-text title search | `marketplace.get()`, `marketplace.search()` |
| **Population Reports** | Graded population counts by card, set, or release | `population.card()`, `population.set()`, `population.release()` |
| **Grading** | PSA, TAG, BGS, SGC grade information | `grades.companies.list()` |
| **AI Search** | Natural language queries | `ai.query()` |
| **Autocomplete** | Search suggestions for all entities | `autocomplete.cards()` |
| **Field Catalog** | Browse flexible metadata fields (Artist, HP, Rarity, etc.) with usage counts — powers cross-TCG metadata search | `catalog.fields.list()`, `catalog.fields.get()` |
| **Release Calendar** | Upcoming and recent card product releases across segments and manufacturers | `releaseCalendar.list()` |

## Requirements

- Node.js 22.0+ (uses native fetch)
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
const imageFile = // ... a File, Blob, or ArrayBuffer
const result = await client.identify.card(imageFile);

// 3. Access the identification results
if (result.data?.success) {
  // The API can detect multiple cards in a single image
  const detection = result.data.detections?.[0]; // Get best match
  if (detection) {
    console.log(`Card: ${detection.card.name}`);       // Exact match only
    console.log(`Set: ${detection.card.releaseName}`);  // Exact + set-level match
    console.log(`Confidence: ${detection.confidence}`); // "High", "Medium", or "Low"
    console.log(`Total cards detected: ${result.data.detections.length}`);
  }
}
```

That's it! The SDK handles all API communication, type safety, and error handling automatically.

## Usage Examples

### Card Identification

The identification endpoint uses AI to detect cards in images. It can identify multiple cards in a single image and returns confidence levels for each detection. Use `identify.card()` for baseball (the default segment) or `identify.cardBySegment()` to target a specific sport.

```typescript
import { CardSightAI } from 'cardsightai';
import { readFileSync } from 'fs';

const client = new CardSightAI({ apiKey: 'your_api_key' });

// From a File object (browser)
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
const file = fileInput?.files?.[0];
if (file) {
  await client.identify.card(file);
}

// From a Blob (browser/fetch)
const blob = await fetch('https://example.com/card.jpg').then(r => r.blob());
await client.identify.card(blob);

// From a file on disk (Node.js) — convert the Buffer to an ArrayBuffer
const imageBuffer = new Uint8Array(readFileSync('path/to/card.jpg')).buffer;
const result = await client.identify.card(imageBuffer);

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

    // card is always present — field completeness depends on match level
    if (detection.card.id) {
      // Exact match — all fields populated
      console.log(`  Name: ${detection.card.name}`);
      console.log(`  Year: ${detection.card.year}`);
      console.log(`  Manufacturer: ${detection.card.manufacturer}`);
      console.log(`  Set: ${detection.card.setName || detection.card.releaseName}`);
      console.log(`  Number: ${detection.card.number || 'N/A'}`);
      console.log(`  Card ID: ${detection.card.id}`);
    } else if (detection.card.setId) {
      // Set-level match — no specific card, but set info available
      console.log(`  Release: ${detection.card.releaseName}`);
      console.log(`  Set: ${detection.card.setName}`);
      console.log(`  Year: ${detection.card.year}`);
    } else {
      // No match — card detected in image but not identified
      console.log('  Could not identify this card');
    }
  }

  // Access request metadata
  console.log(`\nRequest ID: ${result.data.requestId}`);
  console.log(`Processing time: ${result.data.processingTime}ms`);

  // Check for server advisory messages (e.g., image quality warnings)
  if (result.data.messages?.length) {
    for (const msg of result.data.messages) {
      console.log(`[${msg.type}] ${msg.message}`);
    }
  }
}

// Segment-specific identification (football, basketball, etc.)
const footballResult = await client.identify.cardBySegment('football', imageBuffer);
const basketballResult = await client.identify.cardBySegment('basketball', blob);
```

#### Response Structure

Each detection has a `confidence` level and a `card` object. The `card` is always present, but its fields are populated based on the match level:

- **Exact match**: `card.id` present — all fields populated including `name`, `number`, and optionally `parallelSuggestions` (beta)
- **Set-level match**: `card.setId` present but no `card.id` — release/set info available but no specific card
- **No match**: `card` is an empty object `{}` — a card was detected in the image but couldn't be identified

Detections may also include a `grading` object when the card is inside a graded slab (see [Grading/Slab Detection](#gradingslab-detection) below).

```typescript
// Exact card match with parallel variant
{
  success: true,
  requestId: "req_abc123",
  detections: [
    {
      confidence: "High",
      card: {
        id: "cd4e3a2f-8b9d-4c7e-a1b2-3d4e5f6g7h8i",
        segmentId: "seg-uuid",
        releaseId: "rel-uuid",
        setId: "set-uuid",
        year: "2023",
        manufacturer: "Topps",
        releaseName: "Chrome",
        setName: "Base Set",
        name: "Aaron Judge",
        number: "99",
        parallelSuggestions: [
          {
            id: "par_uuid",
            name: "Gold Refractor",
            numberedTo: 50,
            confidence: "High"
          }
        ]
      }
    }
  ],
  processingTime: 1250
}

// Mixed results - exact match, set-level match, and no match
{
  success: true,
  requestId: "req_xyz789",
  detections: [
    {
      confidence: "High",
      card: {
        id: "card-uuid",
        segmentId: "seg-uuid",
        releaseId: "rel-uuid",
        setId: "set-uuid",
        year: "2023",
        manufacturer: "Topps",
        releaseName: "Series 1",
        setName: "Base Set",
        name: "Mike Trout",
        number: "27"
      }
    },
    {
      confidence: "Medium",
      card: {
        segmentId: "seg-uuid",
        releaseId: "rel-uuid",
        setId: "set-uuid",
        year: "2024",
        manufacturer: "Panini",
        releaseName: "Prizm Football",
        setName: "Base Set"
      }
    },
    {
      confidence: "Low",
      card: {}
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

#### Checking Set Identifiability (free pre-flight)

Before spending a billed identify call, you can confirm whether a set is supported. These endpoints are **free** — they do not count toward your billed API usage.

```typescript
// List every set the system can identify (paginated)
const { data } = await client.identify.sets.list({ take: 20, skip: 0 });
if (data) {
  console.log(`${data.total_count} identifiable sets`);
  for (const set of data.sets) {
    console.log(`${set.year} ${set.release_name} — ${set.set_name} (${set.segment_name})`);
  }
}

// Check whether a specific set is identifiable by its set ID
const { data: check } = await client.identify.sets.check(setId);
if (check?.is_identifiable) {
  console.log(`Set ${check.set_id} is identifiable`);
}
```

### Card Detection (Presence Check)

The detection endpoint is a lightweight alternative to full identification — it checks whether trading cards are present in an image without identifying them. This is faster and cheaper when you only need to know if cards exist in the image.

```typescript
import { CardSightAI } from 'cardsightai';
import { readFileSync } from 'fs';

const client = new CardSightAI({ apiKey: 'your_api_key' });

// Check if an image contains trading cards
const imageBuffer = new Uint8Array(readFileSync('path/to/image.jpg')).buffer;
const result = await client.detect.card(imageBuffer);

if (result.data) {
  console.log(`Cards detected: ${result.data.detected}`);   // true/false
  console.log(`Number of cards: ${result.data.count}`);      // 0, 1, 2, ...

  // Check for server advisory messages
  if (result.data.messages?.length) {
    for (const msg of result.data.messages) {
      console.log(`[${msg.type}] ${msg.message}`);
    }
  }
}

// Works with the same image types as identify
const blob = await fetch('https://example.com/card.jpg').then(r => r.blob());
const blobResult = await client.detect.card(blob);
```

### Working with Identification Results

The SDK provides utility functions to simplify working with multi-card detection results:

```typescript
import {
  getHighestConfidenceDetection,
  filterByConfidence,
  getDetectedCards,
  hasDetections,
  isExactMatch,
  isSetLevelMatch,
  getExactMatches,
  formatCardDisplay
} from 'cardsightai';

const result = await client.identify.card(imageFile);

// Get the highest confidence detection (best match)
const bestMatch = getHighestConfidenceDetection(result.data);
if (bestMatch) {
  console.log('Best match:', formatCardDisplay(bestMatch.card));
  // Output: "2023 Topps Series 1 Base Set Mike Trout #27"
}

// Check match levels
for (const detection of result.data?.detections || []) {
  if (isExactMatch(detection)) {
    console.log(`Exact: ${formatCardDisplay(detection.card)}`);
  } else if (isSetLevelMatch(detection)) {
    console.log(`Set-level: ${detection.card.releaseName} ${detection.card.setName}`);
  } else {
    console.log('Unidentified card detected');
  }
}

// Get only exact matches (detections with card.id)
const exactMatches = getExactMatches(result.data);
console.log(`${exactMatches.length} exact match(es)`);

// Get all exact-match card objects
const cards = getDetectedCards(result.data);
cards.forEach(card => {
  console.log(`- ${formatCardDisplay(card)}`);
});

// Filter by confidence level
const highConfidenceOnly = filterByConfidence(result.data, 'High');
const mediumAndAbove = filterByConfidence(result.data, 'Medium');

// Check if any cards were detected
if (hasDetections(result.data)) {
  console.log(`Found ${result.data.detections.length} card(s)`);
}
```

#### Flexible Metadata, Suggestions, and Numbered Cards (v3.4.2+)

Every detection's `card` now optionally includes three additional fields:

- `numberedTo?: number` — print run for numbered base cards (e.g. `25` for a `/25`), independent of parallels
- `fields?: FieldValue[]` — key/value metadata tailored to the TCG (e.g. `HP`, `RARITY`, `ARTIST`, `MANA_COST`), plus a `CARD_LANGUAGE` entry holding the **ISO 639-1** code of the scanned card's language (e.g. `"ja"`, `"en"`) when it is detected (v3.8.1+)
- `suggestions?: CardSuggestion[]` — alternative card candidates, best match first. Each entry is a full card record with the same fields as `card`. Only present when the detection `confidence` is Medium or Low (v4.0.0+)

```typescript
import {
  getFieldValue,
  formatFieldValues,
  hasSuggestions,
  getSuggestions,
  isNumberedCard,
  getNumberedTo,
  formatCardDisplay
} from 'cardsightai';

const detection = result.data?.detections?.[0];
if (!detection) return;

// Pull a specific metadata value (case-insensitive key lookup)
const artist = getFieldValue(detection, 'ARTIST');

// Detected language of the scanned card as an ISO 639-1 code, when available
const language = getFieldValue(detection, 'CARD_LANGUAGE');  // e.g. "ja"
if (language && language !== 'en') {
  // Map the code to a display name with the built-in Intl API
  const label = new Intl.DisplayNames(['en'], { type: 'language' }).of(language);
  console.log(`Non-English printing: ${label} (${language})`);  // "Japanese (ja)"
}

// Format all metadata for display
console.log(formatFieldValues(detection, ' · '));
// e.g. "HP: 120 · RARITY: Holo Rare · ARTIST: Mitsuhiro Arita"

// Base-card print run (distinct from parallel print runs)
if (isNumberedCard(detection)) {
  console.log(`Limited to /${getNumberedTo(detection)}`);
}

// Alternative matches (only on Medium/Low confidence detections), best match first.
// Each suggestion is a full card record, so the display helpers work on it directly.
if (hasSuggestions(detection)) {
  console.log('Could also be:');
  for (const alt of getSuggestions(detection)) {
    console.log(`  • ${formatCardDisplay(alt)} (${alt.id ?? 'set-level only'})`);
    // e.g. "  • 1989 Upper Deck Upper Deck Base Set Ken Griffey Jr. #1 (card-uuid)"
  }
}
```

See [Fields (Flexible Metadata System)](#fields-flexible-metadata-system) for end-to-end Pokémon, One Piece, and Magic: The Gathering examples.

#### Parallel Variant Detection (beta)

The identify endpoint reports parallel variants (Refractors, Prizms, numbered parallels, etc.) as a ranked list of candidates in `card.parallelSuggestions`. The list is best match first, and each entry carries an optional `confidence` tier (`"High" | "Medium" | "Low"`). Ranking and confidence are independent — the engine's top pick is not always the entry with the highest confidence — and a missing `confidence` means "not assessed", not Low. When exactly one parallel was identified you get a single High-confidence entry; when several remain possible you get all of them. Base cards with no parallel evidence have no `parallelSuggestions` at all. Parallel identification is currently in beta and has launched for **baseball**.

```typescript
import {
  isExactMatch,
  getParallelSuggestions,
  getBestParallelSuggestion,
  filterParallelSuggestionsByConfidence,
  formatParallelSuggestion
} from 'cardsightai';

const result = await client.identify.card(imageFile);

for (const detection of result.data?.detections || []) {
  if (!isExactMatch(detection)) continue;
  console.log(`Card: ${detection.card.name}`);

  // The engine's top-ranked parallel (undefined when there is no parallel evidence —
  // hasParallelSuggestions(detection) is the boolean form of the same check)
  const best = getBestParallelSuggestion(detection);
  if (!best) {
    console.log('  Type: Base Card');
    continue;
  }
  console.log(`  Best match: ${formatParallelSuggestion(best)}`);
  // Output: "Gold Refractor /50 - High confidence"

  // Only act on confirmed parallels
  if (best.confidence === 'High') {
    console.log(`  Parallel ID: ${best.id}`);
    if (best.numberedTo) {
      console.log(`  🔥 NUMBERED: Only ${best.numberedTo} exist!`);
    }
  }

  // Show every candidate the engine considered, in its ranking
  for (const candidate of getParallelSuggestions(detection)) {
    console.log(`  • ${formatParallelSuggestion(candidate)}`);
  }

  // Or only the ones assessed at Medium confidence or better
  // (entries with no confidence value are dropped — unassessed is not Low)
  const likely = filterParallelSuggestionsByConfidence(detection, 'Medium');
}
```

**Parallel Suggestion Structure:**

```typescript
// Exact match with parallel evidence
{
  confidence: "High",
  card: {
    id: "card_uuid",
    segmentId: "seg_uuid",
    releaseId: "rel_uuid",
    setId: "set_uuid",
    name: "Mike Trout",
    year: "2023",
    // ... other card fields
    parallelSuggestions: [
      {
        id: "parallel_uuid",        // UUID of the parallel type
        name: "Gold Refractor",     // Human-readable name
        description?: "...",        // Optional additional details
        isPartial?: true,           // True if the parallel only applies to specific cards
        numberedTo?: 50,            // Print run for numbered parallels
        cards?: ["uuid1", "uuid2"], // Card UUIDs (only when isPartial is true)
        confidence?: "High"         // "High" | "Medium" | "Low"; omitted = not assessed
      }
      // ... further candidates, in the engine's ranking
    ]
  }
}

// Base cards have no parallelSuggestions array
{
  confidence: "High",
  card: {
    id: "card_uuid",
    name: "Aaron Judge",
    // ... other fields
    // parallelSuggestions is undefined
  }
}
```

**Migrating from `card.parallel` (pre-4.0):** the single `parallel` object is gone. The old helpers `hasParallel()`, `getParallelInfo()`, `isNumberedParallel()`, and `formatParallelDisplay()` still work — they now read the best-match entry (`parallelSuggestions[0]`) — but are deprecated. Note that `hasParallel()` is now true for _any_ parallel evidence, including lower-confidence candidates; use `getBestParallelSuggestion(detection)?.confidence === 'High'` to keep the old "confirmed parallel" behaviour.

#### Grading/Slab Detection

When identifying a card that is inside a graded slab, the detection includes grading information:

```typescript
import {
  hasGrading,
  getGradingInfo,
  formatGradingDisplay
} from 'cardsightai';

const result = await client.identify.card(imageFile);

for (const detection of result.data?.detections || []) {
  // Check if the card is in a graded slab — hasGrading(detection) is the boolean form;
  // reading the value lets TypeScript narrow the optional `grading` for the block below
  const grading = getGradingInfo(detection);
  if (grading) {
    console.log(`Grading Company: ${grading.company.name}`);
    console.log(`Detection Confidence: ${grading.confidence}`);
    console.log(`Display: ${formatGradingDisplay(detection)}`);
    // Output: "PSA 10 GEM MINT - High confidence"

    // Access detailed grade information
    if (grading.grade) {
      console.log(`  Grade: ${grading.grade.value}`);        // e.g., "10"
      console.log(`  Condition: ${grading.grade.condition}`); // e.g., "GEM MINT"
    }

    // Check for defect qualifiers (OC, MC, PD, ST)
    if (grading.qualifier) {
      console.log(`  Qualifier: ${grading.qualifier.code}`);  // e.g., "OC"
    }

    // Check for autograph grades
    if (grading.autoGrade) {
      console.log(`  Auto Grade: ${grading.autoGrade.value}`); // e.g., "10"
    }
  }
}
```

**Grading Object Structure:**

```typescript
{
  confidence: "High",
  card: {
    id: "card_uuid",
    name: "Mike Trout",
    // ... other card fields
  },
  grading: {
    confidence: "High",        // Slab detection confidence
    company: {
      id: "company_uuid",     // Optional grading company UUID
      name: "PSA"             // Grading company name
    },
    grade: {                   // Optional - grade detected on the slab label
      id: "grade_uuid",       // Optional catalog UUID
      value: "10",            // Grade value
      condition: "GEM MINT"   // Grade condition
    },
    qualifier: {               // Optional - defect qualifier (e.g., OC, MC, PD, ST)
      id: "qualifier_uuid",   // Optional catalog UUID
      code: "OC"              // Qualifier code
    },
    autoGrade: {               // Optional - autograph grade
      id: "auto_grade_uuid",  // Optional catalog UUID
      value: "10",            // Autograph grade value
      condition: "MINT"       // Autograph grade condition
    }
  }
}
```

#### Card Parallel Utilities (Catalog)

Cards from catalog endpoints now include a `parallels` array listing all available parallel variants. Use these utilities to work with catalog card parallels:

```typescript
import {
  getCardParallels,
  hasCardParallels,
  findParallelByName,
  getNumberedParallels,
  formatCardParallel,
  type CardParallel
} from 'cardsightai';

// Get a card from the catalog
const { data: card } = await client.catalog.cards.get('card_uuid');

// Check if the card has any parallel variants
if (card && hasCardParallels(card)) {
  // Get all parallels
  const parallels = getCardParallels(card);
  console.log(`This card has ${parallels.length} parallel variants`);

  // Format each parallel for display
  parallels.forEach(p => {
    console.log(`- ${formatCardParallel(p)}`);
    // Output: "Gold Refractor /50", "Black Prizm", "Orange /25"
  });

  // Get only numbered parallels (limited print runs)
  const numbered = getNumberedParallels(card);
  console.log(`${numbered.length} are numbered parallels`);

  // Find a specific parallel by name
  const gold = findParallelByName(card, 'Gold Refractor');
  if (gold) {
    console.log(`Found Gold Refractor with ID: ${gold.id}`);
  }
}
```

**Note**: These utilities are for catalog cards (`card.parallels[]`). For identification results, use `hasParallelSuggestions()`, `getBestParallelSuggestion()`, etc. which work with the detected `card.parallelSuggestions` array (see [Parallel Variant Detection](#parallel-variant-detection-beta)). A `ParallelSuggestion` has the same `id` / `name` / `numberedTo` shape as a `CardParallel`, so `formatCardParallel()` accepts either.

### Catalog Search

Search across cards, sets, releases, and parallels with a single query:

```typescript
// Global fuzzy search
const results = await client.catalog.search({
  q: 'Ken Griffey Jr',  // Required search query
  take: 10,             // Limit results
  skip: 0               // Pagination offset
});

// Filter by entity type
const cardResults = await client.catalog.search({
  q: 'Topps Chrome',
  type: 'set',          // 'card' | 'set' | 'release' | 'parallel'
  year: '2023'
});

// Filter by segment, manufacturer, year range
const footballCards = await client.catalog.search({
  q: 'Patrick Mahomes',
  segment: 'football',
  min_year: '2020',
  max_year: '2024'
});

// Slash notation: append a standalone "/N" term to hard-filter to cards and
// parallels serial-numbered to that value. Matched results expose `numberedTo`.
const numbered = await client.catalog.search({
  q: 'aaron judge /25'   // only cards/parallels numbered to /25
});

// Process results
if (results.data) {
  console.log(`Found ${results.data.total_count} results`);
  for (const result of results.data.results) {
    // `relevance` is opaque and order-only — compare it between results, not across requests
    console.log(`[${result.type}] ${result.name} (relevance: ${result.relevance})`);
    if (result.segmentName) console.log(`  Segment: ${result.segmentName}`);
    if (result.setName) console.log(`  Set: ${result.setName}`);
    if (result.year) console.log(`  Year: ${result.year}`);
    if (result.cardNumber) console.log(`  Card #${result.cardNumber}`);
    if (result.numberedTo) console.log(`  Numbered to /${result.numberedTo}`);
    // Present on every result only when close-spelling (fuzzy) matching engaged;
    // "exact" results always sort before "fuzzy" ones
    if (result.matchKind === 'fuzzy') console.log('  (fuzzy match)');
  }

  // Advisory messages (e.g. an unrecognized query parameter was ignored)
  for (const msg of results.data.messages ?? []) {
    console.log(`[${msg.type}] ${msg.message}`);
  }
}
```

### Fields (Flexible Metadata System)

Every trading card game has different metadata: Pokémon cards have HP and Rarity, Magic: The Gathering cards have Mana Cost and Artist, Yu-Gi-Oh! cards have Attribute and Level. Rather than hard-coding columns per game, CardSight exposes a flexible **Fields** system — any card, set, release, or segment can carry key/value metadata, and the catalog exposes it as a first-class browsable entity. One SDK surface works across every TCG, no per-game branching required.

**Browse available fields, sorted by how prevalent they are:**

```typescript
// usageCount tells you how many catalog entities (cards, sets, releases, segments) carry each field
const fields = await client.catalog.fields.list({
  sort: 'usageCount',
  order: 'desc',
  take: 20
});

fields.data?.fields.forEach(f => {
  console.log(`${f.name} (${f.key}) — used on ${f.usageCount} entities`);
});
// e.g. "Artist (ARTIST) — used on 48,231 entities"
//      "Rarity (RARITY) — used on 39,104 entities"
//      "Hit Points (HP) — used on 11,520 entities"
```

**Example — find rare Pokémon cards:**

Identification responses now include a `fields` array on every detected card, so you can surface rarity directly from a scan:

```typescript
import { CardSightAI, getFieldValue, isExactMatch } from 'cardsightai';

const client = new CardSightAI({ apiKey: 'your_api_key_here' });
const result = await client.identify.card(pokemonCardImage);
const detection = result.data?.detections?.[0];

if (detection && isExactMatch(detection)) {
  const rarity = getFieldValue(detection, 'RARITY');
  const hp = getFieldValue(detection, 'HP');
  const language = getFieldValue(detection, 'CARD_LANGUAGE');  // ISO 639-1, e.g. "ja"
  console.log(`${detection.card.name} — ${rarity} (HP: ${hp}) [${language}]`);
  // e.g. "Charizard — Holo Rare (HP: 120) [ja]"

  if (rarity?.toLowerCase().includes('rare')) {
    // Route to a higher-value pricing lookup, flag for user review, etc.
    const pricing = await client.pricing.get(detection.card.id);
    // ...
  }
}
```

**Example — surface the artist on Magic: The Gathering cards:**

```typescript
import { CardSightAI, formatFieldValues, getFieldValue } from 'cardsightai';

const client = new CardSightAI({ apiKey: 'your_api_key_here' });
const result = await client.identify.cardBySegment('magic', mtgCardImage);
const detection = result.data?.detections?.[0];

if (detection) {
  const artist = getFieldValue(detection, 'ARTIST');
  const manaCost = getFieldValue(detection, 'MANA_COST');
  console.log(`${detection.card.name} by ${artist} — ${manaCost}`);
  // e.g. "Black Lotus by Christopher Rush — {0}"

  // Or show every field at once:
  console.log(formatFieldValues(detection, ' · '));
  // e.g. "MANA_COST: {0} · ARTIST: Christopher Rush · RARITY: Rare"
}
```

**Related utility helpers:**

| Helper | Purpose |
|--------|---------|
| `hasFields(detection)` | Check whether a detection has any field values |
| `getFields(detection)` | Return the full `FieldValue[]` array |
| `getFieldValue(detection, key)` | Look up a single value by key (case-insensitive) |
| `formatFieldValues(detection, separator?)` | Format all fields as a display string |
| `hasSuggestions(detection)` | Check for alternative card candidates (Medium/Low confidence only) |
| `getSuggestions(detection)` | Get the `CardSuggestion[]` array — full card records, best match first |
| `isNumberedCard(detection)` | Check for a base-card print run (independent of parallels) |
| `getNumberedTo(detection)` | Get the base-card print run number |

The `CardDetails` type on every detection also exposes `numberedTo` (e.g. `25` for a `/25` card) and `suggestions` (alternative full card records on Medium/Low confidence detections) alongside the new `fields` array — see [Working with Identification Results](#working-with-identification-results) for full details.

### Pricing (Completed Sales)

Get completed sales pricing data for cards, grouped into raw (ungraded) and graded sections:

```typescript
// Get pricing for a single card
const pricing = await client.pricing.get('card_uuid');

if (pricing.data) {
  // Card context
  console.log(`Card: ${pricing.data.card.name}`);
  console.log(`Set: ${pricing.data.card.set.name} (${pricing.data.card.set.year})`);

  // Raw (ungraded) sales
  console.log(`\nUngraded sales: ${pricing.data.raw.count}`);
  for (const sale of pricing.data.raw.records) {
    console.log(`  $${sale.price} - ${sale.date} (${sale.source})`);
  }

  // Graded sales (grouped by company → grade)
  for (const company of pricing.data.graded) {
    console.log(`\n${company.company_name}:`);
    for (const grade of company.grades) {
      console.log(`  Grade ${grade.grade_value}: ${grade.count} sales`);
      for (const sale of grade.records) {
        console.log(`    $${sale.price} - ${sale.date}`);
      }
    }
  }

  // Metadata
  console.log(`\nTotal records: ${pricing.data.meta.total_records}`);
  console.log(`Last sale: ${pricing.data.meta.last_sale_date}`);
}

// Filter by parallel, grade, time period, and listing type
const filtered = await client.pricing.get('card_uuid', {
  parallel_id: 'parallel_uuid',  // Specific parallel (omit for all)
  grade_id: 'grade_uuid',        // Specific grade (omit for all)
  period: '90d',                  // Any combo: "7d", "2w", "3m", "1y", "all"
  listing_type: 'both',          // auction, fixed, both
  limit: 50                       // Max records per section
});

// Page backward through price history
// Each call returns the most-recent listings up to a 500-row cap ending at `as_of_date`
// (default: today, US Eastern). When the cap is hit, a warning is returned in `messages`.
const firstPage = await client.pricing.get('card_uuid', { period: 'all' });

if (firstPage.data) {
  // Advisory messages (e.g. the row cap was hit and more listings exist in the window)
  for (const msg of firstPage.data.messages ?? []) {
    console.log(`[${msg.type}] ${msg.message}`);
  }

  // To fetch older listings, anchor the next call at the oldest date returned
  // (records are most-recent first, so the oldest raw record is last).
  // The boundary day may repeat a few rows (duplicates, never gaps).
  const oldest = firstPage.data.raw.records.at(-1)?.date;
  if (oldest) {
    const olderPage = await client.pricing.get('card_uuid', {
      period: 'all',
      as_of_date: oldest    // 'YYYY-MM-DD'; future dates are clamped to today
    });
  }
}

// Bulk pricing for multiple cards (up to 100)
const bulk = await client.pricing.bulk({
  card_ids: ['card_uuid_1', 'card_uuid_2', 'card_uuid_3'],
  period: '90d',
  listing_type: 'both',
  limit: 25                       // Optional: most-recent listings per card (default 25, max 100)
});

if (bulk.data) {
  console.log(`Requested: ${bulk.data.meta.requested}`);
  console.log(`Successful: ${bulk.data.meta.successful}`);
  console.log(`Failed: ${bulk.data.meta.failed}`);

  for (const result of bulk.data.results) {
    if (result.success && result.data) {
      console.log(`${result.data.card.name}: ${result.data.meta.total_records} sales`);
    } else if (result.error) {
      console.log(`${result.card_id}: ${result.error.message}`);
    }
  }
}
```

### Price Time Series (Candlestick Rollups)

Chart price trends over time with per-bucket descriptive statistics (mean, median, high, low, count). Series are split by grade — `raw` for ungraded listings and `graded` per company → grade — so graded and ungraded prices never blend into one candle. Within each series, candles are keyed by listing type: `auction` (completed sales, the bid side) and `fixed` (Buy It Now asking prices, the ask side). Statistics are summaries of listings, not valuations.

```typescript
// Daily candles for the last 90 days (the default period count for "daily")
const series = await client.pricing.timeseries('card_uuid', { interval: 'daily' });

if (series.data) {
  // Effective values (after defaults and clamping) are echoed back
  const { interval, periods, as_of_date } = series.data.query;
  console.log(`${interval} × ${periods} buckets ending ${as_of_date}`);

  // Ungraded (raw) candles, oldest first
  for (const candle of series.data.raw.candles) {
    const auction = candle.types.auction;   // absent when the bucket has no auction listings
    if (auction) {
      console.log(`${candle.period_start}: median $${auction.median} (n=${auction.count})`);
    }
  }

  // Whole-window counts, including how many listings the outlier filter removed
  for (const [type, totals] of Object.entries(series.data.raw.totals)) {
    console.log(`${type}: ${totals.total_count} kept, ${totals.filtered_count} filtered`);
  }

  // Graded candles, grouped by company → grade
  for (const company of series.data.graded) {
    for (const grade of company.grades) {
      console.log(`${company.company_name} ${grade.grade_value}: ${grade.candles.length} candles`);
    }
  }
}

// Weekly candles for one year: base card only, one grade, auctions only
const weekly = await client.pricing.timeseries('card_uuid', {
  interval: 'weekly',        // 'daily' | 'weekly' | 'monthly' (required)
  periods: 52,               // Defaults: daily 90, weekly 52, monthly 24.
                             // Values above 365 are rejected; weekly > 156 and monthly > 120 are clamped.
  as_of_date: '2026-09-01',  // Newest bucket is the one containing this date (UTC); defaults to today
  listing_type: 'auction',   // 'auction' | 'fixed' | 'both'
  parallel_id: 'null',       // UUID for one parallel, 'null' for base card only, omit for all
  grade_id: 'grade_uuid'     // UUID for one grade, 'null' for ungraded only, omit for all
});
```

Buckets, listing types, and grades with no listings are omitted rather than zero-filled. A card with no listings in the window returns an empty `raw` section and an empty `graded` array as a success. Pinning `grade_id` to a specific grade excludes ungraded listings, so `raw` comes back empty in that case.

### Pricing Search (Free-Text Title)

Search completed sales by listing title when you don't have a card ID. Returns a flat,
relevance-ranked list that spans multiple cards and may include listings never matched to a
canonical card:

```typescript
const results = await client.pricing.search({
  q: 'Ken Griffey Jr 1989 Upper Deck',  // Required, 2–300 characters
  period: '90d',                         // Optional: "7d", "2w", "3m", "1y", "all"
  listing_type: 'both',                  // Optional: auction, fixed, both
  limit: 25                              // Optional: default 100, max 500
});

if (results.data) {
  console.log(`Found ${results.data.meta.total_records} sales`);

  for (const sale of results.data.results) {
    console.log(`$${sale.price} - ${sale.title ?? 'Untitled'} (${sale.source})`);

    // matched_card is present when the listing was matched to a canonical card
    if (sale.matched_card) {
      console.log(`  ${sale.matched_card.name} - ${sale.matched_card.set.name}`);
    }
    // grade is present for graded sales
    if (sale.grade) {
      console.log(`  ${sale.grade.company_name} ${sale.grade.grade_value}`);
    }
  }

  // Breakdown by data source
  for (const source of results.data.meta.sources) {
    console.log(`${source.source}: ${source.count}`);
  }
}
```

### Marketplace (Active Listings)

Get currently active marketplace listings for cards:

```typescript
// Get active listings for a card
const listings = await client.marketplace.get('card_uuid');

if (listings.data) {
  // Raw (ungraded) active listings
  console.log(`Ungraded listings: ${listings.data.raw.count}`);
  for (const listing of listings.data.raw.records) {
    console.log(`  ${listing.title} - $${listing.price} (${listing.source})`);
    if (listing.url) console.log(`    ${listing.url}`);
    if (listing.bid_count) console.log(`    Bids: ${listing.bid_count}`);
  }

  // Graded active listings (grouped by company → grade)
  for (const company of listings.data.graded) {
    console.log(`\n${company.company_name}:`);
    for (const grade of company.grades) {
      console.log(`  Grade ${grade.grade_value}: ${grade.count} listings`);
    }
  }
}

// Filter by parallel, grade, and listing type
const filtered = await client.marketplace.get('card_uuid', {
  parallel_id: 'parallel_uuid',
  grade_id: 'grade_uuid',
  listing_type: 'fixed',  // auction, fixed (buy-it-now), both
  limit: 25
});
```

### Marketplace Search (Free-Text Title)

Search active marketplace listings by title when you don't have a card ID. Same flat,
relevance-ranked shape as pricing search (active listings instead of completed sales):

```typescript
const results = await client.marketplace.search({
  q: 'Ken Griffey Jr 1989 Upper Deck',  // Required, 2–300 characters
  listing_type: 'both',                  // Optional: auction, fixed, both
  limit: 25                              // Optional: default 100, max 500
});

if (results.data) {
  console.log(`Found ${results.data.meta.total_records} active listings`);

  for (const listing of results.data.results) {
    console.log(`$${listing.price} - ${listing.title} (${listing.source})`);
    if (listing.url) console.log(`  ${listing.url}`);
    if (listing.bid_count) console.log(`  Bids: ${listing.bid_count}`);
    if (listing.matched_card) {
      console.log(`  ${listing.matched_card.name} - ${listing.matched_card.set.name}`);
    }
  }
}
```

### Catalog Operations

Search and retrieve cards, sets, releases, and other catalog data:

```typescript
// Search for specific cards
const cards = await client.catalog.cards.list({
  year: '2023',
  manufacturer: 'Topps',
  name: 'Aaron Judge',
  take: 10,  // Limit results
  skip: 0    // Pagination offset
});

// Get a specific card by ID
const card = await client.catalog.cards.get('card_uuid');

// Search sets
const sets = await client.catalog.sets.list({
  year: '2023',
  manufacturer: 'Topps',
  take: 20
});

// Get cards in a specific set
const setCards = await client.catalog.sets.cards('set_uuid');

// Search releases (product lines like "Chrome", "Series 1")
const releases = await client.catalog.releases.list({
  name: 'Chrome',
  min_year: '2020',
  max_year: '2024'
});

// Get manufacturers
const manufacturers = await client.catalog.manufacturers();

// Get segments (Baseball, Football, etc.)
const segments = await client.catalog.segments();

// Get all parallels/variations
const parallels = await client.catalog.parallels.list();

// Get detailed parallel information by ID
const parallel = await client.catalog.parallels.get('parallel_uuid');
// Returns: id, name, description, numberedTo, isPartial, setId, setName,
//          releaseId, releaseName, releaseYear, cards (for partial parallels)

// Cards include their available parallels directly
const { data: cardDetail } = await client.catalog.cards.get('card_uuid');
if (cardDetail?.parallels && cardDetail.parallels.length > 0) {
  console.log('Available parallels:');
  cardDetail.parallels.forEach(p => {
    // Each parallel has: id, name, numberedTo (optional)
    const display = p.numberedTo ? `${p.name} /${p.numberedTo}` : p.name;
    console.log(`- ${display}`);
  });
}

// Get catalog statistics
const stats = await client.catalog.statistics();
console.log(`Total cards: ${stats.data?.cards.total}`);
console.log(`Total sets: ${stats.data?.sets.total}`);
```

### Release Calendar

Browse upcoming and recent card product releases, sorted by release date (newest first). Useful for "coming soon" pages, recent-release feeds, and pre-order discovery.

```typescript
// Next page of upcoming 2026 Panini releases
const calendar = await client.releaseCalendar.list({
  manufacturer: 'Panini',   // UUID or name (case-insensitive)
  year: '2026',
  take: 20,
  skip: 0
});

calendar.data?.release_calendar.forEach(entry => {
  const preOrder = entry.pre_order_date ?? 'N/A';
  console.log(`${entry.name} — releases ${entry.release_date} (pre-order: ${preOrder})`);
});

console.log(`Total upcoming: ${calendar.data?.total_count}`);
```

Filters: `segment`, `manufacturer`, `year` (all accept UUIDs or case-insensitive names). Each entry includes `id`, `name`, `year`, `release_date`, `pre_order_date`, `segment_id`, and `manufacturer_id`.

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
  year: '2023'
});

// Get random sets from a specific release
const randomSets = await client.catalog.random.sets({
  releaseId: 'release_uuid',
  count: 6
});

// Player collection building - Get random player cards
const randomPlayerCards = await client.catalog.random.cards({
  name: 'Mike Trout',
  count: 3
});

// Random cards with filters (no parallels)
const randomCards = await client.catalog.random.cards({
  year: '2024',
  manufacturer: 'manufacturer_uuid',
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
  collectorId: 'collector_uuid'  // Required: links to a collector profile
});

// Add cards to collection with detailed information.
// Signature: add(collectionId, cardItem | cardItem[])
await client.collections.cards.add(collection.data!.id, [
  {
    cardId: 'card_uuid',
    quantity: 1,
    buyPrice: '50.00',    // Store purchase price
    buyDate: '2024-01-15', // Track purchase date
    gradeId: 'grade_uuid'  // Optional: PSA 10, BGS 9.5, etc.
  }
]);

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
console.log(`Total cards: ${analytics.data?.overview.totalCards}`);
console.log(`Total invested: ${analytics.data?.financials.totalInvested}`);
console.log(`Total realized gains: ${analytics.data?.financials.totalRealizedGains}`);

// Get collection breakdown by various categories
const breakdown = await client.collections.breakdown('collection_uuid', {
  groupBy: 'year'  // Options: 'release', 'year', 'grade', 'player', 'manufacturer'
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

// Add a collection card to a binder
await client.collections.binders.cards.add(
  'collection_uuid',
  'binder_uuid',
  {
    collectionCardId: 'card1_uuid'
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
  collectorId: 'collector_uuid',
  name: 'Rookies to Find',
  description: '2024 rookie cards I need'
});

// Add cards to the list
await client.lists.cards.add('list_uuid', [
  { cardId: 'card_uuid_1' },
  { cardId: 'card_uuid_2' }
]);

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
const { data: grades } = await client.grades.companies.grades('PSA', 'psa_regular');

// Grades include condition descriptors
grades?.grades?.forEach(grade => {
  // grade.grade = "10", grade.condition = "GEM MINT"
  console.log(`${grade.grade} - ${grade.condition}`);
  // Output: "10 - GEM MINT", "9 - MINT", etc.
});
```

### AI-Powered Search

Use natural language to search the catalog:

```typescript
// Ask questions in natural language
const response = await client.ai.query({
  query: 'Show me Mike Trout rookie cards worth over $100'
});

// The AI understands context and intent
const response2 = await client.ai.query({
  query: 'What are the most valuable cards from 2023 Topps Chrome?'
});
```

### Autocomplete

Provide search suggestions for users:

```typescript
// Get card name suggestions (pass the query string directly)
const suggestions = await client.autocomplete.cards('aaron'); // User typed "aaron"
// Returns: ["Aaron Judge", "Hank Aaron", "Aaron Nola", ...]

// Autocomplete for other entities
const sets = await client.autocomplete.sets('chrome');
const manufacturers = await client.autocomplete.manufacturers('top');
const releases = await client.autocomplete.releases('series');
const segments = await client.autocomplete.segments('base');
const years = await client.autocomplete.years('2023');
```

### Image Retrieval

Get card images directly:

```typescript
// Get card image (returns binary data by default)
const imageData = await client.images.getCard('card_uuid');

// Get image as base64 JSON
const imageJson = await client.images.getCard('card_uuid', { format: 'json' });

// Get image with placeholder fallback (returns a default image instead of 404)
const imageWithFallback = await client.images.getCard('card_uuid', { default: 'true' });

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
  feedback_type: 'data_error',  // 'data_error' | 'missing_data' | 'suggestion' | 'bug' | 'other'
  message: 'Wrong year detected'
});

// Submit general feedback
await client.feedback.general({
  feedback_type: 'bug',  // 'data_error' | 'missing_data' | 'suggestion' | 'bug' | 'other'
  message: 'Search not finding parallel cards'
});

// Report issues with specific entities
await client.feedback.card('card_uuid', {
  feedback_type: 'data_error',  // 'data_error' | 'missing_data' | 'suggestion' | 'bug' | 'other'
  message: 'Player name is misspelled'
});

// Look up a previously submitted item by its unique_id
const submitted = await client.feedback.get('feedback_unique_id');
console.log(submitted.data?.data.status);  // e.g. 'new'
```

Each response carries a review `status`. Newly submitted feedback starts as `'new'`; every
other value is set by the review team:

| Status | Meaning |
|--------|---------|
| `new` | Just submitted, not yet triaged |
| `under_review` | Actively being investigated |
| `confirmed_bug` | Confirmed as a bug |
| `enhancement_backlog` | Accepted as an enhancement; in the backlog |
| `enhancement_planned` | Accepted as an enhancement; planned |
| `released` | The resulting change has been released |
| `not_an_issue` | Reviewed and determined not to be an issue |
| `closed` | Closed with no further action |

The values `not_reviewed`, `fixed`, `wont_fix`, `duplicate`, and `need_info` are deprecated and only appear on feedback submitted before August 2026. They remain in the exported `FeedbackStatus` union so an exhaustive `switch` still compiles.

## TypeScript Support

The SDK provides complete TypeScript support with auto-generated types:

```typescript
import {
  CardSightAI,
  CardSightAIError,
  IdentifyResult,
  CardDetection,
  DetectedCard,
  ParallelSuggestion,
  CardSuggestion,
  DetailedParallel,
  CatalogSearchResponse,
  SearchResult,
  SlabGradingDetail,
  SlabCompany,
  SlabGrade,
  SlabQualifier,
  SlabAutoGrade,
  ServerMessage,
  PricingResponse,
  PricingRecord,
  BulkPricingResponse,
  MarketplaceResponse,
  MarketplaceRecord,
  TimeseriesResponse,
  CandlePeriod,
  CandleStats,
  PricingSearchResponse,
  PricingSearchRecord,
  MarketplaceSearchResponse,
  MarketplaceSearchRecord,
  FeedbackResponse,
  FeedbackStatus
} from 'cardsightai';

// All methods are fully typed
const client = new CardSightAI({ apiKey: 'key' });

// TypeScript knows the exact shape of responses
const result = await client.catalog.cards.get('id');
if (result.data) {
  // TypeScript knows all available fields
  console.log(result.data.name);
  console.log(result.data.releaseYear);
  console.log(result.data.releaseName);
}

// Use types in your functions
function processDetection(detection: CardDetection): void {
  if (detection.confidence === 'High' && detection.card.id) {
    console.log(`High confidence exact match: ${detection.card.name}`);
  }
}
```

### Advanced Type Usage

The SDK provides access to all OpenAPI-generated types for advanced use cases:

```typescript
import type { paths, components } from 'cardsightai';

// Access named component schemas
type Card = components['schemas']['Card'];
type Set = components['schemas']['Set'];
type Release = components['schemas']['Release'];
type IdentifyResponse = components['schemas']['IdentifyCardResponse'];

// The SDK is path-based (consistent with openapi-fetch): access request and
// response types straight from `paths` by URL + HTTP method.
type IdentifyCardOperation = paths['/v1/identify/card']['post'];
type GetCardsOperation = paths['/v1/catalog/cards']['get'];

// Extract a specific response type from a path
type HealthResponse = paths['/health']['get']['responses']['200']['content']['application/json'];
type CardsListResponse = paths['/v1/catalog/cards']['get']['responses']['200']['content']['application/json'];

// Extract the query params for an endpoint
type CardListParams = paths['/v1/catalog/cards']['get']['parameters']['query'];
```

The OpenAPI specification now uses named schemas in `components.schemas` for better type reusability and clearer documentation. All types are structurally compatible with previous versions.

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
    console.error('Request details:', error.request);
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
const basicClient = new CardSightAI({
  apiKey: 'your_api_key'  // Required
});

// Advanced configuration
const advancedClient = new CardSightAI({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.cardsight.ai',  // Custom API endpoint
  timeout: 30000,  // Request timeout in milliseconds
  headers: {  // Additional headers
    'X-Custom-Header': 'value'
  }
});

// Using environment variables
// Set CARDSIGHTAI_API_KEY in your environment
const envClient = new CardSightAI();  // Automatically uses env variable
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
| **Identification** | 4 | `identify.card()`, `identify.cardBySegment()`, `identify.sets.list()`, `identify.sets.check()` |
| **Detection** | 1 | `detect.card()` |
| **Catalog** | 20 | `catalog.search()`, `catalog.cards.*`, `catalog.sets.*`, `catalog.releases.*`, `catalog.fields.*`, `catalog.random.*` |
| **Release Calendar** | 1 | `releaseCalendar.list()` |
| **Collections** | 23 | `collections.*`, `collections.cards.*`, `collections.binders.*` |
| **Collectors** | 5 | `collectors.*` |
| **Lists** | 8 | `lists.*`, `lists.cards.*` |
| **Pricing** | 4 | `pricing.get()`, `pricing.bulk()`, `pricing.timeseries()`, `pricing.search()` |
| **Marketplace** | 2 | `marketplace.get()`, `marketplace.search()` |
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
import { CardSightAI } from 'cardsightai';

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