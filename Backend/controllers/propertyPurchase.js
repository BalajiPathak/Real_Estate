const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PropertyData = require('../models/propertyData');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');
const UserPurchaseProperty = require('../models/userPurchaseProperty');

exports.getPropertyPurchase = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const property = await PropertyData.findById(propertyId);
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        if (!property) {
            return res.redirect('/properties');
        }

        res.render('property/purchase', {
            pageTitle: 'Purchase Property',
            path: '/property/purchase',
            property: property,
            companyInfo: companyInfo,
            navbar: navbar,
            blogs: blogs,
            isLoggedIn: req.session.isLoggedIn,
            stripePublicKey: process.env.STRIPE_PUBLIC_KEY
        });
    } catch (err) {
        console.error('Property purchase error:', err);
        res.redirect('/properties');
    }
};

exports.postPropertyPurchase = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const property = await PropertyData.findById(propertyId);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Check if property price exceeds Stripe's limit
        if (property.price > 999999.99) {
            return res.status(400).json({ 
                error: 'Property price exceeds online payment limit. Please contact our sales team for alternative payment methods.'
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: property.name,
                            description: property.description,
                        },
                        unit_amount: Math.round(property.price * 100), // Ensure amount is rounded
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/property/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/property/purchase/cancel`,
            customer_email: req.session.user.Email,
            client_reference_id: propertyId,
        });

        res.json({ id: session.id });
    } catch (err) {
        console.error('Stripe session error:', err);
        res.status(500).json({ error: 'Payment session creation failed' });
    }
};

exports.getSuccess = async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        if (!sessionId) {
            return res.redirect('/properties');
        }

        // Retrieve the session to get payment details
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        // Create purchase record
        const purchase = new UserPurchaseProperty({
            userId: req.session.user._id,
            propertyId: session.client_reference_id,
            transactionId: session.payment_intent,
            amount: session.amount_total / 100
        });
        
        await purchase.save();

        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('property/success', {
            pageTitle: 'Purchase Successful',
            path: '/property/success',
            companyInfo: companyInfo,
            navbar: navbar,
            blogs: blogs,
            isLoggedIn: req.session.isLoggedIn
        });
    } catch (err) {
        console.error('Purchase record error:', err);
        res.redirect('/properties');
    }
};


exports.getCancel = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('property/cancel', {
            pageTitle: 'Purchase Cancelled',
            path: '/property/cancel',
            companyInfo: companyInfo,
            navbar: navbar,
            blogs: blogs,
            isLoggedIn: req.session.isLoggedIn
        });
    } catch (err) {
        res.redirect('/properties');
    }
};