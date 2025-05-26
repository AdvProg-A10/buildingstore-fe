'use client';

import { useState, useEffect, useCallback } from 'react';
import { config } from '@/config';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaPen, FaTrash, FaFilter, FaSort, FaEye } from 'react-icons/fa';

interface Transaksi {
    id: number;
    id_pelanggan: number;
    nama_pelanggan: string;
    tanggal_transaksi: string;
    total_harga: number;
    status: string;
    catatan?: string;
}

export default function TransaksiPage() {
    const router = useRouter();
    const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'tanggal_transaksi' | 'total_harga' | 'nama_pelanggan' | ''>('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const fetchTransaksi = useCallback(async () => {
        try {
            setLoading(true);
            const baseUrl = `${config.apiBaseUrl}/api/transaksi`;
            const queryParams = new URLSearchParams();

            if (sortField) {
                queryParams.append('sort', sortField);
            }
            
            if (searchTerm) {
                queryParams.append('filter', 'nama_pelanggan');
                queryParams.append('keyword', searchTerm);
            }

            if (statusFilter) {
                queryParams.append('status', statusFilter);
            }

            const finalUrl = `${baseUrl}?${queryParams.toString()}`;
            const response = await fetch(finalUrl, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to fetch transaksi');
            
            const data = await response.json();
            console.log('📊 Received transaksi data:', data);
            setTransaksi(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
            setTransaksi([]);
        } finally {
            setLoading(false);
        }
    }, [sortField, searchTerm, statusFilter]);

    useEffect(() => {
        fetchTransaksi();
    }, [fetchTransaksi]);

    const handleDelete = async (transaksi: Transaksi) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus transaksi #${transaksi.id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${transaksi.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to delete transaksi');
            
            await fetchTransaksi();
        } catch (error) {
            console.error('Error deleting transaksi:', error);
            alert('Gagal menghapus transaksi');
        }
    };

    const handleStatusChange = async (transaksi: Transaksi, action: 'complete' | 'cancel') => {
        try {
            const endpoint = action === 'complete' ? 'complete' : 'cancel';
            const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${transaksi.id}/${endpoint}`, {
                method: 'PUT',
                credentials: 'include',
            });

            if (!response.ok) throw new Error(`Failed to ${action} transaksi`);
            
            await fetchTransaksi();
            alert(`Transaksi berhasil ${action === 'complete' ? 'diselesaikan' : 'dibatalkan'}`);
        } catch (error) {
            console.error(`Error ${action} transaksi:`, error);
            alert(`Gagal ${action === 'complete' ? 'menyelesaikan' : 'membatalkan'} transaksi`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'SELESAI': return 'bg-green-100 text-green-800';
            case 'DIBATALKAN': return 'bg-red-100 text-red-800';
            case 'MASIH_DIPROSES': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'SELESAI': return 'Selesai';
            case 'DIBATALKAN': return 'Dibatalkan';
            case 'MASIH_DIPROSES': return 'Masih Diproses';
            default: return status;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Manajemen Transaksi
                    </h1>
                    <p className="text-gray-600 mt-2">Kelola transaksi penjualan Anda</p>
                </div>
                <button
                    onClick={() => router.push('/transaksi/create')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg flex items-center gap-2 cursor-pointer"
                >
                    <FaPlus className="text-white" /> Transaksi Baru
                </button>
            </div>

            <div className="mb-8 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Cari transaksi berdasarkan nama pelanggan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:border-gray-300 cursor-text"
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className={`px-4 py-2 border-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm cursor-pointer ${
                                sortField
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                        >
                            <FaSort className={sortField ? 'text-blue-500' : 'text-gray-400'} />
                            <span>Urutkan</span>
                        </button>
                        
                        {showSortMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-100">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setSortField('tanggal_transaksi');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 cursor-pointer ${
                                            sortField === 'tanggal_transaksi' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                                        }`}
                                    >
                                        Tanggal Transaksi
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortField('total_harga');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 cursor-pointer ${
                                            sortField === 'total_harga' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                                        }`}
                                    >
                                        Total Harga
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortField('nama_pelanggan');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 cursor-pointer ${
                                            sortField === 'nama_pelanggan' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                                        }`}
                                    >
                                        Nama Pelanggan
                                    </button>
                                    {sortField && (
                                        <button
                                            onClick={() => {
                                                setSortField('');
                                                setShowSortMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`px-4 py-2 border-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm cursor-pointer ${
                                statusFilter
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                        >
                            <FaFilter className={statusFilter ? 'text-blue-500' : 'text-gray-400'} />
                            <span>Filter Status</span>
                        </button>
                        
                        {showFilterMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-100">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setStatusFilter('MASIH_DIPROSES');
                                            setShowFilterMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 cursor-pointer ${
                                            statusFilter === 'MASIH_DIPROSES' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                                        }`}
                                    >
                                        Masih Diproses
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStatusFilter('SELESAI');
                                            setShowFilterMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 cursor-pointer ${
                                            statusFilter === 'SELESAI' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                                        }`}
                                    >
                                        Selesai
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStatusFilter('DIBATALKAN');
                                            setShowFilterMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 cursor-pointer ${
                                            statusFilter === 'DIBATALKAN' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                                        }`}
                                    >
                                        Dibatalkan
                                    </button>
                                    {statusFilter && (
                                        <button
                                            onClick={() => {
                                                setStatusFilter('');
                                                setShowFilterMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : transaksi.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">Tidak ada transaksi ditemukan</p>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {transaksi.map(item => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-xl text-gray-900">#{item.id}</h3>
                                    <p className="text-gray-600">{item.nama_pelanggan}</p>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
                                    {getStatusText(item.status)}
                                </span>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-2xl font-bold text-green-600 mb-2">
                                    {formatCurrency(item.total_harga)}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {formatDate(item.tanggal_transaksi)}
                                </p>
                                {item.catatan && (
                                    <p className="text-gray-500 text-sm mt-1 italic">
                                        &ldquo;{item.catatan}&rdquo;
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => router.push(`/transaksi/${item.id}`)}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors py-2 hover:bg-blue-50 rounded-lg px-3 cursor-pointer"
                                >
                                    <FaEye /> <span>Detail</span>
                                </button>

                                <div className="flex gap-2">
                                    {item.status === 'MASIH_DIPROSES' && (
                                        <>
                                            <button
                                                onClick={() => router.push(`/transaksi/${item.id}/edit`)}
                                                className="text-yellow-600 hover:text-yellow-800 transition-colors cursor-pointer p-2 hover:bg-yellow-50 rounded-full"
                                                title="Edit"
                                            >
                                                <FaPen />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(item, 'complete')}
                                                className="text-green-600 hover:text-green-800 transition-colors cursor-pointer p-2 hover:bg-green-50 rounded-full text-xs"
                                                title="Selesaikan"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(item, 'cancel')}
                                                className="text-orange-600 hover:text-orange-800 transition-colors cursor-pointer p-2 hover:bg-orange-50 rounded-full text-xs"
                                                title="Batalkan"
                                            >
                                                ✗
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="text-red-600 hover:text-red-800 transition-colors cursor-pointer p-2 hover:bg-red-50 rounded-full"
                                        title="Hapus"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}