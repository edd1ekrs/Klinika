import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_DASHBOARD_PATH, PATIENT_DASHBOARD_PATH, getDashboardPathForRole, isStaffRole } from '@/lib/auth-routes';

export default function PatientAuthPage() {
  const navigate = useNavigate();
  const { user, token, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (token && user) navigate(getDashboardPathForRole(user.role), { replace: true });
  }, [navigate, token, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let role: string = 'patient';
      if (isSignUp) {
        await signUp(email, password, firstName, lastName);
        toast({ title: 'Llogaria u krijua!', description: 'Tani mund të rezervoni terminet tuaja.' });
      } else {
        const u = await signIn(email, password);
        role = u.role;
      }
      if (isStaffRole(role as any)) {
        navigate(ADMIN_DASHBOARD_PATH, { replace: true });
      } else {
        navigate(PATIENT_DASHBOARD_PATH, { replace: true });
      }
    } catch (error: any) {
      toast({
        title: 'Gabim',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Klinika</h1>
            <p className="text-sm text-muted-foreground">Portali i Pacientit</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {isSignUp ? 'Krijo Llogari' : 'Mirë se vini'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isSignUp ? 'Bëni Signup për të rezervuar termine' : 'Bëni Login për të menaxhuar terminet tuaja'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-card space-y-5">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Emri</Label>
                <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required className="h-12" placeholder="Ardit" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Mbiemri</Label>
                <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required className="h-12" placeholder="Krasniqi" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12" placeholder="ju@shembull.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Fjalëkalimi</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="h-12 pr-12" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? (isSignUp ? 'Duke krijuar llogarinë…' : 'Duke bërë Login…') : (isSignUp ? 'Signup' : 'Login')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? 'Keni tashmë një llogari?' : 'Nuk keni llogari?'}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
            {isSignUp ? 'Login' : 'Signup'}
          </button>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          <button onClick={() => navigate('/login')} className="hover:underline">Login për stafin →</button>
        </p>
      </div>
    </div>
  );
}
