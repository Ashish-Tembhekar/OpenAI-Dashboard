'use client';

import { AggregatedUsage } from '@/types/usage';
import { formatCost, formatTokens } from '@/lib/utils';
import { TrendingUp, Users, Zap, DollarSign } from 'lucide-react';

interface OverviewCardsProps {
  aggregatedUsage: AggregatedUsage;
  loading: boolean;
}

export function OverviewCards({ aggregatedUsage, loading }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Cost',
      value: formatCost(aggregatedUsage.totalCostUsd),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Calls',
      value: aggregatedUsage.totalCalls.toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Tokens',
      value: formatTokens(aggregatedUsage.totalTokens),
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Users',
      value: aggregatedUsage.userCount.toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

