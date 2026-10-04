from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from ..models.schemas import PlaceAccessibility

class SearchResult(BaseModel):
    id: str
    name: str
    address: str
    city: Optional[str] = ""
    state: Optional[str] = ""
    country: Optional[str] = ""
    latitude: float
    longitude: float
    type: str = "place"
    category: Optional[str] = None
    distance_meters: Optional[float] = None

class SearchResponse(BaseModel):
    results: List[SearchResult] = Field(default_factory=list)
    count: int = 0
    query: str = ""

class AccessibilityLookup(BaseModel):
    has_data: bool = False
    verified: bool = False
    place_id: Optional[str] = None
    name: Optional[str] = None
    accessibility: Optional[PlaceAccessibility] = None
    message: str = "Accessibility information unavailable - Community verification needed"
    nearby_ramps: int = 0
    nearby_elevators: int = 0
    nearby_tactile_paths: int = 0
