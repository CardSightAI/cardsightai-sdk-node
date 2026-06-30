# CardSightAI SDK Tests

## Integration Tests

Simple integration tests to verify the SDK is working correctly with the CardSight AI API.

### Getting an API Key

Get a free API key at [https://cardsight.ai](https://cardsight.ai) - no credit card required!

### Running Tests

Provide your API key as an environment variable:

```bash
CARDSIGHTAI_API_KEY=YOUR_API_KEY_HERE npm run test:integration
```

You can also export it in your shell:

```bash
export CARDSIGHTAI_API_KEY=YOUR_API_KEY_HERE
npm run test:integration
```

### What Gets Tested

The integration tests verify core endpoints, including:

1. **Health Check** - Verifies the API is reachable
2. **Authenticated Health Check** - Verifies your API key is valid
3. **Catalog Card Search** - Verifies basic card search functionality
4. **Catalog Fields / Release Calendar / Identifiable Sets** - Verifies paginated list endpoints
5. **Pricing Title Search** - Verifies free-text pricing search (`pricing.search()`)
6. **Marketplace Title Search** - Verifies free-text marketplace search (`marketplace.search()`)

### Expected Output

```
▶ CardSightAI SDK Integration Tests
  ✓ Health Check - Basic (XXXms)
  ✓ Health Check - Authenticated (XXXms)
  ✓ Catalog - Card Search (XXXms)
  ...
  ✓ Pricing - Title Search (v3.7.0) (XXXms)
  ✓ Marketplace - Title Search (v3.7.0) (XXXms)

✅ All integration tests passed!
```

### Troubleshooting

- **Missing API Key Error**: Make sure you provide your API key as an environment variable
- **Authentication Failed**: Verify your API key is correct and active at [https://cardsight.ai](https://cardsight.ai)
- **Network Errors**: Check your internet connection and firewall settings
- **Build Errors**: The tests automatically build the SDK, but if you see TypeScript errors, try running `npm run build` first