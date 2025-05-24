// src/app/components/transaksi/ProductSelector.tsx
'use client';

import React, { useState } from 'react';
import { useProduk } from '@/app/hooks/useProduk';
import { Produk } from '@/app/lib/api/transaksi';

interface ProductSelectorProps {
  onAddToCart: (produk: Produk, jumlah: number) => void;
}

export default function ProductSelector({ onAddToCart }: ProductSelectorProps) {
  const { produk, loading, error, searchProduk, filterByCategory, getCategories } = useProduk();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const filteredProducts = React.useMemo(() => {
    let filtered = produk;
    
    if (selectedCategory) {
      filtered = filterByCategory(selectedCategory);
    }
    
    if (searchKeyword) {
      filtered = searchProduk(searchKeyword);
    }
    
    return filtered;
  }, [produk, searchKeyword, selectedCategory, searchProduk, filterByCategory]);

  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  const handleAddToCart = (product: Produk) => {
    const quantity = quantities[product.id] || 1;
    onAddToCart(product, quantity);
    // Reset quantity after adding
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pilih Produk</h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pilih Produk</h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pilih Produk</h3>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cari Produk
          </label>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada produk ditemukan
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.nama}</h4>
                  <p className="text-sm text-gray-600">{product.kategori}</p>
                  {product.deskripsi && (
                    <p className="text-sm text-gray-500 mt-1">{product.deskripsi}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(product.harga)}</p>
                  <p className="text-sm text-gray-500">Stok: {product.stok}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Jumlah:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stok}
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stok === 0 || (quantities[product.id] || 1) > product.stok}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stok === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
