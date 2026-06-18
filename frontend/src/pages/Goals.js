import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import API from '../api/axios';

const GOAL_TYPES = [
  { value: 'EMERGENCY_FUND', label: '🚨 Emergency Fund' },
  { value: 'VACATION', label: '✈️ Vacation' },
  { value: 'HOME_PURCHASE', label: '🏠 Home Purchase' },
  { value: 'CAR', label: '🚗 Car' },
  { value: 'EDUCATION', label: '🎓 Education' },
  { value: 'RETIREMENT', label: '🌴 Retirement' },
  { value: 'WEDDING', label: '💍 Wedding' },
  { value: 'GADGET', label: '📱 Gadget' },
  { value: 'BUSINESS', label: '💼 Business' },
  { value: 'CUSTOM', label: '🎯 Custom' },
];

export default function Goals() {
  const { theme } = useTheme();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', targetAmount: '', type: 'CUSTOM', icon: '🎯', targetDate: ''
  });
  const [contributing, setContributing] = useState(null);
  const [contribution, setContribution] = useState('');

  const load = () => API.get('/goals').then(res => setGoals(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/goals', {
      name: form.name, description: form.description,
      targetAmount: parseFloat(form.targetAmount), type: form.type,
      icon: form.icon, targetDate: form.targetDate || null
    });
    setShowForm(false);
    setForm({ name: '', description: '', targetAmount: '', type: 'CUSTOM', icon: '🎯', targetDate: '' });
    load();
  };

  const handleContribute = async (id) => {
    await API.patch(`/goals/${id}/progress`, { amount: parseFloat(contribution) });
    setContributing(null);
    setContribution('');
    load();
  };

  const handleDelete = async (id) => {
    await API.delete(`/goals/${id}`);
    load();
  };

  const handleStatusChange = async (id, status) => {
    await API.put(`/goals/${id}`, { status });
    load();
  };

  const s = styles(theme);

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>◈ Savings Goals</h1>
          <p style={s.subtitle}>Set and track your financial goals</p>
        </div>
        <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>+ New Goal</button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={{ color: theme.text, marginBottom: 16 }}>Create Goal</h3>
          <form onSubmit={handleCreate} style={s.formGrid}>
            <input style={s.input} placeholder="Goal Name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
            <input style={s.input} placeholder="Target Amount (₹)" type="number" step="0.01"
              value={form.targetAmount} onChange={e => setForm({...form, targetAmount: e.target.value})} required />
            <select style={s.input} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              {GOAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input style={s.input} placeholder="Target Date (optional)" type="date"
              value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} />
            <textarea style={{ ...s.input, minHeight: 60, gridColumn: '1 / -1' }} placeholder="Description (optional)"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <div style={s.formActions}>
              <button type="submit" style={s.saveBtn}>Save</button>
              <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div style={s.listCard}>
        {goals.length === 0 ? (
          <p style={{ color: theme.textMuted, textAlign: 'center', padding: 40 }}>No goals yet. Create your first goal!</p>
        ) : goals.map(g => {
          const pct = g.progressPercentage || 0;
          const remaining = g.remainingAmount || 0;
          const statusColor = g.status === 'COMPLETED' ? theme.income : g.status === 'PAUSED' ? theme.accent : g.status === 'CANCELLED' ? theme.expense : theme.savings;

          return (
            <div key={g.id} style={s.goalRow}>
              <div style={s.goalIcon}>{g.icon || '🎯'}</div>
              <div style={s.goalInfo}>
                <div style={s.goalNameRow}>
                  <span style={s.goalName}>{g.name}</span>
                  <span style={{ ...s.goalStatus, color: statusColor }}>{g.status}</span>
                  <span style={s.goalType}>{g.type?.replace(/_/g, ' ')}</span>
                </div>
                {g.description && <div style={s.goalDesc}>{g.description}</div>}
                <div style={s.goalBarOuter}>
                  <div style={{ ...s.goalBarInner, width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div style={s.goalMeta}>
                  <span style={{ color: theme.income }}>₹{g.currentAmount?.toFixed(0)}</span>
                  <span style={{ color: theme.textMuted }}> of </span>
                  <span style={{ color: theme.text }}>₹{g.targetAmount?.toFixed(0)}</span>
                  <span style={{ color: theme.savings, marginLeft: 8 }}>({pct.toFixed(0)}%)</span>
                  <span style={{ color: theme.textMuted, marginLeft: 12 }}>₹{remaining.toFixed(0)} remaining</span>
                  {g.targetDate && <span style={{ color: theme.textMuted, marginLeft: 12 }}>by {g.targetDate}</span>}
                </div>
              </div>
              <div style={s.goalActions}>
                {g.status === 'ACTIVE' && (
                  <>
                    <button style={s.contributeBtn} onClick={() => setContributing(g.id)}>+ Add</button>
                    <button style={s.pauseBtn} onClick={() => handleStatusChange(g.id, 'PAUSED')}>⏸</button>
                  </>
                )}
                {g.status === 'PAUSED' && (
                  <button style={s.contributeBtn} onClick={() => handleStatusChange(g.id, 'ACTIVE')}>▶ Resume</button>
                )}
                {g.status !== 'COMPLETED' && g.status !== 'CANCELLED' && (
                  <span style={s.deleteBtn} onClick={() => handleDelete(g.id)}>✕</span>
                )}
              </div>

              {/* Contribution form */}
              {contributing === g.id && (
                <div style={s.contributeForm}>
                  <input style={{ ...s.input, width: 120 }} placeholder="Amount" type="number" step="0.01"
                    value={contribution} onChange={e => setContribution(e.target.value)} autoFocus />
                  <button style={s.saveBtn} onClick={() => handleContribute(g.id)}>Add</button>
                  <button style={s.cancelBtn} onClick={() => { setContributing(null); setContribution(''); }}>Cancel</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}

const styles = (t) => ({
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { color: t.text, fontFamily: "'Aptos', serif", fontSize: 28, marginBottom: 4 },
  subtitle: { color: t.textSecondary, fontSize: 15 },
  addBtn: { padding: '10px 20px', background: `linear-gradient(135deg,${t.accent},${t.accentLight})`, border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  formCard: { background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: { padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
  formActions: { gridColumn: '1 / -1', display: 'flex', gap: 8 },
  saveBtn: { padding: '10px 20px', background: t.accent, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  cancelBtn: { padding: '10px 20px', background: t.border, border: 'none', borderRadius: 8, color: t.textSecondary, cursor: 'pointer' },
  listCard: { background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 22 },
  goalRow: { padding: '16px 0', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' },
  goalIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  goalInfo: { flex: 1, minWidth: 200 },
  goalNameRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  goalName: { fontSize: 15, fontWeight: 600, color: t.text },
  goalStatus: { fontSize: 10, padding: '2px 8px', borderRadius: 10, border: '1px solid currentColor', textTransform: 'uppercase', letterSpacing: '0.05em' },
  goalType: { fontSize: 11, color: t.textMuted },
  goalDesc: { fontSize: 12, color: t.textSecondary, marginBottom: 6 },
  goalBarOuter: { height: 8, background: t.border, borderRadius: 4, marginBottom: 6 },
  goalBarInner: { height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${t.savings}, ${t.accent})`, transition: 'width 0.3s' },
  goalMeta: { fontSize: 12, color: t.textSecondary },
  goalActions: { display: 'flex', gap: 6, alignItems: 'center' },
  contributeBtn: { padding: '6px 14px', background: t.savings, border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12 },
  pauseBtn: { padding: '6px 10px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 6, color: t.textSecondary, cursor: 'pointer', fontSize: 12 },
  deleteBtn: { color: t.textMuted, cursor: 'pointer', fontSize: 16, padding: '4px 8px' },
  contributeForm: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, width: '100%' },
});
