/**
 * AccessRoute Live - Core Engine
 * Inclusive Multi-Modal Navigation & Hazard Intelligence System
 */

(function () {
  'use strict';

  // ==================== STATE MANAGEMENT ====================
  const state = {
    currentCity: 'delhi',
    activeMode: 'wheelchair', // wheelchair, walking, bicycle, transit, driving, emergency
    startCoords: null,
    destCoords: null,
    startName: 'Central Metro Station Gate 2',
    destName: 'City General Hospital & Medical Center',
    isSimulatingLive: true,
    isHighContrast: false,
    isVoiceEnabled: true,
    isNavigating: false,
    navInterval: null,
    navStepIndex: 0,
    selectedHazardType: 'pothole',
    reportingPinCoords: null,
    activeRouteData: null,
    overlays: {
      traffic: true,
      rallies: true,
      ramps: true,
      hazards: true
    }
  };

  // City Presets with rich accessibility and road network data
  const CITY_PRESETS = {
    delhi: {
      name: 'New Delhi (Connaught Place)',
      center: [28.6328, 77.2197],
      zoom: 15,
      start: { lat: 28.6325, lng: 28.6325 ? 77.2185 : 77.2185, name: 'Rajiv Chowk Metro Gate 2 (Ramp Access)' },
      dest: { lat: 28.6385, lng: 77.2245, name: 'Connaught Medical Center & Polyclinic' },
      ramps: [
        { lat: 28.6329, lng: 77.2188, name: 'Gate 2 ADA Ramp', type: 'ramp', slope: '3.1%', status: 'Clear & Verified', icon: 'fa-road' },
        { lat: 28.6342, lng: 77.2201, name: 'Inner Circle Crosswalk Ramp', type: 'ramp', slope: '4.0%', status: 'Gentle Slope', icon: 'fa-road' },
        { lat: 28.6360, lng: 77.2215, name: 'Radial 3 Pedestrian Ramp', type: 'ramp', slope: '3.5%', status: 'Tactile Paved', icon: 'fa-road' },
        { lat: 28.6375, lng: 77.2238, name: 'Hospital Entrance Incline Ramp', type: 'ramp', slope: '2.8%', status: 'Dual Handrails', icon: 'fa-road' }
      ],
      elevators: [
        { lat: 28.6327, lng: 77.2192, name: 'Metro Concourse Lift A', type: 'elevator', status: 'Operational', capacity: '12 Person / Stretcher', icon: 'fa-elevator' },
        { lat: 28.6355, lng: 77.2210, name: 'Underpass Accessible Lift B', type: 'elevator', status: 'Operational', capacity: 'Wheelchair Accessible', icon: 'fa-elevator' },
        { lat: 28.6331, lng: 77.2205, name: 'Metro Gate 5 Escalator', type: 'escalator', status: 'Running Upward (Ramp 10m away)', note: 'Wheelchair alternative: Lift A', icon: 'fa-stairs' }
      ],
      rallies: [
        {
          id: 'rally-delhi-1',
          name: 'Civic Teachers & Public Rally',
          lat: 28.6348,
          lng: 77.2230,
          radius: 140,
          crowd: '~2,200 Participants',
          severity: 'Road Blocked by Police Cordon',
          trafficDelay: 15,
          active: true
        }
      ],
      hazards: [
        {
          id: 'hz-1',
          type: 'pothole',
          lat: 28.6338,
          lng: 77.2195,
          desc: 'Deep 15cm pothole on edge of curb cut, severe wheelchair tilt hazard.',
          severity: 'high',
          verifiedCount: 7,
          timestamp: '8 mins ago'
        },
        {
          id: 'hz-2',
          type: 'barricade',
          lat: 28.6350,
          lng: 77.2225,
          desc: 'Iron barricades placed for pedestrian redirection, steps only.',
          severity: 'high',
          verifiedCount: 14,
          timestamp: '25 mins ago'
        }
      ]
    },
    sf: {
      name: 'San Francisco (Market St & Union Sq)',
      center: [37.7879, -122.4075],
      zoom: 15,
      start: { lat: 37.7858, lng: -122.4065, name: 'Powell St BART Station (Street Lift)' },
      dest: { lat: 37.7905, lng: -122.4035, name: 'Sutter Health Urgent Care' },
      ramps: [
        { lat: 37.7862, lng: -122.4062, name: 'Market St Curb Cut & Ramp', type: 'ramp', slope: '3.2%', status: 'Compliant', icon: 'fa-road' },
        { lat: 37.7885, lng: -122.4050, name: 'Union Sq Plaza Gentle Ramp', type: 'ramp', slope: '2.5%', status: 'Wide Accessible', icon: 'fa-road' },
        { lat: 37.7898, lng: -122.4042, name: 'Post St Accessible Crossing', type: 'ramp', slope: '3.8%', status: 'Tactile Indicator', icon: 'fa-road' }
      ],
      elevators: [
        { lat: 37.7857, lng: -122.4068, name: 'Powell BART Street-to-Platform Elevator', type: 'elevator', status: 'Operational', capacity: 'Wheelchair / Bike', icon: 'fa-elevator' },
        { lat: 37.7882, lng: -122.4055, name: 'Union Sq Garage Public Elevator', type: 'elevator', status: 'Operational', capacity: 'ADA Certified', icon: 'fa-elevator' },
        { lat: 37.7865, lng: -122.4060, name: 'Cable Car Turnaround Escalator', type: 'escalator', status: 'Under Inspection (Ramp adjacent)', icon: 'fa-stairs' }
      ],
      rallies: [
        {
          id: 'rally-sf-1',
          name: 'Tech Worker & Climate Rally',
          lat: 37.7875,
          lng: -122.4052,
          radius: 120,
          crowd: '~1,500 Participants',
          severity: 'Powell / Geary St Infiltration',
          trafficDelay: 12,
          active: true
        }
      ],
      hazards: [
        {
          id: 'hz-sf-1',
          type: 'broken_ramp',
          lat: 37.7868,
          lng: -122.4058,
          desc: 'Construction scaffold blocking curb ramp. 10cm step without transition.',
          severity: 'high',
          verifiedCount: 9,
          timestamp: '15 mins ago'
        }
      ]
    },
    london: {
      name: 'London (Westminster & Whitehall)',
      center: [51.5014, -0.1265],
      zoom: 15,
      start: { lat: 51.5010, lng: -0.1250, name: 'Westminster Underground Station (Step-Free)' },
      dest: { lat: 51.5065, lng: -0.1280, name: 'Trafalgar Medical Center' },
      ramps: [
        { lat: 51.5015, lng: -0.1255, name: 'Parliament Square Accessible Ramp', type: 'ramp', slope: '3.0%', status: 'Step-Free Pavement', icon: 'fa-road' },
        { lat: 51.5035, lng: -0.1265, name: 'Whitehall Northbound Ramp', type: 'ramp', slope: '2.9%', status: 'Smooth Asphalting', icon: 'fa-road' },
        { lat: 51.5055, lng: -0.1275, name: 'Trafalgar Square South Terrace Ramp', type: 'ramp', slope: '4.2%', status: 'Handrailed Ramp', icon: 'fa-road' }
      ],
      elevators: [
        { lat: 51.5012, lng: -0.1248, name: 'Westminster Station Jubilee Line Lift', type: 'elevator', status: 'Operational', capacity: 'Step-Free to Train', icon: 'fa-elevator' },
        { lat: 51.5040, lng: -0.1270, name: 'MOD Pedestrian Underpass Lift', type: 'elevator', status: 'Operational', capacity: 'Clean & Safe', icon: 'fa-elevator' },
        { lat: 51.5020, lng: -0.1258, name: 'Bridge St Escalators', type: 'escalator', status: 'Running (Wheelchairs use Station Lift 1)', icon: 'fa-stairs' }
      ],
      rallies: [
        {
          id: 'rally-lon-1',
          name: 'Parliament Green March & Gathering',
          lat: 51.5028,
          lng: -0.1260,
          radius: 130,
          crowd: '~3,000 Marchers',
          severity: 'Whitehall Traffic Diversion in effect',
          trafficDelay: 18,
          active: true
        }
      ],
      hazards: [
        {
          id: 'hz-lon-1',
          type: 'pothole',
          lat: 51.5030,
          lng: -0.1268,
          desc: 'Broken cobblestone paver, creates wheelchair wheel wedge risk.',
          severity: 'medium',
          verifiedCount: 5,
          timestamp: '20 mins ago'
        }
      ]
    }
  };

  // 6 MODES CONFIGURATION
  const MODES_CONFIG = {
    wheelchair: {
      name: 'Wheelchair / Accessible',
      icon: 'fa-wheelchair',
      color: '#10b981', // Emerald
      speedKmH: 3.8,
      caloriePerKm: 32,
      accessibleRating: '100% Step-Free',
      description: 'Prioritizes certified ramps, working elevators, gentle gradients (<5%), and avoids all stairs & barricades.'
    },
    walking: {
      name: 'Pedestrian / Walking',
      icon: 'fa-person-walking',
      color: '#06b6d4', // Cyan
      speedKmH: 4.8,
      caloriePerKm: 55,
      accessibleRating: 'Partial (Stairs permitted)',
      description: 'Optimized for shortest walking time using sidewalks, crosswalks, and pedestrian shortcuts.'
    },
    bicycle: {
      name: 'Bicycle / E-Scooter',
      icon: 'fa-bicycle',
      color: '#eab308', // Amber / Yellow
      speedKmH: 15.0,
      caloriePerKm: 38,
      accessibleRating: 'Bike Infrastructure Priority',
      description: 'Follows dedicated bike paths, low-traffic lanes, avoiding steep staircases and potholes.'
    },
    transit: {
      name: 'Public Transit / Metro & Bus',
      icon: 'fa-train-subway',
      color: '#a855f7', // Purple
      speedKmH: 26.0,
      caloriePerKm: 15,
      accessibleRating: 'Elevator-Equipped Stations',
      description: 'Combines metro/bus routes with wheelchair-accessible station boarding, lifts, and escalators.'
    },
    driving: {
      name: 'Car / Driving',
      icon: 'fa-car',
      color: '#3b82f6', // Blue
      speedKmH: 28.0, // Modified dynamically by traffic
      caloriePerKm: 0,
      accessibleRating: 'Motorized',
      description: 'Standard arterial driving route evaluated against live road traffic, blockades, and rallies.'
    },
    emergency: {
      name: 'Emergency / Fast Response',
      icon: 'fa-truck-medical',
      color: '#ef4444', // Red
      speedKmH: 48.0,
      caloriePerKm: 0,
      accessibleRating: 'Priority Corridor',
      description: 'Sirens green-corridor routing, bypasses congestion, clears rallies, and directs to emergency trauma centers.'
    }
  };

  // Leaflet Map & Layer Groups
  let map = null;
  let tileLayers = {};
  let currentTileLayer = null;
  let markersLayer = L.layerGroup();
  let routeLayer = L.layerGroup();
  let trafficLayer = L.layerGroup();
  let ralliesLayer = L.layerGroup();
  let rampsLayer = L.layerGroup();
  let hazardsLayer = L.layerGroup();
  let navAvatarMarker = null;

  // DOM Elements cache
  const el = {
    citySelect: document.getElementById('citySelect'),
    tileStyleSelect: document.getElementById('tileStyleSelect'),
    startInput: document.getElementById('startInput'),
    destInput: document.getElementById('destInput'),
    swapPointsBtn: document.getElementById('swapPointsBtn'),
    currentLocBtn: document.getElementById('currentLocBtn'),
    recalcRouteBtn: document.getElementById('recalcRouteBtn'),
    toggleSimulationBtn: document.getElementById('toggleSimulationBtn'),
    simStatusText: document.getElementById('simStatusText'),
    openCompareBtn: document.getElementById('openCompareBtn'),
    toggleContrastBtn: document.getElementById('toggleContrastBtn'),
    toggleVoiceBtn: document.getElementById('toggleVoiceBtn'),
    voiceIcon: document.getElementById('voiceIcon'),
    openReportModalBtn: document.getElementById('openReportModalBtn'),
    modesContainer: document.getElementById('modesContainer'),
    etaValue: document.getElementById('etaValue'),
    distValue: document.getElementById('distValue'),
    trafficBadge: document.getElementById('trafficBadge'),
    routeSafetyBadge: document.getElementById('routeSafetyBadge'),
    accessibilityDetailsBox: document.getElementById('accessibilityDetailsBox'),
    rampsCountText: document.getElementById('rampsCountText'),
    elevatorsCountText: document.getElementById('elevatorsCountText'),
    escalatorsCountText: document.getElementById('escalatorsCountText'),
    slopeGradeText: document.getElementById('slopeGradeText'),
    liveAlertBanner: document.getElementById('liveAlertBanner'),
    liveAlertTitle: document.getElementById('liveAlertTitle'),
    liveAlertDesc: document.getElementById('liveAlertDesc'),
    toggleStepsBtn: document.getElementById('toggleStepsBtn'),
    stepsChevron: document.getElementById('stepsChevron'),
    stepsListContainer: document.getElementById('stepsListContainer'),
    stepsCount: document.getElementById('stepsCount'),
    startNavigationBtn: document.getElementById('startNavigationBtn'),
    activeNavBanner: document.getElementById('activeNavBanner'),
    navDirectionIcon: document.getElementById('navDirectionIcon'),
    navNextInstruction: document.getElementById('navNextInstruction'),
    navStreetInstruction: document.getElementById('navStreetInstruction'),
    navRemainingEta: document.getElementById('navRemainingEta'),
    navRemainingDist: document.getElementById('navRemainingDist'),
    stopNavBtn: document.getElementById('stopNavBtn'),
    layerTraffic: document.getElementById('layerTraffic'),
    layerRallies: document.getElementById('layerRallies'),
    layerRamps: document.getElementById('layerRamps'),
    layerHazards: document.getElementById('layerHazards'),
    activeIncidentsCount: document.getElementById('activeIncidentsCount'),
    reportModal: document.getElementById('reportModal'),
    closeReportModalBtn: document.getElementById('closeReportModalBtn'),
    cancelReportBtn: document.getElementById('cancelReportBtn'),
    submitReportBtn: document.getElementById('submitReportBtn'),
    hazardTypeGrid: document.getElementById('hazardTypeGrid'),
    reportLocationText: document.getElementById('reportLocationText'),
    reportDescText: document.getElementById('reportDescText'),
    pinOnMapBtn: document.getElementById('pinOnMapBtn'),
    compareModal: document.getElementById('compareModal'),
    closeCompareModalBtn: document.getElementById('closeCompareModalBtn'),
    compareGridContainer: document.getElementById('compareGridContainer'),
    toastContainer: document.getElementById('toastContainer')
  };

  // ==================== INITIALIZATION ====================
  function init() {
    initMap();
    loadSavedHazards();
    setupEventListeners();
    setCity('delhi');
    startLiveFeedSimulation();
    showToast('🚀 System Online: Live Multi-Modal & Ramp Engine active!', 'info');
  }

  // Initialize Map
  function initMap() {
    // Map tile providers
    tileLayers.dark = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    });

    tileLayers.light = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    });

    tileLayers.osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    // Default: Dark style for sleek presentation
    currentTileLayer = tileLayers.dark;

    map = L.map('map', {
      center: CITY_PRESETS.delhi.center,
      zoom: CITY_PRESETS.delhi.zoom,
      layers: [currentTileLayer],
      zoomControl: false
    });

    // Position Zoom controls on bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add layer groups
    routeLayer.addTo(map);
    trafficLayer.addTo(map);
    ralliesLayer.addTo(map);
    rampsLayer.addTo(map);
    hazardsLayer.addTo(map);
    markersLayer.addTo(map);

    // Map Click Handler for placing custom points or reporting
    map.on('click', onMapClick);
  }

  // Load custom hazards from localStorage
  function loadSavedHazards() {
    try {
      const saved = localStorage.getItem('accessroute_hazards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with presets if not already there
          parsed.forEach(h => {
            if (h.city && CITY_PRESETS[h.city]) {
              CITY_PRESETS[h.city].hazards.push(h);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error reading saved hazards', e);
    }
  }

  function saveCustomHazard(hazard) {
    try {
      const saved = localStorage.getItem('accessroute_hazards');
      const list = saved ? JSON.parse(saved) : [];
      list.push(hazard);
      localStorage.setItem('accessroute_hazards', JSON.stringify(list));
    } catch (e) {
      console.warn('Error saving hazard', e);
    }
  }

  // Switch City
  function setCity(cityKey) {
    if (!CITY_PRESETS[cityKey]) return;
    state.currentCity = cityKey;
    const city = CITY_PRESETS[cityKey];

    map.flyTo(city.center, city.zoom, { duration: 1.2 });

    state.startCoords = [city.start.lat, city.start.lng];
    state.destCoords = [city.dest.lat, city.dest.lng];
    state.startName = city.start.name;
    state.destName = city.dest.name;

    el.startInput.value = state.startName;
    el.destInput.value = state.destName;

    renderCityOverlays(city);
    calculateAndRenderRoute();
  }

  // Render Overlays for City (Ramps, Elevators, Rallies, Hazards, Traffic)
  function renderCityOverlays(city) {
    rampsLayer.clearLayers();
    ralliesLayer.clearLayers();
    hazardsLayer.clearLayers();

    // 1. Ramps & Accessibility Infrastructure
    city.ramps.forEach(ramp => {
      const rampMarker = L.marker([ramp.lat, ramp.lng], {
        icon: createSvgIcon('fa-road', '#10b981', 'Ramp')
      });
      rampMarker.bindPopup(`
        <div class="p-2 text-slate-900">
          <div class="flex items-center gap-1.5 font-bold text-emerald-700 text-sm">
            <i class="fa-solid fa-road"></i> ${ramp.name}
          </div>
          <div class="text-xs text-slate-700 mt-1">
            <div><strong>Slope Incline:</strong> ${ramp.slope} (Gentle & Safe)</div>
            <div><strong>Status:</strong> ${ramp.status}</div>
            <div class="mt-1 text-emerald-600 font-semibold"><i class="fa-solid fa-circle-check"></i> 100% ADA & Wheelchair Compliant</div>
          </div>
        </div>
      `);
      rampsLayer.addLayer(rampMarker);
    });

    // Elevators & Escalators
    city.elevators.forEach(item => {
      const isElevator = item.type === 'elevator';
      const color = isElevator ? '#06b6d4' : '#f59e0b';
      const icon = isElevator ? 'fa-elevator' : 'fa-stairs';

      const marker = L.marker([item.lat, item.lng], {
        icon: createSvgIcon(icon, color, isElevator ? 'Elevator' : 'Escalator')
      });
      marker.bindPopup(`
        <div class="p-2 text-slate-900">
          <div class="flex items-center gap-1.5 font-bold ${isElevator ? 'text-cyan-700' : 'text-amber-700'} text-sm">
            <i class="fa-solid ${icon}"></i> ${item.name}
          </div>
          <div class="text-xs text-slate-700 mt-1">
            <div><strong>Type:</strong> ${isElevator ? 'Accessible Elevator / Lift' : 'Station Escalator'}</div>
            <div><strong>Live Telemetry:</strong> <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">${item.status}</span></div>
            ${item.note ? `<div class="text-slate-600 mt-0.5"><em>${item.note}</em></div>` : ''}
          </div>
        </div>
      `);
      rampsLayer.addLayer(marker);
    });

    // 2. Live Rallies & Processions
    city.rallies.forEach(rally => {
      if (!rally.active) return;
      // Pulsing circle zone
      const rallyCircle = L.circle([rally.lat, rally.lng], {
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.35,
        radius: rally.radius,
        weight: 2,
        dashArray: '6, 6'
      });

      const rallyPin = L.marker([rally.lat, rally.lng], {
        icon: createSvgIcon('fa-bullhorn', '#ef4444', 'LIVE RALLY', true)
      });

      const popupHtml = `
        <div class="p-2 text-slate-900">
          <div class="flex items-center gap-1.5 font-bold text-red-600 text-sm">
            <i class="fa-solid fa-bullhorn"></i> ${rally.name}
          </div>
          <div class="text-xs text-slate-700 mt-1">
            <div><strong>Crowd Density:</strong> ${rally.crowd}</div>
            <div><strong>Status:</strong> ${rally.severity}</div>
            <div><strong>Live Impact:</strong> +${rally.trafficDelay} mins delay on normal roads</div>
            <div class="mt-2 text-xs font-bold text-blue-700 bg-blue-50 p-1.5 rounded border border-blue-200">
              <i class="fa-solid fa-shield-halved"></i> AccessRoute Auto-Reroute active around this zone
            </div>
          </div>
        </div>
      `;

      rallyCircle.bindPopup(popupHtml);
      rallyPin.bindPopup(popupHtml);

      ralliesLayer.addLayer(rallyCircle);
      ralliesLayer.addLayer(rallyPin);
    });

    // 3. Crowdsourced Hazards (Potholes, Barricades, etc.)
    city.hazards.forEach(hz => {
      renderHazardMarker(hz);
    });

    updateIncidentCounter();
  }

  // Render a single hazard marker
  function renderHazardMarker(hz) {
    let iconClass = 'fa-triangle-exclamation';
    let iconColor = '#f59e0b';
    let typeLabel = 'Hazard';

    switch (hz.type) {
      case 'pothole':
        iconClass = 'fa-circle-radiation';
        iconColor = '#f97316';
        typeLabel = 'Pothole';
        break;
      case 'barricade':
        iconClass = 'fa-road-barrier';
        iconColor = '#ef4444';
        typeLabel = 'Barricade';
        break;
      case 'broken_ramp':
        iconClass = 'fa-wheelchair';
        iconColor = '#ea580c';
        typeLabel = 'Broken Ramp';
        break;
      case 'broken_elevator':
        iconClass = 'fa-elevator';
        iconColor = '#06b6d4';
        typeLabel = 'Lift Down';
        break;
      case 'rally':
        iconClass = 'fa-bullhorn';
        iconColor = '#a855f7';
        typeLabel = 'Rally';
        break;
      case 'waterlogging':
        iconClass = 'fa-water';
        iconColor = '#3b82f6';
        typeLabel = 'Waterlogged';
        break;
    }

    const marker = L.marker([hz.lat, hz.lng], {
      icon: createSvgIcon(iconClass, iconColor, typeLabel)
    });

    marker.bindPopup(`
      <div class="p-2 text-slate-900 min-w-[200px]">
        <div class="flex items-center justify-between font-bold text-sm" style="color: ${iconColor}">
          <span class="flex items-center gap-1.5"><i class="fa-solid ${iconClass}"></i> ${typeLabel}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${hz.timestamp || 'Just now'}</span>
        </div>
        <p class="text-xs text-slate-700 mt-1">${hz.desc || 'Reported obstruction on road/pathway.'}</p>
        <div class="flex items-center justify-between text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-200">
          <span><i class="fa-solid fa-users text-emerald-600"></i> ${hz.verifiedCount || 1} Community Verifications</span>
          <button onclick="window.upvoteHazard('${hz.id}')" class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-300">
            +1 Confirm
          </button>
        </div>
      </div>
    `);

    hazardsLayer.addLayer(marker);
  }

  // Create clean modern SVG map markers
  function createSvgIcon(fontAwesomeClass, color, label = '', isPulse = false) {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex flex-col items-center custom-pin">
          ${isPulse ? '<div class="rally-pulse-ring"></div>' : ''}
          <div style="background-color: ${color}; box-shadow: 0 4px 12px ${color}88;" class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs shadow-lg transition-transform">
            <i class="fa-solid ${fontAwesomeClass}"></i>
          </div>
          ${label ? `<span class="mt-0.5 text-[9px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap shadow-md">${label}</span>` : ''}
        </div>
      `,
      iconSize: [32, 44],
      iconAnchor: [16, 22]
    });
  }

  // Update total incident counter pill
  function updateIncidentCounter() {
    const city = CITY_PRESETS[state.currentCity];
    if (!city) return;
    const count = (city.hazards ? city.hazards.length : 0) + (city.rallies ? city.rallies.length : 0);
    el.activeIncidentsCount.textContent = count;
  }

  // ==================== ROUTE CALCULATION & 6 MODES ====================

  /**
   * Generates realistic, dynamic routes based on mode, traffic congestion, rallies, and ramps
   */
  function calculateAndRenderRoute() {
    if (!state.startCoords || !state.destCoords) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();
    trafficLayer.clearLayers();

    // 1. Place Start & Destination Pins
    const startPin = L.marker(state.startCoords, {
      icon: createSvgIcon('fa-location-dot', '#10b981', 'Start')
    }).bindPopup(`<b>Starting Point</b><br>${state.startName}`);

    const destPin = L.marker(state.destCoords, {
      icon: createSvgIcon('fa-flag-checkered', '#ef4444', 'Destination')
    }).bindPopup(`<b>Destination</b><br>${state.destName}`);

    markersLayer.addLayer(startPin);
    markersLayer.addLayer(destPin);

    // 2. Generate Path coordinates considering active mode and rally/hazard bypass
    const route = buildRouteGeometry(state.startCoords, state.destCoords, state.activeMode);
    state.activeRouteData = route;

    // 3. Draw Route Polylines
    // Outer glow / casing
    const casingPolyline = L.polyline(route.points, {
      color: '#ffffff',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round'
    });
    routeLayer.addLayer(casingPolyline);

    // Colored route based on mode
    const modeConfig = MODES_CONFIG[state.activeMode];
    const mainPolyline = L.polyline(route.points, {
      color: modeConfig.color,
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      dashArray: state.activeMode === 'walking' || state.activeMode === 'wheelchair' ? '8, 6' : null
    });
    routeLayer.addLayer(mainPolyline);

    // 4. If Driving or Transit, draw Live Traffic Congestion segments
    if (state.overlays.traffic && (state.activeMode === 'driving' || state.activeMode === 'transit')) {
      renderTrafficCongestion(route.points);
    }

    // 5. Update Telemetry HUD with precise Mode stats
    updateRouteHUD(route);

    // Fit map bounds smoothly
    const bounds = L.latLngBounds([state.startCoords, state.destCoords]);
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
  }

  /**
   * Generates waypoint points with realistic road curve & rally avoidance
   */
  function buildRouteGeometry(start, dest, mode) {
    const [lat1, lng1] = start;
    const [lat2, lng2] = dest;

    // Direct Euclidean distance in km
    const directDistKm = getDistanceKm(lat1, lng1, lat2, lng2);
    // Road winding factor (urban grid is typically ~1.25 to 1.35x direct)
    let windingFactor = 1.28;

    // Check if straight path would intersect any active rally in the city
    const city = CITY_PRESETS[state.currentCity];
    let rallyConflict = false;
    let detourMidpoint = null;

    if (city && city.rallies) {
      city.rallies.forEach(rally => {
        if (!rally.active) return;
        const dToRally = getDistanceKm((lat1 + lat2) / 2, (lng1 + lng2) / 2, rally.lat, rally.lng);
        if (dToRally < 0.22) { // 220m proximity
          rallyConflict = true;
          // Calculate accessible bypass perpendicular offset
          const offsetLat = (lng2 - lng1) * 0.45;
          const offsetLng = -(lat2 - lat1) * 0.45;
          detourMidpoint = [
            (lat1 + lat2) / 2 + offsetLat,
            (lng1 + lng2) / 2 + offsetLng
          ];
        }
      });
    }

    // Generate intermediate path points
    const points = [];
    points.push([lat1, lng1]);

    if (rallyConflict && detourMidpoint) {
      windingFactor = 1.42; // Detour adds slight distance
      points.push([
        lat1 + (detourMidpoint[0] - lat1) * 0.5 + 0.0003,
        lng1 + (detourMidpoint[1] - lng1) * 0.5 - 0.0002
      ]);
      points.push(detourMidpoint);
      points.push([
        detourMidpoint[0] + (lat2 - detourMidpoint[0]) * 0.5 - 0.0002,
        detourMidpoint[1] + (lng2 - detourMidpoint[1]) * 0.5 + 0.0004
      ]);
    } else {
      // Normal urban waypoints with accessible ramps
      const p1 = [lat1 + (lat2 - lat1) * 0.33 + 0.0008, lng1 + (lng2 - lng1) * 0.33 - 0.0005];
      const p2 = [lat1 + (lat2 - lat1) * 0.66 - 0.0006, lng1 + (lng2 - lng1) * 0.66 + 0.0007];
      points.push(p1);
      points.push(p2);
    }

    points.push([lat2, lng2]);

    const actualDistKm = (directDistKm * windingFactor).toFixed(2);
    const modeConfig = MODES_CONFIG[mode];

    // Calculate time based on speed and traffic
    let speed = modeConfig.speedKmH;
    let trafficDelayMin = 0;

    if (mode === 'driving') {
      trafficDelayMin = rallyConflict ? 8 : 3;
    } else if (mode === 'transit') {
      trafficDelayMin = 2; // station dwell time
    }

    const baseTravelTimeMin = (actualDistKm / speed) * 60;
    const totalTimeMin = Math.max(1, Math.round(baseTravelTimeMin + trafficDelayMin));

    // Steps list generator
    const steps = generateSteps(mode, actualDistKm, rallyConflict);

    return {
      points,
      distanceKm: actualDistKm,
      timeMin: totalTimeMin,
      trafficDelayMin,
      rallyConflict,
      steps
    };
  }

  // Draw colorful traffic congestion lines
  function renderTrafficCongestion(points) {
    if (points.length < 2) return;
    for (let i = 0; i < points.length - 1; i++) {
      // Assign traffic speed colors to segments
      const segmentColors = ['#10b981', '#f59e0b', '#ef4444', '#10b981'];
      const color = segmentColors[i % segmentColors.length];

      const seg = L.polyline([points[i], points[i + 1]], {
        color: color,
        weight: 3,
        opacity: 0.9,
        className: color === '#ef4444' ? 'traffic-flow' : ''
      });
      trafficLayer.addLayer(seg);
    }
  }

  // Generate turn-by-turn guidance steps
  function generateSteps(mode, distanceKm, hasRallyDetour) {
    if (mode === 'wheelchair') {
      return [
        {
          dist: '45m',
          instruction: 'Exit station via Gate 2 ADA Ramp (Gentle 3.1% incline).',
          icon: 'fa-road',
          accessibleNote: 'Tactile paving & handrail on right side.'
        },
        {
          dist: '320m',
          instruction: 'Proceed along Accessible Concourse sidewalk with smooth asphalt.',
          icon: 'fa-arrow-up',
          accessibleNote: '0 stairs, curb cuts verified.'
        },
        hasRallyDetour ? {
          dist: '210m',
          instruction: 'Divert via 3rd Avenue Ramp to bypass active civic gathering.',
          icon: 'fa-shield-halved',
          accessibleNote: 'Rally avoided. Safe detour verified.'
        } : {
          dist: '400m',
          instruction: 'Cross Radial Intersection using pedestrian ramp with audible beacon.',
          icon: 'fa-person-walking-arrow-right',
          accessibleNote: 'Audible traffic signal available.'
        },
        {
          dist: '180m',
          instruction: 'Take Lift B or ground-level ramp into Hospital South Wing.',
          icon: 'fa-elevator',
          accessibleNote: 'Operational elevator with braille buttons.'
        },
        {
          dist: 'Arrival',
          instruction: 'Arrive at City General Hospital Medical Center (Step-Free Entrance).',
          icon: 'fa-flag-checkered',
          accessibleNote: 'Automatic sliding doors.'
        }
      ];
    } else if (mode === 'transit') {
      return [
        { dist: '120m', instruction: 'Enter Central Metro Station via Step-Free Lift A.', icon: 'fa-elevator', accessibleNote: 'Lift operational.' },
        { dist: '1.1 km', instruction: 'Board Yellow Line Metro towards North Terminal (2 stops).', icon: 'fa-train-subway', accessibleNote: 'Dedicated wheelchair bays in train.' },
        { dist: '150m', instruction: 'Exit via Hospital Station Concourse Ramp B.', icon: 'fa-road', accessibleNote: 'Wide automatic fare gates.' }
      ];
    } else if (mode === 'driving') {
      return [
        { dist: '200m', instruction: 'Head northeast on Middle Ring Road.', icon: 'fa-arrow-up', accessibleNote: 'Normal traffic flow.' },
        hasRallyDetour ? { dist: '450m', instruction: 'Turn right onto Outer Radial to bypass police barricade near rally.', icon: 'fa-triangle-exclamation', accessibleNote: 'Avoids 15 min rally gridlock.' } : { dist: '500m', instruction: 'Continue on Main Radial Boulevard.', icon: 'fa-arrow-up', accessibleNote: 'Moderate traffic delay +3m.' },
        { dist: '300m', instruction: 'Turn left into Hospital Emergency Entrance.', icon: 'fa-arrow-turn-left', accessibleNote: 'Valet & handicap parking stalls open.' }
      ];
    } else {
      return [
        { dist: '100m', instruction: 'Head east on designated path.', icon: 'fa-arrow-up', accessibleNote: 'Good condition' },
        { dist: '650m', instruction: 'Follow bike/pedestrian priority lane.', icon: 'fa-arrow-right', accessibleNote: 'Separated from car traffic' },
        { dist: '250m', instruction: 'Arrive safely at destination.', icon: 'fa-flag-checkered', accessibleNote: 'Destination reached' }
      ];
    }
  }

  // Update Telemetry HUD with detailed accessibility indicators
  function updateRouteHUD(route) {
    el.etaValue.textContent = `${route.timeMin} min`;
    el.distValue.textContent = `${route.distanceKm} km`;

    // Traffic badge
    if (state.activeMode === 'driving' || state.activeMode === 'transit') {
      if (route.trafficDelayMin > 5) {
        el.trafficBadge.className = 'nav-badge bg-red-500/20 text-red-300 border border-red-500/30';
        el.trafficBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Heavy Traffic (+${route.trafficDelayMin}m)`;
      } else if (route.trafficDelayMin > 0) {
        el.trafficBadge.className = 'nav-badge bg-amber-500/20 text-amber-300 border border-amber-500/30';
        el.trafficBadge.innerHTML = `<i class="fa-solid fa-clock"></i> Moderate Traffic (+${route.trafficDelayMin}m)`;
      } else {
        el.trafficBadge.className = 'nav-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        el.trafficBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Free Flow`;
      }
    } else {
      el.trafficBadge.className = 'nav-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      el.trafficBadge.innerHTML = `<i class="fa-solid fa-person-walking"></i> Pedestrian Clear`;
    }

    // Safety & Accessibility Mode Details
    if (state.activeMode === 'wheelchair') {
      el.accessibilityDetailsBox.classList.remove('hidden');
      el.rampsCountText.textContent = '4 Verified Ramps';
      el.elevatorsCountText.textContent = '2 Operational';
      el.escalatorsCountText.textContent = '1 Bypassed Safely';
      el.slopeGradeText.textContent = 'Avg 3.2° (Gentle)';
      el.routeSafetyBadge.innerHTML = `<i class="fa-solid fa-shield-check"></i> 100% Step-Free`;
    } else if (state.activeMode === 'transit') {
      el.accessibilityDetailsBox.classList.remove('hidden');
      el.rampsCountText.textContent = '2 Station Ramps';
      el.elevatorsCountText.textContent = '3 Platform Lifts';
      el.escalatorsCountText.textContent = '2 Escalators Running';
      el.slopeGradeText.textContent = 'Level Boarding';
      el.routeSafetyBadge.innerHTML = `<i class="fa-solid fa-train"></i> Transit Accessible`;
    } else {
      el.accessibilityDetailsBox.classList.add('hidden');
      el.routeSafetyBadge.innerHTML = `<i class="fa-solid fa-check"></i> Optimized Route`;
    }

    // Live Rally Alert Banner
    if (route.rallyConflict) {
      el.liveAlertBanner.classList.remove('hidden');
      el.liveAlertTitle.textContent = '⚠️ Live Intelligence: Rally Diverted';
      el.liveAlertDesc.textContent = 'Route automatically detoured around public gathering zone. Wheelchair ramps and step-free access verified along alternate corridor.';
    } else {
      el.liveAlertBanner.classList.add('hidden');
    }

    // Steps list rendering
    renderStepsList(route.steps);
  }

  // Render Step-by-Step list
  function renderStepsList(steps) {
    el.stepsCount.textContent = steps.length;
    el.stepsListContainer.innerHTML = steps.map((s, idx) => `
      <div class="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
        <div class="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i class="fa-solid ${s.icon}"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-100">${s.instruction}</span>
            <span class="text-[10px] text-blue-400 font-semibold">${s.dist}</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">${s.accessibleNote || ''}</p>
        </div>
      </div>
    `).join('');
  }

  // ==================== TURN-BY-TURN NAVIGATION & SPEECH ====================

  function startTurnByTurnNavigation() {
    if (!state.activeRouteData || state.isNavigating) return;

    state.isNavigating = true;
    state.navStepIndex = 0;
    el.activeNavBanner.classList.remove('hidden');
    el.startNavigationBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> In Trip...`;

    // Confetti celebration
    if (window.confetti) {
      window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }

    const steps = state.activeRouteData.steps;
    const points = state.activeRouteData.points;

    // Place Nav Avatar Marker
    if (navAvatarMarker) map.removeLayer(navAvatarMarker);
    const modeConfig = MODES_CONFIG[state.activeMode];
    navAvatarMarker = L.marker(points[0], {
      icon: createSvgIcon(modeConfig.icon, modeConfig.color, 'You', true)
    }).addTo(map);

    speakGuidance(`Starting trip in ${modeConfig.name} mode. ${steps[0].instruction}`);

    // Update banner UI
    updateNavBanner(steps[0], state.activeRouteData.timeMin, state.activeRouteData.distanceKm);

    // Simulate movement along points
    let pointIdx = 0;
    state.navInterval = setInterval(() => {
      pointIdx++;
      if (pointIdx < points.length) {
        navAvatarMarker.setLatLng(points[pointIdx]);
        map.panTo(points[pointIdx], { animate: true, duration: 0.8 });

        const stepProgress = Math.min(steps.length - 1, Math.floor((pointIdx / points.length) * steps.length));
        if (stepProgress !== state.navStepIndex) {
          state.navStepIndex = stepProgress;
          const currentStep = steps[state.navStepIndex];
          updateNavBanner(currentStep, Math.max(1, state.activeRouteData.timeMin - pointIdx * 2), `${((points.length - pointIdx) * 0.2).toFixed(1)} km`);
          speakGuidance(currentStep.instruction);
        }
      } else {
        // Destination arrived!
        stopTurnByTurnNavigation();
        speakGuidance('You have arrived at your destination! Step-free entrance is right ahead.');
        showToast('🎉 You have arrived at your destination!', 'success');
        if (window.confetti) {
          window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }
      }
    }, 2800);
  }

  function updateNavBanner(step, eta, dist) {
    el.navStreetInstruction.textContent = step.instruction;
    el.navNextInstruction.textContent = `In ${step.dist}`;
    el.navRemainingEta.textContent = `${eta} min`;
    el.navRemainingDist.textContent = `${dist} left`;
    el.navDirectionIcon.className = `fa-solid ${step.icon}`;
  }

  function stopTurnByTurnNavigation() {
    state.isNavigating = false;
    clearInterval(state.navInterval);
    el.activeNavBanner.classList.add('hidden');
    el.startNavigationBtn.innerHTML = `<i class="fa-solid fa-location-arrow"></i> <span>Start Trip</span>`;
    if (navAvatarMarker) {
      map.removeLayer(navAvatarMarker);
      navAvatarMarker = null;
    }
  }

  // Web Speech API Voice Guidance
  function speakGuidance(text) {
    if (!state.isVoiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  }

  // ==================== CROWDSOURCED HAZARD REPORTING ====================

  function openReportModal(lat = null, lng = null) {
    if (lat && lng) {
      state.reportingPinCoords = [lat, lng];
      el.reportLocationText.value = `Selected Map Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } else if (state.startCoords) {
      state.reportingPinCoords = [
        state.startCoords[0] + 0.001,
        state.startCoords[1] + 0.001
      ];
      el.reportLocationText.value = `Near ${state.startName}`;
    }
    el.reportModal.showModal();
  }

  function submitHazardReport() {
    const desc = el.reportDescText.value.trim() || 'Road obstacle reported by community.';
    const severityInput = document.querySelector('input[name="severity"]:checked');
    const severity = severityInput ? severityInput.value : 'medium';

    if (!state.reportingPinCoords) {
      state.reportingPinCoords = map.getCenter();
    }

    const newHazard = {
      id: 'hz-' + Date.now(),
      city: state.currentCity,
      type: state.selectedHazardType,
      lat: state.reportingPinCoords.lat || state.reportingPinCoords[0],
      lng: state.reportingPinCoords.lng || state.reportingPinCoords[1],
      desc: desc,
      severity: severity,
      verifiedCount: 1,
      timestamp: 'Just now'
    };

    // Add to city data
    const city = CITY_PRESETS[state.currentCity];
    if (city) {
      city.hazards.push(newHazard);
    }

    // Save to storage
    saveCustomHazard(newHazard);

    // Render marker
    renderHazardMarker(newHazard);
    updateIncidentCounter();

    // Close modal
    el.reportModal.close();
    el.reportDescText.value = '';

    showToast(`✅ Reported ${newHazard.type.replace('_', ' ').toUpperCase()} published to live map!`, 'success');
    speakGuidance('Hazard report published. Other users and wheelchair routes are now alerted.');

    // Recalculate route if obstacle is near route
    calculateAndRenderRoute();
  }

  // Upvote / Verify hazard
  window.upvoteHazard = function (hazardId) {
    const city = CITY_PRESETS[state.currentCity];
    if (!city || !city.hazards) return;
    const hz = city.hazards.find(h => h.id === hazardId);
    if (hz) {
      hz.verifiedCount = (hz.verifiedCount || 1) + 1;
      showToast(`👍 Verification counted! Hazard verified by ${hz.verifiedCount} users.`, 'info');
      renderCityOverlays(city);
    }
  };

  // ==================== 6 MODES COMPARISON MODAL ====================

  function openCompareModal() {
    if (!state.startCoords || !state.destCoords) return;

    el.compareGridContainer.innerHTML = '';
    const modes = Object.keys(MODES_CONFIG);

    modes.forEach(modeKey => {
      const mode = MODES_CONFIG[modeKey];
      const route = buildRouteGeometry(state.startCoords, state.destCoords, modeKey);
      const isCurrent = modeKey === state.activeMode;

      const card = document.createElement('div');
      card.className = `p-4 rounded-xl border flex flex-col justify-between transition-all ${
        isCurrent 
          ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/40' 
          : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
      }`;

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="flex items-center gap-2 font-bold text-sm" style="color: ${mode.color}">
              <i class="fa-solid ${mode.icon}"></i> ${mode.name}
            </span>
            ${isCurrent ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">Active</span>' : ''}
          </div>

          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-2xl font-extrabold text-white">${route.timeMin} min</span>
            <span class="text-xs text-slate-400">${route.distanceKm} km</span>
          </div>

          <p class="text-xs text-slate-300 mb-3">${mode.description}</p>

          <div class="space-y-1.5 text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
            <div class="flex justify-between">
              <span class="text-slate-400">Accessibility:</span>
              <span class="font-bold text-emerald-400">${mode.accessibleRating}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Calories / Energy:</span>
              <span class="text-slate-200">${Math.round(mode.caloriePerKm * route.distanceKm)} kcal</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Live Hazard Status:</span>
              <span class="text-amber-400 font-semibold">${route.rallyConflict ? 'Rally Detour Applied' : 'Clear Path'}</span>
            </div>
          </div>
        </div>

        <button onclick="window.selectModeFromModal('${modeKey}')" class="w-full py-2 rounded-xl text-xs font-bold transition-all ${
          isCurrent 
            ? 'bg-emerald-600 text-white' 
            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
        }">
          ${isCurrent ? 'Current Mode' : 'Switch to This Mode'}
        </button>
      `;

      el.compareGridContainer.appendChild(card);
    });

    el.compareModal.showModal();
  }

  window.selectModeFromModal = function (modeKey) {
    setActiveMode(modeKey);
    el.compareModal.close();
  };

  // ==================== REAL-TIME LIVE SIMULATION ====================

  function startLiveFeedSimulation() {
    // Periodically simulate dynamic traffic changes, movement of rallies, or new crowdsourced alerts
    setInterval(() => {
      if (!state.isSimulatingLive) return;

      const events = [
        { msg: '🚗 Live Traffic Update: Congestion cleared on Outer Ring Road.', type: 'info' },
        { msg: '♿ Telemetry Verified: Metro Elevator Gate 2 fully operational.', type: 'success' },
        { msg: '⚠️ Live Crowdsource: New Pothole reported near Hospital Crosswalk.', type: 'warning' },
        { msg: '📢 Rally Monitoring: Procession moving eastward, safety perimeter updated.', type: 'info' }
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      showToast(randomEvent.msg, randomEvent.type);

      // Refresh route traffic delay subtly
      if (state.activeRouteData && (state.activeMode === 'driving' || state.activeMode === 'transit')) {
        calculateAndRenderRoute();
      }
    }, 14000);
  }

  // ==================== EVENT LISTENERS & UI HELPERS ====================

  function setupEventListeners() {
    // City Selector
    el.citySelect.addEventListener('change', (e) => {
      if (e.target.value !== 'custom') {
        setCity(e.target.value);
      } else {
        showToast('📍 Custom Mode: Click anywhere on map to set Start and Destination!', 'info');
      }
    });

    // Basemap Style Switcher
    el.tileStyleSelect.addEventListener('change', (e) => {
      const style = e.target.value;
      if (tileLayers[style]) {
        map.removeLayer(currentTileLayer);
        currentTileLayer = tileLayers[style];
        map.addLayer(currentTileLayer);
      }
    });

    // Mode Chips Click
    el.modesContainer.querySelectorAll('.mode-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        setActiveMode(mode);
      });
    });

    // Recalculate Button
    el.recalcRouteBtn.addEventListener('click', () => {
      calculateAndRenderRoute();
      showToast('🔄 Route updated with latest live telemetry!', 'info');
    });

    // Swap Origin & Destination
    el.swapPointsBtn.addEventListener('click', () => {
      const tempCoords = state.startCoords;
      state.startCoords = state.destCoords;
      state.destCoords = tempCoords;

      const tempName = state.startName;
      state.startName = state.destName;
      state.destName = tempName;

      el.startInput.value = state.startName;
      el.destInput.value = state.destName;

      calculateAndRenderRoute();
    });

    // Current Location Geolocation Button
    el.currentLocBtn.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            state.startCoords = [pos.coords.latitude, pos.coords.longitude];
            state.startName = 'My Current GPS Location';
            el.startInput.value = state.startName;
            map.flyTo(state.startCoords, 16);
            calculateAndRenderRoute();
            showToast('📍 GPS Location detected!', 'success');
          },
          (err) => {
            showToast('⚠️ Could not access GPS. Using preset center point.', 'warning');
          }
        );
      }
    });

    // Toggle Steps Drawer
    el.toggleStepsBtn.addEventListener('click', () => {
      const isHidden = el.stepsListContainer.classList.contains('hidden');
      if (isHidden) {
        el.stepsListContainer.classList.remove('hidden');
        el.stepsChevron.classList.add('rotate-180');
      } else {
        el.stepsListContainer.classList.add('hidden');
        el.stepsChevron.classList.remove('rotate-180');
      }
    });

    // Start / Stop Navigation Trip
    el.startNavigationBtn.addEventListener('click', () => {
      if (state.isNavigating) {
        stopTurnByTurnNavigation();
      } else {
        startTurnByTurnNavigation();
      }
    });

    el.stopNavBtn.addEventListener('click', stopTurnByTurnNavigation);

    // Toggle Live Simulation Stream
    el.toggleSimulationBtn.addEventListener('click', () => {
      state.isSimulatingLive = !state.isSimulatingLive;
      if (state.isSimulatingLive) {
        el.simStatusText.textContent = 'ACTIVE';
        el.toggleSimulationBtn.className = 'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-all shadow-sm';
        showToast('🟢 Live Stream Resumed: Telemetry feed active.', 'success');
      } else {
        el.simStatusText.textContent = 'PAUSED';
        el.toggleSimulationBtn.className = 'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750 transition-all';
        showToast('⏸️ Live Stream Paused.', 'info');
      }
    });

    // Compare 6 Modes Modal
    el.openCompareBtn.addEventListener('click', openCompareModal);
    el.closeCompareModalBtn.addEventListener('click', () => el.compareModal.close());

    // High Contrast Accessibility Mode (WCAG AAA)
    el.toggleContrastBtn.addEventListener('click', () => {
      state.isHighContrast = !state.isHighContrast;
      if (state.isHighContrast) {
        document.body.classList.add('high-contrast');
        showToast('👁️ High Contrast WCAG AAA mode enabled!', 'info');
      } else {
        document.body.classList.remove('high-contrast');
        showToast('Normal contrast restored.', 'info');
      }
    });

    // Voice Guidance Audio Toggle
    el.toggleVoiceBtn.addEventListener('click', () => {
      state.isVoiceEnabled = !state.isVoiceEnabled;
      if (state.isVoiceEnabled) {
        el.voiceIcon.className = 'fa-solid fa-volume-high text-emerald-400';
        showToast('🔊 Turn-by-turn Voice Guidance ENABLED.', 'success');
        speakGuidance('Voice guidance enabled.');
      } else {
        el.voiceIcon.className = 'fa-solid fa-volume-xmark text-slate-500';
        showToast('🔇 Voice Guidance MUTED.', 'info');
      }
    });

    // Report Hazard Modal Open / Close
    el.openReportModalBtn.addEventListener('click', () => openReportModal());
    el.closeReportModalBtn.addEventListener('click', () => el.reportModal.close());
    el.cancelReportBtn.addEventListener('click', () => el.reportModal.close());
    el.submitReportBtn.addEventListener('click', submitHazardReport);

    // Hazard type selector buttons in modal
    el.hazardTypeGrid.querySelectorAll('.hazard-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.hazardTypeGrid.querySelectorAll('.hazard-type-btn').forEach(b => b.classList.remove('active', 'border-blue-500', 'bg-blue-500/20'));
        btn.classList.add('active', 'border-blue-500', 'bg-blue-500/20');
        state.selectedHazardType = btn.getAttribute('data-type');
      });
    });

    // Map Overlays Checkboxes
    el.layerTraffic.addEventListener('change', (e) => {
      state.overlays.traffic = e.target.checked;
      if (e.target.checked) map.addLayer(trafficLayer);
      else map.removeLayer(trafficLayer);
    });

    el.layerRallies.addEventListener('change', (e) => {
      state.overlays.rallies = e.target.checked;
      if (e.target.checked) map.addLayer(ralliesLayer);
      else map.removeLayer(ralliesLayer);
    });

    el.layerRamps.addEventListener('change', (e) => {
      state.overlays.ramps = e.target.checked;
      if (e.target.checked) map.addLayer(rampsLayer);
      else map.removeLayer(rampsLayer);
    });

    el.layerHazards.addEventListener('change', (e) => {
      state.overlays.hazards = e.target.checked;
      if (e.target.checked) map.addLayer(hazardsLayer);
      else map.removeLayer(hazardsLayer);
    });
  }

  // Switch Active Mode
  function setActiveMode(modeKey) {
    if (!MODES_CONFIG[modeKey]) return;
    state.activeMode = modeKey;

    // Update active class on chips
    el.modesContainer.querySelectorAll('.mode-chip').forEach(chip => {
      if (chip.getAttribute('data-mode') === modeKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    calculateAndRenderRoute();
    showToast(`⚡ Switched to ${MODES_CONFIG[modeKey].name}`, 'info');
    speakGuidance(`Mode changed to ${MODES_CONFIG[modeKey].name}`);
  }

  // Map Click Handler
  let isSelectingPinForReport = false;
  function onMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (isSelectingPinForReport) {
      isSelectingPinForReport = false;
      openReportModal(lat, lng);
      return;
    }

    // If destination not set or Alt key pressed, set destination
    if (e.originalEvent.altKey || !state.destCoords) {
      state.destCoords = [lat, lng];
      state.destName = `Pinned Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      el.destInput.value = state.destName;
      showToast('📍 Destination pinned on map!', 'info');
    } else {
      // Set Start or ask
      state.startCoords = [lat, lng];
      state.startName = `Pinned Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      el.startInput.value = state.startName;
      showToast('🟢 Starting location updated!', 'info');
    }

    calculateAndRenderRoute();
  }

  // "Select on Map" button inside report modal
  el.pinOnMapBtn.addEventListener('click', () => {
    isSelectingPinForReport = true;
    el.reportModal.close();
    showToast('👇 Click anywhere on the map to place the problem marker!', 'warning');
  });

  // Haversine Distance helper
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Floating Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'glass-panel px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs text-slate-100 border toast-enter pointer-events-auto max-w-sm';

    let icon = 'fa-info-circle text-blue-400';
    if (type === 'success') icon = 'fa-circle-check text-emerald-400';
    if (type === 'warning') icon = 'fa-triangle-exclamation text-amber-400';
    if (type === 'danger') icon = 'fa-circle-xmark text-red-400';

    toast.innerHTML = `
      <i class="fa-solid ${icon} text-sm"></i>
      <span class="flex-1 font-medium">${message}</span>
    `;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Kickstart on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
