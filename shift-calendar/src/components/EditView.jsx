import React, { useState, useRef } from 'react';
import { DAYS, DAY_KEYS, TIME_SLOTS, slotKey, slotsToTime, SUBJECTS, MODE_META, SLOT_MODES } from '../lib/data.js';

const SELECTING_STYLE = { bg: 'rgba(255,200,50,0.18)', color: '#e8c34a', border: 'rgba(232,195,74,0.5)' };

export default function EditView({ instructor, onUpdate, onDone, onDelete }) {
  const [slots,    setSlots]    = useState(() => ({ ...(instructor.slots || {}) }));
  const [subjects, setSubjects] = useState(() => instructor.subjects || []);
  const [saved,    setSaved]    = useState(false);
  const [selecting, setSelecting] = useState(null);
  const [popup,    setPopup]    = useState(null);
  const [clearPopup, setClearPopup] = useState(false);

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
    setSlots(s => {
      const n = { ...s };
      popup.keys.forEach(k => {
        if (mode === 'none') delete n[k];
        else n[k] = mode;
      });
      return n;
    });
    setPopup(null);
    setSelecting(null);
    setSaved(false);
  }

  function cancelPopup() { setPopup(null); setSelecting(null); }

  function handleSave() {
    onUpdate({ slots, subjects });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clearAllShifts() {
    setSlots({});
    setSaved(false);
    setClearPopup(false);
  }

  function handleDeleteInstructor() {
    setClearPopup(false);
    onDelete(instructor.id);
    onDone();
  }

  // モード別カウント
  const counts = {};
  SLOT_MODES.forEach(m => { counts[m] = Object.values(slots).filter(v => v === m).length; });

  return (
    <div style={{ userSelect: 'none' }} onMouseLeave={() => { if (dragging.current) { dragging.current = false; setSelecting(null); } }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12, position: 'sticky', top: 56, zIndex: 90, background: 'var(--bg)', paddingTop: 16, paddingBottom: 16, marginTop: -16 }}>
        <div>
          <button onClick={onDone} style={{ background: 'none', color: 'var(--text-dim)', fontSize: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>← 一覧に戻る</button>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>{instructor.name}</h1>
          <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
            {SLOT_MODES.map(m => (
              <span key={m} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: MODE_META[m].color }}>
                {MODE_META[m].symbol} {slotsToTime(counts[m])}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, marginRight: 8, flexWrap: 'wrap' }}>
            {SLOT_MODES.map(m => (
              <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-dim)' }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: MODE_META[m].dim, border: '1.5px solid ' + MODE_META[m].border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: MODE_META[m].color, fontWeight: 700 }}>
                  {MODE_META[m].symbol}
                </div>
                {MODE_META[m].label}
              </div>
            ))}
          </div>
          <button onClick={() => setClearPopup(true)} style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)', fontSize: 12 }}>クリア</button>
          <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: 'var(--radius-sm)', background: saved ? 'var(--success)' : 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, minWidth: 88 }}>
            {saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>
      </div>

      {/* 担当科目 */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10 }}>担当可能科目</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUBJECTS.map(s => {
            const selected = subjects.includes(s);
            return (
              <button key={s} onClick={() => toggleSubject(s)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: selected ? 600 : 400, background: selected ? 'var(--accent-dim)' : 'transparent', color: selected ? 'var(--accent)' : 'var(--text-faint)', border: `1px solid ${selected ? 'rgba(91,141,238,0.5)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.1s' }}>
                {selected ? '✓ ' : ''}{s}
              </button>
            );
          })}
        </div>
        {subjects.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>科目をクリックして選択してください</div>}
      </div>

      {/* 操作説明 */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 20, fontSize: 12, color: 'var(--text-dim)' }}>
        💡 <strong>ドラッグ</strong>で時間帯を選択 → 区分を選んで登録。単セルクリックでもポップアップが出ます。
      </div>

      {/* グリッド */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ width: 64, padding: '10px 8px', textAlign: 'right', fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontWeight: 400, borderBottom: '1px solid var(--border)' }}>時刻</th>
              {DAYS.map((day, i) => (
                <th key={day} style={{ padding: '10px 4px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: i >= 5 ? 'var(--accent2)' : 'var(--text)', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', minWidth: 80 }}>{day}</th>
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
                    const mode = slots[slotKey(dayKey, time)] || 'none';
                    const inSel = isInRange(selecting, di, ti);
                    const meta = MODE_META[mode];
                    const cellBg   = inSel ? SELECTING_STYLE.bg     : meta ? meta.dim    : 'transparent';
                    const cellBdr  = inSel ? SELECTING_STYLE.border  : meta ? meta.border : 'transparent';
                    const cellClr  = inSel ? SELECTING_STYLE.color   : meta ? meta.color  : 'transparent';
                    const symbol   = inSel ? '▪' : meta ? meta.symbol : '';
                    return (
                      <td key={dayKey} style={{ padding: '2px', borderTop: isHour ? '1px solid var(--border)' : 'none', borderLeft: '1px solid var(--border)' }}
                        onMouseDown={() => handleMouseDown(di, ti)}
                        onMouseEnter={() => handleMouseEnter(di, ti)}
                        onMouseUp={(e) => handleMouseUp(e, di, ti)}
                      >
                        <div style={{ height: 26, borderRadius: 4, background: cellBg, border: '1px solid ' + (inSel || mode !== 'none' ? cellBdr : 'transparent'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: cellClr, fontWeight: 700, cursor: 'pointer' }}>
                          {symbol}
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
          <div style={{ position: 'fixed', left: Math.min(popup.x + 8, window.innerWidth - 240), top: Math.min(popup.y + 8, window.innerHeight - 200), zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 12, boxShadow: 'var(--shadow)', minWidth: 224 }} onMouseDown={e => e.stopPropagation()}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
              {slotsToTime(popup.keys.length)}選択中
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SLOT_MODES.map(m => (
                <button key={m} onClick={() => applyPopup(m)} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: MODE_META[m].dim, color: MODE_META[m].color, border: '1px solid ' + MODE_META[m].border, fontSize: 13, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
                  {MODE_META[m].symbol}　{MODE_META[m].label}
                </button>
              ))}
              <button onClick={() => applyPopup('none')} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border)', fontSize: 13, textAlign: 'left', cursor: 'pointer' }}>
                ✕　登録を解除
              </button>
            </div>
          </div>
        </>
      )}

      {/* クリア確認ポップアップ */}
      {clearPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setClearPopup(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, maxWidth: 360, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>どちらを実行しますか？</h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>{instructor.name} のシフト情報を操作します</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={clearAllShifts} style={{ padding: '11px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', color: 'var(--text)', border: '1px solid var(--border-light)', fontSize: 13, fontWeight: 500, textAlign: 'left' }}>🗓 入力済みのシフトをすべて消去</button>
              <button onClick={handleDeleteInstructor} style={{ padding: '11px 18px', borderRadius: 'var(--radius-sm)', background: '#e84a7a22', color: '#e84a7a', border: '1px solid rgba(232,74,122,0.4)', fontSize: 13, fontWeight: 500, textAlign: 'left' }}>🗑 講師を削除する</button>
              <button onClick={() => setClearPopup(false)} style={{ padding: '11px 18px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-faint)', border: '1px solid transparent', fontSize: 13 }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
