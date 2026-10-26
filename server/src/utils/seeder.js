const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { seedDatabase } = require('./seedData');

const runSeeder = async () => {
  try {
    console.log('🎬 IMovies Seeding: Initializing Database Records...');
    const stats = await seedDatabase();
    console.log('✅ IMovies Seeding Completed Successfully:');
    console.log(`   👥 Users: ${stats.users} (Admin: admin@imovies.com / admin123 | User: user@imovies.com / user123)`);
    console.log(`   🏛️  Screens: ${stats.screens} (IMAX, Dolby Atmos, RealD 3D)`);
    console.log(`   🎞️  Movies: ${stats.movies} (Blockbusters with posters, trailers, & genres)`);
    console.log(`   🕒 Showtimes: ${stats.showtimes} (Spanning dynamic 5-day schedules)`);
    console.log(`   🎟️  Bookings: ${stats.bookings} (Demo confirmed reservations)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

runSeeder();
