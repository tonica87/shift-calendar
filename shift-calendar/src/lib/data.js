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

export function slotKey(dayKey, time) {
  return `${dayKey}-${time}`;
}


// 担当科目リスト
export const SUBJECTS = [
  '英語', '国語', '文系数学', '理系数学',
  '日本史', '世界史', '物理', '化学',
  '政治経済', '地理', '生物', '地学',
];
export function createInstructor(name) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    subjects: [],
    available: {},
    teaching: {},
    createdAt: new Date().toISOString(),
  };
}

const PALETTE = [
  '#5b8dee', '#e8734a', '#4caf7d', '#c97ae8', '#e8c34a',
  '#4acce8', '#e84a7a', '#7ae84a', '#e8934a', '#4a7ae8',
];

export function instructorColor(index) {
  return PALETTE[index % PALETTE.length];
}

// API経由でデータ読み込み
export async function loadData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return { instructors: [] };
    return await res.json();
  } catch {
    return { instructors: [] };
  }
}

// API経由でデータ保存
export async function saveData(data) {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error('Save failed:', e);
  }
}

// 30分スロット数 → "○時間○分" 表記
export function slotsToTime(count) {
  const totalMin = count * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}
