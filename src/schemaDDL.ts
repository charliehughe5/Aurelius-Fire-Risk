export const POSTGRESQL_DDL = `-- ============================================================================
-- AURELIUS FIRE RISK - ENTERPRISE DDLS SCHEMA (POSTGRESQL 15+)
-- STRICT ENTERPRISE COMPLIANCE, MULTI-TENANCY, AND IMMUTABLE AUDIT TRAILING
-- ============================================================================

-- Create Custom Enumerated Types
CREATE TYPE user_role AS ENUM ('Admin', 'Property Manager', 'Site Inspector');
CREATE TYPE asset_status AS ENUM ('Good', 'Requires Attention', 'Critical Failure');
CREATE TYPE log_status AS ENUM ('Pass', 'Fail');
CREATE TYPE task_severity AS ENUM ('Urgent', 'High', 'Medium', 'Low');
CREATE TYPE task_status AS ENUM ('Open', 'In Progress', 'Escrow Assigned', 'Resolved');
CREATE TYPE property_type AS ENUM ('Commercial Office', 'Residential Block', 'Industrial Facility');

-- 1. Organizations (Core Tenant Isolation)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    compliance_target INT NOT NULL DEFAULT 95 CHECK (compliance_target BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Role-Based Access Control)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'Site Inspector',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    password_hash VARCHAR(255) NOT NULL -- Store Argon2id/bcrypt passwords safely
);

-- 3. Properties (Building Profiles)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    type property_type NOT NULL,
    floors INT NOT NULL CHECK (floors > 0),
    year_built INT NOT NULL CHECK (year_built > 1000),
    last_assessment DATE,
    next_assessment DATE NOT NULL,
    compliance_score INT NOT NULL DEFAULT 100 CHECK (compliance_score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Assets (Unique Location & Barcode Tracking)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Fire Door, Extinguisher, Alarm, Emergency Light, etc.
    location VARCHAR(255) NOT NULL, -- e.g. "Floor 2, South Stairwell"
    barcode VARCHAR(100) UNIQUE NOT NULL, -- Barcode/QR Code for Site Inspectors
    status asset_status NOT NULL DEFAULT 'Good',
    last_checked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Firelog Entries (Immutable Daily/Weekly Checklist Logging)
CREATE TABLE firelog_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- Optional if generic check
    check_type VARCHAR(150) NOT NULL, -- Fire Alarm Test, Escape Route, Emergency Light
    user_id UUID NOT NULL REFERENCES users(id),
    status log_status NOT NULL,
    notes TEXT,
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Enforce immutability via Trigger (prevent updating/deleting log history)
    CONSTRAINT check_checked_at CHECK (checked_at <= CURRENT_TIMESTAMP)
);

-- 6. Remediation Tasks (Auto-triggered or manual corrective actions)
CREATE TABLE remediation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    firelog_entry_id UUID REFERENCES firelog_entries(id) ON DELETE SET NULL, -- Linked failure trigger
    severity task_severity NOT NULL DEFAULT 'High',
    status task_status NOT NULL DEFAULT 'Open',
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details TEXT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_resolved_dates CHECK (resolved_at IS NULL OR resolved_at >= logged_at)
);

-- ============================================================================
-- PERFORMANCE & COMPLIANCE INDEXES
-- ============================================================================

-- Tenant Partition Indexes (Multi-Tenant Row-Level Security Acceleration)
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_properties_org ON properties(organization_id);

-- Speed up checking active remediation tasks (Priority Action Board)
CREATE INDEX idx_tasks_property_status ON remediation_tasks(property_id, status) 
WHERE status != 'Resolved';

-- Find critical assets that currently fail compliance
CREATE INDEX idx_assets_failing ON assets(property_id, status)
WHERE status IN ('Requires Attention', 'Critical Failure');

-- Search logs by property and time range for Auditing & Health Checkups
CREATE INDEX idx_firelog_audit_trail ON firelog_entries(property_id, checked_at DESC);

-- Unique barcode index speedup
CREATE INDEX idx_assets_barcode ON assets(barcode);

-- ============================================================================
-- IMMUTABILITY & AUDITING TRIGGERS (PL/pgSQL)
-- ============================================================================

-- Prevent updates/deletions on the Firelog table to secure the audit trail
CREATE OR REPLACE FUNCTION protect_firelog_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'COULD NOT AMEND FIRELOG RECORDS. Compliance audit trail table is IMMUTABLE.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_firelog
BEFORE UPDATE OR DELETE ON firelog_entries
FOR EACH ROW EVENTUALLY EXECUTE FUNCTION protect_firelog_audit_trail();
`;
