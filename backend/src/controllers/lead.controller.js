
import { Lead } from '../models/index.js';
import { Op } from 'sequelize';

export const getAllLeads = async (req, res) => {
    try {
        const { status, search, limit = 50, offset = 0 } = req.query;
        const where = {};

        if (status) where.status = status;

        if (search) {
            where[Op.or] = [
                { company: { [Op.iLike]: `%${search}%` } },
                { contactName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const leads = await Lead.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalCount = await Lead.count({ where });

        res.json({
            success: true,
            data: leads,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Get all leads error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch leads' } });
    }
};

export const createLead = async (req, res) => {
    try {
        const { company, contactName, email, phone, projectType, budget, notes } = req.body;

        const lead = await Lead.create({
            company,
            contactName,
            email,
            phone,
            projectType,
            budget,
            notes,
            status: 'new'
        });

        res.status(201).json({ success: true, message: 'Lead created successfully', data: lead });
    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to create lead' } });
    }
};

export const updateLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const lead = await Lead.findByPk(id);
        if (!lead) return res.status(404).json({ success: false, error: { message: 'Lead not found' } });

        await lead.update({ status });

        res.json({ success: true, message: 'Lead status updated successfully', data: lead });
    } catch (error) {
        console.error('Update lead status error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to update lead status' } });
    }
};

export const createQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, notes } = req.body;

        const lead = await Lead.findByPk(id);
        if (!lead) return res.status(404).json({ success: false, error: { message: 'Lead not found' } });

        // In a real app, this might create a separate Quote record.
        // For now, we update the lead status to 'quoted' and append notes.
        await lead.update({
            status: 'quoted',
            budget: amount, // Update budget to quoted amount
            notes: lead.notes ? `${lead.notes}\n\nQuote: ${notes}` : `Quote: ${notes}`
        });

        res.json({ success: true, message: 'Quote created successfully', data: lead });
    } catch (error) {
        console.error('Create quote error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to create quote' } });
    }
};
