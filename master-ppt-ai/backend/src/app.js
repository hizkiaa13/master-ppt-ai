require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const themeRoutes = require('./routes/theme');
const pptxRoutes = require('./routes/pptx');
const draftRoutes = require('./routes/draft');
const aiRoutes = require('./routes/ai');

const app = express();

// ─── Security Middleware ───────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ───────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null].filter(Boolean)
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ─── Rate Limiting ──────────────────────────────────────────
const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const loginMax = parseInt(process.env.RATE_LIMIT_LOGIN_MAX, 10) || 20;
const registerMax = parseInt(process.env.RATE_LIMIT_REGISTER_MAX, 10) || 10;
const apiMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000;

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs,
  max: isDevelopment ? 5000 : loginMax,
  message: {
    success: false,
    error: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => isDevelopment,
});

// Rate limiter for register endpoint
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 5000 : registerMax,
  message: {
    success: false,
    error: 'Terlalu banyak akun dibuat dari IP ini. Silakan coba lagi nanti.',
    message: 'Terlalu banyak akun dibuat dari IP ini. Silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => isDevelopment,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs,
  max: isDevelopment ? 10000 : apiMax,
  message: {
    success: false,
    error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
    message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => isDevelopment,
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api', apiLimiter);

// Dev endpoint to clear rate limits
app.post('/api/admin/clear-rate-limit', (req, res) => {
  if (!isDevelopment) {
    return res.status(403).json({ success: false, error: 'Hanya tersedia di development mode' });
  }
  return res.json({ success: true, message: 'Rate limit store cleared' });
});

// ─── Body Parser ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/pptx', pptxRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/ai', aiRoutes);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Master PPT AI API is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Initialize DB on first request (serverless) ─────────────
let dbInitialized = false;
const originalListen = app.listen.bind(app);

// For local development
function startServer() {
  const PORT = process.env.PORT || 5000;
  try {
    initializeDatabase().then(() => {
      dbInitialized = true;
      const server = originalListen(PORT, () => {
        console.log('');
        console.log('🚀 =========================================');
        console.log(`   Master PPT AI - Backend Server`);
        console.log(`   Running on: http://localhost:${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('   Database: Supabase (PostgreSQL)');
        console.log('   =========================================');
        console.log('');
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`\n❌ Error: Port ${PORT} sudah digunakan oleh proses lain!`);
          console.error(`   Server backend kemungkinan besar SUDAH BERJALAN di latar belakang.`);
          console.error(`   Cek proses dengan: netstat -ano | findstr :${PORT}\n`);
        } else {
          console.error('❌ Server error:', err);
        }
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

// Export for Vercel serverless
module.exports = app;
module.exports.startServer = startServer;
