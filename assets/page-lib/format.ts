// Vietnamese formatting: dd/mm/yyyy, 24-hour clock, VND. Database Function timestamps are Base-time-zone strings
// "YYYY-MM-DD HH:mm:ss.SSS" (Asia/Bangkok = UTC+07:00, same as Việt Nam).
export const BASE_UTC_OFFSET = '+07:00';
export const NO_DATA = 'Chưa có dữ liệu';

export function baseTimeToEpoch(value: unknown): number | null {
  if (typeof value !== 'string' || value.length < 10) return null;
  const iso = `${value.slice(0, 10)}T${value.length > 10 ? value.slice(11, 23) : '00:00:00'}${BASE_UTC_OFFSET}`;
  const epoch = Date.parse(iso);
  return Number.isFinite(epoch) ? epoch : null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function fmtDate(value: unknown): string {
  if (typeof value !== 'string' || value.length < 10) return '—';
  return `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`;
}

export function fmtDateTime(value: unknown): string {
  if (typeof value !== 'string' || value.length < 16) return fmtDate(value);
  return `${fmtDate(value)} ${value.slice(11, 16)}`;
}

/** Epoch → "YYYY-MM-DD HH:mm" in Việt Nam time (for inputs sent to FaaS). */
export function epochToBaseText(epoch: number): string {
  const d = new Date(epoch + 7 * 3600_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function relativeTime(value: unknown, now = Date.now()): string {
  const epoch = baseTimeToEpoch(value);
  if (epoch === null) return '—';
  const diff = now - epoch;
  const abs = Math.abs(diff);
  const minute = 60_000;
  const future = diff < 0;
  const fmt = (n: number, unit: string) => (future ? `còn ${n} ${unit}` : `${n} ${unit} trước`);
  if (abs < minute) return future ? 'sắp tới' : 'vừa xong';
  if (abs < 60 * minute) return fmt(Math.round(abs / minute), 'phút');
  if (abs < 24 * 60 * minute) return fmt(Math.round(abs / (60 * minute)), 'giờ');
  if (abs < 30 * 24 * 60 * minute) return fmt(Math.round(abs / (24 * 60 * minute)), 'ngày');
  return fmtDate(value);
}

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
export const fmtMoney = (value: unknown) => (typeof value === 'number' ? vnd.format(value) : '—');
export const fmtPrice = (value: unknown) => (typeof value === 'number' && value > 0 ? vnd.format(value) : 'Miễn phí');
const num = new Intl.NumberFormat('vi-VN');
export const fmtNumber = (value: unknown) => (typeof value === 'number' ? num.format(value) : '—');

export function fmtDuration(seconds: unknown): string {
  if (typeof seconds !== 'number' || seconds <= 0) return '—';
  if (seconds < 60) return `${Math.round(seconds)} giây`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

/** Percentage with the "no data" rule: null/NaN or zero denominators never show as 0 %. */
export function pct(done: number | null | undefined, total: number | null | undefined): number | null {
  if (typeof done !== 'number' || typeof total !== 'number' || total <= 0) return null;
  return Math.round((done / total) * 100);
}
export const fmtPct = (value: number | null | undefined) => (typeof value === 'number' && Number.isFinite(value) ? `${value}%` : NO_DATA);
export const fmtScore = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value * 10) / 10}` : NO_DATA);

export function avgRating(starSum: unknown, count: unknown): number | null {
  if (typeof starSum !== 'number' || typeof count !== 'number' || count <= 0) return null;
  return Math.round((starSum / count) * 10) / 10;
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts.length > 1 ? parts[parts.length - 2][0] : '';
  return `${first}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Lower-case text without Vietnamese diacritics, matching the "Từ khóa tìm kiếm" fields. */
export function searchText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
}
export const likePattern = (value: string) => {
  const text = searchText(value);
  return text ? `%${text}%` : '%';
};

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Value of a URL-style text field read through a Database Function ({text, link}) or a plain string. */
export function urlValue(value: unknown): string | null {
  if (typeof value === 'string') return value || null;
  if (value && typeof value === 'object') {
    const v = value as { link?: unknown; text?: unknown };
    if (typeof v.link === 'string' && v.link) return v.link;
    if (typeof v.text === 'string' && v.text) return v.text;
  }
  return null;
}
