import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { MapView } from '../components/MapView';
import { DriverRequestModal } from '../components/DriverRequestModal';
import { ActiveRideCard } from '../components/ActiveRideCard';
import { RatingModal } from '../components/RatingModal';
import { fetchRoadRoute } from '../services/routingService';
import { Play, Pause, Settings, Check, Navigation, Gauge, Zap } from 'lucide-react';

const SIM_SPEEDS = [
  { label: '1x', delayMs: 1200, speedKmh: 30 },
  { label: '2x', delayMs: 600, speedKmh: 60 },
  { label: '5x', delayMs: 250, speedKmh: 120 },
  { label: '10x', delayMs: 80, speedKmh: 240 }
];

export const DriverDashboard = () => {
  const { user, driver, refreshUser } = useAuth();
  const { socket } = useSocket();

  const [driverProfile, setDriverProfile] = useState(driver);
  // Default to OFFLINE initially unless driver explicitly toggled online
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(
    driver?.currentLocation?.coordinates || [77.2090, 28.6139] // Real-time GPS coordinate
  );
  const [heading, setHeading] = useState(driver?.currentHeading || 90);

  // Navigation Road Routes
  const [pickupRouteCoordinates, setPickupRouteCoordinates] = useState([]);
  const [tripRouteCoordinates, setTripRouteCoordinates] = useState([]);
  const [navSummary, setNavSummary] = useState({ distanceKm: 0, durationMins: 0 });

  // Simulation & Speed Controls
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);
  const [simSpeedIdx, setSimSpeedIdx] = useState(0);
  const currentSimStepRef = useRef(0);
  const currentWaypointsRef = useRef([]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completedRideData, setCompletedRideData] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [gpsActive, setGpsActive] = useState(false);

  // Driver Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [upiInput, setUpiInput] = useState(driver?.upiId || '');
  const [vehicleMakeInput, setVehicleMakeInput] = useState(driver?.vehicle?.make || '');
  const [vehicleModelInput, setVehicleModelInput] = useState(driver?.vehicle?.model || '');
  const [rcInput, setRcInput] = useState(driver?.vehicle?.rcNumber || '');
  const [plateInput, setPlateInput] = useState(driver?.vehicle?.licensePlate || '');
  const [vehicleTypeInput, setVehicleTypeInput] = useState(driver?.vehicle?.type || 'Mini');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const simIntervalRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchActiveRide();
  }, []);

  // Cleanup on tab closure / navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (driverProfile?._id && isOnline && !activeRide && socket) {
        socket.emit('driver:status:toggle', {
          driverId: driverProfile._id,
          status: 'OFFLINE'
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [driverProfile, isOnline, activeRide, socket]);

  const getDistanceToPickupMeters = () => {
    if (!activeRide?.pickup?.location?.coordinates || !currentCoords) return 0;
    const [pLng, pLat] = activeRide.pickup.location.coordinates;
    const [dLng, dLat] = currentCoords;

    const R = 6371000;
    const dLatRad = ((pLat - dLat) * Math.PI) / 180;
    const dLonRad = ((pLng - dLng) * Math.PI) / 180;
    const a =
      Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
      Math.cos((dLat * Math.PI) / 180) *
        Math.cos((pLat * Math.PI) / 180) *
        Math.sin(dLonRad / 2) *
        Math.sin(dLonRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const distanceToPickupMeters = getDistanceToPickupMeters();

  useEffect(() => {
    if (!activeRide) {
      setPickupRouteCoordinates([]);
      setTripRouteCoordinates([]);
      setNavSummary({ distanceKm: 0, durationMins: 0 });
      return;
    }

    const computeRoutes = async () => {
      const pCoords = activeRide.pickup?.location?.coordinates;
      const dCoords = activeRide.destination?.location?.coordinates;

      if (['ACCEPTED', 'ARRIVING'].includes(activeRide.status) && pCoords) {
        const route = await fetchRoadRoute(currentCoords, pCoords);
        if (route) {
          setPickupRouteCoordinates(route.polyline);
          setTripRouteCoordinates([]);
          setNavSummary({ distanceKm: route.distanceKm, durationMins: route.durationMins });
        }
      } else if (activeRide.status === 'IN_PROGRESS' && pCoords && dCoords) {
        const route = await fetchRoadRoute(pCoords, dCoords);
        if (route) {
          setTripRouteCoordinates(route.polyline);
          setPickupRouteCoordinates([]);
          setNavSummary({ distanceKm: route.distanceKm, durationMins: route.durationMins });
        }
      } else if (activeRide.routePolyline && activeRide.routePolyline.length > 0) {
        setTripRouteCoordinates(activeRide.routePolyline);
      }
    };

    computeRoutes();
  }, [activeRide?.status, activeRide?._id]);

  useEffect(() => {
    if (isOnline && navigator.geolocation) {
      setGpsActive(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (isSimulatingDrive) return;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const head = pos.coords.heading || heading;

          setCurrentCoords([lng, lat]);
          setHeading(head);

          if (socket && driverProfile?._id) {
            socket.emit('driver:location:update', {
              driverId: driverProfile._id,
              latitude: lat,
              longitude: lng,
              heading: head,
              speed: pos.coords.speed || 30,
              status: activeRide ? 'ON_TRIP' : 'ONLINE',
              activeRideId: activeRide?._id
            });
          }
        },
        (err) => {
          console.warn('Driver GPS notice:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    } else {
      setGpsActive(false);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isOnline, socket, driverProfile, activeRide, isSimulatingDrive]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/drivers/profile');
      const d = res.data.data.driver;
      setDriverProfile(d);
      setIsOnline(d.status === 'ONLINE' || d.status === 'ON_TRIP' || d.status === 'BUSY');
      if (d.currentLocation?.coordinates) {
        setCurrentCoords(d.currentLocation.coordinates);
      }
      setUpiInput(d.upiId || '');
      setVehicleMakeInput(d.vehicle?.make || '');
      setVehicleModelInput(d.vehicle?.model || '');
      setRcInput(d.vehicle?.rcNumber || '');
      setPlateInput(d.vehicle?.licensePlate || '');
      setVehicleTypeInput(d.vehicle?.type || 'Mini');
    } catch (err) {
      console.warn(err.message);
    }
  };

  const fetchActiveRide = async () => {
    try {
      const res = await api.get('/rides/active');
      if (res.data.data.ride) {
        setActiveRide(res.data.data.ride);
      }
    } catch (err) {
      console.warn(err.message);
    }
  };

  useEffect(() => {
    if (!socket || !driverProfile?._id) return;
    socket.emit('driver:join', driverProfile._id);

    socket.on('driver:ride:offer', (offerData) => {
      setIncomingOffer(offerData);
    });

    socket.on('ride:cancelled', () => {
      setActiveRide(null);
      setIncomingOffer(null);
      setPickupRouteCoordinates([]);
      setTripRouteCoordinates([]);
      stopDriveSimulation();
      setErrorMsg('Ride was cancelled.');
      setTimeout(() => setErrorMsg(''), 4000);
      fetchProfile();
    });

    return () => {
      socket.off('driver:ride:offer');
      socket.off('ride:cancelled');
    };
  }, [socket, driverProfile]);

  const handleToggleStatus = async () => {
    const nextStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    try {
      const res = await api.patch('/drivers/status', { status: nextStatus });
      setDriverProfile(res.data.data.driver);
      setIsOnline(nextStatus === 'ONLINE');

      if (socket) {
        socket.emit('driver:status:toggle', {
          driverId: driverProfile._id,
          status: nextStatus
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to change status');
    }
  };

  const handleAcceptRide = async (rideId) => {
    setIsActionLoading(true);
    try {
      const res = await api.post(`/drivers/rides/${rideId}/accept`);
      const acceptedRide = res.data.data.ride;
      setActiveRide(acceptedRide);
      setIncomingOffer(null);

      if (acceptedRide.pickup?.location?.coordinates) {
        const route = await fetchRoadRoute(currentCoords, acceptedRide.pickup.location.coordinates);
        if (route) {
          setPickupRouteCoordinates(route.polyline);
          setNavSummary({ distanceKm: route.distanceKm, durationMins: route.durationMins });
        }
      }

      if (socket) {
        socket.emit('ride:join', acceptedRide._id);
      }
      fetchProfile();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to accept');
      setIncomingOffer(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkArrived = async () => {
    if (!activeRide) return;
    setIsActionLoading(true);
    stopDriveSimulation();

    if (activeRide.pickup?.location?.coordinates) {
      setCurrentCoords(activeRide.pickup.location.coordinates);
    }

    try {
      const res = await api.post(`/drivers/rides/${activeRide._id}/arrived`);
      setActiveRide(res.data.data.ride);
      setPickupRouteCoordinates([]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Action failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStartRide = async (otp) => {
    if (!activeRide) return;
    setIsActionLoading(true);
    try {
      const res = await api.post(`/drivers/rides/${activeRide._id}/start`, {
        otp,
        driverCoords: currentCoords
      });
      const startedRide = res.data.data.ride;
      setActiveRide(startedRide);

      const route = await fetchRoadRoute(
        startedRide.pickup.location.coordinates,
        startedRide.destination.location.coordinates
      );

      const navPoly = route?.polyline || startedRide.routePolyline || [];
      setTripRouteCoordinates(navPoly);
      setPickupRouteCoordinates([]);
      if (route) {
        setNavSummary({ distanceKm: route.distanceKm, durationMins: route.durationMins });
      }

      startDriveSimulation(navPoly);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Incorrect PIN or distance error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCompleteRide = async (paymentMethod = 'CASH') => {
    if (!activeRide) return;
    setIsActionLoading(true);
    stopDriveSimulation();
    try {
      const res = await api.post(`/drivers/rides/${activeRide._id}/complete`, { paymentMethod });
      setCompletedRideData(res.data.data.ride);
      setShowRatingModal(true);
      setActiveRide(null);
      setPickupRouteCoordinates([]);
      setTripRouteCoordinates([]);
      fetchProfile();
      refreshUser();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Completion failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const startDriveSimulation = (waypoints, startStep = 0) => {
    if (!waypoints || waypoints.length === 0) return;
    setIsSimulatingDrive(true);
    currentWaypointsRef.current = waypoints;
    currentSimStepRef.current = startStep;

    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    const speedConfig = SIM_SPEEDS[simSpeedIdx];

    simIntervalRef.current = setInterval(() => {
      if (currentSimStepRef.current < waypoints.length) {
        const [lat, lng] = waypoints[currentSimStepRef.current];
        const nextHeading = (currentSimStepRef.current * 20) % 360;

        setCurrentCoords([lng, lat]);
        setHeading(nextHeading);

        if (socket && driverProfile?._id) {
          socket.emit('driver:location:update', {
            driverId: driverProfile._id,
            latitude: lat,
            longitude: lng,
            heading: nextHeading,
            speed: speedConfig.speedKmh,
            status: activeRide ? 'ON_TRIP' : 'ONLINE',
            activeRideId: activeRide?._id
          });
        }
        currentSimStepRef.current++;
      } else {
        stopDriveSimulation();
      }
    }, speedConfig.delayMs);
  };

  const changeSimSpeed = (newIdx) => {
    setSimSpeedIdx(newIdx);
    if (isSimulatingDrive && currentWaypointsRef.current.length > 0) {
      startDriveSimulation(currentWaypointsRef.current, currentSimStepRef.current);
    }
  };

  const stopDriveSimulation = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsSimulatingDrive(false);
  };

  const handleSaveProfileSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/drivers/profile', {
        upiId: upiInput,
        vehicle: {
          make: vehicleMakeInput,
          model: vehicleModelInput,
          rcNumber: rcInput,
          licensePlate: plateInput,
          type: vehicleTypeInput
        }
      });
      setDriverProfile(res.data.data.driver);
      setSettingsSuccess('Vehicle & UPI Details Updated!');
      setTimeout(() => {
        setSettingsSuccess('');
        setShowSettingsModal(false);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleRatingSubmit = async (score, review) => {
    if (!completedRideData) return;
    try {
      await api.post(`/rides/${completedRideData._id}/rate`, { score, review });
      setShowRatingModal(false);
      setCompletedRideData(null);
    } catch (err) {
      setShowRatingModal(false);
    }
  };

  const isHeadingToPickup = activeRide && ['ACCEPTED', 'ARRIVING'].includes(activeRide.status);
  const isTripInProgress = activeRide && activeRide.status === 'IN_PROGRESS';

  return (
    <div className="relative w-full min-h-[calc(100vh-3.5rem)] bg-slate-950 flex flex-col justify-between">
      {errorMsg && (
        <div className="absolute top-4 left-4 right-4 z-40 p-3 rounded-2xl bg-rose-500/90 backdrop-blur-md text-white text-xs font-bold text-center shadow-xl">
          {errorMsg}
        </div>
      )}

      {/* Main Responsive Grid */}
      <div className="relative w-full flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0">
        {/* Left / Bottom Controls */}
        <div className="w-full lg:col-span-5 z-30 p-3 sm:p-5 lg:p-6 flex flex-col gap-3 overflow-y-auto max-h-[85vh] lg:max-h-[calc(100vh-4rem)] order-2 lg:order-1">
          <div className="w-full max-w-lg mx-auto space-y-3">
            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-3xl shadow-lg">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Earnings</span>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">
                  ₹{driverProfile?.todayEarnings?.toFixed(0) || '0'}
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-3xl shadow-lg">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Trips</span>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {driverProfile?.totalTrips || 0}
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-3xl shadow-lg">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Rating</span>
                <p className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
                  ★ {driverProfile?.rating || '4.9'}
                </p>
              </div>
            </div>

            {/* Online Status Toggle */}
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50' : 'bg-rose-500'}`}></span>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">
                    {isOnline ? 'Online (Accepting Rides)' : 'Offline (Not Working)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {driverProfile?.vehicle?.type} • {driverProfile?.vehicle?.make} {driverProfile?.vehicle?.model}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Vehicle & UPI Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleStatus}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition shadow-md ${
                    isOnline
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/25'
                  }`}
                >
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>

            {/* Navigation Banner */}
            {activeRide && (isHeadingToPickup || isTripInProgress) && (
              <div className="bg-blue-600 text-white rounded-3xl p-4 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Navigation className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 block">
                      {isHeadingToPickup ? 'Road Route to Pickup' : 'Road Route to Destination'}
                    </span>
                    <p className="font-bold text-xs truncate max-w-[180px]">
                      {isHeadingToPickup ? activeRide.pickup?.address : activeRide.destination?.address}
                    </p>
                  </div>
                </div>

                {navSummary.distanceKm > 0 && (
                  <div className="text-right">
                    <span className="text-sm font-black block">{navSummary.distanceKm} km</span>
                    <span className="text-[10px] text-blue-100 font-semibold">~{navSummary.durationMins} mins</span>
                  </div>
                )}
              </div>
            )}

            {activeRide ? (
              <div className="space-y-3">
                <ActiveRideCard
                  ride={activeRide}
                  role="driver"
                  driverDistanceToPickupMeters={distanceToPickupMeters}
                  onMarkArrived={handleMarkArrived}
                  onStartRide={handleStartRide}
                  onCompleteRide={handleCompleteRide}
                  isActionLoading={isActionLoading}
                />

                {/* Driving Simulator & Speed Controller */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold">Driving Simulator</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                      {SIM_SPEEDS[simSpeedIdx].speedKmh} km/h ({SIM_SPEEDS[simSpeedIdx].label})
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 bg-slate-800 p-1 rounded-2xl border border-slate-700">
                    {SIM_SPEEDS.map((sp, idx) => (
                      <button
                        key={sp.label}
                        type="button"
                        onClick={() => changeSimSpeed(idx)}
                        className={`py-1.5 text-xs font-bold rounded-xl transition ${
                          simSpeedIdx === idx
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      {isHeadingToPickup ? 'Driving towards Pickup' : 'Driving towards Dropoff'}
                    </span>
                    <button
                      onClick={() => {
                        if (isSimulatingDrive) {
                          stopDriveSimulation();
                        } else {
                          const poly = isHeadingToPickup ? pickupRouteCoordinates : tripRouteCoordinates;
                          startDriveSimulation(poly, 0);
                        }
                      }}
                      className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-md active:scale-95"
                    >
                      {isSimulatingDrive ? <Pause className="w-3.5 h-3.5 text-slate-950" /> : <Play className="w-3.5 h-3.5 text-slate-950" />}
                      <span>{isSimulatingDrive ? 'Pause' : 'Start Simulation'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-2 shadow-xl">
                <p className="text-xs text-slate-400">
                  {isOnline
                    ? '🟢 You are ONLINE. Waiting for incoming ride offers nearby...'
                    : '🔴 You are OFFLINE. Tap "Go Online" above when you are ready to work.'}
                </p>
                {driverProfile?.upiId && (
                  <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30 mt-1">
                    UPI ID: {driverProfile.upiId}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right / Top Map */}
        <div className="w-full h-[320px] sm:h-[400px] lg:h-full lg:col-span-7 z-10 order-1 lg:order-2 p-2 sm:p-4 lg:p-6">
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <MapView
              center={[17.4504, 78.3772]}
              driverLocation={{
                coordinates: currentCoords,
                heading: heading,
                name: 'You (Driver)',
                vehicleModel: `${driverProfile?.vehicle?.make || ''} ${driverProfile?.vehicle?.model || ''}`,
                vehicleType: driverProfile?.vehicle?.type || 'Mini'
              }}
              pickup={activeRide?.pickup ? {
                address: activeRide.pickup.address,
                coordinates: activeRide.pickup.location.coordinates
              } : null}
              destination={activeRide?.destination ? {
                address: activeRide.destination.address,
                coordinates: activeRide.destination.location.coordinates
              } : null}
              pickupRouteCoordinates={pickupRouteCoordinates}
              routeCoordinates={tripRouteCoordinates}
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* Driver Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Vehicle & UPI Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            {settingsSuccess && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold text-center flex items-center justify-center gap-1">
                <Check className="w-4 h-4" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileSettings} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vehicle Category (6 Types)</label>
                <select
                  value={vehicleTypeInput}
                  onChange={(e) => setVehicleTypeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold outline-none"
                >
                  <option value="Moto">Moto (Bike / Scooter - 1 Seat)</option>
                  <option value="Auto">Auto Rickshaw (3 Seats)</option>
                  <option value="Mini">Mini (Hatchback - 4 Seats)</option>
                  <option value="Sedan">Sedan (Comfort - 4 Seats)</option>
                  <option value="SUV">SUV (Spacious - 6 Seats)</option>
                  <option value="Electric">Electric (Green EV Cab - 4 Seats)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">UPI ID for QR Payments</label>
                <input
                  type="text"
                  placeholder="driver@okhdfcbank"
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    value={vehicleMakeInput}
                    onChange={(e) => setVehicleMakeInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Model</label>
                  <input
                    type="text"
                    value={vehicleModelInput}
                    onChange={(e) => setVehicleModelInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Unique RC Number</label>
                  <input
                    type="text"
                    value={rcInput}
                    onChange={(e) => setRcInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono uppercase font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">License Plate</label>
                  <input
                    type="text"
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono uppercase font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {incomingOffer && (
        <DriverRequestModal
          offer={incomingOffer}
          onAccept={handleAcceptRide}
          onDecline={() => setIncomingOffer(null)}
        />
      )}

      {showRatingModal && (
        <RatingModal
          ride={completedRideData}
          role="driver"
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};
