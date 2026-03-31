import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--purple-light)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Volver al inicio
      </Link>
      
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Aviso legal y Condiciones</h1>
      
      <section style={{ marginBottom: '2.5rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <h2 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Aviso de salud mental</h2>
        <p style={{ marginBottom: '1rem' }}>
          GambTroy es una herramienta de apoyo tecnológico para la gestión y mitigación de la ludopatía o adicción al juego. <strong>No sustituye</strong> el tratamiento médico, psicológico ni psiquiátrico profesional.
        </p>
        <p>
          Si tú o un ser querido se encuentran en peligro inminente o experimentan crisis graves, por favor contacten inmediatamente a las líneas de prevención del suicidio y salud mental locales.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <h2 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Términos y condiciones</h2>
        <p style={{ marginBottom: '1rem' }}>
          El uso de GambTroy implica la aceptación de recopilación de datos de registro de pérdidas y sitios bloqueados, los cuales son estrictamente confidenciales y compartidos únicamente con los "guardianes" que el usuario asigne explícitamente.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <h2 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Privacidad</h2>
        <p>
          Las conversaciones generadas a través del modelo de apoyo (Chat IA) se procesan sin guardar datos personales de identificación (PII) en texto claro. Nunca venderemos tus datos a terceros ni a plataformas de apuestas.
        </p>
      </section>
    </div>
  );
}
