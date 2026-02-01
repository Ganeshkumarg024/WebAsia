#!/usr/bin/env node

/**
 * Database Migration Runner
 * Runs all SQL migration files in order
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Database configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'webasia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SEEDS_DIR = path.join(__dirname, 'seeds');

/**
 * Run all migration files
 */
async function runMigrations() {
    console.log('🚀 Starting database migrations...\n');

    try {
        // Get all migration files
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('⚠️  No migration files found');
            return;
        }

        // Run each migration
        for (const file of files) {
            const filePath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`📄 Running migration: ${file}`);

            try {
                await pool.query(sql);
                console.log(`✅ Completed: ${file}\n`);
            } catch (error) {
                console.error(`❌ Failed: ${file}`);
                console.error(`Error: ${error.message}\n`);
                throw error;
            }
        }

        console.log('✅ All migrations completed successfully!\n');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    }
}

/**
 * Run all seed files
 */
async function runSeeds() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Get all seed files
        const files = fs.readdirSync(SEEDS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('⚠️  No seed files found');
            return;
        }

        // Run each seed
        for (const file of files) {
            const filePath = path.join(SEEDS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`📄 Running seed: ${file}`);

            try {
                await pool.query(sql);
                console.log(`✅ Completed: ${file}\n`);
            } catch (error) {
                console.error(`❌ Failed: ${file}`);
                console.error(`Error: ${error.message}\n`);
                // Continue with other seeds even if one fails
            }
        }

        console.log('✅ All seeds completed!\n');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    }
}

/**
 * Drop all tables (use with caution!)
 */
async function dropAllTables() {
    console.log('⚠️  Dropping all tables...\n');

    const dropSQL = `
        DROP TABLE IF EXISTS request_activities CASCADE;
        DROP TABLE IF EXISTS payments CASCADE;
        DROP TABLE IF EXISTS testimonials CASCADE;
        DROP TABLE IF EXISTS referrals CASCADE;
        DROP TABLE IF EXISTS affiliates CASCADE;
        DROP TABLE IF EXISTS notifications CASCADE;
        DROP TABLE IF EXISTS messages CASCADE;
        DROP TABLE IF EXISTS files CASCADE;
        DROP TABLE IF EXISTS requests CASCADE;
        DROP TABLE IF EXISTS subscriptions CASCADE;
        DROP TABLE IF EXISTS subscription_plans CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        
        DROP TYPE IF EXISTS activity_type CASCADE;
        DROP TYPE IF EXISTS payment_gateway CASCADE;
        DROP TYPE IF EXISTS payment_status CASCADE;
        DROP TYPE IF EXISTS testimonial_status CASCADE;
        DROP TYPE IF EXISTS referral_status CASCADE;
        DROP TYPE IF EXISTS affiliate_status CASCADE;
        DROP TYPE IF EXISTS notification_type CASCADE;
        DROP TYPE IF EXISTS file_status CASCADE;
        DROP TYPE IF EXISTS file_type CASCADE;
        DROP TYPE IF EXISTS request_priority CASCADE;
        DROP TYPE IF EXISTS request_status CASCADE;
        DROP TYPE IF EXISTS service_type CASCADE;
        DROP TYPE IF EXISTS subscription_status CASCADE;
        DROP TYPE IF EXISTS plan_status CASCADE;
        DROP TYPE IF EXISTS plan_duration CASCADE;
        DROP TYPE IF EXISTS user_status CASCADE;
        DROP TYPE IF EXISTS user_role CASCADE;
        
        DROP SEQUENCE IF EXISTS invoice_sequence CASCADE;
    `;

    try {
        await pool.query(dropSQL);
        console.log('✅ All tables dropped successfully!\n');
    } catch (error) {
        console.error('❌ Drop tables failed:', error.message);
        throw error;
    }
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'migrate';

    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful\n');

        switch (command) {
            case 'migrate':
                await runMigrations();
                break;

            case 'seed':
                await runSeeds();
                break;

            case 'fresh':
                await dropAllTables();
                await runMigrations();
                await runSeeds();
                break;

            case 'reset':
                await dropAllTables();
                await runMigrations();
                break;

            default:
                console.log('Usage:');
                console.log('  node migrate.js migrate  - Run migrations');
                console.log('  node migrate.js seed     - Run seeds');
                console.log('  node migrate.js fresh    - Drop, migrate, and seed');
                console.log('  node migrate.js reset    - Drop and migrate');
        }

        console.log('🎉 Database setup complete!');
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
