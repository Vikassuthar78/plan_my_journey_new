import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await login(email, password); }
    catch { /* toast handled in context */ }
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
      background: 'linear-gradient(160deg, #e8f5e9 0%, #e3f2fd 50%, #fff8e1 100%)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 3.5vw, 2.5rem)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(76,175,80,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌿</div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Login to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {inputGroup(<FiMail />,
            <input
              type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)} required
              style={{ paddingLeft: '3rem' }}
            />
          )}
          {inputGroup(<FiLock />,
            <>
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
              }}>
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}>
            {loading ? <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Login <FiArrowRight /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ fontWeight: 600, color: 'var(--forest-600)' }}>Sign up</Link>
        </div>

        {/* Demo credentials
        <div style={{
          marginTop: '1.5rem', padding: '1rem',
          background: 'var(--forest-50)', borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem', color: 'var(--text-secondary)',
        }}>
          <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--forest-700)' }}>Demo Accounts:</strong>
          <div>Customer: vikas@example.com / Customer@123</div>
          <div>Admin: admin@planmyjourney.com / Admin@123</div>
          <div>Guide: rajesh@guide.com / Guide@1234</div>
        </div> */}
      </motion.div>
    </div>
  );
}
