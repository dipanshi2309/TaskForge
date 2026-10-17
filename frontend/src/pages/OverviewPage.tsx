import React from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Cpu
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime, formatDuration } from '../lib/utils';
import type { DashboardOverview } from '../types';

interface OverviewPageProps {
  data: DashboardOverview;
  isLoading: boolean;
  onRefresh: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-[#111726]/60 rounded-xl animate-pulse border border-slate-800"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-[#111726]/60 rounded-xl animate-pulse border border-slate-800 lg:col-span-2"></div>
          <div className="h-72 bg-[#111726]/60 rounded-xl animate-pulse border border-slate-800"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Jobs',
      value: data.totalJobs,
      sub: 'All registered tasks',
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Currently Running',
      value: data.currentlyRunning,
      sub: 'Active across cluster',
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Failed Today',
      value: data.failedToday,
      sub: 'Need attention or retrying',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      label: 'Success Rate',
      value: `${data.successRate}%`,
      sub: 'Completed executions',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Avg Execution Time',
      value: formatDuration(data.averageExecutionTimeMs),
      sub: 'Task latency metric',
      icon: Clock,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cluster Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry and distributed scheduler throughput.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111726] border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Workers: <strong className="text-white">{data.onlineWorkersCount}</strong> / {data.totalWorkersCount} Online</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-[#111726]/80 backdrop-blur-sm border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div className={`p-2 rounded-lg border ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold tracking-tight text-white">{card.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution Trend Line Chart */}
        <div className="bg-[#111726]/80 border border-slate-800/90 rounded-xl p-6 lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Job Execution Trends</h2>
              <p className="text-xs text-slate-400 mt-0.5">Successful vs Failed task throughput over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Succeeded
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Failed
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.executionTrends}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="succeeded" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" />
                <Area type="monotone" dataKey="failed" stroke="#F87171" strokeWidth={2} fillOpacity={1} fill="url(#colorFail)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Queue Depths Bar Chart */}
        <div className="bg-[#111726]/80 border border-slate-800/90 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-white">Queue Depth & DLQ</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-6">RabbitMQ broker buffer health</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.queueDepths}>
                <XAxis dataKey="queue" stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => val.replace('taskforge.jobs.', '')} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="messages" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Active Queued" />
                <Bar dataKey="dlq" fill="#F87171" radius={[4, 4, 0, 0]} name="Dead-Letter" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Executions & Upcoming Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Executions */}
        <div className="bg-[#111726]/80 border border-slate-800/90 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Executions</h2>
            <span className="text-xs text-slate-400">{data.recentExecutions.length} runs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-medium">Job Name</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recentExecutions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No executions recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentExecutions.slice(0, 5).map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-medium text-slate-200">{ex.jobName}</td>
                      <td className="py-3"><StatusBadge status={ex.status} /></td>
                      <td className="py-3 font-mono text-slate-400">{formatDuration(ex.durationMs)}</td>
                      <td className="py-3 text-slate-500">{formatDateTime(ex.startedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Scheduled Jobs */}
        <div className="bg-[#111726]/80 border border-slate-800/90 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Upcoming Scheduled Jobs</h2>
            <span className="text-xs text-slate-400">{data.upcomingJobs.length} scheduled</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-medium">Job</th>
                  <th className="pb-3 font-medium">Schedule</th>
                  <th className="pb-3 font-medium">Next Run</th>
                  <th className="pb-3 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.upcomingJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No upcoming jobs scheduled.
                    </td>
                  </tr>
                ) : (
                  data.upcomingJobs.slice(0, 5).map((j) => (
                    <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-medium text-slate-200">{j.name}</td>
                      <td className="py-3 font-mono text-slate-400 text-[11px]">
                        {j.scheduleType === 'CRON' ? j.cronExpression : `${j.fixedIntervalSeconds}s interval`}
                      </td>
                      <td className="py-3 text-blue-400 font-mono text-[11px]">{formatDateTime(j.nextRunAt)}</td>
                      <td className="py-3"><StatusBadge status={j.priority} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
