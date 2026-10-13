'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const links = [
  { href: '#highlights', label: 'Produk terlaris' },
  { href: '#collections', label: 'Koleksi' },
  { href: '#builder', label: 'Rakit PC online' },
  { href: '/products', label: 'Semua produk' },
]

export default function MobileMenu({ account }: { account?: { href: string; label: string } }) {
  const items = account ? [...links, account] : links
  const [isOpen, setIsOpen] = useState(false)

  return <div className="mobile-menu">
    <button className={isOpen ? 'mobile-menu-trigger is-open' : 'mobile-menu-trigger'} onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={isOpen}><span /><span /></button>
    <AnimatePresence>
      {isOpen && <motion.div className="mobile-menu-panel" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .22 }}>
        <p className="eyebrow">Gila Komputer / navigasi</p>
        {items.map((link, index) => <Link href={link.href} key={link.href} onClick={() => setIsOpen(false)}><span>0{index + 1}</span>{link.label}<b>↗</b></Link>)}
      </motion.div>}
    </AnimatePresence>
  </div>
}
