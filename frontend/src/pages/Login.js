import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister ? '/auth/register' : '/auth/login';
      const res = await API.post(url, form);
      login(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || err.response?.data?.message || 'Something went wrong');
    }
  };

  const s = styles(theme, mode);

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.topRow}>
          <h1 style={s.logo}>🏦 FinVault</h1>
          <span style={s.themeBtn} onClick={toggleTheme}>{mode === 'dark' ? '☀️' : '🌙'}</span>
        </div>
        <p style={s.sub}>{isRegister ? 'Create your account' : 'Welcome back'}</p>

        {error && <div style={s.error}>{typeof error === 'string' ? error : 'Something went wrong'}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input style={s.input} placeholder="Full Name"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          )}
          <input style={s.input} placeholder="Email" type="email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={s.input} placeholder="Password" type="password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button type="submit" style={s.btn}>
            {isRegister ? 'Create Account' : 'Login'} →
          </button>
        </form>

        <p style={s.switchText}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span style={s.switchLink} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = (t, m) => ({
  container: {
    minHeight: '100vh', background: t.bg, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Aptos', 'Segoe UI', Tahoma, sans-serif",
  },
  card: {
    background: t.bgCard, border: `1px solid ${t.border}`,
    borderRadius: 16, padding: 40, width: 400,
  },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: t.accent, fontFamily: "'Aptos', serif", fontSize: 32, marginBottom: 8 },
  themeBtn: { fontSize: 20, cursor: 'pointer', color: t.textSecondary },
  sub: { color: t.textSecondary, marginBottom: 24 },
  error: {
    background: `${t.danger}22`, color: t.danger,
    padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14,
  },
  input: {
    width: '100%', padding: '10px 14px', marginBottom: 12, boxSizing: 'border-box',
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 8, color: t.text, fontSize: 14, outline: 'none',
  },
  btn: {
    width: '100%', padding: 12, marginTop: 8,
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
    border: 'none', borderRadius: 8, color: m === 'dark' ? '#000' : '#fff',
    fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  switchText: { color: t.textSecondary, textAlign: 'center', marginTop: 16, fontSize: 14 },
  switchLink: { color: t.accent, cursor: 'pointer' },
});
