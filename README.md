# 🚀 AccessRoute Live™ — Inclusive Real-Time Navigation & Accessibility GIS Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Geoapify](https://img.shields.io/badge/Geoapify-Location_Autocomplete-0052CC?logo=openstreetmap&logoColor=white)](https://www.geoapify.com)
[![WCAG AAA](https://img.shields.io/badge/WCAG-2.2_AAA_Compliant-success)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **AccessRoute Live™** is an AI-powered, multi-modal navigation platform engineered specifically for **persons with disabilities, wheelchair users, visually impaired pedestrians, elderly commuters, and parents with strollers**.

While standard map providers solely optimize for vehicular speed, AccessRoute Live prioritizes **step-free accessible corridors, verified ADA ramps, operational station elevators, tactile guiding paths, and live community-verified hazard intelligence**.

---

## 📸 System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          Browser Geolocation API             │
                  │    (High-accuracy proximity bias)            │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       React 19 + TypeScript Frontend         │
                  │   - Floating Search Bar with Autocomplete    │
                  │   - Leaflet GIS Interactive Canvas           │
                  │   - 6 Mobility Profile Route Selector        │
                  │   - Live Turn-by-Turn Audio Navigation HUD   │
                  │   - WCAG AAA High Contrast Theme             │
                  └──────────────────────┬───────────────────────┘
                                         │ REST API
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          FastAPI Spatial Backend             │
                  │  /api/search/suggest   /api/routes           │
                  │  /api/places          /api/reports           │
                  │  /api/events          /api/search/access     │
                  └──────────────┬───────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
  ┌───────────────────────────────┐ ┌──────────────────────────────┐
  │  Geoapify Autocomplete Proxy │ │  AccessRoute GIS Database    │
  │  (Global Address & POI Search │ │  (Verified Ramps, Lifts,     │
  │   with Proximity Bias)        │ │   Hazards, Civic Rallies)    │
  └───────────────────────────────┘ └──────────────────────────────┘
```

---

## ✨ Key Features

1. **Intelligent Location Search & Address Autocomplete**:
   - Integrated with **Geoapify Address Autocomplete** via FastAPI proxy.
   - Non-blocking browser proximity bias without restricting global city search.
   - 300ms debounce, request cancellation (`AbortController`), duplicate prevention, and short-lived in-memory caching.
   - Local Haversine formula calculation for relative distances (e.g. `2.4 km away`).
   - 100% keyboard-accessible (`role="combobox"`, `role="listbox"`, `Arrow Up/Down`, `Enter`, `Escape`).

2. **6 Inclusive Mobility Profiles**:
   - 🦽 **Wheelchair / Mobility Aid**: 100% step-free corridors, slope incline $<5\%$, ramp & elevator priority.
   - 👁️ **Visually Impaired**: Tactile paving guidance, audio chime cues, hazard alerts.
   - 👶 **Pram / Elderly with Walker**: Low-gradient paths, avoidance of stairs and broken footpaths.
   - 🚶 **Walking**: Standard pedestrian sidewalks, crossings, and parks.
   - 🚲 **Bicycle**: Dedicated cycle lanes and low-traffic roadways.
   - 🛵 **Two-Wheeler / Scooter**: Fast transit corridors avoiding road hazards.

3. **Step-Free Assurance & Verified Infrastructure**:
   - Real-time telemetry on verified municipal ramps, operational elevators, and lowered kerbs.
   - Explicit verification status: displays verified attributes or transparently marks *"Accessibility information unavailable"* to never fabricate accessibility claims.

4. **Crowdsourced Hazard Intelligence**:
   - Report road obstacles, broken ramps, out-of-service lifts, potholes, or barricades with photo metadata and map pins.
   - Community social voting (Upvote/Confirm, Downvote, Mark Resolved) with confidence decay algorithms.

5. **Turn-by-Turn Voice Guidance & Dynamic Detour**:
   - Hands-free voice directions powered by Web Speech API (`speechSynthesis`).
   - Dynamic in-trip barrier detection with 1-click step-free detour recalculation (+3 min).

6. **Accessibility & WCAG 2.2 AAA Compliance**:
   - Ultra-high contrast mode (19.5:1 ratio) with dark canvas tiles.
   - Screen Reader Table View for blind commuters (NVDA / JAWS / VoiceOver compatible).

---

## 📦 Project Structure

```
technathon/
├── backend/                      # FastAPI Spatial Backend
│   ├── app/
│   │   ├── api/                  # REST API Routers
│   │   │   ├── search_router.py  # Geoapify proxy & accessibility lookup
│   │   │   ├── routes_router.py  # Accessible routing endpoints
│   │   │   ├── places_router.py  # Verified POIs endpoints
│   │   │   ├── reports_router.py # Community hazard reporting
│   │   │   └── events_router.py  # Live civic rallies & processions
│   │   ├── models/               # Pydantic v2 schemas
│   │   ├── schemas/              # Search & lookup schemas
│   │   ├── services/             # Scoring, routing & Geoapify providers
│   │   │   ├── search/           # Abstract SearchProvider & GeoapifySearchProvider
│   │   │   ├── routing_engine.py # Multi-route generator & penalty solver
│   │   │   └── scoring_engine.py # Mathematical accessibility score formula
│   │   └── main.py               # FastAPI App entrypoint & CORS
│   └── requirements.txt          # Python dependencies
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/              # MapView (Leaflet GIS) & MapControls
│   │   │   ├── Search/           # FloatingSearchBar with Autocomplete & Voice
│   │   │   ├── Directions/       # MobilityProfileSelector, PlaceDetailsCard, RouteResultsSheet
│   │   │   ├── Navigation/       # NavigationHUD & ObstacleAlertModal
│   │   │   ├── Crowdsourcing/    # ReportModal & VerificationDrawer
│   │   │   └── Accessibility/    # ScreenReaderTable
│   │   ├── services/             # api.ts (REST connectors + cache), speech.ts
│   │   ├── utils/                # geo.ts (Haversine formula & formatting)
│   │   ├── types/                # TypeScript interfaces
│   │   ├── App.tsx               # Master App State Manager
│   │   └── index.css             # Tailwind v4 & Leaflet CSS resets
│   ├── vite.config.ts            # Vite Configuration
│   └── package.json
├── tests/
│   ├── test_search.py            # Location search & accessibility lookup tests
│   └── test_backend.py           # Routing, scoring & hazard reporting tests
├── run_backend.py                # Standalone FastAPI launcher
├── server.js                     # Production Node.js server
├── .env.example                  # Environment template
└── README.md
```

---

## 🛠️ Prerequisites

Before getting started, ensure you have the following installed:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **Python**: `3.10` or higher ([Download Python](https://www.python.org/))
- **Git**: ([Download Git](https://git-scm.com/))
- **Geoapify API Key**: Free tier API key from [Geoapify MyProjects](https://myprojects.geoapify.com/)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sabho08/comhelp.git
cd comhelp
```

### 2. Configure Environment Variables

Copy the example environment file and set your `GEOAPIFY_API_KEY`:

```bash
cp .env.example .env
```

Edit `.env`:
```ini
GEOAPIFY_API_KEY=your_geoapify_api_key_here
PORT=8000
VITE_API_URL=http://localhost:8000/api
```

> **Note**: The `.env` file is excluded from Git tracking to ensure credentials are never exposed.

---

### 3. Setup and Run the Backend

Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the FastAPI backend server:

```bash
python run_backend.py
```

*Alternatively, using uvicorn directly:*
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend URL**: `http://127.0.0.1:8000`
- **Interactive OpenAPI / Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

---

### 4. Setup and Run the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

- **Frontend URL**: `http://localhost:5173/`

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests (11 Tests)

```bash
python -m unittest discover tests
```

*Tests include:*
- Search Autocomplete with proximity bias & 2-char minimum rule
- Post-selection accessibility database lookup
- Wheelchair step-free mathematical scoring & stair penalties
- Multi-route alternative generation
- Crowdsourced hazard reporting and verification voting

### Frontend TypeScript & Bundle Verification

```bash
cd frontend
npm run build
```

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/search/suggest` | Location search autocomplete with proximity bias | `text` (min 2 chars), `lat`, `lon`, `limit` (max 8) |
| `GET` | `/api/search/accessibility` | Query verified municipal & community accessibility data | `lat`, `lon`, `name` |
| `GET` | `/api/places` | List verified accessible places | `query`, `city` |
| `POST` | `/api/routes` | Compute multi-route alternatives with accessibility scores | `origin`, `destination`, `profile`, `preferences` |
| `POST` | `/api/routes/reroute` | Dynamic in-trip barrier detour recalculation | `current_location`, `destination`, `profile` |
| `GET` | `/api/reports` | Fetch active crowdsourced hazards & barriers | `lat`, `lng` |
| `POST` | `/api/reports` | Submit community obstacle report | `category`, `title`, `description`, `severity`, `lat`, `lng` |
| `POST` | `/api/reports/{id}/vote`| Upvote, downvote, or resolve a hazard report | `vote_type` (`upvote`, `downvote`, `resolve`) |
| `GET` | `/api/events` | Fetch active civic rallies and danger zones | None |
| `GET` | `/api/health` | Service health status and supported mobility modes | None |

---

## ♿ Accessibility Standards

- **WCAG 2.2 AA / AAA Compliant**: High contrast dark mode (19.5:1 contrast ratio) with large clickable touch targets ($>44\text{px}$).
- **Keyboard Operable**: Full keyboard accessibility on all search, direction, and modal interfaces (`Tab`, `ArrowUp`, `ArrowDown`, `Enter`, `Escape`).
- **Screen Reader Friendly**: Descriptive ARIA labels, live regions, and semantic tabular directions for assistive technologies.

---

## 📄 License

This project is licensed under the MIT License.
