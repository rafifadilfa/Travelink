import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiCheckCircle, FiUsers } from 'react-icons/fi';
import { adminApiClient } from '../services/api';

const BASE_INPUT_BORDER_COLOR = '#dee2e6';
const FOCUSED_INPUT_BORDER_COLOR = '#7c3aed';

// BenefitItem — pola identik dengan GuideAuth.tsx
const BenefitItem = ({
  Icon,
  title,
  description,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
}) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
    <div style={{ flexShrink: 0, marginTop: '3px' }}>
      <Icon size={26} color="#c4b5fd" />
    </div>
    <div>
      <p style={{ fontWeight: 'bold', color: 'white', fontSize: '17px', margin: '0 0 4px 0' }}>
        {title}
      </p>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  </div>
);

const AdminAuth: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<string[]>([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);

  // Kalau sudah login sebagai admin, langsung ke halaman KYC
  useEffect(() => {
    if (localStorage.getItem('admin_token')) {
      navigate('/admin/kyc', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const newErrors: string[] = [];
    if (!email)    newErrors.push('Email wajib diisi.');
    if (!password) newErrors.push('Password wajib diisi.');
    if (newErrors.length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const res = await adminApiClient.post('/admin/auth/login', { email, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin', JSON.stringify(res.data.admin));
      navigate('/admin/kyc');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const data = axiosErr.response?.data;
      if (data?.errors) {
        setErrors(Object.values(data.errors).flat());
      } else if (data?.message) {
        setErrors([data.message]);
      } else {
        setErrors(['Terjadi kesalahan. Coba lagi.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Styles — identik dengan GuideAuth.tsx ────────────────────
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 768;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#f8f9fa',
    border: `1px solid ${BASE_INPUT_BORDER_COLOR}`,
    borderRadius: '8px',
    fontSize: '16px',
    color: '#495057',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: '500',
    marginBottom: '8px',
    display: 'block',
    color: '#343a40',
  };

  const primaryButtonStyle: React.CSSProperties = {
    color: 'white',
    padding: '14px 20px',
    width: '100%',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    marginTop: '16px',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: isHoveringSubmit && !isLoading ? '#5b21b6' : '#7c3aed',
    boxShadow: isHoveringSubmit && !isLoading
      ? '0 6px 8px rgba(0,0,0,0.15)'
      : '0 4px 6px rgba(0,0,0,0.1)',
    transform: isHoveringSubmit && !isLoading ? 'translateY(-1px)' : 'none',
    opacity: isLoading ? 0.7 : 1,
  };

  const errorBoxStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#f8d7da',
    borderRadius: '6px',
    color: '#721c24',
    fontSize: '14px',
  };
  // ──────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#eef2f9',
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>

      {/* ── Panel kiri: foto + overlay ── */}
      <div style={{
        display: windowWidth < 768 ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '55%',
        // Foto profesional — Modern Office Interior oleh Israel Andrade
        // Sumber: https://unsplash.com/photos/NIJuEQw0RKg (Unsplash License, bebas pakai)
        backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        padding: '60px',
      }}>
        {/* Overlay gelap — sama dengan GuideAuth */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.58)',
          zIndex: 1,
        }} />
        {/* Overlay ungu tipis — nuansa admin, tidak menutupi foto */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(88, 28, 135, 0.28)',
          zIndex: 2,
        }} />

        {/* Konten teks */}
        <div style={{ position: 'relative', zIndex: 3, color: 'white' }}>
          {/* Logo + badge ADMIN */}
          <div style={{ marginBottom: '48px' }}>
            <h1 style={{
              fontSize: '32px', marginBottom: '12px',
              display: 'flex', alignItems: 'center', fontWeight: '700',
            }}>
              <span style={{ marginRight: '16px', fontSize: '36px' }}>✈️</span>
              Travelink
              <span style={{
                marginLeft: '14px', fontSize: '11px', fontWeight: '700',
                letterSpacing: '2px', background: 'rgba(196, 181, 253, 0.25)',
                border: '1px solid rgba(196, 181, 253, 0.5)',
                padding: '3px 10px', borderRadius: '20px', color: '#e9d5ff',
              }}>
                ADMIN
              </span>
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.9, margin: 0 }}>
              Kelola ekosistem pemandu wisata Travelink
            </p>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: '42px',
            marginBottom: '36px',
            fontWeight: 'bold',
            lineHeight: 1.25,
            textShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
          }}>
            Panel<br />Administrator
          </h2>

          {/* Tiga poin keunggulan admin */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '500px' }}>
            <BenefitItem
              Icon={FiShield}
              title="Verifikasi Dokumen KYC"
              description="Tinjau KTP dan sertifikat pemandu wisata sebelum akun diaktifkan."
            />
            <BenefitItem
              Icon={FiCheckCircle}
              title="Setujui atau Tolak Guide"
              description="Kendalikan kualitas dengan menyetujui atau menolak pendaftaran guide baru."
            />
            <BenefitItem
              Icon={FiUsers}
              title="Pantau Ekosistem"
              description="Awasi seluruh pemandu wisata yang aktif di platform Travelink."
            />
          </div>
        </div>
      </div>

      {/* ── Panel kanan: form login ── */}
      <div style={{
        width: windowWidth < 768 ? '100%' : '45%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
      }}>
        <div style={{
          maxWidth: '420px',
          width: '90%',
          padding: '30px',
          boxShadow: windowWidth >= 768 ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none',
          borderRadius: windowWidth >= 768 ? '12px' : '0',
        }}>

          {/* Judul */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '10px', color: '#1a202c', fontSize: '28px', fontWeight: '700' }}>
              Masuk sebagai Admin
            </h2>
            <p style={{ color: '#6c757d', fontSize: '16px', margin: 0 }}>
              Akses terbatas — hanya untuk administrator Travelink.
            </p>
          </div>

          {/* Error box */}
          {errors.length > 0 && (
            <div style={errorBoxStyle}>
              {errors.map((err, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0', fontSize: '14px', color: '#721c24' }}>
                  {err}
                </p>
              ))}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@travelink.com"
                  style={{ ...inputStyle, borderColor: errors.length > 0 ? '#dc3545' : BASE_INPUT_BORDER_COLOR }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.length > 0 ? '#dc3545' : BASE_INPUT_BORDER_COLOR)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  style={{ ...inputStyle, borderColor: errors.length > 0 ? '#dc3545' : BASE_INPUT_BORDER_COLOR }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.length > 0 ? '#dc3545' : BASE_INPUT_BORDER_COLOR)}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={primaryButtonStyle}
                onMouseEnter={() => setIsHoveringSubmit(true)}
                onMouseLeave={() => setIsHoveringSubmit(false)}
              >
                {isLoading ? 'Memverifikasi...' : 'Masuk ke Panel Admin'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
              Bukan admin?{' '}
              <a
                href="/"
                style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#5b21b6')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#7c3aed')}
              >
                Kembali ke halaman utama
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
