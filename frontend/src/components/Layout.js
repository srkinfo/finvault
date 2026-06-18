import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

const navItems = [
  { label: 'Dashboard', path: '/', icon: '⬡' },
  { label: 'Transactions', path: '/transactions', icon: '↔' },
  { label: 'Budgets', path: '/budget', icon: '◎' },
  { label: 'Goals', path: '/goals', icon: '◈' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const s = styles(theme);

  return (
    <div style={s.container}>
      <aside style={s.sidebar}>
        <div style={s.logo} onClick={() => navigate('/')}>🏦 FinVault</div>
        <nav style={s.nav}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <div
                key={item.path}
                className={`sidebar-nav-item ${active ? 'sidebar-nav-active' : ''}`}
                style={{ ...s.navItem, ...(active ? s.navActive : {}) }}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
        <div style={s.sidebarBottom}>
          <div style={s.themeToggle} onClick={toggleTheme}>
            {mode === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </div>
          <div style={s.userSection}>
            <div className="user-avatar" style={s.avatar}>
              {getInitials(user?.name)}
            </div>
            <div style={s.userInfo}>
              <div style={s.userName} onClick={() => navigate('/profile')}>{user?.name}</div>
              <div style={s.logoutBtn} onClick={logout}>Logout</div>
            </div>
          </div>
        </div>
      </aside>
      <main style={s.main}>{children}</main>
    </div>
  );
}

const styles = (t) => ({
  container: {
    minHeight: '100vh',
    background: t.bg,
    display: 'flex',
    fontFamily: "var(--font-ui)",
  },
  sidebar: {
    width: 240,
    background: t.sidebar,
    borderRight: `1px solid ${t.border}`,
    padding: '28px 0',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: 'background 0.3s ease',
  },
  logo: {
    padding: '0 24px 36px',
    color: t.accent,
    fontFamily: "'Aptos', serif",
    fontSize: 22,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.3px',
  },
  nav: {
    flex: 1,
  },
  navItem: {
    padding: '12px 24px',
    cursor: 'pointer',
    color: t.textSecondary,
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderLeft: '3px solid transparent',
    position: 'relative',
  },
  navActive: {
    color: t.accent,
    background: t.hover,
    borderLeft: `3px solid ${t.accent}`,
  },
  sidebarBottom: {
    marginTop: 'auto',
    padding: '0 20px 24px',
  },
  themeToggle: {
    color: t.textSecondary,
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 16,
    padding: '8px 12px',
    borderRadius: 10,
    background: t.inputBg,
    border: `1px solid ${t.border}`,
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  userSection: {
    borderTop: `1px solid ${t.border}`,
    paddingTop: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
    color: '#1A1A23',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    color: t.text,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    color: t.danger,
    fontSize: 11,
    cursor: 'pointer',
    marginTop: 2,
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  main: {
    flex: 1,
    padding: 36,
    overflowY: 'auto',
    transition: 'background 0.3s ease',
  },
});