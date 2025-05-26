'use client';

import React from 'react';
import { TransaksiFilters as TransaksiFiltersType } from '@/types/transaksi';

interface TransaksiFiltersProps {
  filters: TransaksiFiltersType;
  onFiltersChange: (filters: TransaksiFiltersType) => void;
}

export default function TransaksiFilters({ filters, onFiltersChange }: TransaksiFiltersProps) {
  const updateFilter = (key: keyof TransaksiFiltersType, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={filters.sort || ''}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Default</option>
            <option value="tanggal">Tanggal (Lama ke Baru)</option>
            <option value="tanggal_desc">Tanggal (Baru ke Lama)</option>
            <option value="total">Total (Rendah ke Tinggi)</option>
            <option value="total_desc">Total (Tinggi ke Rendah)</option>
            <option value="pelanggan">Nama Pelanggan (A-Z)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="MASIH_DIPROSES">Masih Diproses</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter By
          </label>
          <select
            value={filters.filter || ''}
            onChange={(e) => updateFilter('filter', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Filter</option>
            <option value="pelanggan">Nama Pelanggan</option>
            <option value="id">ID Transaksi</option>
            <option value="catatan">Catatan</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keyword
          </label>
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={(e) => updateFilter('keyword', e.target.value)}
            placeholder="Masukkan keyword..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}