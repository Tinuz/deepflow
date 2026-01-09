'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Moon, Sun, Monitor, Bell, BellOff, Volume2, Download, Upload, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettings, saveSettings, resetSettings, exportSettings, importSettings, type AppSettings } from '@/lib/settings-storage';
import { getSessions } from '@/lib/session-storage';

type SoundMode = 'none' | 'rain' | 'forest' | 'cafe' | 'brown' | 'pink' | 'ocean' | 'airplane';
type TimerMode = 'pomodoro' | 'deep50' | 'deep90' | 'short' | 'long' | 'custom';

export function SettingsClient(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  useEffect(() => {
    const current = getSettings();
    setSettings(current);
    
    // Request notification permission if enabled
    if (current.notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    if (!settings) return;
    
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings({ [key]: value });
    
    // Handle special cases
    if (key === 'notificationsEnabled' && value === true) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const handleExport = (): void => {
    const data = exportSettings();
    const sessions = getSessions();
    
    const exportData = {
      settings: JSON.parse(data),
      sessions: sessions,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Import settings
          if (data.settings) {
            importSettings(JSON.stringify(data.settings));
          }
          
          // Import sessions
          if (data.sessions) {
            localStorage.setItem('deepflow-sessions', JSON.stringify(data.sessions));
          }
          
          // Reload settings
          setSettings(getSettings());
          alert('✅ Data successfully imported!');
        } catch {
          alert('❌ Failed to import data. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = (): void => {
    resetSettings();
    setSettings(getSettings());
    setShowResetConfirm(false);
  };

  const handleClearData = (): void => {
    localStorage.removeItem('deepflow-sessions');
    setShowClearDataConfirm(false);
    alert('🗑️ All session data cleared');
  };

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const soundOptions: Array<{ value: SoundMode; label: string; icon: string }> = [
    { value: 'none', label: 'None', icon: '🔇' },
    { value: 'rain', label: 'Rain', icon: '🌧️' },
    { value: 'forest', label: 'Forest', icon: '🌲' },
    { value: 'cafe', label: 'Café', icon: '☕' },
    { value: 'ocean', label: 'Ocean', icon: '🌊' },
    { value: 'airplane', label: 'Airplane', icon: '✈️' },
    { value: 'brown', label: 'Brown', icon: '📻' },
    { value: 'pink', label: 'Pink', icon: '💨' },
  ];

  const timerModes: Array<{ value: TimerMode; label: string }> = [
    { value: 'pomodoro', label: 'Pomodoro (25m)' },
    { value: 'deep50', label: 'Deep 50 (50m)' },
    { value: 'deep90', label: 'Deep 90 (90m)' },
    { value: 'short', label: 'Short (5m)' },
    { value: 'long', label: 'Long (15m)' },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your focus experience</p>
      </header>

      {/* Notifications */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Notifications</h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.notificationsEnabled ? (
                  <Bell size={18} className="text-primary" />
                ) : (
                  <BellOff size={18} className="text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Session Notifications</p>
                  <p className="text-xs text-muted-foreground">Get notified when sessions end</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  settings.notificationsEnabled ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                    settings.notificationsEnabled ? 'left-6' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            {settings.notificationsEnabled && (
              <div className="flex items-center justify-between pl-9">
                <div>
                  <p className="text-sm font-medium">Sound</p>
                  <p className="text-xs text-muted-foreground">Play notification sound</p>
                </div>
                <button
                  onClick={() => updateSetting('notificationSound', !settings.notificationSound)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    settings.notificationSound ? 'bg-primary' : 'bg-secondary'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                      settings.notificationSound ? 'left-6' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Timer Defaults */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Timer Defaults</h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Default Mode */}
            <div>
              <p className="text-sm font-medium mb-2">Default Timer</p>
              <div className="grid grid-cols-2 gap-2">
                {timerModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => updateSetting('defaultTimerMode', mode.value)}
                    className={cn(
                      'p-2 rounded-lg text-xs font-medium transition-all',
                      settings.defaultTimerMode === mode.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Sound */}
            <div>
              <p className="text-sm font-medium mb-2">Default Ambient Sound</p>
              <div className="grid grid-cols-4 gap-2">
                {soundOptions.map((sound) => (
                  <button
                    key={sound.value}
                    onClick={() => updateSetting('defaultSound', sound.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                      settings.defaultSound === sound.value
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                    )}
                  >
                    <span className="text-lg">{sound.icon}</span>
                    <span className="text-[9px]">{sound.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Default Volume</p>
                <span className="text-xs text-muted-foreground">{settings.defaultVolume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.defaultVolume}
                  onChange={(e) => updateSetting('defaultVolume', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>
            </div>

            {/* Auto-start Breaks */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-start Breaks</p>
                <p className="text-xs text-muted-foreground">Automatically start break timer</p>
              </div>
              <button
                onClick={() => updateSetting('autoStartBreaks', !settings.autoStartBreaks)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  settings.autoStartBreaks ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                    settings.autoStartBreaks ? 'left-6' : 'left-0.5'
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Appearance */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Appearance</h3>
        <Card>
          <CardContent className="p-2">
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateSetting('theme', t)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                    settings.theme === t ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary/50'
                  )}
                >
                  {t === 'light' && <Sun size={20} />}
                  {t === 'dark' && <Moon size={20} />}
                  {t === 'system' && <Monitor size={20} />}
                  <span className="text-xs capitalize">{t}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Privacy */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Privacy & Data</h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Save Session History</p>
                <p className="text-xs text-muted-foreground">Store completed sessions locally</p>
              </div>
              <button
                onClick={() => updateSetting('saveHistory', !settings.saveHistory)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  settings.saveHistory ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                    settings.saveHistory ? 'left-6' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleExport}
              >
                <Download size={16} className="mr-2" />
                Export Data
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleImport}
              >
                <Upload size={16} className="mr-2" />
                Import Data
              </Button>
              
              <Button
                variant="outline"
                className="w-full text-orange-500 hover:bg-orange-500/10 border-orange-500/20"
                onClick={() => setShowClearDataConfirm(true)}
              >
                <Trash2 size={16} className="mr-2" />
                Clear All Session Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Advanced */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Advanced</h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Fullscreen on Start</p>
                <p className="text-xs text-muted-foreground">Auto-enter fullscreen when timer starts</p>
              </div>
              <button
                onClick={() => updateSetting('fullscreenOnStart', !settings.fullscreenOnStart)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  settings.fullscreenOnStart ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                    settings.fullscreenOnStart ? 'left-6' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw size={16} className="mr-2" />
                Reset All Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* About */}
      <Card>
        <CardContent className="p-4 text-center space-y-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            DeepFlow
          </div>
          <div className="text-xs text-muted-foreground">
            Version 1.0.0 • Made with ❤️ for deep work
          </div>
          <div className="text-xs text-muted-foreground">
            © 2026 DeepFlow • All rights reserved
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <RotateCcw size={48} className="mx-auto mb-4 text-destructive" />
                <h3 className="text-lg font-bold mb-2">Reset All Settings?</h3>
                <p className="text-sm text-muted-foreground">
                  This will restore all settings to their default values. Your session data will not be affected.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearDataConfirm && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <Trash2 size={48} className="mx-auto mb-4 text-destructive" />
                <h3 className="text-lg font-bold mb-2">Clear All Data?</h3>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all your session history, stats, and progress. This action cannot be undone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setShowClearDataConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClearData}>
                  Delete All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
