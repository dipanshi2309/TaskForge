import React from 'react';
import { Search, Bell, Shield, Terminal, RefreshCw, Circle } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search jobs, handlers, executions, workers..."
            className="w-full bg-[#111726] border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Status Badges and Actions */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-[#111726] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 text-xs"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh</span>
          </button>
        )}

        {/* Environment Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Circle className="w-2 h-2 fill-emerald-400" />
          <span>PRODUCTION-READY</span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-[#111726] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-1.5 right-1.5"></span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow">
            AD
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-200">Admin User</span>
            <span className="text-[10px] text-slate-500 font-mono">Cluster Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
