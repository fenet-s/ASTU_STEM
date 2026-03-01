const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// 1. SUBMIT A COMPLAINT (Student only)
router.post('/', [auth, upload.single('image')], async (req, res) => {
    try {
        const { title, description, category } = req.body;

        // Handle image upload to Cloudinary if file exists
        let attachmentUrl = "";
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'astu_complaints',
                resource_type: 'auto'
            });
            attachmentUrl = result.secure_url;

            // Delete local file after upload
            fs.unlinkSync(req.file.path);
        }

        const newTicket = new Ticket({
            student: req.user.id,
            title,
            description,
            category,
            attachmentUrl
        });

        const ticket = await newTicket.save();
        res.json({ msg: "Complaint submitted successfully!", ticket });
    } catch (err) {
        console.error("============= TICKET UPLOAD ERROR =============");
        console.error(err);
        console.error("===============================================");
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 2. VIEW MY COMPLAINTS (Student views their own history)
router.get('/my-tickets', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ student: req.user.id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
// 3. VIEW ALL TICKETS (Staff & Admin only)
router.get('/all', auth, async (req, res) => {
    try {
        // Check if user is Staff or Admin (Cybersecurity RBAC requirement)
        if (req.user.role === 'Student') {
            return res.status(403).json({ msg: "Access denied: Students cannot view all tickets" });
        }

        const tickets = await Ticket.find().populate('student', 'name email').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 4. UPDATE TICKET STATUS & REMARKS (Staff & Admin only)
router.patch('/:id', auth, async (req, res) => {
    try {
        const { status, remarks } = req.body;

        if (req.user.role === 'Student') {
            return res.status(403).json({ msg: "Students cannot update ticket status" });
        }

        let ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

        ticket.status = status || ticket.status;
        ticket.remarks = remarks || ticket.remarks;

        await ticket.save();
        res.json({ msg: "Ticket updated successfully", ticket });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;