import { X, Play, Trash2, Clock, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

const STEP_LABELS = {
  1: 'Pilih Tema',
  2: 'Pilih Warna',
  3: 'Generate AI',
  4: 'Preview & Edit',
  5: 'Download',
};

const THEME_EMOJI = {
  Bisnis: '💼', Edukasi: '📚', Kreatif: '🎨',
  Minimalis: '✨', Teknologi: '🚀', 'Tema Bebas': '🌟',
};

function TimeAgo({ dateStr }) {
  if (!dateStr) return <span className="text-dark-500">—</span>;
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  let label;
  if (diffMin < 1) label = 'Baru saja';
  else if (diffMin < 60) label = `${diffMin} mnt lalu`;
  else if (diffHrs < 24) label = `${diffHrs} jam lalu`;
  else if (diffDays < 7) label = `${diffDays} hari lalu`;
  else label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <span title={d.toLocaleString('id-ID')}>
      {label}
    </span>
  );
}

export default function DraftCard({ draft, onResume, onDelete }) {
  const progressPct = Math.round((draft.currentStep / 5) * 100);
  const isCompleted = draft.status === 'completed';
  const themeName = draft.theme?.name || draft.themeName || 'Bebas';
  const emoji = THEME_EMOJI[themeName] || '📊';

  const formattedDate = draft.updatedAt
    ? new Date(draft.updatedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-200 group">
      {/* Top accent bar — colored by theme primary color */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: draft.themeColorPrimary || '#6366f1' }}
      />

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ backgroundColor: (draft.themeColorPrimary || '#6366f1') + '22' }}
            >
              {emoji}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm leading-tight truncate max-w-[180px]">
                {draft.customTitle || 'Tanpa Judul'}
              </h3>
              <p className="text-xs text-dark-400 mt-0.5">
                Tema: {themeName} · {draft.slideCount || 5} slide
              </p>
            </div>
          </div>

          {/* Status badge & delete */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                ✓ Selesai
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                ⏳ In Progress
              </span>
            )}
            <button
              type="button"
              onClick={() => onDelete(draft.id)}
              className="p-1 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Hapus Draft"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-dark-400 mb-1">
            <span>Progress</span>
            <span>{STEP_LABELS[draft.currentStep] || 'Step ' + draft.currentStep} (Step {draft.currentStep}/5)</span>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                backgroundColor: isCompleted
                  ? '#10B981'
                  : (draft.themeColorPrimary || '#3B82F6'),
              }}
            />
          </div>
        </div>

        {/* Last saved */}
        <div className="flex justify-between items-center text-[11px] text-dark-400">
          <span>Terakhir disimpan: {formattedDate}</span>
          <TimeAgo dateStr={draft.updatedAt} />
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={() => onResume(draft.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/25 group-hover:shadow-lg"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Lanjutkan Edit</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
