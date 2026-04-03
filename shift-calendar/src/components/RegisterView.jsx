import React, { useState } from 'react';
import { slotsToTime, SUBJECTS } from '../lib/data.js';

export default function RegisterView({ onAdd, instructors, onEdit }) {
  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [error, setError] = useState('');

  function toggleSubject(s) {
    setSelectedSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) { setError('名前を入力してください'); return; }
    if (instructors.some(i => i.name === trimmed)) {
      setError('同じ名前の講師がすでに登録されています');
      return;
    }
    setError('');
    onAdd(trimmed, selectedSubjects);
    setName('');
    setSelectedSubjects([]);
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
          講師登録
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          名前と担当科目を登録してシフト入力へ進みます
        </p>
      </div>

      {/* 登録フォーム */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 24,
        marginBottom: 32,
      }}>
        {/* 名前 */}
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>
          講師名
        </label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          placeholder="例: 山田 太郎"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'var(--bg)',
            border: `1px solid ${error ? '#e84a7a' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            fontSize: 14,
            marginBottom: 4,
            boxSizing: 'border-box',
          }}
        />
        {error && <p style={{ marginBottom: 16, fontSize: 12, color: '#e84a7a' }}>{error}</p>}

        {/* 担当科目 */}
        <label style={{ display: 'block', margin: '20px 0 10px', fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>
          担当科目（複数選択可）
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {SUBJECTS.map(s => {
            const selected = selectedSubjects.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: selected ? 600 : 400,
                  background: selected ? 'var(--accent-dim)' : 'var(--bg)',
                  color: selected ? 'var(--accent)' : 'var(--text-dim)',
                  border: `1px solid ${selected ? 'rgba(91,141,238,0.5)' : 'var(--border-light)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {selected ? '✓ ' : ''}{s}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '11px 20px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          登録してシフト入力へ →
        </button>
      </div>

      {/* 既存講師リスト */}
      {instructors.length > 0 && (
        <div>
          <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            登録済み講師 — {instructors.length}名
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {instructors.map((inst) => {
              const availCount = Object.keys(inst.available || {}).filter(k => inst.available[k]).length;
              const teachCount = Object.keys(inst.teaching || {}).filter(k => inst.teaching[k]).length;
              return (
                <div
                  key={inst.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: inst.subjects?.length ? 8 : 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{inst.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        希望: {slotsToTime(availCount)}　指導中: {slotsToTime(teachCount)}
                      </div>
                    </div>
                    <button
                      onClick={() => onEdit(inst.id)}
                      style={{
                        padding: '6px 14px',
                        background: 'var(--bg-hover)',
                        color: 'var(--text-dim)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12,
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                      }}
                    >
                      シフト編集
                    </button>
                  </div>
                  {inst.subjects?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {inst.subjects.map(s => (
                        <span key={s} style={{
                          padding: '2px 8px', borderRadius: 12, fontSize: 11,
                          background: 'var(--bg-hover)', color: 'var(--text-dim)',
                          border: '1px solid var(--border)',
                        }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
