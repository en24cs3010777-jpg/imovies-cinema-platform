const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide movie title'],
      trim: true
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true
    },
    synopsis: {
      type: String,
      required: [true, 'Please provide movie synopsis']
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide poster image URL']
    },
    bannerUrl: {
      type: String,
      default: ''
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    genres: {
      type: [String],
      required: [true, 'Please provide at least one genre']
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
      min: [1, 'Duration must be at least 1 minute']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Please provide release date']
    },
    language: {
      type: String,
      default: 'English'
    },
    rating: {
      type: String,
      default: 'PG-13'
    },
    imdbRating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0
    },
    director: {
      type: String,
      default: ''
    },
    cast: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['Now Showing', 'Coming Soon', 'Archived'],
      default: 'Now Showing'
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const MongooseMovie = mongoose.model('Movie', movieSchema);
const memoryModels = require('../utils/inMemoryStore');

const MovieProxy = new Proxy(MongooseMovie, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const mem = memoryModels.Movie;
    if (prop in mem) {
      const val = mem[prop];
      return typeof val === 'function' ? val.bind(mem) : val;
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = MovieProxy;
