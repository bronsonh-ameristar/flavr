import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useStore from '../../../store/useStore';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useStore();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;