'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert, TrendingDown, Clock, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../../../lib/api-client';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/auth/me').then(res => setUser(res.user));
  }, []);

  if (!user) return <div>Cargando resumen...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hola, {user.name.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-muted)' }}>Bienvenido de vuelta. Aquí está tu resumen de progreso.</p>
      </header>

      {/* MVP Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--purple-light)', fontWeight: 600 }}>
            <Clock size={20} />
            Días limpio
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>
            {user.profile?.currentStreak || 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Días</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tu racha comienza hoy. ¡Mantente fuerte!</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--red)', fontWeight: 600 }}>
            <ShieldAlert size={20} />
            Sitios Restringidos
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>
            {user._count?.blocklist || 0}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configurado para bloquear en tus dispositivos.</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--amber)', fontWeight: 600 }}>
            <TrendingDown size={20} />
            Total Perdido
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>
            ${user.profile?.totalLost || 0}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pérdidas acumuladas registradas.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Acciones rápidas</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/es/dashboard/blocklist" style={{ flex: 1, textDecoration: 'none', minWidth: '200px', padding: '1rem', borderRadius: '12px', background: 'var(--grad)', color: '#fff', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Plus size={18} /> Gestionar bloqueos
          </Link>
          <Link href="/es/dashboard/losses" style={{ flex: 1, textDecoration: 'none', minWidth: '200px', padding: '1rem', borderRadius: '12px', background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <TrendingDown size={18} /> Ver pérdidas
          </Link>
          <Link href="/es/dashboard/guardian" style={{ flex: 1, textDecoration: 'none', minWidth: '200px', padding: '1rem', borderRadius: '12px', background: 'rgba(20,184,166,0.1)', color: 'var(--teal)', border: '1px solid rgba(20,184,166,0.2)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Users size={18} /> Invitar Guardián
          </Link>
        </div>
      </section>
    </div>
  );
}
