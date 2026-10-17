import React from 'react';
import { Activity, ShieldCheck, Database, HardDrive, Cpu, Radio } from 'lucide-react';

export const ObservabilityPage: React.FC = () => {
  const telemetryEndpoints = [
    { name: 'Actuator Health Endpoint', path: '/actuator/health', status: '200 OK', type: 'JSON' },
    { name: 'Prometheus Metrics Stream', path: '/actuator/prometheus', status: '200 OK', type: 'Text/Prometheus' },
    { name: 'Actuator App Metrics', path: '/actuator/metrics', status: '200 OK', type: 'JSON' },
    { name: 'OpenAPI Schema', path: '/v3/api-docs', status: '200 OK', type: 'JSON' },
    { name: 'Swagger UI Console', path: '/swagger-ui.html', status: '200 OK', type: 'Interactive HTML' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Observability & Telemetry</h1>
        <p className="text-sm text-slate-400 mt-1">
          Spring Boot Actuator, Micrometer Prometheus metrics, and distributed execution tracing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Spring Boot Actuator</h3>
              <span className="text-xs text-emerald-400">UP (Database & JVM healthy)</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Monitors HikariCP database pool, heap allocations, and active worker threads.
          </p>
        </div>

        <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Prometheus Exporter</h3>
              <span className="text-xs text-blue-400">Scrape interval: 15s</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Emits dimensional gauges and timers tagged by job status, worker ID, and execution latency.
          </p>
        </div>

        <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">PostgreSQL Persistence</h3>
              <span className="text-xs text-violet-400">Durable Source of Truth</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            All schedules, heartbeats, and audit logs persist safely across restarts.
          </p>
        </div>
      </div>

      {/* Exposed Endpoints Table */}
      <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-white mb-4">Exported Telemetry Endpoints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-medium">Service / Metric</th>
                <th className="pb-3 font-medium">HTTP Endpoint</th>
                <th className="pb-3 font-medium">Format</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {telemetryEndpoints.map((ep) => (
                <tr key={ep.path} className="hover:bg-slate-800/30">
                  <td className="py-3 font-sans font-medium text-slate-200">{ep.name}</td>
                  <td className="py-3 text-blue-400">{ep.path}</td>
                  <td className="py-3 text-slate-400">{ep.type}</td>
                  <td className="py-3 text-emerald-400">{ep.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
