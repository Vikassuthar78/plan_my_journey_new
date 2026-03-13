import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await signup(form); }
    catch { /* toast handled */ }
    finally { setLoading(false); }
  };

  const inputGroup = (icon, children) => (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }}>{icon}</span>
      {children}
    </div>
  );

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(160deg, #e3f2fd 0%, #e8f5e9 50%, #fff8e1 100%)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: '440px',
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 3.5vw, 2.5rem)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(76,175,80,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱</div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Begin your next adventure today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {inputGroup(<FiUser />,
            <input type="text" placeholder="Full Name" value={form.name}
              onChange={e => update('name', e.target.value)} required style={{ paddingLeft: '3rem' }} />
          )}
          {inputGroup(<FiMail />,
            <input type="email" placeholder="Email address" value={form.email}
              onChange={e => update('email', e.target.value)} required style={{ paddingLeft: '3rem' }} />
          )}
          {inputGroup(<FiPhone />,
            <input type="tel" placeholder="Phone (optional)" value={form.phone}
              onChange={e => update('phone', e.target.value)} style={{ paddingLeft: '3rem' }} />
          )}
          {inputGroup(<FiLock />,
            <>
              <input type={showPw ? 'text' : 'password'} placeholder="Password (8+ chars, A-z, 0-9)" value={form.password}
                onChange={e => update('password', e.target.value)} required
                style={{ paddingLeft: '3rem', paddingRight: '3rem' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
              }}>
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </>
          )}

          <div>
            <label style={{ marginBottom: '0.5rem' }}>I am a:</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['customer', 'guide'].map(r => (
                <button key={r} type="button" onClick={() => update('role', r)}
                  style={{
                    flex: 1, padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${form.role === r ? 'var(--forest-500)' : 'var(--sand-200)'}`,
                    background: form.role === r ? 'var(--forest-50)' : 'white',
                    color: form.role === r ? 'var(--forest-700)' : 'var(--text-muted)',
                    fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}>
                  {r === 'customer' ? '🧳 Traveler' : '🧭 Guide'}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}>
            {loading ? <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Create Account <FiArrowRight /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--forest-600)' }}>Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
