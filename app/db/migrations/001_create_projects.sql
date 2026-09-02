-- Project Management Service — initial schema
-- Run this migration before starting the service with USE_IN_MEMORY_REPO=false

CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY,
  name        VARCHAR(200)  NOT NULL,
  description TEXT          NOT NULL DEFAULT '',
  owner_id    VARCHAR(255)  NOT NULL,
  status      VARCHAR(50)   NOT NULL DEFAULT 'active',
  version     INTEGER       NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects (status);
