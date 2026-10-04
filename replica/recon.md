# RECON MAP: ACCESSROUTE LIVE (PS10 — Accessible Community Route Planner)

## 1. Scope & Core Product Loop
- **Product Name**: AccessRoute Live™
- **Target Audience**: 
  1. Wheelchair & Mobility Aid users (manual/power chairs, mobility scooters)
  2. Visually Impaired & Blind pedestrians
  3. Parents with Prams / Strollers & Elderly with Walkers
  4. Pedestrians & Commuters in challenging urban environments
  5. Micromobility users (Bicycles, Two-Wheelers / E-Scooters)
  6. Event Organizers & Crowd Coordinators (Rallies, Marathons, Processions)
- **Core Loop**:
  `Search Destination` -> `Select Mobility Profile & Constraints` -> `Calculate & Compare Multi-Route Alternatives with Accessibility Scoring` -> `Inspect Verified Infrastructure (Ramps, Kerbs, Lifts, Tactile Paving)` -> `Start Turn-by-Turn Navigation with Voice Guidance & Realtime Obstacle Detection` -> `Report/Verify Community Barriers (Freshness & Confidence)` -> `Dynamic Rerouting`.

---

## 2. Sources & Research Baseline
| Source | Key Findings / Extracted Capabilities |
|---|---|
| **PS10 Problem Statement** | 6 mobility modes, barrier analysis, accessibility scoring formula, freshness & decay, confidence metrics, event routes, community reporting & verification. |
| **OpenStreetMap GIS Accessibility Schema** | `wheelchair=yes/limited/no`, `kerb=lowered/raised/flush`, `highway=steps`, `ramp=yes/separate`, `tactile_paving=yes`, `incline=%`, `surface=asphalt/paving_stones/gravel`. |
| **Google Maps / Apple Maps Navigation UX** | Floating search card, destination summary sheet, transport mode switcher, polyline rendering, turn-by-turn HUD, speech synthesis, live traffic overlay. |
| **Disability Community & Review Mining** | Frustrations with "phantom elevators", "1-step traps", steep hills (>5% gradient), outdated construction reports, silent fallback to stairs. |

---

## 3. Screen Inventory

| ID | Screen Name | Route / Modal Trigger | Purpose | Key Components | States Supported |
|---|---|---|---|---|---|
| **S01** | **Map Exploration (Home)** | `/` | Immediate GIS map interface with interactive controls and floating overlay | Leaflet Map, Floating Search Bar, Mobility Quick-Select, Layer Toggles, Recenter Button, High Contrast Switch | Default, Layer Active, Geo-located, Offline |
| **S02** | **Place Search & Autocomplete** | Top Floating Input | Search addresses, landmarks, recent destinations | Search Input, Autocomplete Dropdown, Category Badges (Transit, Hospital, Library), Recent Searches | Empty, Typing, Results, Not Found |
| **S03** | **Destination Place Sheet** | Select search result or click map | Overview of target place and its verified accessibility score | Place Name, Address, Accessibility Badges (Ramp, Lift, Tactile, Entrance), "Get Directions" CTA | Loading, Verified Accessible, Limited Info, Reported Obstacle |
| **S04** | **Directions & Mobility Profile Selector** | Directions Trigger | Configure Origin/Destination and select one of 6 Mobility Profiles | Origin/Destination Inputs, 6 Mode Pills (Walking, Wheelchair, Vision, Bike, Scooter, Pram/Elderly), Preference Accordion | Profile Selected, Custom Constraints Active |
| **S05** | **Route Alternatives & Scoring Panel** | Post route calculation | Compare Recommended vs Alternative routes based on Accessibility Score & Tradeoffs | Route Cards (Recommended / Fastest / Scenic), Step-Free Assurance, Ramp/Stair Counts, Slope Gradient, Confidence Rating, "Start Navigation" CTA | Calculating, Multi-Routes, No Accessible Route Warning |
| **S06** | **Live Turn-by-Turn Navigation HUD** | Click "Start Navigation" | Full-screen guidance with real-time location telemetry and voice cues | Top Banner (Next maneuver, distance, street), Bottom HUD (ETA, remaining km, step-free badge, speed), Voice Mute, Cancel Nav | Active, Recalculating, Obstacle Detected Ahead, Arrived |
| **S07** | **Community Hazard Reporting Modal** | Floating "+ Report" or Long-press map | Submit real-world barriers (Potholes, Broken Lifts, Barricades, Waterlogging) | Category Selector, Location Pin, Severity, Description, Photo URL, Expiry Estimate, Submit Button | Form Idle, Pin Drop, Submitting, Success Toast |
| **S08** | **Community Barrier Verification Sheet** | Click barrier marker | Community voting (Confirm / Reject / Resolve) and Freshness Telemetry | Barrier Title, Reporter Reliability, Confirmation Count, Freshness Tag (e.g. "Confirmed 12m ago"), Upvote/Downvote CTAs | High Confidence, Medium, Low/Stale, Expired |
| **S09** | **Live Event & Crowd Reroute Layer** | Layer toggle: Events | Display civic rallies, marathons, or construction zones with detour paths | Pulsing Danger Polygons, Crowd Density meter, Detour Corridor lines, Active Event Details Card | Active Rally, Event Bypassed |
| **S10** | **High Contrast & Accessible Settings** | Top Header toggle | WCAG AAA contrast theme, large fonts, screen-reader table view | Palette Switcher, Font Size adjuster, Voice Pitch/Rate test, Raw Route Steps Table | Default, High Contrast Black/Yellow/Cyan |

