'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { motion } from 'framer-motion';

export default function BlocklistPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await apiClient.get('/blocklist');
      setSites(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !name) {
      showToast('Llena ambos campos.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newSite = await apiClient.post('/blocklist', { domain, name, category: 'CASINO' });
      setSites([newSite, ...sites]);
      setDomain('');
      setName('');
      showToast('Sitio bloqueado exitosamente', 'success');
    } catch (error: any) {
      showToast(error.data?.message || 'Error al agregar', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, requiresGuardianToUnblock: boolean) => {
    if (requiresGuardianToUnblock) {
      const confirm = window.confirm('Este sitio está protegido. ¿Seguro que quieres intentar desbloquearlo? (Solo para modo Demo/MVP)');
      if (!confirm) return;
    }
    
    try {
      await apiClient.delete(`/blocklist/${id}`);
      setSites(sites.filter(s => s.id !== id));
      showToast('Sitio desbloqueado', 'success');
    } catch (error: any) {
      showToast(error.data?.message || 'Error al eliminar', 'error');
    }
  };

  if (loading) return <div>Cargando lista de bloqueos...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {toast && (
        <motion.div initial={{opacity:0, y: -20}} animate={{opacity:1, y:0}} className={`toast ${toast.type}`} style={{position: 'fixed', top: '20px', right: '20px', zIndex: 9999}}>
          {toast.type === 'success' ? <CheckCircle2 className="toast-success-icon" /> : <AlertCircle className="toast-error-icon" />}
          <div>{toast.message}</div>
        </motion.div>
      )}

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert color="var(--red)" /> Sitios Bloqueados
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Agrega casinos u otras plataformas que activen tus impulsos. Una vez bloqueados requerirán permiso de tu guardián para retirarse.</p>
      </header>

      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Bloquear nueva plataforma</h2>
        <form onSubmit={handleAddSite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Nombre del sitio</label>
            <input 
              className="form-input" 
              placeholder="Ej. Caliente MX" 
              value={name} 
              onChange={e => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Dominio web</label>
            <input 
              className="form-input" 
              placeholder="caliente.mx" 
              value={domain} 
              onChange={e => setDomain(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '0.75rem 1.5rem', height: '48px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isSubmitting ? 'Agregando...' : <><Plus size={18} /> Bloquear</>}
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Lista activa ({sites.length})</h2>
        {sites.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
             Aún no tienes sitios bloqueados. Protege tu recuperación agregando el primero.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sites.map(site => (
              <div key={site.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={20} color="var(--red)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{site.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{site.domain}</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(site.id, site.requiresGuardianToUnblock)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                  title="Intentar desbloquear"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
