import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { FiSearch, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getGuides()
      .then(r => setGuides(r.data.items || r.data.guides || []))
      .catch(() => toast.error('Failed to load guides'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = guides.filter(g =>
    !search || g.name?.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Guides ({guides.length})</h1>

        <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1rem' }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No guides found</div>
          ) : filtered.map(g => (
            <div key={g._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--forest-400), #ff9800)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700,
                }}>{g.name?.charAt(0) || 'G'}</div>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{g.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><FiMail style={{ marginRight: 4 }} />{g.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                {g.phone && <span><FiPhone style={{ marginRight: 2 }} />{g.phone}</span>}
                <span><FiCalendar style={{ marginRight: 2 }} />Joined {g.created_at ? new Date(g.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-warning">🧭 Guide</span>
                {g.assigned_trips !== undefined && <span className="badge badge-info">{g.assigned_trips || 0} trips assigned</span>}
                {g.rating && <span className="badge badge-success">⭐ {g.rating}</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
