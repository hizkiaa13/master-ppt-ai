import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/pptx';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, Eye, EyeOff, Shield, Calendar, FileText } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [name, setName] = useState('');
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasses, setShowPasses] = useState({ current: false, new: false, confirm: false });
  const [passErrors, setPassErrors] = useState({});

  useEffect(() => {
    userService.getProfile().then(r => {
      if (r.success) {
        setProfile(r.data);
        setName(r.data.name);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim() || name.length < 2) { toast.error('Nama minimal 2 karakter'); return; }
    setSaving(true);
    try {
      const res = await userService.updateProfile({ name: name.trim() });
      if (res.success) {
        updateUser({ name: name.trim() });
        toast.success('Profil berhasil diperbarui!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const validatePass = () => {
    const errors = {};
    if (!passForm.currentPassword) errors.currentPassword = 'Password saat ini diperlukan';
    if (!passForm.newPassword || passForm.newPassword.length < 8) errors.newPassword = 'Password baru minimal 8 karakter';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passForm.newPassword)) errors.newPassword = 'Harus ada huruf besar, kecil, dan angka';
    if (passForm.newPassword !== passForm.confirmPassword) errors.confirmPassword = 'Konfirmasi password tidak cocok';
    setPassErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePass()) return;
    setChangingPass(true);
    try {
      const res = await userService.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      if (res.success) {
        toast.success('Password berhasil diubah!');
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPassErrors({});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setChangingPass(false);
    }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {[1, 2].map(i => <div key={i} className="glass-card p-8 space-y-4"><div className="shimmer h-32 rounded-xl" /></div>)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-black text-white flex-shrink-0 glow-brand">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">{profile?.name}</h1>
          <p className="text-dark-400 text-sm mt-0.5">{profile?.email}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-dark-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Bergabung {new Date(profile?.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-xs text-dark-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {profile?.masterCount || 0} Master dibuat
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="glass-card p-6">
        <h2 className="font-bold text-white text-lg mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-400" /> Edit Profil
        </h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input pl-11" placeholder="Nama lengkap" />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="email" value={profile?.email || ''} disabled className="form-input pl-11 opacity-50 cursor-not-allowed" />
            </div>
            <p className="text-xs text-dark-600 mt-1">Email tidak dapat diubah</p>
          </div>
          <button onClick={handleSaveProfile} disabled={saving || name === profile?.name} className="btn-primary gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <h2 className="font-bold text-white text-lg mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" /> Ganti Password
        </h2>
        <div className="space-y-4">
          {[
            ['currentPassword', 'Password Saat Ini', 'current', 'Masukkan password saat ini'],
            ['newPassword', 'Password Baru', 'new', 'Min. 8 karakter, huruf besar, kecil, angka'],
            ['confirmPassword', 'Konfirmasi Password Baru', 'confirm', 'Ulangi password baru'],
          ].map(([field, label, showKey, placeholder]) => (
            <div key={field}>
              <label className="form-label">{label}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type={showPasses[showKey] ? 'text' : 'password'}
                  value={passForm[field]}
                  onChange={e => { setPassForm(p => ({ ...p, [field]: e.target.value })); if (passErrors[field]) setPassErrors(p => ({ ...p, [field]: '' })); }}
                  placeholder={placeholder}
                  className={`form-input pl-11 pr-12 ${passErrors[field] ? 'border-red-500/50' : ''}`}
                />
                <button type="button" onClick={() => setShowPasses(p => ({ ...p, [showKey]: !p[showKey] }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                  {showPasses[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors[field] && <p className="text-xs text-red-400 mt-1.5">{passErrors[field]}</p>}
            </div>
          ))}
          <button onClick={handleChangePassword} disabled={changingPass} className="btn-primary gap-2">
            {changingPass ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            {changingPass ? 'Mengubah...' : 'Ubah Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
