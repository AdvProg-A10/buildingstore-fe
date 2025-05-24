'use client';

import { config } from '@/config';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

export default function RegistrasiPengguna() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        is_admin: false
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (response.ok) {
                router.push('/');
                router.refresh();
            } else {
                const data = await response.json();
                setError(data.message || 'Gagal membuat pengguna baru');
            }
        } catch {
            setError('Terjadi kesalahan saat membuat pengguna baru');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="container mx-auto px-4 py-4">
            <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
                <FaArrowLeft /> Kembali
            </button>

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrasi Pengguna Baru</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-text"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 cursor-text"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="is_admin"
                                checked={formData.is_admin}
                                onChange={handleChange}
                                className="h-5 w-5 text-blue-600 rounded border-2 border-gray-200 focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700">Pengguna Admin</span>
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 font-medium"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}