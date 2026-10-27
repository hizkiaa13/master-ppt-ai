/**
 * Color Theory Database
 * Color palettes based on color harmony principles
 */
const colorDatabase = {
  bisnis: {
    monochromatic: {
      primary: '#1E3A5F',
      secondary: '#2D6A9F',
      accent: '#F59E0B',
      background: '#F8FAFC',
      text: '#1E293B',
      textLight: '#64748B',
      palette: ['#0F1F33', '#1E3A5F', '#2D6A9F', '#4A90C4', '#7DB8DC'],
      harmony: 'monochromatic',
      rationale: 'Palet biru monokromatik menciptakan kesan kepercayaan dan stabilitas — ideal untuk bisnis.',
    },
    complementary: {
      primary: '#1E3A5F',
      secondary: '#2D6A9F',
      accent: '#E8A020',
      background: '#FAFBFD',
      text: '#1A2535',
      textLight: '#5A6A7E',
      palette: ['#1E3A5F', '#2D6A9F', '#E8A020', '#F5C842', '#7DB8DC'],
      harmony: 'complementary',
      rationale: 'Biru dan oranye-kuning saling melengkapi, menciptakan kontras visual yang kuat.',
    },
  },
  edukasi: {
    triadic: {
      primary: '#065F46',
      secondary: '#10B981',
      accent: '#F97316',
      background: '#F0FDF9',
      text: '#064E3B',
      textLight: '#047857',
      palette: ['#065F46', '#10B981', '#34D399', '#F97316', '#FBBF24'],
      harmony: 'triadic',
      rationale: 'Hijau, oranye dan kuning menciptakan harmoni triadik yang ceria dan energik untuk materi edukasi.',
    },
    analogous: {
      primary: '#0D9488',
      secondary: '#06B6D4',
      accent: '#F59E0B',
      background: '#F0FDFA',
      text: '#134E4A',
      textLight: '#0F766E',
      palette: ['#065F46', '#0D9488', '#06B6D4', '#38BDF8', '#F59E0B'],
      harmony: 'analogous',
      rationale: 'Warna analogus biru-hijau menciptakan ketenangan dan fokus yang mendukung pembelajaran.',
    },
  },
  kreatif: {
    split_complementary: {
      primary: '#7C3AED',
      secondary: '#EC4899',
      accent: '#FBBF24',
      background: '#FDF4FF',
      text: '#3B0764',
      textLight: '#7E22CE',
      palette: ['#7C3AED', '#A855F7', '#EC4899', '#F472B6', '#FBBF24'],
      harmony: 'split-complementary',
      rationale: 'Ungu, merah muda, dan kuning menciptakan palet vibrant yang sempurna untuk konten kreatif.',
    },
    tetradic: {
      primary: '#9333EA',
      secondary: '#DB2777',
      accent: '#EAB308',
      background: '#FEF9FF',
      text: '#581C87',
      textLight: '#7E22CE',
      palette: ['#9333EA', '#DB2777', '#EAB308', '#2563EB', '#06B6D4'],
      harmony: 'tetradic',
      rationale: 'Empat warna yang seimbang menciptakan keragaman visual yang kaya untuk presentasi kreatif.',
    },
  },
  minimalis: {
    achromatic: {
      primary: '#111827',
      secondary: '#374151',
      accent: '#3B82F6',
      background: '#FFFFFF',
      text: '#111827',
      textLight: '#6B7280',
      palette: ['#111827', '#374151', '#6B7280', '#9CA3AF', '#3B82F6'],
      harmony: 'achromatic',
      rationale: 'Warna netral dengan satu aksen biru menciptakan desain bersih dan fokus pada konten.',
    },
    minimal_warm: {
      primary: '#1C1917',
      secondary: '#44403C',
      accent: '#EA580C',
      background: '#FAFAF9',
      text: '#1C1917',
      textLight: '#78716C',
      palette: ['#1C1917', '#44403C', '#78716C', '#EA580C', '#FB923C'],
      harmony: 'warm-achromatic',
      rationale: 'Tonas bumi yang hangat dengan aksen oranye menciptakan kesan mewah dan minimalis.',
    },
  },
  teknologi: {
    dark_tech: {
      primary: '#0F172A',
      secondary: '#1E40AF',
      accent: '#06B6D4',
      background: '#0F172A',
      text: '#F1F5F9',
      textLight: '#94A3B8',
      palette: ['#0F172A', '#1E3A8A', '#1E40AF', '#06B6D4', '#67E8F9'],
      harmony: 'dark-analogous',
      rationale: 'Latar gelap dengan aksen cyan menciptakan estetika futuristik yang modern untuk teknologi.',
    },
    neon_tech: {
      primary: '#020817',
      secondary: '#4F46E5',
      accent: '#10B981',
      background: '#020817',
      text: '#F8FAFC',
      textLight: '#94A3B8',
      palette: ['#020817', '#312E81', '#4F46E5', '#10B981', '#34D399'],
      harmony: 'dark-complementary',
      rationale: 'Indigo dan hijau emerald menciptakan kontras neon yang mencolok di latar gelap.',
    },
  },
};

// Default fallback colors per theme
const themeDefaultColors = {
  bisnis: colorDatabase.bisnis.monochromatic,
  edukasi: colorDatabase.edukasi.triadic,
  kreatif: colorDatabase.kreatif.split_complementary,
  minimalis: colorDatabase.minimalis.achromatic,
  teknologi: colorDatabase.teknologi.dark_tech,
};

module.exports = { colorDatabase, themeDefaultColors };
