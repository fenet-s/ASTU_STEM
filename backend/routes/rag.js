const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ragService = require('../services/ragService');

// POST /api/rag
// Body: { "question": "your question here" }
router.post('/', auth, async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || typeof question !== 'string') {
            return res.status(400).json({ msg: "Please provide a valid 'question' in the request body." });
        }

        const answer = await ragService.askQuestion(req.user, question);

        res.json({ answer });
    } catch (err) {
        console.error("RAG Error:", err);
        res.status(500).json({ msg: "Failed to generate AI response", details: err.message });
    }
});

module.exports = router;
