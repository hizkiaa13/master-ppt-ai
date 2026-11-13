const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  saveHistory,
  getHistory,
  getHistoryById,
  deleteHistory,
  downloadHistory,
} = require('../controllers/historyController');

router.use(authMiddleware);

// POST /api/history/save - Simpan deck master final ke riwayat
router.post('/save', saveHistory);

// GET /api/history - Daftar riwayat master milik user
router.get('/', getHistory);

// GET /api/history/:id - Detail satu riwayat
router.get('/:id', getHistoryById);

// DELETE /api/history/:id - Hapus riwayat
router.delete('/:id', deleteHistory);

// GET & POST /api/history/:id/download - Unduh PPTX dari riwayat
router.get('/:id/download', downloadHistory);
router.post('/:id/download', downloadHistory);

module.exports = router;
