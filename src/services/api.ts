import axios from 'axios';
import { clearAuthStorage } from '@/lib/auth-routes';
import type { Appointment, Doctor, Patient, Service } from '@/types/clinic';

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
      clearAuthStorage();
      window.location.href = window.location.pathname.startsWith('/patient') ? '/patient' : '/login';
    }
    return Promise.reject(error);
  }
);

const toDate = (value?: string | Date | null) => value ? new Date(value) : new Date();

const mapPatient = (p: any): Patient => ({
  id: p.id,
  firstName: p.first_name ?? p.firstName ?? '',
  lastName: p.last_name ?? p.lastName ?? '',
  email: p.email ?? p.user?.email ?? '',
  phone: p.phone ?? '',
  dateOfBirth: toDate(p.date_of_birth ?? p.dateOfBirth),
  gender: p.gender ?? 'other',
  address: p.address ?? '',
  emergencyContact: p.emergency_contact ?? p.emergencyContact ?? '',
  bloodType: p.blood_type ?? p.bloodType ?? '',
  allergies: p.allergies ?? [],
  createdAt: toDate(p.created_at ?? p.createdAt),
  updatedAt: toDate(p.updated_at ?? p.updatedAt),
});

const patientPayload = (p: Partial<Patient>) => ({
  first_name: p.firstName,
  last_name: p.lastName,
  email: p.email,
  phone: p.phone,
  date_of_birth: p.dateOfBirth instanceof Date ? p.dateOfBirth.toISOString().slice(0, 10) : p.dateOfBirth,
  gender: p.gender,
  address: p.address,
  blood_type: p.bloodType,
});

const mapDoctor = (d: any): Doctor => ({
  id: d.id,
  userId: d.user_id ?? d.userId ?? '',
  firstName: d.first_name ?? d.firstName ?? '',
  lastName: d.last_name ?? d.lastName ?? '',
  email: d.email ?? '',
  phone: d.phone ?? '',
  specialization: d.specialization ?? '',
  licenseNumber: d.license_number ?? d.licenseNumber ?? '',
  bio: d.bio ?? '',
  consultationFee: Number(d.consultation_fee ?? d.consultationFee ?? 0),
  isAvailable: d.is_active ?? d.isAvailable ?? true,
  experienceYears: Number(d.experience_years ?? d.experienceYears ?? 0),
  availabilityStatus: d.availability_status ?? d.availabilityStatus ?? ((d.is_active ?? true) ? 'available' : 'offline'),
  createdAt: toDate(d.created_at ?? d.createdAt),
  updatedAt: toDate(d.updated_at ?? d.updatedAt),
});

const doctorPayload = (d: Partial<Doctor>) => ({
  first_name: d.firstName,
  last_name: d.lastName,
  email: d.email,
  phone: d.phone,
  specialization: d.specialization,
  license_number: d.licenseNumber,
  bio: d.bio,
  consultation_fee: d.consultationFee,
  experience_years: d.experienceYears,
  availability_status: d.availabilityStatus,
  is_active: d.isAvailable,
});

const mapService = (s: any): Service => ({
  id: s.id,
  name: s.name ?? '',
  description: s.description ?? '',
  category: s.category ?? 'Klinike',
  price: Number(s.price ?? 0),
  duration: Number(s.duration_minutes ?? s.duration ?? 30),
  isActive: s.is_active ?? s.isActive ?? true,
  createdAt: toDate(s.created_at ?? s.createdAt),
  updatedAt: toDate(s.updated_at ?? s.updatedAt),
});

const servicePayload = (s: Partial<Service>) => ({
  name: s.name,
  description: s.description,
  category: s.category,
  price: s.price,
  duration_minutes: s.duration,
  is_active: s.isActive,
});

const mapAppointment = (a: any): Appointment => ({
  id: a.id,
  patientId: a.patient_id ?? a.patientId,
  doctorId: a.doctor_id ?? a.doctorId,
  serviceId: a.service_id ?? a.serviceId,
  patient: a.patient ? mapPatient(a.patient) : undefined,
  doctor: a.doctor ? mapDoctor(a.doctor) : undefined,
  service: a.service ? mapService(a.service) : undefined,
  scheduledAt: toDate(a.scheduled_at ?? a.scheduledAt),
  duration: Number(a.duration_minutes ?? a.duration ?? 30),
  status: a.status ?? 'scheduled',
  notes: a.notes ?? '',
  createdAt: toDate(a.created_at ?? a.createdAt),
  updatedAt: toDate(a.updated_at ?? a.updatedAt),
});

