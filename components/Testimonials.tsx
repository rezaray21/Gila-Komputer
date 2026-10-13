'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

const testimonials = [
  { role: 'Competitive gamer', name: 'Raka Pratama', initials: 'RP', accent: '01', rating: '5.0', quote: 'Aku tinggal pilih target FPS dan budget. Tim Gila Komputer bantu arahkan komponennya sampai build-nya terasa pas, bukan sekadar mahal.', setup: 'Performance build / RTX 4070 Super' },
  { role: '3D artist', name: 'Nadia Kurnia', initials: 'NK', accent: '02', rating: '4.9', quote: 'Yang paling aku suka: semua dijelaskan dengan bahasa manusia. Sekarang render lebih cepat dan meja kerja tetap terasa rapi.', setup: 'Creator setup / Ryzen 7' },
  { role: 'Software developer', name: 'Bima Ardi', initials: 'BA', accent: '03', rating: '4.8', quote: 'Dari memilih RAM sampai storage, prosesnya transparan. Aku bisa fokus ngoding tanpa harus membuka dua puluh tab review komponen.', setup: 'Dev workstation / 32GB DDR5' },
  { role: 'Content student', name: 'Salsa Putri', initials: 'SP', accent: '04', rating: '5.0', quote: 'Ini pertama kalinya aku rakit PC sendiri. Builder-nya bikin semuanya terasa mudah dan tidak intimidating.', setup: 'Essential setup / NVMe 1TB' },
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = testimonials[activeIndex]

  return <section className="testimonials-section page-width" aria-label="Testimoni pelanggan Gila Komputer">
    <div className="testimonials-heading"><div><p className="eyebrow">Player feedback / verified builds</p><h2>Build yang<br /><em>punya cerita.</em></h2></div><p className="testimonials-kicker">Pilih profil untuk<br />mendengar pengalaman mereka.</p></div>
    <div className="testimonials-stage">
      <div className="character-select" role="tablist" aria-label="Pilih profil pelanggan">
        {testimonials.map((testimonial, index) => <button key={testimonial.name} className={index === activeIndex ? 'character-card is-active' : 'character-card'} onClick={() => setActiveIndex(index)} role="tab" aria-selected={index === activeIndex}>
          <span className="character-index">{testimonial.accent}</span><span className="character-avatar">{testimonial.initials}</span><span className="character-info"><strong>{testimonial.name}</strong><small>{testimonial.role}</small></span><span className="character-status" />
        </button>)}
      </div>
      <div className="testimonial-quote" role="tabpanel">
        <span className="quote-mark">“</span>
        <AnimatePresence mode="wait">
          <motion.div key={active.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .32, ease: 'easeOut' }}>
            <div className="quote-rating" aria-label={`Rating ${active.rating} dari 5`}><span>★★★★★</span><strong>{active.rating}</strong><small>verified customer</small></div><blockquote>{active.quote}</blockquote><div className="quote-meta"><span>{active.setup}</span><strong>{active.accent} / 04</strong></div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </section>
}
