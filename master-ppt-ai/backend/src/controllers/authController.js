const bcrypt = require('bcryptjs');
const { randomUUID: uuidv4 } = require('crypto');
const { body } = require('express-validator');
const { supabase } = require('../config/supabase');
const { generateToken } = require('../config/jwt');
const { validate } = require('../middleware/validation');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus antara 2-100 karakter'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password minimal 8 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password tidak boleh kosong'),
];

// Register
async function register(req, res) {
  const { name, email, password } = req.body;
  
  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Gunakan email lain atau login.',
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const userId = uuidv4();
    
    // Insert user
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: passwordHash,
        name,
      });

    if (insertError) {
      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar. Gunakan email lain atau login.',
        });
      }
      throw insertError;
    }
    
    // Generate token
    const token = generateToken({ userId, email });
    
    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Selamat datang.',
      data: {
        token,
        user: { id: userId, email, name },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Coba lagi.',
    });
  }
}

// Login
async function login(req, res) {
  const { email, password } = req.body;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }
    
    const token = generateToken({ userId: user.id, email: user.email });
    
    return res.json({
      success: true,
      message: 'Login berhasil! Selamat datang kembali.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Coba lagi.',
    });
  }
}

// Logout (client-side token removal; server-side for future blacklist support)
async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logout berhasil. Sampai jumpa!',
  });
}

// Get current user
async function getMe(req, res) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, created_at, updated_at')
      .eq('id', req.userId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }
    
    // Get master count
    const { count } = await supabase
      .from('master_histories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);
    
    return res.json({
      success: true,
      data: {
        ...user,
        masterCount: count || 0,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
    });
  }
}

module.exports = { register, login, logout, getMe, registerValidation, loginValidation };
