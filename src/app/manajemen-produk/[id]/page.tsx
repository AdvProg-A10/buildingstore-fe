'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaBox, FaTag, FaHashtag, FaMoneyBillWave, FaInfoCircle, FaBarcode, FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import DeleteModal from '@/components/DeleteModal';

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
};

export default function ProdukDetailPage() {
  const router = useRouter();
  const params = useParams();
  const produkId = params?.id as string | undefined;

  const [produk, setProduk] = useState<Produk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProdukDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/produk/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Produk tidak ditemukan.');
        }
        const errorData = await response.text();
        throw new Error(`Gagal mengambil detail produk: ${response.status} ${errorData}`);
      }
      const apiResponse: ApiResponse<Produk> = await response.json();
      if (apiResponse.success && apiResponse.data) {
        setProduk(apiResponse.data);
      } else {
        throw new Error(apiResponse.message || 'Gagal memuat data produk.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      console.error("Error fetching produk detail:", err);
      setProduk(null); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (produkId) {
      fetchProdukDetail(produkId);
    } else {
      setLoading(false);
      setError("ID Produk tidak valid atau tidak ditemukan.");
    }
  }, [produkId, fetchProdukDetail]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!produk) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/produk/${produk.id}`, {
        method: 'DELETE',
      });

      const apiResponse: ApiResponse<null> = await response.json();
      
      if (response.ok && apiResponse.success) {
        // Navigate back to product list after successful deletion
        router.push('/manajemen-produk');
      } else {
        console.error('Error deleting product:', apiResponse.message);
        alert(`Gagal menghapus produk: ${apiResponse.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Terjadi kesalahan saat menghapus produk');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Tidak tersedia';
    
    try {
      // Try parsing as ISO string first
      let date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Try different parsing approaches
        date = new Date(dateString.replace(/-/g, '/'));
        if (isNaN(date.getTime())) {
          return 'Format tanggal tidak valid';
        }
      }
      
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Format tanggal tidak valid';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <p className="ml-3 text-lg text-gray-700">Memuat detail produk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/manajemen-produk')}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          >
            <FaArrowLeft className="inline mr-2" /> Kembali ke Daftar Produk
          </button>
        </div>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600 bg-gray-50 min-h-screen">
        Produk tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/manajemen-produk')}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Kembali ke Daftar Produk
        </button>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 flex items-center">
                <FaBox className="mr-3 text-4xl text-blue-500" />
                {produk.nama}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-mono flex items-center" title={produk.id.toString()}>
                <FaBarcode className="inline mr-1.5" /> ID: {produk.id}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={() => router.push(`/manajemen-produk/${produk.id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Menghapus...
                  </>
                ) : (
                  <>
                    <FaTrash /> Hapus
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-gray-700">
            <div className="flex items-start">
              <FaTag className="mr-3 mt-1 text-xl text-blue-500 flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase">Kategori</span>
                <p className="text-lg">{produk.kategori}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FaMoneyBillWave className="mr-3 mt-1 text-xl text-blue-500 flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase">Harga</span>
                <p className="text-lg">{formatCurrency(produk.harga)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FaHashtag className="mr-3 mt-1 text-xl text-blue-500 flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase">Stok Tersedia</span>
                <p className="text-lg">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    produk.stok > 10 
                      ? 'bg-green-100 text-green-800' 
                      : produk.stok > 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {produk.stok} unit
                  </span>
                </p>
              </div>
            </div>
            
            {(produk.updated_at || produk.created_at) && (
              <div className="flex items-start">
                <FaInfoCircle className="mr-3 mt-1 text-xl text-blue-500 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase">
                    {produk.updated_at ? 'Update Terakhir' : 'Tanggal Dibuat'}
                  </span>
                  <p className="text-lg">
                    {formatDate(produk.updated_at || produk.created_at)}
                  </p>
                </div>
              </div>
            )}
            
            {produk.deskripsi && (
              <div className="md:col-span-2 flex items-start">
                <FaInfoCircle className="mr-3 mt-1 text-xl text-blue-500 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase">Deskripsi</span>
                  <p className="text-lg whitespace-pre-line">{produk.deskripsi}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && produk && (
        <DeleteModal
          title="Konfirmasi Hapus Produk"
          message={`Apakah Anda yakin ingin menghapus produk "${produk.nama}"? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}