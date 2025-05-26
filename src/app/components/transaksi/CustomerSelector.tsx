'use client';

import React, { useState, useEffect } from 'react';
import { config } from '@/config';
import type { Pelanggan } from '@/types/transaksi';
import { FaSearch, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaCheck, FaTimes, FaUserPlus, FaRedo } from 'react-icons/fa';

interface CustomerSelectorProps {
  selectedCustomer: Pelanggan | null;
  onCustomerSelect: (customer: Pelanggan | null) => void;
}

export default function CustomerSelector({ selectedCustomer, onCustomerSelect }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${config.apiBaseUrl}/api/pelanggan`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      const customerData = Array.isArray(data) ? data : (data.data || []);
      setCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Gagal memuat data pelanggan');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.nama.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    customer.no_telp.includes(searchKeyword) ||
    customer.alamat.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleCustomerClick = (customer: Pelanggan) => {
    if (selectedCustomer?.id === customer.id) {
      onCustomerSelect(null);
    } else {
      onCustomerSelect(customer);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">Memuat Data Pelanggan</h3>
            <p className="text-gray-600">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-6 border border-red-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <FaTimes className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchCustomers}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FaRedo />
          <span>Coba Lagi</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2 text-blue-600" />
              Cari Pelanggan
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nama, nomor telepon, atau alamat..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                List
              </button>
            </div>
            
            <button
              onClick={fetchCustomers}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <FaRedo className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaUser className="text-green-600 text-xl" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-bold text-green-800">Pelanggan Terpilih</h4>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <FaCheck className="mr-1" />
                    Terpilih
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-green-700">
                    <FaUser className="text-sm" />
                    <span className="font-semibold">{selectedCustomer.nama}</span>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ID: {selectedCustomer.id}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-600">
                    <FaPhone className="text-sm" />
                    <span>{selectedCustomer.no_telp}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-green-600">
                    <FaMapMarkerAlt className="text-sm mt-0.5" />
                    <span className="text-sm">{selectedCustomer.alamat}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-500 text-xs">
                    <FaCalendarAlt />
                    <span>Bergabung {formatDate(selectedCustomer.tanggal_gabung)}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onCustomerSelect(null)}
              className="bg-white text-green-600 hover:bg-green-50 hover:text-green-700 p-2 rounded-lg border border-green-200 transition-colors"
              title="Batalkan pilihan"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaUserPlus className="mr-2 text-blue-600" />
              Pilih Pelanggan
            </h3>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {filteredCustomers.length} tersedia
            </span>
          </div>
        </div>
        
        <div className="p-6">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {searchKeyword ? 'Tidak ada hasil pencarian' : 'Belum ada pelanggan'}
              </h3>
              <p className="text-gray-600">
                {searchKeyword 
                  ? 'Coba kata kunci lain atau hapus filter pencarian'
                  : 'Tambahkan pelanggan baru untuk memulai transaksi'
                }
              </p>
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Hapus Filter
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }>
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer)}
                  className={`group relative cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                    viewMode === 'grid'
                      ? 'p-4 border-2 rounded-xl hover:shadow-lg'
                      : 'p-4 border rounded-lg hover:shadow-md flex items-center space-x-4'
                  } ${
                    selectedCustomer?.id === customer.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50'
                  }`}
                >
                  {selectedCustomer?.id === customer.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-xs" />
                    </div>
                  )}

                  {viewMode === 'grid' ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedCustomer?.id === customer.id
                            ? 'bg-blue-100'
                            : 'bg-gray-100 group-hover:bg-blue-100'
                        }`}>
                          <FaUser className={`${
                            selectedCustomer?.id === customer.id
                              ? 'text-blue-600'
                              : 'text-gray-500 group-hover:text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 truncate">{customer.nama}</div>
                          <div className="text-xs text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FaPhone className="text-xs" />
                          <span className="truncate">{customer.no_telp}</span>
                        </div>
                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                          <FaMapMarkerAlt className="text-xs mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2 text-xs">{customer.alamat}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <FaCalendarAlt />
                          <span>{formatDate(customer.tanggal_gabung)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedCustomer?.id === customer.id
                          ? 'bg-blue-100'
                          : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        <FaUser className={`${
                          selectedCustomer?.id === customer.id
                            ? 'text-blue-600'
                            : 'text-gray-500 group-hover:text-blue-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">{customer.nama}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ID: {customer.id}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FaPhone className="text-xs" />
                            <span>{customer.no_telp}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaCalendarAlt className="text-xs" />
                            <span>{formatDate(customer.tanggal_gabung)}</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-1 text-xs text-gray-500 mt-1">
                          <FaMapMarkerAlt className="mt-0.5" />
                          <span className="truncate">{customer.alamat}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}