/**
 * Date utility functions for Capacity Compass
 */

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function isBeforeDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) < formatDate(date2);
}

export function isAfterDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) > formatDate(date2);
}

export function getDayOfWeek(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export function getMonthDay(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function calculateDurationHours(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate.getTime() - startDate.getTime();
  return Math.max(0, durationMs / (1000 * 60 * 60));
}

export function getDateFromTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return formatDate(date);
}
