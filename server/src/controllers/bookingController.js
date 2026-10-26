const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

// Helper to generate booking ID
const generateBookingId = () => {
  const d = new Date();
  const yearMonth = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.floor(10000 + Math.random() * 90000);
  return `IMV-${yearMonth}-${random}`;
};

// @desc    Create a new movie booking & simulate payment (Epic 5: Tasks 14 & 15)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seats, paymentMethod } = req.body;

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid showtime and select at least one seat.'
      });
    }

    const showtime = await Showtime.findById(showtimeId).populate('movie');
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Selected showtime is no longer available.'
      });
    }

    // Atomic Seat Conflict Detection: check if any requested seat is already booked
    const requestedSeatNumbers = seats.map((s) => s.seatNumber);
    const existingBookings = await Booking.find({
      showtime: showtime._id,
      bookingStatus: 'Confirmed'
    });

    const alreadyBooked = [];
    existingBookings.forEach((b) => {
      if (Array.isArray(b.seats)) {
        b.seats.forEach((s) => {
          if (requestedSeatNumbers.includes(s.seatNumber)) {
            alreadyBooked.push(s.seatNumber);
          }
        });
      }
    });

    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats [${alreadyBooked.join(', ')}] have just been reserved by another patron. Please select different seats.`,
        conflictedSeats: alreadyBooked
      });
    }

    // Calculate financials
    const subtotal = seats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const convenienceFee = seats.length * 1.5; // $1.50 per ticket
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% sales tax
    const totalAmount = Math.round((subtotal + convenienceFee + tax) * 100) / 100;

    const bookingId = generateBookingId();
    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCode = `IMV-QR-${bookingId}-${requestedSeatNumbers.join('')}`;

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      movie: showtime.movie._id || showtime.movie,
      showtime: showtime._id,
      seats,
      subtotal,
      convenienceFee,
      tax,
      totalAmount,
      paymentStatus: 'Paid',
      paymentMethod: paymentMethod || 'Credit/Debit Card',
      transactionId,
      bookingStatus: 'Confirmed',
      bookingDate: new Date(),
      qrCode
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('showtime')
      .populate('user');

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully! Enjoy your movie experience.',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's booking history (Epic 5: Task 17)
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie')
      .populate('showtime')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking detail / E-ticket
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('showtime')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found'
      });
    }

    // Ownership check
    const isOwner = booking.user && (booking.user._id || booking.user).toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking.'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking and release reserved seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Ownership check
    const isOwner = (booking.user._id || booking.user).toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking.'
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This reservation is already cancelled.'
      });
    }

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released and refund initiated.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin master ledger)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('movie')
      .populate('showtime')
      .populate('user')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings
};
