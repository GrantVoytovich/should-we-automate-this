/**
 * storage.js — tiny localStorage wrapper so work survives a refresh.
 * Everything runs in the browser; there is no backend and nothing leaves the device.
 * Every read/write is wrapped in try/catch because localStorage can be unavailable
 * (private windows, blocked storage) and we never want that to crash the app.
 */
const KEY = 'should-we-automate-this:v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // storage blocked or data corrupt — start fresh rather than crash
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ignore: a failed save shouldn't interrupt the user. Worst case, work isn't persisted.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
