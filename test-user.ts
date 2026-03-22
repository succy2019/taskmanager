import { getDbClient } from './src/repository/database'

// Create a test user
const testUser = {
    userId: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123'
}

async function testUserOperations() {
    try {
        const dbClient = getDbClient()
        await dbClient.init()
        
        // Check if user already exists
        const existingUser = await dbClient.getUserByEmail(testUser.email);
        if (!existingUser) {
            await dbClient.createUser(testUser);
            console.log('✅ Test user created successfully!');
            console.log('📧 Email: test@example.com');
            console.log('🔑 Password: test123');
        } else {
            console.log('ℹ️  Test user already exists');
            console.log('📧 Email: test@example.com');
            console.log('🔑 Password: test123');
        }
        
        // Test login
        const loginResult = await dbClient.userlogin(testUser.email, testUser.password);
        if (loginResult) {
            console.log('✅ Test login successful');
            console.log('User ID:', loginResult.userId);
        } else {
            console.log('❌ Test login failed');
        }
        
    } catch (error) {
        console.error('❌ Error with test user:', error);
    }
}

// Run the test
testUserOperations().then(() => process.exit(0))