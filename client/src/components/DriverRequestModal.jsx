import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const DriverRequestModal = ({ offer, onAccept, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState(offer?.expiresInSeconds || 30);

  useEffect(() => {
    if (timeLeft <= 0) {
      onDecline();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onDecline]);

  if (!offer || !offer.ride) return null;

  const { ride, distanceToPickupKm } = offer;
  const driverEarnings = (ride.fare?.totalFare * 0.85).toFixed(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-150">
      <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Countdown Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between mb-4 mt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {ride.vehicleType} Trip Offer
          </span>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {timeLeft}s
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4 text-center">
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">Your Earnings (85%)</span>
          <p className="text-3xl font-black text-slate-900 mt-0.5">₹{driverEarnings}</p>
          <p className="text-xs text-slate-500 mt-1">{ride.distanceKm} km • Passenger: {ride.rider?.name || 'Rider'}</p>
        </div>

        <div className="space-y-2 mb-6 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pickup Location</span>
            <p className="font-semibold text-slate-800">{ride.pickup?.address}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination</span>
            <p className="font-semibold text-slate-800">{ride.destination?.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onDecline}
            className="py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept(ride._id)}
            className="py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/25"
          >
            Accept Trip
          </button>
        </div>
      </div>
    </div>
  );
};
