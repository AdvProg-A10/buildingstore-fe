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
      
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/transaksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        if (errorText.includes('<!DOCTYPE')) {
          if (response.status === 401 || response.status === 403) {
            throw new Error(`Authentication required. Please login first.`);
          }
          throw new Error(`Server error: ${response.status}. Check if endpoint exists and backend is running properly.`);
        }
        
        try {
          const errorJson = JSON.parse(errorText);
          
          if (errorJson.code === 'VALIDATION_ERROR') {
            throw new Error(`Validation Error: ${errorJson.error}`);
          } else if (errorJson.code === 'INTERNAL_ERROR') {
            throw new Error(`Internal Server Error: ${errorJson.error}. Check backend logs for details.`);
          } else if (response.status === 401) {
            throw new Error(`Please login first to create transactions.`);
          }
          
          throw new Error(errorJson.error || `Failed to create transaction: ${response.status}`);
        } catch (parseError) {
          if (response.status === 401 || response.status === 403) {
            throw new Error(`Authentication required. Please login first.`);
          }
          throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}...`);
        }
      }

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let apiResponse;
      try {
        apiResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response was:', responseText.substring(0, 200));
        throw new Error('Invalid JSON response from server');
      }

      console.log('Parsed API Response:', apiResponse);
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to create transaction');
      }

      const newTransaksi = apiResponse.data;
      console.log('Created transaction:', newTransaksi);
      
      alert('✅ Transaksi berhasil dibuat!');
      router.push(`/transaksi/${newTransaksi.id}`);
      
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