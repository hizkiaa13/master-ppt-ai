import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import GeneratorPage from './pages/Generator';
import ProfilePage from './pages/Profile';
import HistoryPage from './pages/History';

// Protected Route component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center glow-brand animate-pulse">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-dark-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

// Public only route (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute><RegisterPage /></PublicRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          
          <Route path="/generator" element={
            <ProtectedRoute><GeneratorPage /></ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute><HistoryPage /></ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl font-black gradient-text mb-4">404</div>
                <h2 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h2>
                <p className="text-dark-400 mb-6">Halaman yang Anda cari tidak ada.</p>
                <a href="/" className="btn-primary">Kembali ke Beranda</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#111827',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
