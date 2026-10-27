const { verifyToken } = require('../config/jwt');
const { supabase } = require('../config/supabase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi diperlukan. Silakan login terlebih dahulu.',
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Check if user still exists in database
    const { data: user, error } = await supabase
      .from('ppt_users')
      .select('id, email, name')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan. Token tidak valid.',
      });
    }
    
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi Anda telah berakhir. Silakan login kembali.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memverifikasi token.',
    });
  }
}

module.exports = authMiddleware;
