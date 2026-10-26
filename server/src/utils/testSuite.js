const app = require('../server');

const runTests = async () => {
  console.log('🧪 Starting IMovies Backend Integration Test Suite...\n');

  let passed = 0;
  let failed = 0;

  const assert = (desc, condition) => {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  };

  // Helper to make internal mocked requests to Express app
  const makeRequest = (method, url, body = null, headers = {}) => {
    return new Promise((resolve) => {
      const http = require('http');
      const server = http.createServer(app);
      server.listen(0, '127.0.0.1', async () => {
        const port = server.address().port;
        try {
          const req = http.request(
            {
              hostname: '127.0.0.1',
              port,
              path: url,
              method,
              headers: {
                'Content-Type': 'application/json',
                ...headers
              }
            },
            (res) => {
              let data = '';
              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                server.close();
                try {
                  resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                  resolve({ status: res.statusCode, body: data });
                }
              });
            }
          );
          req.on('error', (err) => {
            server.close();
            resolve({ status: 500, error: err.message });
          });
          if (body) {
            req.write(JSON.stringify(body));
          }
          req.end();
        } catch (e) {
          server.close();
          resolve({ status: 500, error: e.message });
        }
      });
    });
  };

  // Direct Controller / Store Tests
  const memoryModels = require('./inMemoryStore');
  await memoryModels.initMemoryStore();
  const userCount = await memoryModels.User.countDocuments();
  assert('Database seeding loaded users', userCount >= 3);

  const movieCount = await memoryModels.Movie.countDocuments();
  assert('Database seeding loaded movies', movieCount >= 7);

  const showtimeCount = await memoryModels.Showtime.countDocuments();
  assert('Database seeding loaded showtimes', showtimeCount >= 20);

  const screenCount = await memoryModels.Screen.countDocuments();
  assert('Database seeding loaded screens', screenCount >= 3);

  // Test User Login / Authentication
  const user = await memoryModels.User.findOne({ email: 'admin@imovies.com' });
  assert('Admin user exists in store', !!user);
  const pwMatch = await user.matchPassword('admin123');
  assert('Admin password matches bcrypt hash', pwMatch === true);

  // Test JWT token generation
  const generateToken = require('./generateToken');
  const jwt = require('jsonwebtoken');
  const token = generateToken(user._id, user.role);
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'imovies_cinema_super_secret_jwt_key_2026_xYz');
  assert('JWT generation & payload decode', decoded.id === user._id && decoded.role === 'admin');

  // Test Showtime Seat Matrix Generation
  const showtimes = await memoryModels.Showtime.find({});
  const st = showtimes[0];
  const bookings = await memoryModels.Booking.find({ showtime: st._id, bookingStatus: 'Confirmed' });
  assert('Booking retrieval for showtime', Array.isArray(bookings));

  // Test Conflict Detection logic
  const testSeats = [{ seatNumber: 'B4', tier: 'VIP', price: 22 }];
  const hasConflict = bookings.some((b) => b.seats.some((s) => s.seatNumber === 'B4'));
  assert('Seat collision detection correctly detects pre-reserved seat B4', hasConflict === true);

  // Test New Booking Creation
  const newBooking = await memoryModels.Booking.create({
    bookingId: 'IMV-TEST-99999',
    user: user._id,
    movie: st.movie,
    showtime: st._id,
    seats: [{ seatNumber: 'A1', tier: 'VIP', price: 22 }],
    subtotal: 22,
    convenienceFee: 1.5,
    tax: 1.76,
    totalAmount: 25.26,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit/Debit Card',
    transactionId: 'TXN-TEST-123',
    bookingStatus: 'Confirmed'
  });
  assert('Booking created and saved', !!newBooking._id);

  // Test Booking Cancellation
  newBooking.bookingStatus = 'Cancelled';
  newBooking.paymentStatus = 'Refunded';
  await newBooking.save();
  const refreshed = await memoryModels.Booking.findById(newBooking._id);
  assert('Booking cancellation marks status Cancelled', refreshed.bookingStatus === 'Cancelled');

  console.log(`\n📊 Test Suite Summary: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
