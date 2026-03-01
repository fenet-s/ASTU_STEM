const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// --- User Management Routes (Admin Only) ---

// 1. GET ALL USERS
router.get('/', [auth], async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: "Access denied: Admins only" });
        }
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        // Map _id to id for frontend compatibility
        const mappedUsers = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department
        }));

        res.json(mappedUsers);
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).send('Server Error');
    }
});

// 2. UPDATE USER ROLE/DEPARTMENT
router.patch('/:id', [auth], async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: "Access denied: Admins only" });
        }
        const { role, department } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (role) user.role = role;
        if (department) user.department = department;

        await user.save();
        res.json({ msg: "User updated successfully", user: { id: user._id, role: user.role, department: user.department } });
    } catch (err) {
        console.error("Update User Error:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
