const UserPurchaseProperty = require('../models/userPurchaseProperty');
const PropertyData = require('../models/propertyData');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');

exports.getPurchaseHistory = async (req, res) => {
    try {
        // Enhanced authentication check
        if (!req.session.isLoggedIn || !req.session.user) {
            req.flash('error', 'Please login to view purchase history');
            return res.redirect('/login');
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 5; 
        const searchQuery = req.query.search || '';
        const isAjax = req.query.ajax === 'true';

        let query = { userId: req.session.user._id };
        
        if (searchQuery) {
            try {
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
            } catch (searchError) {
                console.error('Search error:', searchError);
                if (isAjax) {
                    return res.status(400).json({ error: 'Invalid search query' });
                }
            }
        }

        const totalItems = await UserPurchaseProperty.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        // Validate page number
        if (page > totalPages && totalPages > 0) {
            return res.redirect(`/purchase-history?page=${totalPages}${searchQuery ? `&search=${searchQuery}` : ''}`);
        }

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

        const [companyInfo, navbar, blogs] = await Promise.all([
            CompanyInfo.findOne(),
            Navbar.find(),
            Blog.find()
        ]);

        res.render('property/purchase-history', {
            pageTitle: 'Purchase History',
            path: '/purchase-history',
            purchases: validPurchases,
            currentPage: page,
            totalPages,
            searchQuery,
            companyInfo,
            navbar,
            blogs,
            isLoggedIn: true, // Since we already checked authentication
            isAgent: req.session.isAgent || false,
            errorMessage: req.flash('error')
        });
    } catch (error) {
        console.error('Purchase history error:', error);
        if (isAjax) {
            return res.status(500).json({ error: 'Failed to fetch purchase history' });
        }
        req.flash('error', 'Failed to load purchase history');
        res.redirect('/home');
    }
};