---

## 4. User Flows

### F01: Wheelchair Step-Free Route Planning & Execution (Happy Path)
1. User opens AccessRoute Live (S01).
2. User types "City Central Library" in floating search (S02).
3. Selects library; Destination Sheet appears showing "✓ Accessible Entrance & Ramp" (S03).
4. Clicks "Directions" and chooses **Wheelchair / Mobility Aid** (S04).
5. System computes topological path avoiding stairs, max incline <5%, utilizing 3 verified ramps.
6. Route Alternatives displayed: **Recommended (18 min, 1.2 km, 0 stairs, 3 ramps, 100% Step-Free, HIGH CONFIDENCE)** vs **Fastest (12 min, 0.9 km, ⚠ 2 Stairs)** (S05).
7. User clicks **"Start Navigation"** (S06); speech synthesis announces: *"Starting wheelchair navigation. Head north on Library Lane for 150 meters."*

### F02: Dynamic In-Trip Obstacle Detection & Rerouting
1. While navigating on Route A, a user reports a "Broken Ramp / Construction" along the active path (S07).
2. System triggers an in-trip audio alert & modal: *"Accessibility Alert: Obstacle reported 300m ahead. Detour available (+3 min)."*
3. User confirms "Take Detour"; route polyline instantly recalculates around the barrier via an adjacent ramp corridor (S06).

### F03: Community Hazard Reporting & Multi-User Verification
1. Pedestrian encounters an out-of-order metro elevator.
2. Taps "+ Report Barrier", selects category "Broken Elevator", adds note "Station Lift 2 Under Maintenance", and submits (S07).
3. Marker is created with status `UNVERIFIED` (Confidence: Low).
4. Subsequent commuters view the marker and click "Confirm" (S08).
5. After 3 confirmations within 2 hours, status upgrades to `CONFIRMED` (Confidence: High) and active routing engines penalize this junction.

---

## 5. UI Component Inventory
1. `MapContainer` (Leaflet GIS canvas, tile layer switcher, marker clustering, polyline overlays)
2. `FloatingSearch` (Geocoding search input, search history, quick filters)
3. `MobilityModeSelector` (6-mode interactive pill bar with icon badges & active states)
4. `RouteComparisonSheet` (Multi-route cards, penalty tags, confidence pills, trade-off explanations)
5. `NavigationHUD` (Top instruction banner, bottom telemetry bar, simulated GPS progression controller)
6. `BarrierMarker` (Category-specific SVG markers with color-coded confidence halos)
7. `ReportModal` (Form for obstacle classification, geo-pinning, severity selector)
8. `VerificationDrawer` (Social proof tally, timestamp freshness tracker, vote actions)
9. `EventPulsingPolygon` (Animated SVG geo-zones for active rallies, marathons, protests)
10. `AccessibilityStatsHUD` (Realtime count of ramps, lifts, slope gradient meter, step-free indicator)
11. `AudioGuidanceController` (Web Speech API synthesizer with pause/resume/mute states)

---

## 6. Inferred Data Model Summary
- `Place`: id, name, category, address, lat, lng, accessibility_attributes (ramp, lift, entrance, tactile)
- `MobilityProfile`: id, code (walking, wheelchair, vision, bicycle, scooter, pram_elderly), max_slope, avoid_stairs, prefer_ramps, prefer_tactile, hazard_sensitivity
- `RouteRequest`: origin (lat, lng), destination (lat, lng), profile_code, preferences
- `RouteResult`: id, profile, distance_meters, duration_seconds, accessibility_score, confidence_score, steps, polylines, ramps_count, stairs_count, max_incline_percent, step_free
- `CommunityReport`: id, category, lat, lng, title, description, severity, status (UNVERIFIED, CONFIRMED, STALE, EXPIRED, RESOLVED), upvotes, downvotes, confidence_level, created_at, expires_at
- `EventZone`: id, title, type (rally, marathon, construction), polygon_geojson, risk_level, crowd_density, detour_suggestion

---

## 7. Scope Boundary & Sizing
- **What is In Scope**: 
  - Complete React + Vite + Tailwind + Leaflet GIS maps application.
  - 6 distinct mobility profiles with specific weight constraints.
  - Multi-alternative accessibility route generation and mathematical scoring.
  - Step-free assurance telemetry HUD (ramps, stairs, slope %, elevator status).
  - Community crowdsourced obstacle reporting + real-time verification upvoting + freshness decay.
  - In-trip obstacle detection alert and dynamic rerouting.
  - Web Speech API turn-by-turn voice prompts.
  - Live Event/Rally zone avoidance polygons.
  - WCAG AAA high contrast mode & keyboard navigation.
  - FastAPI backend endpoints with PostGIS/spatial models, seed data generator, and geocoding adapter.
- **Estimated Size**: Medium (Fully working end-to-end production application).
