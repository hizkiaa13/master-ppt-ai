import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pptxService } from '../services/pptx';
import { draftService } from '../services/draft';
import Sidebar from '../components/Layout/Sidebar';
import DraftCard from '../components/Dashboard/DraftCard';
import toast from 'react-hot-toast';
import {
  Plus,
  Clock,
  Download,
  Trash2,
  FileText,
  BookOpen,
  Layers,
  ChevronRight,
} from 'lucide-react';

function HistoryCardItem({ item, onDelete }) {
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-gray-400 transition-all flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
            {displayTitle}
          </h3>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            title="Hapus Riwayat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 flex items-center gap-2">
          <span>{item.slide_count || 5} slide</span>
          <span>•</span>
          <span>{item.output_language === 'en' ? 'English' : 'Indonesia'}</span>
        </p>

        <p className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
          <Clock className="w-3 h-3 text-gray-400" />
          {new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-colors"
        >
          {downloading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Download Ulang</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [history, setHistory] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    pptxService
      .getHistory()
      .then((r) => {
        if (r.success) setHistory(r.data || []);
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
        toast.success('Draft berhasil dihapus.');
      }
    } catch {
      toast.error('Gagal menghapus draft.');
    }
  };

  const handleDeleteHistory = async (historyId) => {
    const confirmed = window.confirm('Hapus riwayat master ini? Tindakan tidak dapat dibatalkan.');
    if (!confirmed) return;
    try {
      const res = await pptxService.deleteHistory(historyId);
      if (res?.success) {
        setHistory((prev) => prev.filter((h) => h.id !== historyId));
        toast.success('Riwayat berhasil dihapus.');
      }
    } catch {
      toast.error('Gagal menghapus riwayat.');
    }
  };

  const inProgressDrafts = drafts.filter((d) => d.status === 'in_progress');

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar Kiri Fixed 240px di Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Konten Utama Kanan */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl space-y-10">
        {/* Header Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Selamat datang, {user?.name || 'Pengguna'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Rancang dan kelola master presentasi PowerPoint berstandar studio minimalis.
            </p>
          </div>

          <Link
            to="/generator"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Master Baru</span>
          </Link>
        </div>

        {/* ─── SECTION: DRAFT TERSIMPAN ─── */}
        <section id="drafts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-bold text-gray-900">
                Draft Tersimpan
              </h2>
              {inProgressDrafts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                  {inProgressDrafts.length}
                </span>
              )}
            </div>
          </div>

          {loadingDrafts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-5 h-36 animate-pulse" />
              ))}
            </div>
          ) : inProgressDrafts.length === 0 ? (
            <div className="bg-[#F9FAFB] border border-dashed border-gray-300 rounded-xl p-8 text-center">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-600">Belum ada draft yang sedang dikerjakan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </section>

        {/* ─── SECTION: RIWAYAT MASTER ─── */}
        <section className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-bold text-gray-900">
                Riwayat Master
              </h2>
              {history.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                  {history.length}
                </span>
              )}
            </div>

            {history.length > 6 && (
              <Link to="/history" className="text-xs font-semibold text-gray-900 hover:underline">
                Lihat Semua →
              </Link>
            )}
          </div>

          {loadingHistory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-5 h-40 animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-[#F9FAFB] border border-dashed border-gray-300 rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center mx-auto text-gray-500">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Belum Ada Riwayat</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Master PowerPoint yang telah Anda unduh akan otomatis tersimpan di sini.
                </p>
              </div>
              <Link
                to="/generator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Master Pertama</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.slice(0, 6).map((item) => (
                <HistoryCardItem
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteHistory}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
