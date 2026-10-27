const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, updateProfileValidation, changePasswordValidation } = require('../controllers/userController');
const { validate } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/password', changePasswordValidation, validate, changePassword);

module.exports = router;
