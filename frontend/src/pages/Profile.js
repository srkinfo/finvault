import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import API from '../api/axios';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED'];
const TIMEZONES = ['Asia/Kolkata','America/New_York','America/Chicago','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Australia/Sydney'];
const LANGUAGES = ['en','hi','es','fr','de','ja','zh','ar'];
const SALARY_RANGES = ['0-5L','5-10L','10-20L','20-50L','50L-1Cr','1Cr+'];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [accountStatus, setAccountStatus] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    currency: user?.currency || 'INR',
    timezone: user?.timezone || 'Asia/Kolkata',
    language: user?.language || 'en',
    monthlyIncome: user?.monthlyIncome || '',
    salaryRange: user?.salaryRange || '',
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deletePw, setDeletePw] = useState('');

  useEffect(() => {
    API.get('/user/account-status').then(res => setAccountStatus(res.data)).catch(() => {});
  }, []);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put('/user/profile', form);
      updateUser(res.data);
      showMessage('Profile updated successfully!');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update profile', 'error');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await API.put('/user/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      showMessage('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to change password', 'error');
    }
    setLoading(false);
  };

  const handleToggle2FA = async () => {
    try {
      const res = await API.post('/user/toggle-2fa');
      showMessage(res.data.message);
      setAccountStatus(prev => prev ? { ...prev, twoFactorEnabled: res.data.twoFactorEnabled } : prev);
    } catch (err) {
      showMessage('Failed to toggle 2FA', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePw) {
      showMessage('Please enter your password', 'error');
      return;
    }
    setLoading(true);
    try {
      await API.delete('/user/account', { data: { password: deletePw } });
      showMessage('Account deleted. Logging out...', 'success');
      setTimeout(() => logout(), 2000);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete account', 'error');
    }
    setLoading(false);
  };

  const s = styles(theme);

  const tabs = [
    { id: 'personal', label: '👤 Personal Info' },
    { id: 'security', label: '🔒 Security' },
    { id: 'preferences', label: '⚙️ Preferences' },
    { id: 'financial', label: '💰 Financial Identity' },
    { id: 'account', label: '📊 Account Status' },
  ];

  const renderPersonalInfo = () => (
    <form onSubmit={handleProfileUpdate} style={s.formCard}>
      <h3 style={s.sectionTitle}>Personal Information</h3>
      <div style={s.formGrid}>
        <div style={s.field}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input style={{...s.input, opacity: 0.6}} value={user?.email || ''} disabled />
          <span style={s.fieldHint}>Email cannot be changed</span>
        </div>
        <div style={s.field}>
          <label style={s.label}>Phone Number</label>
          <input style={s.input} placeholder="+91 98765 43210"
            value={form.phoneNumber}
            onChange={e => setForm({...form, phoneNumber: e.target.value})} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Date of Birth</label>
          <input style={s.input} type="date"
            value={form.dateOfBirth}
            onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
        </div>
      </div>
      <button type="submit" style={s.btn} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );

  const renderSecurity = () => (
    <div>
      <form onSubmit={handlePasswordChange} style={s.formCard}>
        <h3 style={s.sectionTitle}>Change Password</h3>
        <div style={s.formGrid}>
          <div style={s.field}>
            <label style={s.label}>Current Password</label>
            <input style={s.input} type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>New Password</label>
            <input style={s.input} type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Confirm New Password</label>
            <input style={s.input} type="password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} required />
          </div>
        </div>
        <button type="submit" style={s.btn} disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>

      <div style={s.formCard}>
        <h3 style={s.sectionTitle}>Two-Factor Authentication</h3>
        <p style={s.fieldHint}>Add an extra layer of security to your account</p>
        <div style={s.tfaRow}>
          <span style={{ color: theme.text, fontSize: 14 }}>
            Status: <span style={{ color: accountStatus?.twoFactorEnabled ? theme.income : theme.textMuted, fontWeight: 600 }}>
              {accountStatus?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </span>
          <button style={{...s.tfaBtn, background: accountStatus?.twoFactorEnabled ? theme.danger : theme.income}}
            onClick={handleToggle2FA}>
            {accountStatus?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <form onSubmit={handleProfileUpdate} style={s.formCard}>
      <h3 style={s.sectionTitle}>Preferences</h3>
      <div style={s.formGrid}>
        <div style={s.field}>
          <label style={s.label}>Currency</label>
          <select style={s.input} value={form.currency}
            onChange={e => setForm({...form, currency: e.target.value})}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Timezone</label>
          <select style={s.input} value={form.timezone}
            onChange={e => setForm({...form, timezone: e.target.value})}>
            {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Language</label>
          <select style={s.input} value={form.language}
            onChange={e => setForm({...form, language: e.target.value})}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" style={s.btn} disabled={loading}>
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );

  const renderFinancial = () => (
    <form onSubmit={handleProfileUpdate} style={s.formCard}>
      <h3 style={s.sectionTitle}>Financial Identity</h3>
      <div style={s.formGrid}>
        <div style={s.field}>
          <label style={s.label}>Monthly Income (₹)</label>
          <input style={s.input} type="number" step="0.01" placeholder="50000"
            value={form.monthlyIncome}
            onChange={e => setForm({...form, monthlyIncome: e.target.value})} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Salary Range</label>
          <select style={s.input} value={form.salaryRange}
            onChange={e => setForm({...form, salaryRange: e.target.value})}>
            <option value="">Select range</option>
            {SALARY_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" style={s.btn} disabled={loading}>
        {loading ? 'Saving...' : 'Save Financial Info'}
      </button>
    </form>
  );

  const renderAccountStatus = () => (
    <div style={s.formCard}>
      <h3 style={s.sectionTitle}>Account Overview</h3>
      {accountStatus ? (
        <div style={s.statusGrid}>
          <div style={s.statItem}>
            <span style={s.statLabel}>Email Verified</span>
            <span style={{ color: accountStatus.emailVerified ? theme.income : theme.danger, fontWeight: 600 }}>
              {accountStatus.emailVerified ? '✓ Verified' : '✗ Unverified'}
            </span>
          </div>
          <div style={s.statItem}>
            <span style={s.statLabel}>2FA Enabled</span>
            <span style={{ color: accountStatus.twoFactorEnabled ? theme.income : theme.textMuted, fontWeight: 600 }}>
              {accountStatus.twoFactorEnabled ? 'Yes' : 'No'}
            </span>
          </div>
          <div style={s.statItem}>
            <span style={s.statLabel}>Account Created</span>
            <span style={s.statValue}>{accountStatus.createdAt}</span>
          </div>
          <div style={s.statItem}>
            <span style={s.statLabel}>Last Login</span>
            <span style={s.statValue}>{accountStatus.lastLogin ? new Date(accountStatus.lastLogin).toLocaleString() : 'N/A'}</span>
          </div>
          <div style={s.statItem}>
            <span style={s.statLabel}>Transactions</span>
            <span style={s.statValue}>{accountStatus.transactionCount}</span>
          </div>
          <div style={s.statItem}>
            <span style={s.statLabel}>Budgets</span>
            <span style={s.statValue}>{accountStatus.budgetCount}</span>
          </div>
          <div style={s.statItem}>
            <span style={s.statLabel}>Goals</span>
            <span style={s.statValue}>{accountStatus.goalCount}</span>
          </div>
        </div>
      ) : (
        <p style={{ color: theme.textMuted }}>Loading account status...</p>
      )}

      <div style={{ ...s.formCard, marginTop: 20, borderColor: theme.danger }}>
        <h3 style={{ ...s.sectionTitle, color: theme.danger }}>Danger Zone</h3>
        <p style={s.fieldHint}>Once you delete your account, there is no going back. Please be certain.</p>
        <div style={s.deleteRow}>
          <input style={{...s.input, flex: 1, minWidth: 200}} type="password" placeholder="Enter your password to confirm"
            value={deletePw} onChange={e => setDeletePw(e.target.value)} />
          <button style={s.deleteBtn} onClick={handleDeleteAccount} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div style={s.header}>
        <h1 style={s.title}>Account & Profile</h1>
        <p style={s.subtitle}>Manage your personal information, security, and preferences</p>
      </div>

      {message && (
        <div style={{ ...s.message,
          background: messageType === 'success' ? `${theme.income}22` : `${theme.danger}22`,
          color: messageType === 'success' ? theme.income : theme.danger
        }}>
          {message}
        </div>
      )}

      {/* Profile Avatar Summary */}
      <div style={s.profileSummary}>
        <div style={s.avatarLarge}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
        <div style={s.summaryInfo}>
          <div style={s.summaryName}>{user?.name}</div>
          <div style={s.summaryEmail}>{user?.email}</div>
          <div style={s.summaryMeta}>
            {user?.currency && <span style={s.badge}>{user.currency}</span>}
            {user?.language && <span style={s.badge}>{user.language.toUpperCase()}</span>}
            {accountStatus?.twoFactorEnabled && <span style={{...s.badge, background: theme.income + '22', color: theme.income}}>2FA</span>}
            {user?.phoneNumber && <span style={s.badge}>{user.phoneNumber}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {tabs.map(tab => (
          <div key={tab.id}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={s.tabContent}>
        {activeTab === 'personal' && renderPersonalInfo()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'preferences' && renderPreferences()}
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'account' && renderAccountStatus()}
      </div>
    </Layout>
  );
}

const styles = (t) => ({
  header: { marginBottom: 24 },
  title: { fontFamily: "'Plus Jakarta Sans', serif", color: t.text, fontSize: 28, marginBottom: 4 },
  subtitle: { color: t.textSecondary, fontSize: 15 },
  message: { padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 500 },
  profileSummary: {
    display: 'flex', alignItems: 'center', gap: 20,
    background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16,
    padding: 24, marginBottom: 24,
  },
  avatarLarge: {
    width: 64, height: 64, borderRadius: 16,
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 700, color: '#000', flexShrink: 0,
  },
  summaryInfo: {},
  summaryName: { fontFamily: "'Plus Jakarta Sans', serif", color: t.text, fontSize: 20, fontWeight: 700 },
  summaryEmail: { color: t.textSecondary, fontSize: 13, marginTop: 2 },
  summaryMeta: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  badge: {
    padding: '2px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
    background: t.inputBg, border: `1px solid ${t.border}`, color: t.textSecondary,
  },
  tabRow: {
    display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap',
    background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 4,
  },
  tab: {
    padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
    fontSize: 13, color: t.textSecondary, transition: 'all 0.15s',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  tabActive: { background: t.accent + '22', color: t.accent, fontWeight: 600 },
  tabContent: {},
  formCard: {
    background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16,
    padding: 24, marginBottom: 20,
  },
  sectionTitle: { fontFamily: "'Plus Jakarta Sans', serif", color: t.text, fontSize: 16, fontWeight: 700, marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: {},
  label: { display: 'block', color: t.textSecondary, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: t.inputBg, border: `1px solid ${t.border}`,
    borderRadius: 8, color: t.text, fontSize: 13, outline: 'none',
    fontFamily: "'DM Mono', monospace",
  },
  fieldHint: { display: 'block', color: t.textMuted, fontSize: 11, marginTop: 4 },
  btn: {
    marginTop: 20, padding: '10px 28px',
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
    border: 'none', borderRadius: 8, color: '#000', fontWeight: 700,
    fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  tfaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  tfaBtn: {
    padding: '8px 20px', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontWeight: 700, fontSize: 13, color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  statusGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  statItem: { display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px', background: t.inputBg, borderRadius: 10 },
  statLabel: { color: t.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono', monospace" },
  deleteRow: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  deleteBtn: {
    padding: '10px 24px', background: t.danger, border: 'none', borderRadius: 8,
    color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});