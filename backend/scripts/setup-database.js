import dotenv from 'dotenv';
dotenv.config();

import { testConnection } from '../src/config/database.js';
import { syncDatabase } from '../src/models/index.js';
import { seedDatabase } from '../src/database/seed.js';

const runSeed = async () => {
    try {
        console.log('Starting database setup...\n');

        // Test connection
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }

        // Sync models
        console.log('\n📦 Synchronizing database models...');
        await syncDatabase({ force: false, alter: true });

        // Seed data
        console.log('\n🌱 Seeding database...');
        await seedDatabase();

        console.log('\n✅ Database setup completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Database setup failed:', error);
        process.exit(1);
    }
};

runSeed();
