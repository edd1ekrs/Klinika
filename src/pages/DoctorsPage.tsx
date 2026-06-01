import { useEffect, useMemo, useState } from 'react';
import { Edit, Mail, MoreHorizontal, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { doctorsAPI } from '@/services/api';
import type { AvailabilityStatus, Doctor } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const emptyDoctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: '', firstName: '', lastName: '', email: '', phone: '', specialization: '',
  licenseNumber: '', bio: '', consultationFee: 30, isAvailable: true,
  experienceYears: 0, availabilityStatus: 'available',
};

const statusLabels: Record<AvailabilityStatus, string> = {
  available: 'I disponueshem',
  busy: 'I zene',
  offline: 'Jashte linje',
};

export default function DoctorsPage() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await doctorsAPI.getAll();
        if (!cancelled) setDoctors(data);
      } catch (error: any) {
        toast({ title: 'Mjeket nuk u ngarkuan', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const filtered = useMemo(() => doctors.filter((doctor) =>
    `${doctor.firstName} ${doctor.lastName} ${doctor.specialization}`.toLowerCase().includes(searchQuery.toLowerCase())
  ), [doctors, searchQuery]);

  const saveDoctor = async (payload: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editing) {
        const saved = await doctorsAPI.update(editing.id, payload);
        setDoctors((prev) => prev.map((doctor) => doctor.id === editing.id ? saved : doctor));
        toast({ title: 'Mjeku u perditesua', description: `${payload.firstName} ${payload.lastName} u ruajt me sukses.` });
      } else {
        const saved = await doctorsAPI.create(payload);
        setDoctors((prev) => [saved, ...prev]);
        toast({ title: 'Mjeku u shtua', description: `${payload.firstName} ${payload.lastName} u regjistrua me sukses.` });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast({ title: 'Ruajtja deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  const deleteDoctor = async () => {
    if (!deleting) return;
    try {
      await doctorsAPI.delete(deleting.id);
      setDoctors((prev) => prev.filter((doctor) => doctor.id !== deleting.id));
      toast({ title: 'Mjeku u fshi', description: `${deleting.firstName} ${deleting.lastName} u largua nga lista.` });
      setDeleting(null);
    } catch (error: any) {
      toast({ title: 'Fshirja deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Mjeket</h1><p className="text-muted-foreground">Menaxho stafin mjekesor dhe profilet</p></div>
        <Button className="gap-2" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Shto Mjek</Button>
      </div>

      <div className="dashboard-card"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" placeholder="Kerko mjek..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div></div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((doctor) => (
          <div key={doctor.id} className="dashboard-card flex flex-col items-center text-center">
            <Avatar className="h-20 w-20"><AvatarFallback className="bg-primary/10 text-primary text-xl">{doctor.firstName[0]}{doctor.lastName[0]}</AvatarFallback></Avatar>
            <h3 className="mt-3 font-semibold text-foreground">Dr. {doctor.firstName} {doctor.lastName}</h3>
            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            <p className="mt-1 text-xs text-muted-foreground">{doctor.experienceYears ?? 0} vite pervoje</p>
            <span className={doctor.isAvailable ? 'badge-success mt-3' : 'badge-destructive mt-3'}>{statusLabels[doctor.availabilityStatus ?? 'available']}</span>
            <div className="mt-3 w-full space-y-1 text-xs text-muted-foreground"><div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{doctor.phone || '-'}</span></div><div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{doctor.email}</span></div></div>
            <div className="mt-4 flex gap-2 w-full"><Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditing(doctor); setDialogOpen(true); }}><Edit className="h-4 w-4" /> Modifiko</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="text-destructive" onSelect={() => setDeleting(doctor)}><Trash2 className="h-4 w-4 mr-2" /> Fshi</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
          </div>
        ))}
      </div>
      {loading && <EmptyState title="Duke ngarkuar mjeket..." />}
      {!loading && filtered.length === 0 && <EmptyState title="Asnje mjek nuk u gjet" subtitle="Provo te ndryshosh kerkimin" />}

      <DoctorDialog open={dialogOpen} doctor={editing} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }} onSave={saveDoctor} />
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Fshi mjekun?</AlertDialogTitle><AlertDialogDescription>Ky veprim do ta largoje mjekun {deleting?.firstName} {deleting?.lastName} nga lista.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Anulo</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteDoctor}>Fshi</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function DoctorDialog({ open, doctor, onOpenChange, onSave }: { open: boolean; doctor: Doctor | null; onOpenChange: (open: boolean) => void; onSave: (doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) => void }) {
  const [form, setForm] = useState(emptyDoctor);
  useEffect(() => {
    setForm(doctor ? { userId: doctor.userId, firstName: doctor.firstName, lastName: doctor.lastName, email: doctor.email, phone: doctor.phone, specialization: doctor.specialization, licenseNumber: doctor.licenseNumber, bio: doctor.bio ?? '', consultationFee: doctor.consultationFee, isAvailable: doctor.isAvailable, experienceYears: doctor.experienceYears ?? 0, availabilityStatus: doctor.availabilityStatus ?? 'available' } : emptyDoctor);
  }, [doctor, open]);
  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{doctor ? 'Modifiko Mjekun' : 'Shto Mjek te Ri'}</DialogTitle><DialogDescription>Ploteso te dhenat profesionale te mjekut.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-5">
      <div className="grid grid-cols-2 gap-4"><Field label="Emri"><Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required /></Field><Field label="Mbiemri"><Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required /></Field><Field label="Specialiteti"><Input value={form.specialization} onChange={(e) => update('specialization', e.target.value)} required /></Field><Field label="Licenca"><Input value={form.licenseNumber} onChange={(e) => update('licenseNumber', e.target.value)} /></Field><Field label="Email"><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></Field><Field label="Telefoni"><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></Field><Field label="Vite pervoje"><Input type="number" min={0} value={form.experienceYears} onChange={(e) => update('experienceYears', Number(e.target.value))} /></Field><Field label="Cmimi"><Input type="number" min={0} value={form.consultationFee} onChange={(e) => update('consultationFee', Number(e.target.value))} /></Field><Field label="Statusi"><Select value={form.availabilityStatus} onValueChange={(v) => { update('availabilityStatus', v as AvailabilityStatus); update('isAvailable', v !== 'offline'); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">I disponueshem</SelectItem><SelectItem value="busy">I zene</SelectItem><SelectItem value="offline">Jashte linje</SelectItem></SelectContent></Select></Field></div>
      <Field label="Biografi"><Textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} rows={3} /></Field>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button><Button type="submit">Ruaj</Button></DialogFooter>
    </form></DialogContent></Dialog>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="dashboard-card flex flex-col items-center justify-center py-12 text-center"><p className="text-lg font-medium text-foreground">{title}</p>{subtitle && <p className="text-muted-foreground">{subtitle}</p>}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
