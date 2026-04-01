'use client';
import { useEffect, useState } from 'react';
import { Users, Link as LinkIcon, ShieldCheck, Copy, CheckCircle2, RefreshCw, AlertTriangle, Trash2, UserX, Shield } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuardianPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/guardian/status');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiClient.post('/guardian/invite', {});
      await fetchStatus();
      showToast('Enlace generado. Cópialo y envíalo por WhatsApp.');
    } catch (e: any) {
      showToast(e.data?.message || 'Error generando invitación', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async () => {
    const ok = window.confirm('¿Seguro que quieres revocar el acceso de tu guardián? Tendrás que generar un nuevo enlace.');
    if (!ok) return;
    setRevoking(true);
    try {
      // We'll call a revoke endpoint — if it doesn't exist yet we delete client-side
      await apiClient.delete('/guardian/revoke');
      await fetchStatus();
      showToast('Guardián removido correctamente.');
    } catch (e: any) {
      showToast(e.data?.message || 'Error al revocar', 'error');
    } finally {
      setRevoking(false);
    }
  };

  const getLink = () => {
    if (!data?.inviteToken) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://thekiidd.github.io/gambtroy';
    return `${origin}/es/invite?token=${data.inviteToken}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--teal)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
              background: toast.type === 'success' ? 'rgba(20,200,100,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(20,200,100,0.4)' : 'rgba(239,68,68,0.4)'}`,
              borderRadius: '14px', padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              backdropFilter: 'blur(12px)', maxWidth: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} color="#4ade80" /> : <AlertTriangle size={20} color="var(--red)" />}
            <div style={{ fontSize: '0.9rem' }}>{toast.msg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users color="var(--teal)" size={32} /> Tu Guardián
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Tu guardián puede ver tus pérdidas, tu racha y tiene que aprobar cuando quieras desbloquear un sitio. La recuperación no se hace en soledad.
        </p>
      </header>

      {/* ── ESTADO: ACTIVO ── */}
      {data?.status === 'ACTIVE' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Active card */}
          <section style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={36} color="var(--teal)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Protección Activa</h2>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(20,184,166,0.15)', color: 'var(--teal)', padding: '0.2rem 0.75rem', borderRadius: '99px', fontWeight: 700 }}>
                    ✓ Vinculado
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  Tu cuenta está siendo supervisada en tiempo real.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                    {data.guardian?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{data.guardian?.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{data.guardian?.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What guardian can do */}
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Qué puede hacer tu guardián
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { icon: '👁️', label: 'Ver tus pérdidas registradas' },
                { icon: '🔥', label: 'Ver tu racha de días limpio' },
                { icon: '🌐', label: 'Ver tus sitios bloqueados' },
                { icon: '🔒', label: 'Aprobar o denegar desbloqueos' },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: 'var(--bg-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Revoke */}
          <section style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '18px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--red)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserX size={18} /> Zona peligrosa
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Si revocas el acceso, los sitios marcados con "Requiere guardián" no se podrán desbloquear hasta que vuelvas a vincular uno.
            </p>
            <button
              onClick={handleRevoke}
              disabled={revoking}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', color: 'var(--red)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <Trash2 size={16} /> {revoking ? 'Revocando...' : 'Revocar acceso del guardián'}
            </button>
          </section>
        </motion.div>
      )}

      {/* ── ESTADO: PENDIENTE ── */}
      {data?.status === 'PENDING' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <section style={{ background: 'var(--surface)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Invitación Pendiente</h2>
              <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', padding: '0.2rem 0.75rem', borderRadius: '99px', fontWeight: 700 }}>
                ⏳ Esperando
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Copia el enlace secreto y envíaselo por WhatsApp. La persona que lo abra se vinculará como tu guardián con un click.
            </p>

            {/* Link box */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--purple-light)', wordBreak: 'break-all' }}>
              {getLink()}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={handleCopy} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />} {copied ? '¡Copiado!' : 'Copiar enlace'}
              </button>
              <button
                onClick={fetchStatus}
                style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RefreshCw size={16} /> Actualizar estado
              </button>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(245,158,11,0.06)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--amber)', margin: 0 }}>
                <strong>📱 Ayuda para tu guardián:</strong> Cuando abra el enlace verá quién lo invita y con qué permisos. Solo necesita crear una cuenta gratuita de GambTroy para aceptar — sin costo.
              </p>
            </div>
          </section>
        </motion.div>
      )}

      {/* ── ESTADO: NINGUNO ── */}
      {(!data || data?.status === 'NONE' || data?.status === 'REVOKED') && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', width: '88px', height: '88px', background: 'rgba(139,92,246,0.1)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <LinkIcon size={44} color="var(--purple)" />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem' }}>Sin guardián activo</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 0.75rem', lineHeight: 1.7 }}>
              Elige a un familiar o amigo de confianza. Genera un enlace mágico y envíaselo. Al abrirlo, queda vinculado como tu guardián.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
              Tu guardián solo necesita crear una cuenta gratuita en GambTroy. No requiere que instalen nada más.
            </p>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary"
              style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <ShieldCheck size={22} /> {generating ? 'Generando enlace...' : 'Crear Enlace de Guardián'}
            </button>

            {/* Perks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '2.5rem', textAlign: 'left' }}>
              {[
                { icon: '🔒', title: 'Aprobación de desbloqueos', desc: 'Nadie puede quitar sitios de tu lista sin su permiso.' },
                { icon: '📊', title: 'Transparencia total', desc: 'Tu guardián puede ver tu racha y pérdidas en tiempo real.' },
                { icon: '🆓', title: 'Gratis para él', desc: 'Tu guardián no paga nada. Solo crea cuenta y acepta.' },
              ].map(p => (
                <div key={p.title} style={{ padding: '1.1rem', background: 'var(--bg-2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{p.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{p.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
}
