// src/app/manajemen-produk/[id]/page.tsx

export default function DetailProduk() {
  // Untuk sekarang ini contoh statis, nanti bisa fetch dari backend
  const produk = {
    id: "001",
    nama: "Contoh Produk",
    harga: 100000,
    stok: 20,
    kategori: "Material",
    deskripsi: "Ini adalah produk contoh untuk testing tampilan."
  };

  return (
    <div className="p-6 text-black max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Detail Produk</h1>
      <div className="bg-white border rounded-lg shadow p-6 space-y-4">
        <p>
          <span className="font-semibold">ID:</span> {produk.id}
        </p>
        <p>
          <span className="font-semibold">Nama:</span> {produk.nama}
        </p>
        <p>
          <span className="font-semibold">Harga:</span> Rp{produk.harga.toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Stok:</span> {produk.stok}
        </p>
        <p>
          <span className="font-semibold">Kategori:</span> {produk.kategori}
        </p>
        <p>
          <span className="font-semibold">Deskripsi:</span> {produk.deskripsi}
        </p>
      </div>

      <a
        href={`/manajemen-produk/${produk.id}/edit`}
        className="inline-block mt-6 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
      >
        ✏️ Edit Produk
      </a>
    </div>
  );
}
