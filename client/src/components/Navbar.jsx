import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top border-bottom border-secondary border-opacity-25 py-3 shadow-lg">
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4">
          <span className="badge bg-danger rounded-pill px-3 py-2 fs-6 shadow-sm">
            <i className="bi bi-film me-1"></i> I-MOVIES
          </span>
          <span className="text-white-50 fs-6 fw-normal d-none d-sm-inline">Cinema Box</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#imoviesNavbar"
          aria-controls="imoviesNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="imoviesNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-danger fw-semibold' : 'text-light'}`}>
                <i className="bi bi-house-door me-1"></i> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/movies" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-danger fw-semibold' : 'text-light'}`}>
                <i className="bi bi-collection-play me-1"></i> Movies
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink to="/my-bookings" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-danger fw-semibold' : 'text-light'}`}>
                  <i className="bi bi-ticket-perforated me-1"></i> My Tickets
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-warning fw-semibold' : 'text-warning'}`}>
                  <i className="bi bi-speedometer2 me-1"></i> Admin Panel
                </NavLink>
              </li>
            )}
          </ul>

          {/* User Auth Section */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2 text-light rounded-pill px-3 py-1 border-opacity-50"
                  type="button"
                  id="userMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="rounded-circle"
                    style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                  />
                  <span className="small fw-medium text-truncate" style={{ maxWidth: '120px' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  {isAdmin && <span className="badge bg-warning text-dark rounded-pill ms-1 font-monospace" style={{ fontSize: '0.65rem' }}>ADMIN</span>}
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg border-secondary border-opacity-50 mt-2" aria-labelledby="userMenuButton">
                  <li className="dropdown-header text-white-50 small">
                    Signed in as <br /><strong className="text-light">{user.email}</strong>
                  </li>
                  <li><hr className="dropdown-divider border-secondary border-opacity-25" /></li>
                  <li>
                    <Link to="/profile" className="dropdown-item py-2">
                      <i className="bi bi-person-gear me-2"></i> My Account & Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-bookings" className="dropdown-item py-2">
                      <i className="bi bi-ticket-detailed me-2"></i> Booking History
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link to="/admin" className="dropdown-item py-2 text-warning">
                        <i className="bi bi-shield-lock me-2"></i> Box Office Analytics
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider border-secondary border-opacity-25" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item py-2 text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light rounded-pill px-3 py-1 btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-danger rounded-pill px-3 py-1 btn-sm fw-medium shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
