import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'expanded';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 ${className}`}
        aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      >
        <div className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-200/70 dark:bg-white/10 text-amber-500 dark:text-amber-300">
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
        </div>
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    );
  }

  if (variant === 'expanded') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm text-amber-500 dark:text-amber-300">
            {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {isDark ? 'Dark Theme Active' : 'Light Theme Active'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {isDark ? 'Optimal for dark sanctuary auditoriums' : 'Clean high-contrast daytime view'}
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={toggleTheme}
          className="h-8 text-xs font-semibold border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-sm"
        >
          {isDark ? 'Switch to Light' : 'Switch to Dark'}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      type="button"
      className={`h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 border border-slate-200/70 dark:border-white/10 rounded-lg cursor-pointer transition-colors ${className}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </Button>
  );
};

