const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildMasterPrompt } = require("../prompts/masterPrompt");
const { selectLayout, normalizePoints } = require("../utils/layoutSelector");
const {
  FONT_PAIRINGS,
  getRandomPairing,
  isValidFont,
} = require("../utils/textToolkit");

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
 * Normalisasi dan validasi slide agar mematuhi Auto Layout Design System (Maksimal 15 slide)
 */
function normalizeSlideDeckLayouts(slides, totalCount) {
  const count = Math.min(Math.max(totalCount || slides.length || 5, 1), 15);
  const sliced = slides.slice(0, count);

  return sliced.map((slide, idx) => {
    const slideNumber = slide.slideNumber || idx + 1;
    let content = Array.isArray(slide.content) ? slide.content : [];

    // Jika lebih dari 6 poin, gabungkan agar rapi di grid 6-points
    if (content.length > 6) {
      content = normalizePoints(content);
    }

    const calculatedPointCount = content.length;
    const computedLayout = selectLayout({ ...slide, content, slideNumber }, count, idx);

    // Prioritaskan layoutId dari AI jika valid, atau gunakan computedLayout
    const finalLayoutId = slide.layoutId || computedLayout;

    // Tentukan slideType yang selaras
    let slideType = slide.slideType || "content";
    if (idx === 0 || finalLayoutId === "cover-front") {
      slideType = "cover";
    } else if (idx === count - 1 || finalLayoutId === "cover-back") {
      slideType = "closing";
    } else if (finalLayoutId === "table-of-contents") {
      slideType = "agenda";
    } else if (finalLayoutId === "chart") {
      slideType = "chart";
    } else if (finalLayoutId === "testimonial") {
      slideType = "testimonial";
    }

    return {
      slideNumber,
      slideType,
      layoutId: finalLayoutId,
      pointCount: calculatedPointCount,
      title: slide.title || (idx === 0 ? "Judul Presentasi" : `Slide ${slideNumber}`),
      subtitle: slide.subtitle || (idx === 0 ? "Presentasi Master Berbasis AI" : undefined),
      content,
    };
  });
}

/**
 * Fallback to rule-based engine when Gemini is unavailable or errors
 * Menghasilkan konten berkualitas Base Master Hitam & Putih sesuai bahasa yang dipilih
 */
function getRuleBasedFallback({ title, description, outputLanguage = "id" }) {
  const isEn = outputLanguage === "en";
  const count = 5; // Default 5 slide seimbang jika fallback

  const defaultPairing = FONT_PAIRINGS[0]; // Montserrat + Open Sans

  const baseSlides = [
    {
      slideNumber: 1,
      slideType: "cover",
      layoutId: "cover-front",
      pointCount: 0,
      title: title || (isEn ? "Strategic Master Presentation" : "Presentasi Master Strategis"),
      subtitle: description || (isEn ? "AI-Powered Professional Master Deck" : "Presentasi Terstruktur Berbasis AI"),
      content: [],
    },
    {
      slideNumber: 2,
      slideType: "agenda",
      layoutId: "table-of-contents",
      pointCount: 4,
      title: isEn ? "Table of Contents" : "Daftar Isi & Agenda",
      subtitle: isEn ? "Overview of key strategic areas" : "Ikhtisar topik pembahasan utama",
      content: isEn
        ? [
            "01. Context & Problem Analysis",
            "02. Strategic Approach & Framework",
            "03. Execution Plan & Key Milestones",
            "04. Success Metrics & Performance Impact",
          ]
        : [
            "01. Latar Belakang & Analisis Masalah",
            "02. Pendekatan Strategis & Metodologi",
            "03. Rencana Eksekusi & Timeline Proyek",
            "04. Indikator Keberhasilan & Dampak Kinerja",
          ],
    },
    {
      slideNumber: 3,
      slideType: "content",
      layoutId: "two-points",
      pointCount: 2,
      title: isEn ? "Current Situation vs Target State" : "Kondisi Saat Ini vs Target Baru",
      subtitle: isEn ? "Key transformational focus" : "Fokus transformasi terarah",
      content: isEn
        ? [
            "Current State: Manual workflows consume 40% more operational time with 12% discrepancy rate.",
            "Target State: Intelligent automation accelerates cycle by 65% with 99.2% verified precision.",
          ]
        : [
            "Kondisi Saat Ini: Alur manual memakan 40% waktu operasional dengan tingkat ketidaksesuaian 12%.",
            "Target Baru: Otomatisasi cerdas memangkas siklus kerja hingga 65% dengan akurasi terverifikasi 99.2%.",
          ],
    },
    {
      slideNumber: 4,
      slideType: "content",
      layoutId: "three-points",
      pointCount: 3,
      title: isEn ? "Core Pillars of Execution" : "Pilar Utama Eksekusi",
      subtitle: isEn ? "Foundational strategies for scalable impact" : "Fondasi pelaksanaan berkesinambungan",
      content: isEn
        ? [
            "Speed & Agility: Accelerate decision-making velocity across all operational divisions.",
            "Quality Standardization: Ensure consistent elite deliverables through structured workflows.",
            "Scalability & Governance: Build robust scalable infrastructure with strict security protocols.",
          ]
        : [
            "Kecepatan & Agilitas: Mempercepat ritme pengambilan keputusan di seluruh divisi kerja.",
            "Standarisasi Mutu: Menjamin mutu hasil kerja berstandar tinggi secara konsisten.",
            "Skalabilitas & Tata Kelola: Membangun fondasi yang siap bertumbuh dengan integritas data.",
          ],
    },
    {
      slideNumber: 5,
      slideType: "closing",
      layoutId: "cover-back",
      pointCount: 3,
      title: isEn ? "Thank You" : "Terima Kasih",
      subtitle: isEn ? "Let's connect and collaborate" : "Kolaborasi & Tanya Jawab Terbuka",
      content: [
        "Email: contact@masterpptai.id",
        "Website: www.masterpptai.id",
        isEn ? "Open for Strategic Discussions" : "Konsultasi & Sesi Diskusi Terbuka",
      ],
    },
  ];

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
          heading: defaultPairing.heading,
          body: defaultPairing.body,
          rationale: defaultPairing.rationale,
        },
        layouts,
      },
    },
    isFallback: true,
  };
}

