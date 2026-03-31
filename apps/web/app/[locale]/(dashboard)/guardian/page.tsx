'use client';
import { useEffect, useState } from 'react';
import { Users, Link as LinkIcon, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function GuardianPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await apiClient.get('/guardian/status');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiClient.post('/guardian/invite', {});
      await fetchStatus();
    } catch (e: any) {
      alert(e.data?.message || 'Error generando invitación');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!data?.inviteToken) return;
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/es/invite?token=${data.inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div>Cargando estado del guardián...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users color="var(--teal)" /> Tu Guardián
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>La recuperación no se hace en soledad. Otorga permiso a un amigo o familiar para vigilar tu progreso y autorizar el desbloqueo de sitios en crisis.</p>
      </header>

      {data?.status === 'ACTIVE' ? (
        <section style={{ background: 'var(--surface)', border: '1px solid var(--teal)', borderRadius: '16px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
           <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ShieldCheck size={32} color="var(--teal)" />
           </div>
           <div>
             <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Protección Activa</h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tu cuenta está siendo supervisada por tu guardián.</p>
             <div style={{ fontWeight: 600 }}>{data.guardian?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({data.guardian?.email})</span></div>
           </div>
        </section>
      ) : data?.status === 'PENDING' ? (
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
           <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Invitación Pendiente</h2>
           <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Copia el enlace secreto de abajo y envíaselo por WhatsApp a la persona que elegiste confiarle tu proceso.</p>
           
           <div style={{ display: 'flex', gap: '0.5rem' }}>
             <input 
               readOnly 
               className="form-input" 
               value={`${typeof window !== 'undefined' ? window.location.origin : ''}/es/invite?token=${data.inviteToken}`} 
               style={{ flex: 1, fontFamily: 'monospace', color: 'var(--purple-light)' }} 
             />
             <button onClick={handleCopy} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.5rem' }}>
               {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />} {copied ? 'Copiado' : 'Copiar'}
             </button>
           </div>
        </section>
      ) : (
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', width: '80px', height: '80px', background: 'rgba(139,92,246,0.1)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <LinkIcon size={40} color="var(--purple)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Generar Enlace Seguro</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Al generar el enlace, quien lo abra será designado como tu Guardián. Podrá ver tus pérdidas reportadas y aprobar o denegar futuras eliminaciones de tu lista de bloqueo.
          </p>

          <button onClick={handleGenerate} disabled={generating} className="btn-primary" style={{ padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
            <ShieldCheck size={20} /> {generating ? 'Generando...' : 'Crear Enlace Único'}
          </button>
        </section>
      )}
    </div>
  );
}
