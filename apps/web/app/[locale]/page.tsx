'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useAnimation } from 'framer-motion';
import { ShieldAlert, TrendingDown, Users, Target, BotMessageSquare, BellRing, CheckCircle2, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api-client';

const AnimatedCounter = ({ from, to, duration = 2, format = (v: number) => v.toString() }: { from: number, to: number, duration?: number, format?: (v: number) => string | React.ReactNode }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: '-50px' });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(easeProgress * (to - from) + from));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [inView, from, to, duration]);

  return <div ref={nodeRef}>{format(value)}</div>;
};

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

const features = [
  { icon: ShieldAlert, color: 'rgba(139,92,246,0.15)', iconColor: '#a78bfa', title: 'Bloqueo estricto', desc: 'Bloquea el acceso a todas las plataformas de apuestas. Solo tu guardián puede autorizar desbloqueos temporales.' },
  { icon: TrendingDown, color: 'rgba(236,72,153,0.15)', iconColor: '#f472b6', title: 'Registro de pérdidas', desc: 'Mira a la realidad de frente. Registra cada peso perdido y visualiza cómo impacta en tu economía a largo plazo.' },
  { icon: Users, color: 'rgba(20,184,166,0.15)', iconColor: '#2dd4bf', title: 'Guardianes', desc: 'Asigna a un familiar o amigo de confianza para que reciba alertas si intentas apostar o superas tus límites.' },
  { icon: Target, color: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24', title: 'Metas de recuperación', desc: 'Ahorra el dinero que antes apostabas. Fija metas como "Pagar deuda" o "Viaje" y transfiere ese dinero.' },
  { icon: BotMessageSquare, color: 'rgba(139,92,246,0.15)', iconColor: '#a78bfa', title: 'Asistente 24/7 de IA', desc: 'Un chat empático entrenado en prevención de ludopatía disponible cuando llegue un impulso incontenible.' },
  { icon: BellRing, color: 'rgba(236,72,153,0.15)', iconColor: '#f472b6', title: 'Celebración de rachas', desc: 'Cada día limpio cuenta. Celebramos tus hitos (7, 30, 90 días) y notificamos a tu red de apoyo de tu logro.' }
];

const blockedSites = [
  { name: 'Caliente.mx', blocked: true },
  { name: 'Codere', blocked: true },
  { name: 'Bet365', blocked: true },
  { name: 'BetMGM', blocked: true },
  { name: 'Playdoit', blocked: true },
  { name: 'PokerStars', blocked: true }
];

const testimonials = [
  { quote: "Tenía una deuda de 300 mil pesos por apostar en deportes. GambTroy y mi hermano (como guardián) me ayudaron a parar en seco. Llevo 180 días limpio.", author: "Carlos R.", days: "180 días" },
  { quote: "El botón de auxilio del chat IA me salvó un sábado en la noche cuando estaba a punto de depositar la quincena. Es la herramienta que me hacía falta.", author: "Miguel A.", days: "45 días" },
  { quote: "Poder ver físicamente cuánto he dejado de perder me motiva más que nada. El dinero que iba al casino ahora va a la universidad de mi hija.", author: "Roberto S.", days: "320 días" }
];

const faqs = [
  { q: '¿Qué diferencia a GambTroy de otras apps de bloqueo?', a: 'GambTroy no solo bloquea, sino que aborda la ludopatía de forma integral: involucra a un "guardián" de confianza, cuenta con apoyo psicológico por IA 24/7 y transforma tus pérdidas pasadas en metas de ahorro futuras.' },
  { q: '¿Puede el usuario desinstalar o saltarse el bloqueo?', a: 'El sistema está diseñado para ofrecer máxima fricción. El retiro de bloqueos de sitios requiere explícitamente la autorización digital del guardián asignado. No existe un "botón de pánico" para apostar.' },
  { q: '¿Cómo funciona el guardián?', a: 'Invitas a un familiar o amigo mediante su correo. Ellos acceden a un panel donde pueden ver si has tenido impulsos, aprobar o denegar peticiones de desbloqueo, y celebrar tus rachas.' },
  { q: '¿Los datos financieros y mensajes son seguros?', a: 'Sí. Los mensajes con la IA y los montos registrados están encriptados. El guardián solo ve lo que tú le das permiso de ver (por ejemplo, el monto total perdido, pero no tus chats privados).' }
];

export default function HomePage() {
  const router = useRouter();
  const [modal, setModal] = useState<'login' | 'register' | null>(null);
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [scrolled, setScrolled] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{email?:string, password?:string, name?:string}>({});
  
  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const openModal = (type: 'login' | 'register') => {
    setModal(type);
    setTab(type);
    setErrors({});
    setEmail('');
    setPassword('');
    setName('');
  };

  const closeModal = () => {
    setModal(null);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Introduce un email válido';
    if (!password || password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    if (tab === 'register' && !name) newErrors.name = 'El nombre es requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    try {
      const endpoint = tab === 'register' ? '/auth/register' : '/auth/login';
      const body = tab === 'register' ? { email, name, password } : { email, password };
      
      const response = await apiClient.post(endpoint, body);
      
      if (tab === 'login' && response.token) {
        localStorage.setItem('token', response.token);
        showToast('Inicio de sesión exitoso', 'success');
        closeModal();
        router.push('/es/dashboard');
      } else if (tab === 'register') {
        showToast('¡Cuenta creada! Tratando de iniciar sesión...', 'success');
        // Auto login for MVP
        const loginResponse = await apiClient.post('/auth/login', { email, password });
        if (loginResponse.token) {
          localStorage.setItem('token', loginResponse.token);
          closeModal();
          router.push('/es/dashboard');
        }
      }
    } catch (error: any) {
      const msg = error.data?.message || 'Ocurrió un error inesperado.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-brand">
          <span className="nav-brand-icon">🎯</span> GambTroy
        </a>
        <div className="nav-links">
          <a href="#features" className="nav-link">Características</a>
          <a href="#como-funciona" className="nav-link">Cómo funciona</a>
          <a href="#testimonios" className="nav-link">Testimonios</a>
          <a href="#precios" className="nav-link">Precios</a>
          <button className="nav-cta" onClick={() => openModal('login')}>Iniciar sesión</button>
          <button className="btn-primary" style={{padding:'0.5rem 1.1rem', fontSize:'0.875rem', borderRadius:'10px'}} onClick={() => openModal('register')}>Empezar gratis</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <FadeIn delay={0.1}>
          <div className="hero-badge">✨ Plataforma #1 para superar la ludopatía en México</div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <h1 className="hero-title">
            Deja de apostar.<br />
            <span className="grad-text">Empieza a ganar.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="hero-sub">
            GambTroy te ayuda a bloquear casinos online, registrar tus pérdidas, establecer metas de ahorro y recibir apoyo real cuando más lo necesitas.
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => openModal('register')}>
              🚀 Comenzar gratis ahora
            </button>
            <a href="#dashboard" className="btn-ghost">
              ▶ Ver la plataforma
            </a>
          </div>
        </FadeIn>
        <FadeIn delay={0.5}>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">
                <AnimatedCounter from={0} to={3} duration={1.5} format={(v) => <>{v} <span style={{fontSize:'1.2rem', marginLeft:'4px', color:'var(--text-muted)'}}>de cada 10</span></>} />
              </div>
              <div className="stat-label">apostadores tienen ludopatía</div>
            </div>
            <div className="stat">
              <div className="stat-num">
                <AnimatedCounter from={0} to={180} duration={2} format={(v) => <>${v}K</>} />
              </div>
              <div className="stat-label">pérdida promedio anual</div>
            </div>
            <div className="stat">
              <div className="stat-num">
                <AnimatedCounter from={0} to={78} duration={2} format={(v) => <>{v}%</>} />
              </div>
              <div className="stat-label">logran dejar con apoyo</div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* DASHBOARD MOCKUP */}
      <section id="dashboard" style={{position:'relative'}}>
        <FadeIn delay={0.2}>
          <div className="dashboard-mockup-wrapper">
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <div className="mockup-dot" style={{background:'#ef4444'}}></div>
                  <div className="mockup-dot" style={{background:'#f59e0b'}}></div>
                  <div className="mockup-dot" style={{background:'#22c55e'}}></div>
                </div>
                <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>gambtroy.com/dashboard</div>
              </div>
              <div className="mockup-body">
                <div className="mockup-panel" style={{gridColumn:'1 / -1', display:'flex', justifyContent:'space-between', alignItems:'center', background: 'linear-gradient(to right, rgba(139,92,246,0.1), transparent)'}}>
                  <div>
                    <div className="mockup-title" style={{marginBottom:'0.2rem'}}>Progreso Actual</div>
                    <div className="mockup-highlight">45 <span>Días limpio</span></div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="mockup-title" style={{marginBottom:'0.2rem'}}>Tu Guardián</div>
                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--text)'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--green)'}}></div> Luis R. (Hermano)
                    </div>
                  </div>
                </div>
                <div className="mockup-panel">
                  <div className="mockup-title">Sitios Bloqueados</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                    {['Caliente.mx', 'Bet365', 'Codere'].map(s => (
                      <div key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'0.9rem'}}>
                        <span style={{color:'var(--text)'}}>{s}</span>
                        <span style={{color:'var(--red)', fontSize:'0.75rem', background:'rgba(239,68,68,0.15)', padding:'0.2rem 0.5rem', borderRadius:'6px'}}>Bloqueado</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mockup-panel">
                  <div className="mockup-title">Historial de Pérdidas</div>
                  <div style={{height:'100px', display:'flex', alignItems:'flex-end', gap:'0.5rem'}}>
                     {/* Fake chart columns */}
                     {[40, 80, 60, 20, 10, 0, 0].map((h, i) => (
                       <div key={i} style={{flex:1, background: h===0 ? 'var(--green)' : 'var(--red)', opacity: h===0?0.8:0.4, height: Math.max(10, h)+'%', borderRadius:'4px 4px 0 0'}}></div>
                     ))}
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginTop:'0.5rem', fontSize:'0.7rem', color:'var(--text-muted)'}}>
                    <span>Hace 6 meses</span>
                    <span>Hoy (Limpio)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <FadeIn><p className="section-label">Herramientas que funcionan</p></FadeIn>
        <FadeIn delay={0.1}><h2 className="section-title">Todo lo que necesitas para recuperar el control</h2></FadeIn>
        <FadeIn delay={0.2}><p className="section-desc">Un ecosistema completo diseñado para ayudarte en cada etapa del proceso.</p></FadeIn>
        
        <div className="features-grid">
          {features.map((f, i) => (
            <FadeIn delay={i * 0.1} key={f.title}>
              <div className="feature-card">
                <div className="feature-icon" style={{background: f.color}}>
                  <f.icon color={f.iconColor} size={24} />
                </div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* BLOCKED SITES GRID */}
      <section className="section" style={{background:'rgba(255,255,255,0.02)', borderRadius:'40px', margin:'2rem auto'}}>
        <FadeIn><h2 className="section-title" style={{fontSize:'2rem'}}>Bloquea la tentación en segundos</h2></FadeIn>
        <FadeIn delay={0.1}><p className="section-desc">Evita el acceso a los casinos online más populares con un solo clic. Tu guardián es el único que puede autorizar el desbloqueo.</p></FadeIn>
        
        <div className="blocked-sites-grid">
          {blockedSites.map((site, i) => (
            <FadeIn delay={i * 0.1} key={site.name}>
              <div className="blocked-site">
                <div className="site-badge">BLOQUEADO</div>
                <div className="site-icon"><ShieldAlert color="var(--red)" size={24} /></div>
                <div className="site-name">{site.name}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" id="testimonios">
         <FadeIn><p className="section-label">Historias reales</p></FadeIn>
         <FadeIn delay={0.1}><h2 className="section-title">Ellos ya dieron el primer paso</h2></FadeIn>
         
         <div className="testimonials-grid">
           {testimonials.map((t, i) => (
             <FadeIn delay={i*0.2} key={t.author}>
               <div className="testimonial-card">
                 <div style={{color:'var(--purple-light)', fontSize:'2rem', lineHeight:0.5, marginBottom:'0.5rem'}}>”</div>
                 <p className="testimonial-quote">{t.quote}</p>
                 <div className="testimonial-author">
                   <div className="author-avatar">{t.author.charAt(0)}</div>
                   <div className="author-info">
                     <strong>{t.author}</strong>
                     <span>Lleva {t.days}</span>
                   </div>
                 </div>
               </div>
             </FadeIn>
           ))}
         </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <FadeIn><h2 className="section-title">Preguntas frecuentes</h2></FadeIn>
        <div className="faq-container">
          {faqs.map((faq, i) => (
            <FadeIn delay={i*0.1} key={i}>
              <div className="faq-item">
                <div className="faq-header" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <ChevronDown style={{transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s', color:'var(--text-muted)'}} />
                </div>
                {openFaq === i && (
                  <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="faq-body">
                    {faq.a}
                  </motion.div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <FadeIn>
        <div className="cta-section">
          <h2 className="cta-title">El primer paso es el más difícil.<br/>Nosotros te acompañamos.</h2>
          <p className="cta-sub">Únete a miles de personas que están reconstruyendo su vida financiera y emocional.</p>
          <div className="cta-btn-wrap">
            <button className="btn-primary" onClick={() => openModal('register')} style={{fontSize:'1.05rem', padding:'1rem 2.5rem'}}>
              🎯 Crear mi cuenta gratis
            </button>
          </div>
        </div>
      </FadeIn>

      {/* FOOTER */}
      <footer className="footer">
        <span className="footer-copy">© 2025 GambTroy · Gambling Destroy</span>
        <div className="footer-links">
          <Link href="/es/legal">Aviso legal</Link>
          <a href="mailto:hola@gambtroy.com">Contacto</a>
        </div>
      </footer>

      {/* TOAST SYSTEM */}
      <div className="toast-container">
        {toast && (
          <motion.div initial={{opacity:0, x: 50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 className="toast-success-icon" /> : <AlertCircle className="toast-error-icon" />}
            <div>{toast.message}</div>
          </motion.div>
        )}
      </div>

      {/* AUTH MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.5rem'}}>
              <button
                onClick={() => { setTab('register'); setErrors({}); }}
                style={{flex:1, padding:'0.6rem', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.9rem',
                  background: tab==='register' ? 'var(--grad)' : 'var(--surface)',
                  color: tab==='register' ? '#fff' : 'var(--text-muted)'}}
              >Crear cuenta</button>
              <button
                onClick={() => { setTab('login'); setErrors({}); }}
                style={{flex:1, padding:'0.6rem', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.9rem',
                  background: tab==='login' ? 'var(--grad)' : 'var(--surface)',
                  color: tab==='login' ? '#fff' : 'var(--text-muted)'}}
              >Iniciar sesión</button>
            </div>

            <form onSubmit={handleSubmit}>
              {tab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Nombre completo</label>
                  <input className={`form-input ${errors.name ? 'error' : ''}`} type="text" placeholder="Tu nombre" value={name} onChange={e=>setName(e.target.value)} />
                  {errors.name && <div className="error-msg">{errors.name}</div>}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
                {errors.email && <div className="error-msg">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input className={`form-input ${errors.password ? 'error' : ''}`} type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e=>setPassword(e.target.value)} />
                {errors.password && <div className="error-msg">{errors.password}</div>}
              </div>
              
              <button className="form-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Cargando...' : (tab === 'register' ? 'Crear cuenta gratis →' : 'Iniciar sesión →')}
              </button>
            </form>
            
            <div className="modal-footer">
              {tab === 'register' 
                ? <>¿Ya tienes cuenta? <a onClick={() => {setTab('login'); setErrors({})}}>Inicia sesión</a></>
                : <>¿No tienes cuenta? <a onClick={() => {setTab('register'); setErrors({})}}>Regístrate gratis</a></>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
}
