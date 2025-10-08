// TypeScript usage example for CardSightAI SDK
import { init, CardSightAIError, AuthenticationError, type CardSightAIConfig } from 'cardsightai';
import type { paths } from 'cardsightai';
import { readFileSync } from 'fs';

// Type-safe configuration
const config: CardSightAIConfig = {
  apiKey: process.env.CARDSIGHTAI_API_KEY || 'your_api_key_here',
  timeout: 30000
};

async function demonstrateTypeScript() {
  const client = init(config);

  try {
    // Type-safe responses
    const healthResponse = await client.health.checkAuth();
    // healthResponse.data is fully typed from OpenAPI schema
    console.log('Status:', healthResponse.data?.status);
    console.log('Timestamp:', healthResponse.data?.timestamp);

    // Extract specific types
    type CardListResponse = paths['/v1/catalog/cards']['get']['responses']['200']['content']['application/json'];

    const cardsResponse = await client.catalog.cards.list({
      year: 2023,
      manufacturer: 'Topps',
      limit: 10
    });

    // Access typed data
    if (cardsResponse.data) {
      // TypeScript knows the structure of cardsResponse.data
      console.log(`Found ${cardsResponse.data} cards`);
    }

    // Error handling with typed errors
    try {
      await client.catalog.cards.get('invalid_id');
    } catch (error) {
      if (error instanceof AuthenticationError) {
        // Handle auth errors specifically
        console.error('Authentication failed - check your API key');
      } else if (error instanceof CardSightAIError) {
        // Access typed error properties
        console.error(`API Error ${error.status}: ${error.message}`);
        console.error('Request details:', error.request);
        console.error('Response:', error.response);
      } else {
        // Handle other errors
        console.error('Unexpected error:', error);
      }
    }

    // Using the raw client for advanced scenarios
    const rawResponse = await client.raw.GET('/v1/catalog/sets/{id}', {
      params: {
        path: { id: 'set_123' }
      }
    });

    // Type guards
    if (rawResponse.data && 'name' in rawResponse.data) {
      console.log('Set name:', rawResponse.data.name);
    }

    // Collection operations with typed data
    const collections = await client.collections.list();
    if (collections.data && Array.isArray(collections.data)) {
      for (const collection of collections.data) {
        console.log(`Collection: ${collection}`);
      }
    }

  } catch (error) {
    if (error instanceof CardSightAIError) {
      console.error(`Error: ${error.message} (Status: ${error.status})`);
    } else {
      console.error('Error:', error);
    }
  }
}

// Async wrapper for top-level await
(async () => {
  await demonstrateTypeScript();
})();