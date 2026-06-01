import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import PatientAuthPage from "./pages/PatientAuthPage";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import DashboardHome from "./pages/DashboardHome";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ServicesPage from "./pages/ServicesPage";
import { MedicalRecordsPage, SettingsPage } from "./pages/PlaceholderPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/patient" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/patient" element={<PatientAuthPage />} />
            <Route path="/book" element={<BookAppointmentPage />} />

            {/* Protected dashboard routes — staff only */}
            <Route element={<ProtectedRoute allowed={['admin', 'doctor', 'staff']} />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route
                  path="patients"
                  element={
                    <RoleGate allowed={['admin', 'doctor', 'staff']}>
                      <PatientsPage />
                    </RoleGate>
                  }
                />
                <Route
                  path="doctors"
                  element={
                    <RoleGate allowed={['admin']}>
                      <DoctorsPage />
                    </RoleGate>
                  }
                />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route
                  path="services"
                  element={
                    <RoleGate allowed={['admin']}>
                      <ServicesPage />
                    </RoleGate>
                  }
                />
                <Route path="records" element={<MedicalRecordsPage />} />
                <Route
                  path="settings"
                  element={
                    <RoleGate allowed={['admin']}>
                      <SettingsPage />
                    </RoleGate>
                  }
                />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Inline helper for per-page role enforcement inside the dashboard.
import type { ReactNode } from 'react';
import type { Role } from './types/clinic';
import { useAuth } from './contexts/AuthContext';

function RoleGate({ allowed, children }: { allowed: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !allowed.includes(user.role)) {
    return (
      <div className="dashboard-card text-center py-12">
        <h2 className="text-xl font-bold text-foreground">Qasje e ndaluar</h2>
        <p className="text-muted-foreground mt-2">
          Roli juaj nuk ka leje për këtë seksion.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

export default App;
