import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Store, Mail, Lock } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email saxan geli'),
  password: z.string().min(6, 'Password waa inuu ka badan yahay 6 xaraf'),
});

export default function Auth() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast({
        title: 'Khalad',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: 'Login khalad',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ama password-ka waa khalad' 
          : error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Ku soo dhawoow!', description: 'Login waad ku guuleysatay' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-background to-sidebar-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Mamo Mulki</h1>
          <p className="text-muted-foreground mt-2">Smart Retail Management</p>
        </div>

        <Card className="border-border/50 shadow-elevated">
          <CardHeader className="pb-4 text-center">
            <h2 className="text-xl font-semibold">Soo Gal (Login)</h2>
          </CardHeader>
            
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : 'Soo Gal'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
