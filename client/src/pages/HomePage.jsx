import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const HomePage = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, allMoviesRes] = await Promise.all([
          movieAPI.getFeatured(),
          movieAPI.getMovies({})
        ]);

        if (featuredRes.data.success) {
          setFeaturedMovies(featuredRes.data.movies);
        }

        if (allMoviesRes.data.success) {
          const all = allMoviesRes.data.movies;
          setNowShowing(all.filter((m) => m.status === 'Now Showing'));
          setComingSoon(all.filter((m) => m.status === 'Coming Soon'));
        }
      } catch (err) {
        console.error('Failed to load homepage movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Automatic hero slider rotation
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const activeMovie = featuredMovies[activeHeroIndex] || null;

  return (
    <div className="home-page pb-5">
      {/* Hero Banner Carousel */}
      {activeMovie && (
        <section className="hero-banner position-relative overflow-hidden mb-5">
          <div
            className="hero-backdrop position-absolute top-0 start-0 w-100 h-100"
            style={{
              backgroundImage: `radial-gradient(circle at 70% 30%, rgba(13, 110, 253, 0.15), transparent 60%), linear-gradient(to right, rgba(0, 0, 0, 0.95) 20%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.8) 100%), url(${activeMovie.bannerUrl || activeMovie.posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>

          <div className="container position-relative py-5 my-md-5" style={{ minHeight: '520px', zIndex: 2 }}>
            <div className="row align-items-center">
              <div className="col-lg-7 col-md-9">
                {/* Featured Badge */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-danger rounded-pill px-3 py-1 font-monospace">
                    <i className="bi bi-fire me-1"></i> BLOCKBUSTER SPOTLIGHT
                  </span>
                  <span className="badge bg-black bg-opacity-75 text-warning border border-warning border-opacity-50 rounded-pill px-3 py-1">
                    <i className="bi bi-star-fill text-warning me-1"></i> {activeMovie.imdbRating} IMDb
                  </span>
                  <span className="badge bg-dark border border-secondary text-white-50 rounded-pill px-2 py-1">
                    {activeMovie.rating}
                  </span>
                </div>

                <h1 className="display-4 fw-black text-light tracking-tight mb-3">
                  {activeMovie.title}
                </h1>

                <p className="lead text-light text-opacity-75 line-clamp-3 mb-4" style={{ maxWidth: '640px' }}>
                  {activeMovie.synopsis}
                </p>

                {/* Genre badges */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {activeMovie.genres?.map((g, idx) => (
                    <span key={idx} className="badge bg-secondary bg-opacity-25 border border-secondary border-opacity-50 text-light px-3 py-2 rounded-pill font-monospace">
                      {g}
                    </span>
                  ))}
                  <span className="badge bg-secondary bg-opacity-25 border border-secondary border-opacity-50 text-light px-3 py-2 rounded-pill">
                    <i className="bi bi-clock me-1"></i> {activeMovie.duration} mins
                  </span>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-3">
                  <Link
                    to={`/movies/${activeMovie._id}`}
                    className="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-lg d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-ticket-perforated-fill fs-5"></i> Book Tickets
                  </Link>
                  {activeMovie.trailerUrl && (
                    <a
                      href={activeMovie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-light btn-lg rounded-pill px-4 d-flex align-items-center gap-2"
                    >
                      <i className="bi bi-play-circle fs-5 text-danger"></i> Watch Trailer
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Carousel navigation indicators */}
            <div className="d-flex gap-2 position-absolute bottom-0 start-0 mb-3">
              {featuredMovies.map((m, idx) => (
                <button
                  key={m._id}
                  onClick={() => setActiveHeroIndex(idx)}
                  className={`btn p-0 rounded-pill transition-all ${
                    idx === activeHeroIndex ? 'bg-danger' : 'bg-secondary bg-opacity-50'
                  }`}
                  style={{ width: idx === activeHeroIndex ? '36px' : '12px', height: '6px', border: 'none' }}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container">
        {/* Quick Search & Explore Bar */}
        <div className="p-4 bg-black bg-opacity-75 rounded-4 border border-secondary border-opacity-25 shadow-lg mb-5">
          <div className="row g-3 align-items-center">
            <div className="col-lg-5 col-md-6">
              <h5 className="text-light fw-bold mb-1">Looking for a movie?</h5>
              <p className="text-secondary small mb-0">Browse showtimes and reserve luxury seats in seconds.</p>
            </div>
            <div className="col-lg-7 col-md-6 d-flex gap-2">
              <Link to="/movies" className="btn btn-outline-light rounded-pill px-4 ms-auto">
                <i className="bi bi-search me-2"></i> Search Catalog
              </Link>
              <Link to="/movies?status=Now+Showing" className="btn btn-danger rounded-pill px-4 fw-medium">
                <i className="bi bi-film me-2"></i> Now Showing
              </Link>
            </div>
          </div>
        </div>

        {/* Section: Now Showing */}
        <section className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <span className="badge bg-danger rounded-pill px-3 py-1 font-monospace small mb-2">LIVE IN CINEMAS</span>
              <h3 className="fw-bold text-light mb-0">Now Showing</h3>
            </div>
            <Link to="/movies?status=Now+Showing" className="btn btn-link text-danger text-decoration-none fw-semibold">
              View All ({nowShowing.length}) <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5 text-danger">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {nowShowing.slice(0, 4).map((movie) => (
                <div key={movie._id} className="col-xl-3 col-lg-4 col-sm-6">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cinema Experience Highlights Banner */}
        <section className="p-4 p-md-5 my-5 rounded-4 border border-secondary border-opacity-25 bg-gradient-dark text-light shadow-2xl">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <span className="badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace mb-2 fw-bold">NEXT-GEN CINEMA</span>
              <h2 className="fw-bold mb-3">Immersive Audio & Visual Brilliance</h2>
              <p className="text-secondary mb-4">
                IMovies is equipped with cutting-edge IMAX Laser projection and Dolby Atmos 64-channel 3D surround sound for the ultimate theatrical experience.
              </p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-soundwave fs-3 text-danger"></i>
                    <div>
                      <h6 className="fw-bold mb-0">Dolby Atmos</h6>
                      <small className="text-white-50">3D Audio Spatializer</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-aspect-ratio fs-3 text-warning"></i>
                    <div>
                      <h6 className="fw-bold mb-0">IMAX Laser</h6>
                      <small className="text-white-50">4K High Frame Rate</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-cup-straw fs-3 text-info"></i>
                    <div>
                      <h6 className="fw-bold mb-0">Seat Service</h6>
                      <small className="text-white-50">Gourmet Concessions</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check fs-3 text-success"></i>
                    <div>
                      <h6 className="fw-bold mb-0">Instant Tickets</h6>
                      <small className="text-white-50">Zero-Contact QR Entry</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative rounded-4 overflow-hidden shadow-2xl border border-secondary border-opacity-25">
                <img
                  src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80"
                  alt="Cinema Auditorium"
                  className="w-100 h-100 object-fit-cover"
                  style={{ maxHeight: '360px' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Coming Soon */}
        {comingSoon.length > 0 && (
          <section className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <span className="badge bg-primary rounded-pill px-3 py-1 font-monospace small mb-2">UPCOMING RELEASES</span>
                <h3 className="fw-bold text-light mb-0">Coming Soon to Theaters</h3>
              </div>
              <Link to="/movies?status=Coming+Soon" className="btn btn-link text-primary text-decoration-none fw-semibold">
                Explore Teasers ({comingSoon.length}) <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="row g-4">
              {comingSoon.map((movie) => (
                <div key={movie._id} className="col-xl-3 col-lg-4 col-sm-6">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;
