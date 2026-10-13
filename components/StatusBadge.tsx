import { statusLabel } from '@/lib/order-status'

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{statusLabel(status)}</span>
}
