import React, { useState } from 'react';
import { DAYS, DAY_KEYS, TIME_SLOTS, slotKey, slotsToTime } from '../lib/data.js';

export default function CalendarView({ instructors, onEdit }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'available' | 'teaching'
  const [selectedDay, setSelectedDay] = useState(null);

  if (instructors.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 320, gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>講師が登録されていません</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>「＋ 登録」から講師を追加してください</div>
      </div>
    );
  }

  // 各スロットに入れる講師情報を計算
  function getSlotInstructors(dayKey, time) {
    const k = slotKey(dayKey, time);
    return instructors.map((inst, idx) => {
      const isTeaching = inst.teaching?.[k];
      const isAvailable = inst.available?.[k];
      if (filter === 'teaching' && !isTeaching) return null;
      if (filter === 'available' && !isAvailable) return null;
      if (!isTeaching && !isAvailable) return null;
      return { inst, idx, isTeaching, isAvailable };
    }).filter(Boolean);
  }

  const visibleDays = selectedDay !== null
    ? [{ day: DAYS[selectedDay], dayKey: DAY_KEYS[selectedDay] }]
    : DAYS.map((day, i) => ({ day, dayKey: DAY_KEYS[i] }));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>シフト一覧</h1>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
            登録講師 {instructors.length}名
          </div>
        </div>

        {/* フィルター */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'all', label: 'すべて' },
            { key: 'available', label: 'シフト希望のみ' },
            { key: 'teaching', label: '指導中のみ' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12, fontWeight: filter === f.key ? 600 : 400,
                background: filter === f.key ? 'var(--accent-dim)' : 'var(--bg-card)',
                color: filter === f.key ? 'var(--accent)' : 'var(--text-dim)',
                border: filter === f.key ? '1px solid rgba(91,141,238,0.35)' : '1px solid var(--border)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 曜日フィルタータブ */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto' }}>
        <button
          onClick={() => setSelectedDay(null)}
          style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, whiteSpace: 'nowrap',
            background: selectedDay === null ? 'var(--bg-hover)' : 'transparent',
            color: selectedDay === null ? 'var(--text)' : 'var(--text-faint)',
            border: '1px solid var(--border)',
          }}
        >全曜日</button>
        {DAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(selectedDay === i ? null : i)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600,
              background: selectedDay === i ? 'var(--bg-hover)' : 'transparent',
              color: selectedDay === i ? (i >= 5 ? 'var(--accent2)' : 'var(--text)') : (i >= 5 ? 'var(--accent2)' : 'var(--text-faint)'),
              border: `1px solid ${selectedDay === i ? 'var(--border-light)' : 'transparent'}`,
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 凡例 */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16, fontSize: 12, color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent-dim)', border: '1.5px solid rgba(91,141,238,0.5)' }} />
          シフト希望
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--success-dim)', border: '1.5px solid rgba(76,175,125,0.5)' }} />
          指導中
        </div>
      </div>

      {/* メイングリッド */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: selectedDay !== null ? 300 : 700 }}>
          <thead>
            <tr>
              <th style={{
                width: 64, padding: '10px 8px', textAlign: 'right',
                fontSize: 11, color: 'var(--text-faint)',
                fontFamily: 'var(--font-mono)', fontWeight: 400,
                borderBottom: '1px solid var(--border)',
                position: 'sticky', left: 0, background: 'var(--bg)',
              }}>時刻</th>
              {visibleDays.map(({ day }, i) => {
                const originalIdx = selectedDay !== null ? selectedDay : i;
                return (
                  <th key={day} style={{
                    padding: '10px 8px', textAlign: 'center',
                    fontSize: 13, fontWeight: 700,
                    color: originalIdx >= 5 ? 'var(--accent2)' : 'var(--text)',
                    borderBottom: '1px solid var(--border)',
                    minWidth: selectedDay !== null ? 'auto' : 120,
                  }}>
                    {day}曜日
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => {
              const isHour = time.endsWith(':00');
              // このtime行に表示するものがあるか
              const hasAny = visibleDays.some(({ dayKey }) => getSlotInstructors(dayKey, time).length > 0);
              if (!hasAny && filter !== 'all') return null;

              return (
                <tr key={time}>
                  <td style={{
                    padding: '3px 8px 3px 0', textAlign: 'right',
                    fontSize: 11, fontFamily: 'var(--font-mono)',
                    color: isHour ? 'var(--text-dim)' : 'var(--text-faint)',
                    fontWeight: isHour ? 500 : 400,
                    borderTop: isHour ? '1px solid var(--border)' : 'none',
                    whiteSpace: 'nowrap',
                    position: 'sticky', left: 0, background: 'var(--bg)',
                  }}>
                    {time}
                  </td>
                  {visibleDays.map(({ day, dayKey }, i) => {
                    const people = getSlotInstructors(dayKey, time);
                    return (
                      <td key={dayKey} style={{
                        padding: '2px 4px',
                        borderTop: isHour ? '1px solid var(--border)' : 'none',
                        verticalAlign: 'top',
                      }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: 26 }}>
                          {people.map(({ inst, idx, isTeaching }) => (
                            <span
                              key={inst.id}
                              title={`${inst.name} — ${isTeaching ? '指導中' : 'シフト希望'}${inst.subjects?.length ? '\n担当: ' + inst.subjects.join('・') : ''}`}
                              style={{
                                padding: '2px 7px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 500,
                                background: isTeaching ? 'var(--success-dim)' : 'var(--accent-dim)',
                                color: isTeaching ? 'var(--success)' : 'var(--accent)',
                                border: `1px solid ${isTeaching ? 'rgba(76,175,125,0.4)' : 'rgba(91,141,238,0.4)'}`,
                                whiteSpace: 'nowrap',
                                cursor: 'default',
                              }}
                            >
                              {isTeaching ? '●' : '○'} {inst.name}
                            </span>
                          ))}
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

      {/* 講師一覧サマリー */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          講師サマリー
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {instructors.map((inst) => {
            const availCount = Object.values(inst.available || {}).filter(Boolean).length;
            const teachCount = Object.values(inst.teaching || {}).filter(Boolean).length;
            return (
              <div
                key={inst.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{inst.name}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => onEdit(inst.id)}
                      style={{
                        padding: '3px 10px', borderRadius: 4, fontSize: 11,
                        background: 'var(--bg-hover)', color: 'var(--text-dim)',
                        border: '1px solid var(--border-light)',
                      }}
                    >編集</button>

                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: inst.subjects?.length ? 6 : 0 }}>
                  <span style={{ color: 'var(--accent)' }}>○ {slotsToTime(availCount)}</span>
                  <span style={{ color: 'var(--success)' }}>● {slotsToTime(teachCount)}</span>
                </div>
                {inst.subjects?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {inst.subjects.map(s => (
                      <span key={s} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
