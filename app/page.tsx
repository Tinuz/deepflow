import type { Metadata } from 'next';
import { HomeClient } from './home-client';

export const metadata: Metadata = {
  title: 'Enter the Flow State',
  description: 'Minimalist focus timer with AI coaching to help you achieve deep work sessions.',
};

export default function HomePage(): JSX.Element {
  return <HomeClient />;
}
