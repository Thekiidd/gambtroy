'use client';
import { useEffect, useState } from 'react';
import { TrendingDown, Calendar, DollarSign, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { motion } from 'framer-motion';

export default function LossesPage() {
  const [losses, setLosses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchLosses();
  }, []);

  const fetchLosses = async () => {
    try {
      const res = await apiClient.get('/losses');
      setLosses(res.items);
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

  const handleAddLoss = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (!numericAmount || numericAmount <= 0) {
      showToast('Ingresa un monto válido mayor a 0', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Parse to ISO 8601 for the DB
      const isoDate = new Date(date).toISOString();
      const newLoss = await apiClient.post('/losses', { amount: numericAmount, platform, date: isoDate });
      
      setLosses([newLoss, ...losses]);
      setAmount('');
      setPlatform('');
      showToast('Pérdida registrada dolorosamente. Hoy empieza tu recuperación.', 'success');
    } catch (error: any) {
      showToast(error.data?.message || 'Error al registrar', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Cargando historial...</div>;

  const totalThisMonth = losses.reduce((acc, curr) => {
    // Basic logic for MVP, assumes all fetched losses are recent
    return acc + Number(curr.amount);
  }, 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && (
        <motion.div initial={{opacity:0, y: -20}} animate={{opacity:1, y:0}} className={`toast ${toast.type}`} style={{position: 'fixed', top: '20px', right: '20px', zIndex: 9999}}>
          {toast.type === 'success' ? <CheckCircle2 className="toast-success-icon" /> : <AlertCircle className="toast-error-icon" />}
          <div>{toast.message}</div>
        </motion.div>
      )}

      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingDown color="var(--amber)" /> Historial de Pérdidas
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>La honestidad es el primer paso. Documentar tus recaídas destruye la ilusión de que tienes el control.</p>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Form Column */}
        <section style={{ flex: '1 1 300px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--red)" /> Registrar Tropiezo
          </h2>
          <form onSubmit={handleAddLoss} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Monto Perdido ($)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }}/>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  className="form-input" 
                  placeholder="0.00" 
                  style={{ paddingLeft: '36px' }}
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Plataforma o Casino (Opcional)</label>
              <input 
                className="form-input" 
                placeholder="Ej. Codere / Caliente MX" 
                value={platform} 
                onChange={e => setPlatform(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Fecha del evento</label>
              <input 
                type="date"
                className="form-input" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {isSubmitting ? 'Registrando...' : 'Reportar Desplome Financiero'}
            </button>
          </form>
        </section>

        {/* History Column */}
        <section style={{ flex: '2 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Últimos Registros</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total Pág: <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>${totalThisMonth.toFixed(2)}</span>
            </div>
          </div>
          
          {losses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
               Tu historial está limpio. ¿Listo para que este espacio permanezca vacío para siempre?
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {losses.map(loss => (
                <div key={loss.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(245,158,11,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar size={18} color="var(--amber)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{loss.platform || 'Casino Físico / Desconocido'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(loss.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--red)' }}>
                       -${Number(loss.amount).toFixed(2)}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
