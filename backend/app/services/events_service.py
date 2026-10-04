from typing import List, Optional
from ..models.schemas import EventZone

_EVENT_ZONES: List[EventZone] = [
    EventZone(
        id="event-rally-1",
        title="Civic Teachers Association Peaceful Assembly",
        event_type="rally",
        risk_level="high",
        crowd_density="High Density (>3500 people)",
        description="Public gathering along Jantar Mantar Road. Pedestrian corridors completely blocked.",
        polygon=[
            [28.6255, 77.2140],
            [28.6285, 77.2180],
            [28.6240, 77.2200],
            [28.6220, 77.2150]
        ],
        detour_corridor=[
            [28.6328, 77.2197],
            [28.6300, 77.2260],
            [28.6180, 77.2250],
            [28.6117, 77.2193]
        ],
        is_active=True
    ),
    EventZone(
        id="event-marathon-sf",
        title="San Francisco Waterfront Half-Marathon Corridor",
        event_type="marathon",
        risk_level="moderate",
        crowd_density="Moderate Flow",
        description="The Embarcadero northbound lane closed. Pedestrian detour routed via Market St.",
        polygon=[
            [37.7960, -122.3950],
            [37.7980, -122.3910],
            [37.7910, -122.3890],
            [37.7890, -122.3930]
        ],
        detour_corridor=[
            [37.7955, -122.3937],
            [37.7910, -122.4000],
            [37.7792, -122.4161]
        ],
        is_active=True
    )
]

def get_active_events() -> List[EventZone]:
    return [e for e in _EVENT_ZONES if e.is_active]
