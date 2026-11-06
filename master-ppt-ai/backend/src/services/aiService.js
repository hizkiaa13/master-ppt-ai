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
const { validateContentRelevance } = require("../utils/contentValidator");
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
 * Fallback cerdas yang dinamis 100% mengikuti judul user
 */
function getRuleBasedFallback({ title, description, outputLanguage = "id", slideCount = 5 }) {
  const isEn = outputLanguage === "en";
  const count = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);
  const safeTitle = title || (isEn ? "Strategic Master Presentation" : "Presentasi Master Strategis");
  const safeDesc = description || (isEn ? "Actionable Framework and Core Directives" : "Rencana Strategis dan Panduan Implementasi");

  const defaultPairing = FONT_PAIRINGS[0]; // Montserrat + Open Sans

  const dynamicCatalog = [
    {
      slideType: "cover",
      layoutId: "cover-front",
      pointCount: 0,
      layoutReason: `Slide pembuka memuat judul utama "${safeTitle}"`,
      title: safeTitle,
      subtitle: safeDesc,
      content: [],
    },
    {
      slideType: "agenda",
      layoutId: "table-of-contents",
      pointCount: 4,
      layoutReason: `Daftar isi dan agenda pembahasan "${safeTitle}"`,
      title: isEn ? "Table of Contents" : "Agenda Pembahasan",
      subtitle: isEn ? `Key areas of ${safeTitle}` : `4 Topik Utama ${safeTitle}`,
      content: isEn
        ? [
            `01. Current Context & Objectives of ${safeTitle}`,
            `02. Core Strategic Pillars & Framework`,
            `03. Actionable Implementation Steps`,
            `04. Performance Metrics & Expected Outcomes`,
          ]
        : [
            `01. Latar Belakang & Urgensi ${safeTitle}`,
            `02. Pilar Strategis & Metodologi Utama`,
            `03. Rencana Eksekusi & Tahapan Praktis`,
            `04. Indikator Keberhasilan & Dampak Kinerja`,
          ],
    },
    {
      slideType: "content",
      layoutId: "comparison",
      pointCount: 2,
      layoutReason: `Perbandingan pendekatan dalam implementasi "${safeTitle}"`,
      title: isEn ? "Conventional Approach vs New Strategy" : "Pendekatan Konvensional vs Strategi Baru",
      subtitle: isEn ? `Evaluating transformational impact for ${safeTitle}` : `Evaluasi efisiensi implementasi ${safeTitle}`,
      content: isEn
        ? [
            `Conventional Method: Manual coordination with fragmented execution and limited measurable outcomes.`,
            `Target Strategy: Data-driven automation accelerating execution with verified precision and efficiency.`,
          ]
        : [
            `Pendekatan Konvensional: Koordinasi manual yang terfragmentasi dengan keterbatasan pengukuran hasil.`,
            `Strategi Baru: Eksekusi berbasis data terarah yang mengoptimalkan kecepatan dan akurasi implementasi.`,
          ],
    },
    {
      slideType: "content",
      layoutId: "three-points",
      pointCount: 3,
      layoutReason: `Tiga pilar utama penggerak keberhasilan "${safeTitle}"`,
      title: isEn ? "Core Pillars of Execution" : "Pilar Utama Pelaksanaan",
      subtitle: isEn ? `Foundational drivers for ${safeTitle}` : `Fondasi keberhasilan ${safeTitle}`,
      content: isEn
        ? [
            `Priority Focus: Directing resources toward high-impact initiatives that accelerate results.`,
            `Standardized Workflow: Ensuring consistent elite quality across all operational touchpoints.`,
            `Continuous Tracking: Real-time visibility and adaptive adjustments based on concrete feedback.`,
          ]
        : [
            `Fokus Prioritas: Mengarahkan sumber daya pada inisiatif bernilai dampak tertinggi untuk akselerasi hasil.`,
            `Standarisasi Mutu: Memastikan konsistensi kualitas eksekusi di setiap alur kerja operasional.`,
            `Pemantauan Berkelanjutan: Visibilitas metrik real-time dan penyesuaian adaptif berbasis data nyata.`,
          ],
    },
    {
      slideType: "content",
      layoutId: "steps",
      pointCount: 4,
      layoutReason: `Tahapan pelaksanaan terstruktur untuk "${safeTitle}"`,
      title: isEn ? "Implementation Roadmap" : "Tahapan Implementasi",
      subtitle: isEn ? `Sequential milestones to execute ${safeTitle}` : `Langkah sistematis penerapan ${safeTitle}`,
      content: isEn
        ? [
            `Step 1: Alignment & Readiness Assessment`,
            `Step 2: Architecture & Setup`,
            `Step 3: Strategic Rollout`,
            `Step 4: Review & Scaling`,
          ]
        : [
            `Tahap 1: Penyelarasan Kebutuhan & Analisis Awal`,
            `Tahap 2: Penyusunan Kerangka Kerja & Setup`,
            `Tahap 3: Peluncuran Strategis & Uji Lapangan`,
            `Tahap 4: Evaluasi Hasil & Ekspansi Skala`,
          ],
    },
    {
      slideType: "chart",
      layoutId: "chart",
      pointCount: 2,
      layoutReason: `Target capaian dan dampak terukur dari "${safeTitle}"`,
      title: isEn ? "Impact & Target Outcomes" : "Target Capaian & Dampak",
      subtitle: isEn ? `Measurable return on ${safeTitle}` : `Indikator keberhasilan terukur ${safeTitle}`,
      content: isEn
        ? [
            `Expected operational efficiency improvement of up to 45% within initial execution cycle.`,
            `Consistent quality attainment with high satisfaction ratings across key stakeholders.`,
          ]
        : [
            `Peningkatan efisiensi operasional terukur hingga 45% dalam periode implementasi awal.`,
            `Pencapaian target kualitas berstandar tinggi dengan kepuasan menyeluruh dari pemangku kepentingan.`,
          ],
    },
    {
      slideType: "closing",
      layoutId: "cover-back",
      pointCount: 3,
      layoutReason: `Slide penutup dan call to action untuk "${safeTitle}"`,
      title: isEn ? "Execute Your Strategy" : "Mulai Implementasi Anda",
      subtitle: isEn ? `Consult and collaborate on ${safeTitle}` : `Konsultasi & sesi diskusi lanjutan mengenai ${safeTitle}`,
      content: [
        "Email: contact@masterpptai.id",
        "Website: www.masterpptai.id",
        isEn ? "Open for Strategic Alignment Sessions" : "Konsultasi & Sesi Diskusi Terbuka",
      ],
    },
  ];

  let selected = [];
  if (count === 1) {
    selected = [dynamicCatalog[0]];
  } else if (count === 2) {
    selected = [dynamicCatalog[0], dynamicCatalog[6]];
  } else if (count <= 5) {
    const middle = [dynamicCatalog[1], dynamicCatalog[2], dynamicCatalog[3], dynamicCatalog[4]].slice(0, count - 2);
    selected = [dynamicCatalog[0], ...middle, dynamicCatalog[6]];
  } else {
    const extra = [];
    for (let i = 1; i <= count - 2; i++) {
      const source = dynamicCatalog[(i % (dynamicCatalog.length - 2)) + 1];
      extra.push({
        ...source,
        title: `${source.title} (${i})`,
      });
    }
    selected = [dynamicCatalog[0], ...extra, dynamicCatalog[6]];
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
 * Dilengkapi Validasi Relevansi Konten & Mekanisme Retry Anti-Drift
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
            temperature: 0.65, // Lebih deterministik agar tetap fokus ke judul
            responseMimeType: "application/json",
          },
        },
        { timeout: 30000 }
      );

      const prompt = buildMasterPrompt({
        title,
        description,
        outputLanguage,
        slideCount: effectiveSlideCount,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let parsed = cleanAndParseJSON(response.text());

      if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
        throw new Error("Format respons AI tidak memiliki array 'slides' yang valid");
      }

      // Validasi Relevansi Konten terhadap Judul User
      const relevance = validateContentRelevance(parsed, title, description);
      console.log(`🔍 Skor Relevansi AI (${modelName}): ${relevance.relevanceScore}% (${relevance.relevantSlides}/${relevance.totalSlides} slide relevan)`);

      // Jika kurang dari 60% relevan, lakukan retry dengan peringatan keras
      if (!relevance.isRelevant) {
        console.warn(`⚠️ Konten dinilai kurang relevan (${relevance.relevanceScore}% < 60%). Mencoba generate ulang dengan prompt penegasan...`);
        const retryPrompt = buildMasterPrompt({
          title,
          description,
          outputLanguage,
          slideCount: effectiveSlideCount,
          retryContext: true,
        });

        const retryResult = await model.generateContent(retryPrompt);
        const retryResponse = await retryResult.response;
        try {
          const retryParsed = cleanAndParseJSON(retryResponse.text());
          if (retryParsed.slides && Array.isArray(retryParsed.slides) && retryParsed.slides.length > 0) {
            const secondCheck = validateContentRelevance(retryParsed, title, description);
            console.log(`🔍 Skor Relevansi Setelah Retry: ${secondCheck.relevanceScore}%`);
            if (secondCheck.relevanceScore >= relevance.relevanceScore) {
              parsed = retryParsed;
            }
          }
        } catch (retryParseErr) {
          console.warn("Retry parsing gagal, menggunakan hasil generasi pertama:", retryParseErr.message);
        }
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

      console.log(`✅ Berhasil menghasilkan ${parsed.slides.length} slide relevan menggunakan Gemini (${modelName})`);

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
