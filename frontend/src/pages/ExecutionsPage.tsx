import React, { useState } from 'react';
import { History, RotateCw, Terminal, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime, formatDuration } from '../lib/utils';
import type { JobExecution } from '../types';
import { retryExecution } from '../services/api';

export const ExecutionsPage: React.FC<{ executions: JobExecution[]; isLoading: boolean; onRefresh: () => void }> = ({
  executions,
  isLoading,
  onRefresh,
}) => {
  const [selectedExec, setSelectedExec] = useState<JobExecution | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await retryExecution(id);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Execution History & Diagnostics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Trace distributed jobs, inspect live worker execution logs, and diagnose failures.
        </p>
      </div>

      <div className="bg-[#111726]/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F19]/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Job Name</th>
                <th className="py-3 px-4 font-medium">Attempt</th>
                <th className="py-3 px-4 font-medium">Worker ID</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Duration</th>
                <th className="py-3 px-4 font-medium">Correlation ID</th>
                <th className="py-3 px-4 font-medium">Started At</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-6 px-4">
                      <div className="h-6 bg-slate-800/50 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No execution records available yet.
                  </td>
                </tr>
              ) : (
                executions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-200">{ex.jobName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">#{ex.attemptNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{ex.workerId || 'Pending'}</td>
                    <td className="py-3 px-4"><StatusBadge status={ex.status} /></td>
                    <td className="py-3 px-4 font-mono text-slate-300">{formatDuration(ex.durationMs)}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-blue-400">{ex.correlationId}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDateTime(ex.startedAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedExec(ex)}
                          className="p-1.5 rounded bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                          title="View Logs"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                        {ex.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetry(ex.id)}
                            disabled={retryingId === ex.id}
                            className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Retry execution"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal / Diagnostic Drawer */}
      {selectedExec && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-white text-sm">
                  Execution Diagnostic — {selectedExec.jobName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExec(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#080B11] p-3 rounded-lg border border-slate-800/80 font-mono">
                <div>Execution ID: <span className="text-slate-400">{selectedExec.id}</span></div>
                <div>Correlation ID: <span className="text-blue-400">{selectedExec.correlationId}</span></div>
                <div>Worker: <span className="text-slate-400">{selectedExec.workerId || 'none'}</span></div>
                <div>Duration: <span className="text-slate-400">{formatDuration(selectedExec.durationMs)}</span></div>
              </div>

              {selectedExec.errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono">
                  <strong>Error:</strong> {selectedExec.errorMessage}
                </div>
              )}

              {selectedExec.resultSummary && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono">
                  <strong>Result:</strong> {selectedExec.resultSummary}
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Structured Execution Logs:</h4>
                <div className="bg-[#080B11] p-3 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1 max-h-60 overflow-y-auto">
                  {selectedExec.logs && selectedExec.logs.length > 0 ? (
                    selectedExec.logs.map((log, i) => (
                      <div key={i} className="text-slate-400 hover:text-white transition-colors">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500">No detailed logs attached to this execution.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-[#0B0F19] flex justify-end">
              <button
                onClick={() => setSelectedExec(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
