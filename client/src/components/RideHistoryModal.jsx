import React, { useState, useEffect } from 'react';
import { History, X, MapPin, Calendar, CreditCard, Star, Clock, CheckCircle2, XCircle, User, Car } from 'lucide-react';
import api from '../services/api';

export const RideHistoryModal = ({ isOpen, onClose, role = 'rider' }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rides/history');
      setRides(res.data.data.rides || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Trip History & Receipts</h3>
              <p className="text-xs text-slate-500">
                {role === 'driver' ? 'Your completed driver trips & earnings' : 'Your past rides, receipts & driver details'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 mt-2">Loading trip records...</p>
            </div>
          ) : rides.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-600">No rides recorded</p>
              <p className="text-xs text-slate-400">Completed and cancelled rides will appear here</p>
            </div>
          ) : (
            rides.map((ride) => {
              const formattedDate = new Date(ride.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const fare = ride.fare?.totalFare || 0;
              const driverEarning = (fare * 0.85).toFixed(0);
              const isCancelled = ride.status === 'CANCELLED';

              const driver = ride.driver;
              const rider = ride.rider;

              return (
                <div
                  key={ride._id}
                  className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 hover:border-slate-300 transition space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {ride.vehicleType}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-black ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        ₹{role === 'driver' ? driverEarning : fare.toFixed(0)}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        {isCancelled ? 'Cancelled' : `${ride.paymentMethod || 'CASH'} Payment`}
                      </span>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="space-y-1.5 text-xs bg-white p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Pickup</span>
                        <p className="text-slate-800 font-medium">{ride.pickup?.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-50">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination</span>
                        <p className="text-slate-800 font-medium">{ride.destination?.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Driver & Rider Info Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Driver Details */}
                    {driver ? (
                      <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          <span>Driver Details</span>
                        </span>
                        <p className="font-bold text-slate-900">{driver.user?.name || 'Driver'}</p>
                        <p className="text-[11px] text-slate-500">{driver.user?.phone || 'No phone'}</p>
                        <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-600">
                          <span>Plate: {driver.vehicle?.licensePlate || 'N/A'}</span>
                          <span>RC: {driver.vehicle?.rcNumber || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded-2xl border border-slate-100 text-slate-400 text-[11px]">
                        No driver assigned before cancellation
                      </div>
                    )}

                    {/* Rider Details */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Rider Details</span>
                      </span>
                      <p className="font-bold text-slate-900">{rider?.name || 'Passenger'}</p>
                      <p className="text-[11px] text-slate-500">{rider?.phone || 'No phone'}</p>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Distance: {ride.distanceKm} km • Duration: ~{ride.durationMins} mins
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Reason Banner if Cancelled */}
                  {isCancelled && ride.cancellationReason && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">
                          Cancelled by {ride.cancelledBy || 'user'}
                        </span>
                        <p className="text-[11px] opacity-90">{ride.cancellationReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Rating / Review if completed */}
                  {!isCancelled && ride.rating?.riderScore && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        ★ {ride.rating.riderScore} / 5
                      </span>
                      {ride.rating.riderReview && (
                        <span className="text-[11px] italic text-slate-500 truncate max-w-[280px]">
                          "{ride.rating.riderReview}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
