// src/app/transaksi/page.tsx
'use client';

import React, { useState } from 'react';
import { useTransaksi } from '@/app/hooks/useTransaksi';
import { TransaksiFilters } from '@/app/lib/api/transaksi';
import TransaksiList from '@/app/components/transaksi/TransaksiList';
import TransaksiFiltersComponent from '@/app/components/transaksi/TransaksiFilters';
import Link from 'next/link';

export default function TransaksiPage() {
  const [filters, setFilters] = useState<TransaksiFilters>({});
  const { transaksi, loading, error, refetch } = useTransaksi(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Daftar Transaksi</h1>
        <Link
          href="/transaksi/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Transaksi Baru
        </Link>
      </div>

      <div className="space-y-6">
        <TransaksiFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />

        <TransaksiList
          transaksi={transaksi}
          loading={loading}
          error={error}
          onRefetch={refetch}
        />
      </div>
    </div>
  );
}