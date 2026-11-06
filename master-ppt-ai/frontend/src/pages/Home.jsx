import { Link } from 'react-router-dom';
import {
  Sparkles, Download, Zap, Star, ArrowRight,
  CheckCircle, Play, Shield, Globe, FileText, Type,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Base Master AI Generator',
    description: 'AI menyusun copywriting, struktur slide, dan menentukan jumlah slide optimal (hingga 15 slide) secara otomatis.',
    color: 'from-gray-700 to-black',
  },
  {
    icon: Globe,
    title: 'Dukungan Multi-Bahasa',
    description: 'Pilih Bahasa Indonesia atau Bahasa Inggris untuk menghasilkan materi copywriting slide yang profesional.',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    icon: Type,
    title: 'Text Toolkit & Font Pairing',
    description: 'Dukungan 10 kombinasi font pilihan standar studio untuk tampilan master hitam-putih yang elegan dan terbaca jelas.',
    color: 'from-zinc-700 to-neutral-900',
  },
  {
    icon: Download,
    title: 'Export PPTX Siap Pakai',
    description: 'Unduh file .pptx standar yang kompatibel dengan Microsoft PowerPoint, Google Slides, dan Canva.',
    color: 'from-slate-700 to-gray-900',
  },
  {
    icon: Zap,
    title: 'Generasi Cepat & Adaptif',
    description: 'Dari judul dan deskripsi topik hingga master PowerPoint hitam-putih lengkap dalam hitungan detik.',
    color: 'from-neutral-800 to-stone-900',
  },
  {
    icon: FileText,
    title: 'Auto Layout Design System',
    description: 'Layout cover, daftar isi, 1-6 poin, chart statistik, dan testimoni tertata otomatis sesuai hierarki teks.',
    color: 'from-gray-800 to-black',
  },
];

const stats = [
  { value: '100', label: 'Hitam & Putih (B&W)', suffix: '%' },
  { value: '15', label: 'Maksimal Slide', suffix: '' },
  { value: '10', label: 'Font Terkurasi', suffix: '+' },
  { value: '2', label: 'Pilihan Bahasa (ID/EN)', suffix: '' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl animate-pulse-slow" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Base Master Hitam-Putih Berbasis AI
            <Star className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 animate-slide-up leading-[1.1]">
            Base Master{' '}
            <span className="gradient-text">PowerPoint</span>{' '}
            <br className="hidden sm:block" />
            Cerdas & <span className="gradient-text-warm">Profesional</span>
          </h1>

          <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Hasilkan master presentasi elegan dengan skema hitam-putih murni, tipografi presisi, dan jumlah slide otomatis yang dianalisis oleh AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/generator" className="btn-primary text-base px-8 py-4 gap-3">
              <Sparkles className="w-5 h-5" />
              Mulai Buat Master PPT
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4">
              <Play className="w-4 h-4" />
              Masuk ke Akun
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 glass-card p-8 rounded-3xl border border-white/10 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-white">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-xs text-dark-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Desain Bersih, Fokus pada Konten
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Fondasi master slide hitam dan putih yang siap Anda kembangkan atau presentasikan langsung dengan percaya diri.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg border border-white/10`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Hanya 4 Langkah Mudah
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Alur kerja ringkas dan efisien tanpa kerumitan pemilihan tema manual
            </p>
          </div>

          <div className="grid sm:grid-cols-4 gap-4 items-start">
            {[
              { step: '01', title: 'Tema & Topik', desc: 'Masukkan judul, konteks, dan pilih Bahasa (Indonesia/Inggris)' },
              { step: '02', title: 'Generate AI', desc: 'AI menentukan jumlah slide (maks 15) & menghasilkan copywriting' },
              { step: '03', title: 'Preview & Edit', desc: 'Tinjau layout terstruktur, sesuaikan teks, ukuran font, dan posisi' },
              { step: '04', title: 'Download PPTX', desc: 'Unduh file .pptx Base Master hitam-putih siap pakai!' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 3 && (
                  <div className="hidden sm:block absolute top-6 left-1/2 w-full h-px bg-gradient-to-r from-brand-500/50 to-transparent" />
                )}
                <div className="relative w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-black text-sm mx-auto mb-3 shadow-glow-brand">
                  {item.step}
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-dark-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="glass-card p-10 gradient-border">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-6 glow-brand animate-float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">
              Siap Membuat Presentasi Master{' '}
              <span className="gradient-text">Berkelas?</span>
            </h2>
            <p className="text-dark-400 mb-8 text-lg">
              Mulai buat master PowerPoint cerdas berbasis AI sekarang juga.
            </p>
            <Link to="/generator" className="btn-primary text-lg px-10 py-4 gap-3">
              <Sparkles className="w-5 h-5" />
              Mulai Sekarang — Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
