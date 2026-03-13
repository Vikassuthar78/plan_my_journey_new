import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guideAPI } from '../../services/api';
import { FiSearch, FiCalendar, FiUser, FiMapPin, FiChevronRight, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusColors = {
  planned: '#42a5f5', confirmed: '#66bb6a', ongoing: '#ff9800', completed: '#4caf50', cancelled: '#ef5350',
};

const tabs = ['all', 'ongoing', 'confirmed', 'completed', 'cancelled'];

export default function GuideMyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    guideAPI.getTrips()
      .then(r => setTrips(r.data.trips || []))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = trips.filter(t => {
    const matchTab = activeTab === 'all' || t.status === activeTab;
    const matchSearch = !search || (t.destination_name || '').toLowerCase().includes(search.toLowerCase())
      || (t.customer_name || '').toLowerCase().includes(search.toLowerCase())
      || (t.state || '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    all: trips.length,
    ongoing: trips.filter(t => t.status === 'ongoing').length,
    confirmed: trips.filter(t => t.status === 'confirmed').length,
    completed: trips.filter(t => t.status === 'completed').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>My Trips</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>All trips assigned to you.</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600,
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeTab === tab ? 'var(--forest-500)' : 'var(--bg-secondary)',
                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search by destination or customer..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }} />
        </div>

        {/* Trip List */}
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
            <h3 style={{ marginBottom: '0.25rem' }}>No trips found</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {activeTab !== 'all' ? `No ${activeTab} trips.` : 'No trips have been assigned yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(t => (
              <Link key={t._id} to={`/guide/trips/${t._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '1rem',
                  borderLeft: `4px solid ${statusColors[t.status] || '#999'}`,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                        background: `${statusColors[t.status] || '#999'}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                      }}>🧭</div>
                      <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem', color: 'var(--text-primary)' }}>
                          {t.destination_name || t.state || 'Trip'}
                        </h3>
                        {t.title && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.title}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', paddingLeft: '3.25rem' }}>
                      <span><FiCalendar style={{ marginRight: 3 }} />{t.start_date ? new Date(t.start_date).toLocaleDateString() : 'N/A'}</span>
                      <span><FiClock style={{ marginRight: 3 }} />{t.duration_days || '-'} days</span>
                      <span><FiUser style={{ marginRight: 3 }} />{t.customer_name || 'Customer'}</span>
                      <span><FiMapPin style={{ marginRight: 3 }} />{t.travelers_count || 1} travelers</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                      background: `${statusColors[t.status] || '#999'}15`, color: statusColors[t.status] || '#999',
                      textTransform: 'capitalize',
                    }}>{t.status}</span>
                    <FiChevronRight style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
