import apiClient, { guideApiClient, adminApiClient } from '../services/api';

/**
 * Logout wisatawan (user).
 * Revoke token Sanctum di server, bersihkan localStorage, redirect ke halaman login.
 * Pakai try/finally agar localStorage selalu dibersihkan meski server tidak bisa diakses.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // tetap lanjut logout di frontend meskipun API call gagal
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
};

/**
 * Logout pemandu wisata (guide).
 * Revoke token Sanctum di server, bersihkan localStorage, redirect ke login guide.
 */
export const logoutGuide = async (): Promise<void> => {
  try {
    await guideApiClient.post('/guide/auth/logout');
  } catch {
    // tetap lanjut logout di frontend meskipun API call gagal
  } finally {
    localStorage.removeItem('guide_token');
    localStorage.removeItem('guide');
    window.location.href = '/guide/auth';
  }
};

/**
 * Logout admin.
 * Revoke token Sanctum di server, bersihkan localStorage, redirect ke login admin.
 */
export const logoutAdmin = async (): Promise<void> => {
  try {
    await adminApiClient.post('/admin/auth/logout');
  } catch {
    // tetap lanjut logout di frontend meskipun API call gagal
  } finally {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    window.location.href = '/admin/auth';
  }
};
