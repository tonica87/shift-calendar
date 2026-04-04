import React, { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, createInstructor } from './lib/data.js';
import RegisterView from './components/RegisterView.jsx';
import EditView from './components/EditView.jsx';
import CalendarView from './components/CalendarView.jsx';

const NAV = [
  { key: 'calendar', label: '📅 一覧' },
  { key: 'register', label: '＋ 登録' },
];

export default function App() {
  const [view, setView] = useState('calendar');
  const [data, setData] = useState({ instructors: [] });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 初回データ読み込み
  useEffect(() => {
    loadData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  // データ変更時に保存（初回ロード後のみ）
  const save = useCallback(async (newData) => {
    setSaving(true);
    await saveData(newData);
    setSaving(false);
  }, []);

  function addInstructor(name, subjects = []) {
    const inst = { ...createInstructor(name), subjects };
    const newData = { ...data, instructors: [...data.instructors, inst] };
    setData(newData);
    save(newData);
    return inst.id;
  }

  function updateInstructor(id, patch) {
    const newData = {
      ...data,
      instructors: data.instructors.map(i => i.id === id ? { ...i, ...patch } : i),
    };
    setData(newData);
    save(newData);
  }

  function deleteInstructor(id) {
    const newData = {
      ...data,
      instructors: data.instructors.filter(i => i.id !== id),
    };
    setData(newData);
    save(newData);
  }

  function startEdit(id) {
    setEditingId(id);
    setView('edit');
  }

  const editingInstructor = data.instructors.find(i => i.id === editingId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1d27 0%, #0f1117 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📚</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>シフトカレンダー</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: -2 }}>武田塾新宿校</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {saving && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>保存中…</span>}
            <nav style={{ display: 'flex', gap: 4 }}>
              {NAV.map(n => (
                <button key={n.key} onClick={() => setView(n.key)} style={{
                  padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                  background: view === n.key ? 'var(--accent-dim)' : 'transparent',
                  color: view === n.key ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 13, fontWeight: view === n.key ? 600 : 400,
                  border: view === n.key ? '1px solid rgba(91,141,238,0.3)' : '1px solid transparent',
                }}>
                  {n.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '24px 24px 48px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 32 }}>⏳</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>読み込み中…</div>
            </div>
          ) : (
            <>
              {view === 'calendar' && (
                <CalendarView instructors={data.instructors} onEdit={startEdit} />
              )}
              {view === 'register' && (
                <RegisterView
                  onAdd={(name, subjects) => {
                    const id = addInstructor(name, subjects);
                    setEditingId(id);
                    setView('edit');
                  }}
                  instructors={data.instructors}
                  onEdit={startEdit}
                />
              )}
              {view === 'edit' && editingInstructor && (
                <EditView
                  instructor={editingInstructor}
                  onUpdate={(patch) => updateInstructor(editingId, patch)}
                  onDelete={deleteInstructor}
                  onDone={() => setView('calendar')}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
