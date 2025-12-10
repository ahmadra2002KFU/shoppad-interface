/**
 * Register Page
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Phone, Lock, Eye, EyeOff, ShoppingCart, Loader2, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import type { PaymentMethod } from '@/types/payment';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredPaymentId, setPreferredPaymentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Fetch payment methods for selection
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const response = await api.getPaymentMethods();
      if (response.success && response.data) {
        setPaymentMethods(response.data);
        if (response.data.length > 0) {
          setPreferredPaymentId(response.data[0].id);
        }
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setError(language === 'ar' ? 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' : 'Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name,
        phone,
        password,
        preferredPaymentId: preferredPaymentId || undefined,
      });

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentIcon = (iconName: string) => {
    // Map icon names to components
    return <CreditCard className="w-4 h-4" />;
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
            {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'انضم إلينا وابدأ التسوق'
              : 'Join us and start shopping'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {language === 'ar' ? 'الاسم' : 'Name'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            {paymentMethods.length > 0 && (
              <div className="space-y-2">
                <Label>
                  {language === 'ar' ? 'طريقة الدفع المفضلة' : 'Preferred Payment Method'}
                </Label>
                <RadioGroup
                  value={preferredPaymentId}
                  onValueChange={setPreferredPaymentId}
                  className="grid grid-cols-2 gap-2"
                >
                  {paymentMethods.map((method) => (
                    <div key={method.id}>
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={method.id}
                        className="flex items-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer text-sm"
                      >
                        {getPaymentIcon(method.icon)}
                        <span>{language === 'ar' ? method.name_ar : method.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {language === 'ar' ? 'سجل الدخول' : 'Sign In'}
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
