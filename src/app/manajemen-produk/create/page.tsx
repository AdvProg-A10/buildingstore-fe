// src/app/manajemen-produk/create/page.tsx

export default function TambahProduk() {
  return (
    <div className="p-6 text-black max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tambah Produk</h1>
      <form className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-medium">Nama Produk</label>
          <input
            type="text"
            placeholder="Nama Produk"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Harga</label>
          <input
            type="number"
            placeholder="Harga"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Stok</label>
          <input
            type="number"
            placeholder="Stok"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Kategori</label>
          <input
            type="text"
            placeholder="Kategori"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Deskripsi</label>
          <textarea
            placeholder="Deskripsi"
            rows={4}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
