import React, { useState } from 'react';
import {
  Play,
  Pause,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  RotateCw
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime } from '../lib/utils';
import type { Job, JobStatus } from '../types';
import { pauseJob, resumeJob, cancelJob, triggerJobNow } from '../services/api';

interface JobsPageProps {
  jobs: Job[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ jobs, isLoading, onRefresh, onOpenCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.taskType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (action: 'pause' | 'resume' | 'cancel' | 'trigger', id: string) => {
    setActionLoadingId(id);
    try {
      if (action === 'pause') await pauseJob(id);
      if (action === 'resume') await resumeJob(id);
      if (action === 'cancel') await cancelJob(id);
      if (action === 'trigger') await triggerJobNow(id);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Job Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure, schedule, trigger and pause distributed background jobs.
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111726]/80 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, task type, or ID..."
            className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B0F19] border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RUNNING">Running</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="FAILED">Failed</option>
            <option value="PAUSED">Paused</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-[#111726]/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F19]/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Job Details</th>
                <th className="py-3 px-4 font-medium">Task Handler</th>
                <th className="py-3 px-4 font-medium">Schedule</th>
                <th className="py-3 px-4 font-medium">Priority</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Next Run</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-6 px-4">
                      <div className="h-6 bg-slate-800/50 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No jobs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{job.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{job.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[11px] border border-blue-500/20">
                        {job.taskType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-medium">{job.scheduleType}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {job.scheduleType === 'CRON' ? job.cronExpression : `${job.fixedIntervalSeconds || 60}s`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={job.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {formatDateTime(job.nextRunAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Run Now Button */}
                        <button
                          onClick={() => handleAction('trigger', job.id)}
                          disabled={actionLoadingId === job.id}
                          className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                          title="Trigger Now"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>

                        {/* Pause or Resume Button */}
                        {job.status === 'PAUSED' ? (
                          <button
                            onClick={() => handleAction('resume', job.id)}
                            disabled={actionLoadingId === job.id}
                            className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                            title="Resume Job"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction('pause', job.id)}
                            disabled={actionLoadingId === job.id || job.status === 'CANCELLED'}
                            className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
                            title="Pause Job"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Cancel Button */}
                        <button
                          onClick={() => handleAction('cancel', job.id)}
                          disabled={actionLoadingId === job.id || job.status === 'CANCELLED'}
                          className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Cancel Job"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
