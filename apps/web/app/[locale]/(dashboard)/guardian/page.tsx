'use client';
import { useEffect, useState } from 'react';
import { Users, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function GuardianPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/guardian/status')
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando estado del guardián...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users color="var(--teal)" /> Tu Guardián
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>La recuperación no se hace en soledad. Un guardián puede ver tus alertas de recaída, controlar tus sitios bloqueados y darte apoyo emocional.</p>
      </header>

      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', width: '80px', height: '80px', background: 'rgba(20,184,166,0.1)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AlertTriangle size={40} color="var(--teal)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Función en Construcción</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          {data?.message || 'Actualmente, el sistema de invitación y sincronización de cuentas de guardianes está en desarrollo para la próxima versión (Fase 3).'}
        </p>

        <button disabled className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed', padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
          <LinkIcon size={20} /> Generar código de invitación secreta
        </button>
      </section>
    </div>
  );
}
