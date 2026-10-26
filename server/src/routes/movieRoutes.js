const express = require('express');
const router = express.Router();
const {
  getMovies,
  getFeaturedMovies,
  getMovieById,
  getGenres,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/genres', getGenres);
router.get('/:id', getMovieById);

// Admin-only endpoints
router.post('/', protect, admin, createMovie);
router.put('/:id', protect, admin, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);

module.exports = router;
