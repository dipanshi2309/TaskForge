import React from 'react';
import { Settings, Shield, Key, Bell, Globe } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Cluster Settings & Security</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure security policies, RabbitMQ message broker credentials, and database retention.
        </p>
      </div>

      <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6 text-xs">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Authentication & RBAC</h2>
        </div>

        <div className="space-y-4 text-slate-300">
          <div>
            <label className="block font-medium mb-1.5">Default Admin Account</label>
            <input
              type="text"
              readOnly
              value="admin"
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium mb-1.5">Password Security</label>
            <input
              type="password"
              readOnly
              value="••••••••••••"
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">BCrypt salted hash with cost factor 10.</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 pt-4">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Message Broker & Persistence</h2>
        </div>

        <div className="space-y-3 text-slate-300 font-mono">
          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 flex justify-between items-center">
            <span>RabbitMQ Connection:</span>
            <span className="text-emerald-400">amqp://guest:guest@localhost:5672</span>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 flex justify-between items-center">
            <span>PostgreSQL DataSource:</span>
            <span className="text-blue-400">jdbc:postgresql://localhost:5432/taskforge</span>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 flex justify-between items-center">
            <span>Stale Worker Heartbeat Timeout:</span>
            <span className="text-amber-400">30 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};
