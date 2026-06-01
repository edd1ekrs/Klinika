import { useEffect, useMemo, useState } from 'react';
import { Edit, Eye, Filter, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { patientsAPI } from '@/services/api';
import type { Patient } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const genderLabels: Record<string, string> = { male: 'Mashkull', female: 'Femer', other: 'Tjeter' };
type PatientForm = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
const emptyPatient: PatientForm = {
  firstName: '', lastName: '', email: '', phone: '', dateOfBirth: new Date(),
  gender: 'male', address: '', emergencyContact: '', bloodType: 'A+', allergies: [],
};

export default function PatientsPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [viewing, setViewing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);

  const loadPatients = async () => {
    setLoading(true);
    try {
      setPatients(await patientsAPI.getAll());
    } catch (error: any) {
      toast({ title: 'Pacientet nuk u ngarkuan', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadPatients(); }, []);

  const filteredPatients = useMemo(() => patients.filter((patient) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = `${patient.firstName} ${patient.lastName} ${patient.email}`.toLowerCase().includes(q);
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
    return matchesSearch && matchesGender;
  }), [patients, searchQuery, genderFilter]);

  const savePatient = async (payload: PatientForm) => {
    try {
      if (editing) {
        const saved = await patientsAPI.update(editing.id, payload);
        setPatients((prev) => prev.map((patient) => patient.id === editing.id ? saved : patient));
        toast({ title: 'Pacienti u perditesua', description: `${payload.firstName} ${payload.lastName} u ruajt me sukses.` });
      } else {
        const saved = await patientsAPI.create(payload);
        setPatients((prev) => [saved, ...prev]);
        toast({ title: 'Pacienti u shtua', description: `${payload.firstName} ${payload.lastName} u regjistrua me sukses.` });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast({ title: 'Ruajtja deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  const deletePatient = async () => {
    if (!deleting) return;
    try {
      await patientsAPI.delete(deleting.id);
      setPatients((prev) => prev.filter((patient) => patient.id !== deleting.id));
      toast({ title: 'Pacienti u fshi', description: `${deleting.firstName} ${deleting.lastName} u largua nga lista.` });
      setDeleting(null);
    } catch (error: any) {
      toast({ title: 'Fshirja deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Pacientet</h1><p className="text-muted-foreground">Menaxho dosjet dhe informacionin e pacienteve</p></div>
        <Button className="gap-2" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Shto Pacient</Button>
      </div>

      <div className="dashboard-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" placeholder="Kerko paciente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={genderFilter} onValueChange={setGenderFilter}><SelectTrigger className="w-40"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Te gjitha</SelectItem><SelectItem value="male">Mashkull</SelectItem><SelectItem value="female">Femer</SelectItem><SelectItem value="other">Tjeter</SelectItem></SelectContent></Select>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Pacienti</th><th>Kontakti</th><th>Data e lindjes</th><th>Gjinia</th><th>Grupi i gjakut</th><th>I regjistruar me</th><th className="text-right">Veprime</th></tr></thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-sm">{patient.firstName[0]}{patient.lastName[0]}</AvatarFallback></Avatar><div><p className="font-medium text-foreground">{patient.firstName} {patient.lastName}</p><p className="text-sm text-muted-foreground">ID: {patient.id}</p></div></div></td>
                  <td><div><p className="text-foreground">{patient.email}</p><p className="text-sm text-muted-foreground">{patient.phone}</p></div></td>
                  <td className="text-foreground">{format(new Date(patient.dateOfBirth), 'd MMM yyyy')}</td>
                  <td><span className="badge-info">{genderLabels[patient.gender] ?? patient.gender}</span></td>
                  <td className="text-foreground">{patient.bloodType || '-'}</td>
                  <td className="text-muted-foreground">{format(new Date(patient.createdAt), 'd MMM yyyy')}</td>
                  <td className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="gap-2" onSelect={() => setViewing(patient)}><Eye className="h-4 w-4" /> Detajet</DropdownMenuItem><DropdownMenuItem className="gap-2" onSelect={() => { setEditing(patient); setDialogOpen(true); }}><Edit className="h-4 w-4" /> Modifiko</DropdownMenuItem><DropdownMenuItem className="gap-2 text-destructive" onSelect={() => setDeleting(patient)}><Trash2 className="h-4 w-4" /> Fshi</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <EmptyState title="Duke ngarkuar pacientet..." />}
        {!loading && filteredPatients.length === 0 && <EmptyState title="Asnje pacient nuk u gjet" subtitle="Provo te ndryshosh kerkimin ose filtrat" />}
      </div>

      <PatientDialog open={dialogOpen} patient={editing} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }} onSave={savePatient} />
      <PatientDetails patient={viewing} onClose={() => setViewing(null)} />
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Fshi pacientin?</AlertDialogTitle><AlertDialogDescription>Ky veprim do ta largoje pacientin {deleting?.firstName} {deleting?.lastName} nga lista.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Anulo</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deletePatient}>Fshi</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function PatientDialog({ open, patient, onOpenChange, onSave }: { open: boolean; patient: Patient | null; onOpenChange: (open: boolean) => void; onSave: (patient: PatientForm) => void }) {
  const [form, setForm] = useState<PatientForm>(emptyPatient);
  useEffect(() => {
    setForm(patient ? { firstName: patient.firstName, lastName: patient.lastName, email: patient.email, phone: patient.phone, dateOfBirth: new Date(patient.dateOfBirth), gender: patient.gender, address: patient.address, emergencyContact: patient.emergencyContact ?? '', bloodType: patient.bloodType ?? 'A+', allergies: patient.allergies ?? [] } : emptyPatient);
  }, [patient, open]);
  const update = <K extends keyof PatientForm>(key: K, value: PatientForm[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{patient ? 'Modifiko Pacientin' : 'Shto Pacient te Ri'}</DialogTitle><DialogDescription>Ploteso te dhenat e pacientit.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4"><Field label="Emri"><Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required /></Field><Field label="Mbiemri"><Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required /></Field></div>
      <Field label="Email"><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></Field>
      <div className="grid grid-cols-2 gap-4"><Field label="Telefoni"><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></Field><Field label="Data e lindjes"><Input type="date" value={format(new Date(form.dateOfBirth), 'yyyy-MM-dd')} onChange={(e) => update('dateOfBirth', new Date(e.target.value))} /></Field></div>
      <div className="grid grid-cols-2 gap-4"><Field label="Gjinia"><Select value={form.gender} onValueChange={(v) => update('gender', v as Patient['gender'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Mashkull</SelectItem><SelectItem value="female">Femer</SelectItem><SelectItem value="other">Tjeter</SelectItem></SelectContent></Select></Field><Field label="Grupi i gjakut"><Input value={form.bloodType} onChange={(e) => update('bloodType', e.target.value)} /></Field></div>
      <Field label="Adresa"><Input value={form.address} onChange={(e) => update('address', e.target.value)} /></Field>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button><Button type="submit">Ruaj Pacientin</Button></DialogFooter>
    </form></DialogContent></Dialog>
  );
}

function PatientDetails({ patient, onClose }: { patient: Patient | null; onClose: () => void }) {
  return <Dialog open={!!patient} onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{patient?.firstName} {patient?.lastName}</DialogTitle><DialogDescription>Detajet e pacientit</DialogDescription></DialogHeader>{patient && <div className="space-y-2 text-sm"><p><b>Email:</b> {patient.email}</p><p><b>Telefoni:</b> {patient.phone || '-'}</p><p><b>Adresa:</b> {patient.address || '-'}</p><p><b>Grupi i gjakut:</b> {patient.bloodType || '-'}</p><p><b>Kontakt emergjent:</b> {patient.emergencyContact || '-'}</p></div>}</DialogContent></Dialog>;
}

function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="flex flex-col items-center justify-center py-12 text-center"><p className="text-lg font-medium text-foreground">{title}</p>{subtitle && <p className="text-muted-foreground">{subtitle}</p>}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
