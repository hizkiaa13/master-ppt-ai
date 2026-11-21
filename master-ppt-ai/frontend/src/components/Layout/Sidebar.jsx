import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Sparkles,
  History,
  BookOpen,
  User,
  LogOut,
  Presentation,
} from 'lucide-react';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/generator', label: 'Buat Master Baru', icon: Sparkles },
  { to: '/history', label: 'Riwayat Master', icon: History },
  { to: '/dashboard#drafts', label: 'Draft', icon: BookOpen },
  { to: '/profile', label: 'Profil', icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logout berhasil! Sampai jumpa.');
    navigate('/');
  };

  const isActive = (item) => {
    if (item.to.includes('#')) {
      return location.pathname === '/dashboard' && location.hash === '#drafts';
    }
    if (location.hash === '#drafts' && item.to === '/dashboard') {
      return false;
    }
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Bagian Atas: Logo & Menu Navigasi */}
      <div>
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shrink-0">
            <Presentation className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-900 leading-tight">Master PPT AI</h2>
            <p className="text-[11px] text-gray-500">Studio Generator</p>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#F9FAFB] text-gray-900 font-semibold border-l-4 border-gray-900 rounded-l-none'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-gray-900' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bagian Bawah: User Info & Logout */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
