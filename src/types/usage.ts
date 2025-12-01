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

export interface TtsUsageEntry {
  timestamp: Date;
  device: string;
  cpuMemoryUsedMb: number;
  gpuMemoryUsedMb: number;
  elapsedTimeSeconds: number;
  estimatedTokens: number;
  textLength: number;
  numChunks: number;
  tokensPerSecond: number;
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
  // TTS fields
  ttsUsageCalls?: number;
  ttsTotalTokens?: number;
  ttsTotalCpuMemoryMb?: number;
  ttsTotalGpuMemoryMb?: number;
  ttsTotalElapsedSeconds?: number;
  recentTtsUsage?: TtsUsageEntry[];
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

export interface AppUser {
  userId: string;
  email: string;
  isApproved: boolean;
  username: string;
  createdAt: Date;
}

