import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Play,
  RotateCcw,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { runBenchmark, fetchBenchmarkHistory } from '../services/api';
import type { BenchmarkResult, BenchmarkRequest } from '../types';
import { formatDuration } from '../lib/utils';

export const PerformanceLabPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<BenchmarkResult[]>([]);
  const [currentResult, setCurrentResult] = useState<BenchmarkResult | null>(null);

  // Form parameters
  const [jobCount, setJobCount] = useState(50);
  const [workerCount, setWorkerCount] = useState(4);
  const [concurrencyPerWorker, setConcurrencyPerWorker] = useState(5);
  const [simulatedDurationMs, setSimulatedDurationMs] = useState(120);
  const [failureRatePercent, setFailureRatePercent] = useState(10);
  const [maxRetries, setMaxRetries] = useState(2);

  useEffect(() => {
    fetchBenchmarkHistory().then(setHistory).catch(console.error);
  }, []);

  const handleStartBenchmark = async () => {
    setIsRunning(true);
    try {
      const req: BenchmarkRequest = {
        jobCount,
        workerCount,
        concurrencyPerWorker,
        simulatedDurationMs,
        failureRatePercent,
        maxRetries
      };
      const res = await runBenchmark(req);
      setCurrentResult(res);
      const updatedHistory = await fetchBenchmarkHistory();
      setHistory(updatedHistory);
    } catch (e: any) {
      alert(e.message || 'Benchmark execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Performance Lab</h1>
        <p className="text-sm text-slate-400 mt-1">
          Execute controlled high-concurrency stress benchmarks. Measure real throughput, p95 latency, and failure backoff recovery.
        </p>
      </div>

      {/* Benchmark Scenario Configuration */}
      <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Scenario Parameters</h2>
          </div>
          <button
            onClick={handleStartBenchmark}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Benchmarking Cluster...' : 'Run Benchmark'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Total Job Batch Size: <strong className="text-white">{jobCount}</strong>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={jobCount}
              onChange={(e) => setJobCount(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Simulated Worker Count: <strong className="text-white">{workerCount}</strong>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={workerCount}
              onChange={(e) => setWorkerCount(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Concurrency per Worker: <strong className="text-white">{concurrencyPerWorker}</strong>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={concurrencyPerWorker}
              onChange={(e) => setConcurrencyPerWorker(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Task Work Duration: <strong className="text-white">{simulatedDurationMs} ms</strong>
            </label>
            <input
              type="range"
              min="20"
              max="500"
              step="20"
              value={simulatedDurationMs}
              onChange={(e) => setSimulatedDurationMs(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Simulated Failure Rate: <strong className="text-rose-400">{failureRatePercent}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={failureRatePercent}
              onChange={(e) => setFailureRatePercent(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Max Retry Attempts: <strong className="text-white">{maxRetries}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Measured Benchmark Results */}
      {currentResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-[#111726]/80 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Throughput</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {currentResult.throughputJobsPerSec?.toFixed(1)} <span className="text-xs text-slate-500 font-normal">jobs/s</span>
              </span>
            </div>
            <div className="p-4 bg-[#111726]/80 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Avg Latency</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {currentResult.averageLatencyMs?.toFixed(0)} <span className="text-xs text-slate-500 font-normal">ms</span>
              </span>
            </div>
            <div className="p-4 bg-[#111726]/80 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">p95 Latency</span>
              <span className="text-xl font-bold text-violet-400 mt-1 block">
                {currentResult.p95LatencyMs?.toFixed(0)} <span className="text-xs text-slate-500 font-normal">ms</span>
              </span>
            </div>
            <div className="p-4 bg-[#111726]/80 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Queue Wait Time</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">
                {currentResult.queueWaitTimeMs?.toFixed(1)} <span className="text-xs text-slate-500 font-normal">ms</span>
              </span>
            </div>
            <div className="p-4 bg-[#111726]/80 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Success Rate</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                {currentResult.successRate?.toFixed(1)}%
              </span>
            </div>
            <div className="p-4 bg-[#111726]/80 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Total Retries</span>
              <span className="text-xl font-bold text-blue-400 mt-1 block">
                {currentResult.totalRetries}
              </span>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latency Percentiles Bar Chart */}
            <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-white mb-4">Measured Latency Percentiles</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentResult.latencyPercentiles || []}>
                    <XAxis dataKey="percentile" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="ms" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="latencyMs" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Latency (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Throughput Over Time Chart */}
            <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-white mb-4">Throughput Over Test Duration</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentResult.throughputOverTime || []}>
                    <defs>
                      <linearGradient id="colorBench" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="second" stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(s) => `${s}s`} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="throughput" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorBench)" name="Jobs Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Runs */}
      {history.length > 0 && (
        <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-white mb-4">Past Benchmark Runs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-medium">Batch Size</th>
                  <th className="pb-3 font-medium">Concurrency</th>
                  <th className="pb-3 font-medium">Throughput</th>
                  <th className="pb-3 font-medium">p95 Latency</th>
                  <th className="pb-3 font-medium">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-mono text-slate-200">{h.config?.jobCount || 50} jobs</td>
                    <td className="py-2.5 font-mono text-slate-300">{h.config?.workerCount * h.config?.concurrencyPerWorker || 20} threads</td>
                    <td className="py-2.5 font-mono text-emerald-400 font-semibold">{h.throughputJobsPerSec?.toFixed(1)} /s</td>
                    <td className="py-2.5 font-mono text-violet-400">{h.p95LatencyMs?.toFixed(0)} ms</td>
                    <td className="py-2.5 font-mono text-slate-300">{h.successRate?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
