import { AlertTriangle, X, Save, LogOut } from 'lucide-react';

/**
 * Exit confirmation modal shown when user tries to navigate away
 * from the Generator while there's unsaved progress.
 */
export default function ExitConfirmation({ onSaveAndExit, onDiscard, onContinue, isSaving = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div className="glass-card w-full max-w-md rounded-3xl border border-white/15 shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base">Simpan Progress?</h3>
            <p className="text-xs text-dark-400 mt-0.5">Anda belum menyelesaikan pembuatan master.</p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-dark-300 leading-relaxed">
            Progress Anda di generator ini akan hilang jika tidak disimpan. Simpan sebagai draft untuk melanjutkan nanti, atau buang dan keluar sekarang.
          </p>

          <div className="space-y-2.5">
            {/* Save & Exit */}
            <button
              type="button"
              onClick={onSaveAndExit}
              disabled={isSaving}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60"
            >
              {isSaving ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan Draft & Keluar'}
            </button>

            {/* Discard & Exit */}
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSaving}
              className="w-full btn-secondary flex items-center justify-center gap-2 py-2.5 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              Buang & Keluar Sekarang
            </button>

            {/* Continue editing */}
            <button
              type="button"
              onClick={onContinue}
              disabled={isSaving}
              className="w-full btn-ghost text-sm py-2 disabled:opacity-60"
            >
              Lanjutkan Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
