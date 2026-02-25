import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Calendar, Clock, LogOut, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
}

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/patient');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: docs }, { data: svcs }] = await Promise.all([
        supabase.from('doctors').select('id, first_name, last_name, specialization'),
        supabase.from('services').select('id, name, description, price, duration_minutes'),
      ]);
      if (docs) setDoctors(docs);
      if (svcs) setServices(svcs);
    };
    fetchData();
  }, []);

  const selectedService = services.find(s => s.id === serviceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const { error } = await supabase.from('appointments').insert({
        patient_id: user.id,
        doctor_id: doctorId,
        service_id: serviceId,
        scheduled_at: scheduledAt,
        duration_minutes: selectedService?.duration_minutes ?? 30,
        notes: notes || null,
      });
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Appointment booked!', description: 'We look forward to seeing you.' });
    } catch (error: any) {
      toast({ title: 'Booking failed', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/patient');
  };

  if (loading) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="dashboard-card max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Appointment Booked!</h2>
          <p className="text-muted-foreground">Your appointment has been scheduled successfully. You will receive a confirmation shortly.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setSuccess(false); setDoctorId(''); setServiceId(''); setDate(''); setTime(''); setNotes(''); }}>Book Another</Button>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Booking Form */}
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
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
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
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
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
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Date
                </Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="h-12" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Time
                </Label>
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
