import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  Stethoscope,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types/clinic';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end?: boolean;
  allowed: Role[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Paneli', end: true, allowed: ['admin', 'doctor', 'staff'] },
  { to: '/dashboard/patients', icon: Users, label: 'Pacientët', allowed: ['admin', 'doctor', 'staff'] },
  { to: '/dashboard/doctors', icon: UserCog, label: 'Mjekët', allowed: ['admin'] },
  { to: '/dashboard/appointments', icon: Calendar, label: 'Terminet', allowed: ['admin', 'doctor', 'staff'] },
  { to: '/dashboard/services', icon: Stethoscope, label: 'Shërbimet', allowed: ['admin'] },
  { to: '/dashboard/records', icon: FileText, label: 'Dosjet Mjekësore', allowed: ['admin', 'doctor'] },
  { to: '/dashboard/settings', icon: Settings, label: 'Cilësimet', allowed: ['admin'] },
];

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const { user } = useAuth();
  const visibleItems = navItems.filter((i) => !user || i.allowed.includes(user.role));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">MediClinic</span>
              <span className="text-xs text-sidebar-foreground/60">Sistemi i Menaxhimit</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg bg-sidebar-accent p-4">
            <p className="text-xs text-sidebar-foreground/70">
              Menaxhimi i Poliklinikës v1.0
            </p>
            <p className="mt-1 text-xs text-sidebar-foreground/50">
              © 2025 MediClinic
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
