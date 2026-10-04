from typing import List, Optional
from ..models.schemas import Place, PlaceAccessibility

PILOT_PLACES: List[Place] = [
    # New Delhi Pilot POIs (Connaught Place & Central Corridor)
    Place(
        id="delhi-1",
        name="Connaught Place Central Park & Metro Interchange",
        category="transit",
        address="Connaught Place Inner Circle, New Delhi",
        latitude=28.6328,
        longitude=77.2197,
        city="New Delhi",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=True,
            has_ramp=True,
            has_elevator=True,
            has_tactile_paving=True,
            elevator_status="operational",
            details="Gate 7 & Gate 8 equipped with certified ADA elevators and tactile guide paths."
        )
    ),
    Place(
        id="delhi-2",
        name="National Museum & Library",
        category="library",
        address="Janpath Rd, Rajpath Area, Central Secretariat, New Delhi",
        latitude=28.6117,
        longitude=77.2193,
        city="New Delhi",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=True,
            has_ramp=True,
            has_elevator=True,
            has_tactile_paving=True,
            elevator_status="operational",
            details="Ground-level step-free ramp entrance at Main Gate. Braille signage available."
        )
    ),
    Place(
        id="delhi-3",
        name="All India Institute of Medical Sciences (AIIMS)",
        category="hospital",
        address="Sri Aurobindo Marg, Ansari Nagar, New Delhi",
        latitude=28.5672,
        longitude=77.2100,
        city="New Delhi",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=True,
            has_ramp=True,
            has_elevator=True,
            has_tactile_paving=True,
            elevator_status="operational",
            details="24/7 designated emergency wheelchair ramp and motorized buggy transit."
        )
    ),
    Place(
        id="delhi-4",
        name="India Gate Civic Esplanade",
        category="civic",
        address="Rajpath, India Gate, New Delhi",
        latitude=28.6129,
        longitude=77.2295,
        city="New Delhi",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=True,
            has_ramp=True,
            has_elevator=False,
            has_tactile_paving=True,
            elevator_status="unknown",
            details="Wide paved pedestrian boulevards with lowered kerbs throughout."
        )
    ),
    Place(
        id="delhi-5",
        name="Shankar Market Handicraft Arcade",
        category="shopping",
        address="Barakhamba Rd, Connaught Lane, New Delhi",
        latitude=28.6315,
        longitude=77.2245,
        city="New Delhi",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=False,
            has_ramp=False,
            has_elevator=False,
            has_tactile_paving=False,
            elevator_status="out_of_service",
            details="⚠ Warning: 3 stepped threshold at secondary stalls; use Lane 2 for ramp access."
        )
    ),
    
    # San Francisco Pilot POIs
    Place(
        id="sf-1",
        name="San Francisco Ferry Building",
        category="transit",
        address="1 Ferry Building, San Francisco, CA 94111",
        latitude=37.7955,
        longitude=-122.3937,
        city="San Francisco",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=True,
            has_ramp=True,
            has_elevator=True,
            has_tactile_paving=True,
            elevator_status="operational",
            details="Fully step-free waterfront promenade with automatic power doors."
        )
    ),
    Place(
        id="sf-2",
        name="SF Public Library - Main Branch",
        category="library",
        address="100 Larkin St, San Francisco, CA 94102",
        latitude=37.7792,
        longitude=-122.4161,
        city="San Francisco",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=True,
            has_ramp=True,
            has_elevator=True,
            has_tactile_paving=True,
            elevator_status="operational",
            details="Fulton St accessible entrance with braille guides and accessible restrooms."
        )
    ),

    # London Pilot POIs
    Place(
        id="lon-1",
        name="King's Cross St. Pancras Station",
        category="transit",
        address="Euston Rd, London N1 9AL, UK",
        latitude=51.5308,
        longitude=-0.1238,
        city="London",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=True,
            has_ramp=True,
            has_elevator=True,
            has_tactile_paving=True,
            elevator_status="operational",
            details="Step-free access from street to all Underground and National Rail platforms."
        )
    ),
    Place(
        id="lon-2",
        name="British Museum",
        category="library",
        address="Great Russell St, London WC1B 3DG, UK",
        latitude=51.5194,
        longitude=-0.1270,
        city="London",
        accessibility=PlaceAccessibility(
            has_accessible_entrance=True,
            has_ramp=True,
            has_elevator=True,
            has_tactile_paving=True,
            elevator_status="operational",
            details="Montague Place entrance has ramp access and self-operating lift."
        )
    )
]

def search_places(query: Optional[str] = None, city: Optional[str] = None) -> List[Place]:
    results = PILOT_PLACES
    if city:
        results = [p for p in results if p.city.lower() == city.lower()]
    if query:
        q = query.lower().strip()
        results = [
            p for p in results 
            if q in p.name.lower() or q in p.address.lower() or q in p.category.lower()
        ]
    return results

def get_place_by_id(place_id: str) -> Optional[Place]:
    for p in PILOT_PLACES:
        if p.id == place_id:
            return p
    return None
