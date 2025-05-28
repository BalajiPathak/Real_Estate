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
     let user = null;
 
    if (req.session.user) {
      user = await User.findById(req.session.user._id)
        .populate('is_subscribed');
 
      // Add current plan end date from the subscription object
      if (user.subscription?.endDate) {
        user.subscription.endDateFormatted = new Date(user.subscription.endDate).toLocaleDateString();
      }
      if (user.pendingSubscription?.endDate) {
        user.pendingSubscription.endDateFormatted = new Date(user.pendingSubscription.endDate).toLocaleDateString();
      }
    }
     
    
    res.render('plan/plans', {
        pageTitle: 'Real Estate',
      plans,
      isLoggedIn: req.session.isLoggedIn || false,
      isAgent: req.session?.isAgent || false,
     user: req.session.user || null,
     user,
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

    // Check if user has an active subscription
    const now = new Date();
    const hasActiveSubscription = user.subscription && 
      user.subscription.status === 'active' && 
      new Date(user.subscription.endDate) > now;

    let startDate, endDate;
    
    if (hasActiveSubscription) {
      // If there's an active subscription, set the new plan to start after current plan ends
      startDate = new Date(user.subscription.endDate);
      endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);
      
      // Store the pending subscription
      user.pendingSubscription = {
        planId: plan._id,
        planName: plan.name,
        startDate,
        endDate,
        status: 'pending'
      };
    } else {
      // If no active subscription, start the plan immediately
      startDate = new Date();
      endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
      
      user.subscription = {
        planId: plan._id,
        planName: plan.name,
        startDate,
        endDate,
        status: 'active'
      };
      user.is_subscribed = plan._id;
    }

    await user.save();

    // Send email notification
    await transporter.sendMail({
      to: user.Email,
      from: 'balajipathak@startbitsolutions.com',
      subject: hasActiveSubscription ? 'New Plan Purchase Confirmation' : 'Subscription Plan Confirmation',
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
            <p><strong>Start Date:</strong> ${startDate.toLocaleDateString()}</p>
            <p><strong>Valid Until:</strong> ${endDate.toLocaleDateString()}</p>
            ${hasActiveSubscription ? '<p><strong>Note:</strong> This plan will automatically activate after your current subscription ends.</p>' : ''}
          </div>
          <p>If you have any questions about your subscription, please don't hesitate to contact us.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply directly to this message.</p>
          </div>
        </div>
      `
    });

    req.session.user = user;

    // Fetch other required data for rendering
    const companyInfo = await CompanyInfo.findOne();
    const navbar = await Navbar.find();
    const blogs = await Blog.find();

    // Render success page
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


exports.activateFreePlan = async (req, res) => {
    try {
        const planId = req.params.id;
        const plan = await Plan.findById(planId);
        
        if (!plan) {
            return res.status(404).render('error', { message: 'Plan not found' });
        }

        // Verify this is actually a free plan
        if (plan.price !== 0) {
            return res.status(400).render('error', { message: 'Invalid plan activation attempt' });
        }

        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(404).render('error', { message: 'User not found' });
        }

        // Check if user has an active subscription
        const now = new Date();
        const hasActiveSubscription = user.subscription && 
            user.subscription.status === 'active' && 
            new Date(user.subscription.endDate) > now;

        let startDate, endDate;

        if (hasActiveSubscription) {
            // If there's an active subscription, set the free plan to start after current plan ends
            startDate = new Date(user.subscription.endDate);
            endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);
            
            // Store as pending subscription
            user.pendingSubscription = {
                planId: plan._id,
                planName: plan.name,
                startDate,
                endDate,
                status: 'pending'
            };
        } else {
            // If no active subscription, start the free plan immediately
            startDate = new Date();
            endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
            
            user.subscription = {
                planId: plan._id,
                planName: plan.name,
                startDate,
                endDate,
                status: 'active'
            };
            user.is_subscribed = plan._id;
        }

        await user.save();

        // Send email notification with appropriate message
        await transporter.sendMail({
            to: user.Email,
            from: 'balajipathak@startbitsolutions.com',
            subject: hasActiveSubscription ? 'Free Plan Activation Scheduled' : 'Free Plan Activated',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d3a033;">Plan ${hasActiveSubscription ? 'Schedule' : 'Activation'} Confirmation</h2>
                    <p>Dear ${user.First_Name},</p>
                    ${hasActiveSubscription ?
                        `<p>Your free plan has been scheduled to activate after your current subscription ends.</p>` :
                        `<p>Your free plan has been successfully activated!</p>`
                    }
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333;">Plan Details:</h3>
                        <p><strong>Plan Name:</strong> ${plan.name}</p>
                        <p><strong>Duration:</strong> ${plan.duration} days</p>
                        <p><strong>Start Date:</strong> ${startDate.toLocaleDateString()}</p>
                        <p><strong>Valid Until:</strong> ${endDate.toLocaleDateString()}</p>
                        ${hasActiveSubscription ?
                            `<p><strong>Note:</strong> This plan will automatically activate after your current subscription ends on ${user.subscription.endDate.toLocaleDateString()}.</p>` :
                            ''
                        }
                    </div>
                    <p>If you have any questions about your plan, please don't hesitate to contact us.</p>
                </div>
            `
        });

        // Update session
        req.session.user = user;

        // Redirect based on subscription status
        if (hasActiveSubscription) {
            req.flash('success', 'Free plan will be activated after your current subscription ends');
        } else {
            req.flash('success', 'Free plan activated successfully');
        }
        res.redirect('/plans');

    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server error' });
    }
};