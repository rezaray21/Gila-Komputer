'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRef } from 'react'

type Product = { id: number; name: string; slug: string; description: string; price: number; imageUrl: string; stock: number; category: { name: string } }

export default function ProductHighlights({ products }: { products: Product[] }) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const addToCart = (product: Product) => window.dispatchEvent(new CustomEvent('gila:add-to-cart', { detail: { id: String(product.id), name: product.name, category: product.category.name, price: product.price } }))
  const moveCarousel = (direction: number) => carouselRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' })

  return <section className="highlights-section">
    <div className="page-width highlights-heading"><div><p className="eyebrow">Pilihan Gila Komputer</p><h2>Komponen yang<br /><em>siap diajak serius.</em></h2><p className="highlights-intro">Favorit untuk build baru, upgrade besar, dan semua momen ketika laptop lama mulai menyerah.</p></div><div className="carousel-controls"><button onClick={() => moveCarousel(-1)} aria-label="Produk sebelumnya">←</button><button onClick={() => moveCarousel(1)} aria-label="Produk berikutnya">→</button></div></div>
    <motion.div ref={carouselRef} className="highlight-track page-width" drag="x" dragConstraints={{ left: -(Math.max(0, products.length - 1) * 360), right: 0 }} dragElastic={0.12} whileTap={{ cursor: 'grabbing' }}>
      {products.map((product) => <article className="highlight-card" key={product.id}>
        <Link href={`/products?focus=${product.slug}`} className="highlight-image">{product.imageUrl ? <Image src={product.imageUrl} alt={product.name} width={560} height={420} /> : <span>{product.category.name.slice(0, 1)}</span>}<span className="highlight-badge">{product.stock > 0 ? 'Ready stock' : 'Pre-order'}</span></Link>
        <div className="highlight-copy"><p className="eyebrow">{product.category.name}</p><Link href={`/products?focus=${product.slug}`}><h3>{product.name}</h3></Link><p>{product.description}</p><div className="highlight-bottom"><strong>Rp {product.price.toLocaleString('id-ID')}</strong><button onClick={() => addToCart(product)} aria-label={`Tambah ${product.name} ke keranjang`}>＋</button></div></div>
      </article>)}
    </motion.div>
  </section>
}
