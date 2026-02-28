const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// GET /api/analytics — Staff & Admin only
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role === 'Student') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const [totalComplaints, activeUsers, categoryAgg, monthlyAgg, resolvedCount] = await Promise.all([
            Ticket.countDocuments(),
            User.countDocuments({ role: 'Student' }),
            Ticket.aggregate([
                { $group: { _id: '$category', value: { $sum: 1 } } },
                { $project: { _id: 0, name: '$_id', value: 1 } },
                { $sort: { value: -1 } }
            ]),
            // Resolution rate per month (last 6 months)
            Ticket.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%b', date: '$createdAt' } },
                        total: { $sum: 1 },
                        resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: '$_id',
                        rate: {
                            $cond: [
                                { $eq: ['$total', 0] }, 0,
                                { $round: [{ $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }, 0] }
                            ]
                        }
                    }
                },
                { $sort: { month: 1 } }
            ]),
            Ticket.countDocuments({ status: 'Resolved' })
        ]);

        // Calculate average resolution time in days (for resolved tickets)
        const resolvedTickets = await Ticket.find({ status: 'Resolved' }).select('createdAt updatedAt');
        const avgResolutionTime = resolvedTickets.length > 0
            ? Math.round(
                resolvedTickets.reduce((acc, t) => {
                    return acc + (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60 * 24);
                }, 0) / resolvedTickets.length
            )
            : 0;

        res.json({
            totalComplaints,
            activeUsers,
            avgResolutionTime,
            categoryStats: categoryAgg.length > 0 ? categoryAgg : [
                { name: 'Dormitory', value: 0 },
                { name: 'Lab Equipment', value: 0 },
                { name: 'Internet', value: 0 },
                { name: 'Classroom', value: 0 },
                { name: 'Other', value: 0 },
            ],
            resolutionRates: monthlyAgg.length > 0 ? monthlyAgg : [
                { month: 'Jan', rate: 0 }, { month: 'Feb', rate: 0 },
                { month: 'Mar', rate: 0 }, { month: 'Apr', rate: 0 },
                { month: 'May', rate: 0 }, { month: 'Jun', rate: 0 },
            ],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', details: err.message });
    }
});

module.exports = router;
