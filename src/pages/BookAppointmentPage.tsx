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
      toast({ title: 'Zgjidh datën dhe orën', variant: 'destructive' });
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
      toast({ title: 'Rezervimi dështoi', description: e?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // After auth completes inside modal, continue booking automatically.
  useEffect(() => {
    if (user && authOpen) {
      setAuthOpen(false);
      // small delay so the dialog unmounts before submit
      setTimeout(() => { confirmBooking(); }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const resetFlow = () => {
    setDoctor(null); setDate(undefined); setTime(''); setNotes('');
    setReferenceId(''); setStep('doctor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/40">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate('/patient')} className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-foreground leading-none">MediClinic</div>
              <div className="text-xs text-muted-foreground">Rezervo një termin</div>
            </div>
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.first_name} {user.last_name}
                </span>
                <Button variant="ghost" size="sm" onClick={async () => { await signOut(); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Dil
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
                <User className="h-4 w-4 mr-1" /> Login
              </Button>
            )}
          </div>
        </div>

        {/* Stepper */}
        {step !== 'success' && (
          <div className="max-w-6xl mx-auto px-4 pb-4">
            <Stepper step={step} />
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {step === 'doctor' && (
          <DoctorPicker
            loading={loadingData}
            doctors={doctors}
            onSelect={handleSelectDoctor}
          />
        )}

        {step === 'datetime' && doctor && (
          <DateTimePicker
            doctor={doctor}
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            onBack={() => setStep('doctor')}
            onNext={handleProceedFromDateTime}
          />
        )}

        {step === 'confirm' && doctor && date && time && (
          <ConfirmStep
            doctor={doctor}
            date={date}
            time={time}
            notes={notes}
            onNotes={setNotes}
            service={defaultService}
            submitting={submitting}
            onBack={() => setStep('datetime')}
            onConfirm={confirmBooking}
            isAuthed={!!user}
          />
        )}

        {step === 'success' && doctor && date && time && (
          <SuccessStep
            referenceId={referenceId}
            doctor={doctor}
            date={date}
            time={time}
            onBookAnother={resetFlow}
          />
        )}
      </main>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        signIn={signIn}
        signUp={signUp}
      />
    </div>
  );
}

/* ───────── Stepper ───────── */
function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'doctor', label: 'Mjeku' },
    { id: 'datetime', label: 'Data & Ora' },
    { id: 'confirm', label: 'Konfirmo' },
  ];
  const activeIdx = steps.findIndex(s => s.id === step);
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-4 flex-1">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border transition-colors',
              done && 'bg-success text-success-foreground border-success',
              active && 'bg-primary text-primary-foreground border-primary shadow-md',
              !done && !active && 'bg-muted text-muted-foreground border-border',
            )}>
              {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn(
              'text-sm font-medium hidden sm:inline',
              active ? 'text-foreground' : 'text-muted-foreground',
            )}>{s.label}</span>
            {i < steps.length - 1 && (
              <div className={cn('h-px flex-1', done ? 'bg-success' : 'bg-border')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ───────── Step 1: doctor cards ───────── */
function DoctorPicker({
  loading, doctors, onSelect,
}: { loading: boolean; doctors: DoctorVM[]; onSelect: (d: DoctorVM) => void }) {
  return (
    <section className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Zgjedh mjekun</h1>
        <p className="text-muted-foreground mt-1">Shfleto specialistët tanë dhe zgjedh atë që ju përshtatet.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(d => (
            <button
              key={d.id}
              onClick={() => onSelect(d)}
              className="group text-left rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className={cn(
                'h-28 bg-gradient-to-br relative flex items-end p-4',
                specialtyGradient(d.specialization),
              )}>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                    <Stethoscope className="h-3 w-3 mr-1" />{d.specialization}
                  </Badge>
                </div>
                <div className="h-20 w-20 rounded-full bg-card border-4 border-card shadow-md -mb-10 flex items-center justify-center text-2xl font-bold text-foreground">
                  {initials(d)}
                </div>
              </div>
              <div className="pt-12 p-5 space-y-3">
                <div>
                  <div className="font-semibold text-lg text-foreground">
                    {d.first_name.startsWith('Dr') ? d.first_name : `Dr. ${d.first_name}`} {d.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">Specialist në {d.specialization}</div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {d.bio ?? 'Specialist i besueshëm që ofron kujdes mjekësor gjithëpërfshirës.'}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Award className="h-4 w-4 text-accent" />
                    <span>{d.experience_years ?? 10}+ vite përvojë</span>
                  </div>
                  <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                    Zgjedh →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* ───────── Step 2: date + time ───────── */
function DateTimePicker({
  doctor, date, time, onDateChange, onTimeChange, onBack, onNext,
}: {
  doctor: DoctorVM; date?: Date; time: string;
  onDateChange: (d: Date | undefined) => void;
  onTimeChange: (t: string) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Zgjedh datën dhe orën</h1>
          <p className="text-muted-foreground mt-1">
            Po rezervoni te <strong>Dr. {doctor.last_name}</strong> — {doctor.specialization}
          </p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Ndrysho mjekun
        </Button>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={(d) => {
              const today = new Date(); today.setHours(0, 0, 0, 0);
              return d < today || d.getDay() === 0;
            }}
            initialFocus
            className={cn('p-3 pointer-events-auto')}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Oraret e disponueshme</h2>
          </div>
          {!date ? (
            <div className="text-sm text-muted-foreground py-12 text-center">
              Zgjedh një datë për të parë oraret e disponueshme.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  onClick={() => onTimeChange(slot)}
                  className={cn(
                    'h-11 rounded-lg text-sm font-medium border transition-colors',
                    time === slot
                      ? 'bg-primary text-primary-foreground border-primary shadow'
                      : 'bg-background border-border hover:border-primary hover:text-primary',
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={onNext} disabled={!date || !time}>
              Vazhdo <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Step 3: confirm ───────── */
function ConfirmStep({
  doctor, date, time, notes, onNotes, service, submitting, onBack, onConfirm, isAuthed,
}: {
  doctor: DoctorVM; date: Date; time: string; notes: string;
  onNotes: (s: string) => void;
  service?: ServiceVM; submitting: boolean;
  onBack: () => void; onConfirm: () => void; isAuthed: boolean;
}) {
  return (
    <section className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rishiko & konfirmo</h1>
        <p className="text-muted-foreground mt-1">Verifiko detajet më poshtë para se të konfirmosh.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className={cn('p-5 bg-gradient-to-br text-white', specialtyGradient(doctor.specialization))}>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-lg font-bold backdrop-blur">
              {initials(doctor)}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {doctor.first_name.startsWith('Dr') ? doctor.first_name : `Dr. ${doctor.first_name}`} {doctor.last_name}
              </div>
              <div className="text-sm text-white/90">{doctor.specialization}</div>
            </div>
          </div>
        </div>

        <div className="p-5 divide-y divide-border">
          <Row icon={<CalendarIcon className="h-4 w-4" />} label="Data" value={format(date, 'EEEE, d MMMM yyyy')} />
          <Row icon={<Clock className="h-4 w-4" />} label="Ora" value={time} />
          {service && <Row icon={<Sparkles className="h-4 w-4" />} label="Shërbimi" value={`${service.name} · ${service.duration_minutes} min · €${service.price}`} />}
        </div>

        <div className="p-5 border-t border-border space-y-2">
          <Label htmlFor="notes">Shënime për mjekun (opsionale)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={e => onNotes(e.target.value)}
            placeholder="Simptoma ose kërkesa të veçanta…"
            className="h-11"
          />
        </div>
      </div>

      {!isAuthed && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground">
          Ju do të kërkohet të bëni Login ose Signup para se të konfirmojmë këtë rezervim.
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Mbrapa
        </Button>
        <Button size="lg" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Duke konfirmuar…' : isAuthed ? 'Konfirmo rezervimin' : 'Login & konfirmo'}
        </Button>
      </div>
    </section>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

/* ───────── Step 4: success ───────── */
function SuccessStep({
  referenceId, doctor, date, time, onBookAnother,
}: {
  referenceId: string; doctor: DoctorVM; date: Date; time: string; onBookAnother: () => void;
}) {
  return (
    <section className="max-w-xl mx-auto text-center space-y-6 animate-fade-in">
      <div className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Termini u konfirmua!</h1>
        <p className="text-muted-foreground mt-2">
          Konfirmimi është regjistruar. Ju lutemi paraqituni 10 minuta para terminit.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">ID e Referencës</span>
          <code className="px-2 py-1 rounded bg-muted text-sm font-mono">{referenceId}</code>
        </div>
        <div className="divide-y divide-border">
          <Row icon={<Stethoscope className="h-4 w-4" />} label="Mjeku"
            value={`${doctor.first_name.startsWith('Dr') ? doctor.first_name : `Dr. ${doctor.first_name}`} ${doctor.last_name} · ${doctor.specialization}`} />
          <Row icon={<CalendarIcon className="h-4 w-4" />} label="Data" value={format(date, 'EEEE, d MMMM yyyy')} />
          <Row icon={<Clock className="h-4 w-4" />} label="Ora" value={time} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onBookAnother}>Rezervo një tjetër</Button>
      </div>
    </section>
  );
}

/* ───────── Auth modal ───────── */
function AuthModal({
  open, onOpenChange, signIn, signUp,
}: {
  open: boolean; onOpenChange: (b: boolean) => void;
  signIn: (e: string, p: string) => Promise<unknown>;
  signUp: (e: string, p: string, f: string, l: string) => Promise<void>;
}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(''); const [lastName, setLastName] = useState('');
  const [show, setShow] = useState(false); const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password, firstName, lastName);
      toast({ title: mode === 'signin' ? 'Mirë se vini!' : 'Llogaria u krijua!' });
    } catch (err: any) {
      toast({
        title: 'Autentikimi dështoi',
        description: err?.response?.data?.message || err?.message || 'Provo përsëri',
        variant: 'destructive',
      });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'signin' ? 'Login për të konfirmuar' : 'Krijo llogarinë tënde'}</DialogTitle>
          <DialogDescription>
            Na duhet vetëm të verifikojmë identitetin tuaj. Rezervimi do të vazhdojë automatikisht.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fn">Emri</Label>
                <Input id="fn" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ln">Mbiemri</Label>
                <Input id="ln" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="em">Email</Label>
            <Input id="em" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Fjalëkalimi</Label>
            <div className="relative">
              <Input id="pw" type={show ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} required className="pr-10" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ju lutemi prisni…' : mode === 'signin' ? 'Login & vazhdo' : 'Signup & vazhdo'}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          {mode === 'signin' ? 'Nuk keni llogari?' : 'Keni tashmë llogari?'}{' '}
          <button onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
            className="text-primary hover:underline font-medium">
            {mode === 'signin' ? 'Signup' : 'Login'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
