const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, registerValidation, loginValidation } = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
