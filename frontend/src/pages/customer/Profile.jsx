import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiLock, FiChevronRight, FiLogOut, FiHeart,
  FiCreditCard, FiMapPin, FiStar, FiBell, FiGlobe, FiShield, FiEdit3,
  FiCamera, FiSettings, FiHelpCircle, FiFileText, FiUsers,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authAPI, customerAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState({ trips: 0, places: 0 });

  useEffect(() => {
    if (user?.role === 'customer') {
      customerAPI.getTrips().then(r => {
        const trips = r.data.trips || r.data.items || [];
        const places = trips.reduce((acc, t) => acc + (t.cities?.length || 0), 0);
        setStats({ trips: trips.length, places });
      }).catch(() => {});
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name, phone });
      updateUser?.(res.data.user || { ...user, name, phone });
      toast.success('Profile updated!');
      setActiveSection(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error('Fill all password fields');
    if (newPassword !== confirmPassword) return toast.error('Passwords don\'t match');
    if (newPassword.length < 8) return toast.error('Password must be 8+ characters');
    setSaving(true);
    try {
      await authAPI.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const MENU_SECTIONS = [
    {
      title: 'Account',
      items: [
        { id: 'edit-profile', icon: FiEdit3, label: 'Edit Profile', color: '#43a047', desc: 'Name, phone, photo' },
        { id: 'saved-travelers', icon: FiUsers, label: 'Saved Travelers', color: '#1e88e5', desc: 'Manage co-travelers' },
        { id: 'change-password', icon: FiLock, label: 'Change Password', color: '#ff7043', desc: 'Update your password' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'saved-places', icon: FiHeart, label: 'Saved Places', color: '#ef5350', desc: 'Wishlisted destinations' },
        { id: 'payment-methods', icon: FiCreditCard, label: 'Payment Methods', color: '#8e24aa', desc: 'Saved cards & UPI' },
        { id: 'my-reviews', icon: FiStar, label: 'My Reviews', color: '#ffc107', desc: 'Trip reviews & ratings' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { id: 'notifications', icon: FiBell, label: 'Notifications', color: '#1e88e5', desc: 'Push & email alerts', toggle: true },
        { id: 'language', icon: FiGlobe, label: 'Language', color: '#43a047', desc: 'English', arrow: true },
        { id: 'privacy', icon: FiShield, label: 'Privacy & Security', color: '#607d8b', desc: 'Data & permissions' },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 'help', icon: FiHelpCircle, label: 'Help Center', color: '#1e88e5', desc: 'FAQs & support' },
        { id: 'terms', icon: FiFileText, label: 'Terms & Conditions', color: '#607d8b', desc: 'Legal information' },
      ],
    },
  ];

  const handleMenuClick = (id) => {
    if (id === 'notifications') {
      setNotificationsEnabled(!notificationsEnabled);
      toast.success(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled');
      return;
    }
    if (['saved-places', 'payment-methods', 'my-reviews', 'saved-travelers', 'language', 'privacy', 'help', 'terms'].includes(id)) {
      toast('Coming soon!', { icon: '🚧' });
      return;
    }
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a4a25 0%, #2d6a3f 40%, #1b3a5c 100%)',
        padding: '2rem 1.5rem 3.5rem', borderRadius: '0 0 32px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--forest-300), var(--sky-300))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', fontWeight: 700, color: '#fff',
                border: '3px solid rgba(255,255,255,0.3)',
              }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#fff', border: '2px solid var(--forest-300)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--forest-600)',
              }}>
                <FiCamera style={{ fontSize: '0.75rem' }} />
              </button>
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>{user?.name || 'User'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: '0.15rem 0 0 0' }}>{user?.email}</p>
              <span style={{
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                padding: '0.15rem 0.6rem', borderRadius: '10px',
                fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize',
                display: 'inline-block', marginTop: '0.3rem',
              }}>
                {user?.role || 'customer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-1.5rem' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 100px), 1fr))', gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {[
            { val: stats.trips, label: 'Trips', icon: FiMapPin, color: '#43a047', bg: '#e8f5e9' },
            { val: stats.places, label: 'Places', icon: FiHeart, color: '#ef5350', bg: '#ffebee' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: '#fff', borderRadius: '16px', padding: '1rem',
                textAlign: 'center', boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--sand-200)',
              }}
            >
              <stat.icon style={{ fontSize: '1.2rem', color: stat.color, marginBottom: '0.3rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
              {section.title}
            </h3>
            <div style={{ background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid var(--sand-200)' }}>
              {section.items.map((item, i) => (
                <div key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    style={{
                      width: '100%', padding: '0.85rem 1rem',
                      background: activeSection === item.id ? 'var(--forest-50)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      borderBottom: i < section.items.length - 1 ? '1px solid var(--sand-100)' : 'none',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '12px',
                      background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color, flexShrink: 0,
                    }}>
                      <item.icon style={{ fontSize: '1rem' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    {item.toggle ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '44px', height: '24px', borderRadius: '12px',
                          background: notificationsEnabled ? 'var(--forest-500)' : 'var(--sand-200)',
                          position: 'relative', transition: 'background 0.3s', cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: '#fff', position: 'absolute', top: '2px',
                          left: notificationsEnabled ? '22px' : '2px',
                          transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </div>
                    ) : (
                      <FiChevronRight style={{ color: 'var(--text-muted)', fontSize: '1rem' }} />
                    )}
                  </button>

                  {/* Expandable Sections */}
                  <AnimatePresence>
                    {activeSection === 'edit-profile' && item.id === 'edit-profile' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--sand-100)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label>Name</label>
                            <input
                              type="text" value={name} onChange={(e) => setName(e.target.value)}
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                          <div>
                            <label>Phone</label>
                            <input
                              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                          <div>
                            <label>Email</label>
                            <input type="email" value={user?.email || ''} disabled
                              style={{ borderRadius: '12px', opacity: 0.6 }}
                            />
                          </div>
                          <button
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="btn-primary"
                            style={{ borderRadius: '12px', opacity: saving ? 0.6 : 1 }}
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeSection === 'change-password' && item.id === 'change-password' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--sand-100)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label>Current Password</label>
                            <input
                              type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                          <div>
                            <label>New Password</label>
                            <input
                              type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                          <div>
                            <label>Confirm New Password</label>
                            <input
                              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                          <button
                            onClick={handleChangePassword}
                            disabled={saving}
                            className="btn-primary"
                            style={{ borderRadius: '12px', opacity: saving ? 0.6 : 1 }}
                          >
                            {saving ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={logout}
          style={{
            width: '100%', padding: '1rem', borderRadius: '16px',
            background: '#fff', border: '1px solid #ffcdd2',
            color: '#ef5350', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            fontSize: '0.95rem', marginBottom: '1rem',
          }}
        >
          <FiLogOut /> Log Out
        </motion.button>

        {/* App Version */}
        <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Plan My Journey v1.0.0
        </div>
      </div>
    </div>
  );
}
