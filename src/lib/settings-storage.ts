/**
 * Settings Storage Service
 * Manages user preferences and app settings
 */

export interface AppSettings {
  // Notifications
  notificationsEnabled: boolean;
  notificationSound: boolean;
  
  // Timer Defaults
  defaultTimerMode: 'pomodoro' | 'deep50' | 'deep90' | 'short' | 'long' | 'custom';
  defaultVolume: number; // 0-100
  defaultSound: 'none' | 'rain' | 'forest' | 'cafe' | 'brown' | 'pink' | 'ocean' | 'airplane';
  autoStartBreaks: boolean;
  
  // Appearance
  theme: 'light' | 'dark' | 'system';
  
  // Privacy
  saveHistory: boolean;
  
  // Advanced
  tickSound: boolean;
  fullscreenOnStart: boolean;
}

const STORAGE_KEY = 'deepflow-settings';

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  notificationSound: true,
  defaultTimerMode: 'pomodoro',
  defaultVolume: 50,
  defaultSound: 'none',
  autoStartBreaks: false,
  theme: 'dark',
  saveHistory: true,
  tickSound: false,
  fullscreenOnStart: false,
};

/**
 * Get current settings from localStorage
 */
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Partial<AppSettings>): void {
  if (typeof window === 'undefined') return;
  
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Reset all settings to defaults
 */
export function resetSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
}

/**
 * Export settings as JSON
 */
export function exportSettings(): string {
  const settings = getSettings();
  return JSON.stringify(settings, null, 2);
}

/**
 * Import settings from JSON
 */
export function importSettings(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    saveSettings(parsed);
    return true;
  } catch {
    return false;
  }
}
