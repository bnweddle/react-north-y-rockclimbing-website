function toUtcCalendarDate(value) {
  if (value == null || value === '') return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    console.error('Invalid date:', value)
    return null
  }

  date.setUTCHours(0, 0, 0, 0)
  return date
}

const formatDate = (value) => {
  const date = toUtcCalendarDate(value)
  if (!date) return ''
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${mm}-${dd}-${date.getUTCFullYear()}`
}

function monthAnniversary(date, months) {
  const anniversary = new Date(date)
  // Clamp to the last day of the target month instead of rolling into the next month.
  anniversary.setUTCMonth(date.getUTCMonth() + months + 1, 0)
  anniversary.setUTCDate(Math.min(date.getUTCDate(), anniversary.getUTCDate()))
  return anniversary
}

export function getRouteAgeStatus(value, now = new Date()) {
  const date = toUtcCalendarDate(value)
  const today = toUtcCalendarDate(now)
  if (!date || !today || date > today) return null

  if (today > monthAnniversary(date, 12)) return 'overdue'
  if (today >= monthAnniversary(date, 9)) return 'aging'
  if (today <= monthAnniversary(date, 1)) return 'new'
  return null
}

export default formatDate