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
 * Helper to compute logo bounding box in inches
 */
function computeBackendLogoBounds(logoConfig) {
  if (!logoConfig || !logoConfig.enabled) return null;
  const sizes = {
    small:  { maxW: 0.8, maxH: 0.45 },
    medium: { maxW: 1.2, maxH: 0.65 },
    large:  { maxW: 1.8, maxH: 1.0  },
  };
  const sizeDef = sizes[logoConfig.size] || sizes.medium;
  const naturalWidth = logoConfig.naturalWidth || 200;
  const naturalHeight = logoConfig.naturalHeight || 100;
  const aspectRatio = naturalWidth / naturalHeight;

  let w = sizeDef.maxW;
  let h = w / aspectRatio;
  if (h > sizeDef.maxH) {
    h = sizeDef.maxH;
    w = h * aspectRatio;
  }

  const margin = 0.25;
  const position = logoConfig.position || 'top-right';
  let x, y;
  if (position.includes('left')) x = margin;
  else x = 10 - margin - w;

  if (position.includes('top')) y = margin;
  else y = 5.625 - margin - h;

  return { x, y, w, h };
}

/**
 * Kelompokkan placeholder kartu poin berdasarkan baris vertikal (koordinat Y serupa)
 */
function groupPlaceholdersByRow(pointPlaceholders, yTolerance = 7) {
  const sorted = [...pointPlaceholders].sort((a, b) => {
    const yA = parseFloat(a.position?.y) || 0;
    const yB = parseFloat(b.position?.y) || 0;
    return yA - yB;
  });

  const rows = [];
  sorted.forEach((p) => {
    const y = parseFloat(p.position?.y) || 0;
    const matchingRow = rows.find((r) => Math.abs(r.y - y) <= yTolerance);
    if (matchingRow) {
      matchingRow.items.push(p);
      matchingRow.y = matchingRow.items.reduce((sum, item) => sum + (parseFloat(item.position?.y) || 0), 0) / matchingRow.items.length;
    } else {
      rows.push({ y, items: [p] });
    }
  });

  rows.forEach((r) => {
    r.items.sort((a, b) => (parseFloat(a.position?.x) || 0) - (parseFloat(b.position?.x) || 0));
  });

  return rows;
}

/**
 * Menghitung perkiraan tinggi kebutuhan kartu poin dalam satuan persentase slide (0-100%)
 */
function estimateCardHeightPercent(placeholder, typographyConfig) {
  const cardWPercent = parseFloat(placeholder.position?.w) || 30;
  const cardWPx = (cardWPercent / 100) * 960;
  const usableWidthPx = Math.max(80, cardWPx - 32);

  const fontSize = placeholder.fontSize || 16;
  const lineHeightPx = fontSize * 1.5;
  const charsPerLine = Math.max(12, Math.floor(usableWidthPx / (fontSize * 0.52)));

  const content = (placeholder.content || '').trim();
  const paragraphs = content ? content.split(/\n+/) : [''];

  let totalLines = 0;
  paragraphs.forEach((p) => {
    const pTrim = p.trim();
    if (!pTrim) totalLines += 1;
    else totalLines += Math.max(1, Math.ceil(pTrim.length / charsPerLine));
  });

  const textHeightPx = (totalLines * lineHeightPx) + Math.max(0, (paragraphs.length - 1) * 8);
  let headerHeightPx = 0;
  if (placeholder.badge === 'arrow' || placeholder.stepLabel || placeholder.number) {
    headerHeightPx = 30;
  } else if (placeholder.badge === 'stat') {
    headerHeightPx = 56;
  } else if (placeholder.badge === 'rating') {
    headerHeightPx = 48;
  }

  const totalHeightPx = textHeightPx + headerHeightPx + 32;
  return Math.round(((totalHeightPx / 540) * 100) * 10) / 10;
}

/**
 * Samakan tinggi kartu poin yang berada dalam satu baris (row-equalized heights)
 */
