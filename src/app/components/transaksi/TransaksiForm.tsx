'use client';

import React, { useState, useEffect } from 'react';
import ProductSelector from '@/app/components/transaksi/ProductSelector';
import CartSummary from '@/app/components/transaksi/CartSummary';
import CustomerSelector from '@/app/components/transaksi/CustomerSelector';
import { useCart, CartUtils } from '@/app/hooks/useCart';
import type { CreateTransaksiRequest, Pelanggan, Transaksi } from '@/types/transaksi';

interface TransaksiFormProps {
  onSubmit: (data: CreateTransaksiRequest) => void;
  onCancel: () => void;
  submitLabel: string;
  initialData?: Transaksi;
}

export default function TransaksiForm({ onSubmit, onCancel, submitLabel, initialData }: TransaksiFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Pelanggan | null>(null);
  const [catatan, setCatatan] = useState('');
  const [currentStep, setCurrentStep] = useState<'customer' | 'products' | 'review'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    validateCart,
  } = useCart();

  useEffect(() => {
    if (initialData) {
      setSelectedCustomer({
        id: initialData.id_pelanggan,
        nama: initialData.nama_pelanggan,
        alamat: '', 
        no_telp: '', 
        tanggal_gabung: ''
      });
      setCatatan(initialData.catatan || '');
    }
  }, [initialData]);

  const handleCustomerNext = () => {
    if (!selectedCustomer) {
      setError('Silakan pilih pelanggan terlebih dahulu');
      return;
    }

    setError(null);
    setCurrentStep('products');
  };

  const handleProductsNext = () => {
    const cartErrors = validateCart();
    if (cartErrors.length > 0) {
      setError(cartErrors.join(', '));
      return;
    }

    setError(null);
    setCurrentStep('review');
  };

  const handleFinalSubmit = async () => {
    if (!selectedCustomer) {
      setError('Data pelanggan tidak ditemukan');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('=== TRANSACTION DEBUG ===');
      console.log('Selected customer:', selectedCustomer);
      console.log('Cart items before conversion:', cartItems);
      console.log('Converted detail_transaksi:', CartUtils.convertCartToDetailRequests(cartItems));
      
      const finalData: CreateTransaksiRequest = {
        id_pelanggan: selectedCustomer.id,
        nama_pelanggan: selectedCustomer.nama,
        catatan: catatan.trim() || undefined,
        detail_transaksi: CartUtils.convertCartToDetailRequests(cartItems),
      };

      console.log('Final data structure:');
      console.log('- id_pelanggan:', finalData.id_pelanggan, typeof finalData.id_pelanggan);
      console.log('- nama_pelanggan:', finalData.nama_pelanggan, typeof finalData.nama_pelanggan);
      console.log('- catatan:', finalData.catatan);
      console.log('- detail_transaksi length:', finalData.detail_transaksi.length);
      finalData.detail_transaksi.forEach((detail, index) => {
        console.log(`  [${index}]:`, {
          id_produk: detail.id_produk,
          nama_produk: detail.nama_produk,
          harga_satuan: detail.harga_satuan,
          jumlah: detail.jumlah
        });
      });
      console.log('Raw JSON:', JSON.stringify(finalData, null, 2));
      console.log('==========================');

      await onSubmit(finalData);
    } catch (err) {
      console.error('Error in handleFinalSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'products') {
      setCurrentStep('customer');
    } else if (currentStep === 'review') {
      setCurrentStep('products');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center ${currentStep === 'customer' ? 'text-blue-600' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'customer' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            1
          </div>
          <span className="ml-2 font-medium">Data Pelanggan</span>
        </div>
        
        <div className={`w-8 h-0.5 ${currentStep !== 'customer' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center ${
          currentStep === 'customer' ? 'text-gray-400' : 
          currentStep === 'products' ? 'text-blue-600' : 'text-green-600'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'customer' ? 'bg-gray-300 text-gray-600' :
            currentStep === 'products' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Pilih Produk</span>
        </div>
        
        <div className={`w-8 h-0.5 ${currentStep === 'review' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            3
          </div>
          <span className="ml-2 font-medium">Review & Simpan</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Step 1: Customer Data */}
      {currentStep === 'customer' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Pelanggan</h3>
            
            <div className="space-y-6">
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onCustomerSelect={setSelectedCustomer}
              />

              <div>
                <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan tambahan untuk transaksi ini..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCustomerNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Lanjut ke Pilih Produk
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Product Selection */}
      {currentStep === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* ✅ Fixed: Only pass onAddToCart prop */}
              <ProductSelector onAddToCart={addToCart} />
            </div>
            <div>
              <CartSummary
                cartItems={cartItems}
                onUpdateQuantity={updateCartItemQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleProductsNext}
              disabled={cartItems.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              Lanjut ke Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 'review' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Transaksi</h3>
            
            {/* Customer Info */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Informasi Pelanggan</h4>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>ID:</strong> {selectedCustomer?.id}</p>
                <p><strong>Nama:</strong> {selectedCustomer?.nama}</p>
                <p><strong>Alamat:</strong> {selectedCustomer?.alamat}</p>
                <p><strong>No. Telepon:</strong> {selectedCustomer?.no_telp}</p>
                {catatan && <p><strong>Catatan:</strong> {catatan}</p>}
              </div>
            </div>

            {/* Products */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Produk yang Dibeli</h4>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id_produk} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <p className="font-medium">{item.nama_produk}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.harga_satuan)} × {item.jumlah}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Harga:</span>
                <span className="text-green-600">{formatCurrency(getCartTotal())}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}