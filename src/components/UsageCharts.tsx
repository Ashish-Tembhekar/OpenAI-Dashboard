'use client';

import { UserUsageDocument } from '@/types/usage';
import {
  calculateUsageByModel,
  calculateUsageByDate,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface UsageChartsProps {
  userUsageList: UserUsageDocument[];
  loading: boolean;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function UsageCharts({ userUsageList, loading }: UsageChartsProps) {
  const usageByModel = calculateUsageByModel(userUsageList);
  const usageByDate = calculateUsageByDate(userUsageList);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
        <div className="bg-card border rounded-lg p-6 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Cost by Model */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Cost by Model</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={usageByModel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(4)}`} />
            <Bar dataKey="costUsd" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Over Time */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Cost Over Time (30 days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={usageByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(4)}`} />
            <Line type="monotone" dataKey="costUsd" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Model Distribution */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Model Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={usageByModel}
              dataKey="costUsd"
              nameKey="model"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {usageByModel.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toFixed(4)}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* API Calls Over Time */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">API Calls Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={usageByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="calls" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

