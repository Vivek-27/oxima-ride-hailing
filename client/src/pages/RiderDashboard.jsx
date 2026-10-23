import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { MapView } from '../components/MapView';
import { RideBookingCard } from '../components/RideBookingCard';
import { ActiveRideCard } from '../components/ActiveRideCard';
import { RatingModal } from '../components/RatingModal';
import { reverseGeocodeIndia } from '../services/locationService';
import { fetchRoadRoute } from '../services/routingService';

export const RiderDashboard = () => {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();

  // Dynamic Pickup starting with Live GPS or Indian Hub
  const [pickup, setPickup] = useState({
    address: 'Fetching live location...',
    coordinates: [78.9629, 20.5937] // All-India Center
  });

  // Default Destination starts empty / None
  const [destination, setDestination] = useState(null);

  const [activeRide, setActiveRide] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [driverLiveLocation, setDriverLiveLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [pickupRouteCoordinates, setPickupRouteCoordinates] = useState([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completedRideData, setCompletedRideData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-detect real-time GPS location on initial load anywhere across India
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const info = await reverseGeocodeIndia(lat, lon);
          setPickup({
            address: info?.name || 'My Current Location',
            coordinates: [lon, lat]
          });
        },
        () => {
          // Fallback if permission denied
          setPickup({
            address: 'Connaught Place, New Delhi',
            coordinates: [77.2167, 28.6315]
          });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Compute real OSRM road path whenever both pickup and destination are selected
  useEffect(() => {
    if (pickup?.coordinates && destination?.coordinates && !activeRide) {
      const getRoute = async () => {
        const route = await fetchRoadRoute(pickup.coordinates, destination.coordinates);
        if (route?.polyline) {
          setRouteCoordinates(route.polyline);
        }
      };
      getRoute();
    } else if (!destination?.coordinates && !activeRide) {
      setRouteCoordinates([]);
    }
  }, [pickup?.coordinates, destination?.coordinates, activeRide]);

  useEffect(() => {
    fetchActiveRide();
    fetchNearbyDrivers();
    const interval = setInterval(fetchNearbyDrivers, 8000);
    return () => clearInterval(interval);
  }, [pickup]);

  const fetchActiveRide = async () => {
    try {
      const res = await api.get('/rides/active');
      if (res.data.data.ride) {
        const ride = res.data.data.ride;
        setActiveRide(ride);
        setPickup({
          address: ride.pickup.address,
          coordinates: ride.pickup.location.coordinates
        });
        setDestination({
          address: ride.destination.address,
          coordinates: ride.destination.location.coordinates
        });

        const route = await fetchRoadRoute(ride.pickup.location.coordinates, ride.destination.location.coordinates);
        if (route?.polyline) {
          setRouteCoordinates(route.polyline);
        }

        if (ride.driver?.currentLocation?.coordinates) {
          setDriverLiveLocation({
            coordinates: ride.driver.currentLocation.coordinates,
            heading: ride.driver.currentHeading || 0,
            name: ride.driver.user?.name,
            vehicleModel: `${ride.driver.vehicle?.make} ${ride.driver.vehicle?.model}`,
            vehicleType: ride.vehicleType
          });

          if (['ACCEPTED', 'ARRIVING'].includes(ride.status)) {
            const pRoute = await fetchRoadRoute(ride.driver.currentLocation.coordinates, ride.pickup.location.coordinates);
            if (pRoute?.polyline) {
              setPickupRouteCoordinates(pRoute.polyline);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNearbyDrivers = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.data.drivers) {
        setNearbyDrivers(statsRes.data.data.drivers.filter((d) => d.status === 'ONLINE'));
      }
    } catch (err) {
      console.warn(err.message);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('ride:accepted', async ({ ride, driver }) => {
      setActiveRide(ride);
      if (driver?.currentLocation?.coordinates) {
        setDriverLiveLocation({
          coordinates: driver.currentLocation.coordinates,
          heading: driver.currentHeading || 0,
          name: driver.user?.name,
          vehicleModel: `${driver.vehicle?.make} ${driver.vehicle?.model}`,
          vehicleType: ride.vehicleType
        });

        const pRoute = await fetchRoadRoute(driver.currentLocation.coordinates, ride.pickup.location.coordinates);
        if (pRoute?.polyline) {
          setPickupRouteCoordinates(pRoute.polyline);
        }
      }
    });

    socket.on('ride:arrived', () => {
      setActiveRide((prev) => (prev ? { ...prev, status: 'ARRIVED' } : null));
      setPickupRouteCoordinates([]);
    });

    socket.on('ride:started', () => {
      setActiveRide((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : null));
      setPickupRouteCoordinates([]);
    });

    socket.on('ride:driver:location', (data) => {
      setDriverLiveLocation((prev) => ({
        ...prev,
        coordinates: [data.longitude, data.latitude],
        heading: data.heading || 0
      }));
    });

    socket.on('ride:completed', ({ ride }) => {
      setCompletedRideData(ride);
      setShowRatingModal(true);
      setActiveRide(null);
      setDriverLiveLocation(null);
      setRouteCoordinates([]);
      setPickupRouteCoordinates([]);
      refreshUser();
    });

    socket.on('ride:cancelled', () => {
      setActiveRide(null);
      setDriverLiveLocation(null);
      setRouteCoordinates([]);
      setPickupRouteCoordinates([]);
      setErrorMsg('Ride was cancelled.');
      setTimeout(() => setErrorMsg(''), 4000);
    });

    return () => {
      socket.off('ride:accepted');
      socket.off('ride:arrived');
      socket.off('ride:started');
      socket.off('ride:driver:location');
      socket.off('ride:completed');
      socket.off('ride:cancelled');
    };
  }, [socket]);

  const handleRequestRide = async (vehicleType) => {
    if (!destination?.coordinates) {
      setErrorMsg('Please select a destination first.');
      return;
    }

    setErrorMsg('');
    setIsRequesting(true);

    try {
      const roadRoute = await fetchRoadRoute(pickup.coordinates, destination.coordinates);
      const poly = roadRoute?.polyline || [];
      setRouteCoordinates(poly);

      const res = await api.post('/rides/request', {
        pickup: {
          address: pickup.address,
          location: { type: 'Point', coordinates: pickup.coordinates }
        },
        destination: {
          address: destination.address,
          location: { type: 'Point', coordinates: destination.coordinates }
        },
        vehicleType,
        routePolyline: poly,
        paymentMethod: 'CASH'
      });

      const newRide = res.data.data.ride;
      setActiveRide(newRide);
      if (socket) {
        socket.emit('ride:join', newRide._id);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to request ride');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRide = async (reason = 'Cancelled by passenger') => {
    if (!activeRide) return;
    try {
      await api.patch(`/rides/${activeRide._id}/cancel`, { reason });
      setActiveRide(null);
      setDriverLiveLocation(null);
      setRouteCoordinates([]);
      setPickupRouteCoordinates([]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleDismissRide = async () => {
    if (!activeRide) return;
    try {
      await api.post(`/rides/${activeRide._id}/dismiss`);
      setActiveRide(null);
      setDriverLiveLocation(null);
      setRouteCoordinates([]);
      setPickupRouteCoordinates([]);
      setDestination(null);
      refreshUser();
    } catch (err) {
      setActiveRide(null);
      setDriverLiveLocation(null);
      setRouteCoordinates([]);
      setPickupRouteCoordinates([]);
      setDestination(null);
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

  return (
    <div className="relative w-full min-h-[calc(100vh-3.5rem)] bg-slate-950 flex flex-col justify-between">
      {errorMsg && (
        <div className="absolute top-4 left-4 right-4 z-40 p-3 rounded-2xl bg-rose-500/90 backdrop-blur-md text-white text-xs font-bold text-center shadow-xl">
          {errorMsg}
        </div>
      )}

      {/* Main Responsive Layout */}
      <div className="relative w-full flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0">
        {/* Left / Bottom Floating Booking & Ride Panel */}
        <div className="w-full lg:col-span-5 z-30 p-3 sm:p-5 lg:p-6 flex flex-col justify-end lg:justify-start overflow-y-auto max-h-[85vh] lg:max-h-[calc(100vh-4rem)] order-2 lg:order-1">
          <div className="w-full max-w-lg mx-auto">
            {activeRide ? (
              <ActiveRideCard
                ride={activeRide}
                role="rider"
                onCancelRide={handleCancelRide}
                onDismissRide={handleDismissRide}
              />
            ) : (
              <RideBookingCard
                userName={user?.name?.split(' ')[0] || 'Rider'}
                pickup={pickup}
                destination={destination}
                setPickup={setPickup}
                setDestination={setDestination}
                onRequestRide={handleRequestRide}
                isRequesting={isRequesting}
              />
            )}
          </div>
        </div>

        {/* Right / Background Map */}
        <div className="w-full h-[320px] sm:h-[400px] lg:h-full lg:col-span-7 z-10 order-1 lg:order-2 p-2 sm:p-4 lg:p-6">
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <MapView
              center={pickup.coordinates ? [pickup.coordinates[1], pickup.coordinates[0]] : [20.5937, 78.9629]}
              pickup={pickup}
              destination={destination}
              driverLocation={driverLiveLocation}
              nearbyDrivers={activeRide ? [] : nearbyDrivers}
              pickupRouteCoordinates={pickupRouteCoordinates}
              routeCoordinates={routeCoordinates}
              isSearching={activeRide?.status === 'SEARCHING'}
              height="100%"
            />
          </div>
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          ride={completedRideData}
          role="rider"
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};
