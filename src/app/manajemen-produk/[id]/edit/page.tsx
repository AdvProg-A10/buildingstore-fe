'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaSave, FaTimes, FaSpinner, FaArrowLeft } from 'react-icons/fa';

interface ProdukUpdateData {
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
}

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
};

export default function EditProdukPage() {
  const router = useRouter();
  const params = useParams();
  const produkId = params?.id as string | undefined;

  const [formData, setFormData] = useState<ProdukUpdateData>({
    nama: '',
    kategori: '',
    harga: 0,
    stok: 0,
    deskripsi: ''
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProdukDetails = useCallback(async (id: string) => {
    setInitialLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/produk/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Produk tidak ditemukan.');
        const errorData = await response.text();
        throw new Error(`Gagal mengambil data produk: ${response.status} ${errorData}`);
      }
      const result: ApiResponse<Produk> = await response.json();
      if (result.success && result.data) {
        setFormData({
          nama: result.data.nama,
          kategori: result.data.kategori,
          harga: result.data.harga,
          stok: result.data.stok,
          deskripsi: result.data.deskripsi || ''
        });
      } else {
        throw new Error(result.message || 'Gagal memuat data produk.');
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Fetch details error:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (produkId) {
      fetchProdukDetails(produkId);
    } else {
      setError("ID Produk tidak valid.");
      setInitialLoading(false);
    }
  }, [produkId, fetchProdukDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'harga' || name === 'stok' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!produkId) {
      setError("ID Produk tidak valid untuk update.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/produk/${produkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Produk> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Gagal mengupdate produk: ${response.statusText}`);
      }

      setSuccessMessage(result.message || 'Produk berhasil diupdate!');
      if (result.data) {
        setFormData({
          nama: result.data.nama,
          kategori: result.data.kategori,
          harga: result.data.harga,
          stok: result.data.stok,
          deskripsi: result.data.deskripsi || ''
        });
      }

      setTimeout(() => {
        router.push(`/manajemen-produk/${produkId}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui saat update.');
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <p className="ml-3 text-lg text-gray-700">Memuat data produk...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Kembali
        </button>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-6 pb-4 border-b border-gray-200">
            Edit Produk {formData.nama ? `"${formData.nama}"` : ''}
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
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                id="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Contoh: Laptop Gaming"
              />
            </div>

            <div>
              <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="kategori"
                id="kategori"
                value={formData.kategori}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Contoh: Elektronik"
              />
            </div>

            <div>
              <label htmlFor="harga" className="block text-sm font-medium text-gray-700 mb-1">
                Harga <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="harga"
                id="harga"
                value={formData.harga}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stok"
                id="stok"
                value={formData.stok}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                id="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="Deskripsi produk (opsional)"
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