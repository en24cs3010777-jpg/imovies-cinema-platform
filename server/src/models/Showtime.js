const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Please select a movie']
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Please select a screen']
    },
    screenName: {
      type: String,
      default: 'Main Cinema Hall'
    },
    screenType: {
      type: String,
      default: 'Standard 2D'
    },
    date: {
      type: String,
      required: [true, 'Please specify show date (YYYY-MM-DD)']
    },
    time: {
      type: String,
      required: [true, 'Please specify showtime']
    },
    pricing: {
      vip: { type: Number, default: 18 },
      premium: { type: Number, default: 14 },
      standard: { type: Number, default: 10 }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const MongooseShowtime = mongoose.model('Showtime', showtimeSchema);
const memoryModels = require('../utils/inMemoryStore');

const ShowtimeProxy = new Proxy(MongooseShowtime, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const mem = memoryModels.Showtime;
    if (prop in mem) {
      const val = mem[prop];
      return typeof val === 'function' ? val.bind(mem) : val;
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = ShowtimeProxy;