function equalizePointCardHeights(placeholders = [], typographyConfig = null, layoutId = '') {
  if (!Array.isArray(placeholders) || placeholders.length === 0) return placeholders;

  if (layoutId === 'table-of-contents' || layoutId?.startsWith('agenda-') || layoutId?.startsWith('cover-') || layoutId === 'one-point') {
    return placeholders;
  }

  const pointPlaceholders = placeholders.filter((p) => p.id?.startsWith('point-') && p.type === 'text');
  if (pointPlaceholders.length <= 1) return placeholders;

  const rows = groupPlaceholdersByRow(pointPlaceholders);
  const rowHeightMap = new Map();
  const isMultiRow = rows.length > 1;

  rows.forEach((row) => {
    let maxNeededH = 0;
    let minRowY = 100;

    row.items.forEach((item) => {
      const existingH = parseFloat(item.position?.h) || 20;
      const existingY = parseFloat(item.position?.y) || 20;
      minRowY = Math.min(minRowY, existingY);

      const neededH = estimateCardHeightPercent(item, typographyConfig);
      maxNeededH = Math.max(maxNeededH, existingH, neededH);
    });

    const maxAllowedH = isMultiRow ? 36 : 65;
    const finalH = Math.min(maxAllowedH, Math.max(20, maxNeededH));

    row.items.forEach((item) => {
      rowHeightMap.set(item.id, { h: finalH, y: minRowY });
    });
  });

  return placeholders.map((p) => {
    if (rowHeightMap.has(p.id)) {
      const { h, y } = rowHeightMap.get(p.id);
      return {
        ...p,
        position: {
          ...p.position,
          h,
          y,
        },
      };
    }
    return p;
  });
}

/**
 * Generate a complete PPTX file from slide blueprints (Base Master Hitam & Putih)
 */
