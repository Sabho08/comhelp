from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Optional
from ..models.schemas import CommunityReport, CommunityReportCreate, VoteRequest
from ..services.reports_service import get_nearby_reports, create_report, vote_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[CommunityReport])
def list_reports(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(15.0)
):
    return get_nearby_reports(lat=lat, lng=lng, radius_km=radius_km)

@router.post("", response_model=CommunityReport, status_code=status.HTTP_201_CREATED)
def submit_report(data: CommunityReportCreate):
    return create_report(data)

@router.post("/{report_id}/vote", response_model=CommunityReport)
def vote_on_report(report_id: str, body: VoteRequest):
    updated = vote_report(report_id, body.vote_type)
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found")
    return updated
