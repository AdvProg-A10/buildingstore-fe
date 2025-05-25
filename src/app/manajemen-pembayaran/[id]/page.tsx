'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, CalendarIcon, CurrencyDollarIcon, CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon, BuildingLibraryIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { config } from '@/config';

interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  method: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
  status: 'LUNAS' | 'CICILAN';
  payment_date: string;
  due_date?: string;
  installments?: Installment[];
}

interface Installment {
  id: string;
  payment_id: string;
  amount: number;
  payment_date: string;
  status: 'PAID' | 'PENDING';
}

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddInstallment, setShowAddInstallment] = useState(false);
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [addingInstallment, setAddingInstallment] = useState(false);

  useEffect(() => {
    fetchPayment();
  }, [params.id]);

  const fetchPayment = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment');
      }
      const data = await response.json();
      setPayment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment || !installmentAmount) return;

    setAddingInstallment(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${payment.id}/installments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(installmentAmount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add installment');
      }

      // Refresh payment data
      await fetchPayment();
      setInstallmentAmount('');
      setShowAddInstallment(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add installment');
    } finally {
      setAddingInstallment(false);
    }
  };

  const updatePaymentStatus = async (newStatus: 'LUNAS' | 'CICILAN') => {
    if (!payment) return;

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payment,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      await fetchPayment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
    }
  };

  const getMethodIcon = (method: string) => {
    const iconClass = "h-6 w-6";
    switch (method) {
      case 'CASH':
        return <BanknotesIcon className={iconClass} />;
      case 'CREDIT_CARD':
        return <CreditCardIcon className={iconClass} />;
      case 'BANK_TRANSFER':
        return <BuildingLibraryIcon className={iconClass} />;
      case 'E_WALLET':
        return <DevicePhoneMobileIcon className={iconClass} />;
      default:
        return <CurrencyDollarIcon className={iconClass} />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Cash';
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'E_WALLET':
        return 'E-Wallet';
      default:
        return method;
    }
  };

  const getTotalPaid = () => {
    if (!payment?.installments) return 0;
    return payment.installments
      .filter(inst => inst.status === 'PAID')
      .reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getRemainingAmount = () => {
    if (!payment) return 0;
    return payment.amount - getTotalPaid();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Payment not found'}</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/manajemen-pembayaran')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Payments
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/manajemen-pembayaran/${payment.id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Edit Payment
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.transaction_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  Rp {payment.amount.toLocaleString('id-ID')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 flex items-center space-x-2">
                  {getMethodIcon(payment.method)}
                  <span className="text-sm text-gray-900">{getMethodName(payment.method)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    payment.status === 'LUNAS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'LUNAS' ? (
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ClockIcon className="h-3 w-3 mr-1" />
                    )}
                    {payment.status === 'LUNAS' ? 'Paid' : 'Installment'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(payment.payment_date).toLocaleDateString('id-ID')}
                </dd>
              </div>
              {payment.due_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(payment.due_date).toLocaleDateString('id-ID')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Installments Section */}
          {payment.status === 'CICILAN' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Installments</h2>
                <button
                  onClick={() => setShowAddInstallment(!showAddInstallment)}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add Installment
                </button>
              </div>

              {/* Add Installment Form */}
              {showAddInstallment && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <form onSubmit={handleAddInstallment}>
                    <div className="flex items-end space-x-4">
                      <div className="flex-1">
                        <label htmlFor="installment-amount" className="block text-sm font-medium text-gray-700 mb-1">
                          Installment Amount
                        </label>
                        <input
                          type="number"
                          id="installment-amount"
                          value={installmentAmount}
                          onChange={(e) => setInstallmentAmount(e.target.value)}
                          max={getRemainingAmount()}
                          min="1"
                          step="0.01"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter amount"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Remaining: Rp {getRemainingAmount().toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={addingInstallment}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {addingInstallment ? 'Adding...' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddInstallment(false)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Installments List */}
              {payment.installments && payment.installments.length > 0 ? (
                <div className="space-y-3">
                  {payment.installments.map((installment) => (
                    <div key={installment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          installment.status === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Rp {installment.amount.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(installment.payment_date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        installment.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {installment.status === 'PAID' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No installments recorded</p>
              )}
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-sm font-medium text-gray-900">
                  Rp {payment.amount.toLocaleString('id-ID')}
                </span>
              </div>
              {payment.status === 'CICILAN' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Paid</span>
                    <span className="text-sm font-medium text-green-600">
                      Rp {getTotalPaid().toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Remaining</span>
                    <span className="text-sm font-medium text-red-600">
                      Rp {getRemainingAmount().toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((getTotalPaid() / payment.amount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(getTotalPaid() / payment.amount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {payment.status === 'CICILAN' && getRemainingAmount() === 0 && (
                <button
                  onClick={() => updatePaymentStatus('LUNAS')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Mark as Paid
                </button>
              )}
              {payment.status === 'LUNAS' && (
                <button
                  onClick={() => updatePaymentStatus('CICILAN')}
                  className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                >
                  Convert to Installment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
