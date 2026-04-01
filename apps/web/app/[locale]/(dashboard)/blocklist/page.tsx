'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert, Trash2, Plus, AlertCircle, CheckCircle2, Globe, Download, ExternalLink, Chrome, Zap, ShieldOff, Lock } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'CASINO', label: '🎰 Casino' },
  { value: 'SPORTS_BETTING', label: '⚽ Apuestas Deportivas' },
  { value: 'POKER', label: '♠️ Poker' },
  { value: 'LOTTERY', label: '🎱 Lotería' },
  { value: 'SLOTS', label: '🎰 Slots' },
  { value: 'OTHER', label: '🌐 Otro' },
];

const CATALOG = [
  { name: 'Caliente MX', domain: 'caliente.mx', category: 'SPORTS_BETTING' },
  { name: 'Codere MX', domain: 'codere.mx', category: 'CASINO' },
  { name: 'Betcris', domain: 'betcris.mx', category: 'SPORTS_BETTING' },
  { name: '1xBet', domain: '1xbet.com', category: 'SPORTS_BETTING' },
  { name: 'Bet365', domain: 'bet365.com', category: 'SPORTS_BETTING' },
  { name: 'PokerStars', domain: 'pokerstars.com', category: 'POKER' },
  { name: 'Melbet', domain: 'melbet.com', category: 'CASINO' },
  { name: 'Bodog MX', domain: 'bodog.mx', category: 'CASINO' },
];

const CAT_COLOR: Record<string, string> = {
  CASINO: 'var(--red)',
  SPORTS_BETTING: 'var(--amber)',
  POKER: '#a855f7',
  LOTTERY: '#06b6d4',
  SLOTS: 'var(--red)',
  OTHER: 'var(--text-muted)',
};

