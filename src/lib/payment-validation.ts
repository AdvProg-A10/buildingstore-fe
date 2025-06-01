import { Payment, PaymentStatus } from '@/types/payment';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PaymentValidationInput {
  payment: Payment;
  newAmount: number;
  newStatus: PaymentStatus;
}

export function validatePaymentUpdate({ 
  payment, 
  newAmount, 
  newStatus 
}: PaymentValidationInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic amount validation
  if (newAmount <= 0) {
    errors.push('Jumlah pembayaran harus lebih dari 0');
  }

  // Installment-related validations
  if (payment.installments && payment.installments.length > 0) {
    const totalPaidInstallments = payment.installments.reduce(
      (sum, inst) => sum + inst.amount, 
      0
    );

    // Status-specific validations
    if (newStatus === 'LUNAS') {
      if (newAmount < totalPaidInstallments) {
        errors.push(
          `Jumlah pembayaran tidak boleh kurang dari total cicilan yang sudah dibayar (${formatCurrency(totalPaidInstallments)})`
        );
      }
      
      if (newAmount === totalPaidInstallments) {
        warnings.push('Jumlah pembayaran sama dengan total cicilan. Pastikan ini sudah benar.');
      }
    }

    if (newStatus === 'CICILAN' && newAmount < totalPaidInstallments) {
      errors.push(
        `Jumlah pembayaran tidak boleh kurang dari total cicilan yang sudah dibayar (${formatCurrency(totalPaidInstallments)})`
      );
    }

    // Warning for significant amount changes
    const amountDifference = Math.abs(newAmount - payment.amount);
    const percentageChange = (amountDifference / payment.amount) * 100;
    
    if (percentageChange > 10) {
      warnings.push(
        `Perubahan jumlah pembayaran signifikan (${percentageChange.toFixed(1)}%). Pastikan ini sudah benar.`
      );
    }
  }

  // Due date validations (if changing to LUNAS)
  if (newStatus === 'LUNAS') {
    const now = new Date();
    const dueDate = new Date(payment.due_date);
    
    if (dueDate > now) {
      warnings.push('Pembayaran akan ditandai lunas sebelum tanggal jatuh tempo.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function calculateInstallmentSummary(payment: Payment) {
  if (!payment.installments || payment.installments.length === 0) {
    return null;
  }

  const totalPaid = payment.installments.reduce((sum, inst) => sum + inst.amount, 0);
  const remaining = Math.max(0, payment.amount - totalPaid);
  const percentagePaid = (totalPaid / payment.amount) * 100;

  return {
    totalPaid,
    remaining,
    percentagePaid,
    installmentCount: payment.installments.length,
    averageInstallment: totalPaid / payment.installments.length
  };
}
