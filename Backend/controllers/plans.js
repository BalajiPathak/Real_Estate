const mongoose = require('mongoose');
const Plan=require('../models/plans');
const User=require('../models/user');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    const companyInfo = await CompanyInfo.findOne();
    const navbar = await Navbar.find();
    const blogs = await Blog.find();
    res.render('plan/plans', {
        pageTitle: 'Real Estate',
      plans,
      isLoggedIn: req.session.isLoggedIn || false,
      isAgent: req.session?.isAgent || false,
     user: req.session.user || null,
      companyInfo: companyInfo || [],
      navbar: navbar || [],
      blogs: blogs || []
    });
  } catch (err) {
    res.status(500).render('error', { message: 'Server error' });
  }
};



exports.getPurchaseForm = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).render('error', { message: 'Plan not found' });
        }

        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('plan/purchase', {
            pageTitle: 'Purchase Plan',
            plan: plan,
             isLoggedIn: req.session.isLoggedIn || false,
      isAgent: req.session?.isAgent || false,
            user: req.session.user,
            stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
            companyInfo: companyInfo || [],
            navbar: navbar || [],
            blogs: blogs || []
        });
    } catch (err) {
        res.status(500).render('error', { message: 'Server error' });
    }
};

exports.purchasePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: plan.price * 100,
            currency: 'usd',
            metadata: {
                planId: plan._id.toString(),
                userId: req.session.user._id.toString()
            }
        });

        res.json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.purchaseSuccess = async (req, res) => {
  try {
   
    const planId = req.params.id;

    
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).render('error', { message: 'Plan not found' });
    }

    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    // Update user subscription
    const startDate = new Date();
    const endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

    user.subscription = {
      planId: plan._id,
      planName: plan.name,
      startDate,
      endDate,
      status: 'active'
    };
    user.is_subscribed = plan._id;

    await user.save();

    await transporter.sendMail({
      to: user.Email,
      from: 'balajipathak@startbitsolutions.com',
      subject: 'Subscription Plan Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d3a033;">Subscription Confirmation</h2>
          <p>Dear ${user.First_Name},</p>
          <p>Thank you for subscribing! Here are your subscription details:</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333;">Plan Details:</h3>
            <p><strong>Plan Name:</strong> ${plan.name}</p>
            <p><strong>Duration:</strong> ${plan.duration} days</p>
            <p><strong>Amount Paid:</strong> $${plan.price.toLocaleString()}</p>
            <p><strong>Valid Until:</strong> ${endDate.toLocaleDateString()}</p>
          </div>
          <p>If you have any questions about your subscription, please don't hesitate to contact us.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply directly to this message.</p>
          </div>
        </div>
      `
    });

    
    req.session.user = user;

    
    const companyInfo = await CompanyInfo.findOne();
    const navbar = await Navbar.find();
    const blogs = await Blog.find();

    
    res.render('plan/success', {
      pageTitle: 'Subscription Activated',
      plan,
      user,
      isLoggedIn: req.session.isLoggedIn || false,
      isAgent: req.session?.isAgent || false,
      companyInfo: companyInfo || [],
      navbar: navbar || [],
      blogs: blogs || []
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
};