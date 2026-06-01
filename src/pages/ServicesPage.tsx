import { mockServices } from '@/data/mockData';
import { Search, Plus, MoreHorizontal, Clock, Euro } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = mockServices.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shërbimet</h1>
          <p className="text-muted-foreground">Menaxho shërbimet dhe çmimet e poliklinikës</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Shto Shërbim
        </Button>
      </div>

      <div className="dashboard-card">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Kërko shërbime…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <div key={service.id} className="dashboard-card">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge-primary">{service.category}</span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{service.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Modifiko</DropdownMenuItem>
                  <DropdownMenuItem>{service.isActive ? 'Çaktivizo' : 'Aktivizo'}</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Fshi</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{service.duration} min</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Euro className="h-4 w-4" />
                <span>{service.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="dashboard-card flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-foreground">Asnjë shërbim nuk u gjet</p>
          <p className="text-muted-foreground">Provo të ndryshosh kërkimin</p>
        </div>
      )}
    </div>
  );
}
