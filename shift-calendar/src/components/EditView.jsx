import React, { useState, useRef } from 'react';
import { DAYS, DAY_KEYS, TIME_SLOTS, slotKey, slotsToTime, SUBJECTS } from '../lib/data.js';

function getSlotMode(available, teaching, dayKey, time) {
  const k = slotKey(dayKey, time);
  if (teaching[k]) return 'teaching';
  if (available[k]) return 'available';
  return 'none';
}

const MODE_STYLE = {
  none:      { bg: 'transparent',           color: 'var(--text-faint)', border: 'transparent' },
  available: { bg: 'var(--accent-dim)',     color: 'var(--accent)',     border: 'rgba(91,141,238,0.4)' },
  teaching:  { bg: 'var(--success-dim)',    color: 'var(--success)',    border: 'rgba(76,175,125,0.4)' },
  selecting: { bg: 'rgba(255,200,50,0.18)', color: '#e8c34a',           border: 'rgba(232,195,74,0.5)' },
};

export default function EditView({ instructor, onUpdate, onDone }) {
  const [available, setAvailable] = useState(() => ({ ...(instructor.available || {}) }));
  const [teaching,  setTeaching]  = useState(() => ({ ...(instructor.teaching  || {}) }));
  const [subjects,  setSubjects]  = useState(() => instructor.subjects || []);
  const [saved, setSaved] = useState(false);
  const [selecting, setSelecting] = useState(null);
  const [popup, setPopup] = useState(null);

  const dragging  = useRef(false);
  const dragStart = useRef(null);

  function toggleSubject(s) {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setSaved(false);
  }

  function calcRange(a, b) {
    if (!a || !b) return null;
    return {
      minD: Math.min(a.d, b.d), maxD: Math.max(a.d, b.d),
      minT: Math.min(a.t, b.t), maxT: Math.max(a.t, b.t),
    };
  }

  function isInRange(range, d, t) {
    if (!range) return false;
    return d >= range.minD && d <= range.maxD && t >= range.minT && t <= range.maxT;
  }

  function handleMouseDown(d, t) {
    dragging.current = true;
    dragStart.current = { d, t };
    setSelecting({ minD: d, maxD: d, minT: t, maxT: t });
  }

  function handleMouseEnter(d, t) {
    if (!dragging.current) return;
    setSelecting(calcRange(dragStart.current, { d, t }));
  }

  function handleMouseUp(e, d, t) {
    if (!dragging.current) return;
    dragging.current = false;
    const range = calcRange(dragStart.current, { d, t });
    if (!range) { setSelecting(null); return; }

    const keys = [];
    for (let di = range.minD; di <= range.maxD; di++) {
      for (let ti = range.minT; ti <= range.maxT; ti++) {
        keys.push(slotKey(DAY_KEYS[di], TIME_SLOTS[ti]));
      }
    }
    setPopup({ x: e.clientX, y: e.clientY, keys });
  }

  function applyPopup(mode) {
    if (!popup) return;
    setAvailable(a => { const n = {...a}; popup.keys.forEach(k => { n[k] = mode === 'available'; }); return n; });
    setTeaching(t2 => { const n = {...t2}; popup.keys.forEach(k => { n[k] = mode === 'teaching'; }); return n; });
    setPopup(null);
    setSelecting(null);
    setSaved(false);
  }

  function cancelPopup() { setPopup(null); setSelecting(null); }

  function handleSave() {
    onUpdate({ available, teaching, subjects });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clearAll() {
    const empty = {};
    TIME_SLOTS.forEach(t => DAY_KEYS.forEach(d => { empty[slotKey(d, t)] = false; }));
    setAvailable({...empty}); setTeaching({...empty}); setSaved(false);
  }

  const availCount = Object.values(available).filter(Boolean).length;
  const teachCount = Object.values(teaching).filter(Boolean).length;

  return (
    <div style={{ userSelect: 'none' }} onMouseLeave={() => { if (dragging.current) { dragging.current = false; setSelecting(null); } }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12, position: 'sticky', top: 56, zIndex: 90, background: 'var(--bg)', paddingTop: 16, paddingBottom: 16, marginTop: -16 }}>
        <div>
          <button onClick={onDone} style={{ background: 'none', color: 'var(--text-dim)', fontSize: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>← 一覧に戻る</button>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>{instructor.name}</h1>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            希望: {slotsToTime(availCount)}　　指導中: {slotsToTime(teachCount)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, marginRight: 8 }}>
            {[['available','シフト希望'],['teaching','指導中']].map(([mode, label]) => (
              <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)' }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: MODE_STYLE[mode].bg, border: '1.5px solid ' + MODE_STYLE[mode].border }} />
                {label}
              </div>
            ))}
          </div>
          <button onClick={clearAll} style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)', fontSize: 12 }}>クリア</button>
          <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: 'var(--radius-sm)', background: saved ? 'var(--success)' : 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, minWidth: 88 }}>
            {saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>
      </div>

      {/* 担当科目 */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10 }}>
          担当可能科目
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUBJECTS.map(s => {
            const selected = subjects.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12, fontWeight: selected ? 600 : 400,
                  background: selected ? 'var(--accent-dim)' : 'transparent',
                  color: selected ? 'var(--accent)' : 'var(--text-faint)',
                  border: `1px solid ${selected ? 'rgba(91,141,238,0.5)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {selected ? '✓ ' : ''}{s}
              </button>
            );
          })}
        </div>
        {subjects.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>科目をクリックして選択してください</div>
        )}
      </div>

      {/* 操作説明 */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 20, fontSize: 12, color: 'var(--text-dim)' }}>
        💡 <strong>ドラッグ</strong>で時間帯を選択 → 希望 / 指導中 を選択して登録。単セルクリックでもポップアップが出ます。
      </div>

      {/* グリッド */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ width: 64, padding: '10px 8px', textAlign: 'right', fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontWeight: 400, borderBottom: '1px solid var(--border)' }}>時刻</th>
              {DAYS.map((day, i) => (
                <th key={day} style={{ padding: '10px 4px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: i >= 5 ? 'var(--accent2)' : 'var(--text)', borderBottom: '1px solid var(--border)', minWidth: 80 }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, ti) => {
              const isHour = time.endsWith(':00');
              return (
                <tr key={time}>
                  <td style={{ padding: '2px 8px 2px 0', textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)', color: isHour ? 'var(--text-dim)' : 'var(--text-faint)', fontWeight: isHour ? 500 : 400, borderTop: isHour ? '1px solid var(--border)' : 'none', whiteSpace: 'nowrap' }}>
                    {time}
                  </td>
                  {DAY_KEYS.map((dayKey, di) => {
                    const mode = getSlotMode(available, teaching, dayKey, time);
                    const inSel = isInRange(selecting, di, ti);
                    const s = inSel ? MODE_STYLE.selecting : MODE_STYLE[mode];
                    return (
                      <td key={dayKey} style={{ padding: '2px', borderTop: isHour ? '1px solid var(--border)' : 'none' }}
                        onMouseDown={() => handleMouseDown(di, ti)}
                        onMouseEnter={() => handleMouseEnter(di, ti)}
                        onMouseUp={(e) => handleMouseUp(e, di, ti)}
                      >
                        <div style={{ height: 26, borderRadius: 4, background: s.bg, border: '1px solid ' + (inSel || mode !== 'none' ? s.border : 'transparent'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: s.color, fontWeight: 700, cursor: 'pointer' }}>
                          {inSel ? '▪' : mode === 'available' ? '○' : mode === 'teaching' ? '●' : ''}
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

      {/* ポップアップ */}
      {popup && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onMouseDown={cancelPopup} />
          <div style={{
            position: 'fixed',
            left: Math.min(popup.x + 8, window.innerWidth - 224),
            top: Math.min(popup.y + 8, window.innerHeight - 170),
            zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius)', padding: 12, boxShadow: 'var(--shadow)', minWidth: 208,
          }} onMouseDown={e => e.stopPropagation()}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
              {slotsToTime(popup.keys.length)}選択中
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={() => applyPopup('available')} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(91,141,238,0.4)', fontSize: 13, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
                ○　シフト希望として登録
              </button>
              <button onClick={() => applyPopup('teaching')} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--success-dim)', color: 'var(--success)', border: '1px solid rgba(76,175,125,0.4)', fontSize: 13, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
                ●　指導中として登録
              </button>
              <button onClick={() => applyPopup('none')} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border)', fontSize: 13, textAlign: 'left', cursor: 'pointer' }}>
                ✕　登録を解除
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
