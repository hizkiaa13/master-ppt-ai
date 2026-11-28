import React from 'react';
import { renderLayout } from '../../utils/layoutRenderer';

/**
 * Normalizes coordinates from layout definition to 0-100 percentage
 */
function normalizeCoord(val, isLegacy = false) {
  const num = parseFloat(val) || 0;
  if (num > 10 || isLegacy === false) {
    return Math.max(0, Math.min(100, num));
  }
  return Math.max(0, Math.min(100, num * 10));
}

/**
 * LayoutThumbnail Component
 * Menggambar sketsa monokrom 16:9 dari definisi layout asli secara dinamis.
 * Single source of truth berbasis renderLayout(layoutId).
 * 
 * @param {string} layoutId - ID layout (misal 'three-points', 'cover-front', 'point3-p48')
 * @param {object} logoConfig - Konfigurasi logo opsional ({ enabled, position })
 * @param {boolean} showPageNum - Tampilkan nomor slide kecil di pojok
 * @param {string} className - Kelas Tailwind tambahan
 */
export default function LayoutThumbnail({
  layoutId = 'three-points',
  logoConfig = null,
  showPageNum = true,
  className = '',
}) {
  const layout = renderLayout(layoutId);

  // Fallback jika layout tidak ditemukan
  if (!layout) {
    return (
      <div className={`w-full aspect-[16/9] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-[10px] ${className}`}>
        Layout tidak ditemukan
      </div>
    );
  }

  const isLegacy = !layoutId.includes('-p') && (
    (layout.points?.[0]?.w <= 10 && layout.points?.[0]?.h <= 10) ||
    (layout.title?.w <= 10 && layout.title?.h <= 10)
  );

  // Logo position calculation
  let logoRect = null;
  if (logoConfig?.enabled) {
    const pos = logoConfig.position || 'top-right';
    if (pos === 'top-left') logoRect = { x: 4, y: 5, w: 10, h: 6 };
    else if (pos === 'bottom-left') logoRect = { x: 4, y: 88, w: 10, h: 6 };
    else if (pos === 'bottom-right') logoRect = { x: 86, y: 88, w: 10, h: 6 };
    else logoRect = { x: 86, y: 5, w: 10, h: 6 }; // top-right default
  }

  // Title Box
  const rawTitle = layout.title;
  const titleBox = rawTitle ? {
    x: normalizeCoord(rawTitle.x, isLegacy),
    y: normalizeCoord(rawTitle.y, isLegacy),
    w: normalizeCoord(rawTitle.w, isLegacy),
    h: normalizeCoord(rawTitle.h, isLegacy),
    align: rawTitle.align || 'left',
  } : null;

  // Subtitle Box
  const rawSub = layout.subtitle;
  const subBox = rawSub ? {
    x: normalizeCoord(rawSub.x, isLegacy),
    y: normalizeCoord(rawSub.y, isLegacy),
    w: normalizeCoord(rawSub.w, isLegacy),
    h: normalizeCoord(rawSub.h, isLegacy),
    align: rawSub.align || 'left',
  } : null;

  // Presenter / Author Box
  const rawPres = layout.presenter || layout.author;
  const presBox = rawPres ? {
    x: normalizeCoord(rawPres.x, isLegacy),
    y: normalizeCoord(rawPres.y, isLegacy),
    w: normalizeCoord(rawPres.w, isLegacy),
    h: normalizeCoord(rawPres.h, isLegacy),
    align: rawPres.align || 'left',
  } : null;

  // Contact Box
  const rawContact = layout.contact;
  const contactBox = rawContact ? {
    x: normalizeCoord(rawContact.x, isLegacy),
    y: normalizeCoord(rawContact.y, isLegacy),
    w: normalizeCoord(rawContact.w, isLegacy),
    h: normalizeCoord(rawContact.h, isLegacy),
  } : null;

  // Quote Box
  const rawQuote = layout.quote;
  const quoteBox = rawQuote ? {
    x: normalizeCoord(rawQuote.x, isLegacy),
    y: normalizeCoord(rawQuote.y, isLegacy),
    w: normalizeCoord(rawQuote.w, isLegacy),
    h: normalizeCoord(rawQuote.h, isLegacy),
  } : null;

  // Points list
  const points = (layout.points || []).map((p, idx) => ({
    x: normalizeCoord(p.x, isLegacy),
    y: normalizeCoord(p.y, isLegacy),
    w: normalizeCoord(p.w, isLegacy),
    h: normalizeCoord(p.h, isLegacy),
    number: p.number || (p.badge === 'arrow' ? '→' : String(idx + 1).padStart(2, '0')),
    badge: p.badge,
    stat: p.stat,
    rating: p.rating,
    align: p.align || 'left',
  }));

  const isCover = layout.category === 'cover' || layoutId.startsWith('cover-front') || layoutId.startsWith('cover-p');
  const isClosing = layout.category === 'closing' || layoutId.startsWith('cover-back') || layoutId.startsWith('closing-p');
  const isChart = layoutId.includes('chart');

  return (
    <div className={`relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 bg-white shadow-2xs select-none ${className}`}>
      <svg
        viewBox="0 0 100 56.25"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Sketsa layout ${layout.name || layoutId}`}
      >
        {/* Background Canvas (Monokrom Putih Studio) */}
        <rect width="100" height="56.25" fill="#FFFFFF" />

        {/* Logo Marker opsional di sudut */}
        {logoRect && (
          <rect
            x={logoRect.x}
            y={(logoRect.y * 56.25) / 100}
            width={logoRect.w}
            height={(logoRect.h * 56.25) / 100}
            rx="0.8"
            fill="#F3F4F6"
            stroke="#9CA3AF"
            strokeWidth="0.3"
            strokeDasharray="0.8 0.5"
          />
        )}

        {/* Page Number Marker kecil di pojok kanan bawah (khusus non-cover) */}
        {showPageNum && !isCover && !isClosing && (
          <text
            x="96"
            y="53.5"
            fontSize="2"
            fontFamily="monospace"
            fill="#9CA3AF"
            textAnchor="end"
          >
            02
          </text>
        )}

        {/* ─── TITLE SECTION ─── */}
        {titleBox && (
          <g>
            {/* Title Main Bar (Garis Abu Gelap Mewakili Teks Utama) */}
            <rect
              x={titleBox.align === 'center' ? (100 - Math.min(titleBox.w, 75)) / 2 : titleBox.x}
              y={(titleBox.y * 56.25) / 100}
              width={Math.min(titleBox.w, isCover ? 75 : 65)}
              height={Math.max(2.2, (titleBox.h * 56.25) / 100 * 0.45)}
              rx="1"
              fill="#1F2937"
            />
            {/* Title Secondary Bar (jika tinggi judul cukup besar) */}
            {titleBox.h > 12 && (
              <rect
                x={titleBox.align === 'center' ? (100 - Math.min(titleBox.w * 0.65, 50)) / 2 : titleBox.x}
                y={((titleBox.y + titleBox.h * 0.45) * 56.25) / 100}
                width={Math.min(titleBox.w * 0.65, 45)}
                height={Math.max(1.8, (titleBox.h * 56.25) / 100 * 0.35)}
                rx="0.8"
                fill="#4B5563"
              />
            )}
          </g>
        )}

        {/* ─── SUBTITLE SECTION ─── */}
        {subBox && (
          <g>
            <rect
              x={subBox.align === 'center' ? (100 - Math.min(subBox.w, 55)) / 2 : subBox.x}
              y={(subBox.y * 56.25) / 100}
              width={Math.min(subBox.w, 50)}
              height={Math.max(1.5, (subBox.h * 56.25) / 100 * 0.4)}
              rx="0.6"
              fill="#9CA3AF"
            />
            <rect
              x={subBox.align === 'center' ? (100 - Math.min(subBox.w * 0.6, 35)) / 2 : subBox.x}
              y={((subBox.y + subBox.h * 0.5) * 56.25) / 100}
              width={Math.min(subBox.w * 0.6, 32)}
              height={Math.max(1.2, (subBox.h * 56.25) / 100 * 0.35)}
              rx="0.5"
              fill="#D1D5DB"
            />
          </g>
        )}

        {/* ─── PRESENTER / AUTHOR SECTION ─── */}
        {presBox && (
          <g>
            <rect
              x={presBox.align === 'center' ? (100 - Math.min(presBox.w, 40)) / 2 : presBox.x}
              y={(presBox.y * 56.25) / 100}
              width={Math.min(presBox.w, 35)}
              height={Math.max(1.4, (presBox.h * 56.25) / 100 * 0.5)}
              rx="0.5"
              fill="#9CA3AF"
            />
          </g>
        )}

        {/* ─── CONTACT SECTION (COVER BELAKANG) ─── */}
        {contactBox && (
          <g>
            {[0, 1, 2, 3].map((cIdx) => {
              const rowY = ((contactBox.y + (cIdx * (contactBox.h / 4))) * 56.25) / 100;
              return (
                <g key={cIdx}>
                  <circle
                    cx={contactBox.x + 2}
                    cy={rowY + 1.2}
                    r="1.2"
                    fill="#1F2937"
                  />
                  <rect
                    x={contactBox.x + 5}
                    y={rowY + 0.3}
                    width={Math.max(12, contactBox.w - 7)}
                    height="1.8"
                    rx="0.5"
                    fill="#9CA3AF"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ─── QUOTE SECTION (TESTIMONI) ─── */}
        {quoteBox && (
          <g>
            <rect
              x={quoteBox.x}
              y={(quoteBox.y * 56.25) / 100}
              width={quoteBox.w}
              height={(quoteBox.h * 56.25) / 100}
              rx="1.5"
              fill="#F9FAFB"
              stroke="#E5E7EB"
              strokeWidth="0.4"
            />
            {/* Tanda Kutip & Bar Teks Kutipan */}
            <text
              x={quoteBox.x + 3}
              y={((quoteBox.y + 6) * 56.25) / 100}
              fontSize="6"
              fontWeight="bold"
              fill="#4B5563"
              fontFamily="serif"
            >
              “
            </text>
            <rect
              x={quoteBox.x + 10}
              y={((quoteBox.y + 3) * 56.25) / 100}
              width={quoteBox.w - 14}
              height="2"
              rx="0.6"
              fill="#4B5563"
            />
            <rect
              x={quoteBox.x + 10}
              y={((quoteBox.y + 7) * 56.25) / 100}
              width={quoteBox.w - 20}
              height="1.6"
              rx="0.5"
              fill="#9CA3AF"
            />
          </g>
        )}

        {/* ─── CHART VISUAL MOCKUP ─── */}
        {isChart && (
          <g>
            <rect
              x="10"
              y="22"
              width="80"
              height="28"
              rx="1.5"
              fill="#F9FAFB"
              stroke="#E5E7EB"
              strokeWidth="0.4"
            />
            {/* Sumbu X & Y */}
            <line x1="16" y1="46" x2="84" y2="46" stroke="#9CA3AF" strokeWidth="0.4" />
            <line x1="16" y1="26" x2="16" y2="46" stroke="#9CA3AF" strokeWidth="0.4" />
            {/* Bar Grafik Batang Monokrom */}
            {[
              { x: 22, h: 10, fill: '#1F2937' },
              { x: 33, h: 16, fill: '#4B5563' },
              { x: 44, h: 8, fill: '#9CA3AF' },
              { x: 55, h: 14, fill: '#1F2937' },
              { x: 66, h: 18, fill: '#374151' },
              { x: 75, h: 12, fill: '#6B7280' },
            ].map((bar, bIdx) => (
              <rect
                key={bIdx}
                x={bar.x}
                y={46 - bar.h}
                width="6.5"
                height={bar.h}
                rx="0.6"
                fill={bar.fill}
              />
            ))}
          </g>
        )}

        {/* ─── POINTS & CARDS LIST ─── */}
        {!isChart && points.map((pt, pIdx) => {
          const px = pt.x;
          const py = (pt.y * 56.25) / 100;
          const pw = Math.max(8, pt.w);
          const ph = Math.max(6, (pt.h * 56.25) / 100);

          const isAgenda = layout.category === 'agenda' || layoutId === 'table-of-contents';

          if (isAgenda) {
            // Gaya Agenda: Garis Bawah Elegan dengan Nomor
            return (
              <g key={pIdx}>
                <line
                  x1={px}
                  y1={py + ph}
                  x2={px + pw}
                  y2={py + ph}
                  stroke="#E5E7EB"
                  strokeWidth="0.4"
                />
                {/* Nomor 01, 02, ... */}
                <text
                  x={px + 0.5}
                  y={py + ph - 1.5}
                  fontSize="2.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#1F2937"
                >
                  {pt.number}
                </text>
                {/* Bar Teks Topik Agenda */}
                <rect
                  x={px + 6}
                  y={py + ph - 3.2}
                  width={Math.max(10, pw - 8)}
                  height="2"
                  rx="0.5"
                  fill="#4B5563"
                />
              </g>
            );
          }

          // Gaya Kartu Konten Standar / Multikolom
          return (
            <g key={pIdx}>
              {/* Card Container Box */}
              <rect
                x={px}
                y={py}
                width={pw}
                height={ph}
                rx="1.2"
                fill="#FAFAFA"
                stroke="#E5E7EB"
                strokeWidth="0.4"
              />

              {/* Number Badge / Aksesori */}
              {pt.stat ? (
                // Stat Badge (misal: 67%)
                <g>
                  <circle
                    cx={px + pw / 2}
                    cy={py + 4}
                    r="3"
                    fill="#FFFFFF"
                    stroke="#1F2937"
                    strokeWidth="0.5"
                  />
                  <text
                    x={px + pw / 2}
                    y={py + 4.8}
                    fontSize="2.2"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill="#1F2937"
                    textAnchor="middle"
                  >
                    %
                  </text>
                </g>
              ) : pt.rating ? (
                // Rating Star Badge
                <g>
                  <circle cx={px + pw / 2} cy={py + 3.5} r="2.2" fill="#E5E7EB" />
                  <rect
                    x={px + (pw - 8) / 2}
                    y={py + 6.5}
                    width="8"
                    height="1.2"
                    rx="0.3"
                    fill="#9CA3AF"
                  />
                </g>
              ) : pt.badge === 'arrow' ? (
                // Arrow Badge
                <g>
                  <circle cx={px + 3} cy={py + 3} r="1.5" fill="#1F2937" />
                  <text x={px + 2.3} y={py + 3.6} fontSize="1.8" fill="#FFFFFF">
                    →
                  </text>
                </g>
              ) : (
                // Number Index 01, 02...
                <text
                  x={px + 2.5}
                  y={py + 4.5}
                  fontSize="3"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#1F2937"
                >
                  {pt.number}
                </text>
              )}

              {/* Skeleton Text Bars inside Card */}
              <rect
                x={px + 2.5}
                y={py + (pt.stat || pt.rating ? 9 : 6.5)}
                width={Math.max(6, pw - 5)}
                height="1.8"
                rx="0.5"
                fill="#4B5563"
              />
              {ph > 14 && (
                <rect
                  x={px + 2.5}
                  y={py + (pt.stat || pt.rating ? 11.8 : 9.3)}
                  width={Math.max(4, pw - 8)}
                  height="1.5"
                  rx="0.4"
                  fill="#9CA3AF"
                />
              )}
              {ph > 20 && (
                <rect
                  x={px + 2.5}
                  y={py + (pt.stat || pt.rating ? 14.3 : 11.8)}
                  width={Math.max(3, pw - 12)}
                  height="1.3"
                  rx="0.4"
                  fill="#D1D5DB"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
