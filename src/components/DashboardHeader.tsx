'use client';

import { RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DashboardHeaderProps {
  onRefresh: () => void;
  lastUpdated: Date;
  loading: boolean;
}

export function DashboardHeader({
  onRefresh,
  lastUpdated,
  loading,
}: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              OpenAI Usage Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and track API usage and costs
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p className="text-sm font-medium">{formatDate(lastUpdated)}</p>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

