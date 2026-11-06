import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pptxService } from '../services/pptx';
import { draftService } from '../services/draft';
import DraftCard from '../components/Dashboard/DraftCard';
import toast from 'react-hot-toast';
import {
  Sparkles, Plus, History, Clock, Download,
  BookOpen, FileText, Zap, Globe, Layers,
} from 'lucide-react';

function HistoryCard({ item }) {
  const [downloading, setDownloading] = useState(false);
  const displayTitle = item.title || item.theme_name || item.custom_title || 'Base Master PowerPoint';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const fileName = `${displayTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pptx`;
      await pptxService.download(item.id, fileName);
      toast.success('File berhasil diunduh!');
    } catch {
      toast.error('Gagal mengunduh file.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="glass-card p-4 flex items-center justify-between gap-4 hover:border-white/20 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 bg-white/10 text-white border border-white/20">
          B&W
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {displayTitle}
          </p>
          <p className="text-xs text-gray-300 flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              {new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span>•</span>
            <span>{item.output_language === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}</span>
          </p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium hover:bg-brand-500/20 transition-colors flex-shrink-0 disabled:opacity-50"
      >
        {downloading ? (
          <span className="w-3.5 h-3.5 border border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        Unduh
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    pptxService
      .getHistory()
      .then((r) => {
        if (r.success) setHistory(r.data);
      })
      .finally(() => setLoadingHistory(false));

    draftService
      .getAll()
      .then((r) => {
        if (r.success) setDrafts(r.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingDrafts(false));
  }, []);

  const handleResumeDraft = (draftId) => navigate(`/generator?draft=${draftId}`);

  const handleDeleteDraft = async (draftId) => {
    const confirmed = window.confirm('Hapus draft ini? Tindakan tidak dapat dibatalkan.');
    if (!confirmed) return;
    try {
      const res = await draftService.delete(draftId);
      if (res.success) {
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
        toast.success('Draft dihapus.');
      }
    } catch {
      toast.error('Gagal menghapus draft.');
    }
  };

  const inProgressDrafts = drafts.filter((d) => d.status === 'in_progress');

  const stats = [
    { label: 'Total Master Dibuat', value: history.length, icon: FileText, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Draft Tersimpan', value: inProgressDrafts.length, icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Format Desain', value: 'B&W', icon: Layers, color: 'text-white', bg: 'bg-white/10' },
    { label: 'Bahasa Output', value: 'ID / EN', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
        <div>
          <p className="text-sm text-brand-400 font-medium mb-1">Selamat datang kembali 👋</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Pengguna'}</h1>
          <p className="text-gray-300 mt-1 text-sm">
            Siap menghasilkan Base Master PowerPoint hitam & putih berkelas studio hari ini?
          </p>
        </div>
        <Link to="/generator" className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" />
          Buat Base Master Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-xs text-gray-300">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── DRAFTS SECTION ─── */}
      {(loadingDrafts || inProgressDrafts.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                Draft Tersimpan
                {inProgressDrafts.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {inProgressDrafts.length}
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-300 mt-0.5">Lanjutkan pembuatan master yang belum selesai</p>
            </div>
          </div>

          {loadingDrafts ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 space-y-3 rounded-2xl">
                  <div className="h-1 rounded w-full shimmer" />
                  <div className="flex items-center gap-3">
                    <div className="shimmer w-9 h-9 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="shimmer h-4 rounded w-3/4" />
                      <div className="shimmer h-3 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="shimmer h-1.5 rounded-full" />
                  <div className="shimmer h-8 rounded-xl" />
                </div>
              ))}
            </div>
          ) : inProgressDrafts.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center border border-white/5">
              <p className="text-dark-400 text-sm">Tidak ada draft yang sedang dikerjakan.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {inProgressDrafts.map((draft) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  onResume={handleResumeDraft}
                  onDelete={handleDeleteDraft}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent History */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              Riwayat Master
            </h2>
            <p className="text-sm text-dark-500 mt-0.5">Master PowerPoint yang telah Anda buat</p>
          </div>
          {history.length > 5 && (
            <Link to="/history" className="btn-ghost text-sm">
              Lihat Semua →
            </Link>
          )}
        </div>
        {loadingHistory ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-3">
                <div className="shimmer w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 rounded w-1/3" />
                  <div className="shimmer h-3 rounded w-1/4" />
                </div>
                <div className="shimmer w-20 h-8 rounded-lg flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-dark-600" />
            </div>
            <h3 className="font-bold text-dark-300 mb-2">Belum Ada Master</h3>
            <p className="text-dark-500 text-sm mb-5">Buat Base Master PowerPoint pertama Anda sekarang!</p>
            <Link to="/generator" className="btn-primary">
              <Sparkles className="w-4 h-4" />
              Buat Master Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
