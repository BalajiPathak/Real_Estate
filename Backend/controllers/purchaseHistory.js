const UserPurchaseProperty = require('../models/userPurchaseProperty');
const PropertyData = require('../models/propertyData');  // Add this line
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');

exports.getPurchaseHistory = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const searchQuery = req.query.search || '';
        const isAjax = req.query.ajax === 'true';

        let query = { userId: req.session.user._id };
        
        if (searchQuery) {
            const propertyMatch = await PropertyData.find({
                name: { $regex: searchQuery, $options: 'i' }
            }).select('_id');

            const propertyIds = propertyMatch.map(p => p._id);

            query = {
                userId: req.session.user._id,
                $or: [
                    { propertyId: { $in: propertyIds } },
                    { transactionId: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }

        const totalItems = await UserPurchaseProperty.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        const purchases = await UserPurchaseProperty.find(query)
            .populate('propertyId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const validPurchases = purchases.filter(purchase => purchase.propertyId);

        if (isAjax) {
            return res.json({
                purchases: validPurchases,
                currentPage: page,
                totalPages,
                searchQuery
            });
        }

        res.render('property/purchase-history', {
            pageTitle: 'Purchase History',
            path: '/purchase-history',
            purchases: validPurchases,
            currentPage: page,
            totalPages,
            searchQuery,
            companyInfo: await CompanyInfo.findOne(),
            navbar: await Navbar.find(),
            blogs: await Blog.find(),
            isLoggedIn: req.session.isLoggedIn||false,
            isAgent: req.session.isAgent||false
        });
    } catch (error) {
        console.error('Purchase history error:', error);
        if (req.query.ajax === 'true') {
            return res.status(500).json({ error: 'Search failed' });
        }
        res.redirect('/home');
    }
};