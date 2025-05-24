// src/app/hooks/useProduk.ts
'use client';

import { useState, useEffect } from 'react';
import { produkAPI, Produk } from '@/app/lib/api/transaksi';

export function useProduk() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduk = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await produkAPI.getAllProduk();
      setProduk(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  const getProdukById = (id: number) => {
    return produk.find(p => p.id === id);
  };

  const searchProduk = (keyword: string) => {
    if (!keyword.trim()) return produk;
    
    const lowercaseKeyword = keyword.toLowerCase();
    return produk.filter(p => 
      p.nama.toLowerCase().includes(lowercaseKeyword) ||
      p.kategori.toLowerCase().includes(lowercaseKeyword)
    );
  };

  const filterByCategory = (kategori: string) => {
    if (!kategori) return produk;
    return produk.filter(p => p.kategori === kategori);
  };

  const getCategories = () => {
    const categories = [...new Set(produk.map(p => p.kategori))];
    return categories.sort();
  };

  return {
    produk,
    loading,
    error,
    getProdukById,
    searchProduk,
    filterByCategory,
    getCategories,
    refetch: fetchProduk,
  };
}