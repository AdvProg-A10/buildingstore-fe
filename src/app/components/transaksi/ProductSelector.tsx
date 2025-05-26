'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { config } from '@/config';
import type { Produk } from '@/types/transaksi';
import { FaSearch, FaShoppingCart, FaBoxes, FaExclamationTriangle, FaRedo, FaBug } from 'react-icons/fa';

interface ProductSelectorProps {
  onAddToCart: (produk: Produk, jumlah: number) => void;
}

export default function ProductSelector({ onAddToCart }: ProductSelectorProps) {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      // Since backend shows 200 OK, let's directly call the working endpoint
      const apiUrl = `${config.apiBaseUrl}/api/produk`;
      console.log('🔍 Fetching products from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw response length:', responseText.length);
      console.log('📄 Raw response preview:', responseText.substring(0, 500));

      setDebugInfo({
        url: apiUrl,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 300),
      });

      let apiResponse;
      try {
        apiResponse = JSON.parse(responseText);
        console.log('✅ Parsed JSON successfully:', apiResponse);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Response bukan format JSON yang valid');
      }

      let backendProducts = [];
      
      if (apiResponse && typeof apiResponse === 'object') {
        if (Array.isArray(apiResponse)) {
          backendProducts = apiResponse;
          console.log('📦 Format: Direct array');
        }
        else if (apiResponse.success !== undefined) {
          if (apiResponse.success && apiResponse.data) {
            backendProducts = Array.isArray(apiResponse.data) ? apiResponse.data : [];
            console.log('📦 Format: Success wrapper with data');
          } else {
            const errorMsg = apiResponse.message || 'Backend returned success: false';
            console.error('❌ Backend error:', errorMsg);
            throw new Error(`Backend error: ${errorMsg}`);
          }
        }
        else if (apiResponse.data) {
          backendProducts = Array.isArray(apiResponse.data) ? apiResponse.data : [];
          console.log('📦 Format: Data wrapper');
        }
        else if (apiResponse.products) {
          backendProducts = Array.isArray(apiResponse.products) ? apiResponse.products : [];
          console.log('📦 Format: Products wrapper');
        }
        else {
          console.log('📦 Format: Single object or unknown structure');
          console.log('📦 Object keys:', Object.keys(apiResponse));
          
          if (apiResponse.id || apiResponse.nama || apiResponse.name) {
            backendProducts = [apiResponse];
            console.log('📦 Treated as single product');
          } else {
            throw new Error('Response structure tidak dikenali');
          }
        }
      } else {
        throw new Error('Response bukan object yang valid');
      }

      console.log('📦 Backend products found:', backendProducts.length);
      console.log('📦 Sample product:', backendProducts[0]);

      if (!Array.isArray(backendProducts)) {
        throw new Error('Products data bukan array');
      }

      if (backendProducts.length === 0) {
        console.log('⚠️ No products found in response');
        setProduk([]);
        return;
      }

      const transformedProducts: Produk[] = backendProducts.map((item: any, index: number) => {
        console.log(`🔄 Transforming product ${index}:`, item);
        
        const product: Produk = {
          id: item.id || item.ID || item.product_id || index + 1,
          nama: item.nama || item.name || item.product_name || item.title || `Produk ${index + 1}`,
          kategori: item.kategori || item.category || item.product_category || item.type || 'Tanpa Kategori',
          harga: parseFloat(item.harga || item.price || item.product_price || item.cost || 0),
          stok: parseInt(item.stok || item.stock || item.product_stock || item.quantity || 0),
          deskripsi: item.deskripsi || item.description || item.product_description || item.desc || undefined,
        };

        console.log(`✅ Transformed product ${index}:`, product);
        return product;
      });

      console.log('✅ All products transformed successfully:', transformedProducts.length);
      setProduk(transformedProducts);

    } catch (error) {
      console.error('❌ Error in fetchProducts:', error);
      setError(error instanceof Error ? error.message : 'Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getCategories = () => {
    const categories = produk.map(p => p.kategori);
    return [...new Set(categories)];
  };

  const filteredProducts = useMemo(() => {
    let filtered = produk;
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.kategori === selectedCategory);
    }
    
    if (searchKeyword) {
      filtered = filtered.filter(p => 
        p.nama.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.kategori.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (p.deskripsi && p.deskripsi.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }
    
    return filtered;
  }, [produk, searchKeyword, selectedCategory]);

  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  const handleAddToCart = (product: Produk) => {
    const quantity = quantities[product.id] || 1;
    onAddToCart(product, quantity);
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const handleDebugDetail = () => {
    console.log('🔍 === DETAILED DEBUG INFO ===');
    console.log('Config:', config);
    console.log('Debug info:', debugInfo);
    console.log('Current products state:', produk);
    console.log('===============================');
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 border-2 border-blue-200">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center">
              <FaBoxes className="mr-2 text-blue-600" />
              Memuat Produk
            </h3>
            <p className="text-gray-600">Mengambil data dari database...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-6 border-2 border-red-200">
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Gagal Akses Database Produk</h3>
            <p className="text-red-600 mb-4">{error}</p>
            
            {debugInfo && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
                  Debug Info (Click to expand)
                </summary>
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-xs space-y-2 font-mono">
                    <div><strong>URL:</strong> {debugInfo.url}</div>
                    <div><strong>Status:</strong> {debugInfo.status}</div>
                    <div><strong>Response Length:</strong> {debugInfo.responseLength} chars</div>
                    <div><strong>Response Preview:</strong></div>
                    <pre className="bg-white p-2 rounded border overflow-x-auto text-xs">
                      {debugInfo.responsePreview}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            <div className="text-sm text-red-700 mb-4">
              <strong>Yang bisa dicoba:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Pastikan database produk sudah diisi dengan data</li>
                <li>Periksa format response backend produk</li>
                <li>Bandingkan dengan endpoint pelanggan yang berfungsi</li>
                <li>Cek console browser untuk detail error</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchProducts}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaRedo />
            <span>Coba Lagi</span>
          </button>
          <button
            onClick={handleDebugDetail}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaBug />
            <span>Debug Console</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaBoxes className="mr-2 text-blue-600" />
              Pilih Produk
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {produk.length} produk tersedia
            </p>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <FaRedo className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2 text-blue-600" />
              Cari Produk
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari nama produk..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">Semua Kategori</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBoxes className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {searchKeyword || selectedCategory ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}
            </h3>
            <p className="text-gray-600">
              {searchKeyword || selectedCategory 
                ? 'Coba kata kunci lain atau hapus filter'
                : 'Database produk masih kosong'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-white"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{product.nama}</h4>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {product.kategori}
                    </span>
                    {product.deskripsi && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.deskripsi}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(product.harga)}</p>
                    <p className={`text-sm ${product.stok > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                      Stok: {product.stok}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max={product.stok}
                      value={quantities[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={product.stok === 0}
                    />
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stok === 0 || (quantities[product.id] || 1) > product.stok}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                  >
                    <FaShoppingCart className="text-xs" />
                    <span>{product.stok === 0 ? 'Habis' : 'Tambah'}</span>
                  </button>
                </div>

                {product.stok > 0 && (quantities[product.id] || 1) > product.stok && (
                  <p className="text-xs text-red-500 mt-2">
                    Jumlah melebihi stok tersedia
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}