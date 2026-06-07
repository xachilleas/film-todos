import { connectDB } from './utils/db';
import { UserRepository } from './repositories/UserRepository';
import { WatchlistRepository } from './repositories/WatchlistRepository';

async function test() {
    try {
        await connectDB();
        const userRepo = new UserRepository();
        const watchlistRepo = new WatchlistRepository();

        console.log('Testing WatchlistRepository...\n');

        // First, create a test user if not exists
        let user = await userRepo.findByEmail('watchlist_test@example.com');
        if (!user) {
            console.log('Creating test user...');
            user = await userRepo.create({
                username: 'watchlist_tester',
                email: 'watchlist_test@example.com',
                password: 'test_password'
            });
            console.log('✅ Test user created:', user);
        }

        const userId = user.id!;

        // Test 1: Save a movie to watchlist
        console.log('\n1. Saving movie to watchlist...');
        const movie = await watchlistRepo.save({
            user_id: userId,
            imdb_id: 'tt0111161',
            title: 'The Shawshank Redemption',
            year: '1994',
            poster: 'https://example.com/poster.jpg'
        });
        console.log('✅ Movie saved:', movie);

        // Test 2: Try to save same movie again (should fail)
        console.log('\n2. Trying to save duplicate movie (should fail)...');
        try {
            await watchlistRepo.save({
                user_id: userId,
                imdb_id: 'tt0111161',
                title: 'The Shawshank Redemption',
                year: '1994',
                poster: 'https://example.com/poster.jpg'
            });
            console.log('❌ Error: Duplicate movie was allowed!');
        } catch (error: any) {
            console.log('✅ Correctly blocked duplicate:', error.message);
        }

        // Test 3: Get user's watchlist
        console.log('\n3. Getting user watchlist...');
        const watchlist = await watchlistRepo.findByUserId(userId);
        console.log('✅ Watchlist items:', watchlist);

        // Test 4: Check if movie exists
        console.log('\n4. Checking if movie exists...');
        const exists = await watchlistRepo.exists(userId, 'tt0111161');
        console.log('✅ Movie exists:', exists);

        // Test 5: Delete movie from watchlist
        console.log('\n5. Deleting movie from watchlist...');
        const deleted = await watchlistRepo.delete(userId, 'tt0111161');
        console.log('✅ Movie deleted:', deleted);

        // Verify deletion
        const afterDelete = await watchlistRepo.exists(userId, 'tt0111161');
        console.log('✅ Movie still exists after delete?', afterDelete);

        console.log('\n🎉 All WatchlistRepository tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

test();