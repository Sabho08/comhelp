from typing import Dict, Any, List, Tuple
from ..models.schemas import MobilityProfileCode, RoutePreferences, AccessibilityBreakdown

def calculate_accessibility_score(
    profile: MobilityProfileCode,
    distance_meters: int,
    duration_seconds: int,
    stairs_count: int,
    ramps_count: int,
    max_slope_pct: float,
    barriers_count: int,
    tactile_pct: int
) -> Tuple[float, bool, str]:
    """
    Computes an accessibility score from 0.0 to 100.0 based on mobility profile constraints.
    Returns: (score, is_step_free, tradeoff_warning)
    """
    score = 100.0
    tradeoff = None
    is_step_free = (stairs_count == 0)

    if profile == "wheelchair":
        if stairs_count > 0:
            score -= (stairs_count * 45.0)
            tradeoff = f"⚠ Contains {stairs_count} flight(s) of stairs - impassable for wheelchairs."
        if max_slope_pct > 5.0:
            excess = max_slope_pct - 5.0
            score -= (excess * 10.0)
            if not tradeoff:
                tradeoff = f"⚠ Steep incline detected ({max_slope_pct:.1f}% gradient > 5% ADA limit)."
        if barriers_count > 0:
            score -= (barriers_count * 30.0)
            if not tradeoff:
                tradeoff = f"⚠ {barriers_count} reported hazard(s) along this route."
        # Bonus for certified ramps
        score += min(15.0, ramps_count * 5.0)

    elif profile == "pram_elderly":
        if stairs_count > 0:
            score -= (stairs_count * 40.0)
            tradeoff = f"⚠ Contains {stairs_count} steps - difficult for strollers/walkers."
        if max_slope_pct > 6.0:
            score -= (max_slope_pct - 6.0) * 8.0
        if barriers_count > 0:
            score -= (barriers_count * 25.0)
        score += min(10.0, ramps_count * 4.0)

    elif profile == "vision":
        if barriers_count > 0:
            score -= (barriers_count * 35.0)
            tradeoff = f"⚠ Obstacle reported in pedestrian corridor."
        # Bonus for tactile guidance
        score += (tactile_pct * 0.2)
        if stairs_count > 0:
            score -= (stairs_count * 10.0) # Stairs are manageable if flagged, but penalize slightly

    elif profile == "bicycle":
        if stairs_count > 0:
            score -= (stairs_count * 30.0)
            tradeoff = "⚠ Contains stairs requiring bike carry."
        if max_slope_pct > 10.0:
            score -= (max_slope_pct - 10.0) * 5.0

    elif profile == "scooter":
        if stairs_count > 0:
            score -= (stairs_count * 50.0)
            tradeoff = "⚠ Inaccessible stairs on pathway."
        if max_slope_pct > 12.0:
            score -= (max_slope_pct - 12.0) * 6.0

    else: # walking
        if barriers_count > 0:
            score -= (barriers_count * 15.0)
        if max_slope_pct > 15.0:
            score -= (max_slope_pct - 15.0) * 2.0

    final_score = max(5.0, min(100.0, score))
    return final_score, is_step_free, tradeoff
