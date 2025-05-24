import { FaShoppingCart, FaBoxes, FaUsers, FaMoneyBillWave, FaUserFriends, FaKey } from 'react-icons/fa';
import { redirect } from 'next/navigation';
import { checkAuth } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  try {
    const user = await checkAuth();
    if (user == null) {
      redirect('/login');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login'); 
  }

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to BuildingStore POS System</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Transaksi Penjualan"
          icon={<FaShoppingCart className="w-6 h-6" />}
          href="/transaksi-penjualan"
          color="bg-blue-500"
        />
        <DashboardCard
          title="Manajemen Produk"
          icon={<FaBoxes className="w-6 h-6" />}
          href="/manajemen-produk"
          color="bg-green-500"
        />
        <DashboardCard
          title="Manajemen Pelanggan"
          icon={<FaUsers className="w-6 h-6" />}
          href="/manajemen-pelanggan"
          color="bg-purple-500"
        />
        <DashboardCard
          title="Manajemen Supplier"
          icon={<FaUserFriends className="w-6 h-6" />}
          href="/manajemen-supplier"
          color="bg-orange-500"
        />
        <DashboardCard
          title="Manajemen Pembayaran"
          icon={<FaMoneyBillWave className="w-6 h-6" />}
          href="/manajemen-pembayaran"
          color="bg-yellow-600"
        />
        <DashboardCard
          title="Ganti Password"
          icon={<FaKey className="w-6 h-6" />}
          href="/ganti-password"
          color="bg-gray-600"
        />
      </div>
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

function DashboardCard({ title, icon, href, color }: {
  title: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      className="block p-6 rounded-lg shadow hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color} text-white`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
    </a>
  );
}
