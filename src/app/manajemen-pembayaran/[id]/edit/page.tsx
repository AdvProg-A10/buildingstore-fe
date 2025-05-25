'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, CurrencyDollarIcon, CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { config } from '@/config';

interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  method: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
  status: 'LUNAS' | 'CICILAN';
  payment_date: string;
  due_date?: string;
}

export default function EditPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
    transaction_id: '',
    amount: '',
    method: 'CASH' as 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET',
    status: 'LUNAS' as 'LUNAS' | 'CICILAN',
    payment_date: '',
    due_date: '',
  });

  useEffect(() => {
    fetchPayment();
  }, [params.id]);

  const fetchPayment = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment');
      }
      const payment: Payment = await response.json();
      
      setFormData({
        transaction_id: payment.transaction_id,
        amount: payment.amount.toString(),
        method: payment.method,
        status: payment.status,
        payment_date: payment.payment_date.split('T')[0], // Format for date input
        due_date: payment.due_date ? payment.due_date.split('T')[0] : '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        transaction_id: formData.transaction_id,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        payment_date: formData.payment_date,
        due_date: formData.status === 'CICILAN' && formData.due_date ? formData.due_date : undefined,
      };

      const response = await fetch(`${config.apiBaseUrl}/api/payments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment');
      }

      router.push(`/manajemen-pembayaran/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value as any,
    }));

    // Clear due_date when status changes to LUNAS
    if (name === 'status' && value === 'LUNAS') {
      setFormData(prev => ({
        ...prev,
        [name]: value as any,
        due_date: '',
      }));
    }
  };

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: BanknotesIcon },
    { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCardIcon },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: BuildingLibraryIcon },
    { value: 'E_WALLET', label: 'E-Wallet', icon: DevicePhoneMobileIcon },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !formData.transaction_id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/manajemen-pembayaran')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/manajemen-pembayaran/${params.id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Payment Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Payment</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Transaction ID */}
            <div>
              <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700">
                Transaction ID
              </label>
              <input
                type="text"
                name="transaction_id"
                id="transaction_id"
                value={formData.transaction_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="block w-full pl-12 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
                Payment Date
              </label>
              <input
                type="date"
                name="payment_date"
                id="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="LUNAS">Lunas (Paid)</option>
                <option value="CICILAN">Cicilan (Installment)</option>
              </select>
            </div>
          </div>

          {/* Due Date (conditional) */}
          {formData.status === 'CICILAN' && (
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                id="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                min={formData.payment_date}
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Set a due date for the installment payment
              </p>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <label
                    key={method.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.method === method.value
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={method.value}
                      checked={formData.method === method.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {method.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => router.push(`/manajemen-pembayaran/${params.id}`)}
              className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
