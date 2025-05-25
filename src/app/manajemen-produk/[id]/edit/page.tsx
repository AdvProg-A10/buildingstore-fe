// src/app/manajemen-produk/[id]/edit/page.tsx

export default function EditProduk() {
  return (
    <div className="p-6 text-black max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Produk</h1>
      <form className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-medium">Nama Produk</label>
          <input
            type="text"
            placeholder="Nama Produk"
            defaultValue="Contoh Produk"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Harga</label>
          <input
            type="number"
            placeholder="Harga"
            defaultValue={100000}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Stok</label>
          <input
            type="number"
            placeholder="Stok"
            defaultValue={20}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Kategori</label>
          <input
            type="text"
            placeholder="Kategori"
            defaultValue="Material"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Deskripsi</label>
          <textarea
            placeholder="Deskripsi"
            defaultValue="Deskripsi produk contoh"
            rows={4}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Update
        </button>
      </form>
    </div>
  );
}
