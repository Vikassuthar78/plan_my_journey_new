import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCalendar, FiMapPin, FiDownload, FiShare2, FiArrowRight, FiCopy, FiPhone } from 'react-icons/fi';
import { bookingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function BookingConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    bookingsAPI.getById(id)
      .then((res) => setBooking(res.data.booking || res.data))
      .catch(() => toast.error('Failed to load booking'))
      .finally(() => setLoading(false));
  }, [id]);

  const copyBookingId = () => {
    navigator.clipboard?.writeText(id || '');
    toast.success('Booking ID copied!');
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader" />
        <p>Loading booking...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1.5rem', paddingBottom: '100px' }}>
      <div className="container" style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4caf50, #81c784)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', boxShadow: '0 8px 32px rgba(76,175,80,0.3)',
            }}
          >
            <FiCheckCircle style={{ fontSize: '3rem', color: '#fff' }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--forest-700)' }}
          >
            Booking Confirmed! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}
          >
            Your journey has been booked successfully
          </motion.p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{
            background: '#fff', borderRadius: '20px', padding: '1.5rem',
            border: '1px solid var(--sand-200)', boxShadow: 'var(--shadow-md)',
            marginBottom: '1rem',
          }}
        >
          {/* Booking ID */}
          <div style={{
            background: 'var(--forest-50)', borderRadius: '14px', padding: '1rem',
            marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Booking ID</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--forest-700)', fontFamily: 'monospace' }}>
                {id ? `#${id.substring(0, 12).toUpperCase()}` : '#BOOKING'}
              </div>
            </div>
            <button
              onClick={copyBookingId}
              style={{
                background: 'var(--forest-100)', border: 'none', borderRadius: '10px',
                padding: '0.5rem', cursor: 'pointer', color: 'var(--forest-700)',
              }}
            >
              <FiCopy />
            </button>
          </div>

          {/* Trip Info */}
          {booking && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {booking.trip?.title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'var(--sky-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--sky-600)',
                  }}>
                    <FiMapPin />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Trip</div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{booking.trip.title}</div>
                  </div>
                </div>
              )}

              {booking.trip?.start_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ff9800',
                  }}>
                    <FiCalendar />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dates</div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      {new Date(booking.trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {booking.trip.end_date && ` - ${new Date(booking.trip.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div style={{
                borderTop: '1px solid var(--sand-200)', paddingTop: '1rem', marginTop: '0.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Amount Paid</span>
                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--forest-700)' }}>
                  ₹{(booking.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}
        >
          {[
            { icon: FiMapPin, label: 'View Trip', color: '#43a047', bg: '#e8f5e9', onClick: () => navigate(`/trips/${booking?.trip_id || booking?.trip?._id}`) },
            { icon: FiDownload, label: 'Receipt', color: '#1e88e5', bg: '#e3f2fd', onClick: () => toast.success('Receipt downloaded!') },
            { icon: FiShare2, label: 'Share', color: '#ff7043', bg: '#fbe9e7', onClick: () => { navigator.share?.({ title: 'My Trip Booking', text: `Booking confirmed! ID: ${id}` }).catch(() => {}); toast.success('Shared!'); } },
          ].map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              style={{
                padding: '1rem', borderRadius: '16px', border: 'none',
                background: action.bg, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
              }}
            >
              <action.icon style={{ fontSize: '1.3rem', color: action.color }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: action.color }}>{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          style={{
            background: 'var(--sky-100)', borderRadius: '16px', padding: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem',
          }}
        >
          <FiPhone style={{ color: 'var(--sky-600)', fontSize: '1.2rem', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--sky-700)' }}>Need help?</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contact support: +91 98765 43210</div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <button
            onClick={() => navigate('/my-trips')}
            className="btn-primary"
            style={{
              width: '100%', padding: '1rem', borderRadius: '14px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            View My Trips <FiArrowRight />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%', padding: '1rem', borderRadius: '14px',
              background: 'var(--sand-100)', border: '1px solid var(--sand-200)',
              fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)',
            }}
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
