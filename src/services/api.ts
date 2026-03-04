import axios from 'axios';

// ============================================================
// API Service Layer — connects React frontend to Node.js REST API
// Change this to your deployed backend URL in production
// ============================================================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/patient';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data; // { token, user }
  },
  register: async (email: string, password: string, firstName: string, lastName: string) => {
    const { data } = await api.post('/auth/register', {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });
    return data; // { token, user }
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

// ─── Doctors ────────────────────────────────────────────────
export const doctorsAPI = {
  getAll: async () => {
    const { data } = await api.get('/doctors');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/doctors/${id}`);
    return data;
  },
  create: async (doctor: any) => {
    const { data } = await api.post('/doctors', doctor);
    return data;
  },
  update: async (id: string, doctor: any) => {
    const { data } = await api.put(`/doctors/${id}`, doctor);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/doctors/${id}`);
    return data;
  },
};

// ─── Services ───────────────────────────────────────────────
export const servicesAPI = {
  getAll: async () => {
    const { data } = await api.get('/services');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/services/${id}`);
    return data;
  },
  create: async (service: any) => {
    const { data } = await api.post('/services', service);
    return data;
  },
  update: async (id: string, service: any) => {
    const { data } = await api.put(`/services/${id}`, service);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/services/${id}`);
    return data;
  },
};

// ─── Appointments ───────────────────────────────────────────
export const appointmentsAPI = {
  getAll: async () => {
    const { data } = await api.get('/appointments');
    return data;
  },
  getByPatient: async () => {
    const { data } = await api.get('/appointments/my');
    return data;
  },
  create: async (appointment: {
    doctor_id: string;
    service_id: string;
    scheduled_at: string;
    duration_minutes: number;
    notes?: string | null;
  }) => {
    const { data } = await api.post('/appointments', appointment);
    return data;
  },
  update: async (id: string, updates: any) => {
    const { data } = await api.put(`/appointments/${id}`, updates);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/appointments/${id}`);
    return data;
  },
};

// ─── Patients / Profiles ────────────────────────────────────
export const patientsAPI = {
  getAll: async () => {
    const { data } = await api.get('/patients');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/patients/${id}`);
    return data;
  },
};

export default api;
