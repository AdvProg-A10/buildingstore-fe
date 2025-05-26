'use client';

import React from 'react';
import { Transaksi } from '@/types/transaksi';

interface TransaksiDetailProps {
  transaksi: Transaksi;
}

export default function TransaksiDetail({ transaksi }: TransaksiDetailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SELESAI': return 'bg-green-100 text-green-800';
      case 'DIBATALKAN': return 'bg-red-100 text-red-800';
      case 'MASIH_DIPROSES': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SELESAI': return 'Selesai';
      case 'DIBATALKAN': return 'Dibatalkan';
      case 'MASIH_DIPROSES': return 'Masih Diproses';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Transaksi</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Transaksi</label>
          <p className="text-lg font-semibold text-gray-900">#{transaksi.id}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Pelanggan</label>
          <p className="text-gray-900">{transaksi.nama_pelanggan}</p>
          <p className="text-sm text-gray-500">ID: {transaksi.id_pelanggan}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Tanggal Transaksi</label>
          <p className="text-gray-900">{formatDate(transaksi.tanggal_transaksi)}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Harga</label>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(transaksi.total_harga)}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(transaksi.status)}`}>
            {getStatusText(transaksi.status)}
          </span>
        </div>
        
        {transaksi.catatan && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Catatan</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded">{transaksi.catatan}</p>
          </div>
        )}
      </div>
    </div>
  );
}