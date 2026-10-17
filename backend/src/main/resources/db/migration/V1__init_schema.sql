-- TaskForge PostgreSQL Schema Migrations

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    role VARCHAR(60) NOT NULL DEFAULT 'ROLE_ADMIN',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    task_type VARCHAR(100) NOT NULL,
    payload TEXT,
    schedule_type VARCHAR(30) NOT NULL,
    cron_expression VARCHAR(100),
    fixed_interval_seconds BIGINT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    time_zone VARCHAR(60) NOT NULL DEFAULT 'UTC',
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    max_retries INTEGER NOT NULL DEFAULT 3,
    retry_backoff_seconds INTEGER NOT NULL DEFAULT 5,
    retry_exponential BOOLEAN NOT NULL DEFAULT TRUE,
    timeout_seconds INTEGER NOT NULL DEFAULT 60,
    target_queue VARCHAR(80) NOT NULL DEFAULT 'taskforge.jobs.default',
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_next_run ON jobs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);

CREATE TABLE IF NOT EXISTS job_dependencies (
    job_id VARCHAR(36) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    depends_on_job_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (job_id, depends_on_job_id)
);

CREATE TABLE IF NOT EXISTS job_executions (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    job_name VARCHAR(120) NOT NULL,
    attempt_number INTEGER NOT NULL,
    worker_id VARCHAR(100),
    status VARCHAR(30) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    result_summary VARCHAR(1000),
    error_message VARCHAR(2000),
    stack_trace TEXT,
    correlation_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exec_job_id ON job_executions(job_id);
CREATE INDEX IF NOT EXISTS idx_exec_status ON job_executions(status);
CREATE INDEX IF NOT EXISTS idx_exec_started_at ON job_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_exec_worker_id ON job_executions(worker_id);

CREATE TABLE IF NOT EXISTS execution_logs (
    execution_id VARCHAR(36) NOT NULL REFERENCES job_executions(id) ON DELETE CASCADE,
    log_line TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS worker_instances (
    worker_id VARCHAR(100) PRIMARY KEY,
    hostname VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ONLINE',
    last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL,
    current_task VARCHAR(150),
    active_executions INTEGER NOT NULL DEFAULT 0,
    max_concurrency INTEGER NOT NULL DEFAULT 5,
    total_processed BIGINT NOT NULL DEFAULT 0,
    total_success BIGINT NOT NULL DEFAULT 0,
    total_failed BIGINT NOT NULL DEFAULT 0,
    version VARCHAR(30) DEFAULT '1.0.0',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workers_heartbeat ON worker_instances(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_workers_status ON worker_instances(status);

CREATE TABLE IF NOT EXISTS benchmark_runs (
    id VARCHAR(36) PRIMARY KEY,
    job_count INTEGER NOT NULL,
    worker_count INTEGER NOT NULL,
    concurrency_per_worker INTEGER NOT NULL,
    simulated_duration_ms INTEGER NOT NULL,
    failure_rate_percent INTEGER NOT NULL,
    max_retries INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL,
    total_duration_ms BIGINT,
    throughput_jobs_per_sec DOUBLE PRECISION,
    average_latency_ms DOUBLE PRECISION,
    median_latency_ms DOUBLE PRECISION,
    p95_latency_ms DOUBLE PRECISION,
    queue_wait_time_ms DOUBLE PRECISION,
    success_rate DOUBLE PRECISION,
    failure_rate DOUBLE PRECISION,
    total_retries INTEGER,
    latency_percentiles_json TEXT,
    throughput_over_time_json TEXT,
    run_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
