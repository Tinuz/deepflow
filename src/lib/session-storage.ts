/**
 * Session Storage Service
 * Shared utilities for managing focus session data across the app
 */

export type TimerMode = 'pomodoro' | 'deep50' | 'deep90' | 'short' | 'long' | 'custom';

export interface SessionHistory {
  id: string;
  mode: TimerMode;
  duration: number; // in seconds
  completedAt: Date;
  interrupted: boolean;
}

export interface DashboardStats {
  totalFocusTime: number; // in seconds
  sessionsToday: number;
  currentStreak: number;
  focusScore: number;
  todayProgress: number; // percentage vs yesterday
  heatmapData: number[]; // last 28 days in minutes
  recentSessions: SessionHistory[];
}

const STORAGE_KEY = 'deepflow-sessions';

/**
 * Get all sessions from localStorage
 */
export function getSessions(): SessionHistory[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    return parsed.map((s: SessionHistory) => ({
      ...s,
      completedAt: new Date(s.completedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Save a new session
 */
export function saveSession(session: SessionHistory): void {
  if (typeof window === 'undefined') return;
  
  const sessions = getSessions();
  const updated = [session, ...sessions].slice(0, 100); // Keep last 100
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Get start of day timestamp
 */
function getStartOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Calculate dashboard statistics
 */
export function calculateStats(): DashboardStats {
  const sessions = getSessions().filter(s => !s.interrupted);
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const yesterdayStart = todayStart - 86400000;

  // Today's sessions
  const todaySessions = sessions.filter(
    s => s.completedAt.getTime() >= todayStart
  );

  // Yesterday's sessions
  const yesterdaySessions = sessions.filter(
    s => s.completedAt.getTime() >= yesterdayStart && s.completedAt.getTime() < todayStart
  );

  // Total focus time today (in seconds)
  const totalFocusTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  
  // Yesterday's focus time
  const yesterdayFocusTime = yesterdaySessions.reduce((sum, s) => sum + s.duration, 0);

  // Progress vs yesterday
  const todayProgress = yesterdayFocusTime > 0
    ? Math.round(((totalFocusTime - yesterdayFocusTime) / yesterdayFocusTime) * 100)
    : 0;

  // Current streak (consecutive days with at least 1 session)
  let currentStreak = 0;
  let checkDate = todayStart;
  
  while (checkDate >= 0) {
    const dayStart = checkDate;
    const dayEnd = checkDate + 86400000;
    const hasSessions = sessions.some(
      s => s.completedAt.getTime() >= dayStart && s.completedAt.getTime() < dayEnd
    );
    
    if (hasSessions) {
      currentStreak++;
      checkDate -= 86400000;
    } else if (currentStreak > 0) {
      // Streak broken
      break;
    } else {
      // No sessions today yet, check yesterday
      checkDate -= 86400000;
      if (checkDate < todayStart - 86400000) break;
    }
  }

  // Focus score (algorithm: sessions * avg_duration_minutes * consistency_multiplier)
  const avgDuration = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60
    : 0;
  const consistencyMultiplier = Math.min(currentStreak / 7, 2); // Max 2x at 7+ days
  const focusScore = Math.round(sessions.length * avgDuration * (1 + consistencyMultiplier));

  // Heatmap data (last 28 days)
  const heatmapData: number[] = [];
  for (let i = 27; i >= 0; i--) {
    const dayStart = todayStart - i * 86400000;
    const dayEnd = dayStart + 86400000;
    const dayMinutes = sessions
      .filter(s => s.completedAt.getTime() >= dayStart && s.completedAt.getTime() < dayEnd)
      .reduce((sum, s) => sum + s.duration / 60, 0);
    heatmapData.push(Math.round(dayMinutes));
  }

  return {
    totalFocusTime,
    sessionsToday: todaySessions.length,
    currentStreak,
    focusScore,
    todayProgress,
    heatmapData,
    recentSessions: sessions.slice(0, 10),
  };
}

/**
 * Format seconds to readable time string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format time for display (MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get mode label
 */
export function getModeLabel(mode: TimerMode): string {
  const labels: Record<TimerMode, string> = {
    pomodoro: 'Pomodoro',
    deep50: 'Deep 50',
    deep90: 'Deep 90',
    short: 'Short',
    long: 'Long',
    custom: 'Custom',
  };
  return labels[mode];
}
