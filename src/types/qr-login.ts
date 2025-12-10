/**
 * QR Login Types
 * Types for QR code-based authentication
 */

export interface QRLoginSession {
  sessionId: string;
  secret: string;
  expiresAt: string;
  qrData: string;
}

export interface QRLoginStatus {
  status: 'pending' | 'authorized' | 'expired' | 'used';
  token?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    preferredPaymentId?: string;
  };
  expiresAt?: string;
  message?: string;
}

export interface QRSessionInfo {
  sessionId: string;
  status: string;
  deviceInfo?: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthorizeResponse {
  status: string;
  message: string;
  sessionId: string;
  user?: {
    name: string;
    phone: string;
  };
}
