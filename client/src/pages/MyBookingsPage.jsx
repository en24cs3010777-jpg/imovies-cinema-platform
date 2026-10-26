import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import TicketModal from '../components/TicketModal';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await bookingAPI.getMyBookings();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking? Your seats will be released and a refund will be processed.'
    );
    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      const { data } = await bookingAPI.cancel(bookingId);
      if (data.success) {
        alert('Booking cancelled successfully. Your refund has been initiated.');
        fetchBookings();
      }
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewTicket = (booking) => {
    setSelectedTicket(booking);
    setShowTicketModal(true);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'Confirmed') return b.bookingStatus === 'Confirmed';
    if (activeTab === 'Cancelled') return b.bookingStatus === 'Cancelled';
    return true;
  });

  return (
    <div className="container py-4 pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-danger rounded-pill px-3 py-1 font-monospace mb-2">MY TICKET PASSES</span>
          <h2 className="fw-bold text-light mb-1">My Cinema Reservations</h2>
          <p className="text-secondary small mb-0">
            View your upcoming showtimes, access digital QR passes, and manage past ticket bookings.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="btn-group" role="group">
          {['All', 'Confirmed', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`btn btn-sm ${
                activeTab === tab
                  ? 'btn-danger fw-bold'
                  : 'btn-dark border border-secondary text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-5 text-danger">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-5 my-4 bg-black bg-opacity-50 rounded-4 border border-secondary border-opacity-25">
          <i className="bi bi-ticket-perforated fs-1 text-secondary d-block mb-3"></i>
          <h5 className="text-light fw-bold">No reservations found</h5>
          <p className="text-secondary small mb-3">You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings yet.</p>
          <Link to="/movies" className="btn btn-danger rounded-pill px-4 btn-sm fw-medium">
            Browse Movies & Book Now
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredBookings.map((booking) => {
            const movie = booking.movie || {};
            const showtime = booking.showtime || {};

            return (
              <div
                key={booking._id}
                className="card bg-black bg-opacity-75 text-light border-secondary border-opacity-25 rounded-4 shadow-md overflow-hidden hover-card transition-all"
              >
                <div className="card-body p-4">
                  <div className="row g-4 align-items-center">
                    {/* Poster thumbnail */}
                    <div className="col-md-2 col-sm-3 col-4 text-center">
                      <img
                        src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'}
                        alt={movie.title}
                        className="rounded-3 shadow object-fit-cover w-100"
                        style={{ maxHeight: '135px' }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="col-md-7 col-sm-9 col-8">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className="badge bg-dark border border-secondary text-white-50 font-monospace small">
                          {booking.bookingId}
                        </span>
                        <span
                          className={`badge rounded-pill px-3 py-1 font-monospace small ${
                            booking.bookingStatus === 'Confirmed'
                              ? 'bg-success text-light'
                              : 'bg-secondary text-white-50'
                          }`}
                        >
                          {booking.bookingStatus}
                        </span>
                      </div>

                      <h5 className="fw-bold text-light mb-1">{movie.title || 'Movie Screening'}</h5>

                      <div className="text-secondary small mb-2">
                        <i className="bi bi-display text-danger me-1"></i> {showtime.screenName} ({showtime.screenType})
                        <span className="mx-2">•</span>
                        <i className="bi bi-calendar3 text-danger me-1"></i> {showtime.date} at {showtime.time}
                      </div>

                      {/* Reserved Seats Pills */}
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {booking.seats?.map((s, idx) => (
                          <span key={idx} className="badge bg-dark border border-secondary text-light px-2 py-1 rounded-2 font-monospace small">
                            <strong className="text-danger me-1">{s.seatNumber}</strong> ({s.tier})
                          </span>
                        ))}
                      </div>

                      <div className="small text-white-50">
                        Total Paid: <strong className="text-light">${booking.totalAmount?.toFixed(2)}</strong> via {booking.paymentMethod}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-md-3 col-12 d-flex flex-md-column gap-2 justify-content-end">
                      <button
                        type="button"
                        onClick={() => handleViewTicket(booking)}
                        className="btn btn-outline-light rounded-pill btn-sm py-2 px-3 fw-medium d-flex align-items-center justify-content-center gap-2"
                      >
                        <i className="bi bi-qr-code"></i> View E-Ticket
                      </button>

                      {booking.bookingStatus === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="btn btn-outline-danger rounded-pill btn-sm py-2 px-3 d-flex align-items-center justify-content-center gap-2"
                        >
                          {cancellingId === booking._id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className="bi bi-x-circle"></i>
                          )}
                          Cancel Ticket
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      <TicketModal
        show={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        booking={selectedTicket}
      />
    </div>
  );
};

export default MyBookingsPage;
