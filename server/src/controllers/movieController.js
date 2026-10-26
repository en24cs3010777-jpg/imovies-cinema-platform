const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, status, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'All') {
      query.genres = { $in: [genre] };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let moviesQuery = Movie.find(query);

    if (sort === 'rating') {
      moviesQuery = moviesQuery.sort({ imdbRating: -1 });
    } else if (sort === 'releaseDate') {
      moviesQuery = moviesQuery.sort({ releaseDate: -1 });
    } else if (sort === 'title') {
      moviesQuery = moviesQuery.sort({ title: 1 });
    } else {
      moviesQuery = moviesQuery.sort({ createdAt: -1 });
    }

    const movies = await moviesQuery;

    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured movies
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res, next) => {
  try {
    const featured = await Movie.find({ isFeatured: true });
    res.json({
      success: true,
      count: featured.length,
      movies: featured
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID with available showtimes
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Also get upcoming showtimes for this movie
    const showtimes = await Showtime.find({
      movie: movie._id,
      isActive: true
    }).sort({ date: 1, time: 1 });

    res.json({
      success: true,
      movie,
      showtimes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct genres
// @route   GET /api/movies/genres
// @access  Public
const getGenres = async (req, res, next) => {
  try {
    const movies = await Movie.find({});
    const genreSet = new Set();
    movies.forEach((m) => {
      if (Array.isArray(m.genres)) {
        m.genres.forEach((g) => genreSet.add(g));
      }
    });

    res.json({
      success: true,
      genres: ['All', ...Array.from(genreSet)]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      synopsis,
      posterUrl,
      bannerUrl,
      trailerUrl,
      genres,
      duration,
      releaseDate,
      language,
      rating,
      imdbRating,
      director,
      cast,
      status,
      isFeatured
    } = req.body;

    if (!title || !synopsis || !posterUrl || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required movie details (title, synopsis, poster, duration).'
      });
    }

    const movie = await Movie.create({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      synopsis,
      posterUrl,
      bannerUrl: bannerUrl || posterUrl,
      trailerUrl: trailerUrl || '',
      genres: Array.isArray(genres) ? genres : [genres || 'Action'],
      duration: Number(duration),
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      language: language || 'English',
      rating: rating || 'PG-13',
      imdbRating: imdbRating ? Number(imdbRating) : 8.0,
      director: director || '',
      cast: Array.isArray(cast) ? cast : cast ? [cast] : [],
      status: status || 'Now Showing',
      isFeatured: !!isFeatured
    });

    res.status(201).json({
      success: true,
      message: 'Movie added to catalog successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({
      success: true,
      message: 'Movie updated successfully',
      movie: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    // Also remove associated showtimes
    await Showtime.deleteMany({ movie: req.params.id });

    res.json({
      success: true,
      message: 'Movie and associated showtimes deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getFeaturedMovies,
  getMovieById,
  getGenres,
  createMovie,
  updateMovie,
  deleteMovie
};
