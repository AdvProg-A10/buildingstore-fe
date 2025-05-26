// manajemen-pelanggan/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '@/config';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FaSearch, FaPlus, FaPen, FaTrash, FaFilter, FaSort, FaEye } from 'react-icons/fa';
import DeleteModal from '@/components/DeleteModal';

interface Customer {
    id: number;
    nama: string;
    no_telp: string;
    alamat: string;
    tanggal_gabung: string;
}

export default function CustomerManagementPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'nama' | 'tanggal_gabung' | ''>('');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
    const [dateFilterType, setDateFilterType] = useState<'before' | 'after'>('after');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    
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

    const fetchCustomers = useCallback(async () => {
        try {
            const baseUrl = `${config.apiBaseUrl}/api/pelanggan`;
            const queryParams = new URLSearchParams();

            if (sortField) {
                queryParams.append('sort', sortField);
            }
            
            if (searchTerm) {
                queryParams.append('filter', 'nama');
                queryParams.append('keyword', searchTerm);
            }
            
            if (dateFilter) {
                queryParams.append('filter', 'tanggal_gabung' + (dateFilterType === 'before' ? '_prev' : '_after'));
                queryParams.append('keyword', dateFilter);
            }

            const finalUrl = `${baseUrl}?${queryParams.toString()}`;
            const response = await fetch(finalUrl, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to fetch customers');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [sortField, searchTerm, dateFilter, dateFilterType]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleDelete = async (customer: Customer) => {
        setCustomerToDelete(customer);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!customerToDelete) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/pelanggan/${customerToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to delete customer');
            
            await fetchCustomers(); // Refresh the list after deletion
            setShowDeleteModal(false);
            setCustomerToDelete(null);
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    const clearFilters = () => {
        setDateFilter('');
        setDateFilterType('after');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Manajemen Pelanggan
                    </h1>
                    <p className="text-gray-600 mt-2">Kelola data pelanggan Anda</p>
                </div>
                <button
                    onClick={() => router.push('/manajemen-pelanggan/create')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg flex items-center gap-2 cursor-pointer"
                >
                    <FaPlus className="text-white" /> Tambah Pelanggan
                </button>
            </div>

            <div className="mb-8 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Cari pelanggan berdasarkan nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:border-gray-300 cursor-text"
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <div className="relative" ref={sortMenuRef}>
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
                                            setSortField('nama');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 cursor-pointer ${
                                            sortField === 'nama' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                                        }`}
                                    >
                                        Nama
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortField('tanggal_gabung');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 cursor-pointer ${
                                            sortField === 'tanggal_gabung' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                                        }`}
                                    >
                                        Tanggal Gabung
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

                    <div className="relative" ref={filterMenuRef}>
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`px-4 py-2 border-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm cursor-pointer ${
                                dateFilter
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                        >
                            <FaFilter className={dateFilter ? 'text-blue-500' : 'text-gray-400'} />
                            <span>Filter</span>
                        </button>
                        
                        {showFilterMenu && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-10 border border-gray-100">
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-gray-800">Filter Tanggal Gabung</h3>
                                        {dateFilter && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setDateFilterType('before')}
                                                className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                                    dateFilterType === 'before'
                                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                Sebelum
                                            </button>
                                            <button
                                                onClick={() => setDateFilterType('after')}
                                                className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                                    dateFilterType === 'after'
                                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                Setelah
                                            </button>
                                        </div>

                                        <div>
                                            <input
                                                type="date"
                                                value={dateFilter}
                                                onChange={(e) => setDateFilter(e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-all duration-200 cursor-pointer"
                                            />
                                        </div>
                                    </div>
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
            ) : customers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">Tidak ada pelanggan ditemukan</p>
                </div>
            ) : (                
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {customers.map(customer => (
                        <div
                            key={customer.id}
                            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-xl text-gray-900">{customer.nama}</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => router.push(`/manajemen-pelanggan/${customer.id}/edit`)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-full"
                                        title="Edit"
                                    >
                                        <FaPen />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer)}
                                        className="text-red-600 hover:text-red-800 transition-colors cursor-pointer p-2 hover:bg-red-50 rounded-full"
                                        title="Hapus"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-2">{customer.no_telp}</p>                                <p className="text-gray-500 text-sm mb-4">
                                Bergabung: {format(new Date(customer.tanggal_gabung), 'dd MMMM yyyy', { locale: id }).replace('.', '')}
                            </p>
                            <button
                                onClick={() => router.push(`/manajemen-pelanggan/${customer.id}`)}
                                className="w-full mt-2 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 transition-colors py-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Lihat Detail"
                            >
                                <FaEye /> <span>Lihat Detail</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showDeleteModal && customerToDelete && (
                <DeleteModal
                    title="Hapus Pelanggan"
                    message={`Apakah Anda yakin ingin menghapus pelanggan "${customerToDelete.nama}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setCustomerToDelete(null);
                    }}
                />
            )}
        </div>
    );
}