/**
 * Main AI generation function for Base Master (Hitam & Putih)
 */
async function generateCopywriting(input) {
  const {
    title,
    description = "",
    outputLanguage = "id",
  } = input;

  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no valid key is provided
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY tidak dikonfigurasi. Menggunakan rule-based fallback.");
    return getRuleBasedFallback({
      title,
      description,
      outputLanguage,
    });
  }

  const prompt = buildMasterPrompt({
    title,
    description,
    outputLanguage,
  });

  const configuredModel = process.env.GEMINI_MODEL;
  const candidateModels = [
    configuredModel,
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
  ].filter((m) => m && typeof m === "string" && m.trim().length > 0);

  // Filter unique model names
  const modelsToTry = [...new Set(candidateModels)];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel(
        {
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        },
        { timeout: 25000 }
      );

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const parsed = cleanAndParseJSON(text);

      // Validate slides array
      if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
        throw new Error("Format respons AI tidak memiliki array 'slides' yang valid");
      }

      // Enforce max 15 slides limit as requested
      if (parsed.slides.length > 15) {
        console.log(`Jumlah slide dari AI (${parsed.slides.length}) melebihi 15, dipotong menjadi 15 slide.`);
        parsed.slides = parsed.slides.slice(0, 15);
      }

      const slideCount = parsed.slides.length;

      // Normalisasi setiap slide dengan Auto Layout Design System
      parsed.slides = normalizeSlideDeckLayouts(parsed.slides, slideCount);

      // Sinkronkan designRecommendation
      parsed.designRecommendation = parsed.designRecommendation || {};

      // Pastikan font yang dipilih valid dari toolkit, jika tidak fallback ke pairing default
      let headingFont = parsed.designRecommendation.fonts?.heading;
      let bodyFont = parsed.designRecommendation.fonts?.body;

      if (!isValidFont(headingFont) || !isValidFont(bodyFont)) {
        const fallbackPair = getRandomPairing();
        headingFont = fallbackPair.heading;
        bodyFont = fallbackPair.body;
      }

      parsed.designRecommendation.fonts = {
        heading: headingFont,
        body: bodyFont,
        rationale:
          parsed.designRecommendation.fonts?.rationale ||
          "Kombinasi font profesional dan elegan dari text toolkit untuk master hitam-putih.",
      };

      // Pastikan field colors tidak ada di response designRecommendation
      delete parsed.designRecommendation.colors;

      parsed.designRecommendation.layouts = parsed.slides.map((s) => ({
        slideNumber: s.slideNumber,
        slideType: s.slideType,
        layout: s.layoutId,
        layoutId: s.layoutId,
        pointCount: s.pointCount,
      }));

      console.log(`✅ Berhasil menghasilkan ${parsed.slides.length} slide menggunakan Gemini (${modelName})`);

      return {
        success: true,
        data: {
          slides: parsed.slides,
          designRecommendation: {
            fonts: parsed.designRecommendation.fonts,
            layouts: parsed.designRecommendation.layouts,
          },
        },
        modelUsed: modelName,
        isFallback: false,
      };
    } catch (error) {
      lastError = error;
      console.warn(`Gemini AI (${modelName}) gagal:`, error.message);
    }
  }

  console.error("Semua percobaan model Gemini AI gagal, beralih ke rule-based fallback:", lastError?.message);
  const fallbackResult = getRuleBasedFallback({
    title,
    description,
    outputLanguage,
  });

  return {
    ...fallbackResult,
    fallbackReason: lastError?.message || "Layanan AI Gemini sedang tidak dapat dijangkau",
  };
}

module.exports = {
  generateCopywriting,
  cleanAndParseJSON,
  getRuleBasedFallback,
  normalizeSlideDeckLayouts,
};
