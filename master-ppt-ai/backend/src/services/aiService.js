const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiEngine = require("../utils/aiEngine");
const { buildMasterPrompt } = require("../prompts/masterPrompt");
const { selectLayout, getPointCount, normalizePoints } = require("../utils/layoutSelector");

/**
 * Clean and parse JSON response from Gemini
 */
function cleanAndParseJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/i, "");
  }
  cleaned = cleaned.trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

/**
 * Normalisasi dan validasi slide agar mematuhi Auto Layout Design System
 */
function normalizeSlideDeckLayouts(slides, totalCount) {
  return slides.map((slide, idx) => {
    const slideNumber = slide.slideNumber || idx + 1;
    let content = Array.isArray(slide.content) ? slide.content : [];

    // Jika lebih dari 6 poin, gabungkan agar rapi di grid 6-points
    if (content.length > 6) {
      content = normalizePoints(content);
    }

    const calculatedPointCount = content.length;
    const computedLayout = selectLayout({ ...slide, content, slideNumber }, totalCount, idx);

    // Prioritaskan layoutId dari AI jika valid, atau gunakan computedLayout
    const finalLayoutId = slide.layoutId || computedLayout;

    // Tentukan slideType yang selaras
    let slideType = slide.slideType || 'content';
    if (idx === 0 || finalLayoutId === 'cover-front') {
      slideType = 'cover';
    } else if (idx === totalCount - 1 || finalLayoutId === 'cover-back') {
      slideType = 'closing';
    } else if (finalLayoutId === 'table-of-contents') {
      slideType = 'agenda';
    } else if (finalLayoutId === 'chart') {
      slideType = 'chart';
    } else if (finalLayoutId === 'testimonial') {
      slideType = 'testimonial';
    }

    return {
      slideNumber,
      slideType,
      layoutId: finalLayoutId,
      pointCount: calculatedPointCount,
      title: slide.title || (idx === 0 ? 'Judul Presentasi' : `Slide ${slideNumber}`),
      subtitle: slide.subtitle || (idx === 0 ? 'Subjudul Presentasi Berbasis AI' : undefined),
      content,
    };
  });
}

/**
 * Fallback to rule-based engine when Gemini is unavailable or errors
 */
function getRuleBasedFallback({ title, theme, description, slideCount, customColors }) {
  const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 1), 15);
  const deck = aiEngine.generateSlideDeck({
    themeName: theme,
    customTitle: title,
    customDescription: description,
    slideCount: count,
    customColors,
  });

  const rec = deck.recommendations || aiEngine.getRecommendations(theme, customColors || {});

  // Blueprint slide terstruktur dengan variasi layout dinamis
  const baseSlides = deck.slides.map((s, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === count - 1;
    const isSecond = idx === 1;

    let contentList = [];
    let slideType = 'content';
    let suggestedLayout = 'three-points';

    if (isFirst) {
      slideType = 'cover';
      suggestedLayout = 'cover-front';
    } else if (isLast) {
      slideType = 'closing';
      suggestedLayout = 'cover-back';
      contentList = [
        'Email: contact@masterpptai.id',
        'Website: www.masterpptai.id',
        'Konsultasi & Tanya Jawab Terbuka',
      ];
    } else if (isSecond && count >= 4) {
      slideType = 'agenda';
      suggestedLayout = 'table-of-contents';
      contentList = [
        '01. Latar Belakang & Analisis Masalah',
        '02. Pendekatan Strategis & Metodologi',
        '03. Rencana Eksekusi & Timeline Proyek',
        '04. Indikator Keberhasilan (KPI) & Metrik Dampak',
      ];
    } else if (idx === 2) {
      // 2 Poin perbandingan
      suggestedLayout = 'two-points';
      contentList = [
        'Kondisi Saat Ini: Proses manual memakan waktu 40% lebih lama dengan tingkat error 12%',
        'Target Solusi Baru: Otomatisasi AI memangkas siklus kerja hingga 65% dengan akurasi 99.2%',
      ];
    } else if (idx === 3 && count >= 5) {
      // 4 Poin pilar
      suggestedLayout = 'four-points';
      contentList = [
        'Kecepatan Eksekusi: Akselerasi proses pengambilan keputusan hingga 3x lipat',
        'Konsistensi Mutu: Standarisasi output berkualitas tinggi di semua lini divisi',
        'Skalabilitas Tinggi: Fondasi fleksibel yang siap tumbuh bersama ekspansi bisnis',
        'Keamanan & Kepatuhan: Menjamin integritas data sesuai standar sertifikasi industri',
      ];
    } else if (idx === 4 && count >= 6) {
      // Chart / Data
      suggestedLayout = 'chart';
      slideType = 'chart';
      contentList = [
        '+185% Pertumbuhan Efisiensi Operasional',
        '3.8x Return on Investment (ROI) Proyeksi 6 Bulan',
        '99.4% Tingkat Kepuasan Pengguna Akhir',
      ];
    } else {
      suggestedLayout = 'three-points';
      contentList = [
        'Analisis Kebutuhan Komprehensif dan Penyelarasan Tim',
        'Penerapan Teknologi Tepat Guna Berorientasi Hasil Nyata',
        'Evaluasi Berkala dan Optimasi Performa Berkelanjutan',
      ];
    }

    const titlePlaceholder = s.placeholders.find((p) => p.id.startsWith("title"));
    const subtitlePlaceholder = s.placeholders.find((p) => p.id.startsWith("subtitle"));

    return {
      slideNumber: s.slideNumber,
      slideType,
      layoutId: suggestedLayout,
      pointCount: contentList.length,
      title: titlePlaceholder?.content || s.name || `Slide ${s.slideNumber}`,
      subtitle: subtitlePlaceholder?.content || (isFirst ? description || "Presentasi Terstruktur Berbasis AI" : undefined),
      content: contentList,
    };
  });

  const normalizedSlides = normalizeSlideDeckLayouts(baseSlides, count);

  const layouts = normalizedSlides.map((s) => ({
    slideNumber: s.slideNumber,
    slideType: s.slideType,
    layout: s.layoutId,
    layoutId: s.layoutId,
    pointCount: s.pointCount,
  }));

  return {
    success: true,
    data: {
      slides: normalizedSlides,
      designRecommendation: {
        fonts: {
          heading: rec.fonts?.heading || "Montserrat",
          body: rec.fonts?.body || "Open Sans",
          rationale: rec.fonts?.rationale || "Montserrat memberikan kesan profesional dan modern, Open Sans mudah dibaca untuk body text.",
        },
        colors: {
          primary: customColors?.primary || rec.colors?.primary || "#3B82F6",
          secondary: customColors?.secondary || rec.colors?.secondary || "#1E40AF",
          accent: customColors?.accent || rec.colors?.accent || "#F59E0B",
          rationale: rec.colors?.rationale || "Kombinasi warna harmonis dan dinamis untuk mendukung keterbacaan presentasi.",
        },
        layouts,
      },
    },
    isFallback: true,
  };
}

