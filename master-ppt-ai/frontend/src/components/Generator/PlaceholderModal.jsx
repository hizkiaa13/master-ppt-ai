import React, { useState, useMemo } from 'react';
import { Search, X, Check, Copy, Sparkles, Phone, MapPin, CreditCard, Mail, Globe, Building2, GraduationCap, User } from 'lucide-react';
import { indonesia, english } from '../../utils/placeholderToolkit';

const CATEGORIES = [
  { id: 'all', label: 'Semua', icon: Sparkles },
  { id: 'alamat', label: 'Alamat', icon: MapPin },
  { id: 'kontak', label: 'Kontak & Web', icon: Globe },
  { id: 'nomor', label: 'Nomor Rekening/Aman', icon: CreditCard },
  { id: 'orang', label: 'Nama Orang', icon: User },
  { id: 'bisnis', label: 'Nama Bisnis/Perusahaan', icon: Building2 },
  { id: 'pendidikan', label: 'Sekolah & Universitas', icon: GraduationCap },
];

export default function PlaceholderModal({ isOpen, onClose, onInsert }) {
  const [activeLang, setActiveLang] = useState('id'); // 'id' | 'en'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedText, setCopiedText] = useState(null);

  // Compile items based on selected language
  const allItems = useMemo(() => {
    const list = [];
    const source = activeLang === 'en' ? english : indonesia;
    const isEn = activeLang === 'en';

    // 1. Alamat
    list.push({
      category: 'alamat',
      label: isEn ? 'Physical Address (Full)' : 'Alamat Fisik Resmi',
      value: source.alamatFisik,
      note: source.aturanAlamat,
    });
    if (isEn && source.alamatPendek) {
      list.push({
        category: 'alamat',
        label: 'Short Physical Address',
        value: source.alamatPendek,
        note: source.aturanAlamat,
      });
    }

    // 2. Kontak & Web
    if (isEn) {
      list.push(
        { category: 'kontak', label: 'Phone Number', value: source.kontak.phoneNumber },
        { category: 'kontak', label: 'Mobile Number', value: source.kontak.mobileNumber },
        { category: 'kontak', label: 'Website', value: source.kontak.website },
        { category: 'kontak', label: 'Email Address', value: source.kontak.email },
        { category: 'kontak', label: 'Social Media Handle', value: source.kontak.socialMedia }
      );
    } else {
      list.push(
        { category: 'kontak', label: 'Nomor Telepon', value: source.kontak.nomorTelepon },
        { category: 'kontak', label: 'Nomor Ponsel', value: source.kontak.nomorPonsel },
        { category: 'kontak', label: 'Website', value: source.kontak.website },
        { category: 'kontak', label: 'Alamat Email', value: source.kontak.email },
        { category: 'kontak', label: 'Nama Pengguna Medsos', value: source.kontak.mediaSosial }
      );
    }

    // 3. Nomor Aman
    if (isEn) {
      list.push(
        { category: 'nomor', label: '16-Digit Credit Card', value: source.nomorAman.kartuKredit16Digit },
        { category: 'nomor', label: '3-5 Digit Invoice Number', value: source.nomorAman.nomorInvoice35Digit },
        { category: 'nomor', label: '12-Digit Account Number', value: source.nomorAman.nomorAkun12Digit }
      );
    } else {
      list.push({
        category: 'nomor',
        label: 'Nomor Rekening Bank Aman',
        value: source.nomorAman.nomorRekening,
      });
    }

    // 4. Nama Orang (Wanita / Pria)
    source.namaPerempuan.forEach((name) => {
      list.push({
        category: 'orang',
        label: isEn ? 'Female Generic Name' : 'Nama Generik Wanita',
        value: name,
      });
    });
    source.namaLakiLaki.forEach((name) => {
      list.push({
        category: 'orang',
        label: isEn ? 'Male Generic Name' : 'Nama Generik Pria',
        value: name,
      });
    });

    // 5. Nama Bisnis & Pendidikan
    Object.entries(source.namaBisnis).forEach(([catKey, names]) => {
      const isEdu = catKey.toLowerCase().includes('sekolah') || catKey.toLowerCase().includes('pendidikan');
      names.forEach((name) => {
        list.push({
          category: isEdu ? 'pendidikan' : 'bisnis',
          label: `${isEdu ? 'Pendidikan' : 'Bisnis'}: ${catKey}`,
          value: name,
        });
      });
    });

    return list;
  }, [activeLang]);

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      if (!matchCat) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.value.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.note && item.note.toLowerCase().includes(q))
      );
    });
  }, [allItems, activeCategory, searchTerm]);

  const handleCopy = (val, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(val);
    setCopiedText(val);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const handleSelect = (val) => {
    if (onInsert) {
      onInsert(val);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden text-gray-900">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-lg font-bold text-gray-900">
                Placeholder Text Toolkit (Canva Ipsum)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Klik item untuk langsung menyisipkan ke slide aktif, atau gunakan tombol salin
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar: Language & Search */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 bg-white">
          {/* Language Toggle */}
          <div className="flex rounded-lg border border-gray-300 p-0.5 bg-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveLang('id')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeLang === 'id'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🇮🇩 Indonesia
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeLang === 'en'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, alamat, nomor rekening, institusi..."
              className="w-full pl-9 pr-8 py-2 text-xs md:text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex gap-1.5 overflow-x-auto scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-xs font-semibold'
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="p-4 overflow-y-auto max-h-[50vh] divide-y divide-gray-100">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">Tidak ada data placeholder yang cocok dengan kata kunci</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isCopied = copiedText === item.value;
              return (
                <div
                  key={`${item.category}-${item.value}-${idx}`}
                  onClick={() => handleSelect(item.value)}
                  className="py-2.5 px-3 rounded-xl hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="pr-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {item.value}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 flex-shrink-0">
                        {item.label}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.note}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item.value, e)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition-colors"
                      title="Salin Teks"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Sisipkan →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Menampilkan {filteredItems.length} entri terverifikasi Canva Ipsum</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
