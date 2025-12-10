/**
 * Settings Page
 * User profile and payment method preferences
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  CreditCard,
  LogOut,
  ArrowLeft,
  Loader2,
  Check,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import type { PaymentMethod } from '@/types/payment';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [preferredPaymentId, setPreferredPaymentId] = useState(user?.preferredPaymentId || '');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/settings' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true);
      const response = await api.getPaymentMethods();
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      }
      setIsLoading(false);
    };

    fetchPaymentMethods();
  }, []);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreferredPaymentId(user.preferredPaymentId || '');
    }
  }, [user]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await api.updateProfile({
        name,
        preferredPaymentId: preferredPaymentId || undefined,
      });

      if (response.success && response.data) {
        updateUser(response.data);
        setSuccess(language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
      } else {
        setError(response.error || 'Failed to save changes');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPaymentIcon = (iconName: string) => {
    return <CreditCard className="w-4 h-4" />;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              <h1 className="text-xl font-semibold">
                {language === 'ar' ? 'الإعدادات' : 'Settings'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </CardTitle>
            <CardDescription>
              {language === 'ar'
                ? 'معلوماتك الشخصية'
                : 'Your personal information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <Check className="w-4 h-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                {language === 'ar' ? 'الاسم' : 'Name'}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <Input
                value={user?.phone || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar'
                  ? 'لا يمكن تغيير رقم الهاتف'
                  : 'Phone number cannot be changed'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {language === 'ar' ? 'طريقة الدفع المفضلة' : 'Preferred Payment Method'}
            </CardTitle>
            <CardDescription>
              {language === 'ar'
                ? 'اختر طريقة الدفع الافتراضية'
                : 'Choose your default payment method'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : paymentMethods.length > 0 ? (
              <RadioGroup
                value={preferredPaymentId}
                onValueChange={setPreferredPaymentId}
                className="space-y-2"
              >
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <RadioGroupItem
                      value={method.id}
                      id={`payment-${method.id}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`payment-${method.id}`}
                      className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                    >
                      {getPaymentIcon(method.icon)}
                      <div className="flex-1">
                        <div className="font-medium">
                          {language === 'ar' ? method.name_ar : method.name}
                        </div>
                      </div>
                      {preferredPaymentId === method.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {language === 'ar'
                  ? 'لا توجد طرق دفع متاحة'
                  : 'No payment methods available'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </>
          )}
        </Button>

        <Separator />

        {/* Transaction History Link */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/history')}
        >
          <History className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}
        </Button>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
        </Button>
      </div>
    </div>
  );
}
