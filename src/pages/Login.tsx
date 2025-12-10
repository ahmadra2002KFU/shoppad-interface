/**
 * Login Page
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Phone, Lock, Eye, EyeOff, ShoppingCart, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t, language } = useLanguage();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect path from location state
  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login({ phone, password });

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {language === 'ar' ? 'تسجيل الدخول' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'سجل الدخول للوصول إلى سلتك'
              : 'Sign in to access your cart'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={language === 'ar' ? '05xxxxxxxx' : '05xxxxxxxx'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري التسجيل...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </>
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {language === 'ar' ? 'أو' : 'or'}
                </span>
              </div>
            </div>

            <Link to="/qr-login" className="w-full">
              <Button variant="outline" className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'تسجيل الدخول بـ QR' : 'Sign in with QR Code'}
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground text-center">
              {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                {language === 'ar' ? 'سجل الآن' : 'Sign Up'}
              </Link>
            </p>

            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground text-center">
              {language === 'ar' ? 'تخطي والمتابعة كضيف' : 'Skip and continue as guest'}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
