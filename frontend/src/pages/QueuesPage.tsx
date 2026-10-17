import React from 'react';
import { GitBranch, ShieldAlert, ArrowRight, Layers, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import type { DashboardOverview } from '../types';

export const QueuesPage: React.FC<{ overview: DashboardOverview }> = ({ overview }) => {
  const defaultQueueDepth = overview.queueDepths?.find(q => q.queue === 'taskforge.jobs.default');
  const highQueueDepth = overview.queueDepths?.find(q => q.queue === 'taskforge.jobs.high');
  const dlqDepth = overview.queueDepths?.find(q => q.queue === 'taskforge.jobs.dlq');

  const queues = [
    {
      name: 'taskforge.jobs.default',
      routingKey: 'taskforge.job.default',
      type: 'Direct Durable Queue',
      ready: defaultQueueDepth ? defaultQueueDepth.messages : 0,
      unacked: overview.currentlyRunning,
      dlq: defaultQueueDepth ? defaultQueueDepth.dlq : 0,
      consumers: overview.onlineWorkersCount,
      status: 'HEALTHY'
    },
    {
      name: 'taskforge.jobs.high',
      routingKey: 'taskforge.job.high',
      type: 'Priority Queue (x-max-priority)',
      ready: highQueueDepth ? highQueueDepth.messages : 0,
      unacked: 0,
      dlq: highQueueDepth ? highQueueDepth.dlq : 0,
      consumers: overview.onlineWorkersCount,
      status: 'HEALTHY'
    },
    {
      name: 'taskforge.jobs.dlq',
      routingKey: 'taskforge.job.dlq',
      type: 'Dead-Letter Queue (DLX)',
      ready: dlqDepth ? dlqDepth.messages : 0,
      unacked: 0,
      dlq: dlqDepth ? dlqDepth.dlq : 0,
      consumers: 0,
      status: (dlqDepth && dlqDepth.messages > 5) ? 'WARNING' : 'HEALTHY'
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">RabbitMQ Queues & Dead-Letter Exchange</h1>
        <p className="text-sm text-slate-400 mt-1">
          AMQP broker topology, message readiness, unacknowledged worker messages and DLQ routing.
        </p>
      </div>

      {/* AMQP Architecture Topology Diagram */}
      <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-white mb-4">Broker Dispatch & DLX Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-xs">
          <div className="p-4 bg-[#0B0F19] rounded-lg border border-blue-500/30 text-center">
            <span className="font-semibold text-blue-400 block">Distributed Scheduler</span>
            <span className="text-[11px] text-slate-500">Database Poll & Due Check</span>
          </div>
          <div className="flex justify-center text-slate-600">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div className="p-4 bg-[#0B0F19] rounded-lg border border-indigo-500/30 text-center">
            <span className="font-semibold text-indigo-400 block">Direct Exchange</span>
            <span className="text-[11px] text-slate-500">taskforge.exchange</span>
          </div>
          <div className="p-4 bg-[#0B0F19] rounded-lg border border-rose-500/30 text-center">
            <span className="font-semibold text-rose-400 block">Dead-Letter Exchange</span>
            <span className="text-[11px] text-slate-500">taskforge.dlx (Exhausted Retries)</span>
          </div>
        </div>
      </div>

      {/* Queues Table */}
      <div className="bg-[#111726]/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F19]/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Queue Name</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Ready Messages</th>
                <th className="py-3 px-4 font-medium">Unacknowledged</th>
                <th className="py-3 px-4 font-medium">Consumers</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {queues.map((q) => (
                <tr key={q.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">{q.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{q.type}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">{q.ready}</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">{q.unacked}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{q.consumers}</td>
                  <td className="py-3.5 px-4"><StatusBadge status={q.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
