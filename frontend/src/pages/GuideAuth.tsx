import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiCalendar, FiHeart } from 'react-icons/fi';
import { guideApiClient } from '../services/api';

const BASE_INPUT_BORDER_COLOR = '#dee2e6';
const FOCUSED_INPUT_BORDER_COLOR = '#007bff';

// BenefitItem — plain HTML, tanpa Chakra UI, agar style identik dengan halaman traveler
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
      <Icon size={26} color="#67e8f9" />
    </div>
    <div>
      <p style={{ fontWeight: 'bold', color: 'white', fontSize: '17px', margin: '0 0 4px 0' }}>{title}</p>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>{description}</p>
    </div>
  </div>
);

const GuideAuth: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);

  // State form login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ [key: string]: string }>({});

  // State form register
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string }>({});
  // Pesan sukses register ditampilkan di tab login setelah redirect otomatis
  const [registerSuccess, setRegisterSuccess] = useState('');

  useEffect(() => {
    // Kalau guide sudah login, langsung ke dashboard
    const guideToken = localStorage.getItem('guide_token');
    if (guideToken) navigate('/guide/dashboard');
  }, [navigate]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginErrors({});
    setRegisterSuccess('');
    try {
      const response = await guideApiClient.post('/guide/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      const { token, guide } = response.data;
      localStorage.setItem('guide_token', token);
      localStorage.setItem('guide', JSON.stringify(guide));
      navigate('/guide/dashboard');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setLoginErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setLoginErrors({ general: error.response.data.message });
      } else {
        setLoginErrors({ general: 'Login gagal. Periksa email dan password Anda.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterErrors({});
    try {
      await guideApiClient.post('/guide/auth/register', {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        password_confirmation: signupPasswordConfirm,
      });
      // Reset form, pindah ke tab login, tampilkan banner sukses
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupPasswordConfirm('');
      setActiveTab('login');
      setRegisterSuccess(
        'Akun berhasil dibuat! Silakan masuk — akun Anda akan diaktifkan setelah verifikasi admin.'
      );
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setRegisterErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setRegisterErrors({ general: error.response.data.message });
      } else {
        setRegisterErrors({ general: 'Pendaftaran gagal. Periksa data yang Anda masukkan.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 768;

  // ── Styles — identik dengan Auth.tsx ──────────────────────────────────────
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
    backgroundColor: isHoveringSubmit && !isLoading ? '#0056b3' : '#007bff',
    boxShadow: isHoveringSubmit && !isLoading ? '0 6px 8px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
    transform: isHoveringSubmit && !isLoading ? 'translateY(-1px)' : 'none',
    opacity: isLoading ? 0.7 : 1,
  } as React.CSSProperties;

  const showHideButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#6c757d',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '5px',
  };

  const errorBoxStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#f8d7da',
    borderRadius: '6px',
    color: '#721c24',
    fontSize: '14px',
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: '500',
    marginBottom: '8px',
    display: 'block',
    color: '#343a40',
  };

  const fieldErrorStyle: React.CSSProperties = {
    color: '#dc3545',
    fontSize: '13px',
    marginTop: '5px',
  };
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#eef2f9',
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>

      {/* ── Kolom Kiri: Visual & Motivasi ────────────────────────────────── */}
      <div style={{
        display: windowWidth < 768 ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '55%',
        backgroundImage: "url('/images/guide-auth-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        padding: '60px',
      }}>
        {/* Overlay gelap */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.60)',
          zIndex: 1,
        }} />

        {/* Konten teks */}
        <div style={{ position: 'relative', zIndex: 2, color: 'white' }}>
          {/* Logo — identik dengan traveler */}
          <div style={{ marginBottom: '48px' }}>
            <h1 style={{
              fontSize: '32px', marginBottom: '12px',
              display: 'flex', alignItems: 'center', fontWeight: '700',
            }}>
              <span style={{ marginRight: '16px', fontSize: '36px' }}>✈️</span> Travelink
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.9, margin: 0 }}>
              Jelajahi Indonesia bersama pemandu lokal
            </p>
          </div>

          {/* Headline khusus guide */}
          <h2 style={{
            fontSize: '42px',
            marginBottom: '36px',
            fontWeight: 'bold',
            lineHeight: 1.25,
            textShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
          }}>
            Become a Guide,<br />Create Experiences.
          </h2>

          {/* Tiga poin keuntungan — konten khusus guide, style seperti traveler */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '500px' }}>
            <BenefitItem
              Icon={FiTrendingUp}
              title="Raih Penghasilan Tambahan"
              description="Ubah pengetahuan lokal dan keahlian Anda menjadi sumber penghasilan yang menjanjikan."
            />
            <BenefitItem
              Icon={FiCalendar}
              title="Jadwal Fleksibel"
              description="Anda yang menentukan kapan dan seberapa sering ingin memandu tour."
            />
            <BenefitItem
              Icon={FiHeart}
              title="Bagikan Passion Anda"
              description="Lakukan apa yang Anda cintai dan temui wisatawan dari seluruh dunia."
            />
          </div>
        </div>
      </div>

      {/* ── Kolom Kanan: Formulir ─────────────────────────────────────────── */}
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

          {/* Judul halaman */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '10px', color: '#1a202c', fontSize: '28px', fontWeight: '700' }}>
              {activeTab === 'login' ? 'Masuk ke Guide Portal' : 'Buat Akun Pemandu'}
            </h2>
            <p style={{ color: '#6c757d', fontSize: '16px', margin: 0 }}>
              {activeTab === 'login'
                ? 'Selamat datang! Masukkan detail akun Anda.'
                : 'Bergabung dan mulai berbagi pengalaman wisata.'}
            </p>
          </div>

          {/* Tab navigasi — identik dengan traveler */}
          <div style={{ display: 'flex', marginBottom: '28px', borderBottom: '1px solid #e2e8f0' }}>
            {(['login', 'signup'] as const).map((tabName) => (
              <div
                key={tabName}
                style={{
                  padding: '14px 10px',
                  cursor: 'pointer',
                  borderBottom: activeTab === tabName ? '3px solid #007bff' : '3px solid transparent',
                  color: activeTab === tabName ? '#007bff' : '#495057',
                  fontWeight: activeTab === tabName ? '600' : '500',
                  transition: 'all 0.3s ease',
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '16px',
                  marginBottom: '-1px',
                }}
                onClick={() => {
                  setActiveTab(tabName);
                  setLoginErrors({});
                  setRegisterErrors({});
                  setRegisterSuccess('');
                }}
              >
                {tabName === 'login' ? 'Sign In' : 'Sign Up'}
              </div>
            ))}
          </div>

          {/* ── Form Login ───────────────────────────────────────────────── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Banner hijau setelah register berhasil */}
                {registerSuccess && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#d4edda',
                    borderRadius: '6px',
                    color: '#155724',
                    fontSize: '14px',
                  }}>
                    {registerSuccess}
                  </div>
                )}

                {loginErrors.general && (
                  <div style={errorBoxStyle}>{loginErrors.general}</div>
                )}

                <div>
                  <label style={labelStyle}>Alamat Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={{ ...inputStyle, borderColor: loginErrors.email ? '#dc3545' : BASE_INPUT_BORDER_COLOR }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = loginErrors.email ? '#dc3545' : BASE_INPUT_BORDER_COLOR)}
                  />
                  {loginErrors.email && <p style={fieldErrorStyle}>{loginErrors.email}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password Anda"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      style={{ ...inputStyle, borderColor: loginErrors.password ? '#dc3545' : BASE_INPUT_BORDER_COLOR }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = loginErrors.password ? '#dc3545' : BASE_INPUT_BORDER_COLOR)}
                    />
                    {loginErrors.password && <p style={fieldErrorStyle}>{loginErrors.password}</p>}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={showHideButtonStyle}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  style={primaryButtonStyle}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sedang Masuk...' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* ── Form Register ────────────────────────────────────────────── */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {registerErrors.general && (
                  <div style={errorBoxStyle}>{registerErrors.general}</div>
                )}

                <div>
                  <label style={labelStyle}>Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="mis. Budi Hartono"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    style={{ ...inputStyle, borderColor: registerErrors.name ? '#dc3545' : BASE_INPUT_BORDER_COLOR }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = registerErrors.name ? '#dc3545' : BASE_INPUT_BORDER_COLOR)}
                  />
                  {registerErrors.name && <p style={fieldErrorStyle}>{registerErrors.name}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Alamat Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    style={{ ...inputStyle, borderColor: registerErrors.email ? '#dc3545' : BASE_INPUT_BORDER_COLOR }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = registerErrors.email ? '#dc3545' : BASE_INPUT_BORDER_COLOR)}
                  />
                  {registerErrors.email && <p style={fieldErrorStyle}>{registerErrors.email}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Buat password yang kuat"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      style={{ ...inputStyle, borderColor: registerErrors.password ? '#dc3545' : BASE_INPUT_BORDER_COLOR }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = registerErrors.password ? '#dc3545' : BASE_INPUT_BORDER_COLOR)}
                    />
                    {registerErrors.password && <p style={fieldErrorStyle}>{registerErrors.password}</p>}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={showHideButtonStyle}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Konfirmasi Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password Anda"
                    value={signupPasswordConfirm}
                    onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                    required
                    style={{ ...inputStyle, borderColor: registerErrors.password_confirmation ? '#dc3545' : BASE_INPUT_BORDER_COLOR }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = registerErrors.password_confirmation ? '#dc3545' : BASE_INPUT_BORDER_COLOR)}
                  />
                  {registerErrors.password_confirmation && (
                    <p style={fieldErrorStyle}>{registerErrors.password_confirmation}</p>
                  )}
                </div>

                <button
                  type="submit"
                  style={primaryButtonStyle}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
                </button>
              </div>
            </form>
          )}

          {/* Link balik ke halaman traveler */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
              Bukan pemandu?{' '}
              <span
                style={{ color: '#007bff', cursor: 'pointer', fontWeight: '500' }}
                onClick={() => navigate('/')}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0056b3')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#007bff')}
              >
                Masuk sebagai Wisatawan
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuideAuth;
