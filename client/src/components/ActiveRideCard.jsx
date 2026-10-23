import React, { useState } from 'react';
import { Phone, KeyRound, QrCode, CheckCircle2, AlertCircle, Radio, XCircle, ShieldCheck } from 'lucide-react';
import { CancellationModal } from './CancellationModal';

export const ActiveRideCard = ({
  ride,
  role = 'rider',
  driverDistanceToPickupMeters = 0,
  onMarkArrived,
  onStartRide,
  onCompleteRide,
  onCancelRide,
  onDismissRide,
  isActionLoading
}) => {
  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('CASH');

  if (!ride) return null;

  const driver = ride.driver;
  const rider = ride.rider;
  const status = ride.status;
  const totalFare = ride.fare?.totalFare || 0;
  const driverUpi = driver?.upiId || 'driver@upi';
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(driverUpi)}&pn=${encodeURIComponent(
    driver?.user?.name || 'Driver'
  )}&am=${totalFare}&cu=INR`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayUrl)}`;

  const isWithin20Meters = driverDistanceToPickupMeters <= 20;

  const handleStartWithOtp = (e) => {
    e.preventDefault();
    if (otpInput.length !== 4) {
      setErrorMsg('Please enter the 4-digit PIN');
      return;
    }
    if (!isWithin20Meters) {
      setErrorMsg(`You must be within 20m of pickup point. Current distance: ${driverDistanceToPickupMeters}m`);
      return;
    }
    setErrorMsg('');
    onStartRide(otpInput);
  };

  const handleConfirmCancellation = (reason) => {
    setShowCancelModal(false);
    onCancelRide(reason);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'SEARCHING':
        return { label: 'Finding nearest driver in area...', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ACCEPTED':
        return { label: 'Driver accepted & heading to pickup', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ARRIVED':
        return { label: 'Driver arrived at pickup location', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'IN_PROGRESS':
        return { label: 'Trip in progress to destination', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'COMPLETED':
        return { label: 'Trip Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800' };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
          {badge.label}
        </span>
        <span className="text-sm font-black text-slate-900">
          ₹{totalFare.toFixed(0)} • {ride.vehicleType}
        </span>
      </div>

      {/* RIDER VIEW: Searching Radar Animation */}
      {role === 'rider' && status === 'SEARCHING' && (
        <div className="bg-blue-50/50 border border-blue-200/70 rounded-3xl p-6 text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {/* Animated Radar Rings */}
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
            <div className="absolute -inset-2 rounded-full border border-blue-400/40 animate-pulse"></div>
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 relative z-10">
              <Radio className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          <div>
            <h3 className="font-black text-slate-900 text-sm">Searching for Nearest {ride.vehicleType}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Contacting online drivers in Hyderabad within 20 km...
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-white/80 py-1.5 px-3 rounded-full border border-blue-100 mx-auto max-w-[240px]">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Broadcasting ride offer</span>
          </div>

          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="w-full py-2.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition shadow-sm"
          >
            Cancel Ride Request
          </button>
        </div>
      )}

      {/* RIDER VIEW: Active Driver Assigned */}
      {role === 'rider' && status !== 'SEARCHING' && driver && (
        <div className="flex flex-col gap-3">
          {/* Detailed Driver Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  {driver.user?.name ? driver.user.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>{driver.user?.name || 'Driver'}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      ★ {driver.rating || '4.9'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    {driver.vehicle?.make} {driver.vehicle?.model} ({driver.vehicle?.color})
                  </p>
                </div>
              </div>

              <a
                href={`tel:${driver.user?.phone || ''}`}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm flex items-center gap-1 hover:bg-slate-50 transition"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call</span>
              </a>
            </div>

            {/* Vehicle Specs Pill */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {driver.vehicle?.licensePlate}
              </span>
              <span className="font-mono text-slate-500 text-[10px]">
                RC: {driver.vehicle?.rcNumber}
              </span>
            </div>
          </div>

          {/* 4-Digit Security PIN */}
          {['ACCEPTED', 'ARRIVING', 'ARRIVED'].includes(status) && (
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 uppercase mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Your Security PIN for Driver</span>
              </div>
              <p className="text-3xl font-mono font-black tracking-widest text-slate-900">
                {ride.otp}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Share with your driver before trip starts</p>
            </div>
          )}

          {/* UPI QR Payment Button */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Pay via Driver's UPI QR Code / Cash</span>
          </button>

          {/* End & Dismiss / Done Button */}
          {['IN_PROGRESS', 'ARRIVED', 'COMPLETED'].includes(status) && (
            <button
              onClick={onDismissRide}
              disabled={isActionLoading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Done / End & Dismiss Ride</span>
            </button>
          )}

          {/* Cancel button with Reason Modal */}
          {['ACCEPTED', 'ARRIVING'].includes(status) && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={isActionLoading}
              className="w-full py-2 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
            >
              Cancel Ride
            </button>
          )}
        </div>
      )}

      {/* DRIVER VIEW */}
      {role === 'driver' && (
        <div className="flex flex-col gap-3">
          {/* Passenger Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  {rider?.name ? rider.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rider?.name || 'Passenger'}</h4>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">{ride.pickup?.address}</p>
                </div>
              </div>

              <a
                href={`tel:${rider?.phone || ''}`}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm flex items-center gap-1 hover:bg-slate-50 transition"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call</span>
              </a>
            </div>

            <div className="pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
              <span className="font-semibold">Dropoff:</span> {ride.destination?.address}
            </div>
          </div>

          {status === 'ACCEPTED' && (
            <button
              onClick={onMarkArrived}
              disabled={isActionLoading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/20"
            >
              Arrived at Pickup Location
            </button>
          )}

          {status === 'ARRIVED' && (
            <form onSubmit={handleStartWithOtp} className="flex flex-col gap-2">
              <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                isWithin20Meters
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {isWithin20Meters ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold">
                    {isWithin20Meters
                      ? `Within ${driverDistanceToPickupMeters}m of Passenger ✓`
                      : `Distance to Passenger: ${driverDistanceToPickupMeters}m`}
                  </p>
                  <p className="text-[10px] opacity-80">
                    {isWithin20Meters
                      ? 'You are at pickup location. Enter passenger PIN to start.'
                      : 'You must be within 20m of passenger to enter PIN.'}
                  </p>
                </div>
              </div>

              <input
                type="text"
                maxLength={4}
                disabled={!isWithin20Meters}
                placeholder={isWithin20Meters ? "Enter Passenger's 4-digit PIN" : "Locked: Arrive within 20m"}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full py-2.5 text-center font-mono text-xl tracking-widest bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-blue-600 disabled:opacity-50 disabled:bg-slate-100"
              />
              {errorMsg && <p className="text-xs text-rose-500 text-center font-medium">{errorMsg}</p>}
              <button
                type="submit"
                disabled={isActionLoading || otpInput.length !== 4 || !isWithin20Meters}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md disabled:opacity-40"
              >
                Verify PIN & Start Trip
              </button>
            </form>
          )}

          {status === 'IN_PROGRESS' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Show My UPI QR Code to Passenger</span>
              </button>

              <button
                onClick={() => onCompleteRide(selectedPaymentMode)}
                disabled={isActionLoading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment Received (₹{totalFare.toFixed(0)}) & Complete</span>
              </button>
            </div>
          )}

          {/* Cancel button with modal */}
          {['REQUESTED', 'SEARCHING', 'ACCEPTED'].includes(status) && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={isActionLoading}
              className="w-full py-2 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
            >
              Cancel Trip
            </button>
          )}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancellation}
        role={role}
        isCancelling={isActionLoading}
      />

      {/* Dynamic UPI QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Driver UPI QR Payment</span>
              </div>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-700 text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Scan with Google Pay, PhonePe, Paytm, or BHIM UPI
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block mb-3">
              <img
                src={qrImageSrc}
                alt="UPI QR Code"
                className="w-48 h-48 mx-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-1 text-xs mb-4">
              <p className="font-semibold text-slate-800">
                Amount: <strong className="text-sm font-black text-slate-900">₹{totalFare.toFixed(0)}</strong>
              </p>
              <p className="text-slate-500 text-[11px] font-mono">UPI ID: {driverUpi}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
