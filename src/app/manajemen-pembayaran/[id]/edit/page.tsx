'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { config } from '@/config';
import { Payment } from '@/types/payment';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';
import ValidationDisplay, { InstallmentSummaryCard } from '@/components/ui/ValidationDisplay';
import { validatePaymentUpdate, calculateInstallmentSummary, formatCurrency } from '@/lib/payment-validation';

type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
type PaymentStatus = 'LUNAS' | 'CICILAN';

interface UpdatePaymentForm {
  transaction_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  due_date: string;
}

function EditPaymentForm() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;
  const { showToast } = useToast();
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);  const [error, setError] = useState<string | null>(null);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<PaymentStatus | null>(null);
  const [validationResult, setValidationResult] = useState<{ errors: string[]; warnings: string[] }>({ errors: [], warnings: [] });
  const [formData, setFormData] = useState<UpdatePaymentForm>({
    transaction_id: '',
    amount: 0,
    method: 'CASH',
    status: 'LUNAS',
    due_date: ''
  });

  const fetchPaymentDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${paymentId}`);
      
      if (!response.ok) {
        throw new Error('Payment not found');
      }

      const result = await response.json();
      if (result.success) {
        const paymentData = result.data;
        setPayment(paymentData);
        
        // Convert due_date to datetime-local format
        const dueDate = new Date(paymentData.due_date);
        const localDateTime = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);

        setFormData({
          transaction_id: paymentData.transaction_id,
          amount: paymentData.amount,
          method: paymentData.method,
          status: paymentData.status,
          due_date: localDateTime
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment details');
    } finally {
      setIsLoading(false);
    }
  }, [paymentId]);
  useEffect(() => {
    fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  // Real-time validation
  useEffect(() => {
    if (payment && formData.amount > 0) {
      const validation = validatePaymentUpdate({
        payment,
        newAmount: formData.amount,
        newStatus: formData.status
      });
      
      setValidationResult({
        errors: validation.errors,
        warnings: validation.warnings
      });
    }
  }, [payment, formData.amount, formData.status]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for status change
    if (name === 'status' && payment) {
      const newStatus = value as PaymentStatus;
      const currentStatus = formData.status;
      
      // Show confirmation modal when changing from CICILAN to LUNAS with existing installments
      if (currentStatus === 'CICILAN' && newStatus === 'LUNAS' && 
          payment.installments && payment.installments.length > 0) {
        setPendingStatusChange(newStatus);
        setShowStatusChangeModal(true);
        return;
      }
        // Auto-adjust amount when changing to LUNAS
      if (newStatus === 'LUNAS' && payment.installments && payment.installments.length > 0) {
        const totalPaidInstallments = payment.installments.reduce((sum, inst) => sum + inst.amount, 0);
        setFormData(prev => ({
          ...prev,
          status: newStatus,
          amount: Math.max(prev.amount, totalPaidInstallments)
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };  const handleStatusChangeConfirm = () => {
    if (pendingStatusChange) {
      setFormData(prev => ({ ...prev, status: pendingStatusChange }));
      
      // Auto-adjust amount when confirming LUNAS status
      if (pendingStatusChange === 'LUNAS' && payment?.installments) {
        const totalPaidInstallments = payment.installments.reduce((sum, inst) => sum + inst.amount, 0);
        setFormData(prev => ({
          ...prev,
          status: pendingStatusChange,
          amount: Math.max(prev.amount, totalPaidInstallments)
        }));
      }
      
      showToast(
        'info',
        'Status Pembayaran Diubah',
        `Status pembayaran telah diubah ke ${pendingStatusChange}`,
        4000
      );
    }
    setShowStatusChangeModal(false);
    setPendingStatusChange(null);
  };

  const handleStatusChangeCancel = () => {
    setShowStatusChangeModal(false);
    setPendingStatusChange(null);
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Final validation before submission
      if (payment) {
        const validation = validatePaymentUpdate({
          payment,
          newAmount: formData.amount,
          newStatus: formData.status
        });
        
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        
        // Show warnings if any
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(warning => {
            showToast('warning', 'Perhatian', warning, 5000);
          });
        }
      }

      // Format due_date to ISO string
      const submitData = {
        ...formData,
        due_date: new Date(formData.due_date).toISOString()
      };

      const response = await fetch(`${config.apiBaseUrl}/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment');
      }

      const result = await response.json();
        if (result.success) {
        // Show success message based on status change
        if (formData.status === 'LUNAS' && payment?.status === 'CICILAN') {
          showToast(
            'success', 
            'Status Pembayaran Berhasil Diubah',
            'Pembayaran telah berhasil diubah menjadi LUNAS',
            6000
          );
        } else {
          showToast(
            'success',
            'Pembayaran Berhasil Diperbarui',
            'Data pembayaran telah berhasil disimpan',
            4000
          );
        }
        router.push(`/manajemen-pembayaran/${paymentId}`);
      } else {
        throw new Error(result.message || 'Failed to update payment');
      }    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showToast('error', 'Gagal Memperbarui Pembayaran', errorMessage, 6000);
    } finally {
      setIsSaving(false);
    }
  };

  const paymentMethods = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'E_WALLET', label: 'E-Wallet' }
  ];

  const paymentStatuses = [
    { value: 'LUNAS', label: 'Lunas' },
    { value: 'CICILAN', label: 'Cicilan' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/manajemen-pembayaran')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Kembali ke Daftar Pembayaran
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Kembali
          </button>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Pembayaran</h1>
              <p className="text-sm text-gray-500">ID: {payment.transaction_id}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Real-time Validation Display */}
            <ValidationDisplay 
              errors={validationResult.errors} 
              warnings={validationResult.warnings}
              className="mb-4"
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Transaction ID */}
              <div className="sm:col-span-2">
                <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700">
                  ID Transaksi *
                </label>
                <input
                  type="text"
                  name="transaction_id"
                  id="transaction_id"
                  required
                  value={formData.transaction_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Masukkan ID transaksi"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Jumlah Pembayaran *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="block w-full pl-12 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                {payment.installments && payment.installments.length > 0 && (
                  <p className="mt-2 text-sm text-yellow-600">
                    ⚠️ Perhatian: Pembayaran ini memiliki cicilan. Mengubah jumlah dapat mempengaruhi cicilan yang ada.
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="method" className="block text-sm font-medium text-gray-700">
                  Metode Pembayaran *
                </label>
                <select
                  id="method"
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>              {/* Payment Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status Pembayaran *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    formData.status === 'LUNAS' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                  }`}
                >
                  {paymentStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                
                {/* Status indicators */}
                <div className="mt-2 flex items-center space-x-2">
                  {formData.status === 'LUNAS' ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Pembayaran Selesai</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Pembayaran Cicilan</span>
                    </div>
                  )}
                </div>

                {payment?.installments && payment.installments.length > 0 && formData.status === 'LUNAS' && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                      <div className="text-sm">
                        <p className="text-green-800 font-medium mb-1">
                          Status akan diubah ke LUNAS
                        </p>
                        <p className="text-green-700 text-xs">
                          Semua cicilan yang ada akan tetap tercatat sebagai riwayat pembayaran.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {payment?.installments && payment.installments.length > 0 && formData.status === 'CICILAN' && (
                  <p className="mt-2 text-sm text-yellow-600">
                    💡 Pembayaran ini memiliki {payment.installments.length} cicilan aktif.
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Tanggal Jatuh Tempo *
                </label>
                <input
                  type="datetime-local"
                  name="due_date"
                  id="due_date"
                  required
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>            {/* Payment Summary with Enhanced Installment Analysis */}
            {payment.installments && payment.installments.length > 0 && (
              <div className="space-y-4">
                {(() => {
                  const summary = calculateInstallmentSummary(payment);
                  return summary ? (
                    <InstallmentSummaryCard
                      totalPaid={summary.totalPaid}
                      remaining={summary.remaining}
                      percentagePaid={summary.percentagePaid}
                      installmentCount={summary.installmentCount}
                      averageInstallment={summary.averageInstallment}
                    />
                  ) : null;
                })()}
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Ringkasan Pembayaran</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Cicilan:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {payment.installments.length} pembayaran
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sudah Dibayar:</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(payment.installments.reduce((sum, inst) => sum + inst.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Pembayaran:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(formData.amount)}
                      </span>
                    </div>
                    {formData.status === 'LUNAS' && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Status: Pembayaran akan diselesaikan
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}            {/* Status Change Summary for payments without installments */}
            {(!payment.installments || payment.installments.length === 0) && formData.status === 'LUNAS' && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800 mb-1">
                      Pembayaran akan diselesaikan
                    </h3>
                    <p className="text-sm text-green-700">
                      Status pembayaran akan diubah menjadi LUNAS dengan total pembayaran{' '}
                      <span className="font-medium">
                        {formatCurrency(formData.amount)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}{/* Actions */}
            <div className="flex justify-between items-center pt-6">
              <div className="flex space-x-3">
                {formData.status === 'CICILAN' && (
                  <button
                    type="button"
                    onClick={() => {
                      const newStatus: PaymentStatus = 'LUNAS';
                      if (payment?.installments && payment.installments.length > 0) {
                        setPendingStatusChange(newStatus);
                        setShowStatusChangeModal(true);
                      } else {
                        setFormData(prev => ({ ...prev, status: newStatus }));
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Tandai Lunas
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Status Change Confirmation Modal */}
        {showStatusChangeModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Konfirmasi Perubahan Status
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 mb-4">
                    Anda akan mengubah status pembayaran menjadi <strong>&quot;LUNAS&quot;</strong>.
                  </p>
                  {payment?.installments && payment.installments.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Perhatian:</strong> Pembayaran ini memiliki {payment.installments.length} cicilan.
                      </p>
                      <div className="text-xs text-yellow-700 space-y-1">                        <div className="flex justify-between">
                          <span>Total yang sudah dibayar:</span>
                          <span className="font-medium">
                            {formatCurrency(payment.installments.reduce((sum, inst) => sum + inst.amount, 0))}
                          </span>
                        </div>
                        <div className="text-yellow-600 text-xs mt-2">
                          Mengubah ke status LUNAS akan menandai pembayaran sebagai selesai.
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Apakah Anda yakin ingin melanjutkan?
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleStatusChangeConfirm}
                    className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 mb-2"
                  >
                    Ya, Ubah ke LUNAS
                  </button>
                  <button
                    onClick={handleStatusChangeCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}      </div>
    </div>
  );
}

export default function EditPaymentPage() {
  return (
    <ToastProvider>
      <EditPaymentForm />
    </ToastProvider>
  );
}
