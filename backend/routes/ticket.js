const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const Notification = require('../models/Notification');

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

        // NOTIFY STAFF in the department AND ALL ADMINS
        try {
            console.log(`DEBUG: Looking for Staff in department: ${category} AND all Admins`);
            // Find staff in department OR any Admin
            const recipients = await User.find({
                $or: [
                    { role: 'Staff', department: category },
                    { role: 'Admin' }
                ]
            });

            console.log(`DEBUG: Found ${recipients.length} recipients to notify.`);
            const notifications = recipients.map(user => ({
                userId: user._id,
                title: "New Complaint Submitted",
                message: `A new ${category} complaint has been submitted: "${title}"`,
                link: `/ticket-management`
            }));

            if (notifications.length > 0) {
                const created = await Notification.insertMany(notifications);
                console.log(`DEBUG: Successfully created ${created.length} notifications.`);
            }
        } catch (nErr) {
            console.error("DEBUG: Notification Error:", nErr);
        }

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
        // Fetch LIVE user data to avoid stale JWT issues
        const user = await User.findById(req.user.id);
        if (!user || user.role === 'Student') {
            return res.status(403).json({ msg: "Access denied" });
        }

        const query = {};
        console.log(`DEBUG: Live User Check - Name: ${user.name}, Role: ${user.role}, Dept: ${user.department}`);

        if (user.role === 'Staff') {
            if (user.department && user.department !== 'General') {
                query.category = user.department;
            } else {
                query.category = 'Other';
            }
        }

        console.log("DEBUG: Generated Query:", query);
        const tickets = await Ticket.find(query).populate('student', 'name email').sort({ createdAt: -1 });
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

        // NOTIFY STUDENT
        try {
            await new Notification({
                userId: ticket.student.toString(), // Ensure string ID
                title: "Ticket Status Updated",
                message: `Your ticket "${ticket.title}" is now "${ticket.status}".`,
                link: `/my-tickets`
            }).save();
        } catch (nErr) {
            console.error("Student Notification Error:", nErr);
        }

        res.json({ msg: "Ticket updated successfully", ticket });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;