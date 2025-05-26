// app/manajemen-supplier/transaksi-supplier/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { 
    FaTruckLoading, FaBoxOpen, FaCalendarAlt, FaUserCog, 
    FaBarcode, FaListAlt, FaArrowLeft, FaHistory, FaUserTag 
} from 'react-icons/fa';

interface SupplierTransaction {
  id: string; 
  supplier_id: string;
  supplier_name: string;
  jenis_barang: string;
  jumlah_barang: number;
  pengiriman_info: string;
  tanggal_transaksi: string; 
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
};

export default function HistorySupplierTransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchAllTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const baseUrl = `${config.apiBaseUrl}/api/supplier-transactions`; 
            const response = await fetch(baseUrl);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to fetch supplier transactions: ${response.status} ${errorData}`);
            }
            
            const apiResponse: ApiResponse<SupplierTransaction[]> = await response.json();
            if (apiResponse.success && apiResponse.data) {
                const sortedData = apiResponse.data.sort((a, b) => 
                    new Date(b.tanggal_transaksi).getTime() - new Date(a.tanggal_transaksi).getTime()
                );
                setTransactions(sortedData);
            } else {
                console.error("API Error or unexpected format for transactions:", apiResponse.message);
                setTransactions([]);
            }
        } catch (error) {
            console.error('Error fetching supplier transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllTransactions();
    }, [fetchAllTransactions]);
    
    return (
        <div className="container mx-auto px-4 py-8 bg-slate-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center">
                        <FaHistory className="mr-3 text-slate-800" />
                        Riwayat Transaksi Supplier
                    </h1>
                    <p className="text-gray-600 mt-2">Log semua aktivitas transaksi dengan supplier.</p>
                </div>
                 <button
                    onClick={() => router.push('/manajemen-supplier')}
                    className="mt-4 md:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg transition-colors duration-150 shadow-sm flex items-center gap-2 cursor-pointer text-sm"
                >
                    <FaArrowLeft /> Kembali ke Supplier
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-700"></div>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow mt-8">
                    <FaListAlt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-xl">Tidak ada data transaksi supplier ditemukan.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {transactions.map(transaction => (
                            <li key={transaction.id} className="p-4 sm:p-6 hover:bg-slate-50/70 transition-colors duration-150 group">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                    {/* Left Column: Main Info */}
                                    <div className="flex-grow mb-3 sm:mb-0 pr-0 sm:pr-4">
                                        <div className="flex items-center mb-1.5">
                                            <FaCalendarAlt className="text-slate-500 mr-2 text-sm flex-shrink-0" />
                                            <span className="text-sm font-semibold text-slate-800">
                                                {format(new Date(transaction.tanggal_transaksi), 'dd MMMM yyyy, HH:mm:ss', { locale: localeID })}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-lg font-medium text-slate-900 mb-1">
                                            <FaBoxOpen className="text-teal-600 mr-2.5 flex-shrink-0" />
                                            <span className="truncate" title={transaction.jenis_barang}>{transaction.jenis_barang}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center mb-2">
                                            <FaUserCog className="text-gray-500 mr-2.5 flex-shrink-0" />
                                            <span>Supplier: <strong className="font-medium text-gray-800">{transaction.supplier_name}</strong></span>
                                        </div>
                                        {/* Stacked IDs */}
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div className="flex items-center" title={`ID Transaksi: ${transaction.id}`}>
                                                <FaBarcode className="text-gray-500 mr-1.5 flex-shrink-0" />
                                                <span>Trx ID:</span> 
                                                <span className="ml-1 font-mono bg-gray-100 group-hover:bg-gray-200 px-1.5 py-0.5 rounded break-all"> {/* Display full ID */}
                                                    {transaction.id}
                                                </span>
                                            </div>
                                            <div className="flex items-center" title={`ID Supplier: ${transaction.supplier_id}`}>
                                                <FaUserTag className="text-gray-500 mr-1.5 flex-shrink-0" />
                                                <span>Supplier ID:</span> 
                                                <span className="ml-1 font-mono bg-gray-100 group-hover:bg-gray-200 px-1.5 py-0.5 rounded break-all"> {/* Display full ID */}
                                                    {transaction.supplier_id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end sm:text-right w-full sm:w-auto mt-3 sm:mt-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-gray-200 sm:pt-0 pt-3">
                                        <p className="text-sm text-gray-700 mb-1">
                                            Jumlah: <strong className="text-lg font-semibold text-slate-800">{transaction.jumlah_barang}</strong> unit
                                        </p>
                                        <div className="text-xs text-gray-500 flex items-center sm:justify-end w-full">
                                            <FaTruckLoading className="mr-1.5 text-gray-400 flex-shrink-0" /> 
                                            <span className="truncate" title={transaction.pengiriman_info}>
                                                {transaction.pengiriman_info || "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}