const { randomUUID: uuidv4 } = require('crypto');
const PptxGenJS = require('pptxgenjs');
const { supabase } = require('../config/supabase');
const { FONT_PAIRINGS } = require('../utils/textToolkit');

/**
 * Convert hex color to 6-char string (no #) for PptxGenJS
 */
function hexToRgb(hex) {
  if (!hex) return '000000';
  return hex.replace('#', '').trim().toUpperCase();
}

/**
 * Generate a complete PPTX file from slide blueprints (Base Master Hitam & Putih)
 */
async function generatePPTXBuffer(slides, title) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Master PPT AI';
  pres.company = 'Master PPT AI';
  pres.title = title || 'Base Master PowerPoint (Hitam & Putih)';

  const defaultFont = FONT_PAIRINGS[0].heading;

  slides.forEach((slideData) => {
    const slide = pres.addSlide();

    // 1. Background selalu putih murni (#FFFFFF)
    slide.background = { color: 'FFFFFF' };

    // 2. Garis aksen minimalis hitam/abu terang jika bukan slide cover/closing
    const isCover = slideData.slideType === 'cover' || (slideData.layoutId && slideData.layoutId.startsWith('cover-front'));
    const isClosing = slideData.slideType === 'closing' || (slideData.layoutId && slideData.layoutId.startsWith('cover-back'));

    if (!isCover && !isClosing) {
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8,
        y: 1.1,
        w: 1.2,
        h: 0.03,
        fill: { color: '000000' },
        line: { color: '000000' },
      });
    }

    // 3. Render Placeholders
    (slideData.placeholders || []).forEach((placeholder) => {
      const rawX = parseFloat(placeholder.position?.x) || 1;
      const rawY = parseFloat(placeholder.position?.y) || 1;
      const rawW = parseFloat(placeholder.position?.w) || 8;
      const rawH = parseFloat(placeholder.position?.h) || 1;

      // Konversi jika persentase
      const isPercent = rawW > 10 || rawH > 10 || rawX > 10 || rawY > 10;
      const x = isPercent ? (rawX / 100) * 10 : Math.max(0, rawX);
      const y = isPercent ? (rawY / 100) * 5.625 : Math.max(0, rawY);
      const w = isPercent ? (rawW / 100) * 10 : Math.min(10, Math.max(0.5, rawW));
      const h = isPercent ? (rawH / 100) * 5.625 : Math.min(5.625, Math.max(0.3, rawH));

      if (placeholder.type === 'text') {
        const isTitle = placeholder.id?.startsWith('title') || placeholder.name?.toLowerCase().includes('judul');
        const defaultColor = isTitle ? '000000' : '1F2937';
        const textColor = placeholder.color ? hexToRgb(placeholder.color) : defaultColor;

        const align = placeholder.align || (isCover && !slideData.layoutId?.includes('editorial') ? 'center' : 'left');

        const textOptions = {
          x,
          y,
          w,
          h,
          fontSize: placeholder.fontSize || (isTitle ? 32 : 16),
          fontFace: placeholder.font || defaultFont,
          color: textColor,
          align,
          valign: 'middle',
          isTextBox: true,
          wrap: true,
          bold: placeholder.isBold !== undefined ? !!placeholder.isBold : isTitle,
          italic: !!placeholder.isItalic,
          underline: !!placeholder.isUnderline,
          lineSpacing: Math.round((placeholder.lineHeight || 1.4) * (placeholder.fontSize || 16)),
        };

        slide.addText(placeholder.content || '', textOptions);
      } else if (placeholder.type === 'image') {
        // Stylized minimal image placeholder
        slide.addShape(pres.ShapeType.rect, {
          x,
          y,
          w,
          h,
          fill: { color: 'F9FAFB' },
          line: { color: 'E5E7EB', width: 1, dashType: 'dash' },
        });
        slide.addText(placeholder.placeholder || 'Area Visual / Diagram Hitam-Putih', {
          x,
          y,
          w,
          h,
          fontSize: 12,
          fontFace: defaultFont,
          color: '6B7280',
          align: 'center',
          valign: 'middle',
        });
      }
    });
  });

  const buffer = await pres.write({ outputType: 'nodebuffer' });
  return buffer;
}

// POST /api/pptx/generate
async function generatePPTX(req, res) {
  const { customTheme, customizations, outputLanguage = 'id' } = req.body;

  const rawTitle = customTheme?.title || customizations?.title || req.body.title || '';
  const title = rawTitle.trim();
  if (!title) {
    return res.status(400).json({ success: false, message: 'Judul presentasi wajib diisi.' });
  }

  const description = (customTheme?.description || customizations?.description || req.body.description || '').trim();

  try {
    const historyId = uuidv4();
    const slides = req.body.slides || [];
    const count = slides.length || 5;

    const pptxBuffer = await generatePPTXBuffer(slides, title);
    const pptxBase64 = pptxBuffer.toString('base64');

    const defaultPairing = FONT_PAIRINGS[0];

    const insertData = {
      id: historyId,
      user_id: req.userId,
      theme_id: null,
      theme_name: 'Base Master (Hitam & Putih)',
      custom_fonts: JSON.stringify({ heading: defaultPairing.heading, body: defaultPairing.body }),
      custom_colors: null,
      custom_layouts: JSON.stringify(slides.map((s) => s.layout || s.layoutId)),
      slide_previews: JSON.stringify(slides),
      edited_slides: JSON.stringify(slides),
      pptx_file_path: pptxBase64,
      final_pptx_path: null,
    };

    if (outputLanguage) {
      insertData.output_language = outputLanguage;
    }

    let { error: insertError } = await supabase.from('master_histories').insert(insertData);

    if (insertError && (insertError.message?.includes('output_language') || insertError.code === 'PGRST204')) {
      delete insertData.output_language;
      const retry = await supabase.from('master_histories').insert(insertData);
      insertError = retry.error;
    }

    if (insertError) throw insertError;

    return res.json({
      success: true,
      message: 'Master PPTX berhasil di-generate!',
      data: {
        masterId: historyId,
        slides,
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
      layouts: history.custom_layouts ? JSON.parse(history.custom_layouts) : [],
    };

    return res.json({
      success: true,
      data: {
        masterId: history.id,
        themeName: 'Base Master',
        outputLanguage: history.output_language || 'id',
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

    const slidesToRender =
      incomingSlides ||
      (history.edited_slides ? JSON.parse(history.edited_slides) : JSON.parse(history.slide_previews || '[]'));
    const docTitle = title || history.custom_title || 'Base Master';

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

    const base64Data = (isFinal && history.final_pptx_path)
      ? history.final_pptx_path
      : history.pptx_file_path;

    if (!base64Data) {
      const slides = history.edited_slides
        ? JSON.parse(history.edited_slides)
        : JSON.parse(history.slide_previews || '[]');

      const pptxBuffer = await generatePPTXBuffer(slides, 'Base Master');
      const fileName = `base-master.pptx`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      return res.send(pptxBuffer);
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `base-master.pptx`;
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
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const historiesWithParsed = (histories || []).map((h) => ({
      ...h,
      theme_display_name: 'Base Master',
      color_primary: '#000000',
      custom_fonts: h.custom_fonts ? JSON.parse(h.custom_fonts) : {},
      slide_count: h.edited_slides ? JSON.parse(h.edited_slides).length : 5,
      downloadUrl: `/api/pptx/download/${h.id}`,
      pptx_file_path: undefined,
      final_pptx_path: undefined,
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
