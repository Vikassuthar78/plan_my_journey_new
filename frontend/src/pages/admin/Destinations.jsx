import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const tabs = ['States', 'Cities', 'Attractions', 'Hotels'];

export default function AdminDestinations() {
  const [tab, setTab] = useState('States');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', data: {} }
  const [saving, setSaving] = useState(false);

  // Relations
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case 'States':
          res = await adminAPI.getDestinations();
          setItems(res.data.destinations || res.data.states || []);
          break;
        case 'Cities':
          res = await adminAPI.getCities();
          setItems(res.data.cities || []);
          break;
        case 'Attractions':
          res = await adminAPI.getAttractions();
          setItems(res.data.attractions || []);
          break;
        case 'Hotels':
          res = await adminAPI.getHotels();
          setItems(res.data.hotels || []);
          break;
      }
      // Load relations for dropdowns
      if (tab !== 'States') {
        const stRes = await adminAPI.getDestinations();
        setStates(stRes.data.destinations || stRes.data.states || []);
      }
      if (tab === 'Attractions' || tab === 'Hotels') {
        const cityRes = await adminAPI.getCities();
        setCities(cityRes.data.cities || []);
      }
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const d = modal.data;
      if (modal.mode === 'add') {
        switch (tab) {
          case 'States': await adminAPI.createDestination(d); break;
          case 'Cities': await adminAPI.createCity(d); break;
          case 'Attractions': await adminAPI.createAttraction(d); break;
          case 'Hotels': await adminAPI.createHotel(d); break;
        }
        toast.success(`${tab.slice(0, -1)} added!`);
      } else {
        switch (tab) {
          case 'States': await adminAPI.updateDestination(d._id, d); break;
          case 'Cities': await adminAPI.updateCity(d._id, d); break;
          case 'Attractions': await adminAPI.updateAttraction(d._id, d); break;
          case 'Hotels': await adminAPI.updateHotel(d._id, d); break;
        }
        toast.success('Updated!');
      }
      setModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      switch (tab) {
        case 'States': await adminAPI.deleteDestination(id); break;
        case 'Cities': await adminAPI.deleteCity(id); break;
        case 'Attractions': await adminAPI.deleteAttraction(id); break;
        case 'Hotels': await adminAPI.deleteHotel(id); break;
      }
      toast.success('Deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const updateModal = (field, value) => setModal(m => ({ ...m, data: { ...m.data, [field]: value } }));

  const defaultItem = () => {
    switch (tab) {
      case 'States': return { name: '', description: '', image_url: '' };
      case 'Cities': return { name: '', description: '', state_id: '', image_url: '' };
      case 'Attractions': return { name: '', description: '', city_id: '', entry_fee: 0, category: 'historical', image_url: '' };
      case 'Hotels': return { name: '', address: '', city_id: '', price_per_night: 0, rating: 4, category: 'standard', amenities: '' };
      default: return {};
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>Manage Destinations</h1>
          <button className="btn-primary" onClick={() => setModal({ mode: 'add', data: defaultItem() })}>
            <FiPlus /> Add {tab.slice(0, -1)}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-xl)', border: 'none',
                background: tab === t ? 'var(--forest-500)' : 'var(--sand-100)',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
              }}>{t}</button>
          ))}
        </div>

        {/* Items grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
          {items.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No {tab.toLowerCase()} found. Add one!</div>
          ) : items.map(item => (
            <div key={item._id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem' }}>{item.name}</h3>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn-ghost" onClick={() => setModal({ mode: 'edit', data: { ...item } })} style={{ padding: '0.25rem' }}><FiEdit2 size={14} /></button>
                  <button className="btn-ghost" onClick={() => handleDelete(item._id)} style={{ padding: '0.25rem', color: '#ef5350' }}><FiTrash2 size={14} /></button>
                </div>
              </div>
              {item.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{item.description?.slice(0, 100)}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {item.category && <span className="badge">{item.category}</span>}
                {item.entry_fee > 0 && <span className="badge badge-info">₹{item.entry_fee}</span>}
                {item.price_per_night > 0 && <span className="badge badge-success">₹{item.price_per_night}/night</span>}
                {item.rating && <span className="badge badge-warning">⭐ {item.rating}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {modal && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }} onClick={() => setModal(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="card" style={{ padding: '2rem', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>{modal.mode === 'add' ? 'Add' : 'Edit'} {tab.slice(0, -1)}</h3>
                  <button className="btn-ghost" onClick={() => setModal(null)}><FiX /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Name</label>
                    <input type="text" value={modal.data.name || ''} onChange={e => updateModal('name', e.target.value)} required />
                  </div>
                  <div>
                    <label>Description</label>
                    <textarea rows={3} value={modal.data.description || ''} onChange={e => updateModal('description', e.target.value)} style={{ resize: 'vertical' }} />
                  </div>

                  {(tab === 'Cities') && (
                    <div>
                      <label>State</label>
                      <select value={modal.data.state_id || ''} onChange={e => updateModal('state_id', e.target.value)}>
                        <option value="">Select state...</option>
                        {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}

                  {(tab === 'Attractions' || tab === 'Hotels') && (
                    <div>
                      <label>City</label>
                      <select value={modal.data.city_id || ''} onChange={e => updateModal('city_id', e.target.value)}>
                        <option value="">Select city...</option>
                        {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {tab === 'Attractions' && (
                    <>
                      <div>
                        <label>Entry Fee (₹)</label>
                        <input type="number" min={0} value={modal.data.entry_fee || 0} onChange={e => updateModal('entry_fee', Number(e.target.value))} />
                      </div>
                      <div>
                        <label>Category</label>
                        <select value={modal.data.category || ''} onChange={e => updateModal('category', e.target.value)}>
                          {['historical', 'nature', 'religious', 'adventure', 'cultural', 'beach', 'wildlife'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {tab === 'Hotels' && (
                    <>
                      <div>
                        <label>Address</label>
                        <input type="text" value={modal.data.address || ''} onChange={e => updateModal('address', e.target.value)} />
                      </div>
                      <div>
                        <label>Price per Night (₹)</label>
                        <input type="number" min={0} value={modal.data.price_per_night || 0} onChange={e => updateModal('price_per_night', Number(e.target.value))} />
                      </div>
                      <div>
                        <label>Rating</label>
                        <input type="number" min={1} max={5} step={0.1} value={modal.data.rating || 4} onChange={e => updateModal('rating', Number(e.target.value))} />
                      </div>
                      <div>
                        <label>Category</label>
                        <select value={modal.data.category || ''} onChange={e => updateModal('category', e.target.value)}>
                          {['budget', 'standard', 'premium', 'luxury'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                      {saving ? 'Saving...' : <><FiSave /> Save</>}
                    </button>
                    <button className="btn-secondary" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
