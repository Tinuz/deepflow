import type { Metadata } from 'next';
import { TeamClient } from './team-client';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Leaderboard and team focus status.',
};

export default function TeamPage(): JSX.Element {
  return <TeamClient />;
}
