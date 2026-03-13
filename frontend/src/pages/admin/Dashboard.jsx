import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { FiUsers, FiMapPin, FiDollarSign, FiTrendingUp, FiCalendar, FiClipboard } from 'react-icons/fi';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  const widgets = [
    { label: 'Total Customers', value: data?.customer_count || 0, icon: <FiUsers />, color: '#42a5f5', bg: '#e3f2fd' },
    { label: 'Total Guides', value: data?.guide_count || 0, icon: <FiUsers />, color: '#66bb6a', bg: '#e8f5e9' },
    { label: 'Total Bookings', value: data?.total_bookings || 0, icon: <FiClipboard />, color: '#ff9800', bg: '#fff3e0' },
    { label: 'Active Trips', value: data?.active_trips || 0, icon: <FiMapPin />, color: '#ab47bc', bg: '#f3e5f5' },
    { label: 'Total Revenue', value: `₹${(data?.total_revenue || 0).toLocaleString()}`, icon: <FiDollarSign />, color: '#4caf50', bg: '#e8f5e9' },
    { label: 'Upcoming Trips', value: data?.upcoming_trips || 0, icon: <FiTrendingUp />, color: '#0288d1', bg: '#e1f5fe' },
  ];

  const recentBookings = data?.recent_bookings || [];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <motion.div variants={fadeUp} style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of your travel platform</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {widgets.map((w, i) => (
            <motion.div key={i} variants={fadeUp} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{w.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{w.value}</div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                  background: w.bg, color: w.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                }}>{w.icon}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Bookings */}
        <motion.div variants={fadeUp}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings yet</div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Customer', 'Destination', 'Date', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--sand-100)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{b.customer_name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{b.destination_name || b.city_name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>₹{(b.amount || 0).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'info'}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
