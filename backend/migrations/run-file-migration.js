import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const runMigration = async () => {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected to database');

        // Read the SQL migration file
        const migrationPath = join(__dirname, 'update_files_table_for_local_storage.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📝 Running migration: update_files_table_for_local_storage.sql');
        console.log('---');

        // Execute the migration
        await client.query(sql);

        console.log('---');
        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('Changes applied:');
        console.log('  - Added file_path column');
        console.log('  - Added uploaded_by_role column (client, designer, admin)');
        console.log('  - Added file_category column (reference, deliverable, revision, brief, other)');
        console.log('  - Added is_visible column');
        console.log('  - Made S3 fields nullable');
        console.log('  - Created indexes for new columns');
        console.log('  - Updated existing records with default values');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('');
        console.error('Error details:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('');
        console.log('🔌 Database connection closed');
    }
};

// Run the migration
runMigration();
