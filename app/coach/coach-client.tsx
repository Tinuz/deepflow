'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, Send } from 'lucide-react';

export function CoachClient(): JSX.Element {
  return (
    <div className="flex-1 flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          AI Coach <Sparkles className="text-accent" />
        </h1>
        <p className="text-muted-foreground">Personalized focus insights</p>
      </header>

      {/* Daily Tip Card */}
      <Card className="border-accent/30 bg-accent/5 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-accent to-purple-500" />
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-accent/10 rounded-xl text-accent shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Today&apos;s Focus Tip</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                &quot;You tend to break focus around 2pm. Try scheduling a 15-minute walk before your afternoon session to
                reset your dopamine levels.&quot;
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">
              Read more
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface Placeholder */}
      <div className="flex-1 bg-card border border-border rounded-2xl p-4 flex flex-col min-h-[300px]">
        <div className="flex-1 space-y-4">
          {/* Mock Messages */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              AI
            </div>
            <div className="p-3 rounded-2xl rounded-tl-none bg-secondary text-sm max-w-[80%]">
              How was your last session? I noticed you paused twice.
            </div>
          </div>
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
              Me
            </div>
            <div className="p-3 rounded-2xl rounded-tr-none bg-primary text-primary-foreground text-sm max-w-[80%]">
              Yeah, I got distracted by emails. Any advice?
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex gap-2">
          <input
            type="text"
            placeholder="Ask your coach..."
            className="flex-1 bg-secondary/50 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button size="icon" className="rounded-xl">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
