const mongoose = require('mongoose');

const seatReservationSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      enum: ['VIP', 'Premium', 'Standard'],
      default: 'Standard'
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true
    },
    seats: [seatReservationSchema],
    subtotal: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      default: 2.0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Refunded'],
      default: 'Paid'
    },
    paymentMethod: {
      type: String,
      enum: ['Credit/Debit Card', 'UPI', 'PayPal', 'Apple Pay'],
      default: 'Credit/Debit Card'
    },
    transactionId: {
      type: String,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['Confirmed', 'Cancelled'],
      default: 'Confirmed'
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    qrCode: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const MongooseBooking = mongoose.model('Booking', bookingSchema);
const memoryModels = require('../utils/inMemoryStore');

const BookingProxy = new Proxy(MongooseBooking, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const mem = memoryModels.Booking;
    if (prop in mem) {
      const val = mem[prop];
      return typeof val === 'function' ? val.bind(mem) : val;
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = BookingProxy;
