import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showtimeAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMatrix from '../components/SeatMatrix';
import BookingModal from '../components/BookingModal';
import TicketModal from '../components/TicketModal';

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Fetch real-time seat matrix
  const fetchSeats = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await showtimeAPI.getSeats(showtimeId);
      if (data.success) {
        setSeatData(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch theater seat availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [showtimeId]);

  // Handle seat click
  const handleSeatToggle = (seat) => {
    const isAlreadySelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (isAlreadySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per reservation.');
        return;
      }
      setSelectedSeats((prev) => [
        ...prev,
        {
          seatNumber: seat.seatNumber,
          tier: seat.tier,
          price: seat.price
        }
      ]);
    }
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      // Redirect to login preserving path
      navigate('/login', { state: { from: { pathname: `/book/${showtimeId}` } } });
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async ({ paymentMethod, seats }) => {
    try {
      setIsSubmitting(true);
      const payload = {
        showtimeId,
        seats,
        paymentMethod
      };

      const { data } = await bookingAPI.create(payload);
      if (data.success) {
        setShowBookingModal(false);
        setConfirmedBooking(data.booking);
        setShowTicketModal(true);
        setSelectedSeats([]);
        // Re-fetch seats so newly booked seats show as booked in background
        fetchSeats();
      }
    } catch (err) {
      alert(`Booking Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = selectedSeats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const convenienceFee = selectedSeats.length * 1.5;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal + convenienceFee + tax) * 100) / 100;

  if (loading) {
    return (
      <div className="text-center py-5 my-5 text-danger">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading auditorium layout...</span>
        </div>
        <p className="mt-3 text-secondary small">Connecting to real-time seat tracker...</p>
      </div>
    );
  }

  if (error || !seatData) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="alert alert-danger d-inline-block p-4 rounded-4 shadow">
          <i className="bi bi-exclamation-triangle fs-1 text-danger d-block mb-3"></i>
          <h4>Screening Not Found</h4>
          <p className="text-secondary small mb-3">{error || 'This screening is currently unavailable.'}</p>
          <Link to="/movies" className="btn btn-outline-light rounded-pill px-4">
            Return to Movie Listings
          </Link>
        </div>
      </div>
    );
  }

  const movie = seatData.showtime?.movie || {};
  const showtime = seatData.showtime || {};

  return (
    <div className="seat-selection-page py-4 pb-5">
      <div className="container">
        {/* Navigation Breadcrumb & Showtime Info Header */}
        <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between p-3 bg-black bg-opacity-75 rounded-4 border border-secondary border-opacity-25 shadow-sm mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link to={`/movies/${movie._id}`} className="text-secondary text-decoration-none small hover-danger">
                <i className="bi bi-arrow-left me-1"></i> {movie.title}
              </Link>
              <span className="text-secondary small">•</span>
              <span className="badge bg-danger rounded-pill px-2 py-0 small font-monospace">SELECT SEATS</span>
            </div>
            <h4 className="fw-bold text-light mb-0">{movie.title}</h4>
            <div className="text-secondary small">
              <i className="bi bi-tv me-1 text-danger"></i> {showtime.screenName} ({showtime.screenType})
            </div>
          </div>

          <div className="d-flex align-items-center gap-4 text-md-end">
            <div>
              <span className="text-white-50 small d-block">SCREENING DATE & TIME</span>
              <strong className="text-light fs-6">
                <i className="bi bi-calendar3 me-1 text-danger"></i> {showtime.date} at {showtime.time}
              </strong>
            </div>
            <button onClick={fetchSeats} className="btn btn-outline-secondary btn-sm rounded-pill" title="Refresh Live Seats">
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        {/* Main Layout: Left Seat Grid, Right Cart Summary */}
        <div className="row g-4">
          {/* Seat Grid */}
          <div className="col-lg-8">
            <SeatMatrix
              seatRows={seatData.seatRows}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              pricing={showtime.pricing}
            />
          </div>

          {/* Right Summary Panel */}
          <div className="col-lg-4">
            <div className="bg-black bg-opacity-75 p-4 rounded-4 border border-secondary border-opacity-25 shadow-lg sticky-top" style={{ top: '90px' }}>
              <h5 className="fw-bold text-light mb-3">
                <i className="bi bi-receipt text-danger me-2"></i>Booking Summary
              </h5>

              {/* Movie info snippet */}
              <div className="d-flex gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="rounded-3 shadow object-fit-cover"
                  style={{ width: '60px', height: '85px' }}
                />
                <div>
                  <h6 className="fw-bold text-light mb-1 text-truncate" style={{ maxWidth: '180px' }}>{movie.title}</h6>
                  <small className="text-secondary d-block">{movie.rating} • {movie.language}</small>
                  <small className="text-white-50">{showtime.date} | {showtime.time}</small>
                </div>
              </div>

              {/* Selected Seats List */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-white-50 small">Selected Seats:</span>
                  <span className="badge bg-secondary rounded-pill px-2 py-1 font-monospace">
                    {selectedSeats.length} / 8 max
                  </span>
                </div>

                {selectedSeats.length === 0 ? (
                  <div className="p-3 text-center bg-dark bg-opacity-50 rounded-3 text-white-50 small border border-secondary border-opacity-25">
                    <i className="bi bi-hand-index-thumb fs-4 d-block mb-1 text-secondary"></i>
                    Click any available seat from the auditorium map
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-1">
                    {selectedSeats.map((s) => (
                      <span key={s.seatNumber} className="badge bg-dark border border-secondary text-light px-2 py-1 rounded-2 font-monospace">
                        <strong className="text-danger me-1">{s.seatNumber}</strong>(${s.price})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial Calculation */}
              {selectedSeats.length > 0 && (
                <div className="bg-dark bg-opacity-40 p-3 rounded-3 border border-secondary border-opacity-25 small mb-3">
                  <div className="d-flex justify-content-between mb-1 text-white-50">
                    <span>Tickets Subtotal</span>
                    <span className="text-light">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1 text-white-50">
                    <span>Convenience Fee</span>
                    <span className="text-light">${convenienceFee.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1 text-white-50">
                    <span>Tax (8%)</span>
                    <span className="text-light">${tax.toFixed(2)}</span>
                  </div>
                  <hr className="border-secondary border-opacity-25 my-2" />
                  <div className="d-flex justify-content-between fs-6 fw-bold">
                    <span className="text-light">Total Amount</span>
                    <span className="text-danger">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={selectedSeats.length === 0}
                onClick={handleCheckoutClick}
                className="btn btn-danger w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
              >
                <i className="bi bi-shield-check"></i>
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Reserve'}
              </button>

              <div className="text-center mt-3 text-secondary font-monospace" style={{ fontSize: '0.7rem' }}>
                <i className="bi bi-lock me-1"></i> Real-time locked session
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      <BookingModal
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        movie={movie}
        showtime={showtime}
        selectedSeats={selectedSeats}
        onConfirmBooking={handleConfirmBooking}
        isProcessing={isSubmitting}
      />

      {/* Digital E-Ticket Modal */}
      <TicketModal
        show={showTicketModal}
        onClose={() => {
          setShowTicketModal(false);
          navigate('/my-bookings');
        }}
        booking={confirmedBooking}
      />
    </div>
  );
};

export default SeatSelectionPage;
