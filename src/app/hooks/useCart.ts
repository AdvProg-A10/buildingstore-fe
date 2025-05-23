// src/app/hooks/useCart.ts
'use client';

import { useState, useCallback } from 'react';
import { CartItem, Produk, CartUtils } from '@/app/lib/api/transaksi';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((produk: Produk, jumlah: number = 1) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id_produk === produk.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].jumlah + jumlah;
        updatedItems[existingItemIndex] = CartUtils.updateCartItemQuantity(
          updatedItems[existingItemIndex], 
          newQuantity
        );
        return updatedItems;
      } else {
        // Add new item to cart
        const newCartItem = CartUtils.createCartItem(produk, jumlah);
        return [...prevItems, newCartItem];
      }
    });
  }, []);

  const updateCartItemQuantity = useCallback((id_produk: number, jumlah: number) => {
    setCartItems(prevItems => {
      if (jumlah <= 0) {
        // Remove item if quantity is 0 or less
        return prevItems.filter(item => item.id_produk !== id_produk);
      }
      
      return prevItems.map(item =>
        item.id_produk === id_produk
          ? CartUtils.updateCartItemQuantity(item, jumlah)
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback((id_produk: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id_produk !== id_produk));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return CartUtils.calculateTotal(cartItems);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.jumlah, 0);
  }, [cartItems]);

  const validateCart = useCallback(() => {
    return CartUtils.validateCart(cartItems);
  }, [cartItems]);

  const getCartItem = useCallback((id_produk: number) => {
    return cartItems.find(item => item.id_produk === id_produk);
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
    getCartItem,
  };
}