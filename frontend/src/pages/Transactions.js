import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: '', description: '', category: 'FOOD_DINING',
    type: 'EXPENSE', transactionDate: new Date().toISOString().split('T')[0]
  });

  const load = () => API.get('/transactions').then(res => setTransactions(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/transactions', { ...form, amount: parseFloat(form.amount) });
    setShowForm(false);
    setForm({ amount: '', description: '', category: 'FOOD_DINING', type: 'EXPENSE', transactionDate: new Date().toISOString().split('T')[0] });
    load();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#888899', cursor: 'pointer', marginBottom: 8, fontSize: 14 }}>
            ← Back to Dashboard
          </button>
          <h1 style={{ color: '#e8e8f0', fontFamily: 'serif', fontSize: 28 }}>Transactions</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          + Add Transaction
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#e8e8f0', marginBottom: 16 }}>New Transaction</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input style={inp} placeholder="Amount" type="number" step="0.01"
              value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
            <input style={inp} placeholder="Description"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            <select style={inp} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {['FOOD_DINING','TRANSPORTATION','HOUSING','ENTERTAINMENT',
                'HEALTHCARE','SHOPPING','EDUCATION','TRAVEL',
                'UTILITIES','SALARY','FREELANCE','OTHER'].map(c =>
                <option key={c} value={c}>{c.replace('_',' ')}</option>
              )}
            </select>
            <select style={inp} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="EXPENSE">EXPENSE</option>
              <option value="INCOME">INCOME</option>
            </select>
            <input style={inp} type="date"
              value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{ flex: 1, padding: 10, background: '#c9a84c', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                Save
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 10, background: '#1e1e2e', border: 'none', borderRadius: 8, color: '#888899', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction List */}
      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 22 }}>
        {transactions.length === 0 ? (
          <p style={{ color: '#555566', textAlign: 'center', padding: 40 }}>No transactions yet!</p>
        ) : transactions.map(tx => (
          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #1e1e2e' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: tx.type === 'INCOME' ? '#2dd4a722' : '#f4617a22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {tx.type === 'INCOME' ? '💵' : '💸'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f0' }}>{tx.description}</div>
              <div style={{ fontSize: 11, color: '#888899', marginTop: 2 }}>{tx.category.replace('_',' ')} · {tx.transactionDate}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: tx.type === 'INCOME' ? '#2dd4a7' : '#f4617a' }}>
                {tx.type === 'INCOME' ? '+' : '-'}${tx.amount}
              </div>
              <div style={{ fontSize: 10, color: '#555566', marginTop: 2 }}>{tx.type}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp = {
  padding: '10px 14px', background: '#16161f',
  border: '1px solid #1e1e2e', borderRadius: 8,
  color: '#e8e8f0', fontSize: 13, outline: 'none',
  width: '100%', boxSizing: 'border-box'
};
