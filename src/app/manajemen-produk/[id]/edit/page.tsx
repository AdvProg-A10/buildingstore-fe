//src/app/manajemen-produk/[id]/edit/page.tsx
export default function EditProduk() {
    return (
      <div className="text-black">
        <h1>Edit Produk</h1>
        <form style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: 400 }}>
          <input placeholder="Nama Produk" defaultValue="Contoh Produk" />
          <input placeholder="Harga" type="number" defaultValue={100000} />
          <input placeholder="Stok" type="number" defaultValue={20} />
          <input placeholder="Kategori" defaultValue="Material" />
          <textarea placeholder="Deskripsi" defaultValue="Deskripsi produk contoh" rows={4}></textarea>
          <button type="submit">Update</button>
        </form>
      </div>
    );
}
