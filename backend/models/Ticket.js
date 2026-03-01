const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Dormitory', 'Lab Equipment', 'Internet', 'Classroom', 'Other']
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    remarks: { type: String, default: "" }, // Staff will update this
    attachmentUrl: { type: String, default: "" }, // Cloudinary image URL
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);