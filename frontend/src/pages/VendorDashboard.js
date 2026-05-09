import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'AC Repair', 'Pest Control', 'Other'];
const STATUS_LABEL = { pending: 'Pending', approved: 'Approved', 'in-progress': 'In Progress', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function VendorDashboard() {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', category: 'Plumbing', price: '', duration: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'vendor') { navigate('/'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([api.get('/bookings/vendor'), api.get('/services/my')]);
      setBookings(b.data);
      setServices(s.data);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await api.post('/services', serviceForm);
      toast.success('Service added!');
      setShowAddService(false);
      setServiceForm({ title: '', description: '', category: 'Plumbing', price: '', duration: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
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
          <h2>Vendor Dashboard</h2>
          <p>Manage your services and customer bookings</p>
        </div>
      </div>

      <div className="container page-section">
        <div className="stats-row">
          <div className="stat-card"><div className="stat-val">{counts.total}</div><div className="stat-label">Total Bookings</div></div>
          <div className="stat-card"><div className="stat-val">{counts.pending}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card"><div className="stat-val">{counts.active}</div><div className="stat-label">Active</div></div>
          <div className="stat-card"><div className="stat-val">{counts.delivered}</div><div className="stat-label">Completed</div></div>
          <div className="stat-card"><div className="stat-val">{services.length}</div><div className="stat-label">My Services</div></div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" style={{ maxWidth: '320px', marginBottom: '1.5rem' }}>
          <button className={`auth-tab${tab === 'bookings' ? ' active' : ''}`} onClick={() => setTab('bookings')}>Bookings</button>
          <button className={`auth-tab${tab === 'services' ? ' active' : ''}`} onClick={() => setTab('services')}>My Services</button>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <>
            {/* Bookings Tab */}
            {tab === 'bookings' && (
              <>
                {bookings.length === 0 ? (
                  <div className="empty-state"><h3>No bookings yet</h3><p>Add services to start receiving bookings</p></div>
                ) : bookings.map(b => (
                  <div key={b._id} className={`booking-card ${b.status}`}>
                    <div className="booking-info">
                      <div className="booking-service">{b.service?.title}</div>
                      <div className="booking-meta">
                        👤 {b.customer?.name} · 📞 {b.customer?.phone}
                      </div>
                      <div className="booking-meta">
                        📅 {new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="booking-meta">📍 {b.address} · 💰 ₹{b.totalAmount}</div>
                      {b.notes && <div className="booking-meta" style={{ fontStyle: 'italic' }}>📝 {b.notes}</div>}
                    </div>
                    <span className={`status-badge status-${b.status}`}>{STATUS_LABEL[b.status]}</span>
                    <div className="booking-actions">
                      {b.status === 'pending' && (
                        <>
                          <button className="btn-sm btn-approve" onClick={() => handleStatus(b._id, 'approved')}>Approve</button>
                          <button className="btn-sm btn-cancel" onClick={() => handleStatus(b._id, 'cancelled')}>Reject</button>
                        </>
                      )}
                      {b.status === 'approved' && (
                        <button className="btn-sm btn-approve" onClick={() => handleStatus(b._id, 'in-progress')}>Start</button>
                      )}
                      {b.status === 'in-progress' && (
                        <button className="btn-sm btn-deliver" onClick={() => handleStatus(b._id, 'delivered')}>Mark Delivered ✓</button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Services Tab */}
            {tab === 'services' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <button className="nav-btn nav-btn-filled" style={{ background: 'var(--primary)' }}
                    onClick={() => setShowAddService(!showAddService)}>
                    {showAddService ? '✕ Cancel' : '+ Add New Service'}
                  </button>
                </div>

                {showAddService && (
                  <form className="add-service-form" onSubmit={handleAddService}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Add New Service</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Title</label>
                        <input className="form-control" placeholder="e.g. Pipe Leak Fix" value={serviceForm.title}
                          onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select className="form-control" value={serviceForm.category}
                          onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea className="form-control" rows={2} placeholder="What's included in this service..."
                        value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                        style={{ resize: 'none' }} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Price (₹)</label>
                        <input className="form-control" type="number" placeholder="499" value={serviceForm.price}
                          onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} min={1} required />
                      </div>
                      <div className="form-group">
                        <label>Duration</label>
                        <input className="form-control" placeholder="e.g. 2 hours" value={serviceForm.duration}
                          onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} required />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ maxWidth: '200px' }}>Add Service</button>
                  </form>
                )}

                {services.length === 0 ? (
                  <div className="empty-state"><h3>No services listed</h3><p>Add your first service above</p></div>
                ) : services.map(s => (
                  <div key={s._id} className="vendor-service-card">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{s.title}</div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.description}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        <span className="service-category-badge">{s.category}</span>
                        &nbsp; ₹{s.price} · {s.duration}
                      </div>
                    </div>
                    <button className="btn-sm btn-cancel" onClick={() => handleDeleteService(s._id)}>Delete</button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
