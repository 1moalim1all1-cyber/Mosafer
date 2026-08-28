export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  totalAddedBalance: number;
  totalSpentBalance: number;
  lastTransaction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  method: 'card' | 'bank_transfer' | 'booking' | 'refund' | 'admin';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface WalletRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  type: 'withdrawal' | 'deposit';
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
  };
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface WalletCoupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minTripPrice?: number;
  expiryDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}
