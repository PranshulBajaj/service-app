import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VendorRegister() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/vendor-register', form);
      login(data.token, data.user);
      toast.success('Vendor account created! 🎉');
      navigate('/vendor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Role badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.6rem' }}>🔧</span>
          <span style={{
            background: 'var(--primary-light)', color: 'var(--primary)',
            fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.7rem',
            borderRadius: '20px', textTransform: 'uppercase'
          }}>
            Vendor Sign Up
          </span>
        </div>

        <h2>Vendor Registration</h2>
        <p className="sub">Join ServiceHub as a service provider</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business / Full Name</label>
            <input className="form-control" placeholder="Your Business Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" placeholder="vendor@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" type="tel" placeholder="Phone number" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Vendor Account'}
          </button>
        </form>
        <div className="auth-link">Already a vendor? <Link to="/login?role=vendor">Login</Link></div>
        <div className="auth-link" style={{ marginTop: '0.5rem' }}>
          <a href="#switch" style={{ color: 'var(--text-muted)' }} onClick={e => { e.preventDefault(); navigate('/register'); }}>
            Switch to Customer Sign Up →
          </a>
        </div>
      </div>
    </div>
  );
}