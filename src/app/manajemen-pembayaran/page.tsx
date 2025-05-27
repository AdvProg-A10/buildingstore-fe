'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaMoneyBillWave, 
  FaSearch, 
  FaFilter,
  FaCreditCard,
  FaWallet,
  FaUniversity,
  FaMoneyBill,
  FaSpinner
} from 'react-icons/fa';
import { config } from '@/config';
import type { Payment, ApiResponse, PaymentFilters, PaymentMethod, PaymentStatus } from '@/types/payment';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaTrash className="text-red-500 mr-3 text-2xl" />
            {title}
          </h2>
        </div>
        <div className="text-gray-600 mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ManajemenPembayaranPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${config.apiBaseUrl}/api/payments`;
      
      // Add filters to URL
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.method) queryParams.append('method', filters.method);
      if (filters.transaction_id) queryParams.append('transaction_id', filters.transaction_id);
      if (searchTerm) queryParams.append('transaction_id', searchTerm);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }
      
      const apiResponse: ApiResponse<Payment[]> = await response.json();
      if (apiResponse.success && apiResponse.data) {
        setPayments(apiResponse.data);
      } else {
        console.error("API Error:", apiResponse.message);
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDelete = (payment: Payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/${paymentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      await fetchPayments();
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Terjadi kesalahan saat menghapus pembayaran");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return <FaMoneyBill className="text-green-600" />;
      case 'CREDIT_CARD':
        return <FaCreditCard className="text-blue-600" />;
      case 'BANK_TRANSFER':
        return <FaUniversity className="text-purple-600" />;
      case 'E_WALLET':
        return <FaWallet className="text-orange-600" />;
      default:
        return <FaMoneyBillWave className="text-gray-600" />;
    }
  };

  const getMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'CASH':
        return 'Tunai';
      case 'CREDIT_CARD':
        return 'Kartu Kredit';
      case 'BANK_TRANSFER':
        return 'Transfer Bank';
      case 'E_WALLET':
        return 'E-Wallet';
      default:
        return method;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'LUNAS':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Lunas
          </span>
        );
      case 'CICILAN':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Cicilan
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaMoneyBillWave className="mr-3 text-yellow-600" />
            Manajemen Pembayaran
          </h1>
          <p className="text-gray-600 mt-2">Kelola data pembayaran pelanggan</p>
        </div>
        <button
          onClick={() => router.push('/manajemen-pembayaran/create')}
          className="mt-4 md:mt-0 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <FaPlus /> Tambah Pembayaran
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan ID Transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FaFilter /> Filter
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as PaymentStatus || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="LUNAS">Lunas</option>
                  <option value="CICILAN">Cicilan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                <select
                  value={filters.method || ''}
                  onChange={(e) => setFilters({ ...filters, method: e.target.value as PaymentMethod || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Semua Metode</option>
                  <option value="CASH">Tunai</option>
                  <option value="CREDIT_CARD">Kartu Kredit</option>
                  <option value="BANK_TRANSFER">Transfer Bank</option>
                  <option value="E_WALLET">E-Wallet</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-yellow-600 mr-4" />
          <span className="text-lg text-gray-700">Memuat data pembayaran...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <FaMoneyBillWave className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-xl">Tidak ada pembayaran ditemukan</p>
          <button
            onClick={() => router.push('/manajemen-pembayaran/create')}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Tambah Pembayaran Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Pembayaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {payment.id.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {payment.transaction_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMethodIcon(payment.method)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getMethodLabel(payment.method)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.payment_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/manajemen-pembayaran/${payment.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Detail"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => router.push(`/manajemen-pembayaran/${payment.id}/edit`)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Hapus"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPaymentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
      >
        <p>
          Apakah Anda yakin ingin menghapus pembayaran dengan ID{' '}
          <strong>{paymentToDelete?.id}</strong>?
        </p>
        <p className="text-sm text-red-600 mt-2">
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </DeleteModal>
    </div>
  );
}
