/** Local calendar day key, e.g. "2026-10-19". Used for daily-reset features. */
export const todayKey = (d: Date = new Date()): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/** Next local midnight as a timestamp (ms). */
export const nextMidnight = (from: Date = new Date()): number => {
    const next = new Date(from);
    next.setHours(24, 0, 0, 0);
    return next.getTime();
};

export const WHEEL_STORAGE_KEY = 'wheel-last-spin-day';
