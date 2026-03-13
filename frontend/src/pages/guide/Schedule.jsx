import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guideAPI } from '../../services/api';
import { FiCalendar, FiClock, FiUser, FiMapPin, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusColors = {
  planned: '#42a5f5', confirmed: '#66bb6a', ongoing: '#ff9800', completed: '#4caf50',
};

export default function GuideSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guideAPI.getSchedule()
      .then(r => setSchedule(r.data.schedule || []))
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  // Group by month
  const grouped = {};
  schedule.forEach(t => {
    const date = t.start_date ? new Date(t.start_date) : new Date();
    const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>My Schedule</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your upcoming and active trips timeline.</p>

        {schedule.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📅</div>
            <h3 style={{ marginBottom: '0.25rem' }}>No upcoming trips</h3>
            <p style={{ color: 'var(--text-muted)' }}>Your schedule will appear here once trips are assigned.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, trips]) => (
            <div key={month} style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.1rem', fontWeight: 700, color: 'var(--forest-600)',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <FiCalendar /> {month}
              </h2>

              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute', left: '0.6rem', top: 0, bottom: 0, width: '2px',
                  background: 'linear-gradient(to bottom, var(--forest-200), var(--sand-200))',
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {trips.map(t => {
                    const startDate = t.start_date ? new Date(t.start_date) : null;
                    const isToday = t.start_date && t.start_date.startsWith(today);
                    const isPast = startDate && startDate < new Date() && !isToday;

                    return (
                      <Link key={t._id} to={`/guide/trips/${t._id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ position: 'relative' }}>
                          {/* Timeline dot */}
                          <div style={{
                            position: 'absolute', left: '-1.65rem', top: '1.25rem',
                            width: 14, height: 14, borderRadius: '50%',
                            background: isToday ? '#ff9800' : t.status === 'ongoing' ? '#ff9800' : statusColors[t.status] || '#ccc',
                            border: '3px solid #fff',
                            boxShadow: isToday ? '0 0 0 3px #ff980040' : 'none',
                            zIndex: 1,
                          }} />

                          <div className="card" style={{
                            padding: '1.25rem', cursor: 'pointer',
                            opacity: isPast && t.status !== 'ongoing' ? 0.7 : 1,
                            border: isToday ? '2px solid #ff980050' : t.status === 'ongoing' ? '2px solid #ff980030' : 'none',
                            transition: 'transform 0.15s',
                          }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                              <div style={{ flex: 1, minWidth: '180px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                  {isToday && (
                                    <span style={{
                                      padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.65rem',
                                      fontWeight: 700, background: '#ff9800', color: '#fff',
                                    }}>TODAY</span>
                                  )}
                                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                                    {t.destination_name || t.state || 'Trip'}
                                  </h3>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                  <span>
                                    <FiCalendar style={{ marginRight: 3 }} />
                                    {startDate ? startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                                    {t.end_date && ` — ${new Date(t.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                  </span>
                                  <span><FiClock style={{ marginRight: 3 }} />{t.duration_days || '-'} days</span>
                                  <span><FiUser style={{ marginRight: 3 }} />{t.customer_name || 'Customer'}</span>
                                  <span><FiMapPin style={{ marginRight: 3 }} />{t.travelers_count || 1} travelers</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                                  background: `${statusColors[t.status] || '#999'}15`, color: statusColors[t.status] || '#999',
                                  textTransform: 'capitalize',
                                }}>{t.status}</span>
                                <FiChevronRight style={{ color: 'var(--text-muted)' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
