'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Flame, Trophy, Calendar, Clock, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateStats, formatDuration, getModeLabel, type DashboardStats } from '@/lib/session-storage';

export function DashboardClient(): JSX.Element {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Load stats only on client side to avoid hydration mismatch
    const data = calculateStats();
    setStats(data);
  }, []);

  // Get heatmap color based on minutes
  const getHeatmapColor = (minutes: number): string => {
    if (minutes === 0) return 'bg-secondary';
    if (minutes < 30) return 'bg-primary/20';
    if (minutes < 60) return 'bg-primary/40';
    if (minutes < 90) return 'bg-primary/60';
    return 'bg-primary';
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar space-y-6">
      <header className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your focus stats today</p>
        </div>
        {stats && stats.currentStreak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
            <Flame size={16} fill="currentColor" />
            <span className="font-bold">{stats.currentStreak} Day Streak</span>
          </div>
        )}
      </header>

      {/* Focus Time Card */}
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-indigo-200">Total Focus Time</p>
              <h2 className="text-4xl font-bold mt-1">
                {stats ? formatDuration(stats.totalFocusTime) : '0m'}
              </h2>
            </div>
            <div className="p-3 bg-primary/20 rounded-xl">
              <Clock className="text-primary" size={24} />
            </div>
          </div>
          {stats && stats.todayProgress !== 0 && (
            <div className={`flex items-center gap-2 text-sm ${stats.todayProgress > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.todayProgress > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="font-medium">
                {stats.todayProgress > 0 ? '+' : ''}{stats.todayProgress}% from yesterday
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mb-1">
              <Zap size={20} />
            </div>
            <div className="text-2xl font-bold">{stats?.sessionsToday ?? 0}</div>
            <div className="text-xs text-muted-foreground">Sessions Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 mb-1">
              <Trophy size={20} />
            </div>
            <div className="text-2xl font-bold">{stats?.focusScore ?? 0}</div>
            <div className="text-xs text-muted-foreground">Focus Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calendar size={18} className="text-muted-foreground" />
          Last 4 Weeks
        </h3>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {stats ? (
                stats.heatmapData.map((minutes, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`aspect-square rounded-sm ${getHeatmapColor(minutes)}`}
                    title={`${minutes} minutes`}
                  />
                ))
              ) : (
                // Placeholder during SSR
                Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-sm bg-secondary"
                  />
                ))
              )}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-secondary" />
                <div className="w-3 h-3 rounded-sm bg-primary/20" />
                <div className="w-3 h-3 rounded-sm bg-primary/40" />
                <div className="w-3 h-3 rounded-sm bg-primary/60" />
                <div className="w-3 h-3 rounded-sm bg-primary" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      {stats && stats.recentSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Recent Sessions</h3>
          <div className="space-y-2">
            {stats.recentSessions.slice(0, 5).map((session) => (
              <Card key={session.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{getModeLabel(session.mode)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.completedAt).toLocaleDateString('nl-NL', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{formatDuration(session.duration)}</div>
                    {session.interrupted && (
                      <div className="text-xs text-orange-400">Interrupted</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats && stats.recentSessions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Clock size={32} className="text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No sessions yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Start your first focus session in the Timer to see your stats here!
          </p>
        </div>
      )}
    </div>
  );
}
