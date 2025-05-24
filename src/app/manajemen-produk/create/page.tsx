//src/app/manajemen-produk/create/page.tsx
export default function TambahProduk() {
    return (
      <div className="text-black">
        <h1>Tambah Produk</h1>
        <form style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: 400 }}>
          <input placeholder="Nama Produk" />
          <input placeholder="Harga" type="number" />
          <input placeholder="Stok" type="number" />
          <input placeholder="Kategori" />
          <textarea placeholder="Deskripsi" rows={4}></textarea>
          <button type="submit">Simpan</button>
        </form>
      </div>
    );
}
  