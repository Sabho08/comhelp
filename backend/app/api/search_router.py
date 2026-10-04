from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import math

from ..schemas.search import SearchResponse, AccessibilityLookup
from ..services.search.geoapify import GeoapifySearchProvider
from ..services.places_service import PILOT_PLACES

router = APIRouter(prefix="/search", tags=["Location Search & Autocomplete"])
search_provider = GeoapifySearchProvider()

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two lat/lon coordinates."""
    r = 6371000 # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) *
         math.sin(delta_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

@router.get("/suggest", response_model=SearchResponse)
async def suggest_locations(
    text: str = Query(..., min_length=1, max_length=120, description="Search term for address autocomplete"),
    lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Proximity bias latitude"),
    lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Proximity bias longitude"),
    limit: int = Query(8, ge=1, le=8, description="Result limit (max 8 for Geoapify quota efficiency)")
):
    """
    FastAPI proxy for Geoapify Address Autocomplete.
    - Uses browser lat/lon as a proximity bias without restricting results
    - Enforces 2-character minimum and 8-item maximum
    - Normalizes raw provider data into AccessRoute internal schema
    - Fully protects GEOAPIFY_API_KEY from frontend exposure
    """
    clean_text = text.strip()
    if len(clean_text) < 2:
        return SearchResponse(results=[], count=0, query=clean_text)

    return await search_provider.suggest(
        text=clean_text,
        lat=lat,
        lon=lon,
        limit=limit
    )

@router.get("/accessibility", response_model=AccessibilityLookup)
def lookup_place_accessibility(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
    name: Optional[str] = Query(None)
):
    """
    Post-selection AccessRoute PostGIS / Database Lookup.
    Queries verified accessibility infrastructure (ramps, elevators, tactile paving).
    Never invents or fabricates data: if unverified, explicitly returns
    'Accessibility information unavailable'.
    """
    # Check exact/near matches in verified database (within 200 meters)
    closest_place = None
    min_distance = 200.0 # meters threshold for verified POI matching

    for p in PILOT_PLACES:
        dist = calculate_haversine_distance(lat, lon, p.latitude, p.longitude)
        if dist < min_distance:
            min_distance = dist
            closest_place = p

    if closest_place:
        return AccessibilityLookup(
            has_data=True,
            verified=True,
            place_id=closest_place.id,
            name=closest_place.name,
            accessibility=closest_place.accessibility,
            message="Verified by AccessRoute Municipal & Field Audit",
            nearby_ramps=1 if closest_place.accessibility.has_ramp else 0,
            nearby_elevators=1 if closest_place.accessibility.has_elevator else 0,
            nearby_tactile_paths=1 if closest_place.accessibility.has_tactile_paving else 0
        )

    # If not in verified registry
    return AccessibilityLookup(
        has_data=False,
        verified=False,
        place_id=None,
        name=name,
        accessibility=None,
        message="Accessibility information unavailable",
        nearby_ramps=0,
        nearby_elevators=0,
        nearby_tactile_paths=0
    )
