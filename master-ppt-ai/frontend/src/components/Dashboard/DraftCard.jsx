import { Trash2, Clock, ChevronRight } from 'lucide-react';

const STEP_LABELS = {
  1: 'Tema & Topik',
  2: 'Generate AI',
  3: 'Preview & Edit',
  4: 'Download PPTX',
};

function TimeAgo({ dateStr }) {
  if (!dateStr) return <span className="text-gray-400">—</span>;
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

  return <span title={d.toLocaleString('id-ID')}>{label}</span>;
}

export default function DraftCard({ draft, onResume, onDelete }) {
  const currentStep = Math.min(Math.max(draft.currentStep || 1, 1), 4);
  const progressPct = Math.round((currentStep / 4) * 100);
  const isCompleted = draft.status === 'completed';
  const lang = draft.outputLanguage || 'id';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-gray-400 transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
              {draft.customTitle || 'Draft Tanpa Judul'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span>{draft.slideCount || 5} slide</span>
              <span>•</span>
              <span>{lang === 'en' ? 'English' : 'Indonesia'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(draft.id)}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Hapus Draft"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{STEP_LABELS[currentStep] || `Step ${currentStep}`}</span>
            <span className="font-mono text-gray-900 font-semibold">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer info & resume button */}
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100 text-xs">
        <span className="text-gray-400 text-[11px] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <TimeAgo dateStr={draft.updatedAt} />
        </span>

        <button
          type="button"
          onClick={() => onResume(draft.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg text-xs transition-colors"
        >
          <span>{isCompleted ? 'Lihat Master' : 'Lanjutkan'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
