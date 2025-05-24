//src/app/manajemen-produk/page.tsx
export default function DaftarProduk() {
    return (
      <div className="text-black">
        <h1>Daftar Produk</h1>
        <a href="/manajemen-produk/create">➕ Tambah Produk</a>
        <table border={1} cellPadding={8} style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Kategori</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>001</td>
              <td>Contoh Produk</td>
              <td>100000</td>
              <td>20</td>
              <td>Material</td>
              <td>
                <a href="/manajemen-produk/001/edit">Edit</a> | <button>Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
}
  