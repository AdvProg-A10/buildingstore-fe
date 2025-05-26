export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
  code: string;
}

export interface DetailTransaksi {
  id: number;
  id_transaksi: number;
  id_produk: number;
  nama_produk?: string;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
}

export interface Transaksi {
  id: number;
  id_pelanggan: number;
  nama_pelanggan: string;
  tanggal_transaksi: string;
  total_harga: number;
  status: string;
  catatan?: string;
}

export interface CreateTransaksiRequest {
  id_pelanggan: number;
  nama_pelanggan: string;
  catatan?: string;
  detail_transaksi: CreateDetailTransaksiRequest[];
}

export interface CreateDetailTransaksiRequest {
  id_produk: number;
  nama_produk: string;
  harga_satuan: number;
  jumlah: number;
}

export interface TransaksiFilters {
  sort?: string;
  status?: string;
  filter?: string;
  keyword?: string;
  id_pelanggan?: number;
  page?: number;
  limit?: number;
}

export interface TransaksiSearchResult {
  transaksi: Transaksi[];
  total: number;
  page: number;
  limit: number;
}

export interface CartItem {
  id_produk: number;
  nama_produk: string;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
  stok_tersedia?: number;
}

export interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
}

export interface Pelanggan {
  id: number;
  nama: string;
  alamat: string;
  no_telp: string;
  tanggal_gabung: string;
}

