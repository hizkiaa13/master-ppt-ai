import PptxGenJS from 'pptxgenjs';

/**
 * Convert hex color string to 6-char hex without '#'
 */
function hexToRgb(hex) {
  if (!hex) return 'FFFFFF';
  return hex.replace('#', '').trim().toUpperCase();
}

/**
 * Client-side high-fidelity PPTX export using PptxGenJS
 * Menghasilkan file PowerPoint sesuai katalog desain "Base Layout Presentasi.pdf":
 * - Cover Depan (Terpusat & Editorial)
 * - Daftar Isi (01-06 Bergaris Horizontal)
 * - 1 sampai 6 Poin (Kolom, Baris Panah →, Timeline, Step 1-4)
 * - Chart / Data Statistik & Cincin Persentase
 * - Testimoni (Rating Bintang & Kutipan Visi)
 * - Cover Belakang (Kontak & Let's Connect)
 */
export async function generateFinalPPTX(slides, recommendations, title) {
  const pres = new PptxGenJS();

  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Master PPT AI';
  pres.company = 'Master PPT AI';
  pres.title = title || 'Presentasi Master';
  pres.subject = 'Dihasilkan oleh Master PPT AI';

  const primaryColor = hexToRgb(recommendations?.colors?.primary || '#2563EB');
  const secondaryColor = hexToRgb(recommendations?.colors?.secondary || '#1E40AF');
  const accentColor = hexToRgb(recommendations?.colors?.accent || '#F59E0B');
  const headingFont = recommendations?.fonts?.heading || 'Montserrat';
  const bodyFont = recommendations?.fonts?.body || 'Open Sans';

  slides.forEach((slideData) => {
    const slide = pres.addSlide();
    const layoutId = slideData.layoutId || slideData.layout || 'three-points';
    const isCover = layoutId.startsWith('cover-front') || slideData.slideType === 'cover';
    const isClosing = layoutId.startsWith('cover-back') || slideData.slideType === 'closing';
    const isTestimonial = layoutId.startsWith('testimonial') || slideData.slideType === 'testimonial';
    const isEditorialCover = layoutId === 'cover-front-editorial';
    const isContactGrid = layoutId === 'cover-back';

    // 1. Atur Background Slide
    if (isEditorialCover || isContactGrid) {
      slide.background = { color: 'FFFFFF' };
    } else if (isCover || isClosing) {
      slide.background = { color: hexToRgb(slideData.background?.color || primaryColor) };
    } else if (isTestimonial && layoutId === 'testimonial') {
      slide.background = { color: hexToRgb(slideData.background?.color || secondaryColor) };
    } else if (slideData.background?.color) {
      slide.background = { color: hexToRgb(slideData.background.color) };
    } else {
      slide.background = { color: 'FFFFFF' };
    }

    // 2. Garis Aksen Dekoratif untuk slide konten biasa
    if (!isCover && !isClosing && layoutId !== 'testimonial') {
      slide.addShape(pres.ShapeType.rect, {
        x: 0.5,
        y: 1.15,
        w: 1.2,
        h: 0.04,
        fill: { color: accentColor },
        line: { color: accentColor },
      });
    }

    // 3. Render Setiap Placeholder Sesuai Koordinat Auto Layout
    (slideData.placeholders || []).forEach((placeholder) => {
      const rawX = parseFloat(placeholder.position?.x) || 0;
      const rawY = parseFloat(placeholder.position?.y) || 0;
      const rawW = parseFloat(placeholder.position?.w) || 10;
      const rawH = parseFloat(placeholder.position?.h) || 10;

      // Sistem persentase (0-100%) ke Inci PPTX (Lebar 10 inci, Tinggi 5.625 inci)
      const isPercent = rawW > 10 || rawH > 10 || rawX > 10 || rawY > 10 || slideData.layoutId;
      const x = isPercent ? (rawX / 100) * 10 : Math.max(0, rawX);
      const y = isPercent ? (rawY / 100) * 5.625 : Math.max(0, rawY);
      const w = isPercent ? (rawW / 100) * 10 : Math.min(10, Math.max(0.5, rawW));
      const h = isPercent ? (rawH / 100) * 5.625 : Math.min(5.625, Math.max(0.3, rawH));

      // Jika placeholder adalah kartu poin pada grid, tambahkan kartu latar belakang halus
      const isPointCard = placeholder.id?.startsWith('point-') && !isCover && !isClosing && layoutId !== 'table-of-contents' && layoutId !== 'one-point';
      if (isPointCard) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: Math.max(0, x - 0.05),
          y: Math.max(0, y - 0.05),
          w: w + 0.1,
          h: h + 0.1,
          fill: { color: 'F8FAFC' },
          line: { color: 'E2E8F0', width: 1 },
          rectRadius: 0.1,
        });
      }

      // Jika Daftar Isi, tambahkan garis pemisah horizontal di bawah item
      if (layoutId === 'table-of-contents' && placeholder.id?.startsWith('point-')) {
        slide.addShape(pres.ShapeType.line, {
          x,
          y: y + h - 0.05,
          w,
          h: 0,
          line: { color: 'CBD5E1', width: 1 },
        });
      }

      if (placeholder.type === 'text') {
        const isWhiteText = (isCover && !isEditorialCover) || (isClosing && !isContactGrid) || (layoutId === 'testimonial');
        const textOptions = {
          x,
          y,
          w,
          h,
          fontSize: placeholder.fontSize || (placeholder.id?.startsWith('title') ? 30 : 15),
          fontFace: placeholder.font || (placeholder.id?.startsWith('title') ? headingFont : bodyFont),
          color: hexToRgb(placeholder.color || (isWhiteText ? '#FFFFFF' : '#0F172A')),
          align: placeholder.align || (isWhiteText ? 'center' : 'left'),
          valign: 'middle',
          isTextBox: true,
          wrap: true,
          bold: !!placeholder.isBold || placeholder.id?.startsWith('title'),
          italic: !!placeholder.isItalic,
          underline: !!placeholder.isUnderline,
          lineSpacing: Math.round((placeholder.lineHeight || 1.35) * (placeholder.fontSize || 15)),
        };

        if (placeholder.shadow || (isCover && !isEditorialCover)) {
          textOptions.shadow = {
            type: 'outer',
            color: '000000',
            blur: 3,
            offset: 2,
            angle: 45,
            opacity: 0.3,
          };
        }

        slide.addText(placeholder.content || '', textOptions);
      } else if (placeholder.type === 'image' || placeholder.id?.startsWith('chart-')) {
        // Area placeholder visual / chart
        slide.addShape(pres.ShapeType.roundRect, {
          x,
          y,
          w,
          h,
          fill: { color: 'F1F5F9' },
          line: { color: accentColor, width: 1.5, dashType: 'dash' },
          rectRadius: 0.1,
        });

        slide.addText(placeholder.placeholder || '📊 Area Visual Chart / Grafik Statistik', {
          x,
          y: y + h / 2 - 0.4,
          w,
          h: 0.8,
          fontSize: 14,
          fontFace: headingFont,
          color: '475569',
          align: 'center',
          valign: 'middle',
          bold: true,
        });
      }
    });
  });

  const fileName = `${title || 'presentasi'}-master.pptx`;
  await pres.writeFile({ fileName });
  return fileName;
}

export default {
  generateFinalPPTX,
};
