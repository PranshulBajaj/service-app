import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(data.user.role === 'vendor' ? '/vendor' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.userId) {
        toast.error('Please verify your email first');
        navigate('/register');
      } else {
        toast.error(msg);
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="sub">Login to your ServiceHub account</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" placeholder="Your Email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="Your password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-link">Don't have an account? <Link to="/register">Sign Up</Link></div>
        <div className="auth-link" style={{ marginTop: '0.5rem' }}>
          Vendor? <Link to="/vendor-register">Vendor Login / Register</Link>
        </div>
      </div>
    </div>
  );
}
