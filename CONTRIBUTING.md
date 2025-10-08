# Contributing to CardSight AI Node.js SDK

We welcome contributions to the CardSight AI Node.js SDK! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites
- Node.js 18.0 or higher
- npm 8.0 or higher

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/cardsightai-node-sdk.git
   cd cardsightai-node-sdk
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Run tests:
   ```bash
   npm test
   ```

## Development Workflow

### Project Structure
```
├── src/                    # TypeScript source code
│   ├── client.ts          # Main SDK client
│   ├── index.ts           # Package entry point
│   ├── types.ts           # Type definitions
│   └── generated/         # Auto-generated OpenAPI types
├── dist/                   # Compiled JavaScript (git-ignored)
│   ├── cjs/              # CommonJS build
│   ├── esm/              # ES modules build
│   └── types/            # TypeScript declarations
├── examples/              # Usage examples
└── test/                  # Test files
```

### Available Scripts

- `npm run generate` - Generate TypeScript types from production API (https://api.cardsight.ai/documentation/json)
- `npm run build` - Build the SDK for production
- `npm run build:esm` - Build ES modules only
- `npm run build:cjs` - Build CommonJS only
- `npm run build:types` - Build TypeScript declarations only
- `npm run clean` - Clean build artifacts
- `npm test` - Run tests
- `npm run dev` - Watch mode for development
- `npm run lint` - Run ESLint to check for code quality issues
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run check` - Run all checks (lint, format, test)

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards

3. Update the OpenAPI types if needed:
   ```bash
   npm run generate
   ```

4. Build and test your changes:
   ```bash
   npm run build
   npm test
   ```

5. Commit your changes with a descriptive message

## Code Quality

### Linting and Formatting

This project uses ESLint and Prettier to maintain code quality and consistent formatting.

#### Pre-commit Hooks
We use Husky and lint-staged to automatically run linting and formatting on staged files before each commit. This ensures that all committed code meets our standards.

#### Manual Checks
You can manually run the following commands:

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is properly formatted
npm run format:check

# Run all checks (lint, format, test)
npm run check
```

#### CI/CD
All pull requests are automatically checked for:
- ESLint violations
- Prettier formatting issues
- TypeScript compilation errors
- Test failures
- Node.js version compatibility (18.x, 20.x, 22.x)

**Your PR will not be merged if any of these checks fail.**

## Coding Standards

### TypeScript Guidelines
- Use TypeScript strict mode
- Provide explicit types for public APIs
- Use JSDoc comments for public methods
- Prefer interfaces over type aliases for object shapes
- Use `readonly` for immutable properties

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Use `const` by default, `let` when reassignment is needed
- Prefer arrow functions for callbacks

### Error Handling
- Extend `CardSightAIError` for custom errors
- Provide meaningful error messages
- Include relevant context in errors

### Testing
- Write tests for new features
- Ensure all tests pass before submitting PR
- Test both success and error cases
- Mock external API calls

## Updating the OpenAPI Specification

The SDK automatically generates types from the production API. When the API changes:

1. Regenerate types from the production API:
   ```bash
   npm run generate
   ```

2. Update client methods if new endpoints were added
3. Update tests and examples as needed
4. Update README documentation

Note: The production OpenAPI spec is available at https://api.cardsight.ai/documentation/json

## Pull Request Process

1. Ensure your code follows the coding standards
2. Update documentation if you're changing the API
3. Add tests for new functionality
4. Update CHANGELOG.md with your changes
5. Ensure all tests pass
6. Create a pull request with a clear description

### PR Title Format
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code refactoring
- `test:` for test additions/changes
- `chore:` for maintenance tasks

## Releasing

Releases are managed by maintainers:

1. Update version in package.json
2. Update CHANGELOG.md
3. Build and test:
   ```bash
   npm run build
   npm test
   ```
4. Publish to npm:
   ```bash
   npm publish
   ```
5. Create GitHub release with changelog

## Questions?

If you have questions, please:
- Check existing issues and documentation
- Open a new issue for bugs or feature requests
- Contact support@cardsight.ai for API-specific questions

Thank you for contributing to CardSight AI Node.js SDK!