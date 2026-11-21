import { Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Download,
  ArrowRight,
  Sliders,
  Type,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Copywriting AI Berbobot',
    description: 'AI menyusun materi presentasi substantif dan kontekstual tanpa dummy text atau placeholder generik.',
  },
  {
    icon: Layers,
    title: '189 Katalog Layout Asli',
    description: 'Pilihan layout lengkap berstandar studio mulai dari cover, agenda, 1-6 poin, perbandingan, chart, hingga penutup.',
  },
  {
    icon: Sliders,
    title: 'Auto AI vs Manual Layout',
    description: 'Pilih mode otomatis cerdas atau susun sendiri urutan layout setiap slide sesuai kebutuhan Anda.',
  },
  {
    icon: Download,
    title: 'Ekspor PPTX Siap Pakai',
    description: 'Unduh file .pptx beresolusi 16:9 yang kompatibel dengan Microsoft PowerPoint, Google Slides, dan Keynote.',
  },
];

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-gray-700" />
          <span>Master PowerPoint Berbasis AI — Minimal Light Monochrome</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
          Rancang Master Presentasi Profesional dalam Hitungan Detik
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Buat master PowerPoint elegan dengan skema hitam-putih murni, copywriting materi terstruktur, dan tata letak presisi yang langsung siap dipresentasikan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/generator"
            className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-base inline-flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg text-base inline-flex items-center justify-center border border-gray-300 transition-all"
          >
            Masuk ke Akun
          </Link>
        </div>
      </section>

      {/* Feature Highlights (4 Card Sejajar Horizontal) */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-gray-200">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Fitur Utama Berstandar Studio
          </h2>
          <p className="text-sm text-gray-600">
            Fokus penuh pada kejelasan pesan dan efisiensi pembuatan materi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-gray-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 mb-4 border border-gray-200">
                    <Icon className="w-5 h-5 text-gray-800" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Ringkas */}
      <section className="py-16 px-4 sm:px-6 bg-[#F9FAFB] border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mulai Buat Master PowerPoint Sekarang
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Gunakan kekuatan AI untuk menghemat waktu penataan slide dan penulisan konten Anda.
          </p>
          <div>
            <Link
              to="/generator"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-sm transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Buat Master Pertama</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