async function generatePPTXBuffer(slides, title, options = {}) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Master PPT AI';
  pres.company = 'Master PPT AI';
  pres.title = title || 'Base Master PowerPoint (Hitam & Putih)';

  const defaultFont = FONT_PAIRINGS[0].heading;
  const logoConfig = options.logoConfig || null;
  const typographyConfig = options.typographyConfig || null;

  slides.forEach((slideData) => {
    const slide = pres.addSlide();

    // 1. Background selalu putih murni (#FFFFFF)
    slide.background = { color: 'FFFFFF' };

    // 1.5. Render Logo Presentasi Global jika ada
    if (logoConfig && logoConfig.enabled && logoConfig.dataUri) {
      try {
        const bounds = computeBackendLogoBounds(logoConfig);
        if (bounds) {
          slide.addImage({
            data: logoConfig.dataUri,
            x: bounds.x,
            y: bounds.y,
            w: bounds.w,
            h: bounds.h,
            sizing: { type: 'contain', w: bounds.w, h: bounds.h },
          });
        }
      } catch (err) {
        console.warn('Backend PPTX logo embed warning:', err.message);
      }
    }

    // 2. Render Placeholders (Tinggi kartu di baris yang sama disetarakan)
    const layoutId = slideData.layoutId || slideData.layout || 'three-points';
    const isCover = layoutId.startsWith('cover-') || slideData.slideType === 'cover';
    const isClosing = layoutId.startsWith('cover-back') || layoutId.startsWith('closing-') || slideData.slideType === 'closing';

    const displayPlaceholders = equalizePointCardHeights(
      slideData.placeholders || [],
      typographyConfig,
      layoutId
    );

    displayPlaceholders.forEach((placeholder) => {
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

      const isPointCard =
        placeholder.id?.startsWith('point-') &&
        !isCover &&
        !isClosing &&
        layoutId !== 'table-of-contents' &&
        layoutId !== 'one-point';

      if (isPointCard) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: Math.max(0, x - 0.05),
          y: Math.max(0, y - 0.05),
          w: w + 0.1,
          h: h + 0.1,
          fill: { color: 'F9FAFB' },
          line: { color: 'E5E7EB', width: 1 },
          rectRadius: 0.08,
        });
      }

      if (placeholder.type === 'text') {
        const id = (placeholder.id || '').toLowerCase();
        const isTitle = id.startsWith('title') || (placeholder.name || '').toLowerCase().includes('judul');
        const isSubtitle = id.startsWith('subtitle') || (placeholder.name || '').toLowerCase().includes('subjudul');
        const isCaption = id.startsWith('caption') || id.startsWith('footer') || id.startsWith('presenter');
        const role = isTitle ? 'title' : (isSubtitle ? 'subtitle' : (isCaption ? 'caption' : 'body'));

        let resolvedFont = placeholder.font || (isTitle ? defaultFont : FONT_PAIRINGS[0].body);
        let resolvedSize = placeholder.fontSize || (isTitle ? 32 : 16);
        let resolvedColor = isTitle ? '000000' : '1F2937';
        let resolvedLineHeight = placeholder.lineHeight || 1.4;

        if (typographyConfig?.mode === 'auto') {
          resolvedFont = typographyConfig.fontFamily || resolvedFont;
          const roleScale = typographyConfig.scale?.[role];
          if (roleScale?.size) resolvedSize = roleScale.size;
          if (roleScale?.color) resolvedColor = hexToRgb(roleScale.color);
          if (roleScale?.lineHeight) resolvedLineHeight = roleScale.lineHeight;
        } else if (typographyConfig?.mode === 'manual') {
          const roleScale = typographyConfig.scale?.[role];
          if (roleScale?.fontFamily) resolvedFont = roleScale.fontFamily;
          if (roleScale?.size) resolvedSize = roleScale.size;
          if (roleScale?.color) resolvedColor = hexToRgb(roleScale.color);
          if (roleScale?.lineHeight) resolvedLineHeight = roleScale.lineHeight;
        }

        if (placeholder.color) resolvedColor = hexToRgb(placeholder.color);

        const textColor = resolvedColor;
        const align = placeholder.align || (isCover && !slideData.layoutId?.includes('editorial') ? 'center' : 'left');

        const resolvedLineSpacing = isPointCard || role === 'body'
          ? Math.round(1.5 * (resolvedSize || 16))
          : Math.round((isTitle ? 1.2 : resolvedLineHeight) * (resolvedSize || 16));

        const textOptions = {
          x: isPointCard ? x + 0.08 : x,
          y: isPointCard ? y + 0.08 : y,
          w: isPointCard ? Math.max(0.5, w - 0.16) : w,
          h: isPointCard ? Math.max(0.3, h - 0.16) : h,
          fontSize: resolvedSize,
          fontFace: resolvedFont,
          color: textColor,
          align,
          valign: isPointCard ? 'top' : (isTitle ? 'middle' : 'top'),
          isTextBox: true,
          wrap: true,
          bold: placeholder.isBold !== undefined ? !!placeholder.isBold : isTitle,
          italic: !!placeholder.isItalic,
          underline: !!placeholder.isUnderline,
          lineSpacing: resolvedLineSpacing,
          margin: isPointCard ? [6, 8, 6, 8] : [0, 0, 0, 0],
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
      theme_name: title || 'Base Master (Hitam & Putih)',
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
  const { slides: incomingSlides, title, logoConfig, typographyConfig } = req.body || {};

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

    let effectiveLogo = logoConfig || null;
    if (!effectiveLogo && history.logo_config) {
      try {
        effectiveLogo = typeof history.logo_config === 'string' ? JSON.parse(history.logo_config) : history.logo_config;
      } catch {}
    }

    let effectiveTypography = typographyConfig || null;
    if (!effectiveTypography && history.typography_config) {
      try {
        effectiveTypography = typeof history.typography_config === 'string' ? JSON.parse(history.typography_config) : history.typography_config;
      } catch {}
    }

    const pptxBuffer = await generatePPTXBuffer(slidesToRender, docTitle, {
      logoConfig: effectiveLogo,
      typographyConfig: effectiveTypography,
    });
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

// GET /api/pptx/download/:id & GET /api/history/:id/download
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

    const docTitle = history.title || history.theme_name || history.custom_title || 'Base Master PowerPoint';
    const safeFileName = `${docTitle.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, '').trim().replace(/\s+/g, '_') || 'presentasi'}-master.pptx`;

    const base64Data = (isFinal && history.final_pptx_path)
      ? history.final_pptx_path
      : (history.final_pptx_path || history.pptx_file_path);

    if (!base64Data) {
      let slides = [];
      try {
        if (history.final_data) slides = JSON.parse(history.final_data);
        else if (history.edited_slides) slides = JSON.parse(history.edited_slides);
        else if (history.slide_previews) slides = JSON.parse(history.slide_previews);
      } catch (parseErr) {
        slides = [];
      }

      let effectiveLogo = null;
      if (history.logo_config) {
        try {
          effectiveLogo = typeof history.logo_config === 'string' ? JSON.parse(history.logo_config) : history.logo_config;
        } catch {}
      }

      let effectiveTypography = null;
      if (history.typography_config) {
        try {
          effectiveTypography = typeof history.typography_config === 'string' ? JSON.parse(history.typography_config) : history.typography_config;
        } catch {}
      }

      const pptxBuffer = await generatePPTXBuffer(slides, docTitle, {
        logoConfig: effectiveLogo,
        typographyConfig: effectiveTypography,
      });
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      return res.send(pptxBuffer);
    }

    const buffer = Buffer.from(base64Data, 'base64');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    return res.send(buffer);
  } catch (error) {
    console.error('DownloadPPTX error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengunduh file.' });
  }
}

