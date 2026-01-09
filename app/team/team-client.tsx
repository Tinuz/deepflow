'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';

interface TeamUser {
  name: string;
  time: string;
  status: 'focus' | 'break' | 'offline';
  avatar: string;
  isMe?: boolean;
}

export function TeamClient(): JSX.Element {
  const users: TeamUser[] = [
    { name: 'Sarah Chen', time: '5h 12m', status: 'focus' as const, avatar: 'SC' },
    { name: 'Mike Ross', time: '4h 45m', status: 'break' as const, avatar: 'MR' },
    { name: 'Jessica P.', time: '3h 30m', status: 'offline' as const, avatar: 'JP' },
    { name: 'You', time: '4h 25m', status: 'focus' as const, avatar: 'ME', isMe: true },
  ].sort((a, b) => parseInt(b.time) - parseInt(a.time));

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">Leaderboard & Status</p>
        </div>
        <Button size="icon" variant="outline" className="rounded-full">
          <UserPlus size={20} />
        </Button>
      </header>

      {/* Active Now */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-3 text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Focusing Now
          </div>
          <div className="flex -space-x-3">
            {users
              .filter((u) => u.status === 'focus')
              .map((u, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold"
                  title={u.name}
                >
                  {u.avatar}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <div className="space-y-4">
        {users.map((user, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-2xl border transition-all ${
              user.isMe ? 'bg-primary/10 border-primary/50' : 'bg-card border-border hover:border-border/80'
            }`}
          >
            <div className="w-6 text-center font-bold text-muted-foreground mr-4">{index + 1}</div>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                {user.avatar}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                  user.status === 'focus' ? 'bg-emerald-500' : user.status === 'break' ? 'bg-orange-500' : 'bg-slate-500'
                }`}
              />
            </div>
            <div className="flex-1 ml-4">
              <h3 className="font-semibold text-sm">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.status === 'focus' ? 'Focusing' : user.status}</p>
            </div>
            <div className="text-right">
              <div className="font-bold">{user.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
