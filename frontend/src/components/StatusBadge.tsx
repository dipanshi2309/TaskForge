import React from 'react';
import { cn } from '../lib/utils';
import type { JobStatus } from '../types';

interface StatusBadgeProps {
  status: JobStatus | 'ONLINE' | 'BUSY' | 'OFFLINE' | 'HEALTHY' | 'WARNING' | 'DEGRADED' | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = 'sm' }) => {
  const getVariant = () => {
    switch (status?.toUpperCase()) {
      case 'RUNNING':
      case 'BUSY':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse';
      case 'SUCCEEDED':
      case 'ONLINE':
      case 'HEALTHY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'FAILED':
      case 'OFFLINE':
      case 'WARNING':
      case 'DEGRADED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'SCHEDULED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'QUEUED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PAUSED':
        return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
      case 'CANCELLED':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getDotColor = () => {
    switch (status?.toUpperCase()) {
      case 'RUNNING':
      case 'BUSY':
        return 'bg-blue-400';
      case 'SUCCEEDED':
      case 'ONLINE':
      case 'HEALTHY':
        return 'bg-emerald-400';
      case 'FAILED':
      case 'OFFLINE':
      case 'WARNING':
      case 'DEGRADED':
        return 'bg-rose-400';
      case 'SCHEDULED':
        return 'bg-purple-400';
      case 'QUEUED':
        return 'bg-amber-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide uppercase',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        getVariant(),
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', getDotColor())} />
      {status}
    </span>
  );
};
