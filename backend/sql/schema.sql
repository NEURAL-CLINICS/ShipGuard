create table if not exists users (
  id uuid primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null
);

create table if not exists projects (
  id uuid primary key,
  owner_id uuid not null references users(id) on delete cascade,
  name text not null,
  repo_url text,
  rule_set text not null default 'core',
  retention_days int not null default 30,
  last_upload_path text,
  last_upload_at timestamptz,
  created_at timestamptz not null
);

create table if not exists scans (
  id uuid primary key,
  project_id uuid not null references projects(id) on delete cascade,
  status text not null,
  branch text,
  source_type text not null,
  source_ref text not null,
  created_at timestamptz not null,
  started_at timestamptz,
  finished_at timestamptz,
  findings_count int not null default 0
);

create table if not exists findings (
  id uuid primary key,
  scan_id uuid not null references scans(id) on delete cascade,
  rule_id text not null,
  severity text not null,
  category text not null,
  file text not null,
  line int not null,
  description text not null,
  remediation text not null,
  scanner_source text not null
);
