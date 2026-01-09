import type { Metadata } from 'next';
import { SettingsClient } from './settings-client';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Preferences and account settings.',
};

export default function SettingsPage(): JSX.Element {
  return <SettingsClient />;
}
