import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft, FiChevronRight, FiMapPin, FiSearch, FiCheck, FiClock,
  FiDollarSign, FiStar, FiCamera, FiSun, FiUsers, FiPhone, FiMail,
  FiCalendar, FiCreditCard, FiShield, FiEdit3, FiTrash2, FiPlus, FiInfo,
} from 'react-icons/fi';
import {
  MdFlight, MdTrain, MdDirectionsCar, MdDirectionsBus, MdHotel,
  MdLocationOn, MdAccessTime, MdCurrencyRupee,
} from 'react-icons/md';
import { destinationsAPI, customerAPI, bookingsAPI, paymentsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = [
  { num: 1, label: 'State', icon: '🗺️' },
  { num: 2, label: 'Cities', icon: '🏙️' },
  { num: 3, label: 'Attractions', icon: '🎯' },
  { num: 4, label: 'Travel', icon: '🚗' },
  { num: 5, label: 'Transport', icon: '✈️' },
  { num: 6, label: 'Hotels', icon: '🏨' },
  { num: 7, label: 'Itinerary', icon: '📋' },
  { num: 8, label: 'Travelers', icon: '👥' },
  { num: 9, label: 'Payment', icon: '💳' },
];

const TRAVEL_MODES = [
  { id: 'flight', label: 'Flight', icon: MdFlight, desc: 'Fastest option', color: '#1e88e5', bg: '#e3f2fd' },
  { id: 'train', label: 'Train', icon: MdTrain, desc: 'Comfortable journey', color: '#43a047', bg: '#e8f5e9' },
  { id: 'bus', label: 'Bus', icon: MdDirectionsBus, desc: 'Budget friendly', color: '#ff7043', bg: '#fbe9e7' },
  { id: 'car', label: 'Self Drive', icon: MdDirectionsCar, desc: 'Flexible route', color: '#8e24aa', bg: '#f3e5f5' },
];

const MOCK_TRANSPORT = {
  flight: [
    { id: 'f1', operator: 'IndiGo', departure: '06:00', arrival: '08:15', duration: '2h 15m', price: 4500, class: 'Economy' },
    { id: 'f2', operator: 'Air India', departure: '09:30', arrival: '11:45', duration: '2h 15m', price: 5200, class: 'Economy' },
    { id: 'f3', operator: 'Vistara', departure: '14:00', arrival: '16:20', duration: '2h 20m', price: 6100, class: 'Premium' },
  ],
  train: [
    { id: 't1', operator: 'Rajdhani Express', departure: '16:55', arrival: '05:30+1', duration: '12h 35m', price: 1800, class: '3A' },
    { id: 't2', operator: 'Shatabdi Express', departure: '06:00', arrival: '12:30', duration: '6h 30m', price: 1200, class: 'CC' },
    { id: 't3', operator: 'Duronto Express', departure: '20:30', arrival: '07:15+1', duration: '10h 45m', price: 2200, class: '2A' },
  ],
  bus: [
    { id: 'b1', operator: 'RSRTC Volvo', departure: '21:00', arrival: '06:00+1', duration: '9h', price: 900, class: 'AC Sleeper' },
    { id: 'b2', operator: 'SRS Travels', departure: '22:30', arrival: '08:30+1', duration: '10h', price: 750, class: 'Semi Sleeper' },
  ],
};

const slide = {
  enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

export default function JourneyBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: State
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [stateSearch, setStateSearch] = useState('');

  // Step 2: Cities
  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');

  // Step 3: Attractions per city
  const [attractionsByCity, setAttractionsByCity] = useState({});
  const [selectedAttractions, setSelectedAttractions] = useState({});
  const [activeCityTab, setActiveCityTab] = useState(null);

  // Step 4: Travel mode
  const [travelMode, setTravelMode] = useState(null);

  // Step 5: Transport
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [transportFilter, setTransportFilter] = useState('all');

  // Step 6: Hotels per city
  const [hotelsByCity, setHotelsByCity] = useState({});
  const [selectedHotels, setSelectedHotels] = useState({});
  const [activeHotelCity, setActiveHotelCity] = useState(null);
  const [hotelFilter, setHotelFilter] = useState('all');

  // Step 7: Itinerary
  const [editingItinerary, setEditingItinerary] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 8: Travelers
  const [travelers, setTravelers] = useState([{ name: '', gender: '', dob: '', phone: '', email: '', isPrimary: true }]);

  // Step 9: Payment
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  // Load states on mount
  useEffect(() => {
    destinationsAPI.getStates().then((res) => setStates(res.data.states || [])).catch(() => {});
  }, []);

  // Load cities when state selected
  useEffect(() => {
    if (!selectedState) return;
    setCities([]);
    destinationsAPI.getCities(selectedState._id).then((res) => setCities(res.data.cities || [])).catch(() => {});
  }, [selectedState]);

  // Load attractions when cities change
  useEffect(() => {
    if (selectedCities.length === 0) return;
    if (!activeCityTab) setActiveCityTab(selectedCities[0]._id);
    selectedCities.forEach((city) => {
      if (!attractionsByCity[city._id]) {
        destinationsAPI.getAttractions(city._id).then((res) => {
          setAttractionsByCity((prev) => ({ ...prev, [city._id]: res.data.attractions || [] }));
        }).catch(() => {});
      }
    });
  }, [selectedCities]);

  // Load hotels when step 6
  useEffect(() => {
    if (step !== 6 || selectedCities.length === 0) return;
    if (!activeHotelCity) setActiveHotelCity(selectedCities[0]._id);
    selectedCities.forEach((city) => {
      if (!hotelsByCity[city._id]) {
        destinationsAPI.getHotels(city._id).then((res) => {
          setHotelsByCity((prev) => ({ ...prev, [city._id]: res.data.hotels || [] }));
        }).catch(() => {});
      }
    });
  }, [step, selectedCities]);

  const filteredStates = useMemo(() => {
    if (!stateSearch) return states;
    return states.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [states, stateSearch]);

  const filteredCities = useMemo(() => {
    if (!citySearch) return cities;
    return cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()));
  }, [cities, citySearch]);

  const totalAttractions = useMemo(() => {
    return Object.values(selectedAttractions).flat().length;
  }, [selectedAttractions]);

  const totalCost = useMemo(() => {
    let cost = 0;
    Object.values(selectedAttractions).flat().forEach((a) => { cost += a.entry_fee || 0; });
    if (selectedTransport) cost += selectedTransport.price || 0;
    Object.values(selectedHotels).forEach((h) => { if (h) cost += h.price_per_night || 0; });
    return cost;
  }, [selectedAttractions, selectedTransport, selectedHotels]);

  const toggleCity = (city) => {
    setSelectedCities((prev) => {
      const exists = prev.find((c) => c._id === city._id);
      if (exists) return prev.filter((c) => c._id !== city._id);
      return [...prev, city];
    });
  };

  const toggleAttraction = (cityId, attraction) => {
    setSelectedAttractions((prev) => {
      const cityAttractions = prev[cityId] || [];
      const exists = cityAttractions.find((a) => a._id === attraction._id);
      if (exists) {
        return { ...prev, [cityId]: cityAttractions.filter((a) => a._id !== attraction._id) };
      }
      return { ...prev, [cityId]: [...cityAttractions, attraction] };
    });
  };

  const addTraveler = () => {
    if (travelers.length >= 10) return toast.error('Maximum 10 travelers');
    setTravelers([...travelers, { name: '', gender: '', dob: '', phone: '', email: '', isPrimary: false }]);
  };

  const removeTraveler = (idx) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter((_, i) => i !== idx));
  };

  const updateTraveler = (idx, field, value) => {
    const updated = [...travelers];
    updated[idx] = { ...updated[idx], [field]: value };
    setTravelers(updated);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedState;
      case 2: return selectedCities.length > 0;
      case 3: return totalAttractions > 0;
      case 4: return !!travelMode;
      case 5: return true; // optional
      case 6: return true; // optional
      case 7: return !!tripTitle && !!startDate;
      case 8: return travelers[0].name && travelers[0].phone;
      case 9: return true;
      default: return false;
    }
  };

  const goNext = () => {
    if (!canProceed()) return toast.error('Please complete this step');
    setDirection(1);
    setStep((s) => Math.min(s + 1, 9));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // 1. Create Trip
      const tripData = {
        title: tripTitle,
        state: selectedState.name,
        cities: selectedCities.map((c) => ({
          city_id: c._id,
          name: c.name,
          attractions: (selectedAttractions[c._id] || []).map((a) => ({
            attraction_id: a._id,
            name: a.name,
            entry_fee: a.entry_fee || 0,
          })),
          hotel: selectedHotels[c._id] ? {
            hotel_id: selectedHotels[c._id]._id,
            name: selectedHotels[c._id].name,
            price_per_night: selectedHotels[c._id].price_per_night || 0,
          } : null,
        })),
        travel_mode: travelMode,
        transport: selectedTransport ? {
          type: travelMode,
          operator: selectedTransport.operator,
          price: selectedTransport.price,
        } : null,
        start_date: startDate,
        end_date: endDate,
        travelers: travelers.filter((t) => t.name),
        total_cost: totalCost * travelers.length,
      };
      const tripRes = await customerAPI.createTrip(tripData);
      const tripId = tripRes.data.trip_id || tripRes.data.trip?._id;

      // 2. Create Booking
      const bookingRes = await bookingsAPI.create({
        trip_id: tripId,
        amount: totalCost * travelers.length,
        travelers_count: travelers.filter((t) => t.name).length,
      });
      const bookingId = bookingRes.data.booking_id || bookingRes.data.booking?._id;

      // 3. Process Payment
      await paymentsAPI.process({
        booking_id: bookingId,
        amount: totalCost * travelers.length,
        method: paymentMethod,
      });

      toast.success('Booking confirmed!');
      navigate(`/booking/confirmation/${bookingId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ============ STEP RENDERERS ============

  const renderStep1 = () => (
    <div>
      <h2 style={stepTitle}>Select Your Destination State</h2>
      <p style={stepDesc}>Choose a state to explore amazing cities and attractions</p>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search states..."
          value={stateSearch}
          onChange={(e) => setStateSearch(e.target.value)}
          style={{ paddingLeft: '2.8rem', borderRadius: '14px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {filteredStates.map((state, i) => {
          const isSelected = selectedState?._id === state._id;
          return (
            <motion.div
              key={state._id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setSelectedState(state); setSelectedCities([]); setSelectedAttractions({}); }}
              style={{
                padding: '1.2rem 0.75rem', borderRadius: '18px', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.3s',
                background: isSelected ? 'linear-gradient(135deg, var(--forest-600), var(--forest-500))' : '#fff',
                color: isSelected ? '#fff' : 'var(--text-primary)',
                border: isSelected ? '2px solid var(--forest-500)' : '2px solid var(--sand-200)',
                boxShadow: isSelected ? '0 6px 24px rgba(56,142,60,0.25)' : 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
                {['🏔️', '🏜️', '🌊', '🌴', '🏰', '⛰️', '🌺', '🌳', '🏖️', '🦁'][i % 10]}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{state.name}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem' }}>
                {state.cities_count || 0} cities
              </div>
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ marginTop: '0.4rem', display: 'flex', justifyContent: 'center' }}>
                  <FiCheck style={{ fontSize: '1.1rem' }} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 style={stepTitle}>Select Cities in {selectedState?.name}</h2>
      <p style={stepDesc}>Pick one or more cities you want to visit</p>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search cities..."
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          style={{ paddingLeft: '2.8rem', borderRadius: '14px' }}
        />
      </div>

      {selectedCities.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {selectedCities.map((c) => (
            <span key={c._id} style={{
              background: 'var(--forest-100)', color: 'var(--forest-700)',
              padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              <FiMapPin style={{ fontSize: '0.75rem' }} /> {c.name}
              <FiTrash2
                style={{ fontSize: '0.7rem', cursor: 'pointer', marginLeft: '0.25rem' }}
                onClick={() => toggleCity(c)}
              />
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
        {filteredCities.length === 0 && !loading ? (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
            {cities.length === 0 ? 'Loading cities...' : 'No cities found'}
          </p>
        ) : filteredCities.map((city, i) => {
          const isSelected = selectedCities.some((c) => c._id === city._id);
          return (
            <motion.div
              key={city._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCity(city)}
              style={{
                borderRadius: '18px', overflow: 'hidden', cursor: 'pointer',
                border: isSelected ? '2px solid var(--forest-500)' : '2px solid transparent',
                background: '#fff', boxShadow: isSelected ? '0 4px 20px rgba(56,142,60,0.2)' : 'var(--shadow-sm)',
                transition: 'all 0.3s',
              }}
            >
              <div style={{
                height: '120px', background: `linear-gradient(135deg, hsl(${(i * 37) % 60 + 100}, 40%, 85%), hsl(${(i * 53) % 60 + 200}, 40%, 85%))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span style={{ fontSize: '2.5rem' }}>🏙️</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'var(--forest-500)', color: '#fff', borderRadius: '50%',
                      width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <FiCheck />
                  </motion.div>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{city.name}</h4>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <FiCamera /> {city.attractions_count || 0} spots
                  </span>
                  {city.famous_for && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <FiStar /> {city.famous_for}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 style={stepTitle}>Choose Attractions</h2>
      <p style={stepDesc}>Select must-visit places in each city</p>

      {/* City Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
        {selectedCities.map((city) => {
          const count = (selectedAttractions[city._id] || []).length;
          return (
            <button
              key={city._id}
              onClick={() => setActiveCityTab(city._id)}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none',
                background: activeCityTab === city._id ? 'var(--forest-600)' : 'var(--sand-100)',
                color: activeCityTab === city._id ? '#fff' : 'var(--text-primary)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              {city.name}
              {count > 0 && (
                <span style={{
                  background: activeCityTab === city._id ? 'rgba(255,255,255,0.3)' : 'var(--forest-100)',
                  padding: '0.1rem 0.45rem', borderRadius: '10px', fontSize: '0.7rem',
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cost tracker */}
      <div style={{
        background: 'linear-gradient(135deg, #fff3e0, #fff8e1)',
        borderRadius: '14px', padding: '0.85rem 1.2rem', marginBottom: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <FiDollarSign style={{ color: 'var(--warning-500)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Attraction Fees</span>
        </div>
        <span style={{ fontWeight: 700, color: 'var(--earth-700)' }}>
          ₹{Object.values(selectedAttractions).flat().reduce((s, a) => s + (a.entry_fee || 0), 0).toLocaleString()}
        </span>
      </div>

      {/* Attractions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
        {(attractionsByCity[activeCityTab] || []).map((attr) => {
          const isSelected = (selectedAttractions[activeCityTab] || []).some((a) => a._id === attr._id);
          return (
            <motion.div
              key={attr._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleAttraction(activeCityTab, attr)}
              style={{
                borderRadius: '16px', padding: '1rem', cursor: 'pointer',
                background: isSelected ? 'var(--forest-50)' : '#fff',
                border: isSelected ? '2px solid var(--forest-400)' : '2px solid var(--sand-200)',
                boxShadow: isSelected ? '0 4px 16px rgba(76,175,80,0.15)' : 'var(--shadow-sm)',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{attr.name}</h4>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <div style={{
                      background: 'var(--forest-500)', color: '#fff', borderRadius: '50%',
                      width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiCheck style={{ fontSize: '0.8rem' }} />
                    </div>
                  </motion.div>
                )}
              </div>
              {attr.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {attr.description?.substring(0, 80)}...
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {attr.entry_fee > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MdCurrencyRupee /> ₹{attr.entry_fee}
                  </span>
                )}
                {attr.visit_duration && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MdAccessTime /> {attr.visit_duration}
                  </span>
                )}
                {attr.rating && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#ffc107' }}>
                    <FiStar style={{ fill: '#ffc107' }} /> {attr.rating}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
        {(attractionsByCity[activeCityTab] || []).length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', gridColumn: '1/-1' }}>
            Loading attractions...
          </p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h2 style={stepTitle}>Choose Travel Mode</h2>
      <p style={stepDesc}>How would you like to travel?</p>

      <div style={{
        background: 'var(--sky-100)', borderRadius: '16px', padding: '1rem',
        marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <MdLocationOn style={{ color: 'var(--sky-600)', fontSize: '1.3rem', flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Route: </span>
          <span style={{ fontWeight: 600 }}>Your City → {selectedCities.map((c) => c.name).join(' → ')}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
        {TRAVEL_MODES.map((mode) => {
          const isSelected = travelMode === mode.id;
          return (
            <motion.div
              key={mode.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTravelMode(mode.id)}
              style={{
                padding: '1.5rem', borderRadius: '20px', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.3s',
                background: isSelected ? mode.bg : '#fff',
                border: isSelected ? `2px solid ${mode.color}` : '2px solid var(--sand-200)',
                boxShadow: isSelected ? `0 6px 24px ${mode.color}30` : 'var(--shadow-sm)',
              }}
            >
              <mode.icon style={{ fontSize: '2.5rem', color: mode.color, marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: isSelected ? mode.color : 'var(--text-primary)' }}>{mode.label}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{mode.desc}</p>
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginTop: '0.5rem' }}>
                  <FiCheck style={{ color: mode.color, fontSize: '1.3rem' }} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderStep5 = () => {
    const options = MOCK_TRANSPORT[travelMode] || [];
    return (
      <div>
        <h2 style={stepTitle}>Book Transport {travelMode === 'car' ? '(Self Drive)' : ''}</h2>
        <p style={stepDesc}>
          {travelMode === 'car' ? 'You\'ve chosen self-drive. Skip this step or book a rental.' : 'Choose from available options (optional)'}
        </p>

        {travelMode !== 'car' && options.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['all', 'cheapest', 'fastest'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTransportFilter(f)}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
                    background: transportFilter === f ? 'var(--forest-600)' : 'var(--sand-100)',
                    color: transportFilter === f ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {options
                .sort((a, b) => transportFilter === 'cheapest' ? a.price - b.price : transportFilter === 'fastest' ? a.duration.localeCompare(b.duration) : 0)
                .map((opt) => {
                  const isSelected = selectedTransport?.id === opt.id;
                  return (
                    <motion.div
                      key={opt.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedTransport(isSelected ? null : opt)}
                      style={{
                        padding: '1rem 1.2rem', borderRadius: '16px', cursor: 'pointer',
                        background: isSelected ? 'var(--forest-50)' : '#fff',
                        border: isSelected ? '2px solid var(--forest-400)' : '2px solid var(--sand-200)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>{opt.operator}</h4>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span>{opt.departure} → {opt.arrival}</span>
                          <span>• {opt.duration}</span>
                          <span>• {opt.class}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--forest-700)' }}>₹{opt.price.toLocaleString()}</div>
                        {isSelected && <FiCheck style={{ color: 'var(--forest-500)', marginTop: '0.2rem' }} />}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </>
        )}

        <div style={{
          background: 'var(--sand-100)', borderRadius: '14px', padding: '1rem',
          marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <FiInfo style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            This step is optional. You can skip and book transport later.
          </p>
        </div>
      </div>
    );
  };

  const renderStep6 = () => (
    <div>
      <h2 style={stepTitle}>Select Hotels</h2>
      <p style={stepDesc}>Choose accommodation for each city</p>

      {/* City Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
        {selectedCities.map((city) => (
          <button
            key={city._id}
            onClick={() => setActiveHotelCity(city._id)}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none',
              background: activeHotelCity === city._id ? 'var(--forest-600)' : 'var(--sand-100)',
              color: activeHotelCity === city._id ? '#fff' : 'var(--text-primary)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {city.name}
            {selectedHotels[city._id] && <FiCheck style={{ fontSize: '0.75rem' }} />}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['all', 'budget', 'mid-range', 'luxury'].map((f) => (
          <button
            key={f}
            onClick={() => setHotelFilter(f)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '10px', border: 'none',
              background: hotelFilter === f ? 'var(--sky-600)' : 'var(--sand-100)',
              color: hotelFilter === f ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Hotels Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(hotelsByCity[activeHotelCity] || [])
          .filter((h) => hotelFilter === 'all' || h.category === hotelFilter)
          .map((hotel) => {
            const isSelected = selectedHotels[activeHotelCity]?._id === hotel._id;
            return (
              <motion.div
                key={hotel._id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setSelectedHotels((prev) => ({
                    ...prev,
                    [activeHotelCity]: isSelected ? null : hotel,
                  }));
                }}
                style={{
                  padding: '1.1rem', borderRadius: '16px', cursor: 'pointer',
                  background: isSelected ? 'var(--forest-50)' : '#fff',
                  border: isSelected ? '2px solid var(--forest-400)' : '2px solid var(--sand-200)',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.15rem' }}>{hotel.name}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {hotel.rating && <span style={{ color: '#ffc107', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        <FiStar style={{ fill: '#ffc107' }} /> {hotel.rating}</span>}
                      <span>{hotel.category || 'Standard'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--forest-700)' }}>₹{hotel.price_per_night?.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per night</div>
                  </div>
                </div>
                {hotel.amenities?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {hotel.amenities.slice(0, 4).map((a, i) => (
                      <span key={i} style={{
                        background: 'var(--sand-100)', padding: '0.15rem 0.5rem',
                        borderRadius: '8px', fontSize: '0.7rem', color: 'var(--text-muted)',
                      }}>{a}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        {(hotelsByCity[activeHotelCity] || []).length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading hotels...</p>
        )}
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div>
      <h2 style={stepTitle}>Your Journey Summary</h2>
      <p style={stepDesc}>Review your AI-generated itinerary</p>

      {/* Trip Details */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem', border: '1px solid var(--sand-200)' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Trip Title *</label>
        <input
          type="text"
          placeholder="e.g., Rajasthan Adventure 2025"
          value={tripTitle}
          onChange={(e) => setTripTitle(e.target.value)}
          style={{ borderRadius: '12px', marginBottom: '1rem' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Start Date *</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ borderRadius: '12px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ borderRadius: '12px' }} />
          </div>
        </div>
      </div>

      {/* Itinerary Overview */}
      <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #e3f2fd)', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>📋 Day-wise Itinerary</h3>
          <button onClick={() => setEditingItinerary(!editingItinerary)} style={{
            background: 'transparent', border: 'none', color: 'var(--forest-600)',
            display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}>
            <FiEdit3 /> Edit
          </button>
        </div>

        {selectedCities.map((city, dayIdx) => (
          <div key={city._id} style={{
            background: 'rgba(255,255,255,0.8)', borderRadius: '14px', padding: '1rem',
            marginBottom: dayIdx < selectedCities.length - 1 ? '0.75rem' : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{
                background: 'var(--forest-500)', color: '#fff', borderRadius: '8px',
                padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 700,
              }}>Day {dayIdx + 1}</span>
              <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{city.name}</h4>
            </div>
            <div style={{ paddingLeft: '0.5rem' }}>
              {(selectedAttractions[city._id] || []).map((attr, j) => (
                <div key={attr._id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.3rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)',
                  borderLeft: '2px solid var(--forest-300)', paddingLeft: '0.75rem', marginLeft: '0.25rem',
                }}>
                  <FiMapPin style={{ fontSize: '0.75rem', color: 'var(--forest-500)', flexShrink: 0 }} />
                  <span>{attr.name}</span>
                  {attr.entry_fee > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>₹{attr.entry_fee}</span>}
                </div>
              ))}
              {selectedHotels[city._id] && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.3rem 0', fontSize: '0.82rem', color: 'var(--sky-600)',
                  borderLeft: '2px solid var(--sky-300)', paddingLeft: '0.75rem', marginLeft: '0.25rem',
                }}>
                  <MdHotel style={{ fontSize: '0.75rem', flexShrink: 0 }} />
                  <span>{selectedHotels[city._id].name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>₹{selectedHotels[city._id].price_per_night}/night</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '1.2rem', border: '1px solid var(--sand-200)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>💰 Price Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Attraction Fees</span>
            <span style={{ fontWeight: 600 }}>₹{Object.values(selectedAttractions).flat().reduce((s, a) => s + (a.entry_fee || 0), 0).toLocaleString()}</span>
          </div>
          {selectedTransport && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transport ({selectedTransport.operator})</span>
              <span style={{ fontWeight: 600 }}>₹{selectedTransport.price.toLocaleString()}</span>
            </div>
          )}
          {Object.entries(selectedHotels).filter(([, h]) => h).map(([cityId, hotel]) => (
            <div key={cityId} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Hotel ({hotel.name})</span>
              <span style={{ fontWeight: 600 }}>₹{hotel.price_per_night?.toLocaleString()}/night</span>
            </div>
          ))}
          <div style={{ borderTop: '2px solid var(--sand-200)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Estimated Total</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--forest-700)' }}>₹{totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div>
      <h2 style={stepTitle}>Traveler Details</h2>
      <p style={stepDesc}>Enter details for all travelers</p>

      {travelers.map((t, idx) => (
        <div key={idx} style={{
          background: '#fff', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem',
          border: t.isPrimary ? '2px solid var(--forest-400)' : '1px solid var(--sand-200)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUsers style={{ color: 'var(--forest-600)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {t.isPrimary ? 'Primary Traveler' : `Traveler ${idx + 1}`}
              </span>
            </div>
            {!t.isPrimary && (
              <button onClick={() => removeTraveler(idx)} style={{
                background: 'var(--danger-100)', border: 'none', borderRadius: '8px',
                padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--danger-500)', fontSize: '0.8rem',
              }}>
                <FiTrash2 />
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Full Name *</label>
              <input
                type="text" placeholder="Enter full name"
                value={t.name} onChange={(e) => updateTraveler(idx, 'name', e.target.value)}
                style={{ borderRadius: '12px' }}
              />
            </div>
            <div>
              <label>Gender</label>
              <select value={t.gender} onChange={(e) => updateTraveler(idx, 'gender', e.target.value)} style={{ borderRadius: '12px' }}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label>Date of Birth</label>
              <input type="date" value={t.dob} onChange={(e) => updateTraveler(idx, 'dob', e.target.value)} style={{ borderRadius: '12px' }} />
            </div>
            <div>
              <label>Phone *</label>
              <input
                type="tel" placeholder="+91 98765 43210"
                value={t.phone} onChange={(e) => updateTraveler(idx, 'phone', e.target.value)}
                style={{ borderRadius: '12px' }}
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email" placeholder="email@example.com"
                value={t.email} onChange={(e) => updateTraveler(idx, 'email', e.target.value)}
                style={{ borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addTraveler}
        style={{
          width: '100%', padding: '0.85rem', borderRadius: '14px',
          background: 'var(--sand-100)', border: '2px dashed var(--sand-200)',
          color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}
      >
        <FiPlus /> Add Another Traveler
      </button>
    </div>
  );

  const renderStep9 = () => (
    <div>
      <h2 style={stepTitle}>Payment</h2>
      <p style={stepDesc}>Secure payment to confirm your booking</p>

      {/* Amount */}
      <div style={{
        background: 'linear-gradient(135deg, #1a4a25, #2d6a3f)',
        borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', color: '#fff',
      }}>
        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.3rem' }}>Total Amount</div>
        <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          ₹{(totalCost * travelers.filter((t) => t.name).length).toLocaleString()}
        </div>
        <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '0.2rem' }}>
          {travelers.filter((t) => t.name).length} traveler(s) × ₹{totalCost.toLocaleString()}
        </div>
      </div>

      {/* Payment Methods */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Payment Method</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { id: 'upi', label: 'UPI', icon: '📱' },
            { id: 'card', label: 'Card', icon: '💳' },
            { id: 'netbanking', label: 'NetBanking', icon: '🏦' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              style={{
                padding: '0.85rem', borderRadius: '14px', border: 'none',
                background: paymentMethod === m.id ? 'var(--forest-50)' : '#fff',
                borderWidth: '2px', borderStyle: 'solid',
                borderColor: paymentMethod === m.id ? 'var(--forest-400)' : 'var(--sand-200)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Payment Form */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '1.2rem', border: '1px solid var(--sand-200)' }}>
          {paymentMethod === 'upi' && (
            <div>
              <label>UPI ID</label>
              <input
                type="text" placeholder="yourname@upi"
                value={upiId} onChange={(e) => setUpiId(e.target.value)}
                style={{ borderRadius: '12px' }}
              />
            </div>
          )}
          {paymentMethod === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label>Card Number</label>
                <input
                  type="text" placeholder="1234 5678 9012 3456"
                  value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                  style={{ borderRadius: '12px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.75rem' }}>
                <div>
                  <label>Expiry</label>
                  <input
                    type="text" placeholder="MM/YY"
                    value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  />
                </div>
                <div>
                  <label>CVV</label>
                  <input
                    type="password" placeholder="***"
                    value={cardCvv} onChange={(e) => setCardCvv(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  />
                </div>
              </div>
            </div>
          )}
          {paymentMethod === 'netbanking' && (
            <div>
              <label>Select Bank</label>
              <select style={{ borderRadius: '12px' }}>
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Security */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem', borderRadius: '12px', background: 'var(--success-100)',
        fontSize: '0.82rem', color: 'var(--forest-700)', marginBottom: '1.5rem',
      }}>
        <FiShield /> Your payment is secured with 256-bit SSL encryption
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={processing}
        className="btn-primary"
        style={{
          width: '100%', padding: '1.1rem', fontSize: '1.05rem', borderRadius: '16px',
          fontWeight: 700, opacity: processing ? 0.7 : 1,
          background: 'linear-gradient(135deg, #2d6a3f, #388e3c)',
          boxShadow: '0 6px 24px rgba(56,142,60,0.3)',
        }}
      >
        {processing ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            Processing...
          </span>
        ) : (
          <>
            <FiCreditCard />
            Pay ₹{(totalCost * travelers.filter((t) => t.name).length).toLocaleString()}
          </>
        )}
      </button>
    </div>
  );

  const stepRenderers = { 1: renderStep1, 2: renderStep2, 3: renderStep3, 4: renderStep4, 5: renderStep5, 6: renderStep6, 7: renderStep7, 8: renderStep8, 9: renderStep9 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '120px' }}>
      {/* Progress Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0',
        background: 'rgba(250,253,247,0.98)',
        borderBottom: '1px solid var(--sand-200)',
      }}>
        <div className="container">
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => step === 1 ? navigate(-1) : goBack()}
              style={{ background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              <FiChevronLeft style={{ fontSize: '1.3rem' }} />
            </button>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1, textAlign: 'center' }}>
              {STEPS[step - 1].icon} {STEPS[step - 1].label}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{step}/9</span>
          </div>
          {/* Progress bar */}
          <div style={{ height: '4px', background: 'var(--sand-200)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${(step / 9) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--forest-500), var(--forest-400))', borderRadius: '4px' }}
            />
          </div>
          {/* Mini step dots */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0 0.25rem' }}>
            {STEPS.map((s) => (
              <div
                key={s.num}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: s.num <= step ? 'var(--forest-500)' : 'var(--sand-200)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container" style={{ marginTop: '1.5rem' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {stepRenderers[step]()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav Buttons */}
      {step < 9 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.98)',
          padding: '1rem 1.5rem', borderTop: '1px solid var(--sand-200)',
          display: 'flex', gap: '0.75rem', zIndex: 50,
        }}>
          {step > 1 && (
            <button
              onClick={goBack}
              style={{
                flex: 1, padding: '0.85rem', borderRadius: '14px',
                background: 'var(--sand-100)', border: '1px solid var(--sand-200)',
                fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)',
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="btn-primary"
            style={{
              flex: 2, padding: '0.85rem', borderRadius: '14px',
              opacity: canProceed() ? 1 : 0.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            {step === 5 || step === 6 ? (canProceed() ? 'Continue' : 'Skip') : 'Continue'}
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* Cost Floating Badge */}
      {totalCost > 0 && step >= 3 && step <= 7 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'fixed', bottom: step < 9 ? '80px' : '20px', right: '20px',
            background: 'var(--forest-700)', color: '#fff',
            padding: '0.5rem 1rem', borderRadius: '20px',
            fontSize: '0.82rem', fontWeight: 700, zIndex: 40,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          💰 ₹{totalCost.toLocaleString()}
        </motion.div>
      )}
    </div>
  );
}

const stepTitle = { fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', marginBottom: '0.3rem' };
const stepDesc = { fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' };
