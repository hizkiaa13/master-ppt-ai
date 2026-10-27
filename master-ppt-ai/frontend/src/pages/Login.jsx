import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Presentation, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email diperlukan';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Format email tidak valid';
    if (!form.password) newErrors.password = 'Password diperlukan';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.success) {
        toast.success(res.message || 'Login berhasil!');
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.';
      toast.error(message);
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach(e => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-brand-600/15 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-5 glow-brand">
            <Presentation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Selamat Datang</h1>
          <p className="text-dark-400 mt-2">Masuk ke akun Master PPT AI Anda</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className={`form-input pl-11 ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password Anda"
                  className={`form-input pl-11 pr-12 ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk ke Dashboard
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="separator" />

          <p className="text-center text-sm text-dark-400">
            Belum punya akun?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Daftar sekarang — Gratis
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-xs text-amber-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Daftar gratis untuk mencoba semua fitur
          </p>
        </div>
      </div>
    </div>
  );
}
