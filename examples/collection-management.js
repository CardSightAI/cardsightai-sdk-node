// Collection management example
import { init } from 'cardsightai';

async function manageCollection() {
  const client = init(); // Uses CARDSIGHTAI_API_KEY env variable

  try {
    // Create a new collection
    console.log('Creating new collection...');
    const newCollection = await client.collections.create({
      name: 'My Vintage Baseball Cards',
      description: 'Collection of pre-1980 baseball cards',
      isPublic: false
    });
    console.log('✓ Collection created:', newCollection.data);

    const collectionId = newCollection.data?.id;

    if (!collectionId) {
      throw new Error('Failed to create collection');
    }

    // Add cards to the collection
    console.log('\nAdding cards to collection...');
    await client.collections.cards.add(collectionId, {
      cardId: 'card_123',
      quantity: 1,
      condition: 'NM',
      purchasePrice: 150.00,
      purchaseDate: '2024-01-15',
      notes: 'Purchased from local card shop'
    });
    console.log('✓ Card added to collection');

    // Get collection analytics
    console.log('\nFetching collection analytics...');
    const analytics = await client.collections.analytics(collectionId);
    console.log('Collection Analytics:');
    console.log('- Total cards:', analytics.data?.totalCards);
    console.log('- Total value:', analytics.data?.totalValue);
    console.log('- Unique cards:', analytics.data?.uniqueCards);

    // Get set progress
    console.log('\nChecking set completion progress...');
    const setProgress = await client.collections.setProgress.list(collectionId);
    console.log('✓ Set progress data retrieved');

    // Get collection breakdown
    console.log('\nGetting collection breakdown...');
    const breakdown = await client.collections.breakdown(collectionId, {
      groupBy: 'year'
    });
    console.log('✓ Collection breakdown:', breakdown.data);

    // List all cards in collection
    console.log('\nListing collection cards...');
    const cards = await client.collections.cards.list(collectionId, {
      limit: 10,
      sort: 'value',
      order: 'desc'
    });
    console.log(`✓ Found ${cards.data?.length || 0} cards in collection`);

    // Update a card in collection
    if (cards.data?.length > 0) {
      const firstCard = cards.data[0];
      console.log('\nUpdating card in collection...');
      await client.collections.cards.update(collectionId, firstCard.id, {
        condition: 'EX',
        notes: 'Updated condition after closer inspection'
      });
      console.log('✓ Card updated');
    }

    // Clean up - delete the test collection (optional)
    console.log('\nCleaning up test collection...');
    await client.collections.delete(collectionId);
    console.log('✓ Collection deleted');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

manageCollection();