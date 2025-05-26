'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { FaArrowLeft, FaUserCircle, FaBox, FaHashtag, FaTruck, FaCalendarCheck, FaBarcode, FaSpinner } from 'react-icons/fa';

interface Supplier {
  id: string;
  name: string;
  jenis_barang: string;
  jumlah_barang: number;
  resi: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
};

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params?.id as string | undefined;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplierDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/suppliers/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Supplier tidak ditemukan.');
        }
        const errorData = await response.text();
        throw new Error(`Gagal mengambil detail supplier: ${response.status}${errorData ? ` - ${errorData}` : ''}`);
      }
      const apiResponse: ApiResponse<Supplier> = await response.json();
      if (apiResponse.success && apiResponse.data) {
        setSupplier(apiResponse.data);
      } else {
        throw new Error(apiResponse.message || 'Gagal memuat data supplier.');
      }
    } catch (err: unknown) { // Changed from 'any' to 'unknown'
      console.error("Error fetching supplier detail:", err);
      let errorMessage = 'Terjadi kesalahan saat mengambil detail supplier.'; // Default message
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      setSupplier(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supplierId) {
      fetchSupplierDetail(supplierId);
    } else {
      setLoading(false);
      setError("ID Supplier tidak valid atau tidak ditemukan.");
    }
  }, [supplierId, fetchSupplierDetail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-3 text-lg text-gray-700">Memuat detail supplier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-slate-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
                onClick={() => router.push('/manajemen-supplier')}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
            >
                <FaArrowLeft className="inline mr-2" /> Kembali ke Daftar Supplier
            </button>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-slate-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Data Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Supplier yang Anda cari tidak dapat ditemukan.</p>
            <button
                onClick={() => router.push('/manajemen-supplier')}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
            >
                <FaArrowLeft className="inline mr-2" /> Kembali ke Daftar Supplier
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/manajemen-supplier')}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Kembali ke Daftar Supplier
        </button>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700 flex items-center">
                <FaUserCircle className="mr-3 text-4xl text-indigo-500" />
                {supplier.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-mono flex items-center" title={supplier.id}>
                <FaBarcode className="inline mr-1.5" /> ID: {supplier.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-gray-700">
            <div className="flex items-start">
              <FaBox className="mr-3 mt-1 text-xl text-indigo-500 flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase">Jenis Barang</span>
                <p className="text-lg">{supplier.jenis_barang}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaHashtag className="mr-3 mt-1 text-xl text-indigo-500 flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase">Jumlah Barang</span>
                <p className="text-lg">{supplier.jumlah_barang} unit</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaTruck className="mr-3 mt-1 text-xl text-indigo-500 flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase">Resi/Dokumen</span>
                <p className="text-lg font-mono">{supplier.resi}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCalendarCheck className="mr-3 mt-1 text-xl text-indigo-500 flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase">Update Terakhir</span>
                <p className="text-lg">
                  {format(new Date(supplier.updated_at), 'dd MMMM yyyy, HH:mm:ss', { locale: localeID })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}