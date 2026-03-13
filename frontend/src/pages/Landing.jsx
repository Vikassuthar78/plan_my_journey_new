import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiShield, FiArrowRight, FiStar, FiUsers, FiGlobe } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const features = [
  { icon: <FiMapPin size={28} />, title: 'Smart Planning', desc: 'Step-by-step journey builder with AI-powered itineraries tailored to you.' },
  { icon: <FiCalendar size={28} />, title: 'Day-wise Itinerary', desc: 'Detailed plans for every day — attractions, meals, transport, and stays.' },
  { icon: <FiShield size={28} />, title: 'Secure Booking', desc: 'Safe payments, instant confirmations, and dedicated travel guides.' },
  { icon: <FiGlobe size={28} />, title: 'Explore India', desc: 'Discover 100+ destinations across India with curated experiences.' },
  { icon: <FiUsers size={28} />, title: 'Expert Guides', desc: 'Professional local guides assigned to make your journey memorable.' },
  { icon: <FiStar size={28} />, title: 'Premium Hotels', desc: 'Handpicked accommodations from budget to luxury, all verified.' },
];

const destinations = [
  { name: 'Rajasthan', tag: 'Heritage', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=500&h=350&fit=crop', color: '#ff7043' },
  { name: 'Kerala', tag: 'Nature', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&h=350&fit=crop', color: '#4caf50' },
  { name: 'Goa', tag: 'Beach', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&h=350&fit=crop', color: '#42a5f5' },
  { name: 'Himachal', tag: 'Mountains', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500&h=350&fit=crop', color: '#7e57c2' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #e8f5e9 0%, #e3f2fd 40%, #fff3e0 80%, #fce4ec 100%)',
        padding: '2rem 1.5rem',
      }}>
        {/* Static gradient overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 30% 30%, rgba(76,175,80,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(30,136,229,0.08) 0%, transparent 50%)',
        }} />

        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          style={{ textAlign: 'center', maxWidth: '800px', position: 'relative', zIndex: 1 }}
        >
          <motion.div variants={fadeUp} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(76,175,80,0.1)', padding: '0.5rem 1.25rem',
            borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600,
            color: 'var(--forest-700)', marginBottom: '1.5rem',
          }}>
            🌿 India's Smartest Travel Planner
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--forest-900)',
            marginBottom: '1.5rem',
          }}>
            Your Next <span style={{
              background: 'linear-gradient(135deg, var(--forest-500), var(--sky-500))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Adventure</span> Starts Here
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Design personalized trips step by step. Choose destinations, attractions, hotels — and let us craft the perfect itinerary for you.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup">
              <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                Start Planning <FiArrowRight />
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                Login
              </button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} style={{
            display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem',
            flexWrap: 'wrap',
          }}>
            {[{ n: '500+', l: 'Destinations' }, { n: '10K+', l: 'Happy Travelers' }, { n: '200+', l: 'Expert Guides' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--forest-700)' }}>{s.n}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <motion.h2 variants={fadeUp} style={{ marginBottom: '0.75rem' }}>Why Plan My Journey?</motion.h2>
            <motion.p variants={fadeUp} style={{ maxWidth: '500px', margin: '0 auto' }}>Everything you need for the perfect trip, in one beautiful platform.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="card" style={{ padding: '2rem', cursor: 'default' }}>
                <div style={{
                  width: 56, height: 56,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--forest-50), var(--sky-100))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--forest-600)',
                  marginBottom: '1rem',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <motion.h2 variants={fadeUp}>Popular Destinations</motion.h2>
            <motion.p variants={fadeUp} style={{ maxWidth: '500px', margin: '0.75rem auto 0' }}>Handpicked places that every traveler must experience</motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}
          >
            {destinations.map((d, i) => (
              <motion.div key={i} variants={fadeUp} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img src={d.img} alt={d.name} style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.target.style.transform = 'scale(1)'}
                  loading="lazy"
                  />
                  <span style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: d.color, color: '#fff',
                    padding: '0.25rem 0.75rem', borderRadius: '999px',
                    fontSize: '0.75rem', fontWeight: 600,
                  }}>{d.tag}</span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', fontFamily: 'var(--font-sans)' }}>{d.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Explore now →</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, var(--forest-800), var(--forest-900))',
        textAlign: 'center',
        color: '#fff',
      }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <motion.h2 variants={fadeUp} style={{ color: '#fff', marginBottom: '1rem' }}>Ready to Start Your Journey?</motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--forest-200)', marginBottom: '2rem' }}>
            Join thousands of travelers who plan their perfect trips with us. It only takes a minute to get started.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link to="/signup">
              <button style={{
                background: 'linear-gradient(135deg, var(--forest-400), var(--sky-400))',
                color: '#fff',
                padding: '1rem 3rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-xl)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(76,175,80,0.3)',
                transition: 'all 0.3s ease',
              }}>
                Create Free Account <FiArrowRight />
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
