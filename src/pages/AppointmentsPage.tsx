import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, Clock, Edit, Filter, MoreHorizontal, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { appointmentsAPI, doctorsAPI, patientsAPI, servicesAPI } from '@/services/api';
import type { Appointment, Doctor, Patient, Service } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const statusStyles: Record<string, string> = { scheduled: 'badge-info', confirmed: 'badge-primary', 'in-progress': 'badge-warning', completed: 'badge-success', cancelled: 'badge-destructive', 'no-show': 'badge-destructive' };
const statusLabels: Record<string, string> = { scheduled: 'I planifikuar', confirmed: 'I konfirmuar', 'in-progress': 'Ne vazhdim', completed: 'I perfunduar', cancelled: 'I anuluar', 'no-show': 'Nuk u paraqit' };

type AppointmentForm = { patientId: string; doctorId: string; serviceId: string; date: string; time: string; duration: number; status: Appointment['status']; notes: string; };

function toForm(appointment: Appointment | null, patients: Patient[], doctors: Doctor[], services: Service[]): AppointmentForm {
  const scheduled = appointment ? new Date(appointment.scheduledAt) : new Date();
  return {
    patientId: appointment?.patientId ?? patients[0]?.id ?? '',
    doctorId: appointment?.doctorId ?? doctors[0]?.id ?? '',
    serviceId: appointment?.serviceId ?? services[0]?.id ?? '',
    date: format(scheduled, 'yyyy-MM-dd'),
    time: format(scheduled, 'HH:mm'),
    duration: appointment?.duration ?? services[0]?.duration ?? 30,
    status: appointment?.status ?? 'scheduled',
    notes: appointment?.notes ?? '',
  };
}

