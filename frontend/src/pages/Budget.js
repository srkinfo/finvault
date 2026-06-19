import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import API from '../api/axios';

const CATEGORIES = ['FOOD_DINING','TRANSPORTATION','HOUSING','ENTERTAINMENT','HEALTHCARE','SHOPPING','EDUCATION','TRAVEL','UTILITIES','INSURANCE','SALARY','FREELANCE','BUSINESS','GIFT','OTHER'];

export default function Budget() {
  const { theme } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [overview, setOverview] = useState({ totalBudget: 0, totalSpent: 0, totalIncome: 0, budgetCount: 0, alertCount: 0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'FOOD_DINING', budgetLimit: '' });

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const load = useCallback(() => {
    API.get(`/budgets?month=${month}&year=${year}`).then(res => setBudgets(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    API.get(`/budgets/overview/${month}/${year}`).then(res => setOverview(res.data)).catch(() => {});
  }, [month, year]);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/budgets', { category: form.category, budgetLimit: parseFloat(form.budgetLimit), month, year });
    setShowForm(false);
    setForm({ category: 'FOOD_DINING', budgetLimit: '' });
    load();
  };

  const handleDelete = async (id) => {
    await API.delete(`/budgets/${id}`);
    load();
  };

  const s = styles(theme);

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>◎ Budget Planner</h1>
          <p style={s.subtitle}>Set spending limits and track your budget</p>
        </div>
        <div style={s.headerRight}>
          <select style={s.monthPicker} value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" style={s.yearInput} value={year} onChange={e => setYear(parseInt(e.target.value))} />
          <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>+ Add Budget</button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={s.overviewGrid}>
        <div style={s.overviewCard}><span style={s.ovLabel}>Total Budget</span><span style={{ ...s.ovValue, color: theme.accent }}>₹{overview.totalBudget?.toFixed(0)}</span></div>
        <div style={s.overviewCard}><span style={s.ovLabel}>Total Spent</span><span style={{ ...s.ovValue, color: theme.expense }}>₹{overview.totalSpent?.toFixed(0)}</span></div>
        <div style={s.overviewCard}><span style={s.ovLabel}>Income</span><span style={{ ...s.ovValue, color: theme.income }}>₹{overview.totalIncome?.toFixed(0)}</span></div>
        <div style={s.overviewCard}><span style={s.ovLabel}>Alerts</span><span style={{ ...s.ovValue, color: overview.alertCount > 0 ? theme.expense : theme.textMuted }}>{overview.alertCount}</span></div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={{ color: theme.text, marginBottom: 16 }}>New Budget</h3>
          <form onSubmit={handleCreate} style={s.form}>
            <select style={s.input} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <input style={s.input} placeholder="Budget Limit (₹)" type="number" step="0.01"
              value={form.budgetLimit} onChange={e => setForm({...form, budgetLimit: e.target.value})} required />
            <div style={s.formActions}>
              <button type="submit" style={s.saveBtn}>Save</button>
              <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      <div style={s.listCard}>
        {budgets.length === 0 ? (
          <p style={{ color: theme.textMuted, textAlign: 'center', padding: 40 }}>No budgets set. Create your first budget!</p>
        ) : budgets.map(b => {
          const pct = b.budgetLimit > 0 ? (b.spentAmount / b.budgetLimit) * 100 : 0;
          const status = pct >= b.alertThreshold ? 'danger' : pct > 50 ? 'warning' : 'safe';
          const barColor = status === 'danger' ? theme.expense : status === 'warning' ? theme.accent : theme.income;
          return (
            <div key={b.id} style={s.budgetRow}>
              <div style={s.budgetInfo}>
                <div style={s.budgetCategory}>{b.category?.replace(/_/g, ' ')}</div>
                <div style={s.budgetBarOuter}>
                  <div style={{ ...s.budgetBarInner, width: `${Math.min(pct, 100)}%`, background: barColor }} />
                </div>
                <div style={s.budgetMeta}>
                  <span style={{ color: theme.income }}>₹{b.spentAmount?.toFixed(0)}</span>
                  <span style={{ color: theme.textMuted }}> / </span>
                  <span style={{ color: theme.text }}>₹{b.budgetLimit?.toFixed(0)}</span>
                  <span style={{ color: barColor, marginLeft: 8, fontWeight: 600 }}>({pct.toFixed(0)}%)</span>
                </div>
              </div>
              <span style={s.deleteBtn} onClick={() => handleDelete(b.id)}>✕</span>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}

const styles = (t) => ({
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { color: t.text, fontFamily: "'Aptos', serif", fontSize: 28, marginBottom: 4 },
  subtitle: { color: t.textSecondary, fontSize: 15 },
  headerRight: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  monthPicker: { padding: '8px 12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none' },
  yearInput: { padding: '8px 12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, width: 70, outline: 'none' },
  addBtn: { padding: '8px 18px', background: `linear-gradient(135deg,${t.accent},${t.accentLight})`, border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  overviewCard: { background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  ovLabel: { fontSize: 12, color: t.textSecondary },
  ovValue: { fontSize: 18, fontFamily: 'monospace', fontWeight: 700 },
  formCard: { background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, marginBottom: 20 },
  form: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' },
  input: { padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', flex: 1, minWidth: 150 },
  formActions: { display: 'flex', gap: 8 },
  saveBtn: { padding: '10px 20px', background: t.accent, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  cancelBtn: { padding: '10px 20px', background: t.border, border: 'none', borderRadius: 8, color: t.textSecondary, cursor: 'pointer' },
  listCard: { background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 22 },
  budgetRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: `1px solid ${t.border}` },
  budgetInfo: { flex: 1 },
  budgetCategory: { fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 },
  budgetBarOuter: { height: 8, background: t.border, borderRadius: 4, marginBottom: 6 },
  budgetBarInner: { height: 8, borderRadius: 4, transition: 'width 0.3s' },
  budgetMeta: { fontSize: 12, color: t.textSecondary },
  deleteBtn: { color: t.textMuted, cursor: 'pointer', fontSize: 16, padding: '4px 8px', borderRadius: 4 },
});
