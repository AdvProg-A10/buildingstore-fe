'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '@/config';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FaSearch, FaPlus, FaPen, FaTrash, FaFilter, FaSort, FaEye, FaMoneyBillWave, FaCreditCard, FaUniversity, FaMobile } from 'react-icons/fa';
import DeleteModal from '@/components/DeleteModal';

interface Installment {
    id: string;
    payment_id: string;
    amount: number;
    payment_date: string;
}

interface Payment {
    id: string;
    transaction_id: string;
    amount: number;
    method: string;
    status: string;
    payment_date: string;
    installments: Installment[];
    due_date?: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export default function PaymentManagementPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'payment_date' | 'amount' | ''>('');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [methodFilter, setMethodFilter] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
    
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setShowSortMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            
            if (statusFilter) queryParams.append('status', statusFilter);
            if (methodFilter) queryParams.append('method', methodFilter);
            
            const url = `${config.apiBaseUrl}/api/payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (response.ok) {
                const result: ApiResponse<Payment[]> = await response.json();
                if (result.success && result.data) {
                    setPayments(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, methodFilter]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const filteredAndSortedPayments = payments
        .filter(payment =>
            payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.amount.toString().includes(searchTerm)
        )
        .sort((a, b) => {
            if (!sortField) return 0;
            
            if (sortField === 'payment_date') {
                return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
            } else if (sortField === 'amount') {
                return b.amount - a.amount;
            }
            return 0;
        });

    const handleDeletePayment = async (payment: Payment) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/payments/${payment.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setPayments(payments.filter(p => p.id !== payment.id));
                setShowDeleteModal(false);
                setPaymentToDelete(null);
            } else {
                console.error('Failed to delete payment');
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH':
                return <FaMoneyBillWave className="text-green-600" />;
            case 'CREDIT_CARD':
                return <FaCreditCard className="text-blue-600" />;
            case 'BANK_TRANSFER':
                return <FaUniversity className="text-purple-600" />;
            case 'E_WALLET':
                return <FaMobile className="text-orange-600" />;
            default:
                return <FaMoneyBillWave className="text-gray-600" />;
        }
    };

    const getPaymentMethodText = (method: string) => {
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'LUNAS':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Lunas
                    </span>
                );
            case 'CICILAN':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Cicilan
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const getTotalPaid = (payment: Payment) => {
        return payment.installments.reduce((total, installment) => total + installment.amount, 0);
    };

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">💸 Manajemen Pembayaran</h1>
                <button
                    onClick={() => router.push('/manajemen-pembayaran/create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <FaPlus /> Tambah Pembayaran
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan ID transaksi, ID pembayaran, atau jumlah..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                    />
                </div>

                {/* Filter Menu */}
                <div className="relative" ref={filterMenuRef}>
                    <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <FaFilter className="text-gray-500" />
                        Filter
                        {(statusFilter || methodFilter) && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </button>

                    {showFilterMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="LUNAS">Lunas</option>
                                        <option value="CICILAN">Cicilan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                                    <select
                                        value={methodFilter}
                                        onChange={(e) => setMethodFilter(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Metode</option>
                                        <option value="CASH">Tunai</option>
                                        <option value="CREDIT_CARD">Kartu Kredit</option>
                                        <option value="BANK_TRANSFER">Transfer Bank</option>
                                        <option value="E_WALLET">E-Wallet</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => {
                                        setStatusFilter('');
                                        setMethodFilter('');
                                        setShowFilterMenu(false);
                                    }}
                                    className="w-full text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sort Menu */}
                <div className="relative" ref={sortMenuRef}>
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <FaSort className="text-gray-500" />
                        Urutkan
                        {sortField && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </button>

                    {showSortMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="py-2">
                                <button
                                    onClick={() => {
                                        setSortField('payment_date');
                                        setShowSortMenu(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                                        sortField === 'payment_date' ? 'bg-blue-50 text-blue-600' : ''
                                    }`}
                                >
                                    Tanggal Pembayaran
                                </button>
                                <button
                                    onClick={() => {
                                        setSortField('amount');
                                        setShowSortMenu(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                                        sortField === 'amount' ? 'bg-blue-50 text-blue-600' : ''
                                    }`}
                                >
                                    Jumlah
                                </button>
                                <button
                                    onClick={() => {
                                        setSortField('');
                                        setShowSortMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-600"
                                >
                                    Default
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {filteredAndSortedPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Tidak ada pembayaran ditemukan</p>
                        </div>
                    ) : (
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
                                    {filteredAndSortedPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {payment.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.transaction_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>
                                                    <div className="font-medium">
                                                        Rp {payment.amount.toLocaleString('id-ID')}
                                                    </div>
                                                    {payment.status === 'CICILAN' && payment.installments.length > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            Dibayar: Rp {getTotalPaid(payment).toLocaleString('id-ID')}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    {getPaymentMethodIcon(payment.method)}
                                                    {getPaymentMethodText(payment.method)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {format(new Date(payment.payment_date), 'dd MMM yyyy HH:mm', { locale: id })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/manajemen-pembayaran/${payment.id}`)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                                        title="Lihat Detail"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/manajemen-pembayaran/${payment.id}/edit`)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                        title="Edit"
                                                    >
                                                        <FaPen />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setPaymentToDelete(payment);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
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
                    )}
                </div>
            )}            {/* Delete Modal */}
            {showDeleteModal && paymentToDelete && (
                <DeleteModal
                    title="Hapus Pembayaran"
                    message={`Apakah Anda yakin ingin menghapus pembayaran ${paymentToDelete.id}?`}
                    onConfirm={() => handleDeletePayment(paymentToDelete)}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setPaymentToDelete(null);
                    }}
                />
            )}
        </div>
    );
}