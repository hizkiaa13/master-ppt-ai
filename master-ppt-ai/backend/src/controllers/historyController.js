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
      typographyConfig = null,
      themeId,
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
    const defaultThemeId = '2e3b976d-08b0-4564-adc0-912c9657403d'; // 'Minimalis' (Base Master)
    const effectiveThemeId = themeId || defaultThemeId;

    // Generate PPTX buffer & base64
    let pptxBase64 = null;
    try {
      const buffer = await generatePPTXBuffer(slidesData, presentationTitle, { logoConfig, typographyConfig });
      pptxBase64 = buffer.toString('base64');
    } catch (bufferErr) {
      console.warn('Peringatan: Gagal generate buffer saat saveHistory:', bufferErr.message);
    }

    const customFonts = JSON.stringify({
      typographyConfig: typographyConfig || null,
      heading: typographyConfig?.fontFamily || 'Inter',
      body: typographyConfig?.fontFamily || 'Inter',
    });

    const customColors = JSON.stringify({
      logoConfig: logoConfig || null,
      primary: '#000000',
      secondary: '#4B5563',
    });

    const customLayouts = JSON.stringify({
      layoutMode: layoutMode || 'auto',
      layoutSelections: layoutSelections || [],
      outputLanguage: outputLanguage || 'id',
      slideCount: effectiveSlideCount,
      title: presentationTitle,
    });

    // 1. Guaranteed working payload (kompatibel 100% dengan skema live Supabase saat ini)
    const guaranteedPayload = {
      id: historyId,
      user_id: req.userId,
      theme_id: effectiveThemeId,
      theme_name: presentationTitle,
      custom_fonts: customFonts,
      custom_colors: customColors,
      custom_layouts: customLayouts,
      slide_previews: JSON.stringify(slidesData),
      edited_slides: JSON.stringify(slidesData),
      pptx_file_path: pptxBase64,
      final_pptx_path: pptxBase64,
      created_at: new Date().toISOString(),
    };

    // 2. Full extended payload (jika kolom tambahan sudah tersedia)
    const fullPayload = {
      ...guaranteedPayload,
      title: presentationTitle,
      slide_count: effectiveSlideCount,
      output_language: outputLanguage,
      layout_mode: layoutMode,
      layout_selections: layoutSelections,
      final_data: JSON.stringify(slidesData),
      logo_config: logoConfig ? JSON.stringify(logoConfig) : null,
      typography_config: typographyConfig ? JSON.stringify(typographyConfig) : null,
    };

    let insertError = null;
    try {
      const { error } = await supabase.from('master_histories').insert(fullPayload);
      insertError = error;
    } catch (err) {
      insertError = err;
    }

    if (insertError) {
      // Fallback ke guaranteed payload yang pasti sukses
      const { error: fallbackError } = await supabase.from('master_histories').insert(guaranteedPayload);
      if (fallbackError) {
        console.error('Gagal menyimpan master_histories:', fallbackError);
        throw fallbackError;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Master berhasil disimpan ke riwayat.',
      data: {
        id: historyId,
        historyId,
        userId: req.userId,
        title: presentationTitle,
        slideCount: effectiveSlideCount,
        language: outputLanguage,
        layoutMode,
        typography: typographyConfig,
        logo: logoConfig,
        slidesSnapshot: slidesData,
        createdAt: guaranteedPayload.created_at,
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

    let parsedLayouts = {};
    try {
      if (history.custom_layouts) parsedLayouts = typeof history.custom_layouts === 'string' ? JSON.parse(history.custom_layouts) : history.custom_layouts;
    } catch {}

    let parsedFonts = {};
    try {
      if (history.custom_fonts) parsedFonts = typeof history.custom_fonts === 'string' ? JSON.parse(history.custom_fonts) : history.custom_fonts;
    } catch {}

    let parsedColors = {};
    try {
      if (history.custom_colors) parsedColors = typeof history.custom_colors === 'string' ? JSON.parse(history.custom_colors) : history.custom_colors;
    } catch {}

    const displayTitle = history.title || history.theme_name || parsedLayouts.title || 'Base Master';
    const slideCount = history.slide_count || parsedLayouts.slideCount || slides.length || 5;
    const language = history.output_language || parsedLayouts.outputLanguage || 'id';
    const layoutMode = history.layout_mode || parsedLayouts.layoutMode || 'auto';
    const logoConfig = history.logo_config
      ? (typeof history.logo_config === 'string' ? JSON.parse(history.logo_config) : history.logo_config)
      : (parsedColors.logoConfig || null);
    const typographyConfig = history.typography_config
      ? (typeof history.typography_config === 'string' ? JSON.parse(history.typography_config) : history.typography_config)
      : (parsedFonts.typographyConfig || null);

    return res.json({
      success: true,
      data: {
        id: history.id,
        userId: history.user_id,
        title: displayTitle,
        slideCount,
        language,
        layoutMode,
        typography: typographyConfig,
        logo: logoConfig,
        slidesSnapshot: slides,
        filePath: `/api/history/${history.id}/download`,
        downloadUrl: `/api/history/${history.id}/download`,
        createdAt: history.created_at,
        // Backward compatibility
        ...history,
        theme_name: displayTitle,
        slide_count: slideCount,
        output_language: language,
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

