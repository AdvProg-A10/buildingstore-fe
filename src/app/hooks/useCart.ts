'use client';

import { useState, useCallback } from 'react';
import type { CartItem, Produk } from '@/types/transaksi';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((produk: Produk, jumlah: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id_produk === produk.id);
      
      if (existingItem) {
        // Update existing item
        return prev.map(item => 
          item.id_produk === produk.id 
            ? {
                ...item,
                jumlah: item.jumlah + jumlah,
                subtotal: (item.jumlah + jumlah) * item.harga_satuan
              }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id_produk: produk.id,
          nama_produk: produk.nama,
          harga_satuan: produk.harga,
          jumlah: jumlah,
          subtotal: produk.harga * jumlah,
          stok_tersedia: produk.stok
        };
        return [...prev, newItem];
      }
    });
  }, []);

  const updateCartItemQuantity = useCallback((id_produk: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id_produk !== id_produk));
      return;
    }

    setCartItems(prev => prev.map(item => 
      item.id_produk === id_produk 
        ? {
            ...item,
            jumlah: newQuantity,
            subtotal: newQuantity * item.harga_satuan
          }
        : item
    ));
  }, []);

  const removeFromCart = useCallback((id_produk: number) => {
    setCartItems(prev => prev.filter(item => item.id_produk !== id_produk));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.jumlah, 0);
  }, [cartItems]);

  const validateCart = useCallback(() => {
    const errors: string[] = [];
    
    if (cartItems.length === 0) {
      errors.push('Keranjang kosong');
    }

    cartItems.forEach(item => {
      if (item.stok_tersedia && item.jumlah > item.stok_tersedia) {
        errors.push(`${item.nama_produk}: jumlah melebihi stok tersedia`);
      }
      if (item.jumlah <= 0) {
        errors.push(`${item.nama_produk}: jumlah tidak valid`);
      }
    });

    return errors;
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    validateCart,
  };
}

export const CartUtils = {
  convertCartToDetailRequests: (cartItems: CartItem[]): import('@/types/transaksi').CreateDetailTransaksiRequest[] => {
    return cartItems.map(item => ({
      id_produk: item.id_produk,
      nama_produk: item.nama_produk,
      jumlah: item.jumlah,
      harga_satuan: item.harga_satuan,
    }));
  },
};