-- ====================================================================
-- ACCESSROUTE LIVE™ - DATABASE SCHEMA (PostgreSQL + PostGIS / Supabase)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PLACES & POINTS OF INTEREST
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- transit, library, hospital, civic, shopping
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    has_accessible_entrance BOOLEAN DEFAULT TRUE,
    has_ramp BOOLEAN DEFAULT FALSE,
    has_elevator BOOLEAN DEFAULT FALSE,
    has_tactile_paving BOOLEAN DEFAULT FALSE,
    elevator_status VARCHAR(30) DEFAULT 'operational', -- operational, out_of_service, unknown
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_places_geom ON places USING GIST (geom);

-- 2. ACCESSIBILITY MAP FEATURES (Ramps, Stairs, Kerbs, Lifts)
CREATE TABLE IF NOT EXISTS map_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_type VARCHAR(50) NOT NULL, -- ramp, stairs, elevator, lowered_kerb, tactile_path
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    incline_gradient_pct DOUBLE PRECISION DEFAULT 0.0,
    step_count INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'operational',
    verified_by_council BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_geom ON map_features USING GIST (geom);

-- 3. COMMUNITY HAZARD REPORTS
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- pothole, broken_ramp, broken_elevator, barricade, waterlogging, rally
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'moderate', -- low, moderate, severe, critical
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    status VARCHAR(30) DEFAULT 'UNVERIFIED', -- UNVERIFIED, CONFIRMED, STALE, EXPIRED, RESOLVED
    upvotes INT DEFAULT 1,
    downvotes INT DEFAULT 0,
    confidence_level VARCHAR(20) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW, UNVERIFIED
    reporter_id VARCHAR(100) DEFAULT 'anonymous',
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_reports_geom ON community_reports USING GIST (geom);

-- 4. REPORT COMMUNITY VOTES
CREATE TABLE IF NOT EXISTS report_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES community_reports(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- upvote, downvote, resolve
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_id, user_id)
);

-- 5. EVENT & RALLY ZONES
CREATE TABLE IF NOT EXISTS event_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- rally, marathon, construction, festival
    risk_level VARCHAR(20) DEFAULT 'high', -- low, moderate, high, extreme
    crowd_density VARCHAR(30) DEFAULT 'Dense (>2000)',
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    detour_corridor GEOMETRY(LineString, 4326),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '6 hours',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_event_zones_geom ON event_zones USING GIST (geom);

-- 6. NAVIGATION LOGS & ROUTE REQUESTS
CREATE TABLE IF NOT EXISTS navigation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100),
    mobility_profile VARCHAR(30) NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    dest_lat DOUBLE PRECISION NOT NULL,
    dest_lng DOUBLE PRECISION NOT NULL,
    route_chosen_id VARCHAR(100),
    duration_seconds INT,
    distance_meters INT,
    rerouted_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
