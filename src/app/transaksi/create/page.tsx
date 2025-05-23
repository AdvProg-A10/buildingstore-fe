// src/app/transaksi/create/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTransaksi } from '@/app/hooks/useTransaksi';
import TransaksiForm from '@/app/components/transaksi/TransaksiForm';
import { CreateTransaksiRequest } from '@/app/lib/api/transaksi';

export default function CreateTransaksiPage() {
  const router = useRouter();
  const { createTransaksi } = useTransaksi();

  const handleSubmit = async (data: CreateTransaksiRequest) => {
    try {
      const newTransaksi = await createTransaksi(data);
      router.push(`/transaksi/${newTransaksi.id}`);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleCancel = () => {
    router.push('/transaksi');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaksi Baru</h1>
          <p className="text-gray-600">Buat transaksi penjualan baru</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <TransaksiForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Buat Transaksi"
          />
        </div>
      </div>
    </div>
  );
}