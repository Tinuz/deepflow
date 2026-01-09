# DeepFlow App

A minimalist, mobile-first focus timer with AI coaching and gamification built with Next.js.

## Features

- **Timer**: Customizable focus timer (Pomodoro, Short/Long breaks) with ambient sounds.
- **Dashboard**: Track your flow state with heatmaps and stats.
- **AI Coach**: Personalized insights to improve your deep work.
- **Team**: Compete with friends and see who's focusing now.
- **Settings**: Dark mode, integrations, and profile management.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 3.4+
- **UI Components**: React 18+, Framer Motion, Lucide React
- **Deployment**: Vercel

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout with metadata
├── page.tsx           # Home page
├── timer/             # Timer route
├── dashboard/         # Dashboard route
├── coach/             # AI Coach route
├── team/              # Team route
└── settings/          # Settings route

src/
├── components/        # Reusable components
│   ├── ui/           # UI components (Button, Card)
│   └── navigation.tsx # Navigation component
└── lib/
    └── utils.ts      # Utility functions

public/               # Static assets
```

## Security & Best Practices

This project follows strict security guidelines:
- ✅ TypeScript strict mode enabled
- ✅ Zero lint errors policy
- ✅ Input validation with Zod
- ✅ Security headers configured
- ✅ XSS/CSRF protection
- ✅ Safe deployment practices for Vercel

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for complete development guidelines.

## Deployment

The easiest way to deploy this app is via [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/deepflow)

## License

MIT
