import type { Metadata } from 'next';
import React from 'react';
import '../index.css';

export const metadata: Metadata = {
  title: 'Hacky Pizza Town - Mahmudabad Store',
  description: 'Instant wood-fired pizzas, stuffed garlic breads, and beverages in Mahmudabad.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
