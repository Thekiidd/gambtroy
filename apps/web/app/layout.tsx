import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'GambTroy',
  description: 'Gambling Destroy · Plataforma para romper la adicción al juego'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
