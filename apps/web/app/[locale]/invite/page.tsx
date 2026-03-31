'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import Link from 'next/link';

export default function InviteAcceptPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check login state
  const hasAuth = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;

  useEffect(() => {
    if (!token) {
      setError('Enlace inválido o sin token.');
      setLoading(false);
      return;
    }

    // Public endpoint check
    apiClient.get(`/guardian/invite/${token}`)
      .then(res => setData(res))
      .catch(err => setError(err.data?.message || 'La invitación ya expiró o fue cancelada.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await apiClient.post('/guardian/accept', { token });
      setSuccess(true);
      setTimeout(() => {
        router.push('/es/guardian-panel'); // We will build this next
      }, 2000);
    } catch (e: any) {
      setError(e.data?.message || 'Error al aceptar invitación.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>Verificando enlace...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '500px', width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem', textAlign: 'center' }}>
        
        {success ? (
          <div>
            <div style={{ display: 'inline-flex', width: '80px', height: '80px', background: 'rgba(20,184,166,0.1)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ShieldCheck size={40} color="var(--teal)" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>¡Vinculación Exitosa!</h1>
            <p style={{ color: 'var(--text-muted)' }}>Redirigiéndote a tu Panel de Guardián...</p>
          </div>
        ) : error ? (
          <div>
            <div style={{ display: 'inline-flex', width: '80px', height: '80px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <AlertTriangle size={40} color="var(--red)" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Invitación No Válida</h1>
            <p style={{ color: 'var(--text-muted)' }}>{error}</p>
            <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>Volver al Inicio</Link>
          </div>
        ) : (
          <div>
            <div style={{ display: 'inline-flex', width: '80px', height: '80px', background: 'rgba(139,92,246,0.1)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ShieldCheck size={40} color="var(--purple)" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Llamado a ser Guardián</h1>
            <p style={{ color: 'var(--text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--purple-light)' }}>{data.inviterName}</strong> ha solicitado que seas su guardián.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Deberás supervisar sus bloqueos y apoyarle en su proceso de rehabilitación contra el juego.
            </p>

            {!hasAuth ? (
              <div style={{ background: 'var(--bg-2)', border: '1px dashed var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
                <AlertTriangle size={24} color="var(--amber)" style={{ marginBottom: '0.5rem' }}/>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Requisito Prevío</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Necesitas crear una cuenta (o iniciar sesión) en GambTroy para poder aceptar ser su Guardián.
                </p>
                <Link href="/es" className="btn-primary" style={{ display: 'block', width: '100%', padding: '0.75rem', textDecoration: 'none' }}>
                  Ir a Crear Cuenta
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleAccept} 
                className="btn-primary" 
                disabled={isAccepting}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              >
                {isAccepting ? 'Vinculando Cuentas...' : 'Aceptar y Proteger'}
              </button>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
}
