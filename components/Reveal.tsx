'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  return <motion.div className={className} initial={prefersReducedMotion ? false : { opacity: 0, y: 42, scale: .985, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.08, margin: '0px 0px -8% 0px' }} transition={{ duration: .8, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}
