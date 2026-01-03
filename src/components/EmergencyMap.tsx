import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, AlertTriangle, ShieldCheck, Navigation, ExternalLink, Navigation2 } from 'lucide-react';
import { BloodRequest } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface EmergencyMapProps {
  language: 'en' | 'bn';
}

// Add type declarations for leaflet-polylinedecorator
declare module 'leaflet' {
  namespace Symbol {
    function arrowHead(options?: any): any;
  }
  function polylineDecorator(polyline: any, options?: any): any;
}



const EmergencyMap: React.FC<EmergencyMapProps> = ({ language }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);
  const userMarker = useRef<L.Marker | null>(null);

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [routeData, setRouteData] = useState<{distance: number, duration: number} | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

const getTimeAgo = (timestamp: string) => {
  const now = currentTime; // Use state instead of Date.now()
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  
  if (diff < 30) return 'Just now';
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(timestamp).toLocaleDateString();
};
  // Fetch requests from database
  const fetchRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/requests?status=OPEN`);
      if (response.ok) {
        const data = await response.json();
        console.log('📍 Fetched requests:', data);
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Add user marker to map
          if (leafletMap.current && !userMarker.current) {
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `<div style="width: 24px; height: 24px; background: #3b82f6; border: 4px solid white; border-radius: 50%; box-shadow: 0 0 15px rgba(59, 130, 246, 0.6); animation: pulse 2s infinite;"></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            
            userMarker.current = L.marker([location.lat, location.lng], { icon: userIcon })
              .addTo(leafletMap.current)
              .bindPopup('<div class="p-2 font-bold">📍 Your Location</div>');

            // Fly to user location
            leafletMap.current.flyTo([location.lat, location.lng], 12, { duration: 2 });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert(language === 'en' 
            ? 'Please enable location access in your browser settings' 
            : 'ব্রাউজার সেটিংসে অবস্থান অ্যাক্সেস সক্ষম করুন');
        }
      );
    } else {
      alert(language === 'en' 
        ? 'Geolocation is not supported by your browser' 
        : 'আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না');
    }
  };

  useEffect(() => {
    fetchRequests();
    getUserLocation();
    
    // Refresh requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Initialize map
    leafletMap.current = L.map(mapRef.current, {
      center: [23.8103, 90.4125],
      zoom: 7,
      zoomControl: false
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(leafletMap.current);

    // Use OpenStreetMap tiles (completely free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(leafletMap.current);

    markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    routeLayer.current = L.layerGroup().addTo(leafletMap.current);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (leafletMap.current && requests.length > 0) {
      renderMarkers();
    }
  }, [requests]);

  // Update time every minute for relative timestamps
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(Date.now());
  }, 60000); // Update every 60 seconds
  
  return () => clearInterval(timer);
}, []);

  const renderMarkers = () => {
    if (!markersLayer.current) return;
    markersLayer.current.clearLayers();

    requests.forEach(req => {
      const isEmergency = req.urgency === 'EMERGENCY';
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 40px; 
            height: 40px; 
            background: ${isEmergency ? '#dc2626' : '#2563eb'}; 
            border: 4px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 900; 
            color: white; 
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
            ${isEmergency ? 'animation: pulse-marker 2s infinite;' : ''}
          " 
          onmouseover="this.style.transform='scale(1.2)'" 
          onmouseout="this.style.transform='scale(1)'">
            ${req.bloodGroup}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([req.location.lat, req.location.lng], { icon: customIcon })
        .bindPopup(`
          <div class="p-3" style="min-width: 200px;">
            <h4 class="font-black text-gray-900 mb-2">${req.hospitalName}</h4>
            <p class="text-sm font-bold text-red-600 mb-2">${req.bloodGroup} • ${req.unitsNeeded} Units Needed</p>
            <p class="text-xs text-gray-600 mb-2">${req.location.address}</p>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-black ${
              isEmergency ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }">
              ${req.urgency}
            </span>
          </div>
        `)
        .on('click', () => {
          setSelectedRequest(req);
          focusOnRequest(req.location.lat, req.location.lng);
        });
      
      markersLayer.current!.addLayer(marker);
    });
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get route from OSRM (Open Source Routing Machine) - FREE!
  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          coordinates: route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]), // Swap lng,lat to lat,lng
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60 // Convert to minutes
        };
      }
      return null;
    } catch (error) {
      console.error('OSRM routing error:', error);
      return null;
    }
  };

  const showDirections = async (request: BloodRequest) => {
    if (!userLocation) {
      alert(language === 'en' 
        ? 'Please enable location access to see directions' 
        : 'দিকনির্দেশ দেখতে অবস্থান অ্যাক্সেস সক্ষম করুন');
      getUserLocation();
      return;
    }

    if (!leafletMap.current || !routeLayer.current) return;

    setSelectedRequest(request);

    // Clear previous route
    routeLayer.current.clearLayers();

    try {
      // Get actual route from OSRM
      const routeInfo = await getRoute(
        [userLocation.lat, userLocation.lng],
        [request.location.lat, request.location.lng]
      );

      if (routeInfo) {
        setRouteData({
          distance: routeInfo.distance,
          duration: routeInfo.duration
        });

        // Draw the route on map
        const polyline = L.polyline(routeInfo.coordinates, {
          color: '#dc2626',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round'
        }).addTo(routeLayer.current);

        // Add arrow decorators to show direction
        const decorator = L.polylineDecorator(polyline, {
          patterns: [
            {
              offset: 25,
              repeat: 100,
              symbol: L.Symbol.arrowHead({
                pixelSize: 12,
                pathOptions: { 
                  fillOpacity: 1, 
                  weight: 0,
                  color: '#dc2626'
                }
              })
            }
          ]
        });
        routeLayer.current.addLayer(decorator);

        // Fit map to show entire route with padding
        leafletMap.current.fitBounds(polyline.getBounds(), { 
          padding: [80, 80],
          maxZoom: 14
        });

        // Show distance popup at midpoint
        const midIndex = Math.floor(routeInfo.coordinates.length / 2);
        const midpoint = routeInfo.coordinates[midIndex];
        
        L.popup()
          .setLatLng(midpoint)
          .setContent(`
            <div class="text-center p-2">
              <div class="font-black text-lg text-red-600">${routeInfo.distance.toFixed(1)} km</div>
              <div class="text-xs text-gray-600">≈ ${Math.round(routeInfo.duration)} min drive</div>
            </div>
          `)
          .openOn(leafletMap.current);

      } else {
        // Fallback to straight line if routing fails
        const distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          request.location.lat, 
          request.location.lng
        );
        
        setRouteData({
          distance: distance,
          duration: distance * 2 // Rough estimate
        });

        // Draw straight line as fallback
        const latlngs: [number, number][] = [
          [userLocation.lat, userLocation.lng],
          [request.location.lat, request.location.lng]
        ];

        const polyline = L.polyline(latlngs, {
          color: '#dc2626',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10'
        }).addTo(routeLayer.current);

        leafletMap.current.fitBounds(polyline.getBounds(), { padding: [80, 80] });

        alert(language === 'en' 
          ? 'Showing straight-line distance. Actual route may vary.' 
          : 'সরাসরি দূরত্ব দেখানো হচ্ছে। প্রকৃত রুট ভিন্ন হতে পারে।');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      
      // Final fallback
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        request.location.lat, 
        request.location.lng
      );
      setRouteData({
        distance: distance,
        duration: distance * 2
      });
    }
  };

  const openGoogleMaps = (request: BloodRequest) => {
    if (!userLocation) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${request.location.lat},${request.location.lng}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${request.location.lat},${request.location.lng}&travelmode=driving`,
        '_blank'
      );
    }
  };

  const handleAccept = async (request: BloodRequest) => {
    await showDirections(request);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch(`${API_URL}/requests/${request.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        alert(language === 'en' 
          ? 'Request accepted! Please contact the hospital.' 
          : 'অনুরোধ গৃহীত! অনুগ্রহ করে হাসপাতালে যোগাযোগ করুন।');
        fetchRequests();
      }
    } catch (error) {
      console.error('Accept request error:', error);
    }
  };

  const focusOnRequest = (lat: number, lng: number) => {
    if (leafletMap.current) {
      leafletMap.current.flyTo([lat, lng], 14, { duration: 1.5 });
    }
  };

  const resetMap = () => {
    if (leafletMap.current && routeLayer.current) {
      leafletMap.current.flyTo([23.8103, 90.4125], 7, { duration: 1.5 });
      routeLayer.current.clearLayers();
      setSelectedRequest(null);
      setRouteData(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-10rem)]">
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-red-100/30 border border-gray-100 relative">
        <div ref={mapRef} className="absolute inset-0 z-0"></div>
        
        {/* Map Controls */}
        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                {language === 'en' ? 'Emergency' : 'জরুরী'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                {language === 'en' ? 'Normal' : 'সাধারণ'}
              </span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                  {language === 'en' ? 'You' : 'আপনি'}
                </span>
              </div>
            )}
          </div>

          {/* Route Info */}
          {routeData && selectedRequest && (
  <button 
    onClick={() => focusOnRequest(selectedRequest.location.lat, selectedRequest.location.lng)}
    className="bg-green-500 text-white p-4 rounded-2xl shadow-xl border border-green-600 animate-fade-in hover:bg-green-600 transition-all active:scale-95 cursor-pointer w-full text-left"
  >
              <div className="flex items-center gap-3">
                <Navigation2 className="animate-pulse" size={20} />
                <div>
                  <p className="text-xs font-black uppercase tracking-wide">
                    {language === 'en' ? 'Route Active' : 'রুট সক্রিয়'}
                  </p>
                  <p className="text-lg font-black">
                    {routeData.distance.toFixed(1)} km • {Math.round(routeData.duration)} min
                  </p>
                  <p className="text-[10px] opacity-90 mt-1">
                    {language === 'en' ? 'To ' : 'থেকে '}{selectedRequest.hospitalName}
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>

        <button 
          onClick={resetMap}
          className="absolute top-6 right-6 z-[1000] bg-white p-3 rounded-2xl shadow-xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
          title={language === 'en' ? 'Reset Map' : 'ম্যাপ রিসেট করুন'}
        >
          <Navigation size={20} className="text-gray-600" />
        </button>

        {!userLocation && (
          <button 
            onClick={getUserLocation}
            className="absolute bottom-6 right-6 z-[1000] bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
          >
            <Navigation2 size={18} />
            {language === 'en' ? 'Enable Location' : 'অবস্থান সক্ষম করুন'}
          </button>
        )}
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        <div className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-2 mb-2">
          <h3 className="font-black text-gray-900 text-xl tracking-tight">
            {language === 'en' ? 'Live Requests' : 'লাইভ রিকোয়েস্ট'}
          </h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {loading ? (
              <span className="animate-pulse">{language === 'en' ? 'Loading...' : 'লোড হচ্ছে...'}</span>
            ) : (
              `${requests.length} ${language === 'en' ? 'Requests Found' : 'অনুরোধ পাওয়া গেছে'}`
            )}
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-gray-400" size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">
              {language === 'en' ? 'No active requests at the moment' : 'এই মুহূর্তে কোনো সক্রিয় অনুরোধ নেই'}
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const distance = userLocation 
              ? calculateDistance(userLocation.lat, userLocation.lng, req.location.lat, req.location.lng)
              : null;

            return (
              <div 
                key={req.id} 
                onClick={() => focusOnRequest(req.location.lat, req.location.lng)}
                className={`bg-white p-6 rounded-[2rem] border-2 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group ${
                  selectedRequest?.id === req.id ? 'border-red-500 bg-red-50' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                    req.urgency === 'EMERGENCY' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {req.urgency === 'EMERGENCY' ? (language === 'en' ? 'EMERGENCY' : 'জরুরী') : (language === 'en' ? 'NORMAL' : 'সাধারণ')}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                   <Clock size={12} /> {req.createdAt ? getTimeAgo(req.createdAt) : 'Just now'}
                  
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 ${
                    req.urgency === 'EMERGENCY' ? 'bg-red-600 text-white border-red-700' : 'bg-blue-600 text-white border-blue-700'
                  } shadow-lg transition-transform group-hover:scale-110`}>
                    <span className="text-xl font-black leading-none">{req.bloodGroup}</span>
                    <span className="text-[8px] font-black uppercase mt-1">{req.unitsNeeded}U</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900 leading-tight group-hover:text-red-600 transition-colors">{req.hospitalName}</h4>
                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-red-500" /> {req.location.address}
                    </p>
                    {distance !==null && (
                      <p className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-1">
                        <Navigation2 size={12} /> {distance.toFixed(1)} km away • ~{Math.round(distance * 2)} min
                      </p>
                    )}
                  </div>
                </div>

                {req.isThalassemiaPatient && (
                  <div className="bg-purple-50 p-3 rounded-xl flex items-center gap-2 mb-5 text-purple-700 text-xs font-black border border-purple-100">
                    <ShieldCheck size={16} /> {language === 'en' ? 'THALASSEMIA SUPPORT' : 'থ্যালাসেমিয়া সহায়তা'}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleAccept(req); 
                    }}
                    className="flex items-center justify-center gap-1 bg-gray-900 text-white py-3 rounded-xl text-xs font-black hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
                  >
                    {language === 'en' ? 'Accept' : 'গ্রহণ'}
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      window.location.href=`tel:${req.contactPhone}`; 
                    }}
                    className="flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-900 py-3 rounded-xl text-xs font-black hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest"
                  >
                    <Phone size={14} /> {language === 'en' ? 'Call' : 'কল'}
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      openGoogleMaps(req); 
                    }}
                    className="flex items-center justify-center gap-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-black hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className="bg-red-50 p-5 rounded-[2rem] border border-red-100 flex items-start gap-4">
          <div className="p-2 bg-red-600 rounded-lg text-white">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-red-900 uppercase mb-1">{language === 'en' ? 'Donor Safety Notice' : 'রক্তদাতা সুরক্ষা নোটিশ'}</p>
            <p className="text-[10px] text-red-800 leading-relaxed font-bold">
              {language === 'en' 
                ? 'Accepting a request notifies the hospital. Ensure you haven\'t donated in the last 120 days.' 
                : 'অনুরোধ গ্রহণ করলে হাসপাতাল জানতে পারবে। নিশ্চিত করুন যে আপনি গত ১২০ দিনে রক্ত দেননি।'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMap;