import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Building Store
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistem manajemen toko untuk transaksi, pelanggan, dan produk
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link
            href="/transaksi"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors"
          >
            <h2 className="text-2xl font-bold mb-2">Transaksi</h2>
            <p>Kelola transaksi penjualan</p>
          </Link>
          
          <Link
            href="/pelanggan"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors"
          >
            <h2 className="text-2xl font-bold mb-2">Pelanggan</h2>
            <p>Manajemen data pelanggan</p>
          </Link>
          
          <Link
            href="/produk"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors"
          >
            <h2 className="text-2xl font-bold mb-2">Produk</h2>
            <p>Kelola inventory produk</p>
          </Link>
        </div>
      </div>
    </div>
  );
}