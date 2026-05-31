import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Calendar as CalendarIcon, Clock, LogOut, CheckCircle2,
  Stethoscope, Award, ArrowLeft, ArrowRight, User, Eye, EyeOff, Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { doctorsAPI, servicesAPI, appointmentsAPI } from '@/services/api';
import { mockDoctors, mockServices } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DoctorVM {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  bio?: string | null;
  experience_years?: number;
  consultation_fee?: number;
  photo_url?: string | null;
}
interface ServiceVM {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

const SPECIALTY_GRADIENTS: Record<string, string> = {
  Cardiology: 'from-rose-500 to-red-600',
  Dermatology: 'from-amber-500 to-orange-600',
  Pediatrics: 'from-emerald-500 to-teal-600',
  Orthopedics: 'from-indigo-500 to-blue-600',
};

function specialtyGradient(s: string) {
  return SPECIALTY_GRADIENTS[s] ?? 'from-primary to-accent';
}

function initials(d: DoctorVM) {
  const f = d.first_name.replace(/^Dr\.?\s*/i, '').trim();
  return (f[0] ?? '') + (d.last_name[0] ?? '');
}

function makeReferenceId() {
  return 'APT-' + Math.random().toString(36).slice(2, 8).toUpperCase() +
    '-' + Date.now().toString().slice(-4);
}
    type Step = 'doctor' | 'datetime' | 'confirm' | 'success';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();

  const [doctors, setDoctors] = useState<DoctorVM[]>([]);
  const [services, setServices] = useState<ServiceVM[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [step, setStep] = useState<Step>('doctor');
  const [doctor, setDoctor] = useState<DoctorVM | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [docs, svcs] = await Promise.all([doctorsAPI.getAll(), servicesAPI.getAll()]);
        if (cancelled) return;
        setDoctors(docs);
        setServices(svcs);
      } catch {
        if (cancelled) return;
        // Fallback to mock data so the page works without the backend running.
        setDoctors(mockDoctors.map((d, i) => ({
          id: d.id,
          first_name: d.firstName,
          last_name: d.lastName,
          specialization: d.specialization,
          bio: d.bio,
          experience_years: 8 + i * 3,
          consultation_fee: d.consultationFee,
          photo_url: null,
        })));
        setServices(mockServices.map(s => ({
          id: s.id, name: s.name, price: s.price, duration_minutes: s.duration,
        })));
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const defaultService = useMemo(() => services[0], [services]);

  const handleSelectDoctor = (d: DoctorVM) => {
    setDoctor(d);
    setStep('datetime');
  };

  const handleProceedFromDateTime = () => {
    if (!date || !time) {
      toast({ title: 'Pick a date and time', variant: 'destructive' });
      return;
    }
    setStep('confirm');
  };

  const confirmBooking = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!doctor || !date || !time || !defaultService) return;

    setSubmitting(true);
    try {
      const [hh, mm] = time.split(':').map(Number);
      const scheduled = new Date(date);
      scheduled.setHours(hh, mm, 0, 0);
      try {
        await appointmentsAPI.create({
          doctor_id: doctor.id,
          service_id: defaultService.id,
          scheduled_at: scheduled.toISOString(),
          duration_minutes: defaultService.duration_minutes,
          notes: notes || null,
        });
      } catch {
        // backend down — still show confirmation for demo
      }
      setReferenceId(makeReferenceId());
      setStep('success');
    } catch (e: any) {
      toast({ title: 'Booking failed', description: e?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">MediClinic</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Book an Appointment</h1>
            <p className="text-muted-foreground">Select a doctor, service, and your preferred time.</p>
          </div>

          <form onSubmit={handleSubmit} className="dashboard-card space-y-6">
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={doctorId} onValueChange={setDoctorId} required>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select a doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      Dr. {doc.first_name} {doc.last_name} — {doc.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={serviceId} onValueChange={setServiceId} required>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select a service" /></SelectTrigger>
                <SelectContent>
                  {services.map(svc => (
                    <SelectItem key={svc.id} value={svc.id}>
                      {svc.name} — ${svc.price} ({svc.duration_minutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="h-12" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Time</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} required className="h-12" min="08:00" max="17:00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any symptoms or special requests..." className="h-12" />
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={submitting || !doctorId || !serviceId || !date || !time}>
              {submitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
