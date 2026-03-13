import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { FiSearch, FiUserPlus, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusColors = {
  planned: '#42a5f5', confirmed: '#66bb6a', ongoing: '#ff9800', completed: '#4caf50', cancelled: '#ef5350',
};

export default function AdminTrips() {
  const [trips, setTrips] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignModal, setAssignModal] = useState(null); // trip_id to assign guide

  const load = () => {
    setLoading(true);
    Promise.all([adminAPI.getAllTrips(), adminAPI.getGuides()])
      .then(([tripsRes, guidesRes]) => {
        setTrips(tripsRes.data.items || tripsRes.data.trips || []);
        setGuides(guidesRes.data.items || guidesRes.data.guides || []);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAssignGuide = async (tripId, guideId) => {
    try {
      await adminAPI.assignGuide(tripId, guideId);
      toast.success('Guide assigned!');
      setAssignModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleStatusChange = async (tripId, status) => {
    try {
      await adminAPI.updateTripStatus(tripId, status);
      toast.success(`Status updated to ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const filtered = trips.filter(t => {
    const matchSearch = !search || (t.customer_name || '').toLowerCase().includes(search.toLowerCase()) || (t.destination_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Manage Trips ({trips.length})</h1>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--sand-200)' }}>
            <option value="all">All Status</option>
            {['planned', 'confirmed', 'ongoing', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Customer', 'Destination', 'Start Date', 'Duration', 'Guide', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No trips found</td></tr>
                ) : filtered.map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid var(--sand-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{t.customer_name || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{t.destination_name || t.city_name || t.state || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{t.start_date ? new Date(t.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{t.duration_days || t.travelers_count || '-'} days</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{t.guide_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: `${statusColors[t.status] || '#999'}20`, color: statusColors[t.status] || '#999',
                      }}>{t.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {!t.guide_id && t.status !== 'cancelled' && (
                          <button className="btn-ghost" title="Assign Guide" onClick={() => setAssignModal(t._id)} style={{ color: 'var(--forest-600)', padding: '0.25rem 0.5rem' }}>
                            <FiUserPlus />
                          </button>
                        )}
                        {t.status !== 'cancelled' && t.status !== 'completed' && (
                          <select onChange={e => e.target.value && handleStatusChange(t._id, e.target.value)} defaultValue=""
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sand-200)' }}>
                            <option value="" disabled>Change...</option>
                            {['confirmed', 'ongoing', 'completed', 'cancelled'].filter(s => s !== t.status).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Guide Modal */}
        {assignModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }} onClick={() => setAssignModal(null)}>
            <div className="card" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: '1rem' }}>Assign a Guide</h3>
              {guides.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No guides available</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {guides.map(g => (
                    <div key={g._id} onClick={() => handleAssignGuide(assignModal, g._id)}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--sand-200)', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--forest-400)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--sand-200)'}>
                      <h4 style={{ marginBottom: '0.15rem' }}>{g.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{g.email}</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-secondary" onClick={() => setAssignModal(null)} style={{ marginTop: '1rem', width: '100%' }}>Cancel</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
