import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieAPI, showtimeAPI } from '../services/api';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date selection filter for showtimes (e.g. Today, Tomorrow, Day + 2, etc.)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Generate dynamic next 5 days
  const dateOptions = Array.from({ length: 5 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayName, formattedDate };
  });

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const { data } = await movieAPI.getById(id);
        if (data.success) {
          setMovie(data.movie);
          setShowtimes(data.showtimes || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Filter showtimes matching selected date
  const filteredShowtimes = showtimes.filter((st) => st.date === selectedDate);

  // Group showtimes by screen name
  const showtimesByScreen = {};
  filteredShowtimes.forEach((st) => {
    const screenName = st.screenName || 'Main Cinema Hall';
    if (!showtimesByScreen[screenName]) {
      showtimesByScreen[screenName] = {
        screenType: st.screenType || 'Standard',
        slots: []
      };
    }
    showtimesByScreen[screenName].slots.push(st);
  });

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5 text-danger">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="alert alert-danger d-inline-block p-4 rounded-4">
          <i className="bi bi-exclamation-triangle fs-1 text-danger d-block mb-3"></i>
          <h4>Unable to find movie</h4>
          <p className="text-secondary small mb-3">{error || 'This movie listing does not exist.'}</p>
          <Link to="/movies" className="btn btn-outline-light rounded-pill px-4">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail-page pb-5">
      {/* Movie Hero Banner Backdrop */}
      <div
        className="movie-backdrop-header position-relative overflow-hidden mb-4"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%), linear-gradient(to right, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.6) 100%), url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          minHeight: '420px'
        }}
      >
        <div className="container position-relative py-5">
          <div className="row g-4 align-items-center">
            {/* Poster thumbnail */}
            <div className="col-md-3 col-sm-4 text-center text-sm-start">
              <div className="position-relative d-inline-block rounded-4 overflow-hidden shadow-2xl border border-secondary border-opacity-50">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="img-fluid object-fit-cover"
                  style={{ width: '240px', height: '350px' }}
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="col-md-9 col-sm-8 text-light">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className={`badge rounded-pill px-3 py-1 font-monospace ${movie.status === 'Now Showing' ? 'bg-danger' : 'bg-primary'}`}>
                  {movie.status}
                </span>
                <span className="badge bg-black bg-opacity-75 text-warning border border-warning border-opacity-50 rounded-pill px-3 py-1">
                  <i className="bi bi-star-fill text-warning me-1"></i> {movie.imdbRating?.toFixed(1) || '8.0'} IMDb
                </span>
                <span className="badge bg-dark border border-secondary text-white-50 rounded-pill px-2 py-1">
                  {movie.rating}
                </span>
                <span className="text-secondary small ms-1">
                  <i className="bi bi-clock me-1"></i> {formatDuration(movie.duration)}
                </span>
                <span className="text-secondary small ms-2">
                  <i className="bi bi-translate me-1"></i> {movie.language}
                </span>
              </div>

              <h1 className="display-5 fw-black text-light tracking-tight mb-2">
                {movie.title}
              </h1>

              {/* Genre Pills */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genres?.map((g, idx) => (
                  <span key={idx} className="badge bg-secondary bg-opacity-25 border border-secondary border-opacity-50 text-light px-3 py-1 rounded-pill font-monospace" style={{ fontSize: '0.8rem' }}>
                    {g}
                  </span>
                ))}
              </div>

              <p className="lead text-light text-opacity-80 mb-3" style={{ maxWidth: '750px', fontSize: '1rem' }}>
                {movie.synopsis}
              </p>

              {/* Director & Cast */}
              <div className="small text-secondary mb-4">
                {movie.director && (
                  <div className="mb-1">
                    <strong className="text-light">Director:</strong> {movie.director}
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <strong className="text-light">Starring:</strong> {movie.cast.join(', ')}
                  </div>
                )}
              </div>

              {/* Watch trailer button */}
              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light rounded-pill px-4 btn-sm d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-play-circle text-danger fs-6"></i> Official Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Showtime Selection Section */}
        {movie.status === 'Now Showing' ? (
          <section className="bg-black bg-opacity-75 p-4 rounded-4 border border-secondary border-opacity-25 shadow-lg mb-5">
            <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary border-opacity-25 gap-3">
              <div>
                <h4 className="fw-bold text-light mb-1">
                  <i className="bi bi-ticket-perforated-fill text-danger me-2"></i>Select Show Date & Time
                </h4>
                <p className="text-secondary small mb-0">Choose your preferred screening hall, format, and showtime to pick seats.</p>
              </div>

              {/* Date Selector Pills */}
              <div className="d-flex gap-2 overflow-x-auto pb-1">
                {dateOptions.map(({ dateStr, dayName, formattedDate }) => (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`btn text-center rounded-3 px-3 py-2 transition-all ${
                      selectedDate === dateStr
                        ? 'btn-danger shadow-md'
                        : 'btn-dark border border-secondary text-white-50'
                    }`}
                    style={{ minWidth: '85px' }}
                  >
                    <span className="small text-uppercase font-monospace d-block" style={{ fontSize: '0.7rem' }}>
                      {dayName}
                    </span>
                    <strong className="fs-6 d-block">{formattedDate}</strong>
                  </button>
                ))}
              </div>
            </div>

            {/* Screen & Showtime Slots */}
            {Object.keys(showtimesByScreen).length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                <p className="mb-0">No screenings scheduled for this selected date. Try choosing another day.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {Object.entries(showtimesByScreen).map(([screenName, screenData]) => (
                  <div key={screenName} className="p-3 bg-dark bg-opacity-40 rounded-3 border border-secondary border-opacity-25">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-tv text-danger fs-5"></i>
                        <h6 className="fw-bold text-light mb-0">{screenName}</h6>
                        <span className="badge bg-secondary bg-opacity-50 text-light border border-secondary border-opacity-50 font-monospace small">
                          {screenData.screenType}
                        </span>
                      </div>
                      <span className="text-white-50 small">
                        Pricing: <strong className="text-warning">$22 VIP</strong> • <strong className="text-info">$18 Prem</strong> • <strong className="text-light">$14 Std</strong>
                      </span>
                    </div>

                    {/* Time Slot Buttons */}
                    <div className="d-flex flex-wrap gap-3">
                      {screenData.slots.map((slot) => (
                        <Link
                          key={slot._id}
                          to={`/book/${slot._id}`}
                          className="btn btn-outline-danger px-4 py-2 rounded-3 text-light d-flex flex-column align-items-center text-decoration-none shadow-sm hover-btn-danger"
                        >
                          <strong className="fs-6 text-light">{slot.time}</strong>
                          <span className="text-white-50 font-monospace" style={{ fontSize: '0.65rem' }}>
                            {screenData.screenType}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="p-5 text-center bg-black bg-opacity-75 rounded-4 border border-secondary border-opacity-25 shadow-lg mb-5">
            <i className="bi bi-clock-history fs-1 text-primary d-block mb-3"></i>
            <h4 className="fw-bold text-light">Advance Reservations Opening Soon</h4>
            <p className="text-secondary small mb-3">
              This movie is scheduled for premiere on {new Date(movie.releaseDate).toLocaleDateString()}. Check back soon for ticket bookings.
            </p>
            <Link to="/movies" className="btn btn-outline-light rounded-pill px-4 btn-sm">
              Explore Now Showing Films
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
