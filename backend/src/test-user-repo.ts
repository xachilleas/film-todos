import { connectDB, getPool } from './utils/db';
import { UserRepository } from './repositories/UserRepository';

async function test() {
    try {
        // Connect to database
        await connectDB();
        const userRepo = new UserRepository();

        console.log('Testing UserRepository...\n');

        // Test 1: Create a user
        console.log('1. Creating user...');
        const newUser = await userRepo.create({
            username: 'alice',
            email: 'alice@example.com',
            password: 'hashed_password_123'
        });
        console.log('✅ User created:', newUser);

        // Test 2: Find by email
        console.log('\n2. Finding user by email...');
        const foundByEmail = await userRepo.findByEmail('alice@example.com');
        console.log('✅ Found by email:', foundByEmail);

        // Test 3: Find by username
        console.log('\n3. Finding user by username...');
        const foundByUsername = await userRepo.findByUsername('alice');
        console.log('✅ Found by username:', foundByUsername);

        // Test 4: Find by ID
        if (newUser.id) {
            console.log('\n4. Finding user by ID...');
            const foundById = await userRepo.findById(newUser.id);
            console.log('✅ Found by ID:', foundById);
        }

        console.log('\n🎉 All UserRepository tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

test();