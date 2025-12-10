/**
 * Authorize Cart Page
 * Phone confirmation screen for QR code login
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  User,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import type { QRSessionInfo } from '@/types/qr-login';

type PageStatus = 'loading' | 'ready' | 'authorizing' | 'success' | 'error' | 'expired' | 'not-authenticated';

export default function AuthorizeCart() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();

  const [sessionInfo, setSessionInfo] = useState<QRSessionInfo | null>(null);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session');

  // Check authentication and load session info
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      setStatus('not-authenticated');
      return;
    }

    // Check if session ID exists
    if (!sessionId) {
      setError(language === 'ar' ? 'معرف الجلسة مفقود' : 'Session ID is missing');
      setStatus('error');
      return;
    }

    // Load session info
    const loadSessionInfo = async () => {
      try {
        const response = await api.getQRSessionInfo(sessionId);

        if (response.success && response.data) {
          const info = response.data as QRSessionInfo;

          if (info.status === 'expired') {
            setStatus('expired');
          } else if (info.status !== 'pending') {
            setError(
              language === 'ar'
                ? `الجلسة ${info.status === 'authorized' ? 'مفوضة' : info.status === 'used' ? 'مستخدمة' : 'غير صالحة'} بالفعل`
                : `Session is already ${info.status}`
            );
            setStatus('error');
          } else {
            setSessionInfo(info);
            setStatus('ready');
          }
        } else {
          setError(response.error || (language === 'ar' ? 'فشل تحميل معلومات الجلسة' : 'Failed to load session info'));
          setStatus('error');
        }
      } catch {
        setError(language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to server');
        setStatus('error');
      }
    };

    loadSessionInfo();
  }, [sessionId, isAuthenticated, authLoading, language]);

  // Handle authorization
  const handleAuthorize = async () => {
    if (!sessionId) return;

    setStatus('authorizing');

    try {
      const response = await api.authorizeQRSession(sessionId);

      if (response.success) {
        setStatus('success');
      } else {
        setError(response.error || (language === 'ar' ? 'فشل التفويض' : 'Authorization failed'));
        setStatus('error');
      }
    } catch {
      setError(language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to server');
      setStatus('error');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };

  // Not authenticated - redirect to login
  if (status === 'not-authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <User className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-xl">
              {language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}
            </CardTitle>
            <CardDescription>
              {language === 'ar'
                ? 'يجب تسجيل الدخول لتفويض العربة'
                : 'You need to be logged in to authorize the cart'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              to={`/login?redirect=${encodeURIComponent(`/authorize-cart?session=${sessionId}`)}`}
            >
              <Button className="w-full">
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
              <CardTitle>
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </CardTitle>
            </>
          )}

          {/* Ready State */}
          {status === 'ready' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">
                {language === 'ar' ? 'تفويض العربة' : 'Authorize Cart'}
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'هل تريد تسجيل الدخول إلى هذه العربة؟'
                  : 'Do you want to sign in to this cart?'}
              </CardDescription>
            </>
          )}

          {/* Authorizing State */}
          {status === 'authorizing' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
              <CardTitle>
                {language === 'ar' ? 'جاري التفويض...' : 'Authorizing...'}
              </CardTitle>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-green-700">
                {language === 'ar' ? 'تم التفويض بنجاح!' : 'Authorized!'}
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'تم تسجيل الدخول إلى العربة بنجاح'
                  : 'The cart has been signed into your account'}
              </CardDescription>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-red-700">
                {language === 'ar' ? 'حدث خطأ' : 'Error'}
              </CardTitle>
            </>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <XCircle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <CardTitle className="text-xl">
                {language === 'ar' ? 'انتهت صلاحية الجلسة' : 'Session Expired'}
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'انتهت صلاحية رمز QR. يرجى إنشاء رمز جديد على العربة.'
                  : 'The QR code has expired. Please generate a new one on the cart.'}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Ready - Show user info and actions */}
          {status === 'ready' && user && (
            <>
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-full">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">{user.phone}</p>
                  </div>
                </div>

                {sessionInfo?.deviceInfo && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-full">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'الجهاز:' : 'Device:'}
                      </p>
                      <p className="font-medium">{sessionInfo.deviceInfo}</p>
                    </div>
                  </div>
                )}
              </div>

              <Alert>
                <AlertDescription>
                  {language === 'ar'
                    ? 'سيتم تسجيل دخولك إلى هذه العربة الذكية. ستتمكن من التسوق وإتمام عملية الشراء.'
                    : 'You will be signed into this smart cart. You can then shop and complete purchases.'}
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Error message */}
          {status === 'error' && error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {/* Ready - Show authorize/cancel buttons */}
          {status === 'ready' && (
            <>
              <Button className="w-full" onClick={handleAuthorize}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'تفويض' : 'Authorize'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleCancel}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </>
          )}

          {/* Success - Show done button */}
          {status === 'success' && (
            <Button className="w-full" onClick={() => navigate('/')}>
              {language === 'ar' ? 'تم' : 'Done'}
            </Button>
          )}

          {/* Error/Expired - Show back button */}
          {(status === 'error' || status === 'expired') && (
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'العودة' : 'Go Back'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
