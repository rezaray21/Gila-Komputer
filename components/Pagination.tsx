import Link from 'next/link'

type Props = { basePath: string; params: Record<string, string | undefined>; page: number; totalPages: number }

export default function Pagination({ basePath, params, page, totalPages }: Props) {
  if (totalPages <= 1) return null
  const href = (target: number) => {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) if (value) query.set(key, value)
    if (target > 1) query.set('page', String(target))
    const text = query.toString()
    return text ? `${basePath}?${text}` : basePath
  }
  return <nav className="admin-pagination" aria-label="Halaman">
    {page > 1 ? <Link href={href(page - 1)}>← Sebelumnya</Link> : <span />}
    <span>Halaman {page} dari {totalPages}</span>
    {page < totalPages ? <Link href={href(page + 1)}>Berikutnya →</Link> : <span />}
  </nav>
}
