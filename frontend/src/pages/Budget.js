import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Budget() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: 32 }}>
      <button onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#888899', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>
        ← Back to Dashboard
      </button>
      <h1 style={{ color: '#e8e8f0', fontFamily: 'serif', fontSize: 28, marginBottom: 8 }}>◎ Budget Planner</h1>
      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 40, textAlign: 'center', marginTop: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <p style={{ color: '#888899', fontSize: 16 }}>Budget management coming soon!</p>
        <p style={{ color: '#555566', fontSize: 13, marginTop: 8 }}>Set spending limits per category and track alerts</p>
      </div>
    </div>
  );
}
