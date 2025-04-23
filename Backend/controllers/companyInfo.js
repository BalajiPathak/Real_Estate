const CompanyInfo = require('../models/companyInfo')

const createCompanyInfo = async (req, res) => {
    try {
        const existingCompany = await CompanyInfo.findOne();
        if (existingCompany) {
            return res.status(400).json({ 
                message: 'Company info already exists. Use update instead.' 
            });
        }

        const companyInfo = new CompanyInfo(req.body);
        const savedCompanyInfo = await companyInfo.save();
        
        res.status(201).json({
            message: 'Company info created successfully',
            companyInfo: savedCompanyInfo
        });
    } catch (error) {
        console.error('Error creating company info:', error);
        res.status(500).json({
            message: 'Error creating company info',
            error: error.message
        });
    }
};

const getCompanyInfo = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        if (!companyInfo) {
            return res.status(404).json({
                message: 'Company info not found'
            });
        }
        res.status(200).json(companyInfo);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching company info',
            error: error.message
        });
    }
};

module.exports = {
    createCompanyInfo,
    getCompanyInfo
};