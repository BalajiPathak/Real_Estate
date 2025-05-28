const cron = require('node-cron');
const User = require('./models/user');

// Run every hour
cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        
        // Find users with active subscriptions that have expired
        const users = await User.find({
            'subscription.status': 'active',
            'subscription.endDate': { $lte: now },
            'pendingSubscription': { $exists: true, $ne: null }
        });

        for (const user of users) {
            if (user.pendingSubscription && user.pendingSubscription.status === 'pending') {
                // Activate the pending subscription
                user.subscription = {
                    planId: user.pendingSubscription.planId,
                    planName: user.pendingSubscription.planName,
                    startDate: user.pendingSubscription.startDate,
                    endDate: user.pendingSubscription.endDate,
                    status: 'active'
                };
                user.is_subscribed = user.pendingSubscription.planId;
                user.pendingSubscription = null;
                
                await user.save();
            }
        }
    } catch (error) {
        console.error('Error in subscription manager:', error);
    }
});