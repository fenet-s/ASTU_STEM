import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Logging Middleware ---
app.use('/api', (req, res, next) => {
    console.log(`📡 API Request: ${req.method} ${req.url}`);
    next();
});

// --- Models ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['Student', 'Staff', 'Admin'],
        default: 'Student'
    },
    department: { type: String, default: 'General' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

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
    remarks: { type: String, default: "" },
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', TicketSchema);

// --- Router Setup ---
const apiRouter = express.Router();

// --- Middleware ---
const dbCheck = (req: any, res: any, next: any) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            msg: "Database not connected.",
            details: "The MONGO_URI environment variable is missing or the connection failed. Please configure it in the Secrets panel."
        });
    }
    next();
};

const auth = (req: any, res: any, next: any) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// --- Auth Routes ---
apiRouter.post('/auth/register', dbCheck, async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, role, department });
        await user.save();
        res.status(201).json({ msg: "User registered successfully" });
    } catch (err: any) {
        console.error("Register Error:", err);
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/auth/login', dbCheck, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err: any) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- Analytics Route ---
apiRouter.get('/analytics', [auth, dbCheck], async (req: any, res: any) => {
    console.log("📊 Analytics request received from user:", req.user.id);
    try {
        if (req.user.role === 'Student') {
            return res.status(403).json({ msg: "Access denied" });
        }

        const totalComplaints = await Ticket.countDocuments();
        const activeUsers = await User.countDocuments();

        const categoryStats = await Ticket.aggregate([
            { $group: { _id: "$category", value: { $sum: 1 } } },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Ticket.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: 1 },
                    resolved: {
                        $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const resolutionRates = monthlyStats.map(stat => ({
            month: monthNames[stat._id - 1],
            rate: Math.round((stat.resolved / stat.total) * 100)
        }));

        const resolvedTickets = await Ticket.find({ status: 'Resolved' });
        let avgTime = 0;
        if (resolvedTickets.length > 0) {
            const totalTime = resolvedTickets.reduce((acc, ticket: any) => {
                return acc + (ticket.updatedAt.getTime() - ticket.createdAt.getTime());
            }, 0);
            avgTime = totalTime / resolvedTickets.length / (1000 * 60 * 60 * 24);
        }

        res.json({
            totalComplaints,
            activeUsers,
            avgResolutionTime: avgTime.toFixed(1),
            categoryStats,
            resolutionRates
        });
    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).send('Server Error');
    }
});

// --- Ticket Routes ---
apiRouter.post('/tickets', [auth, dbCheck], async (req: any, res: any) => {
    try {
        const { title, description, category } = req.body;
        const newTicket = new Ticket({
            student: req.user.id,
            title,
            description,
            category
        });
        const ticket = await newTicket.save();
        res.json({ msg: "Complaint submitted successfully!", ticket });
    } catch (err) {
        console.error("Submit Ticket Error:", err);
        res.status(500).send('Server Error');
    }
});

apiRouter.get('/tickets/my-tickets', [auth, dbCheck], async (req: any, res: any) => {
    try {
        const tickets = await Ticket.find({ student: req.user.id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error("Get My Tickets Error:", err);
        res.status(500).send('Server Error');
    }
});

apiRouter.get('/tickets/all', [auth, dbCheck], async (req: any, res: any) => {
    try {
        if (req.user.role === 'Student') {
            return res.status(403).json({ msg: "Access denied" });
        }
        const tickets = await Ticket.find().populate('student', 'name email').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error("Get All Tickets Error:", err);
        res.status(500).send('Server Error');
    }
});

apiRouter.patch('/tickets/:id', [auth, dbCheck], async (req: any, res: any) => {
    try {
        const { status, remarks } = req.body;
        if (req.user.role === 'Student') {
            return res.status(403).json({ msg: "Access denied" });
        }
        let ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ msg: "Ticket not found" });
        ticket.status = status || ticket.status;
        ticket.remarks = remarks || ticket.remarks;
        await ticket.save();
        res.json({ msg: "Ticket updated successfully", ticket });
    } catch (err) {
        console.error("Update Ticket Error:", err);
        res.status(500).send('Server Error');
    }
});

// --- RAG Route Proxy (Forwarding to Backend Port 5000) ---
apiRouter.post('/rag', auth, async (req: any, res: any) => {
    console.log("🟢 Incoming RAG request to frontend server:", req.body);
    try {
        const fetch = (await import('node-fetch')).default;

        const response = await fetch('http://localhost:5000/api/rag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(req.header('x-auth-token') ? { 'x-auth-token': req.header('x-auth-token') } : {})
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err: any) {
        console.error("RAG Proxy Error:", err);
        return res.status(500).json({ msg: "Failed to communicate with RAG backend service.", details: err.message });
    }
});

// --- Mount Router ---
apiRouter.get('/ping', (req, res) => res.json({ msg: 'pong', time: new Date().toISOString() }));
app.use('/api', apiRouter);

// --- API 404 Catch-all ---
app.use('/api/*', (req, res) => {
    console.warn(`🚫 API Route Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ msg: "API endpoint not found" });
});

// --- Vite & Server Start ---
async function startServer() {
    const PORT = 3000;

    // Database Connection (Lazy)
    const MONGO_URI = process.env.MONGO_URI;
    if (MONGO_URI) {
        mongoose.connect(MONGO_URI)
            .then(() => console.log("✅ ASTU MongoDB Connected"))
            .catch(err => console.log("❌ Connection Error:", err));
    } else {
        console.warn("⚠️ MONGO_URI not set. Database operations will fail.");
    }

    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static(path.join(process.cwd(), "dist")));
        app.get("*", (req, res) => {
            res.sendFile(path.join(process.cwd(), "dist/index.html"));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

startServer();
