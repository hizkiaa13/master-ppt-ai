const { generateCopywriting } = require("../services/aiService");

/**
 * Controller for generating AI copywriting and presentation design recommendations
 * Base Master (Hitam & Putih) - Mendukung slideCount dan layoutReason
 */
async function generateAIContent(req, res) {
  try {
    const {
      title,
      description,
      outputLanguage = "id",
      slideCount = 5,
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

    const result = await generateCopywriting({
      title: title.trim(),
      description: description ? String(description).trim() : "",
      outputLanguage: normalizedLang,
      slideCount: effectiveSlideCount,
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

module.exports = {
  generateAIContent,
};
