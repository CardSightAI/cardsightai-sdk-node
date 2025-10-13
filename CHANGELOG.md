# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.5] - 2025-10-13

### Added
- **Collector Name Field** - Collectors now support an optional `name` field:
  - `collectors.create({ name: 'Eric' })` - Create collectors with a friendly name (e.g., "Mike", "Eric")
  - `collectors.update(id, { name: 'Mike' })` - Update collector names
  - `collectors.get(id)` - Returns collector details including name if set
  - `collectors.list()` - Returns all collectors with their names
  - The name field is optional and provides a human-readable identifier for collectors
  - Updated documentation with examples showing proper usage of the name field

## [1.1.4] - 2025-01-09

### Added
- **Complete Lists Management** - Full CRUD operations for card lists (want lists, wishlists, etc.):
  - `lists.create()` - Create new lists for tracking cards you want or are interested in
  - `lists.update()` - Update list properties (name, description)
  - `lists.delete()` - Delete a list (removes all card associations)
  - `lists.cards.add()` - Add one or multiple cards to lists (supports batch operations)
  - These complement the existing read operations (list, get, cards.list, cards.delete)
  - Lists are now fully functional for tracking cards users want vs Collections for cards they own

## [1.1.3] - 2025-01-09

### Fixed
- **Raw Image Response Handling** - Fixed JSON.parse error when requesting raw image format:
  - `format: 'raw'` now correctly returns binary Blob data without attempting JSON parsing
  - `format: 'json'` continues to return parsed JSON metadata
  - Properly handles default format (raw) without errors
  - Response is parsed as blob for raw format, JSON for json format

## [1.1.2] - 2025-01-09

### Fixed
- **Card Images Format Parameter** - `images.getCard()` now properly supports the `format` query parameter:
  - `format: 'raw'` - Returns the raw JPEG binary (default)
  - `format: 'json'` - Returns image metadata with base64 data
  - Backwards compatible - existing code without params continues to work (returns raw by default)

## [1.1.1] - 2025-01-09

### Added
- **Complete Binder Management** - Full CRUD operations for collection binders:
  - `collections.binders.create()` - Create new binders to organize cards
  - `collections.binders.update()` - Update binder properties (name, description)
  - `collections.binders.delete()` - Delete a binder (cards remain in collection)
  - `collections.binders.cards.add()` - Add collection cards to binders
  - `collections.binders.cards.delete()` - Remove cards from binders

## [1.1.0] - 2025-01-09

### Changed
- **BREAKING CHANGE**: Full TypeScript type safety implementation
  - All API methods now use proper types extracted from OpenAPI specification
  - Removed all `any` types in favor of strongly-typed parameters
  - IDE autocomplete now provides accurate suggestions for all API parameters
  - Compile-time error checking prevents invalid API calls
  - **Breaking**: `collections.breakdown()` now correctly requires `params` with mandatory `groupBy` field
  - **Breaking**: `ai.query()` signature changed from `(question: string, options?: any)` to `(data: PostBody<'/v1/ai/query'>)` requiring `{ query: string, ... }` object

### Added
- Type extraction utilities for leveraging auto-generated OpenAPI types
- Full type inference for all GET query parameters, POST/PUT request bodies
- Comprehensive type checking across all 50+ API endpoints
- Better developer experience with accurate IntelliSense support

### Fixed
- Headers compatibility issue with `entries()` method for broader Node.js support

## [1.0.5] - 2025-01-09

### Added
- **Grades endpoints** - Complete grading system integration:
  - `grades.companies.list()` - Get all grading companies (PSA, BGS, SGC, CGC, etc.)
  - `grades.companies.types()` - Get grading types for a company (e.g., PSA Regular, BGS Black Label)
  - `grades.companies.grades()` - Get specific grades for a grading type (1-10 with half grades)
  - Enables full grading support when saving cards to collections

## [1.0.4] - 2024-10-08

### Added
- Enhanced `collections.list()` with advanced filtering and pagination support:
  - Filter by collection name with partial matching
  - Filter by specific collector ID
  - Pagination with `take` and `skip` parameters
  - Sort collections by name in ascending or descending order
  - Improved performance for large collection sets

## [1.0.3] - 2024-10-08

### Added
- Complete API coverage - all available endpoints from OpenAPI specification now implemented
- **Collectors** - Full CRUD operations:
  - `collectors.list()` - List all collectors
  - `collectors.create()` - Create a new collector
  - `collectors.get()` - Get a specific collector
  - `collectors.update()` - Update a collector
  - `collectors.delete()` - Delete a collector
- **Lists** - Card list management:
  - `lists.list()` - Get all lists
  - `lists.get()` - Get a specific list
  - `lists.cards.list()` - Get cards in a list
  - `lists.cards.delete()` - Remove card from list
- **Images** - Direct card image access:
  - `images.getCard()` - Get card image by ID
- **Subscription**:
  - `subscription.get()` - Get subscription information
- **Extended Feedback** - Additional entity feedback endpoints:
  - `feedback.release()` - Submit release feedback
  - `feedback.set()` - Submit set feedback
  - `feedback.manufacturer()` - Submit manufacturer feedback
  - `feedback.segment()` - Submit segment feedback
  - `feedback.get()` - Get feedback by ID
- **Collection Enhancements**:
  - `collections.binders.list()` - List binders in collection
  - `collections.binders.get()` - Get specific binder
  - `collections.binders.cards.list()` - List cards in binder
  - `collections.cards.getImage()` - Get card image from collection
  - `collections.cards.getThumbnail()` - Get card thumbnail from collection

## [1.0.2] - 2024-10-08

### Fixed
- Critical fix for FormData/multipart uploads in card identification endpoint
- Resolved Content-Type header conflict preventing image uploads
- Improved header handling to support both JSON and multipart/form-data requests

## [1.0.1] - 2024-10-08

### Added
- Integration test suite for core SDK functionality
- Test documentation with setup instructions
- Enhanced README with API key signup information

### Changed
- Improved request timeout handling using WeakMap for better memory management
- Updated Node.js requirement to 20.0+ for improved performance and stability
- Simplified API type generation to use production endpoint directly

### Fixed
- Request middleware compatibility with frozen option objects
- TypeScript build configuration for proper module exports

### Removed
- Local OpenAPI specification file dependency
- Redundant configuration options

## [1.0.0] - 2024-10-08

### Added
- Initial release of CardSightAI Node.js SDK
- Full TypeScript support with auto-generated types from OpenAPI specification
- Complete API coverage for all CardSightAI endpoints
- Built-in authentication handling via API key
- Support for both ESM and CommonJS module systems
- Comprehensive error handling with typed error classes
- Request timeout configuration
- Card identification from images (File, Blob, Buffer, ArrayBuffer)
- Full catalog operations (cards, sets, releases, manufacturers, segments)
- Collection management with CRUD operations
- AI-powered natural language search
- Autocomplete functionality for all entity types
- Feedback submission system
- Direct access to underlying OpenAPI client for advanced use cases
- Minimal dependencies (only openapi-fetch)
- Node.js 18+ native fetch support
- Comprehensive documentation and examples