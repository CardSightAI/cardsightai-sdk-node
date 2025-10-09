# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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