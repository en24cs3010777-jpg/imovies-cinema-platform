import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="card h-100 bg-black text-light border-secondary border-opacity-25 rounded-4 overflow-hidden shadow-sm hover-card transition-all">
      {/* Poster Image Container */}
      <div className="position-relative overflow-hidden" style={{ paddingTop: '145%' }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover card-img-zoom"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-black bg-opacity-75 backdrop-blur text-warning border border-warning border-opacity-50 px-2 py-1 fs-7 fw-bold rounded-pill shadow">
            <i className="bi bi-star-fill text-warning me-1"></i>
            {movie.imdbRating ? movie.imdbRating.toFixed(1) : '8.0'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="position-absolute top-0 start-0 m-3">
          <span
            className={`badge rounded-pill px-2 py-1 fs-7 fw-semibold shadow ${
              movie.status === 'Now Showing'
                ? 'bg-danger text-light'
                : 'bg-primary text-light'
            }`}
          >
            {movie.status}
          </span>
        </div>

        {/* Overlay on hover */}
        <div className="poster-overlay position-absolute bottom-0 start-0 w-100 p-3 d-flex flex-column justify-content-end">
          <Link
            to={`/movies/${movie._id}`}
            className="btn btn-danger btn-sm rounded-pill fw-semibold shadow-lg w-100 py-2 d-flex align-items-center justify-content-center gap-1"
          >
            <i className="bi bi-ticket-perforated"></i>
            {movie.status === 'Now Showing' ? 'Book Tickets' : 'View Details'}
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-body p-3 d-flex flex-column">
        {/* Genre Tags */}
        <div className="d-flex flex-wrap gap-1 mb-2">
          {movie.genres &&
            movie.genres.slice(0, 2).map((g, idx) => (
              <span key={idx} className="badge bg-secondary bg-opacity-25 text-white-50 border border-secondary border-opacity-25 rounded-pill font-monospace" style={{ fontSize: '0.65rem' }}>
                {g}
              </span>
            ))}
        </div>

        {/* Movie Title */}
        <h6 className="card-title fw-bold text-light text-truncate mb-1" title={movie.title}>
          <Link to={`/movies/${movie._id}`} className="text-light text-decoration-none hover-danger">
            {movie.title}
          </Link>
        </h6>

        {/* Meta Info: Duration & Language & Rating */}
        <div className="d-flex align-items-center justify-content-between text-secondary small mt-auto pt-2 border-top border-secondary border-opacity-25">
          <span>
            <i className="bi bi-clock me-1"></i>
            {formatDuration(movie.duration || 120)}
          </span>
          <span className="badge bg-dark border border-secondary border-opacity-50 text-white-50">
            {movie.rating || 'PG-13'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
