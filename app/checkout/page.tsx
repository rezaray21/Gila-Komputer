import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import CheckoutForm from '@/components/CheckoutForm'
import AccountMenu from '@/components/AccountMenu'
import { getCurrentUser } from '@/lib/auth'

export default async function CheckoutPage() {
  const user = await getCurrentUser()
  return (
    <main className="catalog-page checkout-page">
      <nav className="site-nav page-width catalog-nav"><BrandMark /><div className="nav-right"><Link href="/products" className="text-link">← Kembali belanja</Link><AccountMenu /></div></nav>
      <div className="page-width checkout-intro"><p className="eyebrow">Gila Komputer / checkout</p><h1>Selesaikan<br /><em>pesananmu.</em></h1><p>Tiga langkah mudah: isi data → pilih kirim & bayar → transaksi selesai. Harga dan stok dicek ulang saat pesanan dibuat.</p><ol className="checkout-guide" aria-label="Panduan singkat"><li><b>1</b> Isi nama, kontak, dan alamat pengirimannya.</li><li><b>2</b> Pilih ongkir dan metode bayar (e-wallet / bank / VA).</li><li><b>3</b> Tekan “Saya sudah bayar” — pesanan langsung terkonfirmasi.</li></ol>{!user && <p className="checkout-guest-note">Punya akun? <Link href="/masuk?next=%2Fcheckout">Masuk</Link> agar data terisi otomatis dan pesanan tersimpan di riwayatmu. Tanpa akun pun tetap bisa checkout sebagai tamu.</p>}</div>
      <div className="page-width"><CheckoutForm user={user ? { name: user.name, email: user.email, phone: user.phone } : null} /></div>
    </main>
  )
}
