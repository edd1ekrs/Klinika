import { useMemo, useState } from 'react';
import { mockDoctors } from '@/data/mockData';
import { Search, Plus, Filter, MoreHorizontal, Phone, Mail, Star, GraduationCap, Award, Activity, Users, Calendar as CalIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type {
  Doctor, AvailabilityStatus, WorkingSchedule, DoctorEducation, DoctorCertification, PatientReview, DoctorMetrics,
} from '@/types/clinic';

const DAYS = ['Hënë', 'Martë', 'Mërkurë', 'Enjte', 'Premte', 'Shtunë'];

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  available: 'I disponueshëm',
  busy: 'I zënë',
  offline: 'Jashtë linje',
};

const STATUS_STYLES: Record<AvailabilityStatus, string> = {
  available: 'bg-success text-success-foreground',
  busy: 'bg-warning text-warning-foreground',
  offline: 'bg-muted text-muted-foreground',
};

function enrichDoctor(d: Doctor, idx: number): Doctor {
  // Default structured metadata when the API/mock doesn't provide it yet.
  const status: AvailabilityStatus = d.availabilityStatus
    ?? (d.isAvailable ? 'available' : 'offline');
  return {
    ...d,
    availabilityStatus: status,
    experienceYears: d.experienceYears ?? 8 + (idx % 5) * 2,
    workingSchedule: d.workingSchedule ?? [
      { day: 'Hënë', slots: [{ start: '09:00', end: '13:00' }, { start: '15:00', end: '18:00' }] },
      { day: 'Martë', slots: [{ start: '09:00', end: '13:00' }] },
      { day: 'Mërkurë', slots: [{ start: '10:00', end: '17:00' }] },
      { day: 'Enjte', slots: [{ start: '09:00', end: '13:00' }, { start: '15:00', end: '18:00' }] },
      { day: 'Premte', slots: [{ start: '09:00', end: '14:00' }] },
    ],
    education: d.education ?? [
      { degree: 'Doktor i Mjekësisë', institution: 'Universiteti i Prishtinës', year: 2010 },
    ],
    certifications: d.certifications ?? [
      { name: 'Bordi Specialistik', issuer: 'Oda e Mjekëve të Kosovës', year: 2014 },
    ],
    reviews: d.reviews ?? [],
    metrics: d.metrics ?? {
      patientsTreated: 320 + idx * 47,
      appointmentsScheduled: 480 + idx * 53,
      averageRating: Number((4 + (idx % 5) * 0.15).toFixed(1)),
    },
  };
}

