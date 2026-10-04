# ENTREPRENEUR & USER RESEARCH: ACCESSROUTE LIVE

## 1. Executive Summary & Market Problem
Standard navigation giants (Google Maps, Apple Maps, Waze) are built for automobiles and abled pedestrians with a singular objective: **minimize travel time**. For the 1.3+ billion people globally living with disabilities, as well as millions of parents with strollers and elderly citizens with walkers, "fastest" is often dangerous or completely impassable.

A route that saves 2 minutes by cutting through a 4-step staircase or a steep 12% incline is a dead-end for a power wheelchair user. A route that relies on a broken subway elevator leaves a commuter stranded.

AccessRoute Live redefines route optimization:
> **"Not just the fastest route, but the route you can actually use."**

---

## 2. Real User Complaints & Evidence (Verbatim & Community Mining)

### Pain Point 1: The "Phantom Elevator" Trap
- **User Quote (r/wheelchair)**: *"Google Maps told me the subway station was wheelchair accessible. I arrived at 10 PM in my heavy electric chair only to find the sole street elevator had an 'Out of Order' sign taped to it. I was stranded on the platform for 2 hours waiting for emergency transit."*
- **AccessRoute Live Solution**: Live crowd verification status (`OPERATIONAL`, `OUT_OF_SERVICE`, `UNVERIFIED`) with timestamps (e.g. *"Confirmed 14m ago by 4 commuters"*) and proactive warning before departure.

### Pain Point 2: The "Single Step" Nightmare
- **User Quote (Disability Rights Advocate / Urban Commuter)**: *"Able-bodied mappers think a single 4-inch curb or 2 steps is 'flat enough'. For a 150kg motorized chair, 2 steps is as impassable as the Berlin Wall. Maps need to distinguish true step-free routes from generic walking directions."*
- **AccessRoute Live Solution**: Hard Step-Free Assurance filter (`stairs_count == 0` constraint for wheelchair and pram modes) plus slope gradient calculation enforcing gentle inclines (<5%).

### Pain Point 3: Outdated Construction & Temporary Obstacles
- **User Quote (Parent with Twin Stroller / City Walker)**: *"Sidewalk repaving and utility digging pop up overnight. Walking apps don't register them for days. You push a double stroller half a mile down a narrow sidewalk only to hit a wooden barricade with no curb cut to cross the street."*
- **AccessRoute Live Solution**: Fast community hazard reporting (+1-click confirm/reject), confidence decay over time, and automatic in-trip rerouting alerts when new obstacles are reported along your active path.

### Pain Point 4: Visually Impaired Guidance Lacks Landmark Cues
- **User Quote (r/Blind Community Member)**: *"Turn-by-turn navigation that just says 'Head Northwest on 4th Ave' is useless if you are blind. We need tactile paving flags, audio-described crossings, and warnings about low-hanging construction scaffolding or open cellar grates."*
- **AccessRoute Live Solution**: Visually Impaired profile prioritizing tactile-paved pathways, audio announcements with explicit distance countdowns, and acoustic/vibration feedback triggers.

---

## 3. Competitive Comparison

| Dimension | Google Maps | Citymapper | AccessRoute Live™ |
|---|---|---|---|
| **Primary Metric** | Travel Time (Fastest) | Transit Schedule Optimization | **Personalized Accessibility Score** |
| **Mobility Profiles** | Generic Wheelchair (Transit only) | Step-free transit routes | **6 Dedicated Profiles** (Walking, Wheelchair, Vision, Bike, Scooter, Pram/Elderly) |
| **Step-Free Assurance** | Inconsistent / Transit-only | Partial station data | **100% Step-Free Route Verification with Ramp Telemetry** |
| **Obstacle Freshness** | Slow updates (weeks/months) | Transit agency feeds only | **Realtime Crowdsourced Verification with Expiration Decay** |
| **In-Trip Barrier Detour**| Traffic jams only | Line delays | **Dynamic Accessibility Recalculation around Obstacles** |
| **Live Rally / Event Layer**| General traffic delay | Line disruptions | **Pulsing Crowd Polygons with Auto-Bypass Corridors** |
| **Audio Guidance** | Standard Street Names | Generic prompts | **Accessibility-Enriched Speech Prompts (Ramps, Tactile, Kerbs)** |

---

## 4. Value Proposition & Positioning

### Positioning Statement
*"For people with mobility constraints, parents with strollers, and urban pedestrians who cannot afford unexpected physical barriers, AccessRoute Live is the community-verified navigation platform that guarantees step-free, low-gradient routes with real-time obstacle alerts—giving you the confidence to travel independently."*

### Key Differentiators
1. **Accessibility Score Engine**: Mathematical penalty model weighing stairs, ramps, slopes, and surface roughness.
2. **Confidence Metric**: Clear, honest labeling (`HIGH`, `MEDIUM`, `UNVERIFIED`) based on data freshness and multi-user verification.
3. **Dynamic In-Trip Detour**: Automatic obstacle detection and reroute generation while en route.
4. **Community-Powered Freshness**: 1-click obstacle reporting with automatic decay so temporary hazards don't clutter the map forever.
