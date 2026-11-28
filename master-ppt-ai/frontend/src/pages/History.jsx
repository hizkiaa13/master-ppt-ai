import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pptxService } from '../services/pptx';
import toast from 'react-hot-toast';
import {
  Search,
  Download,
  Trash2,
  FileText,
  Plus,
  Clock,
  Layers,
} from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await pptxService.getHistory();
      if (res?.success) {
        setMasters(res.data || []);
      } else {
        throw new Error(res?.message || 'Gagal memuat riwayat');
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
      const msg = err?.response?.data?.message || err.message || 'Gagal memuat riwayat master dari server.';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus riwayat master ini? Tindakan tidak dapat dibatalkan.')) return;
    setDeletingId(id);
    try {
      const res = await pptxService.deleteHistory(id);
      if (res?.success) {
        setMasters(prev => prev.filter(m => m.id !== id));
        toast.success('Riwayat berhasil dihapus.');
      }
    } catch (err) {
      toast.error('Gagal menghapus riwayat.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id, title) => {
    setDownloadingId(id);
    try {
      const fileName = `${(title || 'presentasi').replace(/[^a-zA-Z0-9_-]/g, '_')}-master.pptx`;
      await pptxService.download(id, fileName, true);
      toast.success('File berhasil diunduh!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Gagal mengunduh file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredMasters = masters.filter(m => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const title = (m.title || m.theme_name || m.custom_title || '').toLowerCase();
    return title.includes(query);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Riwayat Master
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Daftar seluruh Master PowerPoint yang pernah Anda selesaikan dan unduh.
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

        {/* Search Bar */}
        {masters.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul presentasi..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-5 h-44 animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <span className="text-base font-bold">!</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">Gagal Memuat Riwayat Master</h3>
              <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">{fetchError}</p>
            </div>
            <button
              type="button"
              onClick={fetchHistory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : filteredMasters.length === 0 ? (
          <div className="bg-[#F9FAFB] border border-dashed border-gray-300 rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center mx-auto text-gray-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {searchQuery ? 'Tidak Ada Riwayat yang Cocok' : 'Belum Ada Riwayat Master'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ditemukan master dengan kata kunci "${searchQuery}".`
                  : 'Presentasi yang telah diunduh akan otomatis tersimpan di halaman ini.'}
              </p>
            </div>
            {!searchQuery && (
              <Link
                to="/generator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mulai Buat Presentasi</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMasters.map((master) => {
              const displayTitle = master.title || master.theme_name || master.custom_title || 'Base Master PowerPoint';
              const slideCount = master.slideCount || master.slide_count || 5;
              const language = (master.language || master.output_language) === 'en' ? 'English' : 'Indonesia';
              const createdAt = master.createdAt || master.created_at;

              return (
                <div
                  key={master.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-gray-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2" title={displayTitle}>
                        {displayTitle}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleDelete(master.id)}
                        disabled={deletingId === master.id}
                        className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                        title="Hapus Riwayat"
                      >
                        {deletingId === master.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-600 rounded-full animate-spin inline-block" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                      <span className="font-medium text-gray-700">{slideCount} slide</span>
                      <span>•</span>
                      <span>{language}</span>
                      {master.layoutMode && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 rounded text-gray-600 font-mono">
                            {master.layoutMode === 'manual' ? 'Manual' : 'Auto'}
                          </span>
                        </>
                      )}
                    </div>

                    {createdAt && (
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(master.id, displayTitle)}
                      disabled={downloadingId === master.id}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-colors"
                    >
                      {downloadingId === master.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Download Ulang</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
