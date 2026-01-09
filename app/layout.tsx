import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'DeepFlow - Focus Timer & AI Coach',
    template: '%s | DeepFlow',
  },
  description: 'Minimalist, mobile-first focus timer with AI coaching and gamification. Boost your productivity with Pomodoro technique.',
  keywords: ['focus timer', 'pomodoro', 'productivity', 'AI coach', 'deep work'],
  authors: [{ name: 'DeepFlow Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DeepFlow',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    title: 'DeepFlow - Focus Timer & AI Coach',
    description: 'Minimalist focus timer met AI coaching',
    siteName: 'DeepFlow',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  // iOS PWA settings for fullscreen experience
  userScalable: true,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative overflow-hidden flex flex-col">
          {/* Ambient Background Effects */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[100px]" />
          </div>

          <main className="flex-1 relative z-10 w-full max-w-md mx-auto h-full flex flex-col pb-24">
            {children}
          </main>

          <Navigation />
        </div>
      </body>
    </html>
  );
}
