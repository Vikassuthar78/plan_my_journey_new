import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMapPin, FiUsers, FiStar, FiHeart, FiGlobe, FiAward, FiShield, FiTarget } from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const TEAM = [
  { name: 'Vikas Suthar', role: 'Founder & CEO', emoji: '👨‍💼', bio: 'Passionate traveler with a vision to make journey planning effortless for everyone.' },
  { name: 'Priya Sharma', role: 'Head of Operations', emoji: '👩‍💻', bio: 'Ensures every trip runs smoothly from start to finish.' },
  { name: 'Arjun Patel', role: 'Lead Developer', emoji: '👨‍🔧', bio: 'Building the tech that powers your perfect travel experience.' },
  { name: 'Neha Gupta', role: 'Travel Expert', emoji: '🧭', bio: 'Curates the best destinations and hidden gems across India.' },
];

const VALUES = [
  { icon: <FiHeart />, title: 'Passion for Travel', desc: 'We live and breathe travel. Every feature we build is inspired by real journeys.', color: '#ef5350', bg: '#ffebee' },
  { icon: <FiShield />, title: 'Trust & Safety', desc: 'Your safety is our priority. Verified guides, secure payments, 24/7 support.', color: '#42a5f5', bg: '#e3f2fd' },
  { icon: <FiTarget />, title: 'Personalization', desc: 'No two travelers are alike. We tailor every itinerary to your preferences.', color: '#66bb6a', bg: '#e8f5e9' },
  { icon: <FiAward />, title: 'Excellence', desc: 'We partner with the best hotels, transport, and local guides for quality experiences.', color: '#ff9800', bg: '#fff3e0' },
];

const STATS = [
  { value: '10,000+', label: 'Happy Travelers', icon: <FiUsers /> },
  { value: '500+', label: 'Destinations', icon: <FiMapPin /> },
  { value: '4.9', label: 'Average Rating', icon: <FiStar /> },
  { value: '28', label: 'States Covered', icon: <FiGlobe /> },
];

export default function AboutUs() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ══════ Hero ══════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0a2818 0%, #14432a 35%, #143350 75%, #0d1b2a 100%)',
        padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(76,175,80,0.12),transparent 70%)', top: '-80px', right: '-80px' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(30,136,229,0.08),transparent 70%)', bottom: '-60px', left: '-40px' }} />

        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto' }}>
          <motion.div variants={fadeUp} style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</motion.div>
          <motion.h1 variants={fadeUp} style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            About Plan My Journey
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 580, margin: '0 auto' }}>
            We're on a mission to make travel planning in India effortless, personalized, and delightful. 
            From royal Rajasthan to serene Kerala — we help you discover, plan, and experience incredible journeys.
          </motion.p>
        </motion.div>
      </section>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>

        {/* ── Stats ── */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px),1fr))', gap: '1.25rem', marginBottom: '4rem', marginTop: '-3rem' }}
        >
          {STATS.map((s, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}
              className="card glass"
              style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid var(--forest-400)' }}
            >
              <div style={{ color: 'var(--forest-500)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--forest-700)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Our Story ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ marginBottom: '4rem' }}>
          <motion.div variants={fadeUp} className="section-header" style={{ justifyContent: 'center' }}>
            <h3>📖 Our Story</h3>
          </motion.div>
          <motion.div variants={fadeUp} className="card" style={{ padding: '2.5rem', maxWidth: 800, margin: '0 auto', lineHeight: 1.9, fontSize: '1rem', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Plan My Journey</strong> was born from a simple frustration — planning a trip across India shouldn't require dozens of tabs, phone calls, and spreadsheets.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Founded in 2024, we set out to create a platform where travelers can seamlessly choose their state, pick cities, select attractions, book transport and hotels — all in one beautiful, step-by-step journey builder.
            </p>
            <p>
              Whether you're a solo backpacker exploring Ladakh or a family planning a Rajasthan heritage tour, 
              Plan My Journey gives you the tools to create your perfect itinerary with ease and confidence.
            </p>
          </motion.div>
        </motion.section>

        {/* ── Values ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ marginBottom: '4rem' }}>
          <motion.div variants={fadeUp} className="section-header" style={{ justifyContent: 'center' }}>
            <h3>💎 Our Values</h3>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px),1fr))', gap: '1.25rem' }}>
            {VALUES.map((v, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="card" whileHover={{ y: -6 }}
                style={{ padding: '2rem', textAlign: 'center', transition: 'box-shadow 0.3s' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '16px',
                  background: v.bg, color: v.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', margin: '0 auto 1rem',
                }}>
                  {v.icon}
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{v.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Team ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ marginBottom: '4rem' }}>
          <motion.div variants={fadeUp} className="section-header" style={{ justifyContent: 'center' }}>
            <h3>👥 Meet Our Team</h3>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px),1fr))', gap: '1.25rem' }}>
            {TEAM.map((member, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="card" whileHover={{ y: -6 }}
                style={{ padding: '2rem', textAlign: 'center' }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--forest-50), var(--sky-50))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', margin: '0 auto 1rem',
                  border: '3px solid var(--forest-100)',
                }}>
                  {member.emoji}
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.15rem' }}>{member.name}</h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--forest-600)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {member.role}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div style={{
            background: 'linear-gradient(135deg, #1a4a25 0%, #2d6a3f 50%, #1b3a5c 100%)',
            borderRadius: '24px', padding: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
              Ready to Start Your Journey? 🌍
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Join thousands of happy travelers who plan their trips with us.
            </p>
            <Link to="/journey/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg,#fff,#e8f5e9)', color: 'var(--forest-700)',
              padding: '0.9rem 2rem', borderRadius: '14px', fontWeight: 700,
              textDecoration: 'none', fontSize: '0.95rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <FiMapPin /> Plan My Journey
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
