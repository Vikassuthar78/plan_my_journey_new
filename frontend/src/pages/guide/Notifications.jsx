import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guideAPI } from '../../services/api';
import { FiBell, FiCheck, FiCheckCircle, FiAlertTriangle, FiMap, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const iconMap = {
  trip_assignment: { icon: <FiMap />, color: 'var(--forest-500)', bg: 'var(--forest-50)' },
  trip_status_update: { icon: <FiInfo />, color: 'var(--sky-500)', bg: 'var(--sky-50)' },
  issue_reported: { icon: <FiAlertTriangle />, color: '#ef5350', bg: '#fef2f2' },
  default: { icon: <FiBell />, color: '#ff9800', bg: '#fff8e1' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function GuideNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    guideAPI.getNotifications()
      .then(r => setNotifications(r.data.notifications || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const unread = notifications.filter(n => !n.read);

  const markAllRead = async () => {
    try {
      await guideAPI.markNotificationsRead();
      toast.success('All marked as read');
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '700px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Notifications</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {unread.length > 0 ? `${unread.length} unread` : 'All caught up!'}
            </p>
          </div>
          {unread.length > 0 && (
            <button className="btn-secondary" onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <FiCheckCircle /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔔</div>
            <h3 style={{ marginBottom: '0.25rem' }}>No notifications</h3>
            <p style={{ color: 'var(--text-muted)' }}>You'll be notified about trip assignments and updates.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.map(n => {
              const style = iconMap[n.type] || iconMap.default;
              return (
                <div key={n._id} className="card" style={{
                  padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  background: n.read ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  borderLeft: n.read ? 'none' : `3px solid ${style.color}`,
                  opacity: n.read ? 0.75 : 1,
                  transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: style.bg, color: style.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  }}>{style.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {n.message}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                      <span>{timeAgo(n.created_at)}</span>
                      {n.trip_id && (
                        <Link to={`/guide/trips/${n.trip_id}`} style={{ color: 'var(--forest-500)', textDecoration: 'none', fontWeight: 600 }}>
                          View Trip →
                        </Link>
                      )}
                      {!n.read && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: style.color }} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
