const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildMasterPrompt, buildSingleSlideRetryPrompt } = require("../prompts/masterPrompt");
const { buildRegenerateSlidePrompt } = require("../prompts/regenerateSlidePrompt");
const {
  selectLayout,
  normalizePoints,
  validateConsecutiveLayouts,
  generateLayoutReason,
} = require("../utils/layoutSelector");
const { validateContentRelevance } = require("../utils/contentValidator");
const { validateSlideContent, isDummyText } = require("../utils/slideContentValidator");
const {
  FONT_PAIRINGS,
  getRandomPairing,
  isValidFont,
} = require("../utils/textToolkit");
const {
  indonesia,
  english,
  getAllBusinessNames,
  getAllPersonNames,
} = require("../utils/placeholderToolkit");

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
 * Validasi dan Sanitisasi Placeholder Canva Ipsum Toolkit
 */
function validatePlaceholders(aiResult, outputLanguage = 'id') {
  const isEn = outputLanguage === 'en';
  const toolkit = isEn ? english : indonesia;
  const officialPhone = isEn ? toolkit.kontak.phoneNumber : toolkit.kontak.nomorTelepon;
  const officialMobile = isEn ? toolkit.kontak.mobileNumber : toolkit.kontak.nomorPonsel;
  const officialWebsite = isEn ? toolkit.kontak.website : toolkit.kontak.website;
  const officialEmail = isEn ? toolkit.kontak.email : toolkit.kontak.email;
  const officialSocial = isEn ? toolkit.kontak.socialMedia : toolkit.kontak.mediaSosial;
  const officialAddress = isEn ? toolkit.alamatPendek : toolkit.alamatFisik;
  const officialAccount = isEn ? toolkit.nomorAman.nomorAkun12Digit : toolkit.nomorAman.nomorRekening;

  let violationsCount = 0;

  if (!aiResult || !Array.isArray(aiResult.slides)) {
    return { isValid: true, violationsCount: 0, sanitizedResult: aiResult };
  }

  aiResult.slides.forEach((slide) => {
    // 1. Sanitize title & subtitle
    ['title', 'subtitle'].forEach((field) => {
      if (typeof slide[field] === 'string' && slide[field]) {
        const addressPattern = /(jl\.|jalan\s+|street\s+|st\.,\s*|avenue|blvd)[^,\n\.\;]*/gi;
        if (addressPattern.test(slide[field]) && !slide[field].includes('Mangga Muda 17A') && !slide[field].includes('123 Anywhere St')) {
          slide[field] = slide[field].replace(addressPattern, officialAddress);
          violationsCount++;
        }
      }
    });

    // 2. Sanitize content array
    if (Array.isArray(slide.content)) {
      slide.content = slide.content.map((item) => {
        if (typeof item !== 'string') return item;
        let text = item;

        // A. Cek & Ganti Alamat Fisik
        const addressPattern = /(jl\.|jalan\s+|street\s+|st\.,\s*|avenue|blvd)[^,\n\.\;]*/gi;
        if (addressPattern.test(text) && !text.includes('Mangga Muda 17A') && !text.includes('123 Anywhere St')) {
          text = text.replace(addressPattern, officialAddress);
          violationsCount++;
        }

        // B. Cek & Ganti Email
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        if (emailPattern.test(text)) {
          text = text.replace(emailPattern, (matched) => {
            if (matched.toLowerCase() === officialEmail.toLowerCase()) return matched;
            violationsCount++;
            return officialEmail;
          });
        }

        // C. Cek & Ganti Website / Domain
        const urlPattern = /\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:com|co\.id|id|org|io|net))\b/g;
        if (urlPattern.test(text)) {
          text = text.replace(urlPattern, (matched) => {
            if (matched.includes('situssupercanggih') || matched.includes('reallygreatsite')) return matched;
            violationsCount++;
            return officialWebsite;
          });
        }

        // D. Cek & Ganti Nomor Rekening
        const bankPattern = /(?:rekening|rek|account\s+no\.?|acc\s+no\.?)\s*[:=]?\s*(\d{8,16})/gi;
        if (bankPattern.test(text)) {
          text = text.replace(bankPattern, (match, digits) => {
            if (digits === officialAccount) return match;
            violationsCount++;
            return isEn ? `Account No: ${officialAccount}` : `No. Rekening: ${officialAccount}`;
          });
        }

        return text;
      });
    }

    // 3. Khusus slide penutup
    const isClosing = slide.slideType === 'closing' || (slide.layoutId && slide.layoutId.includes('closing'));
    if (isClosing && Array.isArray(slide.content)) {
      if (slide.content.length === 0) {
        slide.content = isEn
          ? [
              `Phone: ${officialPhone}`,
              `Email: ${officialEmail}`,
              `Website: ${officialWebsite}`,
              `Address: ${officialAddress}`,
            ]
          : [
              `Telepon: ${officialPhone}`,
              `Email: ${officialEmail}`,
              `Website: ${officialWebsite}`,
              `Alamat: ${officialAddress}`,
            ];
      } else {
        slide.content = slide.content.map((line) => {
          if (typeof line !== 'string') return line;
          if (line.toLowerCase().includes('email') || line.includes('@')) {
            return `Email: ${officialEmail}`;
          }
          if (line.toLowerCase().includes('web') || line.includes('www.')) {
            return `Website: ${officialWebsite}`;
          }
          if (line.toLowerCase().includes('telepon') || line.toLowerCase().includes('phone') || line.toLowerCase().includes('telp')) {
            return isEn ? `Phone: ${officialPhone}` : `Telepon: ${officialPhone}`;
          }
          if (line.toLowerCase().includes('alamat') || line.toLowerCase().includes('address') || line.toLowerCase().includes('jl.')) {
            return isEn ? `Address: ${officialAddress}` : `Alamat: ${officialAddress}`;
          }
          return line;
        });
      }
    }
  });

  return {
    isValid: violationsCount === 0,
    violationsCount,
    sanitizedResult: aiResult,
  };
}

