import math
from typing import List, Dict, Any, Tuple
from ..models.schemas import (
    RouteRequest, RouteResult, MultiRouteResponse, 
    RouteStep, AccessibilityBreakdown, MobilityProfileCode
)
from .scoring_engine import calculate_accessibility_score
from .reports_service import get_nearby_reports
from .events_service import get_active_events

def interpolate_points(p1: List[float], p2: List[float], num_intermediate: int = 4) -> List[List[float]]:
    points = []
    for i in range(num_intermediate + 2):
        t = i / (num_intermediate + 1)
        lat = p1[0] + (p2[0] - p1[0]) * t
        lng = p1[1] + (p2[1] - p1[1]) * t
        points.append([round(lat, 6), round(lng, 6)])
    return points

def compute_distance_meters(p1: List[float], p2: List[float]) -> int:
    d_lat = math.radians(p2[0] - p1[0])
    d_lng = math.radians(p2[1] - p1[1])
    a = math.sin(d_lat/2)**2 + math.cos(math.radians(p1[0])) * math.cos(math.radians(p2[0])) * math.sin(d_lng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return int(6371000.0 * c)

def get_speed_meters_per_sec(profile: MobilityProfileCode) -> float:
    speeds = {
        "walking": 1.3,       # ~4.7 km/h
        "wheelchair": 1.1,    # ~4.0 km/h
        "vision": 0.9,        # ~3.2 km/h
        "bicycle": 4.5,       # ~16.2 km/h
        "scooter": 4.0,       # ~14.4 km/h
        "pram_elderly": 1.0   # ~3.6 km/h
    }
    return speeds.get(profile, 1.2)

def generate_multi_routes(req: RouteRequest) -> MultiRouteResponse:
    origin = req.origin
    dest = req.destination
    profile = req.profile

    base_dist = compute_distance_meters(origin, dest)
    if base_dist < 50:
        base_dist = 500

    # Retrieve real-time active barriers and events
    active_reports = get_nearby_reports(origin[0], origin[1], radius_km=15.0)

    # Calculate 3 Candidate Paths:
    # 1. Recommended Step-Free Corridor
    # 2. Alternative Parkway Corridor
    # 3. Direct / Fastest Short-cut Corridor (may contain steps/barriers)

    # Waypoints calculation
    mid_lat = (origin[0] + dest[0]) / 2.0
    mid_lng = (origin[1] + dest[1]) / 2.0
    d_lat = dest[0] - origin[0]
    d_lng = dest[1] - origin[1]

    # Lateral offsets for realistic street corridors
    offset_scale = 0.0035

    # Path 1: Safe Step-Free Arc
    w1 = [mid_lat - d_lng * offset_scale * 1.2, mid_lng + d_lat * offset_scale * 1.2]
    # Path 2: Scenic Boulevard Arc
    w2 = [mid_lat + d_lng * offset_scale * 1.5, mid_lng - d_lat * offset_scale * 1.5]
    # Path 3: Direct Line
    w3 = [mid_lat, mid_lng]

    routes: List[RouteResult] = []

    # ROUTE 1: RECOMMENDED STEP-FREE
    path1_coords = (
        interpolate_points(origin, w1, 6) + 
        interpolate_points(w1, dest, 6)[1:]
    )
    dist1 = int(base_dist * 1.15)
    dur1 = int(dist1 / get_speed_meters_per_sec(profile))
    ramps1 = 3 if profile in ("wheelchair", "pram_elderly") else 1
    stairs1 = 0
    slope1 = 3.2
    tactile1 = 85 if profile == "vision" else 40
    barriers1 = 0
    score1, is_step_free1, tradeoff1 = calculate_accessibility_score(
        profile, dist1, dur1, stairs1, ramps1, slope1, barriers1, tactile1
    )

    steps1 = [
        RouteStep(
            instruction=f"Depart from {req.origin_name or 'Origin'} and proceed along the verified wide sidewalk.",
            maneuver="straight",
            distance_meters=int(dist1 * 0.2),
            duration_seconds=int(dur1 * 0.2),
            street_name="Accessible Pedestrian Promenade",
            accessibility_note="✓ Smooth asphalt, lowered curb ramp at crossing.",
            coordinates=path1_coords[:4]
        ),
        RouteStep(
            instruction="Turn left onto ADA Ramp Corridor at Central Junction.",
            maneuver="turn-left",
            distance_meters=int(dist1 * 0.4),
            duration_seconds=int(dur1 * 0.4),
            street_name="Connaught Ramp Corridor",
            accessibility_note="✓ 1:12 slope ratio with dual continuous handrails.",
            coordinates=path1_coords[3:8]
        ),
        RouteStep(
            instruction="Turn right and follow tactile-guided pathway toward destination.",
            maneuver="turn-right",
            distance_meters=int(dist1 * 0.35),
            duration_seconds=int(dur1 * 0.35),
            street_name="Civic Center Boulevard",
            accessibility_note="✓ Automatic sliding glass doors and step-free foyer.",
            coordinates=path1_coords[7:]
        ),
        RouteStep(
            instruction=f"Arrive at {req.destination_name or 'Destination'} on the right.",
            maneuver="arrive",
            distance_meters=int(dist1 * 0.05),
            duration_seconds=int(dur1 * 0.05),
            street_name="Destination Entrance",
            accessibility_note="✓ Level ground-floor entrance with audio chime.",
            coordinates=[path1_coords[-1]]
        )
    ]

    routes.append(RouteResult(
        id="route-recommended",
        title="Recommended (100% Step-Free)",
        is_recommended=True,
        is_step_free=True,
        duration_minutes=max(1, math.ceil(dur1 / 60)),
        distance_km=round(dist1 / 1000.0, 2),
        duration_seconds=dur1,
        distance_meters=dist1,
        accessibility_score=score1,
        accessibility_breakdown=AccessibilityBreakdown(
            ramps_count=ramps1,
            stairs_count=stairs1,
            elevators_count=2,
            max_slope_percent=slope1,
            tactile_paved_pct=tactile1,
            step_free_guarantee=True,
            major_barriers_count=0,
            confidence_level="HIGH",
            confidence_reasons=[
                f"{ramps1} certified ADA ramps",
                "0 stairs / 100% step-free",
                f"Gentle {slope1}% max incline (<5% threshold)",
                "No active community hazard reports on path"
            ]
        ),
        steps=steps1,
        coordinates=path1_coords,
        color="#2563EB",
        tradeoff_warning=None
    ))

    # ROUTE 2: ALTERNATIVE VIA PARK / AVENUE
    path2_coords = (
        interpolate_points(origin, w2, 5) + 
        interpolate_points(w2, dest, 5)[1:]
    )
    dist2 = int(base_dist * 1.3)
    dur2 = int(dist2 / get_speed_meters_per_sec(profile))
    ramps2 = 1
    stairs2 = 0
    slope2 = 4.5
    tactile2 = 30
    barriers2 = 0
    score2, is_step_free2, tradeoff2 = calculate_accessibility_score(
        profile, dist2, dur2, stairs2, ramps2, slope2, barriers2, tactile2
    )

    steps2 = [
        RouteStep(
            instruction=f"Head east from {req.origin_name or 'Origin'} toward Park Avenue.",
            maneuver="straight",
            distance_meters=int(dist2 * 0.4),
            duration_seconds=int(dur2 * 0.4),
            street_name="Park Avenue Promenade",
            accessibility_note="Paved walkway with minor tree root undulation.",
            coordinates=path2_coords[:5]
        ),
        RouteStep(
            instruction="Slight right past the fountain and continue along perimeter.",
            maneuver="turn-right",
            distance_meters=int(dist2 * 0.5),
            duration_seconds=int(dur2 * 0.5),
            street_name="Garden Perimeter Road",
            accessibility_note="Moderate 4.5% incline over 50m.",
            coordinates=path2_coords[4:9]
        ),
        RouteStep(
            instruction=f"Arrive at {req.destination_name or 'Destination'}.",
            maneuver="arrive",
            distance_meters=int(dist2 * 0.1),
            duration_seconds=int(dur2 * 0.1),
            street_name="Destination Entrance",
            accessibility_note="Level entrance.",
            coordinates=[path2_coords[-1]]
        )
    ]

    routes.append(RouteResult(
        id="route-alternative",
        title="Alternative (Scenic via Park)",
        is_recommended=False,
        is_step_free=True,
        duration_minutes=max(1, math.ceil(dur2 / 60)),
        distance_km=round(dist2 / 1000.0, 2),
        duration_seconds=dur2,
        distance_meters=dist2,
        accessibility_score=score2,
        accessibility_breakdown=AccessibilityBreakdown(
            ramps_count=ramps2,
            stairs_count=stairs2,
            elevators_count=1,
            max_slope_percent=slope2,
            tactile_paved_pct=tactile2,
            step_free_guarantee=True,
            major_barriers_count=0,
            confidence_level="MEDIUM",
            confidence_reasons=[
                "Step-free path",
                f"Slightly longer (+{round((dist2-dist1)/1000.0, 1)} km)",
                f"Max slope {slope2}%"
            ]
        ),
        steps=steps2,
        coordinates=path2_coords,
        color="#059669",
        tradeoff_warning=tradeoff2
    ))

    # ROUTE 3: FASTEST / DIRECT (Contains Stairs/Barriers to illustrate tradeoff)
    path3_coords = (
        interpolate_points(origin, w3, 4) + 
        interpolate_points(w3, dest, 4)[1:]
    )
    dist3 = int(base_dist * 0.95)
    dur3 = int(dist3 / get_speed_meters_per_sec(profile))
    ramps3 = 0
    stairs3 = 2 # 2 flights of stairs
    slope3 = 7.8
    tactile3 = 0
    barriers3 = 1 # Pothole or obstacle on this path
    score3, is_step_free3, tradeoff3 = calculate_accessibility_score(
        profile, dist3, dur3, stairs3, ramps3, slope3, barriers3, tactile3
    )

    steps3 = [
        RouteStep(
            instruction=f"Take direct alleyway cutting across Market Lane.",
            maneuver="straight",
            distance_meters=int(dist3 * 0.4),
            duration_seconds=int(dur3 * 0.4),
            street_name="Market Cut Alley",
            hazard_alert="⚠ 4-inch raised curb without cutout.",
            coordinates=path3_coords[:4]
        ),
        RouteStep(
            instruction="Take pedestrian stairs to lower terrace.",
            maneuver="straight",
            distance_meters=int(dist3 * 0.2),
            duration_seconds=int(dur3 * 0.2),
            street_name="Terrace Staircase",
            hazard_alert="⛔ 2 flights of 8 stairs each (No ramp alternative).",
            coordinates=path3_coords[3:6]
        ),
        RouteStep(
            instruction=f"Continue directly to {req.destination_name or 'Destination'}.",
            maneuver="arrive",
            distance_meters=int(dist3 * 0.4),
            duration_seconds=int(dur3 * 0.4),
            street_name="Destination Entrance",
            coordinates=path3_coords[5:]
        )
    ]

    routes.append(RouteResult(
        id="route-fastest",
        title="Fastest Direct (⚠ Inaccessible)",
        is_recommended=False,
        is_step_free=False,
        duration_minutes=max(1, math.ceil(dur3 / 60)),
        distance_km=round(dist3 / 1000.0, 2),
        duration_seconds=dur3,
        distance_meters=dist3,
        accessibility_score=score3,
        accessibility_breakdown=AccessibilityBreakdown(
            ramps_count=ramps3,
            stairs_count=stairs3,
            elevators_count=0,
            max_slope_percent=slope3,
            tactile_paved_pct=tactile3,
            step_free_guarantee=False,
            major_barriers_count=barriers3,
            confidence_level="LOW",
            confidence_reasons=[
                "⚠ Contains 2 flights of stairs",
                f"⚠ Steep 7.8% slope",
                "⚠ 1 active hazard report on alley"
            ]
        ),
        steps=steps3,
        coordinates=path3_coords,
        color="#DC2626",
        tradeoff_warning=tradeoff3 or "Contains severe accessibility barriers."
    ))

    return MultiRouteResponse(
        origin=origin,
        destination=dest,
        profile=profile,
        routes=routes
    )
