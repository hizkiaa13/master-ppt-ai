const { randomUUID: uuidv4 } = require('crypto');
const { supabase } = require('../config/supabase');

/**
 * Parse JSON safely from text column
 */
function parseJSON(str, fallback = null) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

/**
 * Format a draft row from DB into a clean API response object
 */
function formatDraft(row, includeSlides = false) {
  if (!row) return null;
  const base = {
    id: row.id,
    userId: row.user_id,
    themeId: row.theme_id,
    themeName: row.theme_name || null,
    themeColorPrimary: row.theme_color_primary || null,
    customTitle: row.custom_title || 'Tanpa Judul',
    customDescription: row.custom_description || '',
    slideCount: row.slide_count || 5,
    customColors: parseJSON(row.custom_colors),
    currentStep: row.current_step || 1,
    status: row.status || 'in_progress',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (includeSlides) {
    base.formData = parseJSON(row.form_data, {});
    base.generatedSlides = parseJSON(row.generated_slides, []);
    base.editedSlides = parseJSON(row.edited_slides, []);
    base.recommendations = parseJSON(row.recommendations, null);
  }

  return base;
}

// ─── POST /api/drafts ─────────────────────────────────────────
async function createDraft(req, res) {
  const userId = req.userId;
  const {
    themeId,
    customTitle,
    customDescription,
    slideCount,
    customColors,
    currentStep,
    formData,
    generatedSlides,
    editedSlides,
    recommendations,
    status,
  } = req.body;

  try {
    // Enforce max 10 drafts per user (clean up oldest in_progress if over limit)
    const { count } = await supabase
      .from('drafts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count >= 10) {
      // Delete the oldest in_progress draft to make room
      const { data: oldest } = await supabase
        .from('drafts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .order('updated_at', { ascending: true })
        .limit(1)
        .single();

      if (oldest) {
        await supabase.from('drafts').delete().eq('id', oldest.id);
      }
    }

    // Get theme name for display
    let themeName = null;
    let themeColorPrimary = null;
    if (themeId) {
      const { data: theme } = await supabase
        .from('themes')
        .select('name, color_primary')
        .eq('id', themeId)
        .single();
      if (theme) {
        themeName = theme.name;
        themeColorPrimary = theme.color_primary;
      }
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const { error: insertError } = await supabase
      .from('drafts')
      .insert({
        id,
        user_id: userId,
        theme_id: themeId || null,
        custom_title: (customTitle || '').trim().slice(0, 255),
        custom_description: (customDescription || '').trim().slice(0, 2000),
        slide_count: parseInt(slideCount, 10) || 5,
        custom_colors: customColors ? JSON.stringify(customColors) : null,
        current_step: parseInt(currentStep, 10) || 1,
        form_data: formData ? JSON.stringify(formData) : null,
        generated_slides: generatedSlides ? JSON.stringify(generatedSlides) : null,
        edited_slides: editedSlides ? JSON.stringify(editedSlides) : null,
        recommendations: recommendations ? JSON.stringify(recommendations) : null,
        status: status || 'in_progress',
        created_at: now,
        updated_at: now,
      });

    if (insertError) throw insertError;

    return res.status(201).json({
      success: true,
      message: 'Draft berhasil disimpan.',
      data: { id, updatedAt: now, themeName, themeColorPrimary },
    });
  } catch (err) {
    console.error('createDraft error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan draft: ' + err.message });
  }
}

// ─── GET /api/drafts ──────────────────────────────────────────
async function getDrafts(req, res) {
  const userId = req.userId;
  try {
    const { data: rows, error } = await supabase
      .from('drafts')
      .select(`
        *,
        themes:theme_id (name, color_primary)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const formatted = (rows || []).map(r => {
      const row = {
        ...r,
        theme_name: r.themes?.name || null,
        theme_color_primary: r.themes?.color_primary || null,
        themes: undefined,
      };
      return formatDraft(row, false);
    });

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error('getDrafts error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat draft.' });
  }
}

// ─── GET /api/drafts/:id ──────────────────────────────────────
async function getDraftById(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  try {
    const { data: row, error } = await supabase
      .from('drafts')
      .select(`
        *,
        themes:theme_id (name, color_primary)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !row) {
      return res.status(404).json({ success: false, message: 'Draft tidak ditemukan.' });
    }

    const formatted = {
      ...row,
      theme_name: row.themes?.name || null,
      theme_color_primary: row.themes?.color_primary || null,
      themes: undefined,
    };

    return res.json({ success: true, data: formatDraft(formatted, true) });
  } catch (err) {
    console.error('getDraftById error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat detail draft.' });
  }
}

// ─── PUT /api/drafts/:id ──────────────────────────────────────
async function updateDraft(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const {
    themeId,
    customTitle,
    customDescription,
    slideCount,
    customColors,
    currentStep,
    formData,
    generatedSlides,
    editedSlides,
    recommendations,
    status,
  } = req.body;

  try {
    // Check exists
    const { data: existing } = await supabase
      .from('drafts')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Draft tidak ditemukan.' });
    }

    const now = new Date().toISOString();
    const updates = { updated_at: now };

    if (themeId !== undefined) updates.theme_id = themeId;
    if (customTitle !== undefined) updates.custom_title = (customTitle || '').trim().slice(0, 255);
    if (customDescription !== undefined) updates.custom_description = (customDescription || '').trim().slice(0, 2000);
    if (slideCount !== undefined) updates.slide_count = parseInt(slideCount, 10) || 5;
    if (customColors !== undefined) updates.custom_colors = customColors ? JSON.stringify(customColors) : null;
    if (currentStep !== undefined) updates.current_step = parseInt(currentStep, 10) || 1;
    if (formData !== undefined) updates.form_data = formData ? JSON.stringify(formData) : null;
    if (generatedSlides !== undefined) updates.generated_slides = generatedSlides ? JSON.stringify(generatedSlides) : null;
    if (editedSlides !== undefined) updates.edited_slides = editedSlides ? JSON.stringify(editedSlides) : null;
    if (recommendations !== undefined) updates.recommendations = recommendations ? JSON.stringify(recommendations) : null;
    if (status !== undefined) updates.status = status;

    const { error: updateError } = await supabase
      .from('drafts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Sync slide_layouts if editedSlides or generatedSlides provided
    const slidesToSync = editedSlides || generatedSlides;
    if (slidesToSync && Array.isArray(slidesToSync)) {
      await syncSlideLayouts(id, slidesToSync);
    }

    return res.json({ success: true, message: 'Draft berhasil diperbarui.', data: { id, updatedAt: now } });
  } catch (err) {
    console.error('updateDraft error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui draft: ' + err.message });
  }
}

