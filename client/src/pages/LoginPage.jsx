import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Invalid login credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div className="container py-5 my-md-4">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7 col-sm-10">
          <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-2xl p-4 p-md-5">
            {/* Header */}
            <div className="text-center mb-4">
              <span className="badge bg-danger rounded-pill px-3 py-1 font-monospace mb-2">
                <i className="bi bi-film me-1"></i> I-MOVIES
              </span>
              <h3 className="fw-bold mb-1">Welcome Back</h3>
              <p className="text-secondary small">Sign in to your cinema account to book tickets</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-white-50 small">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <label className="form-label text-white-50 small">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-danger w-100 py-2 rounded-pill fw-bold shadow-lg mb-3 d-flex align-items-center justify-content-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i> Sign In
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
              <span className="text-white-50 small d-block mb-2 text-center">Quick Demo Login:</span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('admin@imovies.com', 'admin123')}
                  className="btn btn-outline-warning btn-sm rounded-pill w-50 py-1"
                >
                  <i className="bi bi-shield-lock me-1"></i> Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('user@imovies.com', 'user123')}
                  className="btn btn-outline-info btn-sm rounded-pill w-50 py-1"
                >
                  <i className="bi bi-person me-1"></i> User Demo
                </button>
              </div>
            </div>

            <div className="text-center mt-4 pt-2 text-secondary small">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger text-decoration-none fw-semibold">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