export default function DoctorsPage() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>(() => mockDoctors.map(enrichDoctor));
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<Doctor | null>(null);

  const specializations = useMemo(
    () => [...new Set(doctors.map((d) => d.specialization))],
    [doctors],
  );

  const filtered = doctors.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q);
    const matchesSpec = specializationFilter === 'all' || d.specialization === specializationFilter;
    const matchesStatus = statusFilter === 'all' || d.availabilityStatus === statusFilter;
    return matchesSearch && matchesSpec && matchesStatus;
  });

  const handleAdd = (doc: Doctor) => {
    setDoctors((prev) => [doc, ...prev]);
    setAddOpen(false);
    toast({ title: 'Mjeku u shtua', description: `${doc.firstName} ${doc.lastName} u regjistrua me sukses.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mjekët</h1>
          <p className="text-muted-foreground">Menaxho stafin mjekësor, oraret dhe profilet e detajuara</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Shto Mjek
            </Button>
          </DialogTrigger>
          <AddDoctorDialog onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
        </Dialog>
      </div>

      {/* Filters */}
      <div className="dashboard-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Kërko mjek sipas emrit ose specialitetit…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Specialiteti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Të gjitha specialitetet</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Statusi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Të gjithë</SelectItem>
                <SelectItem value="available">I disponueshëm</SelectItem>
                <SelectItem value="busy">I zënë</SelectItem>
                <SelectItem value="offline">Jashtë linje</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((d) => (
          <DoctorCard key={d.id} doctor={d} onView={() => setViewing(d)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="dashboard-card flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-foreground">Asnjë mjek nuk u gjet</p>
          <p className="text-muted-foreground">Provo të ndryshosh kërkimin ose filtrat</p>
        </div>
      )}

      {/* View / details dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        {viewing && <DoctorDetailsDialog doctor={viewing} />}
      </Dialog>
    </div>
  );
}

/* ───────── Doctor Card ───────── */
function DoctorCard({ doctor, onView }: { doctor: Doctor; onView: () => void }) {
  const status = doctor.availabilityStatus ?? 'offline';
  const m = doctor.metrics;
  return (
    <div className="dashboard-card flex flex-col items-center text-center">
      <div className="relative mb-3">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {doctor.firstName[0]}{doctor.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <span
          className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>
      <h3 className="font-semibold text-foreground">
        Dr. {doctor.firstName} {doctor.lastName}
      </h3>
      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {doctor.experienceYears} vite përvojë
      </p>

      {m && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="font-medium text-foreground">{m.averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">· {m.patientsTreated} pacientë</span>
        </div>
      )}

      <p className="mt-2 text-sm text-primary font-medium">
        €{doctor.consultationFee} / vizitë
      </p>

      <div className="mt-3 w-full space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{doctor.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{doctor.email}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 w-full">
        <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
          Detajet
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Modifiko profilin</DropdownMenuItem>
            <DropdownMenuItem>Shiko orarin</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Hiq mjekun</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ───────── Doctor Details Dialog ───────── */
function DoctorDetailsDialog({ doctor }: { doctor: Doctor }) {
  const status = doctor.availabilityStatus ?? 'offline';
  const m = doctor.metrics;
  return (
    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {doctor.firstName[0]}{doctor.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div>Dr. {doctor.firstName} {doctor.lastName}</div>
            <div className="text-sm font-normal text-muted-foreground">
              {doctor.specialization} · {doctor.experienceYears} vite përvojë
            </div>
          </div>
        </DialogTitle>
        <DialogDescription className="flex items-center gap-2 pt-2">
          <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>
          <Badge variant="outline">Licenca: {doctor.licenseNumber}</Badge>
          <Badge variant="outline">€{doctor.consultationFee}/vizitë</Badge>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        {/* Performance */}
        {m && (
          <div className="grid grid-cols-3 gap-3">
            <Metric icon={<Users className="h-4 w-4" />} label="Pacientë të trajtuar" value={m.patientsTreated} />
            <Metric icon={<CalIcon className="h-4 w-4" />} label="Termine të caktuara" value={m.appointmentsScheduled} />
            <Metric icon={<Star className="h-4 w-4 fill-warning text-warning" />} label="Vlerësimi mesatar" value={m.averageRating.toFixed(1)} />
          </div>
        )}

        {/* Bio */}
        {doctor.bio && (
          <Section title="Biografi e shkurtër">
            <p className="text-sm text-muted-foreground">{doctor.bio}</p>
          </Section>
        )}

        {/* Schedule */}
        <Section title="Orari i punës">
          <div className="grid gap-2">
            {(doctor.workingSchedule ?? []).map((ws) => (
              <div key={ws.day} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-1.5">
                <span className="font-medium text-foreground">{ws.day}</span>
                <span className="text-muted-foreground">
                  {ws.slots.length === 0
                    ? 'Pushim'
                    : ws.slots.map((s) => `${s.start} – ${s.end}`).join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Education */}
        {doctor.education && doctor.education.length > 0 && (
          <Section title="Edukimi">
            <ul className="space-y-2">
              {doctor.education.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{e.degree}</div>
                    <div className="text-muted-foreground">{e.institution} · {e.year}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Certifications */}
        {doctor.certifications && doctor.certifications.length > 0 && (
          <Section title="Certifikatat">
            <ul className="space-y-2">
              {doctor.certifications.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Award className="h-4 w-4 text-accent mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-muted-foreground">{c.issuer} · {c.year}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Reviews */}
        <Section title="Vlerësime nga pacientët">
          {doctor.reviews && doctor.reviews.length > 0 ? (
            <ul className="space-y-3">
              {doctor.reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{r.patientName}</span>
                    <span className="flex items-center gap-1 text-xs">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {r.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Ende nuk ka vlerësime.</p>
          )}
        </Section>
      </div>
    </DialogContent>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center bg-card">
      <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
        {icon}<span>{label}</span>
      </div>
      <div className="mt-1 text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

/* ───────── Add Doctor Dialog ───────── */
function AddDoctorDialog({
  onSubmit, onCancel,
}: { onSubmit: (d: Doctor) => void; onCancel: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState<number>(30);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('available');

  // Working schedule per day with single start/end time (admins can refine later).
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean; start: string; end: string }>>(
    DAYS.reduce((acc, d) => {
      acc[d] = { enabled: ['Hënë', 'Martë', 'Mërkurë', 'Enjte', 'Premte'].includes(d), start: '09:00', end: '17:00' };
      return acc;
    }, {} as Record<string, { enabled: boolean; start: string; end: string }>)
  );

  // Optional repeatable fields
  const [education, setEducation] = useState<DoctorEducation[]>([
    { degree: '', institution: '', year: new Date().getFullYear() - 10 },
  ]);
  const [certifications, setCertifications] = useState<DoctorCertification[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const workingSchedule: WorkingSchedule[] = DAYS
      .filter((d) => schedule[d].enabled)
      .map((d) => ({ day: d, slots: [{ start: schedule[d].start, end: schedule[d].end }] }));

    const metrics: DoctorMetrics = {
      patientsTreated: 0,
      appointmentsScheduled: 0,
      averageRating: 0,
    };

    const doc: Doctor = {
      id: `doc-${Date.now()}`,
      userId: `user-${Date.now()}`,
      firstName, lastName, email, phone,
      specialization, licenseNumber,
      experienceYears,
      bio,
      consultationFee,
      availabilityStatus,
      isAvailable: availabilityStatus === 'available',
      workingSchedule,
      education: education.filter((e) => e.degree && e.institution),
      certifications: certifications.filter((c) => c.name && c.issuer),
      reviews: [],
      metrics,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onSubmit(doc);
  };

  return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Shto Mjek të Ri</DialogTitle>
        <DialogDescription>
          Plotëso informacionin e detajuar të mjekut. Fushat me yll janë të detyrueshme.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-6">
        {/* Basics */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Emri *">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field label="Mbiemri *">
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
          <Field label="Specialiteti mjekësor *">
            <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} required placeholder="p.sh. Kardiologji" />
          </Field>
          <Field label="Numri i licencës *">
            <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required placeholder="LIC-2024-0001" />
          </Field>
          <Field label="Email *">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Telefoni *">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+383 44 123 456" />
          </Field>
          <Field label="Vite përvojë *">
            <Input
              type="number" min={0} max={60}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Çmimi i konsultës (€) *">
            <Input
              type="number" min={0}
              value={consultationFee}
              onChange={(e) => setConsultationFee(Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Statusi i disponueshmërisë">
            <Select value={availabilityStatus} onValueChange={(v) => setAvailabilityStatus(v as AvailabilityStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">I disponueshëm</SelectItem>
                <SelectItem value="busy">I zënë</SelectItem>
                <SelectItem value="offline">Jashtë linje</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Biografi e shkurtër">
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            placeholder="Përshkrim i shkurtër i përvojës dhe interesave klinike…" />
        </Field>

        {/* Schedule */}
        <div>
          <Label className="text-base">Orari i punës</Label>
          <p className="text-xs text-muted-foreground mb-2">Zgjidh ditët dhe intervalin e punës.</p>
          <div className="space-y-2 rounded-lg border border-border p-3">
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3">
                <div className="flex items-center gap-2 min-w-[110px]">
                  <Checkbox
                    id={`day-${day}`}
                    checked={schedule[day].enabled}
                    onCheckedChange={(c) =>
                      setSchedule((s) => ({ ...s, [day]: { ...s[day], enabled: !!c } }))}
                  />
                  <Label htmlFor={`day-${day}`} className="cursor-pointer">{day}</Label>
                </div>
                <div />
                <Input
                  type="time" className="w-28"
                  disabled={!schedule[day].enabled}
                  value={schedule[day].start}
                  onChange={(e) => setSchedule((s) => ({ ...s, [day]: { ...s[day], start: e.target.value } }))}
                />
                <Input
                  type="time" className="w-28"
                  disabled={!schedule[day].enabled}
                  value={schedule[day].end}
                  onChange={(e) => setSchedule((s) => ({ ...s, [day]: { ...s[day], end: e.target.value } }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <RepeatableList
          title="Edukimi (opsionale)"
          items={education}
          onAdd={() => setEducation((e) => [...e, { degree: '', institution: '', year: new Date().getFullYear() }])}
          onRemove={(i) => setEducation((e) => e.filter((_, idx) => idx !== i))}
          render={(item, i) => (
            <div className="grid grid-cols-[1fr_1fr_100px_auto] gap-2">
              <Input placeholder="Titulli (p.sh. Doktor i Mjekësisë)"
                value={item.degree}
                onChange={(e) => setEducation((arr) => arr.map((x, idx) => idx === i ? { ...x, degree: e.target.value } : x))} />
              <Input placeholder="Institucioni"
                value={item.institution}
                onChange={(e) => setEducation((arr) => arr.map((x, idx) => idx === i ? { ...x, institution: e.target.value } : x))} />
              <Input type="number" placeholder="Viti"
                value={item.year}
                onChange={(e) => setEducation((arr) => arr.map((x, idx) => idx === i ? { ...x, year: Number(e.target.value) } : x))} />
            </div>
          )}
        />

        {/* Certifications */}
        <RepeatableList
          title="Certifikatat (opsionale)"
          items={certifications}
          onAdd={() => setCertifications((e) => [...e, { name: '', issuer: '', year: new Date().getFullYear() }])}
          onRemove={(i) => setCertifications((e) => e.filter((_, idx) => idx !== i))}
          render={(item, i) => (
            <div className="grid grid-cols-[1fr_1fr_100px_auto] gap-2">
              <Input placeholder="Emri i certifikatës"
                value={item.name}
                onChange={(e) => setCertifications((arr) => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
              <Input placeholder="Institucioni lëshues"
                value={item.issuer}
                onChange={(e) => setCertifications((arr) => arr.map((x, idx) => idx === i ? { ...x, issuer: e.target.value } : x))} />
              <Input type="number" placeholder="Viti"
                value={item.year}
                onChange={(e) => setCertifications((arr) => arr.map((x, idx) => idx === i ? { ...x, year: Number(e.target.value) } : x))} />
            </div>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Anulo</Button>
          <Button type="submit">Ruaj Mjekun</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RepeatableList<T>({
  title, items, onAdd, onRemove, render,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (item: T, i: number) => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-base">{title}</Label>
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Shto
        </Button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">Asnjë regjistrim.</p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">{render(item, i)}</div>
            <Button type="button" size="icon" variant="ghost" onClick={() => onRemove(i)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
