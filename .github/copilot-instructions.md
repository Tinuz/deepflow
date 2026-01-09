# DeepFlow - GitHub Copilot Instructions

## Project Overview
DeepFlow is een minimalistische, mobile-first focus timer applicatie met AI coaching en gamification. De app wordt gebouwd met Next.js, TypeScript, en TailwindCSS, en wordt gedeployed via Vercel.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 3.4+
- **UI Components**: React 18+, Framer Motion, Lucide React
- **Deployment**: Vercel
- **State Management**: React hooks, Server Components waar mogelijk
- **Routing**: Next.js App Router

## Core Development Principles

### 1. TypeScript Strict Mode
- **ALTIJD** type checking voldoen - geen `any` types tenzij absoluut noodzakelijk
- Gebruik expliciete return types voor alle functies en componenten
- Definieer interfaces/types voor alle props, state, en API responses
- Gebruik `strict: true` in tsconfig.json
- Gebruik generics waar passend voor herbruikbare componenten
- Zorg dat `tsc --noEmit` zonder errors passeert

```typescript
// ✅ GOED
interface TimerProps {
  duration: number;
  onComplete: () => void;
  isActive: boolean;
}

export function Timer({ duration, onComplete, isActive }: TimerProps): JSX.Element {
  // implementation
}

// ❌ FOUT
export function Timer(props: any) {
  // implementation
}
```

### 2. Linting & Code Quality
- Zero lint errors bij build - fix alle warnings
- Gebruik ESLint met Next.js recommended config
- Run `npm run lint` en `npm run build` voordat code als compleet beschouwd wordt
- Gebruik Prettier voor consistente formatting
- Geen unused imports, variables, of parameters
- Gebruik `use client` directive alleen waar noodzakelijk

### 3. Security Best Practices

#### Input Validation & Sanitization
- **ALTIJD** user input valideren en sanitizen
- Gebruik zod of yup voor runtime validation
- Never trust client-side data - valideer ook server-side
- Escape HTML content om XSS te voorkomen

```typescript
// ✅ GOED - Server Action met validatie
'use server';

import { z } from 'zod';

const TimerSchema = z.object({
  duration: z.number().min(1).max(7200),
  type: z.enum(['pomodoro', 'short-break', 'long-break'])
});

export async function saveTimer(formData: FormData) {
  const rawData = {
    duration: Number(formData.get('duration')),
    type: formData.get('type')
  };
  
  const validated = TimerSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: 'Invalid input' };
  }
  
  // Process validated data
}
```

#### Authentication & Authorization
- Gebruik Next.js middleware voor route protection
- Implement proper session management
- Never expose sensitive data in client components
- Gebruik environment variables voor secrets (nooit hardcoded)
- Gebruik `NEXT_PUBLIC_` prefix alleen voor echt publieke data

#### API Security
- Rate limiting op API routes
- CSRF protection voor mutations
- Proper CORS configuration
- Gebruik POST voor mutaties, niet GET
- Implement proper error handling zonder sensitive info te lekken

```typescript
// ✅ GOED - API Route met rate limiting
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // Handle request
}
```

#### Common Webapp Exploits Prevention
- **XSS**: Sanitize all user input, use React's built-in escaping
- **SQL Injection**: Use parameterized queries/ORM (indien database gebruikt)
- **CSRF**: Use Next.js built-in CSRF protection, check origin headers
- **Clickjacking**: Set proper CSP headers via next.config.js
- **Open Redirects**: Validate redirect URLs tegen whitelist
- **Path Traversal**: Never use user input direct in file paths
- **Server-Side Request Forgery**: Valideer en whitelist externe URLs

### 4. Next.js Best Practices

#### App Router Patterns
- Gebruik Server Components als default
- Client Components (`'use client'`) alleen voor interactivity
- Leverage Server Actions voor mutations
- Gebruik `loading.tsx` en `error.tsx` voor UX
- Implement proper metadata voor SEO

```typescript
// app/timer/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Focus Timer | DeepFlow',
  description: 'Customizable Pomodoro timer for deep work',
};

export default function TimerPage() {
  return <TimerClient />;
}
```

#### Performance
- Use `next/image` voor alle images
- Implement lazy loading voor heavy components
- Use dynamic imports voor code splitting
- Optimize bundle size - check `npm run build` output
- Gebruik React.memo() strategisch voor expensive re-renders
- Implement proper caching strategies

#### File Structure
```
app/
├── (auth)/          # Route groups voor auth pages
├── (dashboard)/     # Protected routes
├── api/             # API routes
├── layout.tsx
└── page.tsx
components/
├── ui/              # Reusable UI components
├── features/        # Feature-specific components
└── layouts/         # Layout components
lib/
├── utils.ts         # Utility functions
├── hooks/           # Custom React hooks
└── validations/     # Zod schemas
public/              # Static assets
```

### 5. Vercel Deployment

#### Configuration
- Gebruik `vercel.json` voor custom configuration indien nodig
- Set environment variables via Vercel dashboard
- Gebruik Edge Functions voor latency-critical routes
- Implement proper error tracking (Vercel Analytics/Sentry)

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```

#### Build Optimization
- Zorg dat `npm run build` succesvol passeert
- Check build output voor warnings
- Minimize client-side JavaScript
- Use ISR/SSG waar mogelijk voor betere performance

### 6. TailwindCSS Guidelines
- Gebruik design tokens (colors, spacing) uit tailwind.config
- Gebruik `cn()` utility (clsx + tailwind-merge) voor conditional classes
- Mobile-first approach - start met mobile styles
- Gebruik Tailwind's built-in dark mode (`dark:` prefix)
- Avoid inline styles - gebruik Tailwind utilities

```typescript
import { cn } from '@/lib/utils';

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg px-4 py-2 font-medium transition-colors',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        className
      )}
      {...props}
    />
  );
}
```

### 7. Error Handling
- Implement proper error boundaries
- Gebruik `error.tsx` voor route-level errors
- Log errors server-side, show user-friendly messages client-side
- Never expose stack traces in production
- Implement fallback UI voor failed states

### 8. Accessibility
- Gebruik semantic HTML
- Proper ARIA labels waar nodig
- Keyboard navigation support
- Color contrast compliance (WCAG AA minimum)
- Screen reader compatibility

## Testing Strategy
- Write tests voor critical business logic
- Test security validations
- Test API routes met verschillende inputs
- Lighthouse scores: Performance > 90, Accessibility > 95

## Pre-commit Checklist
- [ ] `npm run lint` passes zonder errors
- [ ] `npm run build` succesvol
- [ ] `tsc --noEmit` zonder type errors
- [ ] Geen hardcoded secrets of API keys
- [ ] Input validation geïmplementeerd
- [ ] Security headers configured
- [ ] Proper error handling
- [ ] Mobile responsive getest

## Prohibited Patterns
- ❌ `any` types zonder goede reden
- ❌ Disabled ESLint rules zonder commentaar
- ❌ Hardcoded credentials/secrets
- ❌ Unvalidated user input
- ❌ Direct DOM manipulation (gebruik React)
- ❌ `dangerouslySetInnerHTML` zonder sanitization
- ❌ Synchronous localStorage access in Server Components
- ❌ Large client bundles zonder code splitting

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Onthoud**: Security, type safety, en code quality zijn niet optioneel. Elke line code moet voldoen aan deze standards voordat het als compleet beschouwd wordt.
