const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildMasterPrompt } = require("../prompts/masterPrompt");
const {
  selectLayout,
  normalizePoints,
  validateConsecutiveLayouts,
  generateLayoutReason,
} = require("../utils/layoutSelector");
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

  let normalized = sliced.map((slide, idx) => {
    const slideNumber = slide.slideNumber || idx + 1;
    let content = Array.isArray(slide.content) ? slide.content : [];

    if (content.length > 6) {
      content = normalizePoints(content);
    }

    const calculatedPointCount = content.length;
    const computedLayout = selectLayout({ ...slide, content, slideNumber }, count, idx);

    const finalLayoutId = slide.layoutId || computedLayout;

    let slideType = slide.slideType || "content";
    if (idx === 0 || finalLayoutId === "cover-front" || finalLayoutId === "cover-front-editorial") {
      slideType = "cover";
    } else if (idx === count - 1 || finalLayoutId === "cover-back" || finalLayoutId === "cover-back-statement") {
      slideType = "closing";
    } else if (finalLayoutId === "table-of-contents") {
      slideType = "agenda";
    } else if (finalLayoutId === "chart" || finalLayoutId === "chart-stat") {
      slideType = "chart";
    } else if (finalLayoutId === "testimonial" || finalLayoutId === "testimonial-cards") {
      slideType = "testimonial";
    }

    const layoutReason = slide.layoutReason || generateLayoutReason(slide, finalLayoutId);

    return {
      slideNumber,
      slideType,
      layoutId: finalLayoutId,
      pointCount: calculatedPointCount,
      layoutReason,
      title: slide.title || (idx === 0 ? "Judul Presentasi" : `Slide ${slideNumber}`),
      subtitle: slide.subtitle || (idx === 0 ? "Presentasi Master Berbasis AI" : undefined),
      content,
    };
  });

  // Validasi agar tidak ada layout sama > 2 kali berturut-turut
  normalized = validateConsecutiveLayouts(normalized);

  return normalized;
}

/**
 * Fallback to rule-based engine when Gemini is unavailable or errors
 */
