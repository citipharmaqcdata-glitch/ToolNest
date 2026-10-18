const FAVORITES_KEY = 'toolnest_favorites';
const RECENT_KEY = 'toolnest_recent';
const THEME_KEY = 'toolnest_theme';

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['percentage-calculator', 'molarity-calculator', 'image-compressor'];
  } catch {
    return ['percentage-calculator', 'molarity-calculator', 'image-compressor'];
  }
}

export function toggleFavorite(toolId: string): string[] {
  try {
    const current = getFavorites();
    const updated = current.includes(toolId)
      ? current.filter(id => id !== toolId)
      : [...current, toolId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getRecentTools(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentTool(toolId: string): void {
  try {
    const current = getRecentTools().filter(id => id !== toolId);
    const updated = [toolId, ...current].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues in restricted modes
  }
}

export function getSavedTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore
  }
}
