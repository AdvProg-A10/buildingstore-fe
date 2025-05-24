//src/app/manajemen-produk/[id]/page.tsx
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
      <div className="text-black">
        <h1>Detail Produk</h1>
        <p><strong>ID:</strong> {produk.id}</p>
        <p><strong>Nama:</strong> {produk.nama}</p>
        <p><strong>Harga:</strong> Rp{produk.harga}</p>
        <p><strong>Stok:</strong> {produk.stok}</p>
        <p><strong>Kategori:</strong> {produk.kategori}</p>
        <p><strong>Deskripsi:</strong> {produk.deskripsi}</p>
        <a href={`/manajemen-produk/${produk.id}/edit`} style={{ marginTop: "20px", display: "inline-block" }}>✏️ Edit Produk</a>
      </div>
    );
}  