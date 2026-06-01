import type { Role } from '@/types/clinic';

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';
export const PATIENT_DASHBOARD_PATH = '/patient/dashboard';

export function getDashboardPathForRole(role?: Role | null) {
  return role === 'patient' ? PATIENT_DASHBOARD_PATH : ADMIN_DASHBOARD_PATH;
}

export function isStaffRole(role?: Role | null) {
  return role === 'admin' || role === 'doctor';
}

export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('booking-draft');
}
