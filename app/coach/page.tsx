import type { Metadata } from 'next';
import { CoachClient } from './coach-client';

export const metadata: Metadata = {
  title: 'AI Coach',
  description: 'Personalized focus insights from your AI coach.',
};

export default function CoachPage(): JSX.Element {
  return <CoachClient />;
}
