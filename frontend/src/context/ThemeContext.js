import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const themes = {
  dark: {
    bg: '#0F0F13',
    bgCard: '#1A1A23',
    border: '#2A2A35',
    text: '#E8E8F0',
    textSecondary: '#8888A0',
    textMuted: '#555566',
    accent: '#C9A84C',
    accentLight: '#E8C96A',
    income: '#22C55E',
    expense: '#EF4444',
    savings: '#C9A84C',
    rate: '#3B82F6',
    inputBg: '#22222E',
    inputBorder: '#2A2A35',
    hover: '#252530',
    sidebar: '#1A1A23',
    danger: '#EF4444',
  },
  light: {
    bg: '#F8F7F2',
    bgCard: '#FFFFFF',
    border: '#E8E5DC',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textMuted: '#A0A0A0',
    accent: '#C9A84C',
    accentLight: '#D4B04E',
    income: '#16A34A',
    expense: '#DC2626',
    savings: '#C9A84C',
    rate: '#2563EB',
    inputBg: '#FFFFFF',
    inputBorder: '#D1D5DB',
    hover: '#F0EFEA',
    sidebar: '#FFFFFF',
    danger: '#DC2626',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const stored = localStorage.getItem('theme');
  const [mode, setMode] = useState(stored === 'light' ? 'light' : 'dark');

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  const theme = themes[mode];

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--bg-card', theme.bgCard);
    document.documentElement.style.setProperty('--border', theme.border);
    document.documentElement.style.setProperty('--text', theme.text);
    document.documentElement.style.setProperty('--text-secondary', theme.textSecondary);
    document.documentElement.style.setProperty('--text-muted', theme.textMuted);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--accent-light', theme.accentLight);
    document.documentElement.style.setProperty('--income', theme.income);
    document.documentElement.style.setProperty('--expense', theme.expense);
    document.documentElement.style.setProperty('--savings', theme.savings);
    document.documentElement.style.setProperty('--rate', theme.rate);
    document.documentElement.style.setProperty('--hover', theme.hover);
    document.documentElement.style.setProperty('--sidebar', theme.sidebar);
    document.documentElement.style.setProperty('--danger', theme.danger);
    document.documentElement.style.setProperty('--input-bg', theme.inputBg);
    document.documentElement.style.setProperty('--input-border', theme.inputBorder);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);