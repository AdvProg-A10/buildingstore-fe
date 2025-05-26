'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { config } from '@/config';
import TransaksiForm from '@/app/components/transaksi/TransaksiForm';
import Link from 'next/link';
import type { Transaksi } from '@/types/transaksi';

export default function EditTransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTransaksi();
    }
  }, [id]);

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transaction');
      }
      const data = await response.json();
      setTransaksi(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }
      router.push(`/transaksi/${id}`);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/transaksi/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !transaksi) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error || 'Transaction not found'}
        </div>
      </div>
    );
  }

  if (transaksi.status !== 'MASIH_DIPROSES') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Transaksi ini tidak dapat diedit karena statusnya sudah {transaksi.status}.
          <div className="mt-2">
            <Link href={`/transaksi/${id}`} className="text-blue-600 hover:text-blue-800">
              Kembali ke detail transaksi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href={`/transaksi/${id}`}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Kembali ke Detail Transaksi
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Transaksi #{transaksi.id}
          </h1>
          <p className="text-gray-600">Ubah informasi transaksi</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <TransaksiForm
            initialData={transaksi}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Simpan Perubahan"
          />
        </div>
      </div>
    </div>
  );
}