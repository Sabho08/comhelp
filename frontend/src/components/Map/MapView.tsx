import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place, RouteResult, CommunityReport, EventZone, MapLayerConfig } from '../../types';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  routes: RouteResult[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  reports: CommunityReport[];
  selectedReport: CommunityReport | null;
  onSelectReport: (report: CommunityReport) => void;
  events: EventZone[];
  layers: MapLayerConfig;
  userLocation: [number, number];
  navigationActive: boolean;
  navPosition: [number, number] | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMapMoveEnd?: (center: [number, number], zoom: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom,
  places,
  selectedPlace,
  onSelectPlace,
  routes,
  selectedRouteId,
  onSelectRoute,
  reports,
  selectedReport,
  onSelectReport,
  events,
  layers,
  userLocation,
  navigationActive,
  navPosition,
  onMapClick,
  onMapMoveEnd,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const markerLayersRef = useRef<L.LayerGroup | null>(null);
  const eventLayersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const isProgrammaticMoveRef = useRef<boolean>(false);

  // Free OpenStreetMap & Esri Basemap Tiles (100% Free, NO API Key Required)
  const getTileUrl = () => {
    if (layers.highContrast) {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    }
    // Clean OpenStreetMap Tile Layer (Free, Public, No Key Required)
    return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add free open tile layer with automatic fallback
    const tileLayer = L.tileLayer(getTileUrl(), {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Fallback to standard OSM if any layer fails
    tileLayer.on('tileerror', () => {
      tileLayer.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    });

    routeLayersRef.current = L.layerGroup().addTo(map);
    markerLayersRef.current = L.layerGroup().addTo(map);
    eventLayersRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // Listen only to user-initiated drag/zoom end
    map.on('dragend zoomend', () => {
      if (isProgrammaticMoveRef.current) return;
      if (onMapMoveEnd) {
        const c = map.getCenter();
        onMapMoveEnd([c.lat, c.lng], map.getZoom());
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if contrast changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileLayer = L.tileLayer(getTileUrl(), {
      maxZoom: 19,
      attribution: layers.highContrast
        ? 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayer.on('tileerror', () => {
      tileLayer.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    });
  }, [layers.highContrast]);

  // Update Map Center programmatically when center/zoom props change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const current = map.getCenter();
    const currZoom = map.getZoom();

    const dLat = Math.abs(current.lat - center[0]);
    const dLng = Math.abs(current.lng - center[1]);
    const dZoom = Math.abs(currZoom - zoom);

    // Only update if there is an actual meaningful difference
    if (dLat > 0.0001 || dLng > 0.0001 || dZoom > 0.01) {
      isProgrammaticMoveRef.current = true;
      map.setView(center, zoom, { animate: true });
      const timer = setTimeout(() => {
        isProgrammaticMoveRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [center[0], center[1], zoom]);

  // Update Event & Rally Polygons
  useEffect(() => {
    if (!eventLayersRef.current) return;
    eventLayersRef.current.clearLayers();

    if (!layers.showEvents) return;

    events.forEach((ev) => {
      if (!ev.is_active) return;
      const polygon = L.polygon(ev.polygon, {
        color: '#7C3AED',
        weight: 2.5,
        fillColor: '#8B5CF6',
        fillOpacity: 0.25,
        dashArray: '5, 8',
      });

      polygon.bindPopup(`
        <div class="p-2.5 text-slate-800 font-sans max-w-xs">
          <div class="flex items-center gap-1.5 font-bold text-purple-700 text-xs mb-1">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>Live Civic Gathering / Rally</span>
          </div>
          <p class="font-bold text-xs text-slate-900">${ev.title}</p>
          <p class="text-[11px] text-slate-600 mt-1">${ev.description}</p>
          <div class="mt-2 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
            Density: ${ev.crowd_density}
          </div>
        </div>
      `);
      eventLayersRef.current?.addLayer(polygon);
    });
  }, [events, layers.showEvents]);

  // Update Places & Community Hazards Markers
  useEffect(() => {
    if (!markerLayersRef.current) return;
    markerLayersRef.current.clearLayers();

    // Combined places to render (including selectedPlace if external/searched)
    const placesToRender = [...places];
    if (selectedPlace && !places.some((p) => p.id === selectedPlace.id)) {
      placesToRender.push(selectedPlace);
    }

    // Places Markers
    placesToRender.forEach((p) => {
      const isSelected = selectedPlace?.id === p.id;
      const isAccessible = p.accessibility?.has_ramp || p.accessibility?.has_accessible_entrance;
      
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-8 h-8 rounded-2xl flex items-center justify-center shadow-md border-2 transition-colors duration-150 ${
            isSelected
              ? 'bg-red-600 border-white text-white shadow-lg ring-2 ring-red-400'
              : isAccessible
              ? 'bg-emerald-600 border-white text-white hover:bg-emerald-700'
              : 'bg-blue-600 border-white text-white hover:bg-blue-700'
          }">
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          ${p.accessibility?.has_ramp ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs pointer-events-none">♿</div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-place-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });
      marker.on('click', () => onSelectPlace(p));
      markerLayersRef.current?.addLayer(marker);
    });

    // Community Reports / Hazards Markers
    if (layers.showHazards) {
      reports.forEach((rep) => {
        if (rep.status === 'EXPIRED') return;
        const isSelected = selectedReport?.id === rep.id;
        const isCritical = rep.severity === 'critical' || rep.severity === 'severe';

        const repIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 transition-colors duration-150 ${
              isSelected
                ? 'bg-red-600 border-white text-white ring-2 ring-red-400'
                : isCritical
                ? 'bg-red-500 border-white text-white hover:bg-red-600'
                : 'bg-amber-500 border-white text-white hover:bg-amber-600'
            }">
              <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            ${rep.confidence_level === 'HIGH' ? '<span class="absolute -bottom-1 -right-1 flex h-2.5 w-2.5 pointer-events-none"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span></span>' : ''}
          </div>
        `;

        const repIcon = L.divIcon({
          className: 'custom-hazard-pin',
          html: repIconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([rep.latitude, rep.longitude], { icon: repIcon });
        marker.on('click', () => onSelectReport(rep));
        markerLayersRef.current?.addLayer(marker);
      });
    }
  }, [places, selectedPlace, reports, selectedReport, layers.showHazards]);

  // Update Routes Polyline
  useEffect(() => {
    if (!routeLayersRef.current || !mapInstanceRef.current) return;
    routeLayersRef.current.clearLayers();

    if (routes.length === 0) return;

    // Render non-selected routes first
    routes.forEach((rt) => {
      const isSelected = rt.id === selectedRouteId;
      if (isSelected) return;

      const poly = L.polyline(rt.coordinates, {
        color: '#70757A',
        weight: 5,
        opacity: 0.65,
        dashArray: rt.is_step_free ? undefined : '6, 8',
      });
      poly.on('click', () => onSelectRoute(rt.id));
      routeLayersRef.current?.addLayer(poly);
    });

    // Render active route
    const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (activeRoute) {
      const outline = L.polyline(activeRoute.coordinates, {
        color: '#1557B0',
        weight: 8,
        opacity: 0.3,
      });
      const mainPoly = L.polyline(activeRoute.coordinates, {
        color: activeRoute.color || '#1A73E8',
        weight: 6,
        opacity: 1.0,
      });
      routeLayersRef.current.addLayer(outline);
      routeLayersRef.current.addLayer(mainPoly);

      if (layers.showRamps && activeRoute.is_step_free) {
        const midPoint = activeRoute.coordinates[Math.floor(activeRoute.coordinates.length / 2)];
        if (midPoint) {
          const rampIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="bg-white text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-emerald-300 flex items-center gap-1 cursor-pointer hover:scale-105 transition"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Verified Ramp</div>`,
            iconSize: [90, 22],
            iconAnchor: [45, 11],
          });
          const rampMarker = L.marker(midPoint, { icon: rampIcon });
          routeLayersRef.current.addLayer(rampMarker);
        }
      }

      if (!navigationActive) {
        const bounds = L.latLngBounds(activeRoute.coordinates);
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
      }
    }
  }, [routes, selectedRouteId, layers.showRamps, navigationActive]);

  // Update User Position & Live Beacon Pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const pos = navPosition || userLocation;

    if (!userMarkerRef.current) {
      const userIconHtml = `
        <div class="relative flex items-center justify-center pointer-events-none">
          <div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
          <div class="absolute -inset-2.5 bg-blue-500 rounded-full opacity-35 animate-pulse-ring pointer-events-none"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: userIconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      userMarkerRef.current = L.marker(pos, { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
      userMarkerRef.current.bindPopup(`
        <div class="p-1 text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
          <span>Your Live Location</span>
        </div>
      `);
    } else {
      userMarkerRef.current.setLatLng(pos);
    }

    if (navigationActive && navPosition) {
      map.panTo(navPosition, { animate: true });
    }
  }, [userLocation[0], userLocation[1], navPosition, navigationActive]);

  return (
    <div className="relative w-full h-full bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
