const { randomUUID: uuidv4 } = require('crypto');
const PptxGenJS = require('pptxgenjs');
const { supabase } = require('../config/supabase');
const { getRecommendations, generateSlideDeck } = require('../utils/aiEngine');

/**
 * Convert hex color to 6-char string (no #) for PptxGenJS
 */
function hexToRgb(hex) {
  if (!hex) return 'FFFFFF';
  return hex.replace('#', '').toUpperCase();
}

/**
 * Generate a complete PPTX file from slide blueprints and return as Buffer
 */
async function generatePPTXBuffer(slides, title) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Master PPT AI';
  pres.company = 'Master PPT AI';
  pres.title = title || 'Presentasi Master AI';

  slides.forEach((slideData) => {
    const slide = pres.addSlide();

    // Background color
    if (slideData.background && slideData.background.color) {
      slide.background = { color: hexToRgb(slideData.background.color) };
    }

    // Render decorative header/accent line if slide is not title or closing
    if (slideData.slideType !== 'title' && slideData.slideType !== 'closing') {
      slide.addShape(pres.ShapeType.rect, {
        x: 1,
        y: 1.25,
        w: 1.5,
        h: 0.04,
        fill: { color: '38BDF8' },
        line: { color: '38BDF8' },
      });
    }

    // Placeholders
    (slideData.placeholders || []).forEach((placeholder) => {
      const x = Math.max(0, parseFloat(placeholder.position?.x) || 1);
      const y = Math.max(0, parseFloat(placeholder.position?.y) || 1);
      const w = Math.min(10, Math.max(0.5, parseFloat(placeholder.position?.w) || 8));
      const h = Math.min(5.6, Math.max(0.3, parseFloat(placeholder.position?.h) || 1));

      if (placeholder.type === 'text') {
        const align = placeholder.align || 'left';
        const textOptions = {
          x,
          y,
          w,
          h,
          fontSize: placeholder.fontSize || 16,
          fontFace: placeholder.font || 'Inter',
          color: hexToRgb(placeholder.color || '#FFFFFF'),
          align: align,
          valign: 'middle',
          isTextBox: true,
          wrap: true,
          bold: !!placeholder.isBold,
          italic: !!placeholder.isItalic,
          underline: !!placeholder.isUnderline,
          lineSpacing: Math.round((placeholder.lineHeight || 1.5) * (placeholder.fontSize || 16)),
        };

        if (placeholder.shadow) {
          textOptions.shadow = {
            type: 'outer',
            color: '000000',
            blur: 3,
            offset: 2,
            angle: 45,
            opacity: 0.4,
          };
        }

        slide.addText(placeholder.content || '', textOptions);
      } else if (placeholder.type === 'image') {
        // Render stylized image placeholder
        slide.addShape(pres.ShapeType.rect, {
          x,
          y,
          w,
          h,
          fill: { color: 'F1F5F9', transparency: 20 },
          line: { color: '94A3B8', width: 1.5, dashType: 'dash' },
        });
        slide.addText(placeholder.placeholder || 'Area Gambar / Infografis', {
          x,
          y,
          w,
          h,
          fontSize: 13,
          color: '64748B',
          align: 'center',
          valign: 'middle',
        });
      }
    });
  });

  // Return as base64 buffer instead of writing to file
  const buffer = await pres.write({ outputType: 'nodebuffer' });
  return buffer;
}

