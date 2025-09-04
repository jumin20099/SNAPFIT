"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // 시스템 테마 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // localStorage에서 테마 불러오기 (초기 로드 시에만)
  useEffect(() => {
    if (!isInitialized) {
      const stored = localStorage.getItem('theme') as Theme;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setTheme(stored);
        console.log('초기 테마 로드:', stored);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 테마 변경 시 localStorage 저장 및 DOM 클래스 적용
  useEffect(() => {
    if (!isInitialized) return; // 초기화 전에는 실행하지 않음
    
    console.log('=== ThemeContext 테마 변경 감지 ===', {
      새테마: theme,
      시스템테마: systemTheme,
      실제적용테마: theme === 'system' ? systemTheme : theme
    });
    
    localStorage.setItem('theme', theme);
    
    const root = document.documentElement;
    const actualTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    
    // body 클래스도 업데이트 (일부 컴포넌트에서 사용)
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(actualTheme);
    
    console.log('=== DOM 클래스 업데이트 완료 ===', {
      root클래스: root.className,
      body클래스: document.body.className,
      localStorage저장값: localStorage.getItem('theme')
    });
  }, [theme, systemTheme, isInitialized]);

  const actualTheme = theme === 'system' ? systemTheme : theme;

  const value = {
    theme,
    setTheme,
    systemTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
