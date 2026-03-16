import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister ? '/auth/register' : '/auth/login';
      const res = await API.post(url, form);
      login(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Something went wrong');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 40, width: 400 }}>
        <h1 style={{ color: '#c9a84c', fontFamily: 'serif', fontSize: 32, marginBottom: 8 }}>🏦 FinVault</h1>
        <p style={{ color: '#888899', marginBottom: 24 }}>{isRegister ? 'Create your account' : 'Welcome back'}</p>

        {error && (
          <div style={{ background: '#f4617a22', color: '#f4617a', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input style={inputStyle} placeholder="Full Name"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          )}
          <input style={inputStyle} placeholder="Email" type="email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={inputStyle} placeholder="Password" type="password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button type="submit" style={btnStyle}>
            {isRegister ? 'Create Account' : 'Login'} →
          </button>
        </form>

        <p style={{ color: '#888899', textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span style={{ color: '#c9a84c', cursor: 'pointer' }}
            onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px', marginBottom: 12,
  background: '#16161f', border: '1px solid #1e1e2e',
  borderRadius: 8, color: '#e8e8f0', fontSize: 14,
  outline: 'none', boxSizing: 'border-box'
};

const btnStyle = {
  width: '100%', padding: 12, marginTop: 8,
  background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
  border: 'none', borderRadius: 8, color: '#000',
  fontWeight: 700, fontSize: 15, cursor: 'pointer'
};