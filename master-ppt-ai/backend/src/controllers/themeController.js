const { supabase } = require('../config/supabase');
const { getRecommendations } = require('../utils/aiEngine');

async function getAllThemes(req, res) {
  try {
    const { data: themes, error } = await supabase
      .from('themes')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    // Parse JSON fields
    const themesWithParsed = (themes || []).map((theme) => ({
      ...theme,
      layout_templates: JSON.parse(theme.layout_templates || '[]'),
    }));
    
    return res.json({
      success: true,
      data: themesWithParsed,
    });
  } catch (error) {
    console.error('GetAllThemes error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

async function getThemeById(req, res) {
  const { id } = req.params;
  
  try {
    const { data: theme, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !theme) {
      return res.status(404).json({ success: false, message: 'Tema tidak ditemukan.' });
    }
    
    // Get AI recommendations for this theme
    const recommendations = getRecommendations(theme.name);
    
    return res.json({
      success: true,
      data: {
        ...theme,
        layout_templates: JSON.parse(theme.layout_templates || '[]'),
        aiRecommendations: recommendations,
      },
    });
  } catch (error) {
    console.error('GetThemeById error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

async function getThemeRecommendations(req, res) {
  const { id } = req.params;
  const customizations = req.body || {};
  
  try {
    const { data: theme, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !theme) {
      return res.status(404).json({ success: false, message: 'Tema tidak ditemukan.' });
    }
    
    const recommendations = getRecommendations(theme.name, customizations);
    
    return res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('GetThemeRecommendations error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { getAllThemes, getThemeById, getThemeRecommendations };
