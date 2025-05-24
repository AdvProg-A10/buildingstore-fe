'use client';

import { useState, useEffect, useCallback } from 'react';
import { config } from '@/config';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

interface Customer {
    id: number;
    nama: string;
    no_telp: string;
    alamat: string;
    tanggal_gabung: string;
}

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [customerData, setCustomerData] = useState<Customer | null>(null);

    const fetchCustomerDetails = useCallback(async () => {
        try {
            const { id } = await params;
            const response = await fetch(`${config.apiBaseUrl}/api/pelanggan/${id}`, {
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch customer details');
            const data: Customer = await response.json();
            setCustomerData(data);
        } catch (error) {
            console.error('Error fetching customer details:', error);
            router.push('/manajemen-pelanggan');
        } finally {
            setLoading(false);
        }
    }, [params, router]);

    useEffect(() => {
        fetchCustomerDetails();
    }, [fetchCustomerDetails]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerData) return;
        
        setSaving(true);
        setError('');

        const { id } = await params;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/pelanggan/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(customerData),
            });

            if (!response.ok) throw new Error('Failed to update customer');

            router.push('/manajemen-pelanggan');
        } catch (error) {
            console.error('Error updating customer:', error);
            setError('Gagal mengupdate data pelanggan. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-4">
            <button
                onClick={() => router.push('/manajemen-pelanggan')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
                <FaArrowLeft /> Kembali
            </button>

            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Pelanggan</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            ID Pelanggan
                        </label>
                        <input
                            type="text"
                            value={customerData?.id}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-100 bg-gray-50 py-2 px-3 text-gray-500 cursor-not-allowed"
                            disabled
                        />
                    </div>

                    <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-500 mb-1">
                            Nama
                        </label>
                        <input
                            type="text"
                            id="nama"
                            value={customerData?.nama || ''}
                            onChange={(e) => setCustomerData(prev => prev ? { ...prev, nama: e.target.value } : null)}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-text"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="no_telp" className="block text-sm font-medium text-gray-500 mb-1">
                            Nomor Telepon
                        </label>
                        <input
                            type="tel"
                            id="no_telp"
                            value={customerData?.no_telp || ''}
                            onChange={(e) => setCustomerData(prev => prev ? { ...prev, no_telp: e.target.value } : null)}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-text"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="alamat" className="block text-sm font-medium text-gray-500 mb-1">
                            Alamat
                        </label>
                        <textarea
                            id="alamat"
                            value={customerData?.alamat || ''}
                            onChange={(e) => setCustomerData(prev => prev ? { ...prev, alamat: e.target.value } : null)}
                            rows={3}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-text"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="tanggal_gabung" className="block text-sm font-medium text-gray-500 mb-1">
                            Tanggal Bergabung
                        </label>                        <input                            type="date"
                            id="tanggal_gabung"
                            value={customerData?.tanggal_gabung ? customerData.tanggal_gabung.split('T')[0] : ''}
                            onChange={(e) => setCustomerData(prev => prev ? { ...prev, tanggal_gabung: e.target.value } : null)}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.push('/manajemen-pelanggan')}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                        >
                            <FaTimes /> Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed transform hover:scale-105 flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <FaSave /> {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
