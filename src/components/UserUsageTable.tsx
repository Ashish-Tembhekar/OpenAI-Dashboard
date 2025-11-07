'use client';

import { useState } from 'react';
import { UserUsageDocument } from '@/types/usage';
import { formatCost, formatTokens, formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface UserUsageTableProps {
  userUsageList: UserUsageDocument[];
  loading: boolean;
}

export function UserUsageTable({ userUsageList, loading }: UserUsageTableProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'cost' | 'calls' | 'tokens'>('cost');

  const sortedUsers = [...userUsageList].sort((a, b) => {
    switch (sortBy) {
      case 'cost':
        return b.totalCostUsd - a.totalCostUsd;
      case 'calls':
        return b.totalCalls - a.totalCalls;
      case 'tokens':
        return b.totalTokens - a.totalTokens;
      default:
        return 0;
    }
  });

  if (loading && userUsageList.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground mb-4">Per-User Usage</h2>
        <div className="flex gap-2">
          {(['cost', 'calls', 'tokens'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                sortBy === option
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Sort by {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Total Cost
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                API Calls
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Total Tokens
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Last Updated
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tbody key={user.userId}>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-foreground">
                    {user.userId.substring(0, 12)}...
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    {formatCost(user.totalCostUsd)}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {user.totalCalls.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {formatTokens(user.totalTokens)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(user.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        setExpandedUserId(
                          expandedUserId === user.userId ? null : user.userId
                        )
                      }
                      className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
                    >
                      {expandedUserId === user.userId ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {expandedUserId === user.userId && (
                  <tr className="bg-muted/30 border-b">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Input Tokens</p>
                            <p className="text-sm font-semibold">
                              {formatTokens(user.totalInputTokens)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Output Tokens</p>
                            <p className="text-sm font-semibold">
                              {formatTokens(user.totalOutputTokens)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Cost per Call</p>
                            <p className="text-sm font-semibold">
                              {formatCost(user.totalCostUsd / Math.max(user.totalCalls, 1))}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Created</p>
                            <p className="text-sm font-semibold">
                              {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>

                        {user.recentUsage.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Recent Usage
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {user.recentUsage.slice(0, 5).map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs bg-background p-2 rounded flex justify-between"
                                >
                                  <span>
                                    {entry.model} • {entry.calls} call(s)
                                  </span>
                                  <span className="font-semibold">
                                    {formatCost(entry.costUsd)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </tbody>
        </table>
      </div>

      {sortedUsers.length === 0 && (
        <div className="p-6 text-center text-muted-foreground">
          No usage data available yet
        </div>
      )}
    </div>
  );
}

