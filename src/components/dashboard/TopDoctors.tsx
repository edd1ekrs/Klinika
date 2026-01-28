import { Star } from 'lucide-react';
import type { Doctor } from '@/types/clinic';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface TopDoctorsProps {
  doctors: {
    doctor: Doctor;
    appointmentCount: number;
    revenue: number;
  }[];
}

export function TopDoctors({ doctors }: TopDoctorsProps) {
  const maxAppointments = Math.max(...doctors.map((d) => d.appointmentCount));

  return (
    <div className="dashboard-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Top Performing Doctors</h3>
        <p className="text-sm text-muted-foreground">Based on appointment count this month</p>
      </div>
      <div className="space-y-5">
        {doctors.map((item, index) => (
          <div key={item.doctor.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {item.doctor.firstName?.[0]}
                      {item.doctor.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning">
                      <Star className="h-3 w-3 text-warning-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {item.doctor.firstName} {item.doctor.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.doctor.specialization}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{item.appointmentCount}</p>
                <p className="text-sm text-muted-foreground">${item.revenue.toLocaleString()}</p>
              </div>
            </div>
            <Progress 
              value={(item.appointmentCount / maxAppointments) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
