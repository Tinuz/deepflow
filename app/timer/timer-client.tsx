'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, VolumeX, Maximize2, Minimize2, CloudRain, Trees, Coffee, History, Bell, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type TimerMode = 'pomodoro' | 'deep50' | 'deep90' | 'short' | 'long' | 'custom';
type SoundMode = 'none' | 'rain' | 'forest' | 'coffee';

interface TimerPreset {
  focus: number;
  break: number;
  label: string;
}

interface SessionHistory {
  id: string;
  mode: TimerMode;
  duration: number;
  completedAt: Date;
  interrupted: boolean;
}

const TIMER_PRESETS: Record<TimerMode, TimerPreset> = {
  pomodoro: { focus: 25 * 60, break: 5 * 60, label: 'Pomodoro' },
  deep50: { focus: 50 * 60, break: 10 * 60, label: 'Deep 50' },
  deep90: { focus: 90 * 60, break: 20 * 60, label: 'Deep 90' },
  short: { focus: 5 * 60, break: 0, label: 'Short Break' },
  long: { focus: 15 * 60, break: 0, label: 'Long Break' },
  custom: { focus: 25 * 60, break: 5 * 60, label: 'Custom' },
};

export function TimerClient(): JSX.Element {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [duration, setDuration] = useState<number>(25 * 60);
  const [sound, setSound] = useState<SoundMode>('none');
  const [volume, setVolume] = useState<number>(50);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load session history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('deepflow-sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessionHistory(parsed.map((s: SessionHistory) => ({
          ...s,
          completedAt: new Date(s.completedAt),
        })));
      } catch (e) {
        console.error('Failed to load session history', e);
      }
    }

    // Check notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async (): Promise<void> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  // Send notification
  const sendNotification = useCallback((title: string, body: string): void => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
    }
  }, [notificationsEnabled]);

  // Timer logic - Fixed to prevent re-running on every tick
  const timeLeftRef = useRef(timeLeft);
  const sessionHistoryRef = useRef(sessionHistory);
  
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    sessionHistoryRef.current = sessionHistory;
  }, [sessionHistory]);

  // Save session to history - using refs to prevent re-renders
  const saveSession = useCallback((interrupted: boolean = false): void => {
    const session: SessionHistory = {
      id: Date.now().toString(),
      mode,
      duration: duration - timeLeftRef.current,
      completedAt: new Date(),
      interrupted,
    };

    const updated = [session, ...sessionHistoryRef.current].slice(0, 50);
    setSessionHistory(updated);
    localStorage.setItem('deepflow-sessions', JSON.stringify(updated));
  }, [mode, duration]); // timeLeft and sessionHistory removed!

  useEffect(() => {
    console.log('⏱️ Timer effect triggered:', { isActive, timeLeft, mode });
    
    if (!isActive) {
      console.log('⏸️ Timer paused or stopped');
      return;
    }

    console.log('▶️ Starting timer interval');
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        console.log('⏰ Tick:', newTime);
        
        // Check for completion
        if (newTime === 0) {
          console.log('🎉 Session complete!');
          setIsActive(false);
          saveSession(false);
          sendNotification('Session Complete! 🎉', `Great job! You completed a ${TIMER_PRESETS[mode].label} session.`);
          
          // Play completion sound
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      console.log('🧹 Cleaning up interval');
      clearInterval(interval);
    };
  }, [isActive, mode, saveSession, sendNotification]); // timeLeft removed from dependencies!

  // Fullscreen handler
  const toggleFullscreen = async (): Promise<void> => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error entering fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const switchMode = (newMode: TimerMode): void => {
    if (isActive) {
      saveSession(true); // Save as interrupted
    }
    
    setMode(newMode);
    setIsActive(false);
    
    const preset = TIMER_PRESETS[newMode];
    const newTime = preset.focus;
    
    setDuration(newTime);
    setTimeLeft(newTime);
  };

  const toggleTimer = (): void => {
    console.log('🔄 toggleTimer called - Current state:', { isActive, timeLeft, mode });
    
    if (!isActive && !notificationsEnabled && 'Notification' in window) {
      console.log('📢 Requesting notification permission');
      requestNotificationPermission();
    }
    
    const newState = !isActive;
    console.log('✅ Setting isActive to:', newState);
    setIsActive(newState);
  };

  const handleTimerToggle = (e: React.MouseEvent | React.TouchEvent): void => {
    console.log('👆 handleTimerToggle triggered', {
      type: e.type,
      isTouch: 'touches' in e,
      currentIsActive: isActive,
      timestamp: new Date().toISOString()
    });
    
    e.preventDefault();
    e.stopPropagation();
    toggleTimer();
  };

  const resetTimer = (): void => {
    if (isActive) {
      saveSession(true);
    }
    setIsActive(false);
    setTimeLeft(duration);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden relative">
      {/* Debug Info - Visible on screen */}
      <div className="fixed top-0 left-0 right-0 bg-black/80 text-white text-xs p-2 z-50 font-mono">
        <div>State: {isActive ? '▶️ RUNNING' : '⏸️ PAUSED'}</div>
        <div>Time: {formatTime(timeLeft)} / {formatTime(duration)}</div>
        <div>Mode: {TIMER_PRESETS[mode].label}</div>
      </div>

      {/* Header - Mobile Optimized */}
      <div className="flex justify-between items-center mb-6 sm:mb-8 mt-12">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-full hover:bg-white/5 active:scale-95 transition-transform"
            onClick={() => setShowHistory(!showHistory)}
            title="Session History"
          >
            <History size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'w-11 h-11 rounded-full hover:bg-white/5 active:scale-95 transition-transform',
              notificationsEnabled && 'text-accent bg-accent/10'
            )}
            onClick={requestNotificationPermission}
            title="Enable Notifications"
          >
            <Bell size={20} />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-full hover:bg-white/5 active:scale-95 transition-transform"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </Button>
        </div>
      </div>

      {/* Main Timer */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Ambient Glow */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] transition-all duration-1000',
            isActive ? 'bg-primary/20 scale-125' : 'bg-primary/5 scale-100'
          )}
        />

        {/* Progress Circle - Larger on mobile */}
        <div className="relative w-[280px] h-[280px] sm:w-72 sm:h-72 flex items-center justify-center mb-8 sm:mb-12">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="stroke-muted fill-none stroke-[2]" />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-primary fill-none stroke-[2] drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={timeLeft}
              initial={{ y: 5, opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl sm:text-7xl font-bold tracking-tighter tabular-nums text-foreground"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <p className="text-muted-foreground mt-2 font-medium tracking-wide uppercase text-xs">
              {isActive ? 'Focusing...' : 'Ready to Flow'}
            </p>
            <p className="text-muted-foreground/60 mt-1 text-xs">
              {TIMER_PRESETS[mode].label}
            </p>
          </div>
        </div>

        {/* Mode Selector - Scrollable on mobile */}
        <div className="w-full max-w-md overflow-x-auto pb-2 mb-8 sm:mb-12 no-scrollbar">
          <div className="flex p-1 bg-secondary/50 rounded-full backdrop-blur-sm border border-white/5 min-w-max mx-auto gap-1">
            {Object.entries(TIMER_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => switchMode(key as TimerMode)}
                disabled={isActive}
                className={cn(
                  'px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap min-w-[60px] active:scale-95',
                  mode === key
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground disabled:opacity-50'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls - Larger touch targets */}
        <div className="flex items-center gap-4 sm:gap-6 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetTimer}
            className="w-14 h-14 sm:w-12 sm:h-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition-transform touch-manipulation"
          >
            <RotateCcw size={24} />
          </Button>

          {/* Native button for better mobile touch response */}
          <button
            type="button"
            onClick={(e) => {
              console.log('🖱️ onClick fired on play/pause button');
              handleTimerToggle(e);
            }}
            onTouchStart={(e) => {
              console.log('👇 onTouchStart fired');
              e.preventDefault();
              e.currentTarget.classList.add('scale-95');
            }}
            onTouchEnd={(e) => {
              console.log('👆 onTouchEnd fired');
              e.preventDefault();
              e.currentTarget.classList.remove('scale-95');
              handleTimerToggle(e);
            }}
            onTouchCancel={(e) => {
              console.log('❌ onTouchCancel fired');
              e.currentTarget.classList.remove('scale-95');
            }}
            className={cn(
              'w-24 h-24 sm:w-20 sm:h-20 rounded-3xl transition-all duration-300 shadow-xl',
              'flex items-center justify-center touch-manipulation select-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
              '-webkit-tap-highlight-color: transparent',
              isActive
                ? 'bg-secondary hover:bg-secondary/80 text-foreground'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25'
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive ? (
              <Pause size={36} className="sm:w-8 sm:h-8 pointer-events-none" fill="currentColor" />
            ) : (
              <Play size={36} className="sm:w-8 sm:h-8 ml-1 pointer-events-none" fill="currentColor" />
            )}
          </button>

          <div className="w-14 h-14 sm:w-12 sm:h-12" />
        </div>

        {/* Ambient Sound Controls */}
        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center justify-center gap-3">
            {[
              { mode: 'none' as SoundMode, icon: VolumeX, label: 'Off' },
              { mode: 'rain' as SoundMode, icon: CloudRain, label: 'Rain' },
              { mode: 'forest' as SoundMode, icon: Trees, label: 'Forest' },
              { mode: 'coffee' as SoundMode, icon: Coffee, label: 'Café' },
            ].map(({ mode: soundMode, icon: Icon, label }) => (
              <button
                key={soundMode}
                onClick={() => setSound(soundMode)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl transition-all active:scale-95',
                  sound === soundMode
                    ? 'bg-accent/20 text-accent'
                    : 'text-muted-foreground hover:bg-white/5'
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          {sound !== 'none' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-4"
            >
              <VolumeX size={16} className="text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform 
                  [&::-webkit-slider-thumb]:active:scale-125"
              />
              <Volume2 size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Session History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-md max-h-[70vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Session History</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowHistory(false)}
                >
                  ✕
                </Button>
              </div>
              
              {sessionHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No sessions yet. Start your first focus session!
                </p>
              ) : (
                <div className="space-y-2">
                  {sessionHistory.slice(0, 10).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{TIMER_PRESETS[session.mode].label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(session.duration)}
                          {session.interrupted && ' (interrupted)'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
