# TEST PLAN & QA SUITE: ACCESSROUTE LIVE™

## 1. Automated Test Matrix

| Test Suite | Scope | Target Behavior | Expected Result |
|---|---|---|---|
| **T01: Wheelchair Step-Free Routing** | Routing Engine | Origin -> Dest with active stairs penalty | Route Result contains `stairs_count: 0`, `is_step_free: true`, ramps utilized, score >= 90 |
| **T02: Incline & Slope Guardrail** | Scoring Engine | Route segment exceeds 5.0% gradient | Wheelchair score penalized; Pram/Elderly score penalized; Warning tag displayed |
| **T03: Visually Impaired Tactile Path** | Routing Engine | Vision mode selected | Route prioritizes tactile-paved pathways and assigns acoustic cue milestones |
| **T04: Crowdsourced Barrier Ingestion** | REST API (`/reports`) | Post broken elevator / ramp report | Marker created with status `UNVERIFIED`; immediate spatial broadcast |
| **T05: Social Verification & Freshness** | Verification Engine | 3 Upvotes posted to report within 2h | Status transitions `UNVERIFIED -> CONFIRMED`, confidence rating set to `HIGH` |
| **T06: In-Trip Collision & Detour Recalc** | Navigation Engine | Barrier detected within 300m of active GPS | `ObstacleAlertModal` triggers; 1-click recalculate bypasses obstacle (+3 min detour) |
| **T07: Civic Gathering Avoidance** | GIS Engine | Rally polygon active on Jantar Mantar Rd | Routing engine avoids intersection and generates peripheral detour corridor |
| **T08: WCAG AAA High-Contrast Toggle** | UI/UX Accessibility | High contrast switch clicked | 100% black background, 19.5:1 yellow typography, high-visibility borders |
| **T09: Screen Reader Table Generation** | ARIA Accessibility | Screen reader modal opened | Semantic HTML `<table>` renders distance, ETA, ramps, stairs, confidence, and maneuvers |
| **T10: Offline / Resilient Fallback** | Frontend Service | Backend disconnected | Seamless fallback to client-side GIS math without crashing |

---

## 2. Backend Automated Test Runner Script
Automated test suite implemented in `tests/test_backend.py` using Python standard library `unittest` and `FastAPI TestClient`.
