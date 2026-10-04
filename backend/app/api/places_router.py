from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from ..models.schemas import Place
from ..services.places_service import search_places, get_place_by_id

router = APIRouter(prefix="/places", tags=["Places"])

@router.get("", response_model=List[Place])
def list_places(query: Optional[str] = Query(None), city: Optional[str] = Query(None)):
    return search_places(query=query, city=city)

@router.get("/{place_id}", response_model=Place)
def get_place(place_id: str):
    place = get_place_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
