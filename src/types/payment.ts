export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaymentInstallment {
  id: string;
  payment_id: string;
  amount: number;
  payment_date: string;
  created_at: string;
}

export interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_date: string;
  installments?: PaymentInstallment[];
  due_date: string;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
export type PaymentStatus = 'LUNAS' | 'CICILAN';

export interface CreatePaymentRequest {
  transaction_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  due_date?: string;
}

export interface UpdatePaymentStatusRequest {
  new_status: PaymentStatus;
  amount?: number;
}

export interface AddInstallmentRequest {
  amount: number;
  payment_date: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
  transaction_id?: string;
}
