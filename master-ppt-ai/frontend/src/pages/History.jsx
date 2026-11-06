import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Download, Trash2, FileText, Plus, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const History = () => {
  const navigate = useNavigate();
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHistory(token);
  }, [navigate]);

  const fetchHistory = async (token) => {
    try {
      setLoading(true);
      setError(null);

      // Try /api/history first, fallback to /api/pptx/history
      let response = await fetch(`${API_BASE}/api/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/pptx/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      setMasters(data.data || data.history || data.masters || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus riwayat ini?')) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');

      let response = await fetch(`${API_BASE}/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/pptx/history/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.ok) {
        setMasters(masters.filter(m => m.id !== id));
      } else {
        alert('Gagal menghapus');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Gagal menghapus');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id, title) => {
    setDownloadingId(id);
    try {
      const token = localStorage.getItem('token');

      let response = await fetch(`${API_BASE}/api/history/${id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/pptx/download/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'presentasi'}-master.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Gagal mengunduh file. Silakan coba lagi.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter masters by search query
  const filteredMasters = masters.filter(m => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const title = (m.title || m.theme_name || m.custom_title || '').toLowerCase();
    return title.includes(query);
  });

  // Parse slide count from data
  const getSlideCount = (master) => {
    if (master.slide_count) return master.slide_count;
    if (master.edited_slides) {
      try {
        const slides = typeof master.edited_slides === 'string' ? JSON.parse(master.edited_slides) : master.edited_slides;
        return Array.isArray(slides) ? slides.length : 0;
      } catch { return 0; }
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <FileText className="w-6 h-6" />
            Master PPT AI
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/generator" className="text-sm text-gray-600 hover:text-gray-900">
              Generator
            </Link>
            <Link to="/history" className="text-sm text-gray-900 font-semibold">
              Riwayat
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Master</h1>
            <p className="text-sm text-gray-500 mt-1">
              {masters.length} presentasi telah dibuat
            </p>
          </div>
          <button
            onClick={() => navigate('/generator')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat Baru
          </button>
        </div>

        {/* Search */}
        {masters.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchHistory(localStorage.getItem('token'))}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredMasters.length > 0 ? (
          <div className="space-y-3">
            {filteredMasters.map((master) => (
              <div key={master.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {master.title || master.custom_title || master.theme_name || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        📊 {getSlideCount(master)} slide
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        {master.output_language === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        🎨 Base Master B&W
                      </span>
                      <span className="text-sm text-gray-400">
                        📅 {new Date(master.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(master.id, master.title || master.custom_title)}
                      disabled={downloadingId === master.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      {downloadingId === master.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(master.id)}
                      disabled={deletingId === master.id}
                      className="p-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all"
                      title="Hapus"
                    >
                      {deletingId === master.id ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ditemukan</h3>
            <p className="text-gray-500">Tidak ada riwayat yang cocok dengan "{searchQuery}"</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Riwayat</h3>
            <p className="text-gray-500 mb-6">Buat presentasi pertama Anda dengan AI</p>
            <button
              onClick={() => navigate('/generator')}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800"
            >
              Mulai Buat Presentasi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
