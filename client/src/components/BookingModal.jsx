import React, { useState } from 'react';

const BookingModal = ({
  show,
  onClose,
  movie,
  showtime,
  selectedSeats,
  onConfirmBooking,
  isProcessing
}) => {
  const [paymentMethod, setPaymentMethod] = useState('Credit/Debit Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  if (!show) return null;

  const subtotal = selectedSeats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const convenienceFee = selectedSeats.length * 1.5;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal + convenienceFee + tax) * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmBooking({
      paymentMethod,
      seats: selectedSeats
    });
  };

  return (
    <div className="modal show d-block backdrop-dark-blur" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content bg-dark text-light border border-secondary border-opacity-50 shadow-2xl rounded-4">
          {/* Header */}
          <div className="modal-header border-secondary border-opacity-25 pb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger rounded-pill px-3 py-1">
                <i className="bi bi-shield-check me-1"></i> Checkout
              </span>
              <h5 className="modal-title fw-bold text-light mb-0">Confirm Ticket Reservation</h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isProcessing}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body py-4">
              <div className="row g-4">
                {/* Left Column: Movie & Seat Summary */}
                <div className="col-md-6 border-end-md border-secondary border-opacity-25">
                  <div className="d-flex gap-3 mb-4">
                    <img
                      src={movie?.posterUrl}
                      alt={movie?.title}
                      className="rounded-3 shadow object-fit-cover"
                      style={{ width: '85px', height: '120px' }}
                    />
                    <div>
                      <h6 className="fw-bold text-light mb-1">{movie?.title}</h6>
                      <div className="text-secondary small mb-2">
                        <span>{movie?.rating || 'PG-13'}</span> • <span>{movie?.duration} min</span>
                      </div>
                      <div className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 mb-1 d-block text-truncate">
                        <i className="bi bi-display me-1 text-danger"></i> {showtime?.screenName}
                      </div>
                      <div className="small text-white-50">
                        <i className="bi bi-calendar3 me-1 text-danger"></i> {showtime?.date} at {showtime?.time}
                      </div>
                    </div>
                  </div>

                  {/* Selected Seats Pills */}
                  <h6 className="fw-bold text-uppercase small text-white-50 mb-2">Selected Seats ({selectedSeats.length})</h6>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {selectedSeats.map((s) => (
                      <span key={s.seatNumber} className="badge bg-dark border border-secondary px-3 py-2 rounded-3 text-light">
                        <span className="fw-bold text-danger me-1">{s.seatNumber}</span>
                        <span className="text-white-50 font-monospace">({s.tier} - ${s.price})</span>
                      </span>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-black bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 small">
                    <div className="d-flex justify-content-between mb-2 text-white-50">
                      <span>Tickets Subtotal</span>
                      <span className="text-light">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-white-50">
                      <span>Convenience & Booking Fee</span>
                      <span className="text-light">${convenienceFee.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-white-50">
                      <span>Taxes & GST (8%)</span>
                      <span className="text-light">${tax.toFixed(2)}</span>
                    </div>
                    <hr className="border-secondary border-opacity-25 my-2" />
                    <div className="d-flex justify-content-between fs-6 fw-bold">
                      <span className="text-light">Total Payable</span>
                      <span className="text-danger">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Method */}
                <div className="col-md-6">
                  <h6 className="fw-bold text-light mb-3">
                    <i className="bi bi-credit-card-2-front text-danger me-2"></i>Select Payment Method
                  </h6>

                  <div className="d-flex flex-column gap-2 mb-4">
                    {['Credit/Debit Card', 'Apple Pay', 'UPI', 'PayPal'].map((method) => (
                      <label
                        key={method}
                        className={`d-flex align-items-center justify-content-between p-3 rounded-3 border cursor-pointer transition-all ${
                          paymentMethod === method
                            ? 'border-danger bg-danger bg-opacity-10 text-light'
                            : 'border-secondary border-opacity-25 bg-black bg-opacity-25 text-white-50'
                        }`}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="form-check-input mt-0"
                          />
                          <span className="fw-medium text-light">{method}</span>
                        </div>
                        <i className={`bi ${method === 'Credit/Debit Card' ? 'bi-credit-card' : method === 'Apple Pay' ? 'bi-apple' : method === 'UPI' ? 'bi-phone' : 'bi-paypal'} fs-5`}></i>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'Credit/Debit Card' && (
                    <div className="bg-black bg-opacity-40 p-3 rounded-3 border border-secondary border-opacity-25 small mb-3">
                      <div className="mb-2">
                        <label className="form-label text-white-50 mb-1">Demo Card Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-dark text-light border-secondary"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label text-white-50 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-light border-secondary"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-white-50 mb-1">CVV</label>
                          <input
                            type="password"
                            className="form-control form-control-sm bg-dark text-light border-secondary"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-secondary small d-flex align-items-center gap-2">
                    <i className="bi bi-lock-fill text-success"></i>
                    <span>256-Bit Encrypted Simulation • Instant Confirmation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-secondary border-opacity-25">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger rounded-pill px-5 fw-bold shadow-lg d-flex align-items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill"></i> Pay ${grandTotal.toFixed(2)} & Reserve
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
