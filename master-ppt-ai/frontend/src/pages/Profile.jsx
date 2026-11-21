import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/pptx';
import Sidebar from '../components/Layout/Sidebar';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, Calendar } from 'lucide-react';

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
    userService
      .getProfile()
      .then((r) => {
        if (r.success) {
          setProfile(r.data);
          setName(r.data.name || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim() || name.length < 2) {
      toast.error('Nama minimal 2 karakter');
      return;
    }
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
    if (!passForm.newPassword || passForm.newPassword.length < 8) {
      errors.newPassword = 'Password baru minimal 8 karakter';
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    setPassErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePass()) return;
    setChangingPass(true);
    try {
      const res = await userService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
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

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar Kiri */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Konten Utama */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl space-y-6">
        <div className="pb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Pengaturan Profil
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola informasi akun dan keamanan kata sandi Anda.
          </p>
        </div>

        <div className="max-w-[500px] space-y-6">
          {/* Card Profil */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            {/* Avatar & Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base text-gray-900 truncate">{profile?.name || user?.name}</h2>
                <p className="text-xs text-gray-500 truncate">{profile?.email || user?.email}</p>
                {profile?.created_at && (
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Alamat Email (Read-only)
                </label>
                <input
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving || name === profile?.name}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>

          {/* Card Ganti Password */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900">
              Ganti Kata Sandi
            </h3>

            <div className="space-y-3.5">
              {/* Password Lama */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showPasses.current ? 'text' : 'password'}
                    value={passForm.currentPassword}
                    onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-3.5 py-2 pr-9 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasses((p) => ({ ...p, current: !p.current }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasses.current ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passErrors.currentPassword && (
                  <p className="text-[11px] text-red-600 mt-1">{passErrors.currentPassword}</p>
                )}
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password Baru (Min. 8 karakter)
                </label>
                <div className="relative">
                  <input
                    type={showPasses.new ? 'text' : 'password'}
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Masukkan password baru"
                    className="w-full px-3.5 py-2 pr-9 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasses((p) => ({ ...p, new: !p.new }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasses.new ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passErrors.newPassword && (
                  <p className="text-[11px] text-red-600 mt-1">{passErrors.newPassword}</p>
                )}
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasses.confirm ? 'text' : 'password'}
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Ulangi password baru"
                    className="w-full px-3.5 py-2 pr-9 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasses((p) => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasses.confirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passErrors.confirmPassword && (
                  <p className="text-[11px] text-red-600 mt-1">{passErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPass}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
              >
                {changingPass ? 'Mengubah...' : 'Ubah Password'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
