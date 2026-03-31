'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, User as UserIcon, AlertTriangle, Globe } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function GuardianPanelPage() {
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/guardian/wards')
      .then(res => setWards(res.wards))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando Panel de Guardián...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck color="var(--teal)" /> Panel de Supervisión
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Bienvenido. Como Guardián, tu misión es supervisar y apoyar incondicionalmente a las personas que te confiaron su progreso.</p>
      </header>

      {wards.length === 0 ? (
        <section style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <ShieldCheck size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Aún no tienes ahijados</h2>
          <p style={{ color: 'var(--text-muted)' }}>Pide a tu familiar/amigo que comparta el enlace de invitación desde su panel.</p>
        </section>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {wards.map(link => {
            const ward = link.user;
            return (
              <div key={link.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-2)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(20,184,166,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={24} color="var(--teal)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{ward.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ward.email}</p>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, background: 'var(--bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Días Limpio</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{ward.profile?.currentStreak || 0}</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(239,68,68,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Pérdidas Reales</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--red)' }}>${Number(ward.profile?.totalLost || 0).toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Blocklist Summary */}
                  <div>
                     <h4 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                       <Globe size={16} color="var(--purple-light)" /> Sus Filtros Web Activos ({ward.blocklist?.length || 0})
                     </h4>
                     {ward.blocklist && ward.blocklist.length > 0 ? (
                       <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                         {ward.blocklist.slice(0, 3).map((site: any) => (
                           <li key={site.domain} style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: 'var(--bg)', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ fontWeight: 600 }}>{site.name}</span>
                             <span style={{ color: 'var(--text-muted)' }}>{site.domain}</span>
                           </li>
                         ))}
                         {ward.blocklist.length > 3 && (
                           <li style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>+ {ward.blocklist.length - 3} más...</li>
                         )}
                       </ul>
                     ) : (
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Todavía no ha bloqueado ninguna página. Aconséjale que empiece con su mayor desencadenante.</p>
                     )}
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <button disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'transparent', border: '1px dashed var(--teal)', color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }}>
                      <AlertTriangle size={16} /> Fui notificado de una urgencia
                    </button>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>En la próxima actualización podrás recibir alertas por correo y aprobar desbloqueos de sus URLs.</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
