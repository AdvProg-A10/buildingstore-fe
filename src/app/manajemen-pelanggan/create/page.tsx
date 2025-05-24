'use client';

import { useState } from 'react';
import { config } from '@/config';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

export default function CreateCustomerPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nama: '',
        no_telp: '',
        alamat: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/pelanggan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to create customer');

            router.push('/manajemen-pelanggan');
        } catch (error) {
            console.error('Error creating customer:', error);
            setError('Gagal menambahkan pelanggan baru. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-4">
            <button
                onClick={() => router.push('/manajemen-pelanggan')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
                <FaArrowLeft /> Kembali
            </button>

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Pelanggan Baru</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                            Nama
                        </label>
                        <input
                            type="text"
                            id="nama"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-text"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="no_telp" className="block text-sm font-medium text-gray-700 mb-1">
                            Nomor Telepon
                        </label>
                        <input
                            type="tel"
                            id="no_telp"
                            value={formData.no_telp}
                            onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-text"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">
                            Alamat
                        </label>
                        <textarea
                            id="alamat"
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-text"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4">
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
