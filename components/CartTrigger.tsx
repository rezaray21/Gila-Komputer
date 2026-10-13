'use client'

import { useEffect, useState } from 'react'

type CartItem = { quantity: number }

const CART_STORAGE_KEY = 'gila-komputer-cart'

export default function CartTrigger() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const updateCount = (items: CartItem[]) => setCount(items.reduce((sum, item) => sum + item.quantity, 0))
    const storedItems = window.localStorage.getItem(CART_STORAGE_KEY)
    if (storedItems) {
      try {
        updateCount(JSON.parse(storedItems) as CartItem[])
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY)
      }
    }

    const handleCartUpdate = (event: Event) => updateCount((event as CustomEvent<{ items: CartItem[] }>).detail.items)
    window.addEventListener('gila:cart-updated', handleCartUpdate)
    return () => window.removeEventListener('gila:cart-updated', handleCartUpdate)
  }, [])

  return <button className="nav-cart" onClick={() => window.dispatchEvent(new Event('gila:open-cart'))}>Keranjang <span>{count}</span></button>
}
