// src/app/hooks/useTransaksiDetail.ts
'use client';

import { useState, useEffect } from 'react';
import { transaksiAPI, DetailTransaksi, CreateDetailTransaksiRequest } from '@/app/lib/api/transaksi';

export function useTransaksiDetail(id_transaksi: number) {
  const [details, setDetails] = useState<DetailTransaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transaksiAPI.getDetailTransaksi(id_transaksi);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id_transaksi) {
      fetchDetails();
    }
  }, [id_transaksi]);

  const addDetail = async (data: CreateDetailTransaksiRequest) => {
    try {
      const newDetail = await transaksiAPI.addDetailTransaksi(id_transaksi, data);
      setDetails(prev => [...prev, newDetail]);
      return newDetail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add detail');
      throw err;
    }
  };

  const updateDetail = async (detail_id: number, data: Partial<DetailTransaksi>) => {
    try {
      const updatedDetail = await transaksiAPI.updateDetailTransaksi(id_transaksi, detail_id, data);
      setDetails(prev => 
        prev.map(d => d.id === detail_id ? updatedDetail : d)
      );
      return updatedDetail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update detail');
      throw err;
    }
  };

  const deleteDetail = async (detail_id: number) => {
    try {
      await transaksiAPI.deleteDetailTransaksi(id_transaksi, detail_id);
      setDetails(prev => prev.filter(d => d.id !== detail_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete detail');
      throw err;
    }
  };

  return {
    details,
    loading,
    error,
    addDetail,
    updateDetail,
    deleteDetail,
    refetch: fetchDetails,
  };
}