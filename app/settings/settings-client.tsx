'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Moon, Sun, Monitor, Bell, Lock, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light' | 'system';

export function SettingsClient(): JSX.Element {
  const [theme, setTheme] = useState<Theme>('dark');

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Preferences & Account</p>
      </header>

      {/* Account Pro Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-xl shadow-primary/20">
        <h3 className="text-xl font-bold mb-1">Upgrade to Pro</h3>
        <p className="text-primary-foreground/80 text-sm mb-4">Unlock advanced AI insights and unlimited teams.</p>
        <Button size="sm" variant="secondary" className="w-full text-primary font-bold">
          View Plans
        </Button>
      </div>

      {/* Theme */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Appearance</h3>
        <Card>
          <CardContent className="p-2">
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                    theme === t ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50'
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

      {/* General Settings */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">General</h3>
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {[
              { icon: Bell, label: 'Notifications', value: 'On' },
              { icon: Lock, label: 'Privacy', value: '' },
              { icon: Monitor, label: 'Integrations', value: '2 Active' },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">{item.value}</span>
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
        <LogOut size={18} className="mr-2" />
        Log Out
      </Button>

      <div className="text-center text-xs text-muted-foreground pt-4">Version 2.0.1 • Build 2405</div>
    </div>
  );
}
