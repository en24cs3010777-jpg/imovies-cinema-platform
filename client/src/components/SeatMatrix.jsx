import React from 'react';

const SeatMatrix = ({
  seatRows = [],
  selectedSeats = [],
  onSeatToggle,
  maxSeats = 8,
  pricing = { vip: 20, premium: 16, standard: 12 }
}) => {
  const isSeatSelected = (seatNumber) => {
    return selectedSeats.some((s) => s.seatNumber === seatNumber);
  };

  const getSeatColorClass = (seat) => {
    if (seat.status === 'booked') {
      return 'seat-booked';
    }
    if (isSeatSelected(seat.seatNumber)) {
      return 'seat-selected';
    }
    if (seat.tier === 'VIP') {
      return 'seat-vip';
    }
    if (seat.tier === 'Premium') {
      return 'seat-premium';
    }
    return 'seat-standard';
  };

  return (
    <div className="seat-matrix-wrapper bg-black bg-opacity-75 p-4 rounded-4 border border-secondary border-opacity-25 shadow-lg">
      {/* Cinema Screen Indicator */}
      <div className="cinema-screen-container text-center mb-5">
        <div className="cinema-screen-curve mx-auto mb-2"></div>
        <p className="text-secondary font-monospace small text-uppercase mb-0 tracking-wider">
          <i className="bi bi-display me-2 text-danger"></i> ALL EYES THIS WAY — CINEMA SCREEN
        </p>
      </div>

      {/* Seat Rows Layout */}
      <div className="d-flex flex-column align-items-center gap-2 overflow-x-auto pb-4">
        {seatRows.map((row) => (
          <div key={row.rowLetter} className="d-flex align-items-center gap-3 seat-row">
            {/* Row Letter Left */}
            <span className="badge bg-secondary bg-opacity-25 text-white-50 font-monospace row-label">
              {row.rowLetter}
            </span>

            {/* Seats Grid */}
            <div className="d-flex align-items-center gap-2">
              {row.seats.map((seat, idx) => {
                const selected = isSeatSelected(seat.seatNumber);
                const booked = seat.status === 'booked';

                return (
                  <React.Fragment key={seat.seatNumber}>
                    {/* Add center aisle walkway gap between column 4 and 5 */}
                    {idx === 4 && <div className="seat-aisle-gap"></div>}

                    <button
                      type="button"
                      disabled={booked}
                      onClick={() => onSeatToggle(seat)}
                      className={`btn seat-btn p-0 d-flex flex-column align-items-center justify-content-center ${getSeatColorClass(
                        seat
                      )}`}
                      title={`${seat.seatNumber} (${seat.tier}) - $${seat.price}${
                        booked ? ' [Reserved]' : ''
                      }`}
                    >
                      <i
                        className={`bi ${
                          booked
                            ? 'bi-x-lg'
                            : selected
                            ? 'bi-check-lg'
                            : 'bi-square-fill'
                        } seat-icon`}
                      ></i>
                      <span className="seat-num">{seat.column}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Row Letter Right */}
            <span className="badge bg-secondary bg-opacity-25 text-white-50 font-monospace row-label">
              {row.rowLetter}
            </span>
          </div>
        ))}
      </div>

      {/* Seat Tier & Status Legend */}
      <div className="border-top border-secondary border-opacity-25 pt-4 mt-2">
        <div className="row g-3 text-center small text-white-50 justify-content-center">
          <div className="col-auto d-flex align-items-center gap-2">
            <span className="legend-indicator seat-available-indicator"></span>
            <span>Available</span>
          </div>
          <div className="col-auto d-flex align-items-center gap-2">
            <span className="legend-indicator seat-selected-indicator"></span>
            <span className="text-success fw-semibold">Selected</span>
          </div>
          <div className="col-auto d-flex align-items-center gap-2">
            <span className="legend-indicator seat-booked-indicator"></span>
            <span>Reserved / Booked</span>
          </div>
          <div className="col-auto d-flex align-items-center gap-2">
            <span className="legend-indicator seat-vip-indicator"></span>
            <span className="text-warning fw-semibold">VIP (${pricing.vip || 22})</span>
          </div>
          <div className="col-auto d-flex align-items-center gap-2">
            <span className="legend-indicator seat-premium-indicator"></span>
            <span className="text-info fw-semibold">Premium (${pricing.premium || 18})</span>
          </div>
          <div className="col-auto d-flex align-items-center gap-2">
            <span className="legend-indicator seat-standard-indicator"></span>
            <span>Standard (${pricing.standard || 14})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMatrix;
