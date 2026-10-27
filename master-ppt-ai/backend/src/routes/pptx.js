const express = require('express');
const router = express.Router();
const {
  generatePPTX,
  getPreview,
  updateSlide,
  finalizePPTX,
  downloadPPTX,
  getHistory,
} = require('../controllers/pptxController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Core endpoints
router.post('/generate', generatePPTX);
router.get('/preview/:masterId', getPreview);
router.put('/slide/:slideId', updateSlide);
router.put('/slide/:masterId/:slideNumber', updateSlide);
router.put('/slides/:masterId', updateSlide);
router.post('/finalize/:masterId', finalizePPTX);
router.get('/download/:id', downloadPPTX);
router.get('/history', getHistory);

module.exports = router;
