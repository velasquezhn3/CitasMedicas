'use client';

import React from 'react';
import { useTheme } from '../app/theme/ThemeProvider';
import { Button } from '@shadcn/ui/button';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme} variant="outline" size="sm">
      {theme === 'light' ? '🌞 Light Mode' : '🌙 Dark Mode'}
    </Button>
  );
}
