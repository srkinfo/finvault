import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import API from '../api/axios';

const CATEGORIES = ['FOOD_DINING','TRANSPORTATION','HOUSING','ENTERTAINMENT','HEALTHCARE','SHOPPING','EDUCATION','TRAVEL','UTILITIES','INSURANCE','SALARY','FREELANCE','BUSINESS','GIFT','OTHER'];

export default function Transactions() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: '', description: '', category: 'FOOD_DINING',
    type: 'EXPENSE', transactionDate: new Date().toISOString().split('T')[0]
  });

  const load = () => API.get('/transactions').then(res => setTransactions(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      setShowForm(false);
      setForm({ amount: '', description: '', category: 'FOOD_DINING', type: 'EXPENSE', transactionDate: new Date().toISOString().split('T')[0] });
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Failed to save transaction');
    }
  };

  const s = styles(theme);

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Transactions</h1>
          <p style={s.subtitle}>Track your income and expenses</p>
        </div>
        <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ Add Transaction'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={{ color: theme.text, marginBottom: 16 }}>New Transaction</h3>
          <form onSubmit={handleSubmit} style={s.formGrid}>
            <input style={s.input} placeholder="Amount (₹)" type="number" step="0.01"
              value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
            <input style={s.input} placeholder="Description"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            <select style={s.input} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <select style={s.input} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="EXPENSE">💸 Expense</option>
              <option value="INCOME">💵 Income</option>
            </select>
            <input style={s.input} type="date"
              value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})} />
            <div style={s.formActions}>
              <button type="submit" style={s.saveBtn}>Save</button>
              <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction List */}
      <div style={s.listCard}>
        {transactions.length === 0 ? (
          <p style={{ color: theme.textMuted, textAlign: 'center', padding: 40 }}>No transactions yet!</p>
        ) : (
          <>
            <div style={s.summaryRow}>
              <span style={{ color: theme.text }}>Total: <span style={{ color: theme.textSecondary, fontFamily: 'monospace' }}>{transactions.length} transactions</span></span>
              <span style={{ color: theme.income }}>
                Income: ₹{transactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + (t.amount || 0), 0).toFixed(0)}
              </span>
              <span style={{ color: theme.expense }}>
                Expense: ₹{transactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + (t.amount || 0), 0).toFixed(0)}
              </span>
            </div>
            {transactions.map(tx => {
              const isIncome = tx.type === 'INCOME';
              const icon = isIncome ? '💵' : '💸';
              return (
                <div key={tx.id} style={s.txRow}>
                  <div style={s.txIcon}>{icon}</div>
                  <div style={s.txInfo}>
                    <div style={s.txDesc}>{tx.description}</div>
                    <div style={s.txMeta}>{tx.category?.replace(/_/g, ' ')} · {tx.transactionDate}</div>
                  </div>
                  <div style={{ ...s.txAmount, color: isIncome ? theme.income : theme.expense }}>
                    {isIncome ? '+' : '-'}₹{tx.amount?.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </Layout>
  );
}

const styles = (t) => ({
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { color: t.text, fontFamily: "'Aptos', serif", fontSize: 28, marginBottom: 4 },
  subtitle: { color: t.textSecondary, fontSize: 15 },
  addBtn: { padding: '10px 20px', background: `linear-gradient(135deg,${t.accent},${t.accentLight})`, border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  formCard: { background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, marginBottom: 24 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: { padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
  formActions: { display: 'flex', gap: 8 },
  saveBtn: { flex: 1, padding: 10, background: t.accent, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: 10, background: t.border, border: 'none', borderRadius: 8, color: t.textSecondary, cursor: 'pointer' },
  listCard: { background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 22 },
  summaryRow: { display: 'flex', gap: 20, marginBottom: 16, fontSize: 13, color: t.textSecondary, flexWrap: 'wrap' },
  txRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${t.border}` },
  txIcon: { width: 38, height: 38, borderRadius: 10, background: t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, fontWeight: 500, color: t.text },
  txMeta: { fontSize: 11, color: t.textSecondary, marginTop: 2 },
  txAmount: { fontFamily: 'monospace', fontSize: 14, fontWeight: 600 },
});
