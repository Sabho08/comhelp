import math
from datetime import datetime, timedelta
from typing import List, Optional
from ..models.schemas import CommunityReport, CommunityReportCreate

# In-memory storage for pilot community reports
_REPORTS_STORE: List[CommunityReport] = [
    CommunityReport(
        id="rep-1",
        category="broken_ramp",
        title="Damaged Ramp Curb at Janpath Crossing",
        description="The concrete ramp is cracked with a 3-inch drop, hazardous for manual wheelchairs.",
        severity="severe",
        latitude=28.6250,
        longitude=77.2185,
        status="CONFIRMED",
        upvotes=6,
        downvotes=0,
        confidence_level="HIGH",
        reported_at=datetime.utcnow() - timedelta(minutes=45),
        last_verified_at=datetime.utcnow() - timedelta(minutes=10),
        expires_at=datetime.utcnow() + timedelta(hours=20)
    ),
    CommunityReport(
        id="rep-2",
        category="broken_elevator",
        title="Barakhamba Metro Gate 3 Elevator Offline",
        description="Maintenance sign posted on the lift doors. Use Gate 1 ramp instead.",
        severity="critical",
        latitude=28.6300,
        longitude=77.2260,
        status="CONFIRMED",
        upvotes=9,
        downvotes=1,
        confidence_level="HIGH",
        reported_at=datetime.utcnow() - timedelta(hours=2),
        last_verified_at=datetime.utcnow() - timedelta(minutes=25),
        expires_at=datetime.utcnow() + timedelta(hours=14)
    ),
    CommunityReport(
        id="rep-3",
        category="pothole",
        title="Deep Road Cavity on Inner Circle Lane 2",
        description="Water-filled pothole blocking the pedestrian curb corridor.",
        severity="moderate",
        latitude=28.6340,
        longitude=77.2170,
        status="UNVERIFIED",
        upvotes=1,
        downvotes=0,
        confidence_level="UNVERIFIED",
        reported_at=datetime.utcnow() - timedelta(minutes=15),
        last_verified_at=datetime.utcnow() - timedelta(minutes=15),
        expires_at=datetime.utcnow() + timedelta(hours=24)
    ),
    CommunityReport(
        id="rep-4",
        category="barricade",
        title="Temporary Police Barricade at Parliament St",
        description="Pedestrian footpath narrowed to 40cm, impassable for wheelchairs and double strollers.",
        severity="severe",
        latitude=28.6220,
        longitude=77.2140,
        status="STALE",
        upvotes=3,
        downvotes=2,
        confidence_level="LOW",
        reported_at=datetime.utcnow() - timedelta(hours=18),
        last_verified_at=datetime.utcnow() - timedelta(hours=10),
        expires_at=datetime.utcnow() + timedelta(hours=6)
    )
]

def calculate_report_confidence(report: CommunityReport) -> str:
    """Calculates freshness decay and social verification confidence level."""
    now = datetime.utcnow()
    hours_since_verify = (now - report.last_verified_at).total_seconds() / 3600.0
    net_votes = report.upvotes - report.downvotes

    if report.status == "RESOLVED":
        return "EXPIRED"
    
    if hours_since_verify > 24:
        return "EXPIRED"
    elif hours_since_verify > 12:
        return "LOW"
    
    if net_votes >= 3 and hours_since_verify <= 4:
        return "HIGH"
    elif net_votes >= 1 and hours_since_verify <= 8:
        return "MEDIUM"
    elif net_votes <= -2:
        return "LOW"
    else:
        return "UNVERIFIED"

def get_nearby_reports(lat: Optional[float] = None, lng: Optional[float] = None, radius_km: float = 10.0) -> List[CommunityReport]:
    results = []
    for rep in _REPORTS_STORE:
        # Update freshness dynamically
        rep.confidence_level = calculate_report_confidence(rep)
        if rep.confidence_level == "EXPIRED":
            rep.status = "EXPIRED"
            continue
        
        if lat is not None and lng is not None:
            # Haversine distance
            d_lat = math.radians(rep.latitude - lat)
            d_lng = math.radians(rep.longitude - lng)
            a = math.sin(d_lat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(rep.latitude)) * math.sin(d_lng/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            dist_km = 6371.0 * c
            if dist_km <= radius_km:
                results.append(rep)
        else:
            results.append(rep)
    return results

def create_report(data: CommunityReportCreate) -> CommunityReport:
    lat_val = data.latitude if data.latitude is not None else (data.lat if data.lat is not None else 28.63)
    lng_val = data.longitude if data.longitude is not None else (data.lng if data.lng is not None else 77.21)

    new_report = CommunityReport(
        category=data.category,
        title=data.title,
        description=data.description or "",
        severity=data.severity,
        latitude=lat_val,
        longitude=lng_val,
        status="UNVERIFIED",
        upvotes=1,
        downvotes=0,
        confidence_level="UNVERIFIED",
        reported_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    _REPORTS_STORE.insert(0, new_report)
    return new_report

def vote_report(report_id: str, vote_type: str) -> Optional[CommunityReport]:
    for rep in _REPORTS_STORE:
        if rep.id == report_id:
            if vote_type == "upvote":
                rep.upvotes += 1
                rep.last_verified_at = datetime.utcnow()
                if rep.upvotes >= 3:
                    rep.status = "CONFIRMED"
            elif vote_type == "downvote":
                rep.downvotes += 1
            elif vote_type == "resolve":
                rep.status = "RESOLVED"
                rep.confidence_level = "LOW"
            
            rep.confidence_level = calculate_report_confidence(rep)
            return rep
    return None
