export type JobStatus = 'SCHEDULED' | 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'PAUSED' | 'CANCELLED';

export type ScheduleType = 'ONE_TIME' | 'FIXED_INTERVAL' | 'CRON';

export type JobPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface Job {
  id: string;
  name: string;
  description?: string;
  taskType: string;
  payload: Record<string, any> | string;
  scheduleType: ScheduleType;
  cronExpression?: string;
  fixedIntervalSeconds?: number;
  startTime?: string;
  endTime?: string;
  timeZone: string;
  priority: JobPriority;
  status: JobStatus;
  maxRetries: number;
  retryBackoffSeconds: number;
  retryExponential: boolean;
  timeoutSeconds: number;
  targetQueue: string;
  nextRunAt?: string;
  lastRunAt?: string;
  dependencyJobIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobExecution {
  id: string;
  jobId: string;
  jobName: string;
  attemptNumber: number;
  workerId: string;
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED_OUT' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  resultSummary?: string;
  errorMessage?: string;
  stackTrace?: string;
  correlationId: string;
  logs?: string[];
}

export interface WorkerInstance {
  id: string;
  workerId: string;
  hostname: string;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  lastHeartbeat: string;
  currentTask?: string;
  activeExecutions: number;
  maxConcurrency: number;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  version: string;
  startedAt: string;
}

export interface QueueMetric {
  name: string;
  readyMessages: number;
  unacknowledgedMessages: number;
  deadLetterMessages: number;
  consumerCount: number;
  status: 'HEALTHY' | 'DEGRADED' | 'WARNING';
}

export interface DashboardOverview {
  totalJobs: number;
  currentlyRunning: number;
  failedToday: number;
  successRate: number;
  averageExecutionTimeMs: number;
  executionTrends: {
    time: string;
    succeeded: number;
    failed: number;
  }[];
  queueDepths: {
    queue: string;
    messages: number;
    dlq: number;
  }[];
  recentExecutions: JobExecution[];
  upcomingJobs: Job[];
  recentFailures: JobExecution[];
  onlineWorkersCount: number;
  totalWorkersCount: number;
}

export interface BenchmarkConfig {
  jobCount: number;
  workerCount: number;
  concurrencyPerWorker: number;
  simulatedDurationMs: number;
  failureRatePercent: number;
  maxRetries: number;
}

export type BenchmarkRequest = BenchmarkConfig;

export interface BenchmarkResult {
  id: string;
  runAt: string;
  config: BenchmarkConfig;
  status: 'COMPLETED' | 'RUNNING' | 'STOPPED';
  totalDurationMs: number;
  throughputJobsPerSec: number;
  averageLatencyMs: number;
  medianLatencyMs: number;
  p95LatencyMs: number;
  queueWaitTimeMs: number;
  successRate: number;
  failureRate: number;
  totalRetries: number;
  latencyPercentiles: { percentile: string; latencyMs: number }[];
  throughputOverTime: { second: number; throughput: number }[];
}
