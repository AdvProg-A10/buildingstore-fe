// src/app/manajemen-produk/page.tsx

export default function DaftarProduk() {
  return (
    <div className="p-6 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Produk</h1>
        <a
          href="/manajemen-produk/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ➕ Tambah Produk
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Nama</th>
              <th className="px-4 py-2 border">Harga</th>
              <th className="px-4 py-2 border">Stok</th>
              <th className="px-4 py-2 border">Kategori</th>
              <th className="px-4 py-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 border">001</td>
              <td className="px-4 py-2 border">Contoh Produk</td>
              <td className="px-4 py-2 border">100000</td>
              <td className="px-4 py-2 border">20</td>
              <td className="px-4 py-2 border">Material</td>
              <td className="px-4 py-2 border">
                <a
                  href="/manajemen-produk/001/edit"
                  className="text-blue-600 hover:underline mr-2"
                >
                  Edit
                </a>
                <button className="text-red-600 hover:underline">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
