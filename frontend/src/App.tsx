import React, { useState, useEffect, useRef } from 'react';
import { MapView } from './components/Map/MapView';
import { MapControls } from './components/Map/MapControls';
import { FloatingSearchBar } from './components/Search/FloatingSearchBar';
import { PlaceDetailsCard } from './components/Directions/PlaceDetailsCard';
import { DirectionsPanel } from './components/Directions/DirectionsPanel';
import { RouteResultsSheet } from './components/Directions/RouteResultsSheet';
import { NavigationHUD } from './components/Navigation/NavigationHUD';
import { ObstacleAlertModal } from './components/Navigation/ObstacleAlertModal';
import { ReportModal } from './components/Crowdsourcing/ReportModal';
import { VerificationDrawer } from './components/Crowdsourcing/VerificationDrawer';
import { ScreenReaderTable } from './components/Accessibility/ScreenReaderTable';
import { 
  Place, RouteResult, CommunityReport, EventZone, 
  MapLayerConfig, MobilityProfileCode, ReportCategory, SearchResult 
} from './types';
import { 
  fetchPlaces, fetchReports, submitReportApi, 
  voteReportApi, fetchEvents, calculateRoutesApi, calculateRerouteApi,
  lookupAccessibilityApi 
} from './services/api';
import { calculateDistanceKm } from './utils/geo';
import { speechService } from './services/speech';

// City Presets
const CITY_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'New Delhi': { center: [28.6289, 77.2185], zoom: 15 },
  'San Francisco': { center: [37.7885, -122.4072], zoom: 14 },
  'London': { center: [51.5250, -0.1250], zoom: 14 },
};

