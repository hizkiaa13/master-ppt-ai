const { generateCopywriting } = require("../services/aiService");

/**
 * Controller for generating AI copywriting and presentation design recommendations
 * Base Master (Hitam & Putih)
 */
async function generateAIContent(req, res) {
  try {
    const {
      title,
      description,
      outputLanguage = "id",
    } = req.body;

    // Validasi input judul
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

    // Normalisasi outputLanguage: hanya 'id' atau 'en'
    const normalizedLang = (outputLanguage || "id").toLowerCase() === "en" ? "en" : "id";

    const result = await generateCopywriting({
      title: title.trim(),
      description: description ? String(description).trim() : "",
      outputLanguage: normalizedLang,
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