// GET /api/pptx/history & GET /api/history
async function getHistory(req, res) {
  try {
    const { data: histories, error } = await supabase
      .from('master_histories')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const historiesWithParsed = (histories || []).map((h) => {
      let finalSlides = [];
      try {
        if (h.final_data) finalSlides = JSON.parse(h.final_data);
        else if (h.edited_slides) finalSlides = JSON.parse(h.edited_slides);
        else if (h.slide_previews) finalSlides = JSON.parse(h.slide_previews);
      } catch (e) {
        finalSlides = [];
      }

      let parsedLayouts = {};
      try {
        if (h.custom_layouts) parsedLayouts = typeof h.custom_layouts === 'string' ? JSON.parse(h.custom_layouts) : h.custom_layouts;
      } catch {}

      let parsedFonts = {};
      try {
        if (h.custom_fonts) parsedFonts = typeof h.custom_fonts === 'string' ? JSON.parse(h.custom_fonts) : h.custom_fonts;
      } catch {}

      let parsedColors = {};
      try {
        if (h.custom_colors) parsedColors = typeof h.custom_colors === 'string' ? JSON.parse(h.custom_colors) : h.custom_colors;
      } catch {}

      const displayTitle = h.title || h.theme_name || parsedLayouts.title || h.custom_title || 'Base Master PowerPoint';
      const slideCount = h.slide_count || parsedLayouts.slideCount || finalSlides.length || 5;
      const language = h.output_language || parsedLayouts.outputLanguage || 'id';
      const layoutMode = h.layout_mode || parsedLayouts.layoutMode || 'auto';
      const logoConfig = h.logo_config
        ? (typeof h.logo_config === 'string' ? JSON.parse(h.logo_config) : h.logo_config)
        : (parsedColors.logoConfig || null);
      const typographyConfig = h.typography_config
        ? (typeof h.typography_config === 'string' ? JSON.parse(h.typography_config) : h.typography_config)
        : (parsedFonts.typographyConfig || null);

      return {
        id: h.id,
        userId: h.user_id,
        title: displayTitle,
        slideCount,
        language,
        layoutMode,
        typography: typographyConfig,
        logo: logoConfig,
        slidesSnapshot: finalSlides,
        filePath: `/api/history/${h.id}/download`,
        downloadUrl: `/api/history/${h.id}/download`,
        createdAt: h.created_at,
        // Backward compatibility properties
        theme_name: displayTitle,
        theme_display_name: 'Base Master (Hitam & Putih)',
        color_primary: '#000000',
        slide_count: slideCount,
        output_language: language,
        custom_fonts: parsedFonts,
        slides: finalSlides,
      };
    });

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
  generatePPTXBuffer,
  getPreview,
  updateSlide,
  finalizePPTX,
  downloadPPTX,
  getHistory,
};