const appointmentPayload = (a: any) => ({
  patient_id: a.patientId,
  doctor_id: a.doctorId,
  service_id: a.serviceId,
  scheduled_at: a.scheduledAt instanceof Date ? a.scheduledAt.toISOString() : a.scheduledAt,
  duration_minutes: a.duration,
  status: a.status,
  notes: a.notes,
});

const notifyAppointmentsChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('appointments:changed'));
  }
};

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
    return data.map(mapDoctor);
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/doctors/${id}`);
    return mapDoctor(data);
  },
  create: async (doctor: Partial<Doctor>) => {
    const { data } = await api.post('/doctors', doctorPayload(doctor));
    return mapDoctor(data);
  },
  update: async (id: string, doctor: Partial<Doctor>) => {
    const { data } = await api.put(`/doctors/${id}`, doctorPayload(doctor));
    return mapDoctor(data);
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
    return data.map(mapService);
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/services/${id}`);
    return mapService(data);
  },
  create: async (service: Partial<Service>) => {
    const { data } = await api.post('/services', servicePayload(service));
    return mapService(data);
  },
  update: async (id: string, service: Partial<Service>) => {
    const { data } = await api.put(`/services/${id}`, servicePayload(service));
    return mapService(data);
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
    return data.map(mapAppointment);
  },
  getByPatient: async () => {
    const { data } = await api.get('/appointments/my');
    return data.map(mapAppointment);
  },
  create: async (appointment: Partial<Appointment> | {
    doctor_id: string; service_id: string; scheduled_at: string; duration_minutes: number; notes?: string | null;
  }) => {
    const payload = 'doctor_id' in appointment ? appointment : appointmentPayload(appointment);
    const { data } = await api.post('/appointments', payload);
    const mapped = mapAppointment(data);
    notifyAppointmentsChanged();
    return mapped;
  },
  update: async (id: string, updates: any) => {
    const hasSnakeCasePayload = ['patient_id', 'doctor_id', 'service_id', 'scheduled_at', 'duration_minutes'].some((key) => key in updates);
    const hasCamelCasePayload = ['patientId', 'doctorId', 'serviceId', 'scheduledAt', 'duration'].some((key) => key in updates);
    const payload = hasSnakeCasePayload ? updates : hasCamelCasePayload ? appointmentPayload(updates) : updates;
    const { data } = await api.put(`/appointments/${id}`, payload);
    const mapped = mapAppointment(data);
    notifyAppointmentsChanged();
    return mapped;
  },
  cancel: async (id: string) => {
    const { data } = await api.put(`/appointments/${id}/cancel`);
    const mapped = mapAppointment(data);
    notifyAppointmentsChanged();
    return mapped;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/appointments/${id}`);
    notifyAppointmentsChanged();
    return data;
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return {
      totalPatients: Number(data.totalPatients ?? 0),
      totalDoctors: Number(data.totalDoctors ?? 0),
      todayAppointments: Number(data.todayAppointments ?? 0),
      weeklyAppointments: Number(data.weeklyAppointments ?? 0),
      appointmentsByStatus: (data.appointmentsByStatus ?? []).map((item: any) => ({
        status: item.status,
        count: Number(item.count ?? 0),
      })),
      recentAppointments: (data.recentAppointments ?? []).map(mapAppointment),
      topDoctors: (data.topDoctors ?? []).map((item: any) => ({
        doctor: mapDoctor(item.doctor),
        appointmentCount: Number(item.appointmentCount ?? 0),
        revenue: Number(item.revenue ?? 0),
      })),
    };
  },
};

// ─── Patients / Profiles ────────────────────────────────────
export const patientsAPI = {
  getAll: async () => {
    const { data } = await api.get('/patients');
    return data.map(mapPatient);
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/patients/${id}`);
    return mapPatient(data);
  },
  create: async (patient: Partial<Patient>) => {
    const { data } = await api.post('/patients', patientPayload(patient));
    return mapPatient(data);
  },
  update: async (id: string, patient: Partial<Patient>) => {
    const { data } = await api.put(`/patients/${id}`, patientPayload(patient));
    return mapPatient(data);
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/patients/${id}`);
    return data;
  },
};

export default api;
