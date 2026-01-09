'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Timer, LayoutDashboard, BrainCircuit, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItem {
  icon: typeof Timer;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Timer, label: 'Timer', path: '/timer' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BrainCircuit, label: 'Coach', path: '/coach' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Navigation(): JSX.Element | null {
  const pathname = usePathname();
  
  // Hide nav on landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <div className="sticky bottom-0 z-50 w-full max-w-md mx-auto">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none h-24 bottom-0" />
      <nav className="relative bg-background/80 backdrop-blur-xl border-t border-border px-6 pb-6 pt-3 flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-300 relative',
                isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-xl transition-all duration-300',
                  isActive ? 'bg-primary/10' : 'bg-transparent'
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
