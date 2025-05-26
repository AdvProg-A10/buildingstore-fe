'use client';

import { useState, useEffect, useCallback } from 'react';
import { config } from '@/config';
import type { DetailTransaksi } from '@/types/transaksi';

export function useTransaksiDetail(transaksiId: number) {
  const [details, setDetails] = useState<DetailTransaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/transaksi/${transaksiId}/detail`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }

      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch transaction details');
      }

      const data = apiResponse.data || [];
      
      const enrichedData = data.map((detail: DetailTransaksi) => ({
        ...detail,
        nama_produk: detail.nama_produk || `Produk ID: ${detail.id_produk}`
      }));
      
      setDetails(enrichedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  }, [transaksiId]);

  useEffect(() => {
    if (transaksiId) {
      fetchDetails();
    }
  }, [fetchDetails, transaksiId]);

  return {
    details,
    loading,
    error,
    refetch: fetchDetails,
  };
}