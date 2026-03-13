import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiMap, FiHome, FiSettings, FiUsers, FiCompass, FiGrid, FiInfo, FiMail } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = user ? (
    user.role === 'admin' ? [
      { to: '/admin', label: 'Dashboard', icon: <FiHome /> },
      { to: '/admin/bookings', label: 'Bookings', icon: <FiMap /> },
      { to: '/admin/customers', label: 'Customers', icon: <FiUsers /> },
      { to: '/admin/guides', label: 'Guides', icon: <FiCompass /> },
      { to: '/admin/trips', label: 'Trips', icon: <FiMap /> },
      { to: '/admin/destinations', label: 'Destinations', icon: <FiSettings /> },
    ] : user.role === 'guide' ? [
      { to: '/guide', label: 'Dashboard', icon: <FiHome /> },
      { to: '/guide/trips', label: 'My Trips', icon: <FiMap /> },
      { to: '/guide/schedule', label: 'Schedule', icon: <FiGrid /> },
      { to: '/guide/notifications', label: 'Alerts', icon: <FiCompass /> },
    ] : [
      { to: '/dashboard', label: 'Home', icon: <FiHome /> },
      { to: '/journey/new', label: 'Plan Journey', icon: <FiCompass /> },
      { to: '/my-trips', label: 'My Trips', icon: <FiMap /> },
      { to: '/about', label: 'About Us', icon: <FiInfo /> },
      { to: '/contact', label: 'Contact', icon: <FiMail /> },
      { to: '/profile', label: 'Profile', icon: <FiUser /> },
    ]
  ) : [
    { to: '/about', label: 'About Us', icon: <FiInfo /> },
    { to: '/contact', label: 'Contact', icon: <FiMail /> },
  ];

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.97)',
      borderBottom: '1px solid rgba(76,175,80,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 1rem',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        gap: '0.5rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          color: 'var(--forest-700)',
          flexShrink: 0,
          minWidth: 0,
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--forest-500), var(--sky-500))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(56,142,60,0.3)',
            flexShrink: 0,
          }}>
            🌿
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', fontWeight: 700, display: 'block', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
              Plan My Journey
            </span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Travel Planner
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: isActive(link.to) ? 600 : 500,
              color: isActive(link.to) ? 'var(--forest-600)' : 'var(--text-secondary)',
              background: isActive(link.to) ? 'var(--forest-50)' : 'transparent',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              position: 'relative',
            }}>
              {link.icon} {link.label}
              {isActive(link.to) && (
                <motion.div
                  layoutId="navIndicator"
                  style={{
                    position: 'absolute', bottom: '-2px', left: '20%', right: '20%',
                    height: '2px', borderRadius: '2px', background: 'var(--forest-500)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}

          {user && (
            <>
              <div style={{ width: '1px', height: '24px', background: 'var(--sand-200)', margin: '0 0.5rem' }} />
              <button onClick={logout} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '12px',
                fontSize: '0.88rem', background: 'transparent',
                color: 'var(--text-muted)', border: 'none', cursor: 'pointer',
                fontWeight: 500, transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef5350'; e.currentTarget.style.background = '#ffebee'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <FiLogOut /> Logout
              </button>
            </>
          )}
          {!user && (
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <Link to="/login">
                <button style={{
                  padding: '0.5rem 1.25rem', borderRadius: '12px',
                  background: 'transparent', border: '2px solid var(--forest-200)',
                  color: 'var(--forest-700)', fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.88rem', transition: 'all 0.2s',
                }}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', fontSize: '0.88rem' }}>
                  Sign Up Free
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="hide-desktop" onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: menuOpen ? 'var(--forest-50)' : 'rgba(0,0,0,0.05)',
            border: '2px solid var(--forest-200)',
            borderRadius: '12px',
            width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--forest-700)', fontSize: '1.4rem', cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="hide-desktop"
            style={{
              overflow: 'hidden',
              borderTop: '1px solid var(--sand-200)',
              paddingBottom: '1rem',
            }}
          >
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                color: isActive(link.to) ? 'var(--forest-600)' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'var(--forest-50)' : 'transparent',
                fontWeight: isActive(link.to) ? 600 : 500,
                textDecoration: 'none', margin: '0.1rem 0',
              }}>
                {link.icon} {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.85rem 1rem', marginTop: '0.25rem',
                width: '100%', borderRadius: '12px',
                background: '#ffebee', border: 'none',
                color: '#ef5350', fontWeight: 600,
                textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem',
              }}>
                <FiLogOut /> Logout
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem 0' }}>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <button className="btn-secondary" style={{ width: '100%', borderRadius: '12px' }}>Login</button>
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  <button className="btn-primary" style={{ width: '100%', borderRadius: '12px' }}>Sign Up Free</button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
