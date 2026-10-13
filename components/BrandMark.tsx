import Link from 'next/link'

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={compact ? 'brand-mark brand-mark-compact' : 'brand-mark'} aria-label="Gila Komputer, kembali ke beranda"><span className="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span><span className="brand-name">Gila<small>Komputer</small></span></Link>
}