// POST /api/pptx/generate
async function generatePPTX(req, res) {
  const { themeId, customTheme, slideCount, customColors, customizations } = req.body;
  
  if (!themeId) {
    return res.status(400).json({ success: false, message: 'themeId diperlukan.' });
  }

  // Validate slide count: 1 to 15, default 5
  const count = parseInt(slideCount, 10) || 5;
  if (count < 1 || count > 15) {
    return res.status(400).json({ success: false, message: 'Jumlah slide harus antara 1 sampai 15.' });
  }

  // Validate title
  const rawTitle = customTheme?.title || customizations?.title || '';
  const title = rawTitle.trim();
  if (!title) {
    return res.status(400).json({ success: false, message: 'Judul presentasi wajib diisi.' });
  }
  if (title.length > 100) {
    return res.status(400).json({ success: false, message: 'Judul presentasi maksimal 100 karakter.' });
  }

  const description = (customTheme?.description || customizations?.description || '').trim();
  if (description.length > 500) {
    return res.status(400).json({ success: false, message: 'Deskripsi tema maksimal 500 karakter.' });
  }

  try {
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();
    
    if (themeError || !theme) {
      return res.status(404).json({ success: false, message: 'Tema tidak ditemukan.' });
    }

    const finalColors = customColors || customizations?.colors || null;
    const finalFonts = customizations?.fonts || null;

    // Generate dynamic slide deck with 1-15 slides
    const deck = generateSlideDeck({
      themeName: theme.name,
      customTitle: title,
      customDescription: description,
      slideCount: count,
      customColors: finalColors,
      customFonts: finalFonts,
    });

    const historyId = uuidv4();

    // Generate PPTX as buffer (no file system in serverless)
    const pptxBuffer = await generatePPTXBuffer(deck.slides, title);
    
    // Store the PPTX as base64 in the database for serverless compatibility
    const pptxBase64 = pptxBuffer.toString('base64');

    // Save to history
    const { error: insertError } = await supabase
      .from('master_histories')
      .insert({
        id: historyId,
        user_id: req.userId,
        theme_id: themeId,
        theme_name: theme.name,
        custom_fonts: JSON.stringify(deck.recommendations.fonts),
        custom_colors: JSON.stringify(finalColors || deck.recommendations.colors),
        custom_layouts: JSON.stringify(deck.slides.map(s => s.layout)),
        slide_previews: JSON.stringify(deck.slides),
        edited_slides: JSON.stringify(deck.slides),
        pptx_file_path: pptxBase64, // Store base64 encoded PPTX
        final_pptx_path: null,
      });

    if (insertError) throw insertError;

    return res.json({
      success: true,
      message: 'Master PPTX berhasil di-generate!',
      data: {
        masterId: historyId,
        slides: deck.slides,
        recommendations: deck.recommendations,
        title,
        slideCount: count,
        downloadUrl: `/api/pptx/download/${historyId}`,
      },
    });
  } catch (error) {
    console.error('GeneratePPTX error:', error);
    return res.status(500).json({ success: false, message: `Gagal membuat PPTX: ${error.message}` });
  }
}

// GET /api/pptx/preview/:masterId
async function getPreview(req, res) {
  const { masterId } = req.params;
  try {
    const { data: history, error } = await supabase
      .from('master_histories')
      .select('*')
      .eq('id', masterId)
      .eq('user_id', req.userId)
      .single();

    if (error || !history) {
      return res.status(404).json({ success: false, message: 'Master slide tidak ditemukan.' });
    }

    const slides = history.edited_slides
      ? JSON.parse(history.edited_slides)
      : (history.slide_previews ? JSON.parse(history.slide_previews) : []);

    const recommendations = {
      fonts: history.custom_fonts ? JSON.parse(history.custom_fonts) : {},
      colors: history.custom_colors ? JSON.parse(history.custom_colors) : {},
      layouts: history.custom_layouts ? JSON.parse(history.custom_layouts) : [],
    };

    return res.json({
      success: true,
      data: {
        masterId: history.id,
        themeName: history.theme_name,
        slides,
        recommendations,
      },
    });
  } catch (error) {
    console.error('GetPreview error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil preview slide.' });
  }
}

// PUT /api/pptx/slide/:masterId/:slideNumber & PUT /api/pptx/slide/:masterId
async function updateSlide(req, res) {
  const masterId = req.params.masterId || req.params.slideId;
  const slideNumber = req.params.slideNumber;
  const updateData = req.body;

  try {
    const { data: history, error } = await supabase
      .from('master_histories')
      .select('*')
      .eq('id', masterId)
      .eq('user_id', req.userId)
      .single();

    if (error || !history) {
      return res.status(404).json({ success: false, message: 'Master slide tidak ditemukan.' });
    }

    let slides = history.edited_slides
      ? JSON.parse(history.edited_slides)
      : JSON.parse(history.slide_previews || '[]');

    if (Array.isArray(updateData.slides)) {
      slides = updateData.slides;
    } else if (Array.isArray(updateData)) {
      slides = updateData;
    } else {
      const targetNum = parseInt(slideNumber || updateData.slideNumber, 10);
      const index = slides.findIndex((s) => s.slideNumber === targetNum);
      if (index !== -1) {
        if (updateData.placeholders) slides[index].placeholders = updateData.placeholders;
        if (updateData.background) slides[index].background = updateData.background;
        if (updateData.layout) slides[index].layout = updateData.layout;
      }
    }

    const { error: updateError } = await supabase
      .from('master_histories')
      .update({ edited_slides: JSON.stringify(slides) })
      .eq('id', masterId);

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: 'Perubahan slide berhasil disimpan.',
      data: { masterId, slides },
    });
  } catch (error) {
    console.error('UpdateSlide error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengupdate slide.' });
  }
}

