'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaBox, FaBarcode, FaSpinner, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import DeleteModal from '@/components/DeleteModal';

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
};

export default function ManajemenProdukPage() {
  const router = useRouter();
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [produkToDelete, setProdukToDelete] = useState<Produk | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAllProduk = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/produk`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const apiResponse: ApiResponse<Produk[]> = await response.json();
      if (apiResponse.success && apiResponse.data) {
        setProdukList(apiResponse.data);
      } else {
        console.error("API Error:", apiResponse.message);
        setProdukList([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProdukList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProduk();
  }, [fetchAllProduk]);

  const handleDeleteClick = (produk: Produk) => {
    setProdukToDelete(produk);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!produkToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/produk/${produkToDelete.id}`, {
        method: 'DELETE',
      });

      const apiResponse: ApiResponse<null> = await response.json();
      
      if (response.ok && apiResponse.success) {
        // Remove deleted product from list
        setProdukList(prevList => prevList.filter(p => p.id !== produkToDelete.id));
        setShowDeleteModal(false);
        setProdukToDelete(null);
        
        // Show success message (you can add toast notification here)
        console.log('Produk berhasil dihapus');
      } else {
        console.error('Error deleting product:', apiResponse.message);
        alert(`Gagal menghapus produk: ${apiResponse.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Terjadi kesalahan saat menghapus produk');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProdukToDelete(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaBox className="mr-3 text-blue-600" />
            Manajemen Produk
          </h1>
          <p className="text-gray-600 mt-2">Kelola data produk Anda</p>
        </div>
        <button
          onClick={() => router.push('/manajemen-produk/create')}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <FaPlus /> Tambah Produk
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : produkList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <FaBox className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-xl">Tidak ada produk ditemukan</p>
          <button
            onClick={() => router.push('/manajemen-produk/create')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Tambah Produk Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produkList.map((produk) => (
                  <tr key={produk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBarcode className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {produk.nama}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {produk.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {produk.kategori}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(produk.harga)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        produk.stok > 10 
                          ? 'bg-green-100 text-green-800' 
                          : produk.stok > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {produk.stok} unit
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/manajemen-produk/${produk.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Detail"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => router.push(`/manajemen-produk/${produk.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(produk)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Hapus"
                          disabled={isDeleting}
                        >
                          {isDeleting && produkToDelete?.id === produk.id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
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
      {showDeleteModal && produkToDelete && (
        <DeleteModal
          title="Konfirmasi Hapus Produk"
          message={`Apakah Anda yakin ingin menghapus produk "${produkToDelete.nama}"? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}