function fromForm(form: AppointmentForm): Partial<Appointment> {
  return {
    patientId: form.patientId,
    doctorId: form.doctorId,
    serviceId: form.serviceId,
    scheduledAt: new Date(`${form.date}T${form.time}:00`),
    duration: form.duration,
    status: form.status,
    notes: form.notes,
  };
}

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState<Appointment | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [apts, pats, docs, svcs] = await Promise.all([appointmentsAPI.getAll(), patientsAPI.getAll(), doctorsAPI.getAll(), servicesAPI.getAll()]);
        if (!cancelled) { setAppointments(apts); setPatients(pats); setDoctors(docs); setServices(svcs); }
      } catch (error: any) {
        toast({ title: 'Terminet nuk u ngarkuan', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const filteredAppointments = useMemo(() => appointments.filter((apt) => {
    const q = searchQuery.toLowerCase();
    const text = `${apt.patient?.firstName} ${apt.patient?.lastName} ${apt.doctor?.firstName} ${apt.doctor?.lastName}`.toLowerCase();
    return text.includes(q) && (statusFilter === 'all' || apt.status === statusFilter);
  }), [appointments, searchQuery, statusFilter]);

  const saveAppointment = async (form: AppointmentForm) => {
    try {
      const payload = fromForm(form);
      if (editing) {
        const saved = await appointmentsAPI.update(editing.id, payload);
        setAppointments((prev) => prev.map((apt) => apt.id === editing.id ? saved : apt));
        toast({ title: 'Termini u perditesua', description: 'Ndryshimet u ruajten me sukses.' });
      } else {
        const saved = await appointmentsAPI.create(payload);
        setAppointments((prev) => [saved, ...prev]);
        toast({ title: 'Termini u krijua', description: 'Termini i ri u planifikua me sukses.' });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast({ title: 'Ruajtja deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  const setStatus = async (appointment: Appointment, status: Appointment['status']) => {
    try {
      const saved = await appointmentsAPI.update(appointment.id, { status });
      setAppointments((prev) => prev.map((apt) => apt.id === appointment.id ? saved : apt));
      toast({ title: 'Statusi u ndryshua', description: `Termini tani eshte: ${statusLabels[status]}.` });
    } catch (error: any) {
      toast({ title: 'Ndryshimi deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  const deleteAppointment = async () => {
    if (!deleting) return;
    try {
      await appointmentsAPI.delete(deleting.id);
      setAppointments((prev) => prev.filter((apt) => apt.id !== deleting.id));
      toast({ title: 'Termini u fshi', description: 'Termini u largua nga lista.' });
      setDeleting(null);
    } catch (error: any) {
      toast({ title: 'Fshirja deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-foreground">Terminet</h1><p className="text-muted-foreground">Planifiko dhe menaxho terminet e pacienteve</p></div><Button className="gap-2" onClick={() => { setEditing(null); setDialogOpen(true); }} disabled={!patients.length || !doctors.length || !services.length}><Plus className="h-4 w-4" /> Termin i Ri</Button></div>
      <div className="dashboard-card"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" placeholder="Kerko sipas pacientit ose mjekut..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-44"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Te gjitha</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="dashboard-card overflow-hidden p-0"><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Pacienti</th><th>Mjeku</th><th>Sherbimi</th><th>Data & Ora</th><th>Kohezgjatja</th><th>Statusi</th><th className="text-right">Veprime</th></tr></thead><tbody>{filteredAppointments.map((apt) => (<tr key={apt.id}><td><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-sm">{apt.patient?.firstName?.[0]}{apt.patient?.lastName?.[0]}</AvatarFallback></Avatar><div><p className="font-medium text-foreground">{apt.patient?.firstName} {apt.patient?.lastName}</p><p className="text-sm text-muted-foreground">{apt.patient?.email}</p></div></div></td><td><div><p className="font-medium text-foreground">Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</p><p className="text-sm text-muted-foreground">{apt.doctor?.specialization}</p></div></td><td className="text-foreground">{apt.service?.name}</td><td><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{format(new Date(apt.scheduledAt), 'd MMM yyyy')}</span></div><div className="flex items-center gap-2 mt-1"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">{format(new Date(apt.scheduledAt), 'HH:mm')}</span></div></td><td className="text-muted-foreground">{apt.duration} min</td><td><span className={statusStyles[apt.status]}>{statusLabels[apt.status] ?? apt.status}</span></td><td className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="gap-2" onSelect={() => { setEditing(apt); setDialogOpen(true); }}><Edit className="h-4 w-4" /> Modifiko</DropdownMenuItem><DropdownMenuItem className="gap-2" onSelect={() => setStatus(apt, 'completed')}><CheckCircle className="h-4 w-4" /> Perfunduar</DropdownMenuItem><DropdownMenuItem className="gap-2" onSelect={() => setStatus(apt, 'cancelled')}><XCircle className="h-4 w-4" /> Anulo</DropdownMenuItem><DropdownMenuItem className="gap-2 text-destructive" onSelect={() => setDeleting(apt)}><Trash2 className="h-4 w-4" /> Fshi</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td></tr>))}</tbody></table></div>{loading && <EmptyState title="Duke ngarkuar terminet..." />}{!loading && filteredAppointments.length === 0 && <EmptyState title="Asnje termin nuk u gjet" subtitle="Provo te ndryshosh kerkimin ose filtrat" />}</div>
      <AppointmentDialog open={dialogOpen} appointment={editing} patients={patients} doctors={doctors} services={services} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }} onSave={saveAppointment} />
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Fshi terminin?</AlertDialogTitle><AlertDialogDescription>Ky veprim do ta largoje terminin nga dashboard-i.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Anulo</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteAppointment}>Fshi</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function AppointmentDialog({ open, appointment, patients, doctors, services, onOpenChange, onSave }: { open: boolean; appointment: Appointment | null; patients: Patient[]; doctors: Doctor[]; services: Service[]; onOpenChange: (open: boolean) => void; onSave: (form: AppointmentForm) => void }) {
  const [form, setForm] = useState<AppointmentForm>(toForm(appointment, patients, doctors, services));
  useEffect(() => setForm(toForm(appointment, patients, doctors, services)), [appointment, open, patients, doctors, services]);
  const update = <K extends keyof AppointmentForm>(key: K, value: AppointmentForm[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{appointment ? 'Modifiko Terminin' : 'Planifiko Termin'}</DialogTitle><DialogDescription>Krijo ose perditeso terminin e pacientit.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4"><Field label="Pacienti"><Select value={form.patientId} onValueChange={(v) => update('patientId', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}</SelectContent></Select></Field><Field label="Mjeku"><Select value={form.doctorId} onValueChange={(v) => update('doctorId', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} - {d.specialization}</SelectItem>)}</SelectContent></Select></Field><Field label="Sherbimi"><Select value={form.serviceId} onValueChange={(v) => { const service = services.find((s) => s.id === v); setForm((prev) => ({ ...prev, serviceId: v, duration: service?.duration ?? prev.duration })); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} - EUR {s.price}</SelectItem>)}</SelectContent></Select></Field><div className="grid grid-cols-2 gap-4"><Field label="Data"><Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} required /></Field><Field label="Ora"><Input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} required /></Field></div><div className="grid grid-cols-2 gap-4"><Field label="Kohezgjatja"><Input type="number" min={5} value={form.duration} onChange={(e) => update('duration', Number(e.target.value))} required /></Field><Field label="Statusi"><Select value={form.status} onValueChange={(v) => update('status', v as Appointment['status'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field></div><Field label="Shenime"><Input value={form.notes} onChange={(e) => update('notes', e.target.value)} /></Field><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button><Button type="submit">Ruaj Terminin</Button></DialogFooter></form></DialogContent></Dialog>;
}

function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="flex flex-col items-center justify-center py-12 text-center"><p className="text-lg font-medium text-foreground">{title}</p>{subtitle && <p className="text-muted-foreground">{subtitle}</p>}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
