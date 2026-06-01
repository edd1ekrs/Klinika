import { useCallback, useEffect, useState } from 'react';
import { Activity, Calendar, RefreshCw, Stethoscope, Users } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentChart } from '@/components/dashboard/AppointmentChart';
import { RecentAppointments } from '@/components/dashboard/RecentAppointments';
import { TopDoctors } from '@/components/dashboard/TopDoctors';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/services/api';
import type { Appointment, Doctor } from '@/types/clinic';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  weeklyAppointments: number;
  appointmentsByStatus: { status: string; count: number }[];
  recentAppointments: Appointment[];
  topDoctors: { doctor: Doctor; appointmentCount: number; revenue: number }[];
}

const emptyStats: DashboardStats = {
  totalPatients: 0,
  totalDoctors: 0,
  todayAppointments: 0,
  weeklyAppointments: 0,
  appointmentsByStatus: [],
  recentAppointments: [],
  topDoctors: [],
};

export default function DashboardHome() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setStats(await dashboardAPI.getStats());
    } catch (error: any) {
      toast({
        title: 'Statistikat nuk u ngarkuan',
        description: error?.response?.data?.error || error?.message || 'Provo perseri.',
        variant: 'destructive',
      });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadStats();
    const refresh = () => void loadStats(true);
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('appointments:changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('appointments:changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadStats]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Mire se vini{user ? `, ${user.first_name}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Ja cfare po ndodh sot ne kliniken tuaj.
          </p>
        </div>
        {loading && <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Paciente gjithsej"
          value={stats.totalPatients.toLocaleString()}
          icon={Users}
          subtitle="Nga databaza"
          variant="primary"
        />
        <StatsCard
          title="Terminet e sotme"
          value={stats.todayAppointments}
          icon={Calendar}
          subtitle="Pa terminet e anuluara"
          variant="accent"
        />
        <StatsCard
          title="Mjeke aktive"
          value={stats.totalDoctors}
          icon={Stethoscope}
          subtitle="Profile aktive"
          variant="success"
        />
        <StatsCard
          title="Termine javore"
          value={stats.weeklyAppointments}
          icon={Activity}
          subtitle="Java aktuale"
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <AppointmentChart data={stats.appointmentsByStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentAppointments appointments={stats.recentAppointments} />
        <TopDoctors doctors={stats.topDoctors} />
      </div>
    </div>
  );
}
