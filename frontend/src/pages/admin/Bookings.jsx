import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { FiSearch, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusColors = {
  confirmed: '#66bb6a', pending: '#ff9800', cancelled: '#ef5350', completed: '#4caf50',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = () => {
    setLoading(true);
    adminAPI.getAllBookings()
      .then(r => setBookings(r.data.items || r.data.bookings || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await adminAPI.cancelBooking(id);
      toast.success('Booking cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleRefund = async (id) => {
    if (!confirm('Process refund?')) return;
    try {
      await adminAPI.processRefund(id);
      toast.success('Refund processed');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search || (b.customer_name || '').toLowerCase().includes(search.toLowerCase()) || (b.destination_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Manage Bookings</h1>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Search by customer or destination..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--sand-200)' }}>
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Customer', 'Destination', 'Date', 'Travelers', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found</td></tr>
                ) : filtered.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--sand-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{b.customer_name || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{b.destination_name || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{b.start_date ? new Date(b.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{b.travelers || 1}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{(b.amount || b.total_amount || 0).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: `${statusColors[b.status] || '#999'}20`, color: statusColors[b.status] || '#999',
                      }}>{b.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button className="btn-ghost" title="Cancel" onClick={() => handleCancel(b._id)} style={{ color: '#ef5350', padding: '0.25rem 0.5rem' }}>
                            <FiXCircle />
                          </button>
                        )}
                        {b.status === 'cancelled' && (
                          <button className="btn-ghost" title="Refund" onClick={() => handleRefund(b._id)} style={{ color: '#42a5f5', padding: '0.25rem 0.5rem' }}>
                            <FiRefreshCw />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
