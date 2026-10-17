import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Info,
  Calendar,
  Clock,
  ShieldAlert,
  Check,
  ChevronRight,
  Code
} from 'lucide-react';
import { createJob } from '../services/api';

const TASK_TYPES = [
  { id: 'REPORT_GENERATION', name: 'Report Generation', desc: 'Simulated data analysis & PDF generation' },
  { id: 'BATCH_DATA_PROCESS', name: 'Batch Data Processor', desc: 'Transforms batches of incoming telemetry' },
  { id: 'SEND_NOTIFICATION', name: 'Notification Sender', desc: 'Dispatches multi-channel alerts' },
  { id: 'SYSTEM_HEALTH_CHECK', name: 'System Health Sentinel', desc: 'JVM thread, memory and latency probe' }
];

export const CreateJobPage: React.FC<{ onJobCreated: () => void }> = ({ onJobCreated }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('REPORT_GENERATION');
  const [payload, setPayload] = useState('{\n  "reportType": "executive",\n  "format": "pdf"\n}');
  const [scheduleType, setScheduleType] = useState<'ONE_TIME' | 'FIXED_INTERVAL' | 'CRON'>('FIXED_INTERVAL');
  const [cronExpression, setCronExpression] = useState('0 */5 * * * *');
  const [fixedIntervalSeconds, setFixedIntervalSeconds] = useState(60);
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryBackoffSeconds, setRetryBackoffSeconds] = useState(5);
  const [timeoutSeconds, setTimeoutSeconds] = useState(60);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createJob({
        name,
        description,
        taskType,
        payload,
        scheduleType,
        cronExpression: scheduleType === 'CRON' ? cronExpression : undefined,
        fixedIntervalSeconds: scheduleType === 'FIXED_INTERVAL' ? fixedIntervalSeconds : undefined,
        priority,
        maxRetries,
        retryBackoffSeconds,
        timeoutSeconds,
        targetQueue: priority === 'CRITICAL' || priority === 'HIGH' ? 'taskforge.jobs.high' : 'taskforge.jobs.default'
      });
      onJobCreated();
      navigate('/jobs');
    } catch (e: any) {
      alert(e.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create New Scheduled Job</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure a distributed job with guaranteed scheduling, allowlisted task handlers, and retry policies.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 border-b border-slate-800 pb-4 text-xs font-medium">
        {[
          { num: 1, label: 'Basic Info' },
          { num: 2, label: 'Task & Payload' },
          { num: 3, label: 'Schedule' },
          { num: 4, label: 'Reliability & Review' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={`flex items-center gap-2 pb-2 border-b-2 cursor-pointer transition-colors ${
              step === s.num
                ? 'border-blue-500 text-blue-400'
                : step > s.num
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step > s.num ? 'bg-emerald-500 text-black' : step === s.num ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {step > s.num ? <Check className="w-3 h-3" /> : s.num}
            </span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-[#111726]/80 border border-slate-800 rounded-xl p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white">Step 1: Basic Information</h2>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Job Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daily Executive Analytics Digest"
                className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detail what this job is responsible for doing..."
                className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL (Default Queue)</option>
                <option value="HIGH">HIGH (Priority Routing)</option>
                <option value="CRITICAL">CRITICAL (Instant DLX Eligible)</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white">Step 2: Allowlisted Task Handler & Payload</h2>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Task Handler *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TASK_TYPES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTaskType(t.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      taskType === t.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-800 bg-[#0B0F19] hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">{t.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">JSON Payload</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={5}
                className="w-full font-mono bg-[#0B0F19] border border-slate-700/60 rounded-lg p-3 text-xs text-emerald-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white">Step 3: Schedule Configuration</h2>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Schedule Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'FIXED_INTERVAL', label: 'Fixed Interval' },
                  { id: 'CRON', label: 'Cron Expression' },
                  { id: 'ONE_TIME', label: 'One-Time' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScheduleType(s.id as any)}
                    className={`py-2 rounded-lg border text-xs font-medium transition-colors ${
                      scheduleType === s.id
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-800 bg-[#0B0F19] text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {scheduleType === 'FIXED_INTERVAL' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Interval (seconds)</label>
                <input
                  type="number"
                  min="5"
                  value={fixedIntervalSeconds}
                  onChange={(e) => setFixedIntervalSeconds(Number(e.target.value))}
                  className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {scheduleType === 'CRON' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Cron Expression (Spring format)</label>
                <input
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="0 */5 * * * *"
                  className="w-full bg-[#0B0F19] font-mono border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Example: `0 0 12 * * ?` executes daily at noon.</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white">Step 4: Reliability & Confirmation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Max Retries</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                  className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Retry Backoff (sec)</label>
                <input
                  type="number"
                  min="1"
                  value={retryBackoffSeconds}
                  onChange={(e) => setRetryBackoffSeconds(Number(e.target.value))}
                  className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Timeout (sec)</label>
                <input
                  type="number"
                  min="5"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
                  className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-[#0B0F19] border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="font-semibold text-white border-b border-slate-800 pb-2">Configuration Summary</div>
              <div><strong>Name:</strong> {name || '(Untitled Job)'}</div>
              <div><strong>Task Handler:</strong> {taskType}</div>
              <div><strong>Schedule:</strong> {scheduleType} ({scheduleType === 'CRON' ? cronExpression : `${fixedIntervalSeconds}s`})</div>
              <div><strong>Priority:</strong> {priority}</div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg bg-[#0B0F19] border border-slate-700 text-xs text-slate-300 hover:text-white"
            >
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  alert('Please provide a job name');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/20"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Confirm & Schedule Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
