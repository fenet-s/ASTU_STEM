const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
require('dotenv').config();

async function updateStaffDepartment(email, department) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOneAndUpdate(
            { email, role: 'Staff' },
            { department },
            { new: true }
        );

        if (user) {
            console.log(`Successfully updated ${email} to department: ${department}`);
        } else {
            console.log(`Staff user with email ${email} not found.`);
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

// Example usage: node verify-dept.js staff@example.com Internet
const email = process.argv[2];
const dept = process.argv[3];

if (!email || !dept) {
    console.log('Usage: node verify-dept.js <email> <department>');
    process.exit(1);
}

updateStaffDepartment(email, dept);