// POST /api/pptx/finalize/:masterId
async function finalizePPTX(req, res) {
  const { masterId } = req.params;
  const { slides: incomingSlides, title } = req.body || {};

  try {
    const { data: history, error } = await supabase
      .from('master_histories')
      .select('*')
      .eq('id', masterId)
      .eq('user_id', req.userId)
      .single();

    if (error || !history) {
      return res.status(404).json({ success: false, message: 'Master slide tidak ditemukan.' });
    }

    const slidesToRender = incomingSlides || (history.edited_slides ? JSON.parse(history.edited_slides) : JSON.parse(history.slide_previews || '[]'));
    const docTitle = title || history.theme_name || 'Presentasi Master';

    const pptxBuffer = await generatePPTXBuffer(slidesToRender, docTitle);
    const pptxBase64 = pptxBuffer.toString('base64');

    const { error: updateError } = await supabase
      .from('master_histories')
      .update({
        final_pptx_path: pptxBase64,
        edited_slides: JSON.stringify(slidesToRender),
      })
      .eq('id', masterId);

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: 'File PPTX final berhasil di-generate!',
      data: {
        masterId,
        fileName: `${docTitle}-master.pptx`,
        downloadUrl: `/api/pptx/download/${masterId}?final=true`,
      },
    });
  } catch (error) {
    console.error('FinalizePPTX error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat file PPTX final.' });
  }
}

// GET /api/pptx/download/:id
async function downloadPPTX(req, res) {
  const { id } = req.params;
  const isFinal = req.query.final === 'true';

  try {
    const { data: history, error } = await supabase
      .from('master_histories')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();
    
    if (error || !history) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan atau bukan milik Anda.' });
    }

    // Get the appropriate base64 data
    const base64Data = (isFinal && history.final_pptx_path)
      ? history.final_pptx_path
      : history.pptx_file_path;

    if (!base64Data) {
      // If no stored base64, regenerate from slides
      const slides = history.edited_slides
        ? JSON.parse(history.edited_slides)
        : JSON.parse(history.slide_previews || '[]');
      
      const pptxBuffer = await generatePPTXBuffer(slides, history.theme_name || 'Presentasi');
      
      const fileName = `${history.theme_name || 'presentasi'}-master.pptx`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      return res.send(pptxBuffer);
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${history.theme_name || 'presentasi'}-master.pptx`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    return res.send(buffer);
  } catch (error) {
    console.error('DownloadPPTX error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengunduh file.' });
  }
}

// GET /api/pptx/history
async function getHistory(req, res) {
  try {
    const { data: histories, error } = await supabase
      .from('master_histories')
      .select(`
        *,
        themes:theme_id (name, color_primary, color_secondary, color_accent, category)
      `)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const historiesWithParsed = (histories || []).map((h) => ({
      ...h,
      theme_display_name: h.themes?.name || h.theme_name,
      color_primary: h.themes?.color_primary || null,
      color_secondary: h.themes?.color_secondary || null,
      color_accent: h.themes?.color_accent || null,
      category: h.themes?.category || null,
      custom_fonts: h.custom_fonts ? JSON.parse(h.custom_fonts) : {},
      custom_colors: h.custom_colors ? JSON.parse(h.custom_colors) : {},
      slide_count: h.edited_slides ? JSON.parse(h.edited_slides).length : 5,
      downloadUrl: `/api/pptx/download/${h.id}`,
      // Don't send base64 PPTX data in list response
      pptx_file_path: undefined,
      final_pptx_path: undefined,
      themes: undefined,
    }));
    
    return res.json({
      success: true,
      data: historiesWithParsed,
      total: historiesWithParsed.length,
    });
  } catch (error) {
    console.error('GetHistory error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = {
  generatePPTX,
  getPreview,
  updateSlide,
  finalizePPTX,
  downloadPPTX,
  getHistory,
};
