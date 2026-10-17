import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Cpu,
  History,
  GitBranch,
  Gauge,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Jobs', to: '/jobs', icon: Layers },
    { label: 'Create Job', to: '/create-job', icon: PlusCircle },
    { label: 'Workers', to: '/workers', icon: Cpu },
    { label: 'Execution History', to: '/executions', icon: History },
    { label: 'Queues', to: '/queues', icon: GitBranch },
    { label: 'Performance Lab', to: '/performance', icon: Gauge },
    { label: 'Observability', to: '/observability', icon: Activity },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col bg-[#080B11] border-r border-slate-800/80 transition-all duration-300 z-30 select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Server className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                TaskForge
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">v1.0</span>
              </span>
              <span className="text-[11px] text-slate-400">Schedule. Execute. Monitor.</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-slate-200 text-xs rounded shadow-lg border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Cluster Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#07090E]">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Cluster Active</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">RabbitMQ + PgSQL</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
        )}
      </div>
    </aside>
  );
};
