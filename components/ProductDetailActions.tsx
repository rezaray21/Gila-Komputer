'use client'

import { useState } from 'react'

type Product = { id: number; name: string; category: string; price: number; stock: number }

export default function ProductDetailActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)

  const addToCart = () => {
    for (let index = 0; index < quantity; index += 1) {
      window.dispatchEvent(new CustomEvent('gila:add-to-cart', { detail: { id: String(product.id), name: product.name, category: product.category, price: product.price } }))
    }
  }

  return <div className="product-detail-actions"><div className="detail-quantity"><button onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Kurangi jumlah">−</button><span>{quantity}</span><button onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} aria-label="Tambah jumlah">＋</button></div><button className="button button-dark" onClick={addToCart} disabled={product.stock === 0}>Tambah ke keranjang <span>＋</span></button></div>
}
