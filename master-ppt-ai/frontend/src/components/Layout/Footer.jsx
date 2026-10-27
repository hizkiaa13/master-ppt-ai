import { Presentation, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-dark-950/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center">
              <Presentation className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-dark-300">
              <span className="gradient-text">Master</span> PPT AI
            </span>
          </div>

          <p className="text-xs text-dark-500 flex items-center gap-1.5">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> untuk presentasi yang luar biasa
          </p>

          <div className="flex items-center gap-4 text-xs text-dark-500">
            <span>© 2024 Master PPT AI</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
