import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, LogOut, Plus, Stethoscope, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsAPI } from '@/services/api';
import type { Appointment } from '@/types/clinic';
import { useToast } from '@/hooks/use-toast';

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      setPatientAppointments(await appointmentsAPI.getByPatient());
    } catch (error: any) {
      toast({ title: 'Terminet nuk u ngarkuan', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const activeAppointments = useMemo(
    () => patientAppointments.filter((appointment) => !['cancelled', 'no-show'].includes(appointment.status)),
    [patientAppointments],
  );

  const nextAppointment = useMemo(() => {
    const now = new Date();
    return activeAppointments
      .filter((appointment) => new Date(appointment.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  }, [activeAppointments]);

  const cancelAppointment = async () => {
    if (!cancelling) return;
    try {
      const updated = await appointmentsAPI.cancel(cancelling.id);
      setPatientAppointments((prev) => prev.map((appointment) => appointment.id === updated.id ? updated : appointment));
      toast({ title: 'Termini u anulua', description: 'Statusi i terminit u ndryshua ne cancelled.' });
      setCancelling(null);
    } catch (error: any) {
      toast({
        title: 'Anulimi deshtoi',
        description: error?.response?.data?.error || error?.message || 'Provo perseri.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/patient', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Portali i Pacientit</h1>
              <p className="text-sm text-muted-foreground">{user?.first_name} {user?.last_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/book')}>
              <Plus className="h-4 w-4" /> Rezervo Termin
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Dil
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mirë se vini, {user?.first_name}</h2>
          <p className="text-muted-foreground">Këtu mund të shihni terminet tuaja dhe të rezervoni termin të ri.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Termine aktive</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-foreground">{activeAppointments.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Termini i ardhshëm</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-foreground">{nextAppointment ? format(new Date(nextAppointment.scheduledAt), 'd MMM') : '-'}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Statusi</CardTitle></CardHeader>
            <CardContent><Badge>{nextAppointment?.status ?? 'Pa termine'}</Badge></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terminet e mia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Duke ngarkuar terminet...</p>}
            {!loading && patientAppointments.length === 0 && (
              <p className="text-sm text-muted-foreground">Nuk keni termine te regjistruara.</p>
            )}
            {patientAppointments.map((appointment) => (
              <div key={appointment.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-foreground">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{appointment.service?.name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(appointment.scheduledAt), 'd MMM yyyy')}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {format(new Date(appointment.scheduledAt), 'HH:mm')}</span>
                  <Badge variant="outline">{appointment.status}</Badge>
                  {!['cancelled', 'completed', 'no-show'].includes(appointment.status) && (
                    <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={() => setCancelling(appointment)}>
                      <XCircle className="h-4 w-4" /> Cancel Appointment
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!cancelling} onOpenChange={(open) => !open && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the appointment as cancelled. It will not be deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={cancelAppointment}>
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
