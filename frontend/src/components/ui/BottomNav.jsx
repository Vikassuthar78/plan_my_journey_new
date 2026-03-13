import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiMap, FiCompass, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/dashboard', icon: FiHome, label: 'Home' },
  { to: '/my-trips', icon: FiMap, label: 'Trips' },
  { to: '/journey/new', icon: FiCompass, label: 'Explore' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();

  // Hide on certain routes
  const hideOn = ['/login', '/signup', '/'];
  if (hideOn.includes(location.pathname)) return null;
  // Hide on admin / guide routes
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/guide')) return null;
  // Hide on booking confirmation
  if (location.pathname.includes('/booking/confirmation')) return null;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.97)',
      borderTop: '1px solid var(--sand-200)',
      padding: '0.4rem 0 env(safe-area-inset-bottom, 0.4rem) 0',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.to ||
          (item.to === '/dashboard' && location.pathname.startsWith('/dashboard'));

        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.15rem', textDecoration: 'none', padding: '0.35rem 0.75rem',
              borderRadius: '12px', transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="bottomNav"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--forest-50)',
                  borderRadius: '12px',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <item.icon style={{
              fontSize: '1.25rem',
              color: isActive ? 'var(--forest-600)' : 'var(--text-muted)',
              transition: 'color 0.2s',
              position: 'relative', zIndex: 1,
            }} />
            <span style={{
              fontSize: '0.65rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--forest-600)' : 'var(--text-muted)',
              position: 'relative', zIndex: 1,
            }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="bottomDot"
                style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: 'var(--forest-500)', position: 'relative', zIndex: 1,
                }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
