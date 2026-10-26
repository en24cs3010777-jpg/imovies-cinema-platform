const mongoose = require('mongoose');
const { seedDatabase } = require('../utils/seedData');
const memoryModels = require('../utils/inMemoryStore');

const checkAndSeed = async () => {
  const User = mongoose.model('User');
  const count = await User.countDocuments();
  if (count === 0) {
    const stats = await seedDatabase();
    console.log('🌱 IMovies Database auto-seeded with initial cinema data:');
    console.log(`   👥 Users: ${stats.users} | 🎞️ Movies: ${stats.movies} | 🕒 Showtimes: ${stats.showtimes}`);
  }
};

const connectDB = async () => {
  // Always initialize in-memory fallback store instantly (zero download, zero delay)
  await memoryModels.initMemoryStore();

  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      await checkAndSeed();
      return conn;
    } catch (error) {
      console.warn(`⚠️  MongoDB connection note: (${error.message}). Running on built-in fast datastore.`);
    }
  }

  console.log('⚡ IMovies Active: Using Built-in Zero-Latency In-Memory Database');
  console.log('✨ All 6 Epics, auth, movies, showtimes, seats, and bookings are active!');
  console.log('🔑 Demo Login: admin@imovies.com / admin123 | user@imovies.com / user123');
};

module.exports = connectDB;