// ─── POST /api/drafts/:id/resume ──────────────────────────────
async function resumeDraft(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  try {
    const { data: row, error } = await supabase
      .from('drafts')
      .select('id, current_step')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !row) {
      return res.status(404).json({ success: false, message: 'Draft tidak ditemukan.' });
    }

    return res.json({
      success: true,
      message: 'Draft siap dilanjutkan.',
      data: {
        id,
        currentStep: row.current_step || 1,
        resumeUrl: `/generator?draft=${id}`,
      },
    });
  } catch (err) {
    console.error('resumeDraft error:', err);
    return res.status(500).json({ success: false, message: 'Gagal melanjutkan draft.' });
  }
}

// Helper to sync slide layouts into slide_layouts table
async function syncSlideLayouts(draftId, slides) {
  try {
    // Delete existing layouts for this draft
    await supabase.from('slide_layouts').delete().eq('draft_id', draftId);

    // Insert new layouts
    const layouts = slides.map((s, idx) => ({
      id: uuidv4(),
      draft_id: draftId,
      slide_number: s.slideNumber || idx + 1,
      slide_type: s.slideType || 'content',
      layout_name: s.layout || 'left-aligned',
      placeholders: s.placeholders ? JSON.stringify(s.placeholders) : null,
      background: s.background ? JSON.stringify(s.background) : null,
    }));

    if (layouts.length > 0) {
      await supabase.from('slide_layouts').insert(layouts);
    }
  } catch (err) {
    console.warn('syncSlideLayouts warning:', err.message);
  }
}

// ─── DELETE /api/drafts/:id ───────────────────────────────────
async function deleteDraft(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  try {
    const { data: existing } = await supabase
      .from('drafts')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Draft tidak ditemukan.' });
    }

    await supabase.from('slide_layouts').delete().eq('draft_id', id);
    await supabase.from('drafts').delete().eq('id', id).eq('user_id', userId);

    return res.json({ success: true, message: 'Draft berhasil dihapus.' });
  } catch (err) {
    console.error('deleteDraft error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus draft.' });
  }
}

module.exports = { createDraft, getDrafts, getDraftById, updateDraft, deleteDraft, resumeDraft };