/**
 * Main AI generation function
 */
async function generateCopywriting(input) {
  const {
    title,
    theme = "Bisnis",
    description = "",
    slideCount = 5,
    customColors = null,
  } = input;

  const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 1), 15);
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no valid key is provided
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY tidak dikonfigurasi. Menggunakan rule-based fallback.");
    return getRuleBasedFallback({
      title,
      theme,
      description,
      slideCount: count,
      customColors,
    });
  }

  const prompt = buildMasterPrompt({
    title,
    theme,
    description,
    slideCount: count,
    customColors,
  });

  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  let lastError = null;

  // Attempt up to 2 times (initial + 1 retry for malformed JSON)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const parsed = cleanAndParseJSON(text);

      // Validate and slice slides if more than requested
      if (parsed.slides && Array.isArray(parsed.slides)) {
        if (parsed.slides.length > count) {
          parsed.slides = parsed.slides.slice(0, count);
        }
      } else {
        throw new Error("Format respons AI tidak memiliki array 'slides' yang valid");
      }

      // Normalisasi setiap slide dengan Auto Layout Design System
      parsed.slides = normalizeSlideDeckLayouts(parsed.slides, count);

      // Sinkronkan designRecommendation.layouts
      parsed.designRecommendation = parsed.designRecommendation || {};
      parsed.designRecommendation.layouts = parsed.slides.map((s) => ({
        slideNumber: s.slideNumber,
        slideType: s.slideType,
        layout: s.layoutId,
        layoutId: s.layoutId,
        pointCount: s.pointCount,
      }));

      // Ensure custom colors are applied if selected
      if (customColors?.primary && parsed.designRecommendation?.colors) {
        parsed.designRecommendation.colors.primary = customColors.primary;
        if (customColors.secondary) parsed.designRecommendation.colors.secondary = customColors.secondary;
        if (customColors.accent) parsed.designRecommendation.colors.accent = customColors.accent;
      }

      return {
        success: true,
        data: parsed,
      };
    } catch (error) {
      lastError = error;
      console.warn(`Gemini AI percobaan ke-${attempt} gagal:`, error.message);
      if (attempt < 2) {
        // Wait 500ms before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  console.error("Semua percobaan Gemini AI gagal, beralih ke rule-based fallback:", lastError?.message);
  return getRuleBasedFallback({
    title,
    theme,
    description,
    slideCount: count,
    customColors,
  });
}

module.exports = {
  generateCopywriting,
  cleanAndParseJSON,
  getRuleBasedFallback,
  normalizeSlideDeckLayouts,
};
