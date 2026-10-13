import Link from 'next/link'
import Hero3D from '@/components/Hero3D'
import Reveal from '@/components/Reveal'
import CartTrigger from '@/components/CartTrigger'
import ProductHighlights from '@/components/ProductHighlights'
import { prisma } from '@/lib/prisma'
import BrandMark from '@/components/BrandMark'
import Testimonials from '@/components/Testimonials'
import ManufacturerBrands from '@/components/ManufacturerBrands'
import MobileMenu from '@/components/MobileMenu'
import AccountMenu from '@/components/AccountMenu'
import { getCurrentUser } from '@/lib/auth'

export default async function Home() {
  const highlightedProducts = await prisma.product.findMany({ where: { status: 'ACTIVE' }, include: { category: true }, orderBy: { stock: 'desc' }, take: 6 })
  const user = await getCurrentUser()
  const account = user ? { href: '/akun', label: 'Akun saya' } : { href: '/masuk', label: 'Masuk / Daftar' }

  return (
    <main>
      <section className="hero-shell">
        <nav className="site-nav page-width"><BrandMark /><div className="nav-links"><Link href="#highlights">Terlaris</Link><Link href="#collections">Koleksi</Link><Link href="#builder">Rakit PC</Link><Link href="/products">Semua produk</Link></div><div className="mobile-nav-actions"><MobileMenu account={account} /><CartTrigger /></div><div className="desktop-account"><AccountMenu /></div><div className="desktop-cart"><CartTrigger /></div></nav>
        <div className="hero-content page-width"><div className="hero-copy"><p className="eyebrow hero-eyebrow">Gila Komputer / teman upgrade-mu</p><h1>Komputer <em>tanpa kompromi.</em></h1><p className="hero-description">Komponen yang tepat, performa yang terasa, dan rakitan yang dibuat untuk menemani ide-ide besarmu bekerja lebih jauh.</p><div className="hero-actions"><Link href="/products" className="button button-dark">Temukan komponen <span>↗</span></Link><Link href="#builder" className="text-link">Rakit PC sekarang <span>↓</span></Link></div></div><Hero3D /></div>
        <div className="hero-index page-width"><span></span><span className="index-line" /><span>Scroll kebawah kakak!</span></div>
      </section>
      <section className="signal-strip page-width" aria-label="Keunggulan Gila Komputer"><span>Gila Komputer / sejak 2026</span><span>Produk terkurasi</span><span>Harga transparan</span><span>Kami bantu</span></section>
      <Reveal><div id="highlights"><ProductHighlights products={highlightedProducts} /></div></Reveal>
      <Reveal><section id="collections" className="collection-section page-width"><div className="section-heading"><p className="eyebrow">Dibuat untuk cara kerjamu</p><h2>Temukan<br /><em>setup-mu.</em></h2><Link href="/products" className="text-link">Lihat semua komponen <span>↗</span></Link></div><div className="collection-grid"><Link href="/products" className="collection-card collection-card-dark"><span className="card-number">01</span><div><p>Untuk ide yang tak berhenti</p><h3>Creator rigs</h3></div><span className="card-arrow">↗</span></Link><Link href="/products" className="collection-card collection-card-accent"><span className="card-number">02</span><div><p>Untuk menang lebih cepat</p><h3>Performance builds</h3></div><span className="card-arrow">↗</span></Link><Link href="/products" className="collection-card collection-card-light"><span className="card-number">03</span><div><p>Untuk kerja yang lebih ringan</p><h3>Essential setups</h3></div><span className="card-arrow">↗</span></Link></div></section></Reveal>
      <Reveal><section id="builder" className="studio-section page-width"><div className="studio-visual"><div className="studio-ring" /><span>RAKIT / ONLINE</span></div><div className="studio-copy"><p className="eyebrow">Gila Komputer builder</p><h2>Mulai dari<br /><em>kebutuhanmu.</em></h2><p>Tidak perlu menebak-nebak spesifikasi. Pilih komponen sesuai kebutuhan dan budget, lihat estimasinya langsung, lalu kami bantu merakitnya dengan rapi.</p><Link href="/builder" className="button button-outline">Coba PC builder <span>↗</span></Link></div></section></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><section className="store-info page-width"><div><p className="eyebrow">Lebih dari sekadar toko, kami juga dapat mendengar keluhan anda-kecuali tentang wanita.</p><h2>Temui kami<br /><em>dan ceritakan idemu.</em></h2></div><div className="store-details"><div><span>Showroom & workshop</span><strong>Jl. Kemang Raya No. 18<br />Jakarta Selatan 12730</strong></div><div><span>Jam operasional</span><strong>Senin - Sabtu / 10.00 - 19.00<br />Minggu / 11.00 - 17.00</strong></div><div><span>Butuh rekomendasi?</span><strong>+62 812 9000 2626<br />halo@gilakomputer.id</strong></div><a href="https://maps.google.com/?q=Jl.+Kemang+Raya+No.+18+Jakarta" target="_blank" rel="noreferrer" className="button button-outline">Kunjungi showroom <span>↗</span></a></div></section></Reveal>
      <ManufacturerBrands />
      <footer className="site-footer page-width"><BrandMark /><p>Gila Komputer / bikin performa terasa.</p><span>Jakarta / Indonesia</span></footer>
    </main>
  )
}