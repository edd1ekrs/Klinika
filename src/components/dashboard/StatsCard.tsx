import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'default';
}

export function StatsCard({ title, value, icon: Icon, trend, subtitle, variant = 'default' }: StatsCardProps) {
  const variantStyles = {
    primary: 'stats-card-primary',
    accent: 'stats-card-accent',
    success: 'stats-card-success',
    warning: 'stats-card-warning',
    default: 'stats-card',
  };

  const isGradient = variant !== 'default';

  return (
    <div className={cn(variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn('text-sm font-medium', isGradient ? 'opacity-90' : 'text-muted-foreground')}>
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className={cn('text-sm font-medium', isGradient ? '' : trend.isPositive ? 'text-success' : 'text-destructive')}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className={cn('text-sm', isGradient ? 'opacity-75' : 'text-muted-foreground')}>krahasuar me muajin e kaluar</span>
            </div>
          )}
          {subtitle && (
            <p className={cn('text-sm', isGradient ? 'opacity-75' : 'text-muted-foreground')}>{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl',
          isGradient ? 'bg-white/20' : 'bg-primary/10'
        )}>
          <Icon className={cn('h-6 w-6', isGradient ? '' : 'text-primary')} />
        </div>
      </div>
    </div>
  );
}
