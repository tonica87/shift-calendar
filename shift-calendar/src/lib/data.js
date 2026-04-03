// 曜日定義
export const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// 営業時間: 10:00 - 22:00 を30分刻み
export function generateSlots(startHour = 10, endHour = 22) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

export const TIME_SLOTS = generateSlots();

// スロットキー: "mon-10:00"
export function slotKey(dayKey, time) {
  return `${dayKey}-${time}`;
}

// 新しい講師オブジェクト
export function createInstructor(name) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    available: {}, // { "mon-10:00": true, ... }
    teaching: {},  // { "mon-10:00": true, ... }
    createdAt: new Date().toISOString(),
  };
}

// 色パレット（講師ごとに割り当て）
const PALETTE = [
  '#5b8dee', '#e8734a', '#4caf7d', '#c97ae8', '#e8c34a',
  '#4acce8', '#e84a7a', '#7ae84a', '#e8934a', '#4a7ae8',
];

export function instructorColor(index) {
  return PALETTE[index % PALETTE.length];
}

// localStorage キー
const STORAGE_KEY = 'shift_calendar_v1';

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { instructors: [] };
    return JSON.parse(raw);
  } catch {
    return { instructors: [] };
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
