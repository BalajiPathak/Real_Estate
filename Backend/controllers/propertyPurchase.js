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
            user: req.session.user,
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

        if (property.price > 999999.99) {
            return res.status(400).json({ 
                error: 'Property price exceeds online payment limit. Please contact our sales team for alternative payment methods.'
            });
        }

        // Create PaymentIntent instead of Checkout Session
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(property.price * 100),
            currency: 'usd',
            metadata: {
                propertyId: propertyId,
                propertyName: property.name,
                userEmail: req.session.user.Email
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Stripe payment intent error:', err);
        res.status(500).json({ error: 'Payment initialization failed' });
    }
};

exports.getSuccess = async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        if (!sessionId) {
            return res.redirect('/properties');
        }

        // Retrieve PaymentIntent instead of Session
        const paymentIntent = await stripe.paymentIntents.retrieve(sessionId);
        
        const purchase = new UserPurchaseProperty({
            userId: req.session.user._id,
            propertyId: paymentIntent.metadata.propertyId,
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            status: 'completed'
        });
        
        await purchase.save();

        // Update property status
        const property = await PropertyData.findById(paymentIntent.metadata.propertyId);
        if (property) {
            property.saleStatus = 'sold';
            await property.save();
        }

        // Updated email template to use paymentIntent instead of session
        await transporter.sendMail({
            to: req.session.user.Email,
            from: 'balajipathak@startbitsolutions.com',
            subject: 'Property Purchase Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d3a033;">Purchase Confirmation</h2>
                    <p>Dear ${req.session.user.First_Name},</p>
                    <p>Thank you for your purchase! Here are your transaction details:</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333;">Property Details:</h3>
                        <p><strong>Property Name:</strong> ${property.name}</p>
                        <p><strong>Transaction ID:</strong> ${paymentIntent.id}</p>
                        <p><strong>Amount Paid:</strong> $${(paymentIntent.amount / 100).toLocaleString()}</p>
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

        const [companyInfo, navbar, blogs] = await Promise.all([
            CompanyInfo.findOne(),
            Navbar.find(),
            Blog.find()
        ]);

        res.render('property/success', {
            pageTitle: 'Purchase Successful',
            path: '/property/success',
            companyInfo,
            navbar,
            blogs,
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