import { Link } from 'react-router-dom';
import {
  Sparkles, Palette, Download, Zap, Star, ArrowRight,
  CheckCircle, Play, Shield, Clock, Users, FileText,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Recommendation Engine',
    description: 'Sistem AI kami menganalisis tema dan menghasilkan rekomendasi font, warna, dan layout yang optimal untuk presentasi Anda.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Palette,
    title: 'Color Theory Database',
    description: 'Palet warna berbasis teori harmoni warna — monokromatik, komplementer, triadik — untuk kesan visual yang profesional.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Download,
    title: 'Export ke PPTX',
    description: 'Unduh file .pptx yang kompatibel dengan Microsoft PowerPoint, Google Slides, dan LibreOffice Impress.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Zap,
    title: 'Generasi Instan',
    description: 'Dari pilihan tema hingga file PPTX siap unduh dalam hitungan detik. No waiting, pure productivity.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Shield,
    title: 'Akun Aman',
    description: 'Autentikasi JWT, password bcrypt, dan session management memastikan data Anda selalu aman.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FileText,
    title: '10+ Slide Layout',
    description: 'Title, agenda, konten, perbandingan, statistik, timeline, tim, kutipan, dan lainnya — semua dalam satu master.',
    color: 'from-indigo-500 to-blue-600',
  },
];

const themes = [
  { name: 'Bisnis', emoji: '💼', desc: 'Profesional & terpercaya', color: '#1E3A5F', gradient: 'from-blue-800 to-blue-600' },
  { name: 'Edukasi', emoji: '📚', desc: 'Informatif & ceria', color: '#065F46', gradient: 'from-emerald-800 to-emerald-600' },
  { name: 'Kreatif', emoji: '🎨', desc: 'Dinamis & vibrant', color: '#7C3AED', gradient: 'from-violet-700 to-purple-600' },
  { name: 'Minimalis', emoji: '✨', desc: 'Bersih & elegan', color: '#111827', gradient: 'from-gray-800 to-gray-700' },
  { name: 'Teknologi', emoji: '🚀', desc: 'Futuristik & modern', color: '#0F172A', gradient: 'from-slate-800 to-blue-900' },
];

const stats = [
  { value: '5', label: 'Tema Premium', suffix: '' },
  { value: '10', label: 'Layout Slide', suffix: '+' },
  { value: '25', label: 'Font Pairing', suffix: '+' },
  { value: '100', label: 'Color Palettes', suffix: '%' },
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
            Didukung AI Recommendation Engine
            <Star className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 animate-slide-up leading-[1.1]">
            Buat Master{' '}
            <span className="gradient-text">PowerPoint</span>{' '}
            <br className="hidden sm:block" />
            yang <span className="gradient-text-warm">Memukau</span> dalam Detik
          </h1>

          <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            AI kami menganalisis tema presentasi Anda dan menghasilkan rekomendasi font, warna, dan layout profesional — langsung jadi file <strong className="text-dark-200">.pptx</strong> yang siap dipakai.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="btn-primary text-base px-8 py-4 gap-3">
              <Sparkles className="w-5 h-5" />
              Mulai Gratis Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4">
              <Play className="w-4 h-4" />
              Sudah Punya Akun
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto mt-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black gradient-text">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm text-dark-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              5 Tema Presentasi Premium
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Setiap tema dirancang dengan font pairing, color palette, dan layout yang disesuaikan secara khusus
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {themes.map((theme) => (
              <div
                key={theme.name}
                className="glass-card p-6 w-44 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {theme.emoji}
                </div>
                <h3 className="font-bold text-white text-sm">{theme.name}</h3>
                <p className="text-xs text-dark-500 mt-1">{theme.desc}</p>
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
              Fitur Lengkap, Hasil Profesional
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Semua yang Anda butuhkan untuk presentasi yang mengesankan — dalam satu platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Hanya 5 Langkah Mudah
            </h2>
          </div>

          <div className="grid sm:grid-cols-5 gap-4 items-start">
            {[
              { step: '01', title: 'Pilih Tema', desc: 'Pilih dari 5 tema presentasi premium' },
              { step: '02', title: 'AI Analisis', desc: 'Engine AI menghasilkan rekomendasi optimal' },
              { step: '03', title: 'Preview', desc: 'Lihat preview semua slide yang akan dibuat' },
              { step: '04', title: 'Kustomisasi', desc: 'Sesuaikan font, warna, dan layout (opsional)' },
              { step: '05', title: 'Download', desc: 'Unduh file .pptx yang siap dipakai!' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 4 && (
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
              Siap Membuat Presentasi yang{' '}
              <span className="gradient-text">Memukau?</span>
            </h2>
            <p className="text-dark-400 mb-8 text-lg">
              Bergabung dan buat master PowerPoint profesional Anda pertama hari ini — gratis.
            </p>
            <Link to="/register" className="btn-primary text-lg px-10 py-4 gap-3">
              <Sparkles className="w-5 h-5" />
              Mulai Sekarang — Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-dark-600 mt-4">
              <CheckCircle className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
              Tidak perlu kartu kredit
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
