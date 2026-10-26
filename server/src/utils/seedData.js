const bcrypt = require('bcryptjs');
const memoryModels = require('./inMemoryStore');

const getFormattedDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const seedDatabase = async () => {
  // Clear tables
  memoryModels.resetTables();

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('user123', salt);
  const sarahPassword = await bcrypt.hash('sarah123', salt);

  // 1. Users
  const users = [
    {
      _id: '65a000000000000000000001',
      name: 'Cinema Administrator',
      email: 'admin@imovies.com',
      password: adminPassword,
      role: 'admin',
      phone: '+1 (555) 019-2834',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isActive: true
    },
    {
      _id: '65a000000000000000000002',
      name: 'Alex Parker',
      email: 'user@imovies.com',
      password: userPassword,
      role: 'customer',
      phone: '+1 (555) 432-8765',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isActive: true
    },
    {
      _id: '65a000000000000000000003',
      name: 'Sarah Jenkins',
      email: 'sarah@imovies.com',
      password: sarahPassword,
      role: 'customer',
      phone: '+1 (555) 887-1249',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      isActive: true
    }
  ];

  for (const u of users) {
    await memoryModels.User.create(u);
  }

  // 2. Screens
  const screens = [
    {
      _id: '65b000000000000000000001',
      name: 'Screen 1 - IMAX Laser & Dolby 12-Ch',
      screenType: 'IMAX',
      totalSeats: 64,
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      columnsPerRow: 8,
      tierConfiguration: {
        vipRows: ['A', 'B'],
        premiumRows: ['C', 'D', 'E'],
        standardRows: ['F', 'G', 'H']
      },
      pricing: {
        vip: 22,
        premium: 18,
        standard: 14
      },
      isActive: true
    },
    {
      _id: '65b000000000000000000002',
      name: 'Screen 2 - Dolby Atmos Premium 4K',
      screenType: 'Dolby Atmos',
      totalSeats: 64,
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      columnsPerRow: 8,
      tierConfiguration: {
        vipRows: ['A', 'B'],
        premiumRows: ['C', 'D', 'E'],
        standardRows: ['F', 'G', 'H']
      },
      pricing: {
        vip: 19,
        premium: 15,
        standard: 12
      },
      isActive: true
    },
    {
      _id: '65b000000000000000000003',
      name: 'Screen 3 - RealD 3D Cinema Lounge',
      screenType: 'RealD 3D',
      totalSeats: 64,
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      columnsPerRow: 8,
      tierConfiguration: {
        vipRows: ['A', 'B'],
        premiumRows: ['C', 'D', 'E'],
        standardRows: ['F', 'G', 'H']
      },
      pricing: {
        vip: 17,
        premium: 14,
        standard: 10
      },
      isActive: true
    }
  ];

  for (const s of screens) {
    await memoryModels.Screen.create(s);
  }

  // 3. Movies
  const movies = [
    {
      _id: '65c000000000000000000001',
      title: 'Dune: Part Two',
      slug: 'dune-part-two',
      synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      genres: ['Sci-Fi', 'Adventure', 'Action'],
      duration: 166,
      releaseDate: new Date('2024-03-01'),
      language: 'English',
      rating: 'PG-13',
      imdbRating: 8.6,
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
      status: 'Now Showing',
      isFeatured: true
    },
    {
      _id: '65c000000000000000000002',
      title: 'Oppenheimer',
      slug: 'oppenheimer',
      synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral paradoxes and political fallout of the Manhattan Project.',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      genres: ['Biography', 'Drama', 'History'],
      duration: 180,
      releaseDate: new Date('2023-07-21'),
      language: 'English',
      rating: 'R',
      imdbRating: 8.9,
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
      status: 'Now Showing',
      isFeatured: true
    },
    {
      _id: '65c000000000000000000003',
      title: 'Deadpool & Wolverine',
      slug: 'deadpool-and-wolverine',
      synopsis: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, Deadpool. They team up to defeat a common enemy in a high-octane multiversal romp filled with comedic chaos and spectacular action.',
      posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
      genres: ['Action', 'Comedy', 'Sci-Fi'],
      duration: 127,
      releaseDate: new Date('2024-07-26'),
      language: 'English',
      rating: 'R',
      imdbRating: 7.9,
      director: 'Shawn Levy',
      cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
      status: 'Now Showing',
      isFeatured: true
    },
    {
      _id: '65c000000000000000000004',
      title: 'Interstellar (IMAX 70mm Experience)',
      slug: 'interstellar-imax',
      synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans through an Einstein-Rosen wormhole.',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      genres: ['Sci-Fi', 'Drama', 'Adventure'],
      duration: 169,
      releaseDate: new Date('2014-11-07'),
      language: 'English',
      rating: 'PG-13',
      imdbRating: 8.7,
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      status: 'Now Showing',
      isFeatured: false
    },
    {
      _id: '65c000000000000000000005',
      title: 'Gladiator II',
      slug: 'gladiator-2',
      synopsis: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
      posterUrl: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
      genres: ['Action', 'Adventure', 'Drama'],
      duration: 148,
      releaseDate: new Date('2024-11-22'),
      language: 'English',
      rating: 'R',
      imdbRating: 7.4,
      director: 'Ridley Scott',
      cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
      status: 'Now Showing',
      isFeatured: false
    },
    {
      _id: '65c000000000000000000006',
      title: 'Spider-Man: Beyond the Spider-Verse',
      slug: 'spider-man-beyond-the-spider-verse',
      synopsis: 'Miles Morales traverses alternate dimensions to unite the Spider-Heroes against an unprecedented threat that could unravel the fabric of the multiverse itself.',
      posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      genres: ['Animation', 'Action', 'Adventure'],
      duration: 140,
      releaseDate: new Date('2025-06-27'),
      language: 'English',
      rating: 'PG',
      imdbRating: 9.1,
      director: 'Joaquim Dos Santos, Kemp Powers',
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
      status: 'Coming Soon',
      isFeatured: false
    },
    {
      _id: '65c000000000000000000007',
      title: 'Avatar: Fire and Ash',
      slug: 'avatar-fire-and-ash',
      synopsis: 'Jake Sully and Neytiri encounter a new, aggressive volcanic clan known as the "Ash People" on Pandora, leading to a clash of cultures and survival.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      genres: ['Sci-Fi', 'Action', 'Fantasy'],
      duration: 190,
      releaseDate: new Date('2025-12-19'),
      language: 'English',
      rating: 'PG-13',
      imdbRating: 8.5,
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
      status: 'Coming Soon',
      isFeatured: false
    }
  ];

  for (const m of movies) {
    await memoryModels.Movie.create(m);
  }

  // 4. Showtimes (Spread across 5 days: day 0, day 1, day 2, day 3, day 4)
  const times = ['10:30 AM', '01:45 PM', '05:15 PM', '08:30 PM', '11:15 PM'];
  const showtimes = [];
  let showtimeCounter = 1;

  for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
    const showDate = getFormattedDate(dayOffset);

    // Dune on IMAX Screen
    showtimes.push({
      _id: `65d00000000000000000${String(showtimeCounter++).padStart(4, '0')}`,
      movie: movies[0]._id,
      screen: screens[0]._id,
      screenName: screens[0].name,
      screenType: screens[0].screenType,
      date: showDate,
      time: '01:45 PM',
      pricing: screens[0].pricing,
      isActive: true
    });

    showtimes.push({
      _id: `65d00000000000000000${String(showtimeCounter++).padStart(4, '0')}`,
      movie: movies[0]._id,
      screen: screens[0]._id,
      screenName: screens[0].name,
      screenType: screens[0].screenType,
      date: showDate,
      time: '08:30 PM',
      pricing: screens[0].pricing,
      isActive: true
    });

    // Oppenheimer on Dolby Atmos Screen
    showtimes.push({
      _id: `65d00000000000000000${String(showtimeCounter++).padStart(4, '0')}`,
      movie: movies[1]._id,
      screen: screens[1]._id,
      screenName: screens[1].name,
      screenType: screens[1].screenType,
      date: showDate,
      time: '05:15 PM',
      pricing: screens[1].pricing,
      isActive: true
    });

    // Deadpool & Wolverine on Screen 3
    showtimes.push({
      _id: `65d00000000000000000${String(showtimeCounter++).padStart(4, '0')}`,
      movie: movies[2]._id,
      screen: screens[2]._id,
      screenName: screens[2].name,
      screenType: screens[2].screenType,
      date: showDate,
      time: '10:30 AM',
      pricing: screens[2].pricing,
      isActive: true
    });

    showtimes.push({
      _id: `65d00000000000000000${String(showtimeCounter++).padStart(4, '0')}`,
      movie: movies[2]._id,
      screen: screens[2]._id,
      screenName: screens[2].name,
      screenType: screens[2].screenType,
      date: showDate,
      time: '08:00 PM',
      pricing: screens[2].pricing,
      isActive: true
    });

    // Interstellar on IMAX Screen
    showtimes.push({
      _id: `65d00000000000000000${String(showtimeCounter++).padStart(4, '0')}`,
      movie: movies[3]._id,
      screen: screens[0]._id,
      screenName: screens[0].name,
      screenType: screens[0].screenType,
      date: showDate,
      time: '11:15 PM',
      pricing: screens[0].pricing,
      isActive: true
    });
  }

  for (const st of showtimes) {
    await memoryModels.Showtime.create(st);
  }

  // 5. Initial Bookings (Pre-booked seats for demo realism)
  const initialBookings = [
    {
      _id: '65e000000000000000000001',
      bookingId: 'IMV-202610-10928',
      user: users[1]._id, // Alex Parker
      movie: movies[0]._id, // Dune
      showtime: showtimes[0]._id, // Today 1:45 PM
      seats: [
        { seatNumber: 'B4', tier: 'VIP', price: 22 },
        { seatNumber: 'B5', tier: 'VIP', price: 22 }
      ],
      subtotal: 44,
      convenienceFee: 3.0,
      tax: 4.4,
      totalAmount: 51.4,
      paymentStatus: 'Paid',
      paymentMethod: 'Credit/Debit Card',
      transactionId: 'TXN-9840219-IMV',
      bookingStatus: 'Confirmed',
      bookingDate: new Date(),
      qrCode: 'IMV-QR-202610-10928-B4B5'
    },
    {
      _id: '65e000000000000000000002',
      bookingId: 'IMV-202610-44910',
      user: users[2]._id, // Sarah Jenkins
      movie: movies[1]._id, // Oppenheimer
      showtime: showtimes[2]._id, // Today 5:15 PM
      seats: [
        { seatNumber: 'C3', tier: 'Premium', price: 15 },
        { seatNumber: 'C4', tier: 'Premium', price: 15 },
        { seatNumber: 'C5', tier: 'Premium', price: 15 }
      ],
      subtotal: 45,
      convenienceFee: 4.5,
      tax: 4.5,
      totalAmount: 54.0,
      paymentStatus: 'Paid',
      paymentMethod: 'Apple Pay',
      transactionId: 'TXN-5519280-IMV',
      bookingStatus: 'Confirmed',
      bookingDate: new Date(),
      qrCode: 'IMV-QR-202610-44910-C3C4C5'
    }
  ];

  for (const b of initialBookings) {
    await memoryModels.Booking.create(b);
  }

  return {
    users: users.length,
    screens: screens.length,
    movies: movies.length,
    showtimes: showtimes.length,
    bookings: initialBookings.length
  };
};

module.exports = { seedDatabase, getFormattedDate };
