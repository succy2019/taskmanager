import { getDbClient } from './src/repository/database'

// Create admin user
const admin = {
    email: 'admin@taskmanager.com',
    password: 'admin123'
}

// Function to seed admin
async function seedAdmin() {
    try {
        const dbClient = getDbClient()
        await dbClient.init()
        
        // Check if admin already exists
        const existingAdmin = await dbClient.getAdminByEmailAndPassword(admin.email, admin.password);
        if (!existingAdmin) {
            await dbClient.createAdmin(admin)
            console.log('✅ Admin user created successfully!')
            console.log('📧 Email: admin@taskmanager.com')
            console.log('🔑 Password: admin123')
            console.log('🌐 Admin Login URL: http://localhost:9000/admin-login.html')
        } else {
            console.log('ℹ️  Admin user already exists')
            console.log('📧 Email: admin@taskmanager.com')
            console.log('🔑 Password: admin123')
        }
    } catch (error) {
        console.error('❌ Failed to create admin user:', error)
    }
}

// Run the seed function
seedAdmin()
}

process.exit(0)