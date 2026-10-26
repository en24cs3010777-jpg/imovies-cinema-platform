const express = require('express');
const router = express.Router();
const {
  getShowtimes,
  getShowtimeById,
  getShowtimeSeats,
  getScreens,
  createShowtime,
  deleteShowtime
} = require('../controllers/showtimeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getShowtimes);
router.get('/screens/all', getScreens);
router.get('/:id', getShowtimeById);
router.get('/:id/seats', getShowtimeSeats);

// Admin-only endpoints
router.post('/', protect, admin, createShowtime);
router.delete('/:id', protect, admin, deleteShowtime);

module.exports = router;
