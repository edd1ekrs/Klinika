// Medical Clinic Management System - Type Definitions
// These types mirror the database schema structure

export type Role = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type AvailabilityStatus = 'available' | 'busy' | 'offline';

export interface WorkingSchedule {
  // e.g. "Hënë": [{ start: "09:00", end: "13:00" }]
  day: string;
  slots: { start: string; end: string }[];
}

export interface DoctorEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface DoctorCertification {
  name: string;
  issuer: string;
  year: number;
}

export interface PatientReview {
  id: string;
  patientName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface DoctorMetrics {
  patientsTreated: number;
  appointmentsScheduled: number;
  averageRating: number; // 0-5
}

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  avatar?: string;
  bio?: string;
  consultationFee: number;
  isAvailable: boolean;

  // Newly required structured fields
  experienceYears?: number;
  availabilityStatus?: AvailabilityStatus;
  workingSchedule?: WorkingSchedule[];
  education?: DoctorEducation[];
  certifications?: DoctorCertification[];
  reviews?: PatientReview[];
  metrics?: DoctorMetrics;

  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  patient?: Patient;
  doctor?: Doctor;
  service?: Service;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  method: 'cash' | 'card' | 'insurance' | 'bank-transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  symptoms: string[];
  prescription?: string;
  treatmentPlan?: string;
  attachments?: string[];
  isConfidential: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
  revenueChange: number;
  appointmentsByStatus: {
    status: string;
    count: number;
  }[];
  topDoctors: {
    doctor: Doctor;
    appointmentCount: number;
    revenue: number;
  }[];
  recentAppointments: Appointment[];
  weeklyTrend: {
    day: string;
    appointments: number;
    revenue: number;
  }[];
}
