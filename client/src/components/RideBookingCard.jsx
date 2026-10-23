import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, TrendingUp, Home, Briefcase, ShoppingBag, Plane, Train, Sparkles } from 'lucide-react';
import api from '../services/api';
import { LocationSearchInput } from './LocationSearchInput';

const QUICK_SAVED_LOCATIONS = [
  { label: 'Airport', name: 'International Airport', icon: Plane },
  { label: 'Tech Park', name: 'IT Tech Park Hub', icon: Briefcase },
  { label: 'Shopping Mall', name: 'Central Mall & Plaza', icon: ShoppingBag },
  { label: 'Railway Station', name: 'Central Railway Station', icon: Train },
  { label: 'Home', name: 'Home Residence', icon: Home }
];

const CATEGORY_META = {
  Moto: { badge: 'Bike', desc: '1 Seat' },
  Auto: { badge: 'Auto', desc: '3 Seats' },
  Mini: { badge: 'Mini', desc: '4 Seats' },
  Sedan: { badge: 'Sedan', desc: '4 Seats' },
  SUV: { badge: 'SUV', desc: '6 Seats' },
  Electric: { badge: 'EV ⚡', desc: '4 Seats' }
};

export const RideBookingCard = ({
  userName = 'Rider',
  pickup,
  destination,
  setPickup,
  setDestination,
  onEstimateReady,
  onRequestRide,
  isRequesting
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Mini');
  const [estimateData, setEstimateData] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  useEffect(() => {
    if (pickup?.coordinates && destination?.coordinates) {
      fetchEstimate();
    }
  }, [pickup, destination]);

  const fetchEstimate = async () => {
    setLoadingEstimate(true);
    try {
      const res = await api.post('/rides/estimate', {
        pickupLng: pickup.coordinates[0],
        pickupLat: pickup.coordinates[1],
        destLng: destination.coordinates[0],
        destLat: destination.coordinates[1],
        pickupAddress: pickup.address,
        destAddress: destination.address
      });
      setEstimateData(res.data.data);
      if (onEstimateReady) {
        onEstimateReady(res.data.data);
      }
    } catch (err) {
      console.error('Estimate failed:', err);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleQuickSelect = (loc) => {
    // Search for nearest matching location in India
    setDestination({
      address: loc.name
    });
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 text-white rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
      {/* Dribbble Style Welcome Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome, {userName}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Where do you wanna go across India?
          </p>
        </div>

        {estimateData?.surgeMultiplier > 1.0 && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{estimateData.surgeMultiplier}x Peak Surge</span>
          </span>
        )}
      </div>

      {/* From / To Stacked Inputs */}
      <div className="flex flex-col gap-2.5">
        <LocationSearchInput
          label="From"
          placeholder="Enter pickup point in any Indian city..."
          value={pickup}
          onChange={(addr) => setPickup((prev) => ({ ...prev, address: addr }))}
          onSelectLocation={(loc) => setPickup({ address: loc.address, coordinates: loc.coordinates })}
          isPickup={true}
        />

        <LocationSearchInput
          label="To"
          placeholder="Where to? (e.g. Airport, Mall, IT Park, Railway Stn)"
          value={destination}
          onChange={(addr) => setDestination((prev) => ({ ...(prev || {}), address: addr }))}
          onSelectLocation={(loc) => setDestination({ address: loc.address, coordinates: loc.coordinates })}
          isPickup={false}
        />
      </div>

      {/* Quick Locations Pills across India */}
      {!destination && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="w-3 h-3" />
            <span>Popular destinations</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_SAVED_LOCATIONS.map((loc) => {
              const Icon = loc.icon;
              return (
                <button
                  key={loc.label}
                  type="button"
                  onClick={() => handleQuickSelect(loc)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition shrink-0 active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{loc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Type of Vehicle Cards */}
      {estimateData && (
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 px-0.5">
            <span>Type of vehicle</span>
            <span className="text-slate-400 font-medium text-[11px]">
              {estimateData.distanceKm} km • ~{estimateData.durationMins} mins
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(estimateData.estimates).map(([type, item]) => {
              const meta = CATEGORY_META[type] || { badge: type, desc: 'Vehicle' };
              const availableDrivers = estimateData.driverCountsByType?.[type] ?? 0;
              const isSelected = selectedCategory === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedCategory(type)}
                  className={`p-3 rounded-2xl border text-left transition relative ${
                    isSelected
                      ? 'border-blue-500 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                      : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{type}</span>
                    <div className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      <Users className="w-3 h-3" />
                      <span>{item.capacity}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] mb-1.5">
                    <span className="font-semibold text-slate-400 uppercase">{meta.badge}</span>
                    <span className={availableDrivers > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {availableDrivers > 0 ? `${availableDrivers} online` : 'Available'}
                    </span>
                  </div>

                  <p className="text-base font-black text-white">
                    ₹{item.totalFare.toFixed(0)}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 px-1">
            💵 Direct payment via Cash or Driver's UPI QR Code.
          </p>
        </div>
      )}

      {/* Big Pill Order Button */}
      <button
        onClick={() => onRequestRide(selectedCategory, estimateData)}
        disabled={!pickup?.coordinates || !destination?.coordinates || isRequesting || loadingEstimate}
        className="w-full py-4 mt-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-black text-sm transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isRequesting ? (
          <span>Contacting nearest {selectedCategory}...</span>
        ) : (
          <>
            <span>Order {selectedCategory}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