function getRuleBasedFallback({ title, description, outputLanguage = "id", slideCount = 5 }) {
  const isEn = outputLanguage === "en";
  const count = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);

  const defaultPairing = FONT_PAIRINGS[0]; // Montserrat + Open Sans

  const catalog = [
    {
      slideType: "cover",
      layoutId: "cover-front",
      pointCount: 0,
      layoutReason: "Slide pembuka dengan judul dan subjudul strategis",
      title: title || (isEn ? "Strategic Master Presentation" : "Presentasi Master Strategis"),
      subtitle: description || (isEn ? "AI-Powered Professional Master Deck" : "Presentasi Terstruktur Berbasis AI"),
      content: [],
    },
    {
      slideType: "agenda",
      layoutId: "table-of-contents",
      pointCount: 4,
      layoutReason: "Daftar isi dan agenda pembahasan utama",
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
      slideType: "content",
      layoutId: "comparison",
      pointCount: 2,
      layoutReason: "Slide perbandingan dua kondisi untuk evaluasi mendalam",
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
      slideType: "content",
      layoutId: "three-points",
      pointCount: 3,
      layoutReason: "Tiga pilar strategis fondasi pelaksanaan",
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
      slideType: "content",
      layoutId: "steps",
      pointCount: 4,
      layoutReason: "Tahapan implementasi terstruktur bernomor",
      title: isEn ? "Implementation Roadmap" : "Tahapan Implementasi",
      subtitle: isEn ? "Sequential operational milestones" : "Langkah pelaksanaan berurutan",
      content: isEn
        ? [
            "Phase 1: Discovery & Needs Assessment",
            "Phase 2: Architecture & Setup",
            "Phase 3: Rollout & Integration",
            "Phase 4: Monitoring & Optimization",
          ]
        : [
            "Tahap 1: Analisis Kebutuhan & Riset",
            "Tahap 2: Perancangan Arsitektur & Setup",
            "Tahap 3: Implementasi & Peluncuran",
            "Tahap 4: Pemantauan & Evaluasi Kinerja",
          ],
    },
    {
      slideType: "chart",
      layoutId: "chart",
      pointCount: 2,
      layoutReason: "Visualisasi metrik proyeksi pertumbuhan",
      title: isEn ? "Growth Projection & Impact" : "Proyeksi Pertumbuhan & Dampak",
      subtitle: isEn ? "Targeted measurable outcomes" : "Target pencapaian terukur",
      content: isEn
        ? [
            "Target efisiensi biaya operasional sebesar 35% pada kuartal pertama.",
            "Peningkatan retensi pelanggan mencapai indeks 94.8% secara tahunan.",
          ]
        : [
            "Target efisiensi biaya operasional sebesar 35% pada kuartal pertama.",
            "Peningkatan retensi pelanggan mencapai indeks 94.8% secara tahunan.",
          ],
    },
    {
      slideType: "closing",
      layoutId: "cover-back",
      pointCount: 3,
      layoutReason: "Slide penutup dengan kontak dan apresiasi",
      title: isEn ? "Thank You" : "Terima Kasih",
      subtitle: isEn ? "Let's connect and collaborate" : "Kolaborasi & Tanya Jawab Terbuka",
      content: [
        "Email: contact@masterpptai.id",
        "Website: www.masterpptai.id",
        isEn ? "Open for Strategic Discussions" : "Konsultasi & Sesi Diskusi Terbuka",
      ],
    },
  ];

  // Susun slide sesuai slideCount
  let selected = [];
  if (count === 1) {
    selected = [catalog[0]];
  } else if (count === 2) {
    selected = [catalog[0], catalog[6]];
  } else if (count <= 5) {
    const middle = [catalog[1], catalog[2], catalog[3], catalog[4]].slice(0, count - 2);
    selected = [catalog[0], ...middle, catalog[6]];
  } else {
    // > 5 slide
    const extra = [];
    for (let i = 1; i <= count - 2; i++) {
      const source = catalog[(i % (catalog.length - 2)) + 1];
      extra.push({
        ...source,
        title: `${source.title} (${i})`,
      });
    }
    selected = [catalog[0], ...extra, catalog[6]];
  }

  const assigned = selected.map((s, idx) => ({
    ...s,
    slideNumber: idx + 1,
  }));

  const normalizedSlides = normalizeSlideDeckLayouts(assigned, count);

  const layouts = normalizedSlides.map((s) => ({
    slideNumber: s.slideNumber,
    slideType: s.slideType,
    layout: s.layoutId,
    layoutId: s.layoutId,
    pointCount: s.pointCount,
    layoutReason: s.layoutReason,
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
    slideCount = 5,
  } = input;

  const effectiveSlideCount = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY tidak dikonfigurasi. Menggunakan rule-based fallback.");
    return getRuleBasedFallback({ title, description, outputLanguage, slideCount: effectiveSlideCount });
  }

  const prompt = buildMasterPrompt({
    title,
    description,
    outputLanguage,
    slideCount: effectiveSlideCount,
  });

  const configuredModel = process.env.GEMINI_MODEL;
  const candidateModels = [
    configuredModel,
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-flash-lite-latest",
  ].filter((m) => m && typeof m === "string" && m.trim().length > 0);

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
        { timeout: 30000 }
      );

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const parsed = cleanAndParseJSON(text);

      if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
        throw new Error("Format respons AI tidak memiliki array 'slides' yang valid");
      }

      // Potong ke tepat effectiveSlideCount
      if (parsed.slides.length > effectiveSlideCount) {
        parsed.slides = parsed.slides.slice(0, effectiveSlideCount);
      }

      const slideCountResult = Math.min(parsed.slides.length, effectiveSlideCount);
      parsed.slides = normalizeSlideDeckLayouts(parsed.slides, slideCountResult);

      parsed.designRecommendation = parsed.designRecommendation || {};

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

      delete parsed.designRecommendation.colors;

      parsed.designRecommendation.layouts = parsed.slides.map((s) => ({
        slideNumber: s.slideNumber,
        slideType: s.slideType,
        layout: s.layoutId,
        layoutId: s.layoutId,
        pointCount: s.pointCount,
        layoutReason: s.layoutReason,
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
    slideCount: effectiveSlideCount,
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
