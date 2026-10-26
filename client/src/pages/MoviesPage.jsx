import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // Filters state from query parameters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data } = await movieAPI.getGenres();
        if (data.success && data.genres) {
          setGenres(data.genres);
        }
      } catch (err) {
        console.error('Failed to load genres:', err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (selectedGenre && selectedGenre !== 'All') params.genre = selectedGenre;
        if (selectedStatus && selectedStatus !== 'All') params.status = selectedStatus;
        if (sortBy) params.sort = sortBy;

        const { data } = await movieAPI.getMovies(params);
        if (data.success) {
          setMovies(data.movies);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, selectedGenre, selectedStatus, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      ...(search ? { search } : {}),
      ...(selectedGenre !== 'All' ? { genre: selectedGenre } : {}),
      ...(selectedStatus !== 'All' ? { status: selectedStatus } : {}),
      sort: sortBy
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('All');
    setSelectedStatus('All');
    setSortBy('rating');
    setSearchParams({});
  };

  return (
    <div className="container py-4 pb-5">
      {/* Header */}
      <div className="mb-4">
        <span className="badge bg-danger rounded-pill px-3 py-1 font-monospace mb-2">EXPLORE FILMS</span>
        <h2 className="fw-bold text-light mb-1">Cinema Catalog & Showtimes</h2>
        <p className="text-secondary small mb-0">
          Discover currently screening blockbusters, advance tickets, and upcoming cinema premieres.
        </p>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-black bg-opacity-75 p-4 rounded-4 border border-secondary border-opacity-25 shadow-lg mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-5 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="Search by title, director, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="btn btn-dark border-secondary text-secondary"
                    onClick={() => setSearch('')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Status Tabs / Selector */}
            <div className="col-lg-4 col-md-6">
              <div className="btn-group w-100" role="group">
                {['All', 'Now Showing', 'Coming Soon'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`btn btn-sm ${
                      selectedStatus === st
                        ? 'btn-danger fw-semibold'
                        : 'btn-outline-secondary text-light'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Selector */}
            <div className="col-lg-3 col-md-12 d-flex gap-2">
              <select
                className="form-select form-select-sm bg-dark text-light border-secondary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Top Rated (IMDb)</option>
                <option value="releaseDate">Newest Releases</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>

              {(search || selectedGenre !== 'All' || selectedStatus !== 'All') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-outline-danger"
                  title="Clear all filters"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Genre Filter Pills */}
        <div className="mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center gap-2 overflow-x-auto pb-1">
          <span className="small text-white-50 text-uppercase font-monospace me-1">Genres:</span>
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`btn btn-sm rounded-pill px-3 py-1 font-monospace ${
                selectedGenre === g
                  ? 'btn-light fw-bold text-dark'
                  : 'btn-dark border border-secondary text-white-50'
              }`}
              style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Active Results Summary */}
      <div className="d-flex align-items-center justify-content-between mb-4 text-secondary small">
        <span>
          Showing <strong className="text-light">{movies.length}</strong> movies
          {selectedGenre !== 'All' && <span> in <span className="text-danger">{selectedGenre}</span></span>}
          {selectedStatus !== 'All' && <span> ({selectedStatus})</span>}
        </span>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="text-center py-5 text-danger">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-5 my-4 bg-black bg-opacity-50 rounded-4 border border-secondary border-opacity-25">
          <i className="bi bi-camera-reels fs-1 text-secondary d-block mb-3"></i>
          <h5 className="text-light fw-bold">No movies found matching criteria</h5>
          <p className="text-secondary small mb-3">Try adjusting your genre filters or search query.</p>
          <button onClick={handleResetFilters} className="btn btn-outline-danger rounded-pill px-4 btn-sm">
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {movies.map((movie) => (
            <div key={movie._id} className="col-xl-3 col-lg-4 col-sm-6">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
