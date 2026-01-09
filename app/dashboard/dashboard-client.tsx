'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Flame, Trophy, Calendar, Clock, ArrowUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardClient(): JSX.Element {
  return (
    <div className="flex-1 flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar space-y-6">
      <header className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your focus stats today</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
          <Flame size={16} fill="currentColor" />
          <span className="font-bold">12 Day Streak</span>
        </div>
      </header>

      {/* Focus Time Card */}
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-indigo-200">Total Focus Time</p>
              <h2 className="text-4xl font-bold mt-1">4h 25m</h2>
            </div>
            <div className="p-3 bg-primary/20 rounded-xl">
              <Clock className="text-primary" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <ArrowUp size={16} />
            <span className="font-medium">+15% from yesterday</span>
          </div>
        </CardContent>
      </Card>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mb-1">
              <Zap size={20} />
            </div>
            <div className="text-2xl font-bold">8</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 mb-1">
              <Trophy size={20} />
            </div>
            <div className="text-2xl font-bold">142</div>
            <div className="text-xs text-muted-foreground">Focus Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calendar size={18} className="text-muted-foreground" />
          Focus History
        </h3>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`aspect-square rounded-sm ${
                    Math.random() > 0.7 ? 'bg-primary' : Math.random() > 0.4 ? 'bg-primary/40' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Badges */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Recent Badges</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-24 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Trophy size={24} className="text-white" />
              </div>
              <span className="text-xs text-center font-medium text-muted-foreground">Early Bird</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
