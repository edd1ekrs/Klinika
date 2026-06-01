import { Users, Calendar, Stethoscope, Activity } from 'lucide-react';
import { mockDashboardStats } from '@/data/mockData';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentChart } from '@/components/dashboard/AppointmentChart';
import { RecentAppointments } from '@/components/dashboard/RecentAppointments';
import { TopDoctors } from '@/components/dashboard/TopDoctors';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardHome() {
  const stats = mockDashboardStats;
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Mirë se vini{user ? `, ${user.first_name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Ja çfarë po ndodh sot në poliklinikën tuaj.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pacientë gjithsej"
          value={stats.totalPatients.toLocaleString()}
          icon={Users}
          trend={{ value: 8.2, isPositive: true }}
          variant="primary"
        />
        <StatsCard
          title="Terminet e sotme"
          value={stats.todayAppointments}
          icon={Calendar}
          subtitle={`${stats.weeklyAppointments} këtë javë`}
          variant="accent"
        />
        <StatsCard
          title="Mjekë aktivë"
          value={stats.totalDoctors}
          icon={Stethoscope}
          subtitle="4 në detyrë sot"
          variant="success"
        />
        <StatsCard
          title="Termine javore"
          value={stats.weeklyAppointments}
          icon={Activity}
          trend={{ value: 4.6, isPositive: true }}
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