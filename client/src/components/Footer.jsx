import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white-50 border-top border-secondary border-opacity-25 pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-danger rounded-pill px-3 py-2 fs-6">
                <i className="bi bi-film me-1"></i> I-MOVIES
              </span>
              <span className="text-light fw-bold fs-5">Cinema Experience</span>
            </div>
            <p className="small mb-3 text-secondary">
              The premier cinema ticket reservation platform. Experience Hollywood & international blockbusters with real-time seat tracking, IMAX 3D, and Dolby Atmos audio immersion.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-dark border border-secondary text-secondary">React.js</span>
              <span className="badge bg-dark border border-secondary text-secondary">Express.js</span>
              <span className="badge bg-dark border border-secondary text-secondary">MongoDB</span>
              <span className="badge bg-dark border border-secondary text-secondary">Bootstrap 5</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-light fw-bold text-uppercase small mb-3">Explore</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="text-decoration-none text-secondary hover-light">Home</Link></li>
              <li><Link to="/movies?status=Now+Showing" className="text-decoration-none text-secondary hover-light">Now Showing</Link></li>
              <li><Link to="/movies?status=Coming+Soon" className="text-decoration-none text-secondary hover-light">Coming Soon</Link></li>
              <li><Link to="/movies" className="text-decoration-none text-secondary hover-light">All Movies</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-light fw-bold text-uppercase small mb-3">Cinema Hall</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li><i className="bi bi-geo-alt me-2 text-danger"></i> 742 Evergreen Cineplex, Metropolis</li>
              <li><i className="bi bi-telephone me-2 text-danger"></i> +1 (800) 555-FILM</li>
              <li><i className="bi bi-clock me-2 text-danger"></i> Box Office: 10:00 AM - 11:30 PM</li>
              <li><i className="bi bi-shield-check me-2 text-danger"></i> 100% Secure Checkout</li>
            </ul>
          </div>

          {/* Demo Accounts */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-light fw-bold text-uppercase small mb-3">Demo Credentials</h6>
            <div className="p-3 bg-dark bg-opacity-50 rounded border border-secondary border-opacity-25 small">
              <div className="mb-2">
                <span className="badge bg-warning text-dark me-2">Admin</span>
                <span className="text-light font-monospace">admin@imovies.com</span>
                <div className="text-secondary font-monospace ms-4 ps-2">pw: admin123</div>
              </div>
              <div>
                <span className="badge bg-info text-dark me-2">User</span>
                <span className="text-light font-monospace">user@imovies.com</span>
                <div className="text-secondary font-monospace ms-4 ps-1">pw: user123</div>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary border-opacity-25" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-secondary">
          <p className="mb-0">&copy; {new Date().getFullYear()} IMovies Cinema Management. All rights reserved.</p>
          <p className="mb-0">Designed & Engineered with full-stack MERN architecture.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
