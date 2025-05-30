/**
 * Format a JavaScript Date (or ISO string) as `YYYY-MM-DD`.
 * @param input  Date object or ISO date string
 * @returns      Formatted date string
 */
export function formatDate(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Parse an ISO date string into `DD/MM/YYYY` format.
 * @param isoDate  e.g. "2025-05-29T12:34:56Z"
 * @returns        Formatted date for display
 */
export function parseToDisplayDate(isoDate: string): string {
  const d = new Date(isoDate)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
