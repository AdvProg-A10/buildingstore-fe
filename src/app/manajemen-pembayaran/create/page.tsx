'use client';

import { useState } from 'react';
import { config } from '@/config';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaMoneyBillWave, FaCreditCard, FaUniversity, FaMobile } from 'react-icons/fa';

export default function CreatePaymentPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        transaction_id: '',
        amount: '',
        method: 'CASH',
        status: 'LUNAS',
        due_date: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = {
                transaction_id: formData.transaction_id,
                amount: parseFloat(formData.amount),
                method: formData.method,
                status: formData.status,
                due_date: formData.due_date || null,
            };

            const response = await fetch(`${config.apiBaseUrl}/api/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to create payment');
            }

            router.push('/manajemen-pembayaran');
        } catch (error) {
            console.error('Error creating payment:', error);
            setError(error instanceof Error ? error.message : 'Gagal menambahkan pembayaran baru. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH':
                return <FaMoneyBillWave className="text-green-600" />;
            case 'CREDIT_CARD':
                return <FaCreditCard className="text-blue-600" />;
            case 'BANK_TRANSFER':
                return <FaUniversity className="text-purple-600" />;
            case 'E_WALLET':
                return <FaMobile className="text-orange-600" />;
            default:
                return <FaMoneyBillWave className="text-gray-600" />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-4">
            <button
                onClick={() => router.push('/manajemen-pembayaran')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
                <FaArrowLeft /> Kembali
            </button>

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">💸 Tambah Pembayaran Baru</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 mb-1">
                            ID Transaksi
                        </label>
                        <input
                            type="text"
                            id="transaction_id"
                            value={formData.transaction_id}
                            onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                            placeholder="Contoh: TRX-123456"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Jumlah Pembayaran
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                            placeholder="Contoh: 500000"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
                            Metode Pembayaran
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-3">
                            {[
                                { value: 'CASH', label: 'Tunai' },
                                { value: 'CREDIT_CARD', label: 'Kartu Kredit' },
                                { value: 'BANK_TRANSFER', label: 'Transfer Bank' },
                                { value: 'E_WALLET', label: 'E-Wallet' }
                            ].map((method) => (
                                <label
                                    key={method.value}
                                    className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                        formData.method === method.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="method"
                                        value={method.value}
                                        checked={formData.method === method.value}
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center gap-2">
                                        {getMethodIcon(method.value)}
                                        <span className="text-sm font-medium">{method.label}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status Pembayaran
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-3">
                            <label
                                className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    formData.status === 'LUNAS'
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value="LUNAS"
                                    checked={formData.status === 'LUNAS'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span className="text-sm font-medium">Lunas</span>
                                </div>
                            </label>
                            <label
                                className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    formData.status === 'CICILAN'
                                        ? 'border-yellow-500 bg-yellow-50'
                                        : 'border-gray-200 hover:border-yellow-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value="CICILAN"
                                    checked={formData.status === 'CICILAN'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                    <span className="text-sm font-medium">Cicilan</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {formData.status === 'CICILAN' && (
                        <div>
                            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Jatuh Tempo (Opsional)
                            </label>
                            <input
                                type="datetime-local"
                                id="due_date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Kosongkan jika tidak ada tanggal jatuh tempo
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.push('/manajemen-pembayaran')}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <FaSave /> Simpan Pembayaran
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
