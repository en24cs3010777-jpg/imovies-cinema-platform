const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');

// @desc    Get all showtimes (optionally filtered by movie and date)
// @route   GET /api/showtimes
// @access  Public
const getShowtimes = async (req, res, next) => {
  try {
    const { movieId, date } = req.query;
    let query = { isActive: true };

    if (movieId) {
      query.movie = movieId;
    }

    if (date) {
      query.date = date;
    }

    const showtimes = await Showtime.find(query)
      .populate('movie')
      .populate('screen')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: showtimes.length,
      showtimes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single showtime detail
// @route   GET /api/showtimes/:id
// @access  Public
const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('screen');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    res.json({
      success: true,
      showtime
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time seat matrix for a showtime (Epic 4: Tasks 11 & 12)
// @route   GET /api/showtimes/:id/seats
// @access  Public
const getShowtimeSeats = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movie');
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    // Get screen config (or fallback screen)
    let screen = null;
    if (showtime.screen) {
      screen = await Screen.findById(showtime.screen._id || showtime.screen);
    }
    if (!screen) {
      screen = {
        name: showtime.screenName || 'Screen 1 - IMAX Laser',
        screenType: showtime.screenType || 'IMAX',
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        columnsPerRow: 8,
        tierConfiguration: {
          vipRows: ['A', 'B'],
          premiumRows: ['C', 'D', 'E'],
          standardRows: ['F', 'G', 'H']
        },
        pricing: showtime.pricing || { vip: 20, premium: 16, standard: 12 }
      };
    }

    // Fetch confirmed bookings for this showtime to find reserved seats
    const confirmedBookings = await Booking.find({
      showtime: showtime._id,
      bookingStatus: 'Confirmed'
    });

    const bookedSeatNumbers = new Set();
    confirmedBookings.forEach((b) => {
      if (Array.isArray(b.seats)) {
        b.seats.forEach((s) => bookedSeatNumbers.add(s.seatNumber));
      }
    });

    const pricing = showtime.pricing || screen.pricing || { vip: 20, premium: 16, standard: 12 };
    const tierConfig = screen.tierConfiguration || {
      vipRows: ['A', 'B'],
      premiumRows: ['C', 'D', 'E'],
      standardRows: ['F', 'G', 'H']
    };

    // Build the seat layout matrix
    const seatRows = (screen.rows || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']).map((rowLetter) => {
      let tier = 'Standard';
      if (tierConfig.vipRows && tierConfig.vipRows.includes(rowLetter)) {
        tier = 'VIP';
      } else if (tierConfig.premiumRows && tierConfig.premiumRows.includes(rowLetter)) {
        tier = 'Premium';
      }

      const price = pricing[tier.toLowerCase()] || 12;
      const cols = screen.columnsPerRow || 8;
      const seats = [];

      for (let col = 1; col <= cols; col++) {
        const seatNumber = `${rowLetter}${col}`;
        const isBooked = bookedSeatNumbers.has(seatNumber);

        seats.push({
          seatNumber,
          row: rowLetter,
          column: col,
          tier,
          price,
          status: isBooked ? 'booked' : 'available'
        });
      }

      return {
        rowLetter,
        tier,
        price,
        seats
      };
    });

    const totalSeats = (screen.rows?.length || 8) * (screen.columnsPerRow || 8);
    const bookedCount = bookedSeatNumbers.size;
    const availableCount = totalSeats - bookedCount;

    res.json({
      success: true,
      showtime: {
        _id: showtime._id,
        movie: showtime.movie,
        screenName: screen.name,
        screenType: screen.screenType,
        date: showtime.date,
        time: showtime.time,
        pricing
      },
      stats: {
        totalSeats,
        bookedCount,
        availableCount
      },
      seatRows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cinema screens
// @route   GET /api/showtimes/screens/all
// @access  Public
const getScreens = async (req, res, next) => {
  try {
    const screens = await Screen.find({ isActive: true });
    res.json({
      success: true,
      count: screens.length,
      screens
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new showtime
// @route   POST /api/showtimes
// @access  Private/Admin
const createShowtime = async (req, res, next) => {
  try {
    const { movieId, screenId, date, time, pricing } = req.body;

    if (!movieId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie, date, and showtime.'
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    let screen = null;
    if (screenId) {
      screen = await Screen.findById(screenId);
    }
    if (!screen) {
      const allScreens = await Screen.find({});
      screen = allScreens[0];
    }

    const showtime = await Showtime.create({
      movie: movie._id,
      screen: screen._id,
      screenName: screen.name,
      screenType: screen.screenType,
      date,
      time,
      pricing: pricing || screen.pricing,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Showtime scheduled successfully',
      showtime
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.'
      });
    }

    await Showtime.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Showtime removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShowtimes,
  getShowtimeById,
  getShowtimeSeats,
  getScreens,
  createShowtime,
  deleteShowtime
};
