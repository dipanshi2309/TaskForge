import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { JobsPage } from './pages/JobsPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { WorkersPage } from './pages/WorkersPage';
import { ExecutionsPage } from './pages/ExecutionsPage';
import { QueuesPage } from './pages/QueuesPage';
import { PerformanceLabPage } from './pages/PerformanceLabPage';
import { ObservabilityPage } from './pages/ObservabilityPage';
import { SettingsPage } from './pages/SettingsPage';
import { fetchDashboardOverview, fetchJobs, fetchWorkers, fetchExecutions } from './services/api';
import type { DashboardOverview, Job, WorkerInstance, JobExecution } from './types';

// Default initial state
const defaultOverview: DashboardOverview = {
  totalJobs: 0,
  currentlyRunning: 0,
  failedToday: 0,
  successRate: 100,
  averageExecutionTimeMs: 0,
  executionTrends: [],
  queueDepths: [
    { queue: 'taskforge.jobs.default', messages: 0, dlq: 0 },
    { queue: 'taskforge.jobs.high', messages: 0, dlq: 0 },
    { queue: 'taskforge.jobs.dlq', messages: 0, dlq: 0 },
  ],
  recentExecutions: [],
  upcomingJobs: [],
  recentFailures: [],
  onlineWorkersCount: 0,
  totalWorkersCount: 0,
};

export function AppContent() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview>(defaultOverview);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<WorkerInstance[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [overviewData, jobsData, workersData, execsData] = await Promise.allSettled([
        fetchDashboardOverview(),
        fetchJobs(),
        fetchWorkers(),
        fetchExecutions(),
      ]);

      if (overviewData.status === 'fulfilled') setOverview(overviewData.value);
      if (jobsData.status === 'fulfilled') setJobs(jobsData.value.content || []);
      if (workersData.status === 'fulfilled') setWorkers(workersData.value || []);
      if (execsData.status === 'fulfilled') setExecutions(execsData.value.content || []);
    } catch (err) {
      console.error('Error fetching backend data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onRefresh={loadAllData} isRefreshing={isRefreshing} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={<OverviewPage data={overview} isLoading={isLoading} onRefresh={loadAllData} />}
            />
            <Route
              path="/jobs"
              element={
                <JobsPage
                  jobs={jobs}
                  isLoading={isLoading}
                  onRefresh={loadAllData}
                  onOpenCreate={() => navigate('/create-job')}
                />
              }
            />
            <Route
              path="/create-job"
              element={<CreateJobPage onJobCreated={loadAllData} />}
            />
            <Route
              path="/workers"
              element={<WorkersPage workers={workers} isLoading={isLoading} />}
            />
            <Route
              path="/executions"
              element={<ExecutionsPage executions={executions} isLoading={isLoading} onRefresh={loadAllData} />}
            />
            <Route
              path="/queues"
              element={<QueuesPage overview={overview} />}
            />
            <Route
              path="/performance"
              element={<PerformanceLabPage />}
            />
            <Route
              path="/observability"
              element={<ObservabilityPage />}
            />
            <Route
              path="/settings"
              element={<SettingsPage />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
