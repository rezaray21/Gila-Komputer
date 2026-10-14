# Gila Komputer

Toko komponen PC berbasis Next.js 16 (App Router), React 19, Tailwind CSS 4, dan Prisma + MySQL/MariaDB.

## Fitur

- Katalog produk, halaman detail, dan **PC Builder** (cek kecocokan socket, tipe RAM, dan daya PSU).
- Keranjang (tersimpan di browser) dan checkout. **Checkout tamu tetap diizinkan**; bila pembeli login, pesanan otomatis masuk ke akunnya.
- Pembayaran masih **simulasi** (`app/api/orders/pay`), belum terhubung ke payment gateway.
- **Daftar & masuk pembeli** (`/daftar`, `/masuk`), halaman akun dengan riwayat pesanan (`/akun`).
- **Panel admin** (`/admin`): ringkasan; kelola produk dengan pencarian nama/slug/kategori/merek, filter status/kategori/merek/stok, urutkan harga atau jumlah stok, dan ringkasan stok menipis/habis; kelola pesanan (ubah status, stok otomatis kembali saat dibatalkan); serta daftar pengguna (bisa mengangkat pembeli menjadi admin).

## Menjalankan

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env — lalu isi DATABASE_URL
```

Bila muncul error `Environment variable not found: DATABASE_URL`, berarti file `.env` belum ada atau nama database-nya belum dibuat. Buat `.env` berisi satu baris, contoh untuk XAMPP standar:

```
DATABASE_URL="mysql://root:@localhost:3306/gilakomputer_db"
```

lalu buat database `gilakomputer_db` di phpMyAdmin dan jalankan ulang `npm run dev`.

**Database.** Pilih salah satu sesuai kondisi Anda:

- *Database sudah ada* (mis. XAMPP + phpMyAdmin, sudah berisi tabel `user`/`session`): jalankan `npx prisma db push`. Perintah ini menyelaraskan tabel dengan `prisma/schema.prisma` (menambah kolom `user.phone` dan `order.payToken`). Jangan pakai `prisma migrate dev` pada database yang tidak dibuat lewat migrasi, karena Prisma akan menawarkan reset yang menghapus data.
- *Database baru*: `npx prisma migrate deploy`, atau impor `prisma/mysql-schema.sql` lewat phpMyAdmin/mysql.

```bash
npm run db:seed             # isi 50 produk contoh dengan tautan gambar eksternal dari Google Images (opsional)
ADMIN_EMAIL=admin@toko.id ADMIN_PASSWORD='Rahasia123' ADMIN_NAME='Admin Toko' npm run admin:create
npm run dev                 # http://localhost:3000
```

Gambar produk contoh memakai tautan thumbnail eksternal hasil pencarian Google Images; gambar dimuat dari Google dan dapat berubah atau tidak tersedia bila sumbernya berubah. Hasil pencarian gambar tidak otomatis memberikan izin penggunaan komersial, jadi pastikan hak penggunaan dengan pemilik gambar sebelum toko dipublikasikan.

Di Windows PowerShell, set variabelnya dulu: `$env:ADMIN_EMAIL="admin@toko.id"; $env:ADMIN_PASSWORD="Rahasia123"; npm run admin:create`. Nilai-nilai itu juga boleh ditulis di `.env`. Admin tidak bisa dibuat lewat pendaftaran publik — tetapi setelah ada minimal satu admin, akun pembeli lain dapat diangkat menjadi admin dari halaman **/admin/users** (tombol "Jadikan Admin"). Admin yang sedang masuk tidak bisa menurunkan perannya sendiri.

Tes logika (validasi, status pesanan, token sesi, pembatas percobaan): `npm test`.

## Cara kerja login

- Sesi disimpan di tabel `Session`. Cookie `gk_session` berisi token acak 256-bit (`HttpOnly`, `SameSite=Lax`, `Secure` di produksi); database hanya menyimpan hash SHA-256-nya. Logout menghapus sesi di server.
- Role (`PEMBELI` / `ADMIN`) selalu dibaca dari database pada setiap request, jadi perubahan role atau penghapusan akun langsung berlaku.
- Akses `/admin` dijaga berlapis: `proxy.ts` (pengalihan cepat), `app/admin/layout.tsx` (pemeriksaan role), dan `guardAdminRequest` di setiap route `/api/admin/*`. Non-admin mendapat 404 di halaman dan 403 di API.
- Pesanan tamu dilindungi `payToken` acak yang hanya dikirim ke browser pembuatnya; pesanan milik akun hanya bisa dibayar atau dibatalkan oleh pemiliknya.
- Percobaan login dibatasi (5 kegagalan per email+IP per 15 menit). Pembatas ini disimpan di memori server, cukup untuk satu proses; untuk banyak instance pindahkan ke Redis atau tabel database.
- Cookie `Secure` hanya dikirim lewat HTTPS atau `localhost`. Bila aplikasi produksi diakses lewat HTTP biasa, login tidak akan tersimpan; pasang HTTPS.

## Catatan

- Produk berstatus `INACTIVE` disembunyikan dari katalog, detail, dan PC Builder. Produk yang sudah pernah dipesan tidak bisa dihapus, hanya dinonaktifkan.
- PC Builder mencocokkan nama kategori (`Motherboard`, `RAM`, `Power`, `VGA`) dan nama spesifikasi (`Socket`, `Memory`, `Type`, `TDP`, `Cores`, `Wattage`) secara persis. Jangan ubah ejaannya di panel admin.
- Gambar produk berupa path file di folder `public/` (mis. `/products/vga.svg`); unggah gambar dari panel admin belum tersedia.