export default function BlocklistPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CASINO');
  const [requiresGuardian, setRequiresGuardian] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showExtBanner, setShowExtBanner] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await apiClient.get('/blocklist');
      setSites(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !name) {
      showToast('Llena nombre y dominio.', 'error');
      return;
    }
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
    setIsSubmitting(true);
    try {
      const newSite = await apiClient.post('/blocklist', {
        domain: cleanDomain,
        name,
        category,
        requiresGuardianToUnblock: requiresGuardian,
      });
      setSites(prev => [newSite, ...prev]);
      setDomain('');
      setName('');
      showToast(`✅ ${name} bloqueado. Sincroniza tu extensión para aplicarlo en el navegador.`, 'success');
    } catch (error: any) {
      showToast(error.data?.message || 'Error al agregar', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFromCatalog = async (item: typeof CATALOG[0]) => {
    const already = sites.find(s => s.domain === item.domain);
    if (already) {
      showToast(`${item.name} ya está en tu lista.`, 'info');
      return;
    }
    try {
      const newSite = await apiClient.post('/blocklist', {
        domain: item.domain,
        name: item.name,
        category: item.category,
        requiresGuardianToUnblock: true,
      });
      setSites(prev => [newSite, ...prev]);
      showToast(`✅ ${item.name} bloqueado exitosamente.`, 'success');
    } catch (error: any) {
      showToast(error.data?.message || 'Error al agregar', 'error');
    }
  };

  const handleDelete = async (site: any) => {
    if (site.requiresGuardianToUnblock) {
      showToast('🔒 Este sitio requiere autorización de tu guardián para desbloquearse.', 'error');
      return;
    }
    setDeletingId(site.id);
    try {
      await apiClient.delete(`/blocklist/${site.id}`);
      setSites(prev => prev.filter(s => s.id !== site.id));
      showToast(`${site.name} desbloqueado.`, 'success');
    } catch (error: any) {
      showToast(error.data?.message || 'Error al eliminar', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--purple)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
              background: toast.type === 'success' ? 'rgba(20,200,100,0.15)' : toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(20,200,100,0.4)' : toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(139,92,246,0.4)'}`,
              borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
              backdropFilter: 'blur(12px)', maxWidth: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} color="#4ade80" /> : toast.type === 'error' ? <AlertCircle size={20} color="var(--red)" /> : <AlertCircle size={20} color="var(--purple-light)" />}
            <div style={{ fontSize: '0.9rem' }}>{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert color="var(--red)" size={32} /> Sitios Bloqueados
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Agrega cualquier sitio que active tu impulso de jugar. La extensión de Chrome los bloqueará en tiempo real.
        </p>
      </header>

      {/* Extension Banner */}
      <AnimatePresence>
        {showExtBanner && (
          <motion.section
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(20,184,166,0.12))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--grad)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Chrome size={22} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={16} color="var(--purple-light)" /> Extensión Chrome — El Bloqueador Real
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Sin la extensión, los sitios solo están en la BD. Instálala y pega tu token JWT para activar el bloqueo físico.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href="https://github.com/Thekiidd/gambtroy/tree/main/apps/extension"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '0.6rem 1.2rem', background: 'var(--grad)', color: '#fff', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                >
                  <Download size={16} /> Descargar Extensión
                </a>
                <button
                  onClick={() => setShowExtBanner(false)}
                  style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Ya la tengo
                </button>
              </div>
            </div>

            {/* How it works steps */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(139,92,246,0.2)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { step: '1', text: 'Descarga la carpeta /extension del repositorio' },
                { step: '2', text: 'Abre chrome://extensions → Modo Desarrollador → Cargar sin empaquetar' },
                { step: '3', text: 'Copia tu token JWT del navegador (localStorage → "token")' },
                { step: '4', text: 'Pégalo en el popup de la extensión → Vincular dispositivo' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: '1', minWidth: '160px' }}>
                  <div style={{ width: '24px', height: '24px', background: 'var(--grad)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{s.step}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{s.text}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Add site form */}
      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} color="var(--purple-light)" /> Bloquear nueva plataforma
        </h2>
        <form onSubmit={handleAddSite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nombre del sitio</label>
            <input
              className="form-input"
              placeholder="Ej. Caliente MX"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dominio (sin https://)</label>
            <input
              className="form-input"
              placeholder="caliente.mx"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Categoría</label>
            <select
              className="form-input"
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={isSubmitting}
              style={{ cursor: 'pointer' }}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingBottom: '2px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Guardián</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.65rem 1rem', background: requiresGuardian ? 'rgba(20,184,166,0.08)' : 'var(--bg-2)', border: `1px solid ${requiresGuardian ? 'rgba(20,184,166,0.3)' : 'var(--border)'}`, borderRadius: '10px' }}>
              <input type="checkbox" checked={requiresGuardian} onChange={e => setRequiresGuardian(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: requiresGuardian ? 'var(--teal)' : 'var(--text-muted)' }}>Requiere aprobación</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ padding: '0.7rem 1.5rem', height: '48px', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-end' }}
          >
            {isSubmitting ? 'Bloqueando...' : <><Plus size={18} /> Bloquear</>}
          </button>
        </form>
      </section>

      {/* Catalog */}
      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={20} color="var(--teal)" /> Catálogo rápido — Sitios más comunes en México
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {CATALOG.map(item => {
            const already = sites.some(s => s.domain === item.domain);
            return (
              <button
                key={item.domain}
                onClick={() => handleAddFromCatalog(item)}
                disabled={already}
                style={{
                  padding: '0.85rem 1rem',
                  background: already ? 'rgba(20,200,100,0.06)' : 'var(--bg-2)',
                  border: `1px solid ${already ? 'rgba(20,200,100,0.25)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  cursor: already ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  opacity: already ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!already) e.currentTarget.style.borderColor = 'var(--purple)'; }}
                onMouseLeave={e => { if (!already) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {item.name}
                  {already && <CheckCircle2 size={14} color="#4ade80" />}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.domain}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active list */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={20} color="var(--red)" /> Lista activa ({sites.length} sitio{sites.length !== 1 ? 's' : ''})
        </h2>

        {sites.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '18px', border: '1px dashed var(--border)' }}>
            <ShieldOff size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Aún no tienes ningún sitio bloqueado.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Empieza por el sitio que más impulso te genera.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence>
              {sites.map(site => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: 'var(--surface)',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', background: 'rgba(239,68,68,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldAlert size={22} color="var(--red)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {site.name}
                        {site.requiresGuardianToUnblock && (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(20,184,166,0.1)', color: 'var(--teal)', padding: '0.15rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
                            🔒 Guardián
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                        <ExternalLink size={12} />
                        {site.domain}
                        <span style={{ fontSize: '0.72rem', color: CAT_COLOR[site.category] || 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.5rem', borderRadius: '99px', border: `1px solid rgba(255,255,255,0.08)` }}>
                          {CATEGORIES.find(c => c.value === site.category)?.label || site.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#4ade80', background: 'rgba(20,200,100,0.08)', padding: '0.3rem 0.75rem', borderRadius: '99px', fontWeight: 700, border: '1px solid rgba(20,200,100,0.2)' }}>
                      ✓ Bloqueado
                    </span>
                    <button
                      onClick={() => handleDelete(site)}
                      disabled={deletingId === site.id}
                      title={site.requiresGuardianToUnblock ? 'Requiere aprobación del guardián' : 'Eliminar bloqueo'}
                      style={{
                        padding: '0.5rem',
                        background: 'transparent',
                        border: `1px solid ${site.requiresGuardianToUnblock ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        borderRadius: '8px',
                        color: site.requiresGuardianToUnblock ? 'var(--teal)' : 'var(--red)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        opacity: deletingId === site.id ? 0.5 : 1,
                      }}
                    >
                      {site.requiresGuardianToUnblock ? <Lock size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
