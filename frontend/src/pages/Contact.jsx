import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiMessageSquare, FiGlobe, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const CONTACT_INFO = [
  { icon: <FiMail />, label: 'Email', value: 'hello@planmyjourney.com', href: 'mailto:hello@planmyjourney.com', color: '#42a5f5', bg: '#e3f2fd' },
  { icon: <FiPhone />, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210', color: '#66bb6a', bg: '#e8f5e9' },
  { icon: <FiMapPin />, label: 'Office', value: 'Jaipur, Rajasthan, India', href: 'https://maps.google.com/?q=Jaipur+Rajasthan', color: '#ff9800', bg: '#fff3e0' },
  { icon: <FiClock />, label: 'Hours', value: 'Mon–Sat, 9 AM – 7 PM IST', href: null, color: '#ab47bc', bg: '#f3e5f5' },
];

const FAQS = [
  { q: 'How do I plan a trip?', a: 'Use our Journey Builder — select your state, pick cities, choose attractions, book transport & hotels, and get a complete itinerary in minutes!' },
  { q: 'Is my payment secure?', a: 'Absolutely! We use industry-standard encryption and work with trusted payment gateways to ensure your transactions are safe.' },
  { q: 'Can I modify my trip after booking?', a: 'Yes! You can view and manage your trips from the My Trips section. Contact our support team for booking modifications.' },
  { q: 'Do you offer guided tours?', a: 'Yes! We have experienced local guides available for most destinations. Guides can be assigned to your trip by our admin team.' },
  { q: 'What is the cancellation policy?', a: 'Cancellations made 48+ hours before the trip start date receive a full refund. Please contact support for specific cases.' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    // Simulate sending (replace with real API call when backend endpoint exists)
    await new Promise(r => setTimeout(r, 1200));
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSubmitting(false);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ minHeight: '90vh' }}>

      {/* ══════ Hero ══════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0a2818 0%, #14432a 35%, #143350 75%, #0d1b2a 100%)',
        padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(30,136,229,0.12),transparent 70%)', top: '-100px', left: '-80px' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(76,175,80,0.08),transparent 70%)', bottom: '-60px', right: '-40px' }} />

        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ position: 'relative', zIndex: 2, maxWidth: 680, margin: '0 auto' }}>
          <motion.div variants={fadeUp} style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</motion.div>
          <motion.h1 variants={fadeUp} style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Get in Touch
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
            Have a question, feedback, or need help planning your trip? We'd love to hear from you.
          </motion.p>
        </motion.div>
      </section>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>

        {/* ── Contact Cards ── */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px),1fr))', gap: '1.25rem', marginBottom: '3rem', marginTop: '-3rem' }}
        >
          {CONTACT_INFO.map((c, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              {c.href ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div className="card glass" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `3px solid ${c.color}`, transition: 'transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', margin: '0 auto 0.75rem' }}>
                      {c.icon}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>{c.label}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.value}</div>
                  </div>
                </a>
              ) : (
                <div className="card glass" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `3px solid ${c.color}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: '14px', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', margin: '0 auto 0.75rem' }}>
                    {c.icon}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>{c.label}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.value}</div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* ── Contact Form + Map ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2rem', marginBottom: '4rem' }}>

          {/* Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <FiMessageSquare style={{ color: 'var(--forest-500)', fontSize: '1.2rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Send us a Message</h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                      Name <span style={{ color: '#ef5350' }}>*</span>
                    </label>
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                      placeholder="Your name" style={{ borderRadius: '12px' }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                      Email <span style={{ color: '#ef5350' }}>*</span>
                    </label>
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                      placeholder="your@email.com" style={{ borderRadius: '12px' }} required />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Subject</label>
                  <input type="text" value={form.subject} onChange={e => update('subject', e.target.value)}
                    placeholder="How can we help?" style={{ borderRadius: '12px' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Message <span style={{ color: '#ef5350' }}>*</span>
                  </label>
                  <textarea value={form.message} onChange={e => update('message', e.target.value)}
                    placeholder="Tell us more about your query..." rows={5}
                    style={{ borderRadius: '12px', resize: 'vertical', minHeight: '120px' }} required />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary"
                  style={{
                    width: '100%', padding: '0.9rem', borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    fontSize: '0.95rem', fontWeight: 700, opacity: submitting ? 0.7 : 1,
                  }}
                >
                  <FiSend /> {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Map + Info */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <iframe
                title="Plan My Journey Office - Jaipur"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227748.99973450298!2d75.65046970645956!3d26.885141393398046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                style={{ width: '100%', flex: 1, minHeight: '280px', border: 'none' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiGlobe style={{ color: 'var(--forest-500)' }} /> Our Office
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Plan My Journey HQ<br />
                  Malviya Nagar, Jaipur<br />
                  Rajasthan 302017, India
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── FAQs ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ marginBottom: '3rem' }}>
          <motion.div variants={fadeUp} className="section-header" style={{ justifyContent: 'center' }}>
            <h3>❓ Frequently Asked Questions</h3>
          </motion.div>
          <div style={{ maxWidth: 740, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card" style={{ overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: '1.1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'left',
                  }}
                >
                  {faq.q}
                  <FiChevronDown style={{
                    transition: 'transform 0.3s', flexShrink: 0, color: 'var(--text-muted)',
                    transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.25rem 1.1rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
