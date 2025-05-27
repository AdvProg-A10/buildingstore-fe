'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  ChevronLeftIcon, 
  CurrencyDollarIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { config } from '@/config';
import { Payment, PaymentInstallment } from '@/types/payment';

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [installments, setInstallments] = useState<PaymentInstallment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddInstallmentModal, setShowAddInstallmentModal] = useState(false);  const [newInstallmentAmount, setNewInstallmentAmount] = useState<number>(0);

  const fetchPaymentDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${paymentId}`);
      
      if (!response.ok) {
        throw new Error('Payment not found');
      }

      const result = await response.json();
      if (result.success) {
        setPayment(result.data);
        setInstallments(result.data.installments || []);
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

  const handleDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${paymentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      router.push('/manajemen-pembayaran');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
    }
  };

  const handleAddInstallment = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${paymentId}/installments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: newInstallmentAmount,
          payment_date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add installment');
      }

      const result = await response.json();
      if (result.success) {
        await fetchPaymentDetails(); // Refresh data
        setShowAddInstallmentModal(false);
        setNewInstallmentAmount(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add installment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      LUNAS: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      CICILAN: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.CICILAN;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };
  const getMethodIcon = () => {
    return <CreditCardIcon className="h-4 w-4" />;
  };

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

  const totalInstallments = installments.reduce((sum, inst) => sum + inst.amount, 0);
  const remainingAmount = payment.amount - totalInstallments;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Kembali
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Pembayaran</h1>
                <p className="text-sm text-gray-500">ID: {payment.transaction_id}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/manajemen-pembayaran/${paymentId}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Hapus
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Pembayaran</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">ID Transaksi</label>
                  <p className="mt-1 text-sm text-gray-900">{payment.transaction_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Jumlah Total</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Metode Pembayaran</label>                  <div className="mt-1 flex items-center">
                    {getMethodIcon()}
                    <span className="ml-2 text-sm text-gray-900">{payment.method}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tanggal Jatuh Tempo</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(payment.due_date)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Dibuat</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(payment.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Installments */}
            {payment.status === 'CICILAN' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Riwayat Cicilan</h2>
                  <button
                    onClick={() => setShowAddInstallmentModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    disabled={remainingAmount <= 0}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Tambah Cicilan
                  </button>
                </div>
                
                {/* Payment Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress Pembayaran</span>
                    <span>{formatCurrency(totalInstallments)} / {formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(totalInstallments / payment.amount) * 100}%` }}
                    ></div>
                  </div>
                  {remainingAmount > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Sisa: {formatCurrency(remainingAmount)}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {installments.length > 0 ? (
                    installments.map((installment, index) => (
                      <div key={installment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Cicilan #{index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(installment.payment_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(installment.amount)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Belum ada cicilan yang dibayar</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Pembayaran</span>
                  <span className="text-sm font-medium">{formatCurrency(payment.amount)}</span>
                </div>
                {payment.status === 'CICILAN' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Sudah Dibayar</span>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(totalInstallments)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Sisa</span>
                      <span className="text-sm font-medium text-red-600">{formatCurrency(remainingAmount)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Cicilan</span>
                      <span className="text-sm font-medium">{installments.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <TrashIcon className="mx-auto h-16 w-16 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">Hapus Pembayaran</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Apakah Anda yakin ingin menghapus pembayaran ini? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 px-4 py-2 bg-white text-gray-900 text-base font-medium rounded-md w-full shadow-sm border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Installment Modal */}
      {showAddInstallmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tambah Cicilan</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Cicilan
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    value={newInstallmentAmount}
                    onChange={(e) => setNewInstallmentAmount(parseFloat(e.target.value) || 0)}
                    max={remainingAmount}
                    min="0"
                    step="0.01"
                    className="block w-full pl-12 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal: {formatCurrency(remainingAmount)}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddInstallment}
                  disabled={newInstallmentAmount <= 0 || newInstallmentAmount > remainingAmount}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                >
                  Tambah
                </button>
                <button
                  onClick={() => {
                    setShowAddInstallmentModal(false);
                    setNewInstallmentAmount(0);
                  }}
                  className="flex-1 px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-md shadow-sm border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
