'use client';

import { UserUsageDocument } from '@/types/usage';
import {
  calculateTtsUsageByDate,
} from '@/services/usageService';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface TtsChartsProps {
  userUsageList: UserUsageDocument[];
  loading: boolean;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function TtsCharts({ userUsageList, loading }: TtsChartsProps) {
  const ttsUsageByDate = calculateTtsUsageByDate(userUsageList);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Loading TTS chart data...</p>
        </div>
        <div className="bg-card border rounded-lg p-6 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Loading TTS chart data...</p>
        </div>
      </div>
    );
  }

  if (ttsUsageByDate.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-6 mb-8">
        <p className="text-muted-foreground text-center">No TTS usage data available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* TTS Calls Over Time */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">TTS Calls Over Time (30 days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ttsUsageByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="calls" stroke="#10b981" name="Calls" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TTS Tokens Over Time */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">TTS Tokens Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={ttsUsageByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="tokens" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Tokens" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Memory Usage Over Time */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Memory Usage Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ttsUsageByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `${Number(value).toFixed(2)} MB`} />
            <Legend />
            <Line type="monotone" dataKey="cpuMemoryMb" stroke="#f59e0b" name="CPU Memory (MB)" />
            <Line type="monotone" dataKey="gpuMemoryMb" stroke="#8b5cf6" name="GPU Memory (MB)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Processing Time Over Time */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Processing Time Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ttsUsageByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `${Number(value).toFixed(2)}s`} />
            <Bar dataKey="elapsedSeconds" fill="#ef4444" name="Elapsed Time (s)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

