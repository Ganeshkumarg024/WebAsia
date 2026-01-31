import dotenv from 'dotenv';
dotenv.config();

import { testConnection } from '../src/config/database.js';
import { User } from '../src/models/index.js';

const seedUsers = async () => {
    try {
        console.log('Starting user seeding...\n');

        // Test connection
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }

        // Check if users already exist
        const existingUsers = await User.count();
        if (existingUsers > 0) {
            console.log(`⚠️  Found ${existingUsers} existing users. Deleting and recreating...`);
            await User.destroy({ where: {}, truncate: true });
        }

        // Create admin user
        const adminUser = await User.create({
            email: 'admin@webasia.in',
            password: 'Admin@123', // Will be hashed by hook
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            status: 'active',
            emailVerified: true
        });

        console.log('✅ Created admin user (email: admin@webasia.in, password: Admin@123)');

        // Create test designer
        await User.create({
            email: 'designer@webasia.in',
            password: 'Designer@123',
            firstName: 'Test',
            lastName: 'Designer',
            role: 'designer',
            status: 'active',
            emailVerified: true
        });

        console.log('✅ Created test designer (email: designer@webasia.in, password: Designer@123)');

        // Create test manager
        await User.create({
            email: 'manager@webasia.in',
            password: 'Manager@123',
            firstName: 'Test',
            lastName: 'Manager',
            role: 'manager',
            status: 'active',
            emailVerified: true
        });

        console.log('✅ Created test manager (email: manager@webasia.in, password: Manager@123)');

        // Create test client
        await User.create({
            email: 'client@webasia.in',
            password: 'Client@123',
            firstName: 'Test',
            lastName: 'Client',
            role: 'client',
            status: 'active',
            emailVerified: true
        });

        console.log('✅ Created test client (email: client@webasia.in, password: Client@123)');

        console.log('\n✅ User seeding completed successfully!');
        console.log('\nTest Users:');
        console.log('- Admin: admin@webasia.in / Admin@123');
        console.log('- Designer: designer@webasia.in / Designer@123');
        console.log('- Manager: manager@webasia.in / Manager@123');
        console.log('- Client: client@webasia.in / Client@123');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ User seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();
