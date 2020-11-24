export function setDateToEndOfDay(date: string): string {
  return new Date(date).setHours(23, 59, 59, 999).toString()
}