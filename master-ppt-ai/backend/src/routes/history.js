const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const {
  getHistory,
  downloadPPTX,
} = require('../controllers/pptxController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/history - Daftar riwayat
router.get('/', getHistory);

// GET /api/history/:id - Detail riwayat
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: history, error } = await supabase
      .from('master_histories')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (error || !history) {
      return res.status(404).json({ success: false, message: 'Riwayat tidak ditemukan.' });
    }

    return res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get history detail error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail riwayat.' });
  }
});

// GET /api/history/:id/download - Unduh PPTX dari riwayat
router.get('/:id/download', downloadPPTX);

// DELETE /api/history/:id - Hapus riwayat
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('master_histories')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId);

    if (error) throw error;

    return res.json({ success: true, message: 'Riwayat berhasil dihapus.' });
  } catch (error) {
    console.error('Delete history error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus riwayat.' });
  }
});

module.exports = router;
