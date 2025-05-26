'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { config } from '@/config';
import TransaksiDetail from '@/app/components/transaksi/TransaksiDetail';
import DetailTransaksiList from '@/app/components/transaksi/DetailTransaksiList';
import Link from 'next/link';
import type { Transaksi, DetailTransaksi } from '@/types/transaksi';

export default function TransaksiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [details, setDetails] = useState<DetailTransaksi[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const fetchTransaksi = useCallback(async () => {
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
  }, [id]);

  const fetchDetails = useCallback(async () => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${id}/detail`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }

      const data = await response.json();
      setDetails(data);
    } catch (err) {
      setDetailsError(err instanceof Error ? err.message : 'Failed to fetch transaction details');
    } finally {
      setDetailsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTransaksi();
      fetchDetails();
    }
  }, [id, fetchTransaksi, fetchDetails]);

  const handleStatusChange = async (action: 'complete' | 'cancel') => {
    if (!transaksi) return;
    
    try {
      const endpoint = action === 'complete' ? 'complete' : 'cancel';
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${transaksi.id}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to ${action} transaction`);
      }
      
      const apiResponse = await response.json();
      if (apiResponse.message) {
        alert(`Transaksi berhasil ${action === 'complete' ? 'diselesaikan' : 'dibatalkan'}`);
        await fetchTransaksi();
      }
    } catch (error) {
      console.error('Failed to update transaction status:', error);
      alert(`Gagal ${action === 'complete' ? 'menyelesaikan' : 'membatalkan'} transaksi`);
    }
  };

  const handleDelete = async () => {
    if (!transaksi) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${transaksi.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to delete transaction');
        }
        
        const apiResponse = await response.json();
        if (apiResponse.message) {
          alert('Transaksi berhasil dihapus');
          router.push('/transaksi');
        }
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Gagal menghapus transaksi');
      }
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link 
              href="/transaksi" 
              className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
            >
              ← Kembali ke Daftar Transaksi
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Detail Transaksi #{transaksi.id}
            </h1>
          </div>
          
          <div className="space-x-2">
            {transaksi.status === 'MASIH_DIPROSES' && (
              <>
                <Link
                  href={`/transaksi/${transaksi.id}/edit`}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleStatusChange('complete')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Selesaikan
                </button>
                <button
                  onClick={() => handleStatusChange('cancel')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Batalkan
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Hapus
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TransaksiDetail transaksi={transaksi} />
        </div>
        
        <div className="lg:col-span-2">
          <DetailTransaksiList
            transaksiId={transaksi.id}
            details={details}
            loading={detailsLoading}
            error={detailsError}
            onRefetch={fetchDetails}
            canEdit={transaksi.status === 'MASIH_DIPROSES'}
          />
        </div>
      </div>
    </div>
  );
}