import { useState, useEffect } from 'react';

const THEME_COLORS = {
  blue: {
    name: '파란색',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
  },
  purple: {
    name: '보라색',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#ede9fe',
  },
  green: {
    name: '초록색',
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#d1fae5',
  },
  red: {
    name: '빨간색',
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    primaryLight: '#fee2e2',
  },
  orange: {
    name: '주황색',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#ffedd5',
  },
};

function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 'blue';
  });

  useEffect(() => {
    const colors = THEME_COLORS[currentTheme];
    const root = document.documentElement;

    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-hover', colors.primaryHover);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
  }, [currentTheme]);

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return {
    currentTheme,
    changeTheme,
    availableThemes: THEME_COLORS,
  };
}

export default useTheme;
