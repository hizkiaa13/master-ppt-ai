import { useState, useEffect } from 'react';
import { pptxService } from '../services/pptx';
import toast from 'react-hot-toast';
import { Download, Clock, FileText, Search, Loader2, Filter, Trash2 } from 'lucide-react';

const THEME_EMOJI = { Bisnis: '💼', Edukasi: '📚', Kreatif: '🎨', Minimalis: '✨', Teknologi: '🚀' };

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    pptxService.getHistory().then(r => {
      if (r.success) setHistory(r.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = history.filter(h =>
    h.theme_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (item) => {
    setDownloadingId(item.id);
    try {
      await pptxService.download(item.id, `${item.theme_name}-master.pptx`);
      toast.success('File berhasil diunduh!');
    } catch {
      toast.error('Gagal mengunduh file.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Riwayat Master PPTX</h1>
          <p className="text-dark-400 text-sm mt-0.5">{history.length} master telah dibuat</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Cari berdasarkan tema..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-10 w-60"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="glass-card p-5 flex items-center gap-4">
              <div className="shimmer w-14 h-14 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="shimmer h-5 rounded w-1/4" />
                <div className="shimmer h-3 rounded w-1/3" />
              </div>
              <div className="shimmer w-24 h-10 rounded-xl flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-dark-600" />
          </div>
          <h3 className="font-bold text-dark-300 mb-2">
            {search ? 'Tidak ditemukan' : 'Belum Ada Riwayat'}
          </h3>
          <p className="text-dark-500 text-sm">
            {search ? `Tidak ada master dengan kata kunci "${search}"` : 'Buat master PowerPoint pertama Anda!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card p-5 flex items-center gap-4 hover:border-white/20 transition-all group"
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/10"
                style={{ backgroundColor: (item.color_primary || '#6366f1') + '22' }}
              >
                {THEME_EMOJI[item.theme_name] || '📊'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">{item.theme_name} Master Template</h3>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color_accent || '#F59E0B' }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-dark-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span>10 Slide Layouts</span>
                  <span>•</span>
                  <span>Format .pptx</span>
                </div>

                {/* Color dots */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[item.color_primary, item.color_secondary, item.color_accent].filter(Boolean).map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded border border-white/15" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={() => handleDownload(item)}
                disabled={downloadingId === item.id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium hover:bg-brand-500/20 hover:border-brand-500/40 transition-all flex-shrink-0 disabled:opacity-50"
              >
                {downloadingId === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Unduh
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
