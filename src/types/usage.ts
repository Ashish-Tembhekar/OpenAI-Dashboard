// src/types/usage.ts

export interface UsageEntry {
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  calls: number;
}

export interface UserUsageDocument {
  userId: string;
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  lastUpdated: Date;
  createdAt: Date;
  recentUsage: UsageEntry[];
}

export interface AggregatedUsage {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  userCount: number;
  averageCostPerUser: number;
  averageCostPerCall: number;
}

export interface UsageByModel {
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
}

export interface UsageByDate {
  date: string;
  calls: number;
  costUsd: number;
  tokens: number;
}