/**
 * Normalisasi dan validasi slide agar mematuhi Auto Layout Design System (Maksimal 15 slide)
 */
function normalizeSlideDeckLayouts(slides, totalCount, options = {}) {
  const { layoutMode = 'auto', layoutSelections = [] } = options;
  const isManual = layoutMode === 'manual' && Array.isArray(layoutSelections) && layoutSelections.length > 0;
  const count = Math.min(Math.max(totalCount || slides.length || 5, 1), 15);
  const sliced = slides.slice(0, count);

  let normalized = sliced.map((slide, idx) => {
    const slideNumber = slide.slideNumber || idx + 1;
    let content = Array.isArray(slide.content) ? slide.content : [];

    if (content.length > 6) {
      content = normalizePoints(content);
    }

    const calculatedPointCount = content.length;

    // Jika manual mode, ambil layout yang dipilih user
    let finalLayoutId;
    if (isManual) {
      const userSel = layoutSelections.find((item) => item.slideNumber === slideNumber);
      finalLayoutId = userSel?.layoutId || slide.layoutId || 'three-points';
    } else {
      const computedLayout = selectLayout({ ...slide, content, slideNumber }, count, idx);
      finalLayoutId = slide.layoutId || computedLayout;
    }

    let slideType = slide.slideType || "content";
    if (idx === 0 || finalLayoutId === "cover-front" || finalLayoutId === "cover-front-editorial" || finalLayoutId.startsWith("cover-p")) {
      slideType = "cover";
    } else if (idx === count - 1 || finalLayoutId === "cover-back" || finalLayoutId === "cover-back-statement" || finalLayoutId.startsWith("closing-p")) {
      slideType = "closing";
    } else if (finalLayoutId === "table-of-contents" || finalLayoutId.startsWith("agenda-")) {
      slideType = "agenda";
    } else if (finalLayoutId === "chart" || finalLayoutId === "chart-stat" || finalLayoutId.startsWith("chart-p")) {
      slideType = "chart";
    } else if (finalLayoutId === "testimonial" || finalLayoutId === "testimonial-cards" || finalLayoutId.startsWith("testi-p")) {
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

  // Hanya jalankan validateConsecutiveLayouts jika BUKAN manual mode
  if (!isManual) {
    normalized = validateConsecutiveLayouts(normalized);
  }

  return normalized;
}

/**
 * Buat slide pengganti yang substantif, kontekstual, dan bebas dummy text
 */
function createDynamicSubstantiveSlide(slideNumber, layoutId, userTitle, userDescription, outputLanguage = 'id') {
  const isEn = (outputLanguage || 'id').toLowerCase() === 'en';
  const safeTitle = userTitle || (isEn ? 'Strategic Focus' : 'Fokus Strategis');

  // Tentukan judul dan konten berdasarkan slideNumber
  if (slideNumber === 1) {
    return {
      slideNumber: 1,
      slideType: 'cover',
      layoutId: layoutId || 'cover-front',
      pointCount: 0,
      layoutReason: isEn ? `Opening cover presenting ${safeTitle}` : `Slide pembuka memuat judul utama ${safeTitle}`,
      title: safeTitle,
      subtitle: userDescription ? userDescription.slice(0, 100) : (isEn ? 'Strategic Executive Framework' : 'Panduan Strategis & Kerangka Eksekusi'),
      content: [],
    };
  }

  if (slideNumber === 2 && (layoutId === 'table-of-contents' || layoutId.startsWith('agenda-'))) {
    return {
      slideNumber: 2,
      slideType: 'agenda',
      layoutId: layoutId || 'table-of-contents',
      pointCount: 4,
      layoutReason: isEn ? `Agenda overview for ${safeTitle}` : `Agenda pembahasan utama ${safeTitle}`,
      title: isEn ? 'Table of Contents' : 'Agenda Pembahasan',
      subtitle: isEn ? `Structured overview of ${safeTitle}` : `Rangkaian pembahasan ${safeTitle}`,
      content: isEn
        ? [
            `01. Context & Core Objectives of ${safeTitle}`,
            `02. Methodological Architecture & Strategy`,
            `03. Actionable Tactical Implementation`,
            `04. Performance Metrics & Measurable Outcomes`,
          ]
        : [
            `01. Latar Belakang & Urgensi ${safeTitle}`,
            `02. Pilar Strategis & Metodologi Utama`,
            `03. Rencana Eksekusi & Tahapan Praktis`,
            `04. Indikator Keberhasilan & Dampak Kinerja`,
          ],
    };
  }

  // Slide konten substantif
  const topicsId = [
    {
      title: `Pilar Utama ${safeTitle}`,
      points: [
        `Penyelarasan Strategis: Mengarahkan seluruh sumber daya dan kapabilitas tim pada inisiatif prioritas guna mempercepat pencapaian target.`,
        `Standarisasi Operasional: Membangun alur kerja terstruktur untuk memastikan konsistensi kualitas luaran di setiap lini pelaksanaan.`,
        `Optimalisasi Berkelanjutan: Memantau metrik performa secara berkala guna melakukan adaptasi taktik berbasis data riil.`,
      ],
    },
    {
      title: `Langkah Eksekusi ${safeTitle}`,
      points: [
        `Fase Penyiapan: Menyiapkan infrastruktur pendukung, dokumentasi prosedur, dan alokasi tim sebelum pelaksanaan dimulai.`,
        `Fase Implementasi: Meluncurkan inisiatif terarah secara bertahap dengan pengawasan kualitas berkala untuk meminimalkan risiko.`,
        `Fase Evaluasi: Menganalisis hasil penerapan menggunakan indikator kinerja kunci guna menyempurnakan efisiensi proses.`,
      ],
    },
    {
      title: `Indikator Capaian ${safeTitle}`,
      points: [
        `Efisiensi Operasional: Menargetkan penghematan waktu siklus kerja hingga 35% melalui otomatisasi dan penyederhanaan alur.`,
        `Kualitas & Akurasi: Menjaga standar kepuasan pemangku kepentingan di atas 90% dengan verifikasi mutu berlapis.`,
      ],
    },
  ];

  const topicsEn = [
    {
      title: `Core Strategic Pillars of ${safeTitle}`,
      points: [
        `Strategic Alignment: Directing core resources and team capabilities toward priority initiatives to accelerate target milestones.`,
        `Operational Standardization: Building structured workflows to guarantee consistent elite delivery across all execution channels.`,
        `Continuous Optimization: Tracking key performance indicators in real-time to implement data-driven tactical adjustments.`,
      ],
    },
    {
      title: `Tactical Execution Plan for ${safeTitle}`,
      points: [
        `Readiness Phase: Establishing foundation architectures, operational guidelines, and resource allocation before rollout.`,
        `Implementation Phase: Deploying targeted initiatives iteratively with quality safeguards to mitigate operational risks.`,
        `Synthesis Phase: Analyzing outcome metrics against primary benchmarks to refine long-term efficiency and impact.`,
      ],
    },
    {
      title: `Key Performance Benchmarks`,
      points: [
        `Operational Efficiency: Target a 35% reduction in cycle duration through workflow streamlining and automated toolchains.`,
        `Quality Standards: Sustain stakeholder satisfaction ratings above 90% through rigorous multi-tier verification.`,
      ],
    },
  ];

  const topics = isEn ? topicsEn : topicsId;
  const topicData = topics[(slideNumber - 2) % topics.length] || topics[0];

  return {
    slideNumber,
    slideType: 'content',
    layoutId: layoutId || 'three-points',
    pointCount: topicData.points.length,
    layoutReason: isEn ? `Substantive content supporting ${safeTitle}` : `Pembahasan mendalam mendukung ${safeTitle}`,
    title: topicData.title,
    subtitle: isEn ? `Actionable insight on ${safeTitle}` : `Penjelasan konkret ${safeTitle}`,
    content: topicData.points,
  };
}

/**
 * Fallback cerdas yang dinamis 100% mengikuti judul user dan layout pilihan
 */
function getRuleBasedFallback({
  title,
  description,
  outputLanguage = "id",
  slideCount = 5,
  layoutMode = "auto",
  layoutSelections = [],
}) {
  const isEn = (outputLanguage || "id").toLowerCase() === "en";
  const count = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);
  const safeTitle = title || (isEn ? "Strategic Master Presentation" : "Presentasi Master Strategis");
  const safeDesc = description || (isEn ? "Actionable Framework and Core Directives" : "Rencana Strategis dan Panduan Implementasi");
  const isManual = layoutMode === "manual" && Array.isArray(layoutSelections) && layoutSelections.length > 0;

  const defaultPairing = FONT_PAIRINGS[0]; // Montserrat + Open Sans

  const generatedSlides = [];
  for (let i = 1; i <= count; i++) {
    let layoutId = "three-points";
    if (isManual) {
      const userSel = layoutSelections.find((item) => item.slideNumber === i);
      if (userSel) layoutId = userSel.layoutId;
    } else {
      if (i === 1) layoutId = "cover-front";
      else if (i === count) layoutId = "cover-back";
      else if (i === 2 && count >= 4) layoutId = "table-of-contents";
      else if (i === 3) layoutId = "comparison";
      else if (i === 4) layoutId = "three-points";
      else if (i === 5) layoutId = "steps";
      else if (i === 6) layoutId = "chart";
      else layoutId = "three-points";
    }

    if (i === count && (layoutId === "cover-back" || layoutId.startsWith("closing-"))) {
      generatedSlides.push({
        slideNumber: i,
        slideType: "closing",
        layoutId,
        pointCount: 0,
        layoutReason: isEn ? `Closing slide for ${safeTitle}` : `Slide penutup dan call to action untuk ${safeTitle}`,
        title: isEn ? "Initiate Your Strategy" : "Mulai Langkah Transformasi Anda",
        subtitle: isEn ? `Consult and collaborate on ${safeTitle}` : `Konsultasi & sesi diskusi lanjutan mengenai ${safeTitle}`,
        content: isEn
          ? [
              "Email: hello@reallygreatsite.com",
              "Website: www.reallygreatsite.com",
              "Address: 123 Anywhere St., Any City",
            ]
          : [
              "Email: halo@situssupercanggih.co.id",
              "Website: www.situssupercanggih.co.id",
              "Alamat: Jl. Mangga Muda 17A, Cilandak, Jakarta Selatan 12310",
            ],
      });
    } else {
      generatedSlides.push(createDynamicSubstantiveSlide(i, layoutId, safeTitle, safeDesc, outputLanguage));
    }
  }

  const normalizedSlides = normalizeSlideDeckLayouts(generatedSlides, count, { layoutMode, layoutSelections });

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
 * Menerapkan alur 3 tahap dengan validasi slide bebas dummy text & retry per slide
 */
async function generateCopywriting(input) {
  const {
    title,
    description = "",
    outputLanguage = "id",
    slideCount = 5,
    layoutMode = "auto",
    layoutSelections = [],
  } = input;

  const effectiveSlideCount = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);
  const isEn = (outputLanguage || "id").toLowerCase() === "en";

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY tidak dikonfigurasi. Menggunakan rule-based fallback.");
    return getRuleBasedFallback({
      title,
      description,
      outputLanguage,
      slideCount: effectiveSlideCount,
      layoutMode,
      layoutSelections,
    });
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

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel(
        {
          model: modelName,
          generationConfig: {
            temperature: 0.65,
            responseMimeType: "application/json",
          },
        },
        { timeout: 35000 }
      );

      // ─── PERCOBAAN 1: Prompt Standar ─────────────────────────
      console.log(`[AI Generation] Percobaan 1: Mengirim prompt ke ${modelName} (mode: ${layoutMode})...`);
      const prompt = buildMasterPrompt({
        title,
        description,
        outputLanguage,
        slideCount: effectiveSlideCount,
        retryContext: false,
        layoutMode,
        layoutSelections,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let parsed = cleanAndParseJSON(response.text());

      if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
        throw new Error("Format respons AI tidak memiliki array 'slides' yang valid");
      }

      // Validasi Relevansi Konten
      let relevance = validateContentRelevance(parsed, title);
      console.log(`[AI Validation] Percobaan 1 Relevansi: ${relevance.relevanceScore}% (${relevance.relevantSlides}/${relevance.totalSlides} slide cocok)`);

      // ─── PERCOBAAN 2: Jika relevansi < 60%, Jalankan Retry Deck Penuh ─────
      if (!relevance.isRelevant) {
        console.warn(`[AI Validation] Relevansi rendah (${relevance.relevanceScore}% < 60%). Percobaan 2: Menjalankan retry dengan instruksi anti-drift tegas...`);
        const retryPrompt = buildMasterPrompt({
          title,
          description,
          outputLanguage,
          slideCount: effectiveSlideCount,
          retryContext: true,
          layoutMode,
          layoutSelections,
        });

        try {
          const retryResult = await model.generateContent(retryPrompt);
          const retryResponse = await retryResult.response;
          const retryParsed = cleanAndParseJSON(retryResponse.text());

          if (retryParsed.slides && Array.isArray(retryParsed.slides) && retryParsed.slides.length > 0) {
            const retryRelevance = validateContentRelevance(retryParsed, title);
            console.log(`[AI Validation] Percobaan 2 Relevansi: ${retryRelevance.relevanceScore}% (${retryRelevance.relevantSlides}/${retryRelevance.totalSlides} slide cocok)`);
            if (retryRelevance.relevanceScore >= relevance.relevanceScore) {
              parsed = retryParsed;
              relevance = retryRelevance;
            }
          }
        } catch (retryErr) {
          console.warn("[AI Validation] Percobaan 2 gagal di-parse:", retryErr.message);
        }
      }

      // Potong ke tepat effectiveSlideCount
      if (parsed.slides.length > effectiveSlideCount) {
        parsed.slides = parsed.slides.slice(0, effectiveSlideCount);
      }

      const slideCountResult = Math.min(parsed.slides.length, effectiveSlideCount);
      parsed.slides = normalizeSlideDeckLayouts(parsed.slides, slideCountResult, { layoutMode, layoutSelections });

      // ─── VALIDASI KONTEN SLIDE & RETRY PER-SLIDE (BEBAS DUMMY TEXT) ─────
      let slideValidation = validateSlideContent(parsed.slides, title, outputLanguage);
      if (!slideValidation.isValid) {
        console.warn(`[Slide Content Validator] Ditemukan ${slideValidation.invalidSlides.length} slide invalid/dummy. Menjalankan targeted single-slide retry...`);

        for (const invalidInfo of slideValidation.invalidSlides) {
          let fixedSlide = null;
          const targetIndex = parsed.slides.findIndex((s) => s.slideNumber === invalidInfo.slideNumber);
          if (targetIndex === -1) continue;

          const currentSlide = parsed.slides[targetIndex];

          // Lakukan retry hingga 2 kali untuk slide bermasalah
          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              console.log(`[Slide Retry] Mencoba perbaiki Slide ${invalidInfo.slideNumber} (Percobaan ${attempt})...`);
              const singlePrompt = buildSingleSlideRetryPrompt({
                slideNumber: invalidInfo.slideNumber,
                layoutId: currentSlide.layoutId || 'three-points',
                currentTitle: currentSlide.title || '',
                userTitle: title,
                userDescription: description,
                outputLanguage,
                reasons: invalidInfo.reasons,
              });

              const singleRes = await model.generateContent(singlePrompt);
              const singleText = (await singleRes.response).text();
              const singleParsed = cleanAndParseJSON(singleText);

              if (singleParsed && singleParsed.title && !isDummyText(singleParsed.title)) {
                if (Array.isArray(singleParsed.content) && singleParsed.content.length > 0) {
                  const hasDummy = singleParsed.content.some((c) => isDummyText(c));
                  if (!hasDummy) {
                    fixedSlide = {
                      ...currentSlide,
                      ...singleParsed,
                      slideNumber: invalidInfo.slideNumber,
                      layoutId: currentSlide.layoutId, // pertahankan layout
                    };
                    console.log(`✅ [Slide Retry] Slide ${invalidInfo.slideNumber} berhasil diperbaiki melalui AI retry!`);
                    break;
                  }
                }
              }
            } catch (singleErr) {
              console.warn(`[Slide Retry] Gagal pada percobaan ${attempt} untuk slide ${invalidInfo.slideNumber}:`, singleErr.message);
            }
          }

          // Jika setelah 2 kali retry AI masih gagal, gantikan dengan slide substantif rule-based
          if (!fixedSlide) {
            console.log(`⚠️ [Slide Retry] Menggunakan dynamic substantive generator untuk Slide ${invalidInfo.slideNumber}.`);
            fixedSlide = createDynamicSubstantiveSlide(
              invalidInfo.slideNumber,
              currentSlide.layoutId,
              title,
              description,
              outputLanguage
            );
          }

          parsed.slides[targetIndex] = fixedSlide;
        }

        // Re-normalisasi setelah perbaikan slide
        parsed.slides = normalizeSlideDeckLayouts(parsed.slides, slideCountResult, { layoutMode, layoutSelections });
      }

      // Validasi dan Sanitisasi Placeholder Text Toolkit (Canva Ipsum)
      const placeholderCheck = validatePlaceholders(parsed, outputLanguage);
      if (!placeholderCheck.isValid) {
        console.log(`[Placeholder Sanitizer] Berhasil membersihkan dan mengganti ${placeholderCheck.violationsCount} placeholder acak.`);
      }
      parsed = placeholderCheck.sanitizedResult;

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
          (isEn
            ? "Curated professional font pairing for executive black-and-white master deck."
            : "Kombinasi font profesional dan elegan dari text toolkit untuk master hitam-putih."),
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

      console.log(`✅ Berhasil menghasilkan ${parsed.slides.length} slide 100% bebas dummy text menggunakan Gemini (${modelName})`);

      return {
        success: true,
        data: parsed,
      };
    } catch (err) {
      console.warn(`[AI Generation] Gagal menggunakan model ${modelName}:`, err.message);
    }
  }

  // Jika seluruh model Gemini gagal, aktifkan rule-based fallback cerdas
  console.warn("Semua model Gemini gagal. Mengaktifkan Rule-Based Fallback dinamis.");
  return getRuleBasedFallback({
    title,
    description,
    outputLanguage,
    slideCount: effectiveSlideCount,
    layoutMode,
    layoutSelections,
  });
}

