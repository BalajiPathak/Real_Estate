const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const PropertyData = require('../models/propertyData');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');
const UserPurchaseProperty = require('../models/userPurchaseProperty');
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

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
            isAgent: req.session.isAgent || false,
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
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const purchase = new UserPurchaseProperty({
            userId: req.session.user._id,
            propertyId: session.client_reference_id,
            transactionId: session.payment_intent,
            amount: session.amount_total / 100
        });
        
        await purchase.save();

        // Get property details for the email
        const property = await PropertyData.findById(session.client_reference_id);
        await transporter.sendMail({
            to: req.session.user.Email,
            from: '	balajipathak@startbitsolutions.com',
            subject: 'Property Purchase Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d3a033;">Purchase Confirmation</h2>
                    <p>Dear ${req.session.user.First_Name},</p>
                    <p>Thank you for your purchase! Here are your transaction details:</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333;">Property Details:</h3>
                        <p><strong>Property Name:</strong> ${property.name}</p>
                        <p><strong>Transaction ID:</strong> ${session.payment_intent}</p>
                        <p><strong>Amount Paid:</strong> $${(session.amount_total / 100).toLocaleString()}</p>
                    </div>

                    <p>If you have any questions about your purchase, please don't hesitate to contact us.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 12px;">
                            This is an automated email, please do not reply directly to this message.
                        </p>
                    </div>
                </div>
            `
        });

        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('property/success', {
            pageTitle: 'Purchase Successful',
            path: '/property/success',
            companyInfo: companyInfo,
            navbar: navbar,
            blogs: blogs,
            isLoggedIn: req.session.isLoggedIn,
            isAgent: req.session.isAgent || false,
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
            isLoggedIn: req.session.isLoggedIn,
            isAgent: req.session.isAgent || false,
        });
    } catch (err) {
        res.redirect('/properties');
    }
};