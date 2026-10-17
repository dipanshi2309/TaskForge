import React from 'react';
import { Cpu, Activity, Clock, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime } from '../lib/utils';
import type { WorkerInstance } from '../types';

export const WorkersPage: React.FC<{ workers: WorkerInstance[]; isLoading: boolean }> = ({ workers, isLoading }) => {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Worker Fleet</h1>
        <p className="text-sm text-slate-400 mt-1">
          Cluster nodes reporting continuous heartbeats, executing bounded thread tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-56 bg-[#111726]/60 rounded-xl animate-pulse border border-slate-800"></div>
          ))
        ) : workers.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-500 bg-[#111726]/40 rounded-xl border border-slate-800">
            No worker instances online. Start a worker process to join the cluster.
          </div>
        ) : (
          workers.map((w) => (
            <div
              key={w.workerId}
              className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm">{w.workerId}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{w.hostname}</p>
                    </div>
                  </div>
                  <StatusBadge status={w.status} />
                </div>

                {/* Utilization meter */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Concurrency Utilization</span>
                    <span className="font-mono text-white">
                      {w.activeExecutions} / {w.maxConcurrency} slots
                    </span>
                  </div>
                  <div className="w-full bg-[#0B0F19] rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (w.activeExecutions / (w.maxConcurrency || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Task:</span>
                    <span className="text-slate-200 font-mono truncate max-w-[160px]">{w.currentTask || 'IDLE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Processed:</span>
                    <span className="text-slate-200 font-mono">{w.totalProcessed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Success / Fail:</span>
                    <span className="font-mono text-emerald-400">{w.totalSuccess} <span className="text-slate-600">/</span> <span className="text-rose-400">{w.totalFailed}</span></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last heartbeat:
                </span>
                <span className="font-mono text-slate-400">{formatDateTime(w.lastHeartbeat)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
