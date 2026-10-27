const { generateCopywriting } = require("../services/aiService");

/**
 * Controller for generating AI copywriting and presentation design recommendations
 */
async function generateAIContent(req, res) {
  try {
    const {
      title,
      theme,
      description,
      slideCount,
      customColors,
    } = req.body;

    // Validasi input
    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Judul presentasi wajib diisi",
      });
    }

    const count = parseInt(slideCount, 10);
    if (isNaN(count) || count < 1 || count > 15) {
      return res.status(400).json({
        success: false,
        error: "Jumlah slide harus antara 1 sampai 15",
      });
    }

    const result = await generateCopywriting({
      title: title.trim(),
      theme: theme || "Bisnis",
      description: description ? description.trim() : "",
      slideCount: count,
      customColors: customColors || null,
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
