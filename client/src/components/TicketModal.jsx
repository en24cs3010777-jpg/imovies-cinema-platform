import React from 'react';

const TicketModal = ({ show, onClose, booking }) => {
  if (!show || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const movie = booking.movie || {};
  const showtime = booking.showtime || {};
  const seats = booking.seats || [];

  return (
    <div className="modal show d-block backdrop-dark-blur" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-md" role="document">
        <div className="modal-content bg-transparent border-0">
          {/* Printable Ticket Card */}
          <div className="cinema-e-ticket bg-dark text-light border border-secondary border-opacity-50 rounded-4 overflow-hidden shadow-2xl position-relative">
            {/* Header / Brand */}
            <div className="bg-danger text-light p-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-film fs-4"></i>
                <div>
                  <h6 className="fw-bold mb-0 text-uppercase tracking-wider">IMovies E-Ticket</h6>
                  <span className="small opacity-75 font-monospace">{booking.bookingId}</span>
                </div>
              </div>
              <span className={`badge ${booking.bookingStatus === 'Confirmed' ? 'bg-success' : 'bg-secondary'} rounded-pill px-3 py-1`}>
                {booking.bookingStatus}
              </span>
            </div>

            {/* Ticket Body */}
            <div className="p-4">
              <div className="d-flex gap-3 mb-4">
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="rounded-3 shadow object-fit-cover"
                    style={{ width: '80px', height: '115px' }}
                  />
                )}
                <div>
                  <h5 className="fw-bold text-light mb-1">{movie.title || 'Movie Experience'}</h5>
                  <div className="text-secondary small mb-2">
                    <span>{movie.rating || 'PG-13'}</span> • <span>{movie.language || 'English'}</span>
                  </div>
                  <div className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 mb-1 d-block text-truncate">
                    <i className="bi bi-display text-danger me-1"></i> {showtime.screenName || 'Main Cinema Hall'}
                  </div>
                </div>
              </div>

              {/* Date, Time & Screen Row */}
              <div className="row g-2 p-3 bg-black bg-opacity-50 rounded-3 border border-secondary border-opacity-25 text-center mb-3">
                <div className="col-4 border-end border-secondary border-opacity-25">
                  <span className="text-white-50 small d-block">DATE</span>
                  <strong className="text-light small">{showtime.date || 'Today'}</strong>
                </div>
                <div className="col-4 border-end border-secondary border-opacity-25">
                  <span className="text-white-50 small d-block">TIME</span>
                  <strong className="text-light small">{showtime.time || '10:00 AM'}</strong>
                </div>
                <div className="col-4">
                  <span className="text-white-50 small d-block">SCREEN</span>
                  <strong className="text-danger small">{showtime.screenType || 'IMAX'}</strong>
                </div>
              </div>

              {/* Seats breakdown */}
              <div className="mb-4">
                <span className="text-white-50 small d-block mb-1">RESERVED SEATS</span>
                <div className="d-flex flex-wrap gap-2">
                  {seats.map((s, idx) => (
                    <span key={idx} className="badge bg-dark border border-secondary px-3 py-2 text-light rounded-2 font-monospace">
                      <strong className="text-danger fs-6 me-1">{s.seatNumber}</strong> ({s.tier})
                    </span>
                  ))}
                </div>
              </div>

              {/* Perforated Divider */}
              <div className="ticket-perforation my-4 position-relative">
                <div className="ticket-notch notch-left"></div>
                <hr className="border-secondary border-opacity-50 border-dashed m-0" />
                <div className="ticket-notch notch-right"></div>
              </div>

              {/* Barcode & Total */}
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-white-50 small d-block">TOTAL PAID</span>
                  <h4 className="text-light fw-bold mb-0">${booking.totalAmount?.toFixed(2)}</h4>
                  <span className="text-secondary small font-monospace">{booking.paymentMethod}</span>
                </div>

                {/* Simulated QR Code */}
                <div className="text-center bg-white p-2 rounded-3 shadow-sm">
                  <div className="simulated-qr d-flex flex-column align-items-center justify-content-center p-1">
                    <i className="bi bi-qr-code text-dark fs-1"></i>
                    <span className="text-dark font-monospace" style={{ fontSize: '0.6rem' }}>SCAN AT GATE</span>
                  </div>
                </div>
              </div>

              {/* Transaction footer */}
              <div className="mt-3 pt-3 border-top border-secondary border-opacity-25 text-center text-white-50 small font-monospace">
                Txn Ref: {booking.transactionId}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 bg-black bg-opacity-75 border-top border-secondary border-opacity-25 d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-light w-50 rounded-pill py-2 small"
                onClick={handlePrint}
              >
                <i className="bi bi-printer me-1"></i> Print Ticket
              </button>
              <button
                type="button"
                className="btn btn-danger w-50 rounded-pill py-2 small fw-bold"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
