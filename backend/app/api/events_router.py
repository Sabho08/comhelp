from fastapi import APIRouter
from typing import List
from ..models.schemas import EventZone
from ..services.events_service import get_active_events

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[EventZone])
def list_active_events():
    return get_active_events()
