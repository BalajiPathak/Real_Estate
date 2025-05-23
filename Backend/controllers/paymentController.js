require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const UserPurchaseProperty = require('../models/userPurchaseProperty');
const PaymentTransaction = require('../models/paymentTransaction');
const PropertyData = require('../models/propertyData');
const Agent = require('../models/agentAccount');

exports.handlePropertyPurchase = async (req, res) => {
    try {
        const { propertyId, userId, paymentMethodId } = req.body;

        // Get property and agent details
        const property = await PropertyData.findById(propertyId).populate('userId');
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const agent = await Agent.findById(property.userId);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        // Calculate shares
        const totalAmount = property.price;
        const agentShare = totalAmount * 0.7; // 70% to agent
        const companyShare = totalAmount * 0.3; // 30% to company

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, // Convert to cents
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            application_fee_amount: companyShare * 100, // Company's share
            transfer_data: {
                destination: agent.stripeAccountId,
            },
        });

        // Create purchase record
        const purchase = new UserPurchaseProperty({
            userId,
            propertyId,
            amount: totalAmount,
            status: 'completed',
            transactionId: paymentIntent.id
        });
        await purchase.save();

        // Create payment transaction record
        const transaction = new PaymentTransaction({
            agentId: property.userId,
            userId,
            propertyId,
            transactionId: paymentIntent.id,
            totalAmount,
            agentShare,
            ownerShare: companyShare,
            status: 'completed'
        });
        await transaction.save();

        // Update property status
        property.status = 'sold';
        await property.save();

        res.status(200).json({
            success: true,
            message: 'Purchase successful',
            purchase,
            transaction
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({
            success: false,
            message: 'Purchase failed',
            error: error.message
        });
    }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
    try {
        const transactions = await PaymentTransaction.find()
            .populate('agentId', 'name email')
            .populate('userId', 'name email')
            .populate('propertyId', 'name price');

        const stats = {
            totalTransactions: transactions.length,
            totalAmount: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
            totalAgentShare: transactions.reduce((sum, t) => sum + t.agentShare, 0),
            totalCompanyShare: transactions.reduce((sum, t) => sum + t.ownerShare, 0)
        };

        res.status(200).json({
            success: true,
            transactions,
            stats
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
};