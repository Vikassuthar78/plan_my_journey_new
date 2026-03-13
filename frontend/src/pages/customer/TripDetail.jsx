import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft, FiMapPin, FiCalendar, FiClock, FiStar, FiPhone, FiNavigation,
  FiCheckCircle, FiCamera, FiSun, FiMoon, FiUsers, FiShare2,
} from 'react-icons/fi';
import { MdHotel, MdRestaurant, MdDirectionsCar, MdLocalActivity } from 'react-icons/md';
import { customerAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  planning: { color: '#ffc107', bg: '#fff8e1', label: 'Planning' },
  confirmed: { color: '#43a047', bg: '#e8f5e9', label: 'Confirmed' },
  in_progress: { color: '#1e88e5', bg: '#e3f2fd', label: 'In Progress' },
  completed: { color: '#8e24aa', bg: '#f3e5f5', label: 'Completed' },
  cancelled: { color: '#ef5350', bg: '#ffebee', label: 'Cancelled' },
};

const ACTIVITY_ICONS = {
  attraction: { icon: MdLocalActivity, color: '#43a047', bg: '#e8f5e9' },
  hotel: { icon: MdHotel, color: '#1e88e5', bg: '#e3f2fd' },
  food: { icon: MdRestaurant, color: '#ff7043', bg: '#fbe9e7' },
  travel: { icon: MdDirectionsCar, color: '#8e24aa', bg: '#f3e5f5' },
  default: { icon: FiMapPin, color: '#607d8b', bg: '#eceff1' },
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    if (!id) return;
    customerAPI.getTripDetail(id)
      .then((res) => {
        setTrip(res.data.trip || res.data);
        if (res.data.guide) setGuide(res.data.guide);
      })
      .catch(() => toast.error('Failed to load trip'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReview = async () => {
    if (!reviewText.trim()) return toast.error('Please write a review');
    try {
      await customerAPI.addReview(id, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      setReviewText('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader" />
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Trip not found</h2>
        <button onClick={() => navigate('/my-trips')} className="btn-primary" style={{ marginTop: '1rem' }}>Go to My Trips</button>
      </div>
    );
  }

  const statusConf = STATUS_COLORS[trip.status] || STATUS_COLORS.planning;
  const cities = trip.cities || [];
  const isLive = trip.status === 'in_progress';
  const isCompleted = trip.status === 'completed';

  // Build day-wise itinerary from cities
  const days = cities.map((city, i) => ({
    day: i + 1,
    cityName: city.name || city.city_name || `City ${i + 1}`,
    activities: [
      ...(city.attractions || []).map((a) => ({
        type: 'attraction',
        name: a.name,
        time: `${9 + (i % 3)}:00 AM`,
        duration: a.visit_duration || '1-2 hrs',
        cost: a.entry_fee || 0,
        completed: isCompleted || (isLive && i < Math.floor((city.attractions || []).length / 2)),
      })),
      ...(city.hotel ? [{
        type: 'hotel',
        name: city.hotel.name || 'Hotel Check-in',
        time: '04:00 PM',
        duration: 'Overnight',
        cost: city.hotel.price_per_night || 0,
        completed: isCompleted,
      }] : []),
    ],
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a4a25, #1b3a5c)',
        padding: '1.5rem', borderRadius: '0 0 28px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', padding: '0.5rem', cursor: 'pointer', color: '#fff' }}>
              <FiChevronLeft style={{ fontSize: '1.2rem' }} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: '#fff', fontSize: '1.3rem', margin: 0 }}>{trip.title || 'My Trip'}</h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <FiMapPin style={{ fontSize: '0.75rem' }} /> {trip.state || cities.map((c) => c.name || c.city_name).join(', ')}
              </div>
            </div>
            <span style={{
              background: statusConf.bg, color: statusConf.color,
              padding: '0.25rem 0.75rem', borderRadius: '10px',
              fontSize: '0.72rem', fontWeight: 700,
            }}>
              {statusConf.label}
            </span>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem',
            background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0.85rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{cities.length}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>Cities</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{days.length}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>Days</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                ₹{(trip.total_cost || 0).toLocaleString()}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>Budget</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '1.5rem' }}>
        {/* Live Banner */}
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              border: '1px solid rgba(30,136,229,0.2)',
            }}
          >
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%', background: '#1e88e5',
              boxShadow: '0 0 0 3px rgba(30,136,229,0.3)',
              animation: 'pulse 2s infinite',
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sky-700)' }}>Trip is Live!</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Day {activeDay + 1} • {days[activeDay]?.cityName}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.3rem', background: 'var(--sand-100)',
          borderRadius: '14px', padding: '0.3rem', marginBottom: '1.25rem',
        }}>
          {[
            { id: 'itinerary', label: '📋 Itinerary' },
            { id: 'details', label: '📝 Details' },
            { id: 'review', label: '⭐ Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '0.65rem', borderRadius: '12px', border: 'none',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                color: activeTab === tab.id ? 'var(--forest-700)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'itinerary' && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Day Selector */}
              {days.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '0.25rem' }}>
                  {days.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveDay(i)}
                      style={{
                        minWidth: '80px', padding: '0.6rem', borderRadius: '14px', border: 'none',
                        background: activeDay === i ? 'var(--forest-600)' : '#fff',
                        color: activeDay === i ? '#fff' : 'var(--text-primary)',
                        fontWeight: 600, cursor: 'pointer', textAlign: 'center',
                        boxShadow: activeDay === i ? '0 4px 16px rgba(45,106,63,0.25)' : 'var(--shadow-sm)',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Day</div>
                      <div style={{ fontSize: '1.1rem' }}>{day.day}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>{day.cityName.substring(0, 8)}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Timeline */}
              {days[activeDay] && (
                <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                  {/* Timeline line */}
                  <div style={{
                    position: 'absolute', left: '10px', top: '0', bottom: '0',
                    width: '2px', background: 'var(--sand-200)',
                  }} />

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      background: 'var(--forest-50)', borderRadius: '14px', padding: '0.85rem',
                      marginBottom: '0.75rem', position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', left: '-1.75rem', top: '50%', transform: 'translateY(-50%)',
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: 'var(--forest-500)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2,
                      }}>
                        <FiSun style={{ color: '#fff', fontSize: '0.7rem' }} />
                      </div>
                      <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.2rem 0' }}>
                        📍 {days[activeDay].cityName}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        {days[activeDay].activities.length} activities planned
                      </p>
                    </div>
                  </div>

                  {days[activeDay].activities.map((activity, i) => {
                    const actConf = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default;
                    const ActIcon = actConf.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ marginBottom: '0.75rem', position: 'relative' }}
                      >
                        {/* Timeline dot */}
                        <div style={{
                          position: 'absolute', left: '-1.75rem', top: '1rem',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: activity.completed ? 'var(--forest-400)' : actConf.bg,
                          border: activity.completed ? 'none' : `2px solid ${actConf.color}40`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          zIndex: 2,
                        }}>
                          {activity.completed ? (
                            <FiCheckCircle style={{ color: '#fff', fontSize: '0.7rem' }} />
                          ) : (
                            <ActIcon style={{ color: actConf.color, fontSize: '0.65rem' }} />
                          )}
                        </div>

                        <div style={{
                          background: '#fff', borderRadius: '16px', padding: '1rem',
                          border: `1px solid ${activity.completed ? 'var(--forest-200)' : 'var(--sand-200)'}`,
                          opacity: activity.completed ? 0.85 : 1,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                <h4 style={{ fontSize: '0.92rem', margin: 0, textDecoration: activity.completed ? 'line-through' : 'none' }}>
                                  {activity.name}
                                </h4>
                                {activity.completed && <FiCheckCircle style={{ color: 'var(--forest-500)', fontSize: '0.8rem' }} />}
                              </div>
                              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <FiClock /> {activity.time}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  ⏱️ {activity.duration}
                                </span>
                                {activity.cost > 0 && (
                                  <span>₹{activity.cost.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                            {isLive && !activity.completed && (
                              <button
                                onClick={() => toast.success('Opening navigation...')}
                                style={{
                                  background: actConf.bg, border: 'none', borderRadius: '10px',
                                  padding: '0.5rem', cursor: 'pointer', color: actConf.color,
                                }}
                              >
                                <FiNavigation style={{ fontSize: '0.9rem' }} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {days[activeDay].activities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      <p>No activities planned for this day</p>
                    </div>
                  )}
                </div>
              )}

              {days.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                  <h3>No itinerary yet</h3>
                  <p>Your day-wise plan will appear here once confirmed</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Trip Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Dates */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem', border: '1px solid var(--sand-200)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>📅 Trip Dates</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--forest-50)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Start</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--forest-700)' }}>
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--sky-100)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>End</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--sky-700)' }}>
                        {trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travel Mode */}
                {trip.travel_mode && (
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem', border: '1px solid var(--sand-200)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>🚗 Travel Mode</h3>
                    <p style={{ fontSize: '0.9rem', textTransform: 'capitalize', margin: 0 }}>{trip.travel_mode}</p>
                    {trip.transport && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {trip.transport.operator} • ₹{trip.transport.price?.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Travelers */}
                {trip.travelers?.length > 0 && (
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem', border: '1px solid var(--sand-200)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                      <FiUsers style={{ marginRight: '0.3rem' }} /> Travelers ({trip.travelers.length})
                    </h3>
                    {trip.travelers.map((t, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.6rem 0', borderBottom: i < trip.travelers.length - 1 ? '1px solid var(--sand-100)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: `hsl(${i * 80 + 120}, 40%, 90%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.85rem', color: `hsl(${i * 80 + 120}, 40%, 40%)`,
                          }}>
                            {t.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                            {t.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.phone}</div>}
                          </div>
                        </div>
                        {t.isPrimary && (
                          <span style={{ fontSize: '0.7rem', background: 'var(--forest-100)', color: 'var(--forest-700)', padding: '0.15rem 0.5rem', borderRadius: '8px', fontWeight: 600 }}>
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Budget */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem', border: '1px solid var(--sand-200)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>💰 Budget</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--forest-700)' }}>
                    ₹{(trip.total_cost || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated total</div>
                </div>

                {/* Guide */}
                {guide && (
                  <div style={{
                    background: 'linear-gradient(135deg, #e8f5e9, #e3f2fd)',
                    borderRadius: '16px', padding: '1.2rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                  }}>
                    <div style={{
                      width: '50px', height: '50px', borderRadius: '50%',
                      background: 'var(--forest-500)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '1.2rem',
                    }}>
                      {guide.name?.[0]?.toUpperCase() || 'G'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{guide.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Trip Guide</div>
                    </div>
                    <button
                      onClick={() => toast.success('Calling guide...')}
                      style={{
                        background: 'var(--forest-500)', border: 'none', borderRadius: '50%',
                        width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#fff',
                      }}
                    >
                      <FiPhone />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isCompleted ? (
                <div style={{ background: '#fff', borderRadius: '18px', padding: '1.5rem', border: '1px solid var(--sand-200)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Rate Your Experience</h3>

                  {/* Star Rating */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '2rem', padding: '0.25rem',
                        }}
                      >
                        <FiStar style={{
                          fill: star <= reviewRating ? '#ffc107' : 'none',
                          color: star <= reviewRating ? '#ffc107' : 'var(--sand-200)',
                        }} />
                      </motion.button>
                    ))}
                  </div>

                  <textarea
                    placeholder="Share your experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    style={{ borderRadius: '14px', resize: 'none', marginBottom: '1rem' }}
                  />

                  <button
                    onClick={handleReview}
                    className="btn-primary"
                    style={{ width: '100%', borderRadius: '14px' }}
                  >
                    Submit Review
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                  <h3>Complete your trip first</h3>
                  <p>You can leave a review once your trip is completed</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: '2rem' }}
        >
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: trip.title || 'My Trip', text: `Check out my trip: ${trip.title || 'Trip'}` })
                  .then(() => toast.success('Shared!'))
                  .catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
                toast.success('Link copied!');
              }
            }}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: '14px',
              background: 'var(--sand-100)', border: '1px solid var(--sand-200)',
              fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            <FiShare2 /> Share Trip
          </button>
        </motion.div>
      </div>
    </div>
  );
}
