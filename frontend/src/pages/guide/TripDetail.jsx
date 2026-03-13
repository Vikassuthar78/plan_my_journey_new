import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guideAPI } from '../../services/api';
import { FiArrowLeft, FiMapPin, FiCalendar, FiUser, FiClock, FiAlertTriangle, FiPhone, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusColors = {
  planned: '#42a5f5', confirmed: '#66bb6a', ongoing: '#ff9800', completed: '#4caf50', cancelled: '#ef5350',
};

export default function GuideTripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueText, setIssueText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    guideAPI.getTripDetail(id)
      .then(r => {
        setTrip(r.data.trip || r.data);
        setIssues(r.data.issues || []);
      })
      .catch(() => toast.error('Failed to load trip'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      await guideAPI.updateTripStatus(id, status);
      toast.success(`Trip marked as ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!issueText.trim()) return;
    setSubmitting(true);
    try {
      await guideAPI.reportIssue(id, { description: issueText });
      toast.success('Issue reported');
      setIssueText('');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;
  if (!trip) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><h2>Trip not found</h2></div>;

  const attractions = trip.all_attractions || trip.attractions || [];
  const hotels = trip.all_hotels || (trip.hotel ? [trip.hotel] : []);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
      <Link to="/guide/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem' }}>
        <FiArrowLeft /> Back to My Trips
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              {trip.destination_name || 'Trip'}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span><FiCalendar style={{ marginRight: 4 }} />{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A'} – {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}</span>
              <span><FiClock style={{ marginRight: 4 }} />{trip.duration_days || '–'} days</span>
              <span><FiUser style={{ marginRight: 4 }} />{trip.travelers_count || 1} travelers</span>
            </div>
          </div>
          <span style={{
            padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-xl)',
            background: `${statusColors[trip.status] || '#999'}15`, color: statusColors[trip.status] || '#999',
            fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize',
          }}>{trip.status}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Customer Info */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--forest-700)' }}><FiUser style={{ marginRight: 6 }} />Customer</h3>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ margin: 0 }}><strong>Name:</strong> {trip.customer_name || 'N/A'}</p>
              {trip.customer_phone && (
                <p style={{ margin: 0 }}><FiPhone style={{ marginRight: 4, fontSize: '0.8rem' }} />{trip.customer_phone}</p>
              )}
              {trip.customer_email && (
                <p style={{ margin: 0 }}><FiMail style={{ marginRight: 4, fontSize: '0.8rem' }} />{trip.customer_email}</p>
              )}
            </div>
          </div>

          {/* Attractions */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--forest-700)' }}><FiMapPin style={{ marginRight: 6 }} />Attractions ({attractions.length})</h3>
            {attractions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {attractions.map((a, i) => (
                  <div key={i} style={{ fontSize: '0.9rem', padding: '0.4rem 0', borderBottom: '1px solid var(--sand-100)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{a.name || a}</span>
                    {a.city_name && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.city_name}</span>}
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-muted)' }}>No attractions listed</p>}
          </div>

          {/* Hotels */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--forest-700)' }}>🏨 Hotels ({hotels.length})</h3>
            {hotels.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {hotels.map((h, i) => (
                  <div key={i}>
                    <h4 style={{ marginBottom: '0.15rem', fontSize: '0.95rem' }}>{h.name}</h4>
                    {h.address && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{h.address}</p>}
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-muted)' }}>No hotel info</p>}
          </div>
        </div>

        {/* Travelers */}
        {Array.isArray(trip.travelers) && trip.travelers.length > 0 && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--forest-700)' }}><FiUser style={{ marginRight: 6 }} />Travelers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {trip.travelers.map((tr, i) => (
                <div key={i} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', fontSize: '0.9rem' }}>
                  {tr.name || `Traveler ${i + 1}`}{tr.age ? ` (${tr.age})` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {trip.status === 'confirmed' && (
            <button className="btn-primary" onClick={() => handleStatusUpdate('ongoing')}>
              ▶️ Start Trip (Mark Ongoing)
            </button>
          )}
          {trip.status === 'ongoing' && (
            <button className="btn-primary" onClick={() => handleStatusUpdate('completed')} style={{ background: '#4caf50' }}>
              ✅ Mark Completed
            </button>
          )}
        </div>

        {/* Reported Issues */}
        {issues.length > 0 && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '3px solid #ef5350' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ef5350' }}><FiAlertTriangle style={{ marginRight: 6 }} />Reported Issues ({issues.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {issues.map((iss, i) => (
                <div key={i} style={{ padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>{iss.status || 'open'}</span> — {iss.description}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {iss.created_at ? new Date(iss.created_at).toLocaleString() : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Issue */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ef5350' }}><FiAlertTriangle style={{ marginRight: 6 }} />Report Issue</h3>
          <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea rows={3} value={issueText} onChange={e => setIssueText(e.target.value)}
              placeholder="Describe the issue (e.g., road block, hotel problem, weather concern...)"
              style={{ resize: 'vertical' }} />
            <button type="submit" className="btn-secondary" disabled={submitting || !issueText.trim()} style={{ alignSelf: 'flex-start', borderColor: '#ef5350', color: '#ef5350' }}>
              {submitting ? 'Reporting...' : 'Submit Issue'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
