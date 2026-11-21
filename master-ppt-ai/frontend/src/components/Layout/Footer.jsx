import { Presentation } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#F9FAFB] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <Presentation className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              Master PPT AI
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Aplikasi cerdas perancang Master PowerPoint profesional berbasis AI
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>© 2026 Master PPT AI</span>
            <span>•</span>
            <span>Minimal Light Monochrome</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
