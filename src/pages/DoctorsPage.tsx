import { mockDoctors } from '@/data/mockData';
import { Search, Plus, Filter, MoreHorizontal, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');

  const specializations = [...new Set(mockDoctors.map((d) => d.specialization))];

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = specializationFilter === 'all' || doctor.specialization === specializationFilter;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground">Manage medical staff and their schedules</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      {/* Filters */}
      <div className="dashboard-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="dashboard-card flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card ${
                  doctor.isAvailable ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
            </div>
            <h3 className="font-semibold text-foreground">
              {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            <p className="mt-2 text-sm text-primary font-medium">
              ${doctor.consultationFee} / visit
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{doctor.phone}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate max-w-[180px]">{doctor.email}</span>
            </div>
            <div className="mt-4 flex gap-2 w-full">
              <Button variant="outline" size="sm" className="flex-1">
                View
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                  <DropdownMenuItem>View Schedule</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="dashboard-card flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-foreground">No doctors found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
