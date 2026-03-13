import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCalendar, FiChevronRight, FiSearch, FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { customerAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  planning: { label: 'Planning', color: '#ffc107', bg: '#fff8e1', icon: FiClock },
  confirmed: { label: 'Confirmed', color: '#43a047', bg: '#e8f5e9', icon: FiCheckCircle },
  in_progress: { label: 'In Progress', color: '#1e88e5', bg: '#e3f2fd', icon: FiMapPin },
  completed: { label: 'Completed', color: '#8e24aa', bg: '#f3e5f5', icon: FiCheckCircle },
  cancelled: { label: 'Cancelled', color: '#ef5350', bg: '#ffebee', icon: FiXCircle },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await customerAPI.getTrips();
        setTrips(res.data.items || []);
      } catch {
        toast.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcomingTrips = trips.filter((t) =>
    ['planning', 'confirmed', 'in_progress'].includes(t.status)
  );
  const pastTrips = trips.filter((t) =>
    ['completed', 'cancelled'].includes(t.status)
  );

  const displayTrips = activeTab === 'upcoming' ? upcomingTrips : pastTrips;
  const filteredTrips = searchQuery
    ? displayTrips.filter((t) =>
        (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.state || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayTrips;

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader" />
        <p>Loading your trips...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a4a25 0%, #2d6a3f 100%)',
        padding: '2rem 1.5rem', borderRadius: '0 0 28px 28px',
      }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 0.5rem 0' }}>My Trips</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
            {trips.length} trips • {upcomingTrips.length} upcoming
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '1.5rem' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.5rem', background: 'var(--sand-100)',
          borderRadius: '14px', padding: '0.3rem', marginBottom: '1.25rem',
        }}>
          {[
            { id: 'upcoming', label: 'Upcoming', count: upcomingTrips.length },
            { id: 'past', label: 'Past', count: pastTrips.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '0.7rem', borderRadius: '12px', border: 'none',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                color: activeTab === tab.id ? 'var(--forest-700)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.8rem', borderRadius: '14px' }}
          />
        </div>

        {/* Trip Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
          >
            {filteredTrips.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                style={{
                  textAlign: 'center', padding: '3rem 1.5rem',
                  background: '#fff', borderRadius: '20px',
                  border: '1px solid var(--sand-200)',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {activeTab === 'upcoming' ? '🗺️' : '📚'}
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>
                  {activeTab === 'upcoming' ? 'No upcoming trips' : 'No past trips'}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {activeTab === 'upcoming'
                    ? 'Start planning your next adventure!'
                    : 'Your completed trips will appear here'}
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => navigate('/journey/new')}
                    className="btn-primary"
                    style={{ borderRadius: '14px' }}
                  >
                    <FiPlus /> Plan a Journey
                  </button>
                )}
              </motion.div>
            ) : (
              filteredTrips.map((trip, i) => {
                const statusConf = STATUS_CONFIG[trip.status] || STATUS_CONFIG.planning;
                const StatusIcon = statusConf.icon;
                return (
                  <motion.div
                    key={trip._id || i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/trips/${trip._id}`)}
                    style={{
                      background: '#fff', borderRadius: '18px', padding: '1.2rem',
                      cursor: 'pointer', border: '1px solid var(--sand-200)',
                      boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem 0' }}>
                          {trip.title || 'My Trip'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <FiMapPin style={{ fontSize: '0.75rem' }} />
                          {trip.state || trip.cities?.map((c) => c.name || c).join(', ') || 'Multiple cities'}
                        </div>
                      </div>
                      <span style={{
                        background: statusConf.bg, color: statusConf.color,
                        padding: '0.25rem 0.7rem', borderRadius: '10px',
                        fontSize: '0.72rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                      }}>
                        <StatusIcon style={{ fontSize: '0.7rem' }} />
                        {statusConf.label}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: '0.75rem', paddingTop: '0.75rem',
                      borderTop: '1px solid var(--sand-100)',
                    }}>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiCalendar />
                          {trip.start_date
                            ? new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Date TBD'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiMapPin /> {trip.cities?.length || 0} cities
                        </span>
                      </div>
                      <FiChevronRight style={{ color: 'var(--text-muted)' }} />
                    </div>

                    {/* Resume planning CTA for planning status */}
                    {trip.status === 'planning' && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/journey/new`, { state: { resumeTripId: trip._id } }); }}
                          style={{
                            width: '100%', padding: '0.6rem', borderRadius: '12px',
                            background: 'var(--forest-50)', border: '1px solid var(--forest-200)',
                            color: 'var(--forest-700)', fontWeight: 600, fontSize: '0.82rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                          }}
                        >
                          <FiChevronRight /> Resume Planning
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/journey/new')}
        style={{
          position: 'fixed', bottom: '24px', right: '20px',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2d6a3f, #388e3c)',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(56,142,60,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 40, fontSize: '1.5rem',
        }}
      >
        <FiPlus />
      </motion.button>
    </div>
  );
}
