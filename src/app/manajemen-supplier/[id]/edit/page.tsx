'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaSave, FaSpinner, FaArrowLeft } from 'react-icons/fa';

interface SupplierUpdateData {
  name: string;
  jenis_barang: string;
  jumlah_barang: number;
  resi: string;
}

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

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params?.id as string | undefined;

  const [formData, setFormData] = useState<SupplierUpdateData>({
    name: '',
    jenis_barang: '',
    jumlah_barang: 0,
    resi: '',
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSupplierDetails = useCallback(async (id: string) => {
    setInitialLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/suppliers/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Supplier tidak ditemukan.');
        const errorData = await response.text();
        throw new Error(`Gagal mengambil data supplier: ${response.status}${errorData ? ` - ${errorData}` : ''}`);
      }
      const result: ApiResponse<Supplier> = await response.json();
      if (result.success && result.data) {
        setFormData({
          name: result.data.name,
          jenis_barang: result.data.jenis_barang,
          jumlah_barang: result.data.jumlah_barang,
          resi: result.data.resi,
        });
      } else {
        throw new Error(result.message || 'Gagal memuat data supplier.');
      }
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan saat mengambil detail supplier.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      console.error("Fetch details error:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supplierId) {
      fetchSupplierDetails(supplierId);
    } else {
      setError("ID Supplier tidak valid.");
      setInitialLoading(false);
    }
  }, [supplierId, fetchSupplierDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'jumlah_barang' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supplierId) {
      setError("ID Supplier tidak valid untuk update.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Supplier> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Gagal mengupdate supplier: ${response.statusText}`);
      }

      setSuccessMessage(result.message || 'Supplier berhasil diupdate!');
      if (result.data) {
          setFormData({
              name: result.data.name,
              jenis_barang: result.data.jenis_barang,
              jumlah_barang: result.data.jumlah_barang,
              resi: result.data.resi,
          });
      }

      setTimeout(() => {
        router.push(`/manajemen-supplier/${supplierId}`);
      }, 1500);

    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan yang tidak diketahui saat update.';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage; 
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-3 text-lg text-gray-700">Memuat data supplier...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Kembali
        </button>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-6 pb-4 border-b border-gray-200">
              Edit Supplier {formData.name ? `"${formData.name}"` : ''}
            </h1>

            {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                {error}
            </div>
            )}
            {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">
                {successMessage}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Supplier <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Contoh: PT. Pemasok Utama"
                />
            </div>

            <div>
                <label htmlFor="jenis_barang" className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Barang <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                name="jenis_barang"
                id="jenis_barang"
                value={formData.jenis_barang}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Contoh: Komponen Elektronik"
                />
            </div>

            <div>
                <label htmlFor="jumlah_barang" className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Barang <span className="text-red-500">*</span>
                </label>
                <input
                type="number"
                name="jumlah_barang"
                id="jumlah_barang"
                value={formData.jumlah_barang}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="0"
                />
            </div>

            <div>
                <label htmlFor="resi" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Resi/Dokumen <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                name="resi"
                id="resi"
                value={formData.resi}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Contoh: JNE123456789"
                />
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-3">
                <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors disabled:opacity-50"
                >
                Batal
                </button>
                <button
                type="submit"
                disabled={isSubmitting || initialLoading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                {isSubmitting ? (
                    <>
                    <FaSpinner className="animate-spin mr-2" /> Menyimpan Perubahan...
                    </>
                ) : (
                    <>
                    <FaSave className="mr-2" /> Simpan Perubahan
                    </>
                )}
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
}