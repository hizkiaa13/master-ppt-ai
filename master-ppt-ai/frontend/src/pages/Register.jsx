import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Presentation, ArrowRight, CheckCircle } from 'lucide-react';

const passwordStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^A-Za-z\d]/.test(pass)) score++;
  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Sangat Lemah', color: 'bg-red-500' },
    { score: 2, label: 'Lemah', color: 'bg-orange-500' },
    { score: 3, label: 'Cukup', color: 'bg-yellow-500' },
    { score: 4, label: 'Kuat', color: 'bg-emerald-500' },
    { score: 5, label: 'Sangat Kuat', color: 'bg-emerald-400' },
  ];
  return { ...levels[score], score };
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = passwordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name?.trim() || form.name.length < 2) newErrors.name = 'Nama minimal 2 karakter';
    if (!form.email) newErrors.email = 'Email diperlukan';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Format email tidak valid';
    if (!form.password || form.password.length < 8) newErrors.password = 'Password minimal 8 karakter';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) newErrors.password = 'Harus ada huruf besar, kecil, dan angka';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      if (res.success) {
        toast.success('Akun berhasil dibuat! Selamat datang di Master PPT AI 🎉');
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-brand-600/15 blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-5 glow-brand">
            <Presentation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Buat Akun Gratis</h1>
          <p className="text-dark-400 mt-2">Mulai perjalanan presentasi luar biasa Anda</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="form-label">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap Anda"
                  className={`form-input pl-11 ${errors.name ? 'border-red-500/50' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>}
            </div>

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
                  className={`form-input pl-11 ${errors.email ? 'border-red-500/50' : ''}`}
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
                  placeholder="Min. 8 karakter"
                  className={`form-input pl-11 pr-12 ${errors.password ? 'border-red-500/50' : ''}`}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-dark-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength.score >= 4 ? 'text-emerald-400' : strength.score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {strength.label}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className={`form-input pl-11 pr-12 ${errors.confirmPassword ? 'border-red-500/50' : form.confirmPassword && form.password === form.confirmPassword ? 'border-emerald-500/50' : ''}`}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat Akun...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Buat Akun Gratis
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="separator" />

          <p className="text-center text-sm text-dark-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
