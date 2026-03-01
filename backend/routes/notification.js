const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET ALL NOTIFICATIONS FOR USER
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId: userId.toString() })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// MARK ALL AS READ
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id }, { isRead: true });
        res.json({ msg: "All notifications marked as read" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
