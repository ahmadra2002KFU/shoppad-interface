/**
 * QR Login Page
 * Displays QR code for cart tablet login via phone scan
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShoppingCart,
  Smartphone,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import type { QRLoginSession, QRLoginStatus } from '@/types/qr-login';

const POLL_INTERVAL = 2000; // Poll every 2 seconds

export default function QRLogin() {
  const navigate = useNavigate();
  const { loginWithQRToken, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const [session, setSession] = useState<QRLoginSession | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'expired' | 'authorized' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Create new QR session
  const createSession = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await api.createQRSession('smart-cart');

      if (response.success && response.data) {
        setSession(response.data);
        setStatus('ready');

        // Calculate time remaining
        const expiresAt = new Date(response.data.expiresAt).getTime();
        const now = Date.now();
        setTimeRemaining(Math.max(0, Math.floor((expiresAt - now) / 1000)));
      } else {
        setError(response.error || 'Failed to create QR session');
        setStatus('error');
      }
    } catch {
      setError('Failed to connect to server');
      setStatus('error');
    }
  }, []);

  // Poll for session status
  const pollStatus = useCallback(async () => {
    if (!session) return;

    try {
      const response = await api.getQRSessionStatus(session.sessionId, session.secret);

      if (response.success && response.data) {
        const statusData = response.data as QRLoginStatus;

        if (statusData.status === 'authorized' && statusData.token && statusData.user) {
          // Login successful!
          setStatus('authorized');

          // Clear polling
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }

          // Login with the received token
          loginWithQRToken(statusData.token, {
            id: statusData.user.id,
            name: statusData.user.name,
            phone: statusData.user.phone,
            preferredPaymentId: statusData.user.preferredPaymentId,
          });

          // Navigate to home after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else if (statusData.status === 'expired') {
          setStatus('expired');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        }
      }
    } catch {
      // Network error - continue polling
    }
  }, [session, loginWithQRToken, navigate]);

  // Initialize session on mount
  useEffect(() => {
    createSession();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [createSession]);

  // Start polling when session is ready
  useEffect(() => {
    if (status === 'ready' && session) {
      // Start polling
      pollIntervalRef.current = setInterval(pollStatus, POLL_INTERVAL);

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setStatus('expired');
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [status, session, pollStatus]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            {language === 'ar' ? 'تسجيل الدخول بـ QR' : 'Sign in with QR Code'}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'امسح الرمز بهاتفك لتسجيل الدخول'
              : 'Scan the code with your phone to sign in'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            {status === 'loading' && (
              <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
              </div>
            )}

            {status === 'ready' && session && (
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <QRCodeSVG
                  value={session.qrData}
                  size={240}
                  level="M"
                  includeMargin={false}
                />
              </div>
            )}

            {status === 'expired' && (
              <div className="w-64 h-64 flex flex-col items-center justify-center bg-muted rounded-lg gap-4">
                <XCircle className="w-16 h-16 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  {language === 'ar' ? 'انتهت صلاحية الرمز' : 'QR code expired'}
                </p>
                <Button onClick={createSession} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إنشاء رمز جديد' : 'Generate new code'}
                </Button>
              </div>
            )}

            {status === 'authorized' && (
              <div className="w-64 h-64 flex flex-col items-center justify-center bg-green-50 rounded-lg gap-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <p className="text-green-700 font-medium text-center">
                  {language === 'ar' ? 'تم التفويض بنجاح!' : 'Authorized!'}
                </p>
                <p className="text-green-600 text-sm text-center">
                  {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing you in...'}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="w-64 h-64 flex flex-col items-center justify-center bg-muted rounded-lg gap-4">
                <XCircle className="w-16 h-16 text-destructive" />
                <Alert variant="destructive" className="mx-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={createSession} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إعادة المحاولة' : 'Try again'}
                </Button>
              </div>
            )}
          </div>

          {/* Timer */}
          {status === 'ready' && timeRemaining > 0 && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {language === 'ar' ? 'ينتهي خلال: ' : 'Expires in: '}
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}

          {/* Instructions */}
          {status === 'ready' && (
            <div className="space-y-3 text-center">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  1
                </div>
                <span>
                  {language === 'ar'
                    ? 'افتح التطبيق على هاتفك'
                    : 'Open the app on your phone'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  2
                </div>
                <span>
                  {language === 'ar'
                    ? 'امسح رمز QR هذا'
                    : 'Scan this QR code'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  3
                </div>
                <span>
                  {language === 'ar'
                    ? 'اضغط على "تفويض" في هاتفك'
                    : 'Tap "Authorize" on your phone'}
                </span>
              </div>
            </div>
          )}

          {/* Alternative Login */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">
              {language === 'ar'
                ? 'أو سجل الدخول بالطريقة التقليدية'
                : 'Or sign in the traditional way'}
            </p>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'تسجيل الدخول بكلمة المرور' : 'Sign in with password'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
