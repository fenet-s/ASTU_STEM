const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Student', 'Staff', 'Admin'], 
        default: 'Student' 
    },
    department: { type: String, default: 'General' } // e.g., ICT, Dormitory, Lab
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);