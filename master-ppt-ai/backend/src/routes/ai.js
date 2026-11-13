const express = require('express');
const rateLimit = require('express-rate-limit');
const { generateAIContent, regenerateSlide } = require('../controllers/aiController');

const router = express.Router();

// Rate limiting khusus untuk endpoint AI: 60 generate/regenerate per 15 menit
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 60,
  message: {
    success: false,
    error: 'Terlalu banyak permintaan AI. Silakan coba lagi dalam 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Endpoint POST /api/ai/generate
router.post('/generate', aiLimiter, generateAIContent);

// Endpoint POST /api/ai/regenerate-slide
router.post('/regenerate-slide', aiLimiter, regenerateSlide);

module.exports = router;
