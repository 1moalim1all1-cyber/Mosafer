// Interpret a travel date/time in the trip's country, never the server/browser timezone.
export function tripTime(date, time, country) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time)) return NaN
  const zone = country === 'saudi' ? 'Asia/Riyadh' : 'Africa/Cairo'
  const wall = Date.parse(`${date}T${time.length === 5 ? time + ':00' : time}Z`)
  if (!Number.isFinite(wall)) return NaN
  let instant = wall
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant))
    const v = Object.fromEntries(parts.map(p => [p.type, p.value]))
    const rendered = Date.parse(`${v.year}-${v.month}-${v.day}T${v.hour}:${v.minute}:${v.second}Z`)
    if (rendered === wall) return instant
    instant += wall - rendered
  }
  return NaN // Nonexistent local time during a DST jump.
}
