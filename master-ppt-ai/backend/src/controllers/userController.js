const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { supabase } = require('../config/supabase');

const updateProfileValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus antara 2-100 karakter'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Password saat ini diperlukan'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password baru minimal 8 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
];

async function getProfile(req, res) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, created_at, updated_at')
      .eq('id', req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    
    const { count } = await supabase
      .from('master_histories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);

    const { data: recentMasters } = await supabase
      .from('master_histories')
      .select(`
        *,
        themes:theme_id (name, color_primary, category)
      `)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Format recentMasters to match original response shape
    const formattedMasters = (recentMasters || []).map(m => ({
      ...m,
      theme_name: m.themes?.name || m.theme_name,
      color_primary: m.themes?.color_primary || null,
      category: m.themes?.category || null,
      themes: undefined,
    }));
    
    return res.json({
      success: true,
      data: {
        ...user,
        masterCount: count || 0,
        recentMasters: formattedMasters,
      },
    });
  } catch (error) {
    console.error('GetProfile error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

async function updateProfile(req, res) {
  const { name } = req.body;
  
  try {
    const { error: updateError } = await supabase
      .from('users')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', req.userId);

    if (updateError) throw updateError;
    
    const { data: updatedUser } = await supabase
      .from('users')
      .select('id, email, name, updated_at')
      .eq('id', req.userId)
      .single();
    
    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: updatedUser,
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah.' });
    }
    
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq('id', req.userId);

    if (updateError) throw updateError;
    
    return res.json({
      success: true,
      message: 'Password berhasil diubah.',
    });
  } catch (error) {
    console.error('ChangePassword error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { getProfile, updateProfile, changePassword, updateProfileValidation, changePasswordValidation };
