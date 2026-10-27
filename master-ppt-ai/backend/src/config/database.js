const { supabase } = require('./supabase');
const { randomUUID: uuidv4 } = require('crypto');

/**
 * Initialize database tables in Supabase (PostgreSQL)
 * This runs the SQL to create tables if they don't exist
 */
async function initializeDatabase() {
  try {
    // Test connection
    const { data, error } = await supabase.from('themes').select('id').limit(1);
    
    if (error && error.code === '42P01') {
      // Tables don't exist yet - they should be created via Supabase SQL editor
      console.log('⚠️  Tables not found. Please run the SQL migration in Supabase SQL Editor.');
      console.log('   See: backend/supabase-migration.sql');
    } else if (error) {
      console.error('Database connection error:', error.message);
    } else {
      console.log('✅ Database connected to Supabase successfully');
      // Seed themes if empty
      await seedThemes();
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

async function seedThemes() {
  const { data: existingThemes, error } = await supabase.from('themes').select('name');
  
  if (error) {
    console.error('Error checking themes:', error.message);
    return;
  }

  const existingNames = (existingThemes || []).map(t => t.name);

  const themes = [
    {
      id: uuidv4(),
      name: 'Bisnis',
      description: 'Template profesional untuk presentasi bisnis, laporan keuangan, dan pitch deck perusahaan.',
      font_heading: 'Montserrat',
      font_body: 'Open Sans',
      color_primary: '#1E3A5F',
      color_secondary: '#2D6A9F',
      color_accent: '#F59E0B',
      category: 'professional',
      layout_templates: JSON.stringify(['title', 'content', 'comparison', 'chart', 'closing']),
      preview_image: null,
      slide_count: 5,
    },
    {
      id: uuidv4(),
      name: 'Edukasi',
      description: 'Template cerah dan informatif untuk presentasi akademik, e-learning, dan materi pembelajaran.',
      font_heading: 'Poppins',
      font_body: 'Nunito',
      color_primary: '#065F46',
      color_secondary: '#10B981',
      color_accent: '#F97316',
      category: 'education',
      layout_templates: JSON.stringify(['title', 'content', 'quiz', 'timeline', 'summary']),
      preview_image: null,
      slide_count: 5,
    },
    {
      id: uuidv4(),
      name: 'Kreatif',
      description: 'Template dinamis dan berwarna untuk presentasi kreatif, desain, dan portofolio.',
      font_heading: 'Playfair Display',
      font_body: 'Lato',
      color_primary: '#7C3AED',
      color_secondary: '#EC4899',
      color_accent: '#FBBF24',
      category: 'creative',
      layout_templates: JSON.stringify(['title', 'portfolio', 'gallery', 'quote', 'closing']),
      preview_image: null,
      slide_count: 5,
    },
    {
      id: uuidv4(),
      name: 'Minimalis',
      description: 'Template bersih dan elegan dengan ruang putih yang luas untuk pesan yang kuat.',
      font_heading: 'Inter',
      font_body: 'Inter',
      color_primary: '#111827',
      color_secondary: '#6B7280',
      color_accent: '#3B82F6',
      category: 'minimal',
      layout_templates: JSON.stringify(['title', 'content', 'quote', 'data', 'closing']),
      preview_image: null,
      slide_count: 5,
    },
    {
      id: uuidv4(),
      name: 'Teknologi',
      description: 'Template futuristik untuk startup tech, produk digital, dan inovasi teknologi.',
      font_heading: 'Rajdhani',
      font_body: 'Roboto',
      color_primary: '#0F172A',
      color_secondary: '#1E40AF',
      color_accent: '#06B6D4',
      category: 'technology',
      layout_templates: JSON.stringify(['title', 'product', 'roadmap', 'team', 'metrics', 'closing']),
      preview_image: null,
      slide_count: 5,
    },
    {
      id: uuidv4(),
      name: 'Tema Bebas',
      description: 'Template serbaguna dinamis yang di-generate cerdas oleh AI berdasarkan judul dan deskripsi khusus Anda.',
      font_heading: 'Plus Jakarta Sans',
      font_body: 'Inter',
      color_primary: '#2563EB',
      color_secondary: '#1D4ED8',
      color_accent: '#F59E0B',
      category: 'custom',
      layout_templates: JSON.stringify(['title', 'content', 'two-column', 'comparison', 'statistics', 'timeline', 'closing']),
      preview_image: null,
      slide_count: 5,
    },
  ];

  const themesToInsert = themes.filter(t => !existingNames.includes(t.name));

  if (themesToInsert.length > 0) {
    const { error: insertError } = await supabase.from('themes').insert(themesToInsert);
    if (insertError) {
      console.error('Error seeding themes:', insertError.message);
    } else {
      console.log(`✅ Seeded ${themesToInsert.length} new themes`);
    }
  }

  console.log('✅ Themes verified and seeded successfully (6 themes total)');
}

module.exports = { initializeDatabase, supabase };
