import { useEffect, useMemo, useState } from 'react';
import { Clock, Edit, Euro, MoreHorizontal, Plus, Power, Search, Trash2 } from 'lucide-react';
import { servicesAPI } from '@/services/api';
import type { Service } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const emptyService: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', description: '', category: 'Klinike', price: 0, duration: 30, isActive: true,
};

export default function ServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await servicesAPI.getAll();
        if (!cancelled) setServices(data);
      } catch (error: any) {
        toast({ title: 'Sherbimet nuk u ngarkuan', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const filteredServices = useMemo(() => services.filter((service) =>
    `${service.name} ${service.category}`.toLowerCase().includes(searchQuery.toLowerCase())
  ), [services, searchQuery]);

  const saveService = async (payload: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editing) {
        const saved = await servicesAPI.update(editing.id, payload);
        setServices((prev) => prev.map((service) => service.id === editing.id ? saved : service));
        toast({ title: 'Sherbimi u perditesua', description: `${payload.name} u ruajt me sukses.` });
      } else {
        const saved = await servicesAPI.create(payload);
        setServices((prev) => [saved, ...prev]);
        toast({ title: 'Sherbimi u shtua', description: `${payload.name} u krijua me sukses.` });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast({ title: 'Ruajtja deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const saved = await servicesAPI.update(service.id, { ...service, isActive: !service.isActive });
      setServices((prev) => prev.map((item) => item.id === service.id ? saved : item));
      toast({ title: service.isActive ? 'Sherbimi u caktivizua' : 'Sherbimi u aktivizua' });
    } catch (error: any) {
      toast({ title: 'Ndryshimi deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  const deleteService = async () => {
    if (!deleting) return;
    try {
      await servicesAPI.delete(deleting.id);
      setServices((prev) => prev.filter((service) => service.id !== deleting.id));
      toast({ title: 'Sherbimi u fshi', description: `${deleting.name} u largua nga lista.` });
      setDeleting(null);
    } catch (error: any) {
      toast({ title: 'Fshirja deshtoi', description: error?.response?.data?.error || error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Sherbimet</h1><p className="text-muted-foreground">Menaxho sherbimet dhe cmimet e poliklinikes</p></div>
        <Button className="gap-2" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Shto Sherbim</Button>
      </div>

      <div className="dashboard-card"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" placeholder="Kerko sherbime..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div></div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <div key={service.id} className="dashboard-card">
            <div className="flex items-start justify-between">
              <div><span className={service.isActive ? 'badge-primary' : 'badge-destructive'}>{service.isActive ? service.category : 'Joaktiv'}</span><h3 className="mt-2 text-lg font-semibold text-foreground">{service.name}</h3><p className="mt-1 text-sm text-muted-foreground line-clamp-2">{service.description}</p></div>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="gap-2" onSelect={() => { setEditing(service); setDialogOpen(true); }}><Edit className="h-4 w-4" /> Modifiko</DropdownMenuItem><DropdownMenuItem className="gap-2" onSelect={() => toggleActive(service)}><Power className="h-4 w-4" /> {service.isActive ? 'Caktivizo' : 'Aktivizo'}</DropdownMenuItem><DropdownMenuItem className="gap-2 text-destructive" onSelect={() => setDeleting(service)}><Trash2 className="h-4 w-4" /> Fshi</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4"><div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /><span className="text-sm">{service.duration} min</span></div><div className="flex items-center gap-1.5 text-primary font-semibold"><Euro className="h-4 w-4" /><span>{service.price}</span></div></div>
          </div>
        ))}
      </div>
      {loading && <EmptyState title="Duke ngarkuar sherbimet..." />}
      {!loading && filteredServices.length === 0 && <EmptyState title="Asnje sherbim nuk u gjet" subtitle="Provo te ndryshosh kerkimin" />}

      <ServiceDialog open={dialogOpen} service={editing} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }} onSave={saveService} />
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Fshi sherbimin?</AlertDialogTitle><AlertDialogDescription>Ky veprim do ta largoje sherbimin {deleting?.name} nga dashboard-i.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Anulo</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteService}>Fshi</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function ServiceDialog({ open, service, onOpenChange, onSave }: { open: boolean; service: Service | null; onOpenChange: (open: boolean) => void; onSave: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void }) {
  const [form, setForm] = useState(emptyService);
  useEffect(() => {
    setForm(service ? { name: service.name, description: service.description, category: service.category, price: service.price, duration: service.duration, isActive: service.isActive } : emptyService);
  }, [service, open]);
  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{service ? 'Modifiko Sherbimin' : 'Shto Sherbim te Ri'}</DialogTitle><DialogDescription>Ploteso te dhenat e sherbimit klinik.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4"><Field label="Emri"><Input value={form.name} onChange={(e) => update('name', e.target.value)} required /></Field><Field label="Kategoria"><Input value={form.category} onChange={(e) => update('category', e.target.value)} required /></Field><Field label="Cmimi"><Input type="number" min={0} value={form.price} onChange={(e) => update('price', Number(e.target.value))} required /></Field><Field label="Kohezgjatja (min)"><Input type="number" min={5} value={form.duration} onChange={(e) => update('duration', Number(e.target.value))} required /></Field></div>
      <Field label="Pershkrimi"><Textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></Field>
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
