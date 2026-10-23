import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingModal = ({ ride, role = 'rider', onSubmit, onClose }) => {
  const [score, setScore] = useState(5);
  const [review, setReview] = useState('');

  if (!ride) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(score, review);
  };

  const totalFare = ride.fare?.totalFare || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-150">
      <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl text-center">
        <h3 className="text-lg font-black text-slate-900">Trip Completed</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {role === 'rider' ? 'How was your driver?' : 'Payment settled with passenger.'}
        </p>

        {/* Receipt summary */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-4 flex items-center justify-around">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Distance</span>
            <span className="text-xs font-bold text-slate-900">{ride.distanceKm} km</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              {role === 'rider' ? 'Total Fare' : 'Earned'}
            </span>
            <span className="text-sm font-black text-slate-900">
              ₹{role === 'rider' ? totalFare.toFixed(0) : (totalFare * 0.85).toFixed(0)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                className="p-1 transition hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    score >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Add a comment (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-600"
          />

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm shadow-blue-600/20"
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
