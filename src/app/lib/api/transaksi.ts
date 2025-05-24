// src/app/lib/api/transaksi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Transaksi {
  id: number;
  id_pelanggan: number;
  nama_pelanggan: string;
  tanggal_transaksi: string;
  total_harga: number;
  status: 'MASIH_DIPROSES' | 'SELESAI' | 'DIBATALKAN';
  catatan?: string;
}

export interface DetailTransaksi {
  id: number;
  id_transaksi: number;
  id_produk: number;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
}

export interface CreateTransaksiRequest {
  id_pelanggan: number;
  nama_pelanggan: string;
  catatan?: string;
  detail_transaksi: CreateDetailTransaksiRequest[];
}

export interface CreateDetailTransaksiRequest {
  id_produk: number;
  jumlah: number;
}

// Frontend cart item for managing products before creating transaction
export interface CartItem {
  id_produk: number;
  nama_produk: string;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
  stok_tersedia?: number; // Optional for stock validation
}

// Product interface for product selection
export interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
}

export interface TransaksiFilters {
  sort?: string;
  filter?: string;
  keyword?: string;
  status?: string;
  id_pelanggan?: number;
}

class TransaksiAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET /api/transaksi
  async getAllTransaksi(filters?: TransaksiFilters): Promise<Transaksi[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const query = params.toString();
    const endpoint = query ? `/api/transaksi?${query}` : '/api/transaksi';
    
    return this.request<Transaksi[]>(endpoint);
  }

  // POST /api/transaksi - Create transaction with products
  async createTransaksi(data: CreateTransaksiRequest): Promise<Transaksi> {
    return this.request<Transaksi>('/api/transaksi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // GET /api/transaksi/{id}
  async getTransaksiById(id: number): Promise<Transaksi> {
    return this.request<Transaksi>(`/api/transaksi/${id}`);
  }

  // PATCH /api/transaksi/{id}
  async updateTransaksi(id: number, data: Partial<Transaksi>): Promise<Transaksi> {
    return this.request<Transaksi>(`/api/transaksi/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...data, id }),
    });
  }

  // DELETE /api/transaksi/{id}
  async deleteTransaksi(id: number): Promise<void> {
    await this.request(`/api/transaksi/${id}`, {
      method: 'DELETE',
    });
  }

  // PUT /api/transaksi/{id}/complete
  async completeTransaksi(id: number): Promise<Transaksi> {
    return this.request<Transaksi>(`/api/transaksi/${id}/complete`, {
      method: 'PUT',
    });
  }

  // PUT /api/transaksi/{id}/cancel
  async cancelTransaksi(id: number): Promise<Transaksi> {
    return this.request<Transaksi>(`/api/transaksi/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // GET /api/transaksi/{id}/detail
  async getDetailTransaksi(id_transaksi: number): Promise<DetailTransaksi[]> {
    return this.request<DetailTransaksi[]>(`/api/transaksi/${id_transaksi}/detail`);
  }

  // POST /api/transaksi/{id}/detail
  async addDetailTransaksi(
    id_transaksi: number, 
    data: CreateDetailTransaksiRequest
  ): Promise<DetailTransaksi> {
    return this.request<DetailTransaksi>(`/api/transaksi/${id_transaksi}/detail`, {
      method: 'POST',
      body: JSON.stringify({ ...data, id_transaksi }),
    });
  }

  // PATCH /api/transaksi/{id}/detail/{detail_id}
  async updateDetailTransaksi(
    id_transaksi: number,
    detail_id: number,
    data: Partial<DetailTransaksi>
  ): Promise<DetailTransaksi> {
    return this.request<DetailTransaksi>(
      `/api/transaksi/${id_transaksi}/detail/${detail_id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ ...data, id: detail_id, id_transaksi }),
      }
    );
  }

  // DELETE /api/transaksi/{id}/detail/{detail_id}
  async deleteDetailTransaksi(id_transaksi: number, detail_id: number): Promise<void> {
    await this.request(`/api/transaksi/${id_transaksi}/detail/${detail_id}`, {
      method: 'DELETE',
    });
  }
}

// Product API for fetching product data
class ProdukAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Product API request failed:', error);
      throw error;
    }
  }

  // GET /api/produk
  async getAllProduk(): Promise<Produk[]> {
    return this.request<Produk[]>('/api/produk');
  }

  // GET /api/produk/{id}
  async getProdukById(id: number): Promise<Produk> {
    return this.request<Produk>(`/api/produk/${id}`);
  }
}

// Cart utilities
export class CartUtils {
  static createCartItem(produk: Produk, jumlah: number): CartItem {
    return {
      id_produk: produk.id,
      nama_produk: produk.nama,
      harga_satuan: produk.harga,
      jumlah,
      subtotal: produk.harga * jumlah,
      stok_tersedia: produk.stok,
    };
  }

  static updateCartItemQuantity(item: CartItem, jumlah: number): CartItem {
    return {
      ...item,
      jumlah,
      subtotal: item.harga_satuan * jumlah,
    };
  }

  static calculateTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  }

  static convertCartToDetailRequests(cartItems: CartItem[]): CreateDetailTransaksiRequest[] {
    return cartItems.map(item => ({
      id_produk: item.id_produk,
      jumlah: item.jumlah,
    }));
  }

  static validateCart(cartItems: CartItem[]): string[] {
    const errors: string[] = [];

    if (cartItems.length === 0) {
      errors.push('Keranjang tidak boleh kosong');
    }

    cartItems.forEach((item, index) => {
      if (item.jumlah <= 0) {
        errors.push(`Jumlah produk "${item.nama_produk}" harus lebih dari 0`);
      }

      if (item.stok_tersedia && item.jumlah > item.stok_tersedia) {
        errors.push(`Stok produk "${item.nama_produk}" tidak mencukupi (tersedia: ${item.stok_tersedia})`);
      }
    });

    return errors;
  }
}

export const transaksiAPI = new TransaksiAPI();
export const produkAPI = new ProdukAPI();