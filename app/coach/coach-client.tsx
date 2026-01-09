'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, Send, Loader2, RotateCcw } from 'lucide-react';
import { calculateStats, getSessions, formatDuration, getModeLabel } from '@/lib/session-storage';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function CoachClient(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load daily tip on mount
    loadDailyTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUserContext = () => {
    const stats = calculateStats();
    const sessions = getSessions();
    
    // Time of day
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'ochtend' : hour < 18 ? 'middag' : 'avond';
    
    // Last session
    let lastSession = 'Nog geen sessies vandaag';
    if (sessions.length > 0) {
      const session = sessions[0];
      if (session && !session.interrupted) {
        lastSession = `${formatDuration(session.duration)} ${getModeLabel(session.mode)} (${timeOfDay})`;
      }
    }
    
    // Recent history
    const recentSessions = sessions.slice(0, 5).filter(s => !s.interrupted);
    const recentHistory = recentSessions.length > 0
      ? recentSessions.map((s, i) => {
          const daysAgo = i === 0 ? 'vandaag' : i === 1 ? 'gisteren' : `${i} dagen geleden`;
          return `${daysAgo} ${formatDuration(s.duration)} ${getModeLabel(s.mode)}`;
        }).join(', ')
      : 'Nog geen recente sessies';
    
    // Week stats
    const weekStats = `${formatDuration(stats.totalFocusTime)} deze week, ${stats.sessionsToday} sessies vandaag`;
    
    return {
      lastSession,
      streak: stats.currentStreak > 0 ? `${stats.currentStreak} dagen op rij` : 'Geen streak',
      recentHistory,
      weekStats,
    };
  };

  const loadDailyTip = async () => {
    setLoadingTip(true);
    try {
      const context = getUserContext();
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Geef me een dagelijkse focus tip gebaseerd op mijn recente sessies.',
          userContext: context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDailyTip(data.message);
      }
    } catch (error) {
      console.error('Failed to load daily tip:', error);
      setDailyTip('Probeer vandaag een langere sessie dan gisteren. Elk stapje vooruit telt! 🚀');
    } finally {
      setLoadingTip(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = getUserContext();
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          userContext: context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, er ging iets mis. Probeer het opnieuw.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            AI Coach <Sparkles className="text-accent" />
          </h1>
          <p className="text-muted-foreground">Jouw persoonlijke focus mentor</p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>
        )}
      </header>

      {/* Daily Tip Card */}
      <Card className="border-accent/30 bg-accent/5 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-accent to-purple-500" />
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-accent/10 rounded-xl text-accent shrink-0">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Dagelijkse Focus Tip</h3>
              {loadingTip ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Tip wordt gegenereerd...</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {dailyTip || 'Start een sessie om gepersonaliseerde tips te krijgen!'}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="text-accent hover:text-accent hover:bg-accent/10"
              onClick={loadDailyTip}
              disabled={loadingTip}
            >
              {loadingTip ? 'Laden...' : 'Nieuwe tip'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col min-h-[400px]">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
              <Sparkles size={48} className="text-accent/50" />
              <div>
                <p className="font-medium mb-2">Stel je coach een vraag!</p>
                <p className="text-sm">Bijvoorbeeld:</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p>&quot;Hoe kan ik langer focussen?&quot;</p>
                  <p>&quot;Tips voor avondsessies?&quot;</p>
                  <p>&quot;Hoe verbeter ik mijn streak?&quot;</p>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {msg.role === 'assistant' ? 'AI' : 'Jij'}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                      msg.role === 'assistant'
                        ? 'rounded-tl-none bg-secondary'
                        : 'rounded-tr-none bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {msg.timestamp.toLocaleTimeString('nl-NL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                AI
              </div>
              <div className="p-3 rounded-2xl rounded-tl-none bg-secondary flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Coach denkt na...</span>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Stel een vraag aan je coach..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 bg-secondary/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <Button
            size="icon"
            className="rounded-xl"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setInput('Hoe kan ik mijn focus verbeteren?');
            inputRef.current?.focus();
          }}
          className="text-xs"
        >
          Focus tips
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setInput('Analyseer mijn recente sessies');
            inputRef.current?.focus();
          }}
          className="text-xs"
        >
          Analyseer sessies
        </Button>
      </div>
    </div>
  );
}
