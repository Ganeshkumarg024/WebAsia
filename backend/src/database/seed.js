import { SubscriptionPlan, User } from '../models/index.js';

export const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database...');

        // Check if plans already exist
        const existingPlans = await SubscriptionPlan.count();
        if (existingPlans > 0) {
            console.log('⚠️  Database already seeded. Skipping...');
            return;
        }

        // Create subscription plans
        const plans = [
            {
                name: 'Startup',
                slug: 'startup',
                description: 'Perfect for startups and small businesses',
                price: 599,
                currency: 'INR',
                duration: 'weekly',
                activeRequestLimit: 1,
                monthlyGraphicsCredits: 5,
                monthlyVideoCredits: 0,
                monthlyWebCredits: 0,
                turnaroundHours: 48,
                features: {
                    unlimitedRevisions: true,
                    dedicatedDesigner: false,
                    prioritySupport: false,
                    brandGuidelines: false
                },
                isPublic: true,
                status: 'active'
            },
            {
                name: 'Standard',
                slug: 'standard',
                description: 'Most popular for growing businesses',
                price: 2999,
                currency: 'INR',
                duration: 'monthly',
                activeRequestLimit: 2,
                monthlyGraphicsCredits: 28,
                monthlyVideoCredits: 4,
                monthlyWebCredits: 0,
                turnaroundHours: 36,
                features: {
                    unlimitedRevisions: true,
                    dedicatedDesigner: true,
                    prioritySupport: false,
                    brandGuidelines: true
                },
                isPublic: true,
                status: 'active'
            },
            {
                name: 'Business',
                slug: 'business',
                description: 'For established businesses with high volume needs',
                price: 9999,
                currency: 'INR',
                duration: 'monthly',
                activeRequestLimit: 3,
                monthlyGraphicsCredits: 90,
                monthlyVideoCredits: 4,
                monthlyWebCredits: 1,
                turnaroundHours: 24,
                features: {
                    unlimitedRevisions: true,
                    dedicatedDesigner: true,
                    prioritySupport: true,
                    brandGuidelines: true,
                    accountManager: true
                },
                isPublic: true,
                status: 'active'
            },
            {
                name: 'Enterprise',
                slug: 'enterprise',
                description: 'Custom solutions for large organizations',
                price: 0, // Custom pricing
                currency: 'INR',
                duration: 'custom',
                activeRequestLimit: 10,
                monthlyGraphicsCredits: 999,
                monthlyVideoCredits: 20,
                monthlyWebCredits: 5,
                turnaroundHours: 12,
                features: {
                    unlimitedRevisions: true,
                    dedicatedDesigner: true,
                    prioritySupport: true,
                    brandGuidelines: true,
                    accountManager: true,
                    customIntegrations: true,
                    slaGuarantee: true
                },
                isPublic: false,
                status: 'active'
            }
        ];

        await SubscriptionPlan.bulkCreate(plans);
        console.log('✅ Created subscription plans');

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

        console.log('🌱 Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
};
