'use client';

import { useState, useEffect, useCallback } from 'react';
import { config } from '@/config';
import { Transaksi, TransaksiFilters, CreateTransaksiRequest } from '@/types/transaksi';

export function useTransaksi(filters?: TransaksiFilters) {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaksi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      if (filters?.sort) {
        queryParams.append('sort', filters.sort);
      }
      
      if (filters?.status) {
        queryParams.append('status', filters.status);
      }
      
      if (filters?.filter && filters?.keyword) {
        queryParams.append('filter', filters.filter);
        queryParams.append('keyword', filters.keyword);
      }

      const url = `${config.apiBaseUrl}/api/transaksi${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransaksi(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransaksi();
  }, [fetchTransaksi]);

  const createTransaksi = async (data: CreateTransaksiRequest) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const newTransaksi = await response.json();
      setTransaksi(prev => [...prev, newTransaksi]);
      return newTransaksi;
    } catch (err) {
      throw err;
    }
  };

  const updateTransaksi = async (id: number, data: Partial<CreateTransaksiRequest>) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      const updatedTransaksi = await response.json();
      setTransaksi(prev => prev.map(t => t.id === id ? updatedTransaksi : t));
      return updatedTransaksi;
    } catch (err) {
      throw err;
    }
  };

  const deleteTransaksi = async (id: number) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      setTransaksi(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const completeTransaksi = async (id: number) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${id}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to complete transaction');
      }

      const updatedTransaksi = await response.json();
      setTransaksi(prev => prev.map(t => t.id === id ? updatedTransaksi : t));
      return updatedTransaksi;
    } catch (err) {
      throw err;
    }
  };

  const cancelTransaksi = async (id: number) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/transaksi/${id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel transaction');
      }

      const updatedTransaksi = await response.json();
      setTransaksi(prev => prev.map(t => t.id === id ? updatedTransaksi : t));
      return updatedTransaksi;
    } catch (err) {
      throw err;
    }
  };

  return {
    transaksi,
    loading,
    error,
    refetch: fetchTransaksi,
    createTransaksi,
    updateTransaksi,
    deleteTransaksi,
    completeTransaksi,
    cancelTransaksi,
  };
}

// Hook untuk single transaksi
export function useTransaksiById(id: number) {
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (id) {
      fetchTransaksi();
    }
  }, [fetchTransaksi, id]);

  return {
    transaksi,
    loading,
    error,
    refetch: fetchTransaksi,
  };
}