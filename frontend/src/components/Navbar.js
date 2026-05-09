import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
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
            <button className="nav-btn nav-btn-outline" onClick={() => navigate('/login')}>Login</button>
            <button className="nav-btn nav-btn-filled" onClick={() => navigate('/register')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}
