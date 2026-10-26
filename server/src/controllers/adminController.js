const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');
const User = require('../models/User');

// @desc    Get comprehensive Box Office intelligence & KPIs (Epic 6: Task 18)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const allBookings = await Booking.find({}).populate('movie');
    const allMovies = await Movie.find({});
    const allShowtimes = await Showtime.find({});
    const allUsers = await User.find({});

    const confirmedBookings = allBookings.filter((b) => b.bookingStatus === 'Confirmed');
    const cancelledBookings = allBookings.filter((b) => b.bookingStatus === 'Cancelled');

    // Revenue calculations
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

    // Movie Revenue aggregation
    const movieStatsMap = {};
    allMovies.forEach((m) => {
      movieStatsMap[m._id.toString()] = {
        title: m.title,
        posterUrl: m.posterUrl,
        genres: m.genres,
        revenue: 0,
        tickets: 0,
        bookingsCount: 0
      };
    });

    confirmedBookings.forEach((b) => {
      const mId = b.movie ? (b.movie._id || b.movie).toString() : null;
      if (mId && movieStatsMap[mId]) {
        movieStatsMap[mId].revenue += Number(b.totalAmount) || 0;
        movieStatsMap[mId].tickets += b.seats ? b.seats.length : 0;
        movieStatsMap[mId].bookingsCount += 1;
      }
    });

    const topGrossingMovies = Object.values(movieStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Approximate Occupancy Rate: tickets sold vs (showtimes * 64 seats)
    const totalSeatCapacity = (allShowtimes.length || 1) * 64;
    const occupancyRate = Math.min(
      100,
      Math.round((totalTicketsSold / Math.max(totalSeatCapacity, 1)) * 100 * 10) / 10
    );

    // Recent 5 Bookings
    const recentBookings = await Booking.find({})
      .populate('movie')
      .populate('user')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalBookings: allBookings.length,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: cancelledBookings.length,
        totalTicketsSold,
        occupancyRate: `${occupancyRate}%`,
        activeMovies: allMovies.filter((m) => m.status === 'Now Showing').length,
        totalUsers: allUsers.length
      },
      topGrossingMovies,
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers
};
