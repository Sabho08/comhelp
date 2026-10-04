from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import uuid

# 1. Places & Search
class PlaceAccessibility(BaseModel):
    has_accessible_entrance: bool = True
    has_ramp: bool = True
    has_elevator: bool = True
    has_tactile_paving: bool = False
    elevator_status: Literal["operational", "out_of_service", "unknown"] = "operational"
    details: Optional[str] = None

class Place(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # transit, library, hospital, civic, shopping, park
    address: str
    latitude: float
    longitude: float
    city: str
    accessibility: PlaceAccessibility

# 2. Mobility Profile Types
MobilityProfileCode = Literal[
    "walking",
    "wheelchair",
    "vision",
    "bicycle",
    "scooter",
    "pram_elderly"
]

class RoutePreferences(BaseModel):
    avoid_stairs: bool = True
    max_slope: float = 5.0 # Max acceptable slope %
    prefer_ramps: bool = True
    prefer_tactile: bool = False
    require_step_free: bool = True
    hazard_sensitivity: float = 1.0

# 3. Routing Request & Results
class RouteRequest(BaseModel):
    origin: List[float] # [lat, lng]
    destination: List[float] # [lat, lng]
    profile: MobilityProfileCode = "wheelchair"
    preferences: Optional[RoutePreferences] = None
    origin_name: Optional[str] = "Current Location"
    destination_name: Optional[str] = "Destination"

class RouteStep(BaseModel):
    instruction: str
    maneuver: str # straight, turn-left, turn-right, ramp, elevator, crossing, arrive
    distance_meters: int
    duration_seconds: int
    street_name: str
    accessibility_note: Optional[str] = None
    hazard_alert: Optional[str] = None
    coordinates: List[List[float]] # [[lat, lng], ...]

class AccessibilityBreakdown(BaseModel):
    ramps_count: int
    stairs_count: int
    elevators_count: int
    max_slope_percent: float
    tactile_paved_pct: int
    step_free_guarantee: bool
    major_barriers_count: int
    confidence_level: Literal["HIGH", "MEDIUM", "LOW", "UNVERIFIED"]
    confidence_reasons: List[str]

class RouteResult(BaseModel):
    id: str
    title: str # "Recommended (Step-Free)", "Alternative via Park", "Fastest (Inaccessible)"
    is_recommended: bool
    is_step_free: bool
    duration_minutes: int
    distance_km: float
    duration_seconds: int
    distance_meters: int
    accessibility_score: float # 0 to 100
    accessibility_breakdown: AccessibilityBreakdown
    steps: List[RouteStep]
    coordinates: List[List[float]] # Full path polyline [[lat, lng], ...]
    color: str # Hex color for map rendering
    tradeoff_warning: Optional[str] = None

class MultiRouteResponse(BaseModel):
    origin: List[float]
    destination: List[float]
    profile: MobilityProfileCode
    routes: List[RouteResult]

# 4. Community Hazard Reports
ReportCategory = Literal[
    "broken_ramp",
    "broken_elevator",
    "stairs",
    "pothole",
    "barricade",
    "waterlogging",
    "construction",
    "blocked_footpath",
    "rally"
]

ReportStatus = Literal["UNVERIFIED", "CONFIRMED", "STALE", "EXPIRED", "RESOLVED"]

class CommunityReportCreate(BaseModel):
    category: ReportCategory
    title: str
    description: Optional[str] = ""
    severity: Literal["low", "moderate", "severe", "critical"] = "moderate"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    reporter_name: Optional[str] = "Anonymous Commuter"

class CommunityReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: ReportCategory
    title: str
    description: str
    severity: Literal["low", "moderate", "severe", "critical"]
    latitude: float
    longitude: float
    status: ReportStatus = "UNVERIFIED"
    upvotes: int = 1
    downvotes: int = 0
    confidence_level: Literal["HIGH", "MEDIUM", "LOW", "UNVERIFIED"] = "UNVERIFIED"
    reported_at: datetime = Field(default_factory=datetime.utcnow)
    last_verified_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

class VoteRequest(BaseModel):
    vote_type: Literal["upvote", "downvote", "resolve"]
    user_id: Optional[str] = "local-user"

# 5. Event & Rally Danger Zones
class EventZone(BaseModel):
    id: str
    title: str
    event_type: Literal["rally", "marathon", "construction", "festival"]
    risk_level: Literal["moderate", "high", "extreme"]
    crowd_density: str
    polygon: List[List[float]] # [[lat, lng], ...]
    detour_corridor: List[List[float]]
    description: str
    is_active: bool = True

# 6. Dynamic Reroute Request
class RerouteRequest(BaseModel):
    current_location: List[float]
    destination: List[float]
    profile: MobilityProfileCode = "wheelchair"
    blocked_obstacle_id: Optional[str] = None
