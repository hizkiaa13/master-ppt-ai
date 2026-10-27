/**
 * AlignmentGuidelines component - renders visual helper lines
 * when elements are aligned horizontally or vertically.
 */
export default function AlignmentGuidelines({ placeholders = [], selectedElementId = null, canvasWidth = 960, canvasHeight = 540 }) {
  if (!selectedElementId || !placeholders || placeholders.length < 2) return null;

  const selected = placeholders.find((p) => p.id === selectedElementId);
  if (!selected || !selected.position) return null;

  const guidelines = [];
  const selX = (selected.position.x || 0) * 10; // in percent 0-100
  const selY = (selected.position.y || 0) * 10;
  const selW = (selected.position.w || 0) * 10;
  const selH = (selected.position.h || 0) * 10;
  const selRight = selX + selW;
  const selBottom = selY + selH;
  const selCenterX = selX + selW / 2;
  const selCenterY = selY + selH / 2;

  const threshold = 1.5; // percent tolerance for guideline snapping

  placeholders.forEach((el) => {
    if (el.id === selectedElementId || !el.position) return;

    const elX = (el.position.x || 0) * 10;
    const elY = (el.position.y || 0) * 10;
    const elW = (el.position.w || 0) * 10;
    const elH = (el.position.h || 0) * 10;
    const elRight = elX + elW;
    const elBottom = elY + elH;
    const elCenterX = elX + elW / 2;
    const elCenterY = elY + elH / 2;

    // Horizontal guidelines (Y-axis alignments)
    // Top-to-Top
    if (Math.abs(elY - selY) < threshold) {
      guidelines.push({ type: 'horizontal', position: elY, label: 'Top' });
    }
    // Bottom-to-Bottom
    if (Math.abs(elBottom - selBottom) < threshold) {
      guidelines.push({ type: 'horizontal', position: elBottom, label: 'Bottom' });
    }
    // Center-to-Center Y
    if (Math.abs(elCenterY - selCenterY) < threshold) {
      guidelines.push({ type: 'horizontal', position: elCenterY, label: 'Center Y' });
    }

    // Vertical guidelines (X-axis alignments)
    // Left-to-Left
    if (Math.abs(elX - selX) < threshold) {
      guidelines.push({ type: 'vertical', position: elX, label: 'Left' });
    }
    // Right-to-Right
    if (Math.abs(elRight - selRight) < threshold) {
      guidelines.push({ type: 'vertical', position: elRight, label: 'Right' });
    }
    // Center-to-Center X
    if (Math.abs(elCenterX - selCenterX) < threshold) {
      guidelines.push({ type: 'vertical', position: elCenterX, label: 'Center X' });
    }
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {guidelines.map((guide, idx) => (
        <div
          key={`guide-${idx}-${guide.type}-${guide.position}`}
          className={`absolute transition-opacity duration-150 ${
            guide.type === 'horizontal'
              ? 'w-full h-[1px] bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]'
              : 'h-full w-[1px] bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]'
          }`}
          style={
            guide.type === 'horizontal'
              ? { top: `${guide.position}%`, left: 0 }
              : { left: `${guide.position}%`, top: 0 }
          }
        >
          <span className="absolute text-[9px] font-mono font-bold bg-red-600 text-white px-1 py-0.2 rounded -top-3 left-2 tracking-tight opacity-90">
            {guide.label}
          </span>
        </div>
      ))}
    </div>
  );
}
