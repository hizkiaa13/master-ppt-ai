const express = require('express');
const router = express.Router();
const { getAllThemes, getThemeById, getThemeRecommendations } = require('../controllers/themeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getAllThemes);
router.get('/:id', getThemeById);
router.post('/:id/recommendations', getThemeRecommendations);

module.exports = router;
