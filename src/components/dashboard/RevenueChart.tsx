import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: {
    day: string;
    appointments: number;
    revenue: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weekly Overview</h3>
        <p className="text-sm text-muted-foreground">Appointments and revenue trends</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => [
                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Appointments'
              ]}
            />
            <Bar 
              dataKey="revenue" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
            <Bar 
              dataKey="appointments" 
              fill="hsl(var(--accent))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
