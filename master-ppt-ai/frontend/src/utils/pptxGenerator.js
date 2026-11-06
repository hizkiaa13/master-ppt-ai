import PptxGenJS from 'pptxgenjs';

/**
 * Convert hex color string to 6-char hex without '#'
 */
function hexToRgb(hex) {
  if (!hex) return '000000';
  return hex.replace('#', '').trim().toUpperCase();
}

/**
 * Client-side high-fidelity PPTX export using PptxGenJS
 * Menghasilkan file PowerPoint Base Master (Hitam & Putih):
 * - Background putih murni (#FFFFFF)
 * - Teks utama hitam (#000000)
 * - Teks sekunder / body: abu gelap (#1F2937 atau #4B5563)
 * - Pembatas & kartu: abu terang (#E5E7EB)
 * - Aksen: hitam (#000000)
 */
export async function generateFinalPPTX(slides, recommendations, title) {
  const pres = new PptxGenJS();

  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Master PPT AI';
  pres.company = 'Master PPT AI';
  pres.title = title || 'Base Master PowerPoint';
  pres.subject = 'Dihasilkan oleh Master PPT AI (Base Master Hitam & Putih)';

  const headingFont = recommendations?.fonts?.heading || 'Montserrat';
  const bodyFont = recommendations?.fonts?.body || 'Open Sans';

  slides.forEach((slideData) => {
    const slide = pres.addSlide();
    const layoutId = slideData.layoutId || slideData.layout || 'three-points';
    const isCover = layoutId.startsWith('cover-front') || slideData.slideType === 'cover';
    const isClosing = layoutId.startsWith('cover-back') || slideData.slideType === 'closing';

    // 1. Background Selalu Putih Murni (#FFFFFF)
    slide.background = { color: 'FFFFFF' };

    // 2. Garis Aksen Minimalis Hitam untuk Slide Konten
    if (!isCover && !isClosing) {
      slide.addShape(pres.ShapeType.rect, {
        x: 0.6,
        y: 1.15,
        w: 1.2,
        h: 0.03,
        fill: { color: '000000' },
        line: { color: '000000' },
      });
    }

    // 3. Render Setiap Placeholder
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

      // Kartu latar belakang halus abu terang untuk kartu poin
      const isPointCard =
        placeholder.id?.startsWith('point-') &&
        !isCover &&
        !isClosing &&
        layoutId !== 'table-of-contents' &&
        layoutId !== 'one-point';

      if (isPointCard) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: Math.max(0, x - 0.05),
          y: Math.max(0, y - 0.05),
          w: w + 0.1,
          h: h + 0.1,
          fill: { color: 'F9FAFB' },
          line: { color: 'E5E7EB', width: 1 },
          rectRadius: 0.08,
        });
      }

      // Jika Daftar Isi, tambahkan garis pemisah abu terang
      if (layoutId === 'table-of-contents' && placeholder.id?.startsWith('point-')) {
        slide.addShape(pres.ShapeType.line, {
          x,
          y: y + h - 0.05,
          w,
          h: 0,
          line: { color: 'E5E7EB', width: 1 },
        });
      }

      if (placeholder.type === 'text') {
        const isTitle = placeholder.id?.startsWith('title') || placeholder.name?.toLowerCase().includes('judul');
        const defaultColor = isTitle ? '000000' : '1F2937';
        const textColor = placeholder.color ? hexToRgb(placeholder.color) : defaultColor;

        const align = placeholder.align || (isCover && layoutId === 'cover-front' ? 'center' : 'left');

        const textOptions = {
          x,
          y,
          w,
          h,
          fontSize: placeholder.fontSize || (isTitle ? 32 : 16),
          fontFace: placeholder.font || (isTitle ? headingFont : bodyFont),
          color: textColor,
          align,
          valign: 'middle',
          isTextBox: true,
          wrap: true,
          bold: placeholder.isBold !== undefined ? !!placeholder.isBold : isTitle,
          italic: !!placeholder.isItalic,
          underline: !!placeholder.isUnderline,
          lineSpacing: Math.round((placeholder.lineHeight || 1.35) * (placeholder.fontSize || 15)),
        };

        slide.addText(placeholder.content || '', textOptions);
      } else if (placeholder.type === 'image' || placeholder.id?.startsWith('chart-')) {
        // Area placeholder visual / chart
        slide.addShape(pres.ShapeType.roundRect, {
          x,
          y,
          w,
          h,
          fill: { color: 'F9FAFB' },
          line: { color: 'E5E7EB', width: 1.5, dashType: 'dash' },
          rectRadius: 0.08,
        });

        slide.addText(placeholder.placeholder || 'Area Visual / Diagram Hitam & Putih', {
          x,
          y: y + h / 2 - 0.4,
          w,
          h: 0.8,
          fontSize: 13,
          fontFace: headingFont,
          color: '4B5563',
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
