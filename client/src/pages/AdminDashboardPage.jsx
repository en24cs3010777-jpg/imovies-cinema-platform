import React, { useState, useEffect } from 'react';
import { adminAPI, movieAPI, showtimeAPI, bookingAPI } from '../services/api';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  // Data collections for management tabs
  const [moviesList, setMoviesList] = useState([]);
  const [showtimesList, setShowtimesList] = useState([]);
  const [screensList, setScreensList] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  // Add Movie Form Modal State
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    synopsis: '',
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    genres: 'Action, Sci-Fi',
    duration: 120,
    language: 'English',
    rating: 'PG-13',
    imdbRating: 8.0,
    director: '',
    cast: '',
    status: 'Now Showing',
    isFeatured: false
  });

  // Schedule Showtime Form State
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    screenId: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:30 PM'
  });

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, moviesRes, showtimesRes, screensRes, bookingsRes] = await Promise.all([
        adminAPI.getStats(),
        movieAPI.getMovies({}),
        showtimeAPI.getShowtimes({}),
        showtimeAPI.getScreens(),
        bookingAPI.getAllAdmin()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setTopMovies(statsRes.data.topGrossingMovies || []);
        setRecentBookings(statsRes.data.recentBookings || []);
      }

      if (moviesRes.data.success) setMoviesList(moviesRes.data.movies);
      if (showtimesRes.data.success) {
        setShowtimesList(showtimesRes.data.showtimes);
        if (moviesRes.data.movies.length > 0 && !showtimeForm.movieId) {
          setShowtimeForm((prev) => ({ ...prev, movieId: moviesRes.data.movies[0]._id }));
        }
      }
      if (screensRes.data.success) {
        setScreensList(screensRes.data.screens);
        if (screensRes.data.screens.length > 0 && !showtimeForm.screenId) {
          setShowtimeForm((prev) => ({ ...prev, screenId: screensRes.data.screens[0]._id }));
        }
      }
      if (bookingsRes.data.success) setAllBookings(bookingsRes.data.bookings);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Save / Update Movie
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        genres: movieForm.genres.split(',').map((g) => g.trim()),
        cast: movieForm.cast.split(',').map((c) => c.trim()),
        duration: Number(movieForm.duration),
        imdbRating: Number(movieForm.imdbRating)
      };

      if (editingMovieId) {
        await movieAPI.update(editingMovieId, payload);
        alert('Movie updated successfully.');
      } else {
        await movieAPI.create(payload);
        alert('New movie added to catalog.');
      }

      setShowMovieModal(false);
      setEditingMovieId(null);
      fetchAdminData();
    } catch (err) {
      alert(`Error saving movie: ${err.message}`);
    }
  };

  // Open Edit Movie Modal
  const handleEditMovieClick = (movie) => {
    setEditingMovieId(movie._id);
    setMovieForm({
      title: movie.title || '',
      synopsis: movie.synopsis || '',
      posterUrl: movie.posterUrl || '',
      bannerUrl: movie.bannerUrl || '',
      trailerUrl: movie.trailerUrl || '',
      genres: movie.genres ? movie.genres.join(', ') : 'Action',
      duration: movie.duration || 120,
      language: movie.language || 'English',
      rating: movie.rating || 'PG-13',
      imdbRating: movie.imdbRating || 8.0,
      director: movie.director || '',
      cast: movie.cast ? movie.cast.join(', ') : '',
      status: movie.status || 'Now Showing',
      isFeatured: !!movie.isFeatured
    });
    setShowMovieModal(true);
  };

  // Delete Movie
  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie and all associated showtimes?')) return;
    try {
      await movieAPI.delete(id);
      fetchAdminData();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Schedule Showtime
  const handleScheduleShowtime = async (e) => {
    e.preventDefault();
    try {
      await showtimeAPI.create(showtimeForm);
      alert('Showtime scheduled successfully!');
      fetchAdminData();
    } catch (err) {
      alert(`Error scheduling showtime: ${err.message}`);
    }
  };

  // Delete Showtime
  const handleDeleteShowtime = async (id) => {
    if (!window.confirm('Remove this showtime from schedule?')) return;
    try {
      await showtimeAPI.delete(id);
      fetchAdminData();
    } catch (err) {
      alert(`Error deleting showtime: ${err.message}`);
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4 pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace mb-2 fw-bold">
            <i className="bi bi-shield-lock me-1"></i> EXECUTIVE CONSOLE
          </span>
          <h2 className="fw-bold text-light mb-1">IMovies Box Office & Theater Operations</h2>
          <p className="text-secondary small mb-0">
            Real-time box office analytics, film catalog scheduling, auditorium management, and master booking transactions.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-outline-secondary rounded-pill btn-sm d-flex align-items-center gap-2">
          <i className="bi bi-arrow-clockwise"></i> Refresh Stats
        </button>
      </div>

      {/* KPI Metric Scorecards */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-50 small font-monospace">TOTAL BOX OFFICE</span>
                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">
                  <i className="bi bi-currency-dollar"></i> Revenue
                </span>
              </div>
              <h3 className="fw-bold text-light mb-0">${stats.totalRevenue.toFixed(2)}</h3>
              <small className="text-secondary">Gross tickets & fee collection</small>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-50 small font-monospace">TICKETS RESERVED</span>
                <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">
                  <i className="bi bi-ticket-perforated"></i> Admissions
                </span>
              </div>
              <h3 className="fw-bold text-light mb-0">{stats.totalTicketsSold}</h3>
              <small className="text-secondary">Across {stats.confirmedBookings} confirmed bookings</small>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-50 small font-monospace">OCCUPANCY RATE</span>
                <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50">
                  <i className="bi bi-percent"></i> Capacity
                </span>
              </div>
              <h3 className="fw-bold text-light mb-0">{stats.occupancyRate}</h3>
              <small className="text-secondary">Auditorium seat utilization</small>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-50 small font-monospace">ACTIVE FILMS</span>
                <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50">
                  <i className="bi bi-film"></i> Screens
                </span>
              </div>
              <h3 className="fw-bold text-light mb-0">{stats.activeMovies}</h3>
              <small className="text-secondary">{stats.totalUsers} registered cinema patrons</small>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-pills gap-2 mb-4 bg-black bg-opacity-50 p-2 rounded-4 border border-secondary border-opacity-25">
        <li className="nav-item">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'overview' ? 'btn-danger fw-bold' : 'text-light'}`}
          >
            <i className="bi bi-graph-up me-2"></i> Box Office Analytics
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            onClick={() => setActiveTab('movies')}
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'movies' ? 'btn-danger fw-bold' : 'text-light'}`}
          >
            <i className="bi bi-film me-2"></i> Manage Movies ({moviesList.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            onClick={() => setActiveTab('showtimes')}
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'showtimes' ? 'btn-danger fw-bold' : 'text-light'}`}
          >
            <i className="bi bi-calendar3 me-2"></i> Showtime Scheduler ({showtimesList.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'bookings' ? 'btn-danger fw-bold' : 'text-light'}`}
          >
            <i className="bi bi-journal-text me-2"></i> All Bookings ({allBookings.length})
          </button>
        </li>
      </ul>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-trophy text-warning me-2"></i>Top Grossing Films
              </h5>
              <div className="d-flex flex-column gap-3">
                {topMovies.map((m, idx) => (
                  <div key={idx} className="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-danger rounded-circle p-2 font-monospace">{idx + 1}</span>
                        <strong className="text-light">{m.title}</strong>
                      </div>
                      <span className="fw-bold text-success">${m.revenue.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-secondary small">
                      <span>{m.tickets} tickets sold ({m.bookingsCount} orders)</span>
                      <span>Genres: {m.genres?.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-clock-history text-danger me-2"></i>Recent Booking Activity
              </h5>
              <div className="d-flex flex-column gap-3">
                {recentBookings.map((b) => (
                  <div key={b._id} className="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25 small">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-light">{b.movie?.title || 'Film'}</strong>
                      <span className="text-danger fw-bold">${b.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="text-secondary mb-1">
                      Patron: <span className="text-light">{b.user?.name || 'Customer'}</span> ({b.seats?.length} seats)
                    </div>
                    <div className="d-flex justify-content-between font-monospace text-white-50" style={{ fontSize: '0.7rem' }}>
                      <span>{b.bookingId}</span>
                      <span>{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Movies */}
      {activeTab === 'movies' && (
        <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Cinema Film Catalog</h5>
            <button
              onClick={() => {
                setEditingMovieId(null);
                setMovieForm({
                  title: '',
                  synopsis: '',
                  posterUrl: '',
                  bannerUrl: '',
                  trailerUrl: '',
                  genres: 'Action, Sci-Fi',
                  duration: 120,
                  language: 'English',
                  rating: 'PG-13',
                  imdbRating: 8.0,
                  director: '',
                  cast: '',
                  status: 'Now Showing',
                  isFeatured: false
                });
                setShowMovieModal(true);
              }}
              className="btn btn-danger rounded-pill px-4 btn-sm fw-medium d-flex align-items-center gap-2"
            >
              <i className="bi bi-plus-circle"></i> Add New Movie
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle border-secondary border-opacity-25">
              <thead>
                <tr className="text-white-50 small font-monospace">
                  <th>POSTER</th>
                  <th>TITLE</th>
                  <th>GENRES</th>
                  <th>RUNTIME</th>
                  <th>RATING</th>
                  <th>STATUS</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {moviesList.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded-2 object-fit-cover shadow-sm"
                        style={{ width: '42px', height: '60px' }}
                      />
                    </td>
                    <td>
                      <strong className="text-light d-block">{m.title}</strong>
                      <span className="text-white-50 small">{m.director}</span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {m.genres?.map((g, i) => (
                          <span key={i} className="badge bg-secondary bg-opacity-25 text-light small font-monospace">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{m.duration} min</td>
                    <td>
                      <span className="badge bg-dark border border-warning text-warning">
                        ⭐ {m.imdbRating}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${m.status === 'Now Showing' ? 'bg-danger' : 'bg-primary'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleEditMovieClick(m)}
                        className="btn btn-outline-light btn-sm rounded-pill me-2"
                        title="Edit Movie"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(m._id)}
                        className="btn btn-outline-danger btn-sm rounded-pill"
                        title="Delete Movie"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Showtime Scheduler */}
      {activeTab === 'showtimes' && (
        <div className="row g-4">
          {/* Schedule Form */}
          <div className="col-lg-4">
            <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-calendar-plus text-danger me-2"></i>Schedule Showtime
              </h5>
              <form onSubmit={handleScheduleShowtime}>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Movie</label>
                  <select
                    className="form-select bg-dark text-light border-secondary"
                    value={showtimeForm.movieId}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                    required
                  >
                    {moviesList.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50 small">Cinema Screen</label>
                  <select
                    className="form-select bg-dark text-light border-secondary"
                    value={showtimeForm.screenId}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, screenId: e.target.value })}
                    required
                  >
                    {screensList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.screenType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50 small">Date</label>
                  <input
                    type="date"
                    className="form-control bg-dark text-light border-secondary"
                    value={showtimeForm.date}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-white-50 small">Showtime</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="e.g. 07:30 PM"
                    value={showtimeForm.time}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, time: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-danger w-100 rounded-pill fw-bold py-2 shadow-lg">
                  <i className="bi bi-plus-lg me-1"></i> Add Showtime to Schedule
                </button>
              </form>
            </div>
          </div>

          {/* Scheduled Shows Table */}
          <div className="col-lg-8">
            <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-4">
              <h5 className="fw-bold mb-3">Scheduled Screenings</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle border-secondary border-opacity-25">
                  <thead>
                    <tr className="text-white-50 small font-monospace">
                      <th>DATE</th>
                      <th>TIME</th>
                      <th>MOVIE</th>
                      <th>SCREEN</th>
                      <th className="text-end">REMOVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showtimesList.map((st) => (
                      <tr key={st._id}>
                        <td>{st.date}</td>
                        <td className="fw-bold text-danger">{st.time}</td>
                        <td>{st.movie?.title || 'Movie'}</td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-50 text-light">
                            {st.screenName}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleDeleteShowtime(st._id)}
                            className="btn btn-outline-danger btn-sm rounded-pill"
                            title="Delete Showtime"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Master Bookings Directory */}
      {activeTab === 'bookings' && (
        <div className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-sm p-4">
          <h5 className="fw-bold mb-3">Master Cinema Bookings Ledger</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle border-secondary border-opacity-25">
              <thead>
                <tr className="text-white-50 small font-monospace">
                  <th>BOOKING ID</th>
                  <th>PATRON</th>
                  <th>MOVIE</th>
                  <th>SEATS</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="font-monospace small text-danger">{b.bookingId}</td>
                    <td>
                      <strong className="text-light d-block">{b.user?.name || 'Patron'}</strong>
                      <span className="text-white-50 small">{b.user?.email}</span>
                    </td>
                    <td>{b.movie?.title || 'Film'}</td>
                    <td>
                      {b.seats?.map((s) => s.seatNumber).join(', ')}
                    </td>
                    <td className="fw-bold text-success">${b.totalAmount?.toFixed(2)}</td>
                    <td className="small text-white-50">{b.paymentMethod}</td>
                    <td>
                      <span className={`badge rounded-pill ${b.bookingStatus === 'Confirmed' ? 'bg-success' : 'bg-secondary'}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showMovieModal && (
        <div className="modal show d-block backdrop-dark-blur" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-light border-secondary rounded-4 shadow-2xl">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">
                  {editingMovieId ? 'Edit Cinema Movie' : 'Add New Movie to Catalog'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMovieModal(false)}></button>
              </div>
              <form onSubmit={handleSaveMovie}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label text-white-50 small">Movie Title</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        value={movieForm.title}
                        onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-white-50 small">Catalog Status</label>
                      <select
                        className="form-select bg-dark text-light border-secondary"
                        value={movieForm.status}
                        onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                      >
                        <option value="Now Showing">Now Showing</option>
                        <option value="Coming Soon">Coming Soon</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-white-50 small">Synopsis</label>
                      <textarea
                        className="form-control bg-dark text-light border-secondary"
                        rows="3"
                        value={movieForm.synopsis}
                        onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Poster Image URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark text-light border-secondary"
                        value={movieForm.posterUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Banner/Backdrop URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark text-light border-secondary"
                        value={movieForm.bannerUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, bannerUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-white-50 small">Genres (comma separated)</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        value={movieForm.genres}
                        onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-white-50 small">Duration (minutes)</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-light border-secondary"
                        value={movieForm.duration}
                        onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-white-50 small">IMDb Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control bg-dark text-light border-secondary"
                        value={movieForm.imdbRating}
                        onChange={(e) => setMovieForm({ ...movieForm, imdbRating: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Director</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        value={movieForm.director}
                        onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Cast (comma separated)</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        value={movieForm.cast}
                        onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isFeaturedCheck"
                          checked={movieForm.isFeatured}
                          onChange={(e) => setMovieForm({ ...movieForm, isFeatured: e.target.checked })}
                        />
                        <label className="form-check-label text-light small" htmlFor="isFeaturedCheck">
                          Feature in Homepage Hero Carousel
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowMovieModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold">
                    {editingMovieId ? 'Update Movie' : 'Add Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