export const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [mapCenter, setMapCenter] = useState<[number, number]>(CITY_CENTERS['New Delhi'].center);
  const [mapZoom, setMapZoom] = useState(CITY_CENTERS['New Delhi'].zoom);
  const [userLocation, setUserLocation] = useState<[number, number]>([28.6340, 77.2160]);
  const [searchBias, setSearchBias] = useState<[number, number] | undefined>(undefined);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);

  // Data states
  const [places, setPlaces] = useState<Place[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [events, setEvents] = useState<EventZone[]>([]);
  
  // Selection states
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
  const [mobilityProfile, setMobilityProfile] = useState<MobilityProfileCode>('wheelchair');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  
  // UI Panels & Modals
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
  const [isCalculatingRoutes, setIsCalculatingRoutes] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showScreenReaderTable, setShowScreenReaderTable] = useState(false);
  const [showObstacleAlert, setShowObstacleAlert] = useState(false);

  // Live Navigation State
  const [isNavigating, setIsNavigating] = useState(false);
  const [navPosition, setNavPosition] = useState<[number, number] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const navIntervalRef = useRef<any>(null);

  // Map Layers & Accessibility
  const [layers, setLayers] = useState<MapLayerConfig>({
    showHazards: true,
    showRamps: true,
    showEvents: true,
    showTactile: true,
    highContrast: false,
    satelliteView: false,
  });

  // Browser Geolocation on initial load & live watch
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
          setMapZoom(15);
          setSearchBias(coords);
        },
        (err) => {
          console.log('Location permission not granted or unavailable, continuing with default city bias:', err.message);
        },
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 0 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
        },
        (err) => {
          console.debug('Geolocation watch error:', err);
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadData(selectedCity);
  }, [selectedCity]);

  const loadData = async (city: string) => {
    const p = await fetchPlaces(undefined, city);
    const r = await fetchReports();
    const e = await fetchEvents();
    setPlaces(p);
    setReports(r);
    setEvents(e);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const cfg = CITY_CENTERS[city] || CITY_CENTERS['New Delhi'];
    setMapCenter(cfg.center);
    setMapZoom(cfg.zoom);
    setSearchBias(cfg.center);
    setShowSearchThisArea(false);
    setUserLocation([cfg.center[0] + 0.003, cfg.center[1] - 0.003]);
    setRoutes([]);
    setSelectedPlace(null);
    setSelectedReport(null);
    setShowDirectionsPanel(false);
  };

  // Trigger route computation
  const handleCalculateRoutes = async (
    originStr: string,
    targetPlace: Place,
    profile: MobilityProfileCode,
    options?: { avoidStairs: boolean; maxSlope: number }
  ) => {
    setIsCalculatingRoutes(true);
    try {
      const resp = await calculateRoutesApi(
        userLocation,
        [targetPlace.latitude, targetPlace.longitude],
        profile,
        originStr || 'Your Location',
        targetPlace.name
      );
      setRoutes(resp.routes);
      setSelectedRouteId(resp.routes[0]?.id || null);
      setShowDirectionsPanel(false);
    } catch (err) {
      console.error('Routing calculation failed', err);
    } finally {
      setIsCalculatingRoutes(false);
    }
  };

  // Select Place (From Local Dataset)
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setSelectedReport(null);
    setRoutes([]);
    setShowDirectionsPanel(false);
    setMapCenter([place.latitude, place.longitude]);
    setShowSearchThisArea(false);
  };

  // Select Location from Geoapify Search Autocomplete
  const handleSelectSearchResult = async (result: SearchResult) => {
    setSelectedReport(null);
    setRoutes([]);
    setShowDirectionsPanel(false);
    setShowSearchThisArea(false);

    // Smoothly pan Leaflet map to selected destination coordinates
    const destCoords: [number, number] = [result.latitude, result.longitude];
    setMapCenter(destCoords);
    setMapZoom(16);

    // Query AccessRoute verified database for accessibility attributes
    const accessData = await lookupAccessibilityApi(
      result.latitude,
      result.longitude,
      result.name
    );

    const newPlace: Place = {
      id: result.id || `search-${result.latitude}-${result.longitude}`,
      name: result.name,
      category: result.category || result.type || 'place',
      address: result.address || `${result.city || ''}, ${result.country || ''}`.trim() || result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      city: result.city || selectedCity,
      accessibility: accessData.has_data && accessData.accessibility
        ? accessData.accessibility
        : {
            has_accessible_entrance: false,
            has_ramp: false,
            has_elevator: false,
            has_tactile_paving: false,
            elevator_status: 'unknown',
            details: 'Accessibility information unavailable - Community verification needed',
          },
    };

    setSelectedPlace(newPlace);
  };

  const lastPannedCenterRef = useRef<[number, number]>(mapCenter);

  // Map Movement Handler (for "Search this area" trigger)
  const handleMapMoveEnd = (center: [number, number], _zoom: number) => {
    lastPannedCenterRef.current = center;
    const currentBias = searchBias || userLocation;
    if (currentBias) {
      const distKm = calculateDistanceKm(currentBias[0], currentBias[1], center[0], center[1]);
      if (distKm > 2.5) {
        setShowSearchThisArea(true);
      }
    }
  };

  const handleSearchThisArea = () => {
    const newBias = lastPannedCenterRef.current || mapCenter;
    setSearchBias(newBias);
    setShowSearchThisArea(false);
  };

  // Start Navigation Mode
  const handleStartNavigation = () => {
    const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (!activeRoute) return;

    setIsNavigating(true);
    setCurrentStepIndex(0);
    setRemainingDistance(activeRoute.distance_meters);
    setRemainingSeconds(activeRoute.duration_seconds);
    setNavPosition(activeRoute.coordinates[0]);

    // Speech chime
    speechService.speak(
      `Starting ${mobilityProfile} navigation to ${selectedPlace?.name || 'destination'}. Step-free route with ${activeRoute.accessibility_breakdown.ramps_count} verified ramps.`
    );

    // Simulate progressive GPS movement along polyline
    let pointIndex = 0;
    const totalPoints = activeRoute.coordinates.length;
    if (navIntervalRef.current) clearInterval(navIntervalRef.current);

    navIntervalRef.current = setInterval(() => {
      pointIndex++;
      if (pointIndex < totalPoints) {
        setNavPosition(activeRoute.coordinates[pointIndex]);
        // Update remaining distance countdown
        const progress = pointIndex / totalPoints;
        setRemainingDistance(Math.round(activeRoute.distance_meters * (1 - progress)));
        setRemainingSeconds(Math.round(activeRoute.duration_seconds * (1 - progress)));

        // Advance step if halfway
        if (pointIndex > totalPoints * 0.4 && currentStepIndex === 0) {
          setCurrentStepIndex(1);
        }
      } else {
        clearInterval(navIntervalRef.current);
        speechService.speak('You have arrived safely at your destination.');
      }
    }, 2500);
  };

  const handleExitNavigation = () => {
    if (navIntervalRef.current) clearInterval(navIntervalRef.current);
    setIsNavigating(false);
    setNavPosition(null);
    speechService.stop();
  };

  // Obstacle Alert & Dynamic Detour
  const handleTriggerObstacleAlert = () => {
    setShowObstacleAlert(true);
    speechService.speak('Accessibility Alert: Obstacle reported ahead. Calculating step-free detour.');
  };

  const handleAcceptDetour = async () => {
    if (!selectedPlace) return;
    setShowObstacleAlert(false);
    try {
      const newRoute = await calculateRerouteApi(
        navPosition || userLocation,
        [selectedPlace.latitude, selectedPlace.longitude],
        mobilityProfile
      );
      setRoutes([newRoute]);
      setSelectedRouteId(newRoute.id);
      speechService.speak('Detour accepted. Proceeding along safe ramp corridor.');
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Community Report
  const handleSubmitReport = async (reportData: {
    category: ReportCategory;
    title: string;
    description: string;
    severity: 'low' | 'moderate' | 'severe' | 'critical';
    lat: number;
    lng: number;
  }) => {
    const created = await submitReportApi(reportData);
    setReports((prev) => [created, ...prev]);
    setShowReportModal(false);
    speechService.speak('Hazard reported. Thank you for contributing to accessible navigation.');
  };

  // Vote on Community Report
  const handleVoteReport = async (reportId: string, voteType: 'upvote' | 'downvote' | 'resolve') => {
    try {
      const updated = await voteReportApi(reportId, voteType);
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      setSelectedReport(updated);
    } catch {
      // Local optimistic update
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === reportId) {
            return {
              ...r,
              upvotes: voteType === 'upvote' ? r.upvotes + 1 : r.upvotes,
              status: voteType === 'resolve' ? 'RESOLVED' : r.status,
            };
          }
          return r;
        })
      );
    }
  };

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${
        layers.highContrast ? 'bg-black text-yellow-300' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* 1. Leaflet Interactive GIS Map (Clean White Matte Theme) */}
      <MapView
        center={mapCenter}
        zoom={mapZoom}
        places={places}
        selectedPlace={selectedPlace}
        onSelectPlace={handleSelectPlace}
        routes={routes}
        selectedRouteId={selectedRouteId}
        onSelectRoute={(id) => setSelectedRouteId(id)}
        reports={reports}
        selectedReport={selectedReport}
        onSelectReport={(r) => {
          setSelectedReport(r);
          setSelectedPlace(null);
        }}
        events={events}
        layers={layers}
        userLocation={userLocation}
        navigationActive={isNavigating}
        navPosition={navPosition}
        onMapClick={(lat, lng) => {
          console.log('Map clicked at', lat, lng);
        }}
        onMapMoveEnd={handleMapMoveEnd}
      />

      {/* 2. Top Floating Navigation & Search Bar (Google Maps Style) */}
      {!isNavigating && (
        <FloatingSearchBar
          places={places}
          onSelectPlace={handleSelectPlace}
          onSelectSearchResult={handleSelectSearchResult}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          onOpenReportModal={() => setShowReportModal(true)}
          onOpenDirections={() => {
            if (!selectedPlace && places.length > 0) {
              setSelectedPlace(places[0]);
            }
            setShowDirectionsPanel(true);
          }}
          highContrast={layers.highContrast}
          onToggleHighContrast={() =>
            setLayers((prev) => ({ ...prev, highContrast: !prev.highContrast }))
          }
          userLocation={userLocation}
          searchBias={searchBias}
          showSearchThisArea={showSearchThisArea}
          onSearchThisArea={handleSearchThisArea}
        />
      )}

      {/* 3. Floating Left/Bottom Panels (Place Details / Directions / Routes) */}
      {!isNavigating && (
        <div className="absolute bottom-6 left-4 right-4 md:left-6 md:w-[410px] md:bottom-6 z-30 pointer-events-auto flex flex-col gap-3">
          {/* Place Details Card */}
          {selectedPlace && !showDirectionsPanel && routes.length === 0 && (
            <PlaceDetailsCard
              place={selectedPlace}
              onGetDirections={() => {
                setShowDirectionsPanel(true);
              }}
              onClose={() => setSelectedPlace(null)}
              highContrast={layers.highContrast}
            />
          )}

          {/* Directions Panel with A -> B Inputs & 6 Mode Switcher */}
          {showDirectionsPanel && routes.length === 0 && (
            <DirectionsPanel
              originName="Your Location"
              destination={selectedPlace || (places[0] || null)}
              selectedProfile={mobilityProfile}
              onSelectProfile={(p) => setMobilityProfile(p)}
              onCalculateRoutes={(origin, dest, prof, opts) => handleCalculateRoutes(origin, dest, prof, opts)}
              onClose={() => setShowDirectionsPanel(false)}
              isCalculating={isCalculatingRoutes}
              highContrast={layers.highContrast}
            />
          )}

          {/* Route Alternatives & Scoring Sheet */}
          {routes.length > 0 && (
            <RouteResultsSheet
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              onStartNavigation={handleStartNavigation}
              onClose={() => setRoutes([])}
              profile={mobilityProfile}
              destinationName={selectedPlace?.name || 'Destination'}
              highContrast={layers.highContrast}
            />
          )}

          {/* Community Report Verification Drawer */}
          {selectedReport && (
            <VerificationDrawer
              report={selectedReport}
              onVote={handleVoteReport}
              onClose={() => setSelectedReport(null)}
              highContrast={layers.highContrast}
            />
          )}
        </div>
      )}

      {/* 4. Full-Screen Turn-by-Turn Navigation HUD */}
      {isNavigating && activeRoute && (
        <NavigationHUD
          route={activeRoute}
          currentStepIndex={currentStepIndex}
          remainingDistance={remainingDistance}
          remainingSeconds={remainingSeconds}
          onExitNavigation={handleExitNavigation}
          onTriggerObstacleAlert={handleTriggerObstacleAlert}
          highContrast={layers.highContrast}
        />
      )}

      {/* 5. In-Trip Dynamic Obstacle Alert Modal */}
      {showObstacleAlert && (
        <ObstacleAlertModal
          obstacleTitle="Broken wheelchair ramp & construction reported ahead"
          detourTimeEstimate="+3 min (100% step-free)"
          onAcceptDetour={handleAcceptDetour}
          onDismiss={() => setShowObstacleAlert(false)}
          highContrast={layers.highContrast}
        />
      )}

      {/* 6. Community Barrier Reporting Modal */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSubmitReport}
          defaultLocation={userLocation}
          highContrast={layers.highContrast}
        />
      )}

      {/* 7. Screen Reader Table View */}
      {showScreenReaderTable && activeRoute && (
        <ScreenReaderTable
          route={activeRoute}
          profile={mobilityProfile}
          onClose={() => setShowScreenReaderTable(false)}
          highContrast={layers.highContrast}
        />
      )}

      {/* 8. Map Controls (Recenter, Layers, Accessibility Table) */}
      {!isNavigating && (
        <MapControls
          layers={layers}
          onToggleLayer={(k) => setLayers((prev) => ({ ...prev, [k]: !prev[k] }))}
          onRecenter={() => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                  setUserLocation(coords);
                  setMapCenter(coords);
                  setMapZoom(16);
                  setSearchBias(coords);
                  setShowSearchThisArea(false);
                },
                () => {
                  setMapCenter(userLocation);
                  setMapZoom(16);
                },
                { enableHighAccuracy: true, timeout: 5000 }
              );
            } else {
              setMapCenter(userLocation);
              setMapZoom(16);
            }
          }}
          onOpenScreenReaderTable={() => {
            if (routes.length > 0) {
              setShowScreenReaderTable(true);
            } else if (places.length > 0) {
              handleCalculateRoutes('Your Location', places[0], mobilityProfile).then(() => {
                setShowScreenReaderTable(true);
              });
            }
          }}
          highContrast={layers.highContrast}
        />
      )}
    </div>
  );
};

export default App;
