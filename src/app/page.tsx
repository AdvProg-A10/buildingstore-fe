import { FaShoppingCart, FaBoxes, FaUsers, FaMoneyBillWave, FaUserFriends, FaKey, FaUser } from 'react-icons/fa';
import { redirect } from 'next/navigation';
import { checkAuth } from '@/lib/auth';

export default async function Home() {
  let user = null;
  try {
    user = await checkAuth();
    if (user == null) {
      redirect('/login');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/login'); 
  }

  if (user?.is_admin) {
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
            href="/transaksi"
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
            title="Registrasi Pengguna"
            icon={<FaUser className="w-6 h-6" />}
            href="/registrasi-pengguna"
            color="bg-red-500"
          />
          <DashboardCard
            title="Ganti Password"
            icon={<FaKey className="w-6 h-6" />}
            href="/ganti-password"
            color="bg-gray-600"
          />
        </div>
      </div>
    );
  }
  else {
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
            href="/transaksi"
            color="bg-blue-500"
          />
          <DashboardCard
            title="Manajemen Pelanggan"
            icon={<FaUsers className="w-6 h-6" />}
            href="/manajemen-pelanggan"
            color="bg-purple-500"
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
      </div>
    );
  }
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
