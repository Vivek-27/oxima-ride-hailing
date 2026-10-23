import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const RIDER_REASONS = [
  'Driver taking too long to arrive',
  'Changed my mind / No longer need ride',
  'Booked by mistake / Wrong pickup location',
  'Driver asked to cancel or demanded extra fare',
  'Found alternate transport',
  'Other reason'
];

const DRIVER_REASONS = [
  'Passenger not at pickup location',
  'Passenger not reachable by phone',
  'Heavy traffic / Road closed',
  'Vehicle breakdown / Emergency',
  'Other reason'
];

export const CancellationModal = ({ isOpen, onClose, onConfirm, role = 'rider', isCancelling = false }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reasonsList = role === 'driver' ? DRIVER_REASONS : RIDER_REASONS;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please select a reason for cancellation');
      return;
    }

    const finalReason = selectedReason === 'Other reason' && customNotes.trim()
      ? `Other: ${customNotes.trim()}`
      : selectedReason;

    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Cancel Trip</h3>
              <p className="text-xs text-slate-500">Please let us know why you are cancelling</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl my-3 border border-rose-200">
            {error}
          </p>
        )}

        <form onSubmit={handleConfirm} className="space-y-3 pt-3">
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {reasonsList.map((reason) => (
              <label
                key={reason}
                onClick={() => {
                  setSelectedReason(reason);
                  setError('');
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition text-xs font-semibold ${
                  selectedReason === reason
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm'
                    : 'border-slate-200/90 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="cancellationReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Other reason' && (
            <div>
              <textarea
                placeholder="Please describe the reason..."
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-600 resize-none"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Keep Trip
            </button>
            <button
              type="submit"
              disabled={isCancelling || !selectedReason}
              className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
