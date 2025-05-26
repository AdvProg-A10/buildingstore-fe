'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; 
import { 
    FaPlus, FaPen, FaTrash, FaEye, FaBox, FaUserCircle, FaBarcode, 
    FaExclamationTriangle, FaTimes, FaExchangeAlt 
} from 'react-icons/fa';

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
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const DeleteConfirmationModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3 text-2xl" />
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="text-gray-600 mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors shadow-sm hover:shadow-md"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes modalShowAnimation {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalShow {
          animation: modalShowAnimation 0.3s forwards;
        }
      `}</style>
    </div>
  );
};


export default function ManajemenSupplierPage() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const baseUrl = `${config.apiBaseUrl}/api/suppliers`; 
            const finalUrl = baseUrl; 

            const response = await fetch(finalUrl);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to fetch suppliers: ${response.status} ${errorData}`);
            }
            
            const apiResponse: ApiResponse<Supplier[]> = await response.json();
            if (apiResponse.success && apiResponse.data) {
                setSuppliers(apiResponse.data);
            } else {
                console.error("API Error or unexpected format:", apiResponse.message);
                setSuppliers([]);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleDelete = async (supplier: Supplier) => {
        setSupplierToDelete(supplier); 
        setShowDeleteModal(true);      
    };

    const confirmActualDelete = async () => { 
        if (!supplierToDelete || !supplierToDelete.id) return;
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/suppliers/${supplierToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
              const errorData = await response.text();
              throw new Error(`Failed to delete supplier: ${response.status} ${errorData}`);
            }
            
            await fetchSuppliers(); 
        } catch (error) {
            console.error('Error deleting supplier:', error);
        } finally {
            setShowDeleteModal(false); 
            setSupplierToDelete(null); 
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                        Manajemen Supplier
                    </h1>
                    <p className="text-gray-600 mt-2">Kelola semua data supplier.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3"> {/* Grouping buttons */}
                    <button
                        onClick={() => router.push('/manajemen-supplier/transaksi-supplier')}
                        className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 shadow-lg flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                    >
                        <FaExchangeAlt /> Lihat Transaksi
                    </button>
                    <button
                        onClick={() => router.push('/manajemen-supplier/create')}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                    >
                        <FaPlus /> Tambah Supplier Baru
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : suppliers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow mt-8">
                    <FaUserCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-xl">Tidak ada data supplier ditemukan.</p>
                    <p className="text-gray-500 mt-1">Tambahkan supplier baru untuk memulai.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-8">
                    {suppliers.map(supplier => (
                        <div
                            key={supplier.id}
                            className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between shadow-md"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-xl text-indigo-700 mb-1 line-clamp-1" title={supplier.name}>
                                        <FaUserCircle className="inline mr-2 text-indigo-600" />{supplier.name}
                                    </h3>
                                    <div className="flex gap-1.5">
                                        <button 
                                            onClick={() => router.push(`/manajemen-supplier/${supplier.id}/edit`)} 
                                            className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-md" 
                                            title="Edit Supplier">
                                            <FaPen size={14}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(supplier)} 
                                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md" 
                                            title="Hapus Supplier">
                                            <FaTrash size={14}/>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                                    <p className="flex items-center" title={supplier.id}>
                                       <FaBarcode className="inline mr-2 text-gray-500" /> ID: 
                                       <span className="ml-1 font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded" title={supplier.id}>
                                            ...{supplier.id.substring(supplier.id.length - 6)}
                                       </span>
                                    </p>
                                    <p className="flex items-center">
                                        <FaBox className="inline mr-2 text-gray-500" /> Jenis Barang: {supplier.jenis_barang}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push(`/manajemen-supplier/${supplier.id}`)} 
                                className="w-full mt-4 flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-100 hover:bg-indigo-600 border-2 border-indigo-500 transition-colors py-2.5 px-4 rounded-lg cursor-pointer text-sm font-medium"
                                title="Lihat Detail Supplier"
                            >
                                <FaEye /> Lihat Detail
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSupplierToDelete(null);
                }}
                onConfirm={confirmActualDelete}
                title="Konfirmasi Hapus Supplier"
            >
                {supplierToDelete && (
                    <p>
                        Apakah Anda yakin ingin menghapus supplier <strong className="font-semibold">{supplierToDelete.name}</strong> 
                        (ID: ...{supplierToDelete.id.slice(-6)})? Tindakan ini tidak dapat diurungkan.
                    </p>
                )}
            </DeleteConfirmationModal>
        </div>
    );
}