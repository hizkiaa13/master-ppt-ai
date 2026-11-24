const { randomUUID: uuidv4 } = require('crypto');
const { supabase } = require('../config/supabase');
const { generatePPTXBuffer, downloadPPTX, getHistory } = require('./pptxController');

/**
 * POST /api/history/save
 * Simpan data riwayat Master PPTX saat user mendownload atau menyimpan deck
 */
async function saveHistory(req, res) {
  try {
    const {
      title,
      slideCount,
      outputLanguage = 'id',
      layoutMode = 'auto',
      layoutSelections = [],
      finalData = [],
      slides = [],
      logoConfig = null,
    } = req.body;

    const presentationTitle = (title || 'Base Master PowerPoint').trim();
    if (!presentationTitle) {
      return res.status(400).json({
        success: false,
        message: 'Judul presentasi wajib diisi.',
      });
    }

    const slidesData = (Array.isArray(finalData) && finalData.length > 0)
      ? finalData
      : (Array.isArray(slides) && slides.length > 0 ? slides : []);

    const effectiveSlideCount = parseInt(slideCount, 10) || slidesData.length || 5;
    const historyId = req.body.historyId || uuidv4();

    // Generate PPTX buffer & base64
    let pptxBase64 = null;
    try {
      const buffer = await generatePPTXBuffer(slidesData, presentationTitle, { logoConfig });
      pptxBase64 = buffer.toString('base64');
    } catch (bufferErr) {
      console.warn('Peringatan: Gagal generate buffer saat saveHistory:', bufferErr.message);
    }

    // Siapkan payload lengkap
    const insertPayload = {
      id: historyId,
      user_id: req.userId,
      theme_name: presentationTitle,
      title: presentationTitle,
      slide_count: effectiveSlideCount,
      output_language: outputLanguage,
      layout_mode: layoutMode,
      layout_selections: layoutSelections,
      slide_previews: JSON.stringify(slidesData),
      edited_slides: JSON.stringify(slidesData),
      final_data: JSON.stringify(slidesData),
      logo_config: logoConfig ? JSON.stringify(logoConfig) : null,
      pptx_file_path: pptxBase64,
      final_pptx_path: pptxBase64,
      created_at: new Date().toISOString(),
    };

    // Upaya 1: Insert dengan skema lengkap
    let result = await supabase.from('master_histories').insert(insertPayload);

    // Upaya 2: Jika error kolom belum ada di Supabase, fallback ke skema dasar
    if (result.error) {
      console.warn('Supabase insert warning, trying compatible fallback:', result.error.message);
      delete insertPayload.logo_config;
      result = await supabase.from('master_histories').insert(insertPayload);

      if (result.error) {
        const fallbackPayload = {
          id: historyId,
          user_id: req.userId,
          theme_name: presentationTitle,
          slide_previews: JSON.stringify(slidesData),
          edited_slides: JSON.stringify(slidesData),
          pptx_file_path: pptxBase64,
          final_pptx_path: pptxBase64,
          created_at: new Date().toISOString(),
        };
        if (outputLanguage) fallbackPayload.output_language = outputLanguage;

        result = await supabase.from('master_histories').insert(fallbackPayload);
        if (result.error) {
          throw result.error;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Master berhasil disimpan ke riwayat.',
      data: {
        historyId,
        title: presentationTitle,
        slideCount: effectiveSlideCount,
      },
    });
  } catch (error) {
    console.error('SaveHistory error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal menyimpan riwayat.',
    });
  }
}

/**
 * GET /api/history/:id
 */
async function getHistoryById(req, res) {
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

    let slides = [];
    try {
      if (history.final_data) slides = JSON.parse(history.final_data);
      else if (history.edited_slides) slides = JSON.parse(history.edited_slides);
      else if (history.slide_previews) slides = JSON.parse(history.slide_previews);
    } catch {
      slides = [];
    }

    return res.json({
      success: true,
      data: {
        ...history,
        title: history.title || history.theme_name || 'Base Master',
        slide_count: history.slide_count || slides.length || 5,
        slides,
      },
    });
  } catch (error) {
    console.error('GetHistoryById error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail riwayat.' });
  }
}

/**
 * DELETE /api/history/:id
 */
async function deleteHistory(req, res) {
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
    console.error('DeleteHistory error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus riwayat.' });
  }
}

module.exports = {
  saveHistory,
  getHistory,
  getHistoryById,
  deleteHistory,
  downloadHistory: downloadPPTX,
};

