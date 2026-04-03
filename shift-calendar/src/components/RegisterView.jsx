import React, { useState } from 'react';
import { instructorColor } from '../lib/data.js';

export default function RegisterView({ onAdd, instructors, onEdit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) { setError('名前を入力してください'); return; }
    if (instructors.some(i => i.name === trimmed)) {
      setError('同じ名前の講師がすでに登録されています');
      return;
    }
    setError('');
    onAdd(trimmed);
    setName('');
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
          講師登録
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          名前を登録してシフト入力へ進みます
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
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>
          講師名
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="例: 山田 太郎"
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'var(--bg)',
              border: `1px solid ${error ? '#e84a7a' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)',
              fontSize: 14,
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            登録 →
          </button>
        </div>
        {error && (
          <p style={{ marginTop: 8, fontSize: 12, color: '#e84a7a' }}>{error}</p>
        )}
      </div>

      {/* 既存講師リスト */}
      {instructors.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 11 }}>
            登録済み講師 — {instructors.length}名
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {instructors.map((inst, idx) => {
              const color = instructorColor(idx);
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{inst.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                      希望: {availCount}コマ　指導中: {teachCount}コマ
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
                    }}
                  >
                    シフト編集
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
