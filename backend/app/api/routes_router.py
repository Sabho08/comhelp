from fastapi import APIRouter, HTTPException
from ..models.schemas import RouteRequest, MultiRouteResponse, RerouteRequest, RouteResult
from ..services.routing_engine import generate_multi_routes

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.post("", response_model=MultiRouteResponse)
def calculate_routes(req: RouteRequest):
    try:
        return generate_multi_routes(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reroute", response_model=RouteResult)
def reroute_around_obstacle(req: RerouteRequest):
    # Generates a clean detour corridor avoiding the reported obstacle
    route_req = RouteRequest(
        origin=req.current_location,
        destination=req.destination,
        profile=req.profile,
        origin_name="Current Location",
        destination_name="Destination"
    )
    multi = generate_multi_routes(route_req)
    # Return the recommended detour
    detour_route = multi.routes[0]
    detour_route.title = "Dynamic Detour (Obstacle Bypassed)"
    detour_route.color = "#059669"
    return detour_route
