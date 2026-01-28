import { format } from 'date-fns';
import { Clock, MoreHorizontal } from 'lucide-react';
import type { Appointment } from '@/types/clinic';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecentAppointmentsProps {
  appointments: Appointment[];
}

const statusStyles: Record<string, string> = {
  scheduled: 'badge-info',
  confirmed: 'badge-primary',
  'in-progress': 'badge-warning',
  completed: 'badge-success',
  cancelled: 'badge-destructive',
  'no-show': 'badge-destructive',
};

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Appointments</h3>
          <p className="text-sm text-muted-foreground">Latest scheduled visits</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {appointment.patient?.firstName?.[0]}
                  {appointment.patient?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">
                  {appointment.patient?.firstName} {appointment.patient?.lastName}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{appointment.service?.name}</span>
                  <span>•</span>
                  <span>{appointment.doctor?.firstName} {appointment.doctor?.lastName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(appointment.scheduledAt), 'MMM d, h:mm a')}
                </div>
                <span className={statusStyles[appointment.status]}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
