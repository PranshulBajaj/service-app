import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setUserId(data.userId);
      setStep('otp');
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleOtpChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp: code });
      login(data.token, data.user);
      toast.success('Account verified! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { userId });
      toast.success('OTP resent!');
    } catch { toast.error('Could not resend OTP'); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step === 'form' ? (
          <>
            <h2>Create Account</h2>
            <p className="sub">Sign up as a customer to book services</p>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" placeholder="Your Name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" placeholder="Your Email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" type="tel" placeholder="Your Phone" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} required />
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP & Register'}
              </button>
            </form>
            <div className="auth-link">Already have an account? <Link to="/login">Login</Link></div>
            <div className="auth-link" style={{ marginTop: '0.5rem' }}>
              Are you a vendor? <Link to="/vendor-register">Register as Vendor</Link>
            </div>
          </>
        ) : (
          <>
            <h2>Verify Email</h2>
            <p className="sub">We sent a 6-digit OTP to <strong>{form.email}</strong></p>
            <div className="otp-row">
              {otp.map((v, i) => (
                <input
                  key={i} ref={el => (otpRefs.current[i] = el)}
                  className="otp-box" type="text" inputMode="numeric"
                  value={v} onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => handleOtpKeyDown(e, i)}
                />
              ))}
            </div>
            <button className="btn-primary" onClick={handleVerify} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="auth-link">
              Didn't receive? <a href="#resend" onClick={e => { e.preventDefault(); handleResend(); }}>Resend OTP</a>
            </div>
            <div className="auth-link">
              <a href="#back" onClick={e => { e.preventDefault(); setStep('form'); setOtp(['','','','','','']); }}>← Go back</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
