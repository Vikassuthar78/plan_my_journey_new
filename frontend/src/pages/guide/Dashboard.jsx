import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guideAPI } from '../../services/api';
import { FiMapPin, FiCalendar, FiClock, FiChevronRight, FiUser, FiBell, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusColors = {
  planned: '#42a5f5', confirmed: '#66bb6a', ongoing: '#ff9800', completed: '#4caf50', cancelled: '#ef5350',
};
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function GuideDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guideAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  const assignedTrips = data?.assigned_trips || [];
  const todayTrips = data?.todays_pickups || [];

  const statCards = [
    { label: 'Total Trips', value: data?.total_trips || assignedTrips.length, icon: <FiMapPin />, color: 'var(--forest-500)' },
    { label: "Today's Pickups", value: todayTrips.length, icon: <FiCalendar />, color: '#ff9800' },
    { label: 'Active', value: data?.active_trips || 0, icon: <FiClock />, color: 'var(--sky-500)' },
    { label: 'Completed', value: data?.completed_trips || 0, icon: <FiMapPin />, color: '#4caf50' },
  ];

  const quickLinks = [
    { to: '/guide/trips', label: 'My Trips', icon: <FiList />, desc: 'View all assigned trips' },
    { to: '/guide/schedule', label: 'Schedule', icon: <FiCalendar />, desc: 'Upcoming trip timeline' },
    { to: '/guide/notifications', label: 'Notifications', icon: <FiBell />, desc: data?.unread_notifications ? `${data.unread_notifications} unread` : 'All caught up' },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <motion.div variants={fadeUp} style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome{data?.guide_name ? `, ${data.guide_name}` : ''} 👋</h1>
          <p style={{ color: 'var(--text-muted)' }}>Your assigned trips and schedule overview.</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map((s, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                background: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
          {quickLinks.map(ql => (
            <Link key={ql.to} to={ql.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ fontSize: '1.25rem', color: 'var(--forest-500)' }}>{ql.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ql.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ql.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Today's Trips */}
        {todayTrips.length > 0 && (
          <motion.div variants={fadeUp} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#ff9800' }}>🔔 Today's Trips</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todayTrips.map(t => (
                <Link key={t._id} to={`/guide/trips/${t._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '2px solid #ff980030', cursor: 'pointer',
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                        {t.destination_name || 'Trip'}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <FiUser style={{ marginRight: 4 }} />{t.customer_name || 'Customer'} · {t.travelers_count || 1} travelers
                      </div>
                    </div>
                    <FiChevronRight style={{ color: 'var(--text-muted)' }} />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Assigned Trips */}
        <motion.div variants={fadeUp}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Trips</h2>
            {assignedTrips.length > 5 && (
              <Link to="/guide/trips" style={{ fontSize: '0.85rem', color: 'var(--forest-500)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
            )}
          </div>
          {assignedTrips.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <h3 style={{ marginBottom: '0.25rem' }}>No trips assigned</h3>
              <p style={{ color: 'var(--text-muted)' }}>You'll see trips here once admin assigns them to you.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assignedTrips.slice(0, 5).map(t => (
                <Link key={t._id} to={`/guide/trips/${t._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, var(--forest-50), var(--sky-50))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                      }}>🧭</div>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                          {t.destination_name || 'Trip'}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span><FiCalendar style={{ marginRight: 3 }} />{t.start_date ? new Date(t.start_date).toLocaleDateString() : 'N/A'}</span>
                          <span>{t.duration_days || '–'} days</span>
                          <span><FiUser style={{ marginRight: 3 }} />{t.customer_name || ''}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: `${statusColors[t.status] || '#999'}20`, color: statusColors[t.status] || '#999',
                      }}>{t.status}</span>
                      <FiChevronRight style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}
