# SYSTEM ARCHITECTURE: ACCESSROUTE LIVE

## 1. System Overview & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ACCESSROUTE LIVE™                             │
│                     Full-Stack Architecture Plan                       │
└────────────────────────────────────────────────────────────────────────┘

 [FRONTEND: React + TypeScript + Vite + Tailwind CSS + Leaflet GIS]
     │
     ├── Map Viewport (Leaflet Tile Layers, Polyline Overlays, Custom Markers)
     ├── Floating Navigation Controller (Search, Directions, 6 Mobility Modes)
     ├── Route Alternatives Sheet (Scoring HUD, Step-Free Metrics, Confidence)
     ├── Turn-by-Turn Navigation HUD (Simulated GPS / Web Speech Synthesis)
     ├── Community Hazard Reporting & Social Verification Drawer
     └── WCAG AAA High Contrast & Screen Reader Accessibility Layer
     │
     ▼ (REST APIs / WebSocket)
 [BACKEND: FastAPI (Python) + Pydantic v2 + NetworkX / GIS Engine]
     │
     ├── /api/routes            -> Multi-Alternative Accessibility Routing & Scoring Engine
     ├── /api/reports           -> Hazard Reporting, Voting (Confirm/Reject), Freshness Decay
     ├── /api/places            -> Verified Accessible Places & POI Geocoding Adapter
     ├── /api/events            -> Rally & Crowd Zone Polygons with Detour Corridors
     └── /api/navigation/reroute -> In-Trip Barrier Collision Detection & Reroute Solver
     │
     ▼ (PostGIS Spatial Queries / Supabase)
 [DATABASE: PostgreSQL + PostGIS (GeoJSON Points, Linestrings, Polygons)]
     ├── places (id, name, location [POINT], accessibility_json)
     ├── map_features (id, type [RAMP, STAIRS, LIFT, KERB], geom [POINT/LINESTRING], status)
     ├── community_reports (id, geom [POINT], category, severity, status, freshness_ts)
     ├── report_votes (id, report_id, user_id, vote_type, created_at)
     └── event_zones (id, title, geom [POLYGON], risk_level, detour_geojson)
```

---

## 2. Accessibility Route Scoring Engine & Mathematical Formulation

AccessRoute Live rejects standard shortest-distance algorithms for mobility-sensitive journeys. Instead, routes are generated across candidate graph paths and evaluated using a weighted multi-parameter penalty function:

$$\text{Route Score} = (\text{Duration} \times W_{\text{time}}) + (\text{Distance} \times W_{\text{dist}}) + P_{\text{stairs}} + P_{\text{slope}} + P_{\text{barrier}} + P_{\text{surface}} - B_{\text{ramp}} - B_{\text{tactile}}$$

### Profile Weight Table

| Profile | Avoid Stairs ($P_{\text{stairs}}$) | Max Slope Threshold | Prefer Ramps ($B_{\text{ramp}}$) | Prefer Tactile ($B_{\text{tactile}}$) | Hazard Sensitivity ($P_{\text{barrier}}$) |
|---|---|---|---|---|---|
| **🚶 Walking** | Low (0.1x) | 12% | Neutral | Low | Medium |
| **🦽 Wheelchair / Mobility Aid** | **HARD PROHIBIT (∞ / 9999)** | **5% Strict** | **High (-50 pts)** | Neutral | **Maximum (100 pts)** |
| **👁️ Visually Impaired** | Medium (1.5x) | 8% | Medium | **High (-60 pts)** | **Maximum (100 pts)** |
| **🚲 Bicycle** | High (5.0x) | 8% | Neutral | Neutral | Medium |
| **🛵 Two-Wheeler / Scooter** | Hard Prohibit (∞) | 15% | Neutral | Neutral | High |
| **👶 Pram / Elderly Walker** | **Hard Prohibit (∞)** | **6% Strict** | **High (-40 pts)** | Low | High |

---

## 3. Data Freshness & Confidence Metric Calculation

Every community report and accessibility feature carries a dynamic **Confidence Level**:

$$\text{Confidence Score} = C_{\text{base}} \times \left(1 + \frac{\text{Confirmations} - \text{Rejections}}{5}\right) \times e^{-\lambda \Delta t}$$

- **High Confidence ($\ge 80\%$)**: Confirmed by $\ge 3$ users within the last 2 hours; active in routing graph.
- **Medium Confidence ($50\% - 79\%$)**: Reported or confirmed within 6 hours with 1-2 positive confirmations.
- **Low / Stale ($20\% - 49\%$)**: Older than 12 hours without re-confirmation; triggers verification prompt on map.
- **Expired ($< 20\%$)**: Automatically archived from active path blocking.

---

## 4. Provider Adapter Architecture
To ensure zero vendor lock-in, all external geospatial services are wrapped in modular Python/TypeScript adapters:
1. `GeocodingProvider`: OpenStreetMap Nominatim / Pelias / Mock Pilot Geocoder.
2. `RoutingProvider`: OSRM Pedestrian / GraphHopper / AccessRoute Native Graph Engine.
3. `ElevationProvider`: Open-Elevation / SRTM / Local Topological DEM Mesh.
4. `RealtimeStreamProvider`: Supabase Realtime / WebSockets / Periodic Heartbeat Stream.
