import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('voxa_theme') || 'dark',

  setTheme: (newTheme) => {
    localStorage.setItem('voxa_theme', newTheme);
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    set({ theme: newTheme });
  },

  initTheme: () => {
    const savedTheme = localStorage.getItem('voxa_theme') || 'dark';
    const root = document.documentElement;

    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else if (savedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  },
}));
