/**
 * Payment and Transaction Types
 */

export interface PaymentMethod {
  id: string;
  name: string;
  name_ar: string;
  icon: string;
  enabled: boolean;
  display_order: number;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface TransactionItem {
  id: string;
  product_id: string;
  product_name: string;
  product_name_ar?: string;
  quantity: number;
  unit_price: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  total: number;
  payment_method_id: string;
  payment_method_name: string;
  payment_method_name_ar?: string;
  status: TransactionStatus;
  nfc_uid?: string;
  created_at: string;
  completed_at?: string;
  items?: TransactionItem[];
}

export interface CheckoutRequest {
  paymentMethodId: string;
  nfcUid?: string;
}

export interface CheckoutResponse {
  transaction: Transaction;
  message?: string;
}
