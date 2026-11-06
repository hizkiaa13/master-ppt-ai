import { X, Play, Trash2, Clock, CheckCircle2, FileText, ChevronRight, Globe } from 'lucide-react';

const STEP_LABELS = {
  1: 'Tema & Topik',
  2: 'Generate AI',
  3: 'Preview & Edit',
  4: 'Download PPTX',
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
  const currentStep = Math.min(Math.max(draft.currentStep || 1, 1), 4);
  const progressPct = Math.round((currentStep / 4) * 100);
  const isCompleted = draft.status === 'completed';
  const lang = draft.outputLanguage || 'id';

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
      {/* Top accent bar — clean monochrome */}
      <div className="h-1 w-full bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500" />

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 bg-white/10 text-white border border-white/20">
              B&W
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm leading-tight truncate max-w-[180px]">
                {draft.customTitle || 'Tanpa Judul'}
              </h3>
              <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1.5">
                <span>{draft.slideCount || 5} slide</span>
                <span>•</span>
                <span>{lang === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}</span>
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
                ⏳ Step {currentStep}/4
              </span>
            )}
            <button
              type="button"
              onClick={() => onDelete(draft.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Hapus Draft"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-300">
            <span>{STEP_LABELS[currentStep] || `Step ${currentStep}`}</span>
            <span className="font-mono">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Footer info & resume button */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-dark-500 text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <TimeAgo dateStr={draft.updatedAt} />
          </span>

          <button
            type="button"
            onClick={() => onResume(draft.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 group-hover:translate-x-0.5 transition-all"
          >
            <span>{isCompleted ? 'Lihat Master' : 'Lanjutkan'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
