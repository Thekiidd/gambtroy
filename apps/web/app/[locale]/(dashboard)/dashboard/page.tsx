'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert, TrendingDown, Clock, Plus, Users, Zap, Target, CheckCircle2, XCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../../../lib/api-client';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [blocklist, setBlocklist] = useState<any[]>([]);
  const [losses, setLosses] = useState<any[]>([]);
  const [guardianStatus, setGuardianStatus] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/auth/me'),
      apiClient.get('/blocklist'),
      apiClient.get('/losses'),
      apiClient.get('/guardian/status'),
    ])
      .then(([me, bl, ls, gs]) => {
        setUser(me.user);
        setBlocklist(bl.items || []);
        setLosses(ls.losses || []);
        setGuardianStatus(gs);
      })
      .catch(console.error);
  }, []);

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid var(--purple)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)' }}>Cargando tu panel...</p>
    </div>
  );

  const streak = user.profile?.currentStreak || 0;
  const totalLost = Number(user.profile?.totalLost || 0);
  const activeSites = blocklist.filter(s => s.isActive).length;
  
  // Last 7 days streak data (simulated from startDate)
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('es-MX', { weekday: 'short' }),
      clean: i < streak || streak >= 7,
    };
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Hola, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {streak > 0
            ? `Llevas ${streak} día${streak > 1 ? 's' : ''} limpio. ¡Sigue así!`
            : 'Bienvenido de vuelta. Hoy es un buen día para empezar.'}
        </p>
      </motion.header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(139,92,246,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} color="var(--purple-light)" />
            </div>
            <span style={{ fontSize: '0.75rem', background: streak > 0 ? 'rgba(20,200,100,0.1)' : 'rgba(239,68,68,0.1)', color: streak > 0 ? '#4ade80' : 'var(--red)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 700 }}>
              {streak > 0 ? '🔥 Racha activa' : 'Sin racha'}
            </span>
          </div>
          <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{streak}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>días limpio</div>
        </motion.div>

        {/* Sitios bloqueados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(239,68,68,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={22} color="var(--red)" />
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 700 }}>
              Activos
            </span>
          </div>
          <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{activeSites}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>sitios restringidos</div>
        </motion.div>

        {/* Total perdido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(245,158,11,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={22} color="var(--amber)" />
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 700 }}>
              Total
            </span>
          </div>
          <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
            ${totalLost.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>pérdidas registradas MXN</div>
        </motion.div>

        {/* Guardián */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: guardianStatus?.status === 'ACTIVE' ? 'rgba(20,184,166,0.06)' : 'var(--surface)', border: `1px solid ${guardianStatus?.status === 'ACTIVE' ? 'rgba(20,184,166,0.3)' : 'var(--border)'}`, borderRadius: '18px', padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(20,184,166,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="var(--teal)" />
            </div>
            <span style={{ fontSize: '0.75rem', background: guardianStatus?.status === 'ACTIVE' ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.05)', color: guardianStatus?.status === 'ACTIVE' ? 'var(--teal)' : 'var(--text-muted)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 700 }}>
              {guardianStatus?.status === 'ACTIVE' ? '✓ Vinculado' : guardianStatus?.status === 'PENDING' ? 'Pendiente' : 'Sin guardián'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>
            {guardianStatus?.status === 'ACTIVE' ? (guardianStatus?.guardian?.name || 'Guardián') : 'Sin protección'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {guardianStatus?.status === 'ACTIVE' ? guardianStatus?.guardian?.email : 'Invita a alguien de confianza'}
          </div>
        </motion.div>
      </div>

      {/* Streak Calendar */}
      {streak > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem', marginBottom: '2rem' }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Últimos 7 días
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            {streakDays.map((day, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: '48px',
                  borderRadius: '10px',
                  background: day.clean ? 'linear-gradient(135deg, var(--purple), var(--teal))' : 'var(--bg-2)',
                  border: day.clean ? 'none' : '1px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                }}>
                  {day.clean
                    ? <CheckCircle2 size={20} color="#fff" />
                    : <XCircle size={20} color="var(--border)" />}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{day.label}</div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Extension Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(20,184,166,0.1))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '18px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
      >
        <div style={{ width: '52px', height: '52px', background: 'var(--grad)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap size={26} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>Activa el Bloqueador Real</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            La extensión de Chrome bloquea físicamente los sitios de tu lista en este dispositivo. Sin ella, los bloqueos solo están en la base de datos.
          </p>
        </div>
        <Link
          href="/es/blocklist"
          style={{ padding: '0.75rem 1.5rem', background: 'var(--grad)', color: '#fff', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Download size={18} /> Configurar Extensión
        </Link>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}
      >
        {[
          { href: '/es/blocklist', icon: <ShieldAlert size={20} />, label: 'Gestionar Bloqueos', color: 'var(--red)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
          { href: '/es/losses', icon: <TrendingDown size={20} />, label: 'Registrar Pérdida', color: 'var(--amber)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { href: '/es/guardian', icon: <Users size={20} />, label: 'Mi Guardián', color: 'var(--teal)', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.2)' },
          { href: '/es/blocklist', icon: <Target size={20} />, label: 'Añadir Sitio', color: 'var(--purple-light)', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
        ].map(item => (
          <Link
            key={item.href + item.label}
            href={item.href}
            style={{ padding: '1.25rem', background: item.bg, border: `1px solid ${item.border}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: item.color, fontWeight: 700, textAlign: 'center', transition: 'transform 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {item.icon}
            <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
          </Link>
        ))}
      </motion.section>

    </div>
  );
}
