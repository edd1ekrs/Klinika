import { Users, Calendar, DollarSign, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { mockDashboardStats } from '@/data/mockData';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentChart } from '@/components/dashboard/AppointmentChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentAppointments } from '@/components/dashboard/RecentAppointments';
import { TopDoctors } from '@/components/dashboard/TopDoctors';

export default function DashboardHome() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening at your clinic today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          icon={Users}
          trend={{ value: 8.2, isPositive: true }}
          variant="primary"
        />
        <StatsCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          subtitle={`${stats.weeklyAppointments} this week`}
          variant="accent"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: stats.revenueChange, isPositive: stats.revenueChange > 0 }}
          variant="success"
        />
        <StatsCard
          title="Active Doctors"
          value={stats.totalDoctors}
          icon={Activity}
          subtitle="4 on duty today"
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={stats.weeklyTrend} />
        <AppointmentChart data={stats.appointmentsByStatus} />
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentAppointments appointments={stats.recentAppointments} />
        <TopDoctors doctors={stats.topDoctors} />
      </div>
    </div>
  );
}
