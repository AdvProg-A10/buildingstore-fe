'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { config } from '@/config';
import { Payment } from '@/types/payment';

type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
type PaymentStatus = 'LUNAS' | 'CICILAN';

interface UpdatePaymentForm {
  transaction_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  due_date: string;
}

export default function EditPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdatePaymentForm>({
    transaction_id: '',
    amount: 0,
    method: 'CASH',
    status: 'LUNAS',
    due_date: ''  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
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
        throw new Error('Failed to update payment');
      }

      const result = await response.json();
      
      if (result.success) {
        router.push(`/manajemen-pembayaran/${paymentId}`);
      } else {
        throw new Error(result.message || 'Failed to update payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

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
              </div>

              {/* Payment Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status Pembayaran *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {paymentStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>                {payment.installments && payment.installments.length > 0 && formData.status === 'LUNAS' && (
                  <p className="mt-2 text-sm text-yellow-600">
                    ⚠️ Mengubah status ke &quot;Lunas&quot; akan mempengaruhi cicilan yang ada.
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
            </div>

            {/* Payment Summary */}
            {payment.installments && payment.installments.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Ringkasan Cicilan</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Cicilan:</span>
                    <span>{payment.installments.length} pembayaran</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sudah Dibayar:</span>
                    <span>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(payment.installments.reduce((sum, inst) => sum + inst.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6">
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
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