/**
 * Regenerate points for a single slide when layout changes to a higher point count
 */
async function regenerateSlideContent({
  slideTitle,
  slideTheme,
  currentLayoutId,
  newLayoutId,
  outputLanguage = 'id',
  existingContent = [],
  newPointCount = 3,
}) {
  const isEn = (outputLanguage || 'id').toLowerCase() === 'en';
  const targetCount = Math.min(Math.max(parseInt(newPointCount, 10) || 3, 1), 6);
  const safeTitle = slideTitle || (isEn ? 'Strategic Focus' : 'Fokus Strategis');
  const safeTheme = slideTheme || safeTitle;

  const validExisting = (existingContent || [])
    .filter((p) => p && typeof p === 'string' && !isDummyText(p));

  // Fallback points builder (rule-based substantive expansion)
  const buildSubstantiveFallbackPoints = () => {
    const poolEn = [
      `Strategic alignment: establishing core operational milestones for ${safeTitle}.`,
      `Performance optimization: streamlining workflow pipelines to maximize efficiency.`,
      `Data-driven metrics: tracking quantifiable KPIs to ensure continuous improvement.`,
      `Resource allocation: optimizing capital and talent to accelerate strategic execution.`,
      `Risk mitigation: implementing proactive compliance and contingency frameworks.`,
      `Scalability architecture: establishing adaptable foundations for sustained growth.`,
    ];
    const poolId = [
      `Penyelarasan strategis: menetapkan tonggak operasional utama untuk ${safeTitle}.`,
      `Optimalisasi kinerja: menyederhanakan alur kerja guna memaksimalkan efisiensi tim.`,
      `Metrik berbasis data: memantau KPI terukur untuk menjamin peningkatan berkelanjutan.`,
      `Alokasi sumber daya: mengoptimalkan modal dan talenta untuk percepatan eksekusi.`,
      `Mitigasi risiko: menerapkan kepatuhan proaktif dan rencana kontinjensi yang matang.`,
      `Arsitektur skalabilitas: membangun fondasi yang adaptif demi pertumbuhan jangka panjang.`,
    ];
    const pool = isEn ? poolEn : poolId;
    const result = [...validExisting];
    let poolIdx = 0;
    while (result.length < targetCount && poolIdx < pool.length) {
      if (!result.includes(pool[poolIdx])) {
        result.push(pool[poolIdx]);
      }
      poolIdx++;
    }
    return result.slice(0, targetCount);
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    const prompt = buildRegenerateSlidePrompt({
      slideTitle: safeTitle,
      slideTheme: safeTheme,
      currentLayoutId,
      newLayoutId,
      outputLanguage: isEn ? 'en' : 'id',
      existingContent: validExisting,
      newPointCount: targetCount,
    });

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            topP: 0.85,
            maxOutputTokens: 2048,
          },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = cleanAndParseJSON(responseText);

        if (parsed && Array.isArray(parsed.points) && parsed.points.length > 0) {
          const cleanedPoints = parsed.points
            .map((p) => String(p).trim())
            .filter((p) => p && !isDummyText(p));

          if (cleanedPoints.length >= targetCount) {
            return {
              success: true,
              data: {
                slideTitle: parsed.title || safeTitle,
                points: cleanedPoints.slice(0, targetCount),
              },
            };
          }
        }
      } catch (geminiErr) {
        console.warn(`[Slide Regeneration] Model ${modelName} failed:`, geminiErr.message);
      }
    }
  }

  // Fallback if AI call fails or is unavailable
  const fallbackPoints = buildSubstantiveFallbackPoints();
  return {
    success: true,
    data: {
      slideTitle: safeTitle,
      points: fallbackPoints,
    },
  };
}

module.exports = {
  generateCopywriting,
  regenerateSlideContent,
  getRuleBasedFallback,
  normalizeSlideDeckLayouts,
  validatePlaceholders,
  createDynamicSubstantiveSlide,
};
