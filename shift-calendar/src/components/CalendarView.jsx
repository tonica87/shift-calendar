import React, { useState } from 'react';
import { DAYS, DAY_KEYS, TIME_SLOTS, slotKey, slotsToTime, MODE_META, SLOT_MODES } from '../lib/data.js';

export default function CalendarView({ instructors, onEdit }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'tokkun' | 'weekly' | 'spot'
  const [selectedDay, setSelectedDay] = useState(null);

  if (instructors.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>講師が登録されていません</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>「＋ 登録」から講師を追加してください</div>
      </div>
    );
  }

  function getSlotInstructors(dayKey, time) {
    const k = slotKey(dayKey, time);
    return instructors.map(inst => {
      const mode = (inst.slots || {})[k];
      if (!mode) return null;
      if (filter !== 'all' && mode !== filter) return null;
      return { inst, mode };
    }).filter(Boolean);
  }

  const visibleDays = selectedDay !== null
    ? [{ day: DAYS[selectedDay], dayKey: DAY_KEYS[selectedDay] }]
    : DAYS.map((day, i) => ({ day, dayKey: DAY_KEYS[i] }));

  const FILTERS = [
    { key: 'all',    label: 'すべて' },
    ...SLOT_MODES.map(m => ({ key: m, label: MODE_META[m].symbol + ' ' + MODE_META[m].label })),
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>シフト一覧</h1>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>登録講師 {instructors.length}名</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: filter === f.key ? 600 : 400, background: filter === f.key ? 'var(--accent-dim)' : 'var(--bg-card)', color: filter === f.key ? 'var(--accent)' : 'var(--text-dim)', border: filter === f.key ? '1px solid rgba(91,141,238,0.35)' : '1px solid var(--border)' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 曜日フィルタータブ */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto' }}>
        <button onClick={() => setSelectedDay(null)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, whiteSpace: 'nowrap', background: selectedDay === null ? 'var(--bg-hover)' : 'transparent', color: selectedDay === null ? 'var(--text)' : 'var(--text-faint)', border: '1px solid var(--border)' }}>全曜日</button>
        {DAYS.map((day, i) => (
          <button key={day} onClick={() => setSelectedDay(selectedDay === i ? null : i)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, background: selectedDay === i ? 'var(--bg-hover)' : 'transparent', color: selectedDay === i ? (i >= 5 ? 'var(--accent2)' : 'var(--text)') : (i >= 5 ? 'var(--accent2)' : 'var(--text-faint)'), border: `1px solid ${selectedDay === i ? 'var(--border-light)' : 'transparent'}` }}>
            {day}
          </button>
        ))}
      </div>

      {/* 凡例 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-dim)', flexWrap: 'wrap' }}>
        {SLOT_MODES.map(m => (
          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: MODE_META[m].dim, border: '1.5px solid ' + MODE_META[m].border }} />
            {MODE_META[m].symbol} {MODE_META[m].label}
          </div>
        ))}
      </div>

      {/* メイングリッド */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: selectedDay !== null ? 300 : 700 }}>
          <thead>
            <tr>
              <th style={{ width: 64, padding: '10px 8px', textAlign: 'right', fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontWeight: 400, borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: 'var(--bg)' }}>時刻</th>
              {visibleDays.map(({ day }, i) => {
                const originalIdx = selectedDay !== null ? selectedDay : i;
                return (
                  <th key={day} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: originalIdx >= 5 ? 'var(--accent2)' : 'var(--text)', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', minWidth: selectedDay !== null ? 'auto' : 120 }}>
                    {day}曜日
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => {
              const isHour = time.endsWith(':00');
              const hasAny = visibleDays.some(({ dayKey }) => getSlotInstructors(dayKey, time).length > 0);
              if (!hasAny && filter !== 'all') return null;
              return (
                <tr key={time}>
                  <td style={{ padding: '3px 8px 3px 0', textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)', color: isHour ? 'var(--text-dim)' : 'var(--text-faint)', fontWeight: isHour ? 500 : 400, borderTop: isHour ? '1px solid var(--border)' : 'none', whiteSpace: 'nowrap', position: 'sticky', left: 0, background: 'var(--bg)' }}>
                    {time}
                  </td>
                  {visibleDays.map(({ day, dayKey }) => {
                    const people = getSlotInstructors(dayKey, time);
                    return (
                      <td key={dayKey} style={{ padding: '2px 4px', borderTop: isHour ? '1px solid var(--border)' : 'none', borderLeft: '1px solid var(--border)', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: 26 }}>
                          {people.map(({ inst, mode }) => {
                            const meta = MODE_META[mode];
                            return (
                              <span key={inst.id}
                                title={`${inst.name} — ${meta.label}${inst.subjects?.length ? '\n担当: ' + inst.subjects.join('・') : ''}`}
                                style={{ padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: meta.dim, color: meta.color, border: '1px solid ' + meta.border, whiteSpace: 'nowrap', cursor: 'default' }}
                              >
                                {meta.symbol} {inst.name}
                              </span>
                            );
                          })}
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

      {/* 講師サマリー */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>講師サマリー</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {instructors.map(inst => {
            const counts = {};
            SLOT_MODES.forEach(m => { counts[m] = Object.values(inst.slots || {}).filter(v => v === m).length; });
            return (
              <div key={inst.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{inst.name}</span>
                  <button onClick={() => onEdit(inst.id)} style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border-light)' }}>編集</button>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'var(--font-mono)', flexWrap: 'wrap', marginBottom: inst.subjects?.length ? 6 : 0 }}>
                  {SLOT_MODES.map(m => (
                    <span key={m} style={{ color: MODE_META[m].color }}>{MODE_META[m].symbol} {slotsToTime(counts[m])}</span>
                  ))}
                </div>
                {inst.subjects?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {inst.subjects.map(s => (
                      <span key={s} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>{s}</span>
                    ))}
                  </div>
                )}
                {inst.comment && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    {inst.comment}
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
