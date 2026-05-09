import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'login' | 'signup' | null

  const handleLogout = () => { logout(); navigate('/'); };

  const handleRoleSelect = (role) => {
    setModal(null);
    if (modal === 'login') {
      navigate(role === 'vendor' ? '/login?role=vendor' : '/login?role=customer');
    } else {
      navigate(role === 'vendor' ? '/vendor-register' : '/register');
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          Service<span>Hub</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="nav-btn nav-btn-outline" onClick={() =>
                navigate(user.role === 'vendor' ? '/vendor' : '/dashboard')
              }>
                Dashboard
              </button>
              <button className="nav-btn nav-btn-filled" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-btn nav-btn-outline" onClick={() => setModal('login')}>Login</button>
              <button className="nav-btn nav-btn-filled" onClick={() => setModal('signup')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.4rem' }}>
              {modal === 'login' ? 'Login as...' : 'Sign up as...'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.8rem' }}>
              Choose how you want to continue
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleRoleSelect('customer')} style={{
                flex: 1, padding: '1.4rem 1rem', border: '2px solid var(--border)',
                borderRadius: '14px', background: 'none', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.6rem'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: '2.4rem' }}>🙋</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>Customer</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Book home services</span>
              </button>
              <button onClick={() => handleRoleSelect('vendor')} style={{
                flex: 1, padding: '1.4rem 1rem', border: '2px solid var(--border)',
                borderRadius: '14px', background: 'none', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.6rem'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: '2.4rem' }}>🔧</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>Vendor</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Provide services</span>
              </button>
            </div>
            <button onClick={() => setModal(null)} style={{
              marginTop: '1.2rem', background: 'none', border: 'none',
              color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}