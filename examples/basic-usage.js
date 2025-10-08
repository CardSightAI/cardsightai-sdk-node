// Basic usage example for CardSightAI SDK
import { init } from 'cardsightai';
import { readFileSync } from 'fs';

async function main() {
  // Initialize the client
  const client = init({
    apiKey: process.env.CARDSIGHTAI_API_KEY || 'your_api_key_here'
  });

  try {
    // 1. Test connection
    console.log('Testing API connection...');
    const health = await client.health.checkAuth();
    console.log('✓ API Status:', health.data);

    // 2. Search for cards
    console.log('\nSearching for cards...');
    const cards = await client.catalog.cards.list({
      year: 2023,
      limit: 5
    });
    console.log(`✓ Found ${cards.data?.length || 0} cards`);

    // 3. Get catalog statistics
    console.log('\nFetching catalog statistics...');
    const stats = await client.catalog.statistics();
    console.log('✓ Catalog stats:', stats.data);

    // 4. Autocomplete example
    console.log('\nTesting autocomplete...');
    const suggestions = await client.autocomplete.cards('Mike');
    console.log(`✓ Found ${suggestions.data?.length || 0} suggestions`);

    // 5. AI query example
    console.log('\nTesting AI search...');
    const aiResults = await client.ai.query('Show me the most valuable cards from 2023');
    console.log('✓ AI response received');

    // 6. Card identification (requires an image file)
    if (process.argv[2]) {
      console.log('\nIdentifying card from image...');
      const imageBuffer = readFileSync(process.argv[2]);
      const identified = await client.identify.card(imageBuffer);
      console.log('✓ Card identified:', identified.data);
    } else {
      console.log('\n💡 Tip: Pass an image path as argument to test card identification');
      console.log('   Example: node basic-usage.js path/to/card.jpg');
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
    }
  }
}

main();