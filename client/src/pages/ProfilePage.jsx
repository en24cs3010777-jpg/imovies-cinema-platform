import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    try {
      setLoadingProfile(true);
      const { data } = await authAPI.updateProfile({ name, phone, avatar });
      if (data.success) {
        updateUser(data.user);
        setProfileMsg({ type: 'success', text: 'Profile details updated successfully.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.message });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    try {
      setLoadingPassword(true);
      const { data } = await authAPI.changePassword({ currentPassword, newPassword });
      if (data.success) {
        setPasswordMsg({ type: 'success', text: 'Password has been updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: err.message });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="container py-4 pb-5">
      {/* Header */}
      <div className="mb-4">
        <span className="badge bg-danger rounded-pill px-3 py-1 font-monospace mb-2">MY ACCOUNT</span>
        <h2 className="fw-bold text-light mb-1">User Profile & Settings</h2>
        <p className="text-secondary small mb-0">Manage your cinema account information, phone number, and security preferences.</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-lg-4">
          <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-lg p-4 text-center">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={user?.name}
                className="rounded-circle shadow-lg border border-2 border-danger"
                style={{ width: '110px', height: '110px', objectFit: 'cover' }}
              />
              <span className={`badge position-absolute bottom-0 end-0 rounded-pill ${user?.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>

            <h5 className="fw-bold mb-1">{user?.name}</h5>
            <p className="text-secondary small font-monospace mb-3">{user?.email}</p>

            <div className="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25 text-start small mb-3">
              <div className="mb-2">
                <span className="text-white-50 d-block">Account Role:</span>
                <strong className="text-light">{user?.role === 'admin' ? 'Cinema Director / Administrator' : 'Cinema Club Patron'}</strong>
              </div>
              <div className="mb-2">
                <span className="text-white-50 d-block">Phone:</span>
                <strong className="text-light">{user?.phone || 'Not configured'}</strong>
              </div>
              <div>
                <span className="text-white-50 d-block">Account Status:</span>
                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">Active & Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Forms */}
        <div className="col-lg-8">
          <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-lg p-4 mb-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-person-gear text-danger me-2"></i>Personal Information
            </h5>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type} py-2 small rounded-3 mb-3`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Full Name</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Email Address (Immutable)</label>
                  <input
                    type="email"
                    className="form-control bg-dark text-secondary border-secondary"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control bg-dark text-light border-secondary"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50 small">Avatar Image URL</label>
                  <input
                    type="url"
                    className="form-control bg-dark text-light border-secondary"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  />
                </div>
                <div className="col-12 text-end">
                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="btn btn-danger rounded-pill px-4 fw-medium btn-sm"
                  >
                    {loadingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-lg p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-shield-lock text-danger me-2"></i>Change Security Password
            </h5>

            {passwordMsg.text && (
              <div className={`alert alert-${passwordMsg.type} py-2 small rounded-3 mb-3`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label text-white-50 small">Current Password</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-white-50 small">New Password</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-white-50 small">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="col-12 text-end">
                  <button
                    type="submit"
                    disabled={loadingPassword}
                    className="btn btn-outline-light rounded-pill px-4 btn-sm"
                  >
                    {loadingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
