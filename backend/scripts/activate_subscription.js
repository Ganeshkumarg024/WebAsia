import { sequelize, User, SubscriptionPlan, Subscription } from '../src/models/index.js';
import { v4 as uuidv4 } from 'uuid';

const activateSubscription = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'Testaf@gmail.com';
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${user.firstName} ${user.lastName} (${user.id})`);

        // Check for existing plan or create one
        let plan = await SubscriptionPlan.findOne({ where: { slug: 'professional-monthly' } });
        if (!plan) {
            console.log('Creating default Professional Plan...');
            plan = await SubscriptionPlan.create({
                name: 'Professional',
                slug: 'professional-monthly',
                description: 'For growing businesses',
                price: 49999,
                currency: 'INR',
                duration: 'monthly',
                activeRequestLimit: 2,
                monthlyGraphicsCredits: 10,
                monthlyVideoCredits: 5,
                monthlyWebCredits: 2,
                turnaroundHours: 48,
                features: {
                    'unlimited_requests': true,
                    'dedicated_manager': true
                }
            });
        }

        console.log(`Using plan: ${plan.name} (${plan.id})`);

        // Check for existing active subscription
        const existingSub = await Subscription.findOne({
            where: {
                userId: user.id,
                status: 'active'
            }
        });

        if (existingSub) {
            console.log('User already has an active subscription.');
            console.log('Subscription ID:', existingSub.id);
        } else {
            console.log('Creating new subscription...');
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            const subscription = await Subscription.create({
                userId: user.id,
                planId: plan.id,
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                nextBillingDate: endDate,
                autoRenew: true,
                graphicsCreditsRemaining: plan.monthlyGraphicsCredits,
                videoCreditsRemaining: plan.monthlyVideoCredits,
                webCreditsRemaining: plan.monthlyWebCredits,
                creditsResetDate: endDate,
                paymentMethod: 'Manual Activation',
                paymentId: `S-${Date.now()}`
            });
            console.log('Subscription activated successfully!');
            console.log('Subscription ID:', subscription.id);
        }

    } catch (error) {
        console.error('Error activating subscription:', error);
    } finally {
        await sequelize.close();
    }
};

activateSubscription();
