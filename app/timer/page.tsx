import type { Metadata } from 'next';
import { TimerClient } from './timer-client';

export const metadata: Metadata = {
  title: 'Focus Timer',
  description: 'Customizable Pomodoro timer for deep work sessions.',
};

export default function TimerPage(): JSX.Element {
  return <TimerClient />;
}
