const tones: Record<string, string> = {
  READY: 'ok',
  DELIVERED: 'ok',
  PENDING: 'wait',
  PROCESSING: 'wait',
  FAILED: 'bad',
  CANCELLED: 'bad',
  REFUNDED: 'neutral',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${tones[status] ?? 'neutral'}`}>
      {status}
    </span>
  );
}
