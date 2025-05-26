'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { config } from '@/config';
import TransaksiForm from '@/app/components/transaksi/TransaksiForm';
import type { CreateTransaksiRequest } from '@/types/transaksi';

export default function CreateTransaksiPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateTransaksiRequest) => {
    try {
      console.log('Sending transaction data:', data);
      
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `Failed to create transaction: ${response.status}`);
        } catch {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication required. Please login first.');
          }
          throw new Error(`Server error: ${response.status}. Please check backend logs.`);
        }
      }

      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      if (apiResponse.message) {
        alert('✅ Transaksi berhasil dibuat!');
        router.push('/transaksi');
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert(`❌ Gagal membuat transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
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