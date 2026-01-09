'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, VolumeX, Maximize2, Settings, CloudRain, Trees, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type TimerMode = 'pomodoro' | 'short' | 'long';
type SoundMode = 'none' | 'rain' | 'forest';

export function TimerClient(): JSX.Element {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [duration, setDuration] = useState<number>(25 * 60);
  const [sound, setSound] = useState<SoundMode>('none');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Handle completion (confetti, etc.)
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const switchMode = (newMode: TimerMode): void => {
    setMode(newMode);
    setIsActive(false);
    let newTime: number;
    switch (newMode) {
      case 'pomodoro':
        newTime = 25 * 60;
        break;
      case 'short':
        newTime = 5 * 60;
        break;
      case 'long':
        newTime = 15 * 60;
        break;
    }
    setDuration(newTime);
    setTimeLeft(newTime);
  };

  const toggleTimer = (): void => setIsActive(!isActive);
  const resetTimer = (): void => {
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
    <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/5"
            onClick={() => setSound((prev) => (prev === 'rain' ? 'none' : 'rain'))}
          >
            {sound === 'none' ? <VolumeX size={20} /> : <Volume2 size={20} className="text-accent" />}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
            <Maximize2 size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
            <Settings size={20} />
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

        {/* Progress Circle */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-12">
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
              className={cn(
                'text-7xl font-bold tracking-tighter tabular-nums text-foreground',
                isActive && 'animate-pulse-subtle'
              )}
            >
              {formatTime(timeLeft)}
            </motion.div>
            <p className="text-muted-foreground mt-2 font-medium tracking-wide uppercase text-xs">
              {isActive ? 'Focusing...' : 'Ready to Flow'}
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-secondary/50 rounded-full mb-12 backdrop-blur-sm border border-white/5">
          {(['pomodoro', 'short', 'long'] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-medium transition-all duration-300',
                mode === m
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m === 'pomodoro' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break'}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetTimer}
            className="w-12 h-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <RotateCcw size={22} />
          </Button>

          <Button
            size="lg"
            onClick={toggleTimer}
            className={cn(
              'w-20 h-20 rounded-3xl transition-all duration-300 shadow-xl',
              isActive
                ? 'bg-secondary hover:bg-secondary/80 text-foreground'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25'
            )}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </Button>

          <div className="w-12 h-12 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-12 h-12 rounded-full transition-colors',
                sound !== 'none' ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:bg-white/5'
              )}
              onClick={() =>
                setSound((prev) => {
                  if (prev === 'none') return 'rain';
                  if (prev === 'rain') return 'forest';
                  return 'none';
                })
              }
            >
              {sound === 'none' && <VolumeX size={22} />}
              {sound === 'rain' && <CloudRain size={22} />}
              {sound === 'forest' && <Trees size={22} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
