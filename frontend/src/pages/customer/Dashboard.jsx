import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiCalendar, FiStar, FiArrowRight, FiTrendingUp,
  FiSun, FiMoon, FiCloud, FiNavigation, FiHeart, FiClock, FiChevronRight,
  FiPlus, FiExternalLink, FiCompass, FiGlobe,
} from 'react-icons/fi';
import { MdFlight, MdTrain, MdHotel, MdDirectionsBus } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { customerAPI, destinationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

/* ─── Animations (lightweight) ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: 'easeOut' },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.03 } } };

/* ─── Data ─── */
const CITY_IMAGES = {
  Jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=480&h=320&fit=crop',
  Udaipur: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=480&h=320&fit=crop',
  Manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=480&h=320&fit=crop',
  Shimla: 'https://th.bing.com/th/id/OIP.2ttZBXJxWbxyarSM87r8iAHaE8?w=253&h=180&c=7&r=0&o=7&dpr=2.5&pid=1.7&rm=3',
  Goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=480&h=320&fit=crop',
  Mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=480&h=320&fit=crop',
  Varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=480&h=320&fit=crop',
  Kerala: 'https://th.bing.com/th/id/OIP.YJjLxGxNQ8Y9YlI1XlmZMAHaEK?w=333&h=187&c=7&r=0&o=7&dpr=2.5&pid=1.7&rm=3',
  Agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=480&h=320&fit=crop',
  karnataka: 'https://images.unsplash.com/photo-1549887534-9e089c8ab1c0?w=480&h=320&fit=crop',
  default: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=480&h=320&fit=crop',
};

const TRENDING = [
  { title: 'Rajasthan Heritage Trail', days: '5D / 4N', price: '₹12,999', rating: 4.8, image: CITY_IMAGES.Jaipur, tag: 'Bestseller' },
  { title: 'Himalayan Adventure', days: '7D / 6N', price: '₹18,500', rating: 4.9, image: CITY_IMAGES.Manali, tag: 'Trending' },
  { title: 'Goa Beach Getaway', days: '4D / 3N', price: '₹8,999', rating: 4.7, image: CITY_IMAGES.Goa, tag: 'Popular' },
  { title: 'Kerala Backwaters', days: '6D / 5N', price: '₹15,999', rating: 4.9, image: CITY_IMAGES.Kerala, tag: 'Featured' },
];

const QUICK_BOOKINGS = [
  { icon: MdFlight, label: 'Flights', desc: 'Google Flights', color: '#1e88e5', bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', url: 'https://www.google.com/travel/flights' },
  { icon: MdTrain, label: 'Trains', desc: 'IRCTC', color: '#43a047', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', url: 'https://www.irctc.co.in' },
  { icon: MdHotel, label: 'Hotels', desc: 'Booking.com', color: '#ff7043', bg: 'linear-gradient(135deg,#fbe9e7,#ffccbc)', url: 'https://www.booking.com' },
  { icon: MdDirectionsBus, label: 'Bus', desc: 'RedBus', color: '#8e24aa', bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', url: 'https://www.redbus.in' },
];

const POPULAR = ['Jaipur', 'Manali', 'Goa', 'Udaipur', 'Kerala', 'Varanasi', 'Agra', 'Shimla'];

/* ─── Component ─── */
export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, statesRes] = await Promise.all([
          customerAPI.getDashboard(),
          destinationsAPI.getStates(),
        ]);
        setDashboard(dashRes.data);
        setStates(statesRes.data.states || []);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    try {
      const res = await destinationsAPI.search(q);
      setSearchResults(res.data.results || []);
      setShowSearch(true);
    } catch { setSearchResults([]); }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good Morning', icon: <FiSun /> };
    if (h < 17) return { text: 'Good Afternoon', icon: <FiCloud /> };
    return { text: 'Good Evening', icon: <FiMoon /> };
  })();

  if (loading) return (
    <div className="page-loader"><div className="loader" /><p>Loading your journey…</p></div>
  );

  const upcomingTrips = [
    ...(dashboard?.upcoming_trips || []),
    ...(dashboard?.ongoing_trips || []),
  ].filter(
    (t) => ['planning', 'confirmed', 'in_progress'].includes(t.status),
  );
  const firstName = user?.name?.split(' ')[0] || 'Traveler';

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0a2818 0%, #14432a 35%, #143350 75%, #0d1b2a 100%)',
        position: 'relative', overflow: 'hidden', paddingBottom: '4rem',
      }}>
        {/* Decorative orbs */}
        <div style={{ position:'absolute',width:'420px',height:'420px',borderRadius:'50%',background:'radial-gradient(circle,rgba(76,175,80,0.15),transparent 70%)',top:'-120px',right:'-80px' }}/>
        <div style={{ position:'absolute',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(30,136,229,0.1),transparent 70%)',bottom:'-60px',left:'-60px' }}/>
        <div style={{ position:'absolute',width:'200px',height:'200px',borderRadius:'50%',background:'radial-gradient(circle,rgba(255,193,7,0.08),transparent 70%)',top:'40%',left:'45%' }}/>

        <div className="container" style={{ position:'relative', zIndex:2, paddingTop:'2.5rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap:'2rem', alignItems:'center' }}>
            {/* Left content */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'rgba(255,255,255,0.6)', marginBottom:'0.75rem', fontSize:'0.92rem' }}>
                {greeting.icon} {greeting.text}, {firstName}
              </motion.div>

              <motion.h1 variants={fadeUp} style={{ color:'#fff', fontSize:'clamp(2rem,4.5vw,3.2rem)', fontWeight:800, lineHeight:1.15, margin:'0 0 1rem' }}>
                Discover Your Next<br/>
                <span style={{ background:'linear-gradient(135deg,#81c784,#42a5f5)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  Adventure ✨
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{ color:'rgba(255,255,255,0.65)', fontSize:'1.05rem', lineHeight:1.7, maxWidth:'480px', marginBottom:'1.5rem' }}>
                Plan personalized journeys across India's most beautiful destinations. From heritage trails to mountain escapes — your perfect trip awaits.
              </motion.p>

              {/* Search */}
              <motion.div variants={fadeUp} style={{ position:'relative', maxWidth:'520px' }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:'0.75rem',
                  background:'rgba(255,255,255,0.15)',
                  borderRadius:'16px', padding:'0.9rem 1.25rem',
                  border:'1px solid rgba(255,255,255,0.15)',
                  transition:'all 0.3s',
                }}>
                  <FiSearch style={{ color:'rgba(255,255,255,0.5)', fontSize:'1.15rem', flexShrink:0 }} />
                  <input
                    type="text" placeholder="Search cities, states, attractions…"
                    value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
                    onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                    style={{
                      border:'none', outline:'none', background:'transparent',
                      fontSize:'0.95rem', flex:1, padding:0, color:'#fff', width:'100%',
                    }}
                  />
                  <button onClick={() => navigate('/journey/new')} style={{
                    background:'linear-gradient(135deg,var(--forest-500),var(--forest-400))',
                    border:'none', borderRadius:'12px', padding:'0.55rem 1.2rem',
                    color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'0.85rem',
                    whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'0.4rem',
                  }}>
                    <FiCompass /> Explore
                  </button>
                </div>

                <AnimatePresence>
                  {showSearch && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                      style={{
                        position:'absolute', top:'110%', left:0, right:0,
                        background:'#fff', borderRadius:'16px', boxShadow:'0 16px 48px rgba(0,0,0,0.2)',
                        padding:'0.5rem', maxHeight:'280px', overflow:'auto', zIndex:100,
                      }}
                    >
                      {searchResults.map((r, i) => (
                        <div key={i} onClick={() => { setShowSearch(false); navigate('/journey/new', { state: { searchResult: r } }); }}
                          style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.7rem', borderRadius:'12px', cursor:'pointer', transition:'background 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--forest-50)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'var(--forest-50)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--forest-600)' }}>
                            <FiMapPin />
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text-primary)' }}>{r.name}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{r.type}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Quick stats */}
              <motion.div variants={fadeUp} style={{ display:'flex', gap:'2rem', marginTop:'2rem' }}>
                {[
                  { val: '500+', label: 'Destinations' },
                  { val: '10k+', label: 'Happy Travelers' },
                  { val: '4.9', label: 'Avg Rating' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ color:'#fff', fontWeight:800, fontSize:'1.35rem' }}>{s.val}</div>
                    <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.78rem' }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right side – image collage */}
            <motion.div
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.7, delay:0.3 }}
              className="hide-mobile"
              style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:'0.75rem', height:'380px' }}
            >
              {[CITY_IMAGES.Jaipur, CITY_IMAGES.Manali, CITY_IMAGES.Kerala, CITY_IMAGES.Goa].map((img, i) => (
                <div key={i} style={{
                  borderRadius: i === 0 ? '24px 12px 12px 12px' : i === 1 ? '12px 24px 12px 12px' : i === 2 ? '12px 12px 12px 24px' : '12px 12px 24px 12px',
                  overflow:'hidden', position:'relative',
                }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(transparent 60%,rgba(0,0,0,0.4))' }} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="container" style={{ paddingTop:'2.5rem', paddingBottom:'3rem' }}>

        {/* ─── Quick Book Row ─── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once:true }} variants={stagger} style={{ marginBottom:'3rem' }}>
          <motion.div variants={fadeUp} className="section-header">
            <h3>⚡ Quick Bookings</h3>
            <span style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Book directly on partner sites</span>
          </motion.div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap:'1rem' }}>
            {QUICK_BOOKINGS.map((b, i) => (
              <motion.a
                key={i} href={b.url} target="_blank" rel="noopener noreferrer"
                variants={fadeUp} custom={i}
                whileHover={{ y:-3 }}
                whileTap={{ scale:0.98 }}
                style={{
                  display:'flex', alignItems:'center', gap:'1rem',
                  padding:'1.25rem 1.5rem', borderRadius:'20px',
                  background: b.bg, textDecoration:'none',
                  border:'2px solid transparent',
                  transition:'border-color 0.3s, box-shadow 0.3s',
                  position:'relative', overflow:'hidden',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = b.color + '50'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{
                  width:'54px', height:'54px', borderRadius:'16px',
                  background:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 12px rgba(0,0,0,0.06)', flexShrink:0,
                }}>
                  <b.icon style={{ fontSize:'1.5rem', color:b.color }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)' }}>{b.label}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                    {b.desc} <FiExternalLink style={{ fontSize:'0.7rem' }} />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* ─── CTA Banner ─── */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once:true }}
          variants={fadeUp} style={{ marginBottom:'3rem' }}
        >
          <div style={{
            background:'linear-gradient(135deg, #1a4a25 0%, #2d6a3f 50%, #1b3a5c 100%)',
            borderRadius:'24px', padding:'2rem 1.5rem', position:'relative', overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1.5rem',
            flexWrap:'wrap',
          }}>
            <div style={{ position:'absolute', top:'-50px', right:'-50px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
            <div style={{ position:'absolute', bottom:'-30px', left:'30%', width:'140px', height:'140px', borderRadius:'50%', background:'rgba(76,175,80,0.1)' }} />
            <div style={{ position:'relative', zIndex:2 }}>
              <h2 style={{ color:'#fff', fontSize:'1.6rem', fontWeight:700, margin:'0 0 0.5rem', fontFamily:'var(--font-display)' }}>
                Plan Your Dream Journey 🌍
              </h2>
              <p style={{ color:'rgba(255,255,255,0.7)', margin:0, fontSize:'0.95rem', maxWidth:'420px' }}>
                Choose your state, pick cities, select attractions, and let us build the perfect itinerary for you.
              </p>
            </div>
            <button
              onClick={() => navigate('/journey/new')}
              className="btn-primary"
              style={{
                padding:'1rem 2rem', borderRadius:'16px', fontWeight:700, fontSize:'1rem',
                background:'linear-gradient(135deg,#fff,#e8f5e9)', color:'var(--forest-700)',
                boxShadow:'0 8px 24px rgba(0,0,0,0.2)', whiteSpace:'nowrap',
                display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0,
              }}
            >
              <FiPlus /> Start Planning
            </button>
          </div>
        </motion.section>

        {/* ─── Upcoming Trips ─── */}
        {upcomingTrips.length > 0 && (
          <motion.section initial="hidden" whileInView="visible" viewport={{ once:true }} variants={stagger} style={{ marginBottom:'3rem' }}>
            <motion.div variants={fadeUp} className="section-header">
              <h3>🗺️ Your Upcoming Trips</h3>
              <Link to="/my-trips">View All <FiChevronRight /></Link>
            </motion.div>
            <div className="hscroll">
              {upcomingTrips.map((trip, i) => (
                <motion.div
                  key={trip._id || i} variants={fadeUp} custom={i}
                  whileHover={{ y:-4 }} whileTap={{ scale:0.98 }}
                  onClick={() => navigate(`/trips/${trip._id}`)}
                  style={{
                    minWidth:'300px', maxWidth:'340px',
                    background:'#fff', borderRadius:'20px', cursor:'pointer',
                    border:'1px solid var(--sand-200)', overflow:'hidden',
                    boxShadow:'0 2px 12px rgba(0,0,0,0.05)',
                    transition:'box-shadow 0.3s',
                  }}
                >
                  <div style={{ height:'8px', background: trip.status === 'confirmed' ? 'linear-gradient(90deg,#43a047,#66bb6a)' : trip.status === 'in_progress' ? 'linear-gradient(90deg,#1e88e5,#42a5f5)' : 'linear-gradient(90deg,#ffc107,#ffd54f)' }} />
                  <div style={{ padding:'1.25rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'0.75rem' }}>
                      <span style={{
                        background: trip.status === 'confirmed' ? '#e8f5e9' : trip.status === 'in_progress' ? '#e3f2fd' : '#fff8e1',
                        color: trip.status === 'confirmed' ? '#2e7d32' : trip.status === 'in_progress' ? '#1565c0' : '#f57f17',
                        fontSize:'0.72rem', fontWeight:700, padding:'0.25rem 0.7rem', borderRadius:'20px', textTransform:'uppercase',
                      }}>
                        {trip.status?.replace('_', ' ')}
                      </span>
                      <FiArrowRight style={{ color:'var(--text-muted)' }} />
                    </div>
                    <h4 style={{ fontSize:'1.05rem', margin:'0 0 0.4rem', color:'var(--text-primary)' }}>
                      {trip.title || 'My Trip'}
                    </h4>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.82rem', color:'var(--text-muted)' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                        <FiCalendar /> {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : 'TBD'}
                      </span>
                      <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                        <FiMapPin /> {trip.cities?.length || 0} cities
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── Trending Packages ─── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once:true }} variants={stagger} style={{ marginBottom:'3rem' }}>
          <motion.div variants={fadeUp} className="section-header">
            <h3>🔥 Trending Packages</h3>
            <Link to="/journey/new">See All <FiChevronRight /></Link>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap:'1.25rem' }}>
            {TRENDING.map((pkg, i) => (
              <motion.div
                key={i} variants={fadeUp} custom={i}
                whileHover={{ y:-6 }} whileTap={{ scale:0.98 }}
                onClick={() => navigate('/journey/new')}
                style={{
                  borderRadius:'22px', overflow:'hidden', cursor:'pointer',
                  background:'#fff', boxShadow:'0 2px 16px rgba(0,0,0,0.06)',
                  border:'1px solid var(--sand-200)',
                  transition:'box-shadow 0.3s, transform 0.3s',
                }}
              >
                <div style={{ position:'relative', height:'170px', overflow:'hidden' }}>
                  <img src={pkg.image} alt={pkg.title}
                    style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.07)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(transparent 50%, rgba(0,0,0,0.3))' }} />
                  <span style={{
                    position:'absolute', top:'12px', left:'12px',
                    background: pkg.tag === 'Bestseller' ? '#ff7043' : pkg.tag === 'Trending' ? '#1e88e5' : pkg.tag === 'Featured' ? '#8e24aa' : '#43a047',
                    color:'#fff', fontSize:'0.68rem', padding:'0.25rem 0.6rem', borderRadius:'8px', fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase',
                  }}>
                    {pkg.tag}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); toast.success('Saved to wishlist!'); }}
                    style={{
                      position:'absolute', top:'12px', right:'12px',
                      background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%',
                      width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:'pointer', transition:'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <FiHeart style={{ fontSize:'0.85rem', color:'#ef5350' }} />
                  </button>
                </div>
                <div style={{ padding:'1.1rem 1.25rem' }}>
                  <h4 style={{ fontSize:'1rem', margin:'0 0 0.4rem', lineHeight:1.3 }}>{pkg.title}</h4>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.6rem' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}><FiClock /> {pkg.days}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:'0.2rem', color:'#ffc107' }}>
                      <FiStar style={{ fill:'#ffc107' }} /> {pkg.rating}
                    </span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:800, color:'var(--forest-700)', fontSize:'1.1rem' }}>{pkg.price}</span>
                    <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', background:'var(--sand-100)', padding:'0.2rem 0.6rem', borderRadius:'8px' }}>per person</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── Popular Cities ─── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once:true }} variants={stagger} style={{ marginBottom:'3rem' }}>
          <motion.div variants={fadeUp} className="section-header">
            <h3>🏙️ Popular Destinations</h3>
            <Link to="/journey/new">Explore All <FiChevronRight /></Link>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 170px), 1fr))', gap:'1rem' }}>
            {POPULAR.map((city, i) => (
              <motion.div
                key={city} variants={fadeUp} custom={i}
                whileHover={{ y:-6 }} whileTap={{ scale:0.96 }}
                onClick={() => navigate('/journey/new')}
                style={{ position:'relative', height:'180px', borderRadius:'20px', overflow:'hidden', cursor:'pointer' }}
              >
                <img src={CITY_IMAGES[city] || CITY_IMAGES.default} alt={city}
                  style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{
                  position:'absolute', inset:0,
                  background:'linear-gradient(transparent 40%, rgba(0,0,0,0.65))',
                  display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'1rem',
                }}>
                  <span style={{ color:'#fff', fontWeight:700, fontSize:'1rem' }}>{city}</span>
                  <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'0.25rem' }}>
                    <FiMapPin style={{ fontSize:'0.65rem' }} /> India
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── Explore by State ─── */}
        {states.length > 0 && (
          <motion.section initial="hidden" whileInView="visible" viewport={{ once:true }} variants={stagger} style={{ marginBottom:'3rem' }}>
            <motion.div variants={fadeUp} className="section-header">
              <h3>🗺️ Explore by State</h3>
            </motion.div>
            <div className="hscroll">
              {states.slice(0, 10).map((state, i) => (
                <motion.div
                  key={state._id || i} variants={fadeUp} custom={i}
                  whileHover={{ y:-4 }} whileTap={{ scale:0.97 }}
                  onClick={() => navigate('/journey/new')}
                  style={{
                    minWidth:'140px', padding:'1.25rem 1rem', borderRadius:'18px',
                    background:'#fff', textAlign:'center', cursor:'pointer',
                    border:'1px solid var(--sand-200)',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
                    transition:'box-shadow 0.3s, border-color 0.3s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--forest-300)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--sand-200)'}
                >
                  <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>
                    {['🏔️','🏜️','🌊','🌴','🏰','⛰️','🌺','🌳','🏝️','🎭'][i % 10]}
                  </div>
                  <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-primary)' }}>{state.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── Your Stats ─── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once:true }} variants={fadeUp} style={{ marginBottom:'2rem' }}>
          <div style={{
            background:'linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 50%, #f3e5f5 100%)',
            borderRadius:'24px', padding:'2rem',
            display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap:'1rem', textAlign:'center',
          }}>
            {[
              { val: (dashboard?.upcoming_trips?.length || 0) + (dashboard?.ongoing_trips?.length || 0) + (dashboard?.past_trips?.length || 0), label:'Trips Planned', icon:<FiCompass />, color:'var(--forest-600)' },
              { val: dashboard?.past_trips?.length || 0, label:'Completed', icon:<FiGlobe />, color:'var(--sky-600)' },
              { val: dashboard?.ongoing_trips?.length || 0, label:'In Progress', icon:<FiStar />, color:'var(--sunset-500)' },
            ].map((s, i) => (
              <div key={i} style={{ padding:'0.5rem' }}>
                <div style={{ color:s.color, marginBottom:'0.4rem', fontSize:'1.25rem' }}>{s.icon}</div>
                <div style={{ fontSize:'1.8rem', fontWeight:800, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}
