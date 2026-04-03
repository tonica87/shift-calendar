import React, { useState } from 'react';
import { DAYS, DAY_KEYS, TIME_SLOTS, slotKey } from '../lib/data.js';

const MODE = {
  none: { label: '―', bg: 'transparent', color: 'var(--text-faint)', border: 'var(--border)' },
  available: { label: '○', bg: 'var(--accent-dim)', color: 'var(--accent)', border: 'rgba(91,141,238,0.4)' },
  teaching: { label: '●', bg: 'var(--success-dim)', color: 'var(--success)', border: 'rgba(76,175,125,0.4)' },
};

function getSlotMode(available, teaching, dayKey, time) {
  const k = slotKey(dayKey, time);
  if (teaching[k]) return 'teaching';
  if (available[k]) return 'available';
  return 'none';
}

function nextMode(current) {
  if (current === 'none') return 'available';
  if (current === 'available') return 'teaching';
  return 'none';
}

export default function EditView({ instructor, onUpdate, onDone }) {
  const [available, setAvailable] = useState(() => ({ ...(instructor.available || {}) }));
  const [teaching, setTeaching] = useState(() => ({ ...(instructor.teaching || {}) }));
  const [saved, setSaved] = useState(false);

  function toggleSlot(dayKey, time) {
    const k = slotKey(dayKey, time);
    const current = getSlotMode(available, teaching, dayKey, time);
    const next = nextMode(current);

    setAvailable(a => ({ ...a, [k]: next === 'available' }));
    setTeaching(t => ({ ...t, [k]: next === 'teaching' }));
    setSaved(false);
  }

  function handleSave() {
    onUpdate({ available, teaching });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clearAll() {
    const emptyA = {};
    const emptyT = {};
    TIME_SLOTS.forEach(t => DAY_KEYS.forEach(d => {
      emptyA[slotKey(d, t)] = false;
      emptyT[slotKey(d, t)] = false;
    }));
    setAvailable(emptyA);
    setTeaching(emptyT);
    setSaved(false);
  }

  const availCount = Object.values(available).filter(Boolean).length;
  const teachCount = Object.values(teaching).filter(Boolean).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button
            onClick={onDone}
            style={{
              background: 'none', color: 'var(--text-dim)', fontSize: 12,
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ← 一覧に戻る
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {instructor.name}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            希望: {availCount}コマ　　指導中: {teachCount}コマ
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* 凡例 */}
          <div style={{ display: 'flex', gap: 16, marginRight: 8 }}>
            {Object.entries(MODE).filter(([k]) => k !== 'none').map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)' }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: v.bg, border: `1px solid ${v.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: v.color, fontWeight: 700,
                }}>{v.label}</div>
                {k === 'available' ? 'シフト希望' : '指導中'}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-faint)' }}>
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'var(--text-faint)',
              }}>―</div>
              未登録
            </div>
          </div>

          <button
            onClick={clearAll}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-sm)',
              background: 'transparent', color: 'var(--text-faint)',
              border: '1px solid var(--border)', fontSize: 12,
            }}
          >
            クリア
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px', borderRadius: 'var(--radius-sm)',
              background: saved ? 'var(--success)' : 'var(--accent)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              minWidth: 88,
            }}
          >
            {saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>
      </div>

      {/* 操作説明 */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 20,
        fontSize: 12, color: 'var(--text-dim)',
      }}>
        💡 セルをクリックするごとに　未登録 → <span style={{ color: 'var(--accent)' }}>シフト希望（○）</span> → <span style={{ color: 'var(--success)' }}>指導中（●）</span> → 未登録　と切り替わります
      </div>

      {/* グリッド */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{
                width: 64, padding: '10px 8px', textAlign: 'right',
                fontSize: 11, color: 'var(--text-faint)',
                fontFamily: 'var(--font-mono)', fontWeight: 400,
                borderBottom: '1px solid var(--border)',
              }}>時刻</th>
              {DAYS.map((day, i) => (
                <th key={day} style={{
                  padding: '10px 4px', textAlign: 'center',
                  fontSize: 13, fontWeight: 600,
                  color: i >= 5 ? 'var(--accent2)' : 'var(--text)',
                  borderBottom: '1px solid var(--border)',
                  minWidth: 80,
                }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, tIdx) => {
              const isHour = time.endsWith(':00');
              return (
                <tr key={time}>
                  <td style={{
                    padding: '2px 8px 2px 0',
                    textAlign: 'right',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: isHour ? 'var(--text-dim)' : 'var(--text-faint)',
                    fontWeight: isHour ? 500 : 400,
                    borderTop: isHour ? '1px solid var(--border)' : 'none',
                    whiteSpace: 'nowrap',
                  }}>
                    {time}
                  </td>
                  {DAY_KEYS.map((dayKey, dIdx) => {
                    const mode = getSlotMode(available, teaching, dayKey, time);
                    const m = MODE[mode];
                    return (
                      <td
                        key={dayKey}
                        onClick={() => toggleSlot(dayKey, time)}
                        style={{
                          padding: '2px',
                          borderTop: isHour ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        <div style={{
                          height: 26,
                          borderRadius: 4,
                          background: m.bg,
                          border: `1px solid ${mode !== 'none' ? m.border : 'transparent'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, color: m.color, fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                          userSelect: 'none',
                        }}
                          onMouseEnter={e => {
                            if (mode === 'none') e.currentTarget.style.background = 'var(--bg-hover)';
                          }}
                          onMouseLeave={e => {
                            if (mode === 'none') e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {mode !== 'none' ? m.label : ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
