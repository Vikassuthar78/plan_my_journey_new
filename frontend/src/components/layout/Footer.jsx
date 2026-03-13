import { Link } from 'react-router-dom';
import { FiHeart, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--forest-900)',
      color: 'var(--forest-200)',
      padding: '3rem 1.5rem 1.5rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌿</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              Plan My Journey
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--forest-300)' }}>
            Discover the world with personalized journeys crafted just for you. Let nature guide your next adventure.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Plan Journey', to: '/journey/new' },
              { label: 'Contact', to: '/contact' },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ color: 'var(--forest-300)', fontSize: '0.85rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)' }}>Contact</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMail size={14} /> hello@planmyjourney.com</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMapPin size={14} /> India</span>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        marginTop: '2rem',
        paddingTop: '1rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--forest-300)',
      }}>
        Made with <FiHeart size={12} style={{ color: 'var(--sunset-500)', verticalAlign: 'middle' }} /> by Plan My Journey Team — © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
