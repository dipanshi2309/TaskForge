import type { Job, JobExecution, WorkerInstance, DashboardOverview, BenchmarkRequest, BenchmarkResult } from '../types';

const API_BASE = '/api';

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await fetch(`${API_BASE}/dashboard/overview`);
  if (!res.ok) throw new Error('Failed to load dashboard overview');
  return res.json();
}

export async function fetchJobs(status?: string, search?: string): Promise<{ content: Job[]; totalElements: number }> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load jobs');
  return res.json();
}

export async function fetchJobById(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job details');
  return res.json();
}

export async function createJob(jobData: Partial<Job>): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to create job' }));
    throw new Error(err.message || 'Failed to create job');
  }
  return res.json();
}

export async function pauseJob(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}/pause`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to pause job');
  return res.json();
}

export async function resumeJob(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}/resume`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to resume job');
  return res.json();
}

export async function cancelJob(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}/cancel`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to cancel job');
  return res.json();
}

export async function triggerJobNow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/jobs/${id}/trigger`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger job execution');
}

export async function fetchExecutions(jobId?: string, status?: string): Promise<{ content: JobExecution[]; totalElements: number }> {
  const params = new URLSearchParams();
  if (jobId) params.append('jobId', jobId);
  if (status && status !== 'ALL') params.append('status', status);

  const res = await fetch(`${API_BASE}/executions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch executions');
  return res.json();
}

export async function fetchExecutionById(id: string): Promise<JobExecution> {
  const res = await fetch(`${API_BASE}/executions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch execution details');
  return res.json();
}

export async function retryExecution(id: string): Promise<JobExecution> {
  const res = await fetch(`${API_BASE}/executions/${id}/retry`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to retry execution');
  return res.json();
}

export async function fetchWorkers(): Promise<WorkerInstance[]> {
  const res = await fetch(`${API_BASE}/workers`);
  if (!res.ok) throw new Error('Failed to fetch workers');
  return res.json();
}

export async function runBenchmark(req: BenchmarkRequest): Promise<BenchmarkResult> {
  const res = await fetch(`${API_BASE}/benchmark/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Benchmark run failed');
  return res.json();
}

export async function fetchBenchmarkHistory(): Promise<BenchmarkResult[]> {
  const res = await fetch(`${API_BASE}/benchmark/history`);
  if (!res.ok) throw new Error('Failed to fetch benchmark history');
  return res.json();
}
