'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OverviewCards } from '@/components/OverviewCards';
import { UsageCharts } from '@/components/UsageCharts';
import { UserUsageTable } from '@/components/UserUsageTable';
import { getAllUserUsage, calculateAggregatedUsage } from '@/services/usageService';
import { UserUsageDocument, AggregatedUsage } from '@/types/usage';

export default function Dashboard() {
  const [userUsageList, setUserUsageList] = useState<UserUsageDocument[]>([]);
  const [aggregatedUsage, setAggregatedUsage] = useState<AggregatedUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllUserUsage();
        setUserUsageList(data);
        const aggregated = calculateAggregatedUsage(data);
        setAggregatedUsage(aggregated);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching usage data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchUsageData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUserUsage();
      setUserUsageList(data);
      const aggregated = calculateAggregatedUsage(data);
      setAggregatedUsage(aggregated);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing usage data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh usage data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onRefresh={handleRefresh} lastUpdated={lastUpdated} loading={loading} />

      <main className="container mx-auto py-8 px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {aggregatedUsage && (
          <>
            <OverviewCards aggregatedUsage={aggregatedUsage} loading={loading} />
            <UsageCharts userUsageList={userUsageList} loading={loading} />
            <UserUsageTable userUsageList={userUsageList} loading={loading} />
          </>
        )}

        {loading && userUsageList.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading usage data...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

