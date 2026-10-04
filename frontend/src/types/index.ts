export type MobilityProfileCode = 
  | 'walking'
  | 'wheelchair'
  | 'vision'
  | 'bicycle'
  | 'scooter'
  | 'pram_elderly';

export interface PlaceAccessibility {
  has_accessible_entrance: boolean;
  has_ramp: boolean;
  has_elevator: boolean;
  has_tactile_paving: boolean;
  elevator_status: 'operational' | 'out_of_service' | 'unknown';
  details?: string;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  accessibility: PlaceAccessibility;
}

export interface RouteStep {
  instruction: string;
  maneuver: string; // 'straight' | 'turn-left' | 'turn-right' | 'arrive' | 'ramp'
  distance_meters: number;
  duration_seconds: number;
  street_name: string;
  accessibility_note?: string;
  hazard_alert?: string;
  coordinates: [number, number][];
}

export interface AccessibilityBreakdown {
  ramps_count: number;
  stairs_count: number;
  elevators_count: number;
  max_slope_percent: number;
  tactile_paved_pct: number;
  step_free_guarantee: boolean;
  major_barriers_count: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
  confidence_reasons: string[];
}

export interface RouteResult {
  id: string;
  title: string;
  is_recommended: boolean;
  is_step_free: boolean;
  duration_minutes: number;
  distance_km: number;
  duration_seconds: number;
  distance_meters: number;
  accessibility_score: number;
  accessibility_breakdown: AccessibilityBreakdown;
  steps: RouteStep[];
  coordinates: [number, number][];
  color: string;
  tradeoff_warning?: string;
}

export type ReportCategory = 
  | 'broken_ramp'
  | 'broken_elevator'
  | 'stairs'
  | 'pothole'
  | 'barricade'
  | 'waterlogging'
  | 'construction'
  | 'blocked_footpath'
  | 'rally';

export type ReportStatus = 'UNVERIFIED' | 'CONFIRMED' | 'STALE' | 'EXPIRED' | 'RESOLVED';

export interface CommunityReport {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'severe' | 'critical';
  latitude: number;
  longitude: number;
  status: ReportStatus;
  upvotes: number;
  downvotes: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
  reported_at: string;
  last_verified_at: string;
  expires_at: string;
}

export interface EventZone {
  id: string;
  title: string;
  event_type: 'rally' | 'marathon' | 'construction' | 'festival';
  risk_level: 'moderate' | 'high' | 'extreme';
  crowd_density: string;
  polygon: [number, number][];
  detour_corridor: [number, number][];
  description: string;
  is_active: boolean;
}

export interface MapLayerConfig {
  showHazards: boolean;
  showRamps: boolean;
  showEvents: boolean;
  showTactile: boolean;
  highContrast: boolean;
  satelliteView: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  type?: string;
  category?: string;
  distance_meters?: number;
}

export interface AccessibilityLookupResult {
  has_data: boolean;
  verified: boolean;
  place_id?: string;
  name?: string;
  accessibility?: PlaceAccessibility;
  message: string;
  nearby_ramps: number;
  nearby_elevators: number;
  nearby_tactile_paths: number;
}
