// src/app/hooks/useTransaksi.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { transaksiAPI, Transaksi, TransaksiFilters, CreateTransaksiRequest } from '@/app/lib/api/transaksi';

export function useTransaksi(filters?: TransaksiFilters) {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaksi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transaksiAPI.getAllTransaksi(filters);
      setTransaksi(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaksi');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransaksi();
  }, [fetchTransaksi]);

  const createTransaksi = async (data: CreateTransaksiRequest) => {
    try {
      setError(null);
      const newTransaksi = await transaksiAPI.createTransaksi(data);
      setTransaksi(prev => [newTransaksi, ...prev]);
      return newTransaksi;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaksi';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const completeTransaksi = async (id: number) => {
    try {
      const updatedTransaksi = await transaksiAPI.completeTransaksi(id);
      setTransaksi(prev => 
        prev.map(t => t.id === id ? updatedTransaksi : t)
      );
      return updatedTransaksi;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete transaksi');
      throw err;
    }
  };

  const cancelTransaksi = async (id: number) => {
    try {
      const updatedTransaksi = await transaksiAPI.cancelTransaksi(id);
      setTransaksi(prev => 
        prev.map(t => t.id === id ? updatedTransaksi : t)
      );
      return updatedTransaksi;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel transaksi');
      throw err;
    }
  };

  const deleteTransaksi = async (id: number) => {
    try {
      await transaksiAPI.deleteTransaksi(id);
      setTransaksi(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaksi');
      throw err;
    }
  };

  return {
    transaksi,
    loading,
    error,
    createTransaksi,
    completeTransaksi,
    cancelTransaksi,
    deleteTransaksi,
    refetch: fetchTransaksi,
  };
}
