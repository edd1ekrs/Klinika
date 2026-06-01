import { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { mockPatients } from '@/data/mockData';
import type { Patient } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const genderLabels: Record<string, string> = {
  male: 'Mashkull',
  female: 'Femër',
  other: 'Tjetër',
};

export default function PatientsPage() {
  const [patients] = useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientët</h1>
          <p className="text-muted-foreground">Menaxho dosjet dhe informacionin e pacientëve</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Shto Pacient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Shto Pacient të Ri</DialogTitle>
              <DialogDescription>
                Plotëso të dhënat e pacientit për të krijuar një dosje të re.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Emri</Label>
                  <Input id="firstName" placeholder="Ardit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Mbiemri</Label>
                  <Input id="lastName" placeholder="Krasniqi" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="ardit.krasniqi@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoni</Label>
                  <Input id="phone" placeholder="+383 44 123 456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Data e lindjes</Label>
                  <Input id="dob" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gjinia</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Zgjedh gjininë" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Mashkull</SelectItem>
                      <SelectItem value="female">Femër</SelectItem>
                      <SelectItem value="other">Tjetër</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Grupi i gjakut</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Zgjedh" /></SelectTrigger>
                    <SelectContent>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresa</Label>
                <Input id="address" placeholder="Rr. Nëna Terezë, Prishtinë" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Anulo</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Ruaj Pacientin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="dashboard-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Kërko pacientë sipas emrit ose email-it…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Gjinia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Të gjitha gjinitë</SelectItem>
                <SelectItem value="male">Mashkull</SelectItem>
                <SelectItem value="female">Femër</SelectItem>
                <SelectItem value="other">Tjetër</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pacienti</th>
                <th>Kontakti</th>
                <th>Data e lindjes</th>
                <th>Gjinia</th>
                <th>Grupi i gjakut</th>
                <th>I regjistruar më</th>
                <th className="text-right">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-foreground">{patient.email}</p>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </div>
                  </td>
                  <td className="text-foreground">
                    {format(new Date(patient.dateOfBirth), 'd MMM yyyy')}
                  </td>
                  <td>
                    <span className="badge-info">{genderLabels[patient.gender] ?? patient.gender}</span>
                  </td>
                  <td className="text-foreground">{patient.bloodType || '-'}</td>
                  <td className="text-muted-foreground">
                    {format(new Date(patient.createdAt), 'd MMM yyyy')}
                  </td>
                  <td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" />
                          Shiko detajet
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Modifiko
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Fshi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-foreground">Asnjë pacient nuk u gjet</p>
            <p className="text-muted-foreground">Provo të ndryshosh kërkimin ose filtrat</p>
          </div>
        )}
      </div>
    </div>
  );
}
