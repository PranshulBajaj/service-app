import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'AC Repair', 'Pest Control', 'Other'];

export default function Home() {
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState(null);
  const [form, setForm] = useState({ scheduledDate: '', address: '', notes: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/services${category !== 'All' ? `?category=${category}` : ''}`);
      setServices(data);
    } catch { toast.error('Failed to load services'); }
    setLoading(false);
  };

  const handleBook = (service) => {
    if (!user) { toast.error('Please login to book'); navigate('/login'); return; }
    if (user.role === 'vendor') { toast.error('Vendors cannot book services'); return; }
    setBookingService(service);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bookings', { serviceId: bookingService._id, ...form });
      toast.success('Booking confirmed! 🎉');
      setBookingService(null);
      setForm({ scheduledDate: '', address: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <h1>Find trusted <span>home services</span><br />at your doorstep</h1>
        <p>Book verified professionals for any home service in minutes</p>
      </div>

      {/* Categories */}
      <div className="categories">
        {CATEGORIES.map(c => (
          <button key={c} className={`cat-pill${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {/* Services */}
      <div className="container page-section">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
          {category === 'All' ? 'All Services' : category}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem', marginLeft: '0.5rem' }}>
            ({services.length} available)
          </span>
        </h2>

        {loading ? (
          <div className="loading">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <h3>No services found</h3>
            <p>Try a different category</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map(s => (
              <div key={s._id} className="service-card">
                <div className="service-card-header">
                  <span className="service-category-badge">{s.category}</span>
                  <div className="service-price">₹{s.price}<span> /service</span></div>
                </div>
                <div className="service-title">{s.title}</div>
                <div className="service-desc">{s.description}</div>
                <div className="service-vendor">👤 {s.vendor?.name}</div>
                <div className="service-duration">⏱ {s.duration}</div>
                <button className="btn-book" onClick={() => handleBook(s)}>Book Now</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <div className="modal-overlay" onClick={() => setBookingService(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Book: {bookingService.title}</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              ₹{bookingService.price} · {bookingService.duration}
            </div>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={form.scheduledDate}
                  onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Service Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full address for service"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Additional Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Any special instructions..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ resize: 'none' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setBookingService(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
