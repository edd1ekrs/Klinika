import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const u = await signIn(email, password);
      if (!['admin', 'doctor', 'staff'].includes(u.role)) {
        toast({
          title: 'Qasje e ndaluar',
          description: 'Kjo llogari nuk ka leje për panelin e administrimit.',
          variant: 'destructive',
        });
        return;
      }
      const dest = location.state?.from?.startsWith('/dashboard')
        ? location.state.from
        : '/dashboard';
      navigate(dest, { replace: true });
    } catch (err: any) {
      toast({
        title: 'Login dështoi',
        description: err?.response?.data?.message || err?.message || 'Të dhëna të pavlefshme',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent">
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediClinic</h1>
              <p className="text-sm opacity-80">Sistemi i Menaxhimit</p>
            </div>
          </div>
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Menaxho me lehtësi poliklinikën tënde
            </h2>
            <p className="text-lg opacity-90">
              Një platformë e plotë për menaxhimin e pacientëve, terminëve, mjekëve dhe shërbimeve —
              gjithçka në një vend të vetëm dhe të sigurt.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Activity className="h-5 w-5" />
                </div>
                <span>Kontroll i qasjes sipas rolit</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Activity className="h-5 w-5" />
                </div>
                <span>Të dhëna të enkriptuara dhe të sigurta</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Activity className="h-5 w-5" />
                </div>
                <span>Analitika në kohë reale</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MediClinic</h1>
              <p className="text-sm text-muted-foreground">Sistemi i Menaxhimit</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">Mirë se vini</h2>
            <p className="mt-2 text-muted-foreground">
              Bëni Login për të hyrë në panelin tuaj
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Adresa e Email-it</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mediclinic.com"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Fjalëkalimi</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Keni harruar fjalëkalimin?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Shkruani fjalëkalimin"
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Më mbaj të kyçur për 30 ditë
              </Label>
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? 'Duke bërë Login…' : 'Login'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Të dhënat demo:</p>
            <p className="font-medium text-foreground">admin@mediclinic.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
