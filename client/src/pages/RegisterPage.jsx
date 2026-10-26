import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register({ name, email, password, phone });
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 my-md-4">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7 col-sm-10">
          <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-2xl p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="badge bg-danger rounded-pill px-3 py-1 font-monospace mb-2">
                <i className="bi bi-film me-1"></i> I-MOVIES
              </span>
              <h3 className="fw-bold mb-1">Create Account</h3>
              <p className="text-secondary small">Join IMovies for fast reservations and exclusive perks</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-white-50 small">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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

              <div className="mb-3">
                <label className="form-label text-white-50 small">Phone Number (Optional)</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="tel"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="form-label text-white-50 small">Password</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-white-50 small">Confirm</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check-fill"></i> Complete Registration
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3 text-secondary small">
              Already have an account?{' '}
              <Link to="/login" className="text-danger text-decoration-none fw-semibold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
