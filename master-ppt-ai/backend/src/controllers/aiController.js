const { generateCopywriting, regenerateSlideContent } = require("../services/aiService");

/**
 * Controller for generating AI copywriting and presentation design recommendations
 * Base Master (Hitam & Putih) - Mendukung Auto AI Mode & Manual Layout Mode
 */
async function generateAIContent(req, res) {
  try {
    const {
      title,
      description,
      outputLanguage = "id",
      slideCount = 5,
      layoutMode = "auto",
      layoutSelections = [],
    } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Judul presentasi wajib diisi",
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        error: "Judul presentasi maksimal 150 karakter",
      });
    }

    const normalizedLang = (outputLanguage || "id").toLowerCase() === "en" ? "en" : "id";
    const effectiveSlideCount = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);
    const normalizedMode = layoutMode === "manual" ? "manual" : "auto";

    const result = await generateCopywriting({
      title: title.trim(),
      description: description ? String(description).trim() : "",
      outputLanguage: normalizedLang,
      slideCount: effectiveSlideCount,
      layoutMode: normalizedMode,
      layoutSelections: Array.isArray(layoutSelections) ? layoutSelections : [],
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("AI generate error:", error);
    return res.status(500).json({
      success: false,
      error: "Gagal menghasilkan konten AI. Silakan coba lagi.",
    });
  }
}

/**
 * Controller for dynamically regenerating slide points when layout changes
 */
async function regenerateSlide(req, res) {
  try {
    const {
      masterId,
      slideNumber,
      currentLayoutId,
      newLayoutId,
      slideTitle,
      slideTheme,
      outputLanguage = "id",
      existingContent = [],
      newPointCount = 3,
    } = req.body;

    const result = await regenerateSlideContent({
      slideTitle,
      slideTheme,
      currentLayoutId,
      newLayoutId,
      outputLanguage,
      existingContent: Array.isArray(existingContent) ? existingContent : [],
      newPointCount: parseInt(newPointCount, 10) || 3,
    });

    return res.status(200).json({
      success: true,
      data: {
        slideNumber,
        currentLayoutId,
        newLayoutId,
        ...result.data,
      },
    });
  } catch (error) {
    console.error("Slide regenerate error:", error);
    return res.status(500).json({
      success: false,
      error: "Gagal meregenerasi konten slide. Silakan coba lagi.",
    });
  }
}

module.exports = {
  generateAIContent,
  regenerateSlide,
};
