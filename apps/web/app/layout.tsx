import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'GambTroy — Deja de apostar. Empieza a ganar.',
  description: 'Plataforma para superar la ludopatía. Bloquea casinos, registra pérdidas, involucra a guardianes y recibe apoyo con IA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
