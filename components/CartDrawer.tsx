'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type CartItem = { id: string; name: string; category: string; price: number }

const CART_STORAGE_KEY = 'gila-komputer-cart'

type StoredCartItem = CartItem & { quantity: number }

const emitCartUpdate = (items: StoredCartItem[]) => {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('gila:cart-updated', { detail: { items } }))
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<StoredCartItem[]>([])
  const hasMounted = useRef(false)

  useEffect(() => {
    const storedItems = window.localStorage.getItem(CART_STORAGE_KEY)
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems) as StoredCartItem[]
        if (Array.isArray(parsedItems)) window.setTimeout(() => setItems(parsedItems), 0)
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY)
      }
    }

    const addItem = (event: Event) => {
      const item = (event as CustomEvent<CartItem>).detail
      setItems((current) => {
        const existingItem = current.find((existing) => existing.id === item.id)
        return existingItem
          ? current.map((existing) => existing.id === item.id ? { ...existing, quantity: existing.quantity + 1 } : existing)
          : [...current, { ...item, quantity: 1 }]
      })
      setIsOpen(true)
    }
    const openCart = () => setIsOpen(true)
    window.addEventListener('gila:add-to-cart', addItem)
    window.addEventListener('gila:open-cart', openCart)
    return () => {
      window.removeEventListener('gila:add-to-cart', addItem)
      window.removeEventListener('gila:open-cart', openCart)
    }
  }, [])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    emitCartUpdate(items)
  }, [items])

  const updateQuantity = (id: string, change: number) => {
    const nextItems = items.flatMap((item) => {
      if (item.id !== id) return [item]
      const quantity = item.quantity + change
      return quantity > 0 ? [{ ...item, quantity }] : []
    })
    setItems(nextItems)
  }

  const removeItem = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id)
    setItems(nextItems)
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return <AnimatePresence>{isOpen && <>
    <motion.button className="cart-backdrop" aria-label="Tutup keranjang" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} />
    <motion.aside className="cart-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} aria-label="Keranjang belanja">
      <div className="cart-header"><div><p className="eyebrow">Gila Komputer / your keranjang</p><h2>Siap<br /><em>berangkat.</em></h2></div><button className="cart-close" onClick={() => setIsOpen(false)} aria-label="Tutup keranjang">×</button></div>
      <div className="cart-items">{items.length ? items.map((item) => <div className="cart-item" key={item.id}><div><p>{item.category}</p><strong>{item.name}</strong><div className="cart-quantity"><button onClick={() => updateQuantity(item.id, -1)} aria-label={`Kurangi ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label={`Tambah ${item.name}`}>＋</button><button onClick={() => removeItem(item.id)} aria-label={`Hapus ${item.name}`}>Hapus</button></div></div><span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span></div>) : <div className="cart-empty"><span>＋</span><p>Belum ada komponen.<br />Tambahkan pilihan pertamamu.</p></div>}</div>
      <div className="cart-footer"><div><span>Estimasi total</span><strong>Rp {total.toLocaleString('id-ID')}</strong></div><Link href="/checkout" className={items.length ? 'button button-dark' : 'button button-dark is-disabled'} aria-disabled={!items.length} onClick={(event) => { if (!items.length) event.preventDefault() }}>Lanjutkan <span>↗</span></Link></div>
    </motion.aside>
  </>}</AnimatePresence>
}
