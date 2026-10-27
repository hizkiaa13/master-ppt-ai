import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Sparkles,
  History,
  User,
  LogOut,
  Menu,
  X,
  Presentation,
  ChevronDown,
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/generator', label: 'Buat Master', icon: Sparkles },
  { to: '/history', label: 'Riwayat', icon: History },
  { to: '/profile', label: 'Profil', icon: User },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logout berhasil! Sampai jumpa.');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-dark-950/80 border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center glow-brand transition-all duration-300 group-hover:scale-105">
              <Presentation className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="gradient-text">Master</span>
              <span className="text-dark-200 ml-1">PPT AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(to)
                      ? 'text-white bg-brand-500/20 border border-brand-500/30'
                      : 'text-dark-400 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-dark-100 leading-none">{user.name}</p>
                    <p className="text-xs text-dark-500 mt-0.5 leading-none">{user.email}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-card shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-white/8">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-dark-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Edit Profil
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Masuk</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Daftar Gratis</Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/8 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-white/8 bg-dark-950/95 backdrop-blur-xl animate-fade-in">
          <div className="p-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'text-white bg-brand-500/20 border border-brand-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-white/8'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
