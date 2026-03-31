'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, ShieldAlert, TrendingDown, Users } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    // Verify token with backend
    apiClient.get('/auth/me')
      .then(res => {
        setUser(res.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/');
      });
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--purple)' }}>Cargando panel...</div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', borderRight: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <Link href="/es/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', textDecoration: 'none' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎯</span>
            GambTroy
          </Link>
        </div>
        
        <nav style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/es/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: pathname === '/es/dashboard' ? 'rgba(139,92,246,0.1)' : 'transparent', color: pathname === '/es/dashboard' ? 'var(--purple-light)' : 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
            <LayoutDashboard size={20} /> Panel
          </Link>
          <Link href="/es/dashboard/blocklist" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: pathname.includes('/blocklist') ? 'rgba(139,92,246,0.1)' : 'transparent', color: pathname.includes('/blocklist') ? 'var(--purple-light)' : 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
            <ShieldAlert size={20} /> Bloqueos
          </Link>
          <Link href="/es/dashboard/losses" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: pathname.includes('/losses') ? 'rgba(139,92,246,0.1)' : 'transparent', color: pathname.includes('/losses') ? 'var(--purple-light)' : 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
            <TrendingDown size={20} /> Pérdidas
          </Link>
          <Link href="/es/dashboard/guardian" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: pathname.includes('/guardian') ? 'rgba(139,92,246,0.1)' : 'transparent', color: pathname.includes('/guardian') ? 'var(--purple-light)' : 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
            <Users size={20} /> Guardián
          </Link>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--red)', cursor: 'pointer', fontWeight: 600, justifyContent: 'center' }}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
