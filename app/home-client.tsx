'use client';

import { ArrowRight, BrainCircuit, Zap, Users, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export function HomeClient(): JSX.Element {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 overflow-y-auto no-scrollbar">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-start min-h-[60vh] space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium"
        >
          <Zap size={12} className="fill-current" />
          <span>v2.0 with AI Coach</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold tracking-tight leading-[1.1]"
        >
          Enter the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">
            Flow State
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground leading-relaxed max-w-xs"
        >
          Minimalist focus timer with AI coaching to help you achieve deep work sessions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col w-full gap-3 pt-4"
        >
          <Link href="/timer" className="w-full">
            <Button size="lg" className="w-full h-14 text-lg font-medium shadow-xl shadow-primary/25 rounded-2xl group">
              Start Focus Session
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <div className="text-center text-xs text-muted-foreground">
            No sign-up required • Instant start
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-4 mt-8"
      >
        <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary">
            <Shield size={20} />
          </div>
          <h3 className="font-semibold mb-1">Privacy First</h3>
          <p className="text-xs text-muted-foreground">Local-first data. No account needed.</p>
        </motion.div>

        <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 text-accent">
            <BrainCircuit size={20} />
          </div>
          <h3 className="font-semibold mb-1">AI Coach</h3>
          <p className="text-xs text-muted-foreground">Personalized tips to improve focus.</p>
        </motion.div>

        <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 text-orange-500">
            <TrendingUp size={20} />
          </div>
          <h3 className="font-semibold mb-1">Streaks</h3>
          <p className="text-xs text-muted-foreground">Build habits with daily goals.</p>
        </motion.div>

        <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 text-blue-500">
            <Users size={20} />
          </div>
          <h3 className="font-semibold mb-1">Teams</h3>
          <p className="text-xs text-muted-foreground">Compete on the leaderboard.</p>
        </motion.div>
      </motion.div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/settings" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
