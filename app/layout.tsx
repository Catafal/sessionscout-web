import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SessionScout — Know exactly what you did.',
  description:
    'A native macOS app that frames your work sessions and tracks every app you touch — automatically. Built for developers, designers, and solo builders.',
  openGraph: {
    title: 'SessionScout — Know exactly what you did.',
    description:
      'Frame your session, hit start, review your full activity trail. Free and open source for macOS 14+.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
