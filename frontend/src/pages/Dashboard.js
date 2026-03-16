import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ income: 0, expense: 0, savings: 0, savingsRate: 0 });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const now = new Date();
    API.get(`/transactions/stats?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .then(res => setStats(res.data)).catch(() => {});
    API.get('/transactions')
      .then(res => setTransactions(res.data.slice(0, 5))).catch(() => {});
  }, []);

  const chartData = [
    { name: 'Income',  value: stats.income,  fill: '#2dd4a7' },
    { name: 'Expense', value: stats.expense, fill: '#f4617a' },
    { name: 'Savings', value: stats.savings, fill: '#c9a84c' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#111118', borderRight: '1px solid #1e1e2e', padding: '28px 0', position: 'relative' }}>
        <div style={{ padding: '0 24px 32px', color: '#c9a84c', fontFamily: 'serif', fontSize: 22, fontWeight: 700 }}>
          🏦 FinVault
        </div>
        {[
          { label: '⬡  Dashboard',    path: '/' },
          { label: '↔  Transactions', path: '/transactions' },
          { label: '◎  Budgets',      path: '/budget' },
          { label: '◈  Goals',        path: '/goals' },
        ].map(item => (
          <div key={item.path} onClick={() => navigate(item.path)}
            style={{ padding: '10px 24px', cursor: 'pointer', color: '#888899', fontSize: 14 }}
            onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
            onMouseLeave={e => e.currentTarget.style.color = '#888899'}>
            {item.label}
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
          <div style={{ color: '#e8e8f0', fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
          <div onClick={logout} style={{ color: '#f4617a', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
            Logout
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <h1 style={{ color: '#e8e8f0', fontFamily: 'serif', fontSize: 28, marginBottom: 4 }}>
          Good morning, {user?.name} ☀️
        </h1>
        <p style={{ color: '#888899', marginBottom: 28 }}>Here's your financial overview</p>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Income',   value: `$${stats.income?.toFixed(0)}`,       color: '#2dd4a7' },
            { label: 'Total Expenses', value: `$${stats.expense?.toFixed(0)}`,      color: '#f4617a' },
            { label: 'Net Savings',    value: `$${stats.savings?.toFixed(0)}`,      color: '#c9a84c' },
            { label: 'Savings Rate',   value: `${stats.savingsRate?.toFixed(1)}%`,  color: '#6b8cff' },
          ].map(s => (
            <div key={s.label} style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 11, color: '#888899', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 24, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Transactions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Bar Chart */}
          <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 22 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, color: '#e8e8f0' }}>Monthly Summary</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#555566" />
                <YAxis stroke="#555566" />
                <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions */}
          <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 22 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, color: '#e8e8f0' }}>Recent Transactions</div>
            {transactions.length === 0 ? (
              <p style={{ color: '#555566', fontSize: 13 }}>No transactions yet. Add your first one!</p>
            ) : transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e1e2e' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f0' }}>{tx.description}</div>
                  <div style={{ fontSize: 11, color: '#888899' }}>{tx.category} · {tx.transactionDate}</div>
                </div>
                <div style={{ color: tx.type === 'INCOME' ? '#2dd4a7' : '#f4617a', fontFamily: 'monospace', fontSize: 14 }}>
                  {tx.type === 'INCOME' ? '+' : '-'}${tx.amount}
                </div>
              </div>
            ))}
            <div onClick={() => navigate('/transactions')}
              style={{ color: '#c9a84c', fontSize: 13, cursor: 'pointer', marginTop: 12, textAlign: 'right' }}>
              View all →
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}