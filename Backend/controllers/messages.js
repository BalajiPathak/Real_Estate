const mongoose = require('mongoose');
const UserMessage = require('../models/userMessage');
const AgentMessage = require('../models/agentMessage');
const User = require('../models/user');
const UserType = require('../models/userType');
const PropertyData = require('../models/propertyData'); // Changed from Property to PropertyData
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');

// Update the getChatView method
exports.getChatView = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const property = await PropertyData.findById(propertyId);  // Changed from Property to PropertyData
        
        // Fetch required data for layout
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();
        
        if (!property) {
            return res.status(404).render('404', {
                pageTitle: 'Property Not Found',
                path: '/404',
                isLoggedIn: req.session.isLoggedIn,
                companyInfo,
                navbar,
                blogs
            });
        }

        const messages = await UserMessage.find({
            propertyId: propertyId,
            $or: [
                { userId: req.user._id },
                { agentId: req.user._id }
            ]
        })
        .populate({
            path: 'propertyId',
            model: 'PropertyData',
            select: 'name'
        })
        .populate('userId', 'First_Name Last_Name')
        .populate('agentId', 'First_Name Last_Name')
        .sort({ timestamp: -1 }) // Change to -1 for newest at bottom
        .exec();

        // Reverse the array to show oldest at top, newest at bottom
        messages.reverse();

        res.render('messages/chat', {
            pageTitle: 'Property Chat',
            path: '/messages',
            property: property,
            messages: messages,
            currentUser: req.user,
            isAgent: req.session.isAgent,
            isLoggedIn: req.session.isLoggedIn,
            companyInfo,
            navbar,
            blogs,
            errorMessage: null,
            validationErrors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error loading chat view:', error);
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();
        
        res.status(500).render('500', {
            pageTitle: 'Error',
            path: '/500',
            isLoggedIn: req.session.isLoggedIn,
            companyInfo,
            navbar,
            blogs
        });
    }
};

exports.getPropertyMessages = async (req, res) => {
    try {
        const messages = await UserMessage.find({
            propertyId: req.params.propertyId,
            $or: [
                { userId: req.user._id },
                { agentId: req.user._id }
            ]
        })
        .populate({
            path: 'propertyId',
            model: 'PropertyData',
            select: 'name'
        })
        .populate('agentId', 'First_Name Last_Name')
        .sort({ timestamp: -1 })
        .exec();

        // Reverse the array to show oldest at top, newest at bottom
        messages.reverse();
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Helper function to get agent for a property
async function getPropertyAgent(propertyId) {
    try {
        const property = await PropertyData.findById(propertyId).populate({
            path: 'userId',
            populate: {
                path: 'user_type_id'
            }
        });

        if (!property) {
            throw new Error('Property not found');
        }

        // First try to get agent from property owner
        if (property.userId?.user_type_id?.user_type_name === 'agent') {
            return property.userId;
        }

        // If property owner is not an agent, find first available agent
        const agent = await User.findOne({
            'user_type_id': { $exists: true }
        }).populate({
            path: 'user_type_id',
            match: { user_type_name: 'agent' }
        });

        if (!agent || !agent.user_type_id) {
            throw new Error('No agent available');
        }

        return agent;
    } catch (error) {
        throw error;
    }
}

exports.postUserMessage = async (req, res) => {
    try {
        const { content, propertyId } = req.body;
        
        if (!propertyId) {
            return res.status(400).json({ error: 'PropertyId is required' });
        }

        // Get the property first
        const property = await PropertyData.findById(propertyId);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Get the agent for this property
        const agent = await getPropertyAgent(propertyId);

        const message = new UserMessage({
            content,
            userName: `${req.session.user.First_Name} ${req.session.user.Last_Name}`,
            userId: req.session.user._id,
            agentId: agent._id,
            propertyId: propertyId, // Ensure propertyId is explicitly set
            timestamp: new Date()
        });

        await message.save();

        // Emit socket events with property name
        if (req.io) {
            const messageData = {
                ...message.toObject(),
                propertyName: property.name
            };

            req.io.to(`user_${req.session.user._id}`).emit('newMessage', messageData);
            req.io.to(`agent_${agent._id}`).emit('newMessage', messageData);
        }

        res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.postAgentReply = async (req, res) => {
    try {
        const { content, userId: rawUserId, propertyId } = req.body;

        if (!req.session.isAgent) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const property = await PropertyData.findById(propertyId);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const userId = typeof rawUserId === 'object' && rawUserId._id
            ? rawUserId._id
            : rawUserId;

        // Save message with proper agent information
        const message = new UserMessage({
            content,
            userName: `${req.user.First_Name} ${req.user.Last_Name}`,
            userId,
            agentId: req.user._id,
            propertyId,
            timestamp: new Date(),
            isAgentReply: true
        });

        await message.save();

        // Populate all necessary fields
        const populatedMessage = await UserMessage.findById(message._id)
            .populate('propertyId', 'name')
            .populate('userId', 'First_Name Last_Name')
            .populate('agentId', 'First_Name Last_Name');

        const messageData = populatedMessage.toObject();

        if (req.io) {
            req.io.to(`user_${userId}`).emit('newMessage', messageData);
            req.io.to(`agent_${req.user._id}`).emit('newMessage', messageData);
        }

        res.status(201).json({ success: true, message: messageData });
    } catch (error) {
        console.error('Error sending agent reply:', error);
        res.status(500).json({ error: error.message });
    }
};

// In getUserMessages function
exports.getUserMessages = async (req, res) => {
    try {
        const messages = await UserMessage.find({
            $or: [
                { userId: req.user._id },
                { agentId: req.user._id }
            ]
        })
        .populate({
            path: 'propertyId',
            model: 'PropertyData',
            select: 'name _id'  // Make sure to select _id
        })
        .populate('agentId', 'First_Name Last_Name')
        .populate('userId', 'First_Name Last_Name')
        .sort({ timestamp: 1 })
        .exec();

        // Filter out messages with null propertyId
        const validMessages = messages.filter(message => message.propertyId);
        
        res.json(validMessages);
    } catch (error) {
        console.error('Error fetching user messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

exports.getAgentMessages = async (req, res) => {
    try {
        const messages = await AgentMessage.find({
            agentId: req.user._id
        })
        .populate({
            path: 'propertyId',
            model: 'PropertyData',
            select: 'name'
        })
        .populate('userId', 'First_Name Last_Name')
        .sort({ timestamp: 1 });
        
        res.json(messages);
    } catch (error) {
        console.error('Error fetching agent messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};