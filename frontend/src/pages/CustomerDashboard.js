import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  'in-progress': 'In Progress',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'customer') { navigate('/'); return; }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch { toast.error('Failed to load bookings'); }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    }
  };

  const counts = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => ['approved', 'in-progress'].includes(b.status)).length,
    delivered: bookings.filter(b => b.status === 'delivered').length,
  };

  return (
    <>
      <div className="dashboard-header">
        <div className="container">
          <h2>My Bookings</h2>
          <p>Track and manage your service requests</p>
        </div>
      </div>

      <div className="container page-section">
        <div className="stats-row">
          <div className="stat-card"><div className="stat-val">{counts.total}</div><div className="stat-label">Total Bookings</div></div>
          <div className="stat-card"><div className="stat-val">{counts.pending}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card"><div className="stat-val">{counts.active}</div><div className="stat-label">Active</div></div>
          <div className="stat-card"><div className="stat-val">{counts.delivered}</div><div className="stat-label">Completed</div></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>All Bookings</h3>
          <button className="nav-btn nav-btn-filled" style={{ background: 'var(--primary)' }} onClick={() => navigate('/')}>
            + Book a Service
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Browse services and book your first one!</p>
            <button className="btn-book" style={{ marginTop: '1rem', display: 'inline-block', padding: '0.7rem 1.5rem' }}
              onClick={() => navigate('/')}>Explore Services</button>
          </div>
        ) : (
          bookings.map(b => (
            <div key={b._id} className={`booking-card ${b.status}`}>
              <div className="booking-info">
                <div className="booking-service">{b.service?.title}</div>
                <div className="booking-meta">
                  📅 {new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  &nbsp;·&nbsp; 📍 {b.address}
                  &nbsp;·&nbsp; 👤 {b.vendor?.name}
                </div>
                <div className="booking-meta" style={{ marginTop: '0.2rem' }}>
                  💰 ₹{b.totalAmount} &nbsp;·&nbsp; {b.service?.category}
                </div>
              </div>
              <span className={`status-badge status-${b.status}`}>{STATUS_LABEL[b.status]}</span>
              <div className="booking-actions">
                {['pending', 'approved'].includes(b.status) && (
                  <button className="btn-sm btn-cancel" onClick={() => handleCancel(b._id)}>Cancel</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
