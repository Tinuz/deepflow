import type { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your focus stats and productivity insights.',
};

export default function DashboardPage(): JSX.Element {
  return <DashboardClient />;
}
