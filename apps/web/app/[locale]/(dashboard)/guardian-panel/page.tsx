'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, User as UserIcon, AlertTriangle, Globe, CheckCircle2, XCircle, Clock, TrendingDown, Eye, Lock, Unlock } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuardianPanelPage() {
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWards();
    // Poll every 30 seconds
    const interval = setInterval(fetchWards, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWards = async () => {
    try {
      const res = await apiClient.get('/guardian/wards');
      setWards(res.wards || []);
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

  // Approve unblock = actually removing the block through the guardian endpoint
  const handleApproveUnblock = async (siteId: string, siteName: string) => {
    const ok = window.confirm(`¿Seguro que quieres eliminar el bloqueo de "${siteName}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    
    setApprovingId(siteId);
    try {
      await apiClient.post(`/guardian/approve-unblock/${siteId}`, {});
      showToast(`✅ Bloqueo eliminado para "${siteName}"`);
      fetchWards();
    } catch (e: any) {
      showToast(e.data?.message || 'Error al aprobar desbloqueo', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDenyUnblock = async (siteName: string) => {
    showToast(`🚫 Has recordado a tu ahijado que "${siteName}" debe seguir bloqueado.`, 'info' as any);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--teal)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)' }}>Cargando tus ahijados...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

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
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck color="var(--teal)" size={32} /> Panel de Guardián
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Supervisas a {wards.length} persona{wards.length !== 1 ? 's' : ''}. Actualización automática cada 30s.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--teal)', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '99px', padding: '0.35rem 1rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--teal)', animation: 'pulse 2s infinite' }} />
            En vivo
          </div>
        </div>
      </header>

      {wards.length === 0 ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px' }}
        >
          <ShieldCheck size={56} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>Aún no tienes ahijados</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
            Cuando alguien te envíe un enlace de invitación desde su panel y lo aceptes, aparecerán aquí sus estadísticas.
          </p>
        </motion.section>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {wards.map((link, idx) => {
            const ward = link.user;
            const streak = ward.profile?.currentStreak || 0;
            const totalLost = Number(ward.profile?.totalLost || 0);
            const blocklist = ward.blocklist || [];

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}
              >
                {/* Ward header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '52px', height: '52px', background: 'rgba(20,184,166,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0 }}>
                      {ward.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.15rem' }}>{ward.name}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{ward.email}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', background: 'rgba(20,184,166,0.1)', color: 'var(--teal)', padding: '0.3rem 0.85rem', borderRadius: '99px', fontWeight: 700, border: '1px solid rgba(20,184,166,0.2)' }}>
                    ✓ Supervisado
                  </span>
                </div>

                <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1.1rem', background: streak > 0 ? 'rgba(139,92,246,0.06)' : 'var(--bg)', borderRadius: '14px', border: `1px solid ${streak > 0 ? 'rgba(139,92,246,0.2)' : 'var(--border)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={16} color="var(--purple-light)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Días limpio</span>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: streak > 0 ? 'var(--purple-light)' : 'var(--text-muted)' }}>{streak}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {streak > 0 ? `🔥 Racha activa` : 'Sin racha'}
                      </div>
                    </div>

                    <div style={{ padding: '1.1rem', background: 'rgba(239,68,68,0.04)', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <TrendingDown size={16} color="var(--red)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase' }}>Pérdidas</span>
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--red)' }}>
                        ${totalLost.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>MXN registrados</div>
                    </div>

                    <div style={{ padding: '1.1rem', background: 'var(--bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Globe size={16} color="var(--teal)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sitios</span>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 900 }}>{blocklist.length}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>bloqueados activos</div>
                    </div>
                  </div>

                  {/* Unblock Requests (Based on sites needing guardian unblock) */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Lock size={14} /> Sitios Bajo Supervisión (Control del Guardián)
                    </h4>
                    
                    {blocklist.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', background: 'var(--bg-2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                        Tu ahijado no tiene ningún sitio bloqueado bajo tu supervisión actualmente.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {blocklist.map((site: any) => (
                          <div key={site.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.15rem' }}>{site.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{site.domain}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.65rem' }}>
                                <button 
                                  onClick={() => handleApproveUnblock(site.id, site.name)}
                                  disabled={!!approvingId && approvingId === site.id}
                                  style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: 'var(--red)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                  {approvingId === site.id ? 'Eliminando...' : <><Unlock size={14} /> Eliminar Bloqueo</>}
                                </button>
                                <button 
                                  onClick={() => handleDenyUnblock(site.name)}
                                  style={{ padding: '0.5rem 1rem', background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '8px', color: 'var(--teal)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                  Mantener Bloqueo
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <Eye size={14} /> Estás viendo la información en vivo. Cualquier cambio en su panel te aparecerá aquí.
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
