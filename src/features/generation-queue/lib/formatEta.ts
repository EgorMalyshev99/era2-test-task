export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0 сек'
  if (seconds < 60) return `${seconds} сек`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins} мин ${secs} сек` : `${mins} мин`
}

export function formatCredits(credits: number): string {
  return `${credits} cr`
}

export function formatEta(seconds: number): string {
  if (seconds <= 0) return ''
  return `~${formatDuration(seconds)}`
}

export function formatTaskMeta(
  etaSeconds: number,
  durationMs: number,
  credits: number,
  queuePosition?: number,
): string {
  const parts: string[] = []
  if (queuePosition) parts.push(`#${queuePosition} в очереди`)
  if (etaSeconds > 0) parts.push(formatEta(etaSeconds))
  parts.push(formatDuration(Math.round(durationMs / 1000)))
  parts.push(formatCredits(credits))
  return parts.join(' · ')
}
