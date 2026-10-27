const express = require('express');
const rateLimit = require('express-rate-limit');
const { generateAIContent } = require('../controllers/aiController');

const router = express.Router();

// Rate limiting khusus untuk endpoint AI: 20 generate per 15 menit
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 20, // 20 generate per 15 menit per user
  message: {
    success: false,
    error: 'Terlalu banyak permintaan AI. Silakan coba lagi dalam 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Endpoint POST /api/ai/generate
router.post('/generate', aiLimiter, generateAIContent);

module.exports = router;
