const Ticket = require("../models/Ticket");

// Read keys from multiple possible env names to be tolerant of .env
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || process.env.voyage_api_key || process.env.VOYAGE || process.env.voyage;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.gemini_api_key || process.env.GEMINI || process.env.gemini;
let voyageClient = null;
let ai = null;
let VOYAGE_MODEL = "voyage-3-lite";
let GEMINI_MODEL = "gemini-2.5-flash";

if (VOYAGE_API_KEY) {
    try {
        const { VoyageAIClient } = require("voyageai");
        voyageClient = new VoyageAIClient({ apiKey: VOYAGE_API_KEY });
    } catch (e) {
        console.warn('voyageai client not available:', e.message || e);
        voyageClient = null;
    }
}

if (GEMINI_API_KEY) {
    try {
        const { GoogleGenAI } = require("@google/genai");
        ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    } catch (e) {
        console.warn('@google/genai client not available:', e.message || e);
        ai = null;
    }
}

// Helper: Cosine similarity
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

exports.askQuestion = async (user, question) => {
    // 1. Fetch relevant tickets based on role
    let tickets;
    if (user.role === 'Student') {
        tickets = await Ticket.find({ student: user.id });
    } else {
        tickets = await Ticket.find().populate('student', 'name email');
    }

    if (tickets.length === 0) {
        return "You don't have any tickets in the system yet.";
    }

    // 2. Prepare text to embed for each ticket
    const ticketTexts = tickets.map(t => {
        let text = `Ticket ID: ${t._id}\nTitle: ${t.title}\nCategory: ${t.category}\nStatus: ${t.status}\nDescription: ${t.description}\nRemarks: ${t.remarks || 'None'}`;
        if (t.student && t.student.name) {
            text += `\nStudent: ${t.student.name} (${t.student.email})`;
        }
        text += `\nCreated At: ${new Date(t.createdAt).toLocaleDateString()}`;
        return text;
    });

    // If embedding client is available, use semantic search. Otherwise fallback to simple keyword scoring.
    let topContexts = [];

    if (voyageClient) {
        try {
            const docResponse = await voyageClient.embed({
                input: ticketTexts,
                model: VOYAGE_MODEL,
                inputType: "document"
            });

            const queryResponse = await voyageClient.embed({
                input: [question],
                model: VOYAGE_MODEL,
                inputType: "query"
            });

            const docEmbeddings = docResponse.data;
            const queryEmbedding = queryResponse.data[0].embedding;

            const similarities = docEmbeddings.map((doc, index) => {
                return {
                    ticket: tickets[index],
                    text: ticketTexts[index],
                    similarity: cosineSimilarity(queryEmbedding, doc.embedding)
                };
            });

            similarities.sort((a, b) => b.similarity - a.similarity);
            topContexts = similarities.slice(0, 5);
        } catch (e) {
            console.warn('Voyage embedding failed, falling back to keyword search:', e.message || e);
        }
    }

    if (!topContexts || topContexts.length === 0) {
        // Simple keyword-based scoring fallback
        const q = question.toLowerCase();
        const scored = ticketTexts.map((text, idx) => {
            const score = (text.toLowerCase().includes(q) ? 2 : 0)
                + (text.split(q).length - 1);
            return { ticket: tickets[idx], text: ticketTexts[idx], similarity: score };
        });
        scored.sort((a, b) => b.similarity - a.similarity);
        topContexts = scored.slice(0, 5);
    }

    const contextString = topContexts.map(c => c.text).join("\n\n---\n\n");

    const prompt = `You are a helpful and professional assistant for the ASTU Complaint System.
You are answering a question from a user named ${user.name} (Role: ${user.role}).

Here is the relevant ticket data retrieved from the database based on semantic search:
${contextString}

Based on the ticket data provided above, answer the user's question concisely and accurately.
If the answer cannot be found in the provided tickets, state that you don't have enough information regarding that. Do not hallucinate data that is not present in the context.

User Question: ${question}
`;

    if (!ai) {
        // Return a safe response with context when LLM not configured
        return {
            answer: "LLM not configured. Returning retrieved contexts.",
            contexts: topContexts.map(c => ({ title: c.ticket.title, text: c.text }))
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });
        // response.text may be undefined in some client shapes
        return response.text || response.output?.[0]?.content || JSON.stringify(response);
    } catch (e) {
        console.error('Gemini generation failed:', e.message || e);
        return {
            answer: 'LLM call failed; returning retrieved contexts',
            contexts: topContexts.map(c => ({ title: c.ticket.title, text: c.text }))
        };
    }
};
