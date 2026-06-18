import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import API from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

/* ── Animated Counter Hook ──────────────────────── */
function useAnimatedCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    setValue(Math.round(eased * target));
    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [target, duration]);

  useEffect(() => {
    startTimeRef.current = null;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [animate]);

  return value;
}

/* ── Category Icon Map ──────────────────────────── */
const categoryIcons = {
  SALARY: '💼',
  FREELANCE: '🖥️',
  INVESTMENT: '📈',
  RENTAL: '🏠',
  OTHER_INCOME: '💰',
  FOOD: '🍽️',
  TRANSPORT: '🚗',
  UTILITIES: '💡',
  ENTERTAINMENT: '🎬',
  SHOPPING: '🛍️',
  HEALTHCARE: '🏥',
  EDUCATION: '📚',
  HOUSING: '🏡',
  OTHER_EXPENSE: '📦',
  BILLS: '📄',
  SAVINGS: '🏦',
};

function getCategoryIcon(category) {
  return categoryIcons[category] || '📌';
}

/* ── Custom Chart Tooltip ────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="custom-tooltip-label">{label}</div>
        <div className="custom-tooltip-value">
          ₹{payload[0].value?.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
}

/* ── Stat Card Component ─────────────────────────── */
function StatCard({ icon, label, value, type, isRate }) {
  const animatedValue = useAnimatedCounter(isRate ? Math.round(value) : Math.round(value));
  const displayValue = isRate
    ? `${animatedValue}%`
    : `₹${animatedValue.toLocaleString()}`;

  return (
    <div className={`stat-card-wrapper`}>
      <div className={`stat-card ${type}`}>
        <div className="stat-card-header">
          <div className={`stat-card-icon ${type}`}>{icon}</div>
        </div>
        <div className="stat-card-label">{label}</div>
        <div className={`stat-card-value ${type}`}>
          {displayValue}
        </div>
      </div>
    </div>
  );
}

/* ── Transaction Card Component ──────────────────── */
function TransactionItem({ tx, index }) {
  const type = tx.type === 'INCOME' ? 'income' : 'expense';
  const icon = getCategoryIcon(tx.category);
  const sign = tx.type === 'INCOME' ? '+' : '-';

  return (
    <div
      className="transaction-item"
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
    >
      <div className="transaction-left">
        <div className={`transaction-icon ${type}`}>{icon}</div>
        <div className="transaction-info">
          <div className="transaction-desc">{tx.description}</div>
          <div className="transaction-meta">
            {tx.category?.replace(/_/g, ' ')} · {tx.transactionDate}
          </div>
        </div>
      </div>
      <div className={`transaction-amount ${type}`}>
        {sign}₹{tx.amount}
      </div>
    </div>
  );
}

/* ── Main Dashboard Component ────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ income: 0, expense: 0, savings: 0, savingsRate: 0 });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const now = new Date();
    API.get(`/transactions/stats?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .then(res => setStats(res.data)).catch(() => {});
    API.get('/transactions')
      .then(res => setTransactions(Array.isArray(res.data) ? res.data.slice(0, 5) : [])).catch(() => {});
  }, []);

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  // Chart data for Recharts AreaChart
  const chartData = [
    { name: 'Income',  value: stats.income || 0 },
    { name: 'Expense', value: stats.expense || 0 },
    { name: 'Savings', value: stats.savings || 0 },
  ];

  return (
    <Layout>
      <div className="dashboard">
        {/* ── Greeting Section ──────────────────── */}
        <div className="dashboard-greeting">
          <h1>{greeting}, {user?.name || 'there'} ☀️</h1>
          <p>Here's your financial overview</p>
        </div>

        {/* ── Stat Cards ─────────────────────────── */}
        <div className="stat-cards-grid">
          <StatCard
            icon="💰"
            label="Total Income"
            value={stats.income}
            type="income"
          />
          <StatCard
            icon="💳"
            label="Total Expenses"
            value={stats.expense}
            type="expense"
          />
          <StatCard
            icon="🏦"
            label="Net Savings"
            value={stats.savings}
            type="savings"
          />
          <StatCard
            icon="📊"
            label="Savings Rate"
            value={stats.savingsRate}
            type="rate"
            isRate
          />
        </div>

        {/* ── Bottom: Chart + Transactions ──────── */}
        <div className="dashboard-two-col">
          {/* Monthly Summary Chart */}
          <div className="section-card">
            <h3 className="section-card-title">Monthly Summary</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.income} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={theme.income} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.expense} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={theme.expense} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradientSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.savings} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={theme.savings} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke={theme.textMuted}
                  tick={{ fill: theme.textMuted, fontSize: 12, fontFamily: 'var(--font-ui)' }}
                  axisLine={{ stroke: theme.border }}
                  tickLine={false}
                />
                <YAxis
                  stroke={theme.textMuted}
                  tick={{ fill: theme.textMuted, fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.hover }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={theme.accent}
                  fill="url(#gradientSavings)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: theme.accent, stroke: theme.bgCard, strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: theme.accent, stroke: theme.bgCard, strokeWidth: 3 }}
                  animationBegin={200}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions */}
          <div className="section-card">
            <h3 className="section-card-title">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p className="empty-state-text">No transactions yet</p>
                <p className="empty-state-sub">Add your first transaction to get started</p>
                <button className="empty-state-btn" onClick={() => navigate('/transactions')}>
                  + Add Transaction
                </button>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.map((tx, index) => (
                  <TransactionItem key={tx.id} tx={tx} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}