/**
 * Transaction History Page
 * Shows user's past transactions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  Loader2,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import type { Transaction } from '@/types/payment';

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/history' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      const response = await api.getTransactionHistory();
      if (response.success && response.data) {
        setTransactions(response.data);
      }
      setIsLoading(false);
    };

    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    };

    const labels: Record<string, { en: string; ar: string }> = {
      completed: { en: 'Completed', ar: 'مكتملة' },
      pending: { en: 'Pending', ar: 'معلقة' },
      failed: { en: 'Failed', ar: 'فشلت' },
      cancelled: { en: 'Cancelled', ar: 'ملغية' },
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {language === 'ar' ? labels[status]?.ar : labels[status]?.en}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${language === 'ar' ? 'ر.س' : 'SAR'}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  // Transaction detail view
  if (selectedTransaction) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTransaction(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                <h1 className="text-xl font-semibold">
                  {language === 'ar' ? 'تفاصيل المعاملة' : 'Transaction Details'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  #{selectedTransaction.id.slice(0, 8)}
                </CardTitle>
                {getStatusBadge(selectedTransaction.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedTransaction.created_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                </span>
                <span className="font-medium">
                  {language === 'ar'
                    ? selectedTransaction.payment_method_name_ar
                    : selectedTransaction.payment_method_name}
                </span>
              </div>

              <Separator />

              {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                <>
                  <div className="space-y-3">
                    <h3 className="font-medium">
                      {language === 'ar' ? 'المنتجات' : 'Items'}
                    </h3>
                    {selectedTransaction.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {language === 'ar'
                              ? item.product_name_ar || item.product_name
                              : item.product_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />
                </>
              )}

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{language === 'ar' ? 'المجموع' : 'Total'}</span>
                <span>{formatCurrency(selectedTransaction.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Transaction list view
  return (
    <div className="min-h-screen bg-background">
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
              <History className="w-5 h-5" />
              <h1 className="text-xl font-semibold">
                {language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">
              {language === 'ar' ? 'لا توجد معاملات' : 'No transactions yet'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'ar'
                ? 'ستظهر معاملاتك هنا بعد الشراء'
                : 'Your transactions will appear here after purchase'}
            </p>
            <Button onClick={() => navigate('/')}>
              {language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium">
                          {formatCurrency(transaction.total)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(transaction.status)}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
