// src/app/components/transaksi/CartSummary.tsx
'use client';

import React from 'react';
import { CartItem } from '@/app/lib/api/transaksi';

interface CartSummaryProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id_produk: number, jumlah: number) => void;
  onRemoveItem: (id_produk: number) => void;
  onClearCart: () => void;
}

export default function CartSummary({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart 
}: CartSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.jumlah, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  };

  return (
    <div className="bg-white p-6 rounded-lg border sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Keranjang</h3>
        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Kosongkan
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">🛒</div>
          <p>Keranjang kosong</p>
          <p className="text-sm">Tambahkan produk untuk melanjutkan</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id_produk} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{item.nama_produk}</h4>
                    <p className="text-xs text-gray-600">{formatCurrency(item.harga_satuan)} per item</p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id_produk)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id_produk, item.jumlah - 1)}
                      disabled={item.jumlah <= 1}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium">{item.jumlah}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id_produk, item.jumlah + 1)}
                      disabled={item.stok_tersedia ? item.jumlah >= item.stok_tersedia : false}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-medium text-green-600">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>

                {item.stok_tersedia && item.jumlah > item.stok_tersedia && (
                  <p className="text-xs text-red-500 mt-1">
                    Melebihi stok tersedia ({item.stok_tersedia})
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Item:</span>
              <span>{getTotalItems()} item</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total Harga:</span>
              <span className="text-green-600">{formatCurrency(getTotalPrice())}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}