export interface WateringLogEntry {
  id: string;
  timestamp: number;
  week: number;
  inputPh: number;
  inputEc: number;
  drainPh?: number;
  drainEc?: number;
  amountLiters?: number;
}

const KEY = 'kcang_watering_log';

export function loadWateringLog(): WateringLogEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function saveWateringEntry(entry: WateringLogEntry) {
  const all = loadWateringLog();
  all.push(entry);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteWateringEntry(id: string) {
  const all = loadWateringLog().filter(item => item